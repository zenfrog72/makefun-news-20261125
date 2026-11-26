// Entry point for the news-image 20261125 round-3 (draft 9) submission.
//
// The finished image is produced by the build step and stored in the bot
// directory as entry.png. This program's only job is to place those exact
// bytes at the location the grader reads: entry.png inside the output
// directory. It performs a byte-for-byte copy and nothing else, so repeated
// runs are deterministic by construction.

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_NAME = "entry.png";
const DEFAULT_OUTPUT_DIR = "/output";

function resolveBotDir(): string {
  const fromEnv = process.env.MAKEFUN_BOT_DIR;
  if (fromEnv !== undefined && fromEnv.trim() !== "") {
    return fromEnv;
  }
  // Fall back to the directory that contains this script file, derived from
  // the script's own URL. The process working directory is never used.
  return dirname(fileURLToPath(import.meta.url));
}

function resolveOutputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv !== undefined && fromEnv.trim() !== "") {
    return fromEnv;
  }
  return DEFAULT_OUTPUT_DIR;
}

function main(): void {
  const botDir = resolveBotDir();
  const outputDir = resolveOutputDir();

  const sourcePath = join(botDir, SOURCE_NAME);
  if (!existsSync(sourcePath)) {
    throw new Error(
      `Source image not found: ${sourcePath}. ` +
        `Expected entry.png in the bot directory (${botDir}).`,
    );
  }

  mkdirSync(outputDir, { recursive: true });

  const destPath = join(outputDir, SOURCE_NAME);
  copyFileSync(sourcePath, destPath);

  if (!existsSync(destPath)) {
    throw new Error(
      `Output image missing after copy, expected it at: ${destPath}.`,
    );
  }
  const sourceSize = statSync(sourcePath).size;
  const destSize = statSync(destPath).size;
  if (destSize !== sourceSize) {
    throw new Error(
      `Output image size mismatch after copy: expected ${sourceSize} bytes ` +
        `but wrote ${destSize} bytes at ${destPath}.`,
    );
  }
}

main();
