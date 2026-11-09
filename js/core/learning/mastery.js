/**
 * @file js/core/learning/mastery.js
 * Conservative 7-state mastery machine for Alaska Math Lab.
 * Eliminates the single-success mastery bug.
 * Pure function, immutable return values.
 *
 * Complies with ORIGINAL_REQUEST §P0.2, PROJECT.md §120, and LEARNING_ARCHITECTURE.md §3.1 & §6.3.
 */

import { computeNextReview, isReviewDue } from './scheduler.js';

export const MASTERY_STATUSES = Object.freeze([
  'unseen',
  'introduced',
  'developing',
  'consolidating',
  'review_due',
  'durable',
  'needs_repair',
]);

export const MASTERY_LABELS = Object.freeze({
  unseen: 'Sin ver',
  introduced: 'Introducido',
  developing: 'En desarrollo',
  consolidating: 'Consolidando',
  review_due: 'Repaso debido',
  durable: 'Durable',
  needs_repair: 'Requiere refuerzo',
});

export const MASTERY_BADGES = Object.freeze({
  unseen: { label: 'Sin ver', tone: 'muted', classModifier: 'unseen' },
  introduced: { label: 'Introducido', tone: 'muted', classModifier: 'introduced' },
  developing: { label: 'En desarrollo', tone: 'info', classModifier: 'developing' },
  consolidating: { label: 'Consolidando', tone: 'warning', classModifier: 'consolidating' },
  review_due: { label: 'Repaso debido', tone: 'attention', classModifier: 'review-due' },
  durable: { label: 'Durable', tone: 'success', classModifier: 'durable' },
  needs_repair: { label: 'Requiere refuerzo', tone: 'danger', classModifier: 'needs-repair' },
});

export function isValidMasteryStatus(status) {
  return typeof status === 'string' && MASTERY_STATUSES.includes(status);
}

export function createInitialCompetencyEntry(competencyId = 'unknown') {
  return Object.freeze({
    competencyId,
    status: 'unseen',
    attempts: 0,
    independentCount: 0,
    independentCorrect: 0, // alias for backwards compatibility
    assistedCount: 0,
    assistedCorrect: 0,    // alias for backwards compatibility
    errorCount: 0,
    consecutiveErrors: 0,
    diagnostics: Object.freeze([]),
    recentDiagnosticIds: Object.freeze([]), // alias
    lastAttemptAt: null,
    nextReviewAt: null,
    delayedRecallSuccessCount: 0,
    delayedCorrect: 0,      // alias
    transferSuccessCount: 0,
    transferCorrect: 0,     // alias
    distinctExercises: Object.freeze([]),
    representationsCovered: Object.freeze([]),
    stagesCovered: Object.freeze([]),
  });
}

function buildOutput(base) {
  return Object.freeze({
    competencyId: base.competencyId,
    status: base.status,
    attempts: base.attempts,
    independentCount: base.independentCount,
    independentCorrect: base.independentCount,
    assistedCount: base.assistedCount,
    assistedCorrect: base.assistedCount,
    errorCount: base.errorCount,
    consecutiveErrors: base.consecutiveErrors,
    diagnostics: Object.freeze([...base.diagnostics]),
    recentDiagnosticIds: Object.freeze([...base.diagnostics]),
    lastAttemptAt: base.lastAttemptAt,
    nextReviewAt: base.nextReviewAt,
    delayedRecallSuccessCount: base.delayedRecallSuccessCount,
    delayedCorrect: base.delayedRecallSuccessCount,
    transferSuccessCount: base.transferSuccessCount,
    transferCorrect: base.transferSuccessCount,
    distinctExercises: Object.freeze([...base.distinctExercises]),
    representationsCovered: Object.freeze([...base.representationsCovered]),
    stagesCovered: Object.freeze([...base.stagesCovered]),
  });
}

/**
 * Pure state transition function evaluating evidence against a competency.
 * Never mutates inputs.
 *
 * @param {object|null} currentEntry - Existing CompetencyEntry or null
 * @param {object|null} event - LearningEvent or null (if checking review due)
 * @param {object} [context={}] - Context options (e.g. { now: Date })
 * @returns {{ newStatus: string, updatedEntry: object, reason: string }}
 */
export function evaluateCompetencyMastery(currentEntry, event, context = {}) {
  const now = context.now
    ? (context.now instanceof Date ? context.now : new Date(context.now))
    : (event && event.occurredAt ? new Date(event.occurredAt) : new Date());
  const nowIso = now.toISOString();

  const base = {
    competencyId: currentEntry?.competencyId || event?.competencyIds?.[0] || 'unknown',
    status: currentEntry?.status || 'unseen',
    attempts: currentEntry?.attempts || 0,
    independentCount: currentEntry?.independentCount ?? currentEntry?.independentCorrect ?? 0,
    assistedCount: currentEntry?.assistedCount ?? currentEntry?.assistedCorrect ?? 0,
    errorCount: currentEntry?.errorCount || 0,
    consecutiveErrors: currentEntry?.consecutiveErrors || 0,
    diagnostics: Array.isArray(currentEntry?.diagnostics)
      ? [...currentEntry.diagnostics]
      : (Array.isArray(currentEntry?.recentDiagnosticIds) ? [...currentEntry.recentDiagnosticIds] : []),
    lastAttemptAt: currentEntry?.lastAttemptAt || null,
    nextReviewAt: currentEntry?.nextReviewAt || null,
    delayedRecallSuccessCount: currentEntry?.delayedRecallSuccessCount ?? currentEntry?.delayedCorrect ?? 0,
    transferSuccessCount: currentEntry?.transferSuccessCount ?? currentEntry?.transferCorrect ?? 0,
    distinctExercises: Array.isArray(currentEntry?.distinctExercises) ? [...currentEntry.distinctExercises] : [],
    representationsCovered: Array.isArray(currentEntry?.representationsCovered) ? [...currentEntry.representationsCovered] : [],
    stagesCovered: Array.isArray(currentEntry?.stagesCovered) ? [...currentEntry.stagesCovered] : [],
  };

  // 1. Spaced review expiration check
  const reviewWasDue = isReviewDue(base, { now });
  if (reviewWasDue && (base.status === 'consolidating' || base.status === 'durable')) {
    base.status = 'review_due';
  }

  // 2. Standalone review check (no event submitted or check_review_due)
  if (!event || event.type === 'check_review_due') {
    if (base.status === 'review_due' && currentEntry?.status !== 'review_due') {
      return {
        newStatus: 'review_due',
        updatedEntry: buildOutput(base),
        reason: 'Spaced retrieval interval elapsed; review is now due',
      };
    }
    return {
      newStatus: base.status,
      updatedEntry: buildOutput(base),
      reason: `Competency remains ${base.status}`,
    };
  }

  // 3. Exposure / exploration events (no answer submitted)
  if (event.type === 'section_visited' || event.type === 'widget_interacted' || event.type === 'prediction_made') {
    if (base.status === 'unseen') {
      base.status = 'introduced';
      return {
        newStatus: 'introduced',
        updatedEntry: buildOutput(base),
        reason: 'Section or widget explored; competency introduced',
      };
    }
    return {
      newStatus: base.status,
      updatedEntry: buildOutput(base),
      reason: `Competency remains ${base.status}`,
    };
  }

  // 4. Answer evaluation
  const isCorrect = Boolean(event.correct);
  const assistance = event.assistance || (event.solutionRevealed ? 'solution_revealed' : (event.hintsUsed > 0 ? 'hints' : 'none'));
  const isIndependent = isCorrect && assistance === 'none';
  const isAssisted = isCorrect && assistance !== 'none';
  const diagnosticId = event.diagnosticId || null;
  const exerciseId = event.exerciseId || null;
  const stage = event.stage || null;
  const representation = event.representation || null;

  base.attempts += 1;
  base.lastAttemptAt = nowIso;
  if (representation && !base.representationsCovered.includes(representation)) {
    base.representationsCovered.push(representation);
  }
  if (stage && !base.stagesCovered.includes(stage)) {
    base.stagesCovered.push(stage);
  }

  // ERROR PATH
  if (!isCorrect) {
    base.errorCount += 1;
    base.consecutiveErrors += 1;
    if (diagnosticId) {
      base.diagnostics.push(diagnosticId);
    }

    const recurringDiagnostic = diagnosticId && base.diagnostics.filter((d) => d === diagnosticId).length >= 2;
    const multipleErrors = base.errorCount >= 2;

    if (recurringDiagnostic || multipleErrors) {
      base.status = 'needs_repair';
      base.nextReviewAt = computeNextReview(base, { now })?.toISOString() || null;
      const reason = recurringDiagnostic
        ? `Recurring diagnostic detected (${diagnosticId}); competency requires targeted repair`
        : `Multiple errors recorded (errorCount: ${base.errorCount}); competency requires targeted repair`;
      return { newStatus: 'needs_repair', updatedEntry: buildOutput(base), reason };
    }

    // Single error path: regress to developing
    base.status = 'developing';
    return {
      newStatus: 'developing',
      updatedEntry: buildOutput(base),
      reason: 'Error recorded; competency is in developing',
    };
  }

  // CORRECT PATH
  base.consecutiveErrors = 0;

  if (isAssisted) {
    base.assistedCount += 1;
    base.status = 'developing';
    return {
      newStatus: 'developing',
      updatedEntry: buildOutput(base),
      reason: 'Assisted correct answer; competency is developing (independent practice required)',
    };
  }

  // INDEPENDENT CORRECT PATH
  base.independentCount += 1;
  if (exerciseId && !base.distinctExercises.includes(exerciseId)) {
    base.distinctExercises.push(exerciseId);
  }

  const distinctCount = exerciseId ? base.distinctExercises.length : base.independentCount;
  const isDelayed = reviewWasDue || base.status === 'review_due' || event.isDelayedRecall === true || stage === 'retrieval';
  if (isDelayed) {
    base.delayedRecallSuccessCount += 1;
  }

  const isTransfer = stage === 'transfer' || event.transferDistance === 'far' || (context.initialRepresentation && representation && representation !== context.initialRepresentation);
  if (isTransfer) {
    base.transferSuccessCount += 1;
  }

  // Rule 1: Exit from needs_repair -> developing
  if (currentEntry?.status === 'needs_repair') {
    base.status = 'developing';
    return {
      newStatus: 'developing',
      updatedEntry: buildOutput(base),
      reason: 'Independent correct answer after repair; transitioned to developing to rebuild consolidation',
    };
  }

  // Rule 2: Single-success bug elimination (CRITICAL)
  // 1 independent correct MUST transition to 'developing', NEVER 'consolidating', 'durable', or 'mastered'
  if (base.independentCount < 2 || distinctCount < 2) {
    base.status = 'developing';
    return {
      newStatus: 'developing',
      updatedEntry: buildOutput(base),
      reason: 'First independent correct answer recorded; developing competency (requires >= 2 distinct independent successes)',
    };
  }

  // Rule 3: Check durability
  if (base.delayedRecallSuccessCount >= 1 && base.transferSuccessCount >= 1) {
    base.status = 'durable';
    base.nextReviewAt = computeNextReview(base, { now })?.toISOString() || null;
    return {
      newStatus: 'durable',
      updatedEntry: buildOutput(base),
      reason: 'Independent correct on delayed recall and transfer problem completed; competency is durable',
    };
  }

  // Rule 4: Consolidation reached
  base.status = 'consolidating';
  base.nextReviewAt = computeNextReview(base, { now })?.toISOString() || null;
  return {
    newStatus: 'consolidating',
    updatedEntry: buildOutput(base),
    reason: 'Two or more independent correct answers in distinct opportunities; competency consolidated',
  };
}
