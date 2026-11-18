/**
 * @file js/core/learning/exercise-selector.js
 * Alaska Math Lab — Adaptive & Global Interleaved Exercise Selector
 * Evidence-based problem recommendation prioritizing cognitive repair (with prerequisite-first
 * ordering), spaced retrieval, guided consolidation, cross-module interleaving, and transfer.
 *
 * ZERO imports from js/modules/*. Zero DOM. Zero eval(). Zero Unicode emojis.
 * Complies with ORIGINAL_REQUEST §P0.1 & §R6, PROJECT.md Contract 6, and LEARNING_ARCHITECTURE.md §6.7.
 */

import { getProgressStore } from './progress-store.js';
import { getAllCompetencies, getCompetency, getPrerequisites, resolveCompetencyId } from './competencies.js';
import { TRANSFER_FAMILIES, generateTransferChallenge } from './transfer.js';

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

const PREFIX_TO_MODULE = Object.freeze({
  'powers.': 'potencias-raices',
  'inequalities.': 'desigualdades',
  'units.': 'unidades',
  'functions.': 'funciones',
  'abs.': 'valor-absoluto',
  'sequences.': 'sucesiones',
  'linear.': 'lineal',
  'systems.': 'sistemas',
  'quadratics.': 'cuadraticas',
  'polynomials.': 'polinomios',
  'rational.': 'racionales-irracionales',
  'irrational.': 'racionales-irracionales',
  'exponentials.': 'exponenciales',
  'logarithms.': 'logaritmicas',
  'trig_ratios.': 'razones-trigonometricas',
  'trig_functions.': 'funciones-trigonometricas',
});

function inferModuleId(exercise, competencyId) {
  if (exercise && typeof exercise.moduleId === 'string' && exercise.moduleId && exercise.moduleId !== 'general') {
    return exercise.moduleId;
  }
  if (competencyId) {
    const comp = getCompetency(competencyId);
    if (comp && comp.moduleId) return comp.moduleId;
    for (const [prefix, mod] of Object.entries(PREFIX_TO_MODULE)) {
      if (competencyId.startsWith(prefix)) return mod;
    }
  }
  return exercise?.moduleId || null;
}

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

  if (status === 'needs_repair') {
    return PRIORITY_TIERS.NEEDS_REPAIR;
  }

  const due = status === 'review_due' || (
    ['consolidating', 'durable'].includes(status) &&
    entry.nextReviewAt &&
    new Date(entry.nextReviewAt) <= now
  );
  if (due) {
    return PRIORITY_TIERS.REVIEW_DUE;
  }

  if (status === 'developing' || status === 'introduced') {
    return PRIORITY_TIERS.DEVELOPING_OR_INTRODUCED;
  }

  if (status === 'consolidating') {
    return PRIORITY_TIERS.CONSOLIDATING;
  }

  return PRIORITY_TIERS.DURABLE_OR_UNSEEN;
}

function getExerciseCompetencyIds(exercise) {
  if (Array.isArray(exercise?.competencyIds) && exercise.competencyIds.length > 0) {
    return exercise.competencyIds;
  }
  if (exercise?.competencyId) {
    return [exercise.competencyId];
  }
  return [];
}

function countBrokenPrereqs(competencyId, progressStore) {
  if (!competencyId) return 0;
  const prereqs = getPrerequisites(competencyId, { recursive: true });
  let count = 0;
  for (const pid of prereqs) {
    const entry = progressStore.getCompetencyState(pid);
    if (entry && entry.status === 'needs_repair') {
      count += 1;
    }
  }
  return count;
}

/**
 * Selects an adaptive exercise based on learner evidence and interleaving.
 *
 * Caller Compatibility Policy (`excludeUnseen`):
 * - Defaults to `true` for global/multi-module selection (`!moduleId || moduleId === 'global' || moduleId === 'all' || Array.isArray(moduleIds)`).
 * - Defaults to `false` when a specific single `moduleId` (e.g. `'lineal'`, `'sistemas'`) is passed without an explicit `excludeUnseen` option.
 *
 * @param {object} [params]
 * @returns {{ exercise: object|null, selectionReason: string, priorityTier: number|null, targetCompetencyId: string|null, excludedUnseenCount?: number }}
 */
export function selectAdaptiveExercise({
  moduleId,
  moduleIds = null,
  availableExercises,
  store,
  now = new Date(),
  previousCompetencyId = null,
  previousModuleId = null,
  excludeUnseen,
  allowUntagged = false,
  includeGeneral = false,
} = {}) {
  if (!Array.isArray(availableExercises) || availableExercises.length === 0) {
    return {
      exercise: null,
      selectionReason: 'No hay ejercicios disponibles para seleccionar.',
      priorityTier: null,
      targetCompetencyId: null,
      excludedUnseenCount: 0,
    };
  }

  const progressStore = store || getProgressStore();
  const isGlobalScope =
    Array.isArray(moduleIds) ||
    !moduleId ||
    moduleId === 'global' ||
    moduleId === 'all';
  const resolvedExcludeUnseen =
    typeof excludeUnseen === 'boolean' ? excludeUnseen : isGlobalScope;

  // 0a. Module scope filtering
  let scopedExercises = availableExercises;
  if (Array.isArray(moduleIds) && moduleIds.length > 0) {
    const allowedSet = new Set(moduleIds);
    scopedExercises = availableExercises.filter((ex) => {
      const exMod = inferModuleId(ex, getExerciseCompetencyIds(ex)[0]);
      if (!exMod) return true;
      if (exMod === 'general') return includeGeneral || allowedSet.has('general');
      return allowedSet.has(exMod);
    });
  } else if (moduleId && moduleId !== 'global' && moduleId !== 'all') {
    scopedExercises = availableExercises.filter((ex) => {
      const exMod = inferModuleId(ex, getExerciseCompetencyIds(ex)[0]);
      if (!exMod) return true;
      if (exMod === 'general') return includeGeneral;
      return exMod === moduleId;
    });
  }

  if (scopedExercises.length === 0) {
    return {
      exercise: null,
      selectionReason: 'No hay ejercicios disponibles para el módulo solicitado.',
      priorityTier: null,
      targetCompetencyId: null,
      excludedUnseenCount: 0,
    };
  }

  // 0b. Strict excludeUnseen filtering
  let excludedUnseenCount = 0;
  let eligibleExercises = scopedExercises;
  if (resolvedExcludeUnseen) {
    eligibleExercises = [];
    for (const ex of scopedExercises) {
      const compIds = getExerciseCompetencyIds(ex);
      if (compIds.length === 0) {
        if (allowUntagged) {
          eligibleExercises.push(ex);
        } else {
          excludedUnseenCount += 1;
        }
        continue;
      }
      const anyUnseen = compIds.some((rawCid) => {
        const cid = resolveCompetencyId(rawCid) || rawCid;
        const entry = progressStore.getCompetencyState(cid);
        return !entry || !entry.status || entry.status === 'unseen';
      });
      if (anyUnseen) {
        excludedUnseenCount += 1;
      } else {
        eligibleExercises.push(ex);
      }
    }
  }

  if (eligibleExercises.length === 0) {
    return {
      exercise: null,
      selectionReason: 'Todavía no hay competencias introducidas disponibles para practicar en este modo.',
      priorityTier: null,
      targetCompetencyId: null,
      excludedUnseenCount,
    };
  }

  // Look up previous competency and previous module from recent event log if not provided
  let lastCompId = previousCompetencyId;
  let lastModId = previousModuleId;
  if (!lastCompId || !lastModId) {
    const recent = progressStore.getRecentEvents(1);
    if (recent && recent.length > 0) {
      const lastEvt = recent[0];
      if (!lastCompId) {
        if (Array.isArray(lastEvt.competencyIds) && lastEvt.competencyIds.length > 0) {
          lastCompId = lastEvt.competencyIds[0];
        } else if (lastEvt.competencyId) {
          lastCompId = lastEvt.competencyId;
        }
      }
      if (!lastModId && lastEvt.moduleId) {
        lastModId = lastEvt.moduleId;
      }
    }
  }

  // Evaluate each eligible candidate exercise
  const evaluatedCandidates = eligibleExercises.map((exercise, index) => {
    const compIds = getExerciseCompetencyIds(exercise);

    if (compIds.length === 0) {
      return {
        exercise,
        index,
        targetCompetencyId: null,
        moduleId: inferModuleId(exercise, null),
        tier: PRIORITY_TIERS.DURABLE_OR_UNSEEN,
        entry: null,
        attempts: 0,
        lastAttemptAt: null,
      };
    }

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
      moduleId: inferModuleId(exercise, bestCompId),
      tier: bestTier,
      entry: bestEntry,
      attempts: bestEntry ? (bestEntry.attempts || 0) : 0,
      lastAttemptAt: bestEntry ? bestEntry.lastAttemptAt : null,
    };
  });

  // Step 1: Filter to highest priority tier available
  const minTier = Math.min(...evaluatedCandidates.map((c) => c.tier));
  let topCandidates = evaluatedCandidates.filter((c) => c.tier === minTier);

  if (topCandidates.length === 1) {
    const winner = topCandidates[0];
    return {
      exercise: winner.exercise,
      selectionReason: buildSelectionReason(winner.tier, winner.entry),
      priorityTier: winner.tier,
      targetCompetencyId: winner.targetCompetencyId,
      excludedUnseenCount,
    };
  }

  // Step 1b: Prerequisite-first repair ordering inside Tier 1 (needs_repair)
  if (minTier === PRIORITY_TIERS.NEEDS_REPAIR && topCandidates.length > 1) {
    const withBrokenCount = topCandidates.map((c) => ({
      candidate: c,
      brokenPrereqs: countBrokenPrereqs(c.targetCompetencyId, progressStore),
    }));
    const minBroken = Math.min(...withBrokenCount.map((x) => x.brokenPrereqs));
    topCandidates = withBrokenCount
      .filter((x) => x.brokenPrereqs === minBroken)
      .map((x) => x.candidate);
  }

  // Step 2: Cognitive Interleaving (competency + cross-module diversity in global mode)
  if (lastCompId && topCandidates.length > 1) {
    const interleaved = topCandidates.filter(
      (c) => c.targetCompetencyId && c.targetCompetencyId !== lastCompId
    );
    if (interleaved.length > 0) {
      topCandidates = interleaved;
    }
  }

  if (isGlobalScope && lastModId && topCandidates.length > 1) {
    const crossModule = topCandidates.filter(
      (c) => c.moduleId && c.moduleId !== lastModId
    );
    if (crossModule.length > 0) {
      topCandidates = crossModule;
    }
  }

  // Step 3: Tie-breaking by lowest attempts (starvation prevention)
  const minAttempts = Math.min(...topCandidates.map((c) => c.attempts));
  topCandidates = topCandidates.filter((c) => c.attempts === minAttempts);

  // Step 4: Tie-breaking by oldest lastAttemptAt
  topCandidates.sort((a, b) => {
    if (!a.lastAttemptAt && !b.lastAttemptAt) return 0;
    if (!a.lastAttemptAt) return -1;
    if (!b.lastAttemptAt) return 1;
    return new Date(a.lastAttemptAt).getTime() - new Date(b.lastAttemptAt).getTime();
  });

  const oldestTime = topCandidates[0].lastAttemptAt;
  topCandidates = topCandidates.filter((c) => {
    if (!oldestTime) return !c.lastAttemptAt;
    return c.lastAttemptAt === oldestTime;
  });

  // Step 5: Stable deterministic secondary sort
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
    excludedUnseenCount,
  };
}

/**
 * Builds a pure exercise metadata catalog from the global competency registry
 * and eligible transfer challenge families without importing js/modules/*.
 *
 * @param {object} [options]
 * @returns {object[]}
 */
export function buildGlobalExerciseCatalog({
  competencies = null,
  store = null,
  seed = 101,
  includeTransfer = true,
} = {}) {
  const progressStore = store || getProgressStore();
  const compList = Array.isArray(competencies) ? competencies : getAllCompetencies();

  const catalog = compList.map((comp) => ({
    id: `comp-${comp.id}`,
    moduleId: comp.moduleId,
    sectionId: comp.sectionId || null,
    competencyId: comp.id,
    competencyIds: [comp.id],
    title: comp.title || comp.id,
    family: Array.isArray(comp.exerciseFamilies) && comp.exerciseFamilies[0]
      ? comp.exerciseFamilies[0]
      : comp.id,
    representation: Array.isArray(comp.representations) && comp.representations[0]
      ? comp.representations[0]
      : 'symbolic',
    stage: 'interleaving',
  }));

  if (includeTransfer) {
    TRANSFER_FAMILIES.forEach((fam, idx) => {
      const ch = generateTransferChallenge({
        seed: seed + idx * 37,
        family: fam.id,
        problemIndex: idx,
        store: progressStore,
        allowUnseen: false,
      });
      if (ch) {
        catalog.push(ch);
      }
    });
  }

  return catalog;
}

/**
 * Selects a deterministic global interleaved batch across introduced competencies/modules.
 *
 * @param {object} [options]
 * @returns {{ items: object[], excludedUnseenCount: number, introducedModuleCount: number }}
 */
export function selectGlobalInterleavedBatch({
  availableExercises = null,
  store = null,
  count = 6,
  moduleId = 'global',
  moduleIds = null,
  excludeUnseen = true,
  now = new Date(),
  seed = 101,
  includeGeneral = true,
} = {}) {
  const progressStore = store || getProgressStore();
  const basePool = Array.isArray(availableExercises)
    ? [...availableExercises]
    : buildGlobalExerciseCatalog({ store: progressStore, seed, includeTransfer: true });

  // Probe once to know total excludedUnseenCount and check if any eligible item exists
  const probe = selectAdaptiveExercise({
    moduleId,
    moduleIds,
    availableExercises: basePool,
    store: progressStore,
    now,
    excludeUnseen,
    includeGeneral,
  });

  const totalExcludedUnseen = probe.excludedUnseenCount || 0;
  if (!probe.exercise) {
    return {
      items: [],
      excludedUnseenCount: totalExcludedUnseen,
      introducedModuleCount: 0,
    };
  }

  const items = [];
  let remaining = [...basePool];
  let prevCompId = null;
  let prevModId = null;
  const pickedIds = new Set();

  for (let i = 0; i < count; i++) {
    if (remaining.length === 0) {
      // Pool was smaller than requested count -> allow wraparound from basePool
      remaining = [...basePool];
      pickedIds.clear();
    }

    const sel = selectAdaptiveExercise({
      moduleId,
      moduleIds,
      availableExercises: remaining,
      store: progressStore,
      now,
      previousCompetencyId: prevCompId,
      previousModuleId: prevModId,
      excludeUnseen,
      includeGeneral,
    });

    if (!sel.exercise) break;

    items.push(sel);
    prevCompId = sel.targetCompetencyId;
    prevModId = inferModuleId(sel.exercise, sel.targetCompetencyId);

    const exKey = sel.exercise.id || sel.exercise.type;
    if (exKey) pickedIds.add(exKey);

    remaining = remaining.filter((ex) => {
      const k = ex.id || ex.type;
      return k ? !pickedIds.has(k) : ex !== sel.exercise;
    });
  }

  const introducedMods = new Set(
    items.map((it) => inferModuleId(it.exercise, it.targetCompetencyId)).filter(Boolean)
  );

  return {
    items,
    excludedUnseenCount: totalExcludedUnseen,
    introducedModuleCount: introducedMods.size,
  };
}
