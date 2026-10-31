/** Aduana visual para grupos numéricos y potencias de una variable. */
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
  setVisible,
  setText,
  renderReadout,
  fmt,
} from "./board-kit.js";
import { simplifyRadical } from "../expr.js";

const EXAMPLES = [
  ["75", "√75", 1, 75, 0, 2],
  ["12", "√12", 1, 12, 0, 2],
  ["54x7", "√(54x⁷)", 1, 54, 7, 2],
  ["20x8", "√(20x⁸)", 1, 20, 8, 2],
  ["product", "2√(7x) · 3√(14x²)", 6, 98, 3, 2],
];
const SUPER = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
const superscript = (power) =>
  String(power)
    .split("")
    .map((digit) => SUPER[Number(digit)] ?? digit)
    .join("");
const xPower = (power) =>
  power === 0 ? "" : power === 1 ? "x" : `x${superscript(power)}`;
const radicalSign = (index) =>
  index === 2 ? "√" : index === 3 ? "∛" : `${superscript(index)}√`;

function primeList(value) {
  const values = [];
  let remaining = value;
  for (let prime = 2; prime * prime <= remaining; prime += 1) {
    while (remaining % prime === 0) {
      values.push(prime);
      remaining /= prime;
    }
  }
  if (remaining > 1) values.push(remaining);
  return values;
}

export function initSimplificadorRadicalWidget(host) {
  const board = createBoard(
    host,
    "Aduana de factores para simplificar radicales",
    "0 0 640 380",
  );
  const state = createStore({
    preset: "54x7",
    coefficient: 1,
    radicand: 54,
    power: 7,
    index: 2,
  });
  const choosePreset = addChips(
    board.controls,
    EXAMPLES.map(([key, label]) => [key, label]),
    "54x7",
    (preset) => {
      const [, , coefficient, radicand, power, index] = EXAMPLES.find(
        ([name]) => name === preset,
      );
      state.set({ preset, coefficient, radicand, power, index });
    },
    "Ejemplos de simplificación",
  );
  const coefficient = addRange(
    board.controls,
    state,
    "coefficient",
    "Coeficiente exterior",
    1,
    6,
    1,
  );
  const power = addRange(
    board.controls,
    state,
    "power",
    "Potencia de x",
    0,
    10,
    7,
  );
  const radicand = h("input", {
    type: "number",
    min: 2,
    max: 500,
    value: 54,
    "aria-label": "Radicando numérico",
  });
  radicand.addEventListener("input", () =>
    state.set({
      radicand: Math.min(500, Math.max(2, Number(radicand.value) || 2)),
      preset: "custom",
    }),
  );
  board.controls.append(
    h(
      "label",
      { class: "field seq-control" },
      h("span", { class: "field__label" }, "Radicando numérico"),
      radicand,
    ),
  );
  const indexSelect = addSelect(
    board.controls,
    state,
    "index",
    "Índice n",
    [
      [2, "raíz cuadrada"],
      [3, "raíz cúbica"],
      [4, "raíz cuarta"],
    ],
    2,
  );

  svgText(board.drawing, 18, 28, "1 · INTERIOR FACTORIZADO", {
    fill: "var(--yellow)",
    "font-weight": "bold",
  });
  svgText(board.drawing, 18, 178, "2 · ADUANA DE GRUPOS COMPLETOS", {
    fill: "var(--green)",
    "font-weight": "bold",
  });
  svgText(board.drawing, 18, 270, "3 · RESULTADO FUERA Y DENTRO DEL RADICAL", {
    fill: "var(--pink)",
    "font-weight": "bold",
  });
  const numberTokens = [];
  for (let index = 0; index < 24; index += 1) {
    const token = s("g", {});
    const tile = s("rect", {
      x: 22 + (index % 12) * 49,
      y: 48 + Math.floor(index / 12) * 43,
      width: 38,
      height: 30,
      rx: 5,
      fill: "var(--pink)",
      "fill-opacity": ".2",
      stroke: "var(--pink)",
      "stroke-width": 1.5,
    });
    token.append(tile);
    const label = svgText(
      token,
      41 + (index % 12) * 49,
      68 + Math.floor(index / 12) * 43,
      "",
      { "text-anchor": "middle", "font-weight": "bold" },
    );
    board.drawing.append(token);
    numberTokens.push({ token, tile, label });
  }
  const xTokens = [];
  for (let index = 0; index < 10; index += 1) {
    const rect = s("rect", {
      x: 26 + index * 49,
      y: 126,
      width: 38,
      height: 30,
      rx: 5,
      fill: "var(--yellow)",
      "fill-opacity": ".24",
      stroke: "var(--yellow)",
      "stroke-width": 1.5,
    });
    board.drawing.append(rect);
    const label = svgText(board.drawing, 45 + index * 49, 146, "x", {
      "text-anchor": "middle",
      "font-weight": "bold",
    });
    xTokens.push({ rect, label });
  }
  const roof = svgPath(board.drawing, "M70 214 H560", {
    stroke: "var(--yellow)",
    "stroke-width": 5,
  });
  const door = s("path", {
    d: "M304 200 V236 M336 200 V236",
    fill: "none",
    stroke: "var(--green)",
    "stroke-width": 4,
  });
  board.drawing.append(door);
  const outsideResult = svgText(board.drawing, 70, 318, "", {
    fill: "var(--green)",
    "font-weight": "bold",
  });
  const insideResult = svgText(board.drawing, 358, 318, "", {
    fill: "var(--pink)",
    "font-weight": "bold",
  });

  const render = ({
    preset,
    coefficient: outer,
    radicand: N,
    power: exponent,
    index,
  }) => {
    choosePreset(preset);
    coefficient.input.value = String(outer);
    coefficient.output.textContent = fmt(outer);
    power.input.value = String(exponent);
    power.output.textContent = fmt(exponent);
    radicand.value = String(N);
    indexSelect.value = String(index);
    const result = simplifyRadical(outer, N, { x: exponent }, index);
    const primes = primeList(N);
    const groupPositions = new Set();
    const counts = new Map();
    primes.forEach((prime) => counts.set(prime, (counts.get(prime) || 0) + 1));
    for (const [prime, count] of counts) {
      let consumed = 0;
      primes.forEach((factor, position) => {
        if (factor === prime && consumed < Math.floor(count / index) * index) {
          groupPositions.add(position);
          consumed += 1;
        }
      });
    }
    const completeCount = groupPositions.size;
    numberTokens.forEach(({ token, tile, label }, position) => {
      const visible = position < primes.length;
      setVisible(token, visible);
      setText(label, visible ? fmt(primes[position]) : "");
      const grouped = groupPositions.has(position);
      tile.setAttribute("fill", grouped ? "var(--green)" : "var(--pink)");
      tile.setAttribute("stroke", grouped ? "var(--green)" : "var(--pink)");
      tile.setAttribute("fill-opacity", grouped ? ".42" : ".18");
    });
    const variableCount = exponent;
    xTokens.forEach(({ rect, label }, position) => {
      const visible = position < variableCount;
      setVisible(rect, visible);
      setVisible(label, visible);
      const grouped = position < Math.floor(variableCount / index) * index;
      rect.setAttribute("fill", grouped ? "var(--green)" : "var(--pink)");
      rect.setAttribute("stroke", grouped ? "var(--green)" : "var(--pink)");
      setText(label, "x");
    });
    setText(door, "");
    const outsideX = xPower(result.outsideVars.x || 0);
    const insideX = xPower(result.insideVars.x || 0);
    const outsideValue =
      `${result.outsideCoeff === 1 ? "" : fmt(result.outsideCoeff)}${outsideX}` ||
      "1";
    const insideValue =
      `${result.insideInt === 1 && insideX ? "" : fmt(result.insideInt)}${insideX}` ||
      "1";
    const root = radicalSign(index);
    const simplifiedRadical =
      insideValue === "1" ? "1" : `${root}(${insideValue})`;
    const completeGroups = Math.floor(exponent / index);
    const variableRemainder = exponent % index;
    const variableDecomposition =
      exponent === 0
        ? "No hay factores de x para agrupar."
        : completeGroups === 0
          ? `${xPower(exponent)} no completa un paquete de ${fmt(index)}.`
          : `${xPower(exponent)} = (x${superscript(index)})${completeGroups > 1 ? superscript(completeGroups) : ""}${variableRemainder ? ` · ${xPower(variableRemainder)}` : ""}`;
    setText(outsideResult, `Afuera: ${outsideValue}`);
    setText(insideResult, `Bajo ${root}: ${simplifiedRadical}`);
    renderReadout(board.readout, "Cada paquete completo cruza la aduana", [
      [
        "Factores numéricos",
        [
          h("p", null, `${fmt(N)} = ${primes.map(fmt).join(" · ")}`),
          h(
            "small",
            null,
            `${fmt(completeCount)} factores forman paquetes de ${fmt(index)}; el resto queda adentro.`,
          ),
        ],
      ],
      [
        "Factores de x",
        [
          h(
            "p",
            null,
            variableDecomposition,
          ),
          h(
            "small",
            null,
            `Salen ${fmt(result.outsideVars.x || 0)} copias de x y quedan ${fmt(result.insideVars.x || 0)} bajo el radical.`,
          ),
        ],
      ],
      [
        "Forma simplificada",
        [
          h(
            "p",
            null,
            outsideValue === "1"
              ? simplifiedRadical
              : `${outsideValue} · ${simplifiedRadical}`,
          ),
          h(
            "small",
            null,
            "La agrupación conserva el valor y deja visibles los restos.",
          ),
        ],
      ],
    ]);
  };
  connect(state, (value) => value, render);
  return board;
}
