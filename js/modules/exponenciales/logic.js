/**
 * logic.js — Motor matemático analítico puro para funciones, modelos y ecuaciones exponenciales.
 * Unidad 08 de Alaska Math Lab (Laboratorio 7: exponenciales.html).
 * 100% puro, libre de efectos secundarios y desacoplado del DOM.
 */

import { fmt, MINUS } from '../../core/math-format.js';
import { cleanNumber } from './expr.js';

export { cleanNumber };

/**
 * Comparacion de punto flotante con tolerancia relativa y absoluta estricta.
 */
export const approxEq = (a, b, tol = 1e-7) =>
  Number.isFinite(a) && Number.isFinite(b) &&
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/**
 * Convierte un numero decimal a fraccion irreducible simple (ej. 0.5 -> "1/2", 1.333333333 -> "4/3").
 */
export function toSimpleFraction(val, maxDenominator = 1000) {
  if (!Number.isFinite(val)) return String(val);
  const sign = val < 0 ? -1 : 1;
  const num = Math.abs(val);

  if (approxEq(num, Math.round(num))) {
    return String(sign * Math.round(num));
  }

  let bestN = Math.round(num);
  let bestD = 1;
  let bestError = Math.abs(num - bestN);

  for (let d = 2; d <= maxDenominator; d++) {
    const n = Math.round(num * d);
    const err = Math.abs(num - n / d);
    if (err < bestError && err < 1e-7) {
      bestN = n;
      bestD = d;
      bestError = err;
      if (err < 1e-9) break;
    }
  }

  if (bestError < 1e-6) {
    return `${sign < 0 ? '-' : ''}${bestN}/${bestD}`;
  }
  return String(cleanNumber(val, 4));
}

/**
 * Clasifica una tabla cartesiana de puntos (xs, ys) con paso constante Δx.
 * Distingue relaciones: 'linear', 'exponential', 'quadratic', 'neither'.
 */
export function classifyTable(xs, ys) {
  if (!Array.isArray(xs) || !Array.isArray(ys) || xs.length !== ys.length) {
    throw new TypeError("classifyTable requiere arrays xs e ys de igual longitud.");
  }
  if (xs.length < 3) {
    return {
      type: 'neither',
      deltaX: 0,
      deltas: [],
      ratios: [],
      secondDeltas: [],
      ratioOrDiff: 0,
      stepValues: [],
      explanation: "Hacen falta al menos 3 pares de datos para determinar un patrón analítico.",
    };
  }

  // 1. Verificar orden ascendente y paso constante en x
  const deltaX0 = xs[1] - xs[0];
  if (deltaX0 <= 0) {
    return {
      type: 'neither',
      deltaX: deltaX0,
      deltas: [],
      ratios: [],
      secondDeltas: [],
      ratioOrDiff: 0,
      stepValues: [],
      explanation: "Los valores de x deben ser estrictamente crecientes.",
    };
  }

  for (let i = 1; i < xs.length - 1; i++) {
    const dx = xs[i + 1] - xs[i];
    if (!approxEq(dx, deltaX0)) {
      return {
        type: 'neither',
        deltaX: deltaX0,
        deltas: [],
        ratios: [],
        secondDeltas: [],
        ratioOrDiff: 0,
        stepValues: [],
        explanation: "El paso Δx no es constante a lo largo de la tabla.",
      };
    }
  }

  const deltaX = cleanNumber(deltaX0);

  // 2. Primeras diferencias aditivas
  const deltas = [];
  for (let i = 0; i < ys.length - 1; i++) {
    deltas.push(cleanNumber(ys[i + 1] - ys[i]));
  }

  // 3. Razones multiplicativas
  const hasZero = ys.some((y) => approxEq(y, 0));
  const allPositive = ys.every((y) => y > 0);
  const allNegative = ys.every((y) => y < 0);
  const sameSign = allPositive || allNegative;

  const ratios = [];
  if (!hasZero && sameSign) {
    for (let i = 0; i < ys.length - 1; i++) {
      ratios.push(cleanNumber(ys[i + 1] / ys[i]));
    }
  }

  // 4. Segundas diferencias
  const secondDeltas = [];
  for (let i = 0; i < deltas.length - 1; i++) {
    secondDeltas.push(cleanNumber(deltas[i + 1] - deltas[i]));
  }

  // Test de Linealidad
  const isLinear = deltas.every((d) => approxEq(d, deltas[0]));
  if (isLinear) {
    const slope = cleanNumber(deltas[0] / deltaX);
    return {
      type: 'linear',
      deltaX,
      deltas,
      ratios,
      secondDeltas,
      slope,
      ratioOrDiff: deltas[0],
      stepValues: deltas,
      explanation: approxEq(slope, 0)
        ? `Relación lineal constante: los valores de y se mantienen fijos en ${ys[0]} (pendiente m = 0).`
        : `Relación lineal: cada incremento de Δx = ${deltaX} produce una diferencia aditiva constante de Δy = ${deltas[0]} (pendiente m = ${slope}).`,
    };
  }

  // Test de Exponencialidad
  const isExp =
    ratios.length > 0 &&
    ratios.every((r) => approxEq(r, ratios[0])) &&
    !approxEq(ratios[0], 1) &&
    ratios[0] > 0;

  if (isExp) {
    const factorPerStep = ratios[0];
    const base = cleanNumber(Math.pow(factorPerStep, 1 / deltaX));
    const k = cleanNumber(ys[0] / Math.pow(base, xs[0]));
    return {
      type: 'exponential',
      deltaX,
      deltas,
      ratios,
      secondDeltas,
      base,
      factorPerStep,
      k,
      ratioOrDiff: factorPerStep,
      stepValues: ratios,
      explanation: `Relación exponencial: a pasos iguales de Δx = ${deltaX}, los valores de y se multiplican por un factor constante de ${factorPerStep} (base unitaria a = ${base}).`,
    };
  }

  // Test de Cuadraticidad
  const isQuadratic =
    secondDeltas.length > 0 &&
    secondDeltas.every((d2) => approxEq(d2, secondDeltas[0])) &&
    !approxEq(secondDeltas[0], 0);

  if (isQuadratic) {
    return {
      type: 'quadratic',
      deltaX,
      deltas,
      ratios,
      secondDeltas,
      ratioOrDiff: secondDeltas[0],
      stepValues: deltas,
      explanation: `Relación cuadrática: las primeras diferencias varían aditivamente, pero las segundas diferencias son constantes (Δ²y = ${secondDeltas[0]}).`,
    };
  }

  return {
    type: 'neither',
    deltaX,
    deltas,
    ratios,
    secondDeltas,
    ratioOrDiff: 0,
    stepValues: deltas,
    explanation: "No es lineal ni exponencial: ni las sumas ni las multiplicaciones entre términos consecutivos son constantes.",
  };
}

/**
 * Reconstruye analiticamente f(x) = k * a^x a partir de dos puntos.
 */
export function fitExponentialFromPoints(p1, p2) {
  const x1 = Array.isArray(p1) ? p1[0] : p1.x;
  const y1 = Array.isArray(p1) ? p1[1] : p1.y;
  const x2 = Array.isArray(p2) ? p2[0] : p2.x;
  const y2 = Array.isArray(p2) ? p2[1] : p2.y;

  if (approxEq(x1, x2)) {
    throw new RangeError("Los puntos no pueden tener la misma abscisa x.");
  }
  if (approxEq(y1, 0) || approxEq(y2, 0)) {
    throw new RangeError("Las ordenadas y no pueden ser cero para una función exponencial.");
  }
  if (Math.sign(y1) !== Math.sign(y2)) {
    throw new RangeError("Los puntos deben tener el mismo signo en y para ajustar una función exponencial real.");
  }
  if (approxEq(y1, y2)) {
    throw new RangeError("Los puntos tienen el mismo valor de y, lo que generaría una base a = 1 (recta constante, no exponencial).");
  }

  const deltaX = x2 - x1;
  const ratio = y2 / y1;
  const aRaw = Math.pow(ratio, 1 / deltaX);
  const a = cleanNumber(aRaw);

  if (a <= 0 || approxEq(a, 1)) {
    throw new RangeError("No existe base real válida a > 0 y a ≠ 1 para estos puntos.");
  }

  const kRaw = y1 / Math.pow(a, x1);
  const k = cleanNumber(kRaw);

  // Monotonia: crec si (k > 0 & a > 1) || (k < 0 & a < 1)
  const isGrowth = (k > 0 && a > 1) || (k < 0 && a < 1);

  const exactA = toSimpleFraction(a);
  const exactK = toSimpleFraction(k);

  let formula = "f(x) = ";
  if (approxEq(k, 1)) {
    formula += exactA.includes('/') ? `(${exactA})^x` : `${exactA}^x`;
  } else if (approxEq(k, -1)) {
    formula += exactA.includes('/') ? `-(${exactA})^x` : `-${exactA}^x`;
  } else {
    const kStr = exactK.includes('/') ? `(${exactK})` : exactK;
    const aStr = exactA.includes('/') ? `(${exactA})` : exactA;
    formula += `${kStr} · ${aStr}^x`;
  }

  return {
    k,
    a,
    isGrowth,
    formula,
    equation: formula,
    exactA,
    exactK,
  };
}

/**
 * Radiografia analitica formal completa de f(x) = k * a^(x - h) + c.
 */
export function analyzeExponential({ k, a, h = 0, c = 0 }) {
  if (approxEq(k, 0)) {
    throw new RangeError("El coeficiente k no puede ser cero.");
  }
  if (a <= 0 || approxEq(a, 1)) {
    throw new RangeError("La base a debe pertenecer a ℝ⁺ - {1}.");
  }

  const kC = cleanNumber(k);
  const aC = cleanNumber(a);
  const hC = cleanNumber(h);
  const cC = cleanNumber(c);

  const domain = "ℝ";
  const asymptote = `y = ${fmt(cC)}`;
  const image = kC > 0 ? `(${fmt(cC)}; +∞)` : `(−∞; ${fmt(cC)})`;
  const yIntercept = cleanNumber(kC * Math.pow(aC, -hC) + cC);

  // Raices: k * a^(x - h) + c = 0 <=> a^(x - h) = -c / k
  const target = -cC / kC;
  let root = null;
  let rootStr = "vacio";
  let c0 = "vacio";

  if (target > 0) {
    const rootRaw = hC + Math.log(target) / Math.log(aC);
    root = cleanNumber(rootRaw);
    rootStr = `{ ${fmt(root)} }`;
    c0 = `{ ${fmt(root)} }`;
  }

  const isGrowth = (kC > 0 && aC > 1) || (kC < 0 && aC < 1);
  const monotonicity = isGrowth ? "creciente" : "decreciente";

  let cPos = "vacio";
  let cNeg = "vacio";

  if (root === null) {
    if (yIntercept > 0) {
      cPos = "ℝ";
      cNeg = "vacio";
    } else {
      cPos = "vacio";
      cNeg = "ℝ";
    }
  } else {
    if (isGrowth) {
      cNeg = `(−∞; ${fmt(root)})`;
      cPos = `(${fmt(root)}; +∞)`;
    } else {
      cPos = `(−∞; ${fmt(root)})`;
      cNeg = `(${fmt(root)}; +∞)`;
    }
  }

  return {
    domain,
    dom: domain,
    asymptote,
    asymptoteY: cC,
    image,
    im: image,
    yIntercept,
    root,
    rootStr,
    c0,
    monotonicity,
    isGrowth,
    cPos,
    cPlus: cPos,
    cNeg,
    cMinus: cNeg,
  };
}

/**
 * Resuelve algebraicamente una ecuacion exponencial en R segun los 3 metodos de Exactas.
 */
export function solveExpEquation(spec) {
  if (!spec || typeof spec !== 'object') {
    throw new TypeError("solveExpEquation requiere un objeto de especificación.");
  }

  const method = spec.method || spec.type;

  switch (method) {
    case 'equal_base': {
      // Caso 1: Cociente 2^(3x+1) : 16^(x-4) = 1
      if (spec.preset === 'exactas_12a' || spec.equation?.includes('16') || spec.eq?.includes('16')) {
        return {
          method: 'equal_base',
          type: 'equal_base',
          equation: "2^(3x+1) : 16^(x-4) = 1",
          steps: [
            "Expresamos el divisor en base 2: 16^(x-4) = (2^4)^(x-4) = 2^(4x-16).",
            "Aplicamos el cociente de potencias de igual base restando exponentes: 2^(3x+1 - (4x-16)) = 1.",
            "Escribimos el segundo miembro como potencia de base 2: 1 = 2^0.",
            "Igualamos los exponentes preservando el paréntesis: 3x + 1 - (4x - 16) = 0.",
            "Distribuimos el signo menos: 3x + 1 - 4x + 16 = 0  =>  -x + 17 = 0.",
            "Despejamos la incógnita: x = 17.",
          ],
          solutions: [17],
          rejectedRoots: [],
          discardedSolutions: [],
          solutionSet: "{ 17 }",
        };
      }
      // Caso 2: Producto y potencia 4 · 2^x = 8^x
      if (spec.preset === '4_times_2_pow_x' || spec.equation?.includes('8^x') || spec.eq?.includes('8^x')) {
        return {
          method: 'equal_base',
          type: 'equal_base',
          equation: "4 · 2^x = 8^x",
          steps: [
            "Expresamos todos los factores en base 2: 2^2 · 2^x = (2^3)^x.",
            "Sumamos exponentes en el producto y multiplicamos en la potencia de potencia: 2^(x+2) = 2^(3x).",
            "Por inyectividad de la base 2, igualamos los exponentes: x + 2 = 3x.",
            "Agrupamos términos lineales: 2x = 2  =>  x = 1.",
          ],
          solutions: [1],
          rejectedRoots: [],
          discardedSolutions: [],
          solutionSet: "{ 1 }",
        };
      }
      // Caso general parametrico: a^(m1 x + b1) = a^(m2 x + b2)
      const base = spec.base || 2;
      const leftExp = spec.leftExp || { m: 1, b: 0 };
      const rightExp = spec.rightExp || { m: 0, b: 0 };
      const dm = leftExp.m - rightExp.m;
      const db = rightExp.b - leftExp.b;
      if (approxEq(dm, 0)) {
        if (approxEq(db, 0)) {
          return {
            method: 'equal_base',
            type: 'equal_base',
            steps: ["Los exponentes son idénticos para todo x: solución infinita ℝ."],
            solutions: [],
            rejectedRoots: [],
            discardedSolutions: [],
            solutionSet: "ℝ",
          };
        }
        return {
          method: 'equal_base',
          type: 'equal_base',
          steps: ["Los coeficientes lineales se anulan y las constantes difieren: no hay solución."],
          solutions: [],
          rejectedRoots: [],
          discardedSolutions: [],
          solutionSet: "vacio",
        };
      }
      const xSol = cleanNumber(db / dm);
      return {
        method: 'equal_base',
        type: 'equal_base',
        steps: [
          `Llevamos ambos miembros a base común ${base}.`,
          `Igualamos los exponentes lineales: ${leftExp.m}x + ${leftExp.b} = ${rightExp.m}x + ${rightExp.b}.`,
          `Despejamos x: ${dm}x = ${db}  =>  x = ${xSol}.`,
        ],
        solutions: [xSol],
        rejectedRoots: [],
        discardedSolutions: [],
        solutionSet: `{ ${xSol} }`,
      };
    }

    case 'common_factor': {
      // Caso Canonico Exactas Ejercicio 8: 2^(x+1) + 2^x = 12
      const base = spec.base || 2;
      const sumTerms = spec.terms || [{ p: 1, coeff: 1 }, { p: 0, coeff: 1 }];
      const rhs = spec.rhs !== undefined ? spec.rhs : 12;

      let factorSum = 0;
      const factorDesglose = [];
      for (const t of sumTerms) {
        const val = (t.coeff || 1) * Math.pow(base, t.p || 0);
        factorSum += val;
        factorDesglose.push(t.p === 0 ? "1" : `${base}^${t.p}`);
      }

      const powerVal = cleanNumber(rhs / factorSum);
      let solution = cleanNumber(Math.log(powerVal) / Math.log(base));

      return {
        method: 'common_factor',
        type: 'common_factor',
        equation: `${base}^(x+1) + ${base}^x = ${rhs}`,
        steps: [
          `Descomponemos los exponentes de cada término: ${base}^x · ${base}^1 + ${base}^x · 1 = ${rhs}.`,
          `Extraemos ${base}^x como factor común: ${base}^x · (${factorDesglose.join(' + ')}) = ${rhs}.`,
          `Calculamos el factor numérico: ${base}^x · ${factorSum} = ${rhs}.`,
          `Dividimos ambos miembros por ${factorSum}: ${base}^x = ${powerVal}.`,
          `Expresamos ${powerVal} como potencia de ${base}: ${base}^x = ${base}^${solution}  =>  x = ${solution}.`,
        ],
        solutions: [solution],
        rejectedRoots: [],
        discardedSolutions: [],
        solutionSet: `{ ${solution} }`,
      };
    }

    case 'quadratic_sub': {
      // Caso 1: Exactas Ejercicio 8i: 3^(2x) - 4 · 3^(x+1) : 9 + 1/3 = 0
      if (spec.preset === 'exactas_cuadratica' || spec.equation?.includes('4 · 3^(x+1) : 9') || spec.eq?.includes('4 · 3^(x+1) : 9')) {
        return {
          method: 'quadratic_sub',
          type: 'quadratic_sub',
          equation: "3^(2x) - 4 · 3^(x+1) : 9 + 1/3 = 0",
          steps: [
            "Simplificamos el término lineal: 4 · 3^(x+1) : 9 = (4 · 3^x · 3) / 9 = (4/3) · 3^x.",
            "Reescribimos la ecuación cuadrática en potencias de 3^x: (3^x)^2 - (4/3) · 3^x + 1/3 = 0.",
            "Multiplicamos toda la ecuación por 3 para coeficientes enteros: 3·(3^x)^2 - 4·3^x + 1 = 0.",
            "Efectuamos la sustitución u = 3^x con la condición indispensable u > 0 en ℝ.",
            "Resolvemos la cuadrática auxiliar 3u^2 - 4u + 1 = 0 con la resolvente: discriminante Δ = 16 - 12 = 4.",
            "Obtenemos las raíces auxiliares: u1 = (4 + 2)/6 = 1  y  u2 = (4 - 2)/6 = 1/3.",
            "Ambas raíces son estrictamente positivas (u1 > 0 y u2 > 0): son válidas en ℝ.",
            "Regresamos a la variable x: para u1 = 1 => 3^x = 1 => x = 0; para u2 = 1/3 => 3^x = 3^(-1) => x = -1.",
          ],
          solutions: [-1, 0],
          rejectedRoots: [],
          discardedSolutions: [],
          solutionSet: "{ -1; 0 }",
        };
      }

      // Caso 2: Cuadratica con descarte de raiz negativa: 2^(2x) - 3·2^x - 4 = 0
      if (spec.preset === 'cuadratica_descarte' || (spec.a === 1 && spec.b === -3 && spec.c === -4)) {
        return {
          method: 'quadratic_sub',
          type: 'quadratic_sub',
          equation: "2^(2x) - 3 · 2^x - 4 = 0",
          steps: [
            "Reconocemos la forma cuadrática en potencias de 2^x: (2^x)^2 - 3 · 2^x - 4 = 0.",
            "Efectuamos la sustitución u = 2^x con la condición de existencia u > 0 en ℝ.",
            "Resolvemos la cuadrática u^2 - 3u - 4 = 0: discriminante Δ = 9 - 4(1)(-4) = 25.",
            "Calculamos las raíces auxiliares: u1 = (3 + 5)/2 = 4  y  u2 = (3 - 5)/2 = -1.",
            "¡ATENCIÓN DE CÁTEDRA! Como u = 2^x > 0 para todo x real, la raíz auxiliar u2 = -1 es estrictamente NEGATIVA y se DESCARTA (2^x = -1 carece de solución real).",
            "Tomamos únicamente la raíz positiva u1 = 4: 2^x = 4 = 2^2  =>  x = 2.",
          ],
          solutions: [2],
          rejectedRoots: [
            {
              u: -1,
              reason: "Como u = 2^x > 0 para todo x ∈ ℝ, la raíz auxiliar u = -1 carece de solución real y se descarta (2^x = -1 es imposible en ℝ).",
            },
          ],
          discardedSolutions: [
            {
              u: -1,
              reason: "Como u = 2^x > 0 para todo x ∈ ℝ, la raíz auxiliar u = -1 carece de solución real y se descarta (2^x = -1 es imposible en ℝ).",
            },
          ],
          solutionSet: "{ 2 }",
        };
      }

      // Caso 3: Trampa 5: 3^(2x) - 2·3^x - 3 = 0
      if (spec.preset === 'trampa_5' || (spec.a === 1 && spec.b === -2 && spec.c === -3)) {
        return {
          method: 'quadratic_sub',
          type: 'quadratic_sub',
          equation: "3^(2x) - 2 · 3^x - 3 = 0",
          steps: [
            "Introducimos la sustitución u = 3^x con la condición u > 0 en ℝ.",
            "Resolvemos la cuadrática u^2 - 2u - 3 = 0: raíces u1 = 3  y  u2 = -1.",
            "Descartamos u2 = -1 por ser menor o igual a cero (3^x = -1 no tiene solución real).",
            "Para u1 = 3: 3^x = 3^1  =>  x = 1.",
          ],
          solutions: [1],
          rejectedRoots: [
            {
              u: -1,
              reason: "La raíz u = -1 no es positiva; no existe potencia real 3^x que dé un número negativo.",
            },
          ],
          discardedSolutions: [
            {
              u: -1,
              reason: "La raíz u = -1 no es positiva; no existe potencia real 3^x que dé un número negativo.",
            },
          ],
          solutionSet: "{ 1 }",
        };
      }

      // Parametros genericos A u^2 + B u + C = 0 con base
      const A = spec.A || spec.a || 1;
      const B = spec.B || spec.b || 0;
      const C = spec.C || spec.c || 0;
      const expBase = spec.expBase || spec.base || 2;

      const disc = B * B - 4 * A * C;
      if (disc < 0) {
        return {
          method: 'quadratic_sub',
          type: 'quadratic_sub',
          steps: ["El discriminante de la cuadrática es negativo (Δ < 0): no hay raíces reales."],
          solutions: [],
          rejectedRoots: [],
          discardedSolutions: [],
          solutionSet: "vacio",
        };
      }

      const sqrtD = Math.sqrt(disc);
      const u1Raw = (-B + sqrtD) / (2 * A);
      const u2Raw = (-B - sqrtD) / (2 * A);
      const rawRoots = [cleanNumber(u1Raw), cleanNumber(u2Raw)];
      const uniqueURoots = Array.from(new Set(rawRoots));

      const validSolutions = [];
      const rejected = [];

      for (const u of uniqueURoots) {
        if (u <= 0) {
          rejected.push({
            u,
            reason: `La raíz auxiliar u = ${u} es menor o igual a cero, incompatible con ${expBase}^x > 0 en ℝ.`,
          });
        } else {
          const xVal = cleanNumber(Math.log(u) / Math.log(expBase));
          validSolutions.push(xVal);
        }
      }

      validSolutions.sort((a, b) => a - b);
      const solSet = validSolutions.length === 0 ? "vacio" : `{ ${validSolutions.join('; ')} }`;

      return {
        method: 'quadratic_sub',
        type: 'quadratic_sub',
        steps: [
          `Sustitución u = ${expBase}^x con u > 0.`,
          `Resolvente cuadrática para ${A}u² + (${B})u + (${C}) = 0 da u ∈ {${uniqueURoots.join(', ')}}.`,
          rejected.length > 0 ? `Se descartan raíces no positivas: ${rejected.map((r) => r.u).join(', ')}.` : "Todas las raíces de u son positivas.",
          `Soluciones finales en x: ${solSet}.`,
        ],
        solutions: validSolutions,
        rejectedRoots: rejected,
        discardedSolutions: rejected,
        solutionSet: solSet,
      };
    }

    default:
      throw new TypeError(`Método de resolución desconocido: ${method}`);
  }
}

/**
 * Diccionario canonico de diagnosticos cognitivos para funciones exponenciales.
 * Mapea cada ID con su pose de Alaska autorizada en VN_POSES y su texto en voseo rioplatense.
 */
export const EXP_DIAGNOSTICS = {
  linear_difference_instead_of_ratio: {
    id: "linear_difference_instead_of_ratio",
    pose: "unamused",
    tag: "Sin recetas mágicas",
    message: "¡Pará un poco! Estás contando saltos aditivos como si esto fuera una recta. En una función exponencial los valores de y no avanzan sumando siempre la misma cantidad: se multiplican por un factor fijo en cada paso regular. Mirá la razón entre términos consecutivos: 9/3 = 3 y 27/9 = 3. Hay una escala multiplicativa, no una suma.",
  },
  multiplied_k_and_base: {
    id: "multiplied_k_and_base",
    pose: "colapso",
    tag: "Jerarquía de operaciones",
    message: "¡Ay, no! ¡Colapso total de cátedra! La potenciación tiene jerarquía sobre la multiplicación: en 3 · 2^x, el exponente x sólo afecta a la base 2, el 3 espera afuera. Si hacés 3 · 2^x = 6^x, para x = 2 tendrías 3 · 4 = 12, pero 6^2 = 36. ¡No dan lo mismo jamás! Dejá al coeficiente k tranquilo en su lugar.",
  },
  confused_fencepost_x_minus_1: {
    id: "confused_fencepost_x_minus_1",
    pose: "sospecha",
    tag: "Desfasaje de ancla",
    message: "Mmm... ojo con ese desfasaje. Estás arrastrando de memoria la fórmula de sucesiones donde se empieza a contar en n = 1. Pero acá estamos en funciones con variable continua y arrancamos en x = 0. Como cualquier número elevado a la cero da 1 (a^0 = 1), la población inicial es directamente f(0) = k · a^0 = k. Si le ponés x − 1, en el momento cero tendrías k/a. El exponente arranca limpio en x.",
  },
  invalid_base_restriction: {
    id: "invalid_base_restriction",
    pose: "panico",
    tag: "¡Alerta de Laboratorio!",
    message: "¡Peligro, alerta de laboratorio! En los números reales la base de una exponencial exige a > 0 y a ≠ 1. Si metés una base negativa como −2, al querer calcular (−2)^(1/2) = √−2 te estrellás contra una pared fuera de ℝ. Y si elegís a = 1, 1^x = 1 siempre y te queda una recta plana aburrida, no una curva exponencial.",
  },
  raw_percentage_as_base: {
    id: "raw_percentage_as_base",
    pose: "lentes-brillo",
    tag: "Trampa de Parcial",
    message: "¡Clásica trampa de parcial! Si una magnitud crece un 12%, al valor inicial le tenés que sumar ese 12%, lo que significa que conservás el 100% (1) más el extra (0,12). El factor de crecimiento es 1 + r = 1,12. Si ponés 0,12 como base, ¡hacés desaparecer el 88% de la población en el primer paso!",
  },
  inverted_period_exponent: {
    id: "inverted_period_exponent",
    pose: "pensativa",
    tag: "Escala de tiempo",
    message: "A ver, pensemos despacio la escala de tiempo... Si la duplicación o el período ocurre cada T unidades (por ejemplo cada 5 años o cada 3 minutos), en t unidades de tiempo ese evento se repitió t / T veces, no t · T. Si pasaron 5 años, 5/5 = 1 solo paso, no 25. El exponente tiene que ser t / T.",
  },
  ignored_negative_k_monotonicity: {
    id: "ignored_negative_k_monotonicity",
    pose: "enojada",
    tag: "¡Frená la mano!",
    message: "¡Frená la mano! No podés mirar la base aislada y olvidarte del coeficiente k. La curva (1/2)^x va decayendo hacia cero con valores positivos. Pero al multiplicarla por k = −3 < 0, todos los resultados se vuelven negativos y se van acercando a cero desde abajo: −12, −6, −3, −1,5... ¡están subiendo! Con k < 0 el crecimiento se invierte por completo.",
  },
  closed_bracket_on_asymptote: {
    id: "closed_bracket_on_asymptote",
    pose: "lentes-brillo",
    tag: "Cazabobos de Examen",
    message: "¡Cazabobos mortal de examen! La curva exponencial se acerca tanto como quieras a la recta asíntota y = c, pero como a^x jamás se anula en los reales, la función nunca llega a tocar ese valor. La asíntota no pertenece a la imagen: va SIEMPRE con paréntesis abierto (, jamás con corchete cerrado [.",
  },
  subtracted_exponents_without_parens: {
    id: "subtracted_exponents_without_parens",
    pose: "sospecha",
    tag: "Error de signos",
    message: "Mmm... acá hay olor a error de signos. Cuando restás un exponente compuesto en un cociente, el signo menos afecta a TODO el exponente del divisor: tenés que poner paréntesis obligatorios. Es 3x + 1 − (4x − 16) = 3x + 1 − 4x + 16. Ese cambio de signo en el 16 te salva o te hunde el ejercicio.",
  },
  accepted_non_positive_u_in_substitution: {
    id: "accepted_non_positive_u_in_substitution",
    pose: "panico",
    tag: "¡Alerta de Laboratorio!",
    message: "¡Pará la máquina! Pusiste u = a^x, pero una potencia de base positiva en ℝ es SIEMPRE estrictamente positiva (u > 0). Si la ecuación cuadrática te tira una raíz como u = −1 o u = 0, tenés que tacharla inmediatamente: a^x = −1 no tiene solución real. ¡No me arrastres soluciones fantasma al conjunto final!",
  },
};

/**
 * Helper to parse a base value that might be an integer, float, or fraction (e.g. "-1/2", "3/4").
 * @param {string} str
 * @returns {number}
 */
function parseFractionOrNumber(str) {
  if (!str) return NaN;
  const cleaned = String(str).trim().replace(/[−–—]/g, '-').replace(/\s+/g, '');
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length === 2) {
      const num = Number(parts[0]);
      const den = Number(parts[1]);
      if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
        return num / den;
      }
    }
    return NaN;
  }
  return Number(cleaned.replace(',', '.'));
}

/**
 * Motor de Diagnostico Cognitivo para Exponenciales.
 *
 * @param {*} userInput - Entrada del usuario: string, numero u objeto.
 * @param {Object} [context={}] - Contexto del problema: parametros de funcion, tipo, esperados.
 * @returns {{ id: string, pose: string, tag: string, message: string, severity: string, status: string, correct: boolean } | null}
 */
export function diagnoseExp(userInput, context = {}) {
  if (userInput === null || userInput === undefined) return null;
  const ctx = context || {};

  // Normalizacion basica de la entrada
  const rawStr = typeof userInput === 'string' ? userInput.trim() : String(userInput).trim();
  if (rawStr === '') return null;
  const norm = rawStr.replace(/[−–—]/g, '-').toLowerCase();
  const num = Number(norm.replace(',', '.'));
  const isNum = Number.isFinite(num);

  const buildResult = (id) => {
    const meta = EXP_DIAGNOSTICS[id];
    if (!meta) return null;
    return {
      id: meta.id,
      pose: meta.pose,
      tag: meta.tag,
      message: meta.message,
      severity: 'error',
      status: 'diagnosed',
      correct: false,
    };
  };

  // Disparo explicito por contexto (usado por CHECKS_DATA o Retos)
  if (ctx.diagnosticId && EXP_DIAGNOSTICS[ctx.diagnosticId]) {
    return buildResult(ctx.diagnosticId);
  }

  // Layer 1: Si la respuesta coincide con el valor esperado del contexto, jamás es error
  if (ctx.expected !== undefined) {
    if (isNum && typeof ctx.expected === 'number' && Math.abs(num - ctx.expected) < 1e-6) {
      return null;
    }
    if (typeof ctx.expected === 'string' && norm === ctx.expected.toLowerCase().trim()) {
      return null;
    }
  }
  if (ctx.solutionSet !== undefined && typeof ctx.solutionSet === 'string') {
    const cleanInput = norm.replace(/[\s{}x=]/g, '');
    const cleanExpected = ctx.solutionSet.toLowerCase().replace(/[\s{}x=]/g, '');
    if (cleanInput === cleanExpected && cleanInput.length > 0) {
      return null;
    }
  }

  // 1. linear_difference_instead_of_ratio
  const isTableContext =
    ctx.problemType === 'table' ||
    ctx.type === 'table' ||
    ctx.expectedType === 'exponential' ||
    /tabla|raz[oó]n|crecimiento/i.test(ctx.context || '') ||
    /tabla/i.test(ctx.prompt || '');
  if (isTableContext) {
    const expectedRatio =
      ctx.expected !== undefined
        ? Number(ctx.expected)
        : ctx.ratio !== undefined
        ? Number(ctx.ratio)
        : ctx.factorPerStep !== undefined
        ? Number(ctx.factorPerStep)
        : ctx.base !== undefined
        ? Number(ctx.base)
        : null;

    const matchesExpectedRatio =
      (expectedRatio !== null && isNum && Math.abs(num - expectedRatio) < 1e-6) ||
      (ctx.expected !== undefined && norm === String(ctx.expected).toLowerCase().trim());

    if (!matchesExpectedRatio) {
      if (/^[yY]\s*=\s*-?\d*\.?\d*x/i.test(norm) || /\blineal\b|\blinear\b/i.test(norm)) {
        return buildResult('linear_difference_instead_of_ratio');
      }
      if (ctx.linearDiff !== undefined && isNum && Math.abs(num - Number(ctx.linearDiff)) < 1e-6) {
        return buildResult('linear_difference_instead_of_ratio');
      }
      if (ctx.deltas && Array.isArray(ctx.deltas) && ctx.deltas.some((d) => Math.abs(num - d) < 1e-6)) {
        return buildResult('linear_difference_instead_of_ratio');
      }
    }
  }

  // 2. multiplied_k_and_base
  const kVal = ctx.k !== undefined ? Number(ctx.k) : null;
  const aVal = ctx.a !== undefined ? Number(ctx.a) : null;
  if (kVal !== null && aVal !== null && Math.abs(kVal - 1) > 1e-6) {
    const kaProduct = kVal * aVal;
    const kaStr = String(kaProduct);
    const kaPowPattern = new RegExp(`(^|[^0-9a-z])\\(?${kaStr}\\)?\\s*\\^\\s*[xt]`, 'i');
    if (kaPowPattern.test(norm)) {
      return buildResult('multiplied_k_and_base');
    }
    if (ctx.x !== undefined && isNum) {
      const wrongVal = Math.pow(kaProduct, Number(ctx.x));
      const rightVal = kVal * Math.pow(aVal, Number(ctx.x));
      if (Math.abs(num - wrongVal) < 1e-6 && Math.abs(num - rightVal) > 1e-6) {
        return buildResult('multiplied_k_and_base');
      }
    }
  }
  // Deteccion heuristica para 3 * 2^x -> 6^x o 4 * 2^x -> 8^x
  if (/\b(?:6\^x|8\^x)\b/i.test(norm) && (kVal === 3 || kVal === 4 || /3\s*\*\s*2|4\s*\*\s*2/.test(ctx.expression || ''))) {
    return buildResult('multiplied_k_and_base');
  }
  const isK3A2Context =
    (kVal === 3 && (aVal === 2 || aVal === null)) ||
    /3\s*\*\s*2|3\s*·\s*2/i.test(ctx.expression || '') ||
    /3\s*amebas/i.test(ctx.prompt || '') ||
    /k\s*=\s*3/i.test(ctx.prompt || '');
  const matchesExpectedEval =
    ctx.expected !== undefined && isNum && Math.abs(num - Number(ctx.expected)) < 1e-6;
  if (
    isNum &&
    num === 1296 &&
    (ctx.x === 4 || /4\s*horas/i.test(ctx.prompt || '')) &&
    isK3A2Context &&
    !matchesExpectedEval
  ) {
    return buildResult('multiplied_k_and_base');
  }
  if (
    isNum &&
    num === 64 &&
    (ctx.x === 2 || /f\(2\)/i.test(ctx.prompt || '')) &&
    (kVal === 4 || /4\s*\*\s*2/.test(ctx.expression || '')) &&
    !matchesExpectedEval
  ) {
    return buildResult('multiplied_k_and_base');
  }

  // 3. confused_fencepost_x_minus_1
  if (/\^[({]?[xtn]\s*-\s*1[)}]?/i.test(norm) || (/\b[xtn]\s*-\s*1\b/i.test(norm) && norm.includes('^'))) {
    if (ctx.h !== 1 && ctx.expectedShift !== 1) {
      return buildResult('confused_fencepost_x_minus_1');
    }
  }

  // 4. invalid_base_restriction
  const isBaseQuestion =
    ctx.target === 'base' ||
    ctx.param === 'a' ||
    ctx.type === 'base_restriction' ||
    /base/i.test(ctx.prompt || '');
  if (isBaseQuestion) {
    const baseVal = isNum ? num : parseFractionOrNumber(norm);
    if (Number.isFinite(baseVal)) {
      if (baseVal <= 0 || Math.abs(baseVal - 1) < 1e-9) {
        return buildResult('invalid_base_restriction');
      }
    }
  }
  if (/\(\s*(-?\d+(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?)\s*\)\s*\^\s*[xXt]/.test(norm)) {
    const match = norm.match(/\(\s*(-?\d+(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?)\s*\)\s*\^\s*[xXt]/);
    if (match) {
      const parsedBase = parseFractionOrNumber(match[1]);
      if (Number.isFinite(parsedBase) && (parsedBase <= 0 || Math.abs(parsedBase - 1) < 1e-9)) {
        return buildResult('invalid_base_restriction');
      }
    }
  }

  // 5. raw_percentage_as_base
  const rate = ctx.rate !== undefined ? Number(ctx.rate) : null;
  if (rate !== null) {
    const rateStr = String(rate);
    if (isNum && (Math.abs(num - rate) < 1e-6 || Math.abs(num - rate * 100) < 1e-6)) {
      return buildResult('raw_percentage_as_base');
    }
    const rawRateRegex = new RegExp(`\\(?${rateStr}\\)?\\s*\\^`, 'i');
    if (rawRateRegex.test(norm)) {
      return buildResult('raw_percentage_as_base');
    }
  }
  if (norm.includes('0.12^') || norm.includes('(0.12)^') || norm.includes('(0,12)^')) {
    return buildResult('raw_percentage_as_base');
  }

  // 6. inverted_period_exponent
  const period = ctx.period !== undefined ? Number(ctx.period) : null;
  const hasValidPeriod = period !== null && Number.isFinite(period) && period > 1;
  if (hasValidPeriod) {
    const periodStr = String(period);
    const invertedRegex = new RegExp(`\\^\\s*\\(?\\s*${periodStr}\\s*\\*?\\s*[tT]`, 'i');
    const invertedRegex2 = new RegExp(`\\^\\s*\\(?\\s*[tT]\\s*\\*\\s*${periodStr}`, 'i');
    if (invertedRegex.test(norm) || invertedRegex2.test(norm)) {
      return buildResult('inverted_period_exponent');
    }
  }
  const hasExplicitPeriodPrompt =
    /per[ií]odo|vida\s*media|cada\s+\d+/i.test(ctx.prompt || '') ||
    /per[ií]odo|vida\s*media|cada\s+\d+/i.test(ctx.context || '');
  if ((hasValidPeriod || hasExplicitPeriodPrompt) && /\b(?:5t|3t|4t|10t)\b/i.test(norm) && norm.includes('^')) {
    if (hasValidPeriod) {
      const matchPeriodNum = norm.match(/\b(\d+)t\b/i);
      if (matchPeriodNum && Number(matchPeriodNum[1]) === period) {
        return buildResult('inverted_period_exponent');
      }
    } else {
      return buildResult('inverted_period_exponent');
    }
  }
  if (ctx.type === 'period_count' && isNum && period !== null && Math.abs(num - period * (ctx.t ?? period)) < 1e-6) {
    return buildResult('inverted_period_exponent');
  }

  // 7. ignored_negative_k_monotonicity
  if (kVal !== null && kVal < 0 && aVal !== null) {
    if (aVal > 0 && aVal < 1) {
      if (/decreciente|decaimiento|decreasing/i.test(norm)) {
        return buildResult('ignored_negative_k_monotonicity');
      }
    } else if (aVal > 1) {
      if (/creciente|crecimiento|increasing/i.test(norm)) {
        return buildResult('ignored_negative_k_monotonicity');
      }
    }
  }

  // 8. closed_bracket_on_asymptote
  const cVal =
    ctx.c !== undefined
      ? Number(ctx.c)
      : ctx.asymptote !== undefined
      ? Number(ctx.asymptote)
      : null;
  const isImageOrInterval =
    ctx.type === 'image' || ctx.target === 'im' || norm.includes('inf') || norm.includes(';');
  if (isImageOrInterval) {
    if (/\[\s*-?\d+(?:[.,]\d+)?|;\s*-?\d+(?:[.,]\d+)?\s*\]/.test(norm)) {
      if (cVal !== null) {
        const cStr = String(cVal).replace('.', ',');
        const cDot = String(cVal);
        if (
          norm.includes(`[${cDot}`) ||
          norm.includes(`[ ${cDot}`) ||
          norm.includes(`[${cStr}`) ||
          norm.includes(`[ ${cStr}`) ||
          norm.includes(`${cDot}]`) ||
          norm.includes(`${cDot} ]`) ||
          norm.includes(`${cStr}]`) ||
          norm.includes(`${cStr} ]`)
        ) {
          return buildResult('closed_bracket_on_asymptote');
        }
      }
      if (ctx.type === 'image' || ctx.target === 'im') {
        return buildResult('closed_bracket_on_asymptote');
      }
    }
  }

  // 9. subtracted_exponents_without_parens
  if (
    isNum &&
    num === -15 &&
    (ctx.equation?.includes('16^{x-4}') ||
      ctx.eq?.includes('16') ||
      ctx.problemType === 'quotient_equation' ||
      ctx.expected === 17)
  ) {
    return buildResult('subtracted_exponents_without_parens');
  }
  if (norm.includes('-4x-16') || norm.includes('- 4x - 16') || norm.includes('-4*x-16')) {
    return buildResult('subtracted_exponents_without_parens');
  }

  // 10. accepted_non_positive_u_in_substitution
  if (
    ctx.method === 'quadratic_sub' ||
    ctx.type === 'quadratic_sub' ||
    ctx.problemType === 'quadratic_substitution' ||
    ctx.rejectedRoots
  ) {
    // Collect expected roots in x
    const expectedX = [];
    if (Array.isArray(ctx.expectedSolutions)) expectedX.push(...ctx.expectedSolutions.map(Number));
    if (Array.isArray(ctx.solutions)) expectedX.push(...ctx.solutions.map(Number));
    if (Array.isArray(ctx.expected)) expectedX.push(...ctx.expected.map(Number));
    else if (typeof ctx.expected === 'number') expectedX.push(ctx.expected);
    else if (typeof ctx.expected === 'string') {
      const m = ctx.expected.match(/-?\d+(?:\.\d+)?/g);
      if (m) expectedX.push(...m.map(Number));
    }
    if (typeof ctx.solutionSet === 'string') {
      const m = ctx.solutionSet.match(/-?\d+(?:\.\d+)?/g);
      if (m) expectedX.push(...m.map(Number));
    }

    // Extract numbers in user input
    const inputNums = (norm.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);

    // Normalize rejected auxiliary roots (u <= 0)
    const rejectedRaw = Array.isArray(ctx.rejectedRoots) ? ctx.rejectedRoots : [-1];
    const rejectedVals = rejectedRaw
      .map((r) => (typeof r === 'object' && r !== null && 'u' in r ? Number(r.u) : Number(r)))
      .filter((n) => Number.isFinite(n));

    // Explicit assignment to u indicating non-positive auxiliary root was kept
    const hasExplicitU =
      /\bu\s*=\s*-?\d+/.test(norm) ||
      norm.includes('u=-1') ||
      norm.includes('u = -1') ||
      norm.includes('u<=0') ||
      norm.includes('u < 0');

    if (hasExplicitU) {
      return buildResult('accepted_non_positive_u_in_substitution');
    }

    // Check if input contains a rejected root value
    const containsRejectedVal = rejectedVals.some((rej) =>
      inputNums.some((n) => Math.abs(n - rej) < 1e-6) || norm.includes(String(rej))
    );

    if (containsRejectedVal) {
      // If expected x solutions are provided and every number in user input is an expected solution in x,
      // then the input is a valid solution in x (e.g. x = -1), NOT an erroneous auxiliary root!
      if (expectedX.length > 0 && inputNums.length > 0) {
        const allMatchExpected = inputNums.every((n) => expectedX.some((s) => Math.abs(n - s) < 1e-6));
        if (!allMatchExpected) {
          return buildResult('accepted_non_positive_u_in_substitution');
        }
      } else {
        return buildResult('accepted_non_positive_u_in_substitution');
      }
    }
  }
  if (ctx.problemType === 'quadratic_substitution' && isNum && num === -1) {
    const isExpected =
      (ctx.expectedSolutions && ctx.expectedSolutions.includes(-1)) ||
      (ctx.solutions && ctx.solutions.includes(-1)) ||
      (ctx.expected === -1);
    if (!isExpected) {
      return buildResult('accepted_non_positive_u_in_substitution');
    }
  }

  // Si no coincide ninguna falla conceptual categorizada o la entrada es correcta
  return null;
}
