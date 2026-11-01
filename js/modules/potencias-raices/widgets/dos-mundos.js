/** Cinta doble: cada contador conserva el origen de su operación. */
import {
  h,
  s,
  createBoard,
  createStore,
  connect,
  addRange,
  addChips,
  svgText,
  svgPath,
  setText,
  setVisible,
  renderReadout,
  fmt,
} from "./board-kit.js";

export function initDosMundosWidget(host) {
  const board = createBoard(
    host,
    "Cinta aditiva y multiplicativa",
    "0 0 640 330",
  );
  const state = createStore({ a: 2, n: 0 });
  const chooseBase = addChips(
    board.controls,
    [
      [2, "a = 2"],
      [3, "a = 3"],
      [4, "a = 4"],
      [5, "a = 5"],
      [10, "a = 10"],
    ],
    2,
    (a) => state.set({ a }),
    "Base de las cintas",
  );
  addRange(board.controls, state, "n", "Pasos n", 0, 5, 0);

  const titleAdd = svgText(
    board.drawing,
    22,
    34,
    "MUNDO ADITIVO · empieza en 0",
    { fill: "var(--blue)", "font-weight": "bold" },
  );
  const titleMul = svgText(
    board.drawing,
    22,
    180,
    "MUNDO MULTIPLICATIVO · empieza en 1",
    { fill: "var(--yellow)", "font-weight": "bold" },
  );
  const additiveRail = svgPath(board.drawing, "M48 100 H590", {
    stroke: "var(--blue)",
    "stroke-width": 3,
  });
  const multiplicativeRail = svgPath(board.drawing, "M48 248 H590", {
    stroke: "var(--yellow)",
    "stroke-width": 3,
  });
  const additive = [];
  const multiplicative = [];
  const additiveArcs = [];
  const multiplicativeArcs = [];

  for (let step = 0; step <= 5; step += 1) {
    const x = 52 + step * 104;
    const addDot = s("circle", {
      cx: x,
      cy: 100,
      r: 10,
      fill: step === 0 ? "var(--blue)" : "var(--surface)",
      stroke: "var(--blue)",
      "stroke-width": 3,
    });
    const mulDot = s("circle", {
      cx: x,
      cy: 248,
      r: 11,
      fill: step === 0 ? "var(--green)" : "var(--surface)",
      stroke: step === 0 ? "var(--green)" : "var(--yellow)",
      "stroke-width": 3,
    });
    const addValue = svgText(board.drawing, x, 132, step === 0 ? "0" : "", {
      "text-anchor": "middle",
    });
    const mulValue = svgText(board.drawing, x, 284, step === 0 ? "1" : "", {
      "text-anchor": "middle",
    });
    additive.push({ dot: addDot, value: addValue });
    multiplicative.push({ dot: mulDot, value: mulValue });
    board.drawing.append(addDot, mulDot);
    if (step < 5) {
      const nextX = x + 104;
      const addArc = svgPath(
        board.drawing,
        `M${x} 100 Q${x + 52} 74 ${nextX} 100`,
        { stroke: "var(--blue)", "stroke-width": 2 },
      );
      const mulArc = svgPath(
        board.drawing,
        `M${x} 248 Q${x + 52} 220 ${nextX} 248`,
        { stroke: "var(--yellow)", "stroke-width": 2 },
      );
      const addLabel = svgText(board.drawing, x + 40, 83, "+a", {
        fill: "var(--blue)",
      });
      const mulLabel = svgText(board.drawing, x + 36, 231, "×a", {
        fill: "var(--yellow)",
      });
      additiveArcs.push({ path: addArc, label: addLabel });
      multiplicativeArcs.push({ path: mulArc, label: mulLabel });
    }
  }

  const render = ({ a, n }) => {
    chooseBase(a);
    additive.forEach(({ dot, value }, index) => {
      const active = index <= n;
      setVisible(dot, active);
      setVisible(value, active);
      setText(value, index === 0 ? "0" : fmt(index * a));
      dot.setAttribute("fill", index === 0 ? "var(--blue)" : "var(--surface)");
    });
    multiplicative.forEach(({ dot, value }, index) => {
      const active = index <= n;
      setVisible(dot, active);
      setVisible(value, active);
      setText(value, index === 0 ? "1" : fmt(a ** index));
      dot.setAttribute("fill", index === 0 ? "var(--green)" : "var(--surface)");
      dot.setAttribute(
        "stroke",
        index === 0 ? "var(--green)" : "var(--yellow)",
      );
    });
    additiveArcs.forEach(({ path, label }, index) => {
      setVisible(path, index < n);
      setVisible(label, index < n);
      setText(label, `+${fmt(a)}`);
    });
    multiplicativeArcs.forEach(({ path, label }, index) => {
      setVisible(path, index < n);
      setVisible(label, index < n);
      setText(label, `×${fmt(a)}`);
    });
    const addTerms = n ? Array(n).fill(fmt(a)).join(" + ") : "sin sumandos";
    const mulTerms = n ? Array(n).fill(fmt(a)).join(" · ") : "sin factores";
    renderReadout(board.readout, "Dos contadores, dos respuestas", [
      [
        "Azul · suma",
        [
          h("p", null, `0 + ${addTerms} = ${fmt(a * n)}`),
          h(
            "small",
            null,
            n
              ? `La multiplicación a · n cuenta ${fmt(n)} sumandos.`
              : "Cero saltos dejan el origen aditivo en 0.",
          ),
        ],
      ],
      [
        "Amarillo · escala",
        [
          h("p", null, `1 · ${mulTerms} = ${fmt(a ** n)}`),
          h(
            "small",
            null,
            n
              ? `La potencia aⁿ cuenta ${fmt(n)} factores.`
              : "Cero cambios dejan el neutro multiplicativo en 1.",
          ),
        ],
      ],
    ]);
  };
  connect(state, (value) => value, render);
  return board;
}
