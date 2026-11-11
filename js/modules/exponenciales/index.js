/**
 * index.js — Entrada principal del Laboratorio 7: Exponenciales.
 * Orquesta el controlador de pizarrones, widgets interactivos, chequeos conceptuales
 * y el motor de diálogo de Alaska.
 */

import { h, mount, qsa } from "../../core/dom.js";
import { renderNav, initLessonDock } from "../../core/nav.js";
import { initGlossary } from "../../core/glossary.js";
import {
  bindTutorButtons,
  mountCheckBlock,
  mountProgress,
  annotatedExpFormula,
  PROGRESS_KEY,
  getProgress,
  saveProgress,
  markSectionCompleted,
  recordCompetencyAttempt,
  getCompetencyReport,
  mountCompetencyDashboard,
} from "./components.js";
import {
  EXP_COMPETENCIES,
  EXP_DIAGNOSTIC_TAXONOMY,
  getCompetencyById,
  getCompetenciesForSection,
} from "./competencies-map.js";

function checkNum(val, expected, tol = 1e-6) {
  const s = String(val ?? "").trim().replace(",", ".");
  if (!s) return false;
  const n = Number(s);
  return Number.isFinite(n) && Math.abs(n - expected) < tol;
}

export const LESSON_SECTIONS = [
  {
    id: "sec-1",
    chapter: "Capítulo 1",
    title: "Detective de tablas: lineal vs. exponencial",
    short: "1 · Tablas",
  },
  {
    id: "sec-2",
    chapter: "Capítulo 1",
    title: "Cultivo de amebas: el neutro y k·aˣ ≠ (k·a)ˣ",
    short: "2 · Amebas",
  },
  {
    id: "sec-3",
    chapter: "Capítulo 2",
    title: "Puente al continuo y restricciones de la base",
    short: "3 · Continuo",
  },
  {
    id: "sec-4",
    chapter: "Capítulo 2",
    title: "Espejo de base y decaimiento radiactivo",
    short: "4 · Espejo",
  },
  {
    id: "sec-5",
    chapter: "Capítulo 2",
    title: "Los 4 cuadrantes (k, a) y monotonía",
    short: "5 · Cuadrantes",
  },
  {
    id: "sec-6",
    chapter: "Capítulo 3",
    title: "Reconstrucción analítica desde dos puntos",
    short: "6 · Dos Puntos",
  },
  {
    id: "sec-7",
    chapter: "Capítulo 3",
    title: "Modelos temporales, porcentajes y base e",
    short: "7 · Modelos",
  },
  {
    id: "sec-8",
    chapter: "Capítulo 4",
    title: "Desplazamientos y la trampa de la asíntota",
    short: "8 · Asíntotas",
  },
  {
    id: "sec-9",
    chapter: "Capítulo 4",
    title: "Radiografía analítica completa de la función exponencial",
    short: "9 · Radiografía",
  },
  {
    id: "sec-10",
    chapter: "Capítulo 4",
    title: "Balanza de ecuaciones sin logaritmos",
    short: "10 · Ecuaciones",
  },
  {
    id: "sec-retos",
    chapter: "Práctica y Repaso",
    title: "Entrenador Infinito y 5 Trampas de Examen",
    short: "11 · Práctica y trampas",
  },
  {
    id: "sec-repaso",
    chapter: "Práctica y Repaso",
    title: "Hoja de repaso de la unidad",
    short: "12 · Repaso",
  },
];

export const CHECKS_DATA = {
  "sec-1": [
    {
      id: "sec1-q1",
      competencyId: "exponentials.tables_additive_vs_multiplicative",
      prerequisiteIds: [],
      family: "razon_tabla_vs_salto",
      representation: "tabular",
      difficulty: 1,
      stage: "exploration",
      transferDistance: "near",
      diagnosticIds: ["linear_difference_instead_of_ratio"],
      type: "choice",
      prompt: "Inspeccioná la tabla (0, 5), (1, 10), (2, 15), (3, 20). Con Δx = 1 fijo, las diferencias verticales son 10 − 5 = 5, 15 − 10 = 5, 20 − 15 = 5. ¿Qué comportamiento describe?",
      options: [
        "Lineal, porque la diferencia Δy = +5 es constante",
        "Exponencial, porque los números terminan en 0 y 5",
        "Cuadrática, porque el crecimiento es rápido",
      ],
      expected: 0,
      spec: { problemType: "table", linearDiff: 5, deltas: [5, 5, 5], expected: 0 },
      diagnosis: "linear_difference_instead_of_ratio",
      diagnosisMessage: "Fijate que a cada paso se suma 5, no se multiplica por 5: 5 + 5 = 10, 10 + 5 = 15. Es aditivo.",
      hints: [
        "Calculá la resta y_{i+1} − y_i para cada paso: 10 − 5, 15 − 10 y 20 − 15.",
        "Como todas las restas dan exactamente +5, el salto vertical es siempre el mismo número aditivo.",
        "Una función que suma un valor fijo m a cada paso uniforme responde a y = mx + b: es una recta lineal.",
      ],
      solution: [
        "Calculamos las primeras diferencias: Δy = 10 − 5 = 5, 15 − 10 = 5, 20 − 15 = 5.",
        "La diferencia vertical es constante e igual a 5 para un Δx constante de 1.",
        "Conclusión: describe una función lineal f(x) = 5x + 5.",
      ],
    },
    {
      id: "sec1-q2",
      competencyId: "exponentials.tables_additive_vs_multiplicative",
      prerequisiteIds: [],
      family: "razon_tabla_vs_salto",
      representation: "tabular",
      difficulty: 2,
      stage: "guided_practice",
      transferDistance: "near",
      diagnosticIds: ["linear_difference_instead_of_ratio"],
      type: "number",
      prompt: "En la tabla (0, 2), (1, 6), (2, 18), (3, 54), calculá la razón constante multiplicativa a = y_{i+1} / y_i.",
      spec: { value: 3, expected: 3, ratio: 3, problemType: "table", deltas: [4, 12, 36], linearDiff: 4, context: "razon multiplicativa en tabla exponencial" },
      checkCorrect: (val) => checkNum(val, 3),
      hints: [
        "Dividí el segundo término por el primero: 6 / 2.",
        "Verificá el siguiente cociente: 18 / 6. ¿Da el mismo resultado?",
        "Efectuá la división del último paso 54 / 18 para confirmar la base exponencial constante.",
      ],
      solution: [
        "Calculamos los cocientes sucesivos: 6 / 2 = 3.",
        "Verificamos en los siguientes pasos: 18 / 6 = 3 y 54 / 18 = 3.",
        "La razón multiplicativa es a = 3.",
      ],
    },
    {
      id: "sec1-q3",
      competencyId: "exponentials.tables_additive_vs_multiplicative",
      prerequisiteIds: [],
      family: "razon_tabla_vs_salto",
      representation: "tabular",
      difficulty: 3,
      stage: "transfer",
      transferDistance: "near",
      diagnosticIds: ["linear_difference_instead_of_ratio"],
      type: "number",
      prompt: "Inspeccioná la tabla impostora (0, 1), (1, 2), (2, 4), (3, 7). Aunque los primeros 3 valores parecen duplicarse (1, 2, 4), el 4.° valor es 7. Calculá la segunda diferencia constante Δ²y = Δy_(i+1) − Δy_i que demuestra que se trata de un modelo cuadrático y descarta la duplicación exponencial.",
      spec: {
        value: 1,
        expected: 1,
        deltas: [1, 2, 3],
        secondDeltas: [1, 1],
        problemType: "table",
        context: "segunda diferencia en tabla impostora",
      },
      checkCorrect: (val) => checkNum(val, 1),
      hints: [
        "Calculá primero las diferencias consecutivas Δy entre salidas: 2 − 1, 4 − 2 y 7 − 4.",
        "Ahora restá esas diferencias consecutivas entre sí para hallar la tasa de aceleración vertical.",
        "Esa resta constante entre las variaciones sucesivas (Δ²y) confirma la curvatura cuadrática y descarta la duplicación exponencial.",
      ],
      solution: [
        "Calculamos las primeras diferencias verticales: Δy = 2 − 1 = 1, 4 − 2 = 2, 7 − 4 = 3.",
        "Calculamos las segundas diferencias: Δ²y = 2 − 1 = 1 y 3 − 2 = 1.",
        "Como Δ²y = 1 es constante con Δx = 1 regular, la tabla es cuadrática (y = 0,5x² + 0,5x + 1) y no exponencial 2ˣ.",
      ],
    },
  ],
  "sec-2": [
    {
      id: "sec2-q1",
      competencyId: "exponentials.neutral_and_order_of_operations",
      prerequisiteIds: ["exponentials.tables_additive_vs_multiplicative"],
      family: "evaluacion_k_a_x",
      representation: "symbolic",
      difficulty: 1,
      stage: "exploration",
      transferDistance: "near",
      diagnosticIds: [],
      type: "number",
      prompt: "En el cultivo de amebas f(x) = 3 · 2ˣ, calculá la cantidad inicial de amebas f(0) en el momento cero.",
      spec: { value: 3, expected: 3, k: 3, a: 2, x: 0, context: "neutro multiplicativo en f(0)" },
      checkCorrect: (val) => checkNum(val, 3),
      hints: [
        "Reemplazá x = 0 en la fórmula: f(0) = 3 · 2⁰.",
        "Recordá el neutro multiplicativo: todo número no nulo elevado a la cero vale 1.",
        "Efectuá el producto 3 · 1 para obtener la cantidad inicial en el instante cero.",
      ],
      solution: [
        "Evaluamos en x = 0: f(0) = 3 · 2⁰.",
        "Como 2⁰ = 1, tenemos f(0) = 3 · 1.",
        "La cantidad inicial es 3 amebas.",
      ],
    },
    {
      id: "sec2-q2",
      competencyId: "exponentials.neutral_and_order_of_operations",
      prerequisiteIds: ["exponentials.tables_additive_vs_multiplicative"],
      family: "evaluacion_k_a_x",
      representation: "symbolic",
      difficulty: 2,
      stage: "guided_practice",
      transferDistance: "near",
      diagnosticIds: ["multiplied_k_and_base"],
      type: "number",
      prompt: "Calculá la cantidad de amebas tras 3 horas: f(3) = 3 · 2³.",
      spec: { value: 24, expected: 24, k: 3, a: 2, x: 3, multipliedKandBase: 216, context: "evaluacion 3 * 2^3" },
      checkCorrect: (val) => checkNum(val, 24),
      hints: [
        "Por jerarquía de operaciones, calculá primero la potencia 2³.",
        "2³ = 2 · 2 · 2 = 8.",
        "Multiplicá ahora la escala inicial k = 3 por la potencia calculada para hallar f(3).",
      ],
      solution: [
        "Resolvemos primero la potencia: 2³ = 8.",
        "Multiplicamos por el coeficiente inicial k = 3: 3 · 8 = 24.",
        "A las 3 horas hay 24 amebas.",
      ],
    },
    {
      id: "sec2-q3",
      competencyId: "exponentials.neutral_and_order_of_operations",
      prerequisiteIds: ["exponentials.tables_additive_vs_multiplicative"],
      family: "jerarquia_k_a_x",
      representation: "verbal",
      difficulty: 3,
      stage: "retrieval",
      transferDistance: "near",
      diagnosticIds: ["multiplied_k_and_base"],
      type: "choice",
      prompt: "¿Por qué la expresión 3 · 2ˣ no puede reescribirse como 6ˣ?",
      options: [
        "Porque 3 y 2 son primos entre sí",
        "Porque la potencia tiene mayor jerarquía que la multiplicación: la x afecta sólo al 2",
        "Porque el 6 sólo se usa en bases pares",
      ],
      expected: 1,
      spec: { k: 3, a: 2, problemType: "hierarchy", expected: 1 },
      diagnosis: "multiplied_k_and_base",
      diagnosisMessage: "En álgebra, las potencias se resuelven antes que las multiplicaciones: 3 · 2ˣ ≠ (3 · 2)ˣ.",
      hints: [
        "Pensá en un valor concreto, por ejemplo x = 2: 3 · 2² = 3 · 4 = 12.",
        "En cambio 6² = 36. Como 12 ≠ 36, las expresiones no son equivalentes.",
        "El exponente x afecta únicamente a la base contigua 2, jamás al factor externo 3.",
      ],
      solution: [
        "En la jerarquía operativa formal, la potenciación precede a la multiplicación.",
        "En 3 · 2ˣ, el exponente actúa exclusivamente sobre 2.",
        "Para que fuera 6ˣ debería escribirse (3 · 2)ˣ, lo cual requeriría que el 3 también estuviese elevado a la x.",
      ],
    },
  ],
  "sec-3": [
    {
      id: "sec3-q1",
      competencyId: "exponentials.rational_density_and_base_restrictions",
      prerequisiteIds: ["exponentials.neutral_and_order_of_operations"],
      family: "densidad_racional",
      representation: "symbolic",
      difficulty: 1,
      stage: "guided_practice",
      transferDistance: "near",
      diagnosticIds: [],
      type: "number",
      prompt: "Para f(x) = 4 · 9ˣ, calculá el valor en x = 1/2 utilizando exponentes racionales: 4 · 9^(1/2).",
      spec: { value: 12, expected: 12, k: 4, a: 9, x: 0.5, context: "potencia fraccionaria 4 * 9^(1/2)" },
      checkCorrect: (val) => checkNum(val, 12),
      hints: [
        "Un exponente 1/2 equivale a la raíz cuadrada: 9^(1/2) = √9.",
        "Calculá √9 = 3.",
        "Efectuá el producto del coeficiente k = 4 por la raíz obtenida √9.",
      ],
      solution: [
        "Reescribimos la potencia racional: 9^(1/2) = √9 = 3.",
        "Multiplicamos por k = 4: 4 · 3 = 12.",
        "El valor en x = 1/2 es 12.",
      ],
    },
    {
      id: "sec3-q2",
      competencyId: "exponentials.rational_density_and_base_restrictions",
      prerequisiteIds: ["exponentials.neutral_and_order_of_operations"],
      family: "restriccion_base",
      representation: "verbal",
      difficulty: 2,
      stage: "retrieval",
      transferDistance: "near",
      diagnosticIds: ["invalid_base_restriction"],
      type: "choice",
      prompt: "¿Por qué en el conjunto de los números reales se exige estrictamente que la base a sea positiva (a > 0)?",
      options: [
        "Porque con base negativa a < 0, potencias como (−2)^(1/2) no tienen resultado real",
        "Porque las bases negativas son difíciles de graficar a mano",
        "Porque los números negativos no tienen potencias enteras",
      ],
      expected: 0,
      spec: { target: "base", param: "a", type: "base_restriction", expected: 0 },
      diagnosis: "invalid_base_restriction",
      diagnosisMessage: "Si a < 0, al tomar exponentes fraccionarios con denominador par caemos fuera de los números reales.",
      hints: [
        "Considerá a = −4 y evaluá en x = 1/2: (−4)^(1/2) = √(−4).",
        "En el conjunto de los números reales ℝ no existe raíz de índice par de un número negativo.",
        "Para que la función exponencial tenga dominio continuo en todo ℝ, la base debe ser positiva.",
      ],
      solution: [
        "Para extender el dominio a todos los números reales, debemos admitir exponentes racionales e irracionales.",
        "Si a < 0, cualquier exponente con denominador par genera raíces de números negativos, inexistentes en ℝ.",
        "Por lo tanto, se restringe a ∈ ℝ⁺ − {1}.",
      ],
    },
    {
      id: "sec3-q3",
      competencyId: "exponentials.rational_density_and_base_restrictions",
      prerequisiteIds: ["exponentials.neutral_and_order_of_operations"],
      family: "contraste_casos_degenerados",
      representation: "verbal",
      difficulty: 2,
      stage: "transfer",
      transferDistance: "near",
      diagnosticIds: ["invalid_base_restriction"],
      type: "choice",
      prompt: "En la definición analítica f(x) = k · aˣ se exige estrictamente a ∈ ℝ⁺ − {1} y k ≠ 0. ¿Qué objeto geométrico emerge en cada caso si se violan estas hipótesis (a = 1 o k = 0) y por qué analyzeExponential() lanza RangeError?",
      options: [
        "Si a = 1, la función degenera en la recta horizontal f(x) = k (pendiente m = 0); si k = 0, degenera en la función nula f(x) = 0 (el eje X). Ambas pierden el comportamiento exponencial, la asíntota y la inyectividad",
        "Si a = 1, la curva se vuelve vertical; si k = 0, la función se vuelve cuadrática parabólica",
        "Si a = 1 o k = 0, la curva se fractura en infinitos puntos aislados en los números complejos",
      ],
      expected: 0,
      spec: { target: "degenerate_cases", expected: 0, a_one: "constant_line", k_zero: "zero_function" },
      diagnosis: "invalid_base_restriction",
      diagnosisMessage: "Si a = 1 la función es la recta constante f(x) = k; si k = 0 es la recta nula f(x) = 0. Ambas son rectas horizontales degeneradas sin comportamiento exponencial.",
      hints: [
        "Evaluá qué le sucede a la expresión k · aˣ cuando reemplazás a = 1: 1 elevado a cualquier exponente x real da siempre 1.",
        "Evaluá qué sucede si multiplicás por k = 0: cero multiplicado por cualquier potencia real da exactamente 0 para todo x.",
        "Una recta horizontal no crece, no decrece, no tiene vida media ni se aproxima asintóticamente a otra recta: ya es la recta misma.",
      ],
      solution: [
        "Violación de a ≠ 1 (a = 1): f(x) = k · 1ˣ = k · 1 = k. Para cualquier x real la función devuelve la constante k: es una recta horizontal con pendiente m = 0, no una curva exponencial.",
        "Violación de k ≠ 0 (k = 0): f(x) = 0 · aˣ = 0. La función se anula idénticamente en toda la recta real (el eje X), teniendo infinitas raíces (C₀ = ℝ) y careciendo de semiplano de imagen.",
        "Por ello, analyzeExponential() valida a ≠ 1 y k ≠ 0 con RangeError: el objeto resultante deja de pertenecer a la familia exponencial y pasa a ser una recta degenerada.",
      ],
    },
  ],
  "sec-4": [
    {
      id: "sec4-q1",
      competencyId: "exponentials.base_reflection_and_asymptote",
      prerequisiteIds: ["exponentials.rational_density_and_base_restrictions"],
      family: "decaimiento_base",
      representation: "symbolic",
      difficulty: 1,
      stage: "exploration",
      transferDistance: "near",
      diagnosticIds: [],
      type: "number",
      prompt: "Para una sustancia que decae según f(x) = 100 · (1/2)ˣ, calculá la masa restante tras 2 períodos: f(2).",
      spec: { value: 25, expected: 25, k: 100, a: 0.5, x: 2, context: "decaimiento 100 * (1/2)^2" },
      checkCorrect: (val) => checkNum(val, 25),
      hints: [
        "Evaluamos en x = 2: f(2) = 100 · (1/2)².",
        "Calculá la potencia: (1/2)² = 1/4 = 0,25.",
        "Efectuá el producto 100 · (1/4) para calcular la masa restante.",
      ],
      solution: [
        "Calculamos la potencia fraccionaria: (1/2)² = 1/4.",
        "Multiplicamos por la masa inicial: 100 · (1/4) = 25.",
        "Tras 2 períodos quedan 25 unidades de masa.",
      ],
    },
    {
      id: "sec4-q2",
      competencyId: "exponentials.base_reflection_and_asymptote",
      prerequisiteIds: ["exponentials.rational_density_and_base_restrictions"],
      family: "simetria_exponente_negativo",
      representation: "symbolic",
      difficulty: 2,
      stage: "guided_practice",
      transferDistance: "near",
      diagnosticIds: [],
      type: "number",
      prompt: "Aplicá la simetría (1/a)ˣ = a⁻ˣ para calcular (1/3)⁻².",
      spec: { value: 9, expected: 9, b: 3, m: 2, context: "simetria (1/3)^(-2) = 3^2 = 9" },
      checkCorrect: (val) => checkNum(val, 9),
      hints: [
        "Por propiedad de las potencias de una fracción: (1/a)⁻ⁿ = aⁿ.",
        "Invertí la base fraccionaria y cambiá el signo del exponente: (1/3)⁻² = 3².",
        "Calculá la potencia entera positiva 3² tras invertir la base fraccionaria.",
      ],
      solution: [
        "Aplicamos la regla del exponente negativo sobre una fracción: (1/3)⁻² = (3/1)² = 3².",
        "Calculamos: 3² = 9.",
        "El resultado es 9.",
      ],
    },
    {
      id: "sec4-q3",
      competencyId: "exponentials.base_reflection_and_asymptote",
      prerequisiteIds: ["exponentials.rational_density_and_base_restrictions"],
      family: "asintota_horizontal",
      representation: "graphical",
      difficulty: 2,
      stage: "retrieval",
      transferDistance: "near",
      diagnosticIds: ["closed_bracket_on_asymptote"],
      type: "choice",
      prompt: "¿Cuál es la asíntota horizontal de f(x) = (1/2)ˣ?",
      options: [
        "x = 0",
        "y = 1/2",
        "y = 0",
      ],
      expected: 2,
      spec: { c: 0, asymptote: 0, target: "asymptote", expected: 2 },
      hints: [
        "Cuando x tiende a +∞, (1/2)ˣ se aproxima cada vez más a cero.",
        "La función se acerca indefinidamente a una recta sin tocarla nunca.",
        "Una recta horizontal a la que una curva se aproxima en el infinito es de la forma y = constante.",
      ],
      solution: [
        "A medida que x crece hacia +∞, (1/2)ˣ tiende a 0.",
        "La recta horizontal a la que la curva converge es y = 0.",
        "La asíntota horizontal es y = 0.",
      ],
    },
  ],
  "sec-5": [
    {
      id: "sec5-q1",
      competencyId: "exponentials.four_quadrants_monotonicity",
      prerequisiteIds: ["exponentials.base_reflection_and_asymptote"],
      family: "cuadrantes_k_negativo",
      representation: "symbolic",
      difficulty: 1,
      stage: "exploration",
      transferDistance: "near",
      diagnosticIds: [],
      type: "number",
      prompt: "Para g(x) = −3 · (1/2)ˣ, calculá g(0).",
      spec: { value: -3, expected: -3, k: -3, a: 0.5, x: 0, context: "g(0) con k negativo" },
      checkCorrect: (val) => checkNum(val, -3),
      hints: [
        "Evaluamos en x = 0: g(0) = −3 · (1/2)⁰.",
        "Cualquier número no nulo elevado a la cero da 1: (1/2)⁰ = 1.",
        "Efectuá el producto final −3 · 1 para obtener la imagen en el origen.",
      ],
      solution: [
        "Aplicamos la propiedad de la potencia cero: (1/2)⁰ = 1.",
        "Multiplicamos por k = −3: −3 · 1 = −3.",
        "La ordenada al origen es g(0) = −3.",
      ],
    },
    {
      id: "sec5-q2",
      competencyId: "exponentials.four_quadrants_monotonicity",
      prerequisiteIds: ["exponentials.base_reflection_and_asymptote"],
      family: "cuadrantes_k_negativo",
      representation: "symbolic",
      difficulty: 2,
      stage: "guided_practice",
      transferDistance: "near",
      diagnosticIds: [],
      type: "number",
      prompt: "Para la misma función g(x) = −3 · (1/2)ˣ, calculá g(1).",
      spec: { value: -1.5, expected: -1.5, k: -3, a: 0.5, x: 1, context: "g(1) = -3 * 0.5 = -1.5" },
      checkCorrect: (val) => checkNum(val, -1.5),
      hints: [
        "Evaluamos en x = 1: g(1) = −3 · (1/2)¹.",
        "(1/2)¹ = 0,5.",
        "Efectuá el producto −3 · 0,5 (o dividí −3 por 2) para obtener g(1).",
      ],
      solution: [
        "Evaluamos la potencia: (1/2)¹ = 1/2 = 0,5.",
        "Multiplicamos por −3: −3 · 0,5 = −1,5.",
        "El valor es g(1) = −1,5.",
      ],
    },
    {
      id: "sec5-q3",
      competencyId: "exponentials.four_quadrants_monotonicity",
      prerequisiteIds: ["exponentials.base_reflection_and_asymptote"],
      family: "monotonia_cuadrantes",
      representation: "verbal",
      difficulty: 3,
      stage: "interleaving",
      transferDistance: "far",
      diagnosticIds: ["ignored_negative_k_monotonicity"],
      type: "choice",
      prompt: "Como g(0) = −3 y g(1) = −1,5 (y −1,5 > −3), ¿es g(x) = −3 · (1/2)ˣ creciente o decreciente?",
      options: [
        "Estrictamente decreciente, porque la base a = 1/2 es menor que 1",
        "Estrictamente creciente, porque los valores de y aumentan al aumentar x",
        "Constante, porque los signos son negativos",
      ],
      expected: 1,
      spec: { k: -3, a: 0.5, expected: 1 },
      diagnosis: "ignored_negative_k_monotonicity",
      diagnosisMessage: "Al multiplicar por k < 0, el sentido de crecimiento se invierte: si la base decrece hacia 0, al multiplicarla por un negativo sube hacia 0.",
      hints: [
        "Compará los valores: en x = 0 vale −3; en x = 1 vale −1,5.",
        "En la recta real, −1,5 está a la derecha de −3 (es mayor).",
        "El factor negativo k < 0 refleja la gráfica respecto al eje horizontal e invierte la monotonía.",
      ],
      solution: [
        "Al avanzar x de 0 a 1, la función pasa de −3 a −1,5.",
        "Como −1,5 > −3, los valores de la función van subiendo hacia 0.",
        "Por lo tanto, g(x) = −3 · (1/2)ˣ es estrictamente creciente en todo ℝ.",
      ],
    },
  ],
  "sec-6": [
    {
      id: "sec6-q1",
      competencyId: "exponentials.analytical_reconstruction_two_points",
      prerequisiteIds: ["exponentials.four_quadrants_monotonicity"],
      family: "reconstruccion_dos_puntos",
      representation: "symbolic",
      difficulty: 1,
      stage: "guided_practice",
      transferDistance: "near",
      diagnosticIds: [],
      type: "number",
      prompt: "Una función exponencial f(x) = k · aˣ pasa por P(1; 6) y Q(3; 54). Siguiendo la secuencia analítica: (1) plantear k · a¹ = 6 y k · a³ = 54, (2) dividir miembro a miembro para cancelar k: a^(3−1) = 54 / 6 = 9. (3) Calculá la base unitaria a > 0 en ℝ.",
      spec: { value: 3, expected: 3, k: 2, a: 3, x1: 1, y1: 6, x2: 3, y2: 54, context: "despeje base dos puntos" },
      checkCorrect: (val) => checkNum(val, 3),
      hints: [
        "Dividí las salidas miembro a miembro para cancelar k: f(3) / f(1) = 54 / 6 = 9.",
        "Por propiedad de los exponentes: a³ / a¹ = a^(3−1) = a² = 9.",
        "Despejá la base unitaria positiva a = √9 en los números reales positivos.",
      ],
      solution: [
        "Planteamos el sistema: k · a¹ = 6 y k · a³ = 54.",
        "Dividimos miembro a miembro: (k · a³) / (k · a¹) = 54 / 6 ⟹ a² = 9.",
        "Despejamos la base en ℝ⁺: a = √9 = 3.",
      ],
    },
    {
      id: "sec6-q2",
      competencyId: "exponentials.analytical_reconstruction_two_points",
      prerequisiteIds: ["exponentials.four_quadrants_monotonicity"],
      family: "reconstruccion_dos_puntos",
      representation: "symbolic",
      difficulty: 2,
      stage: "guided_practice",
      transferDistance: "near",
      diagnosticIds: [],
      type: "number",
      prompt: "Continuando con el modelo que pasa por P(1; 6) y Q(3; 54) con base a = 3: (4) hallamos k sustituyendo en P(1; 6): k · 3¹ = 6 ⟹ k = 2, quedando f(x) = 2 · 3ˣ. (5) Comprobá el modelo calculando la imagen del 3.er punto medio f(2).",
      spec: { value: 18, expected: 18, k: 2, a: 3, x3: 2, context: "verificacion tercer punto f(2)" },
      checkCorrect: (val) => checkNum(val, 18),
      hints: [
        "La fórmula deducida es f(x) = 2 · 3ˣ.",
        "Evaluá en x = 2: f(2) = 2 · 3².",
        "Calculá la potencia 3² = 9 y multiplicala por k = 2 para obtener la ordenada del tercer punto.",
      ],
      solution: [
        "Sustituimos a = 3 en k · a¹ = 6: k · 3 = 6 ⟹ k = 2. La fórmula es f(x) = 2 · 3ˣ.",
        "Para comprobar en el tercer punto x = 2, calculamos f(2) = 2 · 3² = 2 · 9.",
        "f(2) = 18. Verificamos la progresión geométrica: P(1; 6) ─(×3)→ (2; 18) ─(×3)→ Q(3; 54).",
      ],
    },
    {
      id: "sec6-q3",
      competencyId: "exponentials.analytical_reconstruction_two_points",
      prerequisiteIds: ["exponentials.four_quadrants_monotonicity"],
      family: "reconstruccion_dos_puntos",
      representation: "symbolic",
      difficulty: 3,
      stage: "transfer",
      transferDistance: "near",
      diagnosticIds: ["ignored_negative_k_monotonicity"],
      type: "number",
      prompt: "Reconstruí analíticamente f(x) = k · aˣ con k < 0 sabiendo que pasa por P(1; −6) y Q(3; −54). Al dividir miembro a miembro (−54)/(−6) = 9 ⟹ a = 3 y k = −2, quedando f(x) = −2 · 3ˣ. Comprobá el modelo calculando f(2).",
      spec: { value: -18, expected: -18, k: -2, a: 3, x3: 2, context: "reconstruccion k negativo f(2) = -18" },
      checkCorrect: (val) => checkNum(val, -18),
      hints: [
        "Al dividir las ordenadas negativas, los signos menos se cancelan: (−54) / (−6) = +9 = a².",
        "La base es a = 3. Reemplazando en P(1; −6): k · 3¹ = −6 ⟹ k = −2.",
        "Efectuá el producto entre el coeficiente negativo k = −2 y 9 para verificar la ordenada en x = 2.",
      ],
      solution: [
        "Planteamos: k · a¹ = −6 y k · a³ = −54. Dividiendo: a² = (−54)/(−6) = 9 ⟹ a = 3.",
        "Hallamos k: k · 3 = −6 ⟹ k = −2. La fórmula es f(x) = −2 · 3ˣ.",
        "Comprobamos en x = 2: f(2) = −2 · 3² = −2 · 9 = −18. Como k < 0 y a > 1, la función decrece hacia −∞.",
      ],
    },
  ],
  "sec-7": [
    {
      id: "sec7-q1",
      competencyId: "exponentials.time_models_rates_and_euler_base",
      prerequisiteIds: ["exponentials.analytical_reconstruction_two_points"],
      family: "problema_inverso_tiempo",
      representation: "verbal",
      difficulty: 2,
      stage: "guided_practice",
      transferDistance: "near",
      diagnosticIds: ["inverted_period_exponent"],
      type: "number",
      prompt: "Una muestra de talio radiactivo tiene vida media de 3 minutos: M(t) = M₀ · (1/2)^(t/3). Si tras 6 minutos de decaimiento quedan exactamente 12,5 g, ¿cuál era la masa inicial M₀ (en gramos) en el instante t = 0?",
      spec: { value: 50, expected: 50, M: 12.5, t: 6, T: 3, cycles: 2, type: "inverse_period", context: "despeje M0: 12.5 = M0 * (1/4) => M0 = 50" },
      checkCorrect: (val) => checkNum(val, 50),
      hints: [
        "Calculá cuántas vidas medias transcurrieron: t / T = 6 / 3 = 2 ciclos.",
        "Planteá la ecuación hacia atrás: M(6) = M₀ · (1/2)² = M₀ · (1/4) = 12,5 g.",
        "Multiplicá la masa remanente 12,5 g por 4 para despejar el valor inicial M₀ antes del decaimiento.",
      ],
      solution: [
        "Calculamos el número de vidas medias transcurridas: t / T = 6 / 3 = 2 períodos.",
        "Planteamos la relación inversa: M(6) = M₀ · (1/2)² ⟹ 12,5 = M₀ · (1/4).",
        "Despejamos M₀ multiplicando por 4: M₀ = 12,5 · 4 = 50 g.",
      ],
    },
    {
      id: "sec7-q2",
      competencyId: "exponentials.time_models_rates_and_euler_base",
      prerequisiteIds: ["exponentials.analytical_reconstruction_two_points"],
      family: "contraste_tasas_porcentuales",
      representation: "verbal",
      difficulty: 2,
      stage: "exploration",
      transferDistance: "near",
      diagnosticIds: ["raw_percentage_as_base"],
      type: "choice",
      prompt: "Un activo financiero de valor P₀ sube un 10% en el primer período y luego cae un 10% en el segundo período. ¿Cuál es el factor acumulado final respecto a P₀ y por qué no vuelve a P₀?",
      options: [
        "0,99 · P₀, porque el −10% se aplica sobre la base mayor acumulada (1,10 · 0,90 = 0,99)",
        "1,00 · P₀, porque un aumento del +10% se compensa exactamente con una baja del −10%",
        "1,01 · P₀, porque la subida inicial siempre tiene más peso que la posterior bajada",
      ],
      expected: 0,
      spec: { rUp: 0.1, rDown: -0.1, compositeFactor: 0.99, type: "asymmetric_percentage", expected: 0 },
      diagnosis: "raw_percentage_as_base",
      diagnosisMessage: "Los porcentajes sucesivos no se suman algebraicamente (+10 − 10 = 0): se multiplican sus factores de acumulación 1,10 · 0,90 = 0,99.",
      hints: [
        "Expresá cada variación como factor multiplicativo: +10% es a₁ = 1 + 0,10 = 1,10; −10% es a₂ = 1 − 0,10 = 0,90.",
        "Multiplicá los factores sucesivos: P₂ = P₀ · 1,10 · 0,90.",
        "Efectuá el producto decimal 1,10 · 0,90 para hallar la proporción final respecto al capital inicial.",
      ],
      solution: [
        "El primer período el capital se multiplica por 1 + 0,10 = 1,10: P₁ = 1,10 · P₀.",
        "El segundo período cae un 10% sobre la nueva base: P₂ = 1,10 · P₀ · (1 − 0,10) = 1,10 · 0,90 · P₀.",
        "Como 1,10 · 0,90 = 0,99, el valor final es 0,99 · P₀ (una pérdida neta del 1% respecto al valor original).",
      ],
    },
    {
      id: "sec7-q3",
      competencyId: "exponentials.time_models_rates_and_euler_base",
      prerequisiteIds: ["exponentials.analytical_reconstruction_two_points"],
      family: "unidades_temporales_discreto_vs_continuo",
      representation: "verbal",
      difficulty: 3,
      stage: "transfer",
      transferDistance: "near",
      diagnosticIds: ["inverted_period_exponent"],
      type: "choice",
      prompt: "Compará el modelo discreto P(t) = P₀ · (1+r)^(t/T) con el continuo N(t) = N₀ · e^(kt). Si un cultivo tiene vida media T = 20 minutos y transcurren 2 horas completas, ¿cuál es el cálculo dimensionalmente coherente del exponente y la naturaleza del modelo?",
      options: [
        "Discreto con t/T = (2 · 60) / 20 = 120/20 = 6 ciclos, porque t y T deben estar en la misma unidad (minutos)",
        "Discreto con t/T = 2 / 20 = 0,1 ciclos, usando horas directamente sin convertir unidades",
        "Continuo con k = 20, porque la base natural e no requiere convertir unidades temporales",
      ],
      expected: 0,
      spec: { tHours: 2, tMinutes: 120, TMinutes: 20, cycles: 6, type: "unit_consistency_period", expected: 0 },
      diagnosis: "inverted_period_exponent",
      diagnosisMessage: "No podés dividir 2 horas por 20 minutos directamente: ambas cantidades deben expresarse en la misma unidad antes de calcular el cociente t/T.",
      hints: [
        "El tiempo transcurrido t y la duración del ciclo T deben expresarse en la misma magnitud física (ambos en minutos o ambos en horas).",
        "Convertí 2 horas a minutos multiplicando por 60: 2 · 60 = 120 minutos.",
        "Dividí las 120 horas convertidas por la duración de 20 minutos del período para hallar los ciclos completos.",
      ],
      solution: [
        "Para garantizar la coherencia dimensional, unificamos las unidades temporales a minutos: t = 2 h = 120 min.",
        "El número de períodos completos transcurridos es n = t / T = 120 / 20 = 6 ciclos.",
        "Conclusión: es un modelo discreto por períodos con exponente entero t/T = 6.",
      ],
    },
  ],
  "sec-8": [
    {
      id: "sec8-q1",
      competencyId: "exponentials.shifts_and_horizontal_asymptote",
      prerequisiteIds: ["exponentials.base_reflection_and_asymptote"],
      family: "imagen_trasladada",
      representation: "symbolic",
      difficulty: 2,
      stage: "guided_practice",
      transferDistance: "near",
      diagnosticIds: ["closed_bracket_on_asymptote"],
      type: "choice",
      prompt: "Para f(x) = 2 · 3^(x−1) + 4, ¿cuál es su conjunto imagen?",
      options: [
        "[4; +∞)",
        "(−∞; 4)",
        "(4; +∞)",
      ],
      expected: 2,
      spec: { c: 4, asymptote: 4, type: "image", target: "im", expected: 2 },
      diagnosis: "closed_bracket_on_asymptote",
      diagnosisMessage: "La curva se acerca indefinidamente a la asíntota y = 4 pero nunca llega a tocarla: el extremo debe ser abierto (con paréntesis).",
      hints: [
        "La potencia 3^(x−1) siempre es estrictamente positiva: 3^(x−1) > 0 para todo x ∈ ℝ.",
        "Al multiplicar por 2: 2 · 3^(x−1) > 0. Al sumar 4: f(x) > 4.",
        "Como k = 2 > 0, la curva está por encima de la asíntota: Im = (c; +∞).",
      ],
      solution: [
        "Como 3^(x−1) > 0 para todo x, el término 2 · 3^(x−1) es estrictamente mayor que 0.",
        "Por lo tanto, f(x) = 2 · 3^(x−1) + 4 > 4 para todo x real.",
        "El valor 4 es la asíntota horizontal y nunca se alcanza. Im(f) = (4; +∞).",
      ],
    },
    {
      id: "sec8-q2",
      competencyId: "exponentials.shifts_and_horizontal_asymptote",
      prerequisiteIds: ["exponentials.base_reflection_and_asymptote"],
      family: "anclaje_trasladado",
      representation: "graphical",
      difficulty: 1,
      stage: "exploration",
      transferDistance: "near",
      diagnosticIds: [],
      type: "number",
      prompt: "En la misma función f(x) = 2 · 3^(x−1) + 4, calculá el valor del punto de anclaje f(1).",
      spec: { value: 6, expected: 6, k: 2, a: 3, h: 1, c: 4, context: "f(1) = 2 * 3^0 + 4 = 6" },
      checkCorrect: (val) => checkNum(val, 6),
      hints: [
        "Reemplazá x = 1: f(1) = 2 · 3^(1−1) + 4.",
        "1 − 1 = 0, y 3⁰ = 1.",
        "Efectuá la suma final f(1) = 2 · 1 + 4 para obtener la ordenada del punto de anclaje.",
      ],
      solution: [
        "Evaluamos en x = 1: f(1) = 2 · 3⁰ + 4.",
        "Como 3⁰ = 1, tenemos 2 · 1 + 4.",
        "2 + 4 = 6. El punto de anclaje es (1; 6).",
      ],
    },
    {
      id: "sec8-q3",
      competencyId: "exponentials.shifts_and_horizontal_asymptote",
      prerequisiteIds: ["exponentials.base_reflection_and_asymptote"],
      family: "cota_asintota_abierta",
      representation: "verbal",
      difficulty: 3,
      stage: "retrieval",
      transferDistance: "near",
      diagnosticIds: ["closed_bracket_on_asymptote"],
      type: "choice",
      prompt: "¿Por qué la imagen de una exponencial desplazada f(x) = k · a^(x−h) + c NUNCA lleva corchete cerrado en la asíntota c?",
      options: [
        "Porque k · a^(x−h) jamás se anula en ℝ: la curva nunca toca la recta y = c",
        "Porque los corchetes sólo se usan en funciones racionales",
        "Porque el valor c no está definido en el plano cartesiano",
      ],
      expected: 0,
      spec: { c: -7, asymptote: -7, type: "image", target: "im", expected: 0 },
      diagnosis: "closed_bracket_on_asymptote",
      diagnosisMessage: "Una potencia real con base positiva nunca da 0, por lo que f(x) ≠ c para todo x.",
      hints: [
        "Para que f(x) = c, debería cumplirse k · a^(x−h) = 0.",
        "Una potencia aᵘ con a > 0 es estrictamente positiva para cualquier exponente u ∈ ℝ.",
        "Por eso, el valor c no pertenece a la imagen: el extremo debe ser estrictamente abierto con paréntesis.",
      ],
      solution: [
        "Para cualquier número real x, la potencia a^(x−h) > 0.",
        "Si k ≠ 0, el producto k · a^(x−h) nunca es igual a cero.",
        "En consecuencia, f(x) jamás alcanza el valor exacto c: la asíntota es un límite al infinito y su extremo es siempre abierto.",
      ],
    },
  ],
  "sec-9": [
    {
      id: "sec9-q1",
      competencyId: "exponentials.full_analytical_study",
      prerequisiteIds: ["exponentials.shifts_and_horizontal_asymptote"],
      family: "raiz_analitica",
      representation: "symbolic",
      difficulty: 2,
      stage: "guided_practice",
      transferDistance: "near",
      diagnosticIds: [],
      type: "number",
      prompt: "Para la función trasladada de examen f(x) = 2 − (1/2)ˣ, hallá su raíz real igualando a cero: 2 − (1/2)ˣ = 0. ¿Cuánto vale x?",
      spec: { value: -1, expected: -1, k: -1, a: 0.5, c: 2, context: "raiz 2 - (1/2)^x = 0 => x = -1" },
      checkCorrect: (val) => checkNum(val, -1),
      hints: [
        "Despejá la potencia: (1/2)ˣ = 2.",
        "Expresá ambos miembros en potencias de 2: (2⁻¹)ˣ = 2¹ ⟹ 2⁻ˣ = 2¹.",
        "Invertí el signo de la variable en la igualdad de exponentes para obtener el valor de la raíz real buscada.",
      ],
      solution: [
        "Igualamos a cero: 2 − (1/2)ˣ = 0 ⟹ (1/2)ˣ = 2.",
        "Como (1/2)ˣ = 2⁻ˣ, tenemos 2⁻ˣ = 2¹.",
        "Por igualdad de bases: −x = 1 ⟹ x = −1. El conjunto de ceros es C₀ = { −1 }.",
      ],
    },
    {
      id: "sec9-q2",
      competencyId: "exponentials.full_analytical_study",
      prerequisiteIds: ["exponentials.shifts_and_horizontal_asymptote"],
      family: "radiografia_sin_raiz_c0_vacio",
      representation: "symbolic",
      difficulty: 2,
      stage: "transfer",
      transferDistance: "near",
      diagnosticIds: ["closed_bracket_on_asymptote"],
      type: "choice",
      prompt: "Dada la función trasladada f(x) = 3 · 2ˣ + 1, ¿cuál es su conjunto de ceros C₀ y su conjunto de positividad C⁺?",
      options: [
        "C₀ = ∅ y C⁺ = ℝ, porque como k = 3 > 0 y c = 1 > 0, la imagen es (1; +∞) y la curva nunca corta al eje X",
        "C₀ = { −1/3 } y C⁺ = (−1/3; +∞), igualando la potencia 2ˣ a −1/3",
        "C₀ = { 0 } y C⁺ = (0; +∞), porque toda exponencial corta en su ordenada al origen",
      ],
      expected: 0,
      spec: { k: 3, a: 2, c: 1, c0: "vacio", cPos: "ℝ", expected: 0, context: "sin corte eje x: C0 = vacio, C+ = R" },
      diagnosis: "closed_bracket_on_asymptote",
      diagnosisMessage: "Una potencia real 2ˣ jamás puede dar un número negativo (−1/3): la ecuación no tiene solución real y la función es estrictamente positiva en todo ℝ.",
      hints: [
        "Igualá la fórmula a cero: 3 · 2ˣ + 1 = 0 ⟹ 3 · 2ˣ = −1 ⟹ 2ˣ = −1/3.",
        "En los números reales ℝ, una base positiva a > 0 elevada a cualquier exponente x es siempre estrictamente positiva: 2ˣ > 0.",
        "Al ser 2ˣ > 0 para todo x, tenemos f(x) > 1 > 0 en todo el dominio: la curva se mantiene estrictamente por encima del eje X.",
      ],
      solution: [
        "Al intentar hallar la raíz: 3 · 2ˣ + 1 = 0 ⟹ 2ˣ = −1/3.",
        "En el conjunto de los números reales ℝ, una potencia de base positiva es siempre estrictamente mayor que cero (2ˣ > 0). No existe ningún x ∈ ℝ tal que 2ˣ = −1/3.",
        "Conclusión: el conjunto de ceros es vacío (C₀ = ∅) y, al estar toda la curva por encima de la asíntota y = 1 > 0, el conjunto de positividad es todo ℝ (C⁺ = ℝ) y C⁻ = ∅.",
      ],
    },
    {
      id: "sec9-q3",
      competencyId: "exponentials.full_analytical_study",
      prerequisiteIds: ["exponentials.shifts_and_horizontal_asymptote"],
      family: "justificacion_imagen_signo_k",
      representation: "symbolic",
      difficulty: 3,
      stage: "transfer",
      transferDistance: "near",
      diagnosticIds: ["closed_bracket_on_asymptote"],
      type: "choice",
      prompt: "Para la función f(x) = −2 · 3ˣ − 4, ¿cómo se justifica analíticamente que su imagen sea (−∞; −4) y qué consecuencias tiene sobre su conjunto de negatividad C⁻?",
      options: [
        "Como 3ˣ > 0 y k = −2 < 0, el término −2 · 3ˣ es siempre negativo, haciendo que f(x) < −4; por ende Im = (−∞; −4) y C⁻ = ℝ",
        "Como k = −2 es negativo, la asíntota horizontal es y = 0 y la imagen lleva corchete cerrado en [−4; +∞)",
        "Como c = −4, la curva cruza el eje X en x = −4 y cambia de signo en ese punto",
      ],
      expected: 0,
      spec: { k: -2, a: 3, c: -4, image: "(-inf; -4)", cNeg: "ℝ", c0: "vacio", expected: 0 },
      diagnosis: "closed_bracket_on_asymptote",
      diagnosisMessage: "Al multiplicar la desigualdad 3ˣ > 0 por k = −2 < 0, el sentido de la desigualdad se invierte: −2 · 3ˣ < 0, ubicando toda la curva por debajo de la asíntota y = −4.",
      hints: [
        "Partí de la propiedad fundamental de la potencia: 3ˣ > 0 para todo x ∈ ℝ.",
        "Multiplicá ambos miembros por k = −2: al multiplicar por un negativo, se invierte la desigualdad: −2 · 3ˣ < 0.",
        "Restá 4 a ambos miembros: f(x) = −2 · 3ˣ − 4 < −4 para todo x, por lo que todos sus valores son estrictamente negativos.",
      ],
      solution: [
        "Para todo x real, 3ˣ > 0. Al multiplicar por k = −2 < 0, se invierte el sentido: −2 · 3ˣ < 0.",
        "Restamos 4: f(x) = −2 · 3ˣ − 4 < −4. Todos los valores están estrictamente por debajo de la asíntota horizontal y = −4.",
        "Conclusión: el conjunto imagen es Im(f) = (−∞; −4) con paréntesis abierto, y al ser todos los valores menores que −4 < 0, el conjunto de negatividad es C⁻ = ℝ y C₀ = ∅.",
      ],
    },
  ],
  "sec-10": [
    {
      id: "sec10-q1",
      competencyId: "exponentials.equations_three_methods_in_reals",
      prerequisiteIds: ["exponentials.full_analytical_study"],
      family: "decision_estrategica_ecuaciones",
      representation: "symbolic",
      difficulty: 2,
      stage: "exploration",
      transferDistance: "near",
      diagnosticIds: ["subtracted_exponents_without_parens"],
      type: "choice",
      prompt: "Antes de calcular, contrastá las dos ecuaciones de apariencia similar: (A) 2^(x+1) · 2ˣ = 32 frente a (B) 2^(x+1) + 2ˣ = 24. ¿Qué estrategia analítica corresponde aplicar a cada una según su conectiva operacional?",
      options: [
        "A la ecuación A (producto), igualación de bases sumando exponentes: 2^(2x+1) = 2⁵; a la B (suma), extracción de factor común: 2ˣ(2 + 1) = 24",
        "A ambas se les aplica sustitución cuadrática u = 2ˣ porque ambas contienen potencias de base 2",
        "A ambas se les suman los exponentes de las potencias por tener la misma base: 2^(2x+1) = 32 y 2^(2x+1) = 24",
      ],
      expected: 0,
      spec: { problemType: "contrastive_method_choice", target: "equation_structure", expected: 0 },
      diagnosis: "subtracted_exponents_without_parens",
      diagnosisMessage: "En un producto de potencias de igual base se suman exponentes; en una suma se extrae factor común, ¡jamás se suman exponentes en una suma!",
      hints: [
        "Observá la operación principal entre las potencias: en la primera hay una multiplicación (·) y en la segunda hay una suma (+).",
        "El producto de potencias de igual base permite sumar directamente sus exponentes en un único término: aᵘ · aᵛ = a^(u+v).",
        "En una suma de potencias no se pueden sumar exponentes; se requiere extraer la potencia menor 2ˣ como factor común distributivo.",
      ],
      solution: [
        "En 2^(x+1) · 2ˣ = 32 tenemos un producto de potencias de igual base 2: sumamos exponentes (x+1) + x = 2x+1, quedando 2^(2x+1) = 2⁵ ⟹ 2x + 1 = 5 ⟹ x = 2.",
        "En 2^(x+1) + 2ˣ = 24 tenemos una suma: descomponemos 2^(x+1) = 2ˣ · 2 y extraemos factor común 2ˣ(2 + 1) = 24 ⟹ 2ˣ · 3 = 24 ⟹ 2ˣ = 8 = 2³ ⟹ x = 3.",
        "Conclusión: el signo de la operación (producto vs suma) determina de forma unívoca la estrategia analítica (igualación de bases vs factor común).",
      ],
    },
    {
      id: "sec10-q2",
      competencyId: "exponentials.equations_three_methods_in_reals",
      prerequisiteIds: ["exponentials.full_analytical_study"],
      family: "ecuacion_bases_comunes",
      representation: "symbolic",
      difficulty: 3,
      stage: "guided_practice",
      transferDistance: "near",
      diagnosticIds: ["subtracted_exponents_without_parens"],
      type: "number",
      prompt: "Resolvé por igualación de bases: 2^(3x+1) : 16^(x−4) = 1. Llevá 16 a base 2 y hallá x.",
      spec: { value: 17, expected: 17, equation: "16^{x-4}", eq: "16", problemType: "quotient_equation", context: "ecuacion 2^(3x+1) : 16^(x-4) = 1 => x = 17" },
      checkCorrect: (val) => checkNum(val, 17),
      hints: [
        "Expresá 16 como potencia de 2: 16 = 2⁴, de modo que 16^(x−4) = (2⁴)^(x−4) = 2^(4x−16).",
        "En una división de potencias de igual base se restan los exponentes: 2^((3x+1) − (4x−16)) = 2⁰.",
        "¡Cuidado con el signo al distribuir el menos! (3x + 1) − (4x − 16) = 0 ⟹ 3x + 1 − 4x + 16 = 0. Despejá x de esa ecuación lineal resultante.",
      ],
      solution: [
        "Pasamos a base 2: 16^(x−4) = (2⁴)^(x−4) = 2^(4x−16).",
        "Cociente de igual base: 2^(3x+1 − (4x−16)) = 1 = 2⁰.",
        "Igualamos exponentes con paréntesis: 3x + 1 − 4x + 16 = 0 ⟹ −x + 17 = 0 ⟹ x = 17.",
      ],
    },
    {
      id: "sec10-q3",
      competencyId: "exponentials.equations_three_methods_in_reals",
      prerequisiteIds: ["exponentials.full_analytical_study"],
      family: "ecuacion_sustitucion_cuadratica",
      representation: "symbolic",
      difficulty: 3,
      stage: "transfer",
      transferDistance: "far",
      diagnosticIds: ["accepted_non_positive_u_in_substitution"],
      type: "choice",
      prompt: "Al aplicar la sustitución u = aˣ (con a > 0) a una ecuación exponencial, se obtienen las raíces auxiliares u de una cuadrática. De acuerdo con la condición de existencia en ℝ (u > 0), ¿en cuál de los siguientes escenarios el conjunto solución en la variable original x es rigurosamente VACÍO (S = ∅)?",
      options: [
        "Cuando ninguna raíz auxiliar es estrictamente positiva (ej. u₁ = −2, u₂ = −5, o u₁ = 0, u₂ = −3, o discriminante Δ < 0), ya que aˣ > 0 no admite soluciones negativas ni nulas",
        "Cuando una raíz auxiliar es positiva y la otra negativa (ej. u₁ = 4 y u₂ = −1), porque la raíz negativa invalida automáticamente toda la ecuación",
        "Cuando una raíz auxiliar es nula (u = 0) y la otra es positiva (u = 2), porque u = 0 absorbe a las demás soluciones",
      ],
      expected: 0,
      spec: { problemType: "quadratic_substitution", fourCases: true, rejectedRoots: [-1, 0], expected: 0 },
      diagnosis: "accepted_non_positive_u_in_substitution",
      diagnosisMessage: "Solo se descartan raíces u ≤ 0. Si ninguna raíz auxiliar es estrictamente mayor que cero (u > 0), el conjunto solución en x es S = ∅.",
      hints: [
        "La función exponencial canónica aˣ con a > 0 tiene como imagen el intervalo abierto (0; +∞): nunca es cero ni negativa.",
        "Cualquier raíz auxiliar u ≤ 0 (tanto valores negativos como el cero u = 0) debe descartarse porque carece de preimagen real en x.",
        "Si la resolvente sólo arroja raíces u ≤ 0 o complejas con discriminante negativo, ninguna rama auxiliar sobrevive para despejar la incógnita x.",
      ],
      solution: [
        "Condición de existencia: la sustitución u = aˣ exige u > 0 estricto en ℝ. Analizamos los 4 casos de la resolvente:",
        "Caso 1 (u₁, u₂ > 0): 2 soluciones reales en x. Caso 2 (u₁ > 0, u₂ ≤ 0): se descarta u₂, sobrevive 1 solución real. Caso 4 (u₁ > 0, u₂ = 0): u = 0 también se descarta (aˣ = 0 imposible en ℝ), sobrevive 1 solución real.",
        "Caso 3 (ninguna raíz u > 0 o Δ < 0): todas las raíces son descartadas por no pertenecer a (0; +∞), por lo que el conjunto solución en x es estrictamente vacío: S = ∅.",
      ],
    },
  ],
};

const WIDGETS = [
  ["detective-tablas", "./widgets/detective-tablas.js", "initDetectiveTablasWidget"],
  ["cultivo-amebas", "./widgets/cultivo-amebas.js", "initCultivoAmebasWidget"],
  ["puente-continuo", "./widgets/puente-continuo.js", "initPuenteContinuoWidget"],
  ["espejo-base", "./widgets/espejo-base.js", "initEspejoBaseWidget"],
  ["cuadrante-k-a", "./widgets/cuadrante-k-a.js", "initCuadranteKaWidget"],
  ["constructor-puntos", "./widgets/constructor-puntos.js", "initConstructorPuntosWidget"],
  ["reloj-semidesintegracion", "./widgets/reloj-semidesintegracion.js", "initRelojSemidesintegracionWidget"],
  ["explorador-asintota", "./widgets/explorador-asintota.js", "initExploradorAsintotaWidget"],
  ["radiografia-exp", "./widgets/radiografia-exp.js", "initRadiografiaExpWidget"],
  ["balanza-ecuaciones", "./widgets/balanza-ecuaciones.js", "initBalanzaEcuacionesWidget"],
];

export const activeWidgets = new Map();

export function initBlackboardController() {
  const content = document.querySelector(".seq-content");
  const page = document.querySelector(".exp-page, .pr-page");
  const sidebar = document.querySelector(".seq-sidebar");
  if (!content) return;

  const menuGlyph = String.fromCodePoint(0x2630);
  const closeGlyph = String.fromCodePoint(0x2715);

  // Barra de herramientas sticky del pizarrón
  const badge = h("span", {
    class: "seq-blackboard-toolbar__badge",
    id: "seq-board-badge",
  });
  const title = h("strong", { id: "seq-board-title" });
  const toggle = h(
    "button",
    { type: "button", class: "chip", id: "seq-mode-toggle" },
    "Pizarrón por lección (activo)",
  );
  const toolbar = h(
    "div",
    { class: "seq-blackboard-toolbar", id: "seq-board-toolbar" },
    h(
      "button",
      {
        type: "button",
        class: "chip exp-sidebar-toggle pr-sidebar-toggle",
        "data-sidebar-toggle": "true",
        "aria-controls": "exp-sidebar-index",
      },
      "Índice",
    ),
    h("div", { class: "seq-blackboard-toolbar__info" }, badge, title),
    h("div", { class: "seq-blackboard-toolbar__actions" }, toggle),
  );
  content.prepend(toolbar);
  initLessonDock();

  // 3. Control de la barra lateral (Sidebar)
  const sidebarToggle = toolbar.querySelector("[data-sidebar-toggle]");
  const sidebarClose = h(
    "button",
    {
      type: "button",
      class: "exp-sidebar-close pr-sidebar-close",
      "data-sidebar-close": "true",
      "aria-label": "Cerrar índice",
    },
    closeGlyph,
  );
  if (sidebar) {
    sidebar.id = "exp-sidebar-index";
    sidebar.prepend(sidebarClose);
  }

  const sidebarKey = "exponenciales:sidebar:v1";
  const setSidebar = (collapsed, persist = true) => {
    page?.classList.toggle("is-sidebar-collapsed", collapsed);
    sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
    sidebarToggle.textContent = collapsed
      ? `${menuGlyph} Índice`
      : "◀ Ocultar índice";
    if (persist) {
      try {
        localStorage.setItem(sidebarKey, collapsed ? "collapsed" : "open");
      } catch {
        // Ignorar si falla localStorage
      }
    }
  };

  let savedSidebar = null;
  try {
    savedSidebar = localStorage.getItem(sidebarKey);
  } catch {
    // Ignorar si falla localStorage
  }
  setSidebar(
    savedSidebar ? savedSidebar === "collapsed" : (typeof window !== "undefined" && window.innerWidth < 1280),
    false,
  );
  sidebarToggle?.addEventListener("click", () =>
    setSidebar(!page?.classList.contains("is-sidebar-collapsed")),
  );
  sidebarClose?.addEventListener("click", () => setSidebar(true));

  let focused = true;
  let current = "sec-1";

  const activate = (id, scroll = true) => {
    const index = LESSON_SECTIONS.findIndex((item) => item.id === id);
    if (index < 0) return;
    const activeSection = document.getElementById(id);
    current = id;
    LESSON_SECTIONS.forEach((item) =>
      document
        .getElementById(item.id)
        ?.classList.toggle("is-active", item.id === id),
    );
    qsa(".seq-sidebar__link[data-sec]").forEach((link) =>
      link.classList.toggle("is-active", link.dataset.sec === id),
    );
    badge.textContent = `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length}`;
    title.textContent = `${LESSON_SECTIONS[index].chapter} · ${LESSON_SECTIONS[index].title}`;
    if (scroll) {
      const target = focused ? content : activeSection;
      if (target && typeof window !== "undefined") {
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    }
  };

  toggle.addEventListener("click", () => {
    focused = !focused;
    content.classList.toggle("mode-blackboard", focused);
    toggle.textContent = focused
      ? "Pizarrón por lección (activo)"
      : "Pizarra continua (ver todo)";
    if (focused) activate(current);
  });

  // 4. Inyección de bandejas de tiza (.seq-chalk-tray) en cada pizarra
  LESSON_SECTIONS.forEach((item, index) => {
    const section = document.getElementById(item.id);
    if (!section) return;
    const previous = LESSON_SECTIONS[index - 1];
    const next = LESSON_SECTIONS[index + 1];
    const tray = h(
      "nav",
      { class: "seq-chalk-tray", "aria-label": "Navegación entre pizarrones" },
      previous
        ? h(
            "button",
            {
              type: "button",
              class: "chip seq-chalk-tray__btn",
              on: { click: () => activate(previous.id) },
            },
            `← ${previous.short}`,
          )
        : h("span", { class: "muted small" }, "Primer pizarrón"),
      h(
        "span",
        { class: "seq-chalk-tray__info" },
        `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length} · ${item.chapter}`,
      ),
      next
        ? h(
            "button",
            {
              type: "button",
              class: "btn seq-chalk-tray__btn",
              on: { click: () => activate(next.id) },
            },
            `${next.short} →`,
          )
        : h(
            "button",
            {
              type: "button",
              class: "btn seq-chalk-tray__btn",
              on: { click: () => activate("sec-1") },
            },
            "Volver al inicio ↑",
          ),
    );
    section.append(tray);
  });

  // 5. Enlaces de navegación en el sidebar
  qsa(".seq-sidebar__link[data-sec]").forEach((link) =>
    link.addEventListener("click", (event) => {
      if (!focused) return;
      event.preventDefault();
      activate(link.dataset.sec);
      if (typeof history !== "undefined") {
        history.replaceState(null, "", `#${link.dataset.sec}`);
      }
    }),
  );

  // 6. Atajos de teclado accesibles
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (event) => {
      if (
        !focused ||
        ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(
          document.activeElement?.tagName,
        )
      )
        return;
      if (!["ArrowRight", "PageDown", "ArrowLeft", "PageUp"].includes(event.key))
        return;
      const index = LESSON_SECTIONS.findIndex((item) => item.id === current);
      const next =
        index + (["ArrowRight", "PageDown"].includes(event.key) ? 1 : -1);
      if (LESSON_SECTIONS[next]) {
        event.preventDefault();
        activate(LESSON_SECTIONS[next].id);
      }
    });

    // 7. Sincronización de hash inicial
    const initial = location.hash.slice(1);
    activate(
      LESSON_SECTIONS.some((item) => item.id === initial) ? initial : "sec-1",
      false,
    );
    content.classList.add("mode-blackboard");
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
  }
}

// Bootstrap de la página en entorno de navegador
if (typeof document !== "undefined") {
  renderNav();

  // Inicialización de widgets interactivos disponibles
  for (const [name, modPath, fnName] of WIDGETS) {
    const hosts = document.querySelectorAll(`[data-widget="${name}"]`);
    if (hosts.length) {
      import(modPath)
        .then((mod) => {
          const fn = mod.initWidget || mod[fnName];
          if (typeof fn === "function") {
            hosts.forEach((host) => {
              try {
                const instance = fn(host);
                if (instance) activeWidgets.set(host, instance);
              } catch (err) {
                console.error(`[widget:${name}] initialization failed:`, err);
              }
            });
          }
        })
        .catch((err) => {
          console.warn(`[widget:${name}] could not load ${modPath}:`, err?.message || err);
        });
    }
  }

  // Montaje de bloques de chequeo conceptual (30 preguntas)
  for (const [sectionId, questions] of Object.entries(CHECKS_DATA)) {
    const host = document.querySelector(`[data-check="${sectionId}"]`);
    if (host) mountCheckBlock(host, questions, sectionId, mountProgress);
  }

  // Fórmulas matemáticas anotadas interactivas
  qsa(".exp-annotated-host, .pr-annotated-host").forEach((host) =>
    annotatedExpFormula(host, { sectionId: host.closest("section")?.id }),
  );

  bindTutorButtons();
  mountProgress();

  // Módulo de retos
  import("./retos.js")
    .then((mod) => {
      const challengesHost =
        document.querySelector("#exp-challenges") ||
        document.querySelector("#pr-challenges");
      if (typeof mod.initRetosModule === "function" && challengesHost) {
        mod.initRetosModule(challengesHost);
      }
    })
    .catch((err) => {
      console.warn("[retos] initialization failed:", err);
    });

  // Montaje del panel vivo de competencias en sec-repaso
  const dashboardHost = document.querySelector("#exp-competency-dashboard");
  if (dashboardHost) {
    mountCompetencyDashboard(dashboardHost, {
      onSelectSection: (sectionId) => {
        const link = document.querySelector(`.seq-sidebar__link[data-sec="${sectionId}"]`);
        if (link) link.click();
        else {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
        }
      },
      onPracticeCompetency: (competencyId) => {
        const retosLink = document.querySelector(`.seq-sidebar__link[data-sec="sec-retos"]`);
        if (retosLink) retosLink.click();
        else {
          document.getElementById("sec-retos")?.scrollIntoView({ behavior: "smooth" });
        }
        const trainerSelect = document.querySelector('#exp-challenges select[aria-label="Familia de reto"]');
        if (trainerSelect) {
          const compMap = {
            "exponentials.tables_additive_vs_multiplicative": "razon_tabla_vs_salto",
            "exponentials.neutral_and_order_of_operations": "evaluacion_k_a_x",
            "exponentials.rational_density_and_base_restrictions": "densidad_potencia_racional",
            "exponentials.base_reflection_and_asymptote": "espejo_base_inversa",
            "exponentials.four_quadrants_monotonicity": "evaluacion_k_a_x",
            "exponentials.analytical_reconstruction_two_points": "formula_desde_dos_puntos",
            "exponentials.time_models_rates_and_euler_base": "modelo_tiempo_compuesto",
            "exponentials.shifts_and_horizontal_asymptote": "imagen_intervalo_asintota",
            "exponentials.full_analytical_study": "imagen_intervalo_asintota",
            "exponentials.equations_three_methods_in_reals": "ecuacion_igualacion_factor_comun",
          };
          const targetFam = compMap[competencyId] || "adaptativo";
          trainerSelect.value = targetFam;
          trainerSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
      },
    });
  }

  initGlossary();
  initBlackboardController();
}

export { VN_SCRIPTS, DIAGNOSE_REACTIONS, STREAK_REACTIONS } from "./vn-scripts.js";
export {
  initRetosModule,
  CHALLENGE_TYPES,
  makeChallenge,
  makeChallenges,
  generateExpChallenge,
  generateExpChallenges,
  TRAPS,
  mulberry32,
} from "./retos.js";

export {
  EXP_COMPETENCIES,
  EXP_DIAGNOSTIC_TAXONOMY,
  EXP_COMPETENCIES as EXPONENTIALS_COMPETENCIES,
  EXP_DIAGNOSTIC_TAXONOMY as ERROR_TAXONOMY,
  EXP_DIAGNOSTIC_TAXONOMY as DIAGNOSTIC_TO_TAXONOMY,
  getCompetencyById,
  getCompetenciesForSection,
} from "./competencies-map.js";
export {
  PROGRESS_KEY,
  getProgress,
  saveProgress,
  markSectionCompleted,
  recordCompetencyAttempt,
  getCompetencyReport,
  mountCompetencyDashboard,
} from "./components.js";
