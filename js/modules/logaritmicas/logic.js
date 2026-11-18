/**
 * logic.js — Motor matemático analítico puro para Unidad 09: Función Logarítmica.
 * 100% puro, libre de efectos secundarios, libre de DOM, cero eval().
 * Reutiliza helpers numéricos puros de exponenciales/logic.js (solo lectura).
 */

import { fmt, MINUS } from '../../core/math-format.js';
import {
  approxEq,
  toSimpleFraction,
  analyzeExponential,
} from '../exponenciales/logic.js';
import {
  cleanNumber,
  parseNumberOrFraction,
  parseIntervalExactas,
  formatIntervalExactas,
  normalizeLogString,
  parseLogTree,
  evalLogSafe,
  equivalentLog,
  MINUS_CHAR,
} from './expr.js';

export { approxEq, toSimpleFraction, cleanNumber };

function rangeErrorWithCode(message, code) {
  const err = new RangeError(message);
  err.code = code;
  return err;
}

/**
 * 1. Evaluación rigurosa de log_base(arg) con validación de existencia en ℝ.
 */
export function evalLog(base, arg) {
  if (!Number.isFinite(base) || base <= 0 || approxEq(base, 1)) {
    throw rangeErrorWithCode(
      `La base a = ${base} no es válida en ℝ: debe cumplir a > 0 y a ≠ 1.`,
      'invalid_log_base',
    );
  }
  if (!Number.isFinite(arg) || arg <= 0) {
    throw rangeErrorWithCode(
      `El argumento x = ${arg} no es válido en ℝ: debe cumplir x > 0.`,
      'non_positive_argument',
    );
  }
  const raw = Math.abs(base - Math.E) < 1e-12
    ? Math.log(arg)
    : (Math.abs(base - 10) < 1e-12 ? Math.log10(arg) : Math.log(arg) / Math.log(base));
  const value = cleanNumber(raw, 10);
  const exactFraction = toSimpleFraction(value);
  const isExactRational =
    Number.isFinite(value) &&
    (Number.isInteger(value) || exactFraction.includes('/'));
  return {
    base: cleanNumber(base, 10),
    arg: cleanNumber(arg, 10),
    value,
    exactFraction,
    isExactRational,
  };
}

/**
 * 2. Conversor bidireccional exponencial <-> logarítmica:
 *    log_a(x) = y  <=>  a^y = x  (con a > 0, a != 1, x > 0).
 */
export function convertExpLog(spec = {}) {
  const { from = 'exp', base, exponent, argument } = spec;
  const a = Number(base);
  if (!Number.isFinite(a) || a <= 0 || approxEq(a, 1)) {
    throw rangeErrorWithCode(
      'La base debe pertenecer a ℝ⁺ − {1}.',
      'invalid_log_base',
    );
  }

  let y;
  let x;

  if (from === 'exp') {
    if (exponent === undefined || !Number.isFinite(Number(exponent))) {
      if (argument !== undefined && Number(argument) > 0) {
        x = Number(argument);
        y = cleanNumber(Math.log(x) / Math.log(a), 10);
      } else {
        throw rangeErrorWithCode('Se requiere exponente finito o argumento positivo.', 'invalid_conversion');
      }
    } else {
      y = cleanNumber(Number(exponent), 10);
      x = argument !== undefined ? cleanNumber(Number(argument), 10) : cleanNumber(Math.pow(a, y), 10);
      if (x <= 0) {
        throw rangeErrorWithCode('El argumento x = a^y debe ser estrictamente positivo.', 'non_positive_argument');
      }
      if (argument !== undefined && !approxEq(Math.pow(a, y), x, 1e-5)) {
        throw rangeErrorWithCode('La igualdad a^y = x no se verifica con los valores dados.', 'inconsistent_conversion');
      }
    }
  } else {
    if (argument === undefined || !Number.isFinite(Number(argument)) || Number(argument) <= 0) {
      if (exponent !== undefined && Number.isFinite(Number(exponent))) {
        y = cleanNumber(Number(exponent), 10);
        x = cleanNumber(Math.pow(a, y), 10);
      } else {
        throw rangeErrorWithCode('El argumento del logaritmo debe ser estrictamente positivo (x > 0).', 'non_positive_argument');
      }
    } else {
      x = cleanNumber(Number(argument), 10);
      y = exponent !== undefined ? cleanNumber(Number(exponent), 10) : cleanNumber(Math.log(x) / Math.log(a), 10);
      if (exponent !== undefined && !approxEq(Math.pow(a, y), x, 1e-5)) {
        throw rangeErrorWithCode('La equivalencia log_a(x) = y no coincide con a^y = x.', 'inconsistent_conversion');
      }
    }
  }

  const baseLabel = Math.abs(a - Math.E) < 1e-12 ? 'e' : toSimpleFraction(a);
  const argLabel = toSimpleFraction(x);
  const expLabel = toSimpleFraction(y);
  const logName = baseLabel === 'e' ? 'ln' : (baseLabel === '10' ? 'log' : `log_${baseLabel}`);

  return {
    from,
    base: cleanNumber(a, 10),
    exponent: y,
    argument: x,
    expForm: `${baseLabel}^(${expLabel}) = ${argLabel}`,
    logForm: `${logName}(${argLabel}) = ${expLabel}`,
    valid: true,
  };
}

/**
 * 3. Las 5 propiedades operativas oficiales y las 5 identidades falsas prohibidas.
 */
export const OPERATIVE_PROPERTIES = Object.freeze({
  product: {
    id: 'product',
    title: '1. Logaritmo de un producto',
    formula: 'log_a(x · y) = log_a(x) + log_a(y)',
    condition: 'a ∈ ℝ⁺ − {1}, x > 0, y > 0',
    isValidIdentity: true,
  },
  quotient: {
    id: 'quotient',
    title: '2. Logaritmo de un cociente',
    formula: 'log_a(x : y) = log_a(x) − log_a(y)',
    condition: 'a ∈ ℝ⁺ − {1}, x > 0, y > 0',
    isValidIdentity: true,
  },
  power: {
    id: 'power',
    title: '3. Logaritmo de una potencia del argumento',
    formula: 'log_a(xⁿ) = n · log_a(x)',
    condition: 'a ∈ ℝ⁺ − {1}, x > 0, n ∈ ℝ',
    isValidIdentity: true,
  },
  root: {
    id: 'root',
    title: '4. Logaritmo de una raíz del argumento',
    formula: 'log_a(ⁿ√x) = (1/n) · log_a(x)',
    condition: 'a ∈ ℝ⁺ − {1}, x > 0, n ∈ ℕ',
    isValidIdentity: true,
  },
  change_of_base: {
    id: 'change_of_base',
    title: '5. Cambio de base',
    formula: 'log_a(x) = log_b(x) / log_b(a)',
    condition: 'a, b ∈ ℝ⁺ − {1}, x > 0',
    isValidIdentity: true,
  },
});

export const FALSE_LOG_IDENTITIES = Object.freeze({
  false_sum: {
    id: 'false_sum',
    title: 'Falsa distributiva sobre la suma',
    formula: 'log_a(x + y) ≠ log_a(x) + log_a(y)',
    correctRule: 'log_a(x · y) = log_a(x) + log_a(y)',
    defaultValues: { a: 2, x: 4, y: 4, n: 2, b: 10 },
    isValidIdentity: false,
  },
  false_diff: {
    id: 'false_diff',
    title: 'Falsa distributiva sobre la resta',
    formula: 'log_a(x − y) ≠ log_a(x) − log_a(y)',
    correctRule: 'log_a(x : y) = log_a(x) − log_a(y)',
    defaultValues: { a: 2, x: 8, y: 4, n: 2, b: 10 },
    isValidIdentity: false,
  },
  false_power_whole: {
    id: 'false_power_whole',
    title: 'Bajar exponente de todo el logaritmo',
    formula: '(log_a x)ⁿ ≠ n · log_a(x)',
    correctRule: 'log_a(xⁿ) = n · log_a(x) (solo cuando la potencia afecta al argumento x)',
    defaultValues: { a: 2, x: 8, y: 4, n: 2, b: 10 },
    isValidIdentity: false,
  },
  false_quotient_of_logs: {
    id: 'false_quotient_of_logs',
    title: 'Confundir cociente de logaritmos con resta de argumentos',
    formula: 'log_a(x) / log_a(y) ≠ log_a(x − y) y ≠ log_a(x / y)',
    correctRule: 'log_a(x) / log_a(y) = log_y(x) (por cambio de base)',
    defaultValues: { a: 2, x: 8, y: 4, n: 2, b: 10 },
    isValidIdentity: false,
  },
  false_product_of_logs: {
    id: 'false_product_of_logs',
    title: 'Confundir producto de logaritmos con suma o producto interior',
    formula: 'log_a(x) · log_a(y) ≠ log_a(x · y) y ≠ log_a(x) + log_a(y)',
    correctRule: 'log_a(x · y) = log_a(x) + log_a(y); un producto entre dos logaritmos no se fusiona sumando argumentos',
    defaultValues: { a: 2, x: 4, y: 8, n: 2, b: 10 },
    isValidIdentity: false,
  },
});

export function verifyLogIdentity(claimId, testValues = { a: 2, x: 4, y: 8, n: 3, b: 10 }) {
  const a = testValues.a ?? 2;
  const x = testValues.x ?? 4;
  const y = testValues.y ?? 8;
  const n = testValues.n ?? 3;
  const b = testValues.b ?? 10;

  if (a <= 0 || approxEq(a, 1)) {
    throw rangeErrorWithCode('La base a debe cumplir a > 0 y a ≠ 1.', 'invalid_log_base');
  }
  if (b <= 0 || approxEq(b, 1)) {
    throw rangeErrorWithCode('La base auxiliar b debe cumplir b > 0 y b ≠ 1.', 'invalid_log_base');
  }
  if (x <= 0 || y <= 0) {
    throw rangeErrorWithCode('Los argumentos x e y deben ser positivos.', 'non_positive_argument');
  }

  const logBase = (base, arg) => Math.log(arg) / Math.log(base);
  const lx = logBase(a, x);
  const ly = logBase(a, y);

  let lhs;
  let rhs;
  let meta = OPERATIVE_PROPERTIES[claimId] || FALSE_LOG_IDENTITIES[claimId];

  if (!meta) {
    throw new Error(`Identidad desconocida: ${claimId}`);
  }

  switch (claimId) {
    case 'product':
      lhs = logBase(a, x * y);
      rhs = lx + ly;
      break;
    case 'quotient':
      lhs = logBase(a, x / y);
      rhs = lx - ly;
      break;
    case 'power':
      lhs = logBase(a, Math.pow(x, n));
      rhs = n * lx;
      break;
    case 'root': {
      const rootN = Math.max(2, Math.round(Math.abs(n)));
      lhs = logBase(a, Math.pow(x, 1 / rootN));
      rhs = lx / rootN;
      break;
    }
    case 'change_of_base':
      lhs = logBase(a, x);
      rhs = logBase(b, x) / logBase(b, a);
      break;
    case 'false_sum':
      lhs = logBase(a, x + y);
      rhs = lx + ly;
      break;
    case 'false_diff': {
      const safeX = x > y ? x : y + 4;
      const safeY = x > y ? y : 4;
      lhs = logBase(a, safeX - safeY);
      rhs = logBase(a, safeX) - logBase(a, safeY);
      break;
    }
    case 'false_power_whole': {
      const expN = Math.abs(n) < 2 ? 2 : n;
      lhs = Math.pow(lx, expN);
      rhs = expN * lx;
      break;
    }
    case 'false_quotient_of_logs': {
      const safeY = approxEq(y, 1) ? 4 : y;
      const safeX = approxEq(x, safeY) ? safeY * 2 : x;
      lhs = logBase(a, safeX) / logBase(a, safeY);
      rhs = safeX > safeY ? logBase(a, safeX - safeY) : logBase(a, safeX / safeY);
      break;
    }
    case 'false_product_of_logs':
      lhs = lx * ly;
      rhs = logBase(a, x * y);
      break;
  }

  const lhsClean = cleanNumber(lhs, 6);
  const rhsClean = cleanNumber(rhs, 6);
  const isTrueLaw = Boolean(OPERATIVE_PROPERTIES[claimId]);

  const counterexample = isTrueLaw
    ? null
    : {
        a,
        x,
        y,
        n,
        lhs: lhsClean,
        rhs: rhsClean,
        summary: `Con a = ${fmt(a)}, x = ${fmt(x)}, y = ${fmt(y)}: miembro izquierdo = ${fmt(lhsClean)} ≠ miembro derecho = ${fmt(rhsClean)}.`,
      };

  return {
    claimId,
    title: meta.title,
    formula: meta.formula,
    isValidIdentity: isTrueLaw,
    matchesAtPoint: approxEq(lhs, rhs, 1e-6),
    lhs: lhsClean,
    rhs: rhsClean,
    counterexample,
    explanation: isTrueLaw
      ? `Propiedad válida: ${meta.formula} se cumple para todo a > 0 (a ≠ 1) y argumentos positivos.`
      : `Identidad FALSA: ${meta.formula}. ${meta.correctRule}.`,
  };
}

/**
 * 4. Estudio analítico completo para f(x) = k · log_a(m·x + d) + c.
 */
export function analyzeLogFunction({ k = 1, a = 2, m = 1, d = 0, c = 0 } = {}) {
  if (!Number.isFinite(k) || approxEq(k, 0)) {
    throw rangeErrorWithCode('El coeficiente k debe ser distinto de 0.', 'degenerate_k');
  }
  if (!Number.isFinite(m) || approxEq(m, 0)) {
    throw rangeErrorWithCode('El coeficiente m dentro del argumento debe ser distinto de 0.', 'degenerate_m');
  }
  if (!Number.isFinite(a) || a <= 0 || approxEq(a, 1)) {
    throw rangeErrorWithCode('La base a debe cumplir a > 0 y a ≠ 1.', 'invalid_log_base');
  }

  const asymptoteX = cleanNumber(-d / m, 10);
  const domainSpec = m > 0
    ? { lo: asymptoteX, hi: Infinity, loOpen: true, hiOpen: true }
    : { lo: -Infinity, hi: asymptoteX, loOpen: true, hiOpen: true };

  const domain = formatIntervalExactas(domainSpec, { style: 'unicode', digits: 4 });
  const domainAscii = formatIntervalExactas(domainSpec, { style: 'ascii', digits: 4 });

  // Raíz: k * log_a(m*x + d) + c = 0 => m*x + d = a^(-c/k)
  const root = cleanNumber((Math.pow(a, -c / k) - d) / m, 10);

  // Ordenada al origen: existe si 0 pertenece al dominio (es decir, d > 0)
  const yIntercept = d > 0
    ? cleanNumber(k * (Math.log(d) / Math.log(a)) + c, 10)
    : null;

  // Monotonía: sgn(k) * sgn(m) * (a > 1 ? 1 : -1)
  const baseSign = a > 1 ? 1 : -1;
  const monoSign = Math.sign(k) * Math.sign(m) * baseSign;
  const isGrowth = monoSign > 0;
  const monotonicity = isGrowth ? 'creciente' : 'decreciente';

  // Positividad y negatividad estrictamente acotadas por Dom(f) y x0
  let cPosSpec;
  let cNegSpec;
  if (m > 0) {
    // Dominio (x_as; +inf)
    if (isGrowth) {
      cNegSpec = { lo: asymptoteX, hi: root, loOpen: true, hiOpen: true };
      cPosSpec = { lo: root, hi: Infinity, loOpen: true, hiOpen: true };
    } else {
      cPosSpec = { lo: asymptoteX, hi: root, loOpen: true, hiOpen: true };
      cNegSpec = { lo: root, hi: Infinity, loOpen: true, hiOpen: true };
    }
  } else {
    // Dominio (-inf; x_as)
    if (isGrowth) {
      cNegSpec = { lo: -Infinity, hi: root, loOpen: true, hiOpen: true };
      cPosSpec = { lo: root, hi: asymptoteX, loOpen: true, hiOpen: true };
    } else {
      cPosSpec = { lo: -Infinity, hi: root, loOpen: true, hiOpen: true };
      cNegSpec = { lo: root, hi: asymptoteX, loOpen: true, hiOpen: true };
    }
  }

  const cPos = formatIntervalExactas(cPosSpec, { style: 'unicode', digits: 4 });
  const cNeg = formatIntervalExactas(cNegSpec, { style: 'unicode', digits: 4 });
  const cPosAscii = formatIntervalExactas(cPosSpec, { style: 'ascii', digits: 4 });
  const cNegAscii = formatIntervalExactas(cNegSpec, { style: 'ascii', digits: 4 });

  const evaluate = (x) => {
    const arg = m * x + d;
    if (arg <= 0) return NaN;
    return k * (Math.log(arg) / Math.log(a)) + c;
  };

  return {
    k,
    a,
    m,
    d,
    c,
    asymptoteX,
    asymptote: `x = ${fmt(asymptoteX)}`,
    domain,
    domainAscii,
    domainSpec,
    image: 'ℝ',
    imageAscii: 'R',
    root,
    rootsSet: `{ ${fmt(root)} }`,
    yIntercept,
    isGrowth,
    monotonicity,
    iGrowth: isGrowth ? domain : '∅',
    iDecay: isGrowth ? '∅' : domain,
    cPos,
    cNeg,
    cPosAscii,
    cNegAscii,
    cPosSpec,
    cNegSpec,
    isInjective: true,
    isSurjective: true,
    isBijective: true,
    evaluate,
  };
}

/**
 * 5. Cálculo bidireccional de función inversa exponencial <-> logarítmica.
 */
export function computeInverseExpLog(spec = {}) {
  const { from = 'exp' } = spec;

  if (from === 'exp') {
    const { k = 1, a = 2, b = 1, h = 0, c = 0 } = spec;
    if (approxEq(k, 0) || approxEq(b, 0) || a <= 0 || approxEq(a, 1)) {
      throw rangeErrorWithCode('Parámetros inválidos para invertir función exponencial.', 'invalid_inverse_params');
    }
    const expAnalysis = analyzeExponential({ k, a, h: h / b, c });
    const domainSpec = k > 0
      ? { lo: c, hi: Infinity, loOpen: true, hiOpen: true }
      : { lo: -Infinity, hi: c, loOpen: true, hiOpen: true };

    const baseLabel = Math.abs(a - Math.E) < 1e-12 ? 'e' : toSimpleFraction(a);
    const logFn = baseLabel === 'e' ? 'ln' : (baseLabel === '10' ? 'log' : `log_${baseLabel}`);

    const innerArg = (() => {
      const numStr = c === 0 ? 'x' : (c > 0 ? `x − ${fmt(c)}` : `x + ${fmt(-c)}`);
      if (approxEq(k, 1)) return numStr;
      if (approxEq(k, -1)) return `−(${numStr})`;
      return `(${numStr}) / ${fmt(k)}`;
    })();

    let invExpr = `${logFn}(${innerArg})`;
    if (h !== 0) {
      invExpr = `${fmt(h)} + ${invExpr}`;
    }
    if (!approxEq(b, 1)) {
      invExpr = `(${invExpr}) / ${fmt(b)}`;
    }

    const evaluate = (x) => {
      const ratio = (x - c) / k;
      if (ratio <= 0) return NaN;
      return (h + Math.log(ratio) / Math.log(a)) / b;
    };

    return {
      from: 'exp',
      to: 'log',
      domain: formatIntervalExactas(domainSpec, { style: 'unicode', digits: 4 }),
      domainAscii: formatIntervalExactas(domainSpec, { style: 'ascii', digits: 4 }),
      domainSpec,
      image: 'ℝ',
      asymptote: `x = ${fmt(c)}`,
      asymptoteX: c,
      formula: `f⁻¹(x) = ${invExpr}`,
      expression: invExpr,
      expImage: expAnalysis.image,
      evaluate,
    };
  }

  // from === 'log'
  const { k = 1, a = 2, m = 1, d = 0, c = 0 } = spec;
  const logAnalysis = analyzeLogFunction({ k, a, m, d, c });
  const baseLabel = Math.abs(a - Math.E) < 1e-12 ? 'e' : toSimpleFraction(a);
  const expPart = (() => {
    const numStr = c === 0 ? 'x' : (c > 0 ? `x − ${fmt(c)}` : `x + ${fmt(-c)}`);
    const expStr = approxEq(k, 1) ? numStr : (approxEq(k, -1) ? `−(${numStr})` : `(${numStr})/${fmt(k)}`);
    const bParens = baseLabel.includes('/') ? `(${baseLabel})` : baseLabel;
    return `${bParens}^(${expStr})`;
  })();

  let invExpr = expPart;
  if (d !== 0) {
    invExpr += d > 0 ? ` − ${fmt(d)}` : ` + ${fmt(-d)}`;
  }
  if (!approxEq(m, 1)) {
    invExpr = `(${invExpr}) / ${fmt(m)}`;
  }

  const evaluate = (x) => (Math.pow(a, (x - c) / k) - d) / m;

  return {
    from: 'log',
    to: 'exp',
    domain: 'ℝ',
    domainAscii: 'R',
    image: logAnalysis.domain,
    imageAscii: logAnalysis.domainAscii,
    asymptote: `y = ${fmt(logAnalysis.asymptoteX)}`,
    asymptoteY: logAnalysis.asymptoteX,
    formula: `f⁻¹(x) = ${invExpr}`,
    expression: invExpr,
    evaluate,
  };
}

/**
 * 6. Resolutor analítico de ecuaciones logarítmicas con aduana estricta de argumentos.
 */
export function solveLogEquation(spec = {}) {
  const { kind = 'product_domain_filter' } = spec;

  if (kind === 'product_domain_filter') {
    // Ej: log_2(x + 1) + log_2(x - 2) = log_2(4) => x^2 - x - 6 = 0 => x=3 (valido), x=-2 (rechazado)
    const { base = 2, shift1 = 1, shift2 = -2, rhsArg = 4 } = spec;
    const b = -(shift1 + shift2); // -(s1+s2) en x^2 + (s1+s2)x + (s1*s2 - rhsArg) = 0
    const B = shift1 + shift2;
    const C = shift1 * shift2 - rhsArg;
    const disc = B * B - 4 * C;
    const candidates = disc >= 0
      ? [cleanNumber((-B + Math.sqrt(disc)) / 2), cleanNumber((-B - Math.sqrt(disc)) / 2)]
      : [];

    const validSolutions = [];
    const rejectedRoots = [];

    for (const x of candidates) {
      const arg1 = cleanNumber(x + shift1);
      const arg2 = cleanNumber(x + shift2);
      if (arg1 > 0 && arg2 > 0) {
        validSolutions.push(x);
      } else {
        rejectedRoots.push({
          x,
          reason: `Al sustituir x = ${fmt(x)}, algún argumento resulta ≤ 0 (${fmt(arg1)} y ${fmt(arg2)}), violando la existencia del logaritmo en ℝ.`,
        });
      }
    }

    const minBound = Math.max(-shift1, -shift2);
    const domainCondition = `x > ${fmt(minBound)}`;

    return {
      equation: spec.equation || `log_${base}(x + ${shift1}) + log_${base}(x ${shift2 < 0 ? '− ' + (-shift2) : '+ ' + shift2}) = log_${base}(${rhsArg})`,
      domainCondition,
      steps: [
        `Condición de existencia: x + ${shift1} > 0 y x ${shift2 < 0 ? '− ' + (-shift2) : '+ ' + shift2} > 0 ⇒ ${domainCondition}.`,
        `Por propiedad del producto: log_${base}((x + ${shift1})(x ${shift2 < 0 ? '− ' + (-shift2) : '+ ' + shift2})) = log_${base}(${rhsArg}).`,
        `Por inyectividad del logaritmo: x² + (${B})x + (${C}) = 0 ⇒ candidatas: ${candidates.map((v) => fmt(v)).join(' y ')}.`,
        `Control en el dominio ${domainCondition}: ${rejectedRoots.length ? `se descarta ${rejectedRoots.map((r) => fmt(r.x)).join(', ')}; ` : ''}S = { ${validSolutions.map((v) => fmt(v)).join('; ')} }.`,
      ],
      candidates,
      validSolutions,
      rejectedRoots,
      solutionSet: validSolutions.length ? `{ ${validSolutions.map((v) => fmt(v)).join('; ')} }` : '∅',
    };
  }

  if (kind === 'quadratic_sub_log') {
    // Ej: (log_3(x - 1))^2 + log_3(x - 1) = 6 => u^2 + u - 6 = 0 => u = 2 o u = -3 (AMBAS validas en u = log_a!)
    const { base = 3, shift = -1, aCoef = 1, bCoef = 1, cCoef = -6 } = spec;
    const disc = bCoef * bCoef - 4 * aCoef * cCoef;
    const uRoots = disc >= 0
      ? [cleanNumber((-bCoef + Math.sqrt(disc)) / (2 * aCoef)), cleanNumber((-bCoef - Math.sqrt(disc)) / (2 * aCoef))]
      : [];

    const validSolutions = [];
    const rejectedRoots = [];
    const candidates = [];

    for (const u of uRoots) {
      // u = log_base(x + shift) => x = base^u - shift (SIEMPRE da x + shift = base^u > 0!)
      const xVal = cleanNumber(Math.pow(base, u) - shift, 10);
      candidates.push(xVal);
      if (xVal + shift > 0) {
        validSolutions.push(xVal);
      } else {
        rejectedRoots.push({ x: xVal, reason: 'Argumento no positivo.' });
      }
    }

    return {
      equation: spec.equation || `(log_${base}(x ${shift < 0 ? '− ' + (-shift) : '+ ' + shift}))² + log_${base}(x ${shift < 0 ? '− ' + (-shift) : '+ ' + shift}) = ${-cCoef}`,
      domainCondition: `x > ${fmt(-shift)}`,
      uRoots,
      noteOnNegativeU: 'A diferencia de u = aˣ > 0, la sustitución u = log_a(...) recorre todo ℝ: los valores negativos de u SÍ generan soluciones válidas.',
      steps: [
        `Condición de existencia: x ${shift < 0 ? '− ' + (-shift) : '+ ' + shift} > 0 ⇒ x > ${fmt(-shift)}.`,
        `Sustitución u = log_${base}(...) ∈ ℝ: ${aCoef}u² + (${bCoef})u + (${cCoef}) = 0 ⇒ u ∈ { ${uRoots.map((v) => toSimpleFraction(v)).join('; ')} }.`,
        `Como la imagen del logaritmo es todo ℝ, conservamos tanto raíces u positivas como negativas: x = ${base}^u ${shift < 0 ? '+ ' + (-shift) : '− ' + shift}.`,
        `Todas verifican x > ${fmt(-shift)}: S = { ${validSolutions.map((v) => toSimpleFraction(v)).join('; ')} }.`,
      ],
      candidates,
      validSolutions,
      rejectedRoots,
      solutionSet: `{ ${validSolutions.map((v) => toSimpleFraction(v)).join('; ')} }`,
    };
  }

  if (kind === 'intersection_shifted') {
    // log_2(4x + 8) = 3 + log_2(x - 2) => log_2(4x+8) = log_2(8(x-2)) => 4x+8 = 8x-16 => 4x=24 => x=6
    const { base = 2, m1 = 4, d1 = 8, kConst = 3, m2 = 1, d2 = -2 } = spec;
    const factor = Math.pow(base, kConst);
    const xSol = cleanNumber((factor * d2 - d1) / (m1 - factor * m2), 10);
    const valid = m1 * xSol + d1 > 0 && m2 * xSol + d2 > 0;
    return {
      equation: `log_${base}(${m1}x + ${d1}) = ${kConst} + log_${base}(${m2 === 1 ? 'x' : m2 + 'x'} ${d2 < 0 ? '− ' + (-d2) : '+ ' + d2})`,
      domainCondition: `x > ${fmt(Math.max(-d1 / m1, -d2 / m2))}`,
      steps: [
        `Existencia: ${m1}x + ${d1} > 0 y ${m2 === 1 ? 'x' : m2 + 'x'} ${d2 < 0 ? '− ' + (-d2) : '+ ' + d2} > 0.`,
        `Expresamos ${kConst} = log_${base}(${factor}) y unificamos el miembro derecho como producto.`,
        `Igualamos argumentos: ${m1}x + ${d1} = ${factor}(${m2 === 1 ? 'x' : m2 + 'x'} ${d2 < 0 ? '− ' + (-d2) : '+ ' + d2}) ⇒ x = ${fmt(xSol)}.`,
      ],
      candidates: [xSol],
      validSolutions: valid ? [xSol] : [],
      rejectedRoots: valid ? [] : [{ x: xSol, reason: 'Fuera de dominio.' }],
      solutionSet: valid ? `{ ${fmt(xSol)} }` : '∅',
    };
  }

  // Fallback linear_arg: log_base(m*x + d) = rhs
  const { base = 2, m = 1, d = 0, rhs = 3 } = spec;
  const xSol = cleanNumber((Math.pow(base, rhs) - d) / m, 10);
  return {
    equation: `log_${base}(${m}x + ${d}) = ${rhs}`,
    domainCondition: m > 0 ? `x > ${fmt(-d / m)}` : `x < ${fmt(-d / m)}`,
    steps: [
      `Convertimos a forma exponencial: ${m}x + ${d} = ${base}^(${rhs}).`,
      `Despejamos x = ${fmt(xSol)} y verificamos que el argumento sea ${fmt(Math.pow(base, rhs))} > 0.`,
    ],
    candidates: [xSol],
    validSolutions: [xSol],
    rejectedRoots: [],
    solutionSet: `{ ${fmt(xSol)} }`,
  };
}

/**
 * 7. Resolutor de ecuaciones exponenciales de bases no comunes (vía logaritmos).
 */
export function solveNonCommonExpEquation(spec = {}) {
  const { kind = 'power_equal' } = spec;

  if (kind === 'power_equal') {
    const { base = 4, target = 9 } = spec;
    if (base <= 0 || approxEq(base, 1)) {
      throw rangeErrorWithCode('Base exponencial inválida.', 'invalid_log_base');
    }
    if (target <= 0) {
      return {
        equation: `${base}^x = ${target}`,
        domainCondition: 'x ∈ ℝ',
        steps: [`Como ${base}^x > 0 en ℝ y ${target} ≤ 0, no existe solución real.`],
        candidates: [],
        validSolutions: [],
        rejectedRoots: [],
        solutionSet: '∅',
      };
    }
    const xSol = cleanNumber(Math.log(target) / Math.log(base), 6);
    return {
      equation: `${base}^x = ${target}`,
      domainCondition: 'x ∈ ℝ',
      steps: [
        `Como ${target} no es potencia racional inmediata de ${base}, aplicamos logaritmo (base 10, e o base ${base}).`,
        `x · ln(${base}) = ln(${target}) ⇒ x = ln(${target}) / ln(${base}) ≈ ${fmt(xSol)}.`,
      ],
      exactForm: `log_${base}(${target})`,
      candidates: [xSol],
      validSolutions: [xSol],
      rejectedRoots: [],
      solutionSet: `{ ${fmt(xSol)} }`,
    };
  }

  if (kind === 'shifted_power') {
    // a^(m*x + d) - c = 0 => a^(m*x + d) = c
    const { base = 5, m = 2, d = 4, target = 20 } = spec;
    if (target <= 0) {
      return {
        equation: `${base}^(${m}x + ${d}) − ${target} = 0`,
        domainCondition: 'x ∈ ℝ',
        steps: [`${base}^(${m}x + ${d}) = ${target} ≤ 0 es imposible en ℝ.`],
        candidates: [],
        validSolutions: [],
        rejectedRoots: [],
        solutionSet: '∅',
      };
    }
    const xSol = cleanNumber((Math.log(target) / Math.log(base) - d) / m, 6);
    return {
      equation: `${base}^(${m}x + ${d}) − ${target} = 0`,
      domainCondition: 'x ∈ ℝ',
      steps: [
        `Aislamos la potencia: ${base}^(${m}x + ${d}) = ${target}.`,
        `Aplicamos log_${base}: ${m}x + ${d} = log_${base}(${target}) ⇒ x = (log_${base}(${target}) − ${d}) / ${m} ≈ ${fmt(xSol)}.`,
      ],
      candidates: [xSol],
      validSolutions: [xSol],
      rejectedRoots: [],
      solutionSet: `{ ${fmt(xSol)} }`,
    };
  }

  // quadratic_sub_exp: a^(2x) + bCoef * a^x + cCoef = 0 (ej: e^(2x) - e^x - 6 = 0)
  const { base = Math.E, bCoef = -1, cCoef = -6 } = spec;
  const disc = bCoef * bCoef - 4 * cCoef;
  const uRoots = disc >= 0
    ? [cleanNumber((-bCoef + Math.sqrt(disc)) / 2), cleanNumber((-bCoef - Math.sqrt(disc)) / 2)]
    : [];
  const validSolutions = [];
  const rejectedRoots = [];

  for (const u of uRoots) {
    if (u > 0) {
      validSolutions.push(cleanNumber(Math.log(u) / Math.log(base), 6));
    } else {
      rejectedRoots.push({
        u,
        reason: `Como u = aˣ > 0 en ℝ, la raíz auxiliar u = ${fmt(u)} ≤ 0 se descarta obligatoriamente.`,
      });
    }
  }

  const baseName = Math.abs(base - Math.E) < 1e-12 ? 'e' : String(base);
  return {
    equation: spec.equation || `${baseName}^(2x) + (${bCoef})·${baseName}^x + (${cCoef}) = 0`,
    domainCondition: 'u = aˣ > 0',
    steps: [
      `Sustituimos u = ${baseName}ˣ > 0: u² + (${bCoef})u + (${cCoef}) = 0.`,
      `Raíces auxiliares: ${uRoots.map((u) => `u = ${fmt(u)}`).join(' y ')}.`,
      `Descartamos u ≤ 0 y despejamos x de las ramas positivas: S = ${validSolutions.length ? `{ ${validSolutions.map((v) => fmt(v)).join('; ')} }` : '∅'}.`,
    ],
    uRoots,
    candidates: validSolutions,
    validSolutions,
    rejectedRoots,
    solutionSet: validSolutions.length ? `{ ${validSolutions.map((v) => fmt(v)).join('; ')} }` : '∅',
  };
}

/**
 * 8. Sistemas de ecuaciones logarítmicas y exponenciales 2x2.
 */
export function solveLogSystem(spec = {}) {
  const { kind = 'linear_in_logs' } = spec;

  if (kind === 'linear_in_logs') {
    // a1*log_b(x) + b1*log_b(y) = c1
    // a2*log_b(x) + b2*log_b(y) = c2
    // Default: 2*log(x) + log(y) = 0, log(x) - log(y) = -3 => log(x)=-1, log(y)=2 => (1/10; 100)
    const {
      base = 10,
      a1 = 2, b1 = 1, c1 = 0,
      a2 = 1, b2 = -1, c2 = -3,
    } = spec;
    const det = a1 * b2 - a2 * b1;
    if (approxEq(det, 0)) {
      return {
        domainCondition: 'x > 0 ∧ y > 0',
        steps: ['El sistema lineal en u = log(x), v = log(y) es singular (determinante nulo).'],
        validSolutions: [],
        rejectedRoots: [],
        solutionSet: '∅',
      };
    }
    const u = cleanNumber((c1 * b2 - c2 * b1) / det, 10);
    const v = cleanNumber((a1 * c2 - a2 * c1) / det, 10);
    const x = cleanNumber(Math.pow(base, u), 10);
    const y = cleanNumber(Math.pow(base, v), 10);
    return {
      equation: `${a1}·log_${base}(x) + (${b1})·log_${base}(y) = ${c1}  ∧  ${a2}·log_${base}(x) + (${b2})·log_${base}(y) = ${c2}`,
      domainCondition: 'x > 0 ∧ y > 0',
      steps: [
        `Condición de existencia: x > 0 e y > 0.`,
        `Sustituimos u = log_${base}(x) y v = log_${base}(y): resolvemos el sistema 2×2 y hallamos u = ${toSimpleFraction(u)}, v = ${toSimpleFraction(v)}.`,
        `Volvemos a las variables originales: x = ${base}^(${toSimpleFraction(u)}) = ${toSimpleFraction(x)}, y = ${base}^(${toSimpleFraction(v)}) = ${toSimpleFraction(y)}.`,
      ],
      candidates: [{ x, y }],
      validSolutions: [{ x, y }],
      rejectedRoots: [],
      solutionSet: `{ (${toSimpleFraction(x)}; ${toSimpleFraction(y)}) }`,
    };
  }

  if (kind === 'sum_diff_product') {
    // x - y = diff (25), log_b(x) - log_b(y) = logRatio (1 => x/y = b^1 = 10)
    // Default: x - y = 25, log(x) - log(y) = 1 => x = 10y => 9y = 25 => y = 25/9, x = 250/9
    const { base = 10, diff = 25, logRatio = 1 } = spec;
    const ratio = Math.pow(base, logRatio);
    const y = cleanNumber(diff / (ratio - 1), 10);
    const x = cleanNumber(ratio * y, 10);
    const valid = x > 0 && y > 0;
    return {
      equation: `x − y = ${diff}  ∧  log_${base}(x) − log_${base}(y) = ${logRatio}`,
      domainCondition: 'x > 0 ∧ y > 0',
      steps: [
        `Condición de existencia: x > 0 e y > 0.`,
        `Por propiedad del cociente: log_${base}(x / y) = ${logRatio} ⇒ x / y = ${base}^${logRatio} = ${ratio} ⇒ x = ${ratio}y.`,
        `Sustituimos en la primera ecuación: ${ratio}y − y = ${diff} ⇒ y = ${toSimpleFraction(y)}, x = ${toSimpleFraction(x)}.`,
      ],
      candidates: [{ x, y }],
      validSolutions: valid ? [{ x, y }] : [],
      rejectedRoots: valid ? [] : [{ x, y, reason: 'Al menos una incógnita no es positiva.' }],
      solutionSet: valid ? `{ (${toSimpleFraction(x)}; ${toSimpleFraction(y)}) }` : '∅',
    };
  }

  // Fallback exp_pair: 2^x + 2^y = 36, x - y = ... or generic
  const { targetSum = 36, ratioShift = 3 } = spec;
  // 2^x + 2^y = 36, x - y = 3 => 2^y (2^3 + 1) = 36 => 9*2^y = 36 => 2^y = 4 => y=2, x=5
  const uY = targetSum / (Math.pow(2, ratioShift) + 1);
  const y = cleanNumber(Math.log2(uY), 10);
  const x = cleanNumber(y + ratioShift, 10);
  return {
    equation: `2ˣ + 2ʸ = ${targetSum}  ∧  x − y = ${ratioShift}`,
    domainCondition: '(x; y) ∈ ℝ²',
    steps: [
      `Expresamos x = y + ${ratioShift} y reemplazamos: 2^(y+${ratioShift}) + 2ʸ = ${targetSum}.`,
      `Factor común 2ʸ · (${Math.pow(2, ratioShift) + 1}) = ${targetSum} ⇒ 2ʸ = ${uY} ⇒ y = ${fmt(y)}, x = ${fmt(x)}.`,
    ],
    candidates: [{ x, y }],
    validSolutions: [{ x, y }],
    rejectedRoots: [],
    solutionSet: `{ (${fmt(x)}; ${fmt(y)}) }`,
  };
}

/**
 * 9. Modelos reales del programa que requieren logaritmos para despejar tiempo/escala.
 */
export function solveRealWorldLogModel(spec = {}) {
  const { kind } = spec;

  switch (kind) {
    case 'bacteria_exp': {
      // N(t) = N0 * e^(rate*t) => tiempo para multiplicar por factor
      const { N0 = 1, factor = 3, rate = 3, targetCount = null } = spec;
      const mult = targetCount ? targetCount / N0 : factor;
      const t = cleanNumber(Math.log(mult) / rate, 4);
      return { t, exact: `ln(${mult}) / ${rate}`, unit: 'horas' };
    }
    case 'lake_decay': {
      // y(t) = y0 * e^(-k*t) => eliminar pctEliminated (0.5 => queda 0.5)
      const { k = 0.231, remainingFraction = 0.5 } = spec;
      const t = cleanNumber(-Math.log(remainingFraction) / k, 2);
      return { t, exact: `−ln(${remainingFraction}) / ${k}`, unit: 'años' };
    }
    case 'richter_magnitude': {
      const { power = 9000 } = spec;
      if (power <= 0) throw rangeErrorWithCode('La potencia sísmica debe ser positiva.', 'non_positive_argument');
      const magnitude = cleanNumber(Math.log10(power), 2);
      return { magnitude, exact: `log(${power})` };
    }
    case 'richter_ratio': {
      const { m1 = 4.1, m2 = 8.2 } = spec;
      const deltaM = cleanNumber(m2 - m1, 4);
      const powerRatio = cleanNumber(Math.pow(10, deltaM), 2);
      return { deltaM, powerRatio, exact: `10^(${fmt(deltaM)})` };
    }
    case 'particle_velocity': {
      // V(t) = V0 * e^(-k*t)
      const { tHalf = 3, reductionFrac = 0.25 } = spec;
      const k = cleanNumber(Math.log(2) / tHalf, 2);
      const remaining = 1 - reductionFrac;
      const t = cleanNumber(-Math.log(remaining) / k, 2);
      return { k, t, unit: 'minutos' };
    }
    case 'medication_decay': {
      // M(t) = M0 * (0.8)^t
      const { M0 = 20, base = 0.8, hours = 24, targetFraction = 0.25 } = spec;
      const remainingAtHours = cleanNumber(M0 * Math.pow(base, hours), 4);
      const tTarget = cleanNumber(Math.log(targetFraction) / Math.log(base), 2);
      return { remainingAtHours, tTarget, unit: 'horas' };
    }
    case 'bacteria_shifted': {
      // N(t) = 1 + 2^(t/10) (en miles)
      const initial = 2; // 1 + 2^0 = 2 (miles) => doble = 4 => 2^(t/10) = 3
      const tDouble = cleanNumber(10 * Math.log2(3), 2);
      return { initial, tDouble, unit: 'horas' };
    }
    case 'atm_pressure': {
      // p(x) = 0.9^x (x en km)
      const { meters = 3500, targetPressure = 0.8 } = spec;
      const pAtHeight = cleanNumber(Math.pow(0.9, meters / 1000), 4);
      const heightKm = cleanNumber(Math.log(targetPressure) / Math.log(0.9), 2);
      return { pAtHeight, heightKm, unit: 'km' };
    }
    case 'biologist_fit': {
      // B(t) = B0 * e^(k*t)
      const { B0 = 10000, tObs = 2, Bobs = 40000, Btarget = 70000 } = spec;
      const k = cleanNumber(Math.log(Bobs / B0) / tObs, 4);
      const tTarget = cleanNumber(Math.log(Btarget / B0) / k, 2);
      return { k, tTarget, unit: 'horas' };
    }
    case 'tree_growth': {
      // h(t) = 25 + 12 * log_{1.5}(t) en cm, t en meses
      const { tMonths = 4, targetCm = 200 } = spec;
      const hAt1 = 25;
      const hAtMonths = cleanNumber(25 + 12 * (Math.log(tMonths) / Math.log(1.5)), 2);
      const tTarget = cleanNumber(Math.pow(1.5, (targetCm - 25) / 12), 2);
      return { hAt1, hAtMonths, tTarget, unit: 'meses' };
    }
    case 'logistic_pop': {
      // P(t) = 75 / (1 + 1.5 * e^(-0.89*t))
      const { cap = 75, c = 1.5, k = 0.89, targetPct = 50 } = spec;
      const p0 = cleanNumber(cap / (1 + c), 2);
      const tTarget = cleanNumber(-Math.log((cap / targetPct - 1) / c) / k, 2);
      return { p0, tTarget, unit: 'años' };
    }
    case 'vaccine_decay': {
      // C(t) = 200 * e^(-0.3*t)
      const { C0 = 200, k = 0.3, hours = 5, targetMg = 50 } = spec;
      const remaining = cleanNumber(C0 * Math.exp(-k * hours), 2);
      const tTarget = cleanNumber(-Math.log(targetMg / C0) / k, 2);
      return { remaining, tTarget, unit: 'horas' };
    }
    case 'isotope_decay': {
      const { A0 = 120, k = 0.05, t = 10, targetAmount = 30 } = spec;
      const remaining = cleanNumber(A0 * Math.exp(-k * t), 2);
      const tTarget = cleanNumber(-Math.log(targetAmount / A0) / k, 2);
      return { remaining, tTarget, unit: 'horas' };
    }
    default:
      throw new Error(`Modelo logarítmico no soportado: ${kind}`);
  }
}

/**
 * 10. Motor de Diagnóstico Cognitivo `diagnoseLog` (10 códigos pedagógicos).
 */
export const LOG_DIAGNOSTICS = Object.freeze({
  non_positive_argument_accepted: {
    id: 'non_positive_argument_accepted',
    pose: 'panico',
    tag: '¡Alerta de Dominio!',
    message:
      '¡Frená el cálculo! En los números reales el argumento de todo logaritmo debe ser estrictamente positivo (x > 0). Como ninguna potencia positiva aʸ puede dar cero ni un número negativo, log_a(0) y log_a(−x) no existen en ℝ.',
  },
  invalid_log_base_accepted: {
    id: 'invalid_log_base_accepted',
    pose: 'panico',
    tag: 'Base Inválida en ℝ',
    message:
      '¡Pará un segundo en la aduana de bases! La base del logaritmo exige a > 0 y a ≠ 1. Si a = 1, la potencia 1ʸ = 1 nunca podría dar otro número ni definir una inversa única; y si a ≤ 0, la función exponencial asociada colapsa en los reales.',
  },
  confused_exp_log_conversion: {
    id: 'confused_exp_log_conversion',
    pose: 'sospecha',
    tag: 'Espejo Exponencial',
    message:
      'Mmm... invertiste los roles en la traducción entre potencia y logaritmo. Recordá la pregunta exacta de log_a(x) = y: "¿a qué exponente y tengo que elevar la base a para obtener x?", es decir, aʸ = x. El resultado del logaritmo es siempre el exponente, no la base ni el argumento.',
  },
  false_sum_identity_log_a_plus_b: {
    id: 'false_sum_identity_log_a_plus_b',
    pose: 'unamused',
    tag: 'Identidad Falsa',
    message:
      '¡Alto ahí! El logaritmo NO se distribuye sobre la suma ni sobre la resta: log_a(x + y) ≠ log_a(x) + log_a(y). Probá con a = 2, x = 4, y = 4: log₂(4 + 4) = log₂(8) = 3, mientras que log₂(4) + log₂(4) = 2 + 2 = 4. La suma de logaritmos proviene de multiplicar argumentos.',
  },
  false_power_of_whole_log: {
    id: 'false_power_of_whole_log',
    pose: 'colapso',
    tag: 'Paréntesis de Potencia',
    message:
      '¡Cuidado con dónde está el exponente! Solo podés bajar el exponente n cuando eleva al argumento interno: log_a(xⁿ) = n · log_a(x). Pero en (log_a x)² el cuadrado afecta a todo el logaritmo ya calculado: con a = 2 y x = 8, (log₂ 8)² = 3² = 9, que no tiene nada que ver con 2 · 3 = 6.',
  },
  false_quotient_or_product_of_logs: {
    id: 'false_quotient_or_product_of_logs',
    pose: 'lentes-brillo',
    tag: 'Trampa de Parcial',
    message:
      '¡Caíste en la trampa clásica de parcial! Multiplicar dos logaritmos log_a(x) · log_a(y) NO es log_a(x · y), ni dividirlos log_a(x) / log_a(y) equivale a log_a(x − y). Las propiedades suman o restan logaritmos sueltos cuando adentro hay producto o cociente.',
  },
  inverted_change_of_base: {
    id: 'inverted_change_of_base',
    pose: 'pensativa',
    tag: 'Cambio de Base',
    message:
      'Mirá el orden de la fracción en el cambio de base: lo pusiste al revés. En log_a(x) = log_b(x) / log_b(a), el argumento original x queda siempre arriba en el numerador y la base vieja a pasa abajo al denominador. Pensá que la base está "abajo" en la escritura y sigue abajo en la fracción.',
  },
  accepted_extraneous_root_in_log_eq: {
    id: 'accepted_extraneous_root_in_log_eq',
    pose: 'enojada',
    tag: 'Aduana de Argumentos',
    message:
      '¡Frená la mano antes de cerrar el conjunto solución! Resolviste la ecuación cuadrática auxiliar pero te olvidaste de verificar las candidatas en los argumentos originales. Cualquier raíz que anule o vuelva negativo un argumento dentro de un logaritmo queda descartada como solución extraña.',
  },
  closed_bracket_or_horizontal_asymptote_confusion: {
    id: 'closed_bracket_or_horizontal_asymptote_confusion',
    pose: 'lentes-brillo',
    tag: 'Frontera Asintótica',
    message:
      '¡Ojo con la frontera del dominio y el eje de la asíntota! El dominio de log_a(x − h) es el intervalo abierto (h; +∞), jamás con corchete cerrado [h; +∞) porque x = h anula el argumento. Además, la asíntota de la función logarítmica es vertical (recta x = h), reflejo de la horizontal de la exponencial.',
  },
  linear_ratio_confusion_in_log_scale: {
    id: 'linear_ratio_confusion_in_log_scale',
    pose: 'unamused',
    tag: 'Escala No Lineal',
    message:
      '¡No apliques regla de tres lineal sobre una escala logarítmica! En Richter o decibeles, duplicar el grado M de 4,1 a 8,2 no duplica la potencia sísmica: aumenta la potencia por un factor multiplicativo de 10^(8,2 − 4,1) = 10^(4,1) ≈ 12.589 veces.',
  },
});

function buildDiagResult(id) {
  const d = LOG_DIAGNOSTICS[id];
  return d ? { ...d } : null;
}

function matchesExpected(rawInput, norm, ctx) {
  if (ctx.expected === undefined && ctx.solutionSet === undefined) return false;
  const numVal = Number(norm.replace(',', '.'));
  const isNum = Number.isFinite(numVal) && /^-?\d+(?:\.\d+)?$/.test(norm.replace(/\s+/g, ''));

  if (typeof ctx.expected === 'number' && isNum && approxEq(numVal, ctx.expected, 1e-4)) {
    return true;
  }
  if (Array.isArray(ctx.expected) && Array.isArray(rawInput)) {
    if (
      ctx.expected.length === rawInput.length &&
      ctx.expected.every((v, idx) => approxEq(Number(String(rawInput[idx]).replace(',', '.')), Number(v), 1e-4))
    ) {
      return true;
    }
  }
  if (typeof ctx.expected === 'string') {
    const expNorm = normalizeLogString(ctx.expected).replace(/\s+/g, '');
    if (norm.replace(/\s+/g, '') === expNorm) return true;
    try {
      const ivA = parseIntervalExactas(String(rawInput));
      const ivB = parseIntervalExactas(ctx.expected);
      const endpointMatch = (a, b) =>
        a === b || (Number.isNaN(a) && Number.isNaN(b)) || approxEq(a, b, 1e-4);
      if (
        ivA &&
        ivB &&
        ivA.isEmpty === ivB.isEmpty &&
        ivA.isAllReal === ivB.isAllReal &&
        ivA.loOpen === ivB.loOpen &&
        ivA.hiOpen === ivB.hiOpen &&
        endpointMatch(ivA.lo, ivB.lo) &&
        endpointMatch(ivA.hi, ivB.hi)
      ) {
        if (ivA.points && ivB.points) {
          const sA = [...ivA.points].sort((a, b) => a - b);
          const sB = [...ivB.points].sort((a, b) => a - b);
          if (sA.length === sB.length && sA.every((v, i) => approxEq(v, sB[i], 1e-4))) return true;
        } else if (!ivA.points && !ivB.points) {
          return true;
        }
      }
    } catch {}
    try {
      if (equivalentLog(String(rawInput), ctx.expected)) return true;
    } catch {}
  }
  if (typeof ctx.solutionSet === 'string') {
    try {
      const ivA = parseIntervalExactas(String(rawInput));
      const ivB = parseIntervalExactas(ctx.solutionSet);
      if (ivA.points && ivB.points) {
        const sA = [...ivA.points].sort((a, b) => a - b);
        const sB = [...ivB.points].sort((a, b) => a - b);
        if (sA.length === sB.length && sA.every((v, i) => approxEq(v, sB[i], 1e-4))) return true;
      }
    } catch {}
  }
  return false;
}

/**
 * Clasificador cognitivo puro para entradas erróneas en logaritmos.
 * Devuelve null si la respuesta es correcta o no coincide con una trampa conocida.
 */
export function diagnoseLog(userInput, context = {}) {
  const ctx = context || {};

  // Capa 0: override explícito
  if (ctx.diagnosticId && LOG_DIAGNOSTICS[ctx.diagnosticId]) {
    return buildDiagResult(ctx.diagnosticId);
  }

  const raw = Array.isArray(userInput) ? userInput.join('; ') : String(userInput ?? '').trim();
  if (!raw) return null;

  const norm = normalizeLogString(raw).toLowerCase();
  const compact = norm.replace(/\s+/g, '');

  // Capa 1: guarda estricta para no dar falsos positivos sobre respuestas correctas
  if (matchesExpected(userInput, norm, ctx)) {
    return null;
  }

  const numVal = Number(compact);
  const isNum = Number.isFinite(numVal) && /^-?\d+(?:\.\d+)?$/.test(compact);

  // 1. non_positive_argument_accepted
  if (ctx.target === 'argument' || ctx.checkExistence === 'argument') {
    if ((isNum && numVal <= 0) || /^log.*\(\s*(?:0|-\d+)/.test(compact) || /existe|siempre|vale\s*0/i.test(norm)) {
      if (ctx.expectDoesNotExist || ctx.expected === 'no_existe') {
        return buildDiagResult('non_positive_argument_accepted');
      }
    }
    if (isNum && numVal <= 0 && ctx.expectPositiveArg) {
      return buildDiagResult('non_positive_argument_accepted');
    }
  }
  if (/\b(?:log|ln)(?:_\([^)]+\))?\(\s*(?:0|-\d+(?:\.\d+)?)\s*\)/.test(compact) && !ctx.allowArgZeroText) {
    return buildDiagResult('non_positive_argument_accepted');
  }
  if ((ctx.arg !== undefined && Number(ctx.arg) <= 0) && isNum) {
    return buildDiagResult('non_positive_argument_accepted');
  }

  // 2. invalid_log_base_accepted
  if (ctx.target === 'base' || ctx.checkExistence === 'base') {
    const parsed = (() => {
      try { return parseNumberOrFraction(compact); } catch { return NaN; }
    })();
    if (Number.isFinite(parsed) && (parsed <= 0 || approxEq(parsed, 1))) {
      return buildDiagResult('invalid_log_base_accepted');
    }
  }
  if (/log_\(\s*(?:0|1|-\d+(?:\.\d+)?)\s*\)/.test(compact)) {
    return buildDiagResult('invalid_log_base_accepted');
  }

  // 3. confused_exp_log_conversion
  if (ctx.problemType === 'conversion' || ctx.target === 'conversion') {
    // Ej. log_7(4) = x en vez de 7^4 = x, o invirtió base y exponente (x^base = arg)
    if (ctx.swappedExpected !== undefined && isNum && approxEq(numVal, Number(ctx.swappedExpected), 1e-4)) {
      return buildDiagResult('confused_exp_log_conversion');
    }
    if (ctx.base !== undefined && ctx.exponent !== undefined && isNum) {
      const swappedPow = Math.pow(Number(ctx.exponent), Number(ctx.base));
      if (approxEq(numVal, swappedPow, 1e-4) && !approxEq(numVal, Number(ctx.expected), 1e-4)) {
        return buildDiagResult('confused_exp_log_conversion');
      }
    }
    if (ctx.wrongConversionPattern && ctx.wrongConversionPattern.test(compact)) {
      return buildDiagResult('confused_exp_log_conversion');
    }
  }

  // 4. false_sum_identity_log_a_plus_b
  if (
    /log(?:_\([^)]+\))?\([^)]+\+[^)]+\)\s*=\s*log/.test(compact) ||
    /ln\([^)]+\+[^)]+\)\s*=\s*ln/.test(compact) ||
    (ctx.problemType === 'property_false_sum' && (/verdadero|si|igual|se\s*distribuye/i.test(norm) || (isNum && ctx.falseSumVal !== undefined && approxEq(numVal, ctx.falseSumVal, 1e-4))))
  ) {
    return buildDiagResult('false_sum_identity_log_a_plus_b');
  }

  // 5. false_power_of_whole_log
  if (
    /\(\s*(?:log|ln)(?:_\([^)]+\))?\([^)]+\)\s*\)\^2\s*=\s*2\*/.test(compact) ||
    (ctx.problemType === 'property_false_power' && isNum && ctx.falsePowerVal !== undefined && approxEq(numVal, ctx.falsePowerVal, 1e-4)) ||
    (ctx.falsePowerTrap && isNum && approxEq(numVal, Number(ctx.falsePowerTrap), 1e-4))
  ) {
    return buildDiagResult('false_power_of_whole_log');
  }

  // 6. false_quotient_or_product_of_logs
  if (
    (ctx.problemType === 'property_false_prod_quot' && (/verdadero|si|igual/i.test(norm) || (isNum && ctx.falseTrapVal !== undefined && approxEq(numVal, ctx.falseTrapVal, 1e-4)))) ||
    /\blog(?:_\([^)]+\))?\([^)]+\)\s*\*\s*log(?:_\([^)]+\))?\([^)]+\)\s*=\s*log/.test(compact) ||
    /\blog(?:_\([^)]+\))?\([^)]+\)\s*\/\s*log(?:_\([^)]+\))?\([^)]+\)\s*=\s*log/.test(compact) ||
    (ctx.falseProdQuotVal !== undefined && isNum && approxEq(numVal, Number(ctx.falseProdQuotVal), 1e-4))
  ) {
    return buildDiagResult('false_quotient_or_product_of_logs');
  }

  // 7. inverted_change_of_base
  if (ctx.problemType === 'change_of_base' || ctx.invertedExpected !== undefined) {
    if (isNum && ctx.invertedExpected !== undefined && approxEq(numVal, Number(ctx.invertedExpected), 1e-4)) {
      return buildDiagResult('inverted_change_of_base');
    }
    if (ctx.base !== undefined && ctx.arg !== undefined && compact.includes('/')) {
      try {
        const res = evalLogSafe(parseLogTree(raw));
        const invVal = Math.log(Number(ctx.base)) / Math.log(Number(ctx.arg));
        if (!res.domainError && approxEq(res.value, invVal, 1e-5)) {
          return buildDiagResult('inverted_change_of_base');
        }
      } catch {}
    }
  }

  // 8. accepted_extraneous_root_in_log_eq
  if (Array.isArray(ctx.rejectedRoots) && ctx.rejectedRoots.length > 0) {
    const rejVals = ctx.rejectedRoots
      .map((r) => (typeof r === 'object' && r !== null ? Number(r.x ?? r.u) : Number(r)))
      .filter(Number.isFinite);
    const inputNums = (compact.match(/-?\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?/g) || [])
      .map((tok) => {
        try { return parseNumberOrFraction(tok); } catch { return NaN; }
      })
      .filter(Number.isFinite);

    if (rejVals.some((rv) => inputNums.some((iv) => approxEq(iv, rv, 1e-4)))) {
      return buildDiagResult('accepted_extraneous_root_in_log_eq');
    }
  }

  // 9. closed_bracket_or_horizontal_asymptote_confusion
  if (ctx.type === 'domain' || ctx.target === 'domain' || ctx.target === 'asymptote' || ctx.asymptoteX !== undefined) {
    if (ctx.target === 'asymptote' && /^y\s*=/.test(compact)) {
      return buildDiagResult('closed_bracket_or_horizontal_asymptote_confusion');
    }
    if (compact.includes('[') || compact.includes(']')) {
      const h = ctx.asymptoteX ?? 0;
      const hStr = String(h).replace('.', ',');
      const hDot = String(h);
      if (
        compact.includes(`[${hDot}`) ||
        compact.includes(`[${hStr}`) ||
        compact.includes(`${hDot}]`) ||
        compact.includes(`${hStr}]`) ||
        ctx.type === 'domain'
      ) {
        return buildDiagResult('closed_bracket_or_horizontal_asymptote_confusion');
      }
    }
  }

  // 10. linear_ratio_confusion_in_log_scale
  if (ctx.problemType === 'richter_ratio' || ctx.linearTrapVal !== undefined) {
    if (isNum && ctx.linearTrapVal !== undefined && approxEq(numVal, Number(ctx.linearTrapVal), 1e-4)) {
      return buildDiagResult('linear_ratio_confusion_in_log_scale');
    }
    if (ctx.problemType === 'richter_ratio' && isNum && approxEq(numVal, 2, 1e-4)) {
      return buildDiagResult('linear_ratio_confusion_in_log_scale');
    }
  }

  return null;
}
