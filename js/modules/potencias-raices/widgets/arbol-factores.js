/** Árbol dinámico y cajas: la raíz se vuelve un reparto comprobable. */
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
  [36, 2],
  [64, 2],
  [64, 3],
  [125, 3],
  [16, 4],
  [81, 4],
  [32, 5],
  [243, 5],
  [729, 6],
  [128, 7],
];
const rootLabel = (index, value) =>
  `${index === 2 ? "√" : index === 3 ? "∛" : `${["", "", "", "", "⁴", "⁵", "⁶", "⁷"][index]}√`}${value}`;
function primeFactors(value) {
  const factors = [];
  let rest = value;
  for (let divisor = 2; divisor * divisor <= rest; divisor += 1) {
    while (rest % divisor === 0) {
      factors.push(divisor);
      rest /= divisor;
    }
  }
  if (rest > 1) factors.push(rest);
  return factors;
}
function splitTree(value) {
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0)
      return {
        value,
        left: splitTree(divisor),
        right: splitTree(value / divisor),
      };
  }
  return { value, left: null, right: null };
}

export function initArbolFactoresWidget(host) {
  const board = createBoard(
    host,
    "Árbol de factores primos y cajas multiplicativas",
    "0 0 640 380",
  );
  const state = createStore({ value: 64, index: 3 });
  const presetChips = addChips(
    board.controls,
    ROOT_CASES.map(([value, index]) => [
      `${value}:${index}`,
      rootLabel(index, value),
    ]),
    "64:3",
    (key) => {
      const [value, index] = key.split(":").map(Number);
      state.set({ value, index });
    },
    "Raíces exactas de práctica",
  );
  const custom = h("input", {
    type: "number",
    min: 2,
    max: 729,
    value: 64,
    "aria-label": "Radicando personalizado",
  });
  custom.addEventListener("change", () => {
    const value = Math.min(
      729,
      Math.max(2, Math.floor(Number(custom.value) || 2)),
    );
    custom.value = String(value);
    state.set({ value });
  });
  board.controls.append(
    h(
      "label",
      { class: "field seq-control" },
      h("span", { class: "field__label" }, "Radicando libre N"),
      custom,
    ),
  );
  const indexControl = addRange(
    board.controls,
    state,
    "index",
    "Índice n",
    2,
    7,
    3,
  );

  svgText(board.drawing, 16, 26, "DIVIDIR EL NÚMERO HASTA LLEGAR A PRIMOS", {
    fill: "var(--yellow)",
    "font-weight": "bold",
  });
  svgText(
    board.drawing,
    16,
    194,
    "REPARTIR LAS HOJAS EN CAJAS DEL MISMO TAMAÑO",
    { fill: "var(--green)", "font-weight": "bold" },
  );
  const edges = [];
  for (let index = 0; index < 18; index += 1)
    edges.push(
      svgPath(board.drawing, "", {
        stroke: "var(--muted)",
        "stroke-width": 1.5,
      }),
    );
  const treeNodes = [];
  for (let index = 0; index < 19; index += 1) {
    const circle = s("circle", {
      cx: 300,
      cy: 48,
      r: 10,
      fill: "var(--yellow)",
      "fill-opacity": ".2",
      stroke: "var(--yellow)",
      "stroke-width": 2,
    });
    board.drawing.append(circle);
    const label = svgText(board.drawing, 300, 52, "", {
      "text-anchor": "middle",
      "font-size": 9,
      "font-weight": "bold",
    });
    treeNodes.push({ circle, label });
  }
  const boxes = [];
  for (let index = 0; index < 7; index += 1) {
    const x = 14 + index * 88;
    const box = s("rect", {
      x,
      y: 220,
      width: 78,
      height: 68,
      rx: 6,
      fill: "var(--green)",
      "fill-opacity": ".12",
      stroke: "var(--green)",
      "stroke-width": 2,
    });
    board.drawing.append(box);
    const title = svgText(board.drawing, x + 39, 238, `Caja ${index + 1}`, {
      "text-anchor": "middle",
      fill: "var(--green)",
      "font-size": 11,
    });
    const product = svgText(board.drawing, x + 39, 260, "", {
      "text-anchor": "middle",
      "font-size": 11,
    });
    const total = svgText(board.drawing, x + 39, 280, "", {
      "text-anchor": "middle",
      "font-weight": "bold",
    });
    boxes.push({ box, title, product, total });
  }

  const render = ({ value, index }) => {
    custom.value = String(value);
    indexControl.input.value = String(index);
    indexControl.output.textContent = fmt(index);
    presetChips(
      ROOT_CASES.some(([N, n]) => N === value && n === index)
        ? `${value}:${index}`
        : "__custom__",
    );
    const root = splitTree(value);
    const nodes = [];
    const links = [];
    let leaf = 0;
    const leafCount = (node) =>
      node.left ? leafCount(node.left) + leafCount(node.right) : 1;
    const totalLeaves = leafCount(root);
    const place = (node, depth = 0) => {
      if (node.left) {
        place(node.left, depth + 1);
        place(node.right, depth + 1);
        node.x = (node.left.x + node.right.x) / 2;
        links.push([node, node.left], [node, node.right]);
      } else {
        node.x =
          totalLeaves === 1 ? 320 : 24 + (leaf * 592) / (totalLeaves - 1);
        leaf += 1;
      }
      node.y = 42 + depth * 25;
      nodes.push(node);
    };
    place(root);
    treeNodes.forEach(({ circle, label }, position) => {
      const node = nodes[position];
      setVisible(circle, Boolean(node));
      setVisible(label, Boolean(node));
      if (!node) return;
      circle.setAttribute("cx", String(node.x));
      circle.setAttribute("cy", String(node.y));
      circle.setAttribute("fill", node.left ? "var(--blue)" : "var(--yellow)");
      circle.setAttribute(
        "stroke",
        node.left ? "var(--blue)" : "var(--yellow)",
      );
      label.setAttribute("x", String(node.x));
      label.setAttribute("y", String(node.y + 3));
      setText(label, fmt(node.value));
    });
    edges.forEach((edge, position) => {
      const [from, to] = links[position] || [];
      setVisible(edge, Boolean(from));
      if (from)
        edge.setAttribute(
          "d",
          `M${from.x} ${from.y + 10} L${to.x} ${to.y - 10}`,
        );
    });
    const factors = primeFactors(value);
    const groups = Array.from({ length: index }, () => []);
    factors.forEach((prime, position) => groups[position % index].push(prime));
    const exact = groups.every(
      (group) => group.length === groups[0].length && group.length > 0,
    );
    boxes.forEach(({ box, title, product, total }, position) => {
      const visible = position < index;
      [box, title, product, total].forEach((node) => setVisible(node, visible));
      box.setAttribute("stroke", exact ? "var(--green)" : "var(--pink)");
      const group = groups[position] || [];
      setText(product, group.length ? group.map(fmt).join(" · ") : "vacía");
      setText(
        total,
        group.length ? `= ${fmt(group.reduce((a, b) => a * b, 1))}` : "",
      );
    });
    const eachBox =
      groups[0]?.reduce((product, prime) => product * prime, 1) || 1;
    renderReadout(board.readout, "Comprobación del reparto", [
      [
        "Hojas primas",
        [
          h("p", null, `${fmt(value)} = ${factors.map(fmt).join(" · ")}`),
          h(
            "small",
            null,
            `${fmt(factors.length)} factores se distribuyen entre ${fmt(index)} cajas.`,
          ),
        ],
      ],
      [
        "Contenido por caja",
        [
          h(
            "p",
            null,
            groups
              .map(
                (group, index) =>
                  `Caja ${fmt(index + 1)}: ${group.length ? group.map(fmt).join(" · ") : "sin factores"} = ${fmt(group.reduce((a, b) => a * b, 1))}`,
              )
              .join("   ·   "),
          ),
          h(
            "small",
            null,
            exact
              ? `Las cajas coinciden: la raíz vale ${fmt(eachBox)}.`
              : "Si sobran factores, el resultado no es una raíz entera exacta.",
          ),
        ],
      ],
    ]);
  };
  connect(state, (value) => value, render);
  return board;
}
