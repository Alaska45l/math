<div align="center">
  <img src="assets/vn/base.webp" alt="Alaska — Visual Novel Tutor and Chalkboard Mascot" width="220">
  <h1>Alaska Math Lab</h1>
  <p><strong>First-principles interactive mathematics, custom AST algebraic evaluators, reactive SVG cartesian boards, and Visual Novel tutoring for university entrance mastery.</strong></p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES2023%2B%20Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111" alt="Vanilla ES Modules">
  <img src="https://img.shields.io/badge/Dependencies-Zero-2EAD33?style=for-the-badge&logo=node.js&logoColor=white" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/SVG-Interactive%20Boards-FFB13B?style=for-the-badge&logo=svg&logoColor=111111" alt="Interactive SVG">
  <img src="https://img.shields.io/badge/Playwright-Visual%20%26%20DOM%20QA-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright QA">
  <img src="https://img.shields.io/badge/Web%20Audio-Procedural%20Synth-003B57?style=for-the-badge&logo=audiomack&logoColor=white" alt="Web Audio Synth">
</p>

Alaska Math Lab is a local-first, zero-dependency interactive web laboratory built to master pre-calculus and university entrance mathematics (Facultad de Ciencias Exactas / Análisis Matemático I). It replaces passive video lectures, static SVG diagrams, and mechanical rule-memorization with direct spatial manipulation on a chalk-on-slate digital blackboard.

It was born out of a concrete frustration while preparing for university exams: platforms like Khan Academy often reduce rich geometric and algebraic structures to rote recipes (*"flip the sign of $h$, cancel the units by crossing them out, plug numbers into a text box"*). When an exam problem twists the premise, memorized recipes collapse. Instead of accepting black-box rules, this repository dissects each mathematical object into interactive mechanical gears that you can drag, fold, and test with your own hands.

The project is intentionally built in pure Vanilla HTML5, CSS3, and native ES Modules with **zero runtime dependencies**. It does not use `eval()`, `new Function()`, heavy UI frameworks, or external graphing libraries. Algebraic expressions are parsed through custom recursive-descent AST evaluators, and every pedagogical error is caught by deterministic diagnostic engines tested under `node --test`.

## What It Does

The application is structured around five interactive laboratories and a shared reactive core:

| Laboratory | Entry Point & Module | What happens |
| --- | --- | --- |
| **1. Compound Inequalities (Logic Circuits)** | `desigualdades.html`<br>`js/modules/circuitos/` | Models inequalities ($<, \le, >, \ge$) as series ($\land$ AND) and parallel ($\lor$ OR) electrical switches. Visualizes polarity inversion when multiplying/dividing by negative numbers and detects empty sets ($\emptyset$) or full-line conduction ($\mathbb{R}$). |
| **2. Dimensional Analysis & Multiplicative Neutral** | `unidades.html`<br>`js/modules/dimensional/` | Replaces "crossing out units by magic" with physical male/female pin-and-socket tokens. Demonstrates how conversion factors form the multiplicative identity ($\frac{u}{u} = 1$) and exposes intermediate commutative grouping and cubic volume scaling ($\text{cm}^3$). |
| **3. Functions (Unit 8 & Exactas)** | `funciones.html`<br>`js/modules/funciones/` | Four sub-simulators covering the vertical-line uniqueness scanner, domain/range shadow projection, Cartesian X-ray lenses ($C_0, C^+, C^-, I_\uparrow, I_\downarrow$), average rate of change secant triangles ($\frac{\Delta y}{\Delta x}$), and reversible operation pipelines across the $y = x$ mirror ($f^{-1}$). |
| **4. Sequences & Discrete Functions (Unit 9)** | `sucesiones.html`<br>`js/modules/sucesiones/` | A 4-chapter linear interactive lesson covering arithmetic ($+d$) and geometric ($\times r$) progressions, fencepost jump counting ($n - 1$ vs. $n$), recursive staircases (including Fibonacci dual anchors), explicit teleporters, negative base precedence, and convergence limits ($\lim_{n\to\infty}$). |
| **5. Absolute Value & Piecewise Functions (Unit 10)** | `valor-absoluto.html`<br>`js/modules/valor-absoluto/` | Connects 1D metric distance ($\vert{}x - h\vert{}$) with the 2D X-axis reflection mirror, live two-node dragging of $f(x) = a\vert{}x - h\vert{} + k$, algebraic unfolding into piecewise linear branches, boundary uniqueness collisions ($\circ$ vs. $\bullet$), step functions, and the $\sqrt{x^2} = \vert{}x\vert{}$ identity. |

## Why It Exists

Most educational math software falls into one of two traps: either it is a static textbook disguised as a web page with multiple-choice forms, or it is a general-purpose calculator (like GeoGebra or Desmos) that plots anything without explaining *why* the curve behaves that way or where students typically fail.

Alaska Math Lab takes a third route: **guided tactile dissection**.

The design philosophy is strict:

- **First principles over schoolyard tricks:** Prohibited from saying *"it passes to the other side with the opposite sign"* or *"cross it out."* Operations are framed through uniform property, additive identity ($+0$), and multiplicative identity ($\times 1$).
- **Equivalence over string matching:** Student formulas are parsed into an Abstract Syntax Tree (AST) and evaluated across domain samples. Writing `-9 + 4n` when standard form `-5 + 4(n - 1)` is expected is recognized as mathematically equivalent while issuing a structural warning.
- **Targeted error diagnosis over generic red crosses:** Dedicated `diagnose()` engines inspect wrong answers against known cognitive traps (e.g., forgetting parentheses on negative bases `-5^(n-1)`, swapping $h$ and $k$, reading intervals on the $Y$ axis instead of the $X$ axis, or off-by-one fencepost shifts).
- **Direct manipulation over dead graphics:** Cartesian planes and number lines use persistent pointer-capture SVG dragging so vertices, slopes, secant nodes, and laser scanners respond at 60 FPS without losing DOM focus.
- **Strict typographic semantics:** All numerical readouts enforce `es-AR` formatting (decimal comma and true Unicode minus `−` U+2212), and every division or rational slope renders as a two-story horizontal fraction (`.fr`) rather than an ambiguous inline slash `/`.
- **Visual Novel tutoring:** **Alaska**, a *tsundere* exact-sciences tutor rendered in a reactive Visual Novel HUD, guides lessons with step-by-step chalk explanations, foundational *"from scratch"* breakdowns, and dynamic emotional reactions to user streaks.

## Visual System & Alaska VN Engine

The visual identity emulates a dark green classroom slate (`#1e2923`) with hand-drawn chalk typography (`Caveat` and `Kalam`), custom SVG chalk icons (strictly zero Unicode emojis across the codebase), and a strict semantic color code:

- **`--ink` / `--muted`:** Axes, coordinate grids, and ghost reference curves (e.g., the unreflected $y < 0$ portion of a line before bouncing off the $\vert{}x\vert{}$ mirror).
- **`--blue`:** User-controlled interactive handles, draggable vertices $(h, k)$, and active input parameters.
- **`--yellow`:** Highlighted mathematical targets, detected constants, axes of symmetry ($x = h$), and active piecewise branches.
- **`--pink`:** Conceptual errors, domain violations, boundary uniqueness collisions, and forbidden negative regions.
- **`--green`:** Reserved **exclusively** for verified correct answers, satisfied uniqueness, and neutral elements ($+0$ and $\times 1$).

The Visual Novel subsystem (`js/core/vn.js`) pairs with a procedural Web Audio API synthesizer (`js/core/sound.js`) that generates typewriter voice blips and chord progressions without external audio files. Alaska shifts across five WebP sprites (`base`, `orgullosa`, `colapso`, `enojada`, `feliz`) depending on the active script step or the specific error ID returned by the diagnostic engine.

## Architecture

```text
+-----------------------------------------------------------------------------------+
|                               HTML5 Entry Points                                  |
|  index.html | desigualdades.html | unidades.html | funciones.html |               |
|  sucesiones.html | valor-absoluto.html                                            |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                         Module Controllers & Widgets                              |
|  • Declarative widget mounting ([data-widget="..."])                              |
|  • Unidirectional store subscriptions (createStore / connect)                     |
|  • Seeded PRNG infinite problem generators (mulberry32) & CheckBlocks             |
+-------------------+---------------------+---------------------+-------------------+
                    |                     |                     |
                    v                     v                     v
+-------------------------+ +---------------------------+ +-------------------------+
|    Pure Math & AST      | |    Core UI & SVG Plot     | |   Visual Novel & Audio  |
|  • logic.js (pure)      | |  • dom.js (h, s, mount)   | |  • vn.js (HUD & poses)  |
|  • expr.js (AST parser) | |  • plot.js (createPlane,  | |  • vn-scripts.js        |
|  • diagnose() catalogs  | |    bindSvgDrag, snapTo)   | |  • sound.js (WebAudio)  |
|  • Zero DOM access      | |  • math-format.js (.fr)   | |  • localStorage state   |
+-------------------------+ +---------------------------+ +-------------------------+

```

Every laboratory strictly separates pure mathematical computation from DOM rendering:

1. **Pure Logic Layer (`logic.js` & `expr.js`):** Contains zero references to `window` or `document`. Handles AST parsing, symbolic simplification, interval formatting, root finding, piecewise validation, and pedagogical error classification. Directly testable in Node.js.
2. **Reactive Store & DOM Helpers (`js/core/dom.js`):** Provides hyperscript-style builders (`h` for HTML, `s` for SVG), event delegation (`on`), and a lightweight store (`createStore`, `connect`). Interactive controls (`<input type="range">`, `<svg>`) are mounted once and updated via targeted slot mutation so pointer capture is never interrupted mid-drag.
3. **Cartesian & Ribbon Plotters (`js/core/plot.js`):** Translates between mathematical coordinates and SVG viewBox pixels, manages keyboard-accessible (`Arrow` keys) and pointer-captured node dragging, and scales handwritten SVG labels dynamically via `ResizeObserver`.

## Pedagogical Diagnostic Engine

Unlike standard platforms that only return `Correct` or `Incorrect`, the `expr.js` and `logic.js` modules in **Sucesiones** and **Valor Absoluto** classify the exact algebraic misconception committed by the student:

| Diagnostic ID | Module | Detected Misconception |
| --- | --- | --- |
| `neg_pow_precedence` | `sucesiones` | Wrote `8 * -5^(n-1)` instead of `8 * (-5)^(n-1)`, ignoring that exponentiation binds tighter than unary negation. |
| `exponent_n` / `off_by_one` | `sucesiones` | Used $n$ jumps instead of $(n - 1)$ jumps when starting at $a(1)$ (the classic Woo-Jin fencepost trap). |
| `wrong_anchor_a2` | `sucesiones` | Counted $(n - 1)$ jumps correctly but used the second term $a(2)$ as the initial anchor $k$ (the Kiran trap). |
| `not_standard_but_equivalent` | `sucesiones` / `valor-absoluto` | Entered an algebraically equivalent formula (e.g., `-4 + 6n` instead of `2 + 6(n-1)`, or ` |
| `inverted_h_sign` | `valor-absoluto` | Confused the horizontal shift sign in $a\vert{}x - h\vert{} + k$ (placed the vertex of $\vert{}x + 3\vert{} - 2$ at $x = +3$ instead of $x = -3$). |
| `swapped_h_k` | `valor-absoluto` | Swapped the horizontal shift $h$ with the vertical shift $k$. |
| `confused_x_and_y_in_intervals` | `valor-absoluto` / `funciones` | Wrote positivity ($C^+$) or monotonicity ($I_\uparrow, I_\downarrow$) intervals reading vertical $y = k$ heights instead of horizontal $x = h$ coordinates. |

## Repository Layout

```text
math/
+-- index.html                        # Main Hub with cards for all 5 laboratories
+-- desigualdades.html                # Lab 1: Compound Inequalities & Logic Circuits
+-- unidades.html                     # Lab 2: Dimensional Analysis & Pin/Socket Tokens
+-- funciones.html                    # Lab 3: Functions, Domain, Secant TCP & Inverse
+-- sucesiones.html                   # Lab 4: Linear Lesson on Arithmetic & Geometric Sequences
+-- valor-absoluto.html               # Lab 5: Linear Lesson on Absolute Value & Piecewise Functions
+-- assets/
|   +-- vn/                           # WebP character sprites for Alaska (5 poses)
+-- fonts/                            # Self-hosted Woff2 fonts (Caveat, Kalam, Math subset)
+-- css/
|   +-- base.css                      # Chalkboard design tokens, typography, color semantics
|   +-- layout.css                    # Page shells, navigation bar, responsive grids
|   +-- components.css                # Horizontal fractions (.fr), buttons, VN HUD, CheckBlocks
|   +-- modules/                      # Scoped styles per laboratory (including @media print)
+-- js/
|   +-- hub.js                        # Hub page initializer
|   +-- core/
|   |   +-- dom.js                    # h(), s(), mount(), chalkIcon(), createStore(), connect()
|   |   +-- math-format.js            # es-AR formatter, Unicode minus, horizontal fractions
|   |   +-- nav.js                    # Global navigation bar & accessible tab controller
|   |   +-- plot.js                   # SVG coordinate plane & pointer-capture drag engine
|   |   +-- sound.js                  # Procedural Web Audio API synthesizer (SFX & voice blips)
|   |   +-- vn.js                     # Visual Novel dialogue & reactive HUD engine
|   +-- modules/
|       +-- circuitos/                # Logic & SVG renderer for compound inequalities
|       +-- dimensional/              # Logic & token encastre renderer for unit conversion
|       +-- funciones/                # scanner.js, radiografia.js, secante.js, inversa.js
|       +-- sucesiones/               # logic.js, expr.js, components.js, vn-scripts.js, retos.js, 10 widgets
|       +-- valor-absoluto/           # logic.js, expr.js, components.js, vn-scripts.js, retos.js, 10 widgets
+-- scripts/
|   +-- verify-pages.mjs              # Headless Chromium layout, overflow & console error verifier
|   +-- verify-interactions.mjs       # Automated E2E interaction & continuous drag reference checks
+-- tests/                            # Pure Node.js unit test suites (node --test)

```

## Requirements

| Requirement | Used by | Notes |
| --- | --- | --- |
| Static HTTP Server (`python3` or `npx serve`) | Local browser usage | Required because native ES Modules (`type="module"`) enforce CORS and cannot run over `file://`. |
| Node.js 20+ | `node --test` | Runs the pure algebraic, parser, and sound unit test suites with zero external packages. |
| Playwright Chromium | `scripts/verify-*.mjs` | Optional; used for automated E2E visual regression, viewport overflow, and pointer-capture drag checks. |

## Quick Start

Clone the repository and serve the root directory with any static HTTP server:

```bash
python3 -m http.server 8000 --bind 127.0.0.1

```

Open your browser at:

```text
[http://127.0.0.1:8000/](http://127.0.0.1:8000/)

```

From the main hub (`index.html`), you can jump into any of the five laboratories. Progress on linear lessons (`sucesiones.html` and `valor-absoluto.html`) and audio preferences are persisted automatically in `localStorage`.

## Testing & Verification

Run the unit test suites (algebraic parsers, diagnostic catalogs, sequence/absolute-value logic, and audio synthesizer):

```bash
node --test tests/sound.test.mjs tests/sucesiones/*.test.mjs tests/valor-absoluto/*.test.mjs

```

With the local HTTP server running, execute the headless Playwright verification scripts to validate HTTP 200 responses, zero console/page errors, zero horizontal overflow across mobile and desktop viewports (`320px` to `1280px`), and continuous slider/SVG drag node persistence:

```bash
BASE_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000) node scripts/verify-pages.mjs
BASE_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000) node scripts/verify-interactions.mjs

```

## Printable Study Sheets

Both linear lessons (`sucesiones.html` and `valor-absoluto.html`) include a dedicated `#sec-repaso` summary table at the end of the page with a **Print / Export to PDF** trigger. Dedicated `@media print` rules strip out interactive sliders, navigation bars, and the Visual Novel HUD, formatting the comparison tables into clean black-on-white study sheets for offline exam review.

```