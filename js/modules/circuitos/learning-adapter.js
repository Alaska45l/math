/**
 * @file js/modules/circuitos/learning-adapter.js
 * Learning module adapter for Desigualdades Compuestas e Intervalos (Unidad 01).
 * Bridges checks, POE, and retos to core ProgressStore (`alaska:learning:v1`).
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
import { mountCompetencyDashboard as mountCoreCompetencyDashboard } from '../../core/learning/dashboard.js';
import {
  CIRCUITOS_COMPETENCIES,
  CIRCUITOS_DIAGNOSTIC_TAXONOMY,
  CIRCUITOS_COMPETENCY_ALIASES,
} from './competencies-map.js';

export const MODULE_ID = MODULE_IDS.DESIGUALDADES || 'desigualdades';

export { CIRCUITOS_COMPETENCY_ALIASES };

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

export function initCircuitosLearning() {
  return registerModuleCompetencies(MODULE_ID, {
    competencies: CIRCUITOS_COMPETENCIES,
    diagnosticTaxonomy: CIRCUITOS_DIAGNOSTIC_TAXONOMY,
    aliases: CIRCUITOS_COMPETENCY_ALIASES,
  });
}

export function recordCircuitosAttempt({
  exerciseId = 'circ-check',
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
  initCircuitosLearning();
  getProgressStore();

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
    exerciseId: String(exerciseId || 'circ-check'),
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

export function recordCircuitosPrediction({
  exerciseId = 'circ-poe',
  competencyId = 'inequalities.compound_and_or_sets',
  representation = REPRESENTATION_TYPES.MANIPULATIVE,
} = {}) {
  initCircuitosLearning();
  getProgressStore();

  const canonicalId = resolveCompetencyId(competencyId) || competencyId;
  const event = createLearningEvent({
    type: EVENT_TYPES.PREDICTION_MADE,
    moduleId: MODULE_ID,
    exerciseId: String(exerciseId || 'circ-poe'),
    competencyIds: [canonicalId],
    occurredAt: new Date().toISOString(),
    correct: false,
    hintsUsed: 0,
    solutionRevealed: false,
    assistance: ASSISTANCE_LEVELS.NONE,
    diagnosticId: null,
    representation,
    stage: LEARNING_STAGES.EXPLORATION,
    transferDistance: TRANSFER_DISTANCES.NEAR,
  });

  return recordLearningEvent(event);
}

export function getCircuitosCompetencyReport() {
  initCircuitosLearning();
  getProgressStore();
  return getModuleReport(MODULE_ID);
}

export function getModuleState() {
  return getCircuitosCompetencyReport();
}

export function mountCircuitosCompetencyDashboard(host, options = {}) {
  if (!host) return null;
  initCircuitosLearning();
  const instance = mountCoreCompetencyDashboard({
    container: host,
    moduleId: MODULE_ID,
    competencies: CIRCUITOS_COMPETENCIES,
    diagnosticTaxonomy: CIRCUITOS_DIAGNOSTIC_TAXONOMY,
    getReport: getCircuitosCompetencyReport,
    classPrefix: 'learning-dashboard',
    subtitle: 'Progreso en las 3 competencias de Desigualdades e Intervalos.',
    sectionLabelFn: (comp) => `Ir a ${comp.sectionId.replace('sec-', 'Bloque ')}`,
    onNavigateSection: (comp) => {
      if (typeof document !== 'undefined') {
        const target = document.getElementById(comp.sectionId) || document.getElementById('circ-checks');
        if (target && typeof target.scrollIntoView === 'function') {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    onPracticeFamily: () => {
      if (typeof document !== 'undefined') {
        const target = document.getElementById('circ-checks');
        if (target && typeof target.scrollIntoView === 'function') {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    ...options,
  });

  const store = getProgressStore();
  const unsub = store.subscribe(() => instance?.update());
  return {
    update: () => instance?.update(),
    destroy: () => {
      unsub();
      instance?.destroy();
    },
  };
}

// Auto-register on import
initCircuitosLearning();

export const initModuleLearning = initCircuitosLearning;
export const recordAttempt = recordCircuitosAttempt;
export const getCompetencyReport = getCircuitosCompetencyReport;
export const mountCompetencyDashboard = mountCircuitosCompetencyDashboard;

export {
  CIRCUITOS_COMPETENCIES,
  CIRCUITOS_DIAGNOSTIC_TAXONOMY,
  STATUS_BADGES,
};
