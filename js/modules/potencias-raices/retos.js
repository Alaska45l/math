import { h, s, mount, chalkIcon } from "../../core/dom.js";
import { fmt, frac } from "../../core/math-format.js";
import { playScript } from "../../core/vn.js";
import { diagnosePowRad, toDisplay } from "./expr.js";
import { DIAGNOSE_REACTIONS, STREAK_REACTIONS } from "./vn-scripts.js";
import { getProgress, saveProgress } from "./components.js";

export const CHALLENGE_TYPES = [
  "dos_mundos_mitad",
  "exponente_negativo_neutro",
  "cociente_potencias_neutro",
  "arbol_raiz_orden_n",
  "simplificar_radical_vars",
  "producto_radicales",
  "choque_mundos_binomio",
  "auditoria_reales_exactas",
];

export function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const int = (rng, low, high) => low + Math.floor(rng() * (high - low + 1));
const perfectPower = (n, degree) => n ** degree;

function inlineMathNodes(text) {
  const nodes = [];
  const marker = /\[\[frac:([^|\]]+)\|([^\]]+)\]\]/g;
  let cursor = 0;
  for (const match of text.matchAll(marker)) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    nodes.push(frac(match[1], match[2]));
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

/** Genera una pregunta reproducible y conserva todas sus ayudas en el objeto. */
export function makeChallenge(seed, requestedType = null) {
  const rng = mulberry32(seed);
  const type =
    requestedType || CHALLENGE_TYPES[int(rng, 0, CHALLENGE_TYPES.length - 1)];
  const a = int(rng, 2, 5);
  const k = int(rng, 2, 5);
  const degree = int(rng, 2, 4);
  const base = int(rng, 2, 4);
  const common = { seed, type, vars: {} };
  const cases = {
    dos_mundos_mitad() {
      const n = [2, 3][int(rng, 0, 1)];
      const root = int(rng, 2, 6);
      const x = perfectPower(root, n);
      return {
        ...common,
        prompt: `Para x = ${fmt(x)}, compará el salto aditivo x · [[frac:1|${n}]] con el factor multiplicativo x^([[frac:1|${n}]]). Escribí el valor del factor.`,
        answer: root,
        expression: `root(${n}, ${x})`,
        displayAnswer: fmt(root),
        hints: [
          `El ${fmt(1)}/${fmt(n)} está en el exponente, así que no repartas ${fmt(x)} en partes aditivas. Buscá un factor que repita una misma escala ${fmt(n)} veces.`,
          `Desde el neutro uno, preguntate qué número multiplicado por sí mismo ${fmt(n)} veces llega a ${fmt(x)}. Escribí una cadena corta de productos, no una división.`,
          `Probá el candidato ${fmt(root)}: ${fmt(root)}^${fmt(n)} reconstruye ${fmt(x)}. Ésa es la verificación de la raíz y también el valor que tenés que responder.`,
        ],
        solution: [
          `La parte aditiva sería ${fmt(x)} dividido en ${fmt(n)} partes iguales; esa pregunta empieza en cero.`,
          `El factor multiplicativo busca ${fmt(root)} repetido ${fmt(n)} veces desde el neutro uno.`,
          `${fmt(root)}^${fmt(n)} = ${fmt(x)}, por eso la raíz de índice ${fmt(n)} vale ${fmt(root)}.`,
        ],
      };
    },
    exponente_negativo_neutro() {
      const exponent = int(rng, 1, 4);
      const positive = int(rng, 0, 1);
      const power = positive ? 0 : -exponent;
      const value = power === 0 ? 1 : 1 / a ** exponent;
      return {
        ...common,
        prompt: `Calculá ${a}^${fmt(power)}.`,
        answer: value,
        expression: `${a}^${power}`,
        displayAnswer: fmt(value, 6),
        hints: [
          "Mirá el exponente antes que la base: cuenta pasos desde el neutro multiplicativo. Decidí si el reto pide quedarte en uno o retroceder mediante divisiones.",
          power === 0
            ? "Con cero pasos no se multiplica ni se divide nada: seguís exactamente en el neutro uno. No confundas ese origen multiplicativo con el cero aditivo."
            : `Con exponente negativo, salí de uno y dividí por ${fmt(a)} exactamente ${fmt(exponent)} veces. Cada parada debe seguir siendo positiva.`,
          power === 0
            ? `La escala inicial se conserva, así que escribí ${fmt(a)}⁰ = 1 y comprobá que multiplicar por uno no cambia ningún número.`
            : `El resultado es el inverso de ${fmt(a ** exponent)}: escribilo como una fracción con 1 arriba y comprobá que su signo sigue positivo.`,
        ],
        solution:
          power === 0
            ? [
                "No se aplica ningún cambio multiplicativo.",
                "El recorrido queda en su origen, el neutro multiplicativo uno.",
                `${a}⁰ = 1.`,
              ]
            : [
                `Empezá en uno y dividí por ${fmt(a)} ${fmt(exponent)} veces.`,
                `Eso equivale a multiplicar por [[frac:1|${a}]] repetidamente.`,
                `${a}^−${fmt(exponent)} = [[frac:1|${a ** exponent}]] = ${fmt(value, 6)}.`,
              ],
      };
    },
    cociente_potencias_neutro() {
      const m = int(rng, 2, 5),
        n = int(rng, 5, 8),
        p = int(rng, 1, 3);
      const exponent = m + p - n;
      const value = base ** exponent;
      return {
        ...common,
        prompt: `Simplificá (${base}^${m} · ${base}^${p}) ÷ ${base}^${n}; escribí el valor numérico.`,
        answer: value,
        expression: `${base}^${m}*${base}^${p}/${base}^${n}`,
        displayAnswer: fmt(value, 6),
        hints: [
          `Las tres potencias comparten base ${fmt(base)}. Primero contá los factores del numerador; todavía no calcules el valor decimal ni taches nada.`,
          `El numerador junta ${fmt(m)} y ${fmt(p)} pasos; después el denominador retira ${fmt(n)} factores formando pares que valen uno.`,
          `El contador final es ${fmt(m)} + ${fmt(p)} − ${fmt(n)} = ${fmt(exponent)}. Evaluá ${fmt(base)}^${fmt(exponent)} y, si es negativo, escribilo como inverso.`,
        ],
        solution: [
          `En el numerador se suman contadores: ${fmt(m)} + ${fmt(p)} = ${fmt(m + p)}.`,
          `Al dividir por la misma base, quedan ${fmt(m + p)} − ${fmt(n)} = ${fmt(exponent)} pasos.`,
          `El resultado es ${base}^${exponent} = ${fmt(value, 6)}.`,
        ],
      };
    },
    arbol_raiz_orden_n() {
      const n = [2, 3, 4, 5, 6, 7][int(rng, 0, 5)];
      const root = int(rng, 2, 4);
      const radicand = perfectPower(root, n);
      return {
        ...common,
        prompt: `Calculá la raíz de índice ${n} de ${radicand}.`,
        answer: root,
        expression: `root(${n},${radicand})`,
        displayAnswer: fmt(root),
        hints: [
          `El índice ${fmt(n)} pide ${fmt(n)} cajas idénticas. En vez de adivinar, desarmá ${fmt(radicand)} en sus factores primos para ver qué fichas se pueden repartir.`,
          `Repartí los ladrillos de la factorización para que ninguna caja tenga ventaja. Cada caja debe contener el mismo producto, o la raíz no será exacta.`,
          `En este caso cada caja forma ${fmt(root)}; verificá ${fmt(root)}^${fmt(n)} = ${fmt(radicand)} antes de escribir la raíz. La multiplicación de regreso es tu control.`,
        ],
        solution: [
          `${radicand} = ${root}^${n}.`,
          `La factorización se reparte en ${fmt(n)} grupos iguales.`,
          `La raíz de índice ${fmt(n)} de ${fmt(radicand)} es ${fmt(root)}.`,
        ],
      };
    },
    simplificar_radical_vars() {
      const x = int(rng, 1, 3),
        exponent = 4 + int(rng, 0, 3),
        inside = int(rng, 2, 5);
      const value = Math.sqrt(inside * x ** exponent);
      return {
        ...common,
        prompt: `Simplificá √(${inside}x^${exponent}) para x = ${fmt(x)}; escribí su valor numérico.`,
        answer: value,
        expression: `sqrt(${inside}*x^${exponent})`,
        vars: { x },
        displayAnswer: fmt(value, 6),
        hints: [
          `La raíz es cuadrada: buscá parejas de x y parejas entre los factores del número ${fmt(inside)}. No reemplaces x por ${fmt(x)} antes de entender qué paquetes salen.`,
          `De ${fmt(exponent)} letras x, cada pareja completa cruza como una x; si sobra una, queda bajo el radical junto al resto numérico. Escribí primero la forma simplificada.`,
          `Ahora sí sustituí x = ${fmt(x)} en tu expresión y evaluá. Comparala con √(${fmt(inside)}·${fmt(x)}^${fmt(exponent)}) para verificar el valor numérico.`,
        ],
        solution: [
          `Agrupá ${fmt(exponent)} factores x de a dos; sale x^${fmt(Math.floor(exponent / 2))}.`,
          `Queda ${inside} bajo el radical y ${fmt(exponent % 2)} factor(es) x, si corresponde.`,
          `Con x = ${fmt(x)}, el resultado equivale a ${fmt(value, 6)}.`,
        ],
      };
    },
    producto_radicales() {
      const c = int(rng, 2, 4),
        d = int(rng, 2, 5);
      const value = a * c * Math.sqrt(d * k);
      return {
        ...common,
        prompt: `Evaluá ${a}√${d} · ${c}√${k}.`,
        answer: value,
        expression: `${a}*sqrt(${d})*${c}*sqrt(${k})`,
        displayAnswer: fmt(value, 6),
        hints: [
          `Separá lo visible: ${fmt(a)} y ${fmt(c)} son coeficientes fuera de raíz; ${fmt(d)} y ${fmt(k)} son radicandos no negativos que sí pueden compartir techo.`,
          `Multiplicá primero ${fmt(a)} · ${fmt(c)} y, por otro lado, usá √${fmt(d)} · √${fmt(k)} = √(${fmt(d)} · ${fmt(k)}). No distribuyas la raíz sobre sumas: acá sólo hay producto.`,
          `Te queda ${fmt(a * c)}√${fmt(d * k)}. Calculá esa raíz y multiplicá por ${fmt(a * c)} para obtener el valor final del reto.`,
        ],
        solution: [
          `Los coeficientes producen ${fmt(a)} · ${fmt(c)} = ${fmt(a * c)}.`,
          `Los radicandos producen ${fmt(d)} · ${fmt(k)} = ${fmt(d * k)}.`,
          `El producto es ${fmt(a * c)}√${fmt(d * k)} = ${fmt(value, 6)}.`,
        ],
      };
    },
    choque_mundos_binomio() {
      const b = int(rng, 1, 4),
        sign = int(rng, 0, 1) ? 1 : -1;
      const value = (a + sign * b) ** 2;
      return {
        ...common,
        prompt: `Calculá (${a} ${sign > 0 ? "+" : "−"} ${b})² sin distribuir la potencia sobre la suma o resta.`,
        answer: value,
        expression: `(${a}${sign > 0 ? "+" : "-"}${b})^2`,
        displayAnswer: fmt(value),
        hints: [
          "Los paréntesis encierran la base completa; no repartas el cuadrado sobre la suma o resta. Primero decidí cuánto vale ese único número interior.",
          `${fmt(a)} ${sign > 0 ? "+" : "−"} ${fmt(b)} forma una sola base antes de elevar. Resolvé esa operación y recién después multiplicá el resultado por sí mismo.`,
          `La base completa vale ${fmt(a + sign * b)}. Cuadrala para completar (${fmt(a)} ${sign > 0 ? "+" : "−"} ${fmt(b)})² y verificá que no faltó ningún término.`,
        ],
        solution: [
          `La base entre paréntesis vale ${fmt(a + sign * b)}.`,
          `El cuadrado significa repetir esa base como dos factores iguales.`,
          `(${a} ${sign > 0 ? "+" : "−"} ${b})² = ${fmt(value)}.`,
        ],
      };
    },
    auditoria_reales_exactas() {
      const x = int(rng, 2, 6);
      return {
        ...common,
        prompt: `Evaluá √((${fmt(-x)})²) en ℝ.`,
        answer: x,
        expression: `sqrt((${fmt(-x)})^2)`,
        displayAnswer: fmt(x),
        hints: [
          `Seguí el orden de los paréntesis: primero se eleva −${fmt(x)} al cuadrado y recién después se aplica la raíz. ¿Qué signo tiene el producto de dos negativos?`,
          `El cuadrado transforma −${fmt(x)} en ${fmt(x * x)}, un radicando permitido. La raíz principal devuelve el valor no negativo, igual que el módulo de la entrada.`,
          `Tomá la raíz principal de ${fmt(x * x)} y escribí ${fmt(x)}. Comprobá que √((−${fmt(x)})²) = |−${fmt(x)}|, nunca −${fmt(x)}.`,
        ],
        solution: [
          `Elevar −${fmt(x)} al cuadrado da ${fmt(x * x)}.`,
          `La raíz principal de ${fmt(x * x)} es no negativa.`,
          `√((−${fmt(x)})²) = |−${fmt(x)}| = ${fmt(x)}.`,
        ],
      };
    },
  };
  const build = cases[type];
  if (!build) throw new RangeError(`Tipo de reto desconocido: ${type}`);
  return build();
}

const TRAPS = [
  {
    title: "Trampa 1 · Los factores “se cancelan”",
    wrong:
      "En [[frac:3⁴|3¹⁰]], tachar cuatro factores significa que desaparecen; queda cero o [[frac:4|3⁶]].",
    example: "[[frac:3⁴|3¹⁰]] = [[frac:1|3⁶]]",
    proof:
      "Cada pareja [[frac:3|3]] forma el neutro ×1. Los cuatro unos se multiplican entre sí y por el residuo; no se suman ni se vuelven cero.",
  },
  {
    title: "Trampa 2 · La potencia se distribuye",
    wrong: "Afirmar que (2 − 3x)² = 4 − 9x² y que √(x² + 9) = x + 3.",
    example: "Con x = 1, (2 − 3)² = 1 y 4 − 9 = −5.",
    proof:
      "El cuadrado del binomio contiene dos rectángulos cruzados. En la raíz de suma, 3, 4 y 5 muestran la hipotenusa frente al camino por los catetos.",
  },
  {
    title: "Trampa 3 · Dos órdenes, una sola operación",
    wrong: "Decir que √(x²) y (√x)² son idénticas para todo real.",
    example: "Con x = −4, √((−4)²) = 4, pero √(−4) no existe en ℝ.",
    proof:
      "La primera expresión vale |x| en todo ℝ. La segunda requiere x ≥ 0 desde su primer paso.",
  },
  {
    title: "Trampa 4 · Reagrupar cualquier exponente",
    wrong:
      "Reescribir (−2)^(2·[[frac:1|2]]) como [ (−2)² ]^([[frac:1|2]]) y concluir que −2 = 2.",
    example: "Al invertir el orden aparece √(−2), que no pertenece a ℝ.",
    proof:
      "La ley de potencia de potencia necesita restricciones. Una potencia racional con denominador par introduce una raíz par; la operación intermedia puede no existir.",
  },
  {
    title: "Trampa 5 · Perder la base y el signo",
    wrong: "Confundir 4 · 2ⁿ con 8ⁿ o leer −4² como (−4)².",
    example: "Para n = 2, 4 · 2² = 16, mientras 8² = 64; además −4² = −16.",
    proof:
      "Escribí 4 como 2²: entonces 4 · 2ⁿ = 2⁽ⁿ⁺²⁾. El exponente afecta a la base con paréntesis; el signo externo queda fuera.",
  },
];

function createTrainer(root) {
  let seed = Number(localStorage.getItem("potencias_raices:seed") || 202611);
  let current = makeChallenge(seed);
  let failStreak = 0;
  let hintStep = 0;
  const seedInput = h("input", {
    type: "number",
    min: "0",
    step: "1",
    value: String(seed),
    "aria-label": "Semilla del generador",
  });
  const typeSelect = h(
    "select",
    { "aria-label": "Tipo de desafío" },
    [
      ["aleatorio", "Aleatorio"],
      ...CHALLENGE_TYPES.map((type) => [type, type.replaceAll("_", " ")]),
    ].map(([value, label]) => h("option", { value }, label)),
  );
  const seedLabel = h(
    "label",
    { class: "pr-control" },
    h("span", null, "Semilla PRNG"),
    seedInput,
  );
  const typeLabel = h(
    "label",
    { class: "pr-control" },
    h("span", null, "Familia de reto"),
    typeSelect,
  );
  const prompt = h("p", { class: "pr-challenge__prompt" });
  const input = h("input", {
    type: "text",
    inputmode: "text",
    autocomplete: "off",
    "aria-label": "Tu respuesta al reto",
  });
  const preview = h(
    "p",
    { class: "pr-check__preview", "aria-live": "polite" },
    "Interpretado como: —",
  );
  const feedback = h("p", {
    class: "pr-check__feedback",
    "aria-live": "polite",
  });
  const hintText = h("p", { class: "pr-check__hint", hidden: true });
  const solution = h("div", { class: "pr-check__solution", hidden: true });
  const meta = h("p", { class: "pr-muted" });
  const revise = h(
    "button",
    {
      type: "button",
      class: "btn",
      on: {
        click: () => {
          const diagnosis = diagnosePowRad(input.value, {
            value: current.answer,
            context: current.prompt,
            expression: current.expression,
            vars: current.vars,
          });
          if (diagnosis.correct) {
            feedback.textContent = `Correcto: ${current.displayAnswer}. El razonamiento quedó registrado.`;
            feedback.className = "pr-check__feedback is-correct";
            saveProgress("challenge:last", { seed, type: current.type });
            playScript([
              failStreak >= 3
                ? STREAK_REACTIONS.flawlessRun
                : failStreak
                  ? STREAK_REACTIONS.recovered
                  : STREAK_REACTIONS.firstTry,
            ]);
            failStreak = 0;
          } else {
            failStreak++;
            feedback.textContent =
              diagnosis.diagnostics[0]?.message ||
              "Todavía no coincide. Leé una pista y revisá las operaciones por separado.";
            feedback.className = "pr-check__feedback is-error";
            const id = diagnosis.diagnostics[0]?.id;
            if (failStreak >= 2) playScript([STREAK_REACTIONS.repeatedError]);
            else if (DIAGNOSE_REACTIONS[id])
              playScript([DIAGNOSE_REACTIONS[id]]);
          }
        },
      },
    },
    chalkIcon("check"),
    " Revisar",
  );
  const hint = h(
    "button",
    {
      type: "button",
      class: "btn btn--ghost",
      on: {
        click: () => {
          hintStep = Math.min(3, hintStep + 1);
          hintText.hidden = false;
          hintText.textContent = `Pista ${fmt(hintStep)} de 3: ${current.hints[hintStep - 1]}`;
          playScript([
            {
              pose: ["base", "pensativa", "explicando"][hintStep - 1],
              tag: `Pista ${fmt(hintStep)} de 3`,
              html: current.hints[hintStep - 1],
            },
          ]);
        },
      },
    },
    chalkIcon("hint"),
    " Pista (1/3)",
  );
  const reveal = h(
    "button",
    {
      type: "button",
      class: "btn btn--ghost",
      on: {
        click: () => {
          solution.hidden = false;
          mount(
            solution,
            h("strong", null, "Resolución paso a paso"),
            h(
              "ol",
              null,
              ...current.solution.map((step) =>
                h("li", null, ...inlineMathNodes(step)),
              ),
            ),
          );
          playScript([
            STREAK_REACTIONS.showSolution,
            STREAK_REACTIONS.solutionAfter,
          ]);
        },
      },
    },
    chalkIcon("book"),
    " ¡Estoy atorado! Mostrame la solución",
  );
  const next = h(
    "button",
    {
      type: "button",
      class: "btn btn--ghost",
      on: {
        click: () => {
          seed++;
          localStorage.setItem("potencias_raices:seed", String(seed));
          newChallenge();
        },
      },
    },
    chalkIcon("reset"),
    " Otro reto",
  );
  const newChallenge = () => {
    const requested =
      typeSelect.value === "aleatorio" ? null : typeSelect.value;
    current = makeChallenge(seed, requested);
    mount(prompt, ...inlineMathNodes(current.prompt));
    meta.textContent = `Tipo: ${current.type.replaceAll("_", " ")} · Semilla ${fmt(seed)}`;
    input.value = "";
    preview.textContent = "Interpretado como: —";
    feedback.textContent = "";
    hintText.hidden = true;
    solution.hidden = true;
    hintStep = 0;
  };
  seedInput.addEventListener("change", () => {
    seed = Number(seedInput.value) >>> 0;
    seedInput.value = String(seed);
    localStorage.setItem("potencias_raices:seed", String(seed));
    newChallenge();
  });
  typeSelect.addEventListener("change", newChallenge);
  input.addEventListener("input", () => {
    preview.textContent = `Interpretado como: ${toDisplay(input.value) || "—"}`;
  });
  mount(
    root,
    h(
      "section",
      { class: "pr-trainer" },
      h("h3", null, "Entrenador infinito por semilla"),
      h("div", { class: "pr-widget__controls" }, seedLabel, typeLabel),
      meta,
      prompt,
      h(
        "label",
        { class: "pr-control" },
        h("span", null, "Tu respuesta"),
        input,
      ),
      preview,
      h("div", { class: "pr-check__actions" }, revise, hint, reveal, next),
      feedback,
      hintText,
      solution,
    ),
  );
  newChallenge();
}

function createTraps(root) {
  const cards = TRAPS.map((trap, index) => {
    const wrong = h(
      "article",
      { class: "pr-trap__wrong" },
      h("h4", null, "Razonamiento tramposo de examen"),
      h("p", null, ...inlineMathNodes(trap.wrong)),
    );
    const proof = h(
      "article",
      { class: "pr-trap__proof", hidden: true },
      h("h4", null, "Regla formal en ℝ"),
      h("p", null, ...inlineMathNodes(trap.proof)),
    );
    const example = h(
      "p",
      { class: "pr-trap__example", hidden: true },
      "Contraejemplo: ",
      ...inlineMathNodes(trap.example),
    );
    const test = h(
      "button",
      {
        type: "button",
        class: "btn btn--ghost",
        on: {
          click: () => {
            example.hidden = !example.hidden;
          },
        },
      },
      chalkIcon("target"),
      " Poner a prueba con un número",
    );
    const toggle = h(
      "button",
      {
        type: "button",
        class: "btn btn--ghost",
        "aria-expanded": "false",
        on: {
          click: (event) => {
            const open = proof.hidden;
            proof.hidden = !open;
            event.currentTarget.setAttribute("aria-expanded", String(open));
            playScript([
              {
                pose: "lentes-brillo",
                tag: `Trampa ${fmt(index + 1)} de parcial`,
                html: open ? `${trap.example} ${trap.proof}` : trap.wrong,
              },
            ]);
          },
        },
      },
      chalkIcon("hint"),
      ` ${trap.title} · Error común / demostración correcta`,
    );
    return h(
      "article",
      { class: "pr-trap" },
      toggle,
      h("div", { class: "pr-trap__columns" }, wrong, proof),
      test,
      example,
    );
  });
  mount(
    root,
    h(
      "section",
      { class: "pr-traps" },
      h("h3", null, "Cinco trampas de parcial"),
      ...cards,
    ),
  );
}

export function initRetosModule(
  root = document.querySelector("#pr-challenges"),
) {
  if (!root) return;
  const panels = [
    h("section", {
      class: "pr-challenge-panel",
      id: "pr-trainer-panel",
      role: "tabpanel",
    }),
    h("section", {
      class: "pr-challenge-panel",
      id: "pr-traps-panel",
      role: "tabpanel",
      hidden: true,
    }),
  ];
  const labels = [
    "1. Entrenador Infinito por Semilla",
    "2. Las 5 Trampas Clásicas de Examen",
  ];
  const tabs = labels.map((label, index) => {
    const button = h(
      "button",
      {
        type: "button",
        class: `chip pr-chapter-tab${index === 0 ? " is-active" : " chip--ghost"}`,
        role: "tab",
        id: `pr-tab-${index + 1}`,
        "aria-controls": panels[index].id,
        "aria-selected": String(index === 0),
        tabindex: index === 0 ? "0" : "-1",
      },
      label,
    );
    button.addEventListener("click", () => {
      tabs.forEach((tab, tabIndex) => {
        const active = tabIndex === index;
        tab.classList.toggle("is-active", active);
        tab.classList.toggle("chip--ghost", !active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[tabIndex].hidden = !active;
      });
    });
    return button;
  });
  mount(
    root,
    h(
      "div",
      {
        class: "pr-chapter-tabs",
        role: "tablist",
        "aria-label": "Práctica del capítulo cuatro",
      },
      tabs,
    ),
    ...panels,
  );
  createTrainer(panels[0]);
  createTraps(panels[1]);
}
