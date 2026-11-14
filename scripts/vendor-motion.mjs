// Copies the optional GSAP runtime from node_modules into public/vendor/gsap/<version>/ so the static site can serve
// it from its own origin. Browser code never imports from node_modules. The exact version comes from package-lock,
// so a fresh checkout needs `npm ci` before `npm run build`. Run with --check to verify without writing.
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkgDir = resolve(root, "node_modules/gsap");
const { version, license } = JSON.parse(await readFile(resolve(pkgDir, "package.json"), "utf8"));
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error("Unexpected GSAP version: " + version);
const target = resolve(root, "public/vendor/gsap", version);
const files = ["gsap.min.js", "ScrollTrigger.min.js"];
const notice = `GSAP ${version} (gsap.min.js, ScrollTrigger.min.js)\nCopyright GreenSock. Provided under the GSAP ${license}\nEach file carries its own licence header. Terms: https://gsap.com/standard-license\nThese files are copied unmodified from the npm package "gsap" by scripts/vendor-motion.mjs.\n`;
const checking = process.argv.includes("--check");
const bad = [];
for (const name of files) {
  const source = resolve(pkgDir, "dist", name), destination = resolve(target, name);
  if (checking) {
    const [a, b] = await Promise.all([readFile(source), readFile(destination).catch(() => null)]);
    if (!b || !a.equals(b)) bad.push(name);
  } else { await mkdir(target, { recursive: true }); await copyFile(source, destination); }
}
if (checking) {
  if ((await readFile(resolve(target, "NOTICE.txt"), "utf8").catch(() => "")) !== notice) bad.push("NOTICE.txt");
  if (bad.length) throw new Error("Vendored GSAP is out of date: " + bad.join(", ") + ". Run npm run vendor.");
  console.log("Vendored GSAP " + version + " matches node_modules.");
} else {
  await writeFile(resolve(target, "NOTICE.txt"), notice);
  console.log("Vendored GSAP " + version + " into public/vendor/gsap/" + version + "/.");
}
