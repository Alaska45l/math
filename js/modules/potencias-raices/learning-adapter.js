/**
 * @file js/modules/potencias-raices/learning-adapter.js
 * Learning module adapter for Potencias, Raíces y Radicales (Unidad 01).
 * Bridges checks and retos to core ProgressStore (`alaska:learning:v1`).
 *
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
  POW_COMPETENCIES,
  POW_DIAGNOSTIC_TAXONOMY,
  POW_COMPETENCY_ALIASES,
} from './competencies-map.js';

export const MODULE_ID = MODULE_IDS.POTENCIAS_RAICES;

export { POW_COMPETENCY_ALIASES };

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

export function initPowLearning() {
  return registerModuleCompetencies(MODULE_ID, {
    competencies: POW_COMPETENCIES,
    diagnosticTaxonomy: POW_DIAGNOSTIC_TAXONOMY,
    aliases: POW_COMPETENCY_ALIASES,
  });
}

export function recordPowAttempt({
  exerciseId = 'pr-check',
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
  initPowLearning();

  const canonicalId = resolveCompetencyId(competencyId) || competencyId;
  const isCorrect = Boolean(correct);
  const solRevealed = Boolean(solutionRevealed);
  const hintsCount =
    typeof hintsUsed === 'number' && Number.isInteger(hintsUsed) && hintsUsed >= 0
      ? hintsUsed
      : mode === 'assisted' && !solRevealed
        ? 1
        : 0;

  let assistance = ASSISTANCE_LEVELS.NONE;
  if (solRevealed) {
    assistance = ASSISTANCE_LEVELS.SOLUTION_REVEALED;
  } else if (hintsCount > 0 || mode === 'assisted') {
    assistance = ASSISTANCE_LEVELS.HINTS;
  }

  const event = createLearningEvent({
    type: EVENT_TYPES.ANSWER_SUBMITTED,
    moduleId: MODULE_ID,
    exerciseId: String(exerciseId || 'pr-check'),
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

export function getPowCompetencyReport() {
  initPowLearning();
  return getModuleReport(MODULE_ID);
}

export function getModuleState() {
  return getPowCompetencyReport();
}

// Auto-register on import
initPowLearning();

export const initModuleLearning = initPowLearning;
export const recordAttempt = recordPowAttempt;
export const getCompetencyReport = getPowCompetencyReport;

export {
  POW_COMPETENCIES,
  POW_DIAGNOSTIC_TAXONOMY,
  STATUS_BADGES,
};
