/**
 * @file js/core/learning/transfer-classifiers/radical.js
 * Classifier & challenge generator for Radical / Irrational models (Irracionales, Unidad 07 / 01).
 * ZERO imports from js/modules/*. Zero DOM. Zero eval. Zero emojis.
 */

import { fmt } from '../../math-format.js';
import { astContainsVar, parseMathAst } from './shared-ast.js';

function unwrapParen(n) {
  let cur = n;
  while (cur && cur.type === 'paren') cur = cur.expr;
  return cur;
}

function hasRadicalOnVar(node) {
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'call' && (node.name === 'sqrt' || node.name === 'raiz' || node.name === 'root')) {
    return node.args.some((arg) => astContainsVar(arg));
  }
  if (node.type === 'pow' && astContainsVar(node.base)) {
    const exp = unwrapParen(node.exponent);
    // Detect fractional exponent like (x + 1)^(1/2) or (x - 3)^0.5
    if (exp?.type === 'binary' && exp.op === '/') {
      const den = unwrapParen(exp.right);
      if (den?.type === 'number' && Math.abs(den.value) > 1) return true;
    }
    if (exp?.type === 'number' && !Number.isInteger(exp.value)) {
      return true;
    }
  }
  if (node.type === 'paren') return hasRadicalOnVar(node.expr);
  if (node.type === 'neg') return hasRadicalOnVar(node.value);
  if (node.type === 'binary') {
    return hasRadicalOnVar(node.left) || hasRadicalOnVar(node.right);
  }
  if (node.type === 'pow') {
    return hasRadicalOnVar(node.base) || hasRadicalOnVar(node.exponent);
  }
  if (node.type === 'call') {
    return node.args.some((arg) => hasRadicalOnVar(arg));
  }
  return false;
}

export const radicalClassifier = Object.freeze({
  id: 'radical',
  label: 'Radical o Irracional',
  aliases: ['radical', 'irracional', 'irrational', 'raiz'],
  priority: Object.freeze({ table: 50, geometry: 85, analytical: 80 }),
  competencyIds: Object.freeze([
    'irrational.domain_and_radical_equations',
    'irrational.graphs_analysis_and_piecewise',
    'powers.real_domain_restrictions_and_abs_root',
  ]),

  matchTable(points, tolerance = 1e-5) {
    if (!Array.isArray(points) || points.length < 4) return null;
    const deltaX = points[1].x - points[0].x;
    if (Math.abs(deltaX) < tolerance) return null;

    const ys = points.map((p) => p.y);
    // Must be monotonic and keep constant sign (all >= 0 or all <= 0)
    const allNonNeg = ys.every((y) => y >= -tolerance);
    const allNonPos = ys.every((y) => y <= tolerance);
    if (!allNonNeg && !allNonPos) return null;

    const dy = [];
    for (let i = 0; i < ys.length - 1; i++) {
      dy.push(ys[i + 1] - ys[i]);
    }
    const strictlyInc = dy.every((d) => d > tolerance);
    const strictlyDec = dy.every((d) => d < -tolerance);
    if (!strictlyInc && !strictlyDec) return null;

    // Exclude linear (constant dy)
    if (dy.every((d) => Math.abs(d - dy[0]) < tolerance)) return null;

    // Check constant Δ(y^2) for f(x) = k * sqrt(x - h)
    const ySq = ys.map((y) => y * y);
    const dYSq = [];
    for (let i = 0; i < ySq.length - 1; i++) {
      dYSq.push(ySq[i + 1] - ySq[i]);
    }

    if (Math.abs(dYSq[0]) > tolerance && dYSq.every((d) => Math.abs(d - dYSq[0]) < tolerance * 10)) {
      const kSq = dYSq[0] / deltaX;
      return {
        matched: true,
        model: 'radical',
        invariant: 'radical_power_linear',
        deltaX,
        deltaYSquared: dYSq[0],
        kSquared: kSq,
        explanation: `Los cuadrados y² crecen de forma lineal con Δ(y²) = ${fmt(dYSq[0])} constante mientras y conserva el signo: modelo Radical k·√(x − h).`,
      };
    }

    return null;
  },

  matchGeometry(features = {}) {
    if (
      features.hasHalfLineDomain ||
      features.hasEndpointVertex ||
      (features.isMonotonic &&
        features.hasDomainRestriction &&
        !features.hasVerticalAsymptote &&
        !features.hasHorizontalAsymptote &&
        !features.isPeriodic)
    ) {
      return {
        matched: true,
        model: 'radical',
        signatureFeature: 'semirrecta_con_extremo_cerrado',
        explanation:
          'Un dominio restringido a una semirrecta con punto extremo (vértice inicial) y sin asíntotas corresponde a una función radical de índice par.',
      };
    }
    return null;
  },

  matchAnalytical(exprStr) {
    let ast;
    try {
      ast = parseMathAst(exprStr);
    } catch {
      return null;
    }
    if (!hasRadicalOnVar(ast)) return null;

    return {
      matched: true,
      model: 'radical',
      signature: 'k · ⁿ√(g(x)) + c',
      explanation:
        'La variable x figura dentro de un radicando o afectada por exponente fraccionario: modelo radical o irracional.',
    };
  },

  generateChallenges(rng, seed, idx) {
    const variants = [];

    // Variant 1: Domain of shifted even-index radical k * sqrt(x - h) + c
    const h = [2, 3, 4, 5, -2, -3][Math.floor(rng() * 6)];
    const c = [1, 2, -1, -3][Math.floor(rng() * 4)];
    const radicandStr = h >= 0 ? `x − ${h}` : `x + ${Math.abs(h)}`;
    const expectedDom = `[${h}; +inf)`;

    variants.push({
      id: `transfer-rad-dom-${seed}-${idx}`,
      type: 'radical_domain_and_symmetry',
      family: 'radical_domain_and_symmetry',
      modelFamily: 'radical',
      moduleId: 'general',
      inputKind: 'interval',
      competencyIds: [
        'irrational.domain_and_radical_equations',
        'irrational.graphs_analysis_and_piecewise',
      ],
      prompt: `Dada la función irracional f(x) = 2·√(${radicandStr}) ${c >= 0 ? '+ ' + c : '− ' + Math.abs(c)}, ¿cuál es su dominio real Dom(f) en notación Exactas?`,
      expected: expectedDom,
      diagnostics: ['negative_radicand_in_even_root', 'open_bracket_on_radical_endpoint'],
      hints: [
        'En ℝ, una raíz de índice par requiere que el radicando sea mayor o igual que cero.',
        `Planteá la inecuación ${radicandStr} ≥ 0; recordá si el extremo x = ${h} pertenece al dominio (√0 = 0 existe).`,
        'Escribí la semirrecta resultante con corchete cerrado en el punto inicial, punto y coma y paréntesis abierto en +inf.',
      ],
      explanation: `El radicando ${radicandStr} ≥ 0 exige x ≥ ${h}. Como √0 = 0 ∈ ℝ, el extremo ${h} está incluido: Dom(f) = [${h}; +∞).`,
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 2,
    });

    // Variant 2: Algebraic identity sqrt(x^2) = |x| vs x (or extraneous root awareness)
    const a = [2, 3, 4, 5][Math.floor(rng() * 4)];
    variants.push({
      id: `transfer-rad-abs-${seed}-${idx}`,
      type: 'radical_domain_and_symmetry',
      family: 'radical_domain_and_symmetry',
      modelFamily: 'radical',
      moduleId: 'general',
      inputKind: 'expression',
      competencyIds: [
        'powers.real_domain_restrictions_and_abs_root',
        'irrational.graphs_analysis_and_piecewise',
      ],
      prompt: `Al simplificar la función f(x) = √((x − ${a})²) en todo ℝ, ¿a qué expresión con valor absoluto equivale exactamente? (usá abs(x - ${a}))`,
      expected: `abs(x - ${a})`,
      diagnostics: ['canceled_square_with_sqrt_without_abs'],
      hints: [
        `Probá evaluar la expresión en x = 0: √((−${a})²) = √(${a * a}) = +${a}, no −${a}.`,
        'La raíz cuadrada principal siempre devuelve un resultado no negativo; cancelar potencia par y raíz par exige barras de módulo.',
        'Escribí la función valor absoluto aplicada a (x − ' + a + ').',
      ],
      explanation: `Para todo u ∈ ℝ se cumple √(u²) = |u|. Por lo tanto, √((x − ${a})²) = |x − ${a}| en todo ℝ (no x − ${a}, que sería negativo para x < ${a}).`,
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 3,
    });

    // Variant 3: Table discrimination for radical vs quadratic/linear
    const k = [2, 3][Math.floor(rng() * 2)];
    const pts = [0, 1, 2, 3].map((t) => ({ x: t * t, y: k * t }));
    // Use uniform step x = 0, 1, 2, 3 -> y = k*sqrt(x)
    const uniformPts = [0, 1, 2, 3].map((x) => ({
      x,
      y: Number((k * Math.sqrt(x)).toFixed(6)),
    }));
    const tableStr = uniformPts
      .map((p) => `(${p.x}; ${Number.isInteger(p.y) ? p.y : fmt(p.y, 4)})`)
      .join(', ');

    variants.push({
      id: `transfer-rad-tbl-${seed}-${idx}`,
      type: 'radical_domain_and_symmetry',
      family: 'radical_domain_and_symmetry',
      modelFamily: 'radical',
      moduleId: 'general',
      inputKind: 'text',
      competencyIds: [
        'irrational.graphs_analysis_and_piecewise',
        'irrational.domain_and_radical_equations',
      ],
      prompt: `Observá la tabla (${tableStr}) donde los valores de y² crecen de forma constante (${uniformPts.map((p) => Math.round(p.y * p.y)).join(', ')}). ¿A qué familia de modelos pertenece: «lineal», «cuadratica», «radical» o «exponencial»?`,
      expected: 'radical',
      diagnostics: ['additive_vs_multiplicative_confusion'],
      hints: [
        `Elevá al cuadrado cada y: obtendrás 0, ${k * k}, ${2 * k * k}, ${3 * k * k}, con saltos Δ(y²) constantes.`,
        `Si y² es proporcional a x y conserva signo ≥ 0, entonces y es proporcional a √x.`,
        'Nombrá la familia funcional definida por raíces sobre la variable.',
      ],
      explanation: `Como y ≥ 0 y y² = ${k * k}x tiene primera diferencia constante Δ(y²) = ${k * k}, la relación corresponde al modelo radical f(x) = ${k}√x.`,
      representation: 'tabular',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 3,
    });

    return variants;
  },
});
