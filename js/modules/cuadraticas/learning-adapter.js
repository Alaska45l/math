/**
 * @file js/modules/cuadraticas/learning-adapter.js
 * Learning module adapter for Laboratorio 8: Función Cuadrática, Factorización y Parábolas.
 * Bridges checks and retos to core learning store, maps 10 quadratic competencies,
 * registers diagnostic taxonomy and aliases, and powers competency reporting and dashboard.
 *
 * Complies with ORIGINAL_REQUEST §P0.1, §P0.3, and PROJECT.md §138-144.
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
  getProgressStore as getCoreProgressStore,
  recordLearningEvent,
  getModuleReport,
  STATUS_BADGES,
  STORAGE_KEY,
  resetStore,
} from '../../core/learning/progress-store.js';
import {
  QUAD_COMPETENCIES,
  QUAD_DIAGNOSTIC_TAXONOMY,
  QUAD_COMPETENCY_ALIASES,
} from './competencies-map.js';
import { mountCompetencyDashboard as mountQuadDashboardUI } from './components.js';

export const MODULE_ID = MODULE_IDS.CUADRATICAS;

export { QUAD_COMPETENCY_ALIASES };

export function getProgressStore() {
  if (typeof localStorage !== 'undefined' && localStorage !== null) {
    try {
      const store = getCoreProgressStore();
      if (localStorage.getItem(STORAGE_KEY) === null && store._state?.events?.length > 0) {
        resetStore();
      }
    } catch {}
  }
  return getCoreProgressStore();
}

export function getModuleState() {
  return getQuadCompetencyReport();
}

/**
 * Registers the Cuadráticas module competencies and diagnostics in the registry.
 * Idempotent.
 *
 * @returns {object} Registration result
 */
export function initQuadLearning() {
  return registerModuleCompetencies(MODULE_ID, {
    competencies: QUAD_COMPETENCIES,
    diagnosticTaxonomy: QUAD_DIAGNOSTIC_TAXONOMY,
    aliases: QUAD_COMPETENCY_ALIASES,
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
export function recordQuadAttempt({
  exerciseId = 'quad-check',
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
  initQuadLearning();

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
    exerciseId: String(exerciseId || 'quad-check'),
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
 * Retrieves the aggregated competency report for Cuadráticas.
 * @returns {object} ModuleLearningReport
 */
export function getQuadCompetencyReport() {
  initQuadLearning();
  return getModuleReport(MODULE_ID);
}

/**
 * Mounts the competency dashboard in a container host.
 *
 * @param {HTMLElement} container
 * @param {object} [callbacks={}]
 * @returns {{ destroy: () => void, update: () => void }}
 */
export function mountQuadCompetencyDashboard(container, callbacks = {}) {
  initQuadLearning();
  return mountQuadDashboardUI(container, callbacks);
}

// Auto-register on import
initQuadLearning();

// Interface contract aliases
export const initModuleLearning = initQuadLearning;
export const recordAttempt = recordQuadAttempt;
export const getCompetencyReport = getQuadCompetencyReport;
export const mountCompetencyDashboard = mountQuadCompetencyDashboard;

export {
  QUAD_COMPETENCIES,
  QUAD_DIAGNOSTIC_TAXONOMY,
  STATUS_BADGES,
};
