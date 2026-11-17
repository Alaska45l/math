/**
 * @file js/modules/funciones/learning-adapter.js
 * Learning module adapter for Laboratorio de Funciones (Unidad 02).
 * Bridges all 4 tabs, POE, quizzes, and checks to core ProgressStore (`alaska:learning:v1`).
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
  FUNCTIONS_COMPETENCIES,
  FUNCTIONS_DIAGNOSTIC_TAXONOMY,
  FUNCTIONS_COMPETENCY_ALIASES,
} from './competencies-map.js';

export const MODULE_ID = MODULE_IDS.FUNCIONES || 'funciones';

export { FUNCTIONS_COMPETENCY_ALIASES };

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

export function initFnLearning() {
  return registerModuleCompetencies(MODULE_ID, {
    competencies: FUNCTIONS_COMPETENCIES,
    diagnosticTaxonomy: FUNCTIONS_DIAGNOSTIC_TAXONOMY,
    aliases: FUNCTIONS_COMPETENCY_ALIASES,
  });
}

export function recordFnAttempt({
  exerciseId = 'fn-check',
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
  initFnLearning();
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
    exerciseId: String(exerciseId || 'fn-check'),
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

export function recordFnPrediction({
  exerciseId = 'fn-poe',
  competencyId = 'functions.concept_and_uniqueness',
  representation = REPRESENTATION_TYPES.GRAPHICAL,
} = {}) {
  initFnLearning();
  getProgressStore();

  const canonicalId = resolveCompetencyId(competencyId) || competencyId;
  const event = createLearningEvent({
    type: EVENT_TYPES.PREDICTION_MADE,
    moduleId: MODULE_ID,
    exerciseId: String(exerciseId || 'fn-poe'),
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

export function getFnCompetencyReport() {
  initFnLearning();
  getProgressStore();
  return getModuleReport(MODULE_ID);
}

export function getModuleState() {
  return getFnCompetencyReport();
}

const TAB_LABELS = Object.freeze({
  'panel-scanner': 'Escáner',
  'panel-radiografia': 'Radiografía',
  'panel-secante': 'Secante (TCP)',
  'panel-inversa': 'Inversa',
});

export function mountFnCompetencyDashboard(host, options = {}) {
  if (!host) return null;
  initFnLearning();
  const instance = mountCoreCompetencyDashboard({
    container: host,
    moduleId: MODULE_ID,
    competencies: FUNCTIONS_COMPETENCIES,
    diagnosticTaxonomy: FUNCTIONS_DIAGNOSTIC_TAXONOMY,
    getReport: getFnCompetencyReport,
    classPrefix: 'learning-dashboard',
    subtitle: 'Progreso en las 5 competencias de Funciones (Unidad 02).',
    sectionLabelFn: (comp) => `Ir a ${TAB_LABELS[comp.sectionId] || comp.sectionId}`,
    onNavigateSection: (comp) => {
      if (typeof document !== 'undefined') {
        const tabBtn = document.querySelector(`[role="tab"][aria-controls="${comp.sectionId}"]`);
        if (tabBtn) tabBtn.click();
        const panel = document.getElementById(comp.sectionId);
        if (panel && typeof panel.scrollIntoView === 'function') {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    onPracticeFamily: (comp) => {
      if (typeof document !== 'undefined') {
        const tabBtn = document.querySelector(`[role="tab"][aria-controls="${comp.sectionId}"]`);
        if (tabBtn) tabBtn.click();
        const checksBox = document.querySelector(`#${comp.sectionId} .fn-checks-section`);
        if (checksBox && typeof checksBox.scrollIntoView === 'function') {
          checksBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
initFnLearning();

export const initModuleLearning = initFnLearning;
export const recordAttempt = recordFnAttempt;
export const getCompetencyReport = getFnCompetencyReport;
export const mountCompetencyDashboard = mountFnCompetencyDashboard;

export {
  FUNCTIONS_COMPETENCIES,
  FUNCTIONS_DIAGNOSTIC_TAXONOMY,
  STATUS_BADGES,
};
