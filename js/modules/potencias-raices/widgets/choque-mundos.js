/** Mosaico binomial y triángulo: áreas cruzadas y diagonal visibles. */
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
  setText,
  renderReadout,
  fmt,
} from "./board-kit.js";

export function initChoqueMundosWidget(host) {
  const board = createBoard(
    host,
    "Cuadrado binomial y teorema de Pitágoras",
    "0 0 640 360",
  );
  const state = createStore({ a: 4, b: 3, mode: 0, reveal: false });
  const aControl = addRange(board.controls, state, "a", "Lado a", 1, 8, 4);
  const bControl = addRange(board.controls, state, "b", "Lado b", 1, 8, 3);
  const modeSelect = addSelect(
    board.controls,
    state,
    "mode",
    "Exploración",
    [
      [0, "(a + b)² · suma"],
      [1, "[a + (−b)]² · resta"],
      [2, "√(a² + b²) · Pitágoras"],
    ],
    0,
  );
  const errorButton = h(
    "button",
    {
      type: "button",
      class: "chip",
      on: { click: () => state.set({ reveal: !state.get().reveal }) },
      "aria-pressed": "false",
    },
    "Simular la falsa distributiva a² + b²",
  );
  board.actions.append(errorButton);

  const squareTitle = svgText(board.drawing, 320, 28, "CUADRADO DE UN BINOMIO · CUATRO REGIONES", {
    fill: "var(--yellow)",
    "font-weight": "bold",
    "text-anchor": "middle",
  });
  const squareRegions = [];
  for (let index = 0; index < 4; index += 1) {
    const rect = s("rect", {
      x: 50,
      y: 60,
      width: 20,
      height: 20,
      rx: 2,
      fill: index === 0 || index === 3 ? "var(--yellow)" : "var(--blue)",
      "fill-opacity": ".35",
      stroke: "var(--ink)",
      "stroke-width": 2,
    });
    board.drawing.append(rect);
    const label = svgText(board.drawing, 60, 75, "", {
      "text-anchor": "middle",
      "font-weight": "bold",
    });
    squareRegions.push({ rect, label });
  }
  const missingHatch = [];
  for (let index = 0; index < 12; index += 1)
    missingHatch.push(
      svgPath(board.drawing, "", {
        stroke: "var(--pink)",
        "stroke-width": 2,
        "stroke-dasharray": "5 4",
      }),
    );
  const squareOutline = svgPath(board.drawing, "", {
    stroke: "var(--ink)",
    "stroke-width": 2.5,
  });
  const dimensionTop = svgText(board.drawing, 160, 52, "", {
    "text-anchor": "middle",
    fill: "var(--muted)",
  });
  const dimensionSide = svgText(board.drawing, 34, 160, "", {
    fill: "var(--muted)",
  });

  const triangleTitle = svgText(board.drawing, 320, 28, "CAMINO POR CATETOS VS. DIAGONAL", {
    fill: "var(--yellow)",
    "font-weight": "bold",
    "text-anchor": "middle",
  });
  const legA = svgPath(board.drawing, "", {
    stroke: "var(--blue)",
    "stroke-width": 5,
  });
  const legB = svgPath(board.drawing, "", {
    stroke: "var(--blue)",
    "stroke-width": 5,
  });
  const hypotenuse = svgPath(board.drawing, "", {
    stroke: "var(--yellow)",
    "stroke-width": 5,
  });
  const triangleGuide = svgPath(board.drawing, "", {
    stroke: "var(--muted)",
    "stroke-width": 1,
    "stroke-dasharray": "4 4",
  });
  const labelA = svgText(board.drawing, 0, 0, "", { fill: "var(--blue)" });
  const labelB = svgText(board.drawing, 0, 0, "", { fill: "var(--blue)" });
  const labelHyp = svgText(board.drawing, 0, 0, "", { fill: "var(--yellow)" });

  const render = ({ a, b, mode, reveal }) => {
    aControl.input.value = String(a);
    aControl.output.textContent = fmt(a);
    bControl.input.value = String(b);
    bControl.output.textContent = fmt(b);
    modeSelect.value = String(mode);
    const sign = mode === 1 ? -1 : 1;
    const scale = Math.min(24, 240 / (a + b));
    const left = 180;
    const top = 72;
    const wA = a * scale;
    const wB = b * scale;
    const xSplit = left + wA;
    const ySplit = top + wA;
    const layouts = [
      {
        x: left,
        y: top,
        w: wA,
        h: wA,
        label: `a² = ${fmt(a * a)}`,
        color: "var(--yellow)",
      },
      {
        x: xSplit,
        y: top,
        w: wB,
        h: wA,
        label: `${sign < 0 ? "−" : ""}ab = ${fmt(sign * a * b)}`,
        color: sign < 0 ? "var(--pink)" : "var(--blue)",
      },
      {
        x: left,
        y: ySplit,
        w: wA,
        h: wB,
        label: `${sign < 0 ? "−" : ""}ab = ${fmt(sign * a * b)}`,
        color: sign < 0 ? "var(--pink)" : "var(--blue)",
      },
      {
        x: xSplit,
        y: ySplit,
        w: wB,
        h: wB,
        label: `b² = ${fmt(b * b)}`,
        color: "var(--yellow)",
      },
    ];
    squareRegions.forEach(({ rect, label }, index) => {
      const region = layouts[index];
      rect.setAttribute("x", String(region.x));
      rect.setAttribute("y", String(region.y));
      rect.setAttribute("width", String(region.w));
      rect.setAttribute("height", String(region.h));
      rect.setAttribute("fill", region.color);
      rect.setAttribute(
        "fill-opacity",
        reveal && (index === 1 || index === 2) ? ".06" : ".36",
      );
      label.setAttribute("x", String(region.x + region.w / 2));
      label.setAttribute("y", String(region.y + region.h / 2));
      setText(label, region.label);
      setVisible(rect, mode !== 2);
      setVisible(label, mode !== 2);
    });
    setVisible(squareTitle, mode !== 2);
    setVisible(triangleTitle, mode === 2);
    squareOutline.setAttribute(
      "d",
      `M${left} ${top} H${left + wA + wB} V${top + wA + wB} H${left} Z`,
    );
    setVisible(squareOutline, mode !== 2);
    dimensionTop.setAttribute("x", String(left + wA + wB / 2));
    setText(dimensionTop, `a ${fmt(a)} ${sign < 0 ? "−" : "+"} b ${fmt(b)}`);
    dimensionSide.setAttribute("x", String(left + 6));
    dimensionSide.setAttribute("y", String(top - 8));
    setText(dimensionSide, `lado total ${fmt(a + sign * b)}`);
    setVisible(dimensionTop, mode !== 2);
    setVisible(dimensionSide, mode !== 2);
    missingHatch.forEach((line, index) => {
      const regionIndex = index < 6 ? 1 : 2;
      const region = layouts[regionIndex];
      const local = index % 6;
      const x1 = region.x + (local * region.w) / 6;
      line.setAttribute(
        "d",
        `M${x1} ${region.y + region.h} L${x1 + region.h / 2} ${region.y}`,
      );
      setVisible(line, reveal && mode !== 2);
    });
    const tx = 220,
      ty = 290,
      unit = Math.min(25, 200 / Math.max(a, b));
    const p0 = { x: tx, y: ty },
      p1 = { x: tx, y: ty - a * unit },
      p2 = { x: tx + b * unit, y: ty };
    legA.setAttribute("d", `M${p0.x} ${p0.y} L${p1.x} ${p1.y}`);
    legB.setAttribute("d", `M${p0.x} ${p0.y} L${p2.x} ${p2.y}`);
    hypotenuse.setAttribute("d", `M${p1.x} ${p1.y} L${p2.x} ${p2.y}`);
    triangleGuide.setAttribute("d", `M${p1.x} ${p1.y} V${p2.y} H${p2.x}`);
    [legA, legB, hypotenuse, triangleGuide, labelA, labelB, labelHyp].forEach(
      (node) => setVisible(node, mode === 2),
    );
    labelA.setAttribute("x", String(tx - 20));
    labelA.setAttribute("y", String((p0.y + p1.y) / 2));
    setText(labelA, `a = ${fmt(a)}`);
    labelB.setAttribute("x", String((p0.x + p2.x) / 2));
    labelB.setAttribute("y", String(ty + 20));
    setText(labelB, `b = ${fmt(b)}`);
    labelHyp.setAttribute("x", String((p1.x + p2.x) / 2 + 5));
    labelHyp.setAttribute("y", String((p1.y + p2.y) / 2 - 6));
    setText(labelHyp, `√(a²+b²) = ${fmt(Math.hypot(a, b), 3)}`);
    errorButton.setAttribute("aria-pressed", String(reveal));
    renderReadout(
      board.readout,
      mode === 2
        ? "La diagonal recorta el camino"
        : "Sumar longitudes crea regiones cruzadas",
      [
        [
          "Desarrollo",
          [
            h(
              "p",
              null,
              mode === 2
                ? `a + b = ${fmt(a + b)}; √(${fmt(a * a)} + ${fmt(b * b)}) = ${fmt(Math.hypot(a, b), 3)}.`
                : `(a ${sign < 0 ? "−" : "+"} b)² = ${fmt(a * a)} ${sign < 0 ? "−" : "+"} ${fmt(2 * a * b)} + ${fmt(b * b)} = ${fmt((a + sign * b) ** 2)}.`,
            ),
            h(
              "small",
              null,
              mode === 2
                ? "El camino quebrado por los catetos es más largo que la diagonal."
                : "Los dos rectángulos ab son las regiones que faltan en la falsa distributiva.",
            ),
          ],
        ],
        [
          "Área central",
          [
            h(
              "p",
              null,
              `${fmt(a * a)} ${sign < 0 ? "−" : "+"} ${fmt(2 * a * b)} + ${fmt(b * b)} = ${fmt((a + sign * b) ** 2)}`,
            ),
            h(
              "small",
              null,
              reveal
                ? "Rayado rosa: aquí estaban las dos áreas ab omitidas."
                : "Probá el botón para atenuar las regiones cruzadas y ver qué se pierde.",
            ),
          ],
        ],
      ],
    );
  };
  connect(state, (value) => value, render);
  return board;
}
