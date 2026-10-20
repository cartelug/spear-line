// Usage: node restore-bundle.mjs spear-line-source.json ./spear-line
import { readFile, mkdir, writeFile, lstat, realpath } from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
const [, , bundlePath, destination] = process.argv;
if (!bundlePath || !destination) throw new Error("Usage: node restore-bundle.mjs <bundle.json> <new-directory>");
try { await lstat(destination); throw new Error("Destination already exists. Choose a new directory."); }
catch (error) { if (error.code !== "ENOENT") throw error; }
const bundle = JSON.parse(await readFile(bundlePath,"utf8"));
if (!bundle.files || typeof bundle.files !== "object" || Array.isArray(bundle.files)) throw new Error("Invalid bundle.");
await mkdir(destination,{recursive:true});
const root = await realpath(destination);
for (const [path,file] of Object.entries(bundle.files)) {
  const target = resolve(root,path);
  if (!target.startsWith(root + sep) || path.includes("\\") || !["utf8","base64"].includes(file.encoding) || typeof file.content !== "string") throw new Error("Invalid entry: " + path);
  await mkdir(dirname(target),{recursive:true});
  await writeFile(target,file.content,{encoding:file.encoding,flag:"wx"});
}
console.info("Restored " + Object.keys(bundle.files).length + " files to " + root);
