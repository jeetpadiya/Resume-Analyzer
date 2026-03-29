import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const sourceDir = path.resolve("src/data/parser");
const targetDir = path.resolve("dist/data/parser");

if (existsSync(sourceDir)) {
  mkdirSync(path.dirname(targetDir), { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}
