/**
 * components.js — Componentes transversales para Laboratorio 7: Exponenciales.
 * Unidad 08 de Alaska Math Lab.
 * Reutiliza la arquitectura de potencias-raices y valor-absoluto:
 * 1. Progreso en localStorage y barra visual (independiente vs asistido).
 * 2. Fórmula matemática interactiva anotada (annotatedExpFormula).
 * 3. Bloques de chequeos conceptuales con 3 pistas progresivas y soluciones.
 * 4. Disparadores de tutoría de Alaska (bindTutorButtons).
 */

import { h, mount, chalkIcon } from "../../core/dom.js";
import { fmt, frac, MINUS } from "../../core/math-format.js";
import { diagnoseExp } from "./logic.js";
import { playScript, react } from "../../core/vn.js";
import {
  VN_SCRIPTS,
  DIAGNOSE_REACTIONS,
  STREAK_REACTIONS,
} from "./vn-scripts.js";
import {
  EXP_COMPETENCIES,
  EXP_DIAGNOSTIC_TAXONOMY,
} from "./competencies-map.js";
import { evaluateCompetencyMastery } from "../../core/learning/mastery.js";
import { STATUS_BADGES } from "../../core/learning/progress-store.js";
import { recordExpAttempt, getExpCompetencyReport } from "./learning-adapter.js";

export { STREAK_REACTIONS, DIAGNOSE_REACTIONS, VN_SCRIPTS };

export const PROGRESS_KEY = "exponenciales:progreso:v1";

const dashboardRenderers = new Set();
function notifyCompetencyDashboardUpdate() {
  dashboardRenderers.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

export function getProgress() {
  try {
    if (typeof localStorage === "undefined" || !localStorage.getItem) return {};
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
}

export function saveProgress(key, value = "independent") {
  const state = getProgress();
  state[key] = value;
  try {
    if (typeof localStorage !== "undefined" && localStorage.setItem) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
    }
  } catch {
    // La sesión continúa aunque se exceda la cuota de almacenamiento
  }
  updateProgressUI();
  notifyCompetencyDashboardUpdate();
  return state;
}

export function recordCompetencyAttempt({
  competencyId,
  correct,
  mode = "independent",
  diagnosticId = null,
  exerciseId = null,
  hintsUsed = 0,
  solutionRevealed = false,
  stage = 'guided_practice',
  representation = 'symbolic',
  transferDistance = 'near',
}) {
  if (!competencyId) return null;
  const state = getProgress();
  if (!state.competencies || typeof state.competencies !== "object") {
    state.competencies = {};
  }
  const rawEntry = state.competencies[competencyId];
  const entry = rawEntry
    ? { ...rawEntry }
    : {
        competencyId,
        independentCount: 0,
        assistedCount: 0,
        errorCount: 0,
        consecutiveErrors: 0,
        diagnostics: [],
        status: "unseen",
        attempts: 0,
        distinctExercises: [],
        representationsCovered: [],
        stagesCovered: [],
      };
  if (!Array.isArray(entry.diagnostics)) {
    entry.diagnostics = [];
  }
  if (!Array.isArray(entry.distinctExercises)) {
    entry.distinctExercises = [];
  }

  const isCorrect = Boolean(correct);
  const solRevealed = Boolean(solutionRevealed);
  const hintsCount =
    typeof hintsUsed === "number" && Number.isInteger(hintsUsed) && hintsUsed >= 0
      ? hintsUsed
      : mode === "assisted" && !solRevealed
        ? 1
        : 0;

  let assistance = "none";
  if (solRevealed) {
    assistance = "solution_revealed";
  } else if (hintsCount > 0 || mode === "assisted") {
    assistance = "hints";
  }

  // Record normalized attempt in core progress store
  try {
    recordExpAttempt({
      exerciseId: exerciseId || "exp-check",
      competencyId,
      correct: isCorrect,
      mode,
      hintsUsed: hintsCount,
      solutionRevealed: solRevealed,
      diagnosticId: !isCorrect ? diagnosticId : null,
      representation,
      stage,
      transferDistance,
    });
  } catch {
    // Non-blocking in case of isolated unit testing
  }

  // Evaluate conservative 7-state machine: 1 independent success MUST transition to "developing", NEVER to "mastered"
  // Do NOT pre-mutate entry counters or diagnostics before calling evaluateCompetencyMastery
  const transition = evaluateCompetencyMastery(entry, {
    type: "answer_submitted",
    moduleId: "exponenciales",
    exerciseId: exerciseId || "exp-check",
    competencyIds: [competencyId],
    occurredAt: new Date().toISOString(),
    correct: isCorrect,
    hintsUsed: hintsCount,
    solutionRevealed: solRevealed,
    assistance,
    diagnosticId: !isCorrect ? diagnosticId : null,
    representation,
    stage,
    transferDistance,
  });

  const updated = transition?.updatedEntry || {};
  const updatedEntry = {
    ...entry,
    competencyId,
    status: transition.newStatus || updated.status || entry.status,
    attempts: updated.attempts ?? (entry.attempts || 0),
    independentCount: updated.independentCount ?? (entry.independentCount || 0),
    assistedCount: updated.assistedCount ?? (entry.assistedCount || 0),
    errorCount: updated.errorCount ?? (entry.errorCount || 0),
    consecutiveErrors: updated.consecutiveErrors ?? (entry.consecutiveErrors || 0),
    diagnostics: Array.isArray(updated.diagnostics)
      ? [...updated.diagnostics]
      : [...entry.diagnostics],
    recentDiagnosticIds: Array.isArray(updated.recentDiagnosticIds)
      ? [...updated.recentDiagnosticIds]
      : (Array.isArray(updated.diagnostics) ? [...updated.diagnostics] : []),
    distinctExercises: Array.isArray(updated.distinctExercises)
      ? [...updated.distinctExercises]
      : [...entry.distinctExercises],
    representationsCovered: Array.isArray(updated.representationsCovered)
      ? [...updated.representationsCovered]
      : [...(entry.representationsCovered || [])],
    stagesCovered: Array.isArray(updated.stagesCovered)
      ? [...updated.stagesCovered]
      : [...(entry.stagesCovered || [])],
    delayedRecallSuccessCount: updated.delayedRecallSuccessCount ?? (entry.delayedRecallSuccessCount || 0),
    transferSuccessCount: updated.transferSuccessCount ?? (entry.transferSuccessCount || 0),
    lastAttemptAt: updated.lastAttemptAt || new Date().toISOString(),
    nextReviewAt: updated.nextReviewAt ?? entry.nextReviewAt ?? null,
  };

  state.competencies[competencyId] = updatedEntry;

  try {
    if (typeof localStorage !== "undefined" && localStorage.setItem) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
    }
  } catch {}

  updateProgressUI();
  notifyCompetencyDashboardUpdate();
  return updatedEntry;
}

export function getCompetencyReport() {
  let storeReport = null;
  try {
    storeReport = getExpCompetencyReport();
  } catch {}
  const storeComps = Array.isArray(storeReport?.competencies) ? storeReport.competencies : [];

  const state = getProgress();
  const rawComps = (state && typeof state.competencies === "object" && state.competencies) || {};

  const report = {
    summary: {
      total: EXP_COMPETENCIES.length,
      durable: storeReport?.summary?.durable || 0,
      consolidating: storeReport?.summary?.consolidating || 0,
      developing: storeReport?.summary?.developing || 0,
      review_due: storeReport?.summary?.review_due || 0,
      needs_repair: storeReport?.summary?.needs_repair || 0,
      introduced: storeReport?.summary?.introduced || 0,
      unseen: storeReport?.summary?.unseen ?? EXP_COMPETENCIES.length,
      // Backwards-compatibility getters:
      get mastered() {
        return this.consolidating + this.durable;
      },
      get assisted() {
        return this.developing;
      },
      get pending() {
        return this.unseen + this.introduced + this.needs_repair + this.review_due;
      },
    },
    competencies: {},
    list: [],
  };

  EXP_COMPETENCIES.forEach((comp) => {
    const storeEntry = storeComps.find((c) => c.id === comp.id);
    const raw = rawComps[comp.id] || {};

    const source = (storeEntry && storeEntry.attempts > 0)
      ? storeEntry
      : (raw.attempts > 0 ? raw : (storeEntry || raw));

    let status = source.status || "unseen";
    if (status === "mastered") status = "consolidating";
    else if (status === "assisted") status = "developing";
    else if (status === "pending") status = "unseen";

    const item = {
      id: comp.id,
      competency: comp,
      title: comp.title,
      sectionId: comp.sectionId,
      order: comp.order,
      independentCount: source.independentCount || 0,
      assistedCount: source.assistedCount || 0,
      errorCount: source.errorCount || 0,
      attempts: source.attempts || ((source.independentCount || 0) + (source.assistedCount || 0) + (source.errorCount || 0)),
      diagnostics: Array.isArray(source.diagnostics)
        ? [...source.diagnostics]
        : (Array.isArray(source.recentDiagnosticIds) ? [...source.recentDiagnosticIds] : []),
      status,
      badge: source.badge || STATUS_BADGES[status] || STATUS_BADGES.unseen,
    };

    report.competencies[comp.id] = item;
    report[comp.id] = item;
    report.list.push(item);
  });

  if (!storeReport || !storeReport.summary) {
    report.summary.durable = 0;
    report.summary.consolidating = 0;
    report.summary.developing = 0;
    report.summary.review_due = 0;
    report.summary.needs_repair = 0;
    report.summary.introduced = 0;
    report.summary.unseen = 0;
    report.list.forEach((item) => {
      if (report.summary[item.status] !== undefined) {
        report.summary[item.status]++;
      } else {
        report.summary.unseen++;
      }
    });
  }

  return report;
}

export function mountCompetencyDashboard(host, { onSelectSection, onPracticeCompetency } = {}) {
  if (!host) return null;

  const render = () => {
    const report = getCompetencyReport();
    host.innerHTML = "";

    // 1. Resumen de dominio (KPIs)
    const summaryCard = h(
      "div",
      { class: "exp-dashboard-summary" },
      h(
        "div",
        { class: "exp-dashboard-kpi exp-dashboard-kpi--mastered" },
        h("span", { class: "exp-dashboard-kpi__num" }, fmt(report.summary.consolidating + report.summary.durable)),
        h("span", { class: "exp-dashboard-kpi__label" }, "Consolidada / Durable"),
      ),
      h(
        "div",
        { class: "exp-dashboard-kpi exp-dashboard-kpi--assisted" },
        h("span", { class: "exp-dashboard-kpi__num" }, fmt(report.summary.developing)),
        h("span", { class: "exp-dashboard-kpi__label" }, "En desarrollo"),
      ),
      h(
        "div",
        { class: "exp-dashboard-kpi exp-dashboard-kpi--pending" },
        h("span", { class: "exp-dashboard-kpi__num" }, fmt(report.summary.unseen + report.summary.introduced + report.summary.needs_repair + report.summary.review_due)),
        h("span", { class: "exp-dashboard-kpi__label" }, "Pendiente / Refuerzo"),
      ),
    );

    // 2. Grilla de las 10 competencias
    const cards = report.list.map((item) => {
      const comp = item.competency;
      const badgeInfo = STATUS_BADGES[item.status] || STATUS_BADGES.unseen;

      const toneToClass = {
        success: "badge--success",
        warning: "badge--warning",
        info: "badge--info",
        attention: "badge--attention",
        danger: "badge--danger",
        muted: "badge--neutral",
      };
      const badgeToneClass = toneToClass[badgeInfo.tone] || "badge--neutral";

      const statusBadge = h(
        "span",
        {
          class: `exp-dashboard-badge badge ${badgeToneClass} is-${badgeInfo.classModifier || item.status}`,
          "data-status": item.status,
        },
        badgeInfo.label,
      );

      const header = h(
        "header",
        { class: "exp-dashboard-card__header" },
        h("h4", { class: "exp-dashboard-card__title" }, `${comp.order}. ${comp.title}`),
        statusBadge,
      );

      // Si registró algún error diagnóstico recurrente
      const diagnosticEls = [];
      if (item.diagnostics && item.diagnostics.length > 0) {
        item.diagnostics.forEach((diagId) => {
          const tax = EXP_DIAGNOSTIC_TAXONOMY[diagId];
          const label = tax ? tax.shortLabel : diagId;
          diagnosticEls.push(
            h(
              "div",
              { class: "exp-dashboard-error-alert" },
              chalkIcon("hint"),
              h("span", null, ` Error detectado: ${label}`),
            ),
          );
        });
      }

      // Dos botones de acción: Ir al Pizarrón N y Practicar en Entrenador
      const sectionNum = comp.sectionId.replace("sec-", "");
      const btnGo = h(
        "button",
        {
          type: "button",
          class: "btn btn--subtle btn--sm exp-dashboard-btn-nav",
          on: {
            click: () => {
              if (typeof onSelectSection === "function") {
                onSelectSection(comp.sectionId);
              } else {
                const link = document.querySelector(`.seq-sidebar__link[data-sec="${comp.sectionId}"]`);
                if (link) link.click();
                else location.hash = `#${comp.sectionId}`;
              }
            },
          },
        },
        `Ir al Pizarrón ${sectionNum}`,
      );

      const btnPractice = h(
        "button",
        {
          type: "button",
          class: "btn btn--sm exp-dashboard-btn-practice",
          on: {
            click: () => {
              if (typeof onPracticeCompetency === "function") {
                onPracticeCompetency(comp.id);
              } else {
                location.hash = "#sec-retos";
              }
            },
          },
        },
        chalkIcon("target"),
        " Practicar en Entrenador",
      );

      const actions = h(
        "div",
        { class: "exp-dashboard-card__actions" },
        btnGo,
        btnPractice,
      );

      return h(
        "article",
        { class: `exp-dashboard-card exp-dashboard-card--${badgeInfo.classModifier || item.status}` },
        header,
        diagnosticEls.length > 0 ? h("div", { class: "exp-dashboard-errors" }, ...diagnosticEls) : null,
        actions,
      );
    });

    const grid = h("div", { class: "exp-dashboard-grid" }, ...cards);

    const titleHeader = h(
      "header",
      { class: "exp-dashboard-header" },
      h("h3", null, "Mapa de Competencias y Atlas de Errores"),
      h("p", { class: "muted small" }, "Seguimiento en tiempo real de tu dominio conceptual e independencia analítica en las 10 competencias de la unidad."),
    );

    mount(host, titleHeader, summaryCard, grid);
  };

  dashboardRenderers.add(render);
  render();

  return {
    update: render,
    destroy: () => dashboardRenderers.delete(render),
  };
}

export function markSectionCompleted(sectionId) {
  try {
    const state = getProgress();
    state[sectionId] = true;
    if (typeof localStorage !== "undefined" && localStorage.setItem) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
    }
    updateProgressUI();
    notifyCompetencyDashboardUpdate();
  } catch {}
}

function updateProgressUI() {
  if (typeof document === "undefined" || typeof document.getElementById !== "function") return;
  const state = getProgress();
  const complete = Object.keys(state).filter(
    (key) => /^sec-\d+$/.test(key) && state[key],
  ).length;
  const label = document.getElementById("seq-progress-text");
  const fill = document.getElementById("seq-progress-fill");
  if (label) label.textContent = `Progreso: ${fmt(complete)}/10`;
  if (fill) fill.style.width = `${Math.min(100, complete * 10)}%`;

  const totalAnswers = Object.keys(state).filter(
    (key) => /^sec-\d+:\d+$/.test(key) && state[key],
  ).length;
  document.querySelectorAll("[data-progress]").forEach((node) => {
    node.textContent = `${totalAnswers}/30`;
  });
}

function inlineMathNodes(text) {
  if (typeof text !== "string") return [String(text ?? "")];
  const parts = text.split(/`([^`]+)`/g);
  return parts.map((part, index) =>
    index % 2 === 1
      ? h("span", { class: "eq" }, part)
      : document.createTextNode(part),
  );
}

function makeToken(symbol, label, detail, noteBox, colour = "yellow") {
  const isNode = typeof symbol === "object" && symbol !== null;
  const button = h(
    "button",
    {
      type: "button",
      class: `seq-annotated__token seq-annotated__token--${colour}`,
      "aria-label": `${label}: ${typeof symbol === "string" ? symbol : "término"}`,
      on: {
        click: () => {
          mount(
            noteBox,
            h("strong", null, `${label}: `),
            ...inlineMathNodes(detail),
          );
          noteBox.classList.remove("is-visible");
          void noteBox.offsetWidth;
          noteBox.classList.add("is-visible");
        },
      },
    },
    isNode ? symbol : h("span", { class: "eq" }, symbol),
    h("span", { class: "seq-annotated__label" }, label),
  );
  return button;
}

function formatBaseDisplay(a) {
  if (a === Math.E) return "e";
  if (typeof a === "number") {
    if (Math.abs(a - 0.5) < 1e-9) return h("span", { class: "eq" }, "(", frac("1", "2"), ")");
    if (Math.abs(a - 0.25) < 1e-9) return h("span", { class: "eq" }, "(", frac("1", "4"), ")");
    if (Math.abs(a - 0.125) < 1e-9) return h("span", { class: "eq" }, "(", frac("1", "8"), ")");
    return fmt(a);
  }
  return String(a);
}

/**
 * Renderiza una ecuación matemática interactiva con tokens explicativos.
 * Soporta f(x) = k · a^(b·x - h) + c y fórmulas canónicas de cada sección.
 */
export function annotatedExpFormula(root, config = {}) {
  let state = {
    sectionId: config.sectionId || root.closest("section")?.id || null,
    fnName: config.fnName || "f",
    varName: config.varName || "x",
    k: config.k ?? 1,
    a: config.a ?? 2,
    b: config.b ?? 1,
    h: config.h ?? 0,
    c: config.c ?? 0,
    tokens: config.tokens || {},
  };

  const note = h("div", {
    class: "seq-annotated__note-box",
    "aria-live": "polite",
  });
  const formulaHost = h("div", { class: "seq-annotated__formula exp-annotated__formula" });

  const token = (symbol, label, detail, colour) =>
    makeToken(symbol, label, detail, note, colour);

  function render() {
    const sId = state.sectionId;

    if (sId === "sec-1") {
      const kToken = token("k", "partida f(0)", "Punto de partida temporal: en x = 0 la potencia vale a⁰ = 1, por lo que f(0) = k · 1 = k es el valor inicial de la tabla.", "pink");
      const aToken = token("aˣ", "razón constante", "Motor multiplicativo: al avanzar Δx = 1 regular, la función se multiplica por el factor a. Si dividís términos consecutivos y da constante, es exponencial.", "yellow");
      const linToken = token("m · x + b", "salto aditivo", "Modelo lineal comparativo: una recta avanza sumando una diferencia fija m en cada paso regular (y₂ − y₁ = cte).", "blue");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "f(x) = ", kToken, " · ", aToken, "   frente a   y = ", linToken));
      return;
    }

    if (sId === "sec-2") {
      const kTok = token("3", "anclaje k", "Factor inicial f(0) = 3: al comenzar (x = 0), hay 3 colonias independientes de amebas. Como 2⁰ = 1, f(0) = 3 · 1 = 3.", "pink");
      const aTok = token("2ˣ", "duplicación", "La base 2 se eleva al tiempo x. Cada hora transcurrida duplica en paralelo cada una de las 3 colonias.", "yellow");
      const difTok = token("≠ 6ˣ", "jerarquía de potencias", "La potenciación precede estrictamente a la multiplicación: 3 · 2² = 3 · 4 = 12, mientras que 6² = 36. ¡Jamás multipliques k por la base!", "blue");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "f(x) = ", kTok, " · ", aTok, " ", difTok));
      return;
    }

    if (sId === "sec-3") {
      const kRestr = token("k ≠ 0", "escala no nula", "Si k = 0 la función colapsa en la recta nula f(x) = 0 y pierde toda dinámica de crecimiento o decaimiento.", "pink");
      const aPos = token("a > 0", "base positiva", "En los reales la base debe ser positiva. Si a < 0, potencias con exponente fraccionario como (−2)^(1/2) = √−2 no existen en ℝ y la curva se despedaza.", "yellow");
      const aNotOne = token("a ≠ 1", "base no trivial", "Si a = 1, 1ˣ = 1 para todo x real y la función degenera en la recta horizontal constante f(x) = k.", "blue");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "f(x) = ", kRestr, " · aˣ   con   ", aPos, "   ∧   ", aNotOne));
      return;
    }

    if (sId === "sec-4") {
      const fracTok = token(h("span", null, "(", frac("1", "2"), ")ˣ"), "base 1/2", "Decaimiento exponencial: como 0 < a < 1, cada paso divide por 2 o multiplica por 1/2, aproximándose a cero.", "yellow");
      const symmTok = token("2⁻ˣ", "simetría reflexiva", "Propiedad de potencias: (1/a)ˣ = a⁻ˣ. La gráfica de (1/2)ˣ es el reflejo especular exacto de 2ˣ respecto al eje Y.", "blue");
      const asymTok = token("y = 0", "asíntota horizontal", "Eje magnético inalcanzable: (1/2)ˣ > 0 para todo x ∈ ℝ. La curva se acerca infinitamente al eje X sin tocarlo jamás.", "green");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, fracTok, " = ", symmTok, "   (asíntota   ", asymTok, ")"));
      return;
    }

    if (sId === "sec-5") {
      const negK = token(`${MINUS}3`, "k < 0", "Coeficiente negativo: refleja toda la curva bajo el eje X hacia el sótano. La imagen pasa a ser (−∞; 0).", "pink");
      const fracA = token(h("span", null, "(", frac("1", "2"), ")ˣ"), "a = 1/2 < 1", "Potencia que decrece hacia cero con valores positivos (+4, +2, +1, +0.5...).", "yellow");
      const crecTok = token("Creciente en ℝ", "efecto multiplicativo", "Al multiplicar por −3, los valores pasan a ser −12, −6, −3, −1.5... ¡Se hacen menos negativos y suben hacia cero! La función es estrictamente creciente.", "green");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "g(x) = ", negK, " · ", fracA, " ⟹ ", crecTok));
      return;
    }

    if (sId === "sec-6") {
      const ratioTok = token(frac("y₂", "y₁"), "cociente vertical", "Al dividir f(x₂) entre f(x₁), el factor k se cancela por completo, dejando únicamente la razón pura de las potencias.", "blue");
      const dxTok = token("Δx = x₂ − x₁", "paso horizontal", "La diferencia de abscisas indica cuántos ciclos multiplicativos separan a los dos puntos observados.", "yellow");
      const baseTok = token("a = (y₂/y₁)^(1/Δx)", "base exacta", "Extracción de raíz para despejar la base multiplicativa exacta, preservando fracciones sin truncar a decimales.", "pink");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, ratioTok, " = a^(", dxTok, ") ⟹ ", baseTok));
      return;
    }

    if (sId === "sec-7") {
      const initTok = token("M₀", "masa inicial", "Cantidad medida en el instante t = 0 (gramos de isótopo o población inicial de partida).", "pink");
      const factorTok = token(h("span", null, "(", frac("1", "2"), ")"), "factor por ciclo", "Factor de decaimiento (1/2 en vida media) o 1 ± r en crecimiento porcentual (ej. 1 + 0.12 = 1.12 al +12%).", "yellow");
      const cycleTok = token(h("sup", null, frac("t", "T")), "ciclos t/T", "Exponente normalizado: el tiempo t se divide por el período característico T para contar cuántas transformaciones completas ocurrieron.", "blue");
      const eTok = token("e^(kt)", "modelo continuo", "Procesos continuos acumulados instantáneamente con la constante de Napier e.", "green");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "M(t) = ", initTok, " · ", factorTok, cycleTok, "   frente a   ", eTok));
      return;
    }

    if (sId === "sec-8") {
      const shiftTok = token("x − h", "traslación horizontal", "Desplaza la curva rígidamente h unidades en el eje X: el punto de anclaje f(0) pasa a f(h) = k + c.", "blue");
      const asymTok = token("+ c", "asíntota y = c", "Desplaza verticalmente la recta asíntota a y = c. Es un límite inalcanzable al que la función tiende asintóticamente.", "green");
      const imTok = token("Im = (c; +∞)", "imagen abierta", "Como a^(x−h) > 0 estrictamente, la función nunca toma el valor c. La imagen lleva SIEMPRE paréntesis abierto, jamás corchete.", "pink");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "f(x) = k · a^(", shiftTok, ") ", asymTok, "   con   ", imTok));
      return;
    }

    if (sId === "sec-9") {
      const asymTok = token("2", "asíntota y = 2", "Techo magnético superior: la recta horizontal y = 2 actúa como asíntota. Con k = −1 < 0, la imagen es el intervalo abierto (−∞; 2).", "green");
      const termTok = token("−(1/2)ˣ", "término k·aˣ", "Con k = −1 y base a = 1/2, la curva queda por debajo de la asíntota y es estrictamente creciente en todo su dominio ℝ.", "pink");
      const rootTok = token("x₀ = −1", "corte en x", "Raíz por despeje exacto: 2 − (1/2)ˣ = 0 ⟹ (1/2)ˣ = 2 ⟹ 2⁻ˣ = 2¹ ⟹ x = −1. El punto de corte es (−1; 0).", "yellow");
      const signTok = token("C⁺ = (−1; +∞), C⁻ = (−∞; −1)", "conjuntos de signos", "Signos verificados: al ser creciente con raíz en −1, f(x) > 0 para x > −1 (positividad C⁺ = (−1; +∞)) y f(x) < 0 para x < −1 (negatividad C⁻ = (−∞; −1)).", "blue");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "f(x) = ", asymTok, " ", termTok, "   |   ", rootTok, "   |   ", signTok));
      return;
    }

    if (sId === "sec-10") {
      const eqTok = token("3²ˣ − 4·3ˣ⁺¹ : 9 + 1/3 = 0", "ecuación examen", "Ecuación exponencial de examen con potencias de base 3 y operaciones compuestas.", "blue");
      const baseTok = token("3ˣ⁺¹ : 3² = 3ˣ⁻¹", "igualar bases", "Propiedad de potencias: al dividir potencias de igual base se restan exponentes, cuidando paréntesis: (x+1) − 2 = x − 1.", "yellow");
      const subTok = token("u = 3ˣ > 0", "cambio cuadrático", "Sustitución que convierte la ecuación exponencial en una cuadrática. Como 3ˣ > 0 en ℝ, se exige estrictamente u > 0.", "pink");
      const discardTok = token("descarte u ≤ 0", "filtro de existencia", "Cualquier raíz cuadrática con u ≤ 0 se descarta de inmediato porque 3ˣ jamás da un valor negativo ni cero en ℝ.", "green");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, eqTok, " ⟹ ", baseTok, " ⟹ ", subTok, " (", discardTok, ")"));
      return;
    }

    // 2. Renderizado dinámico general f(x) = k · a^(b·x - h) + c
    const { fnName, varName, k, a, b, h: hVal, c: cVal } = state;
    const nodes = [];

    nodes.push(h("span", { class: "eq" }, `${fnName}(${varName}) = `));

    // Token k
    const kStr = fmt(k);
    const kExpl = state.tokens.k ||
      `Factor de escala vertical k = ${kStr}: dilata la curva verticalmente. ${k < 0 ? "Como k < 0, refleja la gráfica e invierte la monotonía." : "Conserva el sentido de crecimiento."} En el origen ${varName}=0 (con h=0, c=0), ${fnName}(0) = ${kStr}.`;
    nodes.push(token(kStr, "escala k", kExpl, "pink"));
    nodes.push(" · ");

    // Token base a
    const aExpl = state.tokens.a ||
      `Base multiplicativa a = ${fmt(a)}: exige en ℝ que a > 0 y a ≠ 1. ${a > 1 ? "Como a > 1, la potencia pura es estrictamente creciente hacia +∞." : "Como 0 < a < 1, la potencia pura es estrictamente decreciente hacia 0."}`;
    nodes.push(token(formatBaseDisplay(a), "base a", aExpl, "yellow"));

    // Exponente b·x - h
    const expParts = [];
    if (b !== 1) expParts.push(`${fmt(b)} · `);
    expParts.push(varName);
    if (hVal > 0) expParts.push(` − ${fmt(hVal)}`);
    else if (hVal < 0) expParts.push(` + ${fmt(-hVal)}`);

    const expExpl = state.tokens.h ||
      `Exponente con traslación: desplaza la curva h = ${fmt(hVal)} unidades ${hVal >= 0 ? "hacia la derecha" : "hacia la izquierda"}. El ancla de cálculo rápido ocurre cuando el exponente se anula.`;
    nodes.push(
      h(
        "sup",
        null,
        token(h("span", { class: "eq" }, ...expParts), "exponente", expExpl, "blue"),
      ),
    );

    // Desplazamiento c
    if (cVal !== 0 || state.tokens.c) {
      const cSign = cVal >= 0 ? " + " : " − ";
      const cStr = fmt(Math.abs(cVal));
      const cExpl = state.tokens.c ||
        `Término independiente c = ${fmt(cVal)}: traslada la asíntota horizontal a la recta y = ${fmt(cVal)}. La imagen de la función es (${fmt(cVal)}; +∞) si k > 0 o (−∞; ${fmt(cVal)}) si k < 0 (siempre con paréntesis abierto).`;
      nodes.push(cSign);
      nodes.push(token(cStr, "asíntota y = c", cExpl, "green"));
    }

    mount(formulaHost, h("span", { class: "seq-annotated__equation" }, ...nodes));
  }

  mount(root, formulaHost, note);
  render();

  return {
    update(newState) {
      state = { ...state, ...newState };
      render();
    },
    element: root,
  };
}

function mountQuestionPrompt(question) {
  return h(
    "div",
    { class: "exp-check__prompt seq-check__prompt" },
    ...inlineMathNodes(question.prompt),
  );
}

function buildAnswerControl(question, questionIndex) {
  if (question.type === "choice") {
    const selected = { value: null };
    const buttons = question.options.map((optionText, index) => {
      const button = h(
        "button",
        {
          type: "button",
          class: "chip chip--ghost exp-choice-btn",
          "aria-pressed": "false",
        },
        ...inlineMathNodes(optionText),
      );
      button.addEventListener("click", () => {
        selected.value = index;
        buttons.forEach((item, itemIndex) => {
          item.classList.toggle("is-active", itemIndex === index);
          item.classList.toggle("chip--ghost", itemIndex !== index);
          item.setAttribute("aria-pressed", String(itemIndex === index));
        });
      });
      return button;
    });
    return {
      node: h(
        "div",
        {
          class: "seq-controls exp-choice",
          role: "group",
          "aria-label": `Opciones del ejercicio ${questionIndex + 1}`,
        },
        buttons,
      ),
      value: () => selected.value,
      hasSelection: () => selected.value !== null && Number.isInteger(selected.value),
      preview: () =>
        selected.value === null ? "Elegí una opción" : question.options[selected.value],
      disable: () => {
        buttons.forEach((b) => { b.disabled = true; });
      },
    };
  }
  if (question.type === "pair") {
    const first = h("input", {
      type: "text",
      inputmode: "decimal",
      "aria-label": question.firstLabel,
    });
    const second = h("input", {
      type: "text",
      inputmode: "decimal",
      "aria-label": question.secondLabel,
    });
    return {
      node: h(
        "div",
        { class: "exp-pair-inputs" },
        h("label", null, question.firstLabel, first),
        h("label", null, question.secondLabel, second),
      ),
      value: () => [first.value, second.value],
      preview: () =>
        `${question.firstLabel}: ${first.value || "—"}; ${question.secondLabel}: ${second.value || "—"}`,
      inputs: [first, second],
      disable: () => {
        first.disabled = true;
        second.disabled = true;
      },
    };
  }
  const answer = h("input", {
    type: "text",
    inputmode: question.type === "number" ? "decimal" : "text",
    autocomplete: "off",
    "aria-label": `Respuesta del ejercicio ${questionIndex + 1}`,
  });
  return {
    node: answer,
    value: () => answer.value,
    preview: () => answer.value || "—",
    inputs: [answer],
    disable: () => {
      answer.disabled = true;
    },
  };
}

export function assess(question, value) {
  if (question.type === "choice") {
    if (value === null || value === undefined || value === "" || typeof value === "boolean") {
      return {
        correct: false,
        empty: true,
        diagnostics: [{ id: null, message: "Seleccioná una opción antes de revisar." }],
      };
    }
    const numVal = typeof value === "number" ? value : Number(String(value).trim());
    const correct = Number.isInteger(numVal) && numVal >= 0 && numVal === question.expected;
    return {
      correct,
      empty: false,
      diagnostics: correct
        ? []
        : [{ id: question.diagnosis, message: question.diagnosisMessage }],
    };
  }
  if (question.type === "pair") {
    if (!Array.isArray(value) || value.some((entry) => String(entry ?? "").trim() === "")) {
      return {
        correct: false,
        empty: true,
        diagnostics: [{ id: null, message: "Completá ambos casilleros antes de revisar." }],
      };
    }
    const actual = value.map((entry) => Number(String(entry).replace(",", ".")));
    const correct =
      actual.every(Number.isFinite) &&
      actual.every((entry, index) => Math.abs(entry - question.expected[index]) < 1e-6);
    return {
      correct,
      empty: false,
      diagnostics: correct
        ? []
        : [
            {
              id: question.diagnosis || "linear_difference_instead_of_ratio",
              message:
                question.diagnosisMessage ||
                "Revisá cada valor por separado y verificá la relación en la ecuación original.",
            },
          ],
    };
  }
  const raw = String(value ?? "").trim();
  if (!raw) {
    return {
      correct: false,
      empty: true,
      diagnostics: [{ id: null, message: "Ingresá una respuesta antes de revisar." }],
    };
  }
  // Evalúa mediante el motor de diagnóstico cognitivo de exponenciales
  const diag = diagnoseExp(raw, question.spec || {});
  const passedCheck = typeof question.checkCorrect === "function" ? Boolean(question.checkCorrect(raw)) : false;
  const isCorrect = diag === null && passedCheck;
  return {
    correct: isCorrect,
    empty: false,
    diagnostics: diag ? [diag] : [],
  };
}

export function createCheckBlock(host, questions, sectionId, onComplete) {
  let successStreak = 0;
  const cards = questions.map((question, index) => {
    let failStreak = 0;
    let hintStep = 0;
    let solutionRevealed = false;
    let solved = false;

    const answer = buildAnswerControl(question, index);
    const preview = h(
      "p",
      { class: "exp-check__preview seq-check__preview", "aria-live": "polite" },
      "Interpretado como: —",
    );
    const feedback = h("p", {
      class: "exp-check__feedback seq-check__feedback",
      "aria-live": "polite",
    });
    const hintBox = h("p", {
      class: "exp-check__hint seq-check__hint",
      hidden: true,
    });
    const solutionBox = h("div", {
      class: "exp-check__solution seq-check__solution",
      hidden: true,
    });

    const updatePreview = () =>
      mount(preview, "Interpretado como: ", ...inlineMathNodes(answer.preview()));
    answer.inputs?.forEach((input) => input.addEventListener("input", updatePreview));
    answer.node.querySelectorAll?.("button").forEach((button) =>
      button.addEventListener("click", updatePreview),
    );

    const review = h(
      "button",
      { type: "button", class: "btn" },
      chalkIcon("check"),
      " Revisar",
    );
    const hint = h(
      "button",
      { type: "button", class: "btn btn--ghost" },
      chalkIcon("hint"),
      " Pista (1/3)",
    );
    const show = h(
      "button",
      { type: "button", class: "btn btn--ghost" },
      chalkIcon("book"),
      " ¡Estoy atorado! Mostrame la solución",
    );

    hint.addEventListener("click", () => {
      hintStep = Math.min(hintStep + 1, 3);
      hintBox.hidden = false;
      mount(
        hintBox,
        `Pista ${hintStep}/3: `,
        ...inlineMathNodes(question.hints[hintStep - 1]),
      );
      mount(hint, chalkIcon("hint"), ` Pista (${hintStep}/3)`);
      hint.setAttribute("aria-label", `Mostrar pista ${Math.min(hintStep + 1, 3)} de 3`);
      const reaction = question.hintReactions?.[hintStep - 1];
      if (reaction) playScript([reaction]);
      else
        react({
          pose: ["pensativa", "explicando", "evaluando"][hintStep - 1],
          tag: `Pista ${hintStep} de 3`,
          html: question.hints[hintStep - 1],
        });
    });

    show.addEventListener("click", () => {
      solutionRevealed = true;
      successStreak = 0; // Revelar solución reinicia racha a 0
      solutionBox.hidden = false;
      show.disabled = true;
      hint.disabled = true;
      mount(
        solutionBox,
        h("strong", null, "Resolución paso a paso"),
        h("ol", null, ...question.solution.map((step) => h("li", null, ...inlineMathNodes(step)))),
      );
      playScript([STREAK_REACTIONS.showSolution, STREAK_REACTIONS.solutionAfter]);

      if (!solved) {
        solved = true;
        saveProgress(`${sectionId}:${index}`, "assisted");
        card.classList.add("is-solved", "is-assisted");
        card.classList.remove("is-independent");
        feedback.textContent =
          "Solución revelada. El razonamiento analítico quedó verificado.";
        feedback.className = "exp-check__feedback seq-check__feedback is-correct is-assisted";
        review.disabled = true;
        answer.disable?.();
        recordCompetencyAttempt({
          competencyId: question.competencyId,
          correct: true,
          mode: "assisted",
          hintsUsed: hintStep,
          solutionRevealed: true,
          diagnosticId: null,
          exerciseId: question.id,
          stage: question.stage || 'guided_practice',
          representation: question.representation || 'symbolic',
          transferDistance: question.transferDistance || 'near',
        });

        if (questions.every((_, position) => getProgress()[`${sectionId}:${position}`])) {
          saveProgress(sectionId);
          markSectionCompleted(sectionId);
          onComplete?.(sectionId);
        }
      }
    });

    const card = h(
      "li",
      {
        class: "exp-check__item seq-check__card",
        "data-question-type": question.type,
      },
      mountQuestionPrompt(question),
      h("div", { class: "exp-check__answer" }, answer.node),
      preview,
      h("div", { class: "exp-check__actions" }, review, hint, show),
      feedback,
      hintBox,
      solutionBox,
    );

    // Restauración de estado persistido en localStorage
    const savedStatus = getProgress()[`${sectionId}:${index}`];
    if (savedStatus) {
      solved = true;
      card.classList.add("is-solved");
      card.classList.add(savedStatus === "independent" ? "is-independent" : "is-assisted");
      feedback.textContent =
        savedStatus === "independent"
          ? "Resuelto de forma independiente."
          : "Resuelto con apoyo (asistido).";
      feedback.className = `exp-check__feedback seq-check__feedback is-correct ${savedStatus === "independent" ? "is-independent" : "is-assisted"}`;
      review.disabled = true;
      hint.disabled = true;
      show.disabled = true;
      answer.disable?.();
    }

    review.addEventListener("click", () => {
      if (question.type === "choice") {
        const activeBtn = answer.node.querySelector?.('.exp-choice-btn.is-active, button[aria-pressed="true"]');
        const hasSel = typeof answer.hasSelection === "function" ? answer.hasSelection() : (answer.value() !== null);
        if (!activeBtn || answer.value() === null || !hasSel) {
          feedback.textContent = "Seleccioná una opción antes de revisar.";
          feedback.className = "exp-check__feedback seq-check__feedback is-warning";
          return;
        }
      }

      const result = assess(question, answer.value());
      if (result.empty) {
        feedback.textContent = result.diagnostics[0]?.message || "Seleccioná o ingresá una respuesta antes de revisar.";
        feedback.className = "exp-check__feedback seq-check__feedback is-warning";
        return;
      }
      if (result.correct) {
        const isIndependent = hintStep === 0 && !solutionRevealed;
        const status = isIndependent ? "independent" : "assisted";
        solved = true;
        saveProgress(`${sectionId}:${index}`, status);
        recordCompetencyAttempt({
          competencyId: question.competencyId,
          correct: true,
          mode: isIndependent ? "independent" : "assisted",
          hintsUsed: hintStep,
          solutionRevealed: solutionRevealed,
          diagnosticId: null,
          exerciseId: question.id,
          stage: question.stage || 'guided_practice',
          representation: question.representation || 'symbolic',
          transferDistance: question.transferDistance || 'near',
        });

        card.classList.add("is-solved");
        card.classList.remove("is-independent", "is-assisted");
        card.classList.add(isIndependent ? "is-independent" : "is-assisted");

        if (isIndependent) {
          feedback.textContent =
            "Correcto: deducción independiente impecable.";
          feedback.className = "exp-check__feedback seq-check__feedback is-correct is-independent";
          if (failStreak > 0) {
            playScript([STREAK_REACTIONS.recovered]);
            successStreak = 1;
          } else {
            successStreak += 1;
            if (successStreak >= 3) {
              playScript([STREAK_REACTIONS.flawlessRun]);
            } else {
              playScript([STREAK_REACTIONS.firstTry]);
            }
          }
        } else {
          // Asistido: JAMÁS incrementa successStreak ni dispara firstTry o flawlessRun
          feedback.textContent =
            "Resuelto con apoyo (asistido). El razonamiento analítico quedó verificado.";
          feedback.className = "exp-check__feedback seq-check__feedback is-correct is-assisted";
        }

        failStreak = 0;
        review.disabled = true;
        hint.disabled = true;
        show.disabled = true;
        answer.disable?.();

        if (questions.every((_, position) => getProgress()[`${sectionId}:${position}`])) {
          saveProgress(sectionId);
          markSectionCompleted(sectionId);
          onComplete?.(sectionId);
        }
      } else {
        successStreak = 0;
        failStreak += 1;
        const diagnostic = result.diagnostics?.[0];
        recordCompetencyAttempt({
          competencyId: question.competencyId,
          correct: false,
          mode: (hintStep === 0 && !solutionRevealed) ? "independent" : "assisted",
          hintsUsed: hintStep,
          solutionRevealed: solutionRevealed,
          diagnosticId: diagnostic?.id || null,
          exerciseId: question.id,
          stage: question.stage || 'guided_practice',
          representation: question.representation || 'symbolic',
          transferDistance: question.transferDistance || 'near',
        });
        feedback.textContent =
          diagnostic?.message || "Todavía no: mirá las pistas y justificá un paso por vez.";
        feedback.className = "exp-check__feedback seq-check__feedback is-error";
        const reaction = diagnostic?.id && DIAGNOSE_REACTIONS[diagnostic.id];

        // Priorizar SIEMPRE el mensaje y reacción del diagnóstico específico
        if (reaction) {
          playScript([reaction]);
        } else if (failStreak >= 2) {
          playScript([STREAK_REACTIONS.repeatedError]);
        } else {
          react({
            pose: diagnostic?.pose || "sospecha",
            tag: "Revisemos el paso",
            html: feedback.textContent,
          });
        }
      }
    });

    return card;
  });
  mount(host, h("ol", { class: "exp-check seq-check" }, cards));
  return cards;
}

export const mountCheckBlock = createCheckBlock;

export function bindTutorButtons(root = document) {
  root.querySelectorAll("[data-tutor], .vn-trigger-btn").forEach((button) => {
    if (button.dataset.tutorReady) return;
    button.dataset.tutorReady = "true";
    button.addEventListener("click", () => {
      const sectionNumber = Number(button.closest("section")?.id.match(/\d+/)?.[0]) || 1;
      const scriptType = button.dataset.tutor || "why";
      const key =
        scriptType === "base"
          ? `sec${sectionNumber}-base`
          : `sec${sectionNumber}-${["tablas", "amebas", "continuo", "espejo", "cuadrantes", "constructor", "modelos", "asintotas", "radiografia", "ecuaciones"][sectionNumber - 1]}`;
      if (VN_SCRIPTS[key]) playScript(VN_SCRIPTS[key]);
      else if (button.dataset.scriptId && VN_SCRIPTS[button.dataset.scriptId]) {
        playScript(VN_SCRIPTS[button.dataset.scriptId]);
      }
    });
  });
}

export function mountProgress() {
  updateProgressUI();
}
