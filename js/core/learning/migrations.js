/**
 * @file js/core/learning/migrations.js
 * Non-destructive legacy migration engine preserving 100% of existing storage keys
 * (exponenciales:progreso:v1, cuadraticas:progreso:v1, potencias_raices:progreso:v1,
 * valor_absoluto:progreso:v1, sucesiones:progreso:v1) while transforming legacy state
 * into the unified alaska:learning:v1 store and retroactively fixing the single-success mastery bug.
 *
 * Complies with ORIGINAL_REQUEST §R2, PROJECT.md Contract 2, and LEARNING_ARCHITECTURE.md §6.9.
 * Runtime: Vanilla ES2022. Zero external dependencies. Zero eval. Zero emojis.
 */

import { createDefaultCompetencyEntry, createDefaultStoreState } from './progress-store.js';
import { resolveCompetencyId } from './competencies.js';

export const LEGACY_KEY_EXP = 'exponenciales:progreso:v1';
export const LEGACY_KEY_CUAD = 'cuadraticas:progreso:v1';
export const LEGACY_KEY_POW = 'potencias_raices:progreso:v1';
export const LEGACY_KEY_ABS = 'valor_absoluto:progreso:v1';
export const LEGACY_KEY_SEQ = 'sucesiones:progreso:v1';
export const TARGET_KEY = 'alaska:learning:v1';
export const SCHEMA_VERSION = 1;

const LEGACY_EXP_ALIAS_MAP = Object.freeze({
  'exponentials.base_and_initial_value_roles': 'exponentials.neutral_and_order_of_operations',
  'exponentials.continuous_extension_and_restrictions': 'exponentials.rational_density_and_base_restrictions',
  'exponentials.asymptote_and_horizontal_reflection': 'exponentials.base_reflection_and_asymptote',
  'exponentials.quadrant_monotonicity': 'exponentials.four_quadrants_monotonicity',
  'exponentials.half_life_and_compound_periods': 'exponentials.time_models_rates_and_euler_base',
  'exponentials.asymptote_shifts_and_image': 'exponentials.shifts_and_horizontal_asymptote',
  'exponentials.equations_bases_factoring_substitution': 'exponentials.equations_three_methods_in_reals',
  'exponentials.table_discrimination_additive_vs_multiplicative': 'exponentials.tables_additive_vs_multiplicative',
  'exponentials.neutral_exponent_zero_and_hierarchy_k_a_x': 'exponentials.neutral_and_order_of_operations',
  'exponentials.continuous_bridge_rational_density_and_base_restrictions': 'exponentials.rational_density_and_base_restrictions',
  'exponentials.base_reflection_symmetry_and_decay': 'exponentials.base_reflection_and_asymptote',
  'exponentials.four_quadrants_k_a_and_monotonicity': 'exponentials.four_quadrants_monotonicity',
  'exponentials.two_point_reconstruction': 'exponentials.analytical_reconstruction_two_points',
  'exponentials.time_models_percentages_and_base_e': 'exponentials.time_models_rates_and_euler_base',
  'exponentials.shifts_and_open_asymptote': 'exponentials.shifts_and_horizontal_asymptote',
  'exponentials.full_function_analysis': 'exponentials.full_analytical_study',
  'exponentials.exponential_equations_three_methods': 'exponentials.equations_three_methods_in_reals',
});

const LEGACY_CUAD_ALIAS_MAP = Object.freeze({
  'quadratics.parabola_geometry_and_parameters': 'quadratics.canonical_form_and_vertex',
  'quadratics.vertex_symmetry_canonical': 'quadratics.canonical_form_and_vertex',
  'quadratics.roots_and_factored_form': 'quadratics.factored_form_and_symmetry',
  'quadratics.full_analytical_study': 'quadratics.full_analysis_exactas',
  'quadratics.line_parabola_intersection': 'quadratics.parabola_line_tangency',
});

function resolveExpCompId(rawId) {
  const fromAlias = LEGACY_EXP_ALIAS_MAP[rawId];
  if (fromAlias) return fromAlias;
  const fromRegistry = resolveCompetencyId(rawId);
  return LEGACY_EXP_ALIAS_MAP[fromRegistry] || fromRegistry;
}

function resolveCuadCompId(rawId) {
  const fromAlias = LEGACY_CUAD_ALIAS_MAP[rawId];
  if (fromAlias) return fromAlias;
  const fromRegistry = resolveCompetencyId(rawId);
  return LEGACY_CUAD_ALIAS_MAP[fromRegistry] || fromRegistry;
}

function isPollutedStorageKey(key) {
  return key === 'trampas-clasicas' || key === 'challenge:last' || /^seed-/.test(key);
}

export const EXP_ITEM_TO_COMPETENCY = Object.freeze({
  'sec1-q1': 'exponentials.tables_additive_vs_multiplicative',
  'sec1-q2': 'exponentials.tables_additive_vs_multiplicative',
  'sec1-q3': 'exponentials.tables_additive_vs_multiplicative',
  'sec-1': 'exponentials.tables_additive_vs_multiplicative',
  'sec2-q1': 'exponentials.neutral_and_order_of_operations',
  'sec2-q2': 'exponentials.neutral_and_order_of_operations',
  'sec2-q3': 'exponentials.neutral_and_order_of_operations',
  'sec-2': 'exponentials.neutral_and_order_of_operations',
  'sec3-q1': 'exponentials.rational_density_and_base_restrictions',
  'sec3-q2': 'exponentials.rational_density_and_base_restrictions',
  'sec3-q3': 'exponentials.rational_density_and_base_restrictions',
  'sec-3': 'exponentials.rational_density_and_base_restrictions',
  'sec4-q1': 'exponentials.base_reflection_and_asymptote',
  'sec4-q2': 'exponentials.base_reflection_and_asymptote',
  'sec4-q3': 'exponentials.base_reflection_and_asymptote',
  'sec-4': 'exponentials.base_reflection_and_asymptote',
  'sec5-q1': 'exponentials.four_quadrants_monotonicity',
  'sec5-q2': 'exponentials.four_quadrants_monotonicity',
  'sec5-q3': 'exponentials.four_quadrants_monotonicity',
  'sec-5': 'exponentials.four_quadrants_monotonicity',
  'sec6-q1': 'exponentials.analytical_reconstruction_two_points',
  'sec6-q2': 'exponentials.analytical_reconstruction_two_points',
  'sec6-q3': 'exponentials.analytical_reconstruction_two_points',
  'sec-6': 'exponentials.analytical_reconstruction_two_points',
  'sec7-q1': 'exponentials.time_models_rates_and_euler_base',
  'sec7-q2': 'exponentials.time_models_rates_and_euler_base',
  'sec7-q3': 'exponentials.time_models_rates_and_euler_base',
  'sec-7': 'exponentials.time_models_rates_and_euler_base',
  'sec8-q1': 'exponentials.shifts_and_horizontal_asymptote',
  'sec8-q2': 'exponentials.shifts_and_horizontal_asymptote',
  'sec8-q3': 'exponentials.shifts_and_horizontal_asymptote',
  'sec-8': 'exponentials.shifts_and_horizontal_asymptote',
  'sec9-q1': 'exponentials.full_analytical_study',
  'sec9-q2': 'exponentials.full_analytical_study',
  'sec9-q3': 'exponentials.full_analytical_study',
  'sec-9': 'exponentials.full_analytical_study',
  'sec10-q1': 'exponentials.equations_three_methods_in_reals',
  'sec10-q2': 'exponentials.equations_three_methods_in_reals',
  'sec10-q3': 'exponentials.equations_three_methods_in_reals',
  'sec-10': 'exponentials.equations_three_methods_in_reals',
});

export const CUAD_ITEM_TO_COMPETENCY = Object.freeze({
  'sec1-q1': 'quadratics.area_model_and_notable_products',
  'sec1-q2': 'quadratics.area_model_and_notable_products',
  'sec1-q3': 'quadratics.area_model_and_notable_products',
  'sec-area-binomios': 'quadratics.area_model_and_notable_products',
  'sec2-q1': 'quadratics.sum_product_factoring',
  'sec2-q2': 'quadratics.sum_product_factoring',
  'sec2-q3': 'quadratics.sum_product_factoring',
  'sec-balanza-suma-producto': 'quadratics.sum_product_factoring',
  'sec3-q1': 'quadratics.grouping_and_factoring_strategy',
  'sec3-q2': 'quadratics.grouping_and_factoring_strategy',
  'sec3-q3': 'quadratics.grouping_and_factoring_strategy',
  'sec-agrupacion-estrategia': 'quadratics.grouping_and_factoring_strategy',
  'sec4-q1': 'quadratics.canonical_form_and_vertex',
  'sec4-q2': 'quadratics.canonical_form_and_vertex',
  'sec4-q3': 'quadratics.canonical_form_and_vertex',
  'sec-canonica-vertice': 'quadratics.canonical_form_and_vertex',
  'sec5-q1': 'quadratics.factored_form_and_symmetry',
  'sec5-q2': 'quadratics.factored_form_and_symmetry',
  'sec5-q3': 'quadratics.factored_form_and_symmetry',
  'sec-factorizada-simetria': 'quadratics.factored_form_and_symmetry',
  'sec6-q1': 'quadratics.completing_the_square',
  'sec6-q2': 'quadratics.completing_the_square',
  'sec6-q3': 'quadratics.completing_the_square',
  'sec-completar-cuadrado': 'quadratics.completing_the_square',
  'sec7-q1': 'quadratics.discriminant_and_vieta',
  'sec7-q2': 'quadratics.discriminant_and_vieta',
  'sec7-q3': 'quadratics.discriminant_and_vieta',
  'sec-discriminante-vieta': 'quadratics.discriminant_and_vieta',
  'sec8-q1': 'quadratics.full_analysis_exactas',
  'sec8-q2': 'quadratics.full_analysis_exactas',
  'sec8-q3': 'quadratics.full_analysis_exactas',
  'sec-radiografia-cuadratica': 'quadratics.full_analysis_exactas',
  'sec9-q1': 'quadratics.parabola_line_tangency',
  'sec9-q2': 'quadratics.parabola_line_tangency',
  'sec9-q3': 'quadratics.parabola_line_tangency',
  'sec-interseccion-recta-parabola': 'quadratics.parabola_line_tangency',
  'sec10-q1': 'quadratics.extremum_optimization',
  'sec10-q2': 'quadratics.extremum_optimization',
  'sec10-q3': 'quadratics.extremum_optimization',
  'sec-optimizacion-extremos': 'quadratics.extremum_optimization',
});

export const POW_SECTION_TO_COMPETENCY = Object.freeze({
  'sec-1': 'powers.additive_vs_multiplicative_worlds',
  'sec-2': 'powers.negative_exponents_and_reciprocals',
  'sec-3': 'powers.quotient_and_product_laws',
  'sec-4': 'powers.rational_exponents_and_nth_roots',
  'sec-5': 'powers.geometric_squares_and_cubes',
  'sec-6': 'powers.prime_factor_tree_extraction',
  'sec-7': 'powers.radical_simplification_and_rationalization',
  'sec-8': 'powers.binomial_power_non_distributivity',
  'sec-9': 'powers.real_domain_restrictions_and_abs_root',
  'sec-10': 'powers.precedence_and_paradox_auditing',
});

export const ABS_SECTION_TO_COMPETENCY = Object.freeze({
  'sec-1': 'abs.distance_1d_and_equations',
  'sec-2': 'abs.cartesian_mirror_parent',
  'sec-3': 'abs.translations_vertex_hk',
  'sec-4': 'abs.vertical_scale_and_reflection',
  'sec-5': 'abs.canonical_form_synthesis',
  'sec-6': 'abs.piecewise_decomposition',
  'sec-7': 'abs.full_analytical_study_and_inequalities',
  'sec-8': 'abs.piecewise_domain_customs',
  'sec-9': 'abs.boundary_continuity_and_uniqueness',
  'sec-10': 'abs.step_floor_and_ceiling',
});

export const SEQ_SECTION_TO_COMPETENCY = Object.freeze({
  'sec-1': 'sequences.pattern_recognition_and_classification',
  'sec-2': 'sequences.pattern_recognition_and_classification',
  'sec-3': 'sequences.discrete_domain_and_notation',
  'sec-4': 'sequences.recursive_formulas',
  'sec-5a': 'sequences.arithmetic_explicit_and_membership',
  'sec-5b': 'sequences.arithmetic_explicit_and_membership',
  'sec-6': 'sequences.arithmetic_explicit_and_membership',
  'sec-7': 'sequences.arithmetic_explicit_and_membership',
  'sec-8': 'sequences.geometric_explicit_and_models',
  'sec-9': 'sequences.geometric_explicit_and_models',
  'sec-10': 'sequences.geometric_explicit_and_models',
  'sec-11': 'sequences.asymptotic_behavior_intuition',
});

function resolveFlatSectionKey(itemKey, sectionMap) {
  if (!itemKey || isPollutedStorageKey(itemKey)) return null;
  if (sectionMap[itemKey]) return { compId: sectionMap[itemKey], isSectionOnly: true };

  // Handle 'sec-N:idx' (potencias-raices check keys)
  const colonMatch = itemKey.match(/^(sec-(?:\d+|5[ab])):(\d+)$/);
  if (colonMatch && sectionMap[colonMatch[1]]) {
    return { compId: sectionMap[colonMatch[1]], isSectionOnly: false };
  }

  // Handle 'secN-qK' or 'sec5a-qK'
  const qMatch = itemKey.match(/^sec(\d+|5[ab])-q\d+$/);
  if (qMatch) {
    const secKey = `sec-${qMatch[1]}`;
    if (sectionMap[secKey]) {
      return { compId: sectionMap[secKey], isSectionOnly: false };
    }
  }

  return null;
}

function applyFlatItemToCompetencies(competencies, compId, itemKey, value, isSectionOnly) {
  if (!competencies[compId]) {
    competencies[compId] = createDefaultCompetencyEntry(compId);
  }
  const entry = competencies[compId];

  const normalizedVal = (value && typeof value === 'object' && typeof value.status === 'string')
    ? value.status
    : value;

  if (normalizedVal === 'independent') {
    entry.independentCount += 1;
    entry.independentCorrect += 1;
    entry.attempts += 1;
    if (!entry.distinctExercises.includes(itemKey)) {
      entry.distinctExercises.push(itemKey);
    }
  } else if (normalizedVal === 'assisted') {
    entry.assistedCount += 1;
    entry.assistedCorrect += 1;
    entry.attempts += 1;
  } else if (normalizedVal === true) {
    if (isSectionOnly) {
      if (entry.status === 'unseen') {
        entry.status = 'introduced';
      }
    } else {
      // Legacy boolean on item without assistance tracking: treat conservatively as assisted
      entry.assistedCount += 1;
      entry.assistedCorrect += 1;
      entry.attempts += 1;
    }
  }

  if (entry.status !== 'needs_repair') {
    if (entry.independentCount >= 2) {
      entry.status = 'consolidating';
    } else if (entry.independentCount === 1 || entry.assistedCount >= 1) {
      entry.status = 'developing';
    }
  }
}

/**
 * Pure transformer for legacy Exponenciales progress data.
 * Actively fixes the single-success bug: 1 independent success maps to developing.
 * Normalizes legacy aliases to canonical IDs.
 *
 * @param {object} legacyData
 * @returns {{ competencies: Record<string, object>, migratedCount: number }}
 */
export function transformLegacyExpProgress(legacyData) {
  if (!legacyData || typeof legacyData !== 'object' || Array.isArray(legacyData)) {
    return { competencies: {}, migratedCount: 0 };
  }

  const competencies = {};

  // Case A: legacyData has explicit competencies map
  if (legacyData.competencies && typeof legacyData.competencies === 'object') {
    for (const [rawCompId, legacyEntry] of Object.entries(legacyData.competencies)) {
      if (!legacyEntry || typeof legacyEntry !== 'object') continue;
      const compId = resolveExpCompId(rawCompId);

      const attempts = Number(legacyEntry.attempts) || 0;
      const independentCount = Number(legacyEntry.independentCount) || Number(legacyEntry.independentCorrect) || 0;
      const assistedCount = Number(legacyEntry.assistedCount) || Number(legacyEntry.assistedCorrect) || 0;
      const errorCount = Number(legacyEntry.errorCount) || 0;

      let status = 'unseen';

      // RETROACTIVE SINGLE-SUCCESS BUG REPAIR
      if (legacyEntry.status === 'mastered') {
        if (independentCount >= 2) {
          status = 'consolidating';
        } else {
          status = 'developing';
        }
      } else if (legacyEntry.status === 'assisted') {
        status = 'developing';
      } else if (legacyEntry.status === 'pending') {
        if (errorCount >= 2) {
          status = 'needs_repair';
        } else if (attempts > 0 || assistedCount > 0 || independentCount > 0) {
          status = 'developing';
        } else {
          status = 'unseen';
        }
      } else if (typeof legacyEntry.status === 'string') {
        status = legacyEntry.status;
      }

      const entry = createDefaultCompetencyEntry(compId);
      entry.status = status;
      entry.attempts = attempts;
      entry.independentCount = independentCount;
      entry.independentCorrect = independentCount;
      entry.assistedCount = assistedCount;
      entry.assistedCorrect = assistedCount;
      entry.errorCount = errorCount;

      if (Array.isArray(legacyEntry.diagnostics)) {
        entry.diagnostics = [...legacyEntry.diagnostics];
        entry.recentDiagnosticIds = [...legacyEntry.diagnostics];
      }

      competencies[compId] = entry;
    }
  }

  // Case B: legacyData has flat question keys (sec1-q1, etc.) or checks map
  const flatSource = legacyData.checks && typeof legacyData.checks === 'object'
    ? { ...legacyData, ...legacyData.checks }
    : legacyData;

  for (const [itemKey, value] of Object.entries(flatSource)) {
    if (isPollutedStorageKey(itemKey)) continue;
    const compId = EXP_ITEM_TO_COMPETENCY[itemKey];
    if (!compId) continue;

    applyFlatItemToCompetencies(competencies, compId, itemKey, value, itemKey.startsWith('sec-'));
  }

  return { competencies, migratedCount: Object.keys(competencies).length };
}

/**
 * Pure transformer for legacy Cuadráticas progress data.
 *
 * @param {object} legacyData
 * @returns {{ competencies: Record<string, object>, migratedCount: number }}
 */
export function transformLegacyCuadProgress(legacyData) {
  if (!legacyData || typeof legacyData !== 'object' || Array.isArray(legacyData)) {
    return { competencies: {}, migratedCount: 0 };
  }

  const competencies = {};

  if (legacyData.competencies && typeof legacyData.competencies === 'object') {
    for (const [rawCompId, legacyEntry] of Object.entries(legacyData.competencies)) {
      if (!legacyEntry || typeof legacyEntry !== 'object') continue;
      const compId = resolveCuadCompId(rawCompId);
      const entry = createDefaultCompetencyEntry(compId);
      entry.attempts = Number(legacyEntry.attempts) || 0;
      entry.independentCount = Number(legacyEntry.independentCount) || Number(legacyEntry.independentCorrect) || 0;
      entry.independentCorrect = entry.independentCount;
      entry.assistedCount = Number(legacyEntry.assistedCount) || Number(legacyEntry.assistedCorrect) || 0;
      entry.assistedCorrect = entry.assistedCount;
      entry.errorCount = Number(legacyEntry.errorCount) || 0;
      if (typeof legacyEntry.status === 'string') {
        entry.status = legacyEntry.status === 'mastered'
          ? (entry.independentCount >= 2 ? 'consolidating' : 'developing')
          : legacyEntry.status;
      }
      competencies[compId] = entry;
    }
  }

  for (const [itemKey, value] of Object.entries(legacyData)) {
    if (isPollutedStorageKey(itemKey)) continue;
    const compId = CUAD_ITEM_TO_COMPETENCY[itemKey];
    if (!compId) continue;

    applyFlatItemToCompetencies(competencies, compId, itemKey, value, itemKey.startsWith('sec-'));
  }

  return { competencies, migratedCount: Object.keys(competencies).length };
}

function transformFlatModuleProgress(legacyData, sectionMap) {
  if (!legacyData || typeof legacyData !== 'object' || Array.isArray(legacyData)) {
    return { competencies: {}, migratedCount: 0 };
  }

  const competencies = {};

  // Support optional nested items/checks map alongside flat keys
  const flatItems = legacyData.items && typeof legacyData.items === 'object'
    ? { ...legacyData, ...legacyData.items }
    : legacyData;

  for (const [itemKey, value] of Object.entries(flatItems)) {
    if (isPollutedStorageKey(itemKey) || itemKey === 'items') continue;
    const resolved = resolveFlatSectionKey(itemKey, sectionMap);
    if (!resolved) continue;

    applyFlatItemToCompetencies(competencies, resolved.compId, itemKey, value, resolved.isSectionOnly);
  }

  return { competencies, migratedCount: Object.keys(competencies).length };
}

export function transformLegacyPowProgress(legacyData) {
  return transformFlatModuleProgress(legacyData, POW_SECTION_TO_COMPETENCY);
}

export function transformLegacyAbsProgress(legacyData) {
  return transformFlatModuleProgress(legacyData, ABS_SECTION_TO_COMPETENCY);
}

export function transformLegacySeqProgress(legacyData) {
  return transformFlatModuleProgress(legacyData, SEQ_SECTION_TO_COMPETENCY);
}

const LEGACY_MODULE_SPECS = Object.freeze([
  { moduleId: 'exponenciales', stampKey: 'exponenciales', storageKey: LEGACY_KEY_EXP, transform: transformLegacyExpProgress },
  { moduleId: 'cuadraticas', stampKey: 'cuadraticas', storageKey: LEGACY_KEY_CUAD, transform: transformLegacyCuadProgress },
  { moduleId: 'potencias-raices', stampKey: 'potencias_raices', storageKey: LEGACY_KEY_POW, transform: transformLegacyPowProgress },
  { moduleId: 'valor-absoluto', stampKey: 'valor_absoluto', storageKey: LEGACY_KEY_ABS, transform: transformLegacyAbsProgress },
  { moduleId: 'sucesiones', stampKey: 'sucesiones', storageKey: LEGACY_KEY_SEQ, transform: transformLegacySeqProgress },
]);

/**
 * Determines whether legacy progress needs to be migrated.
 * @param {object} [storage]
 * @returns {boolean}
 */
export function isMigrationNeeded(storage) {
  const store = storage !== undefined && storage !== null
    ? storage
    : (typeof localStorage !== 'undefined' ? localStorage : null);

  if (!store || typeof store.getItem !== 'function') return false;

  try {
    const rawTarget = store.getItem(TARGET_KEY);
    let target = null;
    if (rawTarget) {
      target = JSON.parse(rawTarget);
    }

    const migratedModules = target?.meta?.migratedModules || [];
    const stamps = target?.meta?.migratedFromLegacy || {};

    for (const spec of LEGACY_MODULE_SPECS) {
      if (Boolean(store.getItem(spec.storageKey))) {
        if (!migratedModules.includes(spec.moduleId) && !stamps[spec.stampKey]) {
          return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Migrates legacy progress non-destructively to alaska:learning:v1.
 * Preserves 100% of legacy keys without clearing or modifying them.
 *
 * @param {object} [storage]
 * @returns {{ success: boolean, alreadyMigrated: boolean, migratedModules: string[], competenciesMigrated: number, errors: string[] }}
 */
export function migrateLegacyProgress(storage) {
  const store = storage !== undefined && storage !== null
    ? storage
    : (typeof localStorage !== 'undefined' ? localStorage : null);

  if (!store || typeof store.getItem !== 'function' || typeof store.setItem !== 'function') {
    return {
      success: false,
      alreadyMigrated: false,
      migratedModules: [],
      competenciesMigrated: 0,
      errors: ['Storage is not available in environment'],
    };
  }

  const errors = [];
  let targetState = createDefaultStoreState();
  let alreadyMigrated = false;

  // 1. Read existing target state safely
  try {
    const rawTarget = store.getItem(TARGET_KEY);
    if (rawTarget) {
      const parsed = JSON.parse(rawTarget);
      if (parsed && typeof parsed === 'object') {
        targetState = parsed;
        if (!targetState.competencies) targetState.competencies = {};
        if (!targetState.events) targetState.events = [];
        if (!targetState.meta) targetState.meta = {};
      }
    }
  } catch (err) {
    errors.push(`Target store parse warning: ${err.message}`);
  }

  if (!targetState.meta) {
    targetState.meta = {};
  }
  if (!Array.isArray(targetState.meta.migratedModules)) {
    targetState.meta.migratedModules = [];
  }
  if (!targetState.meta.migratedFromLegacy || typeof targetState.meta.migratedFromLegacy !== 'object') {
    targetState.meta.migratedFromLegacy = {};
  }

  const prevMigrated = targetState.meta.migratedModules;
  const migratedModules = [...prevMigrated];
  const rawSnapshots = {};
  let totalCompetenciesMigrated = 0;
  let allPresentAlreadyMigrated = true;

  for (const spec of LEGACY_MODULE_SPECS) {
    let raw = null;
    try {
      raw = store.getItem(spec.storageKey);
    } catch (err) {
      errors.push(`Failed to read ${spec.storageKey}: ${err.message}`);
    }

    if (!raw) continue;
    rawSnapshots[spec.storageKey] = raw;

    const wasMigrated = prevMigrated.includes(spec.moduleId) || Boolean(targetState.meta.migratedFromLegacy[spec.stampKey]);
    if (!wasMigrated) {
      allPresentAlreadyMigrated = false;
      try {
        const parsed = JSON.parse(raw);
        const { competencies } = spec.transform(parsed);
        for (const [id, entry] of Object.entries(competencies)) {
          if (!targetState.competencies[id] || targetState.competencies[id].status === 'unseen') {
            targetState.competencies[id] = entry;
            totalCompetenciesMigrated++;
          }
        }
        migratedModules.push(spec.moduleId);
        targetState.meta.migratedFromLegacy[spec.stampKey] = new Date().toISOString();
      } catch (err) {
        errors.push(`Corrupt JSON in ${spec.storageKey}: ${err.message}`);
      }
    }
  }

  if (allPresentAlreadyMigrated && totalCompetenciesMigrated === 0) {
    alreadyMigrated = true;
  }

  targetState.updatedAt = new Date().toISOString();
  targetState.meta.migratedModules = Array.from(new Set(migratedModules));

  // 4. Persist to TARGET_KEY safely
  try {
    store.setItem(TARGET_KEY, JSON.stringify(targetState));
  } catch (err) {
    errors.push(`Failed to write ${TARGET_KEY}: ${err.message}`);
    return {
      success: false,
      alreadyMigrated: false,
      migratedModules,
      competenciesMigrated: 0,
      errors,
    };
  }

  // CRITICAL INTEGRITY CHECK: Legacy keys must NOT be removed or modified!
  for (const [key, snapshot] of Object.entries(rawSnapshots)) {
    if (store.getItem(key) !== snapshot) {
      errors.push(`Integrity violation: ${key} was modified or removed`);
    }
  }

  return {
    success: errors.filter((e) => !e.startsWith('Corrupt JSON')).length === 0,
    alreadyMigrated,
    migratedModules: targetState.meta.migratedModules,
    competenciesMigrated: totalCompetenciesMigrated,
    errors,
  };
}
