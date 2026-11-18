/**
 * @file js/modules/racionales-irracionales/retos.js
 * Deterministic Mulberry32 PRNG Trainer (6 families covering 100% of the 5 competencies)
 * + 5 Classical Exam Traps for Unit 07 (Funciones Racionales e Irracionales).
 */

import { h, clear, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { react as vnReact } from '../../core/vn.js';
import {
  polyFromDescending,
  polyMul,
  polyScale,
  formatPoly,
  rat,
  ratToString,
  analyzeRationalFunction,
  solveRationalEquation,
  solveRationalInequality,
  analyzeIrrationalFunction,
  solveIrrationalEquation,
  validateRiAttempt,
  MINUS_CHAR,
} from './logic.js';
import { DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import {
  MODULE_ID,
  getProgressStore,
  recordRiAttempt,
} from './learning-adapter.js';
import { notifyCompetencyDashboardUpdate } from './components.js';
import { getCompetencyById } from './competencies-map.js';
import { selectAdaptiveExercise } from '../../core/learning/exercise-selector.js';
import { fmt } from '../../core/math-format.js';

export const SEED_STORAGE_KEY = 'racionales_irracionales:seed';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randChoice(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export const CHALLENGE_TYPES = [
  {
    id: 'rational_simplify_and_lcm',
    label: 'Simplificación racional con dominio y M(x)',
    competencyId: 'rational.simplification_lcm_and_operations',
  },
  {
    id: 'rational_equations_inequalities',
    label: 'Ecuaciones e inecuaciones racionales con exclusión de polos',
    competencyId: 'rational.equations_and_inequalities',
  },
  {
    id: 'rational_holes_vs_asymptotes',
    label: 'Puntos agujero vs. asíntotas verticales por multiplicidad',
    competencyId: 'rational.domain_holes_and_asymptotes',
  },
  {
    id: 'rational_full_study_and_ha',
    label: 'Asíntotas horizontales (orden de términos y grados)',
    competencyId: 'rational.domain_holes_and_asymptotes',
  },
  {
    id: 'irrational_domain_and_equations',
    label: 'Dominio de radicales y ecuaciones con raíces extraviadas',
    competencyId: 'irrational.domain_and_radical_equations',
  },
  {
    id: 'irrational_graphs_and_piecewise',
    label: 'Imagen, ceros de radicales y funciones por tramos',
    competencyId: 'irrational.graphs_analysis_and_piecewise',
  },
];

export function generateRiChallenge(seed, forcedType = 'all', problemIndex = 0) {
  const isAll = !forcedType || forcedType === 'all' || forcedType === 'aleatorio';
  let typeObj;
  let rng;

  if (isAll) {
    const baseRng = mulberry32(seed >>> 0);
    const baseIdx = Math.floor(baseRng() * CHALLENGE_TYPES.length);
    typeObj = CHALLENGE_TYPES[(baseIdx + problemIndex) % CHALLENGE_TYPES.length];
    rng = mulberry32(((seed >>> 0) + problemIndex * 7919 + 1013) >>> 0);
  } else {
    typeObj = CHALLENGE_TYPES.find((t) => t.id === forcedType) || CHALLENGE_TYPES[0];
    rng =
      problemIndex === 0
        ? mulberry32(seed >>> 0)
        : mulberry32(((seed >>> 0) + problemIndex * 7919 + 1013) >>> 0);
  }

  const type = typeObj.id;

  // 1. Simplification with preserved domain / LCM
  if (type === 'rational_simplify_and_lcm') {
    const r = randChoice(rng, [1, 2, 3, 4]);
    const s = randChoice(rng, [2, 3, 5, 6].filter((v) => v !== r && v !== -r));
    const a = randChoice(rng, [2, 3]);
    const P = polyScale(polyFromDescending([1, 0, -r * r]), rat(a)); // a(x^2 - r^2)
    const Q = polyMul(polyFromDescending([1, -r]), polyFromDescending([1, s])); // (x - r)(x + s)
    const Psimp = polyScale(polyFromDescending([1, r]), rat(a));
    const Qsimp = polyFromDescending([1, s]);
    const expectedExpr = `(${formatPoly(Psimp, { unicodeMinus: false })})/(${formatPoly(Qsimp, { unicodeMinus: false })})`;

    const askDomain = rng() < 0.45;
    if (askDomain) {
      const rootsSorted = [-s, r].sort((u, v) => u - v);
      const expectedDom = `ℝ − {${rootsSorted.map((v) => fmt(v)).join('; ')}}`;
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 1 · Simplificación y Dominio',
        representation: 'symbolic',
        stage: 'retrieval',
        transferDistance: 'near',
        prompt: `Al simplificar f(x) = (${formatPoly(P)}) / (${formatPoly(Q)}), ¿cuál sigue siendo su dominio máximo en ℝ?`,
        inputKind: 'set_or_interval',
        expected: expectedDom,
        placeholder: `Ej: R - {${rootsSorted[0]}; ${rootsSorted[1]}}`,
        diagContext: { target: 'domain_after_cancel', cancelledRoots: [r] },
        hints: [
          'Pista 1 (Orientación): Antes de cancelar ningún factor, buscá todas las raíces del denominador original Q(x).',
          `Pista 2 (Paso intermedio): Al factorizar, el denominador vale (x − ${r})(x + ${s}).`,
          `Pista 3 (Remate): Anotá ℝ menos las dos raíces que anulan el denominador original (incluida x = ${r} aunque se cancele).`,
        ],
        explanation: `Aunque (x − ${r}) se cancele al simplificar, x = ${r} y x = −${s} anulan el denominador original: Dom(f) = ${expectedDom}.`,
      };
    }

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 1 · Simplificación Racional',
      representation: 'symbolic',
      stage: 'guided_practice',
      transferDistance: 'near',
      prompt: `Simplificá a su mínima expresión algebraica: (${formatPoly(P)}) / (${formatPoly(Q)})`,
      inputKind: 'rational_expr',
      requireSameDomain: false,
      requireSimplified: true,
      expected: expectedExpr,
      placeholder: 'Ej: 2(x + 1)/(x + 3)',
      diagContext: { target: 'rational_simplify' },
      hints: [
        'Pista 1 (Orientación): Factorizá arriba por factor común y diferencia de cuadrados; abajo factorizá el producto de dos lineales.',
        `Pista 2 (Paso intermedio): Numerador = ${a}(x − ${r})(x + ${r}); Denominador = (x − ${r})(x + ${s}).`,
        `Pista 3 (Remate): Cancelá el factor común (x − ${r}) multiplicando ambos miembros y conservá el coeficiente ${a} adelante.`,
      ],
      explanation: `Factorizando ${a}(x − ${r})(x + ${r}) / ((x − ${r})(x + ${s})) y simplificando (x − ${r}) para x ≠ ${r} resulta ${expectedExpr}.`,
    };
  }

  // 2. Rational equations & inequalities
  if (type === 'rational_equations_inequalities') {
    const useInequality = rng() < 0.45;
    if (useInequality) {
      const b = randChoice(rng, [2, 3, 4, 6]);
      const k = randChoice(rng, [3, 5, 7, 8]);
      // k / (x + b) <= 1 => (k - x - b) / (x + b) <= 0
      const P = polyFromDescending([k]);
      const Q = polyFromDescending([1, b]);
      const sol = solveRationalInequality(P, Q, '<=', 1);
      const pole = -b;
      const numRoot = k - b;
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 2 · Inecuación Racional',
        representation: 'symbolic',
        stage: 'guided_practice',
        transferDistance: 'near',
        prompt: `Resolvé la inecuación racional: ${k} / (x + ${b}) ≤ 1`,
        inputKind: 'set_or_interval',
        expected: sol.formatted,
        placeholder: 'Ej: (-inf; -6) U [1; +inf)',
        diagContext: { target: 'rational_inequality', excludedRoots: [pole] },
        hints: [
          'Pista 1 (Orientación): No pases (x + b) multiplicando. Pasá el 1 restando y juntá en una única fracción comparada con 0.',
          `Pista 2 (Paso intermedio): Queda (${k - b} − x) / (x + ${b}) ≤ 0. Los puntos críticos son el polo x = ${pole} y la raíz del numerador x = ${numRoot}.`,
          `Pista 3 (Remate): Probá signos en cada uno de los tres intervalos; recordá que el polo x = ${pole} siempre lleva paréntesis abierto y x = ${numRoot} corchete cerrado.`,
        ],
        explanation: `Al llevar a (${k - b} − x)/(x + ${b}) ≤ 0 y armar el cuadro de signos (con polo abierto en ${pole} y raíz cerrada en ${numRoot}), el conjunto solución es ${sol.formatted}.`,
      };
    }

    // Rational equation with extraneous vs valid root
    const r = randChoice(rng, [1, 2, 3]);
    const validMode = rng() < 0.5;
    if (!validMode) {
      // r / (x - r) = x / (x - r) => x = r is excluded => S = empty!
      const L = { P: polyFromDescending([r]), Q: polyFromDescending([1, -r]) };
      const R = { P: polyFromDescending([1, 0]), Q: polyFromDescending([1, -r]) };
      const eqSol = solveRationalEquation(L, R);
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 2 · Ecuación con Raíz Prohibida',
        representation: 'symbolic',
        stage: 'retrieval',
        transferDistance: 'near',
        prompt: `Resolvé en ℝ la ecuación: ${r} / (x − ${r}) = x / (x − ${r})`,
        inputKind: 'solution_set',
        expected: eqSol.solutionFormatted,
        placeholder: 'Ej: vacio o { ... }',
        diagContext: { target: 'rational_equation', excludedRoots: [r] },
        hints: [
          `Pista 1 (Orientación): Declarar el dominio primero es obligatorio: x ≠ ${r}.`,
          `Pista 2 (Paso intermedio): Al multiplicar por M(x) = x − ${r}, el numerador da x = ${r}.`,
          `Pista 3 (Remate): Verificá si esa raíz candidata pertenece al dominio declarado; si anula el denominador original, el conjunto solución queda sin elementos.`,
        ],
        explanation: `Aunque igualar numeradores entrega x = ${r}, ese valor anula (x − ${r}) y divide por cero; por lo tanto S = ∅.`,
      };
    }

    // Valid solution: (x + a)/(x - r) = 2 => x + a = 2x - 2r => x = a + 2r (ensure != r)
    const a = randChoice(rng, [1, 3, 4]);
    const L = { P: polyFromDescending([1, a]), Q: polyFromDescending([1, -r]) };
    const R = { P: polyFromDescending([2]), Q: polyFromDescending([1]) };
    const eqSol = solveRationalEquation(L, R);
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 2 · Ecuación Racional',
      representation: 'symbolic',
      stage: 'guided_practice',
      transferDistance: 'near',
      prompt: `Resolvé en ℝ la ecuación: (x + ${a}) / (x − ${r}) = 2`,
      inputKind: 'solution_set',
      expected: eqSol.solutionFormatted,
      placeholder: 'Ej: {5}',
      diagContext: { target: 'rational_equation', excludedRoots: [r] },
      hints: [
        `Pista 1 (Orientación): Anotá la restricción del dominio: x ≠ ${r}.`,
        `Pista 2 (Paso intermedio): Pasando a denominador común resulta x + ${a} = 2(x − ${r}).`,
        `Pista 3 (Remate): Despejá x y confirmá que no coincide con el valor excluido ${r}.`,
      ],
      explanation: `Para x ≠ ${r}, x + ${a} = 2x − ${2 * r} da x = ${a + 2 * r}, que respeta el dominio: S = ${eqSol.solutionFormatted}.`,
    };
  }

  // 3. Holes vs Vertical Asymptotes (multiplicity comparison)
  if (type === 'rational_holes_vs_asymptotes') {
    const a = randChoice(rng, [-2, -1, 1, 2, 3]);
    const b = randChoice(rng, [-3, 1, 2, 4].filter((v) => v !== a));
    const k = randChoice(rng, [1, 2, 3]);
    const mP = randChoice(rng, [1, 2]);
    const mQ = mP === 1 ? randChoice(rng, [1, 2]) : randChoice(rng, [1, 2]);

    const linA = polyFromDescending([1, -a]);
    let P = polyScale(polyFromDescending([1, -b]), rat(k));
    for (let i = 0; i < mP; i++) P = polyMul(P, linA);
    let Q = polyFromDescending([1]);
    for (let i = 0; i < mQ; i++) Q = polyMul(Q, linA);

    const analysis = analyzeRationalFunction(P, Q);
    const hasHole = analysis.holes.length > 0;

    if (hasHole) {
      const hole = analysis.holes[0];
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 3 · Coordenadas de Agujero',
        representation: 'symbolic',
        stage: 'guided_practice',
        transferDistance: 'near',
        prompt: `La función f(x) = (${formatPoly(P)}) / (${formatPoly(Q)}) presenta una discontinuidad evitable en x = ${a}. Indicá el par ordenado (x; y) del agujero:`,
        inputKind: 'ordered_pair',
        expected: hole.formatted,
        placeholder: `Ej: (${a}; y)`,
        diagContext: { target: 'hole_coords' },
        hints: [
          `Pista 1 (Orientación): Como mult_P(${a}) = ${mP} ≥ mult_Q(${a}) = ${mQ}, se cancela (x ${a >= 0 ? `− ${a}` : `+ ${Math.abs(a)}`}) abajo.`,
          `Pista 2 (Paso intermedio): Simplificá el factor común y evaluá la expresión simplificada en x = ${a} (nunca hagas 0/0).`,
          `Pista 3 (Remate): Escribí el par ordenado usando punto y coma (;): (${a}; ordenada calculada).`,
        ],
        explanation: `Al simplificar (x ${a >= 0 ? `− ${a}` : `+ ${Math.abs(a)}`}) queda ${analysis.simplified.formattedSimplified}; evaluada en x = ${a} da el punto agujero ${hole.formatted}.`,
      };
    }

    // mP < mQ -> vertical asymptote
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 3 · Multiplicidades y Asíntota Vertical',
      representation: 'symbolic',
      stage: 'retrieval',
      transferDistance: 'near',
      prompt: `En f(x) = (${formatPoly(P)}) / (${formatPoly(Q)}), ¿cuál es la ecuación de su asíntota vertical?`,
      inputKind: 'asymptote',
      expected: `x = ${a}`,
      placeholder: `Ej: x = ${a}`,
      diagContext: { target: 'vertical_asymptote' },
      hints: [
        `Pista 1 (Orientación): Compará cuántas veces aparece el factor (x ${a >= 0 ? `− ${a}` : `+ ${Math.abs(a)}`}) arriba y abajo.`,
        `Pista 2 (Paso intermedio): Arriba aparece con multiplicidad ${mP} y abajo con multiplicidad ${mQ}.`,
        'Pista 3 (Remate): Como sobra un factor en el denominador después de simplificar, escribí la recta vertical como "x = valor".',
      ],
      explanation: `Como mult_P(${a}) = ${mP} < mult_Q(${a}) = ${mQ}, sobrevive (x ${a >= 0 ? `− ${a}` : `+ ${Math.abs(a)}`}) en el denominador y genera la A.V. x = ${a}.`,
    };
  }

  // 4. Horizontal asymptotes by degree (and unordered denominator trap)
  if (type === 'rational_full_study_and_ha') {
    const mode = randChoice(rng, ['equal_unordered', 'less_deg', 'greater_deg']);
    if (mode === 'less_deg') {
      const a = randChoice(rng, [2, 3, 5]);
      const c = randChoice(rng, [1, 4, 9]);
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 4 · Asíntota Horizontal (gr P < gr Q)',
        representation: 'symbolic',
        stage: 'retrieval',
        transferDistance: 'near',
        prompt: `Determiná la ecuación de la asíntota horizontal de f(x) = (${a}x + 1) / (x² + ${c}):`,
        inputKind: 'asymptote',
        expected: 'y = 0',
        placeholder: 'Ej: y = 3 o sin A.H.',
        diagContext: { target: 'horizontal_asymptote', trapValues: [a] },
        hints: [
          'Pista 1 (Orientación): Compará el grado del numerador con el grado del denominador.',
          'Pista 2 (Paso intermedio): El numerador tiene grado 1 y el denominador tiene grado 2.',
          'Pista 3 (Remate): Cuando gr(P) < gr(Q), la función tiende siempre a la recta horizontal de altura cero.',
        ],
        explanation: 'Como gr(P) = 1 < gr(Q) = 2, el denominador crece mucho más rápido al infinito y la A.H. es y = 0.',
      };
    }

    if (mode === 'greater_deg') {
      const k = randChoice(rng, [2, 3]);
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 4 · Asíntota Horizontal (gr P > gr Q)',
        representation: 'symbolic',
        stage: 'retrieval',
        transferDistance: 'near',
        prompt: `¿Cuál es la asíntota horizontal de f(x) = (${k}x² − 1) / (x + 2)? (Si no posee, escribí "no tiene")`,
        inputKind: 'asymptote',
        expected: 'no tiene',
        placeholder: 'Ej: y = 2 o ...',
        diagContext: { target: 'horizontal_asymptote', expectNone: true, trapValues: [k] },
        hints: [
          'Pista 1 (Orientación): Compará el grado de arriba (2) con el grado de abajo (1).',
          'Pista 2 (Paso intermedio): Al ser gr(P) > gr(Q), |f(x)| crece sin cota cuando |x| tiende a infinito.',
          'Pista 3 (Remate): Confirmá por criterio de grados que no se estabiliza en ninguna recta horizontal.',
        ],
        explanation: 'Como gr(P) = 2 > gr(Q) = 1, la función no tiene asíntota horizontal (responde «no tiene»).',
      };
    }

    // Unordered denominator trap: (ax + b) / (c - dx)
    const a = randChoice(rng, [2, 3, 4, 6]);
    const b = randChoice(rng, [1, -3, 5]);
    const c = randChoice(rng, [3, 4, 5, 7]);
    const d = randChoice(rng, [1, 2]);
    const haVal = rat(-a, d);
    const haStr = `y = ${ratToString(haVal, { unicodeMinus: false })}`;
    const trapVal = a / c;

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 4 · Asíntota Horizontal (Líderes)',
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      prompt: `Indicá la asíntota horizontal de f(x) = (${a}x ${b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`}) / (${c} − ${d === 1 ? '' : d}x):`,
      inputKind: 'asymptote',
      expected: haStr,
      placeholder: 'Ej: y = -2',
      diagContext: { target: 'horizontal_asymptote', trapValues: [trapVal, a / d] },
      hints: [
        'Pista 1 (Orientación): Ordená primero el denominador en forma decreciente antes de dividir coeficientes.',
        `Pista 2 (Paso intermedio): El coeficiente principal de arriba es ${a} y el de abajo (que multiplica a x) es −${d}.`,
        'Pista 3 (Remate): Escribí la ecuación "y = a_n / b_m" conservando el signo negativo del denominador.',
      ],
      explanation: `Ordenando el denominador (−${d === 1 ? '' : d}x + ${c}), la razón de coeficientes principales es ${a}/(−${d}) = ${ratToString(haVal)}, luego la A.H. es y = ${ratToString(haVal)}.`,
    };
  }

  // 5. Irrational domain & equations with extraneous roots
  if (type === 'irrational_domain_and_equations') {
    const useDomain = rng() < 0.45;
    if (useDomain) {
      // Quadratic radicand sqrt((x - r1)(x - r2)) -> (-inf; r1] U [r2; +inf)
      const r1 = randChoice(rng, [-5, -3, -2, 1]);
      const r2 = r1 + randChoice(rng, [2, 3, 4, 5]);
      const sum = r1 + r2;
      const prod = r1 * r2;
      const bStr = sum === 0 ? '' : sum > 0 ? ` − ${sum}x` : ` + ${Math.abs(sum)}x`;
      const cStr = prod === 0 ? '' : prod > 0 ? ` + ${prod}` : ` − ${Math.abs(prod)}`;
      const expectedDom = `(−∞; ${fmt(r1)}] ∪ [${fmt(r2)}; +∞)`;

      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 5 · Dominio de Radical Cuadrático',
        representation: 'symbolic',
        stage: 'guided_practice',
        transferDistance: 'near',
        prompt: `Hallá el dominio máximo en ℝ de f(x) = √(x²${bStr}${cStr}):`,
        inputKind: 'set_or_interval',
        expected: expectedDom,
        placeholder: `Ej: (-inf; ${r1}] U [${r2}; +inf)`,
        diagContext: { target: 'irrational_domain', isOddIndex: false, expectedNotAllReal: true },
        hints: [
          'Pista 1 (Orientación): Como el índice es par (2), el radicando debe ser ≥ 0.',
          `Pista 2 (Paso intermedio): Factorizá la cuadrática: (x ${r1 >= 0 ? `− ${r1}` : `+ ${Math.abs(r1)}`})(x ${r2 >= 0 ? `− ${r2}` : `+ ${Math.abs(r2)}`}) ≥ 0 tiene raíces ${r1} y ${r2}.`,
          'Pista 3 (Remate): Como la parábola abre hacia arriba, es ≥ 0 en los dos tramos externos con corchetes cerrados en las raíces.',
        ],
        explanation: `x²${bStr}${cStr} ≥ 0 se cumple fuera del intervalo entre raíces: Dom(f) = ${expectedDom}.`,
      };
    }

    // Extraneous root equation: sqrt(x + k) = x + m crafted with valid & extraneous root
    // Pick valid root xv and extraneous root xe such that xv + m >= 0 and xe + m < 0:
    // (x + m)^2 = x + k => roots xv, xe => sum = xv + xe = 1 - 2m => m = (1 - (xv + xe))/2, ensure integer!
    const pairs = [
      { xv: 3, xe: -2, m: 0, k: 6 },   // sqrt(x + 6) = x -> 3 valid, -2 extraneous
      { xv: 6, xe: 2, m: -3, k: -3 },  // Wait: 2x - 3 = (x-3)^2; for x+k=(x+m)^2: xv+xe = 1-2m
      { xv: 4, xe: -1, m: -1, k: 5 },  // (x-1)^2 = x+5 => x^2 - 3x - 4 = 0 -> x=4, -1; rhs(4)=3>=0, rhs(-1)=-2<0!
      { xv: 5, xe: 0, m: -2, k: 4 },   // (x-2)^2 = x+4 => x^2 - 5x = 0 -> x=5, 0; rhs(5)=3>=0, rhs(0)=-2<0!
      { xv: 2, xe: -3, m: 1, k: 7 },   // (x+1)^2 = x+7 => x^2 + x - 6 = 0 -> x=2, -3; rhs(2)=3>=0, rhs(-3)=-2<0!
    ];
    const spec = randChoice(rng, pairs);
    const eqRes = solveIrrationalEquation({
      index: 2,
      k: 1,
      d: 0,
      gCoeffs: [spec.k, 1],
      rhsCoeffs: [spec.m, 1],
    });
    const rhsStr = spec.m === 0 ? 'x' : spec.m > 0 ? `x + ${spec.m}` : `x − ${Math.abs(spec.m)}`;
    const radStr = spec.k >= 0 ? `x + ${spec.k}` : `x − ${Math.abs(spec.k)}`;

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 5 · Ecuación Irracional (Extraviadas)',
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      prompt: `Resolvé en ℝ la ecuación irracional (descartando raíces extraviadas): √(${radStr}) = ${rhsStr}`,
      inputKind: 'solution_set',
      expected: eqRes.solutionFormatted,
      placeholder: 'Ej: {3} o vacio',
      diagContext: { target: 'irrational_equation', extraneousRoots: [spec.xe] },
      hints: [
        `Pista 1 (Orientación): Planteá la condición de signo del miembro derecho antes de elevar al cuadrado: ${rhsStr} ≥ 0.`,
        `Pista 2 (Paso intermedio): Al elevar al cuadrado obtenés las candidatas x = ${spec.xe} y x = ${spec.xv}.`,
        'Pista 3 (Remate): Reemplazá ambas en la ecuación original y quedate únicamente con la que no produce un miembro derecho negativo.',
      ],
      explanation: `Al verificar en √(${radStr}) = ${rhsStr}, x = ${spec.xe} resulta extraviada (da lado derecho negativo) y solo verifica x = ${spec.xv}: S = ${eqRes.solutionFormatted}.`,
    };
  }

  // 6. Irrational graphs (image, C0) & piecewise
  const cVal = randChoice(rng, [1, 2, 3, 4]);
  const hVal = randChoice(rng, [-2, -1, 1, 2, 3]);
  const kSign = randChoice(rng, [-1, 1]);
  const aSign = randChoice(rng, [-1, 1]);
  // f(x) = cVal + kSign * sqrt(aSign * (x - hVal)) = cVal + kSign * sqrt(aSign*x - aSign*hVal)
  const bCoeff = -aSign * hVal;
  const fStudy = analyzeIrrationalFunction({
    k: kSign,
    index: 2,
    a: aSign,
    b: bCoeff,
    c: cVal,
  });

  const insideStr =
    aSign > 0
      ? hVal >= 0
        ? `x − ${hVal}`
        : `x + ${Math.abs(hVal)}`
      : `${hVal} − x`;
  const formulaStr = `${cVal} ${kSign < 0 ? '−' : '+'} √(${insideStr})`;

  const askImage = rng() < 0.55;
  if (askImage) {
    const wrongTrap = kSign < 0 ? `[${fmt(cVal)}; +∞)` : `(−∞; ${fmt(cVal)}]`;
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 6 · Imagen de Gráfica Radical',
      representation: 'graphical',
      stage: 'retrieval',
      transferDistance: 'near',
      prompt: `Indicá el conjunto imagen Im(f) de la función f(x) = ${formulaStr}:`,
      inputKind: 'set_or_interval',
      expected: fStudy.image.formatted,
      placeholder: `Ej: ${kSign < 0 ? `(-inf; ${cVal}]` : `[${cVal}; +inf)`}`,
      diagContext: { target: 'irrational_image', wrongReflectionTrap: wrongTrap },
      hints: [
        'Pista 1 (Orientación): Recordá que √(...) siempre devuelve valores ≥ 0, con mínimo 0 en el inicio de la curva.',
        `Pista 2 (Paso intermedio): Como delante de la raíz hay signo ${kSign < 0 ? 'negativo (−)' : 'positivo (+)'}, desde el valor inicial c = ${cVal} la curva ${kSign < 0 ? 'desciende' : 'asciende'}.`,
        'Pista 3 (Remate): Incluí el borde c con corchete cerrado porque la raíz sí alcanza el valor 0 en su vértice de partida.',
      ],
      explanation: `En x = ${hVal} la raíz vale 0 y f(${hVal}) = ${cVal}; como ${kSign < 0 ? '−√(...) ≤ 0' : '+√(...) ≥ 0'}, resulta Im(f) = ${fStudy.image.formatted}.`,
    };
  }

  return {
    seed,
    type,
    competencyId: typeObj.competencyId,
    badge: 'Familia 6 · Dominio de Radical Reflejada',
    representation: 'symbolic',
    stage: 'guided_practice',
    transferDistance: 'near',
    prompt: `Determiná el dominio máximo de f(x) = ${formulaStr}:`,
    inputKind: 'set_or_interval',
    expected: fStudy.domain.domainFormatted,
    placeholder: aSign < 0 ? `Ej: (-inf; ${hVal}]` : `Ej: [${hVal}; +inf)`,
    diagContext: {
      target: 'irrational_domain',
      isOddIndex: false,
      expectedNotAllReal: true,
      flippedSignTrap: aSign < 0 ? `[${fmt(hVal)}; +∞)` : `(−∞; ${fmt(hVal)}]`,
    },
    hints: [
      `Pista 1 (Orientación): Exigí que el radicando sea no negativo: ${insideStr} ≥ 0.`,
      `Pista 2 (Paso intermedio): El coeficiente de x dentro de la raíz es ${aSign > 0 ? '+1' : '−1'}.`,
      'Pista 3 (Remate): Si multiplicás o dividís por −1 para despejar x, invertí el sentido de la desigualdad y cerrá el borde con corchete.',
    ],
    explanation: `Al resolver ${insideStr} ≥ 0 obtenemos Dom(f) = ${fStudy.domain.domainFormatted}.`,
  };
}

export function generateRiChallenges(seed, forcedType = 'all', count = 6) {
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push(generateRiChallenge(seed, forcedType, i));
  }
  return list;
}

export const TRAPS = [
  {
    id: 'trap-1-erased-domain',
    title: 'Trampa 1 · El fantasma del dominio borrado',
    subtitle: 'Cancelar (x − a) en una expresión racional y declarar que el dominio es ℝ.',
    wrongAttempt: {
      author: 'Resolución Saboteada',
      steps: [
        'Toma f(x) = (x² − 9)/(x − 3) = (x − 3)(x + 3)/(x − 3).',
        'Cancela (x − 3) y concluye f(x) = x + 3 con Dom(f) = ℝ.',
      ],
    },
    correctResolution: {
      author: 'Resolución Rigurosa',
      steps: [
        'Primero lee el denominador original: x − 3 ≠ 0 ⇒ Dom(f) = ℝ − {3}.',
        'Luego simplifica para x ≠ 3: f(x) = x + 3 (tiene un punto agujero en (3; 6)).',
      ],
    },
    question: '¿Cuál es el dominio de f(x) = (x² − 6x + 9)/(x − 3) y es igual a g(x) = x − 3?',
    options: [
      {
        label: 'Dom(f) = ℝ − {3}; no son funciones iguales porque Dom(g) = ℝ.',
        correct: true,
        feedback: '¡Exacto! Dos funciones coinciden solo si comparten fórmula y dominio.',
      },
      {
        label: 'Dom(f) = ℝ; son exactamente la misma función lineal.',
        correct: false,
        diagnosticId: 'lost_excluded_domain_on_cancel',
        feedback: 'Ojo: simplificar nunca borra la división por cero en x = 3 de la fórmula original.',
      },
      {
        label: 'Dom(f) = ℝ − {−3; 3}; tiene asíntota vertical en x = 3.',
        correct: false,
        diagnosticId: 'hole_vs_va_multiplicity_confusion',
        feedback: 'El numerador es (x − 3)²: se anula solo en 3 con multiplicidad 2 ≥ 1, dejando un agujero.',
      },
    ],
  },
  {
    id: 'trap-2-cancel-addends',
    title: 'Trampa 2 · Tachar sumandos en vez de factores',
    subtitle: 'Simplificar piezas unidas por + o − sin haber factorizado todo el bloque.',
    wrongAttempt: {
      author: 'Resolución Saboteada',
      steps: [
        'En (x² + 2x + 1)/(x + 1) tacha x con x y 1 con 1.',
        'Escribe que el resultado es x² + x.',
      ],
    },
    correctResolution: {
      author: 'Resolución Rigurosa',
      steps: [
        'Reconoce el trinomio cuadrado perfecto arriba: x² + 2x + 1 = (x + 1)².',
        'Recién al tener factores multiplicando cancela uno con (x + 1) abajo: queda x + 1 para x ≠ −1.',
      ],
    },
    question: '¿Cuánto vale (x² + 2x + 1)/(x + 1) simplificado correctamente para x ≠ −1?',
    options: [
      {
        label: 'x + 1',
        correct: true,
        feedback: '¡Correcto! (x + 1)² / (x + 1) = x + 1 con x ≠ −1.',
      },
      {
        label: 'x² + x',
        correct: false,
        diagnosticId: 'cancelled_terms_instead_of_factors',
        feedback: 'Tachaste sumandos sueltos en vez de factorizar primero el trinomio cuadrado perfecto.',
      },
      {
        label: 'x² + 2x',
        correct: false,
        diagnosticId: 'cancelled_terms_instead_of_factors',
        feedback: 'No podés cancelar el +1 de arriba con el +1 de abajo porque están sumando.',
      },
    ],
  },
  {
    id: 'trap-3-closed-pole-asymptote',
    title: 'Trampa 3 · Corchete cerrado en el polo o en la asíntota',
    subtitle: 'Incluir en la solución o imagen un valor prohibido por denominador cero o asíntota horizontal.',
    wrongAttempt: {
      author: 'Resolución Saboteada',
      steps: [
        'Al resolver 7/(x + 6) ≤ 1 llega a (1 − x)/(x + 6) ≤ 0.',
        'Como el signo es ≤, pone corchete cerrado en ambos extremos: (−∞; −6] ∪ [1; +∞).',
      ],
    },
    correctResolution: {
      author: 'Resolución Rigurosa',
      steps: [
        'La raíz del numerador es x = 1 (admite ≤ 0 → corchete [1; +∞)).',
        'El polo x = −6 anula el denominador: lleva SIEMPRE paréntesis abierto → (−∞; −6) ∪ [1; +∞).',
      ],
    },
    question: 'En la inecuación (1 − x)/(x + 6) ≤ 0, ¿qué extremo lleva corchete cerrado y cuál abierto?',
    options: [
      {
        label: 'Abierto en x = −6 (polo) y cerrado en x = 1 (raíz del numerador): (−∞; −6) ∪ [1; +∞)',
        correct: true,
        feedback: '¡Impecable! Un polo jamás pertenece al conjunto solución.',
      },
      {
        label: 'Cerrado en ambos: (−∞; −6] ∪ [1; +∞)',
        correct: false,
        diagnosticId: 'accepted_excluded_root_in_equation',
        feedback: 'Si cerrás x = −6 dividís por cero en el denominador.',
      },
      {
        label: 'Abierto en ambos: (−∞; −6) ∪ (1; +∞)',
        correct: false,
        feedback: 'En x = 1 el numerador vale 0 y 0/7 = 0 ≤ 0 cumple la desigualdad.',
      },
    ],
  },
  {
    id: 'trap-4-unordered-ha',
    title: 'Trampa 4 · Invertir el orden de coeficientes en la A.H.',
    subtitle: 'Leer el primer número escrito en el denominador desordenado como coeficiente principal.',
    wrongAttempt: {
      author: 'Resolución Saboteada',
      steps: [
        'En f(x) = (2x + 1)/(3 − x) mira los primeros números: 2 arriba y 3 abajo.',
        'Escribe asíntota horizontal y = 2/3.',
      ],
    },
    correctResolution: {
      author: 'Resolución Rigurosa',
      steps: [
        'Ordena por potencias decrecientes: (2x + 1)/(−x + 3).',
        'Divide los coeficientes de x: 2 / (−1) = −2 ⇒ A.H. y = −2 (y A.V. x = 3).',
      ],
    },
    question: 'Para f(x) = (2 − 3x)/(x + 5), ¿cuál es su asíntota horizontal?',
    options: [
      {
        label: 'y = −3',
        correct: true,
        feedback: '¡Muy bien! El líder del numerador es −3x y el del denominador es 1x: −3/1 = −3.',
      },
      {
        label: 'y = 2',
        correct: false,
        diagnosticId: 'inverted_ha_degree_or_coeff_ratio',
        feedback: 'Tomaste el término independiente 2 por estar escrito primero en lugar del coeficiente de x.',
      },
      {
        label: 'x = −3',
        correct: false,
        diagnosticId: 'inverted_ha_degree_or_coeff_ratio',
        feedback: 'Una asíntota horizontal es de altura constante (y = −3), no vertical (x = −3).',
      },
    ],
  },
  {
    id: 'trap-5-extraneous-root',
    title: 'Trampa 5 · La solución extraviada al elevar al cuadrado',
    subtitle: 'Aceptar todas las raíces de la ecuación polinómica resultante sin verificar signo en la original.',
    wrongAttempt: {
      author: 'Resolución Saboteada',
      steps: [
        'En √(x + 6) = x eleva ambos lados: x + 6 = x².',
        'Resuelve x² − x − 6 = 0 y responde S = {−2; 3}.',
      ],
    },
    correctResolution: {
      author: 'Resolución Rigurosa',
      steps: [
        'Exige x ≥ −6 (radicando) y x ≥ 0 (raíz cuadrada principal ≥ 0).',
        'Reemplaza x = −2: √4 = 2 ≠ −2 (extraviada). Solo x = 3 verifica: S = {3}.',
      ],
    },
    question: '¿Cuál es el conjunto solución real de √(x − 1) = −5?',
    options: [
      {
        label: 'S = ∅ (x = 26 es extraviada porque √25 = 5 ≠ −5)',
        correct: true,
        feedback: '¡Exacto! La raíz cuadrada principal es no negativa y nunca iguala a −5.',
      },
      {
        label: 'S = {26}',
        correct: false,
        diagnosticId: 'accepted_extraneous_squaring_root',
        feedback: 'Al reemplazar x = 26 en la ecuación original queda 5 = −5, que es falso.',
      },
      {
        label: 'S = {−24}',
        correct: false,
        diagnosticId: 'even_vs_odd_radical_domain_confusion',
        feedback: 'x = −24 ni siquiera pertenece al dominio x ≥ 1.',
      },
    ],
  },
];

function loadSavedSeed() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem) {
      const raw = localStorage.getItem(SEED_STORAGE_KEY);
      const parsed = Number(raw);
      if (Number.isInteger(parsed) && parsed >= 0) return parsed;
    }
  } catch {}
  return 2026;
}

function saveSeed(seed) {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(SEED_STORAGE_KEY, String(seed));
    }
  } catch {}
}

export function selectAdaptiveRiFamily({
  store = getProgressStore(),
  now = new Date(),
  previousCompetencyId = null,
} = {}) {
  return selectAdaptiveExercise({
    moduleId: MODULE_ID,
    availableExercises: CHALLENGE_TYPES,
    store,
    now,
    previousCompetencyId,
  });
}

export function mountRiRetos(root, { vn } = {}) {
  if (!root) return;
  clear(root);

  const state = {
    seed: loadSavedSeed(),
    family: 'all',
    streak: 0,
    solvedCount: 0,
  };

  const tabsHeader = h('div', { class: 'ri-retos-tabs pr-chip-row' });
  const tabPrng = h('button', { type: 'button', class: 'pr-chip is-active' }, [
    chalkIcon('spark', 15),
    ' 1. Entrenador Infinito por Semilla PRNG (6 Familias)',
  ]);
  const tabTraps = h('button', { type: 'button', class: 'pr-chip' }, [
    chalkIcon('shield', 15),
    ' 2. Las 5 Trampas Clásicas de Examen',
  ]);
  tabsHeader.append(tabPrng, tabTraps);

  const prngPane = h('div', { class: 'ri-retos-pane' });
  const trapsPane = h('div', { class: 'ri-retos-pane', hidden: '' });

  const seedInput = h('input', {
    type: 'number',
    class: 'pr-check-input',
    value: String(state.seed),
    'aria-label': 'Semilla PRNG',
  });
  const familySelect = h(
    'select',
    { class: 'pr-check-input ri-family-select', 'aria-label': 'Familia de ejercicios' },
    [
      h('option', { value: 'all' }, 'Mixto (Las 6 familias)'),
      h('option', { value: 'adaptativo' }, 'Inteligente (Según tu evidencia)'),
      ...CHALLENGE_TYPES.map((t) => h('option', { value: t.id }, t.label)),
    ]
  );
  const nextSeedBtn = h('button', { type: 'button', class: 'pr-btn' }, [
    chalkIcon('play', 14),
    ' Siguiente semilla',
  ]);
  const randSeedBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, 'Aleatoria');
  const progressPill = h('span', { class: 'exp-trainer-progress-pill' }, '0/6 resueltos · Racha indep.: 0');
  const adaptiveNote = h('p', { class: 'small muted', hidden: '' });

  const toolbar = h('div', { class: 'exp-trainer-toolbar' }, [
    h('label', { class: 'exp-trainer-field' }, [h('span', {}, 'Semilla'), seedInput]),
    h('label', { class: 'exp-trainer-field exp-trainer-field--grow' }, [
      h('span', {}, 'Familia / Modo'),
      familySelect,
    ]),
    h('div', { class: 'exp-trainer-toolbar__btns' }, [nextSeedBtn, randSeedBtn]),
    progressPill,
  ]);
  const cascadeList = h('ol', { class: 'exp-challenges-cascade' });
  prngPane.append(toolbar, adaptiveNote, cascadeList);

  const updatePill = () => {
    progressPill.textContent = `${state.solvedCount}/6 resueltos · Racha indep.: ${state.streak}`;
  };

  function createCard(ch, idx) {
    let hintIndex = 0;
    let solutionRevealed = false;
    const statusEl = h('span', { class: 'exp-challenge-card__status' }, 'Pendiente');
    const inputEl = h('input', {
      type: 'text',
      class: 'pr-check-input',
      placeholder: ch.placeholder,
      'aria-label': ch.prompt,
    });
    const verifyBtn = h('button', { type: 'button', class: 'pr-btn' }, [
      chalkIcon('check', 14),
      ' Verificar',
    ]);
    const hintBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [
      chalkIcon('bulb', 14),
      ` Pista (0/${ch.hints.length})`,
    ]);
    const solutionBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [
      chalkIcon('spark', 14),
      ' Ver solución explicada',
    ]);
    const hintsBox = h('div', { class: 'ri-check-hints', hidden: '' });
    const feedbackBox = h('div', {
      class: 'pr-check-feedback',
      role: 'status',
      'aria-live': 'polite',
    });

    hintBtn.addEventListener('click', () => {
      playClick();
      if (hintIndex < ch.hints.length) {
        hintsBox.removeAttribute('hidden');
        hintsBox.appendChild(h('div', { class: 'ri-hint-item' }, ch.hints[hintIndex]));
        hintIndex += 1;
        hintBtn.replaceChildren(
          chalkIcon('bulb', 14),
          hintIndex < ch.hints.length ? ` Pista (${hintIndex}/${ch.hints.length})` : ' Pistas completas'
        );
      }
    });

    solutionBtn.addEventListener('click', () => {
      playClick();
      if (solutionRevealed) return;
      solutionRevealed = true;
      state.streak = 0;
      inputEl.disabled = true;
      verifyBtn.disabled = true;
      hintBtn.disabled = true;
      solutionBtn.disabled = true;
      statusEl.textContent = 'Solución vista (Asistido)';
      statusEl.className = 'exp-challenge-card__status is-solution';
      feedbackBox.className = 'pr-check-feedback is-ok is-solution';
      feedbackBox.replaceChildren(
        chalkIcon('spark', 14),
        h('strong', {}, ' Solución explicada: '),
        h('span', {}, `${ch.explanation} (Respuesta: ${ch.expected})`)
      );
      try {
        recordRiAttempt({
          exerciseId: `ri-reto-${ch.type}-${idx}`,
          competencyId: ch.competencyId,
          correct: true,
          mode: 'assisted',
          hintsUsed: hintIndex,
          solutionRevealed: true,
          representation: ch.representation || 'symbolic',
          stage: ch.stage || 'transfer',
          transferDistance: ch.transferDistance || 'far',
        });
        notifyCompetencyDashboardUpdate();
      } catch {}
      updatePill();
    });

    const onVerify = () => {
      if (solutionRevealed || inputEl.disabled) return;
      const res = validateRiAttempt({
        kind: ch.inputKind,
        input: inputEl.value,
        expected: ch.expected,
        requireSameDomain: ch.requireSameDomain ?? true,
        requireSimplified: ch.requireSimplified ?? false,
        diagContext: ch.diagContext || {},
      });
      if (res.empty) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = 'Escribí un valor o expresión antes de verificar.';
        return;
      }
      if (res.ok) {
        playSuccess();
        const isIndependent = hintIndex === 0 && !solutionRevealed;
        if (isIndependent) state.streak += 1;
        state.solvedCount += 1;
        inputEl.disabled = true;
        verifyBtn.disabled = true;
        hintBtn.disabled = true;
        solutionBtn.disabled = true;
        card.classList.add('is-solved');
        statusEl.textContent = isIndependent ? 'Resuelto (Independiente)' : 'Resuelto (Con apoyo)';
        statusEl.className = `exp-challenge-card__status ${isIndependent ? 'is-solved-indep' : 'is-solved-assisted'}`;
        feedbackBox.className = 'pr-check-feedback is-ok';
        feedbackBox.replaceChildren(
          chalkIcon(isIndependent ? 'spark' : 'bulb', 14),
          h(
            'strong',
            {},
            isIndependent ? ' ¡Correcto! [Logro Independiente] ' : ' ¡Correcto! [Logro Asistido] '
          ),
          h('span', {}, ch.explanation)
        );
        try {
          recordRiAttempt({
            exerciseId: `ri-reto-${ch.type}-${idx}`,
            competencyId: ch.competencyId,
            correct: true,
            mode: isIndependent ? 'independent' : 'assisted',
            hintsUsed: hintIndex,
            solutionRevealed: false,
            representation: ch.representation || 'symbolic',
            stage: ch.stage || 'transfer',
            transferDistance: ch.transferDistance || 'far',
          });
          notifyCompetencyDashboardUpdate();
        } catch {}
        updatePill();
        if (isIndependent && STREAK_REACTIONS[state.streak]) {
          const sr = STREAK_REACTIONS[state.streak];
          if (vn && typeof vn.react === 'function') vn.react(sr.pose, sr.text);
          else vnReact(sr);
        }
        return;
      }

      playError();
      state.streak = 0;
      updatePill();
      if (res.syntaxError) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = res.syntaxError;
        return;
      }
      if (res.unsimplified) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = DIAGNOSE_REACTIONS.unsimplified_rational.text;
        return;
      }
      const diag = res.diagnostic;
      try {
        recordRiAttempt({
          exerciseId: `ri-reto-${ch.type}-${idx}`,
          competencyId: ch.competencyId,
          correct: false,
          mode: hintIndex > 0 ? 'assisted' : 'independent',
          hintsUsed: hintIndex,
          solutionRevealed: false,
          diagnosticId: diag?.id || null,
          representation: ch.representation || 'symbolic',
          stage: ch.stage || 'transfer',
          transferDistance: ch.transferDistance || 'far',
        });
        notifyCompetencyDashboardUpdate();
      } catch {}
      feedbackBox.className = 'pr-check-feedback is-error';
      feedbackBox.textContent = diag
        ? diag.message
        : 'Todavía no coincide. Usá «Pista» para revisar el dominio o el despeje.';
      if (diag) {
        if (vn && typeof vn.react === 'function') vn.react(diag.pose, diag.message);
        else vnReact({ pose: diag.pose, tag: diag.shortLabel, html: diag.message });
      }
    };

    verifyBtn.addEventListener('click', onVerify);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onVerify();
      }
    });

    const card = h(
      'li',
      { class: 'exp-challenge-card ri-reto-card', 'data-problem-index': String(idx) },
      h('div', { class: 'exp-challenge-card__header' }, [
        h('span', { class: 'exp-challenge-card__badge' }, `Reto ${idx + 1} · ${ch.badge}`),
        statusEl,
      ]),
      h('p', { class: 'pr-check-prompt' }, ch.prompt),
      h('div', { class: 'exp-challenge-card__input-row' }, [inputEl]),
      h('div', { class: 'ri-reto-actions pr-chip-row' }, [verifyBtn, hintBtn, solutionBtn]),
      hintsBox,
      feedbackBox
    );
    return card;
  }

  function renderCascade() {
    clear(cascadeList);
    state.solvedCount = 0;
    adaptiveNote.setAttribute('hidden', '');
    let challenges;

    if (state.family === 'adaptativo') {
      const store = getProgressStore();
      const now = new Date();
      challenges = [];
      let prevComp = null;
      let firstSelection = null;
      for (let i = 0; i < 6; i++) {
        const sel = selectAdaptiveRiFamily({
          store,
          now,
          previousCompetencyId: prevComp,
        });
        if (i === 0) firstSelection = sel;
        const fam = sel.exercise?.id || CHALLENGE_TYPES[i % CHALLENGE_TYPES.length].id;
        const ch = generateRiChallenge(state.seed, fam, i);
        prevComp = sel.targetCompetencyId || sel.exercise?.competencyId;
        challenges.push(ch);
      }
      const firstComp = getCompetencyById(firstSelection?.targetCompetencyId || challenges[0]?.competencyId);
      adaptiveNote.removeAttribute('hidden');
      adaptiveNote.textContent = firstSelection?.selectionReason
        ? `Selección adaptativa: ${firstSelection.selectionReason} Prioridad: «${firstComp?.title || 'Racionales e Irracionales'}».`
        : `Selección adaptativa activa: priorizando «${firstComp?.title || 'Racionales e Irracionales'}» según tu evidencia.`;
    } else {
      challenges = generateRiChallenges(state.seed, state.family, 6);
    }

    challenges.forEach((ch, idx) => cascadeList.appendChild(createCard(ch, idx)));
    updatePill();
  }

  seedInput.addEventListener('change', () => {
    state.seed = Number(seedInput.value) >>> 0;
    seedInput.value = String(state.seed);
    saveSeed(state.seed);
    renderCascade();
  });
  familySelect.addEventListener('change', () => {
    state.family = familySelect.value;
    renderCascade();
  });
  nextSeedBtn.addEventListener('click', () => {
    playClick();
    state.seed += 1;
    seedInput.value = String(state.seed);
    saveSeed(state.seed);
    renderCascade();
  });
  randSeedBtn.addEventListener('click', () => {
    playClick();
    state.seed = Math.floor(Math.random() * 1000000) >>> 0;
    seedInput.value = String(state.seed);
    saveSeed(state.seed);
    renderCascade();
  });

  // Tab 2: 5 Exam Traps
  const trapChips = h('div', { class: 'pr-chip-row' });
  const trapBody = h('div', { class: 'ri-trap-body' });
  trapsPane.append(trapChips, trapBody);

  function renderTrap(idx) {
    const trap = TRAPS[idx];
    Array.from(trapChips.children).forEach((b, i) => b.classList.toggle('is-active', i === idx));
    clear(trapBody);

    const feedback = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });
    const opts = h(
      'div',
      { class: 'ri-trap-options pr-options' },
      trap.options.map((opt) => {
        const btn = h('button', { type: 'button', class: 'pr-option' }, opt.label);
        btn.addEventListener('click', () => {
          Array.from(opts.children).forEach((s) =>
            s.classList.remove('is-selected', 'is-correct', 'is-wrong')
          );
          btn.classList.add('is-selected');
          if (opt.correct) {
            playSuccess();
            btn.classList.add('is-correct');
            feedback.className = 'pr-check-feedback is-ok';
          } else {
            playError();
            btn.classList.add('is-wrong');
            feedback.className = 'pr-check-feedback is-error';
          }
          feedback.textContent = opt.feedback;
        });
        return btn;
      })
    );

    trapBody.append(
      h('h3', { class: 'ri-trap-title' }, trap.title),
      h('p', { class: 'muted' }, trap.subtitle),
      h('div', { class: 'ri-trap-compare' }, [
        h('div', { class: 'ri-trap-col is-wrong' }, [
          h('div', { class: 'ri-trap-col-head' }, [
            chalkIcon('cross', 15),
            ` ${trap.wrongAttempt.author}`,
          ]),
          h('ol', {}, trap.wrongAttempt.steps.map((s) => h('li', {}, s))),
        ]),
        h('div', { class: 'ri-trap-col is-right' }, [
          h('div', { class: 'ri-trap-col-head' }, [
            chalkIcon('check', 15),
            ` ${trap.correctResolution.author}`,
          ]),
          h('ol', {}, trap.correctResolution.steps.map((s) => h('li', {}, s))),
        ]),
      ]),
      h('p', { class: 'pr-check-prompt' }, trap.question),
      opts,
      feedback
    );
  }

  TRAPS.forEach((_, idx) => {
    trapChips.appendChild(
      h(
        'button',
        {
          type: 'button',
          class: `pr-chip${idx === 0 ? ' is-active' : ''}`,
          on: {
            click: () => {
              playClick();
              renderTrap(idx);
            },
          },
        },
        `Trampa ${idx + 1}`
      )
    );
  });

  tabPrng.addEventListener('click', () => {
    playClick();
    tabPrng.classList.add('is-active');
    tabTraps.classList.remove('is-active');
    prngPane.removeAttribute('hidden');
    trapsPane.setAttribute('hidden', '');
  });
  tabTraps.addEventListener('click', () => {
    playClick();
    tabTraps.classList.add('is-active');
    tabPrng.classList.remove('is-active');
    trapsPane.removeAttribute('hidden');
    prngPane.setAttribute('hidden', '');
  });

  renderCascade();
  renderTrap(0);
  root.append(tabsHeader, prngPane, trapsPane);
}

export const initRetosModule = mountRiRetos;
