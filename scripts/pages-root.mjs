import { readFile, copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = [
  "index.html", "vehicles.html", "timber-logistics.html", "about.html",
  "enquire.html", "privacy.html", "404.html", "robots.txt",
  "site-config.js", "app.js", "validation.js", "styles.css",
  "assets/spear-line-logo.png"
];
const checking = process.argv.includes("--check");
const writing = process.argv.includes("--write");
if (checking === writing) throw new Error("Use exactly one of --check or --write.");

const mismatches = [];
for (const path of paths) {
  const source = resolve(root, "public", path);
  const destination = resolve(root, path);
  if (checking) {
    try {
      const [expected, actual] = await Promise.all([readFile(source), readFile(destination)]);
      if (!expected.equals(actual)) mismatches.push(path);
    } catch {
      mismatches.push(path);
    }
  } else {
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
}
if (checking) {
  try {
    if ((await readFile(resolve(root, ".nojekyll"))).length !== 0) mismatches.push(".nojekyll");
  } catch {
    mismatches.push(".nojekyll");
  }
  if (mismatches.length) throw new Error("Pages root is out of sync: " + mismatches.join(", ") + ". Run npm run sync:pages.");
  console.log("Pages root matches public/ (" + paths.length + " files).");
} else {
  await writeFile(resolve(root, ".nojekyll"), "");
  console.log("Updated Pages root from public/ (" + paths.length + " files).");
}
