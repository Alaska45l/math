/**
 * Parser y evaluador de expresiones de potencias y radicales en R.
 * No usa eval ni compila código. El AST conserva la precedencia del signo:
 * -a^n se representa como neg(pow(a,n)), mientras que (-a)^n eleva la base negativa.
 */
const MINUS = "\u2212";

function tokenize(source) {
  if (typeof source !== "string" || !source.trim())
    throw syntax("Ingresá una expresión.", "empty");
  if (source.length > 300)
    throw syntax("La expresión es demasiado larga.", "too_long");
  const text = source
    .replace(/[−–—]/g, "-")
    .replace(/(root\s*\(\s*-?\d+)\s*,/gi, "$1§")
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/§/g, ",")
    .replace(/[·×⋅]/g, "*")
    .replace(/[÷:]/g, "/");
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    if (/\s/.test(text[i])) {
      i++;
      continue;
    }
    const rest = text.slice(i);
    const num = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (num) {
      tokens.push({ type: "number", value: Number(num[0]), raw: num[0] });
      i += num[0].length;
      continue;
    }
    const word = rest.match(/^[a-zA-Z]+/);
    if (word) {
      const name = word[0].toLowerCase();
      if (["sqrt", "root", "abs"].includes(name)) tokens.push({ type: name });
      else if (/^[xab]$/.test(name)) tokens.push({ type: "variable", name });
      else
        throw syntax(
          `Variable o función desconocida: ${word[0]}.`,
          "unknown_name",
        );
      i += word[0].length;
      continue;
    }
    if (text[i] === "√") {
      tokens.push({ type: "root2" });
      i++;
      continue;
    }
    if (text[i] === "∛") {
      tokens.push({ type: "root3" });
      i++;
      continue;
    }
    if ("+-*/^(),|".includes(text[i])) {
      tokens.push({ type: text[i] });
      i++;
      continue;
    }
    throw syntax(`Carácter no permitido: ${text[i]}.`, "unexpected_character");
  }
  // Multiplicación implícita: 3x, 2sqrt(3), (x+1)(x-1), 2|x|.
  const out = [];
  const ends = (t) => ["number", "variable", ")", "|close"].includes(t?.type);
  const starts = (t) =>
    [
      "number",
      "variable",
      "(",
      "sqrt",
      "root",
      "root2",
      "root3",
      "abs",
      "|open",
    ].includes(t?.type);
  for (let j = 0; j < tokens.length; j++) {
    const t = tokens[j];
    if (t.type === "|") {
      const prev = out[out.length - 1];
      const closes = ends(prev);
      t.type = closes ? "|close" : "|open";
    }
    out.push(t);
    const next = tokens[j + 1];
    if (ends(t) && starts(next)) out.push({ type: "*" });
  }
  return out;
}

function syntax(message, code) {
  const e = new SyntaxError(message);
  e.code = code;
  return e;
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.i = 0;
  }
  peek(type) {
    return this.tokens[this.i]?.type === type;
  }
  take(type) {
    if (!this.peek(type))
      throw syntax(`Se esperaba '${type}'.`, "expected_token");
    return this.tokens[this.i++];
  }
  parse() {
    const ast = this.add();
    if (this.i !== this.tokens.length)
      throw syntax("Hay un token inesperado al final.", "trailing_token");
    return ast;
  }
  add() {
    let n = this.mul();
    while (this.peek("+") || this.peek("-")) {
      const op = this.tokens[this.i++].type;
      n = { type: "binary", op, left: n, right: this.mul() };
    }
    return n;
  }
  mul() {
    let n = this.unary();
    while (this.peek("*") || this.peek("/")) {
      const op = this.tokens[this.i++].type;
      n = { type: "binary", op, left: n, right: this.unary() };
    }
    return n;
  }
  unary() {
    if (this.peek("+") || this.peek("-")) {
      const op = this.tokens[this.i++].type;
      return op === "+" ? this.unary() : { type: "neg", value: this.unary() };
    }
    return this.power();
  }
  power() {
    let n = this.primary();
    if (this.peek("^")) {
      this.i++;
      n = { type: "pow", base: n, exponent: this.unary() };
    }
    return n;
  }
  primary() {
    if (this.peek("number"))
      return { type: "number", value: this.tokens[this.i++].value };
    if (this.peek("variable"))
      return { type: "variable", name: this.tokens[this.i++].name };
    if (this.peek("(")) {
      this.i++;
      const n = this.add();
      this.take(")");
      return n;
    }
    if (this.peek("|open")) {
      this.i++;
      const value = this.add();
      this.take("|close");
      return { type: "abs", value };
    }
    if (this.peek("root2")) {
      this.i++;
      if (this.peek("(")) {
        this.i++;
        const radicand = this.add();
        this.take(")");
        return { type: "root", index: { type: "number", value: 2 }, radicand };
      }
      return {
        type: "root",
        index: { type: "number", value: 2 },
        radicand: this.primary(),
      };
    }
    if (this.peek("root3")) {
      this.i++;
      if (this.peek("(")) {
        this.i++;
        const radicand = this.add();
        this.take(")");
        return { type: "root", index: { type: "number", value: 3 }, radicand };
      }
      return {
        type: "root",
        index: { type: "number", value: 3 },
        radicand: this.primary(),
      };
    }
    if (this.peek("sqrt") || this.peek("root") || this.peek("abs")) {
      const fn = this.tokens[this.i++].type;
      this.take("(");
      if (fn === "root") {
        const index = this.add();
        this.take(",");
        const radicand = this.add();
        this.take(")");
        return { type: "root", index, radicand };
      }
      const value = this.add();
      this.take(")");
      return fn === "abs"
        ? { type: "abs", value }
        : {
            type: "root",
            index: { type: "number", value: 2 },
            radicand: value,
          };
    }
    throw syntax(
      "Se esperaba un número, variable, paréntesis o raíz.",
      "expected_expression",
    );
  }
}

export function parsePowRad(input) {
  return new Parser(tokenize(input)).parse();
}

/** Previsualización segura de lo que el parser entendió mientras se escribe. */
export function toDisplay(input) {
  const source = String(input ?? "").trim();
  if (!source) return "";
  return source
    .replace(/[–—-]/g, "−")
    .replace(/\bsqrt\s*\(/gi, "√(")
    .replace(/\*/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
}

function rationalValue(ast) {
  if (ast?.type === "number") {
    if (!Number.isFinite(ast.value)) return null;
    if (Number.isInteger(ast.value)) return { n: ast.value, d: 1 };
    const source = String(ast.value);
    if (source.includes("e")) return null;
    const decimals = source.split(".")[1]?.length || 0;
    const denominator = 10 ** decimals;
    return normalizeRational(Math.round(ast.value * denominator), denominator);
  }
  if (ast?.type === "neg") {
    const r = rationalValue(ast.value);
    return r && normalizeRational(-r.n, r.d);
  }
  if (ast?.type === "binary" && ["+", "-", "/", "*"].includes(ast.op)) {
    const a = rationalValue(ast.left),
      b = rationalValue(ast.right);
    if (!a || !b) return null;
    if (ast.op === "/" && b.n === 0) return null;
    if (ast.op === "+")
      return normalizeRational(a.n * b.d + b.n * a.d, a.d * b.d);
    if (ast.op === "-")
      return normalizeRational(a.n * b.d - b.n * a.d, a.d * b.d);
    if (ast.op === "/") return normalizeRational(a.n * b.d, a.d * b.n);
    return normalizeRational(a.n * b.n, a.d * b.d);
  }
  return null;
}

function normalizeRational(numerator, denominator) {
  if (
    !Number.isSafeInteger(numerator) ||
    !Number.isSafeInteger(denominator) ||
    denominator === 0
  )
    return null;
  const sign = denominator < 0 ? -1 : 1;
  let a = Math.abs(numerator),
    b = Math.abs(denominator);
  while (b) [a, b] = [b, a % b];
  const divisor = a || 1;
  return {
    n: (sign * numerator) / divisor,
    d: Math.abs(denominator) / divisor,
  };
}

export function evalPowRad(ast, vars = {}) {
  const fail = (errorReason) => ({
    value: NaN,
    domainError: true,
    errorReason,
  });
  const ev = (n) => {
    if (!n) return fail("invalid_ast");
    if (n.type === "number") return { value: n.value };
    if (n.type === "variable")
      return Number.isFinite(Number(vars[n.name]))
        ? { value: Number(vars[n.name]) }
        : fail(`missing_variable:${n.name}`);
    if (n.type === "neg" || n.type === "abs") {
      const v = ev(n.value);
      return v.domainError
        ? v
        : { value: n.type === "neg" ? -v.value : Math.abs(v.value) };
    }
    if (n.type === "binary") {
      const a = ev(n.left),
        b = ev(n.right);
      if (a.domainError) return a;
      if (b.domainError) return b;
      if (n.op === "/" && b.value === 0) return fail("division_by_zero");
      return {
        value:
          n.op === "+"
            ? a.value + b.value
            : n.op === "-"
              ? a.value - b.value
              : n.op === "*"
                ? a.value * b.value
                : a.value / b.value,
      };
    }
    if (n.type === "pow") {
      const a = ev(n.base),
        b = ev(n.exponent);
      if (a.domainError) return a;
      if (b.domainError) return b;
      const q = rationalValue(n.exponent);
      if (a.value === 0 && b.value < 0) return fail("zero_to_negative_power");
      if (a.value < 0) {
        if (!q || !Number.isInteger(q.d) || q.d % 2 === 0)
          return fail("even_root_of_negative");
        const v =
          Math.sign(q.n % 2 === 0 ? 1 : -1) *
          Math.pow(Math.abs(a.value), b.value);
        return Number.isFinite(v) ? { value: v } : fail("non_finite_result");
      }
      const value = Math.pow(a.value, b.value);
      return Number.isFinite(value) ? { value } : fail("non_finite_result");
    }
    if (n.type === "root") {
      const idx = ev(n.index),
        x = ev(n.radicand);
      if (idx.domainError) return idx;
      if (x.domainError) return x;
      const k = idx.value;
      if (!Number.isInteger(k) || k === 0) return fail("invalid_root_index");
      const order = Math.abs(k);
      if (x.value < 0 && order % 2 === 0) return fail("even_root_of_negative");
      if (x.value === 0 && k < 0) return fail("division_by_zero");
      const root =
        x.value < 0
          ? -Math.pow(-x.value, 1 / order)
          : Math.pow(x.value, 1 / order);
      return { value: k < 0 ? 1 / root : root };
    }
    return fail("unknown_ast_node");
  };
  return ev(ast);
}

/** Descompone factores y extrae grupos completos de tamaño index. */
export function simplifyRadical(coeff, radicandInt, varPowers = {}, index = 2) {
  if (
    !Number.isInteger(index) ||
    index < 2 ||
    !Number.isInteger(radicandInt) ||
    radicandInt < 0
  )
    throw new RangeError(
      "Se requiere índice entero ≥ 2 y radicando entero no negativo.",
    );
  const primes = [];
  let rest = radicandInt;
  for (let p = 2; p * p <= rest; p++)
    while (rest % p === 0) {
      primes.push(p);
      rest /= p;
    }
  if (rest > 1) primes.push(rest);
  const counts = new Map();
  primes.forEach((p) => counts.set(p, (counts.get(p) || 0) + 1));
  let outsideCoeff = coeff;
  const insideFactors = [],
    groups = [];
  for (const [prime, count] of counts) {
    const extracted = Math.floor(count / index),
      remain = count % index;
    if (extracted) {
      outsideCoeff *= prime ** extracted;
      groups.push({
        factor: prime,
        count: extracted * index,
        outside: prime ** extracted,
      });
    }
    if (remain) insideFactors.push(prime ** remain);
  }
  const outsideVars = {},
    insideVars = {};
  for (const [name, power] of Object.entries(varPowers)) {
    const p = Number(power);
    if (!Number.isInteger(p) || p < 0)
      throw new RangeError(`Exponente inválido para ${name}.`);
    outsideVars[name] = Math.floor(p / index);
    insideVars[name] = p % index;
    if (outsideVars[name])
      groups.push({
        factor: name,
        count: outsideVars[name] * index,
        outside: `${name}^${outsideVars[name]}`,
      });
    if (!insideVars[name]) delete insideVars[name];
    if (!outsideVars[name]) delete outsideVars[name];
  }
  return {
    outsideCoeff,
    outsideVars,
    insideInt: insideFactors.reduce((a, b) => a * b, 1),
    insideVars,
    primeFactors: primes,
    groups,
  };
}

export function compareAdditiveVsMultiplicative(x, fraction = 0.5) {
  if (!(x > 0) || !(fraction >= 0 && fraction <= 1))
    throw new RangeError("Se requiere x > 0 y fracción entre 0 y 1.");
  return {
    additiveNeutral: 0,
    additiveHalf: x * fraction,
    additiveSteps: [0, x * fraction, x],
    multiplicativeNeutral: 1,
    multiplicativeHalf: Math.pow(x, fraction),
    multiplicativeSteps: [1, Math.pow(x, fraction), x],
  };
}

export function diagnosePowRad(userInput, expectedSpec = {}) {
  const input = String(userInput ?? "")
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/\s/g, "")
    .toLowerCase();
  const spec =
    typeof expectedSpec === "number"
      ? { value: expectedSpec }
      : expectedSpec || {};
  const add = (id, message, severity = "error") => ({ id, message, severity });
  const numeric = Number(input.replace(",", "."));
  const expected = Number(spec.value ?? spec.expected ?? spec.answer);
  const context =
    `${spec.context || ""} ${spec.expression || ""} ${spec.prompt || ""}`.toLowerCase();
  const rules = [
    [
      "zero_exponent_is_zero",
      /(?:\^0|exponente.?0|zero.?exponent)/.test(context) &&
        (numeric === 0 || input === "a"),
      "El exponente cuenta pasos multiplicativos: con cero pasos quedás en 1.",
    ],
    [
      "additive_instead_of_multiplicative",
      (() => {
        const m = context.match(/(-?\d+(?:\.\d+)?)\^(\d+)/);
        return m && Number(m[2]) > 0 && numeric === Number(m[1]) * Number(m[2]);
      })(),
      "Estás contando suma repetida; una potencia repite factores multiplicativos.",
    ],
    [
      "negative_exponent_is_negative_number",
      /(?:\^-|negativo)/.test(context) && numeric < 0,
      "El exponente negativo invierte la escala; no cambia el signo de la base.",
    ],
    [
      "canceled_to_zero_or_counted_ones",
      /(?:3\^4.*3\^10|cancel|cociente)/.test(context) &&
        (numeric === 0 || /4\/(?:3\^?6|729)/.test(input)),
      "Cada pareja forma ×1; los unos se multiplican y el residuo queda en el denominador.",
    ],
    [
      "distributed_power_over_sum",
      /(?:binom|suma|ra[ií]z.*suma)/.test(context) &&
        /a\^?2\+?b\^?2|4-?9x\^?2|x\+3/.test(input),
      "La potencia no se distribuye sobre suma: aparecen términos cruzados.",
    ],
    [
      "neg_base_precedence",
      /(?:precedencia|par[eé]ntesis|\-4\^2|ra[ií]z.*impar)/.test(context) &&
        (numeric === 16 || /\(-?4\)\^?2/.test(input)),
      "El exponente afecta primero a la base escrita; el signo externo queda afuera si no hay paréntesis.",
    ],
    [
      "forgot_abs_in_even_root",
      /(?:sqrt\(x\^2\)|ra[ií]z.*cuadrad|valor absoluto)/.test(context) &&
        /^(?:x|-?\d+(?:\.\d+)?)$/.test(input),
      "La raíz cuadrada principal devuelve un valor no negativo: √(x²) = |x|.",
    ],
    [
      "illegal_real_root_distribution",
      /(?:dominio|reales|ra[ií]z.*negativ)/.test(context) &&
        /sqrt\(-/.test(input),
      "Una raíz de índice par de un número negativo no existe en ℝ.",
    ],
    [
      "multiplied_bases_in_same_base_prod",
      /(?:misma base|producto.*potencia|2\^3.*2\^4)/.test(context) &&
        /4\^7|8\^n/.test(input),
      "Con la misma base, se suman exponentes y la base permanece igual.",
    ],
  ];
  const found = rules.find(([, ok]) => ok);
  if (found)
    return {
      correct: false,
      diagnostics: [add(found[0], found[2])],
      status: "diagnosed",
    };
  if (
    Number.isFinite(expected) &&
    Number.isFinite(numeric) &&
    Math.abs(expected - numeric) < 1e-9
  )
    return { correct: true, diagnostics: [], status: "correct" };
  if (Number.isFinite(expected) || spec.answer || spec.expectedExpression) {
    try {
      const parsed = parsePowRad(userInput);
      const result = evalPowRad(parsed, spec.vars || {});
      const target = Number.isFinite(expected) ? expected : Number(spec.answer);
      if (
        !result.domainError &&
        Number.isFinite(target) &&
        Math.abs(result.value - target) < 1e-9
      ) {
        const canonicalize = (value) =>
          String(value)
            .replace(/[−–—]/g, "-")
            .replace(/\s|\*/g, "")
            .replace(/∛(\d+|\([^)]*\))/g, "root(3,$1)")
            .toLowerCase();
        if (
          spec.requireSimplified &&
          spec.canonical &&
          canonicalize(input) !== canonicalize(spec.canonical)
        ) {
          return {
            correct: false,
            diagnostics: [
              add(
                "unsimplified_radical",
                "La expresión vale lo mismo, pero todavía quedan factores que pueden salir de la raíz.",
                "warn",
              ),
            ],
            status: "unsimplified",
          };
        }
        return { correct: true, diagnostics: [], status: "correct" };
      }
    } catch (_) {
      /* syntax feedback returned below */
    }
  }
  return { correct: false, diagnostics: [], status: "incorrect" };
}
