/** Shared construction helpers. Each laboratory owns its scene and update logic. */
import {
  h,
  s,
  mount,
  createStore,
  connect,
  chalkIcon,
} from "../../../core/dom.js";
import { fmt, frac } from "../../../core/math-format.js";

export { h, s, mount, createStore, connect, chalkIcon, fmt, frac };

export function createBoard(host, title, viewBox = "0 0 600 340") {
  const controls = h("div", { class: "seq-controls pr-widget__controls" });
  const svg = s("svg", {
    class: "pr-board-svg",
    viewBox,
    role: "img",
    "aria-label": title,
  });
  const drawing = s("g", { class: "pr-board-scene" });
  svg.append(drawing);
  const readout = h("div", {
    class: "va-readout pr-readout",
    "aria-live": "polite",
  });
  const actions = h("div", { class: "pr-widget__actions" });
  const frame = h(
    "div",
    { class: "pr-widget" },
    controls,
    svg,
    readout,
    actions,
  );
  mount(host, frame);
  return { frame, controls, svg, drawing, readout, actions };
}

export function addRange(
  controls,
  store,
  key,
  label,
  min,
  max,
  initial,
  step = 1,
) {
  const input = h("input", {
    type: "range",
    min,
    max,
    step,
    value: initial,
    "aria-label": label,
  });
  const output = h("output", { class: "field__value" }, fmt(Number(initial)));
  input.addEventListener("input", () => {
    const value = Number(input.value);
    output.textContent = fmt(value);
    store.set({ [key]: value });
  });
  controls.append(
    h(
      "label",
      { class: "field seq-control" },
      h("span", { class: "field__label" }, label),
      input,
      output,
    ),
  );
  return { input, output };
}

export function addSelect(controls, store, key, label, options, initial) {
  const select = h("select", { "aria-label": label });
  options.forEach(([value, text]) =>
    select.append(
      h("option", { value, selected: String(value) === String(initial) }, text),
    ),
  );
  select.addEventListener("change", () =>
    store.set({ [key]: Number(select.value) }),
  );
  controls.append(
    h(
      "label",
      { class: "field seq-control" },
      h("span", { class: "field__label" }, label),
      select,
    ),
  );
  return select;
}

export function addChips(parent, options, active, onPick, groupLabel) {
  const group = h("div", {
    class: "pr-chip-group",
    role: "group",
    "aria-label": groupLabel,
  });
  const chips = options.map(([value, label]) => {
    const chip = h(
      "button",
      {
        type: "button",
        class: `chip ${String(value) === String(active) ? "is-active" : "chip--ghost"}`,
        "aria-pressed": String(value) === String(active),
        on: { click: () => onPick(value) },
      },
      label,
    );
    group.append(chip);
    return { value, chip };
  });
  parent.append(group);
  return (value) =>
    chips.forEach(({ value: option, chip }) => {
      const selected = String(option) === String(value);
      chip.classList.toggle("is-active", selected);
      chip.classList.toggle("chip--ghost", !selected);
      chip.setAttribute("aria-pressed", String(selected));
    });
}

export function svgText(parent, x, y, value, attrs = {}) {
  const node = s("text", { x, y, class: "pr-svg-label", ...attrs }, value);
  parent.append(node);
  return node;
}

export function svgPath(parent, d, attrs = {}) {
  const node = s("path", {
    d,
    fill: "none",
    class: "pr-svg-neutral",
    ...attrs,
  });
  parent.append(node);
  return node;
}

export function setText(node, value) {
  node.textContent = String(value);
}

export function setVisible(node, visible) {
  node.setAttribute("visibility", visible ? "visible" : "hidden");
}

export function renderReadout(readout, title, rows) {
  mount(
    readout,
    h("h4", null, title),
    h(
      "div",
      { class: "pr-readout__grid" },
      ...rows.map(([label, nodes]) =>
        h(
          "div",
          { class: "pr-readout__item" },
          h("strong", null, label),
          h("p", null, ...nodes),
        ),
      ),
    ),
  );
}

export function button(label, icon, onClick, className = "chip") {
  return h(
    "button",
    { type: "button", class: className, on: { click: onClick } },
    chalkIcon(icon),
    ` ${label}`,
  );
}

export function compactFraction(numerator, denominator) {
  return frac(String(numerator), String(denominator));
}
