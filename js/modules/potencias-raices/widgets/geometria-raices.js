/** Construye y desarma medidas geométricas; el lado modifica las tres figuras. */
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
  setVisible,
  setText,
  renderReadout,
  fmt,
} from "./board-kit.js";

export function initGeometriaRaicesWidget(host) {
  const board = createBoard(
    host,
    "Línea, cuadrado y cubo con medidas a escala",
    "0 0 640 270",
  );
  const state = createStore({ value: 4, dimension: 2, mode: 0 });
  const valueControl = addRange(
    board.controls,
    state,
    "value",
    "Entrada (lado, área o volumen)",
    1,
    6,
    4,
  );
  const chooseDimension = addChips(
    board.controls,
    [
      [1, "1D · Segmento"],
      [2, "2D · Cuadrado"],
      [3, "3D · Cubo isométrico"],
    ],
    2,
    (dimension) => state.set({ dimension }),
    "Dimensión geométrica",
  );
  const chooseMode = addChips(
    board.controls,
    [
      [0, "Construir · potencia"],
      [1, "Colapsar a 1D · raíz"],
    ],
    0,
    (mode) => state.set({ mode }),
    "Sentido de la operación",
  );

  const collapsePreset = h(
    "select",
    { "aria-label": "Elegir área o volumen conocido", hidden: true },
    h("option", { value: "" }, "Elegí un dato conocido"),
    ...[
      ["2:9", "Área 9 u² → lado 3"],
      ["2:16", "Área 16 u² → lado 4"],
      ["2:25", "Área 25 u² → lado 5"],
      ["2:36", "Área 36 u² → lado 6"],
      ["2:49", "Área 49 u² → lado 7"],
      ["2:64", "Área 64 u² → lado 8"],
      ["3:8", "Volumen 8 u³ → arista 2"],
      ["3:27", "Volumen 27 u³ → arista 3"],
      ["3:64", "Volumen 64 u³ → arista 4"],
      ["3:125", "Volumen 125 u³ → arista 5"],
      ["3:216", "Volumen 216 u³ → arista 6"],
    ].map(([value, label]) => h("option", { value }, label)),
  );
  collapsePreset.addEventListener("change", () => {
    if (!collapsePreset.value) return;
    const [dimension, value] = collapsePreset.value.split(":").map(Number);
    state.set({ dimension, value, mode: 1 });
  });
  board.controls.append(
    h(
      "label",
      { class: "field seq-control", hidden: true },
      h("span", { class: "field__label" }, "Dato para invertir con una raíz"),
      collapsePreset,
    ),
  );
  const presetLabel = collapsePreset.parentElement;

  svgText(board.drawing, 110, 24, "1D · SEGMENTO L", {
    fill: "var(--blue)",
    "font-weight": "bold",
    "text-anchor": "middle",
  });
  svgText(board.drawing, 320, 24, "2D · CUADRADO L²", {
    fill: "var(--yellow)",
    "font-weight": "bold",
    "text-anchor": "middle",
  });
  svgText(board.drawing, 520, 24, "3D · CUBO L³", {
    fill: "var(--green)",
    "font-weight": "bold",
    "text-anchor": "middle",
  });

  const activeHalo = s("rect", {
    x: 12,
    y: 32,
    width: 196,
    height: 222,
    rx: 10,
    fill: "none",
    stroke: "var(--yellow)",
    "stroke-width": 3,
  });
  board.drawing.append(activeHalo);
  const guide = svgPath(board.drawing, "M20 204 H200", {
    stroke: "var(--blue)",
    "stroke-width": 3,
  });
  const rulerTicks = [];
  const rulerLabels = [];
  for (let unit = 0; unit <= 8; unit += 1) {
    const x = 20 + unit * 22;
    rulerTicks.push(
      svgPath(board.drawing, `M${x} 194 V214`, {
        stroke: "var(--blue)",
        "stroke-width": unit ? 1 : 3,
      }),
    );
    rulerLabels.push(
      svgText(board.drawing, x, 228, String(unit), { "text-anchor": "middle" }),
    );
  }
  const rulerEnd = s("circle", {
    cx: 166,
    cy: 204,
    r: 8,
    fill: "var(--green)",
  });
  board.drawing.append(rulerEnd);
  const rulerCaption = svgText(board.drawing, 20, 178, "Longitud en unidades", {
    fill: "var(--blue)",
  });

  const gridTiles = [];
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const tile = s("rect", {
      x: 232 + column * 22,
      y: 50 + row * 22,
      width: 20,
      height: 20,
        rx: 2,
        fill: "var(--yellow)",
        "fill-opacity": ".55",
        stroke: "var(--bg)",
        "stroke-width": 1,
      });
      board.drawing.append(tile);
      gridTiles.push({ tile, row, column });
    }
  }
  const squareFrame = svgPath(board.drawing, "", {
    stroke: "var(--yellow)",
    "stroke-width": 3,
  });
  const areaLabel = svgText(board.drawing, 238, 40, "", {
    fill: "var(--yellow)",
    "font-weight": "bold",
  });
  const widthMeasure = svgPath(board.drawing, "", {
    stroke: "var(--ink)",
    "stroke-width": 1.5,
  });
  const heightMeasure = svgPath(board.drawing, "", {
    stroke: "var(--ink)",
    "stroke-width": 1.5,
  });

  const cubeFaces = [
    s("polygon", {
      points: "",
      fill: "var(--yellow)",
      "fill-opacity": ".42",
      stroke: "var(--yellow)",
      "stroke-width": 2,
    }),
    s("polygon", {
      points: "",
      fill: "var(--blue)",
      "fill-opacity": ".30",
      stroke: "var(--blue)",
      "stroke-width": 2,
    }),
    s("polygon", {
      points: "",
      fill: "var(--green)",
      "fill-opacity": ".28",
      stroke: "var(--green)",
      "stroke-width": 2,
    }),
  ];
  cubeFaces.forEach((face) => board.drawing.append(face));
  const cubeGrid = [];
  for (let line = 1; line < 8; line += 1) {
    for (let face = 0; face < 3; face += 1) {
      cubeGrid.push({
        face,
        line,
        path: svgPath(board.drawing, "", {
          stroke: "var(--ink)",
          "stroke-width": 0.8,
          opacity: ".8",
        }),
      });
    }
  }
  const cubeLabel = svgText(board.drawing, 470, 40, "", {
    fill: "var(--green)",
    "font-weight": "bold",
  });

  const render = ({ value, dimension, mode }) => {
    chooseDimension(dimension);
    chooseMode(mode);
    const side = mode
      ? dimension === 2
        ? Math.sqrt(value)
        : dimension === 3
          ? Math.cbrt(value)
          : value
      : value;
    const units = Math.min(mode ? 8 : 6, Math.max(1, side));
    const controlMaximum = mode ? dimension === 2 ? 64 : dimension === 3 ? 216 : 6 : 6;
    valueControl.input.max = String(controlMaximum);
    valueControl.input.min = "1";
    collapsePreset.hidden = !mode;
    presetLabel.hidden = !mode;
    const presetKey = `${dimension}:${value}`;
    collapsePreset.value = Array.from(collapsePreset.options).some(
      (option) => option.value === presetKey,
    )
      ? presetKey
      : "";
    valueControl.input.value = String(value);
    valueControl.output.textContent = fmt(value);
    rulerTicks.forEach((tick, index) =>
      setVisible(tick, index <= Math.floor(units)),
    );
    rulerLabels.forEach((label, index) =>
      setVisible(label, index <= Math.floor(units)),
    );
    setVisible(guide, true);
    setVisible(rulerEnd, true);
    setVisible(rulerCaption, true);
    const dimensionOpacity = (target) => (dimension === target ? "1" : ".78");
    const halo = {
      1: { x: 12, y: 32, width: 196, height: 222, stroke: "var(--blue)" },
      2: { x: 220, y: 32, width: 200, height: 222, stroke: "var(--yellow)" },
      3: { x: 428, y: 32, width: 200, height: 222, stroke: "var(--green)" },
    }[dimension];
    Object.entries(halo).forEach(([key, entry]) => activeHalo.setAttribute(key, String(entry)));
    [guide, rulerEnd, rulerCaption, ...rulerTicks, ...rulerLabels].forEach(
      (node) => node.setAttribute("opacity", dimensionOpacity(1)),
    );
    const tileCount = Math.floor(units) ** 2;
    gridTiles.forEach(({ tile, row, column }) =>
      setVisible(tile, row < units && column < units),
    );
    [squareFrame, areaLabel, widthMeasure, heightMeasure, ...gridTiles.map(({ tile }) => tile)].forEach(
      (node) => node.setAttribute("opacity", dimensionOpacity(2)),
    );
    setVisible(squareFrame, true);
    setVisible(areaLabel, true);
    setVisible(widthMeasure, true);
    setVisible(heightMeasure, true);
    const squareSide = units * 22;
    const squareStart = 320 - squareSide / 2;
    gridTiles.forEach(({ tile, row, column }) => {
      tile.setAttribute("x", String(squareStart + column * 22));
      tile.setAttribute("y", String(50 + row * 22));
    });
    squareFrame.setAttribute(
      "d",
      `M${squareStart} 50 H${squareStart + squareSide} V${50 + squareSide} H${squareStart} Z`,
    );
    areaLabel.setAttribute("x", "320");
    areaLabel.setAttribute("text-anchor", "middle");
    setText(areaLabel, `Área = ${fmt(units)}² = ${fmt(units ** 2)} u²`);
    widthMeasure.setAttribute(
      "d",
      `M${squareStart} ${58 + squareSide} H${squareStart + squareSide}`,
    );
    heightMeasure.setAttribute(
      "d",
      `M${squareStart + squareSide + 8} 50 V${50 + squareSide}`,
    );
    gridTiles.forEach(({ tile, row, column }) =>
      tile.setAttribute("fill-opacity", (row + column) % 2 ? ".50" : ".75"),
    );

    const size = units * 13;
    const A = { x: 454, y: 220 };
    const B = { x: A.x + size, y: A.y };
    const C = { x: B.x + size * 0.42, y: B.y - size * 0.28 };
    const D = { x: A.x + size * 0.42, y: A.y - size * 0.28 };
    const A2 = { x: A.x, y: A.y - size };
    const B2 = { x: B.x, y: B.y - size };
    const C2 = { x: C.x, y: C.y - size };
    const D2 = { x: D.x, y: D.y - size };
    const pointString = (...points) =>
      points.map(({ x, y }) => `${x},${y}`).join(" ");
    cubeFaces[0].setAttribute("points", pointString(A2, D2, C2, B2));
    cubeFaces[1].setAttribute("points", pointString(A, A2, B2, B));
    cubeFaces[2].setAttribute("points", pointString(B, B2, C2, C));
    cubeFaces.forEach((face) => {
      setVisible(face, true);
      face.setAttribute("opacity", dimensionOpacity(3));
    });
    cubeGrid.forEach(({ face, line, path }) => {
      const ratio = line / units;
      let d = "";
      if (face === 0)
        d = `M${A2.x + size * ratio} ${A2.y} L${D2.x + size * ratio * 0.42} ${D2.y}`;
      if (face === 1) d = `M${A.x + size * ratio} ${A.y} V${A2.y}`;
      if (face === 2)
        d = `M${B.x + size * 0.42 * ratio} ${B.y - size * 0.28 * ratio} L${B2.x + size * 0.42 * ratio} ${B2.y - size * 0.28 * ratio}`;
      path.setAttribute("d", d);
      setVisible(path, line < units);
      path.setAttribute("opacity", dimensionOpacity(3));
    });
    setVisible(cubeLabel, true);
    cubeLabel.setAttribute("opacity", dimensionOpacity(3));
    cubeLabel.setAttribute("x", String(D2.x));
    setText(cubeLabel, `Volumen = ${fmt(units)}³ = ${fmt(units ** 3)} u³`);
    rulerEnd.setAttribute("cx", String(20 + units * 22));
    rulerEnd.setAttribute("opacity", dimensionOpacity(1));
    rulerCaption.setAttribute("x", "20");
    setText(rulerCaption, `L = ${fmt(units)} u`);
    renderReadout(
      board.readout,
      mode
        ? "La raíz invierte el salto dimensional"
        : "Una misma medida, distintas dimensiones",
      [
        [
          "1D · longitud",
          [
            h("p", null, `L = ${fmt(side, 3)} u`),
            h("small", null, "La regla muestra unidades de longitud."),
          ],
        ],
        [
          "2D · área",
          [
            h("p", null, `L × L = ${fmt(units ** 2)} u²`),
            h(
              "small",
              null,
              mode
                ? `√${fmt(value)} = ${fmt(side, 3)} unidades de lado.`
                : "Cada baldosa representa una unidad cuadrada.",
            ),
          ],
        ],
        [
          "3D · volumen",
          [
            h("p", null, `L × L × L = ${fmt(units ** 3)} u³`),
            h(
              "small",
              null,
              mode
                ? `∛${fmt(value)} = ${fmt(side, 3)} unidades de arista.`
                : "Las tres caras visibles comparten una arista de longitud L.",
            ),
          ],
        ],
      ],
    );
  };
  connect(state, (value) => value, render);
  return board;
}
