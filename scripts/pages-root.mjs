import { readFile, copyFile, mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { publicFiles } from "./site-manifest.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = await publicFiles(resolve(root, "public"));
// The mirror records what it wrote, so it only ever removes its own files that public/ no longer has.
const ledger = resolve(root, "scripts/pages-files.json");
const written = JSON.parse(await readFile(ledger, "utf8").catch(() => "[]"));
const stale = written.filter(path => !paths.includes(path));
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
  mismatches.push(...stale.map(path => path + " (stale)"));
  if (mismatches.length) throw new Error("Pages root is out of sync: " + mismatches.join(", ") + ". Run npm run sync:pages.");
  console.log("Pages root matches public/ (" + paths.length + " files).");
} else {
  for (const path of stale) await rm(resolve(root, path), { force: true });
  await writeFile(ledger, JSON.stringify(paths, null, 1) + "\n");
  await writeFile(resolve(root, ".nojekyll"), "");
  console.log("Updated Pages root from public/ (" + paths.length + " files).");
}
