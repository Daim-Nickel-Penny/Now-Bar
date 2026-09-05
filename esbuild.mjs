import { cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
const watch = process.argv.includes("--watch");

await mkdir(join(dist, "owner"), { recursive: true });
await mkdir(join(dist, "fonts"), { recursive: true });
await mkdir(join(dist, "scenes"), { recursive: true });
await mkdir(join(dist, "icons"), { recursive: true });

const buildOptions = {
  entryPoints: {
    "mailbox/service-worker": join(root, "src/mailbox/service-worker.ts"),
    "adapter/youtube-music": join(root, "src/adapter/youtube-music.ts"),
    "adapter/spotify-web": join(root, "src/adapter/spotify-web.ts"),
    "owner/owner": join(root, "src/owner/owner.ts"),
  },
  outdir: dist,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "chrome116",
  minify: true,
  legalComments: "none",
  sourcemap: false,
  logLevel: "info",
};

if (watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
} else {
  await esbuild.build(buildOptions);
}

await cp(join(root, "src/manifest.json"), join(dist, "manifest.json"));
await cp(join(root, "src/owner/owner.html"), join(dist, "owner/owner.html"));
await cp(join(root, "src/owner/glass.css"), join(dist, "owner/glass.css"));
await cp(
  join(root, "node_modules/@fontsource/poppins/files/poppins-latin-500-normal.woff2"),
  join(dist, "fonts/poppins-500.woff2"),
);
await cp(
  join(root, "node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2"),
  join(dist, "fonts/poppins-600.woff2"),
);
await cp(join(root, "ascii-disco.png"), join(dist, "scenes/disco.png"));
await cp(join(root, "ascii-sample.png"), join(dist, "scenes/hearth.png"));

const { execFile } = await import("node:child_process");
const { promisify } = await import("node:util");
const run = promisify(execFile);
const iconSource = join(dist, "scenes/disco.png");
for (const size of [16, 32, 48, 128]) {
  await run("sips", ["-z", String(size), String(size), iconSource, "--out", join(dist, "icons", `icon-${size}.png`)]);
}
