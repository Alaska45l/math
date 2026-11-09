/**
 * @file js/core/learning/progress-store.js
 * Alaska Math Lab — Unified Learning Progress Store
 * Local-first persistence engine with safe in-memory fallback,
 * bounded event log (last 200 events), and reactive subscriptions.
 *
 * Complies with ORIGINAL_REQUEST §P0.1, PROJECT.md §125, and LEARNING_ARCHITECTURE.md §6.5 & §6.9.
 * Runtime: Vanilla ES2022. Zero external dependencies. Zero eval. Zero emojis.
 */

import { evaluateCompetencyMastery } from './mastery.js';
import { isReviewDue } from './scheduler.js';
import { getCompetenciesByModule } from './competencies.js';

export const STORAGE_KEY = 'alaska:learning:v1';
export const MAX_EVENT_LOG_SIZE = 200;
export const SCHEMA_VERSION = 1;

/**
 * In-memory fallback storage when localStorage is unavailable, disabled,
 * or throws QuotaExceededError (e.g. Node.js test runner, private browsing).
 */
export class MemoryStorage {
  constructor() {
    this._data = new Map();
  }
  getItem(key) {
    return this._data.has(key) ? this._data.get(key) : null;
  }
  setItem(key, value) {
    this._data.set(key, String(value));
  }
  removeItem(key) {
    this._data.delete(key);
  }
  clear() {
    this._data.clear();
  }
}

/**
 * Resolves the active storage backend safely without throwing exceptions.
 */
function resolveStorageEngine() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage !== null) {
      const probeKey = '__alaska_storage_probe__';
      localStorage.setItem(probeKey, 'ok');
      const result = localStorage.getItem(probeKey);
      localStorage.removeItem(probeKey);
      if (result === 'ok') {
        return localStorage;
      }
    }
  } catch {
    // QuotaExceededError, SecurityError or disabled storage
  }
  return new MemoryStorage();
}

/**
 * Creates a default, unvisited competency entry.
 * @param {string} competencyId
 * @returns {object}
 */
export function createDefaultCompetencyEntry(competencyId) {
  return {
    competencyId,
    status: 'unseen',
    attempts: 0,
    independentCount: 0,
    independentCorrect: 0, // alias for backwards compatibility
    assistedCount: 0,
    assistedCorrect: 0,    // alias for backwards compatibility
    errorCount: 0,
    consecutiveErrors: 0,
    recentDiagnosticIds: [],
    diagnostics: [],       // alias
    lastAttemptAt: null,
    nextReviewAt: null,
    delayedRecallSuccessCount: 0,
    delayedCorrect: 0,      // alias
    transferSuccessCount: 0,
    transferCorrect: 0,     // alias
    distinctExercises: [],
    representationsCovered: [],
    stagesCovered: [],
    lastEventId: null,
    history: [],
  };
}

/**
 * Creates a clean default store state.
 * @returns {object}
 */
export function createDefaultStoreState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    competencies: {},
    events: [],
  };
}

/**
 * Status badge presentation map for UI reports and dashboards.
 */
export const STATUS_BADGES = Object.freeze({
  unseen: Object.freeze({ label: 'Sin ver', tone: 'muted', variant: 'muted', classModifier: 'unseen' }),
  introduced: Object.freeze({ label: 'Introducido', tone: 'muted', variant: 'muted', classModifier: 'introduced' }),
  developing: Object.freeze({ label: 'En desarrollo', tone: 'info', variant: 'blue', classModifier: 'developing' }),
  consolidating: Object.freeze({ label: 'Consolidando', tone: 'warning', variant: 'yellow', classModifier: 'consolidating' }),
  review_due: Object.freeze({ label: 'Repaso debido', tone: 'attention', variant: 'orange', classModifier: 'review-due' }),
  durable: Object.freeze({ label: 'Durable', tone: 'success', variant: 'green', classModifier: 'durable' }),
  needs_repair: Object.freeze({ label: 'Requiere refuerzo', tone: 'danger', variant: 'pink', classModifier: 'needs-repair' }),
});

/**
 * Canonical module competency ID mappings used as fallback when
 * competencies.js is not yet initialized or dynamically querying.
 */
const MODULE_COMPETENCY_IDS = {
  exponenciales: [
    'exponentials.tables_additive_vs_multiplicative',
    'exponentials.base_and_initial_value_roles',
    'exponentials.continuous_extension_and_restrictions',
    'exponentials.asymptote_and_horizontal_reflection',
    'exponentials.quadrant_monotonicity',
    'exponentials.analytical_reconstruction_two_points',
    'exponentials.half_life_and_compound_periods',
    'exponentials.asymptote_shifts_and_image',
    'exponentials.full_analytical_study',
    'exponentials.equations_bases_factoring_substitution',
  ],
  cuadraticas: [
    'quadratics.area_model_and_notable_products',
    'quadratics.grouping_and_factoring_strategy',
    'quadratics.parabola_geometry_and_parameters',
    'quadratics.vertex_symmetry_canonical',
    'quadratics.roots_and_factored_form',
    'quadratics.completing_the_square',
    'quadratics.discriminant_and_vieta',
    'quadratics.full_analytical_study',
    'quadratics.line_parabola_intersection',
    'quadratics.extremum_optimization',
  ],
};

/**
 * Core Learning Progress Store Class
 */
export class ProgressStore {
  /**
   * @param {object} [options]
   * @param {object} [options.storage] - Custom storage backend (e.g. for testing)
   * @param {function} [options.masteryEvaluator] - Custom transition evaluator
   */
  constructor(options = {}) {
    this._storage = options.storage || resolveStorageEngine();
    this._masteryEvaluator = options.masteryEvaluator || evaluateCompetencyMastery;
    this._subscribers = new Set();
    this._state = this._loadState();
  }

  /**
   * Loads state from storage with schema validation and safe fallback.
   * @private
   */
  _loadState() {
    try {
      const raw = this._storage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultStoreState();
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        if (!parsed.competencies || typeof parsed.competencies !== 'object') {
          parsed.competencies = {};
        }
        if (!Array.isArray(parsed.events)) {
          parsed.events = [];
        }
        if (typeof parsed.schemaVersion !== 'number') {
          parsed.schemaVersion = SCHEMA_VERSION;
        }
        return parsed;
      }
    } catch {
      // JSON corruption recovery: returns fresh state without crashing
    }
    return createDefaultStoreState();
  }

  /**
   * Persists state to storage safely.
   * @private
   */
  _saveState() {
    this._state.updatedAt = new Date().toISOString();
    // Enforce bounded event log size
    if (this._state.events.length > MAX_EVENT_LOG_SIZE) {
      this._state.events = this._state.events.slice(-MAX_EVENT_LOG_SIZE);
    }
    try {
      this._storage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch {
      // If active storage fails (e.g. QuotaExceededError), switch to memory storage
      if (!(this._storage instanceof MemoryStorage)) {
        const mem = new MemoryStorage();
        mem.setItem(STORAGE_KEY, JSON.stringify(this._state));
        this._storage = mem;
      }
    }
  }

  /**
   * Subscribes a listener to store modifications.
   * @param {function} listener
   * @returns {function} Unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener === 'function') {
      this._subscribers.add(listener);
    }
    return () => this.unsubscribe(listener);
  }

  /**
   * Unsubscribes a listener.
   * @param {function} listener
   */
  unsubscribe(listener) {
    this._subscribers.delete(listener);
  }

  /**
   * Notifies all subscribers of a mutation.
   * @private
   */
  _notifySubscribers(payload) {
    this._subscribers.forEach((fn) => {
      try {
        fn(payload);
      } catch {
        // Prevent subscriber errors from disrupting the store
      }
    });
  }

  /**
   * Records a normalized learning event, invokes mastery transition,
   * updates the store state, and persists.
   *
   * @param {object} event - Normalized LearningEvent
   * @returns {{ event: object, transition: object, updatedEntry: object, transitions: object[] }}
   */
  recordLearningEvent(event) {
    if (!event || typeof event !== 'object') {
      throw new TypeError('recordLearningEvent requires a valid event object');
    }

    // Append to rolling event buffer
    this._state.events.push(event);
    if (this._state.events.length > MAX_EVENT_LOG_SIZE) {
      this._state.events = this._state.events.slice(-MAX_EVENT_LOG_SIZE);
    }

    // Resolve target competency IDs
    const compIds = Array.isArray(event.competencyIds) && event.competencyIds.length > 0
      ? event.competencyIds
      : event.competencyId ? [event.competencyId] : [];

    const transitions = [];
    let primaryTransition = null;
    let primaryUpdatedEntry = null;

    for (const compId of compIds) {
      const currentEntry = this._state.competencies[compId]
        ? { ...this._state.competencies[compId] }
        : createDefaultCompetencyEntry(compId);

      // Invoke mastery engine transition
      const transitionResult = this._masteryEvaluator(currentEntry, event, {
        now: event.occurredAt ? new Date(event.occurredAt) : new Date(),
      });

      const updatedEntry = { ...(transitionResult.updatedEntry || currentEntry) };

      // Update metadata tracking
      updatedEntry.lastAttemptAt = event.occurredAt || new Date().toISOString();
      updatedEntry.lastEventId = event.eventId || null;

      // Maintain recent diagnostics rolling list (last 10)
      if (event.diagnosticId) {
        const diagnostics = Array.isArray(updatedEntry.recentDiagnosticIds)
          ? [...updatedEntry.recentDiagnosticIds]
          : [];
        diagnostics.push(event.diagnosticId);
        updatedEntry.recentDiagnosticIds = diagnostics.slice(-10);
        updatedEntry.diagnostics = [...updatedEntry.recentDiagnosticIds];
      }

      this._state.competencies[compId] = updatedEntry;
      transitions.push(transitionResult);

      if (!primaryTransition) {
        primaryTransition = transitionResult;
        primaryUpdatedEntry = updatedEntry;
      }
    }

    this._saveState();

    const result = {
      event,
      transition: primaryTransition,
      updatedEntry: primaryUpdatedEntry,
      transitions,
    };

    this._notifySubscribers(result);
    return result;
  }

  /**
   * Retrieves current competency state or default 'unseen' entry.
   * Returns a defensive copy to prevent accidental mutations.
   *
   * @param {string} competencyId
   * @returns {object} Defensive copy of CompetencyEntry
   */
  getCompetencyState(competencyId) {
    if (!competencyId) return createDefaultCompetencyEntry('');
    const entry = this._state.competencies[competencyId];
    if (!entry) {
      return createDefaultCompetencyEntry(competencyId);
    }
    return {
      ...entry,
      recentDiagnosticIds: Array.isArray(entry.recentDiagnosticIds)
        ? [...entry.recentDiagnosticIds]
        : [],
      diagnostics: Array.isArray(entry.diagnostics)
        ? [...entry.diagnostics]
        : (Array.isArray(entry.recentDiagnosticIds) ? [...entry.recentDiagnosticIds] : []),
      history: Array.isArray(entry.history) ? [...entry.history] : [],
      distinctExercises: Array.isArray(entry.distinctExercises) ? [...entry.distinctExercises] : [],
      representationsCovered: Array.isArray(entry.representationsCovered) ? [...entry.representationsCovered] : [],
      stagesCovered: Array.isArray(entry.stagesCovered) ? [...entry.stagesCovered] : [],
    };
  }

  /**
   * Returns all competency entries as an object map.
   * @returns {object} Map of competencyId -> CompetencyEntry
   */
  getAllCompetencies() {
    const result = {};
    for (const [id, entry] of Object.entries(this._state.competencies)) {
      result[id] = this.getCompetencyState(id);
    }
    return result;
  }

  /**
   * Retrieves recent events from the bounded event log.
   * @param {number} [limit=50]
   * @returns {object[]} Array of events in chronological order
   */
  getRecentEvents(limit = 50) {
    const count = Math.max(1, Math.min(limit, MAX_EVENT_LOG_SIZE));
    return this._state.events.slice(-count);
  }

  /**
   * Aggregates module learning KPIs and returns list of competencies with UI badges.
   *
   * @param {'exponenciales' | 'cuadraticas' | string} moduleId
   * @returns {{ moduleId: string, updatedAt: string, summary: object, competencies: object[] }}
   */
  getModuleReport(moduleId) {
    let knownIds = [];
    try {
      const regComps = getCompetenciesByModule(moduleId);
      if (Array.isArray(regComps) && regComps.length > 0) {
        knownIds = regComps.map((c) => c.id);
      }
    } catch {
      // Fallback if competencies module not available
    }

    if (knownIds.length === 0) {
      knownIds = MODULE_COMPETENCY_IDS[moduleId] || [];
    }

    // Also include any stored competencies matching module prefix if not in canonical list
    const prefix = moduleId === 'exponenciales' ? 'exponentials.' : moduleId === 'cuadraticas' ? 'quadratics.' : `${moduleId}.`;
    const storedKeys = Object.keys(this._state.competencies).filter((k) => k.startsWith(prefix));
    const allModuleIds = Array.from(new Set([...knownIds, ...storedKeys]));

    const summary = {
      total: allModuleIds.length,
      durable: 0,
      consolidating: 0,
      developing: 0,
      review_due: 0,
      needs_repair: 0,
      introduced: 0,
      unseen: 0,
    };

    const now = new Date();
    const list = allModuleIds.map((id) => {
      const state = this.getCompetencyState(id);
      let effectiveStatus = state.status || 'unseen';

      // Dynamically evaluate if spaced review window has passed for consolidating/durable
      if (
        (effectiveStatus === 'consolidating' || effectiveStatus === 'durable') &&
        state.nextReviewAt &&
        new Date(state.nextReviewAt) <= now
      ) {
        effectiveStatus = 'review_due';
      }

      if (summary[effectiveStatus] !== undefined) {
        summary[effectiveStatus] += 1;
      } else {
        summary.unseen += 1;
      }

      const badge = STATUS_BADGES[effectiveStatus] || STATUS_BADGES.unseen;

      return {
        id,
        competencyId: id,
        status: effectiveStatus,
        badge,
        attempts: state.attempts || 0,
        independentCorrect: state.independentCorrect || state.independentCount || 0,
        independentCount: state.independentCount || state.independentCorrect || 0,
        assistedCorrect: state.assistedCorrect || state.assistedCount || 0,
        assistedCount: state.assistedCount || state.assistedCorrect || 0,
        errorCount: state.errorCount || 0,
        recentDiagnosticIds: state.recentDiagnosticIds || [],
        diagnostics: state.diagnostics || [],
        lastAttemptAt: state.lastAttemptAt,
        nextReviewAt: state.nextReviewAt,
      };
    });

    return {
      moduleId,
      updatedAt: this._state.updatedAt,
      summary,
      competencies: list,
    };
  }

  /**
   * Resets the store state and storage backing for testing.
   */
  resetStore() {
    this._state = createDefaultStoreState();
    try {
      this._storage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore removal errors
    }
    this._notifySubscribers({ type: 'store_reset' });
  }

  /**
   * Exports entire state snapshot (e.g. for inspection or migrations).
   * @returns {object}
   */
  exportState() {
    return JSON.parse(JSON.stringify(this._state));
  }

  /**
   * Imports a validated state snapshot.
   * @param {object} state
   */
  importState(state) {
    if (!state || typeof state !== 'object') {
      throw new TypeError('importState requires an object');
    }
    this._state = {
      schemaVersion: state.schemaVersion || SCHEMA_VERSION,
      updatedAt: state.updatedAt || new Date().toISOString(),
      competencies: state.competencies || {},
      events: Array.isArray(state.events) ? state.events.slice(-MAX_EVENT_LOG_SIZE) : [],
    };
    this._saveState();
    this._notifySubscribers({ type: 'state_imported' });
  }
}

// Singleton progress store instance
let _storeInstance = null;

/**
 * Returns the singleton ProgressStore instance.
 * @param {object} [options]
 * @returns {ProgressStore}
 */
export function getProgressStore(options) {
  if (!_storeInstance || options) {
    if (!_storeInstance) {
      _storeInstance = new ProgressStore(options);
    }
  }
  return _storeInstance;
}

/**
 * Convenience helper to create isolated instances for testing.
 * @param {object} [options]
 * @returns {ProgressStore}
 */
export function createProgressStore(options) {
  return new ProgressStore(options);
}

/**
 * Convenience module exports delegating directly to the singleton instance.
 */
export function recordLearningEvent(event) {
  return getProgressStore().recordLearningEvent(event);
}

export function getCompetencyState(competencyId) {
  return getProgressStore().getCompetencyState(competencyId);
}

export function getModuleReport(moduleId) {
  return getProgressStore().getModuleReport(moduleId);
}

export function resetStore() {
  if (_storeInstance) {
    _storeInstance.resetStore();
    _storeInstance = null;
  }
  const storage = resolveStorageEngine();
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {}
}
