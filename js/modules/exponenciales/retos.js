/**
 * retos.js — Motor de retos y práctica autónoma para Laboratorio 7: Exponenciales.
 * Unidad 08 de Alaska Math Lab.
 *
 * Estructura de 2 pestañas accesibles:
 * 1. «1. Entrenador Infinito por Semilla PRNG» (8 familias generativas deterministas)
 * 2. «2. Las 5 Trampas Clásicas de Examen»
 *
 * Características:
 * - Generador pseudoaleatorio determinista mulberry32(seed)
 * - 3 pistas numéricas progresivas por ejercicio
 * - Solución matemática completa paso a paso (3 pasos)
 * - Caja de semilla PRNG con aleatorizador y copiado al portapapeles
 * - Almacenamiento persistente en localStorage ("exponenciales:seed")
 * - Diagnóstico cognitivo mediante diagnoseExp y reacciones de Alaska
 * - Estrictamente SIN Modo Boss
 * - Cero emojis Unicode
 */

import { h, mount, chalkIcon } from "../../core/dom.js";
import { fmt, frac } from "../../core/math-format.js";
import { playScript } from "../../core/vn.js";
import { diagnoseExp } from "./logic.js";
import { DIAGNOSE_REACTIONS, STREAK_REACTIONS } from "./vn-scripts.js";
import { saveProgress } from "./components.js";

export const CHALLENGE_TYPES = [
  "razon_tabla_vs_salto",
  "evaluacion_k_a_x",
  "densidad_potencia_racional",
  "espejo_base_inversa",
  "reconstruccion_dos_puntos",
  "modelo_tiempo_compuesto",
  "asintota_imagen_desplazamiento",
  "ecuacion_igualacion_factor_comun",
];

export function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const int = (rng, low, high) => low + Math.floor(rng() * (high - low + 1));

function inlineMathNodes(text) {
  if (typeof text !== "string") return [text];
  const nodes = [];
  const marker = /\[\[frac:([^|\]]+)\|([^\]]+)\]\]/g;
  let cursor = 0;
  for (const match of text.matchAll(marker)) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    nodes.push(frac(match[1], match[2]));
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

/**
 * Genera un reto reproducible a partir de una semilla numérica entera.
 */
export function makeChallenge(seed, requestedType = null) {
  const rng = mulberry32(seed);
  const typeIndex = int(rng, 0, CHALLENGE_TYPES.length - 1);
  const type = requestedType || CHALLENGE_TYPES[typeIndex];
  const common = { seed, type, vars: {} };

  const cases = {
    razon_tabla_vs_salto() {
      const k = int(rng, 2, 5);
      const a = int(rng, 2, 4);
      const y0 = k;
      const y1 = k * a;
      const y2 = k * a * a;
      const y3 = k * a * a * a;
      const linearDiff = y1 - y0;
      return {
        ...common,
        prompt: `Dada la tabla exponencial (0, ${y0}), (1, ${y1}), (2, ${y2}), (3, ${y3}) con paso Δx = 1 regular, ¿cuál es la razón multiplicativa constante a = y_(i+1) / y_i entre términos consecutivos?`,
        answer: a,
        displayAnswer: fmt(a),
        spec: {
          problemType: "table",
          type: "table",
          expected: a,
          ratio: a,
          linearDiff,
          context: "tabla razon",
        },
        hints: [
          "Calculá el cociente entre dos renglones consecutivos: dividí el valor de y en x = 1 por el valor en x = 0.",
          `Comprobá que esa división se mantenga constante: ${y2} / ${y1} = ${a} y ${y1} / ${y0} = ${a}. No restes los valores.`,
          `La razón multiplicativa es ${fmt(a)}, que coincide con la base de la función exponencial f(x) = ${y0} · ${a}ˣ.`,
        ],
        solution: [
          "En una función exponencial con paso Δx = 1, la razón multiplicativa es a = y_(i+1) / y_i.",
          `Dividimos los dos primeros valores: ${y1} / ${y0} = ${a}.`,
          `Verificamos con los siguientes términos: ${y2} / ${y1} = ${a} y ${y3} / ${y2} = ${a}. La respuesta es ${a}.`,
        ],
      };
    },

    evaluacion_k_a_x() {
      const k = int(rng, 2, 5);
      const a = int(rng, 2, 4);
      const x = int(rng, 2, 4);
      const powerVal = a ** x;
      const correctVal = k * powerVal;
      const trapVal = (k * a) ** x;
      return {
        ...common,
        prompt: `Para f(x) = ${k} · ${a}ˣ, evaluá el valor exacto de f(${x}) recordando que k · aˣ ≠ (k · a)ˣ.`,
        answer: correctVal,
        displayAnswer: fmt(correctVal),
        spec: {
          expected: correctVal,
          k,
          a,
          x,
          base: a,
          multipliedKandBase: trapVal,
          context: "multiplied_k_and_base",
        },
        hints: [
          "Por jerarquía de operaciones, calculá primero la potencia aˣ antes de multiplicar por el coeficiente k.",
          `Elevá la base ${a} al exponente ${x}: ${a}^${x} = ${powerVal}. El coeficiente ${k} espera afuera.`,
          `Multiplicá el resultado de la potencia por ${k}: ${k} · ${powerVal} = ${correctVal}.`,
        ],
        solution: [
          `Separamos respetando la jerarquía algebraica: f(${x}) = ${k} · (${a}^${x}).`,
          `Calculamos primero la potencia: ${a}^${x} = ${powerVal}.`,
          `Efectuamos el producto final: ${k} · ${powerVal} = ${correctVal}.`,
        ],
      };
    },

    densidad_potencia_racional() {
      const k = int(rng, 2, 5);
      const root = int(rng, 2, 5);
      const base = root * root;
      const correctVal = k * root;
      return {
        ...common,
        prompt: `Evaluá f(1/2) para la función f(x) = ${k} · ${base}ˣ en ℝ, expresando el exponente fraccionario como radical.`,
        answer: correctVal,
        displayAnswer: fmt(correctVal),
        spec: { expected: correctVal, base, k, exponent: 0.5 },
        hints: [
          "Recordá que elevar a la 1/2 equivale a calcular la raíz cuadrada principal del número: a^(1/2) = √a.",
          `Calculá la raíz cuadrada principal de ${base}: √${base} = ${root}.`,
          `Multiplicá el coeficiente inicial ${k} por esa raíz: ${k} · ${root} = ${correctVal}.`,
        ],
        solution: [
          `Aplicamos la propiedad del exponente racional: ${base}^(1/2) = √${base}.`,
          `La raíz cuadrada principal de ${base} en ℝ es ${root}.`,
          `Multiplicamos por el coeficiente inicial k: ${k} · ${root} = ${correctVal}.`,
        ],
      };
    },

    espejo_base_inversa() {
      const b = int(rng, 2, 4);
      const m = int(rng, 1, 3);
      const correctVal = b ** m;
      return {
        ...common,
        prompt: `Aplicá la simetría de base inversa (1/${b})ˣ = ${b}⁻ˣ para calcular el valor exacto de (1/${b})⁻${m}.`,
        answer: correctVal,
        displayAnswer: fmt(correctVal),
        spec: { expected: correctVal, b, m },
        hints: [
          "Invertir la base fraccionaria cambia el signo del exponente: (1/b)⁻ᵐ = bᵐ.",
          `Al dar vuelta la fracción 1/${b}, el exponente pasa de −${m} a +${m}: nos queda ${b}^${m}.`,
          `Calculá la potencia entera positiva: ${b}^${m} = ${correctVal}.`,
        ],
        solution: [
          `Por propiedad de la potencia de una fracción: (1/${b})⁻${m} = (${b}/1)^${m}.`,
          `Esto equivale directamente a calcular la potencia entera ${b}^${m}.`,
          `${b}^${m} = ${correctVal}.`,
        ],
      };
    },

    reconstruccion_dos_puntos() {
      const k = int(rng, 1, 4);
      const a = int(rng, 2, 4);
      const y1 = k * a;
      const y2 = k * a * a;
      const y3 = k * a * a * a;
      return {
        ...common,
        prompt: `Una función exponencial f(x) = k · aˣ pasa por los puntos P(1; ${y1}) y Q(2; ${y2}). Hallá el valor de f(3).`,
        answer: y3,
        displayAnswer: fmt(y3),
        spec: { expected: y3, k, a },
        hints: [
          "Dividí las ordenadas de los puntos dados para cancelar k: f(2) / f(1) = a^(2−1) = a.",
          `${y2} / ${y1} = ${a}, por lo que la base es a = ${a}. Luego hallá k usando P(1; ${y1}): k · ${a} = ${y1} ⟹ k = ${k}.`,
          `Con la fórmula f(x) = ${k} · ${a}ˣ completa, evaluá en x = 3: f(3) = ${k} · ${a}³.`,
        ],
        solution: [
          `Dividimos las salidas: f(2)/f(1) = (${k}·${a}²) / (${k}·${a}) = ${a}. Deducimos que a = ${a}.`,
          `Reemplazamos en el punto P(1; ${y1}): k · ${a}¹ = ${y1} ⟹ k = ${k}. La fórmula es f(x) = ${k} · ${a}ˣ.`,
          `Evaluamos en x = 3: f(3) = ${k} · ${a}³ = ${k} · ${a ** 3} = ${y3}.`,
        ],
      };
    },

    modelo_tiempo_compuesto() {
      const M0 = [40, 60, 80, 100][int(rng, 0, 3)];
      const T = int(rng, 3, 5);
      const cycles = int(rng, 2, 3);
      const t = cycles * T;
      const divisor = 2 ** cycles;
      const correctVal = M0 / divisor;
      return {
        ...common,
        prompt: `Una sustancia radiactiva de M₀ = ${M0} g tiene una vida media de T = ${T} minutos y sigue el modelo M(t) = ${M0} · (1/2)^(t/${T}). ¿Cuántos gramos quedan a los t = ${t} minutos?`,
        answer: correctVal,
        displayAnswer: fmt(correctVal),
        spec: { expected: correctVal, M0, T, t, context: "periodo tiempo compuesto" },
        hints: [
          "Calculá primero cuántas vidas medias transcurrieron dividiendo el tiempo total por el período: t / T.",
          `En t = ${t} minutos pasaron ${t} / ${T} = ${cycles} períodos completos. La fracción restante es (1/2)^${cycles} = 1/${divisor}.`,
          `Multiplicá la masa inicial por esa fracción: ${M0} / ${divisor} = ${correctVal} g.`,
        ],
        solution: [
          `El exponente compuesto mide los ciclos de decaimiento: n = t/T = ${t}/${T} = ${cycles} vidas medias.`,
          `La masa se redujo a (1/2)^${cycles} = 1/${divisor} de su valor inicial.`,
          `M(${t}) = ${M0} · (1/${divisor}) = ${correctVal} g.`,
        ],
      };
    },

    asintota_imagen_desplazamiento() {
      const k = int(rng, 2, 4);
      const a = int(rng, 2, 3);
      const hVal = int(rng, 1, 3);
      const c = int(rng, 1, 5);
      const anchorVal = k + c;
      return {
        ...common,
        prompt: `Para la función desplazada f(x) = ${k} · ${a}^(x−${hVal}) + ${c}, ¿cuál es el valor del ancla f(${hVal})?`,
        answer: anchorVal,
        displayAnswer: fmt(anchorVal),
        spec: { expected: anchorVal, k, a, h: hVal, c },
        hints: [
          "Al evaluar en x = h, el exponente de la base se anula: x − h = 0.",
          `Cualquier base positiva elevada a la cero vale uno: ${a}⁰ = 1.`,
          `Queda f(${hVal}) = ${k} · 1 + ${c} = ${anchorVal}.`,
        ],
        solution: [
          `Sustituimos x = ${hVal} en la función: f(${hVal}) = ${k} · ${a}^(${hVal}−${hVal}) + ${c}.`,
          `Como ${hVal} − ${hVal} = 0, aplicamos el neutro de la potencia: ${a}⁰ = 1.`,
          `Efectuamos la suma: f(${hVal}) = ${k} · 1 + ${c} = ${anchorVal}.`,
        ],
      };
    },

    ecuacion_igualacion_factor_comun() {
      const m = int(rng, 1, 4);
      const powerVal = 2 ** m;
      const rhs = 3 * powerVal;
      return {
        ...common,
        prompt: `Resolvé en ℝ sin usar logaritmos sacando factor común: 2^(x+1) + 2ˣ = ${rhs}. ¿Cuánto vale x?`,
        answer: m,
        displayAnswer: fmt(m),
        spec: { expected: m, m, rhs, context: "ecuacion factor comun" },
        hints: [
          "Desarmá 2^(x+1) como 2ˣ · 2¹ usando la propiedad del producto de potencias de igual base.",
          `Extraé 2ˣ de factor común: 2ˣ · (2 + 1) = ${rhs} ⟹ 2ˣ · 3 = ${rhs}.`,
          `Dividí por 3 ambos miembros: 2ˣ = ${powerVal}, e igualá los exponentes sabiendo que ${powerVal} = 2^${m}.`,
        ],
        solution: [
          `Descomponemos: 2^(x+1) + 2ˣ = 2ˣ · 2 + 2ˣ · 1 = 2ˣ · (2 + 1) = 2ˣ · 3.`,
          `Igualamos al miembro derecho y dividimos por 3: 2ˣ · 3 = ${rhs} ⟹ 2ˣ = ${powerVal}.`,
          `Como ${powerVal} = 2^${m}, por igualación de bases concluimos que x = ${m}.`,
        ],
      };
    },
  };

  const generator = cases[type] || cases.razon_tabla_vs_salto;
  return generator();
}

// =============================================================================
// LAS 5 TRAMPAS CLÁSICAS DE EXAMEN
// =============================================================================

export const TRAPS = [
  {
    title: "Trampa 1 · Multiplicar el coeficiente k por la base a",
    wrong: "Afirmar que 3 · 2ˣ = 6ˣ o que 4 · 2ˣ = 8ˣ agrupando factores antes de potenciar.",
    example: "Para x = 2, 3 · 2² = 3 · 4 = 12, mientras que 6² = 36 ≠ 12. De igual forma, 4 · 2² = 16, mientras que 8² = 64.",
    proof: "Por estricta jerarquía de operaciones, la potenciación precede a la multiplicación. En k · aˣ, el exponente x actúa exclusivamente sobre la base contigua a. Para que fuese (k · a)ˣ ambos factores deberían estar afectados por el exponente.",
  },
  {
    title: "Trampa 2 · Corchete cerrado en la asíntota horizontal",
    wrong: "Escribir la imagen de f(x) = 2 · 3ˣ + 4 como [4; +∞) con corchete cerrado porque la curva se apoya en 4.",
    example: "Si f(x) = 4, entonces 2 · 3ˣ + 4 = 4 ⟹ 2 · 3ˣ = 0 ⟹ 3ˣ = 0, lo cual es imposible para cualquier x ∈ ℝ.",
    proof: "En los números reales, aˣ > 0 para todo x. Por ende, k · aˣ + c jamás alcanza el valor exacto c. La recta y = c es una asíntota horizontal a la que la curva tiende en el infinito, pero no pertenece a la imagen: va siempre con paréntesis abierto (c; +∞).",
  },
  {
    title: "Trampa 3 · Usar la tasa porcentual bruta como base",
    wrong: "Si una población crece un 12% anual, modelar P(t) = P₀ · (0,12)ᵗ.",
    example: "Con P₀ = 100, en t = 1 tendrías 100 · 0,12 = 12 (¡se destruyó el 88% de la población!), en lugar de 112.",
    proof: "Un crecimiento del r% significa conservar el 100% de la cantidad existente (1) más el porcentaje adicional r. La base multiplicativa correcta es el factor de acumulación a = 1 + r = 1 + 0,12 = 1,12.",
  },
  {
    title: "Trampa 4 · Restar exponentes sin paréntesis en cocientes",
    wrong: "En 2^(3x+1) : 16^(x−4) = 1, escribir 3x + 1 − 4x − 16 = 0 y obtener x = −15.",
    example: "Con x = −15: 2^(−44) : 16^(−19) = 2^(−44) : 2^(−76) = 2³² ≠ 1. Con paréntesis: 3x + 1 − (4x − 16) = 0 ⟹ −x + 17 = 0 ⟹ x = 17, donde 2⁵² : 2⁵² = 1.",
    proof: "El cociente de potencias de igual base resta los exponentes: aᵘ : aᵛ = a^(u − v). El signo menos afecta a todo el binomio divisor v = 4x − 16, invirtiendo el signo del término independiente: −(4x − 16) = −4x + 16.",
  },
  {
    title: "Trampa 5 · Aceptar raíces no positivas en la sustitución cuadrática",
    wrong: "Al resolver con u = 3ˣ una cuadrática que arroja u₁ = 3 y u₂ = −1, declarar que x = −1 o x = algo negativo es solución de 3ˣ = −1.",
    example: "Si x = −1, 3⁻¹ = 1/3 > 0 ≠ −1. Una base positiva elevada a cualquier exponente real jamás da un resultado negativo ni cero.",
    proof: "La sustitución u = aˣ impone la condición obligatoria de existencia u > 0 en ℝ. Toda raíz auxiliar con u ≤ 0 es extraña y debe descartarse de inmediato antes de volver a la variable original x.",
  },
];

// =============================================================================
// COMPONENTE VISUAL: ENTRENADOR Y TRAMPAS
// =============================================================================

function createTraps(root) {
  const cards = TRAPS.map((trap, index) => {
    const wrong = h(
      "article",
      { class: "exp-trap__wrong pr-trap__wrong" },
      h("h4", null, "Razonamiento tramposo de examen"),
      h("p", null, ...inlineMathNodes(trap.wrong)),
    );
    const proof = h(
      "article",
      { class: "exp-trap__proof pr-trap__proof", hidden: true },
      h("h4", null, "Regla formal en ℝ"),
      h("p", null, ...inlineMathNodes(trap.proof)),
    );
    const example = h(
      "p",
      { class: "exp-trap__example pr-trap__example", hidden: true },
      "Contraejemplo: ",
      ...inlineMathNodes(trap.example),
    );
    const test = h(
      "button",
      {
        type: "button",
        class: "btn btn--ghost",
        on: {
          click: () => {
            example.hidden = !example.hidden;
          },
        },
      },
      chalkIcon("target"),
      " Poner a prueba con un número",
    );
    const toggle = h(
      "button",
      {
        type: "button",
        class: "btn btn--ghost",
        "aria-expanded": "false",
        on: {
          click: (event) => {
            const open = proof.hidden;
            proof.hidden = !open;
            event.currentTarget.setAttribute("aria-expanded", String(open));
            playScript([
              {
                pose: "lentes-brillo",
                tag: `Trampa ${fmt(index + 1)} de parcial`,
                html: open ? `${trap.example} ${trap.proof}` : trap.wrong,
              },
            ]);
          },
        },
      },
      chalkIcon("hint"),
      ` ${trap.title} · Error común / demostración correcta`,
    );
    return h(
      "article",
      { class: "exp-trap pr-trap" },
      toggle,
      h("div", { class: "exp-trap__columns pr-trap__columns" }, wrong, proof),
      test,
      example,
    );
  });

  mount(
    root,
    h(
      "section",
      { class: "exp-traps pr-traps" },
      h("h3", null, "Cinco trampas clásicas de examen"),
      ...cards,
    ),
  );
}

function createTrainer(root) {
  let seed = 42;
  try {
    const saved = localStorage.getItem("exponenciales:seed");
    if (saved) seed = Number(saved) >>> 0;
  } catch {
    // Modo seguro sin localStorage
  }

  let current = makeChallenge(seed);
  let failStreak = 0;
  let successStreak = 0;
  let hintStep = 0;

  const seedInput = h("input", {
    type: "number",
    min: "0",
    step: "1",
    value: String(seed),
    "aria-label": "Semilla del generador",
  });

  const typeSelect = h(
    "select",
    { "aria-label": "Familia de reto" },
    [
      ["aleatorio", "Aleatorio"],
      ...CHALLENGE_TYPES.map((type) => [type, type.replaceAll("_", " ")]),
    ].map(([value, label]) => h("option", { value }, label)),
  );

  const copySeedText = h("span", { class: "copy-seed-text" }, " Copiar semilla");
  const copySeedBtn = h(
    "button",
    {
      type: "button",
      class: "btn btn--ghost",
      "aria-label": "Copiar semilla al portapapeles",
      on: {
        click: () => {
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(String(seed)).then(() => {
              copySeedText.textContent = " Copiada";
              setTimeout(() => {
                copySeedText.textContent = " Copiar semilla";
              }, 1500);
            }).catch(() => {});
          }
        },
      },
    },
    chalkIcon("hint"),
    copySeedText,
  );

  const randomizeBtn = h(
    "button",
    {
      type: "button",
      class: "btn btn--ghost btn--icon-only",
      "aria-label": "Generar nueva semilla",
      title: "Generar nueva semilla",
      on: {
        click: () => {
          seed = Math.floor(Math.random() * 1000000) >>> 0;
          seedInput.value = String(seed);
          try {
            localStorage.setItem("exponenciales:seed", String(seed));
          } catch {}
          newChallenge();
        },
      },
    },
    chalkIcon("reset"),
  );

  const seedLabel = h(
    "label",
    { class: "exp-control pr-control" },
    h("span", null, "Semilla PRNG"),
    seedInput,
  );

  const typeLabel = h(
    "label",
    { class: "exp-control pr-control" },
    h("span", null, "Familia de reto"),
    typeSelect,
  );

  const prompt = h("p", { class: "exp-challenge__prompt pr-challenge__prompt" });
  const input = h("input", {
    type: "text",
    inputmode: "decimal",
    autocomplete: "off",
    "aria-label": "Tu respuesta al reto",
  });
  const preview = h(
    "p",
    { class: "exp-check__preview pr-check__preview", "aria-live": "polite" },
    "Interpretado como: —",
  );
  const feedback = h("p", {
    class: "exp-check__feedback pr-check__feedback",
    "aria-live": "polite",
  });
  const hintText = h("p", { class: "exp-check__hint pr-check__hint", hidden: true });
  const solution = h("div", { class: "exp-check__solution pr-check__solution", hidden: true });
  const meta = h("p", { class: "muted exp-muted pr-muted" });

  const revise = h(
    "button",
    {
      type: "button",
      class: "btn",
      on: {
        click: () => {
          const raw = input.value.trim().replace(",", ".");
          const valNum = Number(raw);
          const isCorrect = Number.isFinite(valNum) && Math.abs(valNum - current.answer) < 1e-4;

          const diagnosis = diagnoseExp(raw, {
            ...current.spec,
            expected: current.answer,
          });

          if (isCorrect) {
            feedback.textContent = `Correcto: ${current.displayAnswer}. El razonamiento analítico quedó guardado.`;
            feedback.className = "exp-check__feedback pr-check__feedback is-correct";
            saveProgress("challenge:last", { seed, type: current.type });
            if (failStreak > 0) {
              playScript([STREAK_REACTIONS.recovered]);
              successStreak = 1;
            } else {
              successStreak++;
              if (successStreak >= 3) {
                playScript([STREAK_REACTIONS.flawlessRun]);
              } else {
                playScript([STREAK_REACTIONS.firstTry]);
              }
            }
            failStreak = 0;
          } else {
            successStreak = 0;
            failStreak++;
            feedback.textContent =
              diagnosis?.message ||
              "Todavía no coincide. Consultá una pista y revisá las operaciones paso a paso.";
            feedback.className = "exp-check__feedback pr-check__feedback is-error";
            const id = diagnosis?.id;
            if (failStreak >= 2) playScript([STREAK_REACTIONS.repeatedError]);
            else if (id && DIAGNOSE_REACTIONS[id])
              playScript([DIAGNOSE_REACTIONS[id]]);
          }
        },
      },
    },
    chalkIcon("check"),
    " Revisar",
  );

  const hint = h(
    "button",
    {
      type: "button",
      class: "btn btn--ghost",
      on: {
        click: () => {
          hintStep = Math.min(3, hintStep + 1);
          hintText.hidden = false;
          hintText.textContent = `Pista ${fmt(hintStep)} de 3: ${current.hints[hintStep - 1]}`;
          playScript([
            {
              pose: ["base", "pensativa", "explicando"][hintStep - 1],
              tag: `Pista ${fmt(hintStep)} de 3`,
              html: current.hints[hintStep - 1],
            },
          ]);
        },
      },
    },
    chalkIcon("hint"),
    " Pista (1/3)",
  );

  const reveal = h(
    "button",
    {
      type: "button",
      class: "btn btn--ghost",
      on: {
        click: () => {
          solution.hidden = false;
          mount(
            solution,
            h("strong", null, "Resolución paso a paso"),
            h(
              "ol",
              null,
              ...current.solution.map((step) =>
                h("li", null, ...inlineMathNodes(step)),
              ),
            ),
          );
          playScript([
            STREAK_REACTIONS.showSolution,
            STREAK_REACTIONS.solutionAfter,
          ]);
        },
      },
    },
    chalkIcon("book"),
    " ¡Estoy atorado! Mostrame la solución",
  );

  const next = h(
    "button",
    {
      type: "button",
      class: "btn btn--ghost",
      on: {
        click: () => {
          seed = (seed + 1) >>> 0;
          seedInput.value = String(seed);
          try {
            localStorage.setItem("exponenciales:seed", String(seed));
          } catch {}
          newChallenge();
        },
      },
    },
    chalkIcon("reset"),
    " Otro reto",
  );

  const newChallenge = () => {
    const requested =
      typeSelect.value === "aleatorio" ? null : typeSelect.value;
    current = makeChallenge(seed, requested);
    mount(prompt, ...inlineMathNodes(current.prompt));
    meta.textContent = `Tipo: ${current.type.replaceAll("_", " ")} · Semilla ${fmt(seed)}`;
    input.value = "";
    preview.textContent = "Interpretado como: —";
    feedback.textContent = "";
    hintText.hidden = true;
    solution.hidden = true;
    hintStep = 0;
  };

  seedInput.addEventListener("change", () => {
    seed = Number(seedInput.value) >>> 0;
    seedInput.value = String(seed);
    try {
      localStorage.setItem("exponenciales:seed", String(seed));
    } catch {}
    newChallenge();
  });

  typeSelect.addEventListener("change", newChallenge);
  input.addEventListener("input", () => {
    preview.textContent = `Interpretado como: ${input.value.trim() || "—"}`;
  });

  mount(
    root,
    h(
      "section",
      { class: "exp-trainer pr-trainer" },
      h("h3", null, "Entrenador infinito por semilla PRNG"),
      h("div", { class: "exp-widget__controls pr-widget__controls" }, seedLabel, typeLabel, randomizeBtn, copySeedBtn),
      meta,
      prompt,
      h(
        "label",
        { class: "exp-control pr-control" },
        h("span", null, "Tu respuesta"),
        input,
      ),
      preview,
      h("div", { class: "exp-check__actions pr-check__actions" }, revise, hint, reveal, next),
      feedback,
      hintText,
      solution,
    ),
  );

  newChallenge();
}

/**
 * Inicializa el módulo de retos en el contenedor proporcionado.
 */
export function initRetosModule(
  root = document.querySelector("#exp-challenges") || document.querySelector("#pr-challenges"),
) {
  if (!root) return;

  const panels = [
    h("section", {
      class: "exp-challenge-panel pr-challenge-panel",
      id: "exp-trainer-panel",
      role: "tabpanel",
      "aria-labelledby": "exp-tab-1",
    }),
    h("section", {
      class: "exp-challenge-panel pr-challenge-panel",
      id: "exp-traps-panel",
      role: "tabpanel",
      "aria-labelledby": "exp-tab-2",
      hidden: true,
    }),
  ];

  const labels = [
    "1. Entrenador Infinito por Semilla PRNG",
    "2. Las 5 Trampas Clásicas de Examen",
  ];

  const tabs = labels.map((label, index) => {
    const button = h(
      "button",
      {
        type: "button",
        class: `chip exp-chapter-tab pr-chapter-tab${index === 0 ? " is-active" : " chip--ghost"}`,
        role: "tab",
        id: `exp-tab-${index + 1}`,
        "aria-controls": panels[index].id,
        "aria-selected": String(index === 0),
        tabindex: index === 0 ? "0" : "-1",
      },
      label,
    );
    button.addEventListener("click", () => {
      tabs.forEach((tab, tabIndex) => {
        const active = tabIndex === index;
        tab.classList.toggle("is-active", active);
        tab.classList.toggle("chip--ghost", !active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[tabIndex].hidden = !active;
      });
    });
    return button;
  });

  mount(
    root,
    h(
      "div",
      {
        class: "exp-chapter-tabs pr-chapter-tabs",
        role: "tablist",
        "aria-label": "Práctica y trampas de examen",
      },
      tabs,
    ),
    ...panels,
  );

  createTrainer(panels[0]);
  createTraps(panels[1]);
}
