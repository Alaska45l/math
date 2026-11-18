/**
 * dimensional/logic.js — Lógica pura del laboratorio de análisis dimensional.
 * Un "mapa de unidades" es { unidad: exponente } (positivo = numerador).
 */

/** Equivalencias: 1 a = b -> factores unitarios b/a o a/b (ambos valen 1). */
export const FACTORS = {
  L_mL: { a: [1, 'L'], b: [1000, 'mL'] },
  min_s: { a: [1, 'min'], b: [60, 's'] },
  h_min: { a: [1, 'h'], b: [60, 'min'] },
  km_m: { a: [1, 'km'], b: [1000, 'm'] },
  m_cm: { a: [1, 'm'], b: [100, 'cm'] },
  kg_g: { a: [1, 'kg'], b: [1000, 'g'] },
};

/** Problemas (las etiquetas usan exponentes negativos para evitar la barra inclinada). */
export const PROBLEMS = [
  { t: '18 L·min⁻¹ → mL·s⁻¹', v: 18, from: { L: 1, min: -1 }, to: { mL: 1, s: -1 }, facs: ['L_mL', 'min_s', 'h_min'], sol: [['L_mL', 0], ['min_s', 1]] },
  { t: '90 km·h⁻¹ → m·s⁻¹', v: 90, from: { km: 1, h: -1 }, to: { m: 1, s: -1 }, facs: ['km_m', 'h_min', 'min_s'], sol: [['km_m', 0], ['h_min', 1], ['min_s', 1]] },
  { t: '5 m·s⁻¹ → km·h⁻¹', v: 5, from: { m: 1, s: -1 }, to: { km: 1, h: -1 }, facs: ['km_m', 'min_s', 'h_min'], sol: [['km_m', 1], ['min_s', 0], ['h_min', 0]] },
  { t: '2,5 g·cm⁻³ → kg·m⁻³', v: 2.5, from: { g: 1, cm: -3 }, to: { kg: 1, m: -3 }, facs: ['kg_g', 'm_cm'], sol: [['kg_g', 1], ['m_cm', 0], ['m_cm', 0], ['m_cm', 0]] },
  { t: '36.000 mL·h⁻¹ → L·min⁻¹', v: 36000, from: { mL: 1, h: -1 }, to: { L: 1, min: -1 }, facs: ['L_mL', 'h_min'], sol: [['L_mL', 1], ['h_min', 1]] },
];

export const MAX_STEPS = 8;
export const CUBE_PROBLEM = 3;

/** Quita exponentes nulos. */
export const clean = (m) => Object.fromEntries(Object.entries(m).filter(([, e]) => e));

export function sameUnits(a, b) {
  const ca = clean(a), cb = clean(b);
  const ka = Object.keys(ca);
  return ka.length === Object.keys(cb).length && ka.every((u) => ca[u] === cb[u]);
}

/** Paso: orientación 0 -> b/a (top = b) ; orientación 1 -> a/b (top = a). */
export function makeStep(k, o) {
  const f = FACTORS[k];
  return Object.freeze(o === 0 ? { k, o, top: f.b, bot: f.a } : { k, o, top: f.a, bot: f.b });
}

/** compute(state): acumula unidades, clasifica fichas y arma diagnósticos. */
export function compute(state) {
  const p = PROBLEMS[state.p];
  const units = { ...p.from };
  let N = 1, D = 1;
  const log = [];
  state.steps.forEach((st) => {
    const before = { ...units };
    units[st.top[1]] = (units[st.top[1]] || 0) + 1;
    units[st.bot[1]] = (units[st.bot[1]] || 0) - 1;
    N *= st.top[0];
    D *= st.bot[0];
    const neutral = (before[st.bot[1]] || 0) > 0 || (before[st.top[1]] || 0) < 0;
    log.push({ step: st, before, after: clean(units), neutral });
  });
  const remaining = clean(units);

  /* Términos de la cadena multiplicativa */
  const initial = { n: [], d: [], nv: state.v, dv: null };
  Object.entries(p.from).forEach(([u, e]) => {
    for (let i = 0; i < Math.abs(e); i++) initial[e > 0 ? 'n' : 'd'].push({ u });
  });
  const terms = [initial, ...state.steps.map((st) => ({
    n: [{ u: st.top[1] }], d: [{ u: st.bot[1] }], nv: st.top[0], dv: st.bot[0],
  }))];

  /* Emparejamiento pin (numerador) <-> hueco (denominador) de la misma unidad */
  const all = [];
  terms.forEach((t, ti) => {
    t.n.forEach((x) => all.push(Object.assign(x, { side: 'n', term: ti })));
    t.d.forEach((x) => all.push(Object.assign(x, { side: 'd', term: ti })));
  });
  const groups = {};
  all.forEach((x) => ((groups[x.u] ??= { n: [], d: [] })[x.side]).push(x));
  let pairId = 0;
  Object.values(groups).forEach((g) => {
    for (let i = 0; i < Math.min(g.n.length, g.d.length); i++) {
      g.n[i].pair = g.d[i].pair = pairId++;
    }
  });
  const lastTerm = state.steps.length;
  all.forEach((x) => {
    if (x.pair !== undefined) {
      x.status = 'neutral';
    } else {
      x.status = (p.to[x.u] || 0) * (x.side === 'n' ? 1 : -1) > 0 ? 'wanted' : 'pending';
    }
  });
  // Pares formados en el último paso -> animación "fresh"
  const freshPairs = new Set(all.filter((x) => x.pair !== undefined && x.term === lastTerm && lastTerm > 0).map((x) => x.pair));
  all.forEach((x) => { x.fresh = x.pair !== undefined && freshPairs.has(x.pair); });

  // Apiladas: más fichas libres del mismo lado de las que el problema justifica
  Object.entries(groups).forEach(([u, g]) => {
    ['n', 'd'].forEach((side) => {
      const free = g[side].filter((x) => x.pair === undefined);
      if (free.length > Math.max(Math.abs(p.from[u] || 0), Math.abs(p.to[u] || 0))) {
        free.forEach((x) => { x.status = 'stacked'; });
      }
    });
  });

  const solved = sameUnits(remaining, p.to);
  const stacked = all.some((x) => x.status === 'stacked');
  const value = (state.v * N) / D;
  const actual = N > D ? 'up' : 'down';

  let msgKind = 'start';
  if (state.steps.length) msgKind = solved ? 'solved' : stacked ? 'stacked' : 'progress';
  const predictionOk = solved && state.prediction ? state.prediction === actual : null;

  const cubeApplied = state.steps.filter((st) => st.k === 'm_cm' && st.o === 0).length;
  const solutionRevealed = Boolean(state.solutionRevealed);
  const solvedAutonomous = solved && !solutionRevealed;

  return {
    problem: p,
    terms,
    remaining,
    N,
    D,
    value,
    actual,
    log,
    solved,
    stacked,
    msgKind,
    predictionOk,
    cubeApplied,
    solutionRevealed,
    solvedAutonomous,
  };
}

/* ------------------------------------------------------------------ */
/* Evaluador numérico y diagnóstico cognitivo dimensional             */
/* ------------------------------------------------------------------ */

export function parseNumericAnswer(raw) {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : NaN;
  if (typeof raw !== 'string') return NaN;
  let s = raw.trim().replace(/\u2212/g, '-').replace(/\s+/g, '');
  if (!s) return NaN;

  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length !== 2) return NaN;
    const a = parseNumericAnswer(parts[0]);
    const b = parseNumericAnswer(parts[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(b) < 1e-12) return NaN;
    return a / b;
  }

  if (/^-?[1-9]\d{0,2}(?:\.\d{3})+(?:,\d+)?$/.test(s)) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(',', '.');
  }
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? (Object.is(n, -0) ? 0 : n) : NaN;
}

function matchesTrap(val, trapSpec, tol = 1e-3) {
  if (trapSpec === undefined || trapSpec === null) return false;
  const list = Array.isArray(trapSpec) ? trapSpec : [trapSpec];
  return list.some((t) => Number.isFinite(t) && Math.abs(val - t) <= Math.max(tol, Math.abs(t) * 1e-3));
}

const DIAG_DEFS = Object.freeze({
  inverted_conversion_factor: {
    id: 'inverted_conversion_factor',
    category: 'procedural',
    pose: 'sospecha',
    competencyId: 'units.unitary_factor_neutral_one',
    message:
      'Invertiste la fracción unitaria: pusiste la unidad a cancelar del mismo lado en vez de enfrentarla (pin con hueco) para formar el neutro 1.',
  },
  forgot_power_exponent_on_unit: {
    id: 'forgot_power_exponent_on_unit',
    category: 'conceptual',
    pose: 'colapso',
    competencyId: 'units.compound_rates_and_powers',
    message:
      'Aplicaste el factor de longitud (100 cm / 1 m) una sola vez, pero cm³ = cm · cm · cm exige elevarlo al cubo (100³ = 1.000.000).',
  },
  confused_prefix_scale_power10: {
    id: 'confused_prefix_scale_power10',
    category: 'arithmetic',
    pose: 'pensativa',
    competencyId: 'units.unitary_factor_neutral_one',
    message:
      'Revisá la equivalencia del prefijo o del tiempo: 1 L = 1.000 mL, 1 kg = 1.000 g, 1 km = 1.000 m, 1 h = 60 min y 1 min = 60 s.',
  },
  omitted_target_unit_or_direction: {
    id: 'omitted_target_unit_or_direction',
    category: 'representation',
    pose: 'unamused',
    competencyId: 'units.compound_rates_and_powers',
    message:
      'Revisá la dirección de la escala o si convertiste una sola unidad dejando la otra sin transformar.',
  },
});

export function diagnoseDimensional(userInput, context = {}) {
  // 1. Diagnóstico sobre estado del pizarrón manipulativo
  if (context.state && context.computed) {
    const { state, computed } = context;
    if (computed.stacked) {
      return { ...DIAG_DEFS.inverted_conversion_factor };
    }
    if (
      state.p === CUBE_PROBLEM &&
      !computed.solved &&
      computed.cubeApplied > 0 &&
      computed.cubeApplied < 3 &&
      sameUnits({ ...computed.remaining, cm: 0, m: 0 }, { kg: 1 })
    ) {
      return { ...DIAG_DEFS.forgot_power_exponent_on_unit };
    }
    if (computed.solved && computed.predictionOk === false) {
      return { ...DIAG_DEFS.omitted_target_unit_or_direction };
    }
    return null;
  }

  // 2. Diagnóstico sobre respuestas de chequeos
  const spec = context.spec || context;
  if (!spec) return null;

  if (spec.type === 'choice' && spec.trapMap) {
    const diagId = spec.trapMap[Number(userInput)];
    return diagId && DIAG_DEFS[diagId] ? { ...DIAG_DEFS[diagId] } : null;
  }

  const val = parseNumericAnswer(userInput);
  if (!Number.isFinite(val)) return null;

  if (spec.expected !== undefined && Math.abs(val - spec.expected) <= Math.max(1e-4, Math.abs(spec.expected) * 1e-3)) {
    return null;
  }

  if (matchesTrap(val, spec.trapInverted)) {
    return { ...DIAG_DEFS.inverted_conversion_factor };
  }
  if (matchesTrap(val, spec.trapLinearPower)) {
    return { ...DIAG_DEFS.forgot_power_exponent_on_unit };
  }
  if (matchesTrap(val, spec.trapPower10)) {
    return { ...DIAG_DEFS.confused_prefix_scale_power10 };
  }
  if (matchesTrap(val, spec.trapSingleUnitOnly)) {
    return { ...DIAG_DEFS.omitted_target_unit_or_direction };
  }

  return null;
}
