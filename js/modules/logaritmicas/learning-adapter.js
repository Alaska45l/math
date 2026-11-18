/**
 * @file js/modules/logaritmicas/learning-adapter.js
 * Adaptador de aprendizaje para Unidad 09: Función Logarítmica (logaritmicas.html).
 * Conecta chequeos y retos con ProgressStore -> alaska:learning:v1.
 * Puro Vanilla ES2023. Cero dependencias externas, cero eval, cero emojis.
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
  LOG_COMPETENCIES,
  LOG_DIAGNOSTIC_TAXONOMY,
  LOG_COMPETENCY_ALIASES,
} from './competencies-map.js';

export const MODULE_ID = MODULE_IDS.LOGARITMICAS;
export const COMPETENCY_ALIASES = LOG_COMPETENCY_ALIASES;

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

export function initLogLearning() {
  return registerModuleCompetencies(MODULE_ID, {
    competencies: LOG_COMPETENCIES,
    diagnosticTaxonomy: LOG_DIAGNOSTIC_TAXONOMY,
    aliases: COMPETENCY_ALIASES,
  });
}

export function recordLogAttempt({
  exerciseId = 'log-check',
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
  initLogLearning();

  const canonicalId = resolveCompetencyId(competencyId) || competencyId;
  const isCorrect = Boolean(correct);
  const solRevealed = Boolean(solutionRevealed);
  const hintsCount = typeof hintsUsed === 'number' && Number.isInteger(hintsUsed) && hintsUsed > 0
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
    exerciseId: String(exerciseId || 'log-check'),
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

export function getLogCompetencyReport() {
  initLogLearning();
  return getModuleReport(MODULE_ID);
}

export function getModuleState() {
  return getLogCompetencyReport();
}

export function mountLogCompetencyDashboard(container, { onSelectSection, onPracticeCompetency } = {}) {
  if (!container) return null;
  initLogLearning();
  return mountCoreCompetencyDashboard({
    container,
    moduleId: MODULE_ID,
    competencies: LOG_COMPETENCIES,
    diagnosticTaxonomy: LOG_DIAGNOSTIC_TAXONOMY,
    getReport: getLogCompetencyReport,
    classPrefix: 'log-dashboard',
    extraClassPrefixes: ['exp-dashboard'],
    subtitle:
      'Seguimiento conservador de tu dominio e independencia analítica en las 5 competencias de Función Logarítmica.',
    onNavigateSection: (comp) => {
      if (typeof onSelectSection === 'function') {
        onSelectSection(comp.sectionId);
      } else if (typeof document !== 'undefined') {
        const link = document.querySelector(`.seq-sidebar__link[data-sec="${comp.sectionId}"]`);
        if (link) link.click();
        else if (typeof location !== 'undefined') location.hash = `#${comp.sectionId}`;
      }
    },
    onPracticeFamily: (comp) => {
      if (typeof onPracticeCompetency === 'function') {
        onPracticeCompetency(comp.id);
      } else if (typeof document !== 'undefined') {
        const link = document.querySelector('.seq-sidebar__link[data-sec="sec-retos"]');
        if (link) link.click();
        else if (typeof location !== 'undefined') location.hash = '#sec-retos';
      }
    },
  });
}

// Auto-registro al importar
initLogLearning();

export const initModuleLearning = initLogLearning;
export const recordAttempt = recordLogAttempt;
export const getCompetencyReport = getLogCompetencyReport;
export const mountCompetencyDashboard = mountLogCompetencyDashboard;

export {
  LOG_COMPETENCIES,
  LOG_DIAGNOSTIC_TAXONOMY,
  STATUS_BADGES,
};
