/**
 * @file js/modules/lineal/retos.js
 * Entrenador Contrastivo Infinito por Semilla (PRNG Mulberry32 · 8 Familias)
 * y Las 5 Trampas Clásicas de Examen para Unidad 03 · Función Lineal.
 */

import { h, clear, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { react as vnReact } from '../../core/vn.js';
import { selectAdaptiveExercise } from '../../core/learning/exercise-selector.js';
import {
  MINUS,
  rat,
  ratDiv,
  ratMul,
  ratSub,
  ratNeg,
  ratToNumber,
  fmtRat,
  fmtNumberEsAR,
  exactRadical,
  parseExactRadical,
  exactRadicalEq,
  fmtExactRadical,
  slopeFromPoints,
  convertLinearForms,
  analyzeLinear,
  perpendicularLineThrough,
  parallelLineThrough,
  perpendicularBisector,
  pointLineDistance,
  analyzePiecewiseLinear,
  equivalentLineEquation,
  parseNumberOrFraction,
  parseOrderedPair,
  equivalentSetExactas,
  diagnoseLinear,
} from './logic.js';
import { DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import { LIN_COMPETENCIES, getCompetencyById } from './competencies-map.js';
import {
  MODULE_ID as LINEAR_MODULE_ID,
  getProgressStore,
  recordLinearAttempt,
  getLinearCompetencyReport,
} from './learning-adapter.js';
import { notifyCompetencyDashboardUpdate } from './components.js';

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
    id: 'slope_and_explicit_two_points',
    label: 'Recta explícita desde dos puntos',
    competencyId: 'linear.definition_slope_and_intercept',
  },
  {
    id: 'linear_study_c0_cp_cm',
    label: 'Estudio analítico (C₀, C⁺, C⁻)',
    competencyId: 'linear.definition_slope_and_intercept',
  },
  {
    id: 'convert_three_forms',
    label: 'Conversión entre las 3 formas',
    competencyId: 'linear.angle_and_three_equation_forms',
  },
  {
    id: 'angle_and_point_equation',
    label: 'Pendiente por ángulo α y punto',
    competencyId: 'linear.angle_and_three_equation_forms',
  },
  {
    id: 'parallel_perpendicular_parameter',
    label: 'Paralelismo, perpendicularidad y parámetro k',
    competencyId: 'linear.parallel_perpendicular_and_incidence',
  },
  {
    id: 'mediatriz_segment',
    label: 'Mediatriz de un segmento',
    competencyId: 'linear.analytic_geometry_distance_midpoint_bisector',
  },
  {
    id: 'point_line_distance_exact',
    label: 'Distancia exacta punto-recta',
    competencyId: 'linear.analytic_geometry_distance_midpoint_bisector',
  },
  {
    id: 'piecewise_linear_eval_and_image',
    label: 'Tramos lineales y modelización',
    competencyId: 'linear.modeling_and_piecewise',
  },
];

function _generateLinearChallengeRaw(seed, forcedType = 'all', problemIndex = 0) {
  let rng;
  let typeObj;
  const isAll = !forcedType || forcedType === 'all' || forcedType === 'aleatorio';

  if (isAll) {
    if (problemIndex === 0) {
      rng = mulberry32(seed >>> 0);
      typeObj = randChoice(rng, CHALLENGE_TYPES);
    } else {
      const baseRng = mulberry32(seed >>> 0);
      const baseIndex = Math.floor(baseRng() * CHALLENGE_TYPES.length);
      typeObj = CHALLENGE_TYPES[(baseIndex + problemIndex) % CHALLENGE_TYPES.length];
      rng = mulberry32((seed + problemIndex * 7919 + 1013) >>> 0);
    }
  } else {
    typeObj = CHALLENGE_TYPES.find((t) => t.id === forcedType) || CHALLENGE_TYPES[0];
    rng = problemIndex === 0 ? mulberry32(seed >>> 0) : mulberry32((seed + problemIndex * 7919 + 1013) >>> 0);
  }

  const type = typeObj.id;

  // 1. slope_and_explicit_two_points
  if (type === 'slope_and_explicit_two_points') {
    const x1 = randChoice(rng, [-3, -2, -1, 1, 2]);
    const dx = randChoice(rng, [2, 3, 4, -2, -3]);
    const x2 = x1 + dx;
    const y1 = randChoice(rng, [-4, -2, 1, 3, 5]);
    const dy = randChoice(rng, [-3, -2, 2, 3, 4, 5]);
    const y2 = y1 + dy;
    const sp = slopeFromPoints({ x: x1, y: y1 }, { x: x2, y: y2 });
    const forms = convertLinearForms({ p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } });

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 1 · Recta por 2 puntos',
      prompt: `Hallá la ecuación explícita y = mx + b de la recta que pasa por P(${x1}; ${y1}) y Q(${x2}; ${y2}):`,
      inputKind: 'expression',
      requireForm: 'explicit',
      expected: forms.explicit.text,
      placeholder: 'Ej: y = 2/3 x + 1',
      diagContext: { target: 'equation', m: ratToNumber(sp.m), b: ratToNumber(sp.b) },
      hints: [
        `Pista 1: Calculá primero la pendiente m = (y₂ − y₁) / (x₂ − x₁) respetando el mismo orden en numerador y denominador.`,
        `Pista 2: Δy = ${y2} − (${y1}) = ${dy} y Δx = ${x2} − (${x1}) = ${dx}, por lo que la pendiente simplificada vale ${fmtRat(sp.m)}.`,
        `Pista 3: Sustituí la pendiente hallada y las coordenadas del punto P(${x1}; ${y1}) en y = m·x + b para despejar la ordenada al origen.`,
      ],
      explanation: `La pendiente es m = (${y2} − (${y1})) / (${x2} − (${x1})) = ${fmtRat(sp.m)}. Reemplazando P(${x1}; ${y1}) obtenemos b = ${fmtRat(sp.b)}, quedando ${forms.explicit.text}.`,
    };
  }

  // 2. linear_study_c0_cp_cm
  if (type === 'linear_study_c0_cp_cm') {
    const mNum = randChoice(rng, [-3, -2, 2, 3]);
    const mDen = randChoice(rng, [1, 2, 3]);
    const m = rat(mNum, mDen);
    const root = randChoice(rng, [-3, -2, -1, 1, 2, 3]);
    const b = ratMul(ratNeg(m), rat(root));
    const study = analyzeLinear({ m, b });
    const askPositive = rng() > 0.5;
    const expected = askPositive ? study.CPlus : study.CMinus;
    const setName = askPositive ? 'C⁺' : 'C⁻';

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 2 · Estudio de signos',
      prompt: `Dada f(x) = ${study.forms.explicit.text.replace('y = ', '')}, determiná el conjunto ${setName} en notación de intervalo de Exactas:`,
      inputKind: 'set',
      expected,
      placeholder: 'Ej: (-inf; 2) o (2; +inf)',
      diagContext: { target: 'sign_set', yIntercept: fmtRat(b) },
      hints: [
        `Pista 1: Buscá primero la raíz C₀ igualando f(x) = 0; ese punto sobre el eje X parte a ℝ en dos semirrectas abiertas.`,
        `Pista 2: La raíz de la función está en x₀ = ${fmtRat(study.root)} y la pendiente m = ${fmtRat(m)} es ${mNum > 0 ? 'positiva (sube de izquierda a derecha)' : 'negativa (baja de izquierda a derecha)'}.`,
        `Pista 3: Escribí como intervalo abierto la semirrecta del eje X donde las alturas f(x) resultan ${askPositive ? 'mayores' : 'menores'} que cero, sin incluir la raíz con corchete.`,
      ],
      explanation: `La raíz es x₀ = ${fmtRat(study.root)}. Como m = ${fmtRat(m)} es ${mNum > 0 ? 'positiva' : 'negativa'}, ${setName} = ${expected}.`,
    };
  }

  // 3. convert_three_forms
  if (type === 'convert_three_forms') {
    const aSeg = randChoice(rng, [-4, -3, -2, 2, 3, 4]);
    const bSeg = randChoice(rng, [-3, -2, 2, 3, 4]);
    const forms = convertLinearForms({ aSeg, bSeg });
    const toSeg = rng() > 0.5;

    if (toSeg) {
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 3 · De Implícita a Segmentaria',
        prompt: `Escribí en forma segmentaria x/a + y/b = 1 la recta ${forms.implicit.text}:`,
        inputKind: 'expression',
        requireForm: 'segmentary',
        expected: forms.segmentary.text,
        placeholder: 'Ej: x/3 + y/(-2) = 1',
        diagContext: { target: 'segmentary', expectedA: aSeg, expectedB: bSeg },
        hints: [
          `Pista 1: Pasá el término independiente al segundo miembro para que quede Ax + By = k.`,
          `Pista 2: En la forma segmentaria el segundo miembro debe valer exactamente 1, y el denominador de x es la raíz (cuando y = 0) mientras el de y es la ordenada (cuando x = 0).`,
          `Pista 3: Dividí toda la igualdad por el término independiente pasado a la derecha para obtener los cortes con el eje X (${aSeg}) y el eje Y (${bSeg}).`,
        ],
        explanation: `Dividiendo ${forms.implicit.text} por el término independiente se obtienen los cortes a = ${aSeg} y b = ${bSeg}: ${forms.segmentary.text}.`,
      };
    }

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 3 · De Segmentaria a Explícita',
      prompt: `Convertí la recta segmentaria ${forms.segmentary.text} a su forma explícita y = mx + b:`,
      inputKind: 'expression',
      requireForm: 'explicit',
      expected: forms.explicit.text,
      placeholder: 'Ej: y = 2/3 x - 2',
      diagContext: {
        target: 'equation',
        m: ratToNumber(forms.explicit.m),
        b: ratToNumber(forms.explicit.b),
      },
      hints: [
        `Pista 1: Recordá que la segmentaria te muestra dos puntos inmediatos: P(${aSeg}; 0) y Q(0; ${bSeg}).`,
        `Pista 2: Podés despejar y multiplicando por ${bSeg}, o calcular la pendiente m = −b/a = ${fmtRat(forms.explicit.m)}.`,
        `Pista 3: Con la pendiente despejada y la ordenada al origen b = ${bSeg}, armá la expresión y = mx + b.`,
      ],
      explanation: `Al despejar y de ${forms.segmentary.text} resulta ${forms.explicit.text}.`,
    };
  }

  // 4. angle_and_point_equation
  if (type === 'angle_and_point_equation') {
    const angleDeg = randChoice(rng, [45, 135]);
    const m = angleDeg === 45 ? 1 : -1;
    const px = randChoice(rng, [-3, -2, -1, 1, 2, 3]);
    const py = randChoice(rng, [-2, 1, 2, 4]);
    const forms = convertLinearForms({ m, b: py - m * px });

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 4 · Ángulo con +X',
      prompt: `Hallá la ecuación explícita de la recta que pasa por P(${px}; ${py}) y forma un ángulo α = ${angleDeg}° con el semieje positivo +X:`,
      inputKind: 'expression',
      requireForm: 'explicit',
      expected: forms.explicit.text,
      placeholder: 'Ej: y = -x + 3',
      diagContext: { target: 'equation', m, b: py - m * px },
      hints: [
        `Pista 1: La pendiente trigonométrica cumple m = tg(α). Calculá tg(${angleDeg}°).`,
        `Pista 2: tg(${angleDeg}°) vale ${m === 1 ? '1' : '−1'}. Ahora solo te falta ajustar la ordenada al origen b.`,
        `Pista 3: Reemplazá el punto P(${px}; ${py}) y la pendiente hallada en y = mx + b para obtener b.`,
      ],
      explanation: `Como m = tg(${angleDeg}°) = ${m} y pasa por (${px}; ${py}), b = ${py - m * px}, resultando ${forms.explicit.text}.`,
    };
  }

  // 5. parallel_perpendicular_parameter
  if (type === 'parallel_perpendicular_parameter') {
    const sub = randChoice(rng, ['perp_point', 'k_param', 'horiz_vert']);
    if (sub === 'horiz_vert') {
      const yConst = randChoice(rng, [-2, 1, 3, 4]);
      const px = randChoice(rng, [-4, -3, 2, 5]);
      const py = randChoice(rng, [-1, 2, 7]);
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 5 · Caso singular H ⊥ V',
        prompt: `Escribí la ecuación de la recta perpendicular a la recta horizontal y = ${yConst} que pasa por el punto (${px}; ${py}):`,
        inputKind: 'expression',
        requireForm: 'vertical',
        expected: `x = ${px}`,
        placeholder: 'Ej: x = -3',
        diagContext: { target: 'vertical_or_horizontal' },
        hints: [
          `Pista 1: La recta y = ${yConst} es completamente horizontal (pendiente m = 0). No uses −1/0 porque dividir por cero es inválido.`,
          `Pista 2: Toda recta perpendicular a una horizontal es una recta vertical donde la abscisa x permanece constante.`,
          `Pista 3: Fijate cuál es la coordenada x del punto de paso (${px}; ${py}) para escribir la ecuación vertical x = constante.`,
        ],
        explanation: `Toda perpendicular a la horizontal y = ${yConst} es vertical; al pasar por (${px}; ${py}), todos sus puntos tienen abscisa constante x = ${px}.`,
      };
    }

    if (sub === 'k_param') {
      // a1*x + b1*y + c1 = 0 perp a2*x + k*y + c2 = 0 => a1*a2 + b1*k = 0 => k = -a1*a2/b1
      const a1 = randChoice(rng, [2, 3, 4]);
      const b1 = randChoice(rng, [-5, -3, -2, 3]);
      const a2 = randChoice(rng, [3, 5, 2]);
      const kRat = ratDiv(ratNeg(ratMul(rat(a1), rat(a2))), rat(b1));
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 5 · Parámetro de perpendicularidad',
        prompt: `Determiná el valor del parámetro k para que las rectas ${a1}x ${b1 >= 0 ? '+ ' + b1 : '− ' + Math.abs(b1)}y − 2 = 0 y ${a2}x + ky + 7 = 0 sean perpendiculares:`,
        inputKind: 'number',
        expected: fmtRat(kRat, { asciiMinus: true }),
        placeholder: 'Ej: 15/4',
        diagContext: { target: 'perp_param', expectedK: ratToNumber(kRat) },
        hints: [
          `Pista 1: Despejá la pendiente de cada recta en función de los coeficientes: m₁ = −A₁/B₁ y m₂ = −A₂/k.`,
          `Pista 2: La condición m₁ · m₂ = −1 equivale a la relación ortogonal A₁·A₂ + B₁·B₂ = 0, es decir (${a1})(${a2}) + (${b1})·k = 0.`,
          `Pista 3: Despejá k pasando el producto ${a1 * a2} al otro miembro y dividiendo por ${b1} con su signo.`,
        ],
        explanation: `Exigiendo m₁·m₂ = −1 (o A₁A₂ + B₁B₂ = 0) queda ${a1 * a2} + (${b1})k = 0, de donde k = ${fmtRat(kRat)}.`,
      };
    }

    const mNum = randChoice(rng, [-2, 2, 3]);
    const mDen = randChoice(rng, [1, 2, 3]);
    const m1 = rat(mNum, mDen);
    const b1 = randChoice(rng, [-2, 1, 4]);
    const px = randChoice(rng, [-2, 2, 3, 4]);
    const py = randChoice(rng, [-1, 1, 3, 5]);
    const perp = perpendicularLineThrough({ m: m1, b: b1 }, { x: px, y: py });
    const l1 = convertLinearForms({ m: m1, b: b1 });

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 5 · Recta perpendicular',
      prompt: `Hallá la ecuación explícita de la recta perpendicular a ${l1.implicit.text} que pasa por B(${px}; ${py}):`,
      inputKind: 'expression',
      requireForm: 'explicit',
      expected: perp.explicit.text,
      placeholder: 'Ej: y = 1/2 x + 2',
      diagContext: { target: 'parallel_perp', refSlope: ratToNumber(m1) },
      hints: [
        `Pista 1: Pasá primero ${l1.implicit.text} a forma explícita para leer su pendiente m₁ = ${fmtRat(m1)}.`,
        `Pista 2: Invertí la fracción y cambiá el signo para obtener m₂ = −1/m₁ = ${fmtRat(perp.explicit.m)}.`,
        `Pista 3: Reemplazá B(${px}; ${py}) y la pendiente perpendicular m₂ en y = m₂x + b para despejar b.`,
      ],
      explanation: `De m₁ = ${fmtRat(m1)} sale m₂ = ${fmtRat(perp.explicit.m)}. Pasando por (${px}; ${py}) queda ${perp.explicit.text}.`,
    };
  }

  // 6. mediatriz_segment
  if (type === 'mediatriz_segment') {
    const mx = randChoice(rng, [-1, 0, 1, 2]);
    const my = randChoice(rng, [1, 2, 3]);
    const dxHalf = randChoice(rng, [1, 2, 3]);
    const dyHalf = randChoice(rng, [1, 2, 3]);
    const p1 = { x: mx + dxHalf, y: my - dyHalf };
    const p2 = { x: mx - dxHalf, y: my + dyHalf };
    const med = perpendicularBisector(p1, p2);

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 6 · Mediatriz de PQ',
      prompt: `Escribí en forma explícita la ecuación de la mediatriz del segmento determinado por P(${p1.x}; ${p1.y}) y Q(${p2.x}; ${p2.y}):`,
      inputKind: 'expression',
      requireForm: 'explicit',
      expected: med.explicit.text,
      placeholder: 'Ej: y = 1/3 x + 3',
      diagContext: { target: 'mediatriz', p1, p2 },
      hints: [
        `Pista 1: La mediatriz necesita dos datos: el punto medio M del segmento PQ y la pendiente perpendicular a PQ.`,
        `Pista 2: El punto medio es M = ((${p1.x}+${p2.x})/2; (${p1.y}+${p2.y})/2) = (${mx}; ${my}), y la pendiente del segmento es m_PQ = ${fmtRat(med.segmentSlope)}.`,
        `Pista 3: Usá la pendiente perpendicular −1/m_PQ = ${fmtRat(med.explicit.m)} y hacé pasar la recta por M(${mx}; ${my}) (no por P ni por Q).`,
      ],
      explanation: `M = (${mx}; ${my}) y m_PQ = ${fmtRat(med.segmentSlope)} ⇒ m_⊥ = ${fmtRat(med.explicit.m)}. La mediatriz es ${med.explicit.text}.`,
    };
  }

  // 7. point_line_distance_exact
  if (type === 'point_line_distance_exact') {
    const cases = [
      { p: { x: 4, y: 2 }, line: 'y = 2x - 1' },
      { p: { x: 3, y: 1 }, line: '3x + 4y - 3 = 0' },
      { p: { x: -1, y: 4 }, line: '3x - 4y + 9 = 0' },
      { p: { x: 2, y: -1 }, line: 'y = 3x + 3' },
      { p: { x: 1, y: 5 }, line: '5x - 12y + 3 = 0' },
    ];
    const picked = randChoice(rng, cases);
    const dist = pointLineDistance(picked.p, picked.line);

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 7 · Distancia Punto-Recta',
      prompt: `Calculá la distancia exacta (en enteros, fracción o radical exacto tipo sqrt(5)) desde P(${picked.p.x}; ${picked.p.y}) hasta la recta ${picked.line}:`,
      inputKind: 'radical',
      expected: fmtExactRadical(dist.exactRadical, { asciiMinus: true }),
      placeholder: 'Ej: sqrt(5) o 2',
      diagContext: {
        target: 'distance',
        numeratorAbs: ratToNumber(dist.numeratorAbs),
        expectedSquared: ratToNumber(dist.numeratorAbs) ** 2 / ratToNumber(dist.denomSq),
      },
      hints: [
        `Pista 1: Escribí la recta en forma implícita Ax + By + C = 0 y aplicá d(P; r) = |Ax₀ + By₀ + C| / √(A² + B²).`,
        `Pista 2: Al evaluar |Ax₀ + By₀ + C| en P(${picked.p.x}; ${picked.p.y}) obtenés ${fmtRat(dist.numeratorAbs)}, y debajo de la raíz queda A² + B² = ${fmtRat(dist.denomSq)}.`,
        `Pista 3: Simplificá el cociente y racionalizá el denominador si contiene una raíz (multiplicando arriba y abajo por ese mismo radical).`,
      ],
      explanation: `Evaluando |Ax₀ + By₀ + C| / √(A² + B²) en P(${picked.p.x}; ${picked.p.y}) obtenemos d = ${dist.text}.`,
    };
  }

  // 8. piecewise_linear_eval_and_image
  const kShift = randChoice(rng, [-2, -1, 0, 1, 2]);
  const constH = randChoice(rng, [2, 3, 4]);
  const pieces = [
    { m: -2, b: kShift, minX: -Infinity, maxX: 0, minInclusive: false, maxInclusive: false },
    { m: 0, b: constH, minX: 0, maxX: 4, minInclusive: true, maxInclusive: false },
    { m: 0.5, b: 3, minX: 4, maxX: Infinity, minInclusive: true, maxInclusive: false },
  ];
  const study = analyzePiecewiseLinear(pieces);

  return {
    seed,
    type,
    competencyId: typeObj.competencyId,
    badge: 'Familia 8 · Imagen de tramos lineales',
    prompt: `Considerá f(x) = −2x ${kShift >= 0 ? '+ ' + kShift : '− ' + Math.abs(kShift)} si x < 0; ${constH} si 0 ≤ x < 4; (1/2)x + 3 si x ≥ 4. ¿Cuál es el conjunto Imagen Im(f) en notación de Exactas?`,
    inputKind: 'interval',
    expected: `(${kShift}; +inf)`,
    placeholder: 'Ej: (-1; +inf)',
    diagContext: { target: 'piecewise_image', openBoundary: String(kShift) },
    hints: [
      `Pista 1: Analizá la imagen de cada tramo por separado y luego uní los tres conjuntos sobre el eje Y.`,
      `Pista 2: El primer tramo (−2x ${kShift >= 0 ? '+ ' + kShift : '− ' + Math.abs(kShift)}) para x < 0 decrece hacia ${kShift} sin tocarlo (paréntesis abierto en ${kShift}) y sube hasta +∞.`,
      `Pista 3: Como los otros dos tramos ({${constH}} y [5; +∞)) ya quedan dentro de ese intervalo abierto, decidí si ${kShift} lleva paréntesis abierto o corchete cerrado.`,
    ],
    explanation: `El tramo izquierdo cubre (${kShift}; +∞) con extremo abierto en ${kShift}, absorbiendo a los otros dos tramos: Im(f) = ${study.image}.`,
  };
}

export function generateLinearChallenge(seed = 2026, forcedType = 'all', problemIndex = 0) {
  return _generateLinearChallengeRaw(seed, forcedType, problemIndex);
}

export function generateLinearChallenges(seed = 2026, count = 8, forcedType = 'all') {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(_generateLinearChallengeRaw(seed, forcedType, i));
  }
  return out;
}

export const makeChallenge = generateLinearChallenge;
export const makeChallenges = generateLinearChallenges;

/* ==========================================================================
   Las 5 Trampas Clásicas de Examen (Unit 03 · Lineal)
   ========================================================================== */

export const TRAPS = [
  {
    id: 'trap-dx-over-dy',
    title: 'Trampa 1 · Pendiente invertida (Δx / Δy)',
    competencyId: 'linear.definition_slope_and_intercept',
    badge: 'Error frecuente',
    prompt:
      'Un estudiante busca la pendiente de la recta que pasa por P(1; 2) y Q(3; 8). Como Δx = 2 y Δy = 6, responde m = 2/6 = 1/3. ¿Por qué está mal y cuál es la pendiente real?',
    options: [
      { label: 'm = 1/3 es correcto porque en el par ordenado la x aparece primero.', correct: false, diagnosticId: 'inverted_slope_dx_over_dy' },
      { label: 'Invirtió la fórmula: m = Δy / Δx = (8 − 2) / (3 − 1) = 6 / 2 = 3.', correct: true },
      { label: 'La pendiente es −3 porque hay que restar al revés abajo.', correct: false, diagnosticId: 'sign_error_in_slope_subtraction' },
    ],
    hints: [
      'Recordá qué mide la pendiente: cuánto cambia la altura y por cada unidad que avanza x.',
      'Δy = 8 − 2 = 6 y Δx = 3 − 1 = 2; poné la variación vertical arriba y la horizontal abajo.',
      'Dividí el cambio en y por el cambio en x para elegir la opción correcta.',
    ],
    wrongSteps: ['Calculó Δx = 3 − 1 = 2 y Δy = 8 − 2 = 6.', 'Escribió Δx / Δy = 2/6 = 1/3.'],
    rightSteps: ['Identificó Δy = 6 en el numerador y Δx = 2 en el denominador.', 'm = Δy / Δx = 6 / 2 = 3.'],
    explanation: 'La pendiente siempre es Δy / Δx = 6/2 = 3 (sube 3 unidades en y por cada 1 que avanza en x).',
  },
  {
    id: 'trap-perp-no-sign',
    title: 'Trampa 2 · Perpendicular sin cambiar el signo (+1/m o −m)',
    competencyId: 'linear.parallel_perpendicular_and_incidence',
    badge: 'Parcial Simulacro 2019',
    prompt:
      'Se pide una recta perpendicular a x/2 + y/3 = 1 (cuya pendiente es m₁ = −3/2). En el apuro, un alumno usa m₂ = 3/2 o m₂ = 2/3. ¿Cuál es la única pendiente perpendicular correcta?',
    options: [
      { label: 'm₂ = 2/3 (inversa y con signo cambiado respecto de −3/2, dando (−3/2)·(2/3) = −1).', correct: true },
      { label: 'm₂ = −2/3 (se da vuelta la fracción manteniendo el signo negativo).', correct: false, diagnosticId: 'confused_parallel_with_perpendicular' },
      { label: 'm₂ = 3/2 (basta cambiar el signo menos por más).', correct: false, diagnosticId: 'confused_parallel_with_perpendicular' },
    ],
    hints: [
      'Dos rectas oblicuas son perpendiculares únicamente cuando el producto de sus pendientes vale −1.',
      'Verificá el producto (−3/2) · m₂ para cada candidata: dos negativos darían producto positivo.',
      'Elegí la opción donde se invierte la fracción Y se cambia el signo para obtener producto −1.',
    ],
    wrongSteps: ['De m₁ = −3/2 solo cambió el signo (+3/2) o solo invirtió (−2/3).', 'El producto dio −9/4 o +1, distinto de −1.'],
    rightSteps: ['Invirtió −3/2 a −2/3 y cambió el signo a +2/3.', 'Comprobó (−3/2)·(2/3) = −1.'],
    explanation: 'La perpendicular exige m₂ = −1/m₁ = +2/3. Hacer una sola de las dos operaciones rompe el ángulo de 90°.',
  },
  {
    id: 'trap-segmentary-zero',
    title: 'Trampa 3 · Segmentaria prohibida (c = 0, a = 0 o b = 0)',
    competencyId: 'linear.angle_and_three_equation_forms',
    badge: 'Caso degenerado',
    prompt:
      'Querés pasar la recta 3x − 2y = 0 a forma segmentaria x/a + y/b = 1. ¿Cuál de estas respuestas es matemáticamente válida?',
    options: [
      { label: 'x/3 + y/(−2) = 1.', correct: false, diagnosticId: 'segmentary_invalid_zero_case' },
      { label: 'x/0 + y/0 = 1 porque pasa por (0; 0).', correct: false, diagnosticId: 'segmentary_invalid_zero_case' },
      { label: 'No existe forma segmentaria: al pasar por (0; 0) ambos cortes valen 0 y no se puede dividir por cero.', correct: true },
    ],
    hints: [
      'En x/a + y/b = 1, "a" es el corte con el eje X y "b" es el corte con el eje Y.',
      'Probá reemplazar y = 0 en 3x − 2y = 0: obtenés x = 0, y al intentar igualar a 1 dividiendo por 0 se indefine.',
      'Seleccioná la respuesta que reconoce la inexistencia de forma segmentaria cuando c = 0.',
    ],
    wrongSteps: ['Tomó los coeficientes 3 y −2 como denominadores o dividió por 0.', 'Obtuvo una recta distinta que pasa por (3; 0) y (0; −2).'],
    rightSteps: ['Verificó que 3(0) − 2(0) = 0: la recta cruza el origen.', 'Concluyó que la forma segmentaria no existe cuando c = 0.'],
    explanation: 'Solo las rectas que cortan ambos ejes fuera del origen (A ≠ 0, B ≠ 0, C ≠ 0) admiten forma segmentaria.',
  },
  {
    id: 'trap-mediatriz-endpoint',
    title: 'Trampa 4 · Mediatriz pasando por P en lugar del punto medio M',
    competencyId: 'linear.analytic_geometry_distance_midpoint_bisector',
    badge: 'Ej. 8a UNMDP',
    prompt:
      'Para hallar la mediatriz de P(1; 0) y Q(−1; 6), alguien calcula m_PQ = −3, invierte bien a m_⊥ = 1/3, pero la hace pasar por P(1; 0) dando y = (1/3)x − 1/3. ¿Qué condición olvidó?',
    options: [
      { label: 'La pendiente perpendicular debería ser +3, no 1/3.', correct: false, diagnosticId: 'confused_parallel_with_perpendicular' },
      { label: 'La mediatriz debe pasar obligatoriamente por el punto medio M(0; 3), resultando y = (1/3)x + 3.', correct: true },
      { label: 'Debe pasar por Q(−1; 6) en vez de P.', correct: false, diagnosticId: 'mediatriz_missing_midpoint_or_perp' },
    ],
    hints: [
      'Una mediatriz no es cualquier perpendicular al segmento: debe dividirlo en dos mitades iguales.',
      'Calculá el punto medio M = ((1 + (−1))/2; (0 + 6)/2) = (0; 3).',
      'Evaluá qué ordenada al origen b aparece cuando exigís que la perpendicular de pendiente 1/3 pase por M.',
    ],
    wrongSteps: ['Reemplazó el extremo P(1; 0) en y = (1/3)x + b.', 'Obtuvo una perpendicular que no equidista de P y Q.'],
    rightSteps: ['Calculó el punto medio M = (0; 3).', 'Usó m_⊥ = 1/3 y M(0; 3) para obtener y = (1/3)x + 3.'],
    explanation: 'La mediatriz es perpendicular a PQ Y pasa por su punto medio M = (0; 3); así todo punto sobre ella equidista de P y Q.',
  },
  {
    id: 'trap-piecewise-open-bracket',
    title: 'Trampa 5 · Corchete cerrado en borde abierto por tramos',
    competencyId: 'linear.modeling_and_piecewise',
    badge: 'Ej. 10 UNMDP',
    prompt:
      'En f(x) = −2x − 1 si x < 0; 3 si 0 ≤ x < 4; (1/2)x + 3 si x ≥ 4, el tramo izquierdo tiende a −1 cuando x → 0⁻. Al escribir la imagen, un alumno pone Im(f) = [−1; +∞). ¿Por qué es incorrecto?',
    options: [
      { label: 'Porque en x = 0 la función vale 3 y nunca −1: el tramo x < 0 es estricto, así que Im(f) = (−1; +∞) con paréntesis abierto.', correct: true },
      { label: 'Porque −1 pertenece a f(0) y debe ir en conjunto aparte.', correct: false, diagnosticId: 'piecewise_boundary_inclusion_error' },
      { label: 'Porque la imagen es [3; +∞).', correct: false, diagnosticId: 'piecewise_boundary_inclusion_error' },
    ],
    hints: [
      'Preguntate: ¿existe algún número real x tal que f(x) = −1?',
      'Para x < 0 tenés −2x − 1 > −1 estricto; en x = 0 vale f(0) = 3; y para x ≥ 4 arranca en 5.',
      'Elegí la notación con el paréntesis correcto en el extremo −1.',
    ],
    wrongSteps: ['Evaluó −2(0) − 1 = −1 ignorando la condición estricta x < 0.', 'Cerró el corchete [−1; +∞).'],
    rightSteps: ['Verificó que ningún x cumple f(x) = −1 porque x = 0 entra en el segundo tramo (f(0) = 3).', 'Dejó el borde abierto: Im(f) = (−1; +∞).'],
    explanation: 'El borde x = 0 está excluido de la rama −2x − 1, por lo que −1 es cota inferior no alcanzada y lleva paréntesis abierto: (−1; +∞).',
  },
];

/* ==========================================================================
   Montaje del Entrenador Contrastivo + Trampas (#sec-retos)
   ========================================================================== */

export function selectAdaptiveLinearFamily({
  store = getProgressStore(),
  now = new Date(),
  previousCompetencyId = null,
} = {}) {
  return selectAdaptiveExercise({
    moduleId: LINEAR_MODULE_ID,
    availableExercises: CHALLENGE_TYPES,
    store,
    now,
    previousCompetencyId,
  });
}

export function mountLinearRetos(host) {
  if (!host) return null;
  clear(host);

  let activeTab = 'prng';
  let currentSeed = 2026;
  let currentMode = 'adaptativo';
  let streak = 0;
  let previousCompetencyId = null;

  const tabBar = h('div', { class: 'lin-retos-tabs pr-chip-row' });
  const btnTabPrng = h('button', { type: 'button', class: 'pr-chip is-active' }, '1. Entrenador Infinito por Semilla PRNG (8 Familias)');
  const btnTabTraps = h('button', { type: 'button', class: 'pr-chip' }, '2. Las 5 Trampas Clásicas de Examen');
  tabBar.append(btnTabPrng, btnTabTraps);

  const panelPrng = h('div', { class: 'lin-retos-panel' });
  const panelTraps = h('div', { class: 'lin-retos-panel', hidden: '' });

  // --- Toolbar PRNG ---
  const seedInput = h('input', {
    type: 'number',
    value: String(currentSeed),
    min: '1',
    max: '9999999',
    'aria-label': 'Semilla PRNG',
  });
  const familySelect = h('select', { class: 'lin-family-select', 'aria-label': 'Modo o familia de ejercicios' }, [
    h('option', { value: 'adaptativo', selected: true }, 'Inteligente (Según tu evidencia)'),
    h('option', { value: 'all' }, 'Todas las familias (Mezcla por semilla)'),
    ...CHALLENGE_TYPES.map((t) => h('option', { value: t.id }, t.label)),
  ]);
  const btnNewSeed = h('button', { type: 'button', class: 'pr-btn' }, [chalkIcon('spark', 14), ' Nueva semilla']);
  const btnGen = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [chalkIcon('reset', 14), ' Regenerar']);
  const streakPill = h('div', { class: 'exp-trainer-progress-pill' }, 'Racha independiente: 0');
  const adaptiveBanner = h('div', { class: 'lin-adaptive-reason muted small' });
  const cascadeList = h('div', { class: 'exp-challenges-cascade' });

  const toolbar = h('div', { class: 'exp-trainer-toolbar' }, [
    h('label', { class: 'exp-trainer-field' }, [h('span', null, 'Semilla determinista'), seedInput]),
    h('label', { class: 'exp-trainer-field exp-trainer-field--grow' }, [h('span', null, 'Familia / Selección'), familySelect]),
    h('div', { class: 'exp-trainer-toolbar__btns' }, [btnNewSeed, btnGen]),
    streakPill,
  ]);

  panelPrng.append(toolbar, adaptiveBanner, cascadeList);

  function renderPrngChallengeCard(ch, idx) {
    let hintsUsed = 0;
    let solutionRevealed = false;
    let solved = false;

    const card = h('article', { class: 'exp-challenge-card', 'data-challenge-idx': String(idx) });
    const statusBadge = h('span', { class: 'exp-challenge-card__status' }, 'Pendiente');
    const header = h('div', { class: 'exp-challenge-card__header' }, [
      h('span', { class: 'exp-challenge-card__badge' }, `Reto ${idx + 1} · ${ch.badge}`),
      h('span', { class: 'exp-challenge-card__family' }, ch.competencyId),
      statusBadge,
    ]);

    const prompt = h('p', { class: 'lin-reto-prompt' }, ch.prompt);
    const input = h('input', {
      type: 'text',
      class: 'pr-check-input',
      placeholder: ch.placeholder,
      'aria-label': ch.prompt,
    });
    const btnCheck = h('button', { type: 'button', class: 'pr-btn' }, [chalkIcon('check', 14), ' Comprobar']);
    const btnHint = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [chalkIcon('bulb', 14), ' Pista (0/3)']);
    const btnSol = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [chalkIcon('spark', 14), ' Ver solución explicada']);
    const hintsBox = h('div', { class: 'lin-reto-hints', hidden: '' });
    const feedback = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });

    const updateStreakUI = () => {
      streakPill.textContent = `Racha independiente: ${streak}`;
    };

    const finishSuccess = (isSol = false) => {
      const independent = !isSol && hintsUsed === 0 && !solutionRevealed;
      if (isSol) {
        solutionRevealed = true;
        streak = 0;
        statusBadge.textContent = 'Solución vista';
        statusBadge.className = 'exp-challenge-card__status is-solution';
      } else if (independent) {
        streak += 1;
        statusBadge.textContent = 'Logro independiente';
        statusBadge.className = 'exp-challenge-card__status is-solved-indep';
      } else {
        statusBadge.textContent = 'Logro asistido';
        statusBadge.className = 'exp-challenge-card__status is-solved-assisted';
      }
      updateStreakUI();

      card.classList.add('is-solved');
      input.value = String(ch.expected);
      input.disabled = true;
      btnCheck.disabled = true;
      btnHint.disabled = true;
      btnSol.disabled = true;
      feedback.className = 'pr-check-feedback is-ok';
      feedback.replaceChildren(
        chalkIcon(independent ? 'spark' : 'bulb', 14),
        h('strong', {}, isSol ? ' Solución explicada: ' : independent ? ' ¡Excelente! ' : ' Resuelto con ayuda: '),
        h('span', {}, ch.explanation)
      );

      if (!solved) {
        solved = true;
        try {
          recordLinearAttempt({
            exerciseId: `reto-${ch.type}-${ch.seed}-${idx}`,
            competencyId: ch.competencyId,
            correct: true,
            mode: independent ? 'independent' : 'assisted',
            hintsUsed,
            solutionRevealed: isSol,
            diagnosticId: null,
            representation: 'symbolic',
            stage: 'retrieval',
            transferDistance: 'near',
          });
        } catch {}
        notifyCompetencyDashboardUpdate();
      }
    };

    const verify = () => {
      const raw = input.value.trim();
      if (!raw) {
        feedback.className = 'pr-check-feedback is-warn';
        feedback.textContent = 'Ingresá tu respuesta antes de comprobar.';
        return;
      }

      let isOk = false;
      let syntaxErr = null;
      let equivalentWrongForm = false;

      try {
        if (ch.inputKind === 'number') {
          isOk = Math.abs(parseNumberOrFraction(raw) - parseNumberOrFraction(ch.expected)) < 1e-6;
        } else if (ch.inputKind === 'radical') {
          isOk = exactRadicalEq(parseExactRadical(raw), parseExactRadical(ch.expected));
        } else if (ch.inputKind === 'pair') {
          const pu = parseOrderedPair(raw);
          const pe = parseOrderedPair(ch.expected);
          isOk = Math.abs(pu.x - pe.x) < 1e-6 && Math.abs(pu.y - pe.y) < 1e-6;
        } else if (ch.inputKind === 'set' || ch.inputKind === 'interval') {
          isOk = equivalentSetExactas(raw, ch.expected);
        } else {
          const eq = equivalentLineEquation(raw, ch.expected, ch.requireForm || null);
          if (eq.status === 'syntax_error') syntaxErr = eq.error;
          else if (eq.equivalent && eq.sameForm) isOk = true;
          else if (eq.equivalent && !eq.sameForm) equivalentWrongForm = true;
        }
      } catch (err) {
        if (err.code === 'comma_instead_of_semicolon') {
          const d = DIAGNOSE_REACTIONS.comma_instead_of_semicolon;
          feedback.className = 'pr-check-feedback is-error';
          feedback.textContent = d.text;
          vnReact({ pose: d.pose, tag: d.tag, html: d.text });
          return;
        }
        syntaxErr = err.message;
      }

      if (syntaxErr) {
        feedback.className = 'pr-check-feedback is-warn';
        feedback.textContent = syntaxErr;
        return;
      }
      if (equivalentWrongForm) {
        const d = DIAGNOSE_REACTIONS.equivalent_form;
        feedback.className = 'pr-check-feedback is-warn';
        feedback.textContent = d.text;
        vnReact({ pose: d.pose, tag: d.tag, html: d.text });
        return;
      }
      if (isOk) {
        playSuccess();
        finishSuccess(false);
        if (STREAK_REACTIONS[streak]) {
          const r = STREAK_REACTIONS[streak];
          vnReact({ pose: r.pose, tag: r.tag, html: r.text });
        }
        return;
      }

      playError();
      streak = 0;
      updateStreakUI();
      const diag = diagnoseLinear(raw, { ...(ch.diagContext || {}), kind: ch.inputKind, requireForm: ch.requireForm });
      try {
        recordLinearAttempt({
          exerciseId: `reto-${ch.type}-${ch.seed}-${idx}`,
          competencyId: ch.competencyId,
          correct: false,
          mode: hintsUsed === 0 ? 'independent' : 'assisted',
          hintsUsed,
          solutionRevealed: false,
          diagnosticId: diag?.id || null,
          representation: 'symbolic',
          stage: 'retrieval',
          transferDistance: 'near',
        });
      } catch {}
      notifyCompetencyDashboardUpdate();

      feedback.className = 'pr-check-feedback is-error';
      if (diag) {
        feedback.textContent = diag.message;
        vnReact({ pose: diag.pose, tag: diag.tag, html: diag.message });
      } else {
        feedback.textContent = 'Todavía no coincide. Probá abrir una pista progresiva.';
      }
    };

    btnCheck.addEventListener('click', verify);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        verify();
      }
    });
    btnHint.addEventListener('click', () => {
      playClick();
      if (hintsUsed < ch.hints.length) {
        hintsBox.removeAttribute('hidden');
        hintsBox.appendChild(h('div', { class: 'lin-hint-item' }, ch.hints[hintsUsed]));
        hintsUsed += 1;
        btnHint.textContent = hintsUsed < 3 ? `Pista (${hintsUsed}/3)` : 'Pistas completas';
      }
    });
    btnSol.addEventListener('click', () => {
      playClick();
      finishSuccess(true);
      const r = STREAK_REACTIONS.showSolution;
      vnReact({ pose: r.pose, tag: r.tag, html: r.text });
    });

    card.append(
      header,
      prompt,
      h('div', { class: 'exp-challenge-card__input-row' }, [input]),
      h('div', { class: 'exp-check__actions' }, [btnCheck, btnHint, btnSol]),
      hintsBox,
      feedback
    );
    return card;
  }

  function renderCascade() {
    clear(cascadeList);
    let chosenFamily = currentMode;
    if (currentMode === 'adaptativo') {
      try {
        getLinearCompetencyReport();
        const selection = selectAdaptiveLinearFamily({
          store: getProgressStore(),
          now: new Date(),
          previousCompetencyId,
        });
        chosenFamily = selection?.exercise?.id || 'all';
        if (selection?.targetCompetencyId || selection?.exercise?.competencyId) {
          previousCompetencyId = selection.targetCompetencyId || selection.exercise.competencyId;
        }
        adaptiveBanner.textContent = selection?.selectionReason
          ? `Selección inteligente: ${selection.selectionReason}${selection?.exercise?.label ? ` · ${selection.exercise.label}` : ''}`
          : 'Modo adaptativo: combinando las 8 familias según tu historial.';
      } catch {
        chosenFamily = 'all';
        adaptiveBanner.textContent = 'Modo adaptativo: recorriendo las 8 familias curriculares.';
      }
    } else {
      adaptiveBanner.textContent = `Semilla #${currentSeed} · Modo ${currentMode === 'all' ? 'Mixto (8 familias)' : currentMode}`;
    }

    const list = generateLinearChallenges(currentSeed, 8, chosenFamily);
    list.forEach((ch, idx) => cascadeList.appendChild(renderPrngChallengeCard(ch, idx)));
  }

  // --- Pestaña 2: Las 5 Trampas Clásicas ---
  TRAPS.forEach((trap, idx) => {
    let hintsUsed = 0;
    const card = h('article', { class: 'lin-reto-card', 'data-trap-id': trap.id });
    const head = h('div', { class: 'pr-check-head' }, [
      h('span', { class: 'lin-reto-badge' }, trap.title),
      h('span', { class: 'lin-comp-tag' }, trap.badge),
    ]);
    const prompt = h('p', { class: 'lin-reto-prompt' }, trap.prompt);
    const optsBox = h('div', { class: 'lin-trap-options' });
    const hintsBox = h('div', { class: 'lin-reto-hints', hidden: '' });
    const feedback = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });
    const compareBox = h('div', { class: 'lin-trap-compare', hidden: '' }, [
      h('div', { class: 'lin-trap-col is-wrong' }, [
        h('div', { class: 'lin-trap-col-head' }, [chalkIcon('anger', 14), ' Trampa habitual']),
        h('ul', { class: 'lin-trap-steps' }, trap.wrongSteps.map((s) => h('li', {}, s))),
      ]),
      h('div', { class: 'lin-trap-col is-right' }, [
        h('div', { class: 'lin-trap-col-head' }, [chalkIcon('check', 14), ' Camino riguroso']),
        h('ul', { class: 'lin-trap-steps' }, trap.rightSteps.map((s) => h('li', {}, s))),
      ]),
    ]);

    const btnHint = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [chalkIcon('bulb', 14), ' Pista (0/3)']);
    btnHint.addEventListener('click', () => {
      playClick();
      if (hintsUsed < trap.hints.length) {
        hintsBox.removeAttribute('hidden');
        hintsBox.appendChild(h('div', { class: 'lin-hint-item' }, trap.hints[hintsUsed]));
        hintsUsed += 1;
        btnHint.textContent = hintsUsed < 3 ? `Pista (${hintsUsed}/3)` : 'Pistas completas';
      }
    });

    trap.options.forEach((opt) => {
      const btn = h('button', { type: 'button', class: 'pr-option' }, opt.label);
      btn.addEventListener('click', () => {
        for (const b of optsBox.querySelectorAll('.pr-option')) {
          b.classList.remove('is-selected', 'is-correct', 'is-wrong');
        }
        btn.classList.add('is-selected');
        if (opt.correct) {
          playSuccess();
          btn.classList.add('is-correct');
          compareBox.removeAttribute('hidden');
          feedback.className = 'pr-check-feedback is-ok';
          feedback.textContent = trap.explanation;
          vnReact({ pose: 'lentes-brillo', tag: 'Trampa desactivada', html: trap.explanation });
          try {
            recordLinearAttempt({
              exerciseId: `trap-${trap.id}`,
              competencyId: trap.competencyId,
              correct: true,
              mode: hintsUsed === 0 ? 'independent' : 'assisted',
              hintsUsed,
              solutionRevealed: false,
              representation: 'verbal',
              stage: 'transfer',
              transferDistance: 'far',
            });
          } catch {}
        } else {
          playError();
          btn.classList.add('is-wrong');
          const d = DIAGNOSE_REACTIONS[opt.diagnosticId];
          feedback.className = 'pr-check-feedback is-error';
          feedback.textContent = d ? d.text : 'Caíste en la trampa. Revisá el contraste con las pistas.';
          if (d) vnReact({ pose: d.pose, tag: d.tag, html: d.text });
        }
      });
      optsBox.appendChild(btn);
    });

    card.append(head, prompt, optsBox, h('div', { class: 'pr-chip-row' }, [btnHint]), hintsBox, feedback, compareBox);
    panelTraps.appendChild(card);
  });

  btnTabPrng.addEventListener('click', () => {
    playClick();
    activeTab = 'prng';
    btnTabPrng.classList.add('is-active');
    btnTabTraps.classList.remove('is-active');
    panelPrng.hidden = false;
    panelTraps.hidden = true;
  });

  btnTabTraps.addEventListener('click', () => {
    playClick();
    activeTab = 'traps';
    btnTabTraps.classList.add('is-active');
    btnTabPrng.classList.remove('is-active');
    panelTraps.hidden = false;
    panelPrng.hidden = true;
  });

  seedInput.addEventListener('change', () => {
    const n = parseInt(seedInput.value, 10);
    if (Number.isFinite(n) && n > 0) {
      currentSeed = n;
      renderCascade();
    }
  });
  familySelect.addEventListener('change', () => {
    currentMode = familySelect.value;
    renderCascade();
  });
  btnNewSeed.addEventListener('click', () => {
    playClick();
    currentSeed = Math.floor(1000 + Math.random() * 90000);
    seedInput.value = String(currentSeed);
    renderCascade();
  });
  btnGen.addEventListener('click', () => {
    playClick();
    currentSeed += 1;
    seedInput.value = String(currentSeed);
    renderCascade();
  });

  host.append(tabBar, panelPrng, panelTraps);
  renderCascade();
  return { regenerate: renderCascade };
}

export const initRetosModule = mountLinearRetos;
