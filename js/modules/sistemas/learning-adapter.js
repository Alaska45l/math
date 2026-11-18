/**
 * @file js/modules/sistemas/learning-adapter.js
 * Adaptador pedagógico para Unidad 04 · Sistemas de Ecuaciones (`sistemas.html`).
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
  SYS_COMPETENCIES,
  SYS_DIAGNOSTIC_TAXONOMY,
  SYS_COMPETENCY_ALIASES,
} from './competencies-map.js';
import { mountCompetencyDashboard as mountSysDashboardUI } from './components.js';

export const MODULE_ID = MODULE_IDS.SISTEMAS;
export { SYS_COMPETENCY_ALIASES };

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

export function initSystemsLearning() {
  return registerModuleCompetencies(MODULE_ID, {
    competencies: SYS_COMPETENCIES,
    diagnosticTaxonomy: SYS_DIAGNOSTIC_TAXONOMY,
    aliases: SYS_COMPETENCY_ALIASES,
  }, { deferValidation: true });
}

export function recordSystemAttempt({
  exerciseId = 'sys-check',
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
  initSystemsLearning();

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
    exerciseId: String(exerciseId || 'sys-check'),
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

export function getSystemsCompetencyReport() {
  initSystemsLearning();
  return getModuleReport(MODULE_ID);
}

export function getModuleState() {
  return getSystemsCompetencyReport();
}

export function mountSystemsCompetencyDashboard(container, callbacks = {}) {
  initSystemsLearning();
  return mountSysDashboardUI(container, callbacks);
}

initSystemsLearning();

export const initModuleLearning = initSystemsLearning;
export const recordAttempt = recordSystemAttempt;
export const getCompetencyReport = getSystemsCompetencyReport;
export const mountCompetencyDashboard = mountSystemsCompetencyDashboard;

export {
  SYS_COMPETENCIES,
  SYS_DIAGNOSTIC_TAXONOMY,
  STATUS_BADGES,
};
