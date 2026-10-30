import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const roots = ['src'];
const standalone = ['index.html', 'package.json', 'tsconfig.json'];
const extensions = new Set(['.ts', '.tsx', '.css', '.html', '.json']);
const suspicious = /Ã.|Â.|â(?:€|€¦|€”|†|ˆ)|\uFFFD/u;
const decoder = new TextDecoder('utf-8', { fatal: true });
const failures = [];

async function inspect(file) {
  const bytes = await readFile(file);
  let text;
  try {
    text = decoder.decode(bytes);
  } catch {
    failures.push(`${file}: no es UTF-8 válido`);
    return;
  }
  text.split(/\r?\n/u).forEach((line, index) => {
    if (suspicious.test(line)) failures.push(`${file}:${index + 1}: posible texto corrupto`);
  });
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (extensions.has(extname(entry.name))) await inspect(path);
  }
}

for (const root of roots) await walk(root);
for (const file of standalone) await inspect(file);

if (failures.length) {
  failures.forEach((failure) => console.error(failure));
  process.exitCode = 1;
} else {
  console.log(`Codificación UTF-8 verificada en ${relative(process.cwd(), process.cwd()) || 'el proyecto'}.`);
}
