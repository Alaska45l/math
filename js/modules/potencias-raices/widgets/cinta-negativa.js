/** Laboratorio de retroceso: dividir desde 1 siempre conserva signo positivo. */
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
  frac,
} from "./board-kit.js";

export function initCintaNegativaWidget(host) {
  const board = createBoard(
    host,
    "Retroceso multiplicativo y lupa de escala",
    "0 0 640 360",
  );
  const state = createStore({ a: 2, n: -4, mode: 0 });
  const chooseBase = addChips(
    board.controls,
    [
      [2, "Base 2"],
      [3, "Base 3"],
      [5, "Base 5"],
    ],
    2,
    (a) => state.set({ a }),
    "Base de la potencia",
  );
  addRange(board.controls, state, "n", "Exponente entero n", -4, 4, -4);
  const chooseMode = addChips(
    board.controls,
    [
      [0, "Modo 1 · dividir desde 1"],
      [1, "Modo 2 · multiplicar por el inverso"],
    ],
    0,
    (mode) => state.set({ mode }),
    "Interpretación del exponente negativo",
  );

  svgText(
    board.drawing,
    22,
    30,
    "Recta numérica · el cero queda a la izquierda",
    { fill: "var(--muted)" },
  );
  const numberLine = svgPath(board.drawing, "M55 88 H590", {
    stroke: "var(--ink)",
    "stroke-width": 2,
  });
  const zeroTick = svgPath(board.drawing, "M55 78 V98", {
    stroke: "var(--pink)",
    "stroke-width": 3,
  });
  svgText(board.drawing, 48, 116, "0", {
    fill: "var(--pink)",
    "font-weight": "bold",
  });
  const ticks = [];
  const values = [];
  const markers = [];
  for (let step = 0; step <= 4; step += 1) {
    const x = 80 + step * 112;
    ticks.push(
      svgPath(board.drawing, `M${x} 80 V96`, {
        stroke: "var(--muted)",
        "stroke-width": 1.5,
      }),
    );
    values.push(svgText(board.drawing, x - 18, 117, ""));
    markers.push(s("circle", { cx: x, cy: 88, r: 7, fill: "var(--green)" }));
    board.drawing.append(markers[step]);
  }

  svgText(
    board.drawing,
    22,
    158,
    "Zoom de las divisiones sucesivas dentro de (0; 1]",
    { fill: "var(--yellow)" },
  );
  const barLabels = [];
  const bars = [];
  const barValues = [];
  for (let step = 0; step <= 4; step += 1) {
    const y = 184 + step * 31;
    barLabels.push(svgText(board.drawing, 22, y + 16, ""));
    const bar = s("rect", {
      x: 105,
      y,
      width: 410,
      height: 20,
      rx: 4,
      fill: step === 0 ? "var(--green)" : "var(--yellow)",
      opacity: step === 0 ? 0.7 : 0.55,
    });
    board.drawing.append(bar);
    bars.push(bar);
    barValues.push(svgText(board.drawing, 548, y + 16, ""));
  }
  const lens = s("circle", {
    cx: 80,
    cy: 88,
    r: 25,
    fill: "var(--yellow)",
    "fill-opacity": ".12",
    stroke: "var(--green)",
    "stroke-width": 3,
  });
  board.drawing.append(lens);

  const render = ({ a, n, mode }) => {
    chooseBase(a);
    chooseMode(mode);
    const depth = Math.abs(n);
    ticks.forEach((tick, index) => {
      tick.setAttribute(
        "stroke",
        index <= depth ? "var(--green)" : "var(--muted)",
      );
      setText(
        values[index],
        index <= depth ? fmt(a ** (n < 0 ? -index : index), 6) : "",
      );
      setVisible(markers[index], index <= depth);
      markers[index].setAttribute("cx", String(80 + 112 * index));
    });
    bars.forEach((bar, index) => {
      const visible = index <= depth && n < 0;
      setVisible(bar, visible);
      setVisible(barLabels[index], visible);
      setVisible(barValues[index], visible);
      const width = Math.max(6, 410 / a ** index);
      bar.setAttribute("width", String(width));
      setText(barValues[index], visible ? fmt(a ** -index, 6) : "");
      setText(
        barLabels[index],
        ["Inicio (1)", "Paso 1", "Paso 2", "Paso 3", "Paso 4"][index],
      );
    });
    setVisible(lens, n < 0);
    lens.setAttribute("cx", String(80 + 112 * depth));
    const result = a ** n;
    const divisions =
      Array(depth)
        .fill(`: ${fmt(a)}`)
        .join(" ") || "sin pasos";
    const reciprocal = frac("1", String(a));
    renderReadout(
      board.readout,
      n < 0 ? "La lupa acerca sin cruzar el cero" : "Avance desde el neutro",
      [
        [
          mode ? "Producto por el inverso" : "División desde uno",
          [
            h(
              "p",
              null,
              mode
                ? h(
                    "span",
                    null,
                    "1 · ",
                    ...Array.from({ length: depth }, () =>
                      h("span", null, reciprocal, " · "),
                    ),
                    " = ",
                    fmt(result, 6),
                  )
                : `1 ${divisions} = ${fmt(result, 6)}`,
            ),
            h(
              "small",
              null,
              n < 0
                ? "Cada paso divide una cantidad positiva; la sucesión se acerca a 0 sin volverse negativa."
                : "El signo del exponente cuenta el sentido de los cambios, no el signo del resultado.",
            ),
          ],
        ],
        [
          "Lectura algebraica",
          [
            h(
              "p",
              null,
              n < 0
                ? h(
                    "span",
                    null,
                    `${fmt(a)}⁻${fmt(depth)} = `,
                    frac("1", `${fmt(a)}${depth ? `^${fmt(depth)}` : ""}`),
                    " = ",
                    fmt(result, 6),
                  )
                : `${fmt(a)}^${fmt(n)} = ${fmt(result, 6)}`,
            ),
            h(
              "small",
              null,
              "La barra unitaria se divide sucesivamente; el resultado pertenece a los reales positivos.",
            ),
          ],
        ],
      ],
    );
  };
  connect(state, (value) => value, render);
  return board;
}
