/**
 * @file js/core/learning/exercise-selector.js
 * Alaska Math Lab — Adaptive Interleaved Exercise Selector
 * Evidence-based problem recommendation prioritizing cognitive repair,
 * spaced retrieval, guided consolidation, and transfer challenges.
 *
 * Complies with ORIGINAL_REQUEST §P0.1, PROJECT.md §135, and LEARNING_ARCHITECTURE.md §6.7 & §7.3.
 * Runtime: Vanilla ES2022. Zero external dependencies. Zero eval. Zero emojis.
 */

import { getProgressStore } from './progress-store.js';
import { isReviewDue } from './scheduler.js';

/**
 * Priority Tiers (Lower number = Higher Pedagogical Urgency)
 */
export const PRIORITY_TIERS = Object.freeze({
  NEEDS_REPAIR: 1,              // Misconception remediation (diagnostic detected)
  REVIEW_DUE: 2,                // Spaced retrieval (window elapsed)
  DEVELOPING_OR_INTRODUCED: 3,  // Deliberate guided practice toward consolidation
  CONSOLIDATING: 4,             // Transfer & multi-representation challenges
  DURABLE_OR_UNSEEN: 5,         // Long-term maintenance or initial content exploration
});

/**
 * Generates clear, human-readable pedagogical rationale in Argentine Spanish.
 *
 * @param {number} tier
 * @param {object|null} entry
 * @returns {string}
 */
export function buildSelectionReason(tier, entry) {
  switch (tier) {
    case PRIORITY_TIERS.NEEDS_REPAIR:
      if (entry && Array.isArray(entry.recentDiagnosticIds) && entry.recentDiagnosticIds.length > 0) {
        return 'Refuerzo conceptual: detectamos dificultades recientes en esta competencia. Vamos a despejar esa duda paso a paso.';
      }
      return 'Refuerzo conceptual: esta competencia requiere práctica focalizada para afianzar la base antes de avanzar.';

    case PRIORITY_TIERS.REVIEW_DUE:
      return 'Recuperación espaciada: se cumplió la ventana de repaso recomendada. Recuperar la idea ahora consolida tu memoria a largo plazo.';

    case PRIORITY_TIERS.DEVELOPING_OR_INTRODUCED:
      if (entry && entry.status === 'introduced') {
        return 'Primeros pasos guiados: exploraste la teoría, ahora es momento de ponerla a prueba en un ejercicio concreto.';
      }
      return 'Práctica guiada: venís trabajando bien; sumemos aciertos independientes para consolidar el concepto.';

    case PRIORITY_TIERS.CONSOLIDATING:
      return 'Desafío de transferencia: tu comprensión está consolidándose; probemos aplicar el modelo en un contexto nuevo.';

    case PRIORITY_TIERS.DURABLE_OR_UNSEEN:
    default:
      if (entry && entry.status === 'durable') {
        return 'Mantenimiento de maestría: práctica breve para conservar la agilidad y frescura de este concepto.';
      }
      return 'Nuevo contenido: explorando una nueva competencia para ampliar tu mapa de aprendizaje.';
  }
}

/**
 * Evaluates the priority tier for a single competency entry.
 *
 * @param {object|null} entry - CompetencyEntry from progress store
 * @param {Date} [now=new Date()]
 * @returns {number} Priority tier (1 to 5)
 */
export function evaluateCompetencyPriorityTier(entry, now = new Date()) {
  if (!entry) return PRIORITY_TIERS.DURABLE_OR_UNSEEN;

  const status = entry.status || 'unseen';

  // Tier 1: Needs repair takes absolute precedence
  if (status === 'needs_repair') {
    return PRIORITY_TIERS.NEEDS_REPAIR;
  }

  // Tier 2: Review due (either explicit status or scheduled window elapsed)
  const due = status === 'review_due' || (
    ['consolidating', 'durable'].includes(status) &&
    entry.nextReviewAt &&
    new Date(entry.nextReviewAt) <= now
  );
  if (due) {
    return PRIORITY_TIERS.REVIEW_DUE;
  }

  // Tier 3: Developing or Introduced
  if (status === 'developing' || status === 'introduced') {
    return PRIORITY_TIERS.DEVELOPING_OR_INTRODUCED;
  }

  // Tier 4: Consolidating
  if (status === 'consolidating') {
    return PRIORITY_TIERS.CONSOLIDATING;
  }

  // Tier 5: Durable or Unseen
  return PRIORITY_TIERS.DURABLE_OR_UNSEEN;
}

/**
 * Selects an adaptive exercise based on learner evidence and interleaving.
 *
 * Priority order:
 * 1. Competencies in "needs_repair"
 * 2. Competencies in "review_due"
 * 3. Competencies in "developing" or "introduced"
 * 4. Competencies in "consolidating"
 * 5. Competencies in "durable" or "unseen"
 *
 * Deterministic tie-breaking:
 * 1. Cognitive interleaving: avoid repeating previousCompetencyId if candidates exist
 * 2. Lowest attempts: prioritize less-practiced items (starvation prevention)
 * 3. Oldest lastAttemptAt: prioritize items practiced furthest in the past (spacing maximization)
 * 4. Stable secondary sort: exercise id / type lexicographical comparison
 *
 * @param {object} params
 * @param {string} [params.moduleId]
 * @param {object[]} params.availableExercises - Array of exercise objects or metadata
 * @param {object} [params.store] - ProgressStore instance (defaults to singleton)
 * @param {Date} [params.now=new Date()] - Reference timestamp for deterministic tests
 * @param {string} [params.previousCompetencyId=null] - Competency ID of preceding exercise
 * @returns {{ exercise: object|null, selectionReason: string, priorityTier: number|null, targetCompetencyId: string|null }}
 */
export function selectAdaptiveExercise({
  moduleId,
  availableExercises,
  store,
  now = new Date(),
  previousCompetencyId = null,
} = {}) {
  if (!Array.isArray(availableExercises) || availableExercises.length === 0) {
    return {
      exercise: null,
      selectionReason: 'No hay ejercicios disponibles para seleccionar.',
      priorityTier: null,
      targetCompetencyId: null,
    };
  }

  const progressStore = store || getProgressStore();

  // If previousCompetencyId not explicitly provided, look it up from store's last event
  let lastCompId = previousCompetencyId;
  if (!lastCompId) {
    const recent = progressStore.getRecentEvents(1);
    if (recent && recent.length > 0) {
      const lastEvt = recent[0];
      if (Array.isArray(lastEvt.competencyIds) && lastEvt.competencyIds.length > 0) {
        lastCompId = lastEvt.competencyIds[0];
      } else if (lastEvt.competencyId) {
        lastCompId = lastEvt.competencyId;
      }
    }
  }

  // Evaluate each candidate exercise
  const evaluatedCandidates = availableExercises.map((exercise, index) => {
    const compIds = Array.isArray(exercise.competencyIds) && exercise.competencyIds.length > 0
      ? exercise.competencyIds
      : exercise.competencyId ? [exercise.competencyId] : [];

    if (compIds.length === 0) {
      // Unspecified competency: treated as Tier 5 (Unseen)
      return {
        exercise,
        index,
        targetCompetencyId: null,
        tier: PRIORITY_TIERS.DURABLE_OR_UNSEEN,
        entry: null,
        attempts: 0,
        lastAttemptAt: null,
      };
    }

    // For multi-competency exercises, select the competency with highest priority (lowest tier number)
    let bestCompId = compIds[0];
    let bestTier = PRIORITY_TIERS.DURABLE_OR_UNSEEN;
    let bestEntry = progressStore.getCompetencyState(bestCompId);

    for (const cid of compIds) {
      const entry = progressStore.getCompetencyState(cid);
      const tier = evaluateCompetencyPriorityTier(entry, now);
      if (tier < bestTier) {
        bestTier = tier;
        bestCompId = cid;
        bestEntry = entry;
      }
    }

    return {
      exercise,
      index,
      targetCompetencyId: bestCompId,
      tier: bestTier,
      entry: bestEntry,
      attempts: bestEntry ? (bestEntry.attempts || 0) : 0,
      lastAttemptAt: bestEntry ? bestEntry.lastAttemptAt : null,
    };
  });

  // Step 1: Filter to highest priority tier available (lowest tier value)
  const minTier = Math.min(...evaluatedCandidates.map((c) => c.tier));
  let topCandidates = evaluatedCandidates.filter((c) => c.tier === minTier);

  // If only 1 candidate in top tier, select it immediately
  if (topCandidates.length === 1) {
    const winner = topCandidates[0];
    return {
      exercise: winner.exercise,
      selectionReason: buildSelectionReason(winner.tier, winner.entry),
      priorityTier: winner.tier,
      targetCompetencyId: winner.targetCompetencyId,
    };
  }

  // Step 2: Cognitive Interleaving
  // If multiple candidates share top tier and lastCompId is known, prefer candidates targeting a different competency
  if (lastCompId && topCandidates.length > 1) {
    const interleaved = topCandidates.filter(
      (c) => c.targetCompetencyId && c.targetCompetencyId !== lastCompId
    );
    if (interleaved.length > 0) {
      topCandidates = interleaved;
    }
  }

  // Step 3: Tie-breaking by lowest attempts (starvation prevention)
  const minAttempts = Math.min(...topCandidates.map((c) => c.attempts));
  topCandidates = topCandidates.filter((c) => c.attempts === minAttempts);

  // Step 4: Tie-breaking by oldest lastAttemptAt (spacing maximization)
  // Null (never attempted) takes precedence over timestamps, then oldest timestamp
  topCandidates.sort((a, b) => {
    if (!a.lastAttemptAt && !b.lastAttemptAt) return 0;
    if (!a.lastAttemptAt) return -1; // a never attempted -> prioritize
    if (!b.lastAttemptAt) return 1;  // b never attempted -> prioritize
    return new Date(a.lastAttemptAt).getTime() - new Date(b.lastAttemptAt).getTime();
  });

  const oldestTime = topCandidates[0].lastAttemptAt;
  topCandidates = topCandidates.filter((c) => {
    if (!oldestTime) return !c.lastAttemptAt;
    return c.lastAttemptAt === oldestTime;
  });

  // Step 5: Stable deterministic secondary sort by exercise identifier or index
  topCandidates.sort((a, b) => {
    const idA = String(a.exercise.id || a.exercise.type || a.index);
    const idB = String(b.exercise.id || b.exercise.type || b.index);
    return idA.localeCompare(idB);
  });

  const winner = topCandidates[0];

  return {
    exercise: winner.exercise,
    selectionReason: buildSelectionReason(winner.tier, winner.entry),
    priorityTier: winner.tier,
    targetCompetencyId: winner.targetCompetencyId,
  };
}
