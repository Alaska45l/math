/**
 * @file js/modules/sistemas/expr.js
 * Motor puro de parseo y equivalencia de sistemas lineales 2x2 y conjuntos solución.
 * Reutiliza la aritmética racional exacta y el parser AST de `../lineal/expr.js` sin duplicarlos.
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
  ratToNumber,
  ratIsZero,
  ratIsOne,
  fmtRat,
  fmtNumberEsAR,
  normalizeLinearString,
  parseLinearExprVec,
  normalizeLineCoeffs,
  parseNumberOrFraction,
  parseOrderedPair,
  equivalentSetExactas,
} from '../lineal/expr.js';

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
  ratToNumber,
  ratIsZero,
  ratIsOne,
  fmtRat,
  fmtNumberEsAR,
  parseNumberOrFraction,
  parseOrderedPair,
  equivalentSetExactas,
};

/**
 * Parsea cualquier ecuación lineal en 2 variables (por defecto x, y; soporta h, c, etc.)
 * incluyendo paréntesis y denominadores racionales, devolviendo a*v1 + b*v2 = c.
 */
export function parseSystemEquation(raw, varNames = ['x', 'y']) {
  const s = String(raw ?? '').trim();
  if (!s) {
    return { ok: false, errorCode: 'syntax_error', errorMessage: 'Escribí una ecuación.' };
  }
  const norm = normalizeLinearString(s, varNames);
  if (!norm.includes('=')) {
    return { ok: false, errorCode: 'syntax_error', errorMessage: 'La ecuación del sistema debe contener un signo "=". ' };
  }
  const parts = norm.split('=');
  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
    return { ok: false, errorCode: 'syntax_error', errorMessage: 'Falta un miembro de la igualdad.' };
  }

  try {
    const lhs = parseLinearExprVec(parts[0], varNames);
    const rhs = parseLinearExprVec(parts[1], varNames);
    // lhs - rhs = 0  =>  a*v1 + b*v2 = c  donde a = lhs.x - rhs.x, b = lhs.y - rhs.y, c = rhs.c - lhs.c
    const a = ratSub(lhs.x, rhs.x);
    const b = ratSub(lhs.y, rhs.y);
    const c = ratSub(rhs.c, lhs.c);
    const canon = normalizeLineCoeffs(a, b, ratNeg(c));

    return {
      ok: true,
      a,
      b,
      c,
      canonical: { A: canon.A, B: canon.B, C: canon.C },
      vars: [...varNames],
      normalizedLine: `${fmtRat(a)}${varNames[0]} + (${fmtRat(b)})${varNames[1]} = ${fmtRat(c)}`,
    };
  } catch (err) {
    let errorCode = err.code || 'syntax_error';
    if (errorCode === 'quadratic_or_nonlinear_term' || errorCode === 'variable_in_denominator') {
      errorCode = 'nonlinear_system_equation';
    }
    return {
      ok: false,
      errorCode,
      errorMessage: err.message || 'No pude interpretar la ecuación lineal.',
    };
  }
}

export function parseSystemPair(raw1, raw2, varNames = ['x', 'y']) {
  const eq1 = parseSystemEquation(raw1, varNames);
  if (!eq1.ok) return { ok: false, which: 1, errorCode: eq1.errorCode, errorMessage: eq1.errorMessage };
  const eq2 = parseSystemEquation(raw2, varNames);
  if (!eq2.ok) return { ok: false, which: 2, errorCode: eq2.errorCode, errorMessage: eq2.errorMessage };

  return {
    ok: true,
    a1: eq1.a,
    b1: eq1.b,
    c1: eq1.c,
    a2: eq2.a,
    b2: eq2.b,
    c2: eq2.c,
    vars: [...varNames],
  };
}

function sameLineRow(r1, r2) {
  // Compara (a1, b1, c1) y (a2, b2, c2) como múltiplos escalares no nulos
  const z1 = ratIsZero(r1.a) && ratIsZero(r1.b) && ratIsZero(r1.c);
  const z2 = ratIsZero(r2.a) && ratIsZero(r2.b) && ratIsZero(r2.c);
  if (z1 || z2) return z1 && z2;
  return (
    ratEq(ratMul(r1.a, r2.b), ratMul(r2.a, r1.b)) &&
    ratEq(ratMul(r1.a, r2.c), ratMul(r2.a, r1.c)) &&
    ratEq(ratMul(r1.b, r2.c), ratMul(r2.b, r1.c))
  );
}

/**
 * Compara dos sistemas 2x2 verificando si coinciden sus conjuntos solución
 * (SCD: mismo punto único; SCI: misma recta; SI: ambas ecuaciones paralelas equivalentes al par dado).
 */
export function equivalentSystem2x2(sysA, sysB) {
  const detA = ratSub(ratMul(sysA.a1, sysA.b2), ratMul(sysA.a2, sysA.b1));
  const detB = ratSub(ratMul(sysB.a1, sysB.b2), ratMul(sysB.a2, sysB.b1));

  if (!ratIsZero(detA) && !ratIsZero(detB)) {
    const xA = ratDiv(ratSub(ratMul(sysA.c1, sysA.b2), ratMul(sysA.c2, sysA.b1)), detA);
    const yA = ratDiv(ratSub(ratMul(sysA.a1, sysA.c2), ratMul(sysA.a2, sysA.c1)), detA);
    const xB = ratDiv(ratSub(ratMul(sysB.c1, sysB.b2), ratMul(sysB.c2, sysB.b1)), detB);
    const yB = ratDiv(ratSub(ratMul(sysB.a1, sysB.c2), ratMul(sysB.a2, sysB.c1)), detB);
    return ratEq(xA, xB) && ratEq(yA, yB);
  }

  if (ratIsZero(detA) !== ratIsZero(detB)) return false;

  const rowA1 = { a: sysA.a1, b: sysA.b1, c: sysA.c1 };
  const rowA2 = { a: sysA.a2, b: sysA.b2, c: sysA.c2 };
  const rowB1 = { a: sysB.a1, b: sysB.b1, c: sysB.c1 };
  const rowB2 = { a: sysB.a2, b: sysB.b2, c: sysB.c2 };

  return (
    (sameLineRow(rowA1, rowB1) && sameLineRow(rowA2, rowB2)) ||
    (sameLineRow(rowA1, rowB2) && sameLineRow(rowA2, rowB1))
  );
}

/**
 * Parsea respuestas del conjunto solución de un sistema 2x2 en formato Exactas:
 *  - SCD: {(6; 1)}, (6; 1), S = {(14/5; -8/5)}, x=6, y=1
 *  - SI: ∅, vacio, vacío, {}, SI, incompatible
 *  - SCI: SCI, compatible indeterminado, {(x; 2x - 1) | x in R}
 */
export function parseSolutionSet2x2(raw) {
  if (raw && typeof raw === 'object' && typeof raw.status === 'string') {
    return raw;
  }
  const s = String(raw || '')
    .trim()
    .replace(/^S\s*=\s*/i, '')
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .trim();

  if (!s) throw new SyntaxError('Ingresá el conjunto solución.');

  const lower = s.toLowerCase().replace(/\s+/g, '');
  if (['∅', '{}', 'vacio', 'vacío', 'si', 'incompatible', 'sinsolucion', 'sinsolución'].includes(lower)) {
    return { status: 'SI', point: null, lineExpr: null };
  }

  if (lower === 'sci' || lower.includes('compatibleindeterminado') || lower.includes('infinitassoluciones')) {
    return { status: 'SCI', point: null, lineExpr: null };
  }

  // Formato parametrico {(x; mx+b) | x in R} o {(x; mx+b) / x ∈ ℝ}
  const sciMatch = s.match(/^\{\s*\(\s*x\s*;\s*([^)|/]+?)\s*\)\s*(?:[|/].*)?\}$/i);
  if (sciMatch) {
    const exprPart = sciMatch[1].trim();
    if (/[x]/i.test(exprPart)) {
      const parsed = parseSystemEquation(`y = ${exprPart}`, ['x', 'y']);
      if (parsed.ok) {
        return { status: 'SCI', point: null, lineExpr: parsed };
      }
    }
  }

  // Formato x=6, y=1 o x=6; y=1
  const xyMatch = s.match(/^x\s*=\s*([^,;]+)[,;]\s*y\s*=\s*([^,;]+)$/i);
  if (xyMatch) {
    const rx = ratFromString(xyMatch[1].trim());
    const ry = ratFromString(xyMatch[2].trim());
    return { status: 'SCD', point: { x: rx, y: ry }, lineExpr: null };
  }

  // Formato {(x0; y0)} o (x0; y0)
  let cleanPair = s;
  if (cleanPair.startsWith('{') && cleanPair.endsWith('}')) {
    cleanPair = cleanPair.slice(1, -1).trim();
  }
  const pt = parseOrderedPair(cleanPair);
  return {
    status: 'SCD',
    point: {
      x: pt.rx || ratFromNumber(pt.x),
      y: pt.ry || ratFromNumber(pt.y),
    },
    lineExpr: null,
  };
}

export function equivalentSolutionSet2x2(userStr, expectedSol) {
  const parsedUser = parseSolutionSet2x2(userStr);
  const exp = typeof expectedSol === 'string' ? parseSolutionSet2x2(expectedSol) : expectedSol;

  if (parsedUser.status !== exp.status) return false;
  if (exp.status === 'SI') return true;
  if (exp.status === 'SCI') {
    if (!parsedUser.lineExpr || !exp.lineExpr) return true;
    return sameLineRow(
      { a: parsedUser.lineExpr.a, b: parsedUser.lineExpr.b, c: parsedUser.lineExpr.c },
      { a: exp.lineExpr.a, b: exp.lineExpr.b, c: exp.lineExpr.c }
    );
  }
  return ratEq(parsedUser.point.x, exp.point.x) && ratEq(parsedUser.point.y, exp.point.y);
}
