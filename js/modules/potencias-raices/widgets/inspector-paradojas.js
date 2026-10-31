/** Cadena HTML auditada: cada igualdad muestra si respeta el dominio real. */
import {
  h,
  s,
  mount,
  createBoard,
  createStore,
  connect,
  addRange,
  addSelect,
  svgText,
  svgPath,
  setVisible,
  renderReadout,
  fmt,
  frac,
} from "./board-kit.js";

function chainFormula(step) {
  const formulas = [
    ["Paso 1", "−2"],
    ["Paso 2", "(−2)¹"],
    ["Paso 3", "(−2)^(", frac("2", "2"), ")"],
    ["Paso 4", "(−2)^(2 · ", frac("1", "2"), ")"],
    ["Paso 5", "[(−2)²]^(", frac("1", "2"), ")"],
    ["Paso 6", "4^(", frac("1", "2"), ") = √4"],
    ["Paso 7", "+2"],
  ][step];
  return h(
    "div",
    { class: "pr-paradox-card" },
    h("span", { class: "pr-paradox-card__step" }, formulas[0]),
    h("span", { class: "eq pr-paradox-card__formula" }, ...formulas.slice(1)),
  );
}

export function initInspectorParadojasWidget(host) {
  const board = createBoard(
    host,
    "Inspector interactivo de potencias reales",
    "0 0 640 150",
  );
  const state = createStore({ a: 2, index: 2, selected: -1, mode: 0 });
  const aControl = addRange(
    board.controls,
    state,
    "a",
    "Magnitud positiva a",
    1,
    6,
    2,
  );
  const indexSelect = addSelect(
    board.controls,
    state,
    "index",
    "Índice de la raíz",
    [
      [2, "2 · par"],
      [3, "3 · impar"],
      [4, "4 · par"],
    ],
    2,
  );
  const modeSelect = addSelect(
    board.controls,
    state,
    "mode",
    "Quirófano",
    [
      [0, "Detective · −2 = 2"],
      [1, "Paréntesis y precedencia"],
    ],
    0,
  );

  const equalityButtons = [];
  const chainParts = [];
  for (let step = 0; step < 7; step += 1) {
    chainParts.push(chainFormula(step));
    if (step < 6) {
      const equality = h(
        "button",
        {
          type: "button",
          class: "pr-paradox-equals",
          "aria-label": `Auditar igualdad entre los pasos ${step + 1} y ${step + 2}`,
          on: { click: () => state.set({ selected: step }) },
        },
        "=",
      );
      equalityButtons.push(equality);
      chainParts.push(equality);
    }
  }
  const chain = h(
    "section",
    { class: "pr-paradox-chain", "aria-label": "Cadena que aparenta demostrar menos dos igual a dos" },
    h("h4", null, "Detective: encontrá la igualdad fraudulenta"),
    h("div", { class: "pr-paradox-chain__steps" }, ...chainParts),
  );
  const scan = h("div", { class: "pr-paradox-scan", "aria-live": "polite" });
  const precedence = h("section", { class: "pr-precedence-machine", hidden: true });
  const htmlPanel = h("div", { class: "pr-paradox-panel" }, chain, scan, precedence);
  board.frame.insertBefore(htmlPanel, board.svg);

  svgText(board.drawing, 320, 24, "LA BASE ES EL PAQUETE QUE QUEDA ENTRE PARÉNTESIS", {
    fill: "var(--yellow)",
    "font-size": 14,
    "font-weight": "bold",
    "text-anchor": "middle",
  });
  const leftBox = s("rect", {
    x: 58,
    y: 46,
    width: 222,
    height: 68,
    rx: 10,
    fill: "var(--pink)",
    "fill-opacity": ".12",
    stroke: "var(--pink)",
    "stroke-width": 2,
  });
  const rightBox = s("rect", {
    x: 360,
    y: 46,
    width: 222,
    height: 68,
    rx: 10,
    fill: "var(--green)",
    "fill-opacity": ".12",
    stroke: "var(--green)",
    "stroke-width": 2,
  });
  board.drawing.append(leftBox, rightBox);
  const leftFormula = svgText(board.drawing, 169, 76, "", {
    "text-anchor": "middle",
    "font-size": 18,
    fill: "var(--pink)",
  });
  const rightFormula = svgText(board.drawing, 471, 76, "", {
    "text-anchor": "middle",
    "font-size": 18,
    fill: "var(--green)",
  });
  const rootFormula = svgText(board.drawing, 320, 138, "", {
    "text-anchor": "middle",
    "font-size": 15,
    fill: "var(--ink)",
  });
  const divider = svgPath(board.drawing, "M320 46 V114", {
    stroke: "var(--muted)",
    "stroke-width": 1.5,
    "stroke-dasharray": "4 4",
  });

  const render = ({ a, index, selected, mode }) => {
    aControl.input.value = String(a);
    aControl.output.textContent = fmt(a);
    indexSelect.value = String(index);
    modeSelect.value = String(mode);
    chain.hidden = mode !== 0;
    scan.hidden = mode !== 0;
    precedence.hidden = mode !== 1;
    board.svg.hidden = mode !== 1;
    equalityButtons.forEach((button, position) =>
      button.classList.toggle("is-selected", mode === 0 && position === selected),
    );
    const illegal = selected === 3;
    mount(
      scan,
      h("strong", null, selected < 0 ? "Tocá un signo igual para abrir la radiografía." : illegal ? "Paso 4 → 5: éste es el paso ilegal." : `Paso ${selected + 1} → ${selected + 2}: todavía conserva la escritura.`),
      h(
        "p",
        null,
        selected < 0
          ? "La cadena parece prolija porque transforma exponentes, pero una de sus operaciones intermedias exige una raíz cuadrada de un número negativo."
          : illegal
            ? "Reagrupar (−2)^(2 · 1/2) como [(−2)²]^(1/2) usa una ley fuera de su dominio. Si invertís el orden aparece √(−2), que no existe en ℝ."
            : "Este paso sólo prepara la notación. Seguí hasta el reagrupamiento y preguntá siempre si la operación intermedia existe entre los reales.",
      ),
    );
    mount(
      precedence,
      h("h4", null, "Quirófano de paréntesis"),
      h("p", null, `−${fmt(a)}² = −(${fmt(a)} · ${fmt(a)}) = ${fmt(-a * a)}; el signo menos quedó fuera.`),
      h("p", null, `(−${fmt(a)})² = ${fmt(a * a)}; ahora el signo sí pertenece a la base.`),
      h(
        "p",
        null,
        index % 2 === 0
          ? `Con índice ${fmt(index)} par, una raíz de un negativo no pertenece a ℝ.`
          : `Con índice ${fmt(index)} impar, una raíz de un negativo sí existe y conserva el signo.`,
      ),
    );
    leftFormula.textContent = `−${fmt(a)}² = ${fmt(-a * a)}`;
    rightFormula.textContent = `(−${fmt(a)})² = ${fmt(a * a)}`;
    rootFormula.textContent =
      index % 2 === 0
        ? `Índice ${fmt(index)}: √[${fmt(index)}](−a) no pertenece a ℝ`
        : `Índice ${fmt(index)}: raíz impar de −a conserva el signo`;
    [leftBox, rightBox, leftFormula, rightFormula, rootFormula, divider].forEach((node) =>
      setVisible(node, mode === 1),
    );
    renderReadout(
      board.readout,
      mode === 0 ? "La paradoja falla por dominio" : "Los paréntesis determinan la base",
      [
        [
          "Regla formal",
          [
            h(
              "p",
              null,
              "La propiedad (aᵐ)ⁿ = aᵐⁿ exige que las potencias intermedias estén definidas. Con base negativa y denominador par, esa condición falla.",
            ),
          ],
        ],
      ],
    );
  };
  connect(state, (value) => value, render);
  return board;
}
