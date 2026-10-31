/** Cada pareja vertical forma el neutro 1; no desaparece ni se suma. */
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

const PRESETS = [
  ["3:4:10", "3⁴ / 3¹⁰", 3, 4, 10],
  ["2:6:2", "2⁶ / 2²", 2, 6, 2],
  ["5:4:4", "5⁴ / 5⁴", 5, 4, 4],
  ["x:3:7", "x³ / x⁷", 0, 3, 7],
];

export function initNeutroCancelacionWidget(host) {
  const board = createBoard(
    host,
    "Emparejador de factores que forman el neutro",
    "0 0 640 360",
  );
  const state = createStore({
    base: 3,
    symbol: "3",
    m: 4,
    n: 10,
    pairs: [],
    collapsed: false,
  });
  const choosePreset = addChips(
    board.controls,
    PRESETS.map(([key, label]) => [key, label]),
    "3:4:10",
    (key) => {
      const [, , base, m, n] = PRESETS.find(([name]) => name === key);
      state.set({
        base,
        symbol: base ? String(base) : "x",
        m,
        n,
        pairs: [],
        collapsed: false,
      });
    },
    "Cociente de potencias",
  );
  const mControl = addRange(
    board.controls,
    state,
    "m",
    "Exponente del numerador m",
    1,
    8,
    4,
  );
  const nControl = addRange(
    board.controls,
    state,
    "n",
    "Exponente del denominador n",
    1,
    10,
    10,
  );
  const pairAll = h(
    "button",
    {
      type: "button",
      class: "chip",
      on: {
        click: () => {
          const { m, n } = state.get();
          state.set({
            pairs: Array.from({ length: Math.min(m, n) }, (_, index) => index),
          });
        },
      },
    },
    "Formar parejas del Neutro (× 1)",
  );
  const collapse = h(
    "button",
    {
      type: "button",
      class: "chip chip--ghost",
      on: { click: () => state.set({ collapsed: true }) },
    },
    "Contraer los unos",
  );
  board.actions.append(pairAll, collapse);

  svgText(board.drawing, 18, 28, "NUMERADOR · factores que suben", {
    fill: "var(--blue)",
    "font-weight": "bold",
  });
  svgText(board.drawing, 18, 194, "DENOMINADOR · factores que quedan", {
    fill: "var(--yellow)",
    "font-weight": "bold",
  });
  const fractionBar = svgPath(board.drawing, "M18 170 H620", {
    stroke: "var(--ink)",
    "stroke-width": 3,
  });
  const topTiles = [];
  const bottomTiles = [];
  const tileX = (index) => 28 + (index % 10) * 59;

  for (let index = 0; index < 10; index += 1) {
    const top = s("g", {
      tabindex: "0",
      role: "button",
      "aria-label": `Emparejar factor superior ${index + 1}`,
    });
    const topRect = s("rect", {
      x: tileX(index),
      y: 48,
      width: 44,
      height: 44,
      rx: 8,
      fill: "var(--blue)",
      "fill-opacity": ".2",
      stroke: "var(--blue)",
      "stroke-width": 2,
    });
    top.append(topRect);
    const topLabel = svgText(top, tileX(index) + 22, 76, "", {
      "text-anchor": "middle",
      "font-weight": "bold",
    });
    const bottom = s("g", {
      tabindex: "0",
      role: "button",
      "aria-label": `Emparejar factor inferior ${index + 1}`,
    });
    const bottomRect = s("rect", {
      x: tileX(index),
      y: 214,
      width: 44,
      height: 44,
      rx: 8,
      fill: "var(--yellow)",
      "fill-opacity": ".2",
      stroke: "var(--yellow)",
      "stroke-width": 2,
    });
    bottom.append(bottomRect);
    const bottomLabel = svgText(bottom, tileX(index) + 22, 242, "", {
      "text-anchor": "middle",
      "font-weight": "bold",
    });
    const togglePair = () => {
      const pairs = state.get().pairs;
      state.set({
        pairs: pairs.includes(index)
          ? pairs.filter((value) => value !== index)
          : [...pairs, index],
        collapsed: false,
      });
    };
    [top, bottom].forEach((token) => {
      token.addEventListener("click", togglePair);
      token.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          togglePair();
        }
      });
    });
    board.drawing.append(top, bottom);
    topTiles.push({ group: top, rect: topRect, label: topLabel });
    bottomTiles.push({ group: bottom, rect: bottomRect, label: bottomLabel });
  }

  const render = ({ base, symbol, m, n, pairs, collapsed }) => {
    mControl.input.value = String(m);
    mControl.output.textContent = fmt(m);
    nControl.input.value = String(n);
    nControl.output.textContent = fmt(n);
    choosePreset(
      PRESETS.find(([key]) => key === `${symbol}:${m}:${n}`)?.[0] ||
        "__custom__",
    );
    const common = Math.min(m, n);
    topTiles.forEach((tile, index) => {
      const visible = index < m;
      setVisible(tile.group, visible);
      const paired = pairs.includes(index) && index < common;
      tile.rect.setAttribute("fill", paired ? "var(--green)" : "var(--blue)");
      tile.rect.setAttribute("stroke", paired ? "var(--green)" : "var(--blue)");
      setText(tile.label, paired ? "×1" : symbol);
    });
    bottomTiles.forEach((tile, index) => {
      const visible = index < n;
      setVisible(tile.group, visible);
      const paired = pairs.includes(index) && index < common;
      tile.rect.setAttribute("fill", paired ? "var(--green)" : "var(--yellow)");
      tile.rect.setAttribute(
        "stroke",
        paired ? "var(--green)" : "var(--yellow)",
      );
      setText(tile.label, paired ? "×1" : symbol);
    });
    fractionBar.setAttribute("stroke", "var(--ink)");
    pairAll.setAttribute("aria-pressed", String(pairs.length === common));
    const chosen = pairs.filter((index) => index < common).length;
    const residual = m - n;
    const resultNodes =
      residual < 0
        ? [frac("1", `${symbol}^${fmt(-residual)}`)]
        : [
            h(
              "span",
              null,
              symbol,
              residual ? h("sup", null, fmt(residual)) : "⁰",
            ),
          ];
    renderReadout(board.readout, "Del cociente a la potencia resultante", [
      [
        "1 · Expansión",
        [
          h("p", null, `${symbol}^${fmt(m)} ÷ ${symbol}^${fmt(n)}`),
          h(
            "small",
            null,
            "Escribí cada potencia como un producto de factores iguales.",
          ),
        ],
      ],
      [
        "2 · Parejas neutras",
        [
          h(
            "p",
            null,
            chosen
              ? `${fmt(chosen)} parejas: `
              : "Tocá fichas verticales para emparejar. ",
            ...Array.from({ length: chosen }, () => h("span", null, "1 · ")),
          ),
          h(
            "small",
            null,
            collapsed
              ? "Al contraer, el producto de unos vale exactamente uno."
              : "Cada ficha igual arriba y abajo forma ×1; el neutro no desaparece.",
          ),
        ],
      ],
      [
        "3 · Resultado",
        [
          h("p", null, ...resultNodes, " = ", symbol, "^", fmt(residual)),
          h(
            "small",
            null,
            `La ley del cociente resta contadores: ${fmt(m)} − ${fmt(n)} = ${fmt(residual)}.`,
          ),
        ],
      ],
    ]);
  };
  connect(state, (value) => value, render);
  return board;
}
