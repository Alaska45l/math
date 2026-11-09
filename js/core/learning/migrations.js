/**
 * @file js/core/learning/migrations.js
 * Non-destructive legacy migration engine preserving 100% of existing storage keys
 * (exponenciales:progreso:v1 and cuadraticas:progreso:v1) while transforming
 * legacy state into the unified alaska:learning:v1 store and retroactively
 * fixing the single-success mastery bug.
 *
 * Complies with ORIGINAL_REQUEST §P0.1 & §P0.2, and LEARNING_ARCHITECTURE.md §6.9.
 * Runtime: Vanilla ES2022. Zero external dependencies. Zero eval. Zero emojis.
 */

import { createDefaultCompetencyEntry, createDefaultStoreState } from './progress-store.js';

export const LEGACY_KEY_EXP = 'exponenciales:progreso:v1';
export const LEGACY_KEY_CUAD = 'cuadraticas:progreso:v1';
export const TARGET_KEY = 'alaska:learning:v1';
export const SCHEMA_VERSION = 1;

export const EXP_ITEM_TO_COMPETENCY = Object.freeze({
  'sec1-q1': 'exponentials.tables_additive_vs_multiplicative',
  'sec1-q2': 'exponentials.tables_additive_vs_multiplicative',
  'sec1-q3': 'exponentials.tables_additive_vs_multiplicative',
  'sec-1': 'exponentials.tables_additive_vs_multiplicative',
  'sec2-q1': 'exponentials.base_and_initial_value_roles',
  'sec2-q2': 'exponentials.base_and_initial_value_roles',
  'sec2-q3': 'exponentials.base_and_initial_value_roles',
  'sec-2': 'exponentials.base_and_initial_value_roles',
  'sec3-q1': 'exponentials.continuous_extension_and_restrictions',
  'sec3-q2': 'exponentials.continuous_extension_and_restrictions',
  'sec3-q3': 'exponentials.continuous_extension_and_restrictions',
  'sec-3': 'exponentials.continuous_extension_and_restrictions',
  'sec4-q1': 'exponentials.asymptote_and_horizontal_reflection',
  'sec4-q2': 'exponentials.asymptote_and_horizontal_reflection',
  'sec4-q3': 'exponentials.asymptote_and_horizontal_reflection',
  'sec-4': 'exponentials.asymptote_and_horizontal_reflection',
  'sec5-q1': 'exponentials.quadrant_monotonicity',
  'sec5-q2': 'exponentials.quadrant_monotonicity',
  'sec5-q3': 'exponentials.quadrant_monotonicity',
  'sec-5': 'exponentials.quadrant_monotonicity',
  'sec6-q1': 'exponentials.analytical_reconstruction_two_points',
  'sec6-q2': 'exponentials.analytical_reconstruction_two_points',
  'sec6-q3': 'exponentials.analytical_reconstruction_two_points',
  'sec-6': 'exponentials.analytical_reconstruction_two_points',
  'sec7-q1': 'exponentials.half_life_and_compound_periods',
  'sec7-q2': 'exponentials.half_life_and_compound_periods',
  'sec7-q3': 'exponentials.half_life_and_compound_periods',
  'sec-7': 'exponentials.half_life_and_compound_periods',
  'sec8-q1': 'exponentials.asymptote_shifts_and_image',
  'sec8-q2': 'exponentials.asymptote_shifts_and_image',
  'sec8-q3': 'exponentials.asymptote_shifts_and_image',
  'sec-8': 'exponentials.asymptote_shifts_and_image',
  'sec9-q1': 'exponentials.full_analytical_study',
  'sec9-q2': 'exponentials.full_analytical_study',
  'sec9-q3': 'exponentials.full_analytical_study',
  'sec-9': 'exponentials.full_analytical_study',
  'sec10-q1': 'exponentials.equations_bases_factoring_substitution',
  'sec10-q2': 'exponentials.equations_bases_factoring_substitution',
  'sec10-q3': 'exponentials.equations_bases_factoring_substitution',
  'sec-10': 'exponentials.equations_bases_factoring_substitution',
});

export const CUAD_ITEM_TO_COMPETENCY = Object.freeze({
  'sec1-q1': 'quadratics.area_model_and_notable_products',
  'sec1-q2': 'quadratics.area_model_and_notable_products',
  'sec1-q3': 'quadratics.area_model_and_notable_products',
  'sec-area-binomios': 'quadratics.area_model_and_notable_products',
  'sec2-q1': 'quadratics.grouping_and_factoring_strategy',
  'sec2-q2': 'quadratics.grouping_and_factoring_strategy',
  'sec2-q3': 'quadratics.grouping_and_factoring_strategy',
  'sec-balanza-suma-producto': 'quadratics.grouping_and_factoring_strategy',
  'sec3-q1': 'quadratics.parabola_geometry_and_parameters',
  'sec3-q2': 'quadratics.parabola_geometry_and_parameters',
  'sec3-q3': 'quadratics.parabola_geometry_and_parameters',
  'sec-agrupacion-estrategia': 'quadratics.parabola_geometry_and_parameters',
  'sec4-q1': 'quadratics.vertex_symmetry_canonical',
  'sec4-q2': 'quadratics.vertex_symmetry_canonical',
  'sec4-q3': 'quadratics.vertex_symmetry_canonical',
  'sec-canonica-vertice': 'quadratics.vertex_symmetry_canonical',
  'sec5-q1': 'quadratics.roots_and_factored_form',
  'sec5-q2': 'quadratics.roots_and_factored_form',
  'sec5-q3': 'quadratics.roots_and_factored_form',
  'sec-factorizada-simetria': 'quadratics.roots_and_factored_form',
  'sec6-q1': 'quadratics.completing_the_square',
  'sec6-q2': 'quadratics.completing_the_square',
  'sec6-q3': 'quadratics.completing_the_square',
  'sec-completar-cuadrado': 'quadratics.completing_the_square',
  'sec7-q1': 'quadratics.discriminant_and_vieta',
  'sec7-q2': 'quadratics.discriminant_and_vieta',
  'sec7-q3': 'quadratics.discriminant_and_vieta',
  'sec-discriminante-vieta': 'quadratics.discriminant_and_vieta',
  'sec8-q1': 'quadratics.full_analytical_study',
  'sec8-q2': 'quadratics.full_analytical_study',
  'sec8-q3': 'quadratics.full_analytical_study',
  'sec-radiografia-cuadratica': 'quadratics.full_analytical_study',
  'sec9-q1': 'quadratics.line_parabola_intersection',
  'sec9-q2': 'quadratics.line_parabola_intersection',
  'sec9-q3': 'quadratics.line_parabola_intersection',
  'sec-interseccion-recta-parabola': 'quadratics.line_parabola_intersection',
  'sec10-q1': 'quadratics.extremum_optimization',
  'sec10-q2': 'quadratics.extremum_optimization',
  'sec10-q3': 'quadratics.extremum_optimization',
  'sec-optimizacion-extremos': 'quadratics.extremum_optimization',
});

/**
 * Pure transformer for legacy Exponenciales progress data.
 * Actively fixes the single-success bug: 1 independent success maps to developing.
 *
 * @param {object} legacyData
 * @returns {{ competencies: Record<string, object>, migratedCount: number }}
 */
export function transformLegacyExpProgress(legacyData) {
  if (!legacyData || typeof legacyData !== 'object' || Array.isArray(legacyData)) {
    return { competencies: {}, migratedCount: 0 };
  }

  const competencies = {};
  let migratedCount = 0;

  // Case A: legacyData has explicit competencies map
  if (legacyData.competencies && typeof legacyData.competencies === 'object') {
    for (const [compId, legacyEntry] of Object.entries(legacyData.competencies)) {
      if (!legacyEntry || typeof legacyEntry !== 'object') continue;

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
          // Retroactive fix: 1 success was erroneously marked 'mastered'
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
      migratedCount++;
    }
  }

  // Case B: legacyData has flat question keys (sec1-q1, etc.)
  for (const [itemKey, value] of Object.entries(legacyData)) {
    const compId = EXP_ITEM_TO_COMPETENCY[itemKey];
    if (!compId) continue;

    if (!competencies[compId]) {
      competencies[compId] = createDefaultCompetencyEntry(compId);
      migratedCount++;
    }

    const entry = competencies[compId];
    if (value === 'independent') {
      entry.independentCount += 1;
      entry.independentCorrect += 1;
      entry.attempts += 1;
      if (!entry.distinctExercises.includes(itemKey)) {
        entry.distinctExercises.push(itemKey);
      }
    } else if (value === 'assisted') {
      entry.assistedCount += 1;
      entry.assistedCorrect += 1;
      entry.attempts += 1;
    } else if (value === true && itemKey.startsWith('sec-') && entry.status === 'unseen') {
      entry.status = 'introduced';
    }

    // Re-evaluate status from accumulated flat evidence
    if (entry.status !== 'needs_repair') {
      if (entry.independentCount >= 2) {
        entry.status = 'consolidating';
      } else if (entry.independentCount === 1 || entry.assistedCount >= 1) {
        entry.status = 'developing';
      }
    }
  }

  return { competencies, migratedCount };
}

/**
 * Pure transformer for legacy Cuadráticas progress data (flat check keys).
 *
 * @param {object} legacyData
 * @returns {{ competencies: Record<string, object>, migratedCount: number }}
 */
export function transformLegacyCuadProgress(legacyData) {
  if (!legacyData || typeof legacyData !== 'object' || Array.isArray(legacyData)) {
    return { competencies: {}, migratedCount: 0 };
  }

  const competencies = {};
  let migratedCount = 0;

  for (const [itemKey, value] of Object.entries(legacyData)) {
    const compId = CUAD_ITEM_TO_COMPETENCY[itemKey];
    if (!compId) continue;

    if (!competencies[compId]) {
      competencies[compId] = createDefaultCompetencyEntry(compId);
      migratedCount++;
    }

    const entry = competencies[compId];
    if (value === 'independent') {
      entry.independentCount += 1;
      entry.independentCorrect += 1;
      entry.attempts += 1;
      if (!entry.distinctExercises.includes(itemKey)) {
        entry.distinctExercises.push(itemKey);
      }
    } else if (value === 'assisted') {
      entry.assistedCount += 1;
      entry.assistedCorrect += 1;
      entry.attempts += 1;
    } else if (value === true && itemKey.startsWith('sec-') && entry.status === 'unseen') {
      entry.status = 'introduced';
    }

    // Evaluate status
    if (entry.independentCount >= 2) {
      entry.status = 'consolidating';
    } else if (entry.independentCount === 1 || entry.assistedCount >= 1) {
      entry.status = 'developing';
    }
  }

  return { competencies, migratedCount };
}

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
    const hasExp = Boolean(store.getItem(LEGACY_KEY_EXP));
    const hasCuad = Boolean(store.getItem(LEGACY_KEY_CUAD));

    if (hasExp && !migratedModules.includes('exponenciales')) return true;
    if (hasCuad && !migratedModules.includes('cuadraticas')) return true;
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

  const prevMigrated = targetState.meta.migratedModules;
  const migratedModules = [...prevMigrated];
  let totalCompetenciesMigrated = 0;

  // 2. Read Exponenciales legacy data
  let rawExp = null;
  try {
    rawExp = store.getItem(LEGACY_KEY_EXP);
  } catch (err) {
    errors.push(`Failed to read ${LEGACY_KEY_EXP}: ${err.message}`);
  }

  if (rawExp) {
    try {
      const parsedExp = JSON.parse(rawExp);
      if (!prevMigrated.includes('exponenciales')) {
        const { competencies, migratedCount } = transformLegacyExpProgress(parsedExp);
        for (const [id, entry] of Object.entries(competencies)) {
          // If competency already in target store, only update if legacy has more evidence
          if (!targetState.competencies[id] || targetState.competencies[id].status === 'unseen') {
            targetState.competencies[id] = entry;
            totalCompetenciesMigrated++;
          }
        }
        migratedModules.push('exponenciales');
      }
    } catch (err) {
      errors.push(`Corrupt JSON in ${LEGACY_KEY_EXP}: ${err.message}`);
    }
  }

  // 3. Read Cuadráticas legacy data
  let rawCuad = null;
  try {
    rawCuad = store.getItem(LEGACY_KEY_CUAD);
  } catch (err) {
    errors.push(`Failed to read ${LEGACY_KEY_CUAD}: ${err.message}`);
  }

  if (rawCuad) {
    try {
      const parsedCuad = JSON.parse(rawCuad);
      if (!prevMigrated.includes('cuadraticas')) {
        const { competencies, migratedCount } = transformLegacyCuadProgress(parsedCuad);
        for (const [id, entry] of Object.entries(competencies)) {
          if (!targetState.competencies[id] || targetState.competencies[id].status === 'unseen') {
            targetState.competencies[id] = entry;
            totalCompetenciesMigrated++;
          }
        }
        migratedModules.push('cuadraticas');
      }
    } catch (err) {
      errors.push(`Corrupt JSON in ${LEGACY_KEY_CUAD}: ${err.message}`);
    }
  }

  // Check if everything was already migrated
  if (
    (rawExp ? prevMigrated.includes('exponenciales') : true) &&
    (rawCuad ? prevMigrated.includes('cuadraticas') : true) &&
    totalCompetenciesMigrated === 0
  ) {
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
  // If rawExp was present, it must still be identical.
  if (rawExp && store.getItem(LEGACY_KEY_EXP) !== rawExp) {
    errors.push('Integrity violation: LEGACY_KEY_EXP was modified or removed');
  }
  if (rawCuad && store.getItem(LEGACY_KEY_CUAD) !== rawCuad) {
    errors.push('Integrity violation: LEGACY_KEY_CUAD was modified or removed');
  }

  return {
    success: errors.filter((e) => !e.startsWith('Corrupt JSON')).length === 0,
    alreadyMigrated,
    migratedModules: targetState.meta.migratedModules,
    competenciesMigrated: totalCompetenciesMigrated,
    errors,
  };
}
