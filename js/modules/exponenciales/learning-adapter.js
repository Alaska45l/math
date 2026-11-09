/**
 * @file js/modules/exponenciales/learning-adapter.js
 * Learning module adapter for Laboratorio 7: Funciones y Modelos Exponenciales.
 * Bridges checks and retos to core learning store, maps 10 exponential competencies,
 * registers diagnostic taxonomy and aliases, and powers competency reporting.
 *
 * Complies with ORIGINAL_REQUEST §P0.1, §P0.2, and PROJECT.md §138-144.
 * Pure Vanilla ES2022. Zero external dependencies. Zero eval. Zero emojis.
 */

import {
  createLearningEvent,
  EVENT_TYPES,
  MODULE_IDS,
  ASSISTANCE_LEVELS,
  REPRESENTATION_TYPES,
  LEARNING_STAGES,
  TRANSFER_DISTANCES,
} from '../../core/learning/events.js';
import {
  registerModuleCompetencies,
  getCompetency,
  getCompetenciesByModule,
  getDiagnosticInfo,
  resolveCompetencyId,
} from '../../core/learning/competencies.js';
import {
  getProgressStore,
  recordLearningEvent,
  getModuleReport,
  STATUS_BADGES,
} from '../../core/learning/progress-store.js';
import {
  EXP_COMPETENCIES,
  EXP_DIAGNOSTIC_TAXONOMY,
} from './competencies-map.js';
import { mountCompetencyDashboard as mountExpDashboardUI } from './components.js';

export const MODULE_ID = MODULE_IDS.EXPONENCIALES;

export const COMPETENCY_ALIASES = Object.freeze({
  // Fallback IDs from progress-store.js fallback map
  'exponentials.base_and_initial_value_roles': 'exponentials.neutral_and_order_of_operations',
  'exponentials.continuous_extension_and_restrictions': 'exponentials.rational_density_and_base_restrictions',
  'exponentials.asymptote_and_horizontal_reflection': 'exponentials.base_reflection_and_asymptote',
  'exponentials.quadrant_monotonicity': 'exponentials.four_quadrants_monotonicity',
  'exponentials.half_life_and_compound_periods': 'exponentials.time_models_rates_and_euler_base',
  'exponentials.asymptote_shifts_and_image': 'exponentials.shifts_and_horizontal_asymptote',
  'exponentials.equations_bases_factoring_substitution': 'exponentials.equations_three_methods_in_reals',
  // Legacy aliases
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

/**
 * Initializes and registers the Exponenciales module within competencies registry.
 * Idempotent.
 *
 * @returns {object} Registration result
 */
export function initExpLearning() {
  return registerModuleCompetencies(MODULE_ID, {
    competencies: EXP_COMPETENCIES,
    diagnosticTaxonomy: EXP_DIAGNOSTIC_TAXONOMY,
    aliases: COMPETENCY_ALIASES,
  });
}

/**
 * Records an attempt (check or reto) emitting a validated LearningEvent
 * and evaluating conservative mastery transitions.
 *
 * @param {object} params
 * @param {string} [params.exerciseId]
 * @param {string} params.competencyId
 * @param {boolean} params.correct
 * @param {string} [params.mode='independent'] - 'independent' | 'assisted'
 * @param {number} [params.hintsUsed=0]
 * @param {boolean} [params.solutionRevealed=false]
 * @param {string|null} [params.diagnosticId=null]
 * @param {string} [params.representation='symbolic']
 * @param {string} [params.stage='guided_practice']
 * @param {string} [params.transferDistance='near']
 * @returns {object} { event, transition, updatedEntry, transitions }
 */
export function recordExpAttempt({
  exerciseId = 'exp-check',
  competencyId,
  correct,
  mode = 'independent',
  hintsUsed = 0,
  solutionRevealed = false,
  diagnosticId = null,
  representation = REPRESENTATION_TYPES.SYMBOLIC,
  stage = LEARNING_STAGES.GUIDED_PRACTICE,
  transferDistance = TRANSFER_DISTANCES.NEAR,
} = {}) {
  initExpLearning();

  const canonicalId = resolveCompetencyId(competencyId) || competencyId;
  const isCorrect = Boolean(correct);
  const solRevealed = Boolean(solutionRevealed);
  const hintsCount = typeof hintsUsed === 'number' && Number.isInteger(hintsUsed) && hintsUsed >= 0
    ? hintsUsed
    : (mode === 'assisted' && !solRevealed ? 1 : 0);

  let assistance = ASSISTANCE_LEVELS.NONE;
  if (solRevealed) {
    assistance = ASSISTANCE_LEVELS.SOLUTION_REVEALED;
  } else if (hintsCount > 0 || mode === 'assisted') {
    assistance = ASSISTANCE_LEVELS.HINTS;
  }

  const event = createLearningEvent({
    type: EVENT_TYPES.ANSWER_SUBMITTED,
    moduleId: MODULE_ID,
    exerciseId: String(exerciseId || 'exp-check'),
    competencyIds: [canonicalId],
    occurredAt: new Date().toISOString(),
    correct: isCorrect,
    hintsUsed: hintsCount,
    solutionRevealed: solRevealed,
    assistance,
    diagnosticId: diagnosticId || null,
    representation,
    stage,
    transferDistance,
  });

  return recordLearningEvent(event);
}

/**
 * Retrieves the aggregated competency report for Exponenciales.
 * @returns {object} ModuleLearningReport
 */
export function getExpCompetencyReport() {
  initExpLearning();
  return getModuleReport(MODULE_ID);
}

/**
 * Mounts the competency dashboard in a container host.
 *
 * @param {HTMLElement} container
 * @param {object} [callbacks={}]
 * @returns {{ destroy: () => void, update: () => void }}
 */
export function mountExpCompetencyDashboard(container, callbacks = {}) {
  initExpLearning();
  return mountExpDashboardUI(container, callbacks);
}

// Auto-register on import
initExpLearning();

// Interface contract aliases
export const initModuleLearning = initExpLearning;
export const recordAttempt = recordExpAttempt;
export const getCompetencyReport = getExpCompetencyReport;
export const mountCompetencyDashboard = mountExpCompetencyDashboard;

export {
  EXP_COMPETENCIES,
  EXP_DIAGNOSTIC_TAXONOMY,
  STATUS_BADGES,
};
