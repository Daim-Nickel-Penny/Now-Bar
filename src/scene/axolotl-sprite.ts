export type AxolotlActivity =
  | "guitar"
  | "chores"
  | "reading"
  | "cooking"
  | "gaming"
  | "sleeping"
  | "dancing"
  | "painting";

export function drawAxolotl(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  activity: AxolotlActivity,
): void {
  const bob = Math.sin(time * 2) * 3;
  const ax = x;
  const ay = y + bob;

  ctx.fillStyle = "rgba(255,182,193,0.95)";
  ctx.beginPath();
  ctx.ellipse(ax, ay, 50, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(ax - 40, ay - 18, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(ax + 40, ay - 18, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(ax - 15, ay - 8, 3.5, 0, Math.PI * 2);
  ctx.arc(ax + 15, ay - 8, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(ax, ay + 5, 8, 0.2, Math.PI - 0.2);
  ctx.stroke();

  for (let i = 0; i < 5; i += 1) {
    const gillWave = Math.sin(time * 4 + i) * 2;
    ctx.strokeStyle = "rgba(255,100,150,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax - 35, ay - 22 + i * 6);
    ctx.lineTo(ax - 45 + gillWave, ay - 26 + i * 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ax + 35, ay - 22 + i * 6);
    ctx.lineTo(ax + 45 - gillWave, ay - 26 + i * 6);
    ctx.stroke();
  }

  drawActivity(ctx, ax, ay, time, activity);
}

function drawActivity(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  time: number,
  activity: AxolotlActivity,
): void {
  switch (activity) {
    case "guitar":
      drawGuitar(ctx, ax, ay, time);
      return;
    case "chores":
      drawChores(ctx, ax, ay, time);
      return;
    case "reading":
      drawReading(ctx, ax, ay, time);
      return;
    case "cooking":
      drawCooking(ctx, ax, ay, time);
      return;
    case "gaming":
      drawGaming(ctx, ax, ay, time);
      return;
    case "sleeping":
      drawSleeping(ctx, ax, ay, time);
      return;
    case "dancing":
      drawDancing(ctx, ax, ay, time);
      return;
    case "painting":
      drawPainting(ctx, ax, ay, time);
      return;
    default: {
      const _never: never = activity;
      return _never;
    }
  }
}

function drawGuitar(ctx: CanvasRenderingContext2D, ax: number, ay: number, time: number): void {
  const strum = Math.sin(time * 6) * 5;
  ctx.fillStyle = "#8b4513";
  ctx.beginPath();
  ctx.ellipse(ax + 20, ay + 15, 25, 18, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#654321";
  ctx.fillRect(ax + 35, ay + 5, 30, 6);
  ctx.strokeStyle = "#d4a574";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(ax + 35, ay + 6 + i * 1.5);
    ctx.lineTo(ax + 65, ay + 6 + i * 1.5);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,182,193,0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ax - 20, ay + 10);
  ctx.lineTo(ax + 10, ay + 20 + strum);
  ctx.stroke();
}

function drawChores(ctx: CanvasRenderingContext2D, ax: number, ay: number, time: number): void {
  const sweep = Math.sin(time * 3) * 8;
  ctx.strokeStyle = "#8b7355";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ax + 30, ay - 10);
  ctx.lineTo(ax + 45 + sweep, ay + 25);
  ctx.stroke();
  ctx.fillStyle = "#d4a574";
  ctx.fillRect(ax + 42 + sweep, ay + 22, 12, 8);
}

function drawReading(ctx: CanvasRenderingContext2D, ax: number, ay: number, time: number): void {
  const pageTurn = Math.sin(time * 0.8) > 0.7 ? 3 : 0;
  ctx.fillStyle = "#f5f5dc";
  ctx.fillRect(ax - 15, ay + 10, 30, 20);
  ctx.strokeStyle = "#8b7355";
  ctx.lineWidth = 1;
  ctx.strokeRect(ax - 15, ay + 10, 30, 20);
  ctx.beginPath();
  ctx.moveTo(ax, ay + 10);
  ctx.lineTo(ax + pageTurn, ay + 10);
  ctx.stroke();
}

function drawCooking(ctx: CanvasRenderingContext2D, ax: number, ay: number, time: number): void {
  const stir = Math.sin(time * 4) * 3;
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.ellipse(ax + 25, ay + 20, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8b7355";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ax + 15, ay + 5);
  ctx.lineTo(ax + 25 + stir, ay + 18);
  ctx.stroke();
  ctx.fillStyle = `rgba(255,100,50,${0.3 + 0.2 * Math.sin(time * 5)})`;
  ctx.beginPath();
  ctx.arc(ax + 25, ay + 28, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawGaming(ctx: CanvasRenderingContext2D, ax: number, ay: number, time: number): void {
  const buttonMash = Math.sin(time * 8) > 0 ? 2 : 0;
  ctx.fillStyle = "#333";
  ctx.fillRect(ax - 10, ay + 12, 20, 10);
  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(ax - 6, ay + 14 + buttonMash, 3, 3);
  ctx.fillStyle = "#4ecdc4";
  ctx.fillRect(ax + 3, ay + 14, 3, 3);
}

function drawSleeping(ctx: CanvasRenderingContext2D, ax: number, ay: number, time: number): void {
  const breathe = Math.sin(time * 1.5) * 2;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "12px sans-serif";
  ctx.fillText("z", ax + 30, ay - 20 - breathe);
  ctx.fillText("z", ax + 38, ay - 28 - breathe * 1.5);
  ctx.fillText("Z", ax + 48, ay - 38 - breathe * 2);
}

function drawDancing(ctx: CanvasRenderingContext2D, ax: number, ay: number, time: number): void {
  const sway = Math.sin(time * 4) * 5;
  ctx.strokeStyle = "rgba(255,182,193,0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ax - 25, ay + 5);
  ctx.lineTo(ax - 35 + sway, ay - 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ax + 25, ay + 5);
  ctx.lineTo(ax + 35 - sway, ay - 10);
  ctx.stroke();
}

function drawPainting(ctx: CanvasRenderingContext2D, ax: number, ay: number, time: number): void {
  const brushStroke = Math.sin(time * 2.5) * 4;
  ctx.strokeStyle = "#8b7355";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ax + 20, ay + 5);
  ctx.lineTo(ax + 30 + brushStroke, ay - 5);
  ctx.stroke();
  ctx.fillStyle = "#ff6b6b";
  ctx.beginPath();
  ctx.arc(ax + 30 + brushStroke, ay - 5, 3, 0, Math.PI * 2);
  ctx.fill();
}
