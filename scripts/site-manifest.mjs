import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

// One list of publishable files, shared by the Node server and the GitHub Pages mirror.
const rootExtensions = new Set([".html",".css",".js",".txt",".xml",".webmanifest",".svg",".ico",".png"]);
const assetExtensions = new Set([".png",".webp",".avif",".woff2",".svg",".txt",".ico",".jpg"]);
const safeName = /^[a-z0-9][a-z0-9._-]*$/i;
const extension = name => name.slice(name.lastIndexOf(".")).toLowerCase();

async function walk(base,dir,allowed,found) {
  for (const entry of await readdir(resolve(base,dir),{withFileTypes:true})) {
    if (!safeName.test(entry.name) || entry.name.startsWith("_")) continue;
    const relative = dir ? dir + "/" + entry.name : entry.name;
    if (entry.isDirectory()) await walk(base,relative,allowed,found);
    else if (entry.isFile() && allowed.has(extension(entry.name))) found.push(relative);
  }
}

export async function publicFiles(publicRoot) {
  const found = [];
  for (const entry of await readdir(publicRoot,{withFileTypes:true})) {
    if (entry.isFile() && safeName.test(entry.name) && !entry.name.startsWith("_") && rootExtensions.has(extension(entry.name))) found.push(entry.name);
  }
  await walk(publicRoot,"assets",assetExtensions,found);
  return found.sort();
}
