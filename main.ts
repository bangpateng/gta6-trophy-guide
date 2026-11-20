// Leonida Legend — a GTA 6 trophy guide for make.fun's gta6-trophy-guide-01.
// Node 22, standard library only. The guide itself is app/: plain static
// files (index.html + app.js + style.css + data/trophies.json) that a browser
// opens offline — no build step, no network. This entrypoint only hands it
// in: it checks the guide is complete, copies app/ and screenshots/ beside
// this file into the output directory, and writes dossier.json (the summary
// the judge reads) with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts untouched: the scorer requires dossier.json to
// be byte for byte what its own copy of the library writes.
//
// Run it outside the grader's container with MAKEFUN_OUTPUT_DIR standing in
// for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// --- Validate the guide before anything is copied -------------------------
const dataPath = join(here, 'app', 'data', 'trophies.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));
if (!Array.isArray(data.trophies) || data.trophies.length !== 55) {
  throw new Error(`trophies.json must hold all 55 trophies, found ${data.trophies?.length ?? 0}`);
}
const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
for (const t of data.trophies) {
  if (!grades.hasOwnProperty(t.grade)) throw new Error(`trophy ${t.id} has unknown grade ${t.grade}`);
  grades[t.grade] += 1;
  if (typeof t.name !== 'string' || !t.name || typeof t.description !== 'string' || !t.description) {
    throw new Error(`trophy ${t.id} is missing its official name or description`);
  }
  if (!t.guide?.what || !t.guide?.how || !Array.isArray(t.sources) || t.sources.length === 0) {
    throw new Error(`trophy ${t.id} (${t.name}) is missing its guide or its sources`);
  }
}
if (grades.platinum !== 1 || grades.gold !== 2 || grades.silver !== 6 || grades.bronze !== 46) {
  throw new Error(`unexpected grade mix: ${JSON.stringify(grades)}`);
}
const hidden = data.trophies.filter((t) => t.hidden).length;
if (hidden !== 28) throw new Error(`expected 28 hidden trophies, found ${hidden}`);
if (data.trophies.filter((t) => t.missable).length !== 1) {
  throw new Error('expected exactly 1 missable trophy');
}

// --- Validate the screenshots ----------------------------------------------
const shotsDir = join(here, 'screenshots');
const shots = existsSync(shotsDir) ? readdirSync(shotsDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort() : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
}
for (const file of shots) {
  const size = statSync(join(shotsDir, file)).size;
  if (size > 262144) throw new Error(`screenshot ${file} is ${size} bytes, over the 256 KiB cap`);
}

// --- Copy and write the dossier --------------------------------------------
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 48 MiB of app files: app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

// Report the dossier against the text cap so a run that creeps over it is
// noticed here, not at the gate. The cap applies to the dossier's text field
// (the source the judge reads), not the whole file: the file also carries
// the screenshots as base64, which alone run to several hundred kilobytes.
const dossier = JSON.parse(readFileSync(join(out, 'dossier.json'), 'utf8'));
const dossierText = typeof dossier.text === 'string' ? dossier.text.length : 0;
if (dossierText > 163840) throw new Error(`dossier text is ${dossierText} chars, over the 163840 cap`);
const dossierBytes = statSync(join(out, 'dossier.json')).size;
console.log(`dossier.json: ${dossierBytes} bytes total, text ${dossierText} chars (cap 163840)`);

console.log(`Leonida Legend: 55 trophies (${grades.platinum} platinum, ${grades.gold} gold, ${grades.silver} silver, ${grades.bronze} bronze; ${hidden} hidden), ${shots.length} screenshots -> ${out}`);
