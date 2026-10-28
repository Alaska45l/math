/**
 * logic.js — Lógica matemática pura para sucesiones aritméticas y geométricas.
 * 100% libre de efectos secundarios y de acceso al DOM.
 */

import { parse, evaluate, evalRange, isStandardForm, isNMinus1, toDisplay, MINUS_CHAR } from './expr.js';

/**
 * Comparación con tolerancia relativa estricta.
 */
export const approxEq = (a, b) =>
  Number.isFinite(a) && Number.isFinite(b) &&
  Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

/**
 * Calcula el n-ésimo término a(n).
 * Exige n entero >= 1; de lo contrario lanza RangeError.
 */
export function term(kind, k, step, n) {
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError(`El índice n debe ser un entero mayor o igual a 1. Se recibió: ${n}`);
  }

  if (kind === 'ari') {
    return k + (n - 1) * step;
  }
  if (kind === 'geo') {
    return k * Math.pow(step, n - 1);
  }
  throw new TypeError(`Tipo de sucesión desconocido: ${kind}`);
}

/**
 * Genera la lista de los primeros count términos: [a(1), ..., a(count)].
 */
export function terms(kind, k, step, count) {
  const c = Math.max(0, Math.floor(count));
  const list = [];
  for (let n = 1; n <= c; n++) {
    list.push(term(kind, k, step, n));
  }
  return list;
}

/**
 * Clasifica una sucesión numérica dada por un array de al menos 3 términos.
 * Devuelve { kind: 'ari'|'geo'|'both'|'none'|'unknown', d, r, differences, ratios, why }.
 */
export function classify(seq) {
  if (!Array.isArray(seq) || seq.length < 3) {
    return {
      kind: 'unknown',
      d: null,
      r: null,
      differences: [],
      ratios: [],
      why: 'Hacen falta al menos 3 términos para confirmar un patrón.',
    };
  }

  const differences = [];
  const ratios = [];

  for (let i = 0; i < seq.length - 1; i++) {
    differences.push(seq[i + 1] - seq[i]);
    const r = approxEq(seq[i], 0) ? null : seq[i + 1] / seq[i];
    ratios.push(r);
  }

  const isAri = differences.length > 0 && differences.every((d) => approxEq(d, differences[0]));
  const isGeo = ratios.length > 0 && ratios.every((r) => r !== null && !approxEq(r, 0) && approxEq(r, ratios[0]));

  if (isAri && isGeo) {
    return {
      kind: 'both',
      d: 0,
      r: 1,
      differences,
      ratios,
      why: 'La sucesión es constante: la diferencia común es 0 y la razón común es 1.',
    };
  }

  if (isAri) {
    const d = differences[0];
    const why = d < 0
      ? `La diferencia entre términos consecutivos es constante (${d}). La sucesión decrece.`
      : `La diferencia entre términos consecutivos es constante (+${d}).`;
    return { kind: 'ari', d, r: null, differences, ratios, why };
  }

  if (isGeo) {
    const r = ratios[0];
    return {
      kind: 'geo',
      d: null,
      r,
      differences,
      ratios,
      why: `La razón entre términos consecutivos es constante (×${r}).`,
    };
  }

  return {
    kind: 'none',
    d: null,
    r: null,
    differences,
    ratios,
    why: 'Ni la diferencia ni la razón entre términos consecutivos es constante.',
  };
}

/**
 * Representación recursiva canónica: ancla a(1) y operación paso a paso.
 */
export function recursiveOf(kind, k, step) {
  return {
    anchor: k,
    op: kind === 'ari' ? '+' : '×',
    value: step,
  };
}

/**
 * Fórmula explícita estándar: { kind, k, step } para k + d(n−1) o k·r^(n−1).
 */
export function explicitStandard(kind, k, step) {
  return { kind, k, step };
}

/**
 * Fórmula explícita simplificada:
 * - ari: { c0: k − d, d } para c0 + d·n
 * - geo: { c0: k / r, r } para c0 · r^n (r ≠ 0)
 */
export function explicitSimplified(kind, k, step) {
  if (kind === 'ari') {
    return { c0: k - step, d: step };
  }
  if (kind === 'geo') {
    if (approxEq(step, 0)) return { c0: 0, r: 0 };
    return { c0: k / step, r: step };
  }
  throw new TypeError(`Tipo desconocido: ${kind}`);
}

/**
 * Extrae k y step a partir de un AST evaluado en n = 1..6.
 * Devuelve { k, step } o null si no se ajusta al kind pedido.
 */
export function fromExplicit(ast, kind) {
  const vals = evalRange(ast, 1, 6);
  if (!vals || vals.length < 6 || vals.some((v) => !Number.isFinite(v))) {
    return null;
  }

  const cl = classify(vals);

  if (kind === 'ari') {
    if (cl.kind === 'ari' || cl.kind === 'both') {
      return { k: vals[0], step: vals[1] - vals[0] };
    }
    return null;
  }

  if (kind === 'geo') {
    if (cl.kind === 'geo' || cl.kind === 'both') {
      return { k: vals[0], step: vals[1] / vals[0] };
    }
    return null;
  }

  return null;
}

/**
 * Averigua si un target pertenece a la sucesión y devuelve el despeje paso a paso.
 */
export function isTerm(kind, k, step, target) {
  const steps = [];

  if (kind === 'ari') {
    steps.push({
      text: 'Planteamos la fórmula explícita igualada al valor objetivo:',
      expr: `${target} = ${k} + ${step} · (n − 1)`,
    });

    if (approxEq(step, 0)) {
      const match = approxEq(target, k);
      steps.push({
        text: match
          ? 'Como la diferencia es 0, todos los términos son iguales a k.'
          : 'Como la diferencia es 0, ningún término puede ser distinto de k.',
        expr: match ? `a(n) = ${k} para todo n` : `${target} ≠ ${k}`,
      });
      return { isTerm: match, n: match ? 1 : null, steps };
    }

    const diff = target - k;
    steps.push({
      text: `Restamos el primer término (${k}) a ambos lados:`,
      expr: `${target} − (${k}) = ${diff} = ${step} · (n − 1)`,
    });

    const jumps = diff / step;
    steps.push({
      text: `Dividimos por la diferencia común (${step}) para hallar la cantidad de saltos:`,
      expr: `n − 1 = ${diff} / (${step}) = ${jumps}`,
    });

    const nRaw = jumps + 1;
    const isInt = approxEq(nRaw, Math.round(nRaw));
    const rounded = Math.round(nRaw);
    const valid = isInt && rounded >= 1;

    steps.push({
      text: 'Sumamos 1 para despejar la posición n:',
      expr: `n = ${jumps} + 1 = ${isInt ? rounded : nRaw}`,
    });

    steps.push({
      text: valid
        ? `Como n = ${rounded} es un entero positivo (n ∈ ℕ), ${target} SÍ pertenece a la sucesión y es el término a(${rounded}).`
        : `Como n = ${isInt ? rounded : nRaw} ${rounded < 1 ? 'es menor a 1' : 'no es entero'}, cae en el vacío entre postes y NO pertenece a la sucesión.`,
    });

    return { isTerm: valid, n: valid ? rounded : nRaw, steps };
  }

  if (kind === 'geo') {
    steps.push({
      text: 'Planteamos la fórmula explícita igualada al valor objetivo:',
      expr: `${target} = ${k} · (${step})^(n − 1)`,
    });

    if (approxEq(k, 0)) {
      const match = approxEq(target, 0);
      return { isTerm: match, n: match ? 1 : null, steps };
    }

    const ratio = target / k;
    steps.push({
      text: `Dividimos por el primer término (${k}):`,
      expr: `(${step})^(n − 1) = ${target} / (${k}) = ${ratio}`,
    });

    if (ratio <= 0 && step > 0) {
      steps.push({
        text: 'Una base positiva elevada a cualquier potencia real nunca puede dar un número negativo.',
        expr: `${step}^(n − 1) > 0 ≠ ${ratio}`,
      });
      return { isTerm: false, n: null, steps };
    }

    const jumps = Math.log(Math.abs(ratio)) / Math.log(Math.abs(step));
    const isInt = approxEq(jumps, Math.round(jumps));
    const roundJumps = Math.round(jumps);

    let signOk = true;
    if (step < 0 && isInt) {
      const expectedSign = roundJumps % 2 === 0 ? 1 : -1;
      const actualSign = Math.sign(ratio);
      if (expectedSign !== actualSign) signOk = false;
    }

    const valid = isInt && jumps >= 0 && signOk;
    const nFinal = valid ? roundJumps + 1 : (isInt ? roundJumps + 1 : jumps + 1);

    steps.push({
      text: `Aplicamos logaritmos para despejar los saltos n − 1:`,
      expr: `n − 1 = ${isInt ? roundJumps : jumps}`,
    });

    steps.push({
      text: valid
        ? `Como n = ${nFinal} es un entero positivo con signo compatible, ${target} SÍ pertenece a la sucesión.`
        : `El valor no es alcanzable con un índice entero positivo en el dominio ℕ.`,
    });

    return { isTerm: valid, n: nFinal, steps };
  }

  throw new TypeError(`Tipo desconocido: ${kind}`);
}

/**
 * Deduce el paso común (d o candidatos de r) a partir de dos términos lejanos a(n1) y a(n2).
 */
export function stepFromTwo(kind, n1, a1, n2, a2) {
  if (n1 === n2) {
    throw new Error('Los índices n1 y n2 deben ser distintos.');
  }

  const jumps = n2 - n1;

  if (kind === 'ari') {
    const d = (a2 - a1) / jumps;
    return { d, jumps };
  }

  if (kind === 'geo') {
    const ratio = a2 / a1;
    if (jumps % 2 === 0) {
      if (ratio > 0) {
        const rPos = Math.pow(ratio, 1 / jumps);
        return { candidates: [rPos, -rPos], jumps };
      }
      return { candidates: [], jumps };
    } else {
      if (ratio >= 0) {
        const r = Math.pow(ratio, 1 / jumps);
        return { candidates: [r], jumps };
      }
      const r = -Math.pow(-ratio, 1 / jumps);
      return { candidates: [r], jumps };
    }
  }

  throw new TypeError(`Tipo desconocido: ${kind}`);
}

/**
 * Presets de reglas recursivas generales.
 */
export const GENERAL_RULES = {
  mixta: {
    id: 'mixta',
    label: 'a(n) = 2·a(n − 1) + 1',
    neededAnchors: 1,
    defaultAnchors: [2],
    next: (prev) => 2 * prev[prev.length - 1] + 1,
    formatStep: (prev, nextVal) =>
      `a(${prev.length + 1}) = 2 · a(${prev.length}) + 1 = 2 · (${prev[prev.length - 1]}) + 1 = ${nextVal}`,
  },
  cuadrado: {
    id: 'cuadrado',
    label: 'a(n) = [a(n − 1)]² − 5',
    neededAnchors: 1,
    defaultAnchors: [3],
    next: (prev) => prev[prev.length - 1] ** 2 - 5,
    formatStep: (prev, nextVal) =>
      `a(${prev.length + 1}) = [a(${prev.length})]² − 5 = [${prev[prev.length - 1]}]² − 5 = ${nextVal}`,
  },
  fibonacci: {
    id: 'fibonacci',
    label: 'a(n) = a(n − 1) + a(n − 2)',
    neededAnchors: 2,
    defaultAnchors: [1, 1],
    next: (prev) => prev[prev.length - 1] + prev[prev.length - 2],
    formatStep: (prev, nextVal) =>
      `a(${prev.length + 1}) = a(${prev.length}) + a(${prev.length - 1}) = ${prev[prev.length - 1]} + ${prev[prev.length - 2]} = ${nextVal}`,
  },
};

/**
 * Expande una regla recursiva paso a paso.
 */
export function expandRecursive(spec, count) {
  const rule = typeof spec === 'string'
    ? GENERAL_RULES[spec]
    : GENERAL_RULES[spec?.id] || spec;

  if (!rule) {
    return { ok: false, error: { code: 'unknown_rule', message: 'Regla no reconocida.' } };
  }

  const anchors = spec.anchors || rule.defaultAnchors || [];
  if (anchors.length < rule.neededAnchors) {
    return {
      ok: false,
      error: {
        code: 'missing_anchors',
        needed: rule.neededAnchors,
        got: anchors.length,
        message: 'Esta regla mira 2 escalones hacia atrás, así que necesita 2 términos iniciales (anclas) para arrancar.',
      },
    };
  }

  const termsList = [...anchors];
  const steps = [];

  for (let i = anchors.length; i < count; i++) {
    const nextVal = rule.next(termsList);
    const stepDesc = rule.formatStep ? rule.formatStep(termsList, nextVal) : `Paso ${i + 1}: ${nextVal}`;
    steps.push(stepDesc);
    termsList.push(nextVal);
  }

  return { ok: true, terms: termsList, steps };
}

/**
 * Helper interno: clona un AST reemplazando un nodo unario negativo que envuelve una potencia
 * por una potencia cuya base contiene el unario negativo.
 */
function cloneAndFixNegPow(node) {
  if (!node) return null;

  // Si encontramos unary('-', power)
  if (node.type === 'unary' && node.op === '-' && (node.expr.type === 'power' || (node.expr.type === 'binary' && node.expr.op === '^'))) {
    const innerPower = node.expr;
    return {
      type: 'power',
      left: { type: 'unary', op: '-', expr: innerPower.left },
      right: innerPower.right,
    };
  }

  if (node.type === 'binary') {
    return {
      ...node,
      left: cloneAndFixNegPow(node.left),
      right: cloneAndFixNegPow(node.right),
    };
  }

  if (node.type === 'power') {
    return {
      ...node,
      left: cloneAndFixNegPow(node.left),
      right: cloneAndFixNegPow(node.right),
    };
  }

  if (node.type === 'paren') {
    return { ...node, expr: cloneAndFixNegPow(node.expr) };
  }

  if (node.type === 'unary') {
    return { ...node, expr: cloneAndFixNegPow(node.expr) };
  }

  return node;
}

/**
 * Helper interno: verifica si el AST contiene alguna potencia con exponente 'n'.
 */
function hasExponentN(node) {
  if (!node) return false;
  if (node.type === 'power' || (node.type === 'binary' && node.op === '^')) {
    let exp = node.right;
    while (exp && exp.type === 'paren') exp = exp.expr;
    if (exp && exp.type === 'var' && exp.name === 'n') return true;
  }
  if (node.left && hasExponentN(node.left)) return true;
  if (node.right && hasExponentN(node.right)) return true;
  if (node.expr && hasExponentN(node.expr)) return true;
  return false;
}

function hasNMinus1(node) {
  if (!node) return false;
  if (isNMinus1(node)) return true;
  if (node.left && hasNMinus1(node.left)) return true;
  if (node.right && hasNMinus1(node.right)) return true;
  if (node.expr && hasNMinus1(node.expr)) return true;
  return false;
}

/**
 * Diagnostica errores comunes o advertencias en la fórmula ingresada por el usuario.
 * Prioridades:
 * 1. neg_pow_precedence
 * 2. exponent_n (para geo)
 * 3. wrong_anchor_a2 (si mantuvo n - 1 pero usó a(2))
 * 4. off_by_one (corrida un término / k + d*n)
 * 5. sign_of_step
 * 6. swapped_k_step
 * 7. not_standard_but_equivalent
 */
export function diagnose(userAst, expected, ctx = {}) {
  const issues = [];
  if (!userAst || !expected) return issues;

  const userVals = evalRange(userAst, 1, 10);
  const expVals = [];
  for (let n = 1; n <= 10; n++) {
    expVals.push(term(expected.kind, expected.k, expected.step, n));
  }

  // 1. neg_pow_precedence
  const fixedAst = cloneAndFixNegPow(userAst);
  if (fixedAst && JSON.stringify(fixedAst) !== JSON.stringify(userAst)) {
    const fixedVals = evalRange(fixedAst, 1, 6);
    const matchesExpected = fixedVals.every((v, i) => approxEq(v, expVals[i]));
    if (matchesExpected) {
      issues.push({
        id: 'neg_pow_precedence',
        severity: 'error',
        message: 'Escribir −b^(n−1) deja el signo menos afuera de la potencia: −(b^(n−1)). Si la base es negativa, tenés que encerrarla entre paréntesis: (−b)^(n−1).',
      });
      return issues;
    }
  }

  // 2. exponent_n (para sucesiones geométricas)
  if (expected.kind === 'geo') {
    const nextTerms = [];
    for (let n = 1; n <= 6; n++) {
      nextTerms.push(term('geo', expected.k, expected.step, n + 1));
    }
    const matchesShifted = userVals.slice(0, 6).every((v, i) => approxEq(v, nextTerms[i]));
    if (matchesShifted && hasExponentN(userAst)) {
      issues.push({
        id: 'exponent_n',
        severity: 'error',
        message: 'Usaste exponente n en vez de n − 1. Con exponente n, en el 1.er término ya multiplicás por la razón una vez, perdiendo el primer término.',
      });
      return issues;
    }
  }

  // 3. wrong_anchor_a2 (el error de Kiran: usó a(2) en vez de a(1) manteniendo n - 1 saltos)
  const a2 = term(expected.kind, expected.k, expected.step, 2);
  const a2Vals = [];
  for (let n = 1; n <= 6; n++) {
    a2Vals.push(term(expected.kind, a2, expected.step, n));
  }
  const matchesA2 = userVals.slice(0, 6).every((v, i) => approxEq(v, a2Vals[i]));
  if (matchesA2 && !approxEq(expected.k, a2) && hasNMinus1(userAst)) {
    issues.push({
      id: 'wrong_anchor_a2',
      severity: 'error',
      message: 'Usaste el 2.º término en lugar del 1.º como ancla. El primer término es el valor cuando n = 1.',
    });
    return issues;
  }

  // 4. off_by_one
  // Coincide con expected(n + 1) o expected(n - 1)
  const isOneAhead = userVals.slice(0, 8).every((v, i) => {
    const n = i + 1;
    return approxEq(v, term(expected.kind, expected.k, expected.step, n + 1));
  });
  const isOneBehind = userVals.slice(1, 8).every((v, i) => {
    const n = i + 2;
    return approxEq(v, term(expected.kind, expected.k, expected.step, n - 1));
  });

  if (isOneAhead || isOneBehind) {
    issues.push({
      id: 'off_by_one',
      severity: 'error',
      message: 'La fórmula está corrida un término. Recordá que en n = 1 todavía no diste ningún salto: necesitás n − 1 saltos.',
    });
    return issues;
  }

  // 5. sign_of_step
  const oppStepVals = [];
  for (let n = 1; n <= 6; n++) {
    oppStepVals.push(term(expected.kind, expected.k, -expected.step, n));
  }
  const matchesOppStep = userVals.slice(0, 6).every((v, i) => approxEq(v, oppStepVals[i]));
  if (matchesOppStep && !approxEq(expected.step, 0)) {
    issues.push({
      id: 'sign_of_step',
      severity: 'error',
      message: expected.kind === 'ari'
        ? 'El signo de la diferencia común está invertido. Si la sucesión decrece, d es negativa; si crece, d es positiva.'
        : 'El signo de la razón común está invertido.',
    });
    return issues;
  }

  // 6. swapped_k_step
  const swappedVals = [];
  for (let n = 1; n <= 6; n++) {
    try {
      swappedVals.push(term(expected.kind, expected.step, expected.k, n));
    } catch {
      swappedVals.push(NaN);
    }
  }
  const matchesSwapped = userVals.slice(0, 6).every((v, i) => approxEq(v, swappedVals[i]));
  if (matchesSwapped && !approxEq(expected.k, expected.step)) {
    issues.push({
      id: 'swapped_k_step',
      severity: 'error',
      message: expected.kind === 'ari'
        ? 'Intercambiaste el primer término k con la diferencia común d.'
        : 'Intercambiaste el primer término k con la razón común r.',
    });
    return issues;
  }

  // 7. not_standard_but_equivalent
  const isEquiv = userVals.every((v, i) => approxEq(v, expVals[i]));
  if (isEquiv) {
    const isStd = isStandardForm(userAst, expected.kind);
    if (!isStd) {
      if (ctx.requireStandard === true) {
        issues.push({
          id: 'not_standard_but_equivalent',
          severity: 'warn',
          message: 'Tu fórmula es equivalente a la buscada, pero no está en la forma estándar. Escribila usando el formato con (n − 1).',
        });
      } else {
        issues.push({
          id: 'not_standard_but_equivalent',
          severity: 'warn',
          message: 'Tu fórmula es matemáticamente equivalente y correcta (en forma simplificada).',
        });
      }
    }
  }

  return issues;
}
