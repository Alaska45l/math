/**
 * @file js/modules/polinomios/learning-adapter.js
 * Learning module adapter for Unit 06: Polinomios (polinomios.html).
 * Bridges checks and retos to ProgressStore -> alaska:learning:v1.
 * Pure Vanilla ES2023. Zero external dependencies. Zero eval. Zero emojis.
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
  POLY_COMPETENCIES,
  POLY_DIAGNOSTIC_TAXONOMY,
  POLY_COMPETENCY_ALIASES,
} from './competencies-map.js';

export const MODULE_ID = MODULE_IDS.POLINOMIOS;

export { POLY_COMPETENCY_ALIASES };

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

export function initPolyLearning() {
  return registerModuleCompetencies(MODULE_ID, {
    competencies: POLY_COMPETENCIES,
    diagnosticTaxonomy: POLY_DIAGNOSTIC_TAXONOMY,
    aliases: POLY_COMPETENCY_ALIASES,
  });
}

export function recordPolyAttempt({
  exerciseId = 'poly-check',
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
  initPolyLearning();

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
    exerciseId: String(exerciseId || 'poly-check'),
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

export function getPolyCompetencyReport() {
  initPolyLearning();
  return getModuleReport(MODULE_ID);
}

export function getModuleState() {
  return getPolyCompetencyReport();
}

// Auto-register on import
initPolyLearning();

export const initModuleLearning = initPolyLearning;
export const recordAttempt = recordPolyAttempt;
export const getCompetencyReport = getPolyCompetencyReport;

export {
  POLY_COMPETENCIES,
  POLY_DIAGNOSTIC_TAXONOMY,
  STATUS_BADGES,
};
