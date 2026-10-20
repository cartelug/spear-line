import { readdir, readFile, unlink, realpath } from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)),"..");
const days = Number(process.env.RETENTION_DAYS || 0);
if (!Number.isInteger(days) || days < 1 || days > 3650) throw new Error("Set RETENTION_DAYS between 1 and 3650.");
const dir = await realpath(resolve(root,process.env.DATA_DIR || "data"));
const publicRoot = await realpath(resolve(root,"public"));
if (dir === publicRoot || dir.startsWith(publicRoot + sep)) throw new Error("DATA_DIR must be private.");
const apply = process.argv.includes("--apply");
const cutoff = Date.now() - days * 86400000;
let count = 0;
for (const name of await readdir(dir)) {
  if (!/^[a-f0-9-]{36}\.json$/.test(name)) continue;
  const path = resolve(dir,name);
  try {
    const item = JSON.parse(await readFile(path,"utf8"));
    const received = Date.parse(item.receivedAt);
    if (Number.isFinite(received) && received < cutoff) {
      if (apply) await unlink(path);
      count++;
    }
  } catch (error) { if (error.code !== "ENOENT") throw error; }
}
console.info((apply ? "Deleted " : "Would delete ") + count + " expired enquiries.");
