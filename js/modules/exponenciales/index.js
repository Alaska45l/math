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
} from "./components.js";

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
      type: "choice",
      prompt: "Inspeccioná la tabla (0, 5), (1, 10), (2, 15), (3, 20). Con Δx = 1 fijo, las diferencias verticales son 10 − 5 = 5, 15 − 10 = 5, 20 − 15 = 5. ¿Qué comportamiento describe?",
      options: [
        "Lineal, porque la diferencia Δy = +5 es constante",
        "Exponencial, porque los números terminan en 0 y 5",
        "Cuadrática, porque el crecimiento es rápido",
      ],
      expected: 0,
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
      type: "number",
      prompt: "En la tabla (0, 2), (1, 6), (2, 18), (3, 54), calculá la razón constante multiplicativa a = y_{i+1} / y_i.",
      spec: { value: 3, context: "razon multiplicativa en tabla exponencial" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 3) < 1e-6,
      hints: [
        "Dividí el segundo término por el primero: 6 / 2.",
        "Verificá el siguiente cociente: 18 / 6. ¿Da el mismo resultado?",
        "Comprobá el último paso: 54 / 18. Ese cociente constante es la base exponencial a.",
      ],
      solution: [
        "Calculamos los cocientes sucesivos: 6 / 2 = 3.",
        "Verificamos en los siguientes pasos: 18 / 6 = 3 y 54 / 18 = 3.",
        "La razón multiplicativa es a = 3.",
      ],
    },
    {
      type: "number",
      prompt: "Para los puntos (0, 1), (1, 2), (2, 4), (3, 8) que siguen f(x) = 2ˣ, calculá el valor proyectado f(4).",
      spec: { value: 16, context: "evaluacion potencia 2^4" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 16) < 1e-6,
      hints: [
        "En una progresión de duplicación, el siguiente término multiplica al anterior por 2.",
        "El término anterior en x = 3 vale 8. Multiplicá 8 · 2.",
        "O bien calculá la potencia canónica: 2⁴ = 2 · 2 · 2 · 2.",
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
      type: "number",
      prompt: "En el cultivo de amebas f(x) = 3 · 2ˣ, calculá la cantidad inicial de amebas f(0) en el momento cero.",
      spec: { value: 3, context: "neutro multiplicativo en f(0)" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 3) < 1e-6,
      hints: [
        "Reemplazá x = 0 en la fórmula: f(0) = 3 · 2⁰.",
        "Recordá el neutro multiplicativo: todo número no nulo elevado a la cero vale 1.",
        "Multiplicá 3 · 1 para obtener la cantidad inicial.",
      ],
      solution: [
        "Evaluamos en x = 0: f(0) = 3 · 2⁰.",
        "Como 2⁰ = 1, tenemos f(0) = 3 · 1.",
        "La cantidad inicial es 3 amebas.",
      ],
    },
    {
      type: "number",
      prompt: "Calculá la cantidad de amebas tras 3 horas: f(3) = 3 · 2³.",
      spec: { value: 24, context: "evaluacion 3 * 2^3" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 24) < 1e-6,
      hints: [
        "Por jerarquía de operaciones, calculá primero la potencia 2³.",
        "2³ = 2 · 2 · 2 = 8.",
        "Luego multiplicá el factor de escala inicial: 3 · 8.",
      ],
      solution: [
        "Resolvemos primero la potencia: 2³ = 8.",
        "Multiplicamos por el coeficiente inicial k = 3: 3 · 8 = 24.",
        "A las 3 horas hay 24 amebas.",
      ],
    },
    {
      type: "choice",
      prompt: "¿Por qué la expresión 3 · 2ˣ no puede reescribirse como 6ˣ?",
      options: [
        "Porque la potencia tiene mayor jerarquía que la multiplicación: la x afecta sólo al 2",
        "Porque 3 y 2 son primos entre sí",
        "Porque el 6 sólo se usa en bases pares",
      ],
      expected: 0,
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
      type: "number",
      prompt: "Para f(x) = 4 · 9ˣ, calculá el valor en x = 1/2 utilizando exponentes racionales: 4 · 9^(1/2).",
      spec: { value: 12, context: "potencia fraccionaria 4 * 9^(1/2)" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 12) < 1e-6,
      hints: [
        "Un exponente 1/2 equivale a la raíz cuadrada: 9^(1/2) = √9.",
        "Calculá √9 = 3.",
        "Multiplicá por el coeficiente externo 4: 4 · 3.",
      ],
      solution: [
        "Reescribimos la potencia racional: 9^(1/2) = √9 = 3.",
        "Multiplicamos por k = 4: 4 · 3 = 12.",
        "El valor en x = 1/2 es 12.",
      ],
    },
    {
      type: "choice",
      prompt: "¿Por qué en el conjunto de los números reales se exige estrictamente que la base a sea positiva (a > 0)?",
      options: [
        "Porque con base negativa a < 0, potencias como (−2)^(1/2) no tienen resultado real",
        "Porque las bases negativas son difíciles de graficar a mano",
        "Porque los números negativos no tienen potencias enteras",
      ],
      expected: 0,
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
      type: "number",
      prompt: "Si la curva f(x) = k · aˣ corta al eje vertical en el punto (0, 5), ¿cuánto vale el parámetro k?",
      spec: { value: 5, context: "ordenada al origen k" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 5) < 1e-6,
      hints: [
        "El corte con el eje vertical ocurre en x = 0.",
        "f(0) = k · a⁰ = k · 1 = k.",
        "Si el punto es (0, 5), la coordenada y es el valor de k.",
      ],
      solution: [
        "La ordenada al origen se calcula evaluando en x = 0: f(0) = k · a⁰.",
        "Como a⁰ = 1, tenemos f(0) = k.",
        "Dado que el punto es (0, 5), k = 5.",
      ],
    },
  ],
  "sec-4": [
    {
      type: "number",
      prompt: "Una sustancia radiactiva de 100 g decae al 50% anual: M(t) = 100 · (1/2)ᵗ. Calculá la masa residual tras 2 años (t = 2).",
      spec: { value: 25, context: "decaimiento 100 * (1/2)^2" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 25) < 1e-6,
      hints: [
        "Evaluá (1/2)²: elevá numerador y denominador al cuadrado.",
        "(1/2)² = 1/4.",
        "Multiplicá 100 · (1/4) o dividí 100 por 4.",
      ],
      solution: [
        "Evaluamos en t = 2: M(2) = 100 · (1/2)².",
        "(1/2)² = 1/4 = 0,25.",
        "100 · 0,25 = 25 g.",
      ],
    },
    {
      type: "number",
      prompt: "Aplicando la propiedad de simetría (1/a)ˣ = a⁻ˣ, reescribí (1/3)⁻² como potencia de 3 y calculá su valor.",
      spec: { value: 9, context: "simetria (1/3)^(-2) = 3^2 = 9" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 9) < 1e-6,
      hints: [
        "El inverso de 1/3 es 3¹.",
        "Por la regla de potencias: ((1/3)⁻¹)² = 3².",
        "Calculá 3².",
      ],
      solution: [
        "(1/3)⁻² = (3⁻¹)⁻².",
        "Multiplicamos exponentes: −1 · (−2) = 2, por lo que queda 3².",
        "3² = 9.",
      ],
    },
    {
      type: "choice",
      prompt: "¿Cuál es la asíntota horizontal de la función f(x) = (1/2)ˣ?",
      options: [
        "La recta y = 0, porque cuando x crece indefinidamente hacia +∞, la curva tiende a 0 sin tocarlo jamás",
        "La recta x = 0, porque el eje vertical actúa como barrera",
        "La recta y = 1, porque f(0) = 1",
      ],
      expected: 0,
      diagnosis: "closed_bracket_on_asymptote",
      diagnosisMessage: "La asíntota es horizontal (y = 0): los valores de f(x) se aproximan a 0 cuando x → +∞.",
      hints: [
        "Probá con valores grandes de x: (1/2)¹⁰ ≈ 0,00097, (1/2)²⁰ ≈ 0,00000095.",
        "Los valores se aproximan a cero tanto como queramos, pero siempre permanecen estrictamente positivos.",
        "Una recta horizontal a la que una curva se aproxima en el infinito es de la forma y = constante.",
      ],
      solution: [
        "Calculamos el límite en el infinito positivo: lim_{x→+∞} (1/2)ˣ = 0.",
        "La curva desciende aproximándose indefinidamente al eje X sin cruzarlo.",
        "Por definición, la recta y = 0 es la asíntota horizontal.",
      ],
    },
  ],
  "sec-5": [
    {
      type: "number",
      prompt: "En la función de examen g(x) = −3 · (1/2)ˣ, calculá la ordenada al origen g(0).",
      spec: { value: -3, context: "g(0) con k negativo" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - (-3)) < 1e-6,
      hints: [
        "Reemplazá x = 0 en la fórmula: g(0) = −3 · (1/2)⁰.",
        "(1/2)⁰ = 1.",
        "Multiplicá −3 · 1.",
      ],
      solution: [
        "Evaluamos en x = 0: g(0) = −3 · (1/2)⁰.",
        "Como cualquier base no nula a la cero vale 1: g(0) = −3 · 1.",
        "g(0) = −3.",
      ],
    },
    {
      type: "number",
      prompt: "Para g(x) = −3 · (1/2)ˣ, calculá g(1) en forma decimal.",
      spec: { value: -1.5, context: "g(1) = -3 * 0.5 = -1.5" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - (-1.5)) < 1e-6,
      hints: [
        "Evaluá g(1) = −3 · (1/2)¹.",
        "(1/2)¹ = 0,5.",
        "Multiplicá −3 · 0,5.",
      ],
      solution: [
        "En x = 1: g(1) = −3 · (1/2)¹.",
        "−3 · 0,5 = −1,5.",
        "El valor es −1,5.",
      ],
    },
    {
      type: "choice",
      prompt: "Al pasar de x = 0 a x = 1, el valor de g(x) pasó de −3 a −1,5. ¿Cómo es la función g en ℝ?",
      options: [
        "Estrictamente creciente, porque −1,5 es mayor que −3",
        "Estrictamente decreciente, porque la base 1/2 es menor que 1",
        "Constante, porque tiene signo negativo",
      ],
      expected: 0,
      diagnosis: "ignored_negative_k_monotonicity",
      diagnosisMessage: "¡Cuidado con la trampa de examen! Aunque a = 1/2 < 1, el coeficiente k = −3 < 0 invierte el sentido de crecimiento.",
      hints: [
        "Compará los dos números en la recta numérica: −1,5 está a la derecha de −3.",
        "Cuando al aumentar x el valor de la función también aumenta, la función es creciente.",
        "El factor negativo k < 0 refleja la gráfica respecto al eje horizontal e invierte la monotonía.",
      ],
      solution: [
        "Tenemos g(0) = −3 y g(1) = −1,5.",
        "Como −3 < −1,5, al avanzar hacia la derecha los valores suben hacia la asíntota y = 0.",
        "Por lo tanto, g(x) es estrictamente creciente en todo ℝ.",
      ],
    },
  ],
  "sec-6": [
    {
      type: "number",
      prompt: "Una exponencial f(x) = k · aˣ pasa por P(1, 1) y Q(2, 3). La base es a = 3 / 1 = 3, y f(1) = k · 3 = 1 implica k = 1/3. Calculá f(3).",
      spec: { value: 9, context: "reconstruccion f(3) = (1/3)*3^3 = 9" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 9) < 1e-6,
      hints: [
        "La fórmula reconstruida es f(x) = (1/3) · 3ˣ = 3ˣ⁻¹.",
        "Para x = 3, calculá 3³⁻¹ o bien (1/3) · 27.",
        "Dividí 27 por 3.",
      ],
      solution: [
        "La función es f(x) = (1/3) · 3ˣ.",
        "En x = 3: f(3) = (1/3) · 3³ = (1/3) · 27.",
        "f(3) = 9.",
      ],
    },
    {
      type: "number",
      prompt: "Una función corta al eje vertical en (0, 4) y su base es a = 1/2. Calculá f(2).",
      spec: { value: 1, context: "f(2) = 4 * (1/2)^2 = 1" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 1) < 1e-6,
      hints: [
        "El corte en (0, 4) determina que k = 4.",
        "La fórmula es f(x) = 4 · (1/2)ˣ.",
        "Calculá 4 · (1/2)² = 4 · (1/4).",
      ],
      solution: [
        "Identificamos k = 4 y a = 1/2, luego f(x) = 4 · (1/2)ˣ.",
        "Para x = 2: f(2) = 4 · (1/4).",
        "f(2) = 1.",
      ],
    },
    {
      type: "number",
      prompt: "Pasa por P(0, −3) y Q(2, −3/4). La razón es a² = (−3/4) / (−3) = 1/4, de modo que a = 1/2. Calculá f(1) = −3 · (1/2)¹ en decimal.",
      spec: { value: -1.5, context: "f(1) = -3 * 0.5 = -1.5" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - (-1.5)) < 1e-6,
      hints: [
        "El punto P(0, −3) da directamente k = −3.",
        "Con a = 1/2, la función es f(x) = −3 · (1/2)ˣ.",
        "En x = 1: multiplicá −3 por 1/2.",
      ],
      solution: [
        "Tenemos k = −3 y a = 1/2.",
        "Evaluamos f(1) = −3 · (1/2) = −1,5.",
        "Respuesta: −1,5.",
      ],
    },
  ],
  "sec-7": [
    {
      type: "number",
      prompt: "El talio radiactivo decae según M(t) = 50 · (1/2)^(t/3) con tiempo t en minutos. Calculá la masa en gramos a los 6 minutos (t = 6).",
      spec: { value: 12.5, context: "vida media 50 * (1/2)^2 = 12.5" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 12.5) < 1e-6,
      hints: [
        "Calculá el exponente t/3 para t = 6: 6 / 3 = 2 vidas medias.",
        "Elevá (1/2)² = 1/4.",
        "Multiplicá 50 por 1/4 (o dividí 50 por 4).",
      ],
      solution: [
        "Calculamos el número de períodos: t / T = 6 / 3 = 2.",
        "M(6) = 50 · (1/2)² = 50 · (1/4).",
        "50 / 4 = 12,5 g.",
      ],
    },
    {
      type: "number",
      prompt: "Una población crece al 12% cada 5 años: P(t) = 55 · a^(t/5). ¿Cuál es el factor de base a expresado en decimal?",
      spec: { value: 1.12, context: "base 1 + r = 1 + 0.12 = 1.12" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 1.12) < 1e-6,
      hints: [
        "Un aumento porcentual suma su tasa al 100%: a = 1 + r.",
        "Convertí el 12% a fracción decimal: 12 / 100 = 0,12.",
        "Sumá 1 + 0,12.",
      ],
      solution: [
        "La tasa de crecimiento es r = 12% = 0,12.",
        "La base exponencial multiplicativa es a = 1 + r = 1 + 0,12.",
        "a = 1,12.",
      ],
    },
    {
      type: "number",
      prompt: "Un cultivo bacteriano aumenta su masa cada 10 horas. Si transcurrieron 5 días completos (120 horas), ¿cuántos períodos de 10 h pasaron?",
      spec: { value: 12, context: "120 / 10 = 12 periodos" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 12) < 1e-6,
      hints: [
        "Calculá el total de horas: 5 días · 24 h/día = 120 horas.",
        "Dividí el tiempo total por el período T = 10 h.",
        "120 / 10.",
      ],
      solution: [
        "Tiempo total: 5 · 24 = 120 horas.",
        "Período compuesto: T = 10 horas.",
        "Número de períodos: 120 / 10 = 12.",
      ],
    },
  ],
  "sec-8": [
    {
      type: "choice",
      prompt: "Para f(x) = 2 · 3^(x−1) + 4, ¿cuál es la recta de la asíntota horizontal y cuál es el conjunto imagen?",
      options: [
        "Asíntota y = 4; Conjunto Imagen Im = (4; +∞)",
        "Asíntota y = 2; Conjunto Imagen Im = [2; +∞)",
        "Asíntota y = 0; Conjunto Imagen Im = [4; +∞)",
      ],
      expected: 0,
      diagnosis: "closed_bracket_on_asymptote",
      diagnosisMessage: "El desplazamiento vertical c = 4 traslada la asíntota a y = 4. La imagen siempre es abierta: jamás lleva corchete cerrado.",
      hints: [
        "El término constante sumado fuera de la potencia es c = 4.",
        "Cuando x → −∞, 3^(x−1) tiende a 0, por lo que f(x) se aproxima a 2·0 + 4 = 4.",
        "Como k = 2 > 0, la curva está por encima de la asíntota: Im = (c; +∞).",
      ],
      solution: [
        "El corrimiento vertical es c = 4, trasladando la asíntota horizontal a y = 4.",
        "Dado que k = 2 > 0, los valores de la función son estrictamente mayores que 4.",
        "Por ende, la asíntota es y = 4 y la imagen es el intervalo abierto (4; +∞).",
      ],
    },
    {
      type: "number",
      prompt: "En f(x) = 2 · 3^(x−1) + 4, evaluá la función en el punto de anclaje x = 1.",
      spec: { value: 6, context: "f(1) = 2 * 3^0 + 4 = 6" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 6) < 1e-6,
      hints: [
        "Reemplazá x = 1: el exponente es 1 − 1 = 0.",
        "3⁰ = 1.",
        "Calculá 2 · 1 + 4.",
      ],
      solution: [
        "Evaluamos en x = 1: f(1) = 2 · 3^(1−1) + 4.",
        "f(1) = 2 · 3⁰ + 4 = 2 · 1 + 4.",
        "f(1) = 6.",
      ],
    },
    {
      type: "choice",
      prompt: "¿Cómo se escribe formalmente el conjunto imagen de f(x) = 5 · 2ˣ − 7?",
      options: [
        "(−7; +∞)",
        "[−7; +∞)",
        "ℝ − {−7}",
      ],
      expected: 0,
      diagnosis: "closed_bracket_on_asymptote",
      diagnosisMessage: "En la asíntota nunca se pone corchete cerrado: la función nunca alcanza exactamente el valor c = −7.",
      hints: [
        "La asíntota horizontal está en y = −7.",
        "La potencia 2ˣ es estrictamente positiva (2ˣ > 0), de modo que 5 · 2ˣ jamás puede valer cero.",
        "Por eso, el valor −7 no pertenece a la imagen: el extremo debe ser estrictamente abierto con paréntesis.",
      ],
      solution: [
        "Para todo x ∈ ℝ, 2ˣ > 0, lo que implica 5 · 2ˣ > 0.",
        "Restando 7 a ambos miembros: 5 · 2ˣ − 7 > −7.",
        "La imagen es el intervalo abierto (−7; +∞).",
      ],
    },
  ],
  "sec-9": [
    {
      type: "number",
      prompt: "Dada la función trasladada f(x) = 2 − (1/2)ˣ, calculá la raíz real x₀ resolviendo 2 − (1/2)ˣ = 0.",
      spec: { value: -1, context: "raiz 2 - (1/2)^x = 0 => x = -1" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - (-1)) < 1e-6,
      hints: [
        "Igualá a cero y despejá la potencia: (1/2)ˣ = 2.",
        "Escribí ambos miembros en la misma base: 2 = (1/2)⁻¹ o bien (2⁻¹)ˣ = 2¹.",
        "Igualá los exponentes: −x = 1.",
      ],
      solution: [
        "Planteamos 2 − (1/2)ˣ = 0 ⟹ (1/2)ˣ = 2.",
        "Expresamos con base 2: 2⁻ˣ = 2¹.",
        "Igualando exponentes: −x = 1 ⟹ x = −1.",
      ],
    },
    {
      type: "number",
      prompt: "Para f(x) = 2 − (1/2)ˣ, calculá la ordenada al origen f(0).",
      spec: { value: 1, context: "f(0) = 2 - 1 = 1" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 1) < 1e-6,
      hints: [
        "Evaluá en x = 0: (1/2)⁰ = 1.",
        "Restá 2 − 1.",
        "El resultado 2 − 1 = 1 ubica la intersección con el eje vertical Y en el punto (0; 1).",
      ],
      solution: [
        "f(0) = 2 − (1/2)⁰.",
        "Como (1/2)⁰ = 1: f(0) = 2 − 1.",
        "f(0) = 1.",
      ],
    },
    {
      type: "number",
      prompt: "En la función con corte en el origen f(x) = 1 − (1/2)ˣ, calculá la raíz real resolviendo 1 − (1/2)ˣ = 0.",
      spec: { value: 0, context: "raiz 1 - (1/2)^x = 0 => x = 0" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 0) < 1e-6,
      hints: [
        "Despejá: (1/2)ˣ = 1.",
        "¿A qué exponente debemos elevar una base positiva para que el resultado sea el neutro 1?",
        "Cualquier número no nulo elevado a la 0 da 1.",
      ],
      solution: [
        "1 − (1/2)ˣ = 0 ⟹ (1/2)ˣ = 1.",
        "Como (1/2)⁰ = 1, igualamos exponentes: x = 0.",
        "La raíz está en x = 0 (corta al eje en el origen).",
      ],
    },
  ],
  "sec-10": [
    {
      type: "number",
      prompt: "Resolvé la ecuación de examen 2^(3x+1) : 16^(x−4) = 1. Como 16 = 2⁴, restá exponentes: 3x + 1 − (4x − 16) = 0 y hallá x.",
      spec: { value: 17, context: "ecuacion 2^(3x+1) : 16^(x-4) = 1 => x = 17" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 17) < 1e-6,
      hints: [
        "Reescribí 16^(x−4) en base 2: (2⁴)^(x−4) = 2^(4x−16).",
        "En un cociente de igual base se restan los exponentes: (3x + 1) − (4x − 16) = 0.",
        "¡Cuidado con el signo al distribuir el menos! 3x + 1 − 4x + 16 = 0 ⟹ −x + 17 = 0.",
      ],
      solution: [
        "Reescribimos en base 2: 2^(3x+1) : 2^(4(x−4)) = 2⁰.",
        "Restamos exponentes con paréntesis: 3x + 1 − (4x − 16) = 0.",
        "Distribuimos el signo: 3x + 1 − 4x + 16 = 0 ⟹ −x + 17 = 0 ⟹ x = 17.",
      ],
    },
    {
      type: "number",
      prompt: "Resolvé sacando factor común: 2^(x+1) + 2ˣ = 12. Sacá 2ˣ de factor común y hallá x.",
      spec: { value: 2, context: "factor comun 2^x(2+1) = 12 => x = 2" },
      checkCorrect: (val) => Math.abs(Number(String(val).replace(",", ".")) - 2) < 1e-6,
      hints: [
        "Desarmá 2^(x+1) como 2ˣ · 2¹.",
        "Extraé 2ˣ: 2ˣ · (2 + 1) = 12 ⟹ 2ˣ · 3 = 12.",
        "Dividí por 3: 2ˣ = 4, y deducí x.",
      ],
      solution: [
        "2^(x+1) + 2ˣ = 2ˣ · 2 + 2ˣ · 1 = 2ˣ(2 + 1).",
        "2ˣ · 3 = 12 ⟹ 2ˣ = 4.",
        "Como 4 = 2², tenemos x = 2.",
      ],
    },
    {
      type: "choice",
      prompt: "En 3^(2x) − 4 · 3^(x+1) : 9 + 1/3 = 0, con u = 3ˣ > 0 obtenemos u = 1 y u = 1/3. ¿Se descarta alguna solución en x?",
      options: [
        "No, porque ambas raíces auxiliares son estrictamente positivas (1 > 0 y 1/3 > 0), dando x = 0 y x = −1",
        "Sí, se descarta 1/3 porque es fraccionaria",
        "Sí, se descartan ambas porque la ecuación original tenía una división",
      ],
      expected: 0,
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
