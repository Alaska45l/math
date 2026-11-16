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

import { h, mount, clear, chalkIcon } from "../../core/dom.js";
import { fmt, frac } from "../../core/math-format.js";
import { playScript } from "../../core/vn.js";
import { diagnoseExp } from "./logic.js";
import { DIAGNOSE_REACTIONS, STREAK_REACTIONS } from "./vn-scripts.js";
import { saveProgress, getCompetencyReport } from "./components.js";
import { recordExpAttempt } from "./learning-adapter.js";
import { parseIntervalExactas, equivalentExp } from "./expr.js";
import { getCompetencyById } from "./competencies-map.js";
import { selectAdaptiveExercise } from "../../core/learning/exercise-selector.js";
import {
  generateTransferChallenge,
  recordTransferAttempt,
  normalizeTransferAnswer,
  validateTransferAnswer,
} from "../../core/learning/transfer.js";

export const CHALLENGE_TYPES = [
  "razon_tabla_vs_salto",
  "evaluacion_k_a_x",
  "densidad_potencia_racional",
  "espejo_base_inversa",
  "reconstruccion_dos_puntos",
  "modelo_tiempo_compuesto",
  "asintota_imagen_desplazamiento",
  "ecuacion_igualacion_factor_comun",
  "formula_desde_dos_puntos",
  "imagen_intervalo_asintota",
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
export function makeChallenge(seed, requestedType = null, problemIndex = 0) {
  const subSeed = problemIndex === 0 ? (seed >>> 0) : ((seed + problemIndex * 7919 + 1013) >>> 0);
  const rng = mulberry32(subSeed);
  const typeIndex = int(rng, 0, CHALLENGE_TYPES.length - 1);
  let type;
  const isSpecificType =
    requestedType &&
    requestedType !== "aleatorio" &&
    requestedType !== "all" &&
    CHALLENGE_TYPES.includes(requestedType);

  if (isSpecificType) {
    type = requestedType;
  } else if (problemIndex === 0) {
    type = CHALLENGE_TYPES[typeIndex];
  } else {
    const baseRng = mulberry32(seed >>> 0);
    const baseTypeIndex = int(baseRng, 0, CHALLENGE_TYPES.length - 1);
    const chosenIndex = (baseTypeIndex + problemIndex) % CHALLENGE_TYPES.length;
    type = CHALLENGE_TYPES[chosenIndex];
  }
  const common = { seed, problemIndex, totalProblems: 8, type, vars: {} };

  const cases = {
    razon_tabla_vs_salto() {
      const variant = int(rng, 1, 3);
      const k = int(rng, 2, 5);
      const a = int(rng, 2, 4);

      if (variant === 1) {
        // Subvariante 1: Paso estándar Δx = 1
        const y0 = k;
        const y1 = k * a;
        const y2 = k * a * a;
        const y3 = k * a * a * a;
        const linearDiff = y1 - y0;
        return {
          ...common,
          competencyId: "exponentials.tables_additive_vs_multiplicative",
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
            `Comprobá que esa división se mantenga constante calculando ${y2} / ${y1} y ${y1} / ${y0}. No restes los valores.`,
            "Ese cociente constante y_(i+1) / y_i entre términos consecutivos es exactamente la base exponencial buscada.",
          ],
          solution: [
            "En una función exponencial con paso Δx = 1, la razón multiplicativa es a = y_(i+1) / y_i.",
            `Dividimos los dos primeros valores: ${y1} / ${y0} = ${a}.`,
            `Verificamos con los siguientes términos: ${y2} / ${y1} = ${a} y ${y3} / ${y2} = ${a}. La respuesta es ${a}.`,
          ],
        };
      } else if (variant === 2) {
        // Subvariante 2: Incrementos no uniformes en x (Δx = 2)
        const y0 = k;
        const y1 = k * a * a;
        const y2 = k * a * a * a * a;
        const y3 = k * a * a * a * a * a * a;
        const rowRatio = a * a;
        const linearDiff = y1 - y0;
        return {
          ...common,
          competencyId: "exponentials.tables_additive_vs_multiplicative",
          prompt: `En una tabla con paso constante Δx = 2: (0, ${y0}), (2, ${y1}), (4, ${y2}), (6, ${y3}), el factor entre renglones consecutivos es a^(Δx) = ${rowRatio}. ¿Cuál es la base unitaria a de la función f(x) = k · aˣ?`,
          answer: a,
          displayAnswer: fmt(a),
          spec: {
            problemType: "table",
            type: "table",
            expected: a,
            ratio: a,
            linearDiff,
            deltaX: 2,
            rowRatio,
            context: "base unitaria paso 2",
          },
          hints: [
            `Observá que x avanza de a 2 unidades (Δx = 2). Cada paso de renglón multiplica por a² = ${rowRatio}.`,
            `Para hallar la base unitaria a correspondiente a un solo paso Δx = 1, calculá la raíz cuadrada: a = (${rowRatio})^(1/2).`,
            "Calculá la raíz cuadrada del factor de renglón para obtener la razón multiplicativa por unidad.",
          ],
          solution: [
            `Como Δx = 2, la razón entre renglones consecutivos responde a a^(Δx) = a² = ${y1} / ${y0} = ${rowRatio}.`,
            `Despejamos la base unitaria extrayendo raíz cuadrada: a = √${rowRatio} = ${a}.`,
            `La base unitaria es a = ${a}.`,
          ],
        };
      } else {
        // Subvariante 3: Reconstrucción inversa desde la fórmula
        return {
          ...common,
          competencyId: "exponentials.tables_additive_vs_multiplicative",
          prompt: `Dada la fórmula f(x) = ${k} · ${a}ˣ, si se construye una tabla con paso constante Δx = 1, ¿qué razón multiplicativa constante y_(i+1) / y_i debe observarse entre filas consecutivas?`,
          answer: a,
          displayAnswer: fmt(a),
          spec: {
            problemType: "table",
            type: "table",
            expected: a,
            ratio: a,
            linearDiff: k * (a - 1),
            context: "reconstruccion inversa formula a tabla",
          },
          hints: [
            "En f(x) = k · aˣ, el parámetro a representa la razón de multiplicación por cada incremento unitario Δx = 1.",
            `Evaluá el cociente teórico f(x+1) / f(x) = (${k} · ${a}^(x+1)) / (${k} · ${a}ˣ).`,
            "Simplificá el cociente cancelando el coeficiente inicial y restando los exponentes de la base unitaria.",
          ],
          solution: [
            `Planteamos el cociente entre dos valores consecutivos: f(x+1) / f(x) = (${k} · ${a}^(x+1)) / (${k} · ${a}ˣ).`,
            `Cancelamos k = ${k} y restamos exponentes: a^(x+1−x) = a¹ = ${a}.`,
            `La razón multiplicativa en la tabla es exactamente la base a = ${a}.`,
          ],
        };
      }
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
        competencyId: "exponentials.neutral_and_order_of_operations",
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
          `Multiplicá ahora la escala inicial ${k} por el valor calculado de la potencia para obtener f(${x}).`,
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
        competencyId: "exponentials.rational_density_and_base_restrictions",
        prompt: `Evaluá f(1/2) para la función f(x) = ${k} · ${base}ˣ en ℝ, expresando el exponente fraccionario como radical.`,
        answer: correctVal,
        displayAnswer: fmt(correctVal),
        spec: { expected: correctVal, base, k, exponent: 0.5 },
        hints: [
          "Recordá que elevar a la 1/2 equivale a calcular la raíz cuadrada principal del número: a^(1/2) = √a.",
          `Calculá la raíz cuadrada principal de ${base}: √${base} = ${root}.`,
          `Multiplicá ahora el coeficiente inicial ${k} por el valor de la raíz calculada en el paso anterior (${root}).`,
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
        competencyId: "exponentials.base_reflection_and_asymptote",
        prompt: `Aplicá la simetría de base inversa (1/${b})ˣ = ${b}⁻ˣ para calcular el valor exacto de (1/${b})⁻${m}.`,
        answer: correctVal,
        displayAnswer: fmt(correctVal),
        spec: { expected: correctVal, b, m },
        hints: [
          "Invertir la base fraccionaria cambia el signo del exponente: (1/b)⁻ᵐ = bᵐ.",
          `Al dar vuelta la fracción 1/${b}, el exponente pasa de −${m} a +${m}: nos queda ${b}^${m}.`,
          `Calculá la potencia entera positiva resultante ${b}^${m} tras invertir la base fraccionaria.`,
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
        competencyId: "exponentials.four_quadrants_monotonicity",
        competencyIds: [
          "exponentials.four_quadrants_monotonicity",
          "exponentials.analytical_reconstruction_two_points",
        ],
        prompt: `Una función exponencial f(x) = k · aˣ pasa por los puntos P(1; ${y1}) y Q(2; ${y2}). Hallá el valor de f(3).`,
        answer: y3,
        displayAnswer: fmt(y3),
        spec: { expected: y3, k, a },
        hints: [
          "Dividí las ordenadas de los puntos dados para cancelar k: f(2) / f(1) = a^(2−1) = a.",
          `${y2} / ${y1} = ${a}, por lo que la base es a = ${a}. Luego hallá k usando P(1; ${y1}): k · ${a} = ${y1} ⟹ k = ${k}.`,
          `Con la fórmula f(x) = ${k} · ${a}ˣ deducida, calculá el valor final evaluando f(3) = ${k} · ${a}³.`,
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
        competencyId: "exponentials.time_models_rates_and_euler_base",
        prompt: `Una sustancia radiactiva de M₀ = ${M0} g tiene una vida media de T = ${T} minutos y sigue el modelo M(t) = ${M0} · (1/2)^(t/${T}). ¿Cuántos gramos quedan a los t = ${t} minutos?`,
        answer: correctVal,
        displayAnswer: fmt(correctVal),
        spec: { expected: correctVal, M0, T, t, context: "periodo tiempo compuesto" },
        hints: [
          "Calculá primero cuántas vidas medias transcurrieron dividiendo el tiempo total por el período: t / T.",
          `En t = ${t} minutos pasaron ${t} / ${T} = ${cycles} períodos completos. La fracción restante es (1/2)^${cycles} = 1/${divisor}.`,
          `Multiplicá la masa inicial ${M0} por la fracción de decaimiento (1/2)^${cycles} para hallar la masa restante.`,
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
        competencyId: "exponentials.shifts_and_horizontal_asymptote",
        prompt: `Para la función desplazada f(x) = ${k} · ${a}^(x−${hVal}) + ${c}, ¿cuál es el valor del ancla f(${hVal})?`,
        answer: anchorVal,
        displayAnswer: fmt(anchorVal),
        spec: { expected: anchorVal, k, a, h: hVal, c },
        hints: [
          "Al evaluar en x = h, el exponente de la base se anula: x − h = 0.",
          `Cualquier base positiva elevada a la cero vale uno: ${a}⁰ = 1.`,
          `Efectuá la suma final f(${hVal}) = ${k} · 1 + ${c} para determinar la ordenada del ancla.`,
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
        competencyId: "exponentials.equations_three_methods_in_reals",
        prompt: `Resolvé en ℝ sin usar logaritmos sacando factor común: 2^(x+1) + 2ˣ = ${rhs}. ¿Cuánto vale x?`,
        answer: m,
        displayAnswer: fmt(m),
        spec: { expected: m, m, rhs, context: "ecuacion factor comun" },
        hints: [
          "Desarmá 2^(x+1) como 2ˣ · 2¹ usando la propiedad del producto de potencias de igual base.",
          `Extraé 2ˣ de factor común: 2ˣ · (2 + 1) = ${rhs} ⟹ 2ˣ · 3 = ${rhs}.`,
          `Dividí por 3 ambos miembros para obtener 2ˣ = ${powerVal}, y buscá la potencia de 2 que iguala esa cantidad.`,
        ],
        solution: [
          `Descomponemos: 2^(x+1) + 2ˣ = 2ˣ · 2 + 2ˣ · 1 = 2ˣ · (2 + 1) = 2ˣ · 3.`,
          `Igualamos al miembro derecho y dividimos por 3: 2ˣ · 3 = ${rhs} ⟹ 2ˣ = ${powerVal}.`,
          `Como ${powerVal} = 2^${m}, por igualación de bases concluimos que x = ${m}.`,
        ],
      };
    },

    formula_desde_dos_puntos() {
      const allowNeg = int(rng, 0, 2) === 0; // ~33% con k < 0
      const kMag = int(rng, 2, 5);
      const k = allowNeg ? -kMag : kMag;
      const a = int(rng, 2, 4);

      const deltaX = int(rng, 1, 2); // Δx = 1 o Δx = 2
      const pX = int(rng, 0, 1);
      const qX = pX + deltaX;

      const pY = k * (a ** pX);
      const qY = k * (a ** qX);

      const ansStr = k < 0 ? `-${Math.abs(k)} * ${a}^x` : `${k} * ${a}^x`;
      const ratioY = qY / pY; // Siempre positivo porque sgn(pY) == sgn(qY)
      const diffExp = qX - pX;
      const testX = qX + 1;
      const testY = k * (a ** testX);

      return {
        ...common,
        competencyId: "exponentials.analytical_reconstruction_two_points",
        prompt: `Reconstruí la fórmula f(x) = k · aˣ que pasa por P(${pX}; ${pY}) y Q(${qX}; ${qY}) siguiendo los 5 pasos analíticos (plantear, dividir miembro a miembro, despejar a, hallar k y comprobar en un 3.er punto). Escribí la expresión algebraica (ej: ${k < 0 ? "-2 * 3^x" : "3 * 2^x"}).`,
        answer: ansStr,
        displayAnswer: `f(x) = ${k < 0 ? `−${Math.abs(k)}` : k} · ${a}ˣ`,
        spec: {
          k,
          a,
          expected: ansStr,
          expression: ansStr,
          problemType: "formula",
          context: "formula dos puntos",
        },
        hints: [
          `Paso 1: Planteá las dos ecuaciones: k · a^${pX} = ${pY} y k · a^${qX} = ${qY}.`,
          `Pasos 2 y 3: Dividí miembro a miembro para cancelar k: a^(${qX}−${pX}) = ${qY} / ${pY} = ${ratioY} ⟹ a = (${ratioY})^(1/${diffExp}).`,
          "Pasos 4 y 5: Reemplazá la base en cualquiera de los puntos conocidos para calcular k y escribí la expresión canónica k * a^x.",
        ],
        solution: [
          `Paso 1 y 2: Planteamos k · a^${pX} = ${pY} y k · a^${qX} = ${qY}. Dividiendo miembro a miembro: a^(${diffExp}) = ${qY}/${pY} = ${ratioY}.`,
          `Paso 3 y 4: Despejamos la base positiva a = ${a}. Sustituyendo en P: k · ${a}^${pX} = ${pY} ⟹ k = ${k}. La fórmula es f(x) = ${ansStr}.`,
          `Paso 5: Comprobamos en el 3.er punto x = ${testX}: f(${testX}) = ${k} · ${a}^${testX} = ${testY}. Coincide plenamente.`,
        ],
      };
    },

    imagen_intervalo_asintota() {
      const kChoices = [-3, -2, 2, 3];
      const k = kChoices[int(rng, 0, kChoices.length - 1)];
      const a = int(rng, 2, 3);
      const hVal = int(rng, 0, 2);
      const cChoices = [-4, -2, 1, 3, 4];
      const c = cChoices[int(rng, 0, cChoices.length - 1)];
      const expSign = hVal === 0 ? "x" : `(x−${hVal})`;
      const cSign = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
      const formulaStr = `f(x) = ${k} · ${a}^${expSign} ${cSign}`;
      const ansStr = k > 0 ? `(${c}; +inf)` : `(-inf; ${c})`;
      return {
        ...common,
        competencyId: "exponentials.full_analytical_study",
        competencyIds: [
          "exponentials.full_analytical_study",
          "exponentials.shifts_and_horizontal_asymptote",
        ],
        prompt: `Para la función ${formulaStr}, determiná el conjunto imagen en notación de intervalo Exactas UNMDP (usá ';' para separar extremos e 'inf' o '+inf' para infinito, ej: (2; +inf)).`,
        answer: ansStr,
        displayAnswer: `Im(f) = ${ansStr}`,
        spec: {
          c,
          asymptote: c,
          k,
          a,
          h: hVal,
          type: "image",
          target: "im",
          expected: ansStr,
        },
        hints: [
          `La función exponencial básica a^u es siempre estrictamente positiva: ${a}^${expSign} > 0 para todo x real.`,
          `Multiplicar por k = ${k} determina hacia dónde se abren las imágenes: como k ${k > 0 ? ">" : "<"} 0, los valores quedan ${k > 0 ? "por encima" : "por debajo"} del nivel asintótico.`,
          `El término independiente c = ${c} traslada la asíntota horizontal a la recta y = ${c}. La imagen nunca toca la asíntota (usá siempre paréntesis '(' o ')' para indicar la cota abierta).`,
        ],
        solution: [
          `La recta y = ${c} es la asíntota horizontal de la función desplazada.`,
          `Como la base exponencial es positiva y k = ${k} es ${k > 0 ? "positivo (k > 0)" : "negativo (k < 0)"}, los valores de la función son estrictamente ${k > 0 ? "mayores que" : "menores que"} ${c}.`,
          `Por lo tanto, el conjunto imagen en notación de intervalos es Im(f) = ${ansStr}.`,
        ],
      };
    },
  };

  const generator = cases[type] || cases.razon_tabla_vs_salto;
  const challenge = generator();
  const compDef = getCompetencyById(challenge.competencyId);
  return {
    ...challenge,
    family: challenge.family || challenge.type || type,
    prerequisiteIds: challenge.prerequisiteIds || (compDef?.prerequisiteIds ? [...compDef.prerequisiteIds] : []),
    representation: challenge.representation || 'symbolic',
    difficulty: challenge.difficulty || 2,
    stage: challenge.stage || 'transfer',
    transferDistance: challenge.transferDistance || 'near',
    diagnosticIds: challenge.diagnosticIds || (compDef?.diagnosticIds ? [...compDef.diagnosticIds] : []),
  };
}

export function makeChallenges(seed, requestedType = null, count = 8) {
  return Array.from({ length: count }, (_, i) => makeChallenge(seed, requestedType, i));
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

  let failStreak = 0;
  let successStreak = 0;
  const problemsState = {};

  const contrastPairs = [
    {
      label: "Salto aditivo vs razón multiplicativa",
      types: ["razon_tabla_vs_salto", "evaluacion_k_a_x"],
    },
    {
      label: "Ancla puntual vs Intervalo asintótico",
      types: ["asintota_imagen_desplazamiento", "imagen_intervalo_asintota"],
    },
    {
      label: "Reconstrucción numérica vs Fórmula analítica",
      types: ["reconstruccion_dos_puntos", "formula_desde_dos_puntos"],
    },
    {
      label: "Base inversa/espejo vs Balanza de ecuaciones",
      types: ["espejo_base_inversa", "ecuacion_igualacion_factor_comun"],
    },
  ];

  const seedInput = h("input", {
    type: "number",
    min: "0",
    step: "1",
    value: String(seed),
    class: "exp-seed-input",
    "aria-label": "Semilla del generador",
    style: { width: "120px" },
  });

  const typeSelect = h(
    "select",
    { "aria-label": "Familia de reto" },
    [
      ["aleatorio", "Todas las familias (Aleatorio)"],
      ["adaptativo", "Modo Inteligente (Recomendado por Alaska)"],
      ["contrastivo", "Modo Contrastivo (Pares conceptuales)"],
      ["transferencia", "Transferencia Inter-Módulo (Lineal vs. Exponencial vs. Cuadrática)"],
      ...CHALLENGE_TYPES.map((type) => [type, type.replaceAll("_", " ")]),
    ].map(([value, label]) => h("option", { value }, label)),
  );

  const seedField = h(
    "label",
    { class: "exp-trainer-field" },
    h("span", null, "Semilla PRNG"),
    seedInput,
  );

  const typeField = h(
    "label",
    { class: "exp-trainer-field exp-trainer-field--grow" },
    h("span", null, "Modo / Familia de reto"),
    typeSelect,
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
      class: "btn btn--ghost",
      "aria-label": "Nueva Semilla (Semilla aleatoria)",
      title: "Nueva Semilla (Semilla aleatoria)",
      on: {
        click: () => {
          seed = Math.floor(Math.random() * 1000000) >>> 0;
          seedInput.value = String(seed);
          try {
            localStorage.setItem("exponenciales:seed", String(seed));
          } catch {}
          renderCascade();
        },
      },
    },
    chalkIcon("reset"),
    " ↻ Nueva Semilla (Semilla aleatoria)",
  );

  const toolbarBtns = h(
    "div",
    { class: "exp-trainer-toolbar__btns" },
    randomizeBtn,
    copySeedBtn,
  );

  const progressPill = h("div", { class: "exp-trainer-progress-pill" });
  const meta = h("p", { class: "muted exp-muted pr-muted", style: { display: "none" } });

  const toolbar = h(
    "div",
    { class: "exp-trainer-toolbar" },
    seedField,
    typeField,
    toolbarBtns,
    progressPill,
  );

  const adaptiveNote = h("div", { class: "exp-challenge__adaptive-note", hidden: true });
  const cascadeList = h("ol", { class: "exp-challenges-cascade seq-check" });

  const updateProgressPill = () => {
    const solvedInSeed = [0, 1, 2, 3, 4, 5, 6, 7].filter(
      (i) => problemsState[`${seed}-${typeSelect.value}-${i}`]?.solved,
    ).length;
    progressPill.textContent = `Semilla actual (Semilla #${seed}): ${solvedInSeed}/8 resueltos`;
    meta.textContent = `Semilla actual (Semilla #${seed}): ${solvedInSeed}/8 resueltos`;
  };

  function createChallengeCard(current, problemIndex) {
    const pKey = `${seed}-${typeSelect.value}-${problemIndex}`;
    let hintStep = 0;
    let solutionRevealed = false;

    const badgeText = current._contrastBadge
      ? `Reto #${problemIndex + 1} (${current._contrastBadge})`
      : `Reto #${problemIndex + 1}`;
    const badgeEl = h("span", { class: "exp-challenge-card__badge" }, badgeText);

    let familyLabel = current.type.replaceAll("_", " ");
    if (current._contrastLabel) {
      familyLabel = current._contrastLabel;
    } else if (current._targetComp) {
      familyLabel = `Refuerza: ${current._targetComp.title}`;
    }
    const familyEl = h("span", { class: "exp-challenge-card__family" }, familyLabel);

    const statusEl = h("span", { class: "exp-challenge-card__status" }, "Pendiente");

    const headerEl = h(
      "div",
      { class: "exp-challenge-card__header" },
      badgeEl,
      familyEl,
      statusEl,
    );

    const promptEl = h("p", { class: "exp-challenge__prompt pr-challenge__prompt" });
    mount(promptEl, ...inlineMathNodes(current.prompt));

    let cardAdaptiveNote = null;
    if (typeSelect.value === "adaptativo" && current._targetComp) {
      const reasonText = current._selectionReason ? ` Alaska recomienda: ${current._selectionReason}` : "";
      cardAdaptiveNote = h(
        "div",
        { class: "exp-challenge__adaptive-note" },
        `Motivo de selección: Reforzar «${current._targetComp.title}» (pendiente de resolución independiente / se detectó confusión previa).${reasonText}`,
      );
    }

    const inputEl = h("input", {
      type: "text",
      inputmode: "text",
      autocomplete: "off",
      class: "pr-check-input exp-challenge-input",
      "aria-label": "Tu respuesta al reto",
      placeholder: "Tu respuesta...",
      style: { maxWidth: "360px" },
    });

    const previewEl = h(
      "p",
      { class: "exp-check__preview pr-check__preview", "aria-live": "polite" },
      "Interpretado como: —",
    );

    const inputRow = h(
      "div",
      { class: "exp-challenge-card__input-row" },
      h("label", { class: "exp-control pr-control" }, h("span", null, "Tu respuesta"), inputEl),
      previewEl,
    );

    const reviseBtn = h(
      "button",
      { type: "button", class: "btn" },
      chalkIcon("check"),
      " Revisar",
    );

    const hintBtn = h(
      "button",
      { type: "button", class: "btn btn--ghost" },
      chalkIcon("hint"),
      " Pista (0/3)",
    );

    const revealBtn = h(
      "button",
      { type: "button", class: "btn btn--ghost exp-solution-btn" },
      chalkIcon("book"),
      " Ver solución paso a paso",
    );

    const actionsEl = h(
      "div",
      { class: "exp-check__actions pr-check__actions" },
      reviseBtn,
      hintBtn,
      revealBtn,
    );

    const hintTextEl = h("p", { class: "exp-check__hint pr-check__hint", hidden: true });
    const feedbackEl = h("p", {
      class: "exp-check__feedback pr-check__feedback",
      "aria-live": "polite",
    });
    const solutionEl = h("div", { class: "exp-check__solution pr-check__solution", hidden: true });

    inputEl.addEventListener("input", () => {
      previewEl.textContent = `Interpretado como: ${inputEl.value.trim() || "—"}`;
    });

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        reviseBtn.click();
      }
    });

    reviseBtn.addEventListener("click", () => {
      const raw = inputEl.value.trim();
      if (!raw) {
        feedbackEl.textContent = "Ingresá una respuesta antes de revisar.";
        feedbackEl.className = "exp-check__feedback pr-check__feedback is-warning";
        return;
      }

      if (current.isTransfer) {
        const ok = validateTransferAnswer(current, raw).ok;
        if (ok) {
          const wasAssisted = hintStep > 0 || solutionRevealed;
          const mode = wasAssisted ? "assisted" : "independent";
          feedbackEl.textContent = `¡Correcto! ${current.explanation}`;
          feedbackEl.className = `exp-check__feedback pr-check__feedback is-correct is-${mode} check-feedback--${mode} state-solved`;
          recordTransferAttempt({
            moduleId: "exponenciales",
            exerciseId: current.id,
            competencyIds: current.competencyIds,
            correct: true,
            hintsUsed: hintStep,
            solutionRevealed: false,
            representation: current.representation || "symbolic",
          });
          inputEl.disabled = true;
          reviseBtn.disabled = true;
          revealBtn.disabled = true;
          hintBtn.disabled = true;
          statusEl.textContent = wasAssisted ? "Resuelto (Con apoyo)" : "Resuelto (Independiente)";
          statusEl.className = `exp-challenge-card__status ${wasAssisted ? "is-solved-assisted" : "is-solved-indep"}`;
          problemsState[pKey] = { solved: true, mode };
          updateProgressPill();
        } else {
          feedbackEl.textContent = "El resultado todavía no coincide. Revisá la justificación o pedí una pista.";
          feedbackEl.className = "exp-check__feedback pr-check__feedback is-error check-feedback--incorrect";
          recordTransferAttempt({
            moduleId: "exponenciales",
            exerciseId: current.id,
            competencyIds: current.competencyIds,
            correct: false,
            hintsUsed: hintStep,
            solutionRevealed: false,
            representation: current.representation || "symbolic",
          });
        }
        return;
      }

      const valNum = Number(raw.replace(",", "."));
      let isCorrect = typeof current.answer === "number" && Number.isFinite(valNum) && Math.abs(valNum - current.answer) < 1e-4;

      let intervalSyntaxError = null;
      if (!isCorrect && typeof current.answer === "string") {
        try {
          const expectedIv = parseIntervalExactas(current.answer);
          const userIv = parseIntervalExactas(raw);
          if (
            expectedIv &&
            userIv &&
            expectedIv.loOpen === userIv.loOpen &&
            expectedIv.hiOpen === userIv.hiOpen &&
            (expectedIv.lo === userIv.lo || Math.abs(expectedIv.lo - userIv.lo) < 1e-4) &&
            (expectedIv.hi === userIv.hi || Math.abs(expectedIv.hi - userIv.hi) < 1e-4)
          ) {
            isCorrect = true;
          }
        } catch (err) {
          if (err && err.code === "missing_semicolon") {
            intervalSyntaxError = "En Exactas los intervalos se separan con punto y coma ';' (la coma se reserva para decimales).";
          }
        }
        if (!isCorrect) {
          try {
            if (equivalentExp(raw, current.answer)) {
              isCorrect = true;
            }
          } catch {}
        }
      }

      const diagnosis = diagnoseExp(raw, {
        ...current.spec,
        expected: current.answer,
      });

      if (isCorrect) {
        const wasAssisted = hintStep > 0 || solutionRevealed;
        const mode = wasAssisted ? "assisted" : "independent";
        feedbackEl.textContent = wasAssisted
          ? `Correcto: ${current.displayAnswer}. Resuelto con apoyo (asistido).`
          : `Correcto: ${current.displayAnswer}. Resuelto de forma independiente.`;
        feedbackEl.className = `exp-check__feedback pr-check__feedback is-correct is-${mode} check-feedback--${mode} state-solved`;
        saveProgress("challenge:last", { seed, type: current.type, mode, solved: true });

        if (current.competencyId) {
          recordExpAttempt({
            exerciseId: `exp-reto-${current.type}-${problemIndex}`,
            competencyId: current.competencyId,
            correct: true,
            mode,
            hintsUsed: hintStep,
            solutionRevealed: false,
            diagnosticId: null,
            representation: current.representation || 'symbolic',
            stage: current.stage || 'transfer',
            transferDistance: current.transferDistance || 'near',
          });
        }

        inputEl.disabled = true;
        reviseBtn.disabled = true;
        revealBtn.disabled = true;
        hintBtn.disabled = true;

        statusEl.textContent = wasAssisted ? "Resuelto (Con apoyo)" : "Resuelto (Independiente)";
        statusEl.className = `exp-challenge-card__status ${wasAssisted ? "is-solved-assisted" : "is-solved-indep"}`;

        problemsState[pKey] = {
          solved: true,
          mode,
          userAnswer: raw,
          previewText: previewEl.textContent,
          feedbackText: feedbackEl.textContent,
          feedbackClass: feedbackEl.className,
          hintStep,
          hintText: hintTextEl.textContent,
          solutionRevealed: false,
        };

        updateProgressPill();

        if (wasAssisted) {
          if (failStreak > 0) {
            playScript([STREAK_REACTIONS.recovered]);
          }
        } else {
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
        }
        failStreak = 0;
      } else {
        successStreak = 0;
        failStreak++;
        const wasAssisted = hintStep > 0 || solutionRevealed;
        if (current.competencyId) {
          recordExpAttempt({
            exerciseId: `exp-reto-${current.type}-${problemIndex}`,
            competencyId: current.competencyId,
            correct: false,
            mode: wasAssisted ? "assisted" : "independent",
            hintsUsed: hintStep,
            solutionRevealed: false,
            diagnosticId: diagnosis?.id || null,
            representation: current.representation || 'symbolic',
            stage: current.stage || 'transfer',
            transferDistance: current.transferDistance || 'near',
          });
        }
        feedbackEl.textContent =
          diagnosis?.message ||
          intervalSyntaxError ||
          "Todavía no coincide. Consultá una pista y revisá las operaciones paso a paso.";
        feedbackEl.className = "exp-check__feedback pr-check__feedback is-error";

        problemsState[pKey] = {
          solved: false,
          mode: null,
          userAnswer: raw,
          previewText: previewEl.textContent,
          feedbackText: feedbackEl.textContent,
          feedbackClass: feedbackEl.className,
          hintStep,
          hintText: hintTextEl.textContent,
          solutionRevealed: false,
        };

        const id = diagnosis?.id;
        if (id && DIAGNOSE_REACTIONS[id]) {
          playScript([DIAGNOSE_REACTIONS[id]]);
        } else if (failStreak >= 2) {
          playScript([STREAK_REACTIONS.repeatedError]);
        }
      }
    });

    hintBtn.addEventListener("click", () => {
      hintStep = Math.min(3, hintStep + 1);
      hintBtn.replaceChildren(chalkIcon("hint"), ` Pista (${fmt(hintStep)}/3)`);
      hintTextEl.hidden = false;
      hintTextEl.textContent = `Pista ${fmt(hintStep)} de 3: ${current.hints[hintStep - 1]}`;

      if (!problemsState[pKey]) problemsState[pKey] = {};
      problemsState[pKey].hintStep = hintStep;
      problemsState[pKey].hintText = hintTextEl.textContent;

      playScript([
        {
          pose: ["base", "pensativa", "explicando"][hintStep - 1],
          tag: `Pista ${fmt(hintStep)} de 3`,
          html: current.hints[hintStep - 1],
        },
      ]);
    });

    revealBtn.addEventListener("click", () => {
      solutionRevealed = true;
      successStreak = 0;
      solutionEl.hidden = false;
      inputEl.disabled = true;
      reviseBtn.disabled = true;
      revealBtn.disabled = true;
      hintBtn.disabled = true;

      statusEl.textContent = "Resuelto (Con apoyo)";
      statusEl.className = "exp-challenge-card__status is-solution";

      if (current.isTransfer) {
        recordTransferAttempt({
          moduleId: "exponenciales",
          exerciseId: current.id,
          competencyIds: current.competencyIds,
          correct: true,
          hintsUsed: hintStep,
          solutionRevealed: true,
          representation: current.representation || "symbolic",
        });
        clear(solutionEl);
        solutionEl.appendChild(h("h4", null, "Solución explicada:"));
        solutionEl.appendChild(h("p", null, current.explanation));
        return;
      }

      if (current.competencyId) {
        recordExpAttempt({
          exerciseId: `exp-reto-${current.type}-${problemIndex}`,
          competencyId: current.competencyId,
          correct: true,
          mode: 'assisted',
          hintsUsed: hintStep,
          solutionRevealed: true,
          diagnosticId: null,
          representation: current.representation || 'symbolic',
          stage: current.stage || 'transfer',
          transferDistance: current.transferDistance || 'near',
        });
      }

      problemsState[pKey] = {
        solved: false,
        mode: null,
        userAnswer: inputEl.value,
        previewText: previewEl.textContent,
        feedbackText: "",
        feedbackClass: "",
        hintStep,
        hintText: hintTextEl.textContent,
        solutionRevealed: true,
      };

      mount(
        solutionEl,
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
    });

    const pState = problemsState[pKey];
    if (pState) {
      inputEl.value = pState.userAnswer || "";
      inputEl.disabled = !!pState.solved || !!pState.solutionRevealed;
      reviseBtn.disabled = !!pState.solved || !!pState.solutionRevealed;
      revealBtn.disabled = !!pState.solved || !!pState.solutionRevealed;
      hintBtn.disabled = !!pState.solved || !!pState.solutionRevealed;
      previewEl.textContent = pState.previewText || "Interpretado como: —";
      feedbackEl.textContent = pState.feedbackText || "";
      feedbackEl.className = pState.feedbackClass || "exp-check__feedback pr-check__feedback";
      hintStep = pState.hintStep || 0;
      hintBtn.replaceChildren(chalkIcon("hint"), ` Pista (${fmt(hintStep)}/3)`);
      solutionRevealed = !!pState.solutionRevealed;
      hintTextEl.hidden = !pState.hintText;
      hintTextEl.textContent = pState.hintText || "";
      solutionEl.hidden = !pState.solutionRevealed;
      if (pState.solved) {
        statusEl.textContent = pState.mode === "assisted" ? "Resuelto (Con apoyo)" : "Resuelto (Independiente)";
        statusEl.className = `exp-challenge-card__status ${pState.mode === "assisted" ? "is-solved-assisted" : "is-solved-indep"}`;
      } else if (pState.solutionRevealed) {
        statusEl.textContent = "Resuelto (Con apoyo)";
        statusEl.className = "exp-challenge-card__status is-solution";
        mount(
          solutionEl,
          h("strong", null, "Resolución paso a paso"),
          h(
            "ol",
            null,
            ...current.solution.map((step) =>
              h("li", null, ...inlineMathNodes(step)),
            ),
          ),
        );
      }
    }

    const card = h(
      "li",
      {
        class: `exp-challenge-card exp-challenge__item seq-check__card${pState?.solved ? " is-solved" : ""}`,
        "data-problem-index": String(problemIndex),
      },
      headerEl,
      promptEl,
      cardAdaptiveNote,
      inputRow,
      actionsEl,
      feedbackEl,
      hintTextEl,
      solutionEl,
    );

    return card;
  }

  function renderCascade() {
    clear(cascadeList);
    adaptiveNote.hidden = true;
    adaptiveNote.textContent = "";

    const requested = typeSelect.value === "aleatorio" ? null : typeSelect.value;
    let challenges = [];

    if (requested === "adaptativo") {
      const candidateFamilies = [
        { id: "razon_tabla_vs_salto", family: "razon_tabla_vs_salto", competencyId: "exponentials.tables_additive_vs_multiplicative" },
        { id: "evaluacion_k_a_x", family: "evaluacion_k_a_x", competencyId: "exponentials.neutral_and_order_of_operations" },
        { id: "densidad_potencia_racional", family: "densidad_potencia_racional", competencyId: "exponentials.rational_density_and_base_restrictions" },
        { id: "espejo_base_inversa", family: "espejo_base_inversa", competencyId: "exponentials.base_reflection_and_asymptote" },
        { id: "reconstruccion_dos_puntos", family: "reconstruccion_dos_puntos", competencyId: "exponentials.four_quadrants_monotonicity" },
        { id: "formula_desde_dos_puntos", family: "formula_desde_dos_puntos", competencyId: "exponentials.analytical_reconstruction_two_points" },
        { id: "modelo_tiempo_compuesto", family: "modelo_tiempo_compuesto", competencyId: "exponentials.time_models_rates_and_euler_base" },
        { id: "asintota_imagen_desplazamiento", family: "asintota_imagen_desplazamiento", competencyId: "exponentials.shifts_and_horizontal_asymptote" },
        { id: "imagen_intervalo_asintota", family: "imagen_intervalo_asintota", competencyId: "exponentials.full_analytical_study" },
        { id: "ecuacion_igualacion_factor_comun", family: "ecuacion_igualacion_factor_comun", competencyId: "exponentials.equations_three_methods_in_reals" },
      ];

      challenges = [];
      let prevCompId = null;
      for (let i = 0; i < 8; i++) {
        const selection = selectAdaptiveExercise({
          moduleId: "exponenciales",
          availableExercises: candidateFamilies,
          previousCompetencyId: prevCompId,
        });
        const chosenFam = selection.exercise?.family || "razon_tabla_vs_salto";
        const ch = makeChallenge(seed, chosenFam, i);
        ch._targetComp = getCompetencyById(selection.targetCompetencyId || selection.exercise?.competencyId);
        ch._selectionReason = selection.selectionReason;
        prevCompId = selection.targetCompetencyId || selection.exercise?.competencyId;
        challenges.push(ch);
      }

      adaptiveNote.hidden = false;
      const firstTitle = challenges[0]?._targetComp?.title || "Competencia clave";
      const firstReason = challenges[0]?._selectionReason || "Refuerzo adaptativo según tu progreso.";
      adaptiveNote.textContent = `Motivo de selección: Reforzar «${firstTitle}» (pendiente de resolución independiente / se detectó confusión previa). Alaska recomienda: ${firstReason}`;
    } else if (requested === "transferencia") {
      challenges = Array.from({ length: 8 }, (_, i) => {
        const ch = generateTransferChallenge(seed, "all", i);
        ch.isTransfer = true;
        ch.displayAnswer = ch.expected;
        ch.answer = ch.expected;
        return ch;
      });
      adaptiveNote.hidden = false;
      adaptiveNote.textContent = "Desafío de Transferencia Inter-Módulo: discriminación entre modelos Lineales, Exponenciales y Cuadráticos.";
    } else if (requested === "contrastivo") {
      challenges = Array.from({ length: 8 }, (_, i) => {
        const pairIdx = Math.floor(i / 2) % contrastPairs.length;
        const pair = contrastPairs[pairIdx];
        const subStep = i % 2; // 0 = A, 1 = B
        const stepLetter = subStep === 0 ? "A" : "B";
        const fam = pair.types[subStep];
        const ch = makeChallenge(seed, fam, i);
        ch._contrastBadge = `Par ${pairIdx + 1} ${stepLetter}`;
        ch._contrastLabel = `${pair.label} · Paso ${stepLetter}`;
        return ch;
      });
    } else {
      challenges = makeChallenges(seed, requested, 8);
    }

    challenges.forEach((current, idx) => {
      const card = createChallengeCard(current, idx);
      cascadeList.appendChild(card);
    });

    updateProgressPill();
  }

  seedInput.addEventListener("change", () => {
    seed = Number(seedInput.value) >>> 0;
    seedInput.value = String(seed);
    try {
      localStorage.setItem("exponenciales:seed", String(seed));
    } catch {}
    renderCascade();
  });

  seedInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      seedInput.dispatchEvent(new Event("change"));
    }
  });

  typeSelect.addEventListener("change", () => {
    renderCascade();
  });

  mount(
    root,
    h(
      "section",
      { class: "exp-trainer pr-trainer" },
      h("h3", null, "Entrenador infinito por semilla PRNG"),
      toolbar,
      adaptiveNote,
      meta,
      cascadeList,
    ),
  );

  renderCascade();
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

export const generateExpChallenge = makeChallenge;
export const generateExpChallenges = makeChallenges;
