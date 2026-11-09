/**
 * @file js/core/learning/scheduler.js
 * Deterministic spaced retrieval window calculator for Alaska Math Lab.
 * Implements the evidence-based interval ladder.
 * Pure functions, zero external dependencies.
 *
 * Complies with ORIGINAL_REQUEST §P0.1, PROJECT.md §131, and LEARNING_ARCHITECTURE.md §6.6.
 */

export const RETRIEVAL_INTERVALS_MS = Object.freeze({
  REPAIR: 4 * 60 * 60 * 1000,                  // 4 hours (14,400,000 ms)
  INITIAL_CONSOLIDATION: 24 * 60 * 60 * 1000,  // 24 hours (86,400,000 ms)
  DELAYED_REVIEW_1: 72 * 60 * 60 * 1000,       // 72 hours / 3 days (259,200,000 ms)
  DELAYED_REVIEW_2: 168 * 60 * 60 * 1000,      // 168 hours / 7 days (604,800,000 ms)
  DELAYED_REVIEW_3_PLUS: 336 * 60 * 60 * 1000, // 336 hours / 14 days (1,209,600,000 ms)
});

export const RETRIEVAL_INTERVALS_HOURS = Object.freeze({
  REPAIR: 4,
  INITIAL_CONSOLIDATION: 24,
  DELAYED_REVIEW_1: 72,
  DELAYED_REVIEW_2: 168,
  DELAYED_REVIEW_3_PLUS: 336,
});

/**
 * Normalizes a reference timestamp into a valid Date object.
 * @param {Date|string|number} [now]
 * @returns {Date}
 */
export function normalizeTimestamp(now) {
  if (now instanceof Date) {
    if (isNaN(now.getTime())) throw new TypeError('Invalid Date provided to normalizeTimestamp');
    return now;
  }
  if (typeof now === 'string' || typeof now === 'number') {
    const d = new Date(now);
    if (isNaN(d.getTime())) throw new TypeError(`Invalid timestamp: ${now}`);
    return d;
  }
  return new Date();
}

/**
 * Computes the next scheduled review date for a competency entry.
 * Pure function.
 * @param {object} entry - CompetencyEntry
 * @param {object} [options]
 * @param {Date|string|number} [options.now=new Date()]
 * @returns {Date|null} Next review Date, or null if no review is scheduled
 */
export function computeNextReview(entry, options = {}) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const now = normalizeTimestamp(options.now);
  const nowMs = now.getTime();

  // 1. Repair case (+4 hours)
  if (entry.status === 'needs_repair') {
    return new Date(nowMs + RETRIEVAL_INTERVALS_MS.REPAIR);
  }

  // 2. Unconsolidated cases (unseen, introduced, developing without repair status)
  if (entry.status === 'unseen' || entry.status === 'introduced' || entry.status === 'developing') {
    return null;
  }

  // 3. Consolidated or Durable review ladder
  const delayedSuccesses = entry.delayedRecallSuccessCount ?? entry.delayedCorrect ?? 0;

  if (delayedSuccesses === 0) {
    // Initial consolidation: +24 hours
    return new Date(nowMs + RETRIEVAL_INTERVALS_MS.INITIAL_CONSOLIDATION);
  } else if (delayedSuccesses === 1) {
    // Delayed review 1 success: +72 hours
    return new Date(nowMs + RETRIEVAL_INTERVALS_MS.DELAYED_REVIEW_1);
  } else if (delayedSuccesses === 2) {
    // Delayed review 2 success: +168 hours (7 days)
    return new Date(nowMs + RETRIEVAL_INTERVALS_MS.DELAYED_REVIEW_2);
  } else {
    // Delayed review 3+ success: +336 hours (14 days)
    return new Date(nowMs + RETRIEVAL_INTERVALS_MS.DELAYED_REVIEW_3_PLUS);
  }
}

/**
 * Determines whether a competency review is currently due.
 * Pure function.
 * @param {object} entry - CompetencyEntry
 * @param {object} [options]
 * @param {Date|string|number} [options.now=new Date()]
 * @returns {boolean}
 */
export function isReviewDue(entry, options = {}) {
  if (!entry || typeof entry !== 'object' || !entry.nextReviewAt) {
    return false;
  }

  const now = normalizeTimestamp(options.now);
  const reviewTime = new Date(entry.nextReviewAt).getTime();

  if (isNaN(reviewTime)) {
    return false;
  }

  return now.getTime() >= reviewTime;
}
