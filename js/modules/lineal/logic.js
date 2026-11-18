/**
 * @file js/modules/lineal/logic.js
 * Motor analítico puro para Función Lineal, Formas de la Recta, Posiciones Relativas,
 * Geometría Analítica en el Plano, Funciones Lineales por Tramos y Diagnóstico Cognitivo.
 *
 * Zero DOM. Zero eval(). Zero new Function(). Zero emojis.
 */

import {
  MINUS,
  rat,
  ratFromNumber,
  ratFromString,
  ratAdd,
  ratSub,
  ratMul,
  ratDiv,
  ratNeg,
  ratAbs,
  ratSign,
  ratEq,
  ratCompare,
  ratToNumber,
  ratIsZero,
  ratIsOne,
  ratIsInt,
  fmtRat,
  fmtNumberEsAR,
  exactRadical,
  parseExactRadical,
  exactRadicalEq,
  fmtExactRadical,
  normalizeLineCoeffs,
  parseLinearEquation,
  equivalentLineEquation,
  parseNumberOrFraction,
  parseOrderedPair,
  parseSetOrIntervalExactas,
  equivalentSetExactas,
} from './expr.js';

export {
  MINUS,
  rat,
  ratFromNumber,
  ratFromString,
  ratAdd,
  ratSub,
  ratMul,
  ratDiv,
  ratNeg,
  ratAbs,
  ratSign,
  ratEq,
  ratCompare,
  ratToNumber,
  ratIsZero,
  ratIsOne,
  ratIsInt,
  fmtRat,
  fmtNumberEsAR,
  exactRadical,
  parseExactRadical,
  exactRadicalEq,
  fmtExactRadical,
  parseLinearEquation,
  equivalentLineEquation,
  parseNumberOrFraction,
  parseOrderedPair,
  parseSetOrIntervalExactas,
  equivalentSetExactas,
};

function toRat(val) {
  if (val && typeof val === 'object' && 'n' in val && 'd' in val) {
    return rat(val.n, val.d);
  }
  if (typeof val === 'number') return ratFromNumber(val);
  if (typeof val === 'string') return ratFromString(val);
  throw new TypeError(`Valor no convertible a racional: ${String(val)}`);
}

function toPointRat(p) {
  if (!p || typeof p !== 'object') throw new TypeError('Punto inválido.');
  return { x: toRat(p.x), y: toRat(p.y) };
}

function formatExplicitEquationText(mRat, bRat) {
  if (ratIsZero(mRat)) {
    return `y = ${fmtRat(bRat)}`;
  }
  let mStr;
  if (ratIsOne(mRat)) mStr = 'x';
  else if (ratEq(mRat, rat(-1))) mStr = `${MINUS}x`;
  else mStr = `${fmtRat(mRat)}x`;

  if (ratIsZero(bRat)) return `y = ${mStr}`;
  if (ratSign(bRat) > 0) return `y = ${mStr} + ${fmtRat(bRat)}`;
  return `y = ${mStr} ${MINUS} ${fmtRat(ratAbs(bRat))}`;
}

function formatImplicitEquationText(A, B, C) {
  const parts = [];
  if (!ratIsZero(A)) {
    if (ratIsOne(A)) parts.push('x');
    else if (ratEq(A, rat(-1))) parts.push(`${MINUS}x`);
    else parts.push(`${fmtRat(A)}x`);
  }
  if (!ratIsZero(B)) {
    const absB = ratAbs(B);
    const termB = ratIsOne(absB) ? 'y' : `${fmtRat(absB)}y`;
    if (parts.length === 0) {
      parts.push(ratSign(B) < 0 ? `${MINUS}${termB}` : termB);
    } else {
      parts.push(ratSign(B) < 0 ? `${MINUS} ${termB}` : `+ ${termB}`);
    }
  }
  if (!ratIsZero(C)) {
    const absC = ratAbs(C);
    if (parts.length === 0) {
      parts.push(fmtRat(C));
    } else {
      parts.push(ratSign(C) < 0 ? `${MINUS} ${fmtRat(absC)}` : `+ ${fmtRat(absC)}`);
    }
  }
  return `${parts.join(' ')} = 0`;
}

function formatSegmentaryEquationText(aRat, bRat) {
  const xPart = ratSign(aRat) < 0 ? `x/(${fmtRat(aRat)})` : `x/${fmtRat(aRat)}`;
  const yPart = ratSign(bRat) < 0 ? `y/(${fmtRat(bRat)})` : `y/${fmtRat(bRat)}`;
  return `${xPart} + ${yPart} = 1`;
}

/* ==========================================================================
   1. Pendiente, Ángulo y Conversión entre las 3 Formas
   ========================================================================== */

export function angleFromSlope(mRat) {
  const m = ratToNumber(toRat(mRat));
  let deg = (Math.atan(m) * 180) / Math.PI;
  if (deg < 0) deg += 180;
  if (Math.abs(deg - 180) < 1e-9) deg = 0;
  return Number(deg.toFixed(4));
}

export function slopeFromAngleDeg(deg) {
  const normDeg = ((Number(deg) % 180) + 180) % 180;
  if (Math.abs(normDeg - 90) < 1e-7) {
    const err = new RangeError('Ángulo de 90° corresponde a una recta vertical sin pendiente.');
    err.code = 'vertical_undefined_slope';
    throw err;
  }
  const exactTable = {
    0: { rat: rat(0), rad: 1, approx: 0, text: '0' },
    30: { rat: rat(1, 3), rad: 3, approx: Math.sqrt(3) / 3, text: '√3/3' },
    45: { rat: rat(1), rad: 1, approx: 1, text: '1' },
    60: { rat: rat(1), rad: 3, approx: Math.sqrt(3), text: '√3' },
    120: { rat: rat(-1), rad: 3, approx: -Math.sqrt(3), text: `${MINUS}√3` },
    135: { rat: rat(-1), rad: 1, approx: -1, text: `${MINUS}1` },
    150: { rat: rat(-1, 3), rad: 3, approx: -Math.sqrt(3) / 3, text: `${MINUS}√3/3` },
  };
  for (const [k, v] of Object.entries(exactTable)) {
    if (Math.abs(normDeg - Number(k)) < 1e-6) {
      return {
        deg: normDeg,
        exactRadical: exactRadical(v.rat, v.rad),
        numeric: v.approx,
        isRational: v.rad === 1,
        text: v.text,
      };
    }
  }
  const val = Math.tan((normDeg * Math.PI) / 180);
  return {
    deg: normDeg,
    exactRadical: null,
    numeric: val,
    isRational: false,
    text: fmtNumberEsAR(val, 4),
  };
}

export function slopeFromPoints(p1, p2) {
  const r1 = toPointRat(p1);
  const r2 = toPointRat(p2);
  const dx = ratSub(r2.x, r1.x);
  const dy = ratSub(r2.y, r1.y);

  if (ratIsZero(dx) && ratIsZero(dy)) {
    const err = new RangeError('Dos puntos idénticos no determinan una única recta.');
    err.code = 'identical_points';
    throw err;
  }

  if (ratIsZero(dx)) {
    const eqText = `x = ${fmtRat(r1.x)}`;
    return {
      exists: false,
      isVertical: true,
      isHorizontal: false,
      x0: r1.x,
      m: null,
      b: null,
      dx,
      dy,
      angleDeg: 90,
      equation: eqText,
    };
  }

  const m = ratDiv(dy, dx);
  const b = ratSub(r1.y, ratMul(m, r1.x));
  return {
    exists: true,
    isVertical: false,
    isHorizontal: ratIsZero(m),
    x0: null,
    m,
    b,
    dx,
    dy,
    angleDeg: angleFromSlope(m),
    equation: formatExplicitEquationText(m, b),
  };
}

export function resolveLineCanonical(spec) {
  if (typeof spec === 'string') {
    const parsed = parseLinearEquation(spec);
    if (!parsed.ok) throw new SyntaxError(parsed.errorMessage);
    return { A: parsed.A, B: parsed.B, C: parsed.C };
  }
  if (spec && typeof spec === 'object') {
    if ('canonical' in spec && spec.canonical) {
      return resolveLineCanonical(spec.canonical);
    }
    if ('A' in spec && 'B' in spec && 'C' in spec) {
      const c = normalizeLineCoeffs(toRat(spec.A), toRat(spec.B), toRat(spec.C));
      if (c.degenerate) throw new RangeError('Ecuación degenerada (A = 0 y B = 0).');
      return { A: c.A, B: c.B, C: c.C };
    }
    if ('p1' in spec && 'p2' in spec) {
      const sp = slopeFromPoints(spec.p1, spec.p2);
      if (sp.isVertical) {
        return normalizeLineCoeffs(rat(1), rat(0), ratNeg(sp.x0));
      }
      return normalizeLineCoeffs(sp.m, rat(-1), sp.b);
    }
    if ('aSeg' in spec && 'bSeg' in spec) {
      const a = toRat(spec.aSeg);
      const b = toRat(spec.bSeg);
      if (ratIsZero(a) || ratIsZero(b)) {
        throw new RangeError('En forma segmentaria a y b deben ser distintos de cero.');
      }
      return normalizeLineCoeffs(ratDiv(rat(1), a), ratDiv(rat(1), b), rat(-1));
    }
    if ('isVertical' in spec && spec.isVertical && 'x0' in spec) {
      return normalizeLineCoeffs(rat(1), rat(0), ratNeg(toRat(spec.x0)));
    }
    if ('m' in spec && 'b' in spec) {
      if (spec.m === null) {
        throw new RangeError('Recta vertical requiere x0 en lugar de m.');
      }
      const m = toRat(spec.m);
      const b = toRat(spec.b);
      return normalizeLineCoeffs(m, rat(-1), b);
    }
  }
  throw new TypeError('Especificación de recta inválida.');
}

export function convertLinearForms(spec) {
  const { A, B, C } = resolveLineCanonical(spec);
  const isVertical = ratIsZero(B);
  const isHorizontal = ratIsZero(A);
  const passesOrigin = ratIsZero(C);

  const implicitText = formatImplicitEquationText(A, B, C);
  const implicit = { valid: true, A, B, C, text: implicitText };

  let explicit;
  if (isVertical) {
    const x0 = ratDiv(ratNeg(C), A);
    explicit = {
      valid: false,
      reason: 'La recta vertical no es función: un mismo x tiene infinitas imágenes y.',
      m: null,
      b: null,
      x0,
      text: `x = ${fmtRat(x0)} (no explícita)`,
    };
  } else {
    const m = ratDiv(ratNeg(A), B);
    const b = ratDiv(ratNeg(C), B);
    explicit = {
      valid: true,
      reason: null,
      m,
      b,
      text: formatExplicitEquationText(m, b),
    };
  }

  let segmentary;
  if (isVertical) {
    segmentary = {
      valid: false,
      reason: 'Paralela al eje Y: no corta al eje Y (sin ordenada al origen b).',
      a: ratDiv(ratNeg(C), A),
      b: null,
      text: 'No admite segmentaria',
    };
  } else if (isHorizontal) {
    segmentary = {
      valid: false,
      reason: 'Paralela al eje X: no corta al eje X (sin raíz a).',
      a: null,
      b: ratDiv(ratNeg(C), B),
      text: 'No admite segmentaria',
    };
  } else if (passesOrigin) {
    segmentary = {
      valid: false,
      reason: 'Pasa por el origen (0; 0): a = 0 y b = 0 impedirían dividir por cero en x/a + y/b = 1.',
      a: rat(0),
      b: rat(0),
      text: 'No admite segmentaria',
    };
  } else {
    const aSeg = ratDiv(ratNeg(C), A);
    const bSeg = ratDiv(ratNeg(C), B);
    segmentary = {
      valid: true,
      reason: null,
      a: aSeg,
      b: bSeg,
      text: formatSegmentaryEquationText(aSeg, bSeg),
    };
  }

  return {
    canonical: { A, B, C },
    isVertical,
    isHorizontal,
    passesOrigin,
    explicit,
    implicit,
    segmentary,
  };
}

/* ==========================================================================
   2. Estudio Analítico Completo de la Función Lineal
   ========================================================================== */

export function analyzeLinear(lineSpec) {
  const forms = convertLinearForms(lineSpec);
  const { A, B, C } = forms.canonical;

  if (forms.isVertical) {
    const x0 = ratDiv(ratNeg(C), A);
    return {
      isFunction: false,
      isVertical: true,
      isHorizontal: false,
      slope: null,
      yIntercept: null,
      xIntercept: { x: x0, y: rat(0) },
      x0,
      angleDeg: 90,
      domain: `{${fmtRat(x0)}}`,
      image: 'ℝ',
      C0: 'No aplica (no es función)',
      CPlus: 'No aplica (no es función)',
      CMinus: 'No aplica (no es función)',
      monotonicity: 'vertical_not_function',
      isInjective: false,
      isSurjective: false,
      isBijective: false,
      inverse: null,
      forms,
    };
  }

  const m = forms.explicit.m;
  const b = forms.explicit.b;
  const mSign = ratSign(m);

  if (mSign === 0) {
    const bSign = ratSign(b);
    return {
      isFunction: true,
      isVertical: false,
      isHorizontal: true,
      slope: m,
      yIntercept: { x: rat(0), y: b },
      xIntercept: bSign === 0 ? 'Todos los puntos (y = 0)' : null,
      angleDeg: 0,
      domain: 'ℝ',
      image: `{${fmtRat(b)}}`,
      C0: bSign === 0 ? 'ℝ' : '∅',
      CPlus: bSign > 0 ? 'ℝ' : '∅',
      CMinus: bSign < 0 ? 'ℝ' : '∅',
      monotonicity: 'constant',
      isInjective: false,
      isSurjective: false,
      isBijective: false,
      inverse: null,
      forms,
    };
  }

  const root = ratDiv(ratNeg(b), m);
  const rootFmt = fmtRat(root);
  const invM = ratDiv(rat(1), m);
  const invB = ratDiv(ratNeg(b), m);

  return {
    isFunction: true,
    isVertical: false,
    isHorizontal: false,
    slope: m,
    yIntercept: { x: rat(0), y: b },
    xIntercept: { x: root, y: rat(0) },
    root,
    angleDeg: angleFromSlope(m),
    domain: 'ℝ',
    image: 'ℝ',
    C0: `{${rootFmt}}`,
    CPlus: mSign > 0 ? `(${rootFmt}; +∞)` : `(${MINUS}∞; ${rootFmt})`,
    CMinus: mSign > 0 ? `(${MINUS}∞; ${rootFmt})` : `(${rootFmt}; +∞)`,
    monotonicity: mSign > 0 ? 'strictly_increasing' : 'strictly_decreasing',
    isInjective: true,
    isSurjective: true,
    isBijective: true,
    inverse: {
      m: invM,
      b: invB,
      text: formatExplicitEquationText(invM, invB),
    },
    forms,
  };
}

/* ==========================================================================
   3. Posiciones Relativas, Paralelismo y Perpendicularidad
   ========================================================================== */

export function classifyLinePair(l1Spec, l2Spec) {
  const c1 = resolveLineCanonical(l1Spec);
  const c2 = resolveLineCanonical(l2Spec);

  const det = ratSub(ratMul(c1.A, c2.B), ratMul(c2.A, c1.B));
  const v1 = ratIsZero(c1.B);
  const v2 = ratIsZero(c2.B);

  if (ratIsZero(det)) {
    // Paralelas: verificar si coinciden (A1*C2 == A2*C1 && B1*C2 == B2*C1)
    const sameAC = ratEq(ratMul(c1.A, c2.C), ratMul(c2.A, c1.C));
    const sameBC = ratEq(ratMul(c1.B, c2.C), ratMul(c2.B, c1.C));
    const relation = sameAC && sameBC ? 'parallel_coincident' : 'parallel_distinct';
    return {
      relation,
      isParallel: true,
      isPerpendicular: false,
      isCoincident: relation === 'parallel_coincident',
      intersection: null,
      slopeProduct: v1 || v2 ? null : ratMul(ratDiv(ratNeg(c1.A), c1.B), ratDiv(ratNeg(c2.A), c2.B)),
    };
  }

  // Intersección exacta por Cramer 2x2 sobre Ax + By = -C
  const rhs1 = ratNeg(c1.C);
  const rhs2 = ratNeg(c2.C);
  const ix = ratDiv(ratSub(ratMul(rhs1, c2.B), ratMul(rhs2, c1.B)), det);
  const iy = ratDiv(ratSub(ratMul(c1.A, rhs2), ratMul(c2.A, rhs1)), det);

  // Producto escalar de normales A1*A2 + B1*B2 = 0 (cubre horizontal perp vertical sin dividir por 0)
  const dotNormals = ratAdd(ratMul(c1.A, c2.A), ratMul(c1.B, c2.B));
  const isPerpendicular = ratIsZero(dotNormals);

  return {
    relation: isPerpendicular ? 'secant_perpendicular' : 'secant_oblique',
    isParallel: false,
    isPerpendicular,
    isCoincident: false,
    intersection: { x: ix, y: iy },
    slopeProduct: v1 || v2 ? null : ratMul(ratDiv(ratNeg(c1.A), c1.B), ratDiv(ratNeg(c2.A), c2.B)),
  };
}

export function parallelLineThrough(lineSpec, point) {
  const c = resolveLineCanonical(lineSpec);
  const p = toPointRat(point);
  // Misma normal (A, B), nuevo C = -(A*x0 + B*y0)
  const newC = ratNeg(ratAdd(ratMul(c.A, p.x), ratMul(c.B, p.y)));
  return convertLinearForms({ A: c.A, B: c.B, C: newC });
}

export function perpendicularLineThrough(lineSpec, point) {
  const c = resolveLineCanonical(lineSpec);
  const p = toPointRat(point);
  // Vector normal perpendicular (-B, A), nuevo C = -(-B*x0 + A*y0)
  const newA = ratNeg(c.B);
  const newB = c.A;
  const newC = ratNeg(ratAdd(ratMul(newA, p.x), ratMul(newB, p.y)));
  return convertLinearForms({ A: newA, B: newB, C: newC });
}

/* ==========================================================================
   4. Geometría Analítica en el Plano
   ========================================================================== */

export function midpoint(p1, p2) {
  const r1 = toPointRat(p1);
  const r2 = toPointRat(p2);
  return {
    x: ratDiv(ratAdd(r1.x, r2.x), rat(2)),
    y: ratDiv(ratAdd(r1.y, r2.y), rat(2)),
  };
}

export function distancePoints(p1, p2) {
  const r1 = toPointRat(p1);
  const r2 = toPointRat(p2);
  const dx = ratSub(r2.x, r1.x);
  const dy = ratSub(r2.y, r1.y);
  const sq = ratAdd(ratMul(dx, dx), ratMul(dy, dy));
  // sqrt(n / d) = sqrt(n * d) / d
  const er = exactRadical(rat(1, sq.d), sq.n * sq.d);
  return {
    squaredRat: sq,
    exactRadical: er,
    text: fmtExactRadical(er),
    numeric: Math.sqrt(ratToNumber(sq)),
  };
}

export function areCollinear(p1, p2, p3) {
  const r1 = toPointRat(p1);
  const r2 = toPointRat(p2);
  const r3 = toPointRat(p3);
  const cross = ratSub(
    ratMul(ratSub(r2.x, r1.x), ratSub(r3.y, r1.y)),
    ratMul(ratSub(r2.y, r1.y), ratSub(r3.x, r1.x))
  );
  return ratIsZero(cross);
}

export function classifyTriangleBySides(p1, p2, p3) {
  if (areCollinear(p1, p2, p3)) {
    return {
      isTriangle: false,
      collinear: true,
      type: 'collinear',
      sides: [distancePoints(p1, p2), distancePoints(p2, p3), distancePoints(p1, p3)],
      isRightTriangle: false,
    };
  }
  const dAB = distancePoints(p1, p2);
  const dBC = distancePoints(p2, p3);
  const dCA = distancePoints(p3, p1);
  const sqs = [dAB.squaredRat, dBC.squaredRat, dCA.squaredRat].sort(ratCompare);

  const abEqBc = ratEq(dAB.squaredRat, dBC.squaredRat);
  const bcEqCa = ratEq(dBC.squaredRat, dCA.squaredRat);
  const caEqAb = ratEq(dCA.squaredRat, dAB.squaredRat);

  let type = 'scalene';
  if (abEqBc && bcEqCa) type = 'equilateral';
  else if (abEqBc || bcEqCa || caEqAb) type = 'isosceles';

  const isRightTriangle = ratEq(ratAdd(sqs[0], sqs[1]), sqs[2]);

  return {
    isTriangle: true,
    collinear: false,
    type,
    isRightTriangle,
    sides: [dAB, dBC, dCA],
  };
}

export function perpendicularBisector(p1, p2) {
  const r1 = toPointRat(p1);
  const r2 = toPointRat(p2);
  const segSlope = slopeFromPoints(r1, r2);
  const mid = midpoint(r1, r2);

  // Segmento horizontal => mediatriz vertical x = Mx; segmento vertical => mediatriz horizontal y = My
  const dx = ratSub(r2.x, r1.x);
  const dy = ratSub(r2.y, r1.y);
  // Vector PQ = (dx, dy) es normal a la mediatriz: dx*(x - Mx) + dy*(y - My) = 0
  const C = ratNeg(ratAdd(ratMul(dx, mid.x), ratMul(dy, mid.y)));
  const forms = convertLinearForms({ A: dx, B: dy, C });

  return {
    ...forms,
    midpoint: mid,
    segmentSlope: segSlope.isVertical ? null : segSlope.m,
    isSegmentVertical: segSlope.isVertical,
    isSegmentHorizontal: segSlope.isHorizontal,
  };
}

export function pointLineDistance(point, lineSpec) {
  const p = toPointRat(point);
  const { A, B, C } = resolveLineCanonical(lineSpec);

  // evalNum = A*x0 + B*y0 + C
  const evalVal = ratAdd(ratAdd(ratMul(A, p.x), ratMul(B, p.y)), C);
  const absNum = ratAbs(evalVal);
  const denomSq = ratAdd(ratMul(A, A), ratMul(B, B)); // A^2 + B^2 > 0

  // d = |evalVal| / sqrt(denomSq) = (|evalVal| / denomSq) * sqrt(denomSq)
  // Como denomSq = dn/dd, sqrt(dn/dd) = sqrt(dn*dd)/dd
  const coef = ratDiv(absNum, denomSq);
  const er = exactRadical(ratMul(coef, rat(1, denomSq.d)), denomSq.n * denomSq.d);

  // Pie de la proyección ortogonal H: (x0 - A*eval/denomSq, y0 - B*eval/denomSq)
  const factor = ratDiv(evalVal, denomSq);
  const foot = {
    x: ratSub(p.x, ratMul(A, factor)),
    y: ratSub(p.y, ratMul(B, factor)),
  };

  return {
    exactRadical: er,
    text: fmtExactRadical(er),
    numeric: Math.abs(ratToNumber(evalVal)) / Math.sqrt(ratToNumber(denomSq)),
    foot,
    numeratorAbs: absNum,
    denomSq,
  };
}

/* ==========================================================================
   5. Función Lineal por Tramos (Exactas)
   ========================================================================== */

function getPieceInterval(piece) {
  const minX = piece.minX === undefined ? -Infinity : piece.minX;
  const maxX = piece.maxX === undefined ? Infinity : piece.maxX;
  const minInclusive = Boolean(piece.minInclusive ?? piece.leftClosed) && Number.isFinite(minX);
  const maxInclusive = Boolean(piece.maxInclusive ?? piece.rightClosed) && Number.isFinite(maxX);
  return { minX, maxX, minInclusive, maxInclusive };
}

function evalPieceValue(piece, xNum) {
  const m = typeof piece.m === 'object' ? ratToNumber(piece.m) : Number(piece.m ?? 0);
  const b = typeof piece.b === 'object' ? ratToNumber(piece.b) : Number(piece.b ?? 0);
  return m * xNum + b;
}

export function evalPiecewiseLinear(pieces, xInput) {
  const x = typeof xInput === 'object' ? ratToNumber(xInput) : Number(xInput);
  if (!Array.isArray(pieces) || pieces.length === 0 || !Number.isFinite(x)) {
    return { defined: false, y: null, pieceIndex: -1, isBoundary: false, collision: false };
  }

  const matches = [];
  let isBoundary = false;

  pieces.forEach((p, idx) => {
    const { minX, maxX, minInclusive, maxInclusive } = getPieceInterval(p);
    const atMin = Number.isFinite(minX) && Math.abs(x - minX) < 1e-9;
    const atMax = Number.isFinite(maxX) && Math.abs(x - maxX) < 1e-9;
    if (atMin || atMax) isBoundary = true;

    const passMin = atMin ? minInclusive : x > minX;
    const passMax = atMax ? maxInclusive : x < maxX;
    if (passMin && passMax) {
      matches.push(idx);
    }
  });

  if (matches.length === 0) {
    return { defined: false, y: null, pieceIndex: -1, isBoundary, collision: false };
  }

  const ys = matches.map((idx) => evalPieceValue(pieces[idx], x));
  const collision = matches.length > 1 && ys.some((yVal) => Math.abs(yVal - ys[0]) > 1e-8);
  const cleanY = collision ? null : Math.abs(ys[0]) < 1e-11 ? 0 : ys[0];

  return {
    defined: !collision,
    y: cleanY,
    pieceIndex: matches[0],
    isBoundary,
    collision,
    candidateYs: ys,
  };
}

export function validatePiecewiseFunction(pieces) {
  if (!Array.isArray(pieces) || pieces.length <= 1) {
    return { isValidFunction: true, collisions: [] };
  }

  const collisions = [];
  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      const a = getPieceInterval(pieces[i]);
      const b = getPieceInterval(pieces[j]);
      const lo = Math.max(a.minX, b.minX);
      const hi = Math.min(a.maxX, b.maxX);
      if (lo < hi - 1e-9) {
        const probe = Number.isFinite(lo) && Number.isFinite(hi) ? (lo + hi) / 2 : Number.isFinite(lo) ? lo + 1 : Number.isFinite(hi) ? hi - 1 : 0;
        const ya = evalPieceValue(pieces[i], probe);
        const yb = evalPieceValue(pieces[j], probe);
        if (Math.abs(ya - yb) > 1e-8) {
          collisions.push({ x: probe, pieces: [i, j], reason: 'Intervalos superpuestos con distinta fórmula.' });
        }
      } else if (Math.abs(lo - hi) <= 1e-9 && Number.isFinite(lo)) {
        const aIncludes =
          (Math.abs(lo - a.minX) < 1e-9 && a.minInclusive) ||
          (Math.abs(lo - a.maxX) < 1e-9 && a.maxInclusive);
        const bIncludes =
          (Math.abs(lo - b.minX) < 1e-9 && b.minInclusive) ||
          (Math.abs(lo - b.maxX) < 1e-9 && b.maxInclusive);
        if (aIncludes && bIncludes) {
          const ya = evalPieceValue(pieces[i], lo);
          const yb = evalPieceValue(pieces[j], lo);
          if (Math.abs(ya - yb) > 1e-8) {
            collisions.push({
              x: lo,
              pieces: [i, j],
              reason: `Doble punto cerrado en la frontera x = ${fmtNumberEsAR(lo)} con alturas distintas.`,
            });
          }
        }
      }
    }
  }

  return {
    isValidFunction: collisions.length === 0,
    collisions,
  };
}

function mergeIntervals(rawList) {
  const list = rawList
    .filter((iv) => iv.lo < iv.hi - 1e-9 || (Math.abs(iv.lo - iv.hi) <= 1e-9 && iv.loC && iv.hiC))
    .sort((a, b) => a.lo - b.lo || (a.loC === b.loC ? 0 : a.loC ? -1 : 1));
  if (list.length === 0) return [];

  const merged = [{ ...list[0] }];
  for (let i = 1; i < list.length; i++) {
    const cur = list[i];
    const last = merged[merged.length - 1];
    const overlaps = cur.lo < last.hi - 1e-9;
    const touches = Math.abs(cur.lo - last.hi) <= 1e-9 && (last.hiC || cur.loC);
    if (overlaps || touches) {
      if (cur.hi > last.hi + 1e-9) {
        last.hi = cur.hi;
        last.hiC = cur.hiC;
      } else if (Math.abs(cur.hi - last.hi) <= 1e-9) {
        last.hiC = last.hiC || cur.hiC;
      }
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

function formatNumExactRat(n) {
  if (!Number.isFinite(n)) return n > 0 ? '+∞' : `${MINUS}∞`;
  const r = ratFromNumber(n, 10000);
  if (Math.abs(ratToNumber(r) - n) < 1e-7) return fmtRat(r);
  return fmtNumberEsAR(n, 2);
}

function formatMergedIntervals(list) {
  if (!list || list.length === 0) return '∅';
  if (list.length === 1 && list[0].lo === -Infinity && list[0].hi === Infinity) return 'ℝ';
  return list
    .map((iv) => {
      if (Math.abs(iv.lo - iv.hi) <= 1e-9 && iv.loC && iv.hiC) {
        return `{${formatNumExactRat(iv.lo)}}`;
      }
      const l = iv.lo === -Infinity ? `(${MINUS}∞` : `${iv.loC ? '[' : '('}${formatNumExactRat(iv.lo)}`;
      const r = iv.hi === Infinity ? '+∞)' : `${formatNumExactRat(iv.hi)}${iv.hiC ? ']' : ')'}`;
      return `${l}; ${r}`;
    })
    .join(' ∪ ');
}

export function analyzePiecewiseLinear(pieces) {
  const validity = validatePiecewiseFunction(pieces);
  const domIntervals = [];
  const imgIntervals = [];
  const cPlusIntervals = [];
  const cMinusIntervals = [];
  const roots = [];

  for (const piece of pieces) {
    const { minX, maxX, minInclusive, maxInclusive } = getPieceInterval(piece);
    const m = typeof piece.m === 'object' ? ratToNumber(piece.m) : Number(piece.m ?? 0);
    const b = typeof piece.b === 'object' ? ratToNumber(piece.b) : Number(piece.b ?? 0);

    domIntervals.push({ lo: minX, hi: maxX, loC: minInclusive, hiC: maxInclusive });

    // Imagen del tramo
    if (Math.abs(m) < 1e-10) {
      imgIntervals.push({ lo: b, hi: b, loC: true, hiC: true });
      if (b > 1e-10) cPlusIntervals.push({ lo: minX, hi: maxX, loC: minInclusive, hiC: maxInclusive });
      else if (b < -1e-10) cMinusIntervals.push({ lo: minX, hi: maxX, loC: minInclusive, hiC: maxInclusive });
    } else {
      const yMinEnd = Number.isFinite(minX) ? m * minX + b : m > 0 ? -Infinity : Infinity;
      const yMaxEnd = Number.isFinite(maxX) ? m * maxX + b : m > 0 ? Infinity : -Infinity;
      if (m > 0) {
        imgIntervals.push({ lo: yMinEnd, hi: yMaxEnd, loC: minInclusive, hiC: maxInclusive });
      } else {
        imgIntervals.push({ lo: yMaxEnd, hi: yMinEnd, loC: maxInclusive, hiC: minInclusive });
      }

      const root = -b / m;
      const inMin = !Number.isFinite(minX) || (Math.abs(root - minX) < 1e-9 ? minInclusive : root > minX);
      const inMax = !Number.isFinite(maxX) || (Math.abs(root - maxX) < 1e-9 ? maxInclusive : root < maxX);
      if (inMin && inMax) {
        roots.push(Math.abs(root) < 1e-11 ? 0 : root);
      }

      // Signo en [minX, maxX]
      if (m > 0) {
        if (root <= minX + 1e-9) {
          cPlusIntervals.push({ lo: minX, hi: maxX, loC: Math.abs(root - minX) < 1e-9 ? false : minInclusive, hiC: maxInclusive });
        } else if (root >= maxX - 1e-9) {
          cMinusIntervals.push({ lo: minX, hi: maxX, loC: minInclusive, hiC: Math.abs(root - maxX) < 1e-9 ? false : maxInclusive });
        } else {
          cMinusIntervals.push({ lo: minX, hi: root, loC: minInclusive, hiC: false });
          cPlusIntervals.push({ lo: root, hi: maxX, loC: false, hiC: maxInclusive });
        }
      } else {
        if (root <= minX + 1e-9) {
          cMinusIntervals.push({ lo: minX, hi: maxX, loC: Math.abs(root - minX) < 1e-9 ? false : minInclusive, hiC: maxInclusive });
        } else if (root >= maxX - 1e-9) {
          cPlusIntervals.push({ lo: minX, hi: maxX, loC: minInclusive, hiC: Math.abs(root - maxX) < 1e-9 ? false : maxInclusive });
        } else {
          cPlusIntervals.push({ lo: minX, hi: root, loC: minInclusive, hiC: false });
          cMinusIntervals.push({ lo: root, hi: maxX, loC: false, hiC: maxInclusive });
        }
      }
    }
  }

  // Discontinuidades de salto en fronteras finitas
  const boundaries = new Set();
  for (const p of pieces) {
    if (Number.isFinite(p.minX)) boundaries.add(p.minX);
    if (Number.isFinite(p.maxX)) boundaries.add(p.maxX);
  }
  const jumps = [];
  for (const bx of [...boundaries].sort((a, b) => a - b)) {
    const leftRes = evalPiecewiseLinear(pieces, bx - 1e-5);
    const rightRes = evalPiecewiseLinear(pieces, bx + 1e-5);
    const atRes = evalPiecewiseLinear(pieces, bx);
    const vals = [leftRes.y, rightRes.y, atRes.y].filter((v) => v !== null);
    if (vals.length >= 2 && (Math.max(...vals) - Math.min(...vals) > 1e-3 || !atRes.defined)) {
      jumps.push({ x: bx, leftLimit: leftRes.y, atValue: atRes.y, rightLimit: rightRes.y });
    }
  }

  // Chequeo de inyectividad: ¿algún tramo es constante (m=0) o dos imágenes se solapan?
  let isInjective = validity.isValidFunction;
  for (const p of pieces) {
    const m = typeof p.m === 'object' ? ratToNumber(p.m) : Number(p.m ?? 0);
    if (Math.abs(m) < 1e-10) {
      // Un tramo constante en más de un punto destruye la inyectividad
      const { minX, maxX } = getPieceInterval(p);
      if (maxX - minX > 1e-9) isInjective = false;
    }
  }
  if (isInjective) {
    const sortedImgs = [...imgIntervals].sort((a, b) => a.lo - b.lo);
    for (let i = 0; i < sortedImgs.length; i++) {
      for (let j = i + 1; j < sortedImgs.length; j++) {
        const a = sortedImgs[i];
        const b = sortedImgs[j];
        const overlap = b.lo < a.hi - 1e-9 || (Math.abs(b.lo - a.hi) <= 1e-9 && a.hiC && b.loC);
        if (overlap) isInjective = false;
      }
    }
  }

  const domMerged = mergeIntervals(domIntervals);
  const imgMerged = mergeIntervals(imgIntervals);
  const cPlusMerged = mergeIntervals(cPlusIntervals);
  const cMinusMerged = mergeIntervals(cMinusIntervals);
  const uniqRoots = roots
    .sort((a, b) => a - b)
    .filter((v, idx, arr) => idx === 0 || Math.abs(v - arr[idx - 1]) > 1e-8);

  const isSurjective =
    imgMerged.length === 1 && imgMerged[0].lo === -Infinity && imgMerged[0].hi === Infinity;

  return {
    isValidFunction: validity.isValidFunction,
    collisions: validity.collisions,
    domain: formatMergedIntervals(domMerged),
    image: formatMergedIntervals(imgMerged),
    domainIntervals: domMerged,
    imageIntervals: imgMerged,
    roots: uniqRoots,
    C0: uniqRoots.length ? `{${uniqRoots.map(formatNumExactRat).join('; ')}}` : '∅',
    CPlus: formatMergedIntervals(cPlusMerged),
    CMinus: formatMergedIntervals(cMinusMerged),
    jumps,
    isInjective,
    isSurjective,
    isBijective: isInjective && isSurjective,
  };
}

/* ==========================================================================
   6. Motor Cognitivo de Diagnóstico (10 IDs Canónicos)
   ========================================================================== */

export const LINEAR_DIAGNOSTIC_DEFINITIONS = Object.freeze({
  inverted_slope_dx_over_dy: {
    id: 'inverted_slope_dx_over_dy',
    pose: 'colapso',
    tag: 'Pendiente invertida',
    message:
      '¡Ojo! Calculaste Δx / Δy (avance horizontal sobre variación vertical). La pendiente mide cuánto sube o baja y por cada unidad que avanza x: m = Δy / Δx.',
  },
  sign_error_in_slope_subtraction: {
    id: 'sign_error_in_slope_subtraction',
    pose: 'sospecha',
    tag: 'Signo al restar',
    message:
      'Mmm... revisá el orden de la resta o el signo menos con coordenadas negativas. Si arriba hacés y₂ − y₁, abajo tiene que ir en el mismo orden: x₂ − x₁.',
  },
  swapped_slope_and_intercept: {
    id: 'swapped_slope_and_intercept',
    pose: 'pensativa',
    tag: 'Pendiente y ordenada cruzadas',
    message:
      'Cuidado: intercambiaste la pendiente m (el número que multiplica a x) con la ordenada al origen b (el término independiente que corta al eje Y).',
  },
  confused_parallel_with_perpendicular: {
    id: 'confused_parallel_with_perpendicular',
    pose: 'unamused',
    tag: 'Condición de perpendicularidad',
    message:
      'Frená ahí: para que dos rectas oblicuas formen 90°, la pendiente nueva debe ser opuesta E inversa (−1/m), no alcanza con darla vuelta (+1/m) ni con cambiar solo el signo (−m).',
  },
  divided_by_zero_vertical_horizontal: {
    id: 'divided_by_zero_vertical_horizontal',
    pose: 'panico',
    tag: 'Recta vertical / División por cero',
    message:
      '¡Alerta! Cuando x₁ = x₂, Δx vale 0 y la recta es vertical (x = k): no tiene pendiente definida ni es función, y su perpendicular es una horizontal y = constante (no se usa −1/0).',
  },
  segmentary_invalid_zero_case: {
    id: 'segmentary_invalid_zero_case',
    pose: 'lentes-brillo',
    tag: 'Segmentaria prohibida',
    message:
      'Trampa clásica: la forma segmentaria x/a + y/b = 1 exige que la recta corte a ambos ejes fuera del origen (a ≠ 0 y b ≠ 0). Si pasa por (0; 0), es horizontal o es vertical, ¡no existe forma segmentaria!',
  },
  mediatriz_missing_midpoint_or_perp: {
    id: 'mediatriz_missing_midpoint_or_perp',
    pose: 'pensativa',
    tag: 'Definición de mediatriz',
    message:
      'Recordá que la mediatriz de PQ cumple dos condiciones a la vez: es perpendicular al segmento (−1/m) Y pasa exactamente por su punto medio M = ((x₁+x₂)/2; (y₁+y₂)/2), no por P ni por Q.',
  },
  forgot_abs_or_sqrt_in_distance: {
    id: 'forgot_abs_or_sqrt_in_distance',
    pose: 'lentes-brillo',
    tag: 'Raíz o módulo olvidado',
    message:
      'Te faltó aplicar la raíz cuadrada en Pitágoras (devolviste d² en lugar de d) o el valor absoluto |Ax₀ + By₀ + C| / √(A² + B²) en la distancia punto-recta.',
  },
  confused_x_and_y_in_linear_sets: {
    id: 'confused_x_and_y_in_linear_sets',
    pose: 'unamused',
    tag: 'Eje X vs Eje Y en C⁺/C⁻',
    message:
      'Los conjuntos C₀, C⁺ y C⁻ se leen sobre el eje X alrededor de la raíz x₀ (y sin incluir la raíz con corchete en C⁺ o C⁻), nunca usando la ordenada al origen b.',
  },
  piecewise_boundary_inclusion_error: {
    id: 'piecewise_boundary_inclusion_error',
    pose: 'sospecha',
    tag: 'Frontera o extremo en tramos',
    message:
      'Revisá los extremos abiertos (<) frente a cerrados (≤): si un tramo termina con x < 0, el valor límite en x = 0 queda con paréntesis abierto en la imagen y no se incluye.',
  },
  equivalent_form: {
    id: 'equivalent_form',
    pose: 'sospecha',
    tag: 'Equivalente, otra forma',
    message:
      'Tu ecuación describe exactamente la misma recta, pero el ejercicio pide escribirla en otra forma (explícita y = mx + b, implícita ax + by + c = 0 o segmentaria x/a + y/b = 1).',
  },
  comma_instead_of_semicolon: {
    id: 'comma_instead_of_semicolon',
    pose: 'sospecha',
    tag: 'Notación de Exactas',
    message:
      'En Exactas UNMDP reservamos la coma "," para decimales y separamos coordenadas o extremos de intervalos con punto y coma ";", por ejemplo (2; −3) o (−∞; 3/2).',
  },
});

export function diagnoseLinear(userInput, context = {}) {
  const raw = String(userInput ?? '').trim();
  if (!raw) return null;

  // 0. Mapa explícito de distractores (para choice items)
  if (context.diagnosticMap && context.diagnosticMap[raw]) {
    const id = context.diagnosticMap[raw];
    return LINEAR_DIAGNOSTIC_DEFINITIONS[id] || null;
  }

  // 0b. Error de coma en vez de punto y coma en pares o intervalos
  if (
    (context.kind === 'pair' || context.kind === 'interval' || context.kind === 'set') &&
    raw.includes(',') &&
    !raw.includes(';') &&
    !/^[+-]?\d+,\d+$/.test(raw)
  ) {
    return LINEAR_DIAGNOSTIC_DEFINITIONS.comma_instead_of_semicolon;
  }

  const target = context.target || '';

  // 1. Pendiente invertida dx/dy o error de signo al restar
  if (target === 'slope' && context.p1 && context.p2) {
    try {
      const val = parseNumberOrFraction(raw);
      const dx = context.p2.x - context.p1.x;
      const dy = context.p2.y - context.p1.y;
      if (Math.abs(dx) < 1e-9) {
        return LINEAR_DIAGNOSTIC_DEFINITIONS.divided_by_zero_vertical_horizontal;
      }
      const trueM = dy / dx;
      if (Math.abs(dy) > 1e-9 && Math.abs(val - dx / dy) < 1e-5 && Math.abs(val - trueM) > 1e-5) {
        return LINEAR_DIAGNOSTIC_DEFINITIONS.inverted_slope_dx_over_dy;
      }
      if (Math.abs(val + trueM) < 1e-5 || Math.abs(val - (context.p2.y + context.p1.y) / (context.p2.x - context.p1.x)) < 1e-5) {
        return LINEAR_DIAGNOSTIC_DEFINITIONS.sign_error_in_slope_subtraction;
      }
    } catch {}
  }

  // 2. Vertical / horizontal división por cero
  if (target === 'vertical_or_horizontal') {
    if (/m\s*=\s*0/i.test(raw) || /y\s*=/.test(raw)) {
      return LINEAR_DIAGNOSTIC_DEFINITIONS.divided_by_zero_vertical_horizontal;
    }
  }

  // 3. Segmentaria en caso prohibido o ejes invertidos
  if (target === 'segmentary' || context.requireForm === 'segmentary') {
    const parsed = parseLinearEquation(raw);
    if (!parsed.ok && parsed.errorCode === 'segmentary_zero_intercept') {
      return LINEAR_DIAGNOSTIC_DEFINITIONS.segmentary_invalid_zero_case;
    }
    if (parsed.ok && context.expectedA !== undefined && context.expectedB !== undefined) {
      const eqSwapped = equivalentLineEquation(
        raw,
        `x/${context.expectedB} + y/${context.expectedA} = 1`
      );
      if (eqSwapped.equivalent) {
        return LINEAR_DIAGNOSTIC_DEFINITIONS.segmentary_invalid_zero_case;
      }
    }
  }

  // 4. Ecuación lineal: slope & intercept intercambiados, o paralela/perpendicular confundida
  if (target === 'equation' || target === 'parallel_perp') {
    const parsed = parseLinearEquation(raw);
    if (parsed.ok && !ratIsZero(parsed.B)) {
      const userM = ratToNumber(ratDiv(ratNeg(parsed.A), parsed.B));
      const userB = ratToNumber(ratDiv(ratNeg(parsed.C), parsed.B));

      if (context.m !== undefined && context.b !== undefined) {
        if (Math.abs(userM - context.b) < 1e-5 && Math.abs(userB - context.m) < 1e-5) {
          return LINEAR_DIAGNOSTIC_DEFINITIONS.swapped_slope_and_intercept;
        }
      }

      if (context.refSlope !== undefined && Math.abs(context.refSlope) > 1e-9) {
        const mRef = context.refSlope;
        if (
          Math.abs(userM - 1 / mRef) < 1e-5 ||
          Math.abs(userM + mRef) < 1e-5 ||
          Math.abs(userM - mRef) < 1e-5
        ) {
          return LINEAR_DIAGNOSTIC_DEFINITIONS.confused_parallel_with_perpendicular;
        }
      }
    } else if (parsed.ok && ratIsZero(parsed.B) && target === 'parallel_perp' && context.refIsHorizontal) {
      // ok
    }
  }

  // 4b. Parámetro k en perpendicularidad (sin el menos)
  if (target === 'perp_param' && context.expectedK !== undefined) {
    try {
      const val = parseNumberOrFraction(raw);
      if (Math.abs(val + context.expectedK) < 1e-5) {
        return LINEAR_DIAGNOSTIC_DEFINITIONS.confused_parallel_with_perpendicular;
      }
    } catch {}
  }

  // 5. Mediatriz pasando por extremo P o Q o con pendiente sin invertir
  if (target === 'mediatriz' && context.p1 && context.p2) {
    const parsed = parseLinearEquation(raw);
    if (parsed.ok && !ratIsZero(parsed.B)) {
      const userM = ratToNumber(ratDiv(ratNeg(parsed.A), parsed.B));
      const dx = context.p2.x - context.p1.x;
      const dy = context.p2.y - context.p1.y;
      const segM = dx !== 0 ? dy / dx : null;
      const perpM = segM !== null && segM !== 0 ? -1 / segM : null;

      if (segM !== null && Math.abs(userM - segM) < 1e-5) {
        return LINEAR_DIAGNOSTIC_DEFINITIONS.mediatriz_missing_midpoint_or_perp;
      }
      if (perpM !== null && Math.abs(userM - perpM) < 1e-5) {
        // Pendiente correcta pero no pasa por punto medio M -> probablemente pasó por P o Q
        return LINEAR_DIAGNOSTIC_DEFINITIONS.mediatriz_missing_midpoint_or_perp;
      }
      if (perpM !== null && (Math.abs(userM + perpM) < 1e-5 || Math.abs(userM - segM) < 1e-5)) {
        return LINEAR_DIAGNOSTIC_DEFINITIONS.confused_parallel_with_perpendicular;
      }
    }
  }

  // 6. Distancia punto-recta o distancia entre puntos sin raíz o sin módulo
  if (target === 'distance') {
    try {
      const rad = parseExactRadical(raw);
      if (context.expectedSquared !== undefined && rad.rad === 1 && Math.abs(ratToNumber(rad.rat) - context.expectedSquared) < 1e-5) {
        return LINEAR_DIAGNOSTIC_DEFINITIONS.forgot_abs_or_sqrt_in_distance;
      }
      if (context.numeratorAbs !== undefined && rad.rad === 1 && Math.abs(ratToNumber(rad.rat) - context.numeratorAbs) < 1e-5) {
        return LINEAR_DIAGNOSTIC_DEFINITIONS.forgot_abs_or_sqrt_in_distance;
      }
      if (context.expectedValue !== undefined && rad.rad === context.expectedRad && Math.abs(ratToNumber(rad.rat) + Math.abs(context.expectedCoef)) < 1e-5) {
        return LINEAR_DIAGNOSTIC_DEFINITIONS.forgot_abs_or_sqrt_in_distance;
      }
      if (rad.rat.n < 0) {
        return LINEAR_DIAGNOSTIC_DEFINITIONS.forgot_abs_or_sqrt_in_distance;
      }
    } catch {}
  }

  // 7. C+ / C- usando ordenada b o corchete cerrado en raíz
  if (target === 'sign_set') {
    if (raw.includes('[') || raw.includes(']')) {
      return LINEAR_DIAGNOSTIC_DEFINITIONS.confused_x_and_y_in_linear_sets;
    }
    if (context.yIntercept !== undefined && raw.includes(String(context.yIntercept))) {
      return LINEAR_DIAGNOSTIC_DEFINITIONS.confused_x_and_y_in_linear_sets;
    }
  }

  // 8. Frontera/extremo abierto en función por tramos
  if (target === 'piecewise_image' || target === 'piecewise_sign') {
    if (context.openBoundary !== undefined && raw.includes(`[${context.openBoundary}`)) {
      return LINEAR_DIAGNOSTIC_DEFINITIONS.piecewise_boundary_inclusion_error;
    }
    if (context.closedBoundary !== undefined && raw.includes(`(${context.closedBoundary}`)) {
      return LINEAR_DIAGNOSTIC_DEFINITIONS.piecewise_boundary_inclusion_error;
    }
  }

  return null;
}
