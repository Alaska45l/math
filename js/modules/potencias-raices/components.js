/** Cross-cutting lesson components: checks, annotated equations and progress. */
import { h, mount, chalkIcon } from "../../core/dom.js";
import { fmt, frac, MINUS } from "../../core/math-format.js";
import { diagnosePowRad, toDisplay } from "./expr.js";
import { playScript, react } from "../../core/vn.js";
import {
  VN_SCRIPTS,
  DIAGNOSE_REACTIONS,
  STREAK_REACTIONS,
} from "./vn-scripts.js";

export const PROGRESS_KEY = "potencias_raices:progreso:v1";

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
    // The current session still works when storage is unavailable.
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

function makeToken(symbol, subLabel, explanation, note, colour = "yellow") {
  const token = h(
    "button",
    {
      type: "button",
      class: `seq-token af-token af-token--${colour}`,
      tabindex: "0",
      "aria-label": `${subLabel}: ${explanation}`,
      on: {
        mouseenter: () => showNote(note, explanation),
        focus: () => showNote(note, explanation),
        click: () => showNote(note, explanation),
      },
    },
    h("span", { class: "af-token__main eq" }, symbol),
    h("span", { class: "af-token__sub" }, subLabel),
  );
  return token;
}

function showNote(note, message) {
  mount(note, h("p", { class: "seq-annotated__note" }, message));
}

/** Builds a contextual equation, with each meaningful symbol independently annotated. */
export function annotatedPowFormula(root, config = {}) {
  const section = config.sectionId || root.closest("section")?.id || "sec-1";
  const note = h("div", {
    class: "seq-annotated__note-box",
    "aria-live": "polite",
  });
  const token = (symbol, label, detail, colour) =>
    makeToken(symbol, label, detail, note, colour);
  const base = (symbol = "a") =>
    token(
      symbol,
      "base",
      "La base es el factor cuyo comportamiento se repite; antes de calcular, marcá qué parte completa está elevada.",
      "blue",
    );
  const exponent = (symbol = "n") =>
    token(
      symbol,
      "exponente",
      "El exponente cuenta cuántas veces repetimos el cambio multiplicativo; no cuenta sumandos.",
    );
  const neutral = () =>
    token(
      "1",
      "neutro 1",
      "El uno es el origen multiplicativo: multiplicar por uno conserva la escala.",
      "green",
    );
  const index = (symbol = "n") =>
    token(
      symbol,
      "índice",
      "El índice determina en cuántas etapas iguales repartimos los factores.",
    );
  const radicand = (symbol = "x") =>
    token(
      symbol,
      "radicando",
      "El radicando es la cantidad bajo el signo radical que la raíz debe reconstruir.",
    );
  const formula = (() => {
    if (section === "sec-1")
      return h(
        "span",
        { class: "seq-annotated__equation" },
        base(),
        h("sup", null, exponent()),
        " = ",
        neutral(),
        " · ",
        base(),
        " · ",
        base(),
        " · … · ",
        base(),
        h("span", { class: "eq" }, " (n factores)"),
      );
    if (section === "sec-2")
      return h(
        "span",
        { class: "seq-annotated__equation" },
        base(),
        h(
          "sup",
          null,
          token(
            `${MINUS}n`,
            "exponente negativo",
            "El signo menos invierte la dirección de los cambios: desde uno, divide en vez de multiplicar.",
          ),
        ),
        " = ",
        frac("1", h("span", null, base(), h("sup", null, exponent()))),
      );
    if (section === "sec-4")
      return h(
        "span",
        { class: "seq-annotated__equation" },
        base("x"),
        h(
          "sup",
          null,
          frac(
            token(
              "m",
              "numerador",
              "El numerador repite m veces el salto multiplicativo de una etapa.",
            ),
            index("n"),
          ),
        ),
        " = ",
        index("n"),
        "√",
        radicand("x"),
        h("sup", null, exponent("m")),
      );
    if (section === "sec-7")
      return h(
        "span",
        { class: "seq-annotated__equation" },
        index("n"),
        "√(",
        base("a"),
        h("sup", null, exponent("n")),
        " · ",
        radicand("b"),
        ") = ",
        base("a"),
        " · ",
        index("n"),
        "√",
        radicand("b"),
      );
    if (section === "sec-5")
      return h(
        "span",
        { class: "seq-annotated__equation" },
        base("L"),
        "² = área; ",
        index("2"),
        "√",
        radicand("A"),
        " = lado",
      );
    if (section === "sec-6")
      return h(
        "span",
        { class: "seq-annotated__equation" },
        index("n"),
        "√",
        radicand("N"),
        " = producto de una caja idéntica",
      );
    if (section === "sec-8")
      return h(
        "span",
        { class: "seq-annotated__equation" },
        "(",
        base("a"),
        " + ",
        base("b"),
        ")² = a² + 2ab + b²",
      );
    if (section === "sec-9")
      return h(
        "span",
        { class: "seq-annotated__equation" },
        "√(",
        radicand("x"),
        "²) = |x|;   (√x)² requiere x ≥ 0",
      );
    return h(
      "span",
      { class: "seq-annotated__equation" },
      "−",
      base("a"),
      "² = −a²;   (−a)² = a²",
    );
  })();
  mount(
    root,
    h(
      "div",
      { class: "seq-annotated pr-annotated" },
      h("div", { class: "seq-annotated__formula" }, formula),
      note,
    ),
  );
  mount(
    note,
    h(
      "p",
      { class: "seq-annotated__hint-text muted small" },
      "Tocá o enfocá un símbolo para que Alaska te explique qué representa y qué condición permite usarlo.",
    ),
  );
  return { formula, note };
}

export function worldsComparisonCard(root) {
  const additive = h(
    "article",
    { class: "pr-world-card pr-world-card--additive" },
    h("h3", null, "Mundo aditivo · origen 0"),
    h(
      "p",
      null,
      "Avanzar es sumar +a; retroceder es sumar el opuesto. El contador aditivo cuenta sumandos.",
    ),
    h("p", { class: "eq" }, "0 + a + a + … = a · n"),
    h("p", null, "Dos medios saltos de 18 reconstruyen 36: 18 + 18 = 36."),
  );
  const multiplicative = h(
    "article",
    { class: "pr-world-card pr-world-card--multiplicative" },
    h("h3", null, "Mundo multiplicativo · origen 1"),
    h(
      "p",
      null,
      "Avanzar es multiplicar por a; retroceder es dividir por a. El exponente cuenta factores.",
    ),
    h("p", { class: "eq" }, "1 · a · a · … = aⁿ"),
    h(
      "p",
      null,
      "Dos medios cambios de escala por 6 reconstruyen 36: 6 · 6 = 36.",
    ),
  );
  mount(
    root,
    h(
      "div",
      { class: "pr-worlds-comparison va-readout" },
      additive,
      multiplicative,
    ),
  );
  return root;
}

function inlineMathNodes(value) {
  const text = String(value ?? "");
  const pattern =
    /\[\[frac:([^|\]]+)\|([^\]]+)\]\]|([^\s()]+)\s*\/\s*([^\s()]+)/g;
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
  return h(
    "p",
    { class: "seq-check__prompt pr-check__prompt" },
    question.prompt,
  );
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
          class: "seq-controls pr-choice",
          role: "group",
          "aria-label": `Opciones del ejercicio ${questionIndex + 1}`,
        },
        buttons,
      ),
      value: () => (selected.value === null ? "" : String(selected.value)),
      preview: () =>
        selected.value === null
          ? "Elegí una opción"
          : question.options[selected.value],
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
        { class: "pr-pair-inputs" },
        h("label", null, question.firstLabel, first),
        h("label", null, question.secondLabel, second),
      ),
      value: () => [first.value, second.value],
      preview: () =>
        `${question.firstLabel}: ${toDisplay(first.value) || "—"}; ${question.secondLabel}: ${toDisplay(second.value) || "—"}`,
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
    preview: () => toDisplay(answer.value) || "—",
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
    const actual = value.map((entry) =>
      Number(String(entry).replace(",", ".")),
    );
    const correct =
      actual.every(Number.isFinite) &&
      actual.every(
        (entry, index) => Math.abs(entry - question.expected[index]) < 1e-9,
      );
    return {
      correct,
      diagnostics: correct
        ? []
        : [
            {
              id: question.diagnosis || "additive_instead_of_multiplicative",
              message:
                question.diagnosisMessage ||
                "Revisá cada coordenada por separado y comprobá el resultado en la operación original.",
            },
          ],
    };
  }
  return diagnosePowRad(value, question.spec);
}

/** Hand-authored prompts, progressive clues and worked solutions are rendered without defaults. */
export function createCheckBlock(host, questions, sectionId, onComplete) {
  const cards = questions.map((question, index) => {
    let failStreak = 0;
    let hintStep = 0;
    const answer = buildAnswerControl(question, index);
    const preview = h(
      "p",
      { class: "pr-check__preview", "aria-live": "polite" },
      "Interpretado como: —",
    );
    const feedback = h("p", {
      class: "pr-check__feedback seq-check__feedback",
      "aria-live": "polite",
    });
    const hintBox = h("p", {
      class: "pr-check__hint seq-check__hint",
      hidden: true,
    });
    const solutionBox = h("div", {
      class: "pr-check__solution seq-check__solution",
      hidden: true,
    });
    const updatePreview = () =>
      mount(
        preview,
        "Interpretado como: ",
        ...inlineMathNodes(answer.preview()),
      );
    answer.inputs?.forEach((input) =>
      input.addEventListener("input", updatePreview),
    );
    answer.node
      .querySelectorAll?.("button")
      .forEach((button) => button.addEventListener("click", updatePreview));
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
      hint.setAttribute(
        "aria-label",
        `Mostrar pista ${Math.min(hintStep + 1, 3)} de 3`,
      );
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
        h(
          "ol",
          null,
          ...question.solution.map((step) =>
            h("li", null, ...inlineMathNodes(step)),
          ),
        ),
      );
      playScript([
        STREAK_REACTIONS.showSolution,
        STREAK_REACTIONS.solutionAfter,
      ]);
    });

    review.addEventListener("click", () => {
      const result = assess(question, answer.value());
      if (result.correct) {
        saveProgress(`${sectionId}:${index}`);
        feedback.textContent =
          "Correcto: la explicación coincide con el resultado y quedó guardada.";
        feedback.className =
          "pr-check__feedback seq-check__feedback is-correct";
        const reaction =
          failStreak >= 3
            ? STREAK_REACTIONS.flawlessRun
            : failStreak
              ? STREAK_REACTIONS.recovered
              : STREAK_REACTIONS.firstTry;
        playScript([reaction]);
        if (
          questions.every(
            (_, position) => getProgress()[`${sectionId}:${position}`],
          )
        ) {
          saveProgress(sectionId);
          onComplete?.(sectionId);
        }
      } else {
        failStreak += 1;
        const diagnostic = result.diagnostics?.[0];
        feedback.textContent =
          diagnostic?.message ||
          "Todavía no: mirá las pistas y justificá un paso por vez.";
        feedback.className = "pr-check__feedback seq-check__feedback is-error";
        const reaction = diagnostic && DIAGNOSE_REACTIONS[diagnostic.id];
        if (failStreak >= 2) playScript([STREAK_REACTIONS.repeatedError]);
        else if (reaction) playScript([reaction]);
        else
          react({
            pose: "sospecha",
            tag: "Revisemos el paso",
            html: feedback.textContent,
          });
      }
    });

    return h(
      "li",
      {
        class: "pr-check__item seq-check__card",
        "data-question-type": question.type,
      },
      mountQuestionPrompt(question),
      h("div", { class: "pr-check__answer" }, answer.node),
      preview,
      h("div", { class: "pr-check__actions" }, review, hint, show),
      feedback,
      hintBox,
      solutionBox,
    );
  });
  mount(host, h("ol", { class: "pr-check seq-check" }, cards));
  return cards;
}

export const mountCheckBlock = createCheckBlock;

export function bindTutorButtons(root = document) {
  root.querySelectorAll("[data-tutor]").forEach((button) => {
    if (button.dataset.tutorReady) return;
    button.dataset.tutorReady = "true";
    button.addEventListener("click", () => {
      const sectionNumber =
        Number(button.closest("section")?.id.match(/\d+/)?.[0]) || 1;
      const key =
        button.dataset.tutor === "base"
          ? `sec${sectionNumber}-base`
          : `sec${sectionNumber}-${["mundos", "negativos", "cancelacion", "mitad", "geometria", "arbol", "simplificar", "choque", "espejo-real", "paradojas"][sectionNumber - 1]}`;
      if (VN_SCRIPTS[key]) playScript(VN_SCRIPTS[key]);
    });
  });
}

export function mountProgress() {
  updateProgressUI();
}
