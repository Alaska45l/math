/**
 * logic.js — Motor matemático puro de funciones de valor absoluto f(x) = a|x - h| + k,
 * ecuaciones/inecuaciones con módulo, funciones definidas por partes y diagnóstico pedagógico.
 */

import { fmt, MINUS } from '../../core/math-format.js';
import {
  parseExpr,
  tryParseExpr,
  evalExpr,
  extractAbsParams,
  extractLinearParams,
  hasAbsNode,
  equivalentFx,
} from './expr.js';

export const approxEq = (a, b) =>
  Number.isFinite(a) && Number.isFinite(b) &&
  Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

function cleanZero(v) {
  if (!Number.isFinite(v)) return v;
  const r = approxEq(v, Math.round(v)) ? Math.round(v) : Number(v.toFixed(9));
  return Object.is(r, -0) ? 0 : r;
}

/**
 * Formatea una ecuación lineal m*x + b de forma limpia (ej. "2x − 5", "−x + 3", "4").
 */
export function formatLinearExpr(m, b) {
  const mClean = cleanZero(m);
  const bClean = cleanZero(b);

  if (approxEq(mClean, 0)) {
    return fmt(bClean);
  }

  let mPart = '';
  if (approxEq(mClean, 1)) mPart = 'x';
  else if (approxEq(mClean, -1)) mPart = `${MINUS}x`;
  else mPart = `${fmt(mClean)}x`;

  if (approxEq(bClean, 0)) {
    return mPart;
  }

  const bPart = bClean > 0 ? ` + ${fmt(bClean)}` : ` ${MINUS} ${fmt(Math.abs(bClean))}`;
  return `${mPart}${bPart}`;
}

/**
 * Formatea la expresión canónica a|x - h| + k para visualización de texto.
 */
export function formatCanonicalAbs(a, h, k) {
  const aClean = cleanZero(a);
  const hClean = cleanZero(h);
  const kClean = cleanZero(k);

  if (approxEq(aClean, 0)) return fmt(kClean);

  let aPrefix = '';
  if (approxEq(aClean, 1)) aPrefix = '';
  else if (approxEq(aClean, -1)) aPrefix = MINUS;
  else aPrefix = fmt(aClean);

  let inside = 'x';
  if (!approxEq(hClean, 0)) {
    inside = hClean > 0 ? `x ${MINUS} ${fmt(hClean)}` : `x + ${fmt(Math.abs(hClean))}`;
  }

  let kSuffix = '';
  if (!approxEq(kClean, 0)) {
    kSuffix = kClean > 0 ? ` + ${fmt(kClean)}` : ` ${MINUS} ${fmt(Math.abs(kClean))}`;
  }

  return `${aPrefix}|${inside}|${kSuffix}`;
}

/**
 * Evalúa f(x) = a|x - h| + k.
 */
export function evalAbs(a, h, k, x) {
  return cleanZero(a * Math.abs(x - h) + k);
}

/**
 * Devuelve el análisis completo de f(x) = a|x - h| + k.
 */
export function analyzeAbs(a, h, k) {
  const aC = cleanZero(a);
  const hC = cleanZero(h);
  const kC = cleanZero(k);

  const opens = aC > 0 ? 'up' : aC < 0 ? 'down' : 'flat';
  const y0 = cleanZero(aC * Math.abs(hC) + kC);

  // Raíces: a|x - h| + k = 0  <=>  |x - h| = -k / a
  let roots = [];
  if (!approxEq(aC, 0)) {
    const rhs = -kC / aC;
    if (approxEq(rhs, 0)) {
      roots = [hC];
    } else if (rhs > 0) {
      const r1 = cleanZero(hC - rhs);
      const r2 = cleanZero(hC + rhs);
      roots = r1 <= r2 ? [r1, r2] : [r2, r1];
    }
  }

  // Rango (Imagen)
  let range;
  if (aC > 0) {
    range = { min: kC, max: Infinity, text: `[${fmt(kC)}; +∞)` };
  } else if (aC < 0) {
    range = { min: -Infinity, max: kC, text: `(${MINUS}∞; ${fmt(kC)}]` };
  } else {
    range = { min: kC, max: kC, text: `{${fmt(kC)}}` };
  }

  // Conjuntos de Positividad (C+) y Negatividad (C-)
  let positivity = '∅';
  let negativity = '∅';

  if (aC > 0) {
    if (roots.length === 0) {
      // k > 0 => siempre positiva
      positivity = 'ℝ';
      negativity = '∅';
    } else if (roots.length === 1) {
      // k = 0 => positiva en R - {h}
      positivity = `(${MINUS}∞; ${fmt(hC)}) ∪ (${fmt(hC)}; +∞)`;
      negativity = '∅';
    } else {
      const [r1, r2] = roots;
      positivity = `(${MINUS}∞; ${fmt(r1)}) ∪ (${fmt(r2)}; +∞)`;
      negativity = `(${fmt(r1)}; ${fmt(r2)})`;
    }
  } else if (aC < 0) {
    if (roots.length === 0) {
      // k < 0 => siempre negativa
      positivity = '∅';
      negativity = 'ℝ';
    } else if (roots.length === 1) {
      // k = 0 => negativa en R - {h}
      positivity = '∅';
      negativity = `(${MINUS}∞; ${fmt(hC)}) ∪ (${fmt(hC)}; +∞)`;
    } else {
      const [r1, r2] = roots;
      positivity = `(${fmt(r1)}; ${fmt(r2)})`;
      negativity = `(${MINUS}∞; ${fmt(r1)}) ∪ (${fmt(r2)}; +∞)`;
    }
  } else {
    if (kC > 0) positivity = 'ℝ';
    else if (kC < 0) negativity = 'ℝ';
  }

  // Crecimiento (I↑) y Decrecimiento (I↓)
  let increasing = '∅';
  let decreasing = '∅';
  let extremum = { type: 'none', x: hC, y: kC };

  if (aC > 0) {
    decreasing = `(${MINUS}∞; ${fmt(hC)})`;
    increasing = `(${fmt(hC)}; +∞)`;
    extremum = { type: 'min', x: hC, y: kC };
  } else if (aC < 0) {
    increasing = `(${MINUS}∞; ${fmt(hC)})`;
    decreasing = `(${fmt(hC)}; +∞)`;
    extremum = { type: 'max', x: hC, y: kC };
  }

  return {
    vertex: { x: hC, y: kC },
    axisOfSymmetry: hC,
    opens,
    rightSlope: aC,
    leftSlope: cleanZero(-aC),
    yIntercept: { x: 0, y: y0 },
    roots,
    domain: 'ℝ',
    range,
    positivity,
    negativity,
    increasing,
    decreasing,
    extremum,
  };
}

/**
 * Convierte f(x) = a|x - h| + k en su definición por partes explícita y simplificada.
 */
export function toPiecewise(a, h, k) {
  const aC = cleanZero(a);
  const hC = cleanZero(h);
  const kC = cleanZero(k);

  const mRight = aC;
  const bRight = cleanZero(-aC * hC + kC);

  const mLeft = cleanZero(-aC);
  const bLeft = cleanZero(aC * hC + kC);

  const hInside = approxEq(hC, 0)
    ? 'x'
    : hC > 0
    ? `(x ${MINUS} ${fmt(hC)})`
    : `(x + ${fmt(Math.abs(hC))})`;

  const kSuffix = approxEq(kC, 0)
    ? ''
    : kC > 0
    ? ` + ${fmt(kC)}`
    : ` ${MINUS} ${fmt(Math.abs(kC))}`;

  const fmtCoeff = (c) => {
    if (approxEq(c, 1)) return '';
    if (approxEq(c, -1)) return MINUS;
    return `${fmt(c)} · `;
  };

  const rawRight = `${fmtCoeff(mRight)}${hInside}${kSuffix}`;
  const rawLeft = `${fmtCoeff(mLeft)}${hInside}${kSuffix}`;

  return {
    splitX: hC,
    rightBranch: {
      m: mRight,
      b: bRight,
      rawText: rawRight,
      simplifiedText: formatLinearExpr(mRight, bRight),
      condition: `x ≥ ${fmt(hC)}`,
    },
    leftBranch: {
      m: mLeft,
      b: bLeft,
      rawText: rawLeft,
      simplifiedText: formatLinearExpr(mLeft, bLeft),
      condition: `x < ${fmt(hC)}`,
    },
  };
}

/**
 * Reconstruye { a, h, k } a partir del vértice (h, k) y un punto de paso (px, py) con px !== h.
 */
export function absFromVertexAndPoint(h, k, px, py) {
  const dist = Math.abs(px - h);
  if (approxEq(dist, 0)) {
    throw new RangeError('El punto de paso (px, py) debe tener una coordenada X distinta a la del vértice h.');
  }
  const a = cleanZero((py - k) / dist);
  return {
    a,
    h: cleanZero(h),
    k: cleanZero(k),
  };
}

/**
 * Resuelve paso a paso la ecuación o inecuación a|x - h| + k [op] c,
 * con op ∈ ['=', '<', '<=', '>', '>='].
 */
export function solveAbsComparison(a, h, k, op, c) {
  const aC = cleanZero(a);
  const hC = cleanZero(h);
  const kC = cleanZero(k);
  const cC = cleanZero(c);

  if (approxEq(aC, 0)) {
    throw new RangeError('El coeficiente a no puede ser 0 en una ecuación de valor absoluto.');
  }

  const steps = [];
  const fStr = formatCanonicalAbs(aC, hC, kC);
  const opDisplay = op === '<=' ? '≤' : op === '>=' ? '≥' : op;
  steps.push(`Planteo inicial: ${fStr} ${opDisplay} ${fmt(cC)}`);

  const diff = cleanZero(cC - kC);
  const absTerm = approxEq(hC, 0)
    ? '|x|'
    : hC > 0
    ? `|x ${MINUS} ${fmt(hC)}|`
    : `|x + ${fmt(Math.abs(hC))}|`;

  if (!approxEq(kC, 0)) {
    steps.push(`Despejamos el término con barras restando ${fmt(kC)}: ${fmt(aC)}${absTerm} ${opDisplay} ${fmt(diff)}`);
  }

  const rhs = cleanZero(diff / aC);
  // Si dividimos por a < 0 en una desigualdad, se invierte el sentido
  let effOp = op;
  if (aC < 0 && op !== '=') {
    const flipMap = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' };
    effOp = flipMap[op] || op;
  }
  const effOpDisplay = effOp === '<=' ? '≤' : effOp === '>=' ? '≥' : effOp;

  if (!approxEq(aC, 1)) {
    const flipNote = aC < 0 && op !== '=' ? ' (como dividimos por un número negativo, se invierte la desigualdad)' : '';
    steps.push(`Dividimos por ${fmt(aC)}${flipNote}: ${absTerm} ${effOpDisplay} ${fmt(rhs)}`);
  }

  // Caso 1: Ecuación '='
  if (effOp === '=') {
    if (rhs < -1e-9) {
      steps.push(`Como una distancia |...| nunca puede ser negativa (${fmt(rhs)} < 0), no existe solución real.`);
      return {
        solutions: [],
        intervalText: '∅',
        steps,
        caseType: 'no_solution',
      };
    }
    if (approxEq(rhs, 0)) {
      steps.push(`La distancia es cero únicamente en el vértice: x = ${fmt(hC)}.`);
      return {
        solutions: [hC],
        intervalText: `{${fmt(hC)}}`,
        steps,
        caseType: 'vertex_only',
      };
    }
    const x1 = cleanZero(hC - rhs);
    const x2 = cleanZero(hC + rhs);
    const sols = x1 <= x2 ? [x1, x2] : [x2, x1];
    steps.push(`Desdoblamos en dos ramas simétricas a distancia ${fmt(rhs)} de ${fmt(hC)}: x₁ = ${fmt(sols[0])} y x₂ = ${fmt(sols[1])}.`);
    return {
      solutions: sols,
      intervalText: `{${fmt(sols[0])}; ${fmt(sols[1])}}`,
      steps,
      caseType: 'two_solutions',
    };
  }

  // Caso 2: Inecuaciones '<' o '<='
  if (effOp === '<' || effOp === '<=') {
    const strict = effOp === '<';
    if (rhs < -1e-9 || (approxEq(rhs, 0) && strict)) {
      steps.push(`Ninguna distancia puede ser ${strict ? 'menor' : 'menor o igual'} que ${fmt(rhs)}. Conjunto vacío.`);
      return {
        solutions: [],
        intervalText: '∅',
        steps,
        caseType: 'no_solution',
      };
    }
    if (approxEq(rhs, 0) && !strict) {
      steps.push(`La distancia es ≤ 0 únicamente cuando vale exactamente 0 en el vértice: x = ${fmt(hC)}.`);
      return {
        solutions: [hC],
        intervalText: `{${fmt(hC)}}`,
        steps,
        caseType: 'vertex_only',
      };
    }
    const x1 = cleanZero(hC - rhs);
    const x2 = cleanZero(hC + rhs);
    const lBr = strict ? '(' : '[';
    const rBr = strict ? ')' : ']';
    const intervalText = `${lBr}${fmt(x1)}; ${fmt(x2)}${rBr}`;
    steps.push(`Los puntos cuya distancia a ${fmt(hC)} es ${effOpDisplay} ${fmt(rhs)} forman el entorno: ${intervalText}.`);
    return {
      solutions: [x1, x2],
      intervalText,
      steps,
      caseType: 'two_solutions',
    };
  }

  // Caso 3: Inecuaciones '>' o '>='
  if (effOp === '>' || effOp === '>=') {
    const strict = effOp === '>';
    if (rhs < -1e-9 || (approxEq(rhs, 0) && !strict)) {
      steps.push(`Como toda distancia es ≥ 0, la desigualdad se cumple para todos los números reales ℝ.`);
      return {
        solutions: [],
        intervalText: 'ℝ',
        steps,
        caseType: 'all_reals',
      };
    }
    if (approxEq(rhs, 0) && strict) {
      const intervalText = `(${MINUS}∞; ${fmt(hC)}) ∪ (${fmt(hC)}; +∞)`;
      steps.push(`La distancia es estrictamente positiva para todo x distinto del vértice ${fmt(hC)}: ${intervalText}.`);
      return {
        solutions: [hC],
        intervalText,
        steps,
        caseType: 'vertex_only',
      };
    }
    const x1 = cleanZero(hC - rhs);
    const x2 = cleanZero(hC + rhs);
    const lClose = strict ? ')' : ']';
    const rOpen = strict ? '(' : '[';
    const intervalText = `(${MINUS}∞; ${fmt(x1)}${lClose} ∪ ${rOpen}${fmt(x2)}; +∞)`;
    steps.push(`Los puntos a distancia ${effOpDisplay} ${fmt(rhs)} de ${fmt(hC)} caen fuera del entorno central: ${intervalText}.`);
    return {
      solutions: [x1, x2],
      intervalText,
      steps,
      caseType: 'two_solutions',
    };
  }

  throw new TypeError(`Operador de comparación no soportado: ${op}`);
}

/**
 * Evalúa un tramo individual en x.
 */
function evalSinglePiece(piece, x) {
  if (typeof piece.fn === 'function') return piece.fn(x);
  if (piece.exprAst) return evalExpr(piece.exprAst, x);
  if (typeof piece.expr === 'string') return evalExpr(parseExpr(piece.expr), x);
  if (typeof piece.m === 'number' && typeof piece.b === 'number') return piece.m * x + piece.b;
  return NaN;
}

/**
 * Evalúa una función definida por partes [{ exprAst, minX, maxX, minInclusive, maxInclusive, label }] en un punto x.
 * Devuelve { defined: boolean, y: number | null, activePieceIndex: number, isBoundary: boolean, collision: boolean }
 */
export function evalPiecewise(pieces, x) {
  if (!Array.isArray(pieces) || pieces.length === 0) {
    return { defined: false, y: null, activePieceIndex: -1, isBoundary: false, collision: false };
  }

  const matchingIndices = [];
  let isBoundary = false;

  pieces.forEach((p, idx) => {
    const minX = p.minX ?? -Infinity;
    const maxX = p.maxX ?? Infinity;
    const minInc = Boolean(p.minInclusive);
    const maxInc = Boolean(p.maxInclusive);

    const atMin = Number.isFinite(minX) && approxEq(x, minX);
    const atMax = Number.isFinite(maxX) && approxEq(x, maxX);
    if (atMin || atMax) isBoundary = true;

    const passesMin = atMin ? minInc : x > minX;
    const passesMax = atMax ? maxInc : x < maxX;

    if (passesMin && passesMax) {
      matchingIndices.push(idx);
    }
  });

  if (matchingIndices.length === 0) {
    return {
      defined: false,
      y: null,
      activePieceIndex: -1,
      isBoundary,
      collision: false,
    };
  }

  const ys = matchingIndices.map((idx) => cleanZero(evalSinglePiece(pieces[idx], x)));
  // Hay colisión de unicidad si más de un tramo incluye a x y dan distinta altura y
  let collision = false;
  if (matchingIndices.length > 1) {
    for (let i = 1; i < ys.length; i++) {
      if (!approxEq(ys[i], ys[0])) {
        collision = true;
        break;
      }
    }
  }

  return {
    defined: !collision,
    y: collision ? null : ys[0],
    activePieceIndex: matchingIndices[0],
    isBoundary,
    collision,
    matchingIndices,
    candidateYs: ys,
  };
}

/**
 * Verifica si un conjunto de tramos viola la unicidad en algún borde (dos puntos cerrados en el mismo x con distinto y)
 * o si los intervalos se solapan con valores distintos.
 */
export function validatePiecewiseFunction(pieces) {
  if (!Array.isArray(pieces) || pieces.length <= 1) {
    return { isValidFunction: true, collisions: [] };
  }

  const collisions = [];

  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      const p1 = pieces[i];
      const p2 = pieces[j];
      const min1 = p1.minX ?? -Infinity;
      const max1 = p1.maxX ?? Infinity;
      const min2 = p2.minX ?? -Infinity;
      const max2 = p2.maxX ?? Infinity;

      // 1. Frontera compartida puntual: max1 == min2 o max2 == min1 o min1 == min2 o max1 == max2
      const candidatePoints = [];
      if (Number.isFinite(max1) && approxEq(max1, min2) && p1.maxInclusive && p2.minInclusive) {
        candidatePoints.push(max1);
      }
      if (Number.isFinite(max2) && approxEq(max2, min1) && p2.maxInclusive && p1.minInclusive) {
        candidatePoints.push(max2);
      }
      if (Number.isFinite(min1) && approxEq(min1, min2) && p1.minInclusive && p2.minInclusive) {
        candidatePoints.push(min1);
      }
      if (Number.isFinite(max1) && approxEq(max1, max2) && p1.maxInclusive && p2.maxInclusive) {
        candidatePoints.push(max1);
      }

      for (const bx of candidatePoints) {
        const y1 = cleanZero(evalSinglePiece(p1, bx));
        const y2 = cleanZero(evalSinglePiece(p2, bx));
        if (!approxEq(y1, y2)) {
          collisions.push({
            x: bx,
            pieces: [i, j],
            yValues: [y1, y2],
            reason: `En la frontera x = ${fmt(bx)} hay dos puntos cerrados (•) a distinta altura: y = ${fmt(y1)} e y = ${fmt(y2)}. Viola unicidad (deja de ser función).`,
          });
        }
      }
    }
  }

  return {
    isValidFunction: collisions.length === 0,
    collisions,
  };
}

/**
 * Catálogo de diagnóstico pedagógico cuando el usuario escribe una fórmula o identifica (a, h, k) o intervalos.
 * Detecta obligatoriamente estos 7 IDs:
 * 1. 'inverted_h_sign': confundió el signo de h (ej. puso |x - 3| para vértice en x = -3 o viceversa).
 * 2. 'swapped_h_k': intercambió el desplazamiento horizontal h con el vertical k.
 * 3. 'wrong_reflection_sign': puso el signo de a al revés (abre hacia arriba cuando debía abrir hacia abajo o viceversa).
 * 4. 'inverted_slope_fraction': puso 1/a en lugar de la pendiente a (confundió Δx/Δy con Δy/Δx).
 * 5. 'missing_abs_bars': escribió una recta lineal a(x - h) + k olvidando las barras de valor absoluto.
 * 6. 'unfactored_inner_coeff': escribió una expresión equivalente como |2x - 4| en vez de 2|x - 2| (severity: 'warn').
 * 7. 'confused_x_and_y_in_intervals': escribió el intervalo de crecimiento o positividad usando la coordenada y = k del vértice en vez de x = h.
 */
export function diagnoseAbs(userInputOrAst, expectedParams, context = {}) {
  const issues = [];
  if (!expectedParams) return issues;

  const expA = cleanZero(expectedParams.a ?? 1);
  const expH = cleanZero(expectedParams.h ?? 0);
  const expK = cleanZero(expectedParams.k ?? 0);

  // Caso A: Diagnóstico de intervalos (cuando context.type === 'interval' o el input tiene ';' / '∞')
  if (
    context.type === 'interval' ||
    (typeof userInputOrAst === 'string' && (userInputOrAst.includes(';') || userInputOrAst.includes('∞')))
  ) {
    const rawStr = String(userInputOrAst).trim();
    const normDigits = rawStr.replace(/\u2212/g, '-').replace(/,/g, '.');
    const expKStr = String(expK);
    const expHStr = String(expH);

    // 7. confused_x_and_y_in_intervals
    if (!approxEq(expH, expK) && normDigits.includes(expKStr) && !normDigits.includes(expHStr)) {
      issues.push({
        id: 'confused_x_and_y_in_intervals',
        severity: 'error',
        message: `Usaste la altura vertical del vértice (k = ${fmt(expK)}) en lugar de la coordenada horizontal X (h = ${fmt(expH)}). Los intervalos de crecimiento, decrecimiento y positividad siempre se leen sobre el eje X.`,
      });
    }
    return issues;
  }

  // Caso B: El usuario ingresó directamente un objeto de parámetros o par { h, k } / { a, h, k }
  let userParams = null;
  let ast = null;

  if (
    userInputOrAst &&
    typeof userInputOrAst === 'object' &&
    !userInputOrAst.type &&
    ('h' in userInputOrAst || 'k' in userInputOrAst || 'a' in userInputOrAst)
  ) {
    userParams = {
      isCanonical: true,
      a: cleanZero(userInputOrAst.a ?? expA),
      h: cleanZero(userInputOrAst.h ?? 0),
      k: cleanZero(userInputOrAst.k ?? 0),
    };
  } else {
    // Parsear AST desde string o nodo AST
    if (typeof userInputOrAst === 'string') {
      const parsed = tryParseExpr(userInputOrAst);
      if (!parsed.ok) return issues;
      ast = parsed.ast;
    } else if (userInputOrAst && typeof userInputOrAst === 'object' && userInputOrAst.type) {
      ast = userInputOrAst;
    }

    if (ast) {
      // 5. missing_abs_bars: escribió una expresión sin barras de valor absoluto
      if (!hasAbsNode(ast)) {
        const lin = extractLinearParams(ast);
        if (lin) {
          issues.push({
            id: 'missing_abs_bars',
            severity: 'error',
            message: 'Escribiste una función lineal sin barras de valor absoluto |x|. Sin las barras, la gráfica es una recta que sigue de largo en lugar de rebotar formando una «V».',
          });
          return issues;
        }
      }

      userParams = extractAbsParams(ast);
    }
  }

  if (!userParams) return issues;

  const uA = cleanZero(userParams.a);
  const uH = cleanZero(userParams.h);
  const uK = cleanZero(userParams.k);

  // 6. unfactored_inner_coeff (equivalente pero con coeficiente adentro de las barras, ej. |2x - 4|)
  if (
    approxEq(uA, expA) &&
    approxEq(uH, expH) &&
    approxEq(uK, expK) &&
    userParams.isCanonical === false
  ) {
    issues.push({
      id: 'unfactored_inner_coeff',
      severity: 'warn',
      message: `¡Tu expresión es matemáticamente equivalente! Pero dejaste un factor ${fmt(userParams.innerFactor)} dentro de las barras. Si sacás el factor afuera como ${formatCanonicalAbs(expA, expH, expK)}, el vértice x = ${fmt(expH)} se lee directo sin dividir.`,
    });
    return issues;
  }

  // 1. inverted_h_sign: puso -h en lugar de h (con h != 0)
  if (!approxEq(expH, 0) && approxEq(uH, -expH) && approxEq(uK, expK)) {
    issues.push({
      id: 'inverted_h_sign',
      severity: 'error',
      message: `Confundiste el signo del desplazamiento horizontal h: el vértice ocurre donde el interior de las barras se hace CERO (x = ${fmt(expH)}), lo que se escribe |x ${expH > 0 ? `${MINUS} ${fmt(expH)}` : `+ ${fmt(Math.abs(expH))}`}|.`,
    });
  }

  // 2. swapped_h_k: intercambió h con k (o sus módulos) cuando h != k
  if (
    !approxEq(expH, expK) &&
    ((approxEq(uH, expK) && approxEq(uK, expH)) || (approxEq(Math.abs(uH), Math.abs(expK)) && approxEq(Math.abs(uK), Math.abs(expH)) && !approxEq(uH, expH)))
  ) {
    issues.push({
      id: 'swapped_h_k',
      severity: 'error',
      message: `Intercambiaste el desplazamiento horizontal (h = ${fmt(expH)}, adentro de las barras) con el desplazamiento vertical (k = ${fmt(expK)}, afuera de las barras).`,
    });
  }

  // 3. wrong_reflection_sign: puso -a en vez de a
  if (!approxEq(expA, 0) && approxEq(uA, -expA)) {
    issues.push({
      id: 'wrong_reflection_sign',
      severity: 'error',
      message: expA < 0
        ? `La gráfica se abre hacia abajo (forma de Λ), por lo que la pendiente externa 'a' debe ser negativa (a = ${fmt(expA)}).`
        : `La gráfica se abre hacia arriba (forma de V), por lo que el coeficiente 'a' debe ser positivo (a = ${fmt(expA)}).`,
    });
  }

  // 4. inverted_slope_fraction: puso 1/a (o -1/a) en lugar de a (cuando |a| != 1 y a != 0)
  if (
    !approxEq(expA, 0) &&
    !approxEq(Math.abs(expA), 1) &&
    (approxEq(uA, 1 / expA) || approxEq(Math.abs(uA), Math.abs(1 / expA)))
  ) {
    issues.push({
      id: 'inverted_slope_fraction',
      severity: 'error',
      message: `Invertiste la fracción de la pendiente: calculaste Δx / Δy = ${fmt(uA)} en lugar de Δy / Δx = ${fmt(expA)}. La pendiente siempre es variación vertical sobre variación horizontal.`,
    });
  }

  return issues;
}
