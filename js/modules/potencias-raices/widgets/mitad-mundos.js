/** Dos puentes distintos que conectan 0→x y 1→x. */
import {
  h,
  s,
  createBoard,
  createStore,
  connect,
  addRange,
  addSelect,
  addChips,
  svgText,
  svgPath,
  setText,
  setVisible,
  renderReadout,
  fmt,
  frac,
} from "./board-kit.js";

const TARGETS = [
  [16, 2],
  [36, 2],
  [64, 3],
  [81, 4],
  [100, 2],
];

export function initMitadMundosWidget(host) {
  const board = createBoard(
    host,
    "Puente aditivo y puente multiplicativo",
    "0 0 640 360",
  );
  const state = createStore({ x: 36, index: 2, m: 1, prediction: false });
  const choosePreset = addChips(
    board.controls,
    TARGETS.map(([x, n]) => [`${x}:${n}`, `x = ${x}, n = ${n}`]),
    "36:2",
    (key) => {
      const [x, index] = key.split(":").map(Number);
      state.set({ x, index });
    },
    "Objetivo y número de etapas",
  );
  const xSelect = addSelect(
    board.controls,
    state,
    "x",
    "Objetivo x",
    [
      [9, "9"],
      [16, "16"],
      [25, "25"],
      [36, "36"],
      [64, "64"],
      [81, "81"],
      [100, "100"],
    ],
    36,
  );
  const indexSelect = addSelect(
    board.controls,
    state,
    "index",
    "Índice n",
    [
      [2, "2 etapas"],
      [3, "3 etapas"],
      [4, "4 etapas"],
    ],
    2,
  );
  const mControl = addRange(board.controls, state, "m", "Numerador m", 1, 4, 1);
  const predictionButton = h(
    "button",
    { type: "button", class: "btn btn--secondary" },
    "Adiviná dónde cae la mitad multiplicativa",
  );
  predictionButton.addEventListener("click", () =>
    state.set({ prediction: !state.get().prediction }),
  );
  board.controls.append(predictionButton);

  svgText(
    board.drawing,
    20,
    30,
    "MITAD ADITIVA · repartir una longitud desde 0",
    { fill: "var(--blue)", "font-weight": "bold" },
  );
  svgText(
    board.drawing,
    20,
    178,
    "MITAD MULTIPLICATIVA · repetir una escala desde 1",
    { fill: "var(--yellow)", "font-weight": "bold" },
  );
  const additiveRail = svgPath(board.drawing, "M56 100 H584", {
    stroke: "var(--blue)",
    "stroke-width": 3,
  });
  const multiplicativeRail = svgPath(board.drawing, "M56 258 H584", {
    stroke: "var(--yellow)",
    "stroke-width": 3,
  });
  const additiveNodes = [];
  const multiplicativeNodes = [];
  const additiveLabels = [];
  const multiplicativeLabels = [];
  const additiveArcs = [];
  const multiplicativeArcs = [];

  for (let step = 0; step <= 4; step += 1) {
    const addDot = s("circle", { cx: 56, cy: 100, r: 8, fill: "var(--blue)" });
    const mulDot = s("circle", {
      cx: 56,
      cy: 258,
      r: 9,
      fill: step === 0 ? "var(--green)" : "var(--yellow)",
    });
    board.drawing.append(addDot, mulDot);
    additiveNodes.push(addDot);
    multiplicativeNodes.push(mulDot);
    additiveLabels.push(
      svgText(board.drawing, 56, 78, "", { "text-anchor": "middle" }),
    );
    multiplicativeLabels.push(
      svgText(board.drawing, 56, 286, "", { "text-anchor": "middle" }),
    );
    if (step < 4) {
      const addArc = svgPath(board.drawing, "", {
        stroke: "var(--blue)",
        "stroke-width": 2,
      });
      const mulArc = svgPath(board.drawing, "", {
        stroke: "var(--yellow)",
        "stroke-width": 2,
      });
      additiveArcs.push({
        path: addArc,
        label: svgText(board.drawing, 0, 0, "", {
          fill: "var(--blue)",
          "text-anchor": "middle",
        }),
      });
      multiplicativeArcs.push({
        path: mulArc,
        label: svgText(board.drawing, 0, 0, "", {
          fill: "var(--yellow)",
          "text-anchor": "middle",
        }),
      });
    }
  }

  const render = ({ x, index, m, prediction }) => {
    const preset = TARGETS.find(([target, n]) => target === x && n === index);
    choosePreset(preset ? `${x}:${index}` : "__custom__");
    xSelect.value = String(x);
    indexSelect.value = String(index);
    mControl.input.value = String(m);
    mControl.output.textContent = fmt(m);
    const root = x ** (1 / index);
    const spread = 528 / index;
    for (let step = 0; step <= 4; step += 1) {
      const active = step <= index;
      const px = 56 + Math.min(step, index) * spread;
      [
        additiveNodes[step],
        multiplicativeNodes[step],
        additiveLabels[step],
        multiplicativeLabels[step],
      ].forEach((node) => setVisible(node, active));
      additiveNodes[step].setAttribute("cx", String(px));
      multiplicativeNodes[step].setAttribute("cx", String(px));
      setText(additiveLabels[step], fmt((x / index) * step));
      setText(multiplicativeLabels[step], fmt(root ** step, 4));
      if (step < index) {
        const nextX = px + spread;
        additiveArcs[step].path.setAttribute(
          "d",
          `M${px} 100 Q${(px + nextX) / 2} 72 ${nextX} 100`,
        );
        multiplicativeArcs[step].path.setAttribute(
          "d",
          `M${px} 258 Q${(px + nextX) / 2} 230 ${nextX} 258`,
        );
        setVisible(additiveArcs[step].path, true);
        setVisible(multiplicativeArcs[step].path, true);
        setText(additiveArcs[step].label, `+${fmt(x / index)}`);
        setText(multiplicativeArcs[step].label, `×${fmt(root, 4)}`);
        additiveArcs[step].label.setAttribute("x", String((px + nextX) / 2));
        additiveArcs[step].label.setAttribute("y", "68");
        multiplicativeArcs[step].label.setAttribute(
          "x",
          String((px + nextX) / 2),
        );
        multiplicativeArcs[step].label.setAttribute("y", "226");
        setVisible(additiveArcs[step].label, true);
        setVisible(multiplicativeArcs[step].label, true);
      }
    }
    additiveNodes[0].setAttribute("fill", "var(--blue)");
    multiplicativeNodes[0].setAttribute("fill", "var(--green)");
    const additiveHalf = x / index;
    const readouts = [
      [
        "Tramo aditivo",
        [
          h(
            "p",
            null,
            `0 → ${fmt(additiveHalf)} → ${fmt(x)} · cada salto suma ${fmt(additiveHalf)}.`,
          ),
          h(
            "small",
            null,
            `${fmt(index)} partes iguales: `,
            ...Array.from({ length: index }, () =>
              h("span", null, fmt(additiveHalf), " + "),
            ),
            "= ",
            fmt(x),
          ),
        ],
      ],
      [
        "Escala multiplicativa",
        [
          h(
            "p",
            null,
            `1 → ${fmt(root, 4)} → ${fmt(x)} · cada etapa multiplica por ${fmt(root, 4)}.`,
          ),
          h(
            "small",
            null,
            `${fmt(x)}^`,
            frac(String(m), String(index)),
            " = (",
            fmt(root, 4),
            ")^",
            fmt(m),
            " = ",
            fmt(root ** m, 4),
          ),
        ],
      ],
    ];
    predictionButton.setAttribute("aria-pressed", String(prediction));
    predictionButton.textContent = prediction
      ? "Ocultar comparación de mitades"
      : "Adiviná dónde cae la mitad multiplicativa";
    const additiveMiddle = x / index;
    readouts.push([
      "Predicción frente al factor real",
      [
        h(
          "p",
          null,
          prediction
            ? `El punto aditivo ${fmt(additiveMiddle)} repetido ${fmt(index)} veces da ${fmt(additiveMiddle ** index)}; el factor real ${fmt(root, 4)} repetido ${fmt(index)} veces reconstruye ${fmt(x)}.`
            : `Antes de revelar, compará ${fmt(additiveMiddle)} como punto aditivo con el factor que repetido ${fmt(index)} veces debe reconstruir ${fmt(x)}.`,
        ),
        h(
          "small",
          null,
          prediction
            ? "La mitad aditiva divide una cantidad; la mitad multiplicativa busca una escala repetible."
            : "Tocá el botón para comprobar ambas predicciones sin cambiar la altura de esta tarjeta.",
        ),
      ],
    ]);
    renderReadout(board.readout, "Los saltos se pueden leer y reconstruir", readouts);
  };
  connect(state, (value) => value, render);
  return board;
}
