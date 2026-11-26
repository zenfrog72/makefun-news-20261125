import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function botDir(): string {
  const override = process.env.MAKEFUN_BOT_DIR;
  if (override !== undefined && override !== "") {
    return override;
  }
  return dirname(fileURLToPath(import.meta.url));
}

function outputDir(): string {
  const override = process.env.MAKEFUN_OUTPUT_DIR;
  if (override !== undefined && override !== "") {
    return override;
  }
  return "/output";
}

function main(): void {
  const source = join(botDir(), "entry.png");
  if (!existsSync(source)) {
    throw new Error(`entry.png not found in bot directory: ${source}`);
  }
  const targetDir = outputDir();
  mkdirSync(targetDir, { recursive: true });
  const target = join(targetDir, "entry.png");
  copyFileSync(source, target);
  if (!existsSync(target)) {
    throw new Error(`failed to write output image: ${target}`);
  }
}

main();
