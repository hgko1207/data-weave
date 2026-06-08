import fs from "node:fs";
import path from "node:path";

// 1회성 스크립트 — text-xs와 text-zinc-500이 같은 라인에 있으면
// text-zinc-500을 text-zinc-400으로 일괄 변경. WCAG AA 4.5:1 충족.
// 큰 텍스트(text-sm 이상)는 large text 기준(3:1)으로 zinc-500 OK라 건드리지 않음.

function walk(dir, list = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, list);
    else if (e.name.match(/\.(tsx?|jsx?)$/)) list.push(p);
  }
  return list;
}

const files = walk("src");
let totalChanged = 0;
const changedFiles = [];

for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const lines = src.split(/\r?\n/);
  let fileChanged = 0;
  const out = lines.map((l) => {
    if (/text-xs/.test(l) && /text-zinc-500/.test(l)) {
      fileChanged++;
      return l.replace(/text-zinc-500/g, "text-zinc-400");
    }
    return l;
  });
  if (fileChanged > 0) {
    fs.writeFileSync(f, out.join("\n"));
    changedFiles.push([f, fileChanged]);
    totalChanged += fileChanged;
  }
}

console.log("Total lines changed:", totalChanged, "across", changedFiles.length, "files");
for (const [f, n] of changedFiles) {
  console.log(`  ${n}x ${f.replaceAll("\\", "/")}`);
}
