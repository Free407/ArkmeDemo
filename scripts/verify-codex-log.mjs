import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const args = new Set(process.argv.slice(2));
const allowEmpty = args.has("--allow-empty");
const minEntriesArg = [...args].find((arg) => arg.startsWith("--min-entries="));
const minEntries = minEntriesArg ? Number(minEntriesArg.split("=")[1]) : 1;
const logPath = resolve("docs/codex-iteration-log.md");

function fail(message) {
  console.error(`codex log check failed: ${message}`);
  process.exit(1);
}

if (!Number.isInteger(minEntries) || minEntries < 0) {
  fail("--min-entries must be a non-negative integer");
}

let content;

try {
  content = readFileSync(logPath, "utf8");
} catch {
  fail("docs/codex-iteration-log.md does not exist");
}

const withoutCodeFences = content.replace(/```[\s\S]*?```/g, "");
const entries = withoutCodeFences
  .split(/^##\s+/m)
  .slice(1)
  .map((entry) => entry.trim())
  .filter(Boolean);

if (entries.length === 0) {
  if (allowEmpty) {
    console.log("codex log check passed: template exists, no iteration entries yet");
    process.exit(0);
  }

  fail("no iteration entries found");
}

if (entries.length < minEntries) {
  fail(`expected at least ${minEntries} iteration entries, found ${entries.length}`);
}

const requiredSections = [
  "### 用户输入",
  "### AI 最终输出",
  "### 本轮改动文件",
  "### 验证结果",
];

entries.forEach((entry, index) => {
  const line = entry.split("\n")[0]?.trim() ?? "";

  if (!/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+\S+\s+\([+-]\d{4}\)/.test(line)) {
    fail(`entry ${index + 1} has invalid time heading: "${line}"`);
  }

  requiredSections.forEach((section) => {
    if (!entry.includes(section)) {
      fail(`entry ${index + 1} is missing section "${section}"`);
    }
  });
});

console.log(`codex log check passed: ${entries.length} iteration entr${entries.length === 1 ? "y" : "ies"} found`);

