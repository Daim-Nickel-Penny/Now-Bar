import type { SceneId } from "../scene-id.ts";
import { arcade } from "./arcade.ts";
import { disco } from "./disco.ts";
import { hearth } from "./hearth.ts";
import { kitchen } from "./kitchen.ts";
import { night } from "./night.ts";
import { rain } from "./rain.ts";
import type { Scenery } from "./scenery.ts";

const SCENERY: Record<SceneId, Scenery> = { hearth, rain, disco, night, arcade, kitchen };

export function sceneryFor(id: SceneId): Scenery {
  return SCENERY[id];
}
