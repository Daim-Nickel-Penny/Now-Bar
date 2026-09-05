export type PlayingBars = {
  setPlaying: (playing: boolean) => void;
  dispose: () => void;
};

const COUNT = 5;
const REST = 0.28;
const STILL = 0.6;
const FRAME_MS = 50;

const BAND: ReadonlyArray<{ lo: number; hi: number }> = [
  { lo: 0.12, hi: 0.58 },
  { lo: 0.16, hi: 0.86 },
  { lo: 0.22, hi: 1 },
  { lo: 0.16, hi: 0.9 },
  { lo: 0.1, hi: 0.64 },
];

/** `pick` decides spike / drop / blend; `mix` is the blend inside the bar's band. */
export function nextBarLevel(index: number, pick: number, mix: number): number {
  const band = BAND[index];
  if (band === undefined) {
    throw new Error("playing-bars:band");
  }
  if (pick < 0.1) {
    return band.hi;
  }
  if (pick < 0.18) {
    return band.lo;
  }
  return band.lo + mix * (band.hi - band.lo);
}

type Voice = {
  node: HTMLElement;
  current: number;
  target: number;
  chase: number;
  nextRoll: number;
};

function fill(host: HTMLElement): HTMLElement[] {
  const doc = host.ownerDocument;
  while (host.childElementCount < COUNT) {
    host.appendChild(doc.createElement("i"));
  }
  return [...host.children] as HTMLElement[];
}

function paint(node: HTMLElement, level: number): void {
  node.style.setProperty("--level", level.toFixed(3));
}

function roll(index: number): { target: number; chase: number; hold: number } {
  return {
    target: nextBarLevel(index, Math.random(), Math.random()),
    chase: 0.08 + Math.random() * 0.22,
    hold: 80 + Math.random() * 420,
  };
}

function idleBars(): PlayingBars {
  return { setPlaying() {}, dispose() {} };
}

export function attachPlayingBars(host: HTMLElement): PlayingBars {
  const view = host.ownerDocument.defaultView;
  const nodes = fill(host);
  for (const node of nodes) {
    paint(node, REST);
  }
  if (view === null) {
    return idleBars();
  }
  return driveBars(view, nodes);
}

function driveBars(view: Window, nodes: HTMLElement[]): PlayingBars {
  const reduced = view.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const voices: Voice[] = nodes.map((node, index) => {
    const first = roll(index);
    return {
      node,
      current: REST,
      target: first.target,
      chase: first.chase,
      nextRoll: 0,
    };
  });

  let playing = false;
  let raf = 0;
  let last = 0;

  function tick(now: number): void {
    let moving = false;
    for (const [index, voice] of voices.entries()) {
      if (playing) {
        const arrived = Math.abs(voice.target - voice.current) < 0.05;
        if (arrived || now > voice.nextRoll) {
          const next = roll(index);
          voice.target = next.target;
          voice.chase = next.chase;
          voice.nextRoll = now + next.hold;
        }
      } else {
        voice.target = REST;
      }
      voice.current += (voice.target - voice.current) * voice.chase;
      paint(voice.node, voice.current);
      moving = moving || Math.abs(voice.current - voice.target) > 0.02;
    }
    if (playing || moving) {
      raf = view.requestAnimationFrame(frame);
    } else {
      raf = 0;
    }
  }

  function frame(now: number): void {
    if (now - last < FRAME_MS) {
      raf = view.requestAnimationFrame(frame);
      return;
    }
    last = now;
    tick(now);
  }

  function kick(): void {
    if (raf !== 0) {
      return;
    }
    last = 0;
    raf = view.requestAnimationFrame(frame);
  }

  return {
    setPlaying(next) {
      if (next === playing) {
        return;
      }
      playing = next;
      if (reduced) {
        for (const voice of voices) {
          voice.current = next ? STILL : REST;
          paint(voice.node, voice.current);
        }
        return;
      }
      if (next) {
        for (const [index, voice] of voices.entries()) {
          const nextVoice = roll(index);
          voice.target = nextVoice.target;
          voice.chase = nextVoice.chase;
          voice.nextRoll = 0;
        }
        kick();
      } else if (raf === 0) {
        kick();
      }
    },
    dispose() {
      playing = false;
      if (raf !== 0) {
        view.cancelAnimationFrame(raf);
        raf = 0;
      }
    },
  };
}
