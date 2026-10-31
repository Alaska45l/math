/** Dos tuberías HTML legibles y un gráfico SVG que sólo dibuja funciones. */
import {
  h,
  s,
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
} from "./board-kit.js";

function pipeRow(title, tone) {
  const values = [];
  const steps = ["Entrada", "Operación", "Resultado"];
  const row = h(
    "section",
    { class: `va-sign-machine pr-pipe-row pr-pipe-row--${tone}` },
    h("h4", null, title),
    h(
      "div",
      { class: "pr-pipe-grid" },
      ...steps.map((label, index) => {
        const value = h("p", { class: "pr-pipe-step__value" }, "");
        values.push(value);
        return h(
          "div",
          { class: "pr-pipe-step" },
          h("span", { class: "pr-pipe-step__number" }, `${index + 1}. ${label}`),
          value,
        );
      }),
    ),
  );
  return { row, values };
}

export function initEspejoDominioRealWidget(host) {
  const board = createBoard(
    host,
    "Orden de operación y dominio de las raíces reales",
    "0 0 640 220",
  );
  const state = createStore({ x: -4, mode: 0 });
  const xControl = addRange(
    board.controls,
    state,
    "x",
    "Entrada real x",
    -8,
    8,
    -4,
  );
  const modeSelect = addSelect(
    board.controls,
    state,
    "mode",
    "Laboratorio",
    [
      [0, "√(x²) frente a (√x)²"],
      [1, "Raíz de un producto negativo"],
    ],
    0,
  );

  const rowA = pipeRow("Fila A · √(x²): primero elevar", "valid");
  const rowB = pipeRow("Fila B · (√x)²: primero extraer", "blocked");
  const machine = h(
    "div",
    { class: "pr-pipe-machine", "aria-live": "polite" },
    rowA.row,
    rowB.row,
  );
  board.frame.insertBefore(machine, board.svg);

  svgText(board.drawing, 320, 18, "GRÁFICO DE DOMINIO Y ORDEN OPERATIVO", {
    fill: "var(--yellow)",
    "font-size": 14,
    "font-weight": "bold",
    "text-anchor": "middle",
  });
  const axes = svgPath(board.drawing, "M44 168 H596 M320 42 V188", {
    stroke: "var(--muted)",
    "stroke-width": 1.4,
  });
  const vGraph = svgPath(board.drawing, "", {
    stroke: "var(--yellow)",
    "stroke-width": 3,
  });
  const halfGraph = svgPath(board.drawing, "M320 168 L596 88", {
    stroke: "var(--green)",
    "stroke-width": 2.5,
    "stroke-dasharray": "5 3",
  });
  const cursor = s("circle", { cx: 320, cy: 168, r: 6, fill: "var(--green)" });
  board.drawing.append(cursor);
  [-8, -4, 0, 4, 8].forEach((value, index) =>
    svgText(board.drawing, 44 + index * 138, 188, fmt(value), {
      "text-anchor": "middle",
      "font-size": 11,
      fill: "var(--muted)",
    }),
  );
  const graphNote = svgText(board.drawing, 320, 210, "", {
    "text-anchor": "middle",
    "font-size": 12,
    fill: "var(--ink)",
  });

  const render = ({ x, mode }) => {
    xControl.input.value = String(x);
    xControl.output.textContent = fmt(x);
    modeSelect.value = String(mode);
    const positive = x >= 0;
    const rowAValues =
      mode === 0
        ? [
            `x = ${fmt(x)}`,
            `(${fmt(x)})² = ${fmt(x * x)} ≥ 0`,
            `√${fmt(x * x)} = ${fmt(Math.abs(x))} = |${fmt(x)}|`,
          ]
        : [
            "(−1) · (−4)",
            "El producto interno vale +4",
            "√4 = 2: la raíz existe en ℝ",
          ];
    const rowBValues =
      mode === 0
        ? positive
          ? [
              `x = ${fmt(x)}`,
              `√${fmt(x)} = ${fmt(Math.sqrt(x))}`,
              `(√${fmt(x)})² = ${fmt(x)}`,
            ]
          : [
              `x = ${fmt(x)}`,
              `√(${fmt(x)}) no existe en ℝ`,
              "No hay valor real para elevar después",
            ]
        : [
            "√(−1) · √(−4)",
            "Cada raíz par queda bloqueada",
            "El producto separado no existe en ℝ",
          ];
    rowA.values.forEach((node, index) => (node.textContent = rowAValues[index]));
    rowB.values.forEach((node, index) => (node.textContent = rowBValues[index]));
    rowB.row.classList.toggle("is-blocked", mode === 0 && !positive);

    const points = [];
    for (let value = -8; value <= 8; value += 0.25) {
      const sx = 44 + ((value + 8) / 16) * 552;
      const sy = 168 - Math.abs(value) * 14;
      points.push(`${value === -8 ? "M" : "L"}${sx} ${sy}`);
    }
    vGraph.setAttribute("d", points.join(" "));
    cursor.setAttribute("cx", String(44 + ((x + 8) / 16) * 552));
    cursor.setAttribute("cy", String(168 - Math.abs(x) * 14));
    cursor.setAttribute("fill", positive ? "var(--green)" : "var(--pink)");
    setVisible(halfGraph, mode === 0);
    setVisible(vGraph, mode === 0);
    setVisible(axes, mode === 0);
    graphNote.textContent =
      mode === 0
        ? "Amarillo: y = |x| · Verde punteado: y = x sólo para x ≥ 0"
        : "Multiplicar primero conserva un radicando real; separar puede destruir el dominio.";
    renderReadout(
      board.readout,
      mode === 0 ? "El orden cambia el dominio" : "Contraejemplo de la distributiva radical",
      [
        [
          "Regla que queda",
          [
            h(
              "p",
              null,
              mode === 0
                ? "√(x²) = |x| para todo real; (√x)² sólo puede empezar cuando x ≥ 0."
                : "√(ab) sólo se puede separar como √a · √b si ambas raíces pares existen por separado en ℝ.",
            ),
          ],
        ],
      ],
    );
  };
  connect(state, (value) => value, render);
  return board;
}
