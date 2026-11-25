// Delivery program for the Wednesday 25 November 2026 news front page.
// The finished page art is entry.png, sitting beside this file. This
// program verifies the art against the edition's gate and drops a
// byte-for-byte copy where the grader looks for it.
//
// Local trial run:
//   mkdir -p ./out
//   MAKEFUN_OUTPUT_DIR=./out node main.ts
// The grader instead points MAKEFUN_OUTPUT_DIR at its own output folder
// and MAKEFUN_BOT_DIR at the mounted repo; both fall back sensibly.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIMIT_BYTES = 1024 * 1024;
const LIMIT_SIDE_PX = 1024;

function abort(reason: string): never {
  console.error(`entry delivery failed: ${reason}`);
  process.exit(1);
}

const botDir = process.env.MAKEFUN_BOT_DIR ?? dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const artPath = join(botDir, 'entry.png');
if (!existsSync(artPath)) {
  abort(`no entry.png found in ${botDir}`);
}

const artBytes = readFileSync(artPath);

// PNG signature bytes: 137 80 78 71 13 10 26 10.
const signature = [137, 80, 78, 71, 13, 10, 26, 10];
const looksPng = signature.every((byte, i) => artBytes[i] === byte);
if (!looksPng) {
  abort('entry.png is not a PNG file');
}

// Gate: the file must fit within 1 MiB.
const sizeOnDisk = statSync(artPath).size;
if (sizeOnDisk > LIMIT_BYTES) {
  abort(`entry.png is ${sizeOnDisk} bytes, over the 1 MiB limit`);
}

// Gate: at most 1024 by 1024 pixels. A PNG stores its width and height
// as big-endian 32-bit values at offsets 16 and 20, inside the IHDR chunk.
const widthPx = artBytes.readUInt32BE(16);
const heightPx = artBytes.readUInt32BE(20);
if (widthPx > LIMIT_SIDE_PX || heightPx > LIMIT_SIDE_PX) {
  abort(`entry.png is ${widthPx}x${heightPx}, over the 1024x1024 limit`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), artBytes);
console.log(`delivered ${artBytes.length} bytes to ${join(outDir, 'entry.png')}`);
