/**
 * @file js/modules/lineal/learning-adapter.js
 * Adaptador pedagógico para Unidad 03 · Función Lineal (`lineal.html`).
 * Conecta chequeos y retos al motor común `js/core/learning/` (`alaska:learning:v1`).
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
  LIN_COMPETENCIES,
  LIN_DIAGNOSTIC_TAXONOMY,
  LIN_COMPETENCY_ALIASES,
} from './competencies-map.js';
import { mountCompetencyDashboard as mountLinearDashboardUI } from './components.js';

export const MODULE_ID = MODULE_IDS.LINEAL;
export { LIN_COMPETENCY_ALIASES };

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

export function initLinearLearning() {
  return registerModuleCompetencies(MODULE_ID, {
    competencies: LIN_COMPETENCIES,
    diagnosticTaxonomy: LIN_DIAGNOSTIC_TAXONOMY,
    aliases: LIN_COMPETENCY_ALIASES,
  }, { deferValidation: true });
}

export function recordLinearAttempt({
  exerciseId = 'lin-check',
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
  initLinearLearning();

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
  if (solRevealed) assistance = ASSISTANCE_LEVELS.SOLUTION_REVEALED;
  else if (hintsCount > 0 || mode === 'assisted') assistance = ASSISTANCE_LEVELS.HINTS;

  const event = createLearningEvent({
    type: EVENT_TYPES.ANSWER_SUBMITTED,
    moduleId: MODULE_ID,
    exerciseId: String(exerciseId || 'lin-check'),
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

export function getLinearCompetencyReport() {
  initLinearLearning();
  return getModuleReport(MODULE_ID);
}

export function getModuleState() {
  return getLinearCompetencyReport();
}

export function mountLinearCompetencyDashboard(container, callbacks = {}) {
  initLinearLearning();
  return mountLinearDashboardUI(container, callbacks);
}

// Auto-registro al importar
initLinearLearning();

export const initModuleLearning = initLinearLearning;
export const recordAttempt = recordLinearAttempt;
export const getCompetencyReport = getLinearCompetencyReport;
export const mountCompetencyDashboard = mountLinearCompetencyDashboard;

export {
  LIN_COMPETENCIES,
  LIN_DIAGNOSTIC_TAXONOMY,
  STATUS_BADGES,
};
