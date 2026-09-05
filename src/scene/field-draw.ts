import type { SceneId } from "./playlist.ts";
import { drawAxolotl as drawAxolotlSprite, type AxolotlActivity } from "./axolotl-sprite.ts";

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

export function drawField(
  ctx: CanvasRenderingContext2D,
  id: SceneId,
  time: number,
  activity: AxolotlActivity,
): void {
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  switch (id) {
    case "axolotl":
      drawAxolotl(ctx, time);
      return;
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
    case "city":
      drawCity(ctx, time);
      return;
    case "desert":
      drawDesert(ctx, time);
      return;
    case "ocean":
      drawOcean(ctx, time);
      return;
    case "mountain":
      drawMountain(ctx);
      return;
    case "cave":
      drawCave(ctx, time);
      return;
    case "garden":
      drawGarden(ctx, time);
      return;
    case "library":
      drawLibrary(ctx, time);
      return;
    case "studio":
      drawStudio(ctx, time);
      return;
    case "arcade":
      drawArcade(ctx, time);
      return;
    case "observatory":
      drawObservatory(ctx, time);
      return;
    case "harbor":
      drawHarbor(ctx, time);
      return;
    case "meadow":
      drawMeadow(ctx, time);
      return;
    case "volcano":
      drawVolcano(ctx, time);
      return;
    case "glacier":
      drawGlacier(ctx, time);
      return;
    case "disco":
    case "hearth":
      return;
    default: {
      const _never: never = id;
      return _never;
    }
  }
  drawAxolotlSprite(ctx, WIDTH * 0.75, HEIGHT * 0.65, time, activity);
}

function drawAxolotl(ctx: CanvasRenderingContext2D, time: number): void {
  const cx = WIDTH / 2 + Math.sin(time * 0.8) * 40;
  const cy = HEIGHT / 2 + Math.cos(time * 0.6) * 20;
  ctx.fillStyle = "rgba(255,182,193,0.9)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 60, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx - 50, cy - 20, 20, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 50, cy - 20, 20, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cx - 20, cy - 5, 4, 0, Math.PI * 2);
  ctx.arc(cx + 20, cy - 5, 4, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 6; i += 1) {
    const gill = Math.sin(time * 3 + i) * 3;
    ctx.strokeStyle = "rgba(255,100,150,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 45, cy - 25 + i * 8);
    ctx.lineTo(cx - 55 + gill, cy - 30 + i * 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 45, cy - 25 + i * 8);
    ctx.lineTo(cx + 55 - gill, cy - 30 + i * 8);
    ctx.stroke();
  }
  for (let i = 0; i < 20; i += 1) {
    const bubbleY = ((hash(i) * HEIGHT + time * 30) % HEIGHT) - 10;
    ctx.fillStyle = `rgba(200,220,255,${0.2 + hash(i + 5) * 0.3})`;
    ctx.beginPath();
    ctx.arc(hash(i + 2) * WIDTH, bubbleY, 2 + hash(i + 7) * 3, 0, Math.PI * 2);
    ctx.fill();
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

function drawCity(ctx: CanvasRenderingContext2D, time: number): void {
  for (let i = 0; i < 30; i += 1) {
    const x = hash(i) * WIDTH;
    const h = 60 + hash(i + 3) * 120;
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(x, HEIGHT - h, 30, h);
    for (let w = 0; w < 4; w += 1) {
      if (hash(i * 10 + w) > 0.6) {
        const flicker = Math.sin(time * 2 + i + w) > 0 ? 0.8 : 0.2;
        ctx.fillStyle = `rgba(255,220,100,${flicker})`;
        ctx.fillRect(x + 5 + w * 6, HEIGHT - h + 10 + hash(i + w) * (h - 20), 3, 4);
      }
    }
  }
}

function drawDesert(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.fillStyle = "#1a0f0a";
  ctx.fillRect(0, HEIGHT * 0.6, WIDTH, HEIGHT * 0.4);
  for (let i = 0; i < 5; i += 1) {
    const x = (i / 5) * WIDTH + Math.sin(time * 0.2 + i) * 20;
    ctx.fillStyle = "#2a1a12";
    ctx.beginPath();
    ctx.moveTo(x, HEIGHT * 0.6);
    ctx.lineTo(x + 80, HEIGHT * 0.4);
    ctx.lineTo(x + 160, HEIGHT * 0.6);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,200,100,0.3)";
  ctx.beginPath();
  ctx.arc(WIDTH * 0.8, HEIGHT * 0.3, 30 + Math.sin(time) * 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawOcean(ctx: CanvasRenderingContext2D, time: number): void {
  for (let i = 0; i < 12; i += 1) {
    const y = HEIGHT * 0.3 + i * 20;
    ctx.strokeStyle = `rgba(100,150,200,${0.1 + i * 0.05})`;
    ctx.beginPath();
    for (let x = 0; x <= WIDTH; x += 10) {
      const wave = Math.sin(x * 0.01 + time * 1.2 + i * 0.5) * 15;
      if (x === 0) {
        ctx.moveTo(x, y + wave);
      } else {
        ctx.lineTo(x, y + wave);
      }
    }
    ctx.stroke();
  }
}

function drawMountain(ctx: CanvasRenderingContext2D): void {
  for (let i = 0; i < 6; i += 1) {
    const x = (i / 6) * WIDTH;
    ctx.fillStyle = i % 2 === 0 ? "#1a1a1e" : "#252530";
    ctx.beginPath();
    ctx.moveTo(x, HEIGHT);
    ctx.lineTo(x + 100, HEIGHT * 0.3);
    ctx.lineTo(x + 200, HEIGHT);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(WIDTH * 0.7, HEIGHT * 0.2, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawCave(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.fillStyle = "#0a0806";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < 8; i += 1) {
    const x = hash(i) * WIDTH;
    const y = hash(i + 3) * HEIGHT * 0.5;
    const glow = 0.3 + 0.2 * Math.sin(time * 2 + i);
    ctx.fillStyle = `rgba(255,150,50,${glow})`;
    ctx.beginPath();
    ctx.arc(x, y, 8 + glow * 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGarden(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.fillStyle = "#0a120a";
  ctx.fillRect(0, HEIGHT * 0.5, WIDTH, HEIGHT * 0.5);
  for (let i = 0; i < 15; i += 1) {
    const x = hash(i) * WIDTH;
    const sway = Math.sin(time * 1.5 + i) * 3;
    ctx.strokeStyle = "#2a4a2a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, HEIGHT);
    ctx.lineTo(x + sway, HEIGHT * 0.6);
    ctx.stroke();
    ctx.fillStyle = `rgba(255,${100 + hash(i) * 100},150,0.7)`;
    ctx.beginPath();
    ctx.arc(x + sway, HEIGHT * 0.6, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLibrary(ctx: CanvasRenderingContext2D, time: number): void {
  for (let i = 0; i < 12; i += 1) {
    const x = (i / 12) * WIDTH;
    ctx.fillStyle = "#1a1512";
    ctx.fillRect(x, HEIGHT * 0.2, 40, HEIGHT * 0.8);
    for (let b = 0; b < 8; b += 1) {
      const bookY = HEIGHT * 0.25 + b * 30;
      const hue = hash(i * 10 + b) * 360;
      ctx.fillStyle = `hsl(${hue},40%,30%)`;
      ctx.fillRect(x + 5, bookY, 30, 20);
    }
  }
  ctx.fillStyle = `rgba(255,200,100,${0.2 + 0.1 * Math.sin(time * 0.5)})`;
  ctx.beginPath();
  ctx.arc(WIDTH / 2, HEIGHT * 0.15, 40, 0, Math.PI * 2);
  ctx.fill();
}

function drawStudio(ctx: CanvasRenderingContext2D, time: number): void {
  for (let i = 0; i < 6; i += 1) {
    const x = 50 + i * 100;
    const pulse = 0.3 + 0.3 * Math.sin(time * 2 + i);
    ctx.strokeStyle = `rgba(100,200,255,${pulse})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 100, 60, 80);
    ctx.beginPath();
    ctx.arc(x + 30, 140, 20, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawArcade(ctx: CanvasRenderingContext2D, time: number): void {
  for (let i = 0; i < 8; i += 1) {
    const x = (i / 8) * WIDTH;
    const glow = 0.4 + 0.3 * Math.sin(time * 3 + i);
    ctx.fillStyle = `rgba(255,${100 + i * 20},200,${glow})`;
    ctx.fillRect(x, HEIGHT * 0.3, 60, 100);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 10, HEIGHT * 0.35, 40, 30);
  }
}

function drawObservatory(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.fillStyle = "#050510";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < 100; i += 1) {
    const x = hash(i) * WIDTH;
    const y = hash(i + 1) * HEIGHT;
    const twinkle = 0.5 + 0.5 * Math.sin(time * 2 + i);
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.arc(WIDTH / 2, HEIGHT * 0.7, 80, 0, Math.PI, true);
  ctx.fill();
}

function drawHarbor(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.fillStyle = "#0a1520";
  ctx.fillRect(0, HEIGHT * 0.6, WIDTH, HEIGHT * 0.4);
  for (let i = 0; i < 5; i += 1) {
    const x = (i / 5) * WIDTH + Math.sin(time * 0.3 + i) * 10;
    ctx.fillStyle = "#1a2530";
    ctx.fillRect(x, HEIGHT * 0.5, 40, 60);
    ctx.fillStyle = "rgba(255,200,100,0.6)";
    ctx.fillRect(x + 5, HEIGHT * 0.55, 5, 5);
  }
}

function drawMeadow(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.fillStyle = "#0a1a0a";
  ctx.fillRect(0, HEIGHT * 0.4, WIDTH, HEIGHT * 0.6);
  for (let i = 0; i < 25; i += 1) {
    const x = hash(i) * WIDTH;
    const sway = Math.sin(time * 1.2 + i) * 5;
    ctx.strokeStyle = "#3a5a3a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, HEIGHT);
    ctx.lineTo(x + sway, HEIGHT * 0.5);
    ctx.stroke();
  }
}

function drawVolcano(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.fillStyle = "#1a0a0a";
  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.3, HEIGHT);
  ctx.lineTo(WIDTH * 0.5, HEIGHT * 0.3);
  ctx.lineTo(WIDTH * 0.7, HEIGHT);
  ctx.fill();
  const glow = 0.5 + 0.3 * Math.sin(time * 4);
  ctx.fillStyle = `rgba(255,100,0,${glow})`;
  ctx.beginPath();
  ctx.arc(WIDTH * 0.5, HEIGHT * 0.3, 20, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 10; i += 1) {
    const x = WIDTH * 0.5 + (hash(i) - 0.5) * 100;
    const y = HEIGHT * 0.3 - hash(i + 2) * 100 - time * 20;
    ctx.fillStyle = `rgba(255,150,50,${0.6 - hash(i) * 0.3})`;
    ctx.fillRect(x, y % HEIGHT, 3, 3);
  }
}

function drawGlacier(ctx: CanvasRenderingContext2D, time: number): void {
  for (let i = 0; i < 8; i += 1) {
    const x = (i / 8) * WIDTH;
    ctx.fillStyle = i % 2 === 0 ? "#c0d8e8" : "#a8c8d8";
    ctx.beginPath();
    ctx.moveTo(x, HEIGHT);
    ctx.lineTo(x + 60, HEIGHT * 0.4);
    ctx.lineTo(x + 120, HEIGHT);
    ctx.fill();
  }
  ctx.fillStyle = `rgba(200,230,255,${0.3 + 0.2 * Math.sin(time * 0.8)})`;
  ctx.fillRect(0, 0, WIDTH, HEIGHT * 0.3);
}
