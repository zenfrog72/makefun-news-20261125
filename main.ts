// Wednesday 25 November 2026 front page — entry program.
//
// The finished page is a single finished image (entry.png) that ships in
// this repo. The grader runs this file as `node /bot/main.ts` from an
// unknown working directory, with the repo mounted read-only at /bot and
// MAKEFUN_OUTPUT_DIR pointing at the writable output directory. So every
// path here is resolved from the script's own location (or the
// MAKEFUN_BOT_DIR override), never from the process working directory.
//
// The program's only job: place a byte-identical copy of entry.png at
// /output/entry.png (or $MAKEFUN_OUTPUT_DIR/entry.png). Running it twice
// must produce identical bytes, because the copy is a plain file copy.

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Where the repo lives: prefer the harness-provided directory, otherwise
// fall back to the directory holding this script.
const scriptDir = dirname(fileURLToPath(import.meta.url));
const botDir = process.env.MAKEFUN_BOT_DIR ?? scriptDir;

// Where the finished image must land.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const sourcePath = join(botDir, "entry.png");
const targetPath = join(outputDir, "entry.png");

if (!existsSync(sourcePath)) {
  throw new Error(`front-page image not found at ${sourcePath}`);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(sourcePath, targetPath);

// Confirm the copy landed and report its size, so a silent short write
// cannot pass unnoticed.
const writtenBytes = statSync(targetPath).size;
if (writtenBytes === 0) {
  throw new Error(`copied image is empty at ${targetPath}`);
}
console.log(`wrote ${targetPath} (${writtenBytes} bytes)`);
