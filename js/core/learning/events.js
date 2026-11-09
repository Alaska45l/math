/**
 * @file js/core/learning/events.js
 * Normalized learning event contract, factory, schema validator, and immutability enforcer.
 * Pure Vanilla ES2022. Zero external dependencies. Zero eval. Zero emojis.
 *
 * Complies with ORIGINAL_REQUEST §P0.1, PROJECT.md §116, and LEARNING_ARCHITECTURE.md §6.4.
 */

export const EVENT_TYPES = Object.freeze({
  ANSWER_SUBMITTED: 'answer_submitted',
  PREDICTION_MADE: 'prediction_made',
  HINT_REQUESTED: 'hint_requested',
  SOLUTION_REVEALED: 'solution_revealed',
  SECTION_VISITED: 'section_visited',
  WIDGET_INTERACTED: 'widget_interacted',
  CHECK_REVIEW_DUE: 'check_review_due',
});

export const MODULE_IDS = Object.freeze({
  EXPONENCIALES: 'exponenciales',
  CUADRATICAS: 'cuadraticas',
  SUCESIONES: 'sucesiones',
  VALOR_ABSOLUTO: 'valor-absoluto',
  POTENCIAS_RAICES: 'potencias-raices',
});

export const ASSISTANCE_LEVELS = Object.freeze({
  NONE: 'none',
  HINTS: 'hints',
  SOLUTION_REVEALED: 'solution_revealed',
});

export const REPRESENTATION_TYPES = Object.freeze({
  SYMBOLIC: 'symbolic',
  GRAPHICAL: 'graphical',
  TABULAR: 'tabular',
  VERBAL: 'verbal',
  MANIPULATIVE: 'manipulative',
});

export const LEARNING_STAGES = Object.freeze({
  EXPLORATION: 'exploration',
  GUIDED_PRACTICE: 'guided_practice',
  RETRIEVAL: 'retrieval',
  INTERLEAVING: 'interleaving',
  TRANSFER: 'transfer',
});

export const TRANSFER_DISTANCES = Object.freeze({
  NEAR: 'near',
  FAR: 'far',
});

export const CONFIDENCE_LEVELS = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
});

let eventCounter = 0;

/**
 * Validates a learning event against the schema constraints.
 * Pure function, never throws.
 *
 * @param {any} evt
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateLearningEvent(evt) {
  const errors = [];

  if (!evt || typeof evt !== 'object' || Array.isArray(evt)) {
    return { valid: false, errors: ['Event must be a non-null object'] };
  }

  // eventId: non-empty string
  if (typeof evt.eventId !== 'string' || evt.eventId.trim().length === 0) {
    errors.push('eventId must be a non-empty string');
  }

  // type: valid enum
  const validTypes = Object.values(EVENT_TYPES);
  if (!validTypes.includes(evt.type)) {
    errors.push(`type must be one of: ${validTypes.join(', ')}`);
  }

  // moduleId: valid enum or valid slug /^[a-z0-9_-]+$/
  const validModuleIds = Object.values(MODULE_IDS);
  const isValidSlug = typeof evt.moduleId === 'string' && /^[a-z0-9_-]+$/.test(evt.moduleId);
  if (!validModuleIds.includes(evt.moduleId) && !isValidSlug) {
    errors.push('moduleId must be a valid module identifier or slug');
  }

  // exerciseId: non-empty string when present, required for answer_submitted
  if (evt.type === EVENT_TYPES.ANSWER_SUBMITTED) {
    if (typeof evt.exerciseId !== 'string' || evt.exerciseId.trim().length === 0) {
      errors.push('exerciseId must be a non-empty string for answer_submitted events');
    }
  } else if (evt.exerciseId !== undefined && evt.exerciseId !== null) {
    if (typeof evt.exerciseId !== 'string' || evt.exerciseId.trim().length === 0) {
      errors.push('exerciseId must be a non-empty string when provided');
    }
  }

  // competencyIds: non-empty array of non-empty strings
  if (!Array.isArray(evt.competencyIds) || evt.competencyIds.length === 0) {
    errors.push('competencyIds must be an array with at least one competency ID');
  } else {
    for (const cid of evt.competencyIds) {
      if (typeof cid !== 'string' || cid.trim().length === 0) {
        errors.push('All elements in competencyIds must be non-empty strings');
        break;
      }
    }
  }

  // occurredAt: valid ISO 8601 string
  if (typeof evt.occurredAt !== 'string' || isNaN(Date.parse(evt.occurredAt))) {
    errors.push('occurredAt must be a valid ISO 8601 timestamp string');
  }

  // correct: boolean
  if (typeof evt.correct !== 'boolean') {
    errors.push('correct must be a boolean');
  }

  // hintsUsed: non-negative integer
  if (typeof evt.hintsUsed !== 'number' || !Number.isInteger(evt.hintsUsed) || evt.hintsUsed < 0) {
    errors.push('hintsUsed must be a non-negative integer');
  }

  // solutionRevealed: boolean
  if (typeof evt.solutionRevealed !== 'boolean') {
    errors.push('solutionRevealed must be a boolean');
  }

  // assistance: valid enum and semantically consistent
  const validAssistance = Object.values(ASSISTANCE_LEVELS);
  if (!validAssistance.includes(evt.assistance)) {
    errors.push(`assistance must be one of: ${validAssistance.join(', ')}`);
  } else {
    if (evt.solutionRevealed === true && evt.assistance !== ASSISTANCE_LEVELS.SOLUTION_REVEALED) {
      errors.push(`assistance '${evt.assistance}' is inconsistent with solutionRevealed=true`);
    } else if (
      evt.solutionRevealed === false &&
      typeof evt.hintsUsed === 'number' &&
      evt.hintsUsed > 0 &&
      evt.assistance !== ASSISTANCE_LEVELS.HINTS
    ) {
      errors.push(`assistance '${evt.assistance}' is inconsistent with hintsUsed=${evt.hintsUsed}`);
    } else if (
      evt.solutionRevealed === false &&
      evt.hintsUsed === 0 &&
      evt.assistance !== ASSISTANCE_LEVELS.NONE
    ) {
      errors.push(`assistance '${evt.assistance}' is inconsistent with hintsUsed=0 and solutionRevealed=false`);
    }
  }

  // diagnosticId: null or non-empty string
  if (evt.diagnosticId !== null && evt.diagnosticId !== undefined) {
    if (typeof evt.diagnosticId !== 'string' || evt.diagnosticId.trim().length === 0) {
      errors.push('diagnosticId must be null or a non-empty string');
    }
  }

  // representation: valid enum
  const validRepresentations = Object.values(REPRESENTATION_TYPES);
  if (!validRepresentations.includes(evt.representation)) {
    errors.push(`representation must be one of: ${validRepresentations.join(', ')}`);
  }

  // stage: valid enum
  const validStages = Object.values(LEARNING_STAGES);
  if (!validStages.includes(evt.stage)) {
    errors.push(`stage must be one of: ${validStages.join(', ')}`);
  }

  // transferDistance: valid enum
  const validDistances = Object.values(TRANSFER_DISTANCES);
  if (!validDistances.includes(evt.transferDistance)) {
    errors.push(`transferDistance must be one of: ${validDistances.join(', ')}`);
  }

  // Optional durationMs: non-negative finite number
  if (evt.durationMs !== undefined && evt.durationMs !== null) {
    if (typeof evt.durationMs !== 'number' || !Number.isFinite(evt.durationMs) || evt.durationMs < 0) {
      errors.push('durationMs must be a non-negative finite number');
    }
  }

  // Optional confidence: valid enum
  if (evt.confidence !== undefined && evt.confidence !== null) {
    const validConfidences = Object.values(CONFIDENCE_LEVELS);
    if (!validConfidences.includes(evt.confidence)) {
      errors.push(`confidence must be one of: ${validConfidences.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Factory function creating a validated, deeply frozen LearningEvent.
 *
 * @param {Partial<object>} raw
 * @returns {Readonly<object>}
 */
export function createLearningEvent(raw = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('Invalid raw event: expected a non-null object');
  }

  eventCounter += 1;
  const autoEventId = `evt-${Date.now().toString(36)}-${eventCounter.toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  // Normalize competencyIds from array or singular competencyId
  let competencyIds = [];
  if (Array.isArray(raw.competencyIds)) {
    competencyIds = [...raw.competencyIds];
  } else if (typeof raw.competencyId === 'string' && raw.competencyId.trim().length > 0) {
    competencyIds = [raw.competencyId.trim()];
  }

  const solutionRevealed = Boolean(raw.solutionRevealed);
  const hintsUsed = typeof raw.hintsUsed === 'number' && Number.isInteger(raw.hintsUsed) && raw.hintsUsed >= 0
    ? raw.hintsUsed
    : (raw.hintsUsed === undefined ? 0 : raw.hintsUsed);

  // Derive assistance if not explicitly valid or provided
  let assistance = raw.assistance;
  if (!assistance) {
    if (solutionRevealed) {
      assistance = ASSISTANCE_LEVELS.SOLUTION_REVEALED;
    } else if (hintsUsed > 0) {
      assistance = ASSISTANCE_LEVELS.HINTS;
    } else {
      assistance = ASSISTANCE_LEVELS.NONE;
    }
  }

  const normalized = {
    eventId: typeof raw.eventId === 'string' && raw.eventId.trim().length > 0 ? raw.eventId.trim() : autoEventId,
    type: raw.type || EVENT_TYPES.ANSWER_SUBMITTED,
    moduleId: raw.moduleId,
    exerciseId: raw.exerciseId || (raw.type && raw.type !== EVENT_TYPES.ANSWER_SUBMITTED ? null : 'exercise-default'),
    competencyIds,
    occurredAt: raw.occurredAt || new Date().toISOString(),
    correct: Boolean(raw.correct),
    hintsUsed,
    solutionRevealed,
    assistance,
    diagnosticId: raw.diagnosticId || null,
    representation: raw.representation || REPRESENTATION_TYPES.SYMBOLIC,
    stage: raw.stage || LEARNING_STAGES.GUIDED_PRACTICE,
    transferDistance: raw.transferDistance || TRANSFER_DISTANCES.NEAR,
  };

  if (raw.durationMs !== undefined && raw.durationMs !== null) {
    normalized.durationMs = raw.durationMs;
  }
  if (raw.confidence !== undefined && raw.confidence !== null) {
    normalized.confidence = raw.confidence;
  }
  if (raw.metadata !== undefined && raw.metadata !== null && typeof raw.metadata === 'object') {
    normalized.metadata = Object.freeze({ ...raw.metadata });
  }

  const validation = validateLearningEvent(normalized);
  if (!validation.valid) {
    throw new TypeError(`Invalid LearningEvent: ${validation.errors.join('; ')}`);
  }

  Object.freeze(normalized.competencyIds);
  return Object.freeze(normalized);
}
