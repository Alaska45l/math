/** Construye y desarma medidas geométricas con las tres dimensiones visibles. */
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

const ROOT_CASES = [
  [3, "Área 9 → √9 = 3"],
  [4, "Área 16 → √16 = 4"],
  [5, "Área 25 → √25 = 5"],
  [6, "Área 36 → √36 = 6"],
  [2, "Vol 8 → ∛8 = 2"],
  [3, "Vol 27 → ∛27 = 3"],
  [4, "Vol 64 → ∛64 = 4"],
  [5, "Vol 125 → ∛125 = 5"],
  [6, "Vol 216 → ∛216 = 6"],
];

export function initGeometriaRaicesWidget(host) {
  const board = createBoard(
    host,
    "Línea, cuadrado y cubo con medidas a escala",
    "0 0 640 285",
  );
  const state = createStore({ side: 4, mode: 0 });
  const sideControl = addRange(
    board.controls,
    state,
    "side",
    "Lado L",
    1,
    6,
    4,
  );
  const chooseMode = addChips(
    board.controls,
    [
      [0, "Construir · potencia (L → L², L³)"],
      [1, "Extraer raíz · colapsar a 1D (√A, ∛V → L)"],
    ],
    0,
    (mode) => state.set({ mode }),
    "Sentido de la operación",
  );
  const chooseCase = addChips(
    board.controls,
    ROOT_CASES.map(([side, label], index) => [index, label]),
    "",
    (caseIndex) => state.set({ side: ROOT_CASES[caseIndex][0], mode: 1 }),
    "Casos exactos para extraer raíz",
  );

  const title = (x, text, fill) =>
    svgText(board.drawing, x, 24, text, {
      fill,
      "font-size": 15,
      "font-weight": "bold",
      "text-anchor": "middle",
    });
  title(110, "1D · SEGMENTO", "var(--blue)");
  title(320, "2D · CUADRADO", "var(--yellow)");
  title(530, "3D · CUBO", "var(--green)");
  const subtitle1 = svgText(board.drawing, 110, 48, "", {
    fill: "var(--blue)",
    "font-size": 15,
    "text-anchor": "middle",
  });
  const subtitle2 = svgText(board.drawing, 320, 48, "", {
    fill: "var(--yellow)",
    "font-size": 15,
    "text-anchor": "middle",
  });
  const subtitle3 = svgText(board.drawing, 530, 48, "", {
    fill: "var(--green)",
    "font-size": 15,
    "text-anchor": "middle",
  });

  const guide = svgPath(board.drawing, "M32 192 H190", {
    stroke: "var(--blue)",
    "stroke-width": 3,
  });
  const rulerTicks = [];
  const rulerLabels = [];
  for (let unit = 0; unit <= 6; unit += 1) {
    const x = 40 + unit * 24;
    rulerTicks.push(
      svgPath(board.drawing, `M${x} 182 V202`, {
        stroke: "var(--blue)",
        "stroke-width": unit ? 1 : 3,
      }),
    );
    rulerLabels.push(
      svgText(board.drawing, x, 221, String(unit), {
        fill: "var(--blue)",
        "text-anchor": "middle",
      }),
    );
  }
  const rulerEnd = s("circle", { cx: 136, cy: 192, r: 8, fill: "var(--blue)" });
  board.drawing.append(rulerEnd);

  const gridTiles = [];
  for (let row = 0; row < 6; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      const tile = s("rect", {
        x: 250,
        y: 68,
        width: 22,
        height: 22,
        rx: 2,
        fill: "var(--yellow)",
        "fill-opacity": ".7",
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

  const cubeFaces = [
    s("polygon", { points: "", fill: "var(--green)", "fill-opacity": ".58", stroke: "var(--green)", "stroke-width": 2 }),
    s("polygon", { points: "", fill: "var(--blue)", "fill-opacity": ".42", stroke: "var(--green)", "stroke-width": 2 }),
    s("polygon", { points: "", fill: "var(--yellow)", "fill-opacity": ".42", stroke: "var(--green)", "stroke-width": 2 }),
  ];
  cubeFaces.forEach((face) => board.drawing.append(face));
  const cubeGrid = [];
  for (let line = 1; line < 6; line += 1) {
    for (let face = 0; face < 3; face += 1) {
      cubeGrid.push({
        face,
        line,
        path: svgPath(board.drawing, "", {
          stroke: "var(--bg)",
          "stroke-width": 1,
          opacity: ".82",
        }),
      });
    }
  }

  const render = ({ side, mode }) => {
    chooseMode(mode);
    chooseCase("__none__");
    sideControl.input.value = String(side);
    sideControl.output.textContent = fmt(side);
    setText(subtitle1, `L = ${fmt(side)} u`);
    setText(subtitle2, `Área = ${fmt(side ** 2)} u²`);
    setText(subtitle3, `Volumen = ${fmt(side ** 3)} u³`);
    rulerTicks.forEach((tick, index) => setVisible(tick, index <= side));
    rulerLabels.forEach((label, index) => setVisible(label, index <= side));
    rulerEnd.setAttribute("cx", String(40 + side * 24));
    const tileSize = 22;
    const squareSide = side * tileSize;
    const squareStart = 320 - squareSide / 2;
    gridTiles.forEach(({ tile, row, column }) => {
      setVisible(tile, row < side && column < side);
      tile.setAttribute("x", String(squareStart + column * tileSize));
      tile.setAttribute("y", String(68 + row * tileSize));
      tile.setAttribute("fill-opacity", (row + column) % 2 ? ".58" : ".82");
    });
    squareFrame.setAttribute(
      "d",
      `M${squareStart} 68 H${squareStart + squareSide} V${68 + squareSide} H${squareStart} Z`,
    );
    const size = side * 15;
    const A = { x: 478, y: 224 };
    const B = { x: A.x + size, y: A.y };
    const C = { x: B.x + size * 0.42, y: B.y - size * 0.28 };
    const D = { x: A.x + size * 0.42, y: A.y - size * 0.28 };
    const A2 = { x: A.x, y: A.y - size };
    const B2 = { x: B.x, y: B.y - size };
    const C2 = { x: C.x, y: C.y - size };
    const D2 = { x: D.x, y: D.y - size };
    const points = (...items) => items.map(({ x, y }) => `${x},${y}`).join(" ");
    cubeFaces[0].setAttribute("points", points(A2, D2, C2, B2));
    cubeFaces[1].setAttribute("points", points(A, A2, B2, B));
    cubeFaces[2].setAttribute("points", points(B, B2, C2, C));
    cubeGrid.forEach(({ face, line, path }) => {
      const ratio = line / side;
      let d = "";
      if (face === 0) d = `M${A2.x + size * ratio} ${A2.y} L${D2.x + size * ratio * .42} ${D2.y}`;
      if (face === 1) d = `M${A.x + size * ratio} ${A.y} V${A2.y}`;
      if (face === 2) d = `M${B.x + size * .42 * ratio} ${B.y - size * .28 * ratio} L${B2.x + size * .42 * ratio} ${B2.y - size * .28 * ratio}`;
      path.setAttribute("d", d);
      setVisible(path, line < side);
    });
    renderReadout(
      board.readout,
      mode ? "Extraer una raíz devuelve el lado" : "Una medida construye tres dimensiones",
      [
        ["1D · longitud", [h("p", null, `L = ${fmt(side)} u`), h("small", null, "Una sola dirección mide longitud.")]],
        ["2D · área", [h("p", null, `${fmt(side)} · ${fmt(side)} = ${fmt(side ** 2)} u²`), h("small", null, mode ? `√${fmt(side ** 2)} = ${fmt(side)} u` : "El cuadrado cuenta baldosas.")]],
        ["3D · volumen", [h("p", null, `${fmt(side)} · ${fmt(side)} · ${fmt(side)} = ${fmt(side ** 3)} u³`), h("small", null, mode ? `∛${fmt(side ** 3)} = ${fmt(side)} u` : "El cubo cuenta cubitos.")]],
      ],
    );
  };
  connect(state, (value) => value, render);
  return board;
}
