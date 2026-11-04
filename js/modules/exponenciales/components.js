/**
 * components.js — Componentes transversales para Laboratorio 7: Exponenciales.
 * Unidad 08 de Alaska Math Lab.
 * Reutiliza la arquitectura de potencias-raices y valor-absoluto:
 * 1. Progreso en localStorage y barra visual.
 * 2. Fórmula matemática interactiva anotada (annotatedExpFormula).
 * 3. Bloques de chequeos conceptuales con 3 pistas numéricas y soluciones.
 * 4. Disparadores de tutoría de Alaska (bindTutorButtons).
 */

import { h, mount, chalkIcon } from "../../core/dom.js";
import { fmt, frac, MINUS } from "../../core/math-format.js";
import { diagnoseExp } from "./logic.js";
import { playScript, react } from "../../core/vn.js";

// Reacciones predeterminadas de Alaska para el ciclo de retroalimentación pedagógica
export let STREAK_REACTIONS = {
  firstTry: {
    pose: "feliz",
    tag: "¡Excelente!",
    html: "¡Resolviste el ejercicio al primer intento! La deducción matemática fue impecable.",
  },
  recovered: {
    pose: "orgullosa",
    tag: "¡Bien pensado!",
    html: "Revisaste el paso y diste con el resultado correcto. Así se construye el álgebra.",
  },
  repeatedError: {
    pose: "pensativa",
    tag: "Detengámonos un segundo",
    html: "Analicemos la estructura antes de probar otro número. Mirá con atención las pistas.",
  },
  flawlessRun: {
    pose: "eureka",
    tag: "¡Impecable!",
    html: "Dominaste toda la serie de este bloque conceptual sin tropezar.",
  },
  showSolution: {
    pose: "explicando",
    tag: "Paso a paso",
    html: "Repasemos juntos la deducción completa para entender el porqué de cada paso.",
  },
  solutionAfter: {
    pose: "base",
    tag: "Continuemos",
    html: "Ahora probá aplicar esta misma lógica en el siguiente paso o en el próximo ejercicio.",
  },
};

export let DIAGNOSE_REACTIONS = {};
export let VN_SCRIPTS = {};

// Carga asíncrona de guiones y reacciones cuando vn-scripts.js esté disponible
import("./vn-scripts.js")
  .then((mod) => {
    if (mod.VN_SCRIPTS) VN_SCRIPTS = mod.VN_SCRIPTS;
    if (mod.DIAGNOSE_REACTIONS) DIAGNOSE_REACTIONS = mod.DIAGNOSE_REACTIONS;
    if (mod.STREAK_REACTIONS) {
      STREAK_REACTIONS = { ...STREAK_REACTIONS, ...mod.STREAK_REACTIONS };
    }
  })
  .catch(() => {
    // vn-scripts.js será provisto en el Milestone correspondiente
  });

export const PROGRESS_KEY = "exponenciales:progreso:v1";

export function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveProgress(key, value = true) {
  const state = getProgress();
  state[key] = value;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  } catch {
    // La sesión continúa aunque se exceda la cuota de almacenamiento
  }
  updateProgressUI();
}

function updateProgressUI() {
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
    node.textContent = `Chequeos resueltos: ${fmt(totalAnswers)}/30`;
  });

  document.querySelectorAll(".seq-sidebar__link[data-sec]").forEach((link) => {
    const done = Boolean(state[link.dataset.sec]);
    const icon = link.querySelector(".seq-sidebar__status");
    if (!icon) return;
    icon.replaceChildren(
      done
        ? chalkIcon("check", { width: 14, height: 14 })
        : document.createTextNode(""),
    );
    icon.classList.toggle("is-done", done);
  });
}

function makeToken(symbolNode, subLabel, explanation, noteBox, colour = "yellow") {
  const token = h(
    "button",
    {
      type: "button",
      class: `seq-token exp-token af-token af-token--${colour}`,
      tabindex: "0",
      "aria-label": `${subLabel}: ${typeof explanation === "string" ? explanation : subLabel}`,
      on: {
        mouseenter: () => showNote(noteBox, explanation),
        focus: () => showNote(noteBox, explanation),
        click: () => showNote(noteBox, explanation),
      },
    },
    h("span", { class: "exp-token__main af-token__main eq" }, symbolNode),
    h("span", { class: "exp-token__sub af-token__sub" }, subLabel),
  );
  return token;
}

function showNote(noteBox, message) {
  if (typeof message === "string") {
    mount(noteBox, h("p", { class: "seq-annotated__note" }, message));
  } else {
    mount(noteBox, h("div", { class: "seq-annotated__note" }, message));
  }
}

function formatBaseNode(a) {
  if (a === "e") return h("var", { class: "eq" }, "e");
  if (typeof a === "object" && a !== null && "n" in a && "d" in a) {
    return h("span", { class: "eq" }, "(", frac(String(a.n), String(a.d)), ")");
  }
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

    // 1. Presets contextuales si se pasa sectionId sin parámetros directos
    if (sId === "sec-1") {
      const expToken = token("k · aˣ", "exponencial", "Razón constante: al avanzar Δx = 1, la función se multiplica por a. Cada paso escala el valor anterior.", "yellow");
      const linToken = token("m · x + b", "lineal", "Diferencia constante: al avanzar Δx = 1, la función suma una cantidad fija m. Cada paso suma el mismo salto aditivo.", "blue");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "f(x) = ", expToken, "   frente a   y = ", linToken));
      return;
    }
    if (sId === "sec-2") {
      const kTok = token("3", "escala k", "Factor inicial f(0) = 3: en x = 0 la potencia vale 2⁰ = 1, por lo que f(0) = 3 · 1 = 3.", "pink");
      const aTok = token("2ˣ", "duplicación", "La base 2 se eleva a la x. ¡No multipliques 3 · 2 = 6! La potencia tiene mayor jerarquía: 3 · 2ˣ ≠ 6ˣ.", "yellow");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "f(x) = ", kTok, " · ", aTok, h("span", { class: "eq" }, " ≠ 6ˣ")));
      return;
    }
    if (sId === "sec-3") {
      const aRestr = token("a > 0 ∧ a ≠ 1", "restricción de base", "En ℝ la base debe ser positiva y distinta de 1. Si a < 0, (-2)^(1/2) colapsa; si a = 1, la curva es una recta plana.", "yellow");
      const kRestr = token("k ≠ 0", "factor no nulo", "Si k = 0, la función se anula idénticamente y no describe crecimiento ni decaimiento.", "pink");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "f(x) = k · aˣ   con   ", aRestr, "   y   ", kRestr));
      return;
    }
    if (sId === "sec-4") {
      const fracTok = token(h("span", null, "(", frac("1", "2"), ")ˣ"), "base 1/2", "Decaimiento al 50%: cada paso divide por 2 o multiplica por 1/2.", "yellow");
      const symmTok = token("2⁻ˣ", "simetría", "Regla de exponentes: (1/a)ˣ = a⁻ˣ. La gráfica de (1/2)ˣ es el reflejo especular de 2ˣ respecto al eje Y.", "blue");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, fracTok, " = ", symmTok, "   (asíntota horizontal y = 0)"));
      return;
    }
    if (sId === "sec-5") {
      const negK = token(`${MINUS}3`, "k < 0", "Al ser k negativo, la gráfica se refleja bajo el eje X: la imagen es (−∞; 0).", "pink");
      const fracA = token(h("span", null, "(", frac("1", "2"), ")ˣ"), "a = 1/2 < 1", "Como a < 1 pero k < 0, ¡la función es estrictamente CRECIENTE en ℝ! Al avanzar, se hace menos negativa.", "yellow");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "g(x) = ", negK, " · ", fracA, "   (creciente en ℝ)"));
      return;
    }
    if (sId === "sec-6") {
      const ratioTok = token(frac("f(x₂)", "f(x₁)"), "razón vertical", "Cociente entre valores de ordenadas: cancela el factor k y deja una potencia de a.", "blue");
      const powerTok = token("aˣ²⁻ˣ¹", "salto de exponente", "La diferencia de abscisas x₂ − x₁ indica cuántos saltos multiplicativos ocurrieron.", "yellow");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, ratioTok, " = ", powerTok, " ⟹ a = (y₂ / y₁)^(1 / (x₂ − x₁))"));
      return;
    }
    if (sId === "sec-7") {
      const initTok = token("M₀", "masa inicial", "Cantidad en t = 0.", "pink");
      const periodTok = token(h("span", null, "(", frac("1", "2"), ")", h("sup", null, frac("t", "T"))), "período compuesto", "El tiempo t se mide en múltiplos del período característico T (ej. vida media 3 min).", "yellow");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "M(t) = ", initTok, " · ", periodTok, "   frente a   A(t) = A₀ · e^(kt)"));
      return;
    }
    if (sId === "sec-8") {
      const shiftH = token("x − h", "desplazamiento H", "Traslada la curva horizontalmente h unidades: el ancla f(0) pasa a f(h) = k + c.", "teal");
      const asymC = token("+ c", "asíntota horizontal", "La asíntota se desplaza a y = c. Imagen abierta: (c; +∞) si k > 0. ¡Nunca lleva corchete cerrado!", "green");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "f(x) = k · a^(", shiftH, ") ", asymC));
      return;
    }
    if (sId === "sec-9") {
      const fullFn = token("2 − (1/2)ˣ", "función examen", "k = −1, a = 1/2, c = 2. Asíntota y = 2, Im = (−∞; 2), raíz x₀ = −1, C⁺ = (−∞; −1), C⁻ = (−1; +∞).", "pink");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "f(x) = ", fullFn));
      return;
    }
    if (sId === "sec-10") {
      const subTok = token("u = aˣ > 0", "cambio u", "La sustitución convierte la ecuación exponencial en cuadrática. Las raíces u ≤ 0 se descartan obligatoriamente.", "yellow");
      mount(formulaHost, h("span", { class: "seq-annotated__equation" }, "3²ˣ − 4 · 3ˣ⁺¹ : 9 + 1/3 = 0 ⟹ ", subTok));
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

    // Token a
    const aNode = formatBaseNode(a);
    const aExpl = state.tokens.a ||
      `Base a = ${typeof a === "number" ? fmt(a) : a}: razón multiplicativa. ${Number(a) > 1 ? "Como a > 1, representa crecimiento exponencial." : "Como 0 < a < 1, representa decaimiento exponencial."} En Exactas a debe ser positiva y distinta de 1.`;

    // Exponente b*x - h
    const expChildren = [];
    if (b !== 1) expChildren.push(`${fmt(b)}·`);
    expChildren.push(varName);
    if (hVal !== 0) expChildren.push(` ${hVal > 0 ? MINUS : "+"} ${fmt(Math.abs(hVal))}`);

    const hExpl = state.tokens.h ||
      `Desfasaje horizontal h = ${fmt(hVal)}: traslada la curva ${hVal > 0 ? "hacia la derecha" : "hacia la izquierda"}. En ${varName} = ${fmt(hVal)}, el exponente vale 0.`;
    const expToken = token(h("span", { class: "eq" }, ...expChildren), "exponente", hExpl, "teal");

    nodes.push(
      h("span", { class: "exp-power" },
        token(aNode, "base a", aExpl, "yellow"),
        h("sup", null, expToken),
      ),
    );

    // Token c (asíntota)
    if (cVal !== 0 || config.showC) {
      const cSign = cVal >= 0 ? "+" : MINUS;
      const cAbs = fmt(Math.abs(cVal));
      const cExpl = state.tokens.c ||
        `Asíntota horizontal y = ${fmt(cVal)}: recta a la que se aproxima la curva. La imagen es ${k > 0 ? `(${fmt(cVal)}; +∞)` : `(−∞; ${fmt(cVal)})`}. ¡Nunca lleva corchete cerrado!`;
      nodes.push(" ");
      nodes.push(token(`${cSign} ${cAbs}`, "asíntota y = c", cExpl, "green"));
    }

    mount(formulaHost, h("span", { class: "seq-annotated__equation" }, ...nodes));
  }

  mount(root,
    h("div", { class: "seq-annotated exp-annotated" },
      formulaHost,
      note,
    ),
  );

  mount(note,
    h("p", { class: "seq-annotated__hint-text muted small" },
      "Tocá o enfocá cada símbolo para que Alaska te explique qué controla en el gráfico y qué condición exige Exactas.",
    ),
  );

  render();

  return {
    update(nextConfig = {}) {
      state = { ...state, ...nextConfig };
      render();
    },
    formula: formulaHost,
    note,
  };
}

function inlineMathNodes(value) {
  const text = String(value ?? "");
  const pattern = /\[\[frac:([^|\]]+)\|([^\]]+)\]\]|([^\s()]+)\s*\/\s*([^\s()]+)/g;
  const nodes = [];
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    nodes.push(frac(match[1] ?? match[3], match[2] ?? match[4]));
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function mountQuestionPrompt(question) {
  return h("p", { class: "seq-check__prompt exp-check__prompt" }, question.prompt);
}

function buildAnswerControl(question, questionIndex) {
  if (question.type === "choice") {
    const selected = { value: null };
    const buttons = question.options.map((option, index) => {
      const button = h(
        "button",
        { type: "button", class: "chip chip--ghost", "aria-pressed": "false" },
        option,
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
      value: () => (selected.value === null ? "" : String(selected.value)),
      preview: () =>
        selected.value === null ? "Elegí una opción" : question.options[selected.value],
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
  };
}

function assess(question, value) {
  if (question.type === "choice") {
    const correct = Number(value) === question.expected;
    return {
      correct,
      diagnostics: correct
        ? []
        : [{ id: question.diagnosis, message: question.diagnosisMessage }],
    };
  }
  if (question.type === "pair") {
    const actual = value.map((entry) => Number(String(entry).replace(",", ".")));
    const correct =
      actual.every(Number.isFinite) &&
      actual.every((entry, index) => Math.abs(entry - question.expected[index]) < 1e-6);
    return {
      correct,
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
  // Evalúa mediante el motor de diagnóstico cognitivo de exponenciales
  const diag = diagnoseExp(value, question.spec || {});
  const isCorrect = diag === null && question.checkCorrect ? question.checkCorrect(value) : (diag === null);
  return {
    correct: isCorrect,
    diagnostics: diag ? [diag] : [],
  };
}

export function createCheckBlock(host, questions, sectionId, onComplete) {
  let successStreak = 0;
  const cards = questions.map((question, index) => {
    let failStreak = 0;
    let hintStep = 0;
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
      solutionBox.hidden = false;
      mount(
        solutionBox,
        h("strong", null, "Resolución paso a paso"),
        h("ol", null, ...question.solution.map((step) => h("li", null, ...inlineMathNodes(step)))),
      );
      playScript([STREAK_REACTIONS.showSolution, STREAK_REACTIONS.solutionAfter]);
    });

    review.addEventListener("click", () => {
      const result = assess(question, answer.value());
      if (result.correct) {
        saveProgress(`${sectionId}:${index}`);
        feedback.textContent =
          "Correcto: la explicación coincide con el resultado y quedó guardada.";
        feedback.className = "exp-check__feedback seq-check__feedback is-correct";
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
        failStreak = 0;
        if (questions.every((_, position) => getProgress()[`${sectionId}:${position}`])) {
          saveProgress(sectionId);
          onComplete?.(sectionId);
        }
      } else {
        successStreak = 0;
        failStreak += 1;
        const diagnostic = result.diagnostics?.[0];
        feedback.textContent =
          diagnostic?.message || "Todavía no: mirá las pistas y justificá un paso por vez.";
        feedback.className = "exp-check__feedback seq-check__feedback is-error";
        const reaction = diagnostic && DIAGNOSE_REACTIONS[diagnostic.id];
        if (failStreak >= 2) playScript([STREAK_REACTIONS.repeatedError]);
        else if (reaction) playScript([reaction]);
        else
          react({
            pose: diagnostic?.pose || "sospecha",
            tag: "Revisemos el paso",
            html: feedback.textContent,
          });
      }
    });

    return h(
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
