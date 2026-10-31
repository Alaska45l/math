import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { VN_POSES, POSE_ICONS, DEFAULT_TAGS } from "../js/core/vn.js";
import { GLOSSARY_TERMS, GLOSSARY_AUDIT } from "../js/core/glossary.js";
import {
  VN_SCRIPTS,
  DIAGNOSE_REACTIONS,
  STREAK_REACTIONS,
} from "../js/modules/potencias-raices/vn-scripts.js";
import {
  CHALLENGE_TYPES,
  makeChallenge,
} from "../js/modules/potencias-raices/retos.js";

const root = path.resolve(".");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const wordCount = (html) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
const expectedPoses = [
  "base",
  "pensativa",
  "explicando",
  "evaluando",
  "empatia",
  "complice",
  "feliz",
  "orgullosa",
  "sospecha",
  "unamused",
  "lentes-brillo",
  "eureka",
  "colapso",
  "enojada",
  "sonrojada",
  "panico",
  "attack",
];

assert.ok(
  Object.keys(VN_POSES).length >= 17,
  "VN_POSES debe incluir las 17 poses oficiales.",
);
for (const pose of expectedPoses) {
  assert.equal(
    VN_POSES[pose],
    `assets/vn/${pose}.webp`,
    `Ruta inválida para ${pose}.`,
  );
  assert.ok(POSE_ICONS[pose], `Falta ícono para ${pose}.`);
  assert.ok(DEFAULT_TAGS[pose], `Falta etiqueta para ${pose}.`);
  assert.ok(
    fs.existsSync(path.join(root, VN_POSES[pose])),
    `No existe el sprite ${pose}.`,
  );
}
console.log("OK · Las 17 poses tienen sprite, icono y etiqueta oficiales.");

const mainScriptIds = [
  "sec1-mundos",
  "sec2-negativos",
  "sec3-cancelacion",
  "sec4-mitad",
  "sec5-geometria",
  "sec6-arbol",
  "sec7-simplificar",
  "sec8-choque",
  "sec9-espejo-real",
  "sec10-paradojas",
];
const baseScriptIds = Array.from(
  { length: 10 },
  (_, index) => `sec${index + 1}-base`,
);
const requiredDiagnoses = [
  "additive_instead_of_multiplicative",
  "zero_exponent_is_zero",
  "negative_exponent_is_negative_number",
  "canceled_to_zero_or_counted_ones",
  "distributed_power_over_sum",
  "neg_base_precedence",
  "forgot_abs_in_even_root",
  "illegal_real_root_distribution",
  "multiplied_bases_in_same_base_prod",
];
assert.ok(
  Object.keys(VN_SCRIPTS).length >= 20,
  "Se requieren veinte guiones completos.",
);
for (const key of [...mainScriptIds, ...baseScriptIds]) {
  assert.ok(VN_SCRIPTS[key]?.length >= 4, `Faltan mensajes en ${key}.`);
}
const allLines = Object.values(VN_SCRIPTS).flat();
const lineCounts = allLines.map((line) => wordCount(line.html));
assert.ok(
  lineCounts.every((count) => count >= 20),
  "Hay un mensaje de Alaska de menos de veinte palabras.",
);
assert.ok(
  lineCounts.reduce((sum, count) => sum + count, 0) / lineCounts.length >= 30,
  "El promedio de guiones debe ser al menos treinta palabras.",
);
for (const id of requiredDiagnoses)
  assert.ok(DIAGNOSE_REACTIONS[id], `Falta reacción para ${id}.`);
assert.ok(
  DIAGNOSE_REACTIONS.unsimplified_radical,
  "Falta la reacción para radical sin simplificar.",
);
for (const key of [
  "firstTry",
  "recovered",
  "repeatedError",
  "flawlessRun",
  "showSolution",
  "solutionAfter",
])
  assert.ok(STREAK_REACTIONS[key], `Falta reacción de racha ${key}.`);
console.log(
  `OK · ${Object.keys(VN_SCRIPTS).length} guiones; ${lineCounts.length} líneas, mínimo ${Math.min(...lineCounts)} palabras y promedio ${(lineCounts.reduce((a, b) => a + b, 0) / lineCounts.length).toFixed(1)}.`,
);

assert.equal(
  Object.keys(GLOSSARY_TERMS).length,
  9,
  "El glosario debe tener nueve términos.",
);
for (const [key, audit] of Object.entries(GLOSSARY_AUDIT)) {
  assert.ok(
    audit.words >= 30,
    `${key} necesita una explicación de al menos treinta palabras.`,
  );
  assert.ok(
    GLOSSARY_TERMS[key].pose in VN_POSES,
    `${key} usa una pose sin sprite.`,
  );
  assert.match(
    GLOSSARY_TERMS[key].formula.toString(),
    /frac\(/,
    `${key} debe construir una fracción horizontal .fr.`,
  );
}
const glossarySource = read("js/core/glossary.js");
assert.doesNotMatch(
  glossarySource,
  /['"`]\s*1\s*\/\s*a\s*['"`]/i,
  "No usar fracciones crudas 1/a.",
);
console.log(
  "OK · Los nueve términos del glosario superan treinta palabras y cada fórmula usa frac().",
);

const css = read("css/modules/potencias-raices.css");
assert.ok(
  css.split("\n").length > 150,
  "El CSS debe conservar formato legible de más de 150 líneas.",
);
const duplicateBlocks = [];
const seenBlocks = new Set();
for (const [, selector, declarations] of css.matchAll(
  /([^{}]+)\{([^{}]*)\}/g,
)) {
  const normalized = `${selector.replace(/\s+/g, " ").trim()} { ${declarations.replace(/\s+/g, " ").trim()} }`;
  if (seenBlocks.has(normalized)) duplicateBlocks.push(normalized);
  seenBlocks.add(normalized);
}
assert.deepEqual(duplicateBlocks, [], "Hay bloques CSS duplicados.");
console.log(
  `OK · CSS legible: ${css.split("\n").length} líneas y sin bloques idénticos duplicados.`,
);

const page = read("potencias-raices.html");
const index = read("js/modules/potencias-raices/index.js");
const widgetHosts = [...page.matchAll(/data-widget=["']([^"']+)["']/g)].map(
  (match) => match[1],
);
assert.equal(
  widgetHosts.length,
  10,
  "Se esperan diez laboratorios declarados en el HTML.",
);
const sectionIds = [...page.matchAll(/id=["']sec-(\d+)["']/g)]
  .map((match) => Number(match[1]))
  .filter((number) => number >= 1 && number <= 10);
assert.equal(
  sectionIds.length,
  10,
  "Se esperan diez secciones didácticas en el HTML.",
);
const checks = [
  ...index.matchAll(/type:\s*["'](?:number|expr|choice|pair)["']/g),
];
assert.equal(
  checks.length,
  30,
  "Cada una de las diez secciones debe tener tres ejercicios escritos.",
);
assert.doesNotMatch(
  index,
  /\$\{lesson\.theory\}|Identificá primero la operación que aparece/,
  "No usar soluciones genéricas.",
);
const widgetSourceNames = [
  "dos-mundos",
  "cinta-negativa",
  "neutro-cancelacion",
  "mitad-mundos",
  "geometria-raices",
  "arbol-factores",
  "simplificador-radical",
  "choque-mundos",
  "espejo-dominio-real",
  "inspector-paradojas",
];
for (const name of widgetSourceNames) {
  const source = read(`js/modules/potencias-raices/widgets/${name}.js`);
  assert.ok(
    source.split("\n").length > 120,
    `${name}.js debe contener un simulador independiente sustantivo.`,
  );
  assert.match(source, /createStore|connect/);
}
assert.doesNotMatch(
  read("js/modules/potencias-raices/vn-scripts.js"),
  /shared\s*\(|for\s*\(/,
  "Los diálogos no se generan con plantillas repetidas.",
);
assert.match(page, /potencias-raices\.css/);
for (const type of CHALLENGE_TYPES) {
  const challenge = makeChallenge(1945, type);
  assert.equal(challenge.type, type);
  assert.ok(
    challenge.prompt &&
      challenge.hints.length === 3 &&
      challenge.solution.length >= 3,
    `Reto incompleto: ${type}.`,
  );
}
console.log(
  "OK · Diez secciones, diez widgets y ocho familias reproducibles de retos.",
);

for (const script of [
  "scripts/verify-pages.mjs",
  "scripts/verify-interactions.mjs",
  "scripts/visual-audit-potencias-raices.mjs",
]) {
  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: "utf8",
    timeout: 120_000,
  });
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  assert.equal(result.status, 0, `${script} no superó su verificación E2E.`);
}
console.log(
  "AUDITORÍA COMPLETA · Página Chromium, interacciones, sprites, glosario y contenido correctos.",
);
