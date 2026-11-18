/**
 * @file js/modules/logaritmicas/retos.js
 * Entrenador Determinista PRNG (Mulberry32) con 10 familias generativas
 * cubriendo el 100% de las 5 competencias + 5 Trampas Clásicas de Examen.
 * Unidad 09: Funciones y Ecuaciones Logarítmicas (logaritmicas.html).
 * Cero eval(), cero emojis Unicode, cero fugas en Hint 3, selector adaptativo oficial.
 */

import { h, clear, mount, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { react as vnReact, playScript } from '../../core/vn.js';
import { fmt } from '../../core/math-format.js';
import { selectAdaptiveExercise } from '../../core/learning/exercise-selector.js';
import {
  parseNumberOrFraction,
  parseIntervalExactas,
  equivalentLog,
} from './expr.js';
import {
  approxEq,
  toSimpleFraction,
  diagnoseLog,
  isNonExistencePhrase,
  solveLogEquation,
  solveNonCommonExpEquation,
  solveLogSystem,
  analyzeLogFunction,
  computeInverseExpLog,
  solveRealWorldLogModel,
} from './logic.js';
import { DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import { getCompetencyById } from './competencies-map.js';
import {
  MODULE_ID,
  getProgressStore,
  recordLogAttempt,
} from './learning-adapter.js';
import { notifyCompetencyDashboardUpdate } from './components.js';

export const SEED_STORAGE_KEY = 'logaritmicas:seed';

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

function inlineMathNodes(text) {
  if (typeof text !== 'string') return [String(text ?? '')];
  const parts = text.split(/`([^`]+)`/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? h('span', { class: 'eq' }, part) : document.createTextNode(part),
  );
}

export const CHALLENGE_TYPES = [
  {
    id: 'definicion_y_existencia',
    label: '1. Definición y existencia en ℝ',
    competencyId: 'logarithms.definition_existence_and_special_bases',
    prerequisiteIds: [],
    diagnosticIds: ['non_positive_argument_accepted', 'invalid_log_base_accepted'],
  },
  {
    id: 'conversion_exp_log',
    label: '2. Conversión exp ↔ log y bases especiales',
    competencyId: 'logarithms.definition_existence_and_special_bases',
    prerequisiteIds: [],
    diagnosticIds: ['confused_exp_log_conversion'],
  },
  {
    id: 'propiedades_unificacion',
    label: '3. Propiedades operativas y unificación',
    competencyId: 'logarithms.operative_properties_and_change_of_base',
    prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
    diagnosticIds: ['false_sum_identity_log_a_plus_b', 'false_power_of_whole_log', 'false_quotient_or_product_of_logs'],
  },
  {
    id: 'cambio_de_base_exacto',
    label: '4. Cambio de base exacto',
    competencyId: 'logarithms.operative_properties_and_change_of_base',
    prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
    diagnosticIds: ['inverted_change_of_base'],
  },
  {
    id: 'ecuacion_log_con_filtro',
    label: '5. Ecuaciones logarítmicas con filtro de dominio',
    competencyId: 'logarithms.equations_and_systems',
    prerequisiteIds: ['logarithms.operative_properties_and_change_of_base'],
    diagnosticIds: ['accepted_extraneous_root_in_log_eq', 'non_positive_argument_accepted'],
  },
  {
    id: 'ecuacion_exp_no_comun',
    label: '6. Exponenciales no comunes y sustitución en base e',
    competencyId: 'logarithms.equations_and_systems',
    prerequisiteIds: ['logarithms.operative_properties_and_change_of_base'],
    diagnosticIds: ['accepted_extraneous_root_in_log_eq'],
  },
  {
    id: 'sistema_logaritmico',
    label: '7. Sistemas logarítmicos 2×2',
    competencyId: 'logarithms.equations_and_systems',
    prerequisiteIds: ['logarithms.operative_properties_and_change_of_base'],
    diagnosticIds: ['non_positive_argument_accepted'],
  },
  {
    id: 'inversa_explicita_exp_log',
    label: '8. Función inversa exp ↔ log y dominio restringido',
    competencyId: 'logarithms.function_inverse_and_analysis',
    prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
    diagnosticIds: ['closed_bracket_or_horizontal_asymptote_confusion'],
  },
  {
    id: 'radiografia_log_completa',
    label: '9. Radiografía analítica (Dom, A.V., C₀)',
    competencyId: 'logarithms.function_inverse_and_analysis',
    prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
    diagnosticIds: ['closed_bracket_or_horizontal_asymptote_confusion'],
  },
  {
    id: 'modelo_tiempo_y_escala_richter',
    label: '10. Modelos temporales y escala de Richter',
    competencyId: 'logarithms.real_world_time_and_scale_models',
    prerequisiteIds: ['logarithms.equations_and_systems'],
    diagnosticIds: ['linear_ratio_confusion_in_log_scale'],
  },
];

const CONTRAST_PAIRS = [
  {
    label: 'Sustitución cuadrática: u = eˣ > 0 vs u = log_a(x) ∈ ℝ',
    types: ['ecuacion_exp_no_comun', 'ecuacion_log_con_filtro'],
  },
  {
    label: 'Orientación del argumento: x − h > 0 vs h − x > 0',
    types: ['radiografia_log_completa', 'inversa_explicita_exp_log'],
  },
  {
    label: 'Cambio de base exacto vs unificación de propiedades',
    types: ['cambio_de_base_exacto', 'propiedades_unificacion'],
  },
  {
    label: 'Definición elemental vs modelo no lineal en tiempo/escala',
    types: ['definicion_y_existencia', 'modelo_tiempo_y_escala_richter'],
  },
];

export function generateLogChallenge(seed, forcedType = 'all', problemIndex = 0) {
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

  // 1. Definición y existencia
  if (type === 'definicion_y_existencia') {
    const mode = rng();
    if (mode < 0.35) {
      // Caso negativo / fraccionario exacto: log_a(a^k) = k con k < 0 o log_{1/a}(a^k) = -k
      const base = randChoice(rng, [2, 3, 5]);
      const k = randChoice(rng, [-3, -2, -1, 3, 4]);
      const arg = Math.pow(base, k);
      const argLabel = k < 0 ? `1/${Math.pow(base, -k)}` : String(arg);
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        prerequisiteIds: typeObj.prerequisiteIds,
        family: type,
        representation: 'symbolic',
        difficulty: 1,
        stage: 'retrieval',
        transferDistance: 'near',
        diagnosticIds: typeObj.diagnosticIds,
        badge: 'Familia 1 · Definición Exacta',
        prompt: `Calculá aplicando la definición: \`log_${base}(${argLabel})\``,
        inputKind: 'number',
        expected: k,
        displayAnswer: fmt(k),
        placeholder: 'Ej: -5',
        diagContext: { target: 'definition', base, expected: k },
        hints: [
          `Planteá la pregunta exponencial: ¿a qué exponente y hay que elevar la base ${base} para obtener ${argLabel}?`,
          k < 0
            ? `Recordá que un exponente negativo invierte la base: ${base}^(−n) = 1 / ${base}^n.`
            : `Buscá cuántas veces multiplicás ${base} por sí mismo para llegar a ${argLabel}.`,
          `Escribí el entero correspondiente al exponente de ${base} sin usar signo de logaritmo.`,
        ],
        solution: [
          `Por definición: log_${base}(${argLabel}) = y ⇔ ${base}^y = ${argLabel}.`,
          k < 0
            ? `Como ${argLabel} = ${base}^(${k}), igualamos exponentes.`
            : `Como ${argLabel} = ${base}^${k}, igualamos exponentes.`,
          `El resultado exacto es ${fmt(k)}.`,
        ],
        explanation: `log_${base}(${argLabel}) = ${fmt(k)} porque ${base}^(${fmt(k)}) = ${argLabel}.`,
      };
    }

    if (mode < 0.7) {
      // Base fraccionaria: log_{1/a}(a^m) = -m
      const a = randChoice(rng, [2, 3, 4]);
      const m = randChoice(rng, [2, 3]);
      const arg = Math.pow(a, m);
      const ans = -m;
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        prerequisiteIds: typeObj.prerequisiteIds,
        family: type,
        representation: 'symbolic',
        difficulty: 2,
        stage: 'guided_practice',
        transferDistance: 'near',
        diagnosticIds: typeObj.diagnosticIds,
        badge: 'Familia 1 · Base Fraccionaria',
        prompt: `Calculá por definición: \`log_(1/${a})(${arg})\``,
        inputKind: 'number',
        expected: ans,
        displayAnswer: fmt(ans),
        placeholder: 'Ej: -5',
        diagContext: { target: 'definition', base: 1 / a, expected: ans },
        hints: [
          `Escribí la ecuación equivalente: (1/${a})^y = ${arg}.`,
          `Expresá ambos miembros como potencia de ${a}: (${a}^(−1))^y = ${a}^${m}.`,
          `Despejá y multiplicando los exponentes de igual base (cuidado con el signo negativo al invertir la fracción).`,
        ],
        solution: [
          `Planteamos (1/${a})^y = ${arg}.`,
          `Reescribimos ${a}^(−y) = ${a}^${m}.`,
          `Igualando exponentes: −y = ${m} ⇒ y = ${fmt(ans)}.`,
        ],
        explanation: `Como (1/${a})^(${fmt(ans)}) = ${a}^${m} = ${arg}, el logaritmo vale ${fmt(ans)}.`,
      };
    }

    // Falla de existencia (x <= 0 o a = 1)
    const isBaseOne = rng() < 0.5;
    const exprText = isBaseOne ? 'log_1(5)' : 'log_3(−9)';
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      prerequisiteIds: typeObj.prerequisiteIds,
      family: type,
      representation: 'verbal',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: typeObj.diagnosticIds,
      badge: 'Familia 1 · Aduana de Existencia',
      prompt: `¿Cuánto vale \`${exprText}\` en los números reales ℝ? (Si no existe, escribí \`no existe\`)`,
      inputKind: 'existence',
      expected: 'no_existe',
      displayAnswer: 'No existe en ℝ',
      placeholder: 'Ej: 4',
      diagContext: {
        target: isBaseOne ? 'base' : 'argument',
        expectDoesNotExist: true,
        expected: 'no_existe',
      },
      hints: [
        isBaseOne
          ? 'Revisá la condición de la base en la definición formal: a ∈ ℝ⁺ − {1}.'
          : 'Revisá la condición del argumento en la definición formal: x > 0 en ℝ.',
        isBaseOne
          ? 'Intentá plantear 1^y = 5: ¿existe algún exponente real y que haga que 1 elevado a y dé 5?'
          : 'Intentá plantear 3^y = −9: ¿puede una potencia de base positiva dar un número negativo?',
        'Confirmá si la operación viola las condiciones de existencia en ℝ y declaralo con claridad.',
      ],
      solution: [
        isBaseOne
          ? 'La base es a = 1, excluida por definición (1^y siempre vale 1 ≠ 5).'
          : 'El argumento es negativo (−9 ≤ 0), pero 3^y > 0 para todo y ∈ ℝ.',
        'Por lo tanto la expresión no está definida en ℝ (no existe).',
      ],
      explanation: isBaseOne
        ? 'No existe en ℝ porque la base 1 está prohibida (1^y = 1 para todo y real).'
        : 'No existe en ℝ porque el argumento de todo logaritmo real debe ser estrictamente positivo.',
    };
  }

  // 2. Conversión exp <-> log y bases especiales
  if (type === 'conversion_exp_log') {
    const base = randChoice(rng, [2, 3, 5, 7, 10]);
    const exp = randChoice(rng, [2, 3, 4]);
    const ans = Math.pow(base, exp);
    const useDecimalAlias = base === 10;
    const logNotation = useDecimalAlias ? 'log(x)' : `log_${base}(x)`;
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      prerequisiteIds: typeObj.prerequisiteIds,
      family: type,
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: typeObj.diagnosticIds,
      badge: 'Familia 2 · Conversión Exp ↔ Log',
      prompt: `Sabiendo que \`${logNotation} = ${exp}\`, convertí a forma exponencial y hallá el valor de \`x\`.`,
      inputKind: 'number',
      expected: ans,
      displayAnswer: fmt(ans),
      placeholder: 'Ej: 64',
      diagContext: {
        problemType: 'conversion',
        base,
        exponent: exp,
        swappedExpected: Math.pow(exp, base),
        expected: ans,
      },
      hints: [
        useDecimalAlias
          ? 'Cuando no se escribe subíndice en log(x), la base implícita es 10.'
          : `Identificá la base (${base}), el argumento (x) y el exponente resultado (${exp}).`,
        `Aplicá la equivalencia log_a(x) = y ⇔ a^y = x: elevá la base ${base} al exponente ${exp}.`,
        'Calculá esa potencia numérica para obtener el valor de x (cuidado de no intercambiar base y exponente).',
      ],
      solution: [
        `De ${logNotation} = ${exp} pasamos a la forma exponencial ${base}^${exp} = x.`,
        `Calculamos la potencia: x = ${fmt(ans)}.`,
      ],
      explanation: `${logNotation} = ${exp} equivale a x = ${base}^${exp} = ${fmt(ans)}.`,
    };
  }

  // 3. Propiedades operativas y unificación
  if (type === 'propiedades_unificacion') {
    // Estilo Global/Parcial: p*log_a(u) + q*log_a(v) - r*log_a(w) = log_a(K) o número entero
    const variant = rng();
    if (variant < 0.55) {
      // Condensa p*log_a(x) + (1/2)*log_a(y^2) - (1/3)*log_a(z^3) => log_a(M) -> pedir M
      const b1 = randChoice(rng, [2, 3, 4]);
      const b2 = randChoice(rng, [3, 5, 7]);
      const b3 = randChoice(rng, [2, 3, 5]);
      const targetArg = (b1 * b1 * b2) / b3;
      const fracStr = toSimpleFraction(targetArg);
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        prerequisiteIds: typeObj.prerequisiteIds,
        family: type,
        representation: 'symbolic',
        difficulty: 2,
        stage: 'guided_practice',
        transferDistance: 'near',
        diagnosticIds: typeObj.diagnosticIds,
        badge: 'Familia 3 · Unificación por Propiedades',
        prompt: `Si \`2·log_a(${b1}) + (1/2)·log_a(${b2 * b2}) − (1/3)·log_a(${b3 ** 3}) = log_a(K)\` (con \`a > 0, a ≠ 1\`), ¿cuánto vale \`K\`?`,
        inputKind: 'number_or_frac',
        expected: targetArg,
        displayAnswer: fracStr,
        placeholder: 'Ej: 11 o 17/5',
        diagContext: { target: 'properties', expected: targetArg },
        hints: [
          'Subí cada coeficiente multiplicativo como exponente de su propio argumento usando log_a(x^n) = n·log_a(x).',
          `Queda log_a(${b1}²) + log_a(√${b2 * b2}) − log_a(∛${b3 ** 3}) = log_a(${b1 * b1}) + log_a(${b2}) − log_a(${b3}).`,
          'Aplicá producto para la suma y cociente para la resta en el argumento único K.',
        ],
        solution: [
          `Subimos los coeficientes: log_a(${b1 * b1}) + log_a(${b2}) − log_a(${b3}).`,
          `Unificamos en un solo logaritmo: log_a((${b1 * b1} · ${b2}) / ${b3}) = log_a(${fracStr}).`,
          `Por inyectividad del logaritmo, K = ${fracStr}.`,
        ],
        explanation: `Al subir exponentes y combinar producto/cociente resulta log_a(${fracStr}), luego K = ${fracStr}.`,
      };
    }

    // Potencia fraccionaria en base e: ln( (e^p * sqrt(e)) / cbrt(e^q) ) = val
    const p = randChoice(rng, [1, 2, 3]);
    const q = randChoice(rng, [1, 2, 4]);
    const val = p + 0.5 - q / 3;
    const valClean = Math.round(val * 6) / 6;
    const fracStr = toSimpleFraction(valClean);
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      prerequisiteIds: typeObj.prerequisiteIds,
      family: type,
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: typeObj.diagnosticIds,
      badge: 'Familia 3 · Propiedades en Base e',
      prompt: `Calculá el valor exacto (en fracción irreducible): \`ln((e^${p} · √e) / ∛(e^${q}))\``,
      inputKind: 'number_or_frac',
      expected: valClean,
      displayAnswer: fracStr,
      placeholder: 'Ej: 11/4',
      diagContext: { target: 'properties', expected: valClean },
      hints: [
        'Transformá las raíces en exponentes racionales: √e = e^(1/2) y ∛(e^q) = e^(q/3), o bien abrí con propiedades de producto y cociente.',
        `Usando propiedades: ${p}·ln(e) + (1/2)·ln(e) − (${q}/3)·ln(e), y recordá que ln(e) = 1.`,
        'Sumá y restá las tres fracciones resultantes reduciendo a común denominador.',
      ],
      solution: [
        `Abrimos el argumento: ln(e^${p}) + ln(e^(1/2)) − ln(e^(${q}/3)).`,
        `Bajamos los exponentes usando ln(e) = 1: ${p} + 1/2 − ${q}/3.`,
        `Operando las fracciones obtenemos ${fracStr}.`,
      ],
      explanation: `Al escribir las raíces como potencias de e y bajar exponentes con ln(e) = 1 se obtiene ${fracStr}.`,
    };
  }

  // 4. Cambio de base exacto
  if (type === 'cambio_de_base_exacto') {
    // Estilo 2do Parcial 2025: log_{b^2}(b^m) o log_{sqrt(b)}(b^k)
    const useSqrtBase = rng() < 0.5;
    const baseSym = randChoice(rng, ['2', '3', '5']);
    const baseNum = Number(baseSym);
    if (useSqrtBase) {
      const m = randChoice(rng, [1, 2, 3]);
      const argNum = Math.pow(baseNum, m);
      const ans = 2 * m;
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        prerequisiteIds: typeObj.prerequisiteIds,
        family: type,
        representation: 'symbolic',
        difficulty: 2,
        stage: 'retrieval',
        transferDistance: 'near',
        diagnosticIds: typeObj.diagnosticIds,
        badge: 'Familia 4 · Cambio de Base con Raíz',
        prompt: `Calculá mediante cambio de base a base ${baseNum}: \`log_(√${baseNum})(${argNum})\``,
        inputKind: 'number_or_frac',
        expected: ans,
        displayAnswer: fmt(ans),
        placeholder: 'Ej: 10',
        diagContext: {
          problemType: 'change_of_base',
          base: Math.sqrt(baseNum),
          arg: argNum,
          invertedExpected: 1 / ans,
          expected: ans,
        },
        hints: [
          `Aplicá cambio de base a base ${baseNum}: el argumento ${argNum} va en el numerador y la base vieja √${baseNum} en el denominador.`,
          `Calculá por separado log_${baseNum}(${argNum}) = ${m} arriba y log_${baseNum}(${baseNum}^(1/2)) = 1/2 abajo.`,
          'Dividí el numerador entero por el denominador fraccionario (cuidado de no invertir la fracción).',
        ],
        solution: [
          `Por cambio de base: log_(√${baseNum})(${argNum}) = log_${baseNum}(${argNum}) / log_${baseNum}(√${baseNum}).`,
          `El numerador vale ${m} y el denominador vale 1/2.`,
          `Dividiendo ${m} : (1/2) = ${fmt(ans)}.`,
        ],
        explanation: `log_${baseNum}(${argNum}) / log_${baseNum}(√${baseNum}) = ${m} / (1/2) = ${fmt(ans)}.`,
      };
    }

    const p = randChoice(rng, [2, 3]);
    const q = randChoice(rng, [1, 3, 5].filter((v) => v !== p));
    const ans = q / p;
    const fracStr = toSimpleFraction(ans);
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      prerequisiteIds: typeObj.prerequisiteIds,
      family: type,
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: typeObj.diagnosticIds,
      badge: 'Familia 4 · Cambio de Base Racional',
      prompt: `Calculá exactamente usando cambio de base: \`log_${Math.pow(baseNum, p)}(${Math.pow(baseNum, q)})\``,
      inputKind: 'number_or_frac',
      expected: ans,
      displayAnswer: fracStr,
      placeholder: 'Ej: 7/4',
      diagContext: {
        problemType: 'change_of_base',
        base: Math.pow(baseNum, p),
        arg: Math.pow(baseNum, q),
        invertedExpected: p / q,
        expected: ans,
      },
      hints: [
        `Elegí la base común ${baseNum} para el cambio de base: el argumento ${Math.pow(baseNum, q)} va arriba y la base ${Math.pow(baseNum, p)} abajo.`,
        `Numerador: log_${baseNum}(${Math.pow(baseNum, q)}) = ${q}. Denominador: log_${baseNum}(${Math.pow(baseNum, p)}) = ${p}.`,
        'Formá la fracción irreducible con el resultado del numerador sobre el denominador.',
      ],
      solution: [
        `Cambiamos a base ${baseNum}: log_${baseNum}(${Math.pow(baseNum, q)}) / log_${baseNum}(${Math.pow(baseNum, p)}).`,
        `Evaluamos cada logaritmo: ${q} / ${p} = ${fracStr}.`,
      ],
      explanation: `Por cambio de base a base ${baseNum}, resulta ${fracStr} (y su inverso sería ${toSimpleFraction(p / q)}).`,
    };
  }

  // 5. Ecuación logarítmica con filtro de dominio (incluye contraste u = log_a(x) < 0!)
  if (type === 'ecuacion_log_con_filtro') {
    const useQuadSub = rng() < 0.4;
    if (useQuadSub) {
      // (log_b(x - s))^2 + bCoef*log_b(x - s) + cCoef = 0 => conservar u < 0!
      const base = randChoice(rng, [2, 3]);
      const shift = randChoice(rng, [-1, -2]); // x + shift => x - 1 or x - 2
      // Escoger u1 = 1 o 2, u2 = -1 o -2 o -3
      const u1 = randChoice(rng, [1, 2]);
      const u2 = randChoice(rng, [-1, -2, -3]);
      const bCoef = -(u1 + u2);
      const cCoef = u1 * u2;
      const rhsVal = -cCoef;
      const solved = solveLogEquation({
        kind: 'quadratic_sub_log',
        base,
        shift,
        aCoef: 1,
        bCoef,
        cCoef,
      });
      const bTerm = bCoef === 0 ? '' : (bCoef > 0 ? ` + ${bCoef === 1 ? '' : bCoef}·log_${base}(x − ${-shift})` : ` − ${-bCoef === 1 ? '' : -bCoef}·log_${base}(x − ${-shift})`);
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        prerequisiteIds: typeObj.prerequisiteIds,
        family: type,
        representation: 'symbolic',
        difficulty: 3,
        stage: 'transfer',
        transferDistance: 'far',
        diagnosticIds: typeObj.diagnosticIds,
        badge: 'Familia 5 · Sustitución u = logₐ(…) ∈ ℝ',
        prompt: `Resolvé en ℝ y escribí el conjunto solución (formato Exactas \`{x₁; x₂}\`): \`(log_${base}(x − ${-shift}))²${bTerm} = ${rhsVal}\``,
        inputKind: 'solution_set',
        expected: solved.solutionSet,
        displayAnswer: solved.solutionSet,
        placeholder: 'Ej: {10/7; 12}',
        diagContext: {
          target: 'equation_quad_sub_log',
          expected: solved.solutionSet,
          solutionSet: solved.solutionSet,
          rejectedRoots: [],
        },
        hints: [
          `Anotá la existencia: x − ${-shift} > 0 ⇒ x > ${-shift}. Luego sustituí u = log_${base}(x − ${-shift}).`,
          `La cuadrática u² + (${bCoef})u + (${cCoef}) = 0 tiene dos raíces reales: una positiva (${u1}) y una negativa (${u2}).`,
          `Recordá que la imagen del logaritmo es todo ℝ: NO descartes u negativa; despejá x = ${base}^u + ${-shift} para ambas ramas.`,
        ],
        solution: solved.steps,
        explanation: `Como Im(log_${base}) = ℝ, tanto u₁ = ${u1} como u₂ = ${u2} generan soluciones válidas: S = ${solved.solutionSet}.`,
      };
    }

    // Producto con raíz extraña a descartar: log_b(x + s1) + log_b(x + s2) = log_b(rhsArg)
    // Elegimos raíces rValid y rExtra tal que rValid > max(-s1, -s2) y rExtra <= -s2
    const presets = [
      { base: 2, shift1: 1, shift2: -2, rhsArg: 4 },   // x=3 valida, x=-2 rechazada
      { base: 3, shift1: 2, shift2: -1, rhsArg: 10 },  // (x+2)(x-1)=10 => x^2+x-12=0 => x=3 valida, x=-4 rechazada
      { base: 2, shift1: 3, shift2: -1, rhsArg: 12 },  // (x+3)(x-1)=12 => x^2+2x-15=0 => x=3 valida, x=-5 rechazada
      { base: 5, shift1: 4, shift2: -2, rhsArg: 16 },  // (x+4)(x-2)=16 => x^2+2x-24=0 => x=4 valida, x=-6 rechazada
    ];
    const p = randChoice(rng, presets);
    const solved = solveLogEquation({ kind: 'product_domain_filter', ...p });
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      prerequisiteIds: typeObj.prerequisiteIds,
      family: type,
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: typeObj.diagnosticIds,
      badge: 'Familia 5 · Filtro de Raíz Extraña',
      prompt: `Resolvé en ℝ e indicá el conjunto solución \`{ ... }\`: \`${solved.equation}\``,
      inputKind: 'solution_set',
      expected: solved.solutionSet,
      displayAnswer: solved.solutionSet,
      placeholder: 'Ej: {11}',
      diagContext: {
        target: 'equation_log',
        expected: solved.solutionSet,
        solutionSet: solved.solutionSet,
        rejectedRoots: solved.rejectedRoots,
      },
      hints: [
        `Anotá la condición de existencia antes de unificar: ambos argumentos deben ser > 0 (${solved.domainCondition}).`,
        `Unificando por propiedad del producto e igualando argumentos quedan dos candidatas: ${solved.candidates.map((v) => fmt(v)).join(' y ')}.`,
        'Verificá cada candidata en los argumentos originales y encerrá entre llaves únicamente la que cumple la aduana.',
      ],
      solution: solved.steps,
      explanation: `Al controlar ${solved.domainCondition}, se descarta la raíz extraña y queda S = ${solved.solutionSet}.`,
    };
  }

  // 6. Exponenciales no comunes y sustitución cuadrática en base e
  if (type === 'ecuacion_exp_no_comun') {
    const useQuadE = rng() < 0.5;
    if (useQuadE) {
      // e^(2x) + bCoef*e^x + cCoef = 0 con u1 > 0 y u2 < 0
      const u1 = randChoice(rng, [2, 3, 4, 5]);
      const u2 = randChoice(rng, [-1, -2, -3]);
      const bCoef = -(u1 + u2);
      const cCoef = u1 * u2;
      const solved = solveNonCommonExpEquation({
        kind: 'quadratic_sub_exp',
        base: Math.E,
        bCoef,
        cCoef,
      });
      const bTerm = bCoef === 0 ? '' : (bCoef > 0 ? ` + ${bCoef === 1 ? '' : bCoef}eˣ` : ` − ${-bCoef === 1 ? '' : -bCoef}eˣ`);
      const cTerm = cCoef > 0 ? `+ ${cCoef}` : `− ${-cCoef}`;
      const exactExpr = `ln(${u1})`;
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        prerequisiteIds: typeObj.prerequisiteIds,
        family: type,
        representation: 'symbolic',
        difficulty: 3,
        stage: 'transfer',
        transferDistance: 'near',
        diagnosticIds: typeObj.diagnosticIds,
        badge: 'Familia 6 · Sustitución u = eˣ > 0',
        prompt: `Resolvé en ℝ la ecuación \`e^(2x)${bTerm} ${cTerm} = 0\` (podés escribir el valor exacto \`ln(...)\` o con 2 decimales):`,
        inputKind: 'expr_or_num',
        expected: exactExpr,
        numericExpected: Math.log(u1),
        displayAnswer: `x = ln(${u1}) ≈ ${fmt(Number(Math.log(u1).toFixed(4)))}`,
        placeholder: 'Ej: ln(7)',
        diagContext: {
          target: 'equation_exp_quad',
          expected: exactExpr,
          rejectedRoots: solved.rejectedRoots,
        },
        hints: [
          'Sustituí u = eˣ imponiendo la restricción obligatoria u > 0 para obtener u² + b·u + c = 0.',
          `Las raíces auxiliares son u₁ = ${u1} y u₂ = ${u2}. Como eˣ > 0 en todo ℝ, descartá u₂ ≤ 0.`,
          'Despejá x aplicando logaritmo natural sobre la única raíz auxiliar positiva.',
        ],
        solution: solved.steps,
        explanation: `Descartando u₂ = ${u2} ≤ 0 por eˣ > 0, de eˣ = ${u1} resulta x = ln(${u1}) ≈ ${fmt(Number(Math.log(u1).toFixed(4)))}.`,
      };
    }

    const base = randChoice(rng, [3, 4, 5, 7]);
    const target = randChoice(rng, [6, 9, 11, 13].filter((v) => v !== base && v !== base * base));
    const solved = solveNonCommonExpEquation({ kind: 'power_equal', base, target });
    const exactExpr = `ln(${target})/ln(${base})`;
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      prerequisiteIds: typeObj.prerequisiteIds,
      family: type,
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: typeObj.diagnosticIds,
      badge: 'Familia 6 · Exponencial Base No Común',
      prompt: `Despejá \`x\` en \`${base}^x = ${target}\` (escribí \`ln(${target})/ln(${base})\` o \`log_${base}(${target})\` o aproximación a 2 decimales):`,
      inputKind: 'expr_or_num',
      expected: exactExpr,
      numericExpected: solved.validSolutions[0],
      displayAnswer: `log_${base}(${target}) ≈ ${fmt(Number(solved.validSolutions[0].toFixed(4)))}`,
      placeholder: 'Ej: ln(15)/ln(2)',
      diagContext: {
        target: 'equation_exp_non_common',
        expected: exactExpr,
      },
      hints: [
        `Como ${target} no es potencia exacta inmediata de ${base}, aplicá logaritmo (ln o log) en ambos miembros.`,
        `Bajá el exponente por propiedad de la potencia: x · ln(${base}) = ln(${target}).`,
        'Dividí el logaritmo del segundo miembro por el logaritmo de la base para despejar x.',
      ],
      solution: solved.steps,
      explanation: `Aplicando logaritmos a ${base}^x = ${target} se despeja x = ln(${target})/ln(${base}) ≈ ${fmt(Number(solved.validSolutions[0].toFixed(4)))}.`,
    };
  }

  // 7. Sistemas logarítmicos 2x2
  if (type === 'sistema_logaritmico') {
    const presets = [
      { kind: 'linear_in_logs', base: 10, a1: 2, b1: 1, c1: 0, a2: 1, b2: -1, c2: -3 }, // (1/10; 100)
      { kind: 'linear_in_logs', base: 2, a1: 1, b1: 1, c1: 5, a2: 1, b2: -1, c2: 1 },   // u=3, v=2 => (8; 4)
      { kind: 'sum_diff_product', base: 10, diff: 25, logRatio: 1 },                     // (250/9; 25/9)
      { kind: 'sum_diff_product', base: 2, diff: 15, logRatio: 2 },                      // x=4y => 3y=15 => (20; 5)
    ];
    const spec = randChoice(rng, presets);
    const solved = solveLogSystem(spec);
    const solPt = solved.validSolutions[0];
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      prerequisiteIds: typeObj.prerequisiteIds,
      family: type,
      representation: 'symbolic',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: typeObj.diagnosticIds,
      badge: 'Familia 7 · Sistema Logarítmico 2×2',
      prompt: `Resolvé el sistema en ℝ indicando el par \`(x; y)\`: \`${solved.equation}\``,
      inputKind: 'pair',
      expected: [solPt.x, solPt.y],
      displayAnswer: `(${toSimpleFraction(solPt.x)}; ${toSimpleFraction(solPt.y)})`,
      firstLabel: 'x',
      secondLabel: 'y',
      diagContext: { target: 'system_log', expected: [solPt.x, solPt.y] },
      hints: [
        'Anotá primero el dominio obligatorio del sistema: x > 0 y y > 0.',
        spec.kind === 'linear_in_logs'
          ? `Sustituí u = log_${spec.base}(x) y v = log_${spec.base}(y) para resolver un sistema lineal 2×2.`
          : `Unificá la resta log_${spec.base}(x) − log_${spec.base}(y) como log_${spec.base}(x / y) para despejar la razón x / y.`,
        'Volvé a las variables originales x e y comprobando que ambos valores resulten estrictamente positivos.',
      ],
      solution: solved.steps,
      explanation: `Resolviendo y verificando x > 0, y > 0 se obtiene el par (${toSimpleFraction(solPt.x)}; ${toSimpleFraction(solPt.y)}).`,
    };
  }

  // 8. Función inversa exp <-> log y dominio restringido
  if (type === 'inversa_explicita_exp_log') {
    const askDomain = rng() < 0.5;
    const k = randChoice(rng, [2, 3, -2]);
    const c = randChoice(rng, [-3, -1, 2, 4]);
    const inv = computeInverseExpLog({ from: 'exp', k, a: Math.E, b: 1, h: 0, c });

    if (askDomain) {
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        prerequisiteIds: typeObj.prerequisiteIds,
        family: type,
        representation: 'symbolic',
        difficulty: 2,
        stage: 'guided_practice',
        transferDistance: 'near',
        diagnosticIds: typeObj.diagnosticIds,
        badge: 'Familia 8 · Dominio de la Inversa',
        prompt: `Dada la exponencial biyectiva \`f(x) = ${k}·eˣ ${c >= 0 ? '+ ' + c : '− ' + (-c)}\` en su imagen, escribí el dominio de su inversa \`Dom(f⁻¹)\` en notación de Exactas:`,
        inputKind: 'set_or_interval',
        expected: inv.domainAscii,
        displayAnswer: inv.domain,
        placeholder: 'Ej: (-7; +inf)',
        diagContext: { target: 'domain', asymptoteX: c, expected: inv.domainAscii },
        hints: [
          'El dominio de la función inversa f⁻¹ coincide exactamente con la imagen de la función directa f.',
          `Como eˣ > 0 siempre, ${k > 0 ? `${k}·eˣ > 0` : `${k}·eˣ < 0`}, de modo que la asíntota horizontal de f es y = ${c}.`,
          'Escribí el intervalo abierto correspondiente (siempre con paréntesis redondo en la asíntota y punto y coma como separador).',
        ],
        solution: [
          `La imagen de f(x) = ${k}·eˣ ${c >= 0 ? '+ ' + c : '− ' + (-c)} es ${inv.expImage}.`,
          `Por simetría respecto de y = x, Dom(f⁻¹) = Im(f) = ${inv.domain}.`,
        ],
        explanation: `Dom(f⁻¹) = Im(f) = ${inv.domain}, con asíntota vertical x = ${fmt(c)}.`,
      };
    }

    // Fórmula explícita de la inversa: f(x) = k*e^x + c => ln((x - c)/k)
    const expStr = `${k}·e^x ${c >= 0 ? '+ ' + c : '− ' + (-c)}`;
    const invAscii = `ln((x ${c >= 0 ? '- ' + c : '+ ' + (-c)}) / (${k}))`;
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      prerequisiteIds: typeObj.prerequisiteIds,
      family: type,
      representation: 'symbolic',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: typeObj.diagnosticIds,
      badge: 'Familia 8 · Fórmula Explícita de f⁻¹',
      prompt: `Hallá la expresión analítica \`f⁻¹(x)\` de la función inversa de \`f(x) = ${expStr}\`:`,
      inputKind: 'expression',
      expected: invAscii,
      displayAnswer: inv.expression,
      placeholder: 'Ej: ln((x + 7)/5)',
      diagContext: { target: 'inverse_formula', expected: invAscii },
      hints: [
        'Partí de y = f(x) y despejá el término exponencial eˣ antes de aplicar ningún logaritmo.',
        `Restá ${c >= 0 ? c : `(${c})`} y dividí ambos miembros por ${k} para aislar eˣ.`,
        'Aplicá logaritmo natural en ambos miembros e intercambiá las variables para escribir la fórmula en x.',
      ],
      solution: [
        `Planteamos y = ${expStr} ⇒ (y ${c >= 0 ? '− ' + c : '+ ' + (-c)}) / ${k} = eˣ.`,
        `Aplicamos ln: x = ln((y ${c >= 0 ? '− ' + c : '+ ' + (-c)}) / ${k}).`,
        `Reemplazando variable: f⁻¹(x) = ${inv.expression} con Dom(f⁻¹) = ${inv.domain}.`,
      ],
      explanation: `Al aislar eˣ y aplicar ln se obtiene ${inv.formula} sobre ${inv.domain}.`,
    };
  }

  // 9. Radiografía analítica (Dom, A.V., C0)
  if (type === 'radiografia_log_completa') {
    const a = randChoice(rng, [2, 0.5, 3]);
    const m = randChoice(rng, [1, -1]);
    const h = randChoice(rng, [1, 2, 3, 4, -2]);
    // Argumento m*(x - h) = m*x - m*h => d = -m*h
    const d = -m * h;
    const c = randChoice(rng, [0, 0, 1, -1]);
    const analysis = analyzeLogFunction({ k: 1, a, m, d, c });
    const baseTxt = a === 0.5 ? '(1/2)' : String(a);
    const argTxt = m > 0
      ? (d >= 0 ? `x + ${d}` : `x − ${-d}`)
      : `${d} − x`;
    const cTxt = c === 0 ? '' : (c > 0 ? ` + ${c}` : ` − ${-c}`);
    const fTxt = `log_${baseTxt}(${argTxt})${cTxt}`;

    const askRoot = rng() < 0.45;
    if (askRoot) {
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        prerequisiteIds: typeObj.prerequisiteIds,
        family: type,
        representation: 'graphical',
        difficulty: 2,
        stage: 'retrieval',
        transferDistance: 'near',
        diagnosticIds: typeObj.diagnosticIds,
        badge: 'Familia 9 · Raíz (C₀) Logarítmica',
        prompt: `Calculá la raíz \`x₀\` (corte con el eje X) de la función \`f(x) = ${fTxt}\`:`,
        inputKind: 'number_or_frac',
        expected: analysis.root,
        displayAnswer: toSimpleFraction(analysis.root),
        placeholder: 'Ej: 88',
        diagContext: { target: 'root', asymptoteX: analysis.asymptoteX, expected: analysis.root },
        hints: [
          `Igualá la función a cero: ${fTxt} = 0.`,
          `Aislá el logaritmo y convertilo a forma exponencial: ${argTxt} = ${baseTxt}^(${-c}).`,
          'Despejá la incógnita x de la ecuación lineal resultante y verificá que quede dentro del dominio.',
        ],
        solution: [
          `Planteamos ${fTxt} = 0 ⇒ ${argTxt} = ${baseTxt}^(${-c}) = ${toSimpleFraction(Math.pow(a, -c))}.`,
          `Despejamos x = ${toSimpleFraction(analysis.root)} ∈ ${analysis.domain}.`,
        ],
        explanation: `La raíz única es C₀ = { ${toSimpleFraction(analysis.root)} }.`,
      };
    }

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      prerequisiteIds: typeObj.prerequisiteIds,
      family: type,
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: typeObj.diagnosticIds,
      badge: 'Familia 9 · Dominio Maximal de f',
      prompt: `Indicá el dominio maximal \`Dom(f)\` de \`f(x) = ${fTxt}\` en notación de Exactas:`,
      inputKind: 'set_or_interval',
      expected: analysis.domainAscii,
      displayAnswer: analysis.domain,
      placeholder: 'Ej: (-9; +inf)',
      diagContext: {
        type: 'domain',
        target: 'domain',
        asymptoteX: analysis.asymptoteX,
        expected: analysis.domainAscii,
      },
      hints: [
        `Exigí que el argumento sea estrictamente positivo: ${argTxt} > 0.`,
        m < 0
          ? '¡Atención! Al tener signo menos delante de x, el intervalo se extiende hacia −∞ hasta la asíntota vertical.'
          : 'Despejá x conservando la desigualdad estricta hacia +∞.',
        'Escribí el intervalo usando paréntesis redondos abiertos y punto y coma como separador.',
      ],
      solution: [
        `Planteamos ${argTxt} > 0 ⇒ ${m > 0 ? `x > ${fmt(analysis.asymptoteX)}` : `x < ${fmt(analysis.asymptoteX)}`}.`,
        `Como el borde es asíntota vertical y no pertenece al dominio, va abierto: Dom(f) = ${analysis.domain}.`,
      ],
      explanation: `Exigiendo argumento positivo resulta Dom(f) = ${analysis.domain} con A.V. x = ${fmt(analysis.asymptoteX)}.`,
    };
  }

  // 10. Modelos temporales y escala de Richter
  const modelKind = rng();
  if (modelKind < 0.45) {
    // Richter: cuántas veces más potente es M2 que M1 (10^(M2 - M1))
    const m1 = randChoice(rng, [3.5, 4.0, 4.1, 5.2]);
    const delta = randChoice(rng, [2, 3, 4]);
    const m2 = Math.round((m1 + delta) * 10) / 10;
    const ratio = Math.pow(10, delta);
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      prerequisiteIds: typeObj.prerequisiteIds,
      family: type,
      representation: 'verbal',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: typeObj.diagnosticIds,
      badge: 'Familia 10 · Escala de Richter',
      prompt: `En la escala de Richter \`M = log(p)\`, ¿cuántas veces más potente es un terremoto de magnitud \`${fmt(m2)}\` respecto de otro de magnitud \`${fmt(m1)}\`?`,
      inputKind: 'number',
      expected: ratio,
      displayAnswer: `${fmt(ratio)} veces`,
      placeholder: 'Ej: 500',
      diagContext: {
        problemType: 'richter_ratio',
        linearTrapVal: Math.round((m2 / m1) * 100) / 100,
        expected: ratio,
      },
      hints: [
        'Restá ambas magnitudes: ΔM = M₂ − M₁ = log(p₂) − log(p₁) = log(p₂ / p₁).',
        `Como ΔM = ${fmt(delta)}, la ecuación queda log₁₀(p₂ / p₁) = ${fmt(delta)}.`,
        'Convertí ese logaritmo decimal a potencia de base 10 para hallar el cociente p₂ / p₁ (no dividas magnitudes linealmente).',
      ],
      solution: [
        `Planteamos M₂ − M₁ = log(p₂) − log(p₁) = log(p₂/p₁) = ${fmt(delta)}.`,
        `Convertimos a exponencial: p₂ / p₁ = 10^${fmt(delta)} = ${fmt(ratio)} veces.`,
      ],
      explanation: `En escala logarítmica decimal, subir ${fmt(delta)} grados multiplica la potencia por 10^${fmt(delta)} = ${fmt(ratio)}.`,
    };
  }

  // Decaimiento continuo / cultivo: P(t) = P0 * e^(-k*t) => hallar t para 50% o factor
  const k = randChoice(rng, [0.231, 0.3, 0.05]);
  const res = solveRealWorldLogModel({ kind: 'lake_decay', k, remainingFraction: 0.5 });
  const tApprox = Math.round((Math.log(2) / k) * 100) / 100;
  return {
    seed,
    type,
    competencyId: typeObj.competencyId,
    prerequisiteIds: typeObj.prerequisiteIds,
    family: type,
    representation: 'verbal',
    difficulty: 3,
    stage: 'transfer',
    transferDistance: 'far',
    diagnosticIds: typeObj.diagnosticIds,
    badge: 'Familia 10 · Tiempo de Semidesintegración',
    prompt: `Una sustancia decrece según \`y(t) = y₀ · e^(−${fmt(k)}·t)\` (t en años). ¿Cuántos años tarda en reducirse al 50% de su cantidad inicial? (Aproximá a 2 decimales)`,
    inputKind: 'number',
    expected: tApprox,
    numericTolerance: 0.05,
    displayAnswer: `${fmt(tApprox)} años`,
    placeholder: 'Ej: 7,45',
    diagContext: { target: 'model_time', expected: tApprox },
    hints: [
      'Reemplazá y(t) = 0,5 · y₀ y simplificá y₀ de ambos miembros antes de aplicar logaritmos.',
      `Queda e^(−${fmt(k)}·t) = 0,5. Aplicá logaritmo natural ln en ambos lados.`,
      `Despejá t dividiendo ln(0,5) por (−${fmt(k)}) y redondeá a dos decimales.`,
    ],
    solution: [
      `Planteamos 0,5 · y₀ = y₀ · e^(−${fmt(k)}·t) ⇒ e^(−${fmt(k)}·t) = 0,5.`,
      `Aplicamos ln: −${fmt(k)}·t = ln(0,5) ⇒ t = −ln(0,5) / ${fmt(k)} ≈ ${fmt(tApprox)} años.`,
    ],
    explanation: `Al aislar la potencia y aplicar ln resulta t = ln(2) / ${fmt(k)} ≈ ${fmt(tApprox)} años.`,
  };
}

export function generateLogChallenges(seed, forcedType = 'all', count = 6) {
  return Array.from({ length: count }, (_, i) => generateLogChallenge(seed, forcedType, i));
}

export function selectAdaptiveLogFamily({
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

// =============================================================================
// LAS 5 TRAMPAS CLÁSICAS DE EXAMEN
// =============================================================================

export const TRAPS = [
  {
    id: 'trap_false_sum',
    title: 'Trampa 1 · Distribuir el logaritmo sobre la suma',
    subtitle: 'Confundir log_a(x + y) con log_a(x) + log_a(y)',
    wrongAttempt: {
      author: 'Razonamiento tramposo',
      steps: [
        'Parto de log₂(4 + 4).',
        'Reparto el logaritmo en cada sumando: log₂(4) + log₂(4).',
        'Calculo 2 + 2 = 4 (¡Falso!).',
      ],
    },
    correctResolution: {
      author: 'Regla formal verificada',
      steps: [
        'El logaritmo NO es distributivo respecto de la suma ni de la resta.',
        'Primero opero el paréntesis: log₂(4 + 4) = log₂(8) = 3.',
        'La suma log_a(x) + log_a(y) corresponde únicamente al producto interior log_a(x · y).',
      ],
    },
    question: 'Si a = 3, x = 9 e y = 18, ¿cuál afirmación es verdadera?',
    options: [
      {
        label: 'log₃(9 + 18) = log₃(27) = 3, distinto de log₃(9) + log₃(18)',
        correct: true,
        feedback: '¡Impecable! La suma adentro del argumento se resuelve primero: log₃(27) = 3, mientras que log₃(9) + log₃(18) = log₃(162) ≈ 4,63.',
      },
      {
        label: 'log₃(9 + 18) = log₃(9) + log₃(18) = 2 + log₃(18)',
        correct: false,
        feedback: 'Cuidado: el logaritmo jamás se distribuye sobre la suma.',
      },
    ],
  },
  {
    id: 'trap_false_power_whole',
    title: 'Trampa 2 · Bajar el exponente que afecta a todo el logaritmo',
    subtitle: 'Confundir (log_a x)² con log_a(x²) = 2 · log_a(x)',
    wrongAttempt: {
      author: 'Razonamiento tramposo',
      steps: [
        'Veo (log₂ 8)² y aplico la propiedad de la potencia bajando el 2.',
        'Escribo 2 · log₂(8) = 2 · 3 = 6.',
        'Confundo elevar el resultado del logaritmo con elevar su argumento.',
      ],
    },
    correctResolution: {
      author: 'Regla formal verificada',
      steps: [
        'La propiedad log_a(xⁿ) = n · log_a(x) exige que n eleve exclusivamente al argumento x.',
        'En (log₂ 8)², primero calculo log₂(8) = 3 y luego elevo al cuadrado: 3² = 9.',
        'Justamente por eso las ecuaciones cuadráticas con (log_a x)² requieren sustitución u = log_a x.',
      ],
    },
    question: '¿Cuánto vale (log₃ 27)² − log₃(27²)?',
    options: [
      {
        label: 'Vale 3² − 2·3 = 9 − 6 = 3 (no son iguales)',
        correct: true,
        feedback: '¡Exacto! (log₃ 27)² = 3² = 9, mientras que log₃(27²) = 2 · log₃(27) = 6. Su diferencia es 3.',
      },
      {
        label: 'Vale 0 porque ambas expresiones son equivalentes',
        correct: false,
        feedback: 'El cuadrado externo potencia todo el resultado (9); el interno potencia al argumento (6).',
      },
    ],
  },
  {
    id: 'trap_prod_quot_of_logs',
    title: 'Trampa 3 · Producto o cociente ENTRE logaritmos sueltos',
    subtitle: 'Confundir log_a(x) · log_a(y) o log_a(x)/log_a(y) con propiedades del argumento',
    wrongAttempt: {
      author: 'Razonamiento tramposo',
      steps: [
        'Tengo log_a(√8) · log_a(4).',
        'Escribo que multiplicar dos logaritmos equivale a log_a(√8 · 4) o a sumar sus argumentos.',
        'O bien simplifico log₂(8)/log₂(4) como log₂(8 − 4) = 2.',
      ],
    },
    correctResolution: {
      author: 'Regla formal verificada',
      steps: [
        'Ninguna propiedad convierte un producto de dos logaritmos en un único logaritmo sumando argumentos.',
        'Y el cociente log_a(x) / log_a(y) NO es log_a(x − y) ni log_a(x/y): por cambio de base vale log_y(x).',
        'Contraejemplo: log₂(8) / log₂(4) = 3 / 2 = 1,5 ≠ log₂(2) = 1.',
      ],
    },
    question: 'Si simplificás correctamente la razón log₅(125) / log₅(25), ¿qué valor obtenés?',
    options: [
      {
        label: '3 / 2 = 1,5 (y equivale a log₂₅(125) por cambio de base)',
        correct: true,
        feedback: '¡Correcto! log₅(125) = 3 y log₅(25) = 2, así que el cociente vale 3/2 = 1,5 (jamás log₅(5) = 1).',
      },
      {
        label: 'log₅(125 / 25) = log₅(5) = 1',
        correct: false,
        feedback: 'Dividir dos logaritmos no divide sus argumentos; la resta de logaritmos es la que divide argumentos.',
      },
    ],
  },
  {
    id: 'trap_extraneous_vs_negative_u',
    title: 'Trampa 4 · Aduana de raíces extrañas vs signo de u = log_a(x)',
    subtitle: 'Aceptar x que vuelve arg ≤ 0, o rechazar por error u < 0 en u = log_a(x)',
    wrongAttempt: {
      author: 'Razonamiento tramposo',
      steps: [
        'En log₂(x+1)+log₂(x−2)=log₂(4) obtengo x = 3 y x = −2 y guardo ambas en S.',
        'Y en (log₃(x−1))² + log₃(x−1) = 6 obtengo u = 2 y u = −3, pero descarto u = −3 pensando que "u no puede ser negativa".',
      ],
    },
    correctResolution: {
      author: 'Regla formal verificada',
      steps: [
        'La restricción en log_a(g(x)) exige g(x) > 0 (el ARGUMENTO), nunca limita el signo del logaritmo entero.',
        'Por eso x = −2 se descarta en el primer caso (negativiza ambos argumentos).',
        'En el segundo caso, u = −3 SÍ es válida porque Im(log₃) = ℝ, dando x − 1 = 3⁻³ ⇒ x = 28/27 > 1.',
      ],
    },
    question: 'En (log₃(x − 1))² + log₃(x − 1) = 6, ¿cuántas soluciones reales válidas tiene la ecuación?',
    options: [
      {
        label: 'Dos soluciones: x = 10 y x = 28/27 (ambas cumplen x > 1)',
        correct: true,
        feedback: '¡Brillante! Tanto u = 2 (x = 10) como u = −3 (x = 28/27) cumplen x − 1 > 0.',
      },
      {
        label: 'Una sola solución: x = 10, porque u = −3 es negativa',
        correct: false,
        feedback: 'Confundiste u = aˣ > 0 con u = log_a(x) ∈ ℝ: el logaritmo puede valer −3 perfectamente.',
      },
    ],
  },
  {
    id: 'trap_closed_bracket_asymptote',
    title: 'Trampa 5 · Corchete cerrado o asíntota horizontal en el logaritmo',
    subtitle: 'Escribir Dom = [h; +∞) o confundir la A.V. x = h con A.H. y = h',
    wrongAttempt: {
      author: 'Razonamiento tramposo',
      steps: [
        'Para f(x) = log₂(x − 3) planteo x − 3 ≥ 0 y escribo Dom(f) = [3; +∞).',
        'Luego digo que tiene asíntota horizontal en y = 3 porque "se parece a la exponencial".',
      ],
    },
    correctResolution: {
      author: 'Regla formal verificada',
      steps: [
        'El argumento exige desigualdad estricta: x − 3 > 0 ⇒ Dom(f) = (3; +∞) siempre abierto.',
        'Al reflejar la exponencial sobre y = x, la asíntota horizontal gira a asíntota VERTICAL: x = 3.',
        'Además, si el argumento tiene x negativa como log₂(4 − x), el dominio va hacia la izquierda: (−∞; 4).',
      ],
    },
    question: '¿Cuál es el dominio y la asíntota de f(x) = log₂(4 − x)?',
    options: [
      {
        label: 'Dom(f) = (−∞; 4) abierto y asíntota vertical x = 4',
        correct: true,
        feedback: '¡Exacto! 4 − x > 0 exige x < 4 estricto, por lo que la recta x = 4 es asíntota vertical y lleva paréntesis abierto.',
      },
      {
        label: 'Dom(f) = [4; +∞) y asíntota horizontal y = 4',
        correct: false,
        feedback: 'Para x ≥ 4 el argumento 4 − x ≤ 0 no existe en ℝ, y la asíntota del logaritmo es vertical.',
      },
    ],
  },
];

// =============================================================================
// VALIDADOR DE RESPUESTAS DEL ENTRENADOR
// =============================================================================

export function validateChallengeInput(ch, raw) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return { empty: true, ok: false, diagnostic: null };

  const diag = diagnoseLog(trimmed, {
    expected: ch.expected,
    ...(ch.diagContext || {}),
  });

  if (ch.inputKind === 'existence') {
    const ok = isNonExistencePhrase(trimmed);
    return { empty: false, ok, diagnostic: ok ? null : diag };
  }

  if (ch.inputKind === 'pair') {
    const clean = trimmed.replace(/[()\[\]{}]/g, '').trim();
    const sep = clean.includes(';') ? ';' : (clean.includes(',') ? ',' : null);
    if (!sep) return { empty: false, ok: false, diagnostic: diag };
    const parts = clean.split(sep).map((s) => s.trim()).filter(Boolean);
    if (parts.length !== 2) return { empty: false, ok: false, diagnostic: diag };
    try {
      const xVal = parseNumberOrFraction(parts[0]);
      const yVal = parseNumberOrFraction(parts[1]);
      const ok = approxEq(xVal, ch.expected[0], 1e-3) && approxEq(yVal, ch.expected[1], 1e-3);
      return { empty: false, ok: ok && diag === null, diagnostic: ok ? null : diag };
    } catch {
      return { empty: false, ok: false, diagnostic: diag };
    }
  }

  if (ch.inputKind === 'number' || ch.inputKind === 'number_or_frac') {
    try {
      const val = parseNumberOrFraction(trimmed);
      const tol = ch.numericTolerance ?? 1e-3;
      const ok = Number.isFinite(val) && Math.abs(val - ch.expected) <= tol;
      return { empty: false, ok: ok && diag === null, diagnostic: ok ? null : diag };
    } catch {
      return { empty: false, ok: false, diagnostic: diag };
    }
  }

  if (ch.inputKind === 'solution_set' || ch.inputKind === 'set_or_interval') {
    try {
      const ivU = parseIntervalExactas(trimmed);
      const ivE = parseIntervalExactas(ch.expected);
      const endpointMatch = (a, b) =>
        a === b || (Number.isNaN(a) && Number.isNaN(b)) || approxEq(a, b, 1e-3);
      let ok = false;
      if (
        ivU &&
        ivE &&
        ivU.isEmpty === ivE.isEmpty &&
        ivU.isAllReal === ivE.isAllReal &&
        ivU.loOpen === ivE.loOpen &&
        ivU.hiOpen === ivE.hiOpen &&
        endpointMatch(ivU.lo, ivE.lo) &&
        endpointMatch(ivU.hi, ivE.hi)
      ) {
        if (ivU.points && ivE.points) {
          const sU = [...ivU.points].sort((a, b) => a - b);
          const sE = [...ivE.points].sort((a, b) => a - b);
          ok = sU.length === sE.length && sU.every((v, i) => approxEq(v, sE[i], 1e-3));
        } else if (!ivU.points && !ivE.points) {
          ok = true;
        }
      }
      return { empty: false, ok: ok && diag === null, diagnostic: ok ? null : diag };
    } catch (err) {
      if (err && err.code === 'missing_semicolon') {
        return {
          empty: false,
          ok: false,
          syntaxHint: "En Exactas los intervalos se separan con punto y coma ';' (la coma es decimal).",
          diagnostic: diag,
        };
      }
      return { empty: false, ok: false, diagnostic: diag };
    }
  }

  if (ch.inputKind === 'expr_or_num') {
    let ok = false;
    try {
      const numVal = parseNumberOrFraction(trimmed);
      if (ch.numericExpected !== undefined && Math.abs(numVal - ch.numericExpected) <= 0.02) {
        ok = true;
      }
    } catch {}
    if (!ok) {
      try {
        if (equivalentLog(trimmed, ch.expected)) ok = true;
      } catch {}
    }
    return { empty: false, ok: ok && diag === null, diagnostic: ok ? null : diag };
  }

  // expression
  let ok = false;
  try {
    ok = equivalentLog(trimmed, ch.expected);
  } catch {
    ok = false;
  }
  return { empty: false, ok: ok && diag === null, diagnostic: ok ? null : diag };
}

// =============================================================================
// MONTAJE DE UI DEL ENTRENADOR + 5 TRAMPAS (SOLO 2 PESTAÑAS, SIN MODO BOSS)
// =============================================================================

export function mountLogRetos(root = document.querySelector('#log-challenges')) {
  if (!root) return;
  clear(root);

  let initialSeed = 1409;
  try {
    const saved = localStorage.getItem(SEED_STORAGE_KEY);
    if (saved && /^\d+$/.test(saved)) initialSeed = Number(saved);
  } catch {}

  const state = {
    seed: initialSeed,
    family: 'aleatorio',
    streak: 0,
    failStreak: 0,
    solvedCount: 0,
  };

  // Pestañas (2 tabs únicamente)
  const tabPrng = h('button', {
    type: 'button',
    class: 'chip log-chapter-tab is-active',
    role: 'tab',
    id: 'log-tab-1',
    'aria-controls': 'log-trainer-panel',
    'aria-selected': 'true',
  }, '1. Entrenador Infinito por Semilla PRNG');

  const tabTraps = h('button', {
    type: 'button',
    class: 'chip chip--ghost log-chapter-tab',
    role: 'tab',
    id: 'log-tab-2',
    'aria-controls': 'log-traps-panel',
    'aria-selected': 'false',
  }, '2. Las 5 Trampas Clásicas de Examen');

  const tabsHeader = h(
    'div',
    { class: 'log-chapter-tabs pr-chapter-tabs', role: 'tablist', 'aria-label': 'Modos de práctica' },
    [tabPrng, tabTraps],
  );

  const prngPane = h('section', {
    class: 'log-challenge-panel pr-challenge-panel',
    id: 'log-trainer-panel',
    role: 'tabpanel',
    'aria-labelledby': 'log-tab-1',
  });
  const trapsPane = h('section', {
    class: 'log-challenge-panel pr-challenge-panel',
    id: 'log-traps-panel',
    role: 'tabpanel',
    'aria-labelledby': 'log-tab-2',
    hidden: true,
  });

  // Controles del entrenador PRNG
  const seedInput = h('input', {
    type: 'number',
    min: '0',
    max: '999999999',
    value: String(state.seed),
    class: 'log-seed-input',
    'aria-label': 'Semilla PRNG',
  });

  const familySelect = h('select', { class: 'log-family-select', 'aria-label': 'Modo o familia de ejercicios' }, [
    h('option', { value: 'aleatorio', selected: true }, 'Mezcla aleatoria (10 familias)'),
    h('option', { value: 'adaptativo' }, 'Modo adaptativo (prioriza necesidades)'),
    h('option', { value: 'contrastivo' }, 'Práctica contrastiva (pares de discriminación)'),
    ...CHALLENGE_TYPES.map((t) => h('option', { value: t.id }, t.label)),
  ]);

  const nextSeedBtn = h('button', { type: 'button', class: 'btn btn--ghost' }, 'Semilla +1');
  const randSeedBtn = h('button', { type: 'button', class: 'btn btn--ghost' }, 'Nueva semilla');
  const progressPill = h('div', { class: 'exp-trainer-progress-pill', 'aria-live': 'polite' }, '');

  const toolbar = h('div', { class: 'exp-trainer-toolbar' }, [
    h('label', { class: 'exp-trainer-field' }, [h('span', { class: 'field__label' }, 'Semilla'), seedInput]),
    h('label', { class: 'exp-trainer-field exp-trainer-field--grow' }, [h('span', { class: 'field__label' }, 'Familia / Modo'), familySelect]),
    h('div', { class: 'exp-trainer-toolbar__btns' }, [nextSeedBtn, randSeedBtn]),
    progressPill,
  ]);

  const adaptiveNote = h('div', { class: 'exp-challenge__adaptive-note', hidden: true });
  const cascadeList = h('ol', { class: 'exp-challenges-cascade seq-check' });
  prngPane.append(toolbar, adaptiveNote, cascadeList);

  const saveSeed = (s) => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.setItem) {
        localStorage.setItem(SEED_STORAGE_KEY, String(s));
      }
    } catch {}
  };

  const updatePill = (total = 6) => {
    progressPill.textContent = `Semilla #${state.seed} · Resueltos: ${state.solvedCount}/${total} · Racha indep.: ${state.streak}`;
  };

  function createCard(ch, idx, totalCount) {
    let hintStep = 0;
    let solutionRevealed = false;
    let solved = false;

    const statusEl = h('span', { class: 'exp-challenge-card__status' }, 'Pendiente');
    const promptEl = h('p', { class: 'pr-check-prompt' });
    mount(promptEl, ...inlineMathNodes(ch.prompt));

    let adaptiveCardNote = null;
    if (state.family === 'adaptativo' && ch._targetComp) {
      adaptiveCardNote = h(
        'div',
        { class: 'exp-challenge__adaptive-note' },
        `Prioridad adaptativa: «${ch._targetComp.title}» — ${ch._selectionReason || 'Práctica sugerida según tu progreso.'}`,
      );
    }

    const inputEl = h('input', {
      type: 'text',
      autocomplete: 'off',
      class: 'pr-check-input exp-challenge-input',
      placeholder: ch.placeholder || 'Ingresá tu respuesta...',
      'aria-label': `Respuesta al reto ${idx + 1}`,
    });

    const verifyBtn = h('button', { type: 'button', class: 'btn' }, chalkIcon('check', 15), ' Revisar');
    const hintBtn = h('button', { type: 'button', class: 'btn btn--ghost' }, chalkIcon('hint', 15), ' Pista (0/3)');
    const solutionBtn = h('button', { type: 'button', class: 'btn btn--ghost' }, chalkIcon('book', 15), ' Ver solución explicada');

    const hintBox = h('div', { class: 'log-check__hint seq-check__hint', hidden: true });
    const solutionBox = h('div', { class: 'log-check__solution seq-check__solution', hidden: true });
    const feedbackBox = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });

    hintBtn.addEventListener('click', () => {
      playClick();
      if (hintStep >= 3) return;
      hintStep += 1;
      hintBox.hidden = false;
      const lines = ch.hints.slice(0, hintStep).map((ht, i) =>
        h('p', { style: 'margin: 4px 0;' }, `Pista ${i + 1}/3: `, ...inlineMathNodes(ht)),
      );
      mount(hintBox, ...lines);
      mount(hintBtn, chalkIcon('hint', 15), ` Pista (${hintStep}/3)`);
      if (hintStep >= 3) hintBtn.disabled = true;
    });

    solutionBtn.addEventListener('click', () => {
      playClick();
      if (solutionRevealed) return;
      solutionRevealed = true;
      state.streak = 0;
      solutionBox.hidden = false;
      mount(
        solutionBox,
        h('strong', null, 'Resolución paso a paso'),
        h('ol', null, ...ch.solution.map((step) => h('li', null, ...inlineMathNodes(step)))),
      );

      inputEl.disabled = true;
      verifyBtn.disabled = true;
      hintBtn.disabled = true;
      solutionBtn.disabled = true;
      statusEl.textContent = 'Solución vista (Asistido)';
      statusEl.className = 'exp-challenge-card__status is-solution';
      feedbackBox.className = 'pr-check-feedback is-ok is-assisted';
      feedbackBox.textContent = `${ch.explanation} (Respuesta: ${ch.displayAnswer})`;

      if (!solved) {
        solved = true;
        state.solvedCount += 1;
        try {
          recordLogAttempt({
            exerciseId: `log-reto-${ch.type}-${state.seed}-${idx}`,
            competencyId: ch.competencyId,
            correct: true,
            mode: 'assisted',
            hintsUsed: hintStep,
            solutionRevealed: true,
            representation: ch.representation || 'symbolic',
            stage: ch.stage || 'transfer',
            transferDistance: ch.transferDistance || 'far',
          });
          notifyCompetencyDashboardUpdate();
        } catch {}
      }
      playScript([STREAK_REACTIONS.showSolution, STREAK_REACTIONS.solutionAfter]);
      updatePill(totalCount);
    });

    const onVerify = () => {
      if (solutionRevealed || inputEl.disabled || solved) return;
      const res = validateChallengeInput(ch, inputEl.value);
      if (res.empty) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = 'Ingresá una respuesta antes de revisar.';
        return;
      }

      if (res.ok) {
        playSuccess();
        const isIndependent = hintStep === 0 && !solutionRevealed;
        solved = true;
        state.solvedCount += 1;
        if (isIndependent) {
          state.streak += 1;
          if (state.failStreak > 0) {
            playScript([STREAK_REACTIONS.recovered]);
          } else if (state.streak >= 3) {
            playScript([STREAK_REACTIONS.flawlessRun]);
          } else {
            playScript([STREAK_REACTIONS.firstTry]);
          }
        }
        state.failStreak = 0;

        inputEl.disabled = true;
        verifyBtn.disabled = true;
        hintBtn.disabled = true;
        solutionBtn.disabled = true;
        card.classList.add('is-solved');

        statusEl.textContent = isIndependent ? 'Resuelto (Independiente)' : 'Resuelto (Asistido)';
        statusEl.className = `exp-challenge-card__status ${isIndependent ? 'is-solved-indep' : 'is-solved-assisted'}`;
        feedbackBox.className = `pr-check-feedback is-ok ${isIndependent ? 'is-independent' : 'is-assisted'}`;
        feedbackBox.textContent = isIndependent
          ? `¡Correcto! [Logro Independiente] ${ch.explanation}`
          : `¡Correcto! [Resuelto con apoyo] ${ch.explanation}`;

        try {
          recordLogAttempt({
            exerciseId: `log-reto-${ch.type}-${state.seed}-${idx}`,
            competencyId: ch.competencyId,
            correct: true,
            mode: isIndependent ? 'independent' : 'assisted',
            hintsUsed: hintStep,
            solutionRevealed: false,
            representation: ch.representation || 'symbolic',
            stage: ch.stage || 'transfer',
            transferDistance: ch.transferDistance || 'far',
          });
          notifyCompetencyDashboardUpdate();
        } catch {}

        updatePill(totalCount);
        return;
      }

      playError();
      state.streak = 0;
      state.failStreak += 1;
      updatePill(totalCount);

      if (res.syntaxHint) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = res.syntaxHint;
        return;
      }

      const diag = res.diagnostic;
      try {
        recordLogAttempt({
          exerciseId: `log-reto-${ch.type}-${state.seed}-${idx}`,
          competencyId: ch.competencyId,
          correct: false,
          mode: hintStep > 0 ? 'assisted' : 'independent',
          hintsUsed: hintStep,
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
        : 'Todavía no coincide. Revisá el dominio, la base y probá con una pista.';

      if (diag && DIAGNOSE_REACTIONS[diag.id]) {
        playScript([DIAGNOSE_REACTIONS[diag.id]]);
      } else if (state.failStreak >= 2) {
        playScript([STREAK_REACTIONS.repeatedError]);
      } else if (diag) {
        vnReact({ pose: diag.pose, tag: diag.tag, html: diag.message });
      }
    };

    verifyBtn.addEventListener('click', onVerify);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onVerify();
      }
    });

    const card = h('li', { class: 'exp-challenge-card log-reto-card', 'data-problem-index': String(idx) }, [
      h('div', { class: 'exp-challenge-card__header' }, [
        h('span', { class: 'exp-challenge-card__badge' }, `Reto ${idx + 1} · ${ch.badge}`),
        statusEl,
      ]),
      ...(adaptiveCardNote ? [adaptiveCardNote] : []),
      promptEl,
      h('div', { class: 'exp-challenge-card__input-row' }, [inputEl]),
      h('div', { class: 'log-reto-actions pr-chip-row' }, [verifyBtn, hintBtn, solutionBtn]),
      hintBox,
      feedbackBox,
      solutionBox,
    ]);
    return card;
  }

  function renderCascade() {
    clear(cascadeList);
    state.solvedCount = 0;
    adaptiveNote.hidden = true;
    adaptiveNote.textContent = '';

    let challenges = [];
    const count = 6;

    if (state.family === 'adaptativo') {
      const store = getProgressStore();
      const now = new Date();
      let prevComp = null;
      let firstSel = null;
      for (let i = 0; i < count; i++) {
        const sel = selectAdaptiveExercise({
          moduleId: MODULE_ID,
          availableExercises: CHALLENGE_TYPES,
          store,
          now,
          previousCompetencyId: prevComp,
        });
        if (i === 0) firstSel = sel;
        const chosenId = sel.exercise?.id || CHALLENGE_TYPES[i % CHALLENGE_TYPES.length].id;
        const ch = generateLogChallenge(state.seed, chosenId, i);
        ch._targetComp = getCompetencyById(sel.targetCompetencyId || sel.exercise?.competencyId);
        ch._selectionReason = sel.selectionReason;
        prevComp = sel.targetCompetencyId || sel.exercise?.competencyId;
        challenges.push(ch);
      }
      const firstComp = getCompetencyById(firstSel?.targetCompetencyId || challenges[0]?.competencyId);
      adaptiveNote.hidden = false;
      adaptiveNote.textContent = firstSel?.selectionReason
        ? `Selección adaptativa: ${firstSel.selectionReason} Prioridad actual: «${firstComp?.title || 'Función Logarítmica'}».`
        : `Modo adaptativo activo: priorizando «${firstComp?.title || 'Función Logarítmica'}».`;
    } else if (state.family === 'contrastivo') {
      challenges = Array.from({ length: count }, (_, i) => {
        const pairIdx = Math.floor(i / 2) % CONTRAST_PAIRS.length;
        const pair = CONTRAST_PAIRS[pairIdx];
        const fam = pair.types[i % 2];
        const ch = generateLogChallenge(state.seed, fam, i);
        ch.badge = `Par ${pairIdx + 1} (${i % 2 === 0 ? 'A' : 'B'}) · ${ch.badge}`;
        return ch;
      });
      adaptiveNote.hidden = false;
      adaptiveNote.textContent = 'Práctica contrastiva: compará pares de ejercicios con estructuras cercanas para no confundir reglas.';
    } else {
      challenges = generateLogChallenges(state.seed, state.family, count);
    }

    challenges.forEach((ch, idx) => cascadeList.appendChild(createCard(ch, idx, challenges.length)));
    updatePill(challenges.length);
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

  // Tab 2: 5 Trampas Clásicas
  const trapChips = h('div', { class: 'pr-chip-row' });
  const trapBody = h('div', { class: 'log-trap-body' });
  trapsPane.append(trapChips, trapBody);

  function renderTrap(idx) {
    const trap = TRAPS[idx];
    Array.from(trapChips.children).forEach((b, i) => {
      b.classList.toggle('is-active', i === idx);
      b.classList.toggle('chip--ghost', i !== idx);
    });
    clear(trapBody);

    const feedback = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });
    const opts = h(
      'div',
      { class: 'log-trap-options pr-options' },
      trap.options.map((opt) => {
        const btn = h('button', { type: 'button', class: 'pr-option' }, opt.label);
        btn.addEventListener('click', () => {
          Array.from(opts.children).forEach((b) =>
            b.classList.remove('is-selected', 'is-correct', 'is-wrong'),
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
      }),
    );

    trapBody.append(
      h('h3', { class: 'log-trap-title' }, trap.title),
      h('p', { class: 'muted' }, trap.subtitle),
      h('div', { class: 'log-trap-compare' }, [
        h('div', { class: 'log-trap-col is-wrong' }, [
          h('div', { class: 'log-trap-col-head' }, [chalkIcon('cross', 15), ` ${trap.wrongAttempt.author}`]),
          h('ol', {}, trap.wrongAttempt.steps.map((s) => h('li', {}, s))),
        ]),
        h('div', { class: 'log-trap-col is-right' }, [
          h('div', { class: 'log-trap-col-head' }, [chalkIcon('check', 15), ` ${trap.correctResolution.author}`]),
          h('ol', {}, trap.correctResolution.steps.map((s) => h('li', {}, s))),
        ]),
      ]),
      h('p', { class: 'pr-check-prompt' }, trap.question),
      opts,
      feedback,
    );
  }

  TRAPS.forEach((_, idx) => {
    trapChips.appendChild(
      h(
        'button',
        {
          type: 'button',
          class: `chip ${idx === 0 ? 'is-active' : 'chip--ghost'}`,
          on: {
            click: () => {
              playClick();
              renderTrap(idx);
            },
          },
        },
        `Trampa ${idx + 1}`,
      ),
    );
  });

  tabPrng.addEventListener('click', () => {
    playClick();
    tabPrng.classList.add('is-active');
    tabPrng.classList.remove('chip--ghost');
    tabPrng.setAttribute('aria-selected', 'true');
    tabTraps.classList.remove('is-active');
    tabTraps.classList.add('chip--ghost');
    tabTraps.setAttribute('aria-selected', 'false');
    prngPane.hidden = false;
    trapsPane.hidden = true;
  });

  tabTraps.addEventListener('click', () => {
    playClick();
    tabTraps.classList.add('is-active');
    tabTraps.classList.remove('chip--ghost');
    tabTraps.setAttribute('aria-selected', 'true');
    tabPrng.classList.remove('is-active');
    tabPrng.classList.add('chip--ghost');
    tabPrng.setAttribute('aria-selected', 'false');
    trapsPane.hidden = false;
    prngPane.hidden = true;
  });

  renderCascade();
  renderTrap(0);
  root.append(tabsHeader, prngPane, trapsPane);
}

export const initRetosModule = mountLogRetos;
