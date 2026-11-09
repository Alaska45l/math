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
      type: "number",
      prompt: "Para los puntos (0, 1), (1, 2), (2, 4), (3, 8) que siguen f(x) = 2ˣ, calculá el valor proyectado f(4).",
      spec: { value: 16, expected: 16, k: 1, a: 2, x: 4, problemType: "power", context: "evaluacion potencia 2^4" },
      checkCorrect: (val) => checkNum(val, 16),
      hints: [
        "En una progresión de duplicación, el siguiente término multiplica al anterior por 2.",
        "El término anterior en x = 3 vale 8. Multiplicá 8 · 2.",
        "Efectuá el producto reiterado f(4) = 2 · 2 · 2 · 2 para proyectar el cuarto término.",
      ],
      solution: [
        "La función exponencial es f(x) = 2ˣ.",
        "Para x = 4, evaluamos f(4) = 2⁴.",
        "2 · 2 · 2 · 2 = 16.",
      ],
    },
  ],
  "sec-2": [
    {
      id: "sec2-q1",
      competencyId: "exponentials.neutral_and_order_of_operations",
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
      type: "number",
      prompt: "Si la curva f(x) = k · aˣ corta al eje vertical en el punto (0, 5), ¿cuánto vale el parámetro k?",
      spec: { value: 5, expected: 5, k: 5, a: 1, x: 0, context: "ordenada al origen k" },
      checkCorrect: (val) => checkNum(val, 5),
      hints: [
        "El corte con el eje vertical ocurre en x = 0.",
        "Evaluamos: f(0) = k · a⁰ = k · 1 = k.",
        "Evaluá f(0) = k · a⁰ y deducí directamente la ordenada al origen.",
      ],
      solution: [
        "La ordenada al origen es el punto donde la curva corta al eje Y, es decir, f(0).",
        "f(0) = k · a⁰ = k · 1 = k.",
        "Como el punto es (0, 5), deducimos que k = 5.",
      ],
    },
  ],
  "sec-4": [
    {
      id: "sec4-q1",
      competencyId: "exponentials.base_reflection_and_asymptote",
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
      type: "number",
      prompt: "Una función exponencial f(x) = k · aˣ pasa por (1, 1) y (2, 3). Calculamos a = 3 y k = 1/3, es decir f(x) = (1/3) · 3ˣ. Calculá f(3).",
      spec: { value: 9, expected: 9, k: 1/3, a: 3, x: 3, context: "reconstruccion f(3) = (1/3)*3^3 = 9" },
      checkCorrect: (val) => checkNum(val, 9),
      hints: [
        "Reemplazá x = 3 en la fórmula: f(3) = (1/3) · 3³.",
        "Calculá la potencia: 3³ = 27.",
        "Efectuá el producto final f(3) = (1/3) · 27 para obtener el valor pedido.",
      ],
      solution: [
        "Evaluamos en x = 3: f(3) = (1/3) · 3³.",
        "3³ = 27.",
        "(1/3) · 27 = 9.",
      ],
    },
    {
      id: "sec6-q2",
      competencyId: "exponentials.analytical_reconstruction_two_points",
      type: "number",
      prompt: "Si una curva f(x) = k · aˣ pasa por (0, 4) y (1, 2), calculá f(2).",
      spec: { value: 1, expected: 1, k: 4, a: 0.5, x: 2, context: "f(2) = 4 * (1/2)^2 = 1" },
      checkCorrect: (val) => checkNum(val, 1),
      hints: [
        "Como pasa por (0, 4), el valor inicial es k = 4.",
        "En un paso de x = 0 a x = 1, la función pasa de 4 a 2: la razón es a = 2/4 = 1/2.",
        "Efectuá el producto f(2) = 4 · (1/4) para determinar el valor de la función.",
      ],
      solution: [
        "De (0, 4) deducimos k = 4.",
        "De (1, 2) deducimos a = f(1)/f(0) = 2/4 = 1/2. La fórmula es f(x) = 4 · (1/2)ˣ.",
        "Evaluamos en x = 2: f(2) = 4 · (1/2)² = 4 · (1/4) = 1.",
      ],
    },
    {
      id: "sec6-q3",
      competencyId: "exponentials.analytical_reconstruction_two_points",
      type: "number",
      prompt: "Si f pasa por (0, −3) y (2, −0,75), ¿cuánto vale f(1)?",
      spec: { value: -1.5, expected: -1.5, k: -3, a: 0.5, x: 1, context: "f(1) = -3 * 0.5 = -1.5" },
      checkCorrect: (val) => checkNum(val, -1.5),
      hints: [
        "De (0, −3) sabemos que k = −3.",
        "f(2)/f(0) = a² = −0,75 / −3 = 0,25 = 1/4. Como a > 0, a = 1/2.",
        "Efectuá la multiplicación −3 · (1/2) para obtener la ordenada en x = 1.",
      ],
      solution: [
        "k = −3 por la ordenada al origen.",
        "a² = (−0,75)/(−3) = 0,25 ⟹ a = √0,25 = 0,5 (ya que a > 0).",
        "f(1) = −3 · (0,5)¹ = −1,5.",
      ],
    },
  ],
  "sec-7": [
    {
      id: "sec7-q1",
      competencyId: "exponentials.time_models_rates_and_euler_base",
      type: "number",
      prompt: "Una sustancia de 50 g tiene vida media de 3 minutos: M(t) = 50 · (1/2)^(t/3). ¿Cuántos gramos quedan a los 6 minutos?",
      spec: { value: 12.5, expected: 12.5, M0: 50, T: 3, t: 6, period: 3, type: "period_count", context: "vida media 50 * (1/2)^2 = 12.5" },
      checkCorrect: (val) => checkNum(val, 12.5),
      hints: [
        "Calculá cuántas vidas medias pasaron: t/T = 6/3 = 2.",
        "Evaluamos: M(6) = 50 · (1/2)².",
        "Efectuá el cociente 50 / 4 para calcular la masa remanente luego de dos vidas medias.",
      ],
      solution: [
        "El exponente compuesto es t/3 = 6/3 = 2 períodos.",
        "M(6) = 50 · (1/2)² = 50 · (1/4).",
        "50 / 4 = 12,5 g.",
      ],
    },
    {
      id: "sec7-q2",
      competencyId: "exponentials.time_models_rates_and_euler_base",
      type: "number",
      prompt: "Si una población crece al 12% por período, ¿cuál es la base multiplicativa a = 1 + r?",
      spec: { value: 1.12, expected: 1.12, rate: 0.12, type: "growth_rate", context: "base 1 + r = 1 + 0.12 = 1.12" },
      checkCorrect: (val) => checkNum(val, 1.12),
      hints: [
        "Un aumento del 12% equivale a una tasa r = 0,12.",
        "La base de acumulación es el total más el aumento: a = 1 + r.",
        "Efectuá la suma 1 + 0,12 para obtener el factor de acumulación multiplicativo.",
      ],
      solution: [
        "El 12% expresado en decimal es r = 12/100 = 0,12.",
        "La base multiplicativa es a = 1 + r = 1 + 0,12.",
        "a = 1,12.",
      ],
    },
    {
      id: "sec7-q3",
      competencyId: "exponentials.time_models_rates_and_euler_base",
      type: "number",
      prompt: "Un cultivo crece cada 10 horas. ¿Cuántos períodos de 10 horas hay en 5 días completos (5 días = 120 horas)?",
      spec: { value: 12, expected: 12, period: 10, t: 120, type: "period_count", context: "120 / 10 = 12 periodos" },
      checkCorrect: (val) => checkNum(val, 12),
      hints: [
        "Convertí los 5 días a horas: 5 · 24 = 120 horas.",
        "Dividí el tiempo total por la duración del período: t / T.",
        "Calculá el cociente entre las 120 horas totales y las 10 horas de cada ciclo: 120 / 10.",
      ],
      solution: [
        "Tiempo total: 5 días · 24 horas/día = 120 horas.",
        "Período: T = 10 horas.",
        "Número de ciclos: n = 120 / 10 = 12 períodos.",
      ],
    },
  ],
  "sec-8": [
    {
      id: "sec8-q1",
      competencyId: "exponentials.shifts_and_horizontal_asymptote",
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
      type: "number",
      prompt: "Para f(x) = 2 − (1/2)ˣ, hallá la raíz igualando a cero: 2 − (1/2)ˣ = 0. ¿Cuánto vale x?",
      spec: { value: -1, expected: -1, k: -1, a: 0.5, c: 2, context: "raiz 2 - (1/2)^x = 0 => x = -1" },
      checkCorrect: (val) => checkNum(val, -1),
      hints: [
        "Despejá la potencia: (1/2)ˣ = 2.",
        "Expresá ambos miembros en potencias de 2: (2⁻¹)ˣ = 2¹ ⟹ 2⁻ˣ = 2¹.",
        "Resolvé la igualdad de exponentes resultante −x = 1 para despejar la raíz x.",
      ],
      solution: [
        "Igualamos a cero: 2 − (1/2)ˣ = 0 ⟹ (1/2)ˣ = 2.",
        "Como (1/2)ˣ = 2⁻ˣ, tenemos 2⁻ˣ = 2¹.",
        "Por igualdad de bases: −x = 1 ⟹ x = −1.",
      ],
    },
    {
      id: "sec9-q2",
      competencyId: "exponentials.full_analytical_study",
      type: "number",
      prompt: "Para la misma función f(x) = 2 − (1/2)ˣ, calculá la ordenada al origen f(0).",
      spec: { value: 1, expected: 1, k: -1, a: 0.5, c: 2, x: 0, context: "f(0) = 2 - 1 = 1" },
      checkCorrect: (val) => checkNum(val, 1),
      hints: [
        "Reemplazá x = 0 en la función: f(0) = 2 − (1/2)⁰.",
        "Recordá que (1/2)⁰ = 1.",
        "Efectuá la resta final 2 − 1 para determinar la coordenada vertical del punto de corte con el eje Y.",
      ],
      solution: [
        "Evaluamos en x = 0: f(0) = 2 − (1/2)⁰.",
        "(1/2)⁰ = 1.",
        "f(0) = 2 − 1 = 1.",
      ],
    },
    {
      id: "sec9-q3",
      competencyId: "exponentials.full_analytical_study",
      type: "number",
      prompt: "Para la función f(x) = 1 − (1/2)ˣ, hallá su raíz igualando a cero.",
      spec: { value: 0, expected: 0, k: -1, a: 0.5, c: 1, context: "raiz 1 - (1/2)^x = 0 => x = 0" },
      checkCorrect: (val) => checkNum(val, 0),
      hints: [
        "Igualá a cero: 1 − (1/2)ˣ = 0 ⟹ (1/2)ˣ = 1.",
        "¿A qué exponente debemos elevar una base para que el resultado sea 1?",
        "Recordá qué exponente x hace que (1/2)ˣ dé 1 para anular la diferencia 1 − (1/2)ˣ = 0.",
      ],
      solution: [
        "1 − (1/2)ˣ = 0 ⟹ (1/2)ˣ = 1.",
        "Como cualquier número no nulo a⁰ = 1, tenemos x = 0.",
        "La raíz está en x = 0.",
      ],
    },
  ],
  "sec-10": [
    {
      id: "sec10-q1",
      competencyId: "exponentials.equations_three_methods_in_reals",
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
      id: "sec10-q2",
      competencyId: "exponentials.equations_three_methods_in_reals",
      type: "number",
      prompt: "Resolvé sacando factor común: 2^(x+1) + 2ˣ = 12. Sacá 2ˣ de factor común y hallá x.",
      spec: { value: 2, expected: 2, rhs: 12, context: "ecuacion factor comun" },
      checkCorrect: (val) => checkNum(val, 2),
      hints: [
        "Desarmá 2^(x+1) como 2ˣ · 2¹.",
        "Extraé 2ˣ: 2ˣ · (2 + 1) = 12 ⟹ 2ˣ · 3 = 12.",
        "Dividí por 3 ambos miembros para obtener 2ˣ = 4 y deducí qué potencia de 2 iguala a 4.",
      ],
      solution: [
        "2^(x+1) + 2ˣ = 2ˣ · 2 + 2ˣ · 1 = 2ˣ(2 + 1).",
        "2ˣ · 3 = 12 ⟹ 2ˣ = 4.",
        "Como 4 = 2², tenemos x = 2.",
      ],
    },
    {
      id: "sec10-q3",
      competencyId: "exponentials.equations_three_methods_in_reals",
      type: "choice",
      prompt: "En 3^(2x) − 4 · 3^(x+1) : 9 + 1/3 = 0, con u = 3ˣ > 0 obtenemos u = 1 y u = 1/3. ¿Se descarta alguna solución en x?",
      options: [
        "Sí, se descarta 1/3 porque es fraccionaria",
        "No, porque ambas raíces auxiliares son estrictamente positivas (1 > 0 y 1/3 > 0), dando x = 0 y x = −1",
        "Sí, se descartan ambas porque la ecuación original tenía una división",
      ],
      expected: 1,
      spec: { problemType: "quadratic_substitution", rejectedRoots: [-1], expected: 1 },
      diagnosis: "accepted_non_positive_u_in_substitution",
      diagnosisMessage: "Sólo se descartan raíces u ≤ 0. Como 1 > 0 y 1/3 > 0, ambas generan soluciones reales válidas.",
      hints: [
        "La condición del cambio de variable u = aˣ es que u sea estrictamente mayor que cero (u > 0).",
        "Tanto 1 como 1/3 son números reales positivos.",
        "Para u = 1: 3ˣ = 1 ⟹ x = 0. Para u = 1/3: 3ˣ = 3⁻¹ ⟹ x = −1. Ambas son soluciones válidas.",
      ],
      solution: [
        "La sustitución exige u = 3ˣ > 0.",
        "Las raíces de la cuadrática auxiliar son u₁ = 1 y u₂ = 1/3. Ambas son positivas.",
        "De u₁ = 1 obtenemos x = 0; de u₂ = 1/3 obtenemos x = −1. Ambas pertenecen al conjunto solución.",
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
