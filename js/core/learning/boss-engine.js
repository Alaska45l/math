/**
 * @file js/core/learning/boss-engine.js
 * Reusable 6-phase Boss / Integrator Engine (Reconocer, Predecir, Modelar, Resolver, Transferir, Debrief).
 * Powers Jefe Integrador 1 (Stage C.2) and Simulacro Global (Stage E).
 *
 * Invariants (LEARNING_ARCHITECTURE.md §8 & PROJECT.md Contract 3):
 * - Zero punitive countdown timer (optional passive durationMs metadata only).
 * - Strict independent vs assisted lock: requesting a hint or revealing solution permanently
 *   locks that phase to 'assisted'.
 * - Emits normalized LearningEvents against real unit competencies in alaska:learning:v1.
 *
 * Pure Vanilla ES2023. Zero external dependencies. Zero eval. Zero Unicode emojis.
 */

import { h, clear, chalkIcon } from '../dom.js';
import { playClick, playSuccess, playError } from '../sound.js';
import {
  createLearningEvent,
  EVENT_TYPES,
  ASSISTANCE_LEVELS,
  LEARNING_STAGES,
  TRANSFER_DISTANCES,
} from './events.js';
import { resolveCompetencyId } from './competencies.js';
import {
  MemoryStorage,
  recordLearningEvent,
  getProgressStore,
} from './progress-store.js';

export const BOSS_PHASES = Object.freeze([
  'Reconocer',
  'Predecir',
  'Modelar',
  'Resolver',
  'Transferir',
  'Debrief',
]);

export const ACTIVE_BOSS_PHASES = Object.freeze([
  'Reconocer',
  'Predecir',
  'Modelar',
  'Resolver',
  'Transferir',
]);

const DEFAULT_UNIT_DIRECTORY = Object.freeze({
  'powers.': { unit: 'U01', label: 'Unidad 01 · Potencias y Raíces', href: 'potencias-raices.html' },
  'inequalities.': { unit: 'U01', label: 'Unidad 01 · Desigualdades e Intervalos', href: 'desigualdades.html' },
  'units.': { unit: 'U01', label: 'Unidad 01 · Unidades y Conversión', href: 'unidades.html' },
  'abs.': { unit: 'U01/U02', label: 'Unidad 01/02 · Valor Absoluto', href: 'valor-absoluto.html' },
  'functions.': { unit: 'U02', label: 'Unidad 02 · Funciones', href: 'funciones.html' },
  'sequences.': { unit: 'U02', label: 'Unidad 02 · Sucesiones', href: 'sucesiones.html' },
  'linear.': { unit: 'U03', label: 'Unidad 03 · Función Lineal', href: 'lineal.html' },
  'systems.': { unit: 'U04', label: 'Unidad 04 · Sistemas de Ecuaciones', href: 'sistemas.html' },
  'quadratics.': { unit: 'U05', label: 'Unidad 05 · Función Cuadrática', href: 'cuadraticas.html' },
  'polynomials.': { unit: 'U06', label: 'Unidad 06 · Polinomios', href: 'polinomios.html' },
  'rational.': { unit: 'U07', label: 'Unidad 07 · Funciones Racionales', href: 'racionales-irracionales.html' },
  'irrational.': { unit: 'U07', label: 'Unidad 07 · Funciones Irracionales', href: 'racionales-irracionales.html' },
  'exponentials.': { unit: 'U08', label: 'Unidad 08 · Exponenciales', href: 'exponenciales.html' },
  'logarithms.': { unit: 'U09', label: 'Unidad 09 · Logarítmicas', href: 'logaritmicas.html' },
  'trig_ratios.': { unit: 'U10', label: 'Unidad 10 · Razones Trigonométricas', href: 'razones-trigonometricas.html' },
  'trig_functions.': { unit: 'U11', label: 'Unidad 11 · Funciones Trigonométricas', href: 'funciones-trigonometricas.html' },
});

function resolveStorage(customStorage) {
  if (customStorage) return customStorage;
  try {
    if (typeof localStorage !== 'undefined' && localStorage !== null) {
      return localStorage;
    }
  } catch {}
  return new MemoryStorage();
}

function normalizeEncounters(config) {
  if (Array.isArray(config.encounters) && config.encounters.length > 0) {
    return config.encounters.map((enc, idx) => ({
      id: enc.id || `enc-${idx + 1}`,
      title: enc.title || `Encuentro ${idx + 1}`,
      subtitle: enc.subtitle || '',
      unitsLabel: enc.unitsLabel || '',
      phases: ACTIVE_BOSS_PHASES.map((phaseName, pIdx) => {
        const found = Array.isArray(enc.phases)
          ? enc.phases.find((p) => p.phaseName === phaseName) || enc.phases[pIdx]
          : null;
        return {
          ...(found || {}),
          phaseName,
          id: found?.id || `${enc.id || `enc-${idx + 1}`}-${phaseName.toLowerCase()}`,
        };
      }),
    }));
  }

  // Single-encounter boss config
  return [
    {
      id: config.id || 'enc-1',
      title: config.title || 'Desafío Integrador',
      subtitle: config.subtitle || '',
      unitsLabel: config.unitsLabel || '',
      phases: ACTIVE_BOSS_PHASES.map((phaseName, pIdx) => {
        const found = Array.isArray(config.phases)
          ? config.phases.find((p) => p.phaseName === phaseName) || config.phases[pIdx]
          : null;
        return {
          ...(found || {}),
          phaseName,
          id: found?.id || `${config.id || 'enc-1'}-${phaseName.toLowerCase()}`,
        };
      }),
    },
  ];
}

function createInitialPhaseRecord(phase) {
  return {
    phaseId: phase.id,
    phaseName: phase.phaseName,
    competencyIds: Array.isArray(phase.competencyIds) ? [...phase.competencyIds] : [],
    attempts: 0,
    hintsUsed: 0,
    solutionRevealed: false,
    lockedAssisted: false,
    solved: false,
    outcome: 'pending', // 'pending' | 'independent' | 'assisted'
    diagnosticIds: [],
    lastInput: '',
    lastFeedback: '',
    startedAtMs: Date.now(),
  };
}

function serializeSessionState(session) {
  return {
    bossId: session.bossId,
    encounterIndex: session.encounterIndex,
    phaseIndex: session.phaseIndex,
    isDebrief: session.isDebrief,
    records: session.records,
    updatedAt: new Date().toISOString(),
  };
}

function saveSessionState(session) {
  try {
    session.storage.setItem(session.storageKey, JSON.stringify(serializeSessionState(session)));
  } catch {}
}

/**
 * Creates or restores a pure Boss session state machine (100% testable in Node without DOM).
 */
export function createBossSession(config, { storage, progressStore, restore = true } = {}) {
  if (!config || typeof config !== 'object') {
    throw new TypeError('createBossSession requires a config object');
  }

  const bossId = config.bossId || config.moduleId || 'jefe-integrador-1';
  const moduleId = config.moduleId || bossId;
  const encounters = normalizeEncounters(config);
  const resolvedStorage = resolveStorage(storage);
  const storageKey = `alaska:boss:${bossId}:v1`;

  const records = {};
  for (const enc of encounters) {
    for (const phase of enc.phases) {
      records[phase.id] = createInitialPhaseRecord(phase);
    }
  }

  const session = {
    bossId,
    moduleId,
    title: config.title || 'Evaluación Integradora',
    subtitle: config.subtitle || '',
    hasTimer: false, // Explicit invariant: zero punitive timer
    encounters,
    encounterIndex: 0,
    phaseIndex: 0,
    isDebrief: false,
    records,
    repairDirectory: config.repairDirectory || DEFAULT_UNIT_DIRECTORY,
    storage: resolvedStorage,
    storageKey,
    progressStore: progressStore || null,
  };

  if (restore) {
    try {
      const raw = resolvedStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (Number.isInteger(parsed.encounterIndex)) {
            session.encounterIndex = Math.max(0, Math.min(encounters.length - 1, parsed.encounterIndex));
          }
          if (Number.isInteger(parsed.phaseIndex)) {
            session.phaseIndex = Math.max(0, Math.min(ACTIVE_BOSS_PHASES.length - 1, parsed.phaseIndex));
          }
          session.isDebrief = Boolean(parsed.isDebrief);
          if (parsed.records && typeof parsed.records === 'object') {
            for (const key of Object.keys(records)) {
              if (parsed.records[key]) {
                records[key] = { ...records[key], ...parsed.records[key] };
              }
            }
          }
        }
      }
    } catch {}
  }

  return session;
}

export function getCurrentPhase(session) {
  if (!session) return null;
  if (session.isDebrief) {
    return {
      encounterIndex: session.encounterIndex,
      encounter: session.encounters[session.encounterIndex],
      phaseIndex: 5,
      phaseName: 'Debrief',
      isDebrief: true,
      phase: null,
      phaseState: null,
    };
  }
  const encounter = session.encounters[session.encounterIndex];
  const phase = encounter.phases[session.phaseIndex];
  const phaseState = session.records[phase.id];
  return {
    encounterIndex: session.encounterIndex,
    encounter,
    phaseIndex: session.phaseIndex,
    phaseName: phase.phaseName,
    isDebrief: false,
    phase,
    phaseState,
  };
}

export function selectBossEncounter(session, encounterIndex, phaseIndex = 0) {
  session.encounterIndex = Math.max(0, Math.min(session.encounters.length - 1, encounterIndex));
  session.phaseIndex = Math.max(0, Math.min(ACTIVE_BOSS_PHASES.length - 1, phaseIndex));
  session.isDebrief = false;
  const cur = getCurrentPhase(session);
  if (cur.phaseState) cur.phaseState.startedAtMs = Date.now();
  saveSessionState(session);
  return cur;
}

export function jumpToDebrief(session) {
  session.isDebrief = true;
  saveSessionState(session);
  return getCurrentPhase(session);
}

/**
 * Requests a progressive hint for the current active phase.
 * Permanently locks that phase to 'assisted' (cannot yield 'independent').
 */
export function requestPhaseHint(session) {
  const cur = getCurrentPhase(session);
  if (!cur || cur.isDebrief) return null;

  const { phase, phaseState } = cur;
  const hints = Array.isArray(phase.hints) ? phase.hints : [];
  phaseState.lockedAssisted = true;
  if (phaseState.solved && phaseState.outcome === 'independent') {
    phaseState.outcome = 'assisted';
  }

  const nextIdx = phaseState.hintsUsed;
  const hintText = nextIdx < hints.length ? hints[nextIdx] : (hints[hints.length - 1] || '');
  if (phaseState.hintsUsed < hints.length) {
    phaseState.hintsUsed += 1;
  }

  saveSessionState(session);
  return {
    hintText,
    hintsUsed: phaseState.hintsUsed,
    totalHints: hints.length,
    phaseState,
  };
}

/**
 * Reveals the explained solution for the current phase.
 * Permanently locks the phase to 'assisted' and records an assisted event without
 * counting as independent success.
 */
export function revealPhaseSolution(session) {
  const cur = getCurrentPhase(session);
  if (!cur || cur.isDebrief) return null;

  const { phase, phaseState } = cur;
  const wasSolved = phaseState.solved;
  phaseState.solutionRevealed = true;
  phaseState.lockedAssisted = true;
  phaseState.solved = true;
  phaseState.outcome = 'assisted';
  phaseState.lastFeedback = phase.solution || 'Solución explicada revelada.';

  let recordResult = null;
  if (!wasSolved) {
    const compIds = (phase.competencyIds || []).map((id) => resolveCompetencyId(id) || id);
    if (compIds.length > 0) {
      const event = createLearningEvent({
        type: EVENT_TYPES.ANSWER_SUBMITTED,
        moduleId: session.moduleId,
        exerciseId: phase.id,
        competencyIds: compIds,
        occurredAt: new Date().toISOString(),
        correct: true,
        hintsUsed: phaseState.hintsUsed,
        solutionRevealed: true,
        assistance: ASSISTANCE_LEVELS.SOLUTION_REVEALED,
        diagnosticId: null,
        representation: phase.representation || 'symbolic',
        stage: phase.stage || LEARNING_STAGES.TRANSFER,
        transferDistance: phase.transferDistance || TRANSFER_DISTANCES.FAR,
        durationMs: Math.max(0, Date.now() - (phaseState.startedAtMs || Date.now())),
      });
      recordResult = session.progressStore
        ? session.progressStore.recordLearningEvent(event)
        : recordLearningEvent(event);
    }
  }

  saveSessionState(session);
  return {
    solution: phase.solution || '',
    phaseState,
    event: recordResult?.event || null,
    transition: recordResult?.transition || null,
  };
}

/**
 * Evaluates a user submission against phase.validator(rawInput), records a normalized
 * LearningEvent against real unit competencies, and enforces independent vs assisted separation.
 */
export function submitPhaseAnswer(session, rawInput, { confidence } = {}) {
  const cur = getCurrentPhase(session);
  if (!cur || cur.isDebrief) {
    throw new Error('Cannot submit answer during Debrief phase');
  }

  const { phase, phaseState } = cur;
  const evalRes = typeof phase.validator === 'function'
    ? phase.validator(rawInput)
    : { ok: false, feedback: 'Sin validador configurado.' };

  if (evalRes?.empty) {
    return {
      empty: true,
      correct: false,
      outcome: phaseState.outcome,
      assistance: phaseState.solutionRevealed
        ? ASSISTANCE_LEVELS.SOLUTION_REVEALED
        : phaseState.hintsUsed > 0 || phaseState.lockedAssisted
          ? ASSISTANCE_LEVELS.HINTS
          : ASSISTANCE_LEVELS.NONE,
      feedback: evalRes.feedback || 'Ingresá una respuesta antes de comprobar.',
      event: null,
      transition: null,
      session,
    };
  }

  if (evalRes?.syntaxError) {
    return {
      empty: false,
      syntaxError: evalRes.syntaxError,
      correct: false,
      outcome: phaseState.outcome,
      assistance: phaseState.solutionRevealed
        ? ASSISTANCE_LEVELS.SOLUTION_REVEALED
        : phaseState.hintsUsed > 0 || phaseState.lockedAssisted
          ? ASSISTANCE_LEVELS.HINTS
          : ASSISTANCE_LEVELS.NONE,
      feedback: evalRes.syntaxError,
      event: null,
      transition: null,
      session,
    };
  }

  const isCorrect = Boolean(evalRes?.ok ?? evalRes?.correct);
  phaseState.attempts += 1;
  phaseState.lastInput = String(rawInput ?? '');

  let assistance = ASSISTANCE_LEVELS.NONE;
  if (phaseState.solutionRevealed) {
    assistance = ASSISTANCE_LEVELS.SOLUTION_REVEALED;
  } else if (phaseState.hintsUsed > 0 || phaseState.lockedAssisted) {
    assistance = ASSISTANCE_LEVELS.HINTS;
  }

  const diagnosticId = isCorrect ? null : (evalRes?.diagnosticId || null);

  if (isCorrect) {
    phaseState.solved = true;
    phaseState.outcome = assistance === ASSISTANCE_LEVELS.NONE ? 'independent' : 'assisted';
    phaseState.lastFeedback = evalRes?.feedback || phase.solution || '¡Correcto!';
  } else {
    if (diagnosticId && !phaseState.diagnosticIds.includes(diagnosticId)) {
      phaseState.diagnosticIds.push(diagnosticId);
    }
    phaseState.lastFeedback =
      evalRes?.feedback || 'Todavía no coincide. Revisá el planteo o pedí una pista.';
  }

  const compIds = (phase.competencyIds || []).map((id) => resolveCompetencyId(id) || id);
  let recordResult = null;
  if (compIds.length > 0) {
    const eventPayload = {
      type: EVENT_TYPES.ANSWER_SUBMITTED,
      moduleId: session.moduleId,
      exerciseId: phase.id,
      competencyIds: compIds,
      occurredAt: new Date().toISOString(),
      correct: isCorrect,
      hintsUsed: phaseState.hintsUsed,
      solutionRevealed: phaseState.solutionRevealed,
      assistance,
      diagnosticId,
      representation: phase.representation || 'symbolic',
      stage: phase.stage || LEARNING_STAGES.TRANSFER,
      transferDistance: phase.transferDistance || TRANSFER_DISTANCES.FAR,
      durationMs: Math.max(0, Date.now() - (phaseState.startedAtMs || Date.now())),
    };
    if (confidence) eventPayload.confidence = confidence;

    const event = createLearningEvent(eventPayload);
    recordResult = session.progressStore
      ? session.progressStore.recordLearningEvent(event)
      : recordLearningEvent(event);
  }

  saveSessionState(session);

  return {
    empty: false,
    correct: isCorrect,
    outcome: phaseState.outcome,
    assistance,
    diagnosticId,
    feedback: phaseState.lastFeedback,
    event: recordResult?.event || null,
    transition: recordResult?.transition || null,
    session,
  };
}

export function advanceBossPhase(session) {
  if (!session || session.isDebrief) return getCurrentPhase(session);

  if (session.phaseIndex < ACTIVE_BOSS_PHASES.length - 1) {
    session.phaseIndex += 1;
  } else if (session.encounterIndex < session.encounters.length - 1) {
    session.encounterIndex += 1;
    session.phaseIndex = 0;
  } else {
    session.isDebrief = true;
  }

  const cur = getCurrentPhase(session);
  if (cur?.phaseState) cur.phaseState.startedAtMs = Date.now();
  saveSessionState(session);
  return cur;
}

export function resetBossSession(session) {
  session.encounterIndex = 0;
  session.phaseIndex = 0;
  session.isDebrief = false;
  for (const enc of session.encounters) {
    for (const phase of enc.phases) {
      session.records[phase.id] = createInitialPhaseRecord(phase);
    }
  }
  try {
    session.storage.removeItem(session.storageKey);
  } catch {}
  return getCurrentPhase(session);
}

/**
 * Builds Phase 6 Debrief report without emitting fake mastery events.
 */
export function buildDebriefReport(session) {
  const independentItems = [];
  const assistedItems = [];
  const pendingItems = [];
  const errorMap = new Map();
  const repairMap = new Map();

  for (const enc of session.encounters) {
    for (const phase of enc.phases) {
      const rec = session.records[phase.id];
      const baseItem = {
        encounterId: enc.id,
        encounterTitle: enc.title,
        phaseId: phase.id,
        phaseName: phase.phaseName,
        prompt: phase.prompt,
        competencyIds: [...(phase.competencyIds || [])],
        hintsUsed: rec.hintsUsed,
        solutionRevealed: rec.solutionRevealed,
        diagnosticIds: [...rec.diagnosticIds],
      };

      if (rec.outcome === 'independent') {
        independentItems.push(baseItem);
      } else if (rec.outcome === 'assisted') {
        assistedItems.push(baseItem);
      } else {
        pendingItems.push(baseItem);
      }

      if (rec.diagnosticIds.length > 0 || rec.outcome === 'assisted') {
        for (const cid of phase.competencyIds || []) {
          if (!errorMap.has(cid)) {
            errorMap.set(cid, { competencyId: cid, diagnosticIds: [], errorCount: 0 });
          }
          const entry = errorMap.get(cid);
          rec.diagnosticIds.forEach((d) => {
            if (!entry.diagnosticIds.includes(d)) entry.diagnosticIds.push(d);
            entry.errorCount += 1;
          });

          const prefix = Object.keys(session.repairDirectory).find((p) => cid.startsWith(p));
          if (prefix) {
            const target = session.repairDirectory[prefix];
            if (!repairMap.has(target.href)) {
              repairMap.set(target.href, { ...target, competencyIds: [cid] });
            } else if (!repairMap.get(target.href).competencyIds.includes(cid)) {
              repairMap.get(target.href).competencyIds.push(cid);
            }
          }
        }
      }
    }
  }

  return {
    independentItems,
    assistedItems,
    pendingItems,
    errorsByCompetency: Array.from(errorMap.values()),
    repairLinks: Array.from(repairMap.values()),
    summary: {
      totalPhases: independentItems.length + assistedItems.length + pendingItems.length,
      independentCount: independentItems.length,
      assistedCount: assistedItems.length,
      pendingCount: pendingItems.length,
      errorCount: Array.from(errorMap.values()).reduce((acc, e) => acc + e.errorCount, 0),
    },
  };
}

/**
 * Mounts the full 6-phase Boss Arena DOM interface without any countdown timer.
 */
export function mountBossArena(host, config, { onEvent, vn, storage } = {}) {
  if (!host) return null;
  clear(host);

  const session = createBossSession(config, {
    storage,
    progressStore: getProgressStore(),
  });

  const encBar = h('div', { class: 'boss-encounter-bar pr-chip-row', role: 'tablist', 'aria-label': 'Encuentros integradores' });
  const phaseStepper = h('nav', { class: 'boss-phase-stepper', 'aria-label': 'Fases del evaluador' });
  const stageBody = h('div', { class: 'boss-stage-body' });

  host.append(encBar, phaseStepper, stageBody);

  const render = () => {
    const cur = getCurrentPhase(session);

    // Encounter selector pills + Debrief button
    clear(encBar);
    session.encounters.forEach((enc, idx) => {
      const allIndep = enc.phases.every((p) => session.records[p.id].outcome === 'independent');
      const allDone = enc.phases.every((p) => session.records[p.id].solved);
      const cls = `chip ${!cur.isDebrief && cur.encounterIndex === idx ? 'is-active' : 'chip--ghost'}`;
      encBar.append(
        h(
          'button',
          {
            type: 'button',
            class: cls,
            on: {
              click: () => {
                playClick();
                selectBossEncounter(session, idx, 0);
                render();
              },
            },
          },
          allIndep ? chalkIcon('spark', 14) : allDone ? chalkIcon('check', 14) : null,
          ` ${enc.title}`
        )
      );
    });

    encBar.append(
      h(
        'button',
        {
          type: 'button',
          class: `chip ${cur.isDebrief ? 'is-active' : 'chip--ghost'}`,
          on: {
            click: () => {
              playClick();
              jumpToDebrief(session);
              render();
            },
          },
        },
        chalkIcon('book', 14),
        ' 6. Debrief'
      )
    );

    // Phase stepper bar (all 6 phases)
    clear(phaseStepper);
    BOSS_PHASES.forEach((pName, idx) => {
      const isDeb = pName === 'Debrief';
      const active = isDeb ? cur.isDebrief : (!cur.isDebrief && cur.phaseIndex === idx);
      const rec = !isDeb ? session.records[cur.encounter.phases[idx].id] : null;
      const statusCls = rec
        ? rec.outcome === 'independent'
          ? ' is-indep'
          : rec.outcome === 'assisted'
            ? ' is-assisted'
            : ''
        : '';

      phaseStepper.append(
        h(
          'button',
          {
            type: 'button',
            class: `boss-phase-pill${active ? ' is-active' : ''}${statusCls}`,
            on: {
              click: () => {
                playClick();
                if (isDeb) jumpToDebrief(session);
                else selectBossEncounter(session, cur.encounterIndex, idx);
                render();
              },
            },
          },
          `${idx + 1}. ${pName}`
        )
      );
    });

    clear(stageBody);

    // Phase 6: Debrief View
    if (cur.isDebrief) {
      const report = buildDebriefReport(session);
      const debriefCard = h('section', { class: 'boss-debrief-card' }, [
        h('h2', {}, 'Fase 6 · Debrief Integrador y Mapa de Reparación'),
        h('p', { class: 'muted' }, 'Evaluación sin cronómetro punitivo: solo las fases resueltas sin pistas ni solución revelada cuentan como evidencia independiente.'),
        h('div', { class: 'boss-debrief-kpis' }, [
          h('div', { class: 'boss-kpi is-indep' }, [
            h('strong', {}, String(report.summary.independentCount)),
            h('span', {}, 'Fases independientes'),
          ]),
          h('div', { class: 'boss-kpi is-assisted' }, [
            h('strong', {}, String(report.summary.assistedCount)),
            h('span', {}, 'Fases asistidas'),
          ]),
          h('div', { class: 'boss-kpi is-pending' }, [
            h('strong', {}, String(report.summary.pendingCount)),
            h('span', {}, 'Pendientes'),
          ]),
        ]),
        h('div', { class: 'boss-debrief-lists' }, [
          h('div', { class: 'boss-debrief-col' }, [
            h('h3', {}, 'Resuelto sin ayuda (Evidencia independiente)'),
            report.independentItems.length
              ? h('ul', {}, report.independentItems.map((it) => h('li', {}, `${it.encounterTitle} · ${it.phaseName} (${it.competencyIds.join(', ')})`)))
              : h('p', { class: 'muted small' }, 'Todavía no hay fases resueltas de manera independiente.'),
          ]),
          h('div', { class: 'boss-debrief-col' }, [
            h('h3', {}, 'Resuelto con apoyo / pistas'),
            report.assistedItems.length
              ? h('ul', {}, report.assistedItems.map((it) => h('li', {}, `${it.encounterTitle} · ${it.phaseName} (pistas: ${it.hintsUsed})`)))
              : h('p', { class: 'muted small' }, 'Sin fases asistidas en este recorrido.'),
          ]),
        ]),
        h('div', { class: 'boss-repair-box' }, [
          h('h3', {}, 'Rutas sugeridas de reparación por unidad'),
          report.repairLinks.length
            ? h(
                'div',
                { class: 'pr-chip-row' },
                report.repairLinks.map((lnk) =>
                  h('a', { class: 'pr-btn pr-btn-secondary', href: lnk.href }, `${lnk.label} →`)
                )
              )
            : h('p', { class: 'muted small' }, 'No se detectaron brechas pendientes de reparación.'),
        ]),
        h('div', { class: 'pr-chip-row', style: 'margin-top: 16px;' }, [
          h(
            'button',
            {
              type: 'button',
              class: 'pr-btn',
              on: {
                click: () => {
                  playClick();
                  resetBossSession(session);
                  render();
                },
              },
            },
            chalkIcon('reset', 14),
            ' Reiniciar desafío integrador'
          ),
        ]),
      ]);
      stageBody.append(debriefCard);
      return;
    }

    // Active Phases 1..5
    const { encounter, phase, phaseState } = cur;
    const isLockedAssisted = phaseState.lockedAssisted || phaseState.hintsUsed > 0 || phaseState.solutionRevealed;

    const evidencePill = h(
      'span',
      { class: `boss-evidence-pill ${isLockedAssisted ? 'is-assisted' : 'is-indep'}` },
      phaseState.outcome === 'independent'
        ? 'Evidencia: Independiente confirmada'
        : isLockedAssisted
          ? 'Evidencia: Asistida (bloqueada por ayuda)'
          : 'Evidencia: Independiente disponible'
    );

    const card = h('article', { class: 'boss-phase-card', 'data-phase-id': phase.id });
    card.append(
      h('header', { class: 'boss-phase-header' }, [
        h('div', {}, [
          h('span', { class: 'boss-encounter-tag' }, `${encounter.title} · ${encounter.unitsLabel}`),
          h('h2', { class: 'boss-phase-title' }, `Fase ${cur.phaseIndex + 1} · ${phase.phaseName}`),
        ]),
        evidencePill,
      ]),
      h('p', { class: 'boss-phase-meta small muted' }, `Competencias evaluadas: ${(phase.competencyIds || []).join(' · ')}`),
      h('p', { class: 'boss-phase-prompt' }, phase.prompt)
    );

    const hintsContainer = h('div', { class: 'boss-hints-list' });
    const hintsArr = Array.isArray(phase.hints) ? phase.hints : [];
    for (let i = 0; i < phaseState.hintsUsed && i < hintsArr.length; i++) {
      hintsContainer.append(h('div', { class: 'boss-hint-item' }, hintsArr[i]));
    }

    const feedbackEl = h('div', {
      class: `pr-check-feedback${phaseState.solved ? ' is-ok' : ''}`,
      role: 'status',
      'aria-live': 'polite',
    }, phaseState.lastFeedback || '');

    const hintBtn = h(
      'button',
      {
        type: 'button',
        class: 'pr-btn pr-btn-secondary',
        disabled: phaseState.solved || phaseState.hintsUsed >= hintsArr.length,
        on: {
          click: () => {
            playClick();
            requestPhaseHint(session);
            render();
          },
        },
      },
      chalkIcon('bulb', 14),
      ` Pedir pista (${phaseState.hintsUsed}/${hintsArr.length})`
    );

    const solBtn = h(
      'button',
      {
        type: 'button',
        class: 'pr-btn pr-btn-secondary',
        disabled: phaseState.solved,
        on: {
          click: () => {
            playClick();
            const res = revealPhaseSolution(session);
            if (typeof onEvent === 'function' && res?.event) onEvent(res.event);
            render();
          },
        },
      },
      chalkIcon('spark', 14),
      ' Ver solución explicada'
    );

    const nextBtn = h(
      'button',
      {
        type: 'button',
        class: 'pr-btn',
        on: {
          click: () => {
            playClick();
            advanceBossPhase(session);
            render();
          },
        },
      },
      cur.phaseIndex === ACTIVE_BOSS_PHASES.length - 1 && cur.encounterIndex === session.encounters.length - 1
        ? 'Ir al Debrief Final →'
        : 'Siguiente fase →'
    );

    if (phase.kind === 'choice' && Array.isArray(phase.options)) {
      const optGrid = h('div', { class: 'pr-options' });
      phase.options.forEach((opt) => {
        const btn = h(
          'button',
          {
            type: 'button',
            class: `pr-option${phaseState.solved && opt.correct ? ' is-correct' : ''}`,
            disabled: phaseState.solved,
            on: {
              click: () => {
                const res = submitPhaseAnswer(session, opt.value ?? opt.label);
                if (res.correct) {
                  playSuccess();
                  if (vn && typeof vn.react === 'function') {
                    vn.react(res.outcome === 'independent' ? 'orgullosa' : 'feliz', res.feedback);
                  }
                } else {
                  playError();
                  if (vn && typeof vn.react === 'function') vn.react('sospecha', res.feedback);
                }
                if (typeof onEvent === 'function' && res.event) onEvent(res.event);
                render();
              },
            },
          },
          opt.label
        );
        optGrid.append(btn);
      });
      card.append(optGrid);
    } else {
      const inputEl = h('input', {
        type: 'text',
        class: 'pr-check-input',
        value: phaseState.lastInput || '',
        placeholder: phase.placeholder || 'Escribí tu respuesta exacta...',
        disabled: phaseState.solved,
        'aria-label': phase.prompt,
      });
      const submitBtn = h(
        'button',
        {
          type: 'button',
          class: 'pr-btn',
          disabled: phaseState.solved,
          on: {
            click: () => {
              const res = submitPhaseAnswer(session, inputEl.value);
              if (res.empty || res.syntaxError) {
                playError();
                feedbackEl.className = 'pr-check-feedback is-warn';
                feedbackEl.textContent = res.feedback;
                return;
              }
              if (res.correct) {
                playSuccess();
                if (vn && typeof vn.react === 'function') {
                  vn.react(res.outcome === 'independent' ? 'orgullosa' : 'feliz', res.feedback);
                }
              } else {
                playError();
                if (vn && typeof vn.react === 'function') vn.react('sospecha', res.feedback);
              }
              if (typeof onEvent === 'function' && res.event) onEvent(res.event);
              render();
            },
          },
        },
        chalkIcon('check', 14),
        ' Comprobar'
      );
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitBtn.click();
        }
      });
      card.append(h('div', { class: 'pr-chip-row', style: 'margin-bottom: 10px;' }, [inputEl, submitBtn]));
    }

    card.append(
      h('div', { class: 'pr-chip-row', style: 'margin-top: 8px;' }, [hintBtn, solBtn, nextBtn]),
      hintsContainer,
      feedbackEl
    );

    stageBody.append(card);
  };

  render();
  return { session, render };
}
