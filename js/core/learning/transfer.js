/**
 * @file js/core/learning/transfer.js
 * Alaska Math Lab — Modular Inter-Module Transfer & Model Discrimination Engine
 * Plugin/registry architecture supporting 8 mathematical model families
 * (Linear, Quadratic, Polynomial, Rational, Radical/Irrational, Exponential,
 * Logarithmic, Trigonometric) across table invariants, geometry, and AST analysis.
 *
 * ZERO imports from js/modules/*. Zero DOM. Zero eval(). Zero Unicode emojis.
 * Complies with ORIGINAL_REQUEST §R6, PROJECT.md Contract 6, and LEARNING_ARCHITECTURE.md §6.7.
 */

import { createLearningEvent } from './events.js';
import { getProgressStore } from './progress-store.js';
import { resolveCompetencyId } from './competencies.js';
import {
  parseNumberOrFraction,
  equivalentIntervalExactas,
  equivalentMathExpr,
} from './transfer-classifiers/shared-ast.js';
import { BUILTIN_MODEL_CLASSIFIERS } from './transfer-classifiers/index.js';

export const MODEL_TYPES = Object.freeze({
  LINEAR: 'linear',
  QUADRATIC: 'quadratic',
  POLYNOMIAL: 'polynomial',
  RATIONAL: 'rational',
  RADICAL: 'radical',
  IRRATIONAL: 'radical',
  EXPONENTIAL: 'exponential',
  LOGARITHMIC: 'logarithmic',
  TRIGONOMETRIC: 'trigonometric',
  NEITHER: 'neither',
});

export const INVARIANT_TYPES = Object.freeze({
  DELTA_Y_CONSTANT: 'delta_y_constant',
  RATIO_CONSTANT: 'ratio_constant',
  DELTA2_Y_CONSTANT: 'delta2_y_constant',
  DELTA_N_Y_CONSTANT: 'delta_n_y_constant',
  RECIPROCAL_HYPERBOLA: 'reciprocal_hyperbola',
  RADICAL_POWER_LINEAR: 'radical_power_linear',
  LOG_EXP_LINEAR_INVERSE: 'log_exp_linear_inverse',
  TRIG_PERIODIC_WAVE: 'trig_periodic_wave',
  NONE: 'none',
});

export const TRANSFER_FAMILIES = Object.freeze([
  Object.freeze({
    id: 'table_discrimination',
    label: 'Discriminación por Invariantes en Tablas (Δy vs. Razón vs. Δ²y vs. Δ³y)',
    competencyId: 'exponentials.tables_additive_vs_multiplicative',
    models: ['linear', 'quadratic', 'exponential', 'polynomial'],
  }),
  Object.freeze({
    id: 'model_formula_reconstruction',
    label: 'Ajuste Algebraico desde Tabla (Lineal vs. Exponencial vs. Cuadrática)',
    competencyId: 'exponentials.analytical_reconstruction_two_points',
    models: ['linear', 'exponential', 'quadratic'],
  }),
  Object.freeze({
    id: 'geometry_contrast',
    label: 'Contraste Geométrico (Asíntota Horizontal vs. Vértice y Simetría)',
    competencyId: 'quadratics.full_analysis_exactas',
    models: ['quadratic', 'exponential'],
  }),
  Object.freeze({
    id: 'growth_hierarchy',
    label: 'Jerarquía de Crecimiento Asintótico (Lineal vs. Cuadrático vs. Exponencial)',
    competencyId: 'exponentials.time_models_rates_and_euler_base',
    models: ['linear', 'quadratic', 'exponential'],
  }),
  Object.freeze({
    id: 'algebraic_signature',
    label: 'Firma Algebraica, Segundas Diferencias y Cancelación de Grado',
    competencyId: 'quadratics.area_model_and_notable_products',
    models: ['linear', 'quadratic', 'polynomial'],
  }),
  Object.freeze({
    id: 'rational_vs_polynomial_domain',
    label: 'Polinomios vs. Racionales: Dominio, Agujeros Evitables y Asíntotas',
    competencyId: 'rational.domain_holes_and_asymptotes',
    models: ['polynomial', 'rational'],
  }),
  Object.freeze({
    id: 'radical_domain_and_symmetry',
    label: 'Modelos Radicales / Irracionales: Semirrecta de Dominio y √(u²) = |u|',
    competencyId: 'irrational.domain_and_radical_equations',
    models: ['radical'],
  }),
  Object.freeze({
    id: 'logarithmic_exponential_inverse',
    label: 'Logarítmica vs. Exponencial: Simetría Inversa y Asíntota Vertical',
    competencyId: 'logarithms.function_inverse_and_analysis',
    models: ['logarithmic', 'exponential'],
  }),
  Object.freeze({
    id: 'trigonometric_periodic_discrimination',
    label: 'Modelos Trigonométricos: Periodicidad, Amplitud y Dominios Diferenciados',
    competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
    models: ['trigonometric'],
  }),
]);

// Classifier registry (ordered deterministically)
const classifierRegistry = new Map();

/**
 * Registers a model family classifier plugin.
 *
 * @param {object} classifier
 * @param {object} [options]
 * @param {boolean} [options.replace=false]
 */
export function registerModelClassifier(classifier, { replace = false } = {}) {
  if (!classifier || typeof classifier !== 'object' || typeof classifier.id !== 'string' || !classifier.id) {
    throw new TypeError('registerModelClassifier requires a classifier object with a valid string id');
  }
  if (classifierRegistry.has(classifier.id) && !replace) {
    throw new Error(`Model classifier '${classifier.id}' is already registered`);
  }
  classifierRegistry.set(classifier.id, classifier);
  return classifier;
}

/**
 * Retrieves a registered classifier by ID or alias.
 * @param {string} modelId
 * @returns {object|null}
 */
export function getModelClassifier(modelId) {
  if (!modelId || typeof modelId !== 'string') return null;
  const norm = modelId.trim().toLowerCase();
  if (classifierRegistry.has(norm)) return classifierRegistry.get(norm);
  for (const clf of classifierRegistry.values()) {
    if (Array.isArray(clf.aliases) && clf.aliases.includes(norm)) {
      return clf;
    }
  }
  return null;
}

/**
 * Returns all registered model classifiers in registration order.
 * @returns {object[]}
 */
export function getRegisteredModelClassifiers() {
  return Array.from(classifierRegistry.values());
}

// Register all 8 built-in classifiers deterministically
for (const clf of BUILTIN_MODEL_CLASSIFIERS) {
  registerModelClassifier(clf);
}

/**
 * 32-bit PRNG Mulberry32 for deterministic challenge generation.
 */
export function mulberry32(seed) {
  let s = Math.trunc(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Normalizes answer text for robust string matching:
 * - Trims and lowercases
 * - Strips diacritics (acentos)
 * - Converts typographic minus to hyphen
 */
export function normalizeTransferAnswer(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/−/g, '-')
    .replace(/\s+/g, ' ');
}

const TEXT_SYNONYM_GROUPS = Object.freeze([
  ['lineal', 'linear', 'recta', 'afin'],
  ['cuadratica', 'quadratic', 'parabola'],
  ['polinomica', 'polinomio', 'polynomial', 'cubica'],
  ['racional', 'rational', 'homografica'],
  ['radical', 'irracional', 'irrational', 'raiz'],
  ['exponencial', 'exponential'],
  ['logaritmica', 'logaritmo', 'logarithmic'],
  ['trigonometrica', 'trigonometric', 'trig'],
  ['tg y sec', 'sec y tg', 'tangente y secante', 'secante y tangente'],
  ['cotg y cosec', 'cosec y cotg', 'cotangente y cosecante', 'cosecante y cotangente'],
]);

function areCanonicalTextSynonyms(normA, normB) {
  if (normA === normB) return true;
  for (const group of TEXT_SYNONYM_GROUPS) {
    if (group.includes(normA) && group.includes(normB)) {
      return true;
    }
  }
  return false;
}

/**
 * Validates user input against a transfer challenge using AST mathematical equivalence
 * for expressions/intervals/numbers, or normalized string + synonym comparison for conceptual tokens.
 *
 * @param {object} challenge
 * @param {string} rawInput
 * @returns {{ ok: boolean, empty?: boolean, syntaxError?: string }}
 */
export function validateTransferAnswer(challenge, rawInput) {
  const trimmed = String(rawInput ?? '').trim();
  if (!trimmed) {
    return { ok: false, empty: true };
  }
  if (!challenge || typeof challenge !== 'object') {
    return { ok: false };
  }

  const expectedStr = String(challenge.expected ?? challenge.expectedAnswer ?? '');

  if (challenge.inputKind === 'number') {
    try {
      const val = parseNumberOrFraction(trimmed);
      const expVal = parseNumberOrFraction(expectedStr);
      return { ok: Math.abs(val - expVal) < 1e-5 };
    } catch {
      return { ok: false, syntaxError: 'Ingresá un número o fracción válida.' };
    }
  }

  if (challenge.inputKind === 'interval') {
    try {
      if (equivalentIntervalExactas(trimmed, expectedStr)) {
        return { ok: true };
      }
      return { ok: false };
    } catch (err) {
      return { ok: false, syntaxError: err?.message || 'Formato de intervalo inválido.' };
    }
  }

  if (challenge.inputKind === 'expression') {
    if (equivalentMathExpr(trimmed, expectedStr)) {
      return { ok: true };
    }
  }

  const normUser = normalizeTransferAnswer(trimmed);
  const normExp = normalizeTransferAnswer(expectedStr);
  if (areCanonicalTextSynonyms(normUser, normExp)) {
    return { ok: true };
  }

  // Also allow e.g. "f(x)" when expected is "f"
  if (normExp.length === 1 && normUser === `${normExp}(x)`) {
    return { ok: true };
  }

  return { ok: false };
}

/**
 * Analyzes numerical points across all registered classifiers to identify the model family.
 *
 * @param {Array<{x: number, y: number}>} points
 * @param {number} [tolerance=1e-5]
 * @returns {object}
 */
export function classifyModelByTable(points, tolerance = 1e-5) {
  if (!Array.isArray(points) || points.length < 3) {
    return {
      model: MODEL_TYPES.NEITHER,
      invariant: INVARIANT_TYPES.NONE,
      deltaX: 0,
      explanation: 'Se requieren al menos 3 puntos con paso Δx uniforme para discriminar modelos.',
    };
  }

  const deltaX = points[1].x - points[0].x;
  if (!Number.isFinite(deltaX) || Math.abs(deltaX) < tolerance) {
    return {
      model: MODEL_TYPES.NEITHER,
      invariant: INVARIANT_TYPES.NONE,
      deltaX: 0,
      explanation: 'Los valores de x deben ser distintos y ordenados.',
    };
  }

  for (let i = 1; i < points.length; i++) {
    const curDx = points[i].x - points[i - 1].x;
    if (!Number.isFinite(curDx) || Math.abs(curDx - deltaX) > tolerance) {
      return {
        model: MODEL_TYPES.NEITHER,
        invariant: INVARIANT_TYPES.NONE,
        deltaX,
        explanation: 'El paso Δx en la tabla no es uniforme.',
      };
    }
  }

  const ordered = getRegisteredModelClassifiers().sort(
    (a, b) => (b.priority?.table ?? 0) - (a.priority?.table ?? 0)
  );

  for (const clf of ordered) {
    if (typeof clf.matchTable === 'function') {
      const res = clf.matchTable(points, tolerance);
      if (res && res.matched) {
        return res;
      }
    }
  }

  return {
    model: MODEL_TYPES.NEITHER,
    invariant: INVARIANT_TYPES.NONE,
    deltaX,
    explanation: 'Los datos de la tabla no responden a un único invariante de las 8 familias estudiadas.',
  };
}

/**
 * Classifies a model based on geometric and qualitative features.
 *
 * @param {object} [features={}]
 * @returns {object}
 */
export function classifyModelByGeometry(features = {}) {
  const ordered = getRegisteredModelClassifiers().sort(
    (a, b) => (b.priority?.geometry ?? 0) - (a.priority?.geometry ?? 0)
  );

  for (const clf of ordered) {
    if (typeof clf.matchGeometry === 'function') {
      const res = clf.matchGeometry(features);
      if (res && res.matched) {
        return res;
      }
    }
  }

  return {
    model: MODEL_TYPES.NEITHER,
    signatureFeature: 'indeterminado',
    explanation: 'Las características geométricas proporcionadas no permiten discriminar el modelo de forma concluyente.',
  };
}

/**
 * Classifies an algebraic expression string across all 8 model families using pure AST analysis.
 *
 * @param {string} exprStr
 * @param {object} [ctx={}]
 * @returns {object}
 */
export function classifyModelByAnalytical(exprStr, ctx = {}) {
  const raw = String(exprStr || '').trim();
  if (!raw) {
    return {
      model: MODEL_TYPES.NEITHER,
      signature: 'desconocida',
      explanation: 'Expresión vacía.',
    };
  }

  const ordered = getRegisteredModelClassifiers().sort(
    (a, b) => (b.priority?.analytical ?? 0) - (a.priority?.analytical ?? 0)
  );

  for (const clf of ordered) {
    if (typeof clf.matchAnalytical === 'function') {
      const res = clf.matchAnalytical(raw, ctx);
      if (res && res.matched) {
        return res;
      }
    }
  }

  return {
    model: MODEL_TYPES.NEITHER,
    signature: 'desconocida',
    explanation: 'La expresión no corresponde a las 8 familias de modelos estudiadas.',
  };
}

/**
 * Unified model classification facade dispatching to table, geometry, or analytical classifier.
 *
 * @param {Array|object|string} input
 * @param {'auto'|'table'|'geometry'|'analytical'} [mode='auto']
 * @returns {object}
 */
export function classifyModel(input, mode = 'auto') {
  if (mode === 'table' || (mode === 'auto' && Array.isArray(input))) {
    return classifyModelByTable(input);
  }
  if (mode === 'analytical' || (mode === 'auto' && typeof input === 'string')) {
    return classifyModelByAnalytical(input);
  }
  if (mode === 'geometry' || (mode === 'auto' && input && typeof input === 'object')) {
    return classifyModelByGeometry(input);
  }
  return {
    model: MODEL_TYPES.NEITHER,
    explanation: 'Entrada no reconocida para clasificación de modelo.',
  };
}

function isCompetencyIntroduced(competencyId, progressStore) {
  if (!competencyId || !progressStore) return false;
  const canonical = resolveCompetencyId(competencyId) || competencyId;
  const entry = progressStore.getCompetencyState(canonical);
  return Boolean(entry && entry.status && entry.status !== 'unseen');
}

function isCandidateEligible(candidate, progressStore) {
  const ids = Array.isArray(candidate?.competencyIds) ? candidate.competencyIds : [];
  if (ids.length === 0) return false;
  return ids.every((cid) => isCompetencyIntroduced(cid, progressStore));
}

function normalizeChallengeShape(ch) {
  const expected = String(ch.expected ?? ch.expectedAnswer ?? ch.answer ?? '');
  const competencyIds = Array.isArray(ch.competencyIds) ? [...ch.competencyIds] : [];
  const diagnostics = Array.isArray(ch.diagnostics)
    ? [...ch.diagnostics]
    : (Array.isArray(ch.diagnosticIds) ? [...ch.diagnosticIds] : []);
  return {
    ...ch,
    moduleId: ch.moduleId || 'general',
    competencyId: ch.competencyId || competencyIds[0] || null,
    competencyIds,
    expected,
    expectedAnswer: expected,
    answer: expected,
    diagnostics,
    diagnosticIds: diagnostics,
    stage: 'transfer',
    transferDistance: 'far',
  };
}

function buildCandidatePool(rng, seed, problemIndex) {
  const pool = [];
  for (const clf of getRegisteredModelClassifiers()) {
    if (typeof clf.generateChallenges === 'function') {
      const list = clf.generateChallenges(rng, seed, problemIndex);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.family) {
            pool.push(normalizeChallengeShape(item));
          }
        }
      }
    }
  }
  return pool;
}

/**
 * Checks whether a transfer challenge family has at least one eligible variant
 * whose competencies have all been introduced in the progress store.
 *
 * @param {string} familyId
 * @param {object} [store]
 * @returns {boolean}
 */
export function isTransferFamilyEligible(familyId, store = null) {
  const progressStore = store || getProgressStore();
  const pool = buildCandidatePool(mulberry32(1013), 0, 0);
  const familyCandidates =
    !familyId || familyId === 'all' || familyId === 'aleatorio'
      ? pool
      : pool.filter((c) => c.family === familyId);
  return familyCandidates.some((c) => isCandidateEligible(c, progressStore));
}

/**
 * Returns all TRANSFER_FAMILIES entries currently eligible in the progress store.
 *
 * @param {object} [store]
 * @returns {object[]}
 */
export function getEligibleTransferFamilies(store = null) {
  const progressStore = store || getProgressStore();
  return TRANSFER_FAMILIES.filter((fam) => isTransferFamilyEligible(fam.id, progressStore));
}

/**
 * Generates a deterministic inter-module transfer challenge.
 * Supports both positional `(seed, family, problemIndex, extraOptions)`
 * and options-object `({ seed, family, problemIndex, store, allowUnseen })` signatures.
 *
 * Strict Unseen Guard (`allowUnseen = false` by default):
 * Returns `null` if zero candidate variants have all their `competencyIds` introduced (`status !== 'unseen'`).
 *
 * @param {number|object} seedOrOptions
 * @param {string} [family='all']
 * @param {number} [problemIndex=0]
 * @param {object} [extraOptions={}]
 * @returns {object|null}
 */
export function generateTransferChallenge(
  seedOrOptions,
  family = 'all',
  problemIndex = 0,
  extraOptions = {}
) {
  let seed = 1;
  let resolvedFamilyArg = family;
  let idx = problemIndex;
  let options = extraOptions || {};

  if (seedOrOptions && typeof seedOrOptions === 'object' && !Array.isArray(seedOrOptions)) {
    seed = seedOrOptions.seed ?? 1;
    resolvedFamilyArg = seedOrOptions.family ?? 'all';
    idx = seedOrOptions.problemIndex ?? 0;
    options = seedOrOptions;
  } else {
    seed = seedOrOptions ?? 1;
  }

  const allowUnseen = options.allowUnseen === true;
  const progressStore = options.store || getProgressStore();
  const rng = mulberry32((Number(seed) + Number(idx) * 7919 + 1013) >>> 0);

  const pool = buildCandidatePool(rng, seed, idx);
  const isAll = !resolvedFamilyArg || resolvedFamilyArg === 'all' || resolvedFamilyArg === 'aleatorio';

  const scopedPool = isAll ? pool : pool.filter((c) => c.family === resolvedFamilyArg);
  const candidates = allowUnseen
    ? scopedPool
    : scopedPool.filter((c) => isCandidateEligible(c, progressStore));

  if (candidates.length === 0) {
    return null;
  }

  // Pick deterministically across eligible families first, then variant within family
  const familiesPresent = Array.from(new Set(candidates.map((c) => c.family)));
  const chosenFamily = isAll
    ? familiesPresent[(Math.floor(rng() * familiesPresent.length) + Number(idx)) % familiesPresent.length]
    : resolvedFamilyArg;

  const familyVariants = candidates.filter((c) => c.family === chosenFamily);
  const chosen = familyVariants[Math.floor(rng() * familyVariants.length) % familyVariants.length];

  return chosen || candidates[0];
}

/**
 * Emits and records a normalized transfer learning event to the ProgressStore.
 *
 * @param {object} params
 * @returns {object} The created LearningEvent
 */
export function recordTransferAttempt({
  moduleId = 'general',
  exerciseId,
  competencyIds = ['exponentials.tables_additive_vs_multiplicative', 'quadratics.sum_product_factoring'],
  correct = false,
  hintsUsed = 0,
  solutionRevealed = false,
  diagnosticId = null,
  representation = 'symbolic',
  store = null,
} = {}) {
  const event = createLearningEvent({
    type: 'answer_submitted',
    moduleId,
    exerciseId,
    competencyIds,
    correct,
    assistance: solutionRevealed ? 'solution_revealed' : (hintsUsed > 0 ? 'hints' : 'none'),
    hintsUsed,
    solutionRevealed,
    diagnosticId,
    representation,
    stage: 'transfer',
    transferDistance: 'far',
  });

  const progressStore = store || getProgressStore();
  progressStore.recordLearningEvent(event);
  return event;
}
