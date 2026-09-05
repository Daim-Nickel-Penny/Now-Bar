import type { SceneId } from "./playlist.ts";

const WIDTH = 720;
const HEIGHT = 405;

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function resizeField(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (ctx === null) {
    throw new Error("canvas");
  }
  return ctx;
}

export function drawField(ctx: CanvasRenderingContext2D, id: SceneId, time: number): void {
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  switch (id) {
    case "rain":
      drawRain(ctx, time);
      return;
    case "night":
      drawNight(ctx, time);
      return;
    case "forest":
      drawForest(ctx, time);
      return;
    case "waves":
      drawWaves(ctx, time);
      return;
    case "aurora":
      drawAurora(ctx, time);
      return;
    case "neon":
      drawNeon(ctx, time);
      return;
    case "disco":
    case "hearth":
      return;
    default: {
      const _never: never = id;
      return _never;
    }
  }
}

function drawRain(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.strokeStyle = "rgba(210,220,230,0.45)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 140; i += 1) {
    const x = hash(i) * WIDTH;
    const y = ((hash(i + 3) * HEIGHT + time * 180) % (HEIGHT + 40)) - 20;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 4, y + 18);
    ctx.stroke();
  }
}

function drawNight(ctx: CanvasRenderingContext2D, time: number): void {
  for (let i = 0; i < 80; i += 1) {
    const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(time * 2 + i));
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.fillRect(hash(i) * WIDTH, hash(i + 9) * HEIGHT * 0.62, 2, 2);
  }
  ctx.fillStyle = "#1a1a1c";
  ctx.fillRect(0, HEIGHT * 0.72, WIDTH, HEIGHT * 0.28);
}

function drawForest(ctx: CanvasRenderingContext2D, time: number): void {
  for (let i = 0; i < 18; i += 1) {
    const x = (i / 18) * WIDTH + Math.sin(time * 0.4 + i) * 6;
    ctx.fillStyle = i % 2 === 0 ? "#0c1610" : "#152218";
    ctx.beginPath();
    ctx.moveTo(x, HEIGHT);
    ctx.lineTo(x + 28, HEIGHT * 0.28);
    ctx.lineTo(x + 56, HEIGHT);
    ctx.fill();
  }
}

function drawWaves(ctx: CanvasRenderingContext2D, time: number): void {
  for (let row = 0; row < 8; row += 1) {
    ctx.strokeStyle = `rgba(160,190,210,${0.15 + row * 0.06})`;
    ctx.beginPath();
    const y0 = HEIGHT * 0.35 + row * 22;
    for (let x = 0; x <= WIDTH; x += 8) {
      const y = y0 + Math.sin(x * 0.02 + time * 1.4 + row) * 10;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}

function drawAurora(ctx: CanvasRenderingContext2D, time: number): void {
  for (let i = 0; i < 6; i += 1) {
    const y = 40 + i * 36 + Math.sin(time * 0.7 + i) * 12;
    ctx.fillStyle = `rgba(${80 + i * 20},${180 - i * 10},160,0.12)`;
    ctx.fillRect(0, y, WIDTH, 28);
  }
}

function drawNeon(ctx: CanvasRenderingContext2D, time: number): void {
  const pulse = 0.35 + 0.25 * Math.sin(time * 3);
  ctx.strokeStyle = `rgba(255,90,40,${pulse})`;
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 70, WIDTH - 160, HEIGHT - 140);
  ctx.strokeStyle = `rgba(80,160,255,${0.25 + pulse})`;
  ctx.strokeRect(120, 110, WIDTH - 240, HEIGHT - 220);
}
