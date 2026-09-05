import type { SceneMotion } from "./playlist.ts";

const WIDTH = 720;
const HEIGHT = 405;

export function resizePlate(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (ctx === null) {
    throw new Error("canvas");
  }
  return ctx;
}

export function drawPlate(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  motion: SceneMotion,
  time: number,
): void {
  const zoom = motion === "sparkle" ? 1.06 : 1.04;
  const driftX = Math.sin(time * 0.15) * 10;
  const driftY = Math.cos(time * 0.11) * 8;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  ctx.translate(WIDTH / 2 + driftX, HEIGHT / 2 + driftY);
  ctx.scale(zoom, zoom);
  ctx.translate(-WIDTH / 2, -HEIGHT / 2);
  ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);
  ctx.restore();
  if (motion === "flicker") {
    ctx.fillStyle = `rgba(255,120,40,${0.04 + 0.03 * Math.sin(time * 9)})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  if (motion === "sparkle") {
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    for (let i = 0; i < 12; i += 1) {
      const x = ((Math.sin(time * 1.7 + i * 2) + 1) / 2) * WIDTH;
      const y = ((Math.cos(time * 1.3 + i) + 1) / 2) * HEIGHT;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }
}
