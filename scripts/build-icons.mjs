/**
 * Regenerates src/owner/icons.ts from Hugeicons Free.
 *
 *   npm i --no-save @hugeicons/core-free-icons@4.3.0 && node scripts/build-icons.mjs
 *
 * The paths are inlined rather than imported so the Floater ships no icon dependency
 * and loads nothing over the network — the extension CSP forbids remote assets anyway.
 */
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE = "@hugeicons/core-free-icons";
const VERSION = "4.3.0";

/** Floater button -> Hugeicons export name. */
const PICK = {
  previous: "PreviousIcon",
  play: "PlayIcon",
  pause: "PauseIcon",
  next: "NextIcon",
  scene: "DashboardSquare01Icon",
  collapse: "MinusSignIcon",
  close: "Cancel01Icon",
};

const icons = await import(PACKAGE);
const entries = [];
for (const [name, key] of Object.entries(PICK)) {
  const nodes = icons[key];
  if (nodes === undefined) {
    throw new Error(`${PACKAGE} has no export ${key}`);
  }
  const paths = nodes.map(([tag, attrs]) => {
    if (tag !== "path") {
      throw new Error(`${key} uses <${tag}>, which the Floater's renderer does not draw`);
    }
    return attrs.d;
  });
  entries.push(`  ${name}: [\n${paths.map((d) => `    "${d}",`).join("\n")}\n  ],`);
}

const file = `/**
 * Icon geometry from Hugeicons Free (${PACKAGE} ${VERSION}, MIT).
 * Stroke icons on a 24x24 box: paint them with \`fill: none\` and \`stroke: currentColor\`.
 * Regenerate with scripts/build-icons.mjs rather than editing the path data by hand.
 */
export const ICON_PATHS = {
${entries.join("\n")}
} as const;

export type IconName = keyof typeof ICON_PATHS;
`;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
await writeFile(join(root, "src/owner/icons.ts"), file);
console.log(`wrote src/owner/icons.ts (${Object.keys(PICK).length} icons)`);
