/**
 * Alaska Math Lab · Función Cuadrática, Factorización y Parábolas
 * Motor Analítico, Geométrico y de Diagnóstico Cognitivo (100% puro, sin DOM ni eval).
 */

import {
  parseQuadExpr,
  equivalentQuadExpr,
  parseNumberOrFraction,
  parseOrderedPair,
  parseSetOrIntervalExactas,
  equivalentSetExactas,
  formatSetExactas,
} from './expr.js';
import { QUAD_DIAGNOSTIC_TAXONOMY, ERROR_CATEGORIES } from './competencies-map.js';

const EPS = 1e-9;

function cleanZero(v) {
  return Math.abs(v) < EPS ? 0 : Math.round(v * 1e9) / 1e9;
}

export function gcdInt(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function fmtNumClean(n) {
  const c = cleanZero(n);
  if (Number.isInteger(c)) return String(c);
  // Check common denominators up to 24
  for (let den = 2; den <= 24; den++) {
    const num = c * den;
    if (Math.abs(num - Math.round(num)) < 1e-6) {
      const rNum = Math.round(num);
      const g = gcdInt(rNum, den);
      return `${rNum / g}/${den / g}`;
    }
  }
  return String(Math.round(c * 1000) / 1000);
}

/**
 * Si Δ > 0 y los coeficientes son racionales/enteros, extrae el mayor cuadrado perfecto de Δ
 * y devuelve la descomposición exacta de (-b ± √Δ) / (2a):
 * { isExactRational, rationalPart, radicalCoeff, radicand, formattedPlus, formattedMinus }
 */
export function decomposeQuadraticRootsExact(a, b, c) {
  const disc = cleanZero(b * b - 4 * a * c);
  if (disc < -EPS) {
    return null;
  }
  const xv = cleanZero(-b / (2 * a));
  if (Math.abs(disc) <= EPS) {
    return {
      isExactRational: true,
      rationalPart: xv,
      radicalCoeff: 0,
      radicand: 0,
      formattedPlus: fmtNumClean(xv),
      formattedMinus: fmtNumClean(xv),
    };
  }

  // Escalamos si hay medios o cuartos para tener discriminante entero
  const scale = 12;
  const A = Math.round(a * scale);
  const B = Math.round(b * scale);
  const C = Math.round(c * scale);
  const isScaledInt =
    Math.abs(a * scale - A) < 1e-6 &&
    Math.abs(b * scale - B) < 1e-6 &&
    Math.abs(c * scale - C) < 1e-6;

  if (isScaledInt) {
    const D = B * B - 4 * A * C;
    if (D > 0) {
      // Extraer cuadrado perfecto de D: D = k^2 * rad
      let k = 1;
      let rad = D;
      for (let i = 2; i * i <= rad; i++) {
        while (rad % (i * i) === 0) {
          k *= i;
          rad /= i * i;
        }
      }
      const denom = Math.abs(2 * A);
      const rationalPart = cleanZero(-B / (2 * A));
      const radicalCoeff = cleanZero(k / denom);
      if (rad === 1) {
        const r1 = cleanZero(rationalPart - radicalCoeff);
        const r2 = cleanZero(rationalPart + radicalCoeff);
        return {
          isExactRational: true,
          rationalPart,
          radicalCoeff,
          radicand: 1,
          formattedMinus: fmtNumClean(Math.min(r1, r2)),
          formattedPlus: fmtNumClean(Math.max(r1, r2)),
        };
      }
      const coeffStr =
        Math.abs(radicalCoeff - 1) < 1e-7 ? '' : `${fmtNumClean(radicalCoeff)}·`;
      const ratStr = Math.abs(rationalPart) < 1e-7 ? '' : `${fmtNumClean(rationalPart)} `;
      return {
        isExactRational: false,
        rationalPart,
        radicalCoeff,
        radicand: rad,
        formattedMinus: `${ratStr ? ratStr + '− ' : '−'}${coeffStr}√${rad}`.trim(),
        formattedPlus: `${ratStr ? ratStr + '+ ' : ''}${coeffStr}√${rad}`.trim(),
      };
    }
  }

  const halfDist = Math.abs(Math.sqrt(disc) / (2 * a));
  return {
    isExactRational: false,
    rationalPart: xv,
    radicalCoeff: cleanZero(halfDist),
    radicand: disc,
    formattedMinus: fmtNumClean(xv - halfDist),
    formattedPlus: fmtNumClean(xv + halfDist),
  };
}

export function formatPolynomialString({ a, b, c }) {
  const ca = cleanZero(a);
  const cb = cleanZero(b);
  const cc = cleanZero(c);
  const parts = [];

  if (ca !== 0) {
    const aStr = ca === 1 ? '' : ca === -1 ? '-' : fmtNumClean(ca);
    parts.push(`${aStr}x^2`);
  }
  if (cb !== 0) {
    const sign = cb > 0 ? (parts.length ? ' + ' : '') : parts.length ? ' - ' : '-';
    const absB = Math.abs(cb);
    const bStr = absB === 1 ? '' : fmtNumClean(absB);
    parts.push(`${sign}${bStr}x`);
  }
  if (cc !== 0 || parts.length === 0) {
    const sign = cc >= 0 ? (parts.length ? ' + ' : '') : parts.length ? ' - ' : '-';
    parts.push(`${sign}${fmtNumClean(Math.abs(cc))}`);
  }
  return parts.join('');
}

export function formatCanonicalString({ a, xv, yv }) {
  const ca = cleanZero(a);
  const cxv = cleanZero(xv);
  const cyv = cleanZero(yv);
  const aStr = ca === 1 ? '' : ca === -1 ? '-' : fmtNumClean(ca);

  let sqPart = 'x^2';
  if (cxv !== 0) {
    const innerSign = cxv > 0 ? ' - ' : ' + ';
    sqPart = `(x${innerSign}${fmtNumClean(Math.abs(cxv))})^2`;
  }
  let res = `${aStr}${sqPart}`;
  if (cyv !== 0) {
    const ySign = cyv > 0 ? ' + ' : ' - ';
    res += `${ySign}${fmtNumClean(Math.abs(cyv))}`;
  }
  return res;
}

export function formatFactoredString({ a, roots, discriminant }) {
  if (discriminant < -EPS || !roots || roots.length === 0) {
    return null;
  }
  const ca = cleanZero(a);
  const aStr = ca === 1 ? '' : ca === -1 ? '-' : fmtNumClean(ca);
  const factorText = (r) => {
    const cr = cleanZero(r);
    if (cr === 0) return 'x';
    const sign = cr > 0 ? ' - ' : ' + ';
    return `(x${sign}${fmtNumClean(Math.abs(cr))})`;
  };

  if (roots.length === 1) {
    const f = factorText(roots[0]);
    return f === 'x' ? `${aStr}x^2` : `${aStr}${f}^2`;
  }
  const f1 = factorText(roots[0]);
  const f2 = factorText(roots[1]);
  if (f1 === 'x') return `${aStr}x${f2}`;
  if (f2 === 'x') return `${aStr}x${f1}`;
  return `${aStr}${f1}${f2}`;
}

/**
 * Construye el modelo analítico completo desde la forma polinómica f(x) = ax^2 + bx + c
 */
export function fromPolynomial({ a, b = 0, c = 0 }) {
  const ca = Number(a);
  const cb = Number(b);
  const cc = Number(c);
  if (!Number.isFinite(ca) || Math.abs(ca) < EPS) {
    throw new Error('El coeficiente cuadrático principal "a" debe ser un número real distinto de cero.');
  }
  const xv = cleanZero(-cb / (2 * ca));
  const yv = cleanZero(cc - (cb * cb) / (4 * ca));
  const discriminant = cleanZero(cb * cb - 4 * ca * cc);

  let roots = [];
  let rootMultiplicity = 0;
  const radicalDecomposition = decomposeQuadraticRootsExact(ca, cb, cc);

  if (Math.abs(discriminant) <= EPS) {
    roots = [xv];
    rootMultiplicity = 2;
  } else if (discriminant > EPS) {
    const deltaSqrt = Math.sqrt(discriminant);
    const r1 = cleanZero((-cb - deltaSqrt) / (2 * ca));
    const r2 = cleanZero((-cb + deltaSqrt) / (2 * ca));
    roots = r1 <= r2 ? [r1, r2] : [r2, r1];
    rootMultiplicity = 1;
  }

  const vieta = {
    sum: cleanZero(-cb / ca),
    product: cleanZero(cc / ca),
  };

  const coeffObj = { a: ca, b: cb, c: cc };
  const forms = {
    polynomial: formatPolynomialString(coeffObj),
    canonical: formatCanonicalString({ a: ca, xv, yv }),
    factored: formatFactoredString({ a: ca, roots, discriminant }),
  };

  return {
    a: cleanZero(ca),
    b: cleanZero(cb),
    c: cleanZero(cc),
    vertex: { xv, yv },
    axisOfSymmetry: xv,
    yIntercept: cleanZero(cc),
    concavity: ca > 0 ? 'up' : 'down',
    discriminant,
    roots,
    rootMultiplicity,
    radicalDecomposition,
    vieta,
    forms,
  };
}

/**
 * Construye el modelo unificado desde la forma canónica f(x) = a(x - xv)^2 + yv
 */
export function fromCanonical({ a, xv = 0, yv = 0 }) {
  const ca = Number(a);
  const cxv = Number(xv);
  const cyv = Number(yv);
  if (!Number.isFinite(ca) || Math.abs(ca) < EPS) {
    throw new Error('El coeficiente principal "a" debe ser distinto de cero.');
  }
  const b = cleanZero(-2 * ca * cxv);
  const c = cleanZero(ca * cxv * cxv + cyv);
  return fromPolynomial({ a: ca, b, c });
}

/**
 * Construye el modelo unificado desde la forma factorizada f(x) = a(x - x1)(x - x2)
 */
export function fromFactored({ a, x1, x2 = x1 }) {
  const ca = Number(a);
  const cx1 = Number(x1);
  const cx2 = Number(x2);
  if (!Number.isFinite(ca) || Math.abs(ca) < EPS) {
    throw new Error('El coeficiente principal "a" debe ser distinto de cero.');
  }
  const b = cleanZero(-ca * (cx1 + cx2));
  const c = cleanZero(ca * cx1 * cx2);
  return fromPolynomial({ a: ca, b, c });
}

/**
 * Reconstruye analíticamente la función cuadrática a partir de datos geométricos:
 * - Caso 1: vertex { xv, yv } y point { x, y } (o yIntercept)
 * - Caso 2: roots [x1, x2] y point { x, y } (o yIntercept)
 */
export function fitQuadratic({ vertex = null, point = null, roots = null, yIntercept = null }) {
  const targetPoint =
    point !== null
      ? { x: Number(point.x), y: Number(point.y) }
      : yIntercept !== null
      ? { x: 0, y: Number(yIntercept) }
      : null;

  if (vertex && targetPoint) {
    const xv = Number(vertex.xv ?? vertex.x);
    const yv = Number(vertex.yv ?? vertex.y);
    const dx = targetPoint.x - xv;
    if (Math.abs(dx) < EPS) {
      throw new Error('El punto de paso no puede tener la misma abscisa que el vértice.');
    }
    const a = cleanZero((targetPoint.y - yv) / (dx * dx));
    if (Math.abs(a) < EPS) {
      throw new Error('El punto de paso tiene la misma altura que el vértice; "a" resultaría 0.');
    }
    const model = fromCanonical({ a, xv, yv });
    return {
      ...model,
      method: 'canonical_vertex_and_point',
      steps: [
        `Elegimos el molde canónico porque conocemos el vértice V(${fmtNumClean(xv)}; ${fmtNumClean(yv)}): f(x) = a·(x − (${fmtNumClean(xv)}))² + (${fmtNumClean(yv)}).`,
        `Reemplazamos el punto de paso P(${fmtNumClean(targetPoint.x)}; ${fmtNumClean(targetPoint.y)}): ${fmtNumClean(targetPoint.y)} = a·(${fmtNumClean(targetPoint.x)} − (${fmtNumClean(xv)}))² + (${fmtNumClean(yv)}).`,
        `Despejamos el coeficiente principal: a = (${fmtNumClean(targetPoint.y)} − (${fmtNumClean(yv)})) / (${fmtNumClean(dx * dx)}) = ${fmtNumClean(a)}.`,
        `Ecuación canónica final: f(x) = ${model.forms.canonical} (o en forma polinómica: ${model.forms.polynomial}).`,
      ],
    };
  }

  if (Array.isArray(roots) && roots.length >= 1 && targetPoint) {
    const x1 = Number(roots[0]);
    const x2 = Number(roots.length >= 2 ? roots[1] : roots[0]);
    const denom = (targetPoint.x - x1) * (targetPoint.x - x2);
    if (Math.abs(denom) < EPS) {
      throw new Error('El punto de paso no puede coincidir con una de las raíces.');
    }
    const a = cleanZero(targetPoint.y / denom);
    if (Math.abs(a) < EPS) {
      throw new Error('El punto de paso debe tener altura distinta de cero fuera de las raíces.');
    }
    const model = fromFactored({ a, x1, x2 });
    return {
      ...model,
      method: 'factored_roots_and_point',
      steps: [
        `Elegimos el molde factorizado porque conocemos las raíces x₁ = ${fmtNumClean(x1)} y x₂ = ${fmtNumClean(x2)}: f(x) = a·(x − (${fmtNumClean(x1)}))·(x − (${fmtNumClean(x2)})).`,
        `Reemplazamos el punto de paso P(${fmtNumClean(targetPoint.x)}; ${fmtNumClean(targetPoint.y)}): ${fmtNumClean(targetPoint.y)} = a·(${fmtNumClean(targetPoint.x - x1)})·(${fmtNumClean(targetPoint.x - x2)}).`,
        `Despejamos el coeficiente principal: a = ${fmtNumClean(targetPoint.y)} / (${fmtNumClean(denom)}) = ${fmtNumClean(a)}.`,
        `Ecuación factorizada final: f(x) = ${model.forms.factored} (o en forma polinómica: ${model.forms.polynomial}).`,
      ],
    };
  }

  throw new Error('Datos insuficientes para reconstruir la función cuadrática.');
}

/**
 * Desglosa paso a paso el método de completar el cuadrado en f(x) = ax^2 + bx + c
 */
export function completeTheSquareSteps({ a, b, c }) {
  const model = fromPolynomial({ a, b, c });
  const ca = model.a;
  const cb = model.b;
  const cc = model.c;

  const linearOverA = cleanZero(cb / ca);
  const halfLinear = cleanZero(cb / (2 * ca));
  const squareAdded = cleanZero(halfLinear * halfLinear);
  const xv = model.vertex.xv;
  const yv = model.vertex.yv;

  const steps = [];
  steps.push({
    id: 'step_1_original',
    title: '1. Expresión polinómica de partida',
    formula: `f(x) = ${model.forms.polynomial}`,
    explanation: `Identificamos a = ${fmtNumClean(ca)}, b = ${fmtNumClean(cb)} y la ordenada al origen c = ${fmtNumClean(cc)}.`,
  });

  if (Math.abs(ca - 1) > EPS) {
    steps.push({
      id: 'step_2_factor_a',
      title: '2. Extraer el coeficiente principal a de los términos con x',
      formula: `f(x) = ${fmtNumClean(ca)} · [ x² ${linearOverA >= 0 ? '+ ' : '− '}${fmtNumClean(Math.abs(linearOverA))}x ] ${cc >= 0 ? '+ ' : '− '}${fmtNumClean(Math.abs(cc))}`,
      explanation: `Sacamos factor común a = ${fmtNumClean(ca)} de los dos primeros términos para dejar x² con coeficiente 1 dentro del corchete.`,
    });
  } else {
    steps.push({
      id: 'step_2_split_linear',
      title: '2. Partir el término lineal en dos alas simétricas',
      formula: `x² ${cb >= 0 ? '+ ' : '− '}2 · (${fmtNumClean(Math.abs(halfLinear))}) · x`,
      explanation: `La mitad del coeficiente lineal (${fmtNumClean(linearOverA)}) es ${fmtNumClean(halfLinear)}. Cada ala rectangular del cuadrado tiene ancho ${fmtNumClean(Math.abs(halfLinear))}.`,
    });
  }

  steps.push({
    id: 'step_3_additive_zero',
    title: '3. Fabricar el neutro aditivo (+0) sumando y restando la esquina',
    formula:
      Math.abs(ca - 1) > EPS
        ? `f(x) = ${fmtNumClean(ca)} · [ x² ${linearOverA >= 0 ? '+ ' : '− '}${fmtNumClean(Math.abs(linearOverA))}x + ${fmtNumClean(squareAdded)} − ${fmtNumClean(squareAdded)} ] ${cc >= 0 ? '+ ' : '− '}${fmtNumClean(Math.abs(cc))}`
        : `f(x) = (x² ${cb >= 0 ? '+ ' : '− '}${fmtNumClean(Math.abs(cb))}x + ${fmtNumClean(squareAdded)}) − ${fmtNumClean(squareAdded)} ${cc >= 0 ? '+ ' : '− '}${fmtNumClean(Math.abs(cc))}`,
    explanation: `Para cerrar el cuadrado de lado (x ${halfLinear >= 0 ? '+ ' : '− '}${fmtNumClean(Math.abs(halfLinear))}) necesitamos sumar (${fmtNumClean(Math.abs(halfLinear))})² = ${fmtNumClean(squareAdded)}. Para no alterar la función, restamos ese mismo ${fmtNumClean(squareAdded)} inmediatamente (sumamos +0).`,
  });

  steps.push({
    id: 'step_4_collapse_square',
    title: '4. Cerrar el trinomio cuadrado perfecto y despejar la constante',
    formula: `f(x) = ${model.forms.canonical}`,
    explanation:
      Math.abs(ca - 1) > EPS
        ? `Los tres primeros términos forman (x ${xv > 0 ? '− ' : '+ '}${fmtNumClean(Math.abs(xv))})². Al salir del corchete, −${fmtNumClean(squareAdded)} se multiplica por a = ${fmtNumClean(ca)} dando ${fmtNumClean(-ca * squareAdded)}, y sumado con ${fmtNumClean(cc)} entrega yᵥ = ${fmtNumClean(yv)}.`
        : `Los tres primeros términos colapsan en (x ${xv > 0 ? '− ' : '+ '}${fmtNumClean(Math.abs(xv))})² y afuera combinamos −${fmtNumClean(squareAdded)} + (${fmtNumClean(cc)}) = ${fmtNumClean(yv)}. Vértice en (${fmtNumClean(xv)}; ${fmtNumClean(yv)}).`,
  });

  return {
    a: ca,
    b: cb,
    c: cc,
    linearOverA,
    halfLinear,
    squareAdded,
    xv,
    yv,
    canonicalForm: model.forms.canonical,
    steps,
  };
}

/**
 * Aplica la Brújula de 5 Pasos de Khan Academy para factorizar ax^2 + bx + c:
 * 1.º Factor común (MCD)
 * 2.º Diferencia de cuadrados (b = 0 y -c/a cuadrado perfecto)
 * 3.º Trinomio cuadrado perfecto (Δ = 0)
 * 4.º Suma-producto mónico (después de extraer a)
 * 5.º Agrupación buscando m · n = A · C y m + n = B
 */
export function factorQuadraticSteps({ a, b = 0, c = 0 }) {
  const model = fromPolynomial({ a, b, c });
  const ca = model.a;
  const cb = model.b;
  const cc = model.c;
  const checklist = [];

  const isInt =
    Number.isInteger(ca) && Number.isInteger(cb) && Number.isInteger(cc);
  let g = isInt ? gcdInt(gcdInt(ca, cb), cc) : 1;
  if (ca < 0) g = -g;

  const A = cleanZero(ca / g);
  const B = cleanZero(cb / g);
  const C = cleanZero(cc / g);

  checklist.push({
    step: 1,
    question: '¿Existe un factor común en todos los términos?',
    matched: Math.abs(g) !== 1 || g < 0,
    detail:
      Math.abs(g) !== 1 || g < 0
        ? `Extraemos el factor común ${fmtNumClean(g)}: ${fmtNumClean(g)} · (${formatPolynomialString({ a: A, b: B, c: C })}).`
        : 'Los coeficientes no comparten un divisor entero común mayor que 1.',
  });

  // Caso incompleto C = 0 (Factor común x)
  if (Math.abs(C) <= EPS) {
    return {
      strategy: 'common_factor_x',
      strategyLabel: 'Extracción de factor común x (cuadrática incompleta c = 0)',
      commonFactor: g,
      factoredForm: model.forms.factored,
      roots: model.roots,
      checklist,
      groupingPair: null,
    };
  }

  // Paso 2: Diferencia de cuadrados (B = 0 y A > 0, C < 0)
  const isDiffSquares =
    Math.abs(B) <= EPS && A * C < 0 && Number.isInteger(Math.sqrt(Math.abs(A * C)));
  checklist.push({
    step: 2,
    question: '¿Tiene solo dos términos y es una diferencia de cuadrados (u² − v²)?',
    matched: isDiffSquares,
    detail: isDiffSquares
      ? `No hay término lineal (b = 0) y los cuadrados se factorizan como suma por diferencia: ${model.forms.factored}.`
      : 'Tiene término lineal distinto de cero o no es una resta de cuadrados perfectos.',
  });
  if (isDiffSquares) {
    return {
      strategy: 'difference_of_squares',
      strategyLabel: 'Diferencia de cuadrados (u + v)(u − v)',
      commonFactor: g,
      factoredForm: model.forms.factored,
      roots: model.roots,
      checklist,
      groupingPair: null,
    };
  }

  // Paso 3: Trinomio cuadrado perfecto (Δ = 0)
  const isPerfectSquare = Math.abs(model.discriminant) <= EPS;
  checklist.push({
    step: 3,
    question: '¿Es un trinomio cuadrado perfecto (Δ = 0)?',
    matched: isPerfectSquare,
    detail: isPerfectSquare
      ? `El término central coincide con el doble producto de las bases: se compacta en el cuadrado de un binomio ${model.forms.factored}.`
      : 'El discriminante no es cero, por lo que las dos raíces no son iguales.',
  });
  if (isPerfectSquare) {
    return {
      strategy: 'perfect_square_trinomial',
      strategyLabel: 'Trinomio cuadrado perfecto',
      commonFactor: g,
      factoredForm: model.forms.factored,
      roots: model.roots,
      checklist,
      groupingPair: null,
    };
  }

  // Buscamos par m, n tal que m * n = A * C y m + n = B
  const targetProd = Math.round(A * C);
  const targetSum = Math.round(B);
  let foundPair = null;
  if (
    Math.abs(A * C - targetProd) < 1e-6 &&
    Math.abs(B - targetSum) < 1e-6 &&
    Math.abs(targetProd) <= 10000
  ) {
    const limit = Math.abs(targetProd);
    for (let d = 1; d <= limit; d++) {
      if (targetProd % d === 0) {
        const candidates = [
          [d, targetProd / d],
          [-d, -targetProd / d],
        ];
        for (const [m, n] of candidates) {
          if (m + n === targetSum) {
            foundPair = { m, n, product: targetProd, sum: targetSum };
            break;
          }
        }
      }
      if (foundPair) break;
    }
  }

  if (Math.abs(A - 1) <= EPS && foundPair) {
    checklist.push({
      step: 4,
      question: 'Con coeficiente cuadrático 1: ¿hay dos enteros que sumen b y multipliquen c?',
      matched: true,
      detail: `Los números m = ${foundPair.m} y n = ${foundPair.n} cumplen (${foundPair.m}) + (${foundPair.n}) = ${targetSum} y (${foundPair.m}) · (${foundPair.n}) = ${targetProd}.`,
    });
    return {
      strategy: 'sum_product_monic',
      strategyLabel: 'Balanza Suma-Producto (x + m)(x + n)',
      commonFactor: g,
      factoredForm: model.forms.factored,
      roots: model.roots,
      checklist,
      groupingPair: foundPair,
    };
  }

  checklist.push({
    step: 4,
    question: 'Con coeficiente cuadrático 1: ¿hay dos enteros que sumen b y multipliquen c?',
    matched: false,
    detail:
      Math.abs(A - 1) > EPS
        ? `El coeficiente cuadrático reducido es A = ${fmtNumClean(A)} ≠ 1; pasamos a agrupación.`
        : 'No existen divisores enteros exactos; usamos fórmula resolvente o completar cuadrados.',
  });

  checklist.push({
    step: 5,
    question: 'Para A ≠ 1: ¿existen m y n tales que m · n = A · C y m + n = B para agrupar?',
    matched: Boolean(foundPair),
    detail: foundPair
      ? `Partimos ${targetSum}x en ${foundPair.m}x + (${foundPair.n}x) porque (${foundPair.m}) · (${foundPair.n}) = ${A} · (${C}) = ${targetProd}.`
      : 'Las raíces son irracionales o no existen en ℝ; usamos directamente la fórmula resolvente.',
  });

  return {
    strategy: foundPair ? 'grouping_ac' : 'quadratic_formula_general',
    strategyLabel: foundPair
      ? 'Factorización por agrupación (m · n = a · c)'
      : 'Fórmula resolvente general',
    commonFactor: g,
    factoredForm: model.forms.factored,
    roots: model.roots,
    checklist,
    groupingPair: foundPair,
  };
}

/**
 * Radiografía analítica completa estilo Exactas UNMDP
 */
export function analyzeQuadratic({ a, b = 0, c = 0 }) {
  const model = fromPolynomial({ a, b, c });
  const { xv, yv } = model.vertex;
  const xvStr = fmtNumClean(xv);
  const yvStr = fmtNumClean(yv);

  const image = model.a > 0 ? `[${yvStr}; +inf)` : `(-inf; ${yvStr}]`;
  const increasingInterval = model.a > 0 ? `(${xvStr}; +inf)` : `(-inf; ${xvStr})`;
  const decreasingInterval = model.a > 0 ? `(-inf; ${xvStr})` : `(${xvStr}; +inf)`;

  let C0 = 'vacio';
  let CPlus = 'vacio';
  let CMinus = 'vacio';

  if (model.roots.length === 0) {
    C0 = 'vacio';
    if (model.a > 0) {
      CPlus = 'R';
      CMinus = 'vacio';
    } else {
      CPlus = 'vacio';
      CMinus = 'R';
    }
  } else if (model.roots.length === 1) {
    const r0 = fmtNumClean(model.roots[0]);
    C0 = `{${r0}}`;
    if (model.a > 0) {
      CPlus = `(-inf; ${r0}) U (${r0}; +inf)`;
      CMinus = 'vacio';
    } else {
      CPlus = 'vacio';
      CMinus = `(-inf; ${r0}) U (${r0}; +inf)`;
    }
  } else {
    const r1 = fmtNumClean(model.roots[0]);
    const r2 = fmtNumClean(model.roots[1]);
    C0 = `{${r1}; ${r2}}`;
    if (model.a > 0) {
      CPlus = `(-inf; ${r1}) U (${r2}; +inf)`;
      CMinus = `(${r1}; ${r2})`;
    } else {
      CPlus = `(${r1}; ${r2})`;
      CMinus = `(-inf; ${r1}) U (${r2}; +inf)`;
    }
  }

  return {
    ...model,
    domain: 'R',
    image,
    C0,
    CPlus,
    CMinus,
    increasingInterval,
    decreasingInterval,
    extremum: {
      type: model.a > 0 ? 'min' : 'max',
      label: model.a > 0 ? 'Mínimo absoluto' : 'Máximo absoluto',
      x: xv,
      y: yv,
    },
    bijectivity: {
      isInjective: false,
      isSurjective: false,
      restrictedBranches: [`(-inf; ${xvStr}]`, `[${xvStr}; +inf)`],
      restrictedCodomain: image,
    },
  };
}

/**
 * Analiza la intersección entre la parábola f(x) = ax^2 + bx + c y la recta g(x) = mx + d
 */
export function intersectParabolaLine({ a, b = 0, c = 0 }, { m = 0, d = 0 }) {
  const ca = Number(a);
  const cb = Number(b);
  const cc = Number(c);
  const cm = Number(m);
  const cd = Number(d);

  if (!Number.isFinite(ca) || Math.abs(ca) < EPS) {
    throw new Error('El coeficiente cuadrático "a" debe ser distinto de cero.');
  }

  const diffB = cleanZero(cb - cm);
  const diffC = cleanZero(cc - cd);
  const discriminant = cleanZero(diffB * diffB - 4 * ca * diffC);

  let classification = 'exterior';
  const points = [];

  if (Math.abs(discriminant) <= EPS) {
    classification = 'tangent';
    const x0 = cleanZero(-diffB / (2 * ca));
    const y0 = cleanZero(cm * x0 + cd);
    points.push({ x: x0, y: y0 });
  } else if (discriminant > EPS) {
    classification = 'secant';
    const sqrtD = Math.sqrt(discriminant);
    const x1 = cleanZero((-diffB - sqrtD) / (2 * ca));
    const x2 = cleanZero((-diffB + sqrtD) / (2 * ca));
    const sorted = x1 <= x2 ? [x1, x2] : [x2, x1];
    for (const xi of sorted) {
      points.push({ x: xi, y: cleanZero(cm * xi + cd) });
    }
  }

  // Condición analítica de tangencia para la pendiente k cuando la ordenada al origen de la recta es fija en d:
  // (b - k)^2 - 4a(c - d) = 0  =>  b - k = ± sqrt(4a(c - d))
  const tangencyRadicand = cleanZero(4 * ca * (cc - cd));
  let tangentSlopesFromD = [];
  if (Math.abs(tangencyRadicand) <= EPS) {
    tangentSlopesFromD = [cb];
  } else if (tangencyRadicand > EPS) {
    const s = Math.sqrt(tangencyRadicand);
    const k1 = cleanZero(cb - s);
    const k2 = cleanZero(cb + s);
    tangentSlopesFromD = k1 <= k2 ? [k1, k2] : [k2, k1];
  }

  // Y la ordenada al origen d_tan que hace tangente una recta de pendiente m fija:
  // c - d_tan = (b - m)^2 / (4a) => d_tan = c - (b - m)^2 / (4a)
  const tangentInterceptForSlopeM = cleanZero(cc - (diffB * diffB) / (4 * ca));

  return {
    differenceCoeffs: { a: ca, b: diffB, c: diffC },
    differenceEquation: `${formatPolynomialString({ a: ca, b: diffB, c: diffC })} = 0`,
    discriminant,
    classification,
    points,
    tangencyCondition: {
      tangentSlopesFromD,
      tangentInterceptForSlopeM,
    },
  };
}

/**
 * Catálogo de los 10 diagnósticos cognitivos de Función Cuadrática
 */
export const QUAD_DIAGNOSTICS = Object.freeze({
  inverted_vertex_h_sign: {
    ...QUAD_DIAGNOSTIC_TAXONOMY.inverted_vertex_h_sign,
    message:
      '¡Ojo con el espejismo del paréntesis en la forma canónica! En a(x − xᵥ)² + yᵥ, la coordenada horizontal del vértice es el valor de x que hace que adentro del paréntesis quede exactamente CERO. Si dice (x + 2)², se anula en xᵥ = −2; si dice (x − 3)², se anula en xᵥ = +3.',
  },
  confused_c_with_canonical_k: {
    ...QUAD_DIAGNOSTIC_TAXONOMY.confused_c_with_canonical_k,
    message:
      '¡Cuidado! Confundiste la altura del vértice (yᵥ) con la ordenada al origen f(0). El número suelto afuera de la forma canónica a(x − xᵥ)² + yᵥ es la altura en x = xᵥ, NO el corte con el eje Y. Para hallar la ordenada al origen tenés que evaluar x = 0 y desarrollar a·(0 − xᵥ)² + yᵥ.',
  },
  distributed_square_over_sum: {
    ...QUAD_DIAGNOSTIC_TAXONOMY.distributed_square_over_sum,
    message:
      '¡Trampa clásica de parcial! La potencia NO se distribuye respecto de la suma ni de la resta: (a ± b)² nunca es a² ± b². Cuando armás el cuadrado de lado (a ± b), además de los dos cuadrados de las esquinas aparecen los dos rectángulos cruzados que suman el doble producto ±2ab.',
  },
  divided_by_x_lost_zero_root: {
    ...QUAD_DIAGNOSTIC_TAXONOMY.divided_by_x_lost_zero_root,
    message:
      '¡Alto ahí! Pasaste dividiendo o «tachaste la x» en una cuadrática incompleta ax² + bx = 0 y en el camino mataste la solución x = 0. Como no se puede dividir por cero, nunca taches una incógnita: sacá factor común x·(ax + b) = 0 para conservar las dos raíces.',
  },
  omitted_plus_minus_in_square_root: {
    ...QUAD_DIAGNOSTIC_TAXONOMY.omitted_plus_minus_in_square_root,
    message:
      'Te quedaste con una sola mitad de la parábola. Cuando despejás un cuadrado haciendo √((x − xᵥ)²) = √k, recordá del módulo de Valor Absoluto que √(u²) = |u|. Hay dos números simétricos (uno positivo y otro negativo) que elevados al cuadrado dan k: x − xᵥ = ±√k.',
  },
  forgot_leading_a_in_factored_form: {
    ...QUAD_DIAGNOSTIC_TAXONOMY.forgot_leading_a_in_factored_form,
    message:
      'Tus raíces están bien ubicadas en (x − x₁)(x − x₂), pero te olvidaste de multiplicar adelante por el coeficiente principal "a". Infinitas parábolas pasan por las mismas dos raíces; el factor "a" es el que ajusta su abertura vertical para que pase por el punto pedido.',
  },
  unbalanced_completing_square: {
    ...QUAD_DIAGNOSTIC_TAXONOMY.unbalanced_completing_square,
    message:
      'Se te desbalanceó la igualdad al completar el cuadrado. Recordá dos reglas de oro: 1) todo lo que sumás adentro para cerrar el trinomio (b/(2a))² también tenés que restarlo para fabricar el neutro aditivo +0; y 2) al sacar ese término restado afuera del corchete, sale multiplicado por el factor principal "a".',
  },
  neg_b_or_square_sign_in_resolvente: {
    ...QUAD_DIAGNOSTIC_TAXONOMY.neg_b_or_square_sign_in_resolvente,
    message:
      '¡Emboscada de signos en la fórmula resolvente! Cuando el coeficiente lineal b es negativo, pasan dos cosas: adelante va −b (menos por menos queda POSITIVO), y adentro de la raíz va (−b)², que como todo número real elevado al cuadrado SIEMPRE da POSITIVO.',
  },
  used_yv_for_monotonicity_or_open_image: {
    ...QUAD_DIAGNOSTIC_TAXONOMY.used_yv_for_monotonicity_or_open_image,
    message:
      'Mezclaste el piso (eje X) con la altura (eje Y), o dejaste abierto el vértice en la Imagen. Los intervalos de crecimiento y decrecimiento se leen SIEMPRE en el eje X quebrando en xᵥ (no en yᵥ). En cambio, la Imagen se lee en el eje Y y lleva CORCHETE CERRADO en yᵥ ([yᵥ; +∞) o (−∞; yᵥ]) porque la parábola sí pisa su vértice.',
  },
  confused_sum_product_signs_vieta: {
    ...QUAD_DIAGNOSTIC_TAXONOMY.confused_sum_product_signs_vieta,
    message:
      'Ojo con los signos de la suma y el producto de las raíces: al expandir a(x − x₁)(x − x₂) = ax² − a(x₁ + x₂)x + a(x₁·x₂), aparece un signo menos delante de la suma. Por eso la suma de las raíces es x₁ + x₂ = −b/a (con el signo cambiado) mientras que el producto es x₁·x₂ = c/a.',
  },
});

/**
 * Motor de diagnóstico cognitivo para entradas del usuario en cuadráticas.
 * Devuelve un objeto diagnóstico enriquecido o null si no detecta un patrón específico.
 */
export function diagnoseQuad(userInput, context = {}) {
  const raw = String(userInput ?? '').trim();
  if (!raw) return null;

  // Permitir forzar o resolver por mapa explícito si la opción elegida ya fue etiquetada
  if (context.diagnosticMap && context.diagnosticMap[raw]) {
    const id = context.diagnosticMap[raw];
    if (QUAD_DIAGNOSTICS[id]) return { ...QUAD_DIAGNOSTICS[id] };
  }

  const a = Number(context.a ?? 1);
  const b = Number(context.b ?? 0);
  const c = Number(context.c ?? 0);
  const hasModel = Number.isFinite(a) && Math.abs(a) > EPS;
  const model = hasModel ? fromPolynomial({ a, b, c }) : null;
  const xv = Number.isFinite(context.xv) ? Number(context.xv) : model?.vertex.xv;
  const yv = Number.isFinite(context.yv) ? Number(context.yv) : model?.vertex.yv;

  let numVal = null;
  try {
    numVal = parseNumberOrFraction(raw);
  } catch {
    numVal = null;
  }

  let pairVal = null;
  try {
    pairVal = parseOrderedPair(raw);
  } catch {
    pairVal = null;
  }

  let setVal = { ok: false };
  try {
    setVal = parseSetOrIntervalExactas(raw);
  } catch {
    setVal = { ok: false };
  }

  let exprVal = { ok: false };
  try {
    exprVal = parseQuadExpr(raw);
  } catch {
    exprVal = { ok: false };
  }

  // 1. inverted_vertex_h_sign
  if (
    context.target === 'vertex' ||
    context.target === 'xv' ||
    context.target === 'canonical'
  ) {
    if (xv !== undefined && Math.abs(xv) > EPS) {
      if (numVal !== null && Math.abs(numVal - -xv) < 1e-6) {
        return { ...QUAD_DIAGNOSTICS.inverted_vertex_h_sign };
      }
      if (
        pairVal &&
        Math.abs(pairVal.x - -xv) < 1e-6 &&
        (yv === undefined || Math.abs(pairVal.y - yv) < 1e-6)
      ) {
        return { ...QUAD_DIAGNOSTICS.inverted_vertex_h_sign };
      }
      if (exprVal.ok && model) {
        const wrongCanon = fromCanonical({ a: model.a, xv: -xv, yv: model.vertex.yv });
        if (
          Math.abs(exprVal.coeffs.a - wrongCanon.a) < 1e-6 &&
          Math.abs(exprVal.coeffs.b - wrongCanon.b) < 1e-6 &&
          Math.abs(exprVal.coeffs.c - wrongCanon.c) < 1e-6
        ) {
          return { ...QUAD_DIAGNOSTICS.inverted_vertex_h_sign };
        }
      }
    }
  }

  // 2. confused_c_with_canonical_k
  if (context.target === 'y_intercept' || context.target === 'vertex_or_c') {
    if (yv !== undefined && model && Math.abs(yv - model.c) > 1e-6) {
      if (numVal !== null && Math.abs(numVal - yv) < 1e-6) {
        return { ...QUAD_DIAGNOSTICS.confused_c_with_canonical_k };
      }
      if (pairVal && Math.abs(pairVal.x) < 1e-6 && Math.abs(pairVal.y - yv) < 1e-6) {
        return { ...QUAD_DIAGNOSTICS.confused_c_with_canonical_k };
      }
    }
  }

  // 3. distributed_square_over_sum: (p*x + q)^2 -> p^2*x^2 ± q^2 (sin término lineal 2pqx)
  if (
    context.target === 'expand_binomial_square' ||
    context.binomialSquare ||
    exprVal.ok
  ) {
    if (exprVal.ok && model && Math.abs(model.b) > EPS) {
      // Si el usuario puso b = 0 y c = ±(q^2) al desarrollar un cuadrado de binomio
      if (
        Math.abs(exprVal.coeffs.a - model.a) < 1e-6 &&
        Math.abs(exprVal.coeffs.b) < 1e-6 &&
        (Math.abs(exprVal.coeffs.c - model.c) < 1e-6 ||
          Math.abs(exprVal.coeffs.c - -model.c) < 1e-6)
      ) {
        return { ...QUAD_DIAGNOSTICS.distributed_square_over_sum };
      }
    }
  }

  // 4. divided_by_x_lost_zero_root: en ax^2 + bx = 0 reportó solamente la raíz -b/a omitiendo 0
  if (
    (context.target === 'roots' || context.target === 'C0') &&
    model &&
    Math.abs(model.c) < EPS &&
    Math.abs(model.b) > EPS
  ) {
    const nonZeroRoot = cleanZero(-model.b / model.a);
    if (numVal !== null && Math.abs(numVal - nonZeroRoot) < 1e-6) {
      return { ...QUAD_DIAGNOSTICS.divided_by_x_lost_zero_root };
    }
    if (
      setVal.ok &&
      setVal.kind === 'finite_set' &&
      setVal.values.length === 1 &&
      Math.abs(setVal.values[0] - nonZeroRoot) < 1e-6
    ) {
      return { ...QUAD_DIAGNOSTICS.divided_by_x_lost_zero_root };
    }
  }

  // 5. omitted_plus_minus_in_square_root: en a(x - xv)^2 + yv = 0 reportó solo xv + sqrt(-yv/a)
  if (
    (context.target === 'roots' || context.target === 'C0' || context.target === 'canonical_roots') &&
    model &&
    model.roots.length === 2 &&
    Math.abs(model.c) > EPS
  ) {
    const posBranch = model.roots[1];
    const negBranch = model.roots[0];
    if (
      numVal !== null &&
      (Math.abs(numVal - posBranch) < 1e-6 || Math.abs(numVal - negBranch) < 1e-6)
    ) {
      return { ...QUAD_DIAGNOSTICS.omitted_plus_minus_in_square_root };
    }
    if (
      setVal.ok &&
      setVal.kind === 'finite_set' &&
      setVal.values.length === 1 &&
      (Math.abs(setVal.values[0] - posBranch) < 1e-6 ||
        Math.abs(setVal.values[0] - negBranch) < 1e-6)
    ) {
      return { ...QUAD_DIAGNOSTICS.omitted_plus_minus_in_square_root };
    }
  }

  // 6. forgot_leading_a_in_factored_form: escribió (x - x1)(x - x2) con coeficiente 1 cuando a != 1
  if (
    exprVal.ok &&
    model &&
    Math.abs(model.a - 1) > EPS &&
    model.roots.length >= 1
  ) {
    const monicModel = fromFactored({
      a: 1,
      x1: model.roots[0],
      x2: model.roots.length === 2 ? model.roots[1] : model.roots[0],
    });
    if (
      Math.abs(exprVal.coeffs.a - 1) < 1e-6 &&
      Math.abs(exprVal.coeffs.b - monicModel.b) < 1e-6 &&
      Math.abs(exprVal.coeffs.c - monicModel.c) < 1e-6
    ) {
      return { ...QUAD_DIAGNOSTICS.forgot_leading_a_in_factored_form };
    }
  }

  // 7. unbalanced_completing_square:
  // En ax^2 + bx + c -> a(x - xv)^2 + c (olvidó restar a*xv^2)
  // o a(x - xv)^2 + c - xv^2 (olvidó multiplicar xv^2 por a al sacarlo del corchete)
  if (
    (context.target === 'canonical' || context.target === 'completing_square' || context.target === 'yv') &&
    model
  ) {
    const xvSq = model.vertex.xv * model.vertex.xv;
    const wrongYvNoSub = cleanZero(model.c);
    const wrongYvAdded = cleanZero(model.c + model.a * xvSq);
    const wrongYvUnscaled = cleanZero(model.c - xvSq);

    if (
      numVal !== null &&
      Math.abs(model.vertex.xv) > EPS &&
      (Math.abs(numVal - wrongYvNoSub) < 1e-6 ||
        Math.abs(numVal - wrongYvAdded) < 1e-6 ||
        (Math.abs(model.a - 1) > EPS && Math.abs(numVal - wrongYvUnscaled) < 1e-6))
    ) {
      return { ...QUAD_DIAGNOSTICS.unbalanced_completing_square };
    }

    if (exprVal.ok && Math.abs(model.vertex.xv) > EPS) {
      const userYv = cleanZero(
        exprVal.coeffs.c - (exprVal.coeffs.b * exprVal.coeffs.b) / (4 * (exprVal.coeffs.a || 1))
      );
      if (
        Math.abs(exprVal.coeffs.a - model.a) < 1e-6 &&
        Math.abs(exprVal.coeffs.b - model.b) < 1e-6 &&
        (Math.abs(userYv - wrongYvNoSub) < 1e-6 ||
          Math.abs(userYv - wrongYvAdded) < 1e-6 ||
          (Math.abs(model.a - 1) > EPS && Math.abs(userYv - wrongYvUnscaled) < 1e-6))
      ) {
        return { ...QUAD_DIAGNOSTICS.unbalanced_completing_square };
      }
    }
  }

  // 8. neg_b_or_square_sign_in_resolvente:
  // Error A: usó +b en lugar de -b en (-b ± sqrt(Δ))/(2a) -> raíces invertidas de signo (-r1, -r2)
  // Error B: evaluó (-b)^2 como -b^2 -> discriminante falso Δ_bad = -b^2 - 4ac
  if (
    (context.target === 'roots' ||
      context.target === 'C0' ||
      context.target === 'discriminant' ||
      context.target === 'resolvente') &&
    model
  ) {
    const badDisc = cleanZero(-model.b * model.b - 4 * model.a * model.c);
    if (
      numVal !== null &&
      Math.abs(model.b) > EPS &&
      Math.abs(numVal - badDisc) < 1e-6
    ) {
      return { ...QUAD_DIAGNOSTICS.neg_b_or_square_sign_in_resolvente };
    }
    if (model.roots.length >= 1 && Math.abs(model.b) > EPS) {
      const flippedRoots = model.roots.map((r) => cleanZero(-r)).sort((x, y) => x - y);
      if (
        setVal.ok &&
        setVal.kind === 'finite_set' &&
        setVal.values.length === flippedRoots.length &&
        setVal.values.every((v, idx) => Math.abs(v - flippedRoots[idx]) < 1e-6)
      ) {
        return { ...QUAD_DIAGNOSTICS.neg_b_or_square_sign_in_resolvente };
      }
    }
  }

  // 9. used_yv_for_monotonicity_or_open_image:
  // En monotonía usó yv como punto de quiebre (-inf; yv) o (yv; +inf),
  // o en imagen puso paréntesis abierto (yv; +inf) / (-inf; yv)
  if (
    (context.target === 'monotonicity' ||
      context.target === 'increasing' ||
      context.target === 'decreasing' ||
      context.target === 'image') &&
    setVal.ok &&
    setVal.kind === 'intervals' &&
    setVal.intervals.length === 1 &&
    xv !== undefined &&
    yv !== undefined
  ) {
    const iv = setVal.intervals[0];
    if (
      context.target === 'monotonicity' ||
      context.target === 'increasing' ||
      context.target === 'decreasing'
    ) {
      if (
        Math.abs(xv - yv) > 1e-6 &&
        ((iv.from === -Infinity && Math.abs(iv.to - yv) < 1e-6) ||
          (iv.to === Infinity && Math.abs(iv.from - yv) < 1e-6))
      ) {
        return { ...QUAD_DIAGNOSTICS.used_yv_for_monotonicity_or_open_image };
      }
    }
    if (context.target === 'image') {
      // Paréntesis abierto en yv en lugar de corchete cerrado
      if (
        (iv.to === Infinity && Math.abs(iv.from - yv) < 1e-6 && !iv.leftClosed) ||
        (iv.from === -Infinity && Math.abs(iv.to - yv) < 1e-6 && !iv.rightClosed)
      ) {
        return { ...QUAD_DIAGNOSTICS.used_yv_for_monotonicity_or_open_image };
      }
      // O usó xv en vez de yv para la imagen
      if (
        Math.abs(xv - yv) > 1e-6 &&
        ((iv.to === Infinity && Math.abs(iv.from - xv) < 1e-6) ||
          (iv.from === -Infinity && Math.abs(iv.to - xv) < 1e-6))
      ) {
        return { ...QUAD_DIAGNOSTICS.used_yv_for_monotonicity_or_open_image };
      }
    }
  }

  // 10. confused_sum_product_signs_vieta:
  // Dijo que x1 + x2 = b/a (sin cambiar el signo) o invirtió suma con producto,
  // o factorizó (x - x1)(x - x2) con los signos de las raíces al revés: a(x + x1)(x + x2)
  if (
    context.target === 'vieta_sum' ||
    context.target === 'vieta' ||
    context.target === 'factor'
  ) {
    if (model && numVal !== null && Math.abs(model.b) > EPS) {
      const wrongSumSign = cleanZero(model.b / model.a);
      if (Math.abs(numVal - wrongSumSign) < 1e-6) {
        return { ...QUAD_DIAGNOSTICS.confused_sum_product_signs_vieta };
      }
    }
    if (exprVal.ok && model && Math.abs(model.b) > EPS) {
      // Si factorizó con signos opuestos: a*x^2 - b*x + c
      if (
        Math.abs(exprVal.coeffs.a - model.a) < 1e-6 &&
        Math.abs(exprVal.coeffs.b - -model.b) < 1e-6 &&
        Math.abs(exprVal.coeffs.c - model.c) < 1e-6
      ) {
        return { ...QUAD_DIAGNOSTICS.confused_sum_product_signs_vieta };
      }
    }
  }

  return null;
}

export {
  parseQuadExpr,
  equivalentQuadExpr,
  parseNumberOrFraction,
  parseOrderedPair,
  parseSetOrIntervalExactas,
  equivalentSetExactas,
  formatSetExactas,
  ERROR_CATEGORIES,
};
