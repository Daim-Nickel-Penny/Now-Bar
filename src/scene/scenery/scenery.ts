import type { Canvas2D } from "../ink.ts";

export type Stand = { x: number; y: number };

export type Scenery = {
  stand: Stand;
  draw: (ctx: Canvas2D, w: number, h: number, phase: number) => void;
};
