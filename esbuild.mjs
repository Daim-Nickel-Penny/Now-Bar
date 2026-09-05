import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";
import sharp from "sharp";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
const watch = process.argv.includes("--watch");

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "panel"), { recursive: true });
await mkdir(join(dist, "icons"), { recursive: true });

const buildOptions = {
  entryPoints: {
    "mailbox/service-worker": join(root, "src/mailbox/service-worker.ts"),
    "adapter/youtube-music": join(root, "src/adapter/youtube-music.ts"),
    "adapter/spotify-web": join(root, "src/adapter/spotify-web.ts"),
    "panel/panel": join(root, "src/panel/panel.ts"),
  },
  outdir: dist,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "chrome116",
  minify: !watch,
  legalComments: "none",
  sourcemap: false,
  logLevel: "info",
  loader: { ".css": "text" },
};

await cp(join(root, "src/manifest.json"), join(dist, "manifest.json"));
await cp(join(root, "src/panel/panel.html"), join(dist, "panel/panel.html"));
await cp(join(root, "src/panel/panel.css"), join(dist, "panel/panel.css"));

for (const size of [16, 32, 48, 128]) {
  await sharp(join(root, "logo.avif"))
    .resize(size, size)
    .png()
    .toFile(join(dist, "icons", `icon-${size}.png`));
}

if (watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
} else {
  await esbuild.build(buildOptions);
}
