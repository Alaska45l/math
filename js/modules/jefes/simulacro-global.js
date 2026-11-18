/**
 * @file js/modules/jefes/simulacro-global.js
 * Simulacro Integrador Global (Unidades 01-11):
 * 5 Encuentros Integradores x 5 Fases Activas + Fase 6 Debrief.
 * Basado en Actividades de Integración (2) y Exámenes Globales / Parciales UNMDP.
 * Todas las respuestas abiertas se validan con evaluadores matemáticos puros (cero comparación textual).
 */

import { renderNav, initLessonDock } from '../../core/nav.js';
import { initGlossary } from '../../core/glossary.js';
import { mountBossArena } from '../../core/learning/boss-engine.js';
import {
  areCongruent,
  exactTrigFromGiven,
  exactRadicalEq,
  exactRadicalNeg,
  parseExactRadical,
  solveQuadraticTrigEq,
  parseAngleInput,
} from '../../core/math/trigonometry.js';
import {
  parseOrderedPair,
  equivalentSetExactas,
  parseNumberOrFraction as parseQuadNumberOrFraction,
} from '../cuadraticas/expr.js';
import { equivalentPolyExpr } from '../polinomios/expr.js';
import { parsePowRad, evalPowRad } from '../potencias-raices/expr.js';
import { equivalentRationalExpr } from '../racionales-irracionales/expr.js';
import { parseSystemPair, equivalentSystem2x2, equivalentSolutionSet2x2 } from '../sistemas/expr.js';
import { parseExp, evalExp, extractExpParams } from '../exponenciales/expr.js';
import { evalLogExpr } from '../logaritmicas/expr.js';
import {
  hasRadicalInDenominator,
  equivalentCongruenceUnion,
  parseNumberOrFraction as parseTrigNumberOrFraction,
} from '../funciones-trigonometricas/expr.js';

function approxEqual(a, b, tol = 1e-6) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;
}

function normalizeRadicalInput(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/\bcbrt\s*\(/gi, 'root(3,')
    .replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)√\s*\(([^)]+)\)/g, (_, sup, inner) => {
      const map = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
      const idx = Array.from(sup).map((c) => map[c] || c).join('');
      return `root(${idx},${inner})`;
    })
    .replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)√\s*(\d+)/g, (_, sup, num) => {
      const map = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
      const idx = Array.from(sup).map((c) => map[c] || c).join('');
      return `root(${idx},${num})`;
    });
}

function isSimplifiedCubicRadicalAst(ast) {
  let hasAddSub = false;
  let unsimplified = false;

  const evalNum = (n) => {
    const r = evalPowRad(n, {});
    return r.domainError ? NaN : r.value;
  };

  const walk = (node, insidePowerOrRoot = false) => {
    if (!node) return;
    if (node.type === 'binary') {
      if ((node.op === '+' || node.op === '-') && !insidePowerOrRoot) {
        hasAddSub = true;
      }
      walk(node.left, insidePowerOrRoot);
      walk(node.right, insidePowerOrRoot);
      return;
    }
    if (node.type === 'neg') {
      walk(node.value, insidePowerOrRoot);
      return;
    }
    if (node.type === 'root') {
      const idx = evalNum(node.index);
      const rad = evalNum(node.radicand);
      if (!Number.isInteger(idx) || idx !== 3 || !Number.isFinite(rad) || Math.abs(rad - 3) > 1e-9) {
        unsimplified = true;
      }
      return;
    }
    if (node.type === 'pow') {
      const base = evalNum(node.base);
      const exp = evalNum(node.exponent);
      if (!Number.isFinite(base) || !Number.isFinite(exp)) {
        unsimplified = true;
        return;
      }
      if (!Number.isInteger(exp)) {
        if (Math.abs(exp - 1 / 3) > 1e-6 || Math.abs(base - 3) > 1e-9) {
          unsimplified = true;
        }
      } else if (exp > 1 && Math.abs(base - 3) < 1e-9) {
        unsimplified = true;
      }
    }
  };

  walk(ast, false);
  return !hasAddSub && !unsimplified;
}

function validateSimplifiedCubeRoot3(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá la expresión exacta simplificada.' };

  let ast;
  try {
    ast = parsePowRad(normalizeRadicalInput(s));
  } catch (err) {
    return { syntaxError: err.message };
  }

  const res = evalPowRad(ast, {});
  if (res.domainError || !Number.isFinite(res.value)) {
    return {
      ok: false,
      diagnosticId: 'illegal_real_root_distribution',
      feedback: 'La expresión no produce un número real válido.',
    };
  }

  const target = 12 * Math.cbrt(3);
  if (Math.abs(res.value - target) <= 1e-6) {
    if (!isSimplifiedCubicRadicalAst(ast)) {
      return {
        ok: false,
        diagnosticId: 'unsimplified_radical',
        feedback: 'El valor numérico coincide, pero todavía quedan factores por extraer o radicales semejantes por reducir hasta su mínima expresión (k·∛3).',
      };
    }
    return {
      ok: true,
      feedback: '¡Exacto! 4·∛81 − ⁶√9 + (1/2)·∛24 = 12∛3 − ∛3 + ∛3 = 12∛3.',
    };
  }

  return {
    ok: false,
    diagnosticId: 'unsimplified_radical',
    feedback: 'Revisá la extracción de factores primos (81 = 3⁴, 9 = 3², 24 = 2³·3) y la simplificación de índices ⁶√(3²) = ∛3.',
  };
}

function validatePolyFactored(raw, expectedExpr, feedbackOk, feedbackBad) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá la expresión factorizada de P(x).' };
  const eq = equivalentPolyExpr(s, expectedExpr, 'factored');
  if (eq.status === 'syntax_error') return { syntaxError: eq.error };
  if (eq.equivalent && eq.sameForm) return { ok: true, feedback: feedbackOk };
  if (eq.equivalent && !eq.sameForm) {
    return {
      ok: false,
      diagnosticId: 'forgot_leading_coeff_factoring',
      feedback: 'El polinomio es algebraicamente equivalente, pero debe quedar escrito en forma factorizada completa en factores primos reales.',
    };
  }
  const monicCheck = equivalentPolyExpr(s, 'x*(x+3)*(x-2)^2');
  if (monicCheck.equivalent) {
    return {
      ok: false,
      diagnosticId: 'forgot_leading_coeff_factoring',
      feedback: 'Falta ajustar el coeficiente principal a usando la condición P(−1) = 6.',
    };
  }
  return { ok: false, diagnosticId: 'ruffini_sign_error', feedback: feedbackBad };
}

function validatePair(raw, expectedPair, feedbackOk, feedbackBad, wrongSignDiag, otherDiag) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá el par ordenado (x; y).' };
  try {
    const p = parseOrderedPair(s);
    const exp = parseOrderedPair(expectedPair);
    if (approxEqual(p.x, exp.x, 1e-4) && approxEqual(p.y, exp.y, 1e-4)) {
      return { ok: true, feedback: feedbackOk };
    }
    if (typeof wrongSignDiag === 'function') {
      const specific = wrongSignDiag(p, exp);
      if (specific) return { ok: false, diagnosticId: specific, feedback: feedbackBad };
    }
    return { ok: false, diagnosticId: otherDiag, feedback: feedbackBad };
  } catch (err) {
    return { syntaxError: err.message };
  }
}

function validateSystemSetup(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá las dos ecuaciones separadas por punto y coma (;).' };

  const cleaned = s.replace(/^\s*\{\s*/, '').replace(/\s*\}\s*$/, '').trim();
  const parts = cleaned
    .split(/\s*[;\n]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length !== 2) {
    return {
      syntaxError: 'Escribí exactamente dos ecuaciones lineales separadas por punto y coma (;), por ejemplo: ax + by = c ; dx + ey = f.',
    };
  }

  const usesAB = /[ab]/i.test(cleaned) && !/[xy]/i.test(cleaned);
  const varNames = usesAB ? ['a', 'b'] : ['x', 'y'];
  const parsed = parseSystemPair(parts[0], parts[1], varNames);
  if (!parsed.ok) {
    return { syntaxError: parsed.errorMessage };
  }

  const expected = parseSystemPair('2x + 4y = 120', '5x + 3y = 195', ['x', 'y']);
  if (equivalentSystem2x2(parsed, expected)) {
    return {
      ok: true,
      feedback: '¡Sistema perfecto! 2A + 4B = 120 (ácido acético) y 5A + 3B = 195 (hidróxido de sodio).',
    };
  }

  const swapped = parseSystemPair('2x + 5y = 120', '4x + 3y = 195', ['x', 'y']);
  if (equivalentSystem2x2(parsed, swapped)) {
    return {
      ok: false,
      diagnosticId: 'reversed_comparison_difference',
      feedback: 'Cuidado: mezclaste las filas de reactivos con las columnas de soluciones. Revisá cuánto aporta cada solución a cada reactivo.',
    };
  }

  return {
    ok: false,
    diagnosticId: 'unrealistic_or_unchecked_solution_in_context',
    feedback: 'El sistema no coincide con las masas disponibles de ácido acético (120 g) e hidróxido de sodio (195 g).',
  };
}

function validateSystemSolution(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá el par solución (A; B).' };
  try {
    if (equivalentSolutionSet2x2(s, '(30; 15)')) {
      return {
        ok: true,
        feedback: '¡Exacto! Deben prepararse 30 litros de solución A y 15 litros de solución B: (30; 15).',
      };
    }
    if (equivalentSolutionSet2x2(s, '(15; 30)')) {
      return {
        ok: false,
        diagnosticId: 'forgot_to_find_second_variable',
        feedback: 'Invertiste el orden del par: A = 30 litros y B = 15 litros.',
      };
    }
    return {
      ok: false,
      diagnosticId: 'sign_error_in_elimination_or_substitution',
      feedback: 'La dupla no verifica simultáneamente 2A + 4B = 120 y 5A + 3B = 195.',
    };
  } catch (err) {
    return { syntaxError: err.message };
  }
}

function validateExpBacteriaModel(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá la fórmula M(t) en función de t (en horas).' };

  let tree;
  try {
    const parsed = parseExp(s);
    tree = parsed.tree;
  } catch (err) {
    return { syntaxError: err.message };
  }

  const expectedM0 = 200 / Math.pow(1.035, 12);
  const probes = [0, 10, 50, 120];
  let allMatch = true;
  for (const t of probes) {
    const val = evalExp(tree, { t, x: t });
    const expVal = expectedM0 * Math.pow(1.035, t / 10);
    if (!Number.isFinite(val) || Math.abs(val - expVal) > 6e-4 * Math.max(1, Math.abs(expVal))) {
      allMatch = false;
      break;
    }
  }

  if (allMatch) {
    return {
      ok: true,
      feedback: '¡Modelo correcto! M(t) = 132,36 · 1,035^(t/10) convierte 5 días a 120 h y recupera M₀ = 200 / 1,035¹² ≈ 132,36 g.',
    };
  }

  const params = extractExpParams(tree, s);
  if (Math.abs(params.a - 0.035) < 0.015) {
    return {
      ok: false,
      diagnosticId: 'raw_percentage_as_base',
      feedback: 'Usaste la tasa 0,035 directo como base; un aumento del 3,5% multiplica por 1 + 0,035 = 1,035.',
    };
  }
  if (Math.abs(params.b - 10) < 0.2) {
    return {
      ok: false,
      diagnosticId: 'inverted_period_exponent',
      feedback: 'Multiplicaste 10·t en el exponente en lugar de dividir t / 10 para contar cuántos períodos de 10 h pasaron.',
    };
  }
  if (Math.abs(params.k - 200) < 1) {
    return {
      ok: false,
      diagnosticId: 'confused_fencepost_x_minus_1',
      feedback: '200 g es la masa a los 5 días (t = 120 h), no la masa inicial M₀ en t = 0.',
    };
  }

  return {
    ok: false,
    diagnosticId: 'inverted_period_exponent',
    feedback: 'Revisá la conversión 5 días = 120 horas, la base 1,035 y el despeje de M₀ = 200 / 1,035¹².',
  };
}

function validateLogHalfLifeTime(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá el tiempo t en horas (exacto o aproximado).' };

  let val = NaN;
  try {
    val = evalLogExpr(s);
  } catch {
    try {
      val = parseQuadNumberOrFraction(s);
    } catch (err) {
      return { syntaxError: err.message };
    }
  }

  if (!Number.isFinite(val)) {
    return { syntaxError: 'No se pudo evaluar una cantidad real finita.' };
  }

  const exactT = 20 * Math.log(3); // ~21.9722 h (oficial: 22 h aprox.)
  if (Math.abs(val - exactT) <= 0.05) {
    return {
      ok: true,
      feedback: '¡Impecable! 120·e^(−0,05t) = 40 ⇒ e^(−0,05t) = 1/3 ⇒ t = 20·ln(3) ≈ 21,97 h (≈ 22 horas).',
    };
  }

  if (val <= 0) {
    return {
      ok: false,
      diagnosticId: 'non_positive_argument_accepted',
      feedback: 'Revisá el signo al aplicar ln(1/3) = −ln(3) y dividir por −0,05.',
    };
  }

  return {
    ok: false,
    diagnosticId: 'linear_ratio_confusion_in_log_scale',
    feedback: 'Planteá 40 = 120·e^(−0,05t), despejá la exponencial antes de tomar ln y recordá que ln(1/3) = −ln(3).',
  };
}

function validateHypotenuseInt2(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá la longitud de la hipotenusa en cm.' };

  let val;
  try {
    val = parseTrigNumberOrFraction(s);
  } catch (err) {
    return { syntaxError: err.message };
  }

  const exactHyp = 40 / Math.sqrt(39); // ~6.405126 cm (oficial: 6,41 cm)
  if (Math.abs(val - exactHyp) <= 0.015) {
    return {
      ok: true,
      feedback: '¡Exacto! sen(B) = 1,9/2 ⇒ B ≈ 71° 48\' 18", y la hipotenusa mide 2 / cos(B) = 40/√39 ≈ 6,41 cm.',
    };
  }

  if (Math.abs(val - 2 / 0.95) <= 0.08) {
    return {
      ok: false,
      diagnosticId: 'used_sine_instead_of_cosine',
      feedback: 'Conocés el cateto menor (adyacente al ángulo agudo mayor) y la altura: usá cos(B) = cateto / hipotenusa, no sen(B).',
    };
  }
  if (val < 2) {
    return {
      ok: false,
      diagnosticId: 'swapped_opposite_adjacent',
      feedback: 'La hipotenusa siempre es estrictamente mayor que cualquiera de los catetos (> 2 cm).',
    };
  }

  return {
    ok: false,
    diagnosticId: 'calculator_rad_mode_for_degrees',
    feedback: 'Verificá trabajar con sen(B) = 1,9 / 2, el ángulo complementario y cos(B) = 2 / hipotenusa.',
  };
}

function validateSecantQ3(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá el valor exacto y racionalizado de sec(α).' };

  const solved = exactTrigFromGiven({ fn: 'sin', value: '-3/4', secondCondition: 'tan > 0' });
  const expectedSec = solved.sec; // -4√7/7

  let userEr;
  try {
    userEr = parseExactRadical(s);
  } catch (err) {
    return { syntaxError: err.message };
  }

  if (exactRadicalEq(userEr, expectedSec)) {
    if (hasRadicalInDenominator(s)) {
      return {
        ok: false,
        diagnosticId: 'forgot_rationalization_or_reciprocal',
        feedback: 'El valor numérico coincide, pero falta racionalizar el denominador (−4/√7 = −4√7/7).',
      };
    }
    return {
      ok: true,
      feedback: '¡Exacto! En el III cuadrante cos(α) = −√7/4 y sec(α) = 1/cos(α) = −4√7/7.',
    };
  }

  if (exactRadicalEq(userEr, exactRadicalNeg(expectedSec))) {
    return {
      ok: false,
      diagnosticId: 'ignored_quadrant_sign_in_pythagorean',
      feedback: 'Falta el signo negativo: en el III cuadrante tanto cos(α) como sec(α) son negativos.',
    };
  }

  if (Math.abs(Math.abs(userEr.num) - 4 / 3) < 1e-4) {
    return {
      ok: false,
      diagnosticId: 'forgot_rationalization_or_reciprocal',
      feedback: 'Invertiste sen(α) (eso es cosec(α)): recordá que sec(α) = 1/cos(α).',
    };
  }

  return {
    ok: false,
    diagnosticId: 'ignored_quadrant_sign_in_pythagorean',
    feedback: 'Despejá cos(α) = −√(1 − (−3/4)²) = −√7/4 y luego invertí y racionalizá para sec(α).',
  };
}

function validatePoleFilteredTrigEq(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá la unión de clases C_α en ℝ.' };

  const eq = equivalentCongruenceUnion(s, 'C_{pi/3} U C_{4pi/3}', { requirePrincipal: true });
  if (eq.parseError) {
    return { syntaxError: 'Usá notación de clases de congruencia en [0; 2π), por ejemplo C_{π/3} ∪ C_{4π/3}.' };
  }

  if (eq.equivalent) {
    return {
      ok: true,
      feedback: '¡Transferencia impecable! Se excluye C_{π/2} porque cos(π/2) = 0 anula el denominador y es polo de tg(x), quedando C_{π/3} ∪ C_{4π/3}.',
    };
  }

  if (eq.congruentMatch && eq.hasUnreducedRepresentative) {
    return {
      ok: false,
      diagnosticId: 'negative_angle_not_reduced_to_principal',
      feedback: 'Las clases coinciden, pero expresá cada representante principal en [0; 2π) (sin ángulos negativos ni ≥ 2π).',
    };
  }

  if (eq.user?.classes?.some((c) => Math.abs(c.principalRad - Math.PI / 2) < 1e-3)) {
    return {
      ok: false,
      diagnosticId: 'accepted_pole_root_in_trig_equation',
      feedback: '¡Cuidado! x = π/2 anula el denominador cos(x) y además es polo de tg(x): debe descartarse del conjunto solución.',
    };
  }

  return {
    ok: false,
    diagnosticId: 'missed_second_quadrant_solution_branch',
    feedback: 'Resolviendo tg(x) = √3 aparecen dos clases en [0; 2π) (I y III cuadrante), y sen(x) = 1 no pertenece al dominio.',
  };
}

function validate4Cos2Minus1On0To2Pi(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá el conjunto de soluciones en [0; 2π) entre llaves.' };

  if (/C_|\bC\s*\(/i.test(s)) {
    return {
      ok: false,
      diagnosticId: 'negative_angle_not_reduced_to_principal',
      feedback: 'Este ítem pide las soluciones puntuales dentro de [0; 2π) entre llaves { ...; ... }, no las clases periódicas en ℝ.',
    };
  }

  const m = s.match(/^\{\s*([^}]*)\s*\}$/);
  if (!m) {
    return { syntaxError: 'Escribí el conjunto entre llaves y separado por punto y coma (;), por ejemplo {π/6; 5π/6}.' };
  }

  const inner = m[1].trim();
  if (!inner) {
    return {
      ok: false,
      diagnosticId: 'missed_second_quadrant_solution_branch',
      feedback: 'La ecuación 4·cos²(x) − 1 = 0 sí tiene soluciones reales en [0; 2π).',
    };
  }
  if (inner.includes(',') && !inner.includes(';')) {
    return { syntaxError: 'Usá punto y coma (;) para separar los elementos del conjunto.' };
  }

  const tokens = inner.split(';').map((t) => t.trim()).filter(Boolean);
  let parsedAngles;
  try {
    parsedAngles = tokens.map((tok) => parseAngleInput(tok, { defaultSystem: 'rad' }).rad);
  } catch (err) {
    return { syntaxError: err.message };
  }

  if (parsedAngles.some((r) => r < -1e-6 || r >= 2 * Math.PI - 1e-6)) {
    return {
      ok: false,
      diagnosticId: 'negative_angle_not_reduced_to_principal',
      feedback: 'Todas las soluciones deben pertenecer al intervalo [0; 2π).',
    };
  }

  const expectedSol = solveQuadraticTrigEq({ fnName: 'cos', a: 4, b: 0, c: -1, domain: '0_2pi' });
  const expectedRads = expectedSol.solutionsIn0To2Pi.map((sol) => sol.rad);

  const uniqUser = [];
  for (const r of parsedAngles) {
    if (!uniqUser.some((u) => Math.abs(u - r) < 1e-4)) uniqUser.push(r);
  }

  const allMatched =
    uniqUser.length === expectedRads.length &&
    expectedRads.every((er) => uniqUser.some((ur) => Math.abs(ur - er) < 1e-4));

  if (allMatched) {
    return {
      ok: true,
      feedback: '¡Exacto! cos(x) = ±1/2 aporta dos soluciones por rama en [0; 2π): {π/3; 2π/3; 4π/3; 5π/3}.',
    };
  }

  return {
    ok: false,
    diagnosticId: 'missed_second_quadrant_solution_branch',
    feedback: 'Recordá considerar las DOS ramas cos(x) = +1/2 y cos(x) = −1/2, cada una con dos ángulos en [0; 2π).',
  };
}

function validateHomographicRational(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá la fórmula racional f(x).' };

  const eq = equivalentRationalExpr(s, '-(x + 1)/(x + 2)', { requireSameDomain: true });
  if (eq.status === 'syntax_error') {
    return { syntaxError: eq.error };
  }
  if (eq.equivalent) {
    return {
      ok: true,
      feedback: '¡Excelente reconstrucción! f(x) = −(x + 1)/(x + 2) cumple A.V. x = −2, A.H. y = −1, raíz −1 y f(0) = −1/2.',
    };
  }

  const flippedSign = equivalentRationalExpr(s, '(x + 1)/(x + 2)', { requireSameDomain: false });
  if (flippedSign.algebraicallyEqual) {
    return {
      ok: false,
      diagnosticId: 'inverted_ha_degree_or_coeff_ratio',
      feedback: 'Cuidado con el signo de la asíntota horizontal y = −1 y la ordenada f(0) = −1/2.',
    };
  }

  return {
    ok: false,
    diagnosticId: 'hole_vs_va_multiplicity_confusion',
    feedback: 'La asíntota vertical x = −2 exige (x + 2) en el denominador, la raíz x = −1 exige (x + 1) en el numerador y la A.H. y = −1 fija el cociente de coeficientes principales en −1.',
  };
}

export const SIMULACRO_GLOBAL_CONFIG = {
  bossId: 'simulacro-global',
  moduleId: 'simulacro-global',
  title: 'Simulacro Integrador Global · Unidades 01 a 11',
  subtitle: 'Cinco encuentros integradores (Reconocer -> Predecir -> Modelar -> Resolver -> Transferir -> Debrief) sin cronómetro punitivo.',
  encounters: [
    {
      id: 'enc1',
      title: 'Encuentro 1 · Reales, Funciones, Polinomios y Racionales',
      unitsLabel: 'Unidades 01 + 02 + 06 + 07',
      phases: [
        {
          id: 'sim-enc1-reconocer',
          phaseName: 'Reconocer',
          kind: 'choice',
          competencyIds: ['rational.domain_holes_and_asymptotes'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Dada la función racional f(x) = (x² − x) / (x² − 1), identificá qué ocurre en x = 1 y en x = −1 según las multiplicidades de numerador y denominador:',
          options: [
            {
              label: 'x = 1 es un agujero evitable (mult_P(1) = 1 >= mult_Q(1) = 1) y x = −1 es una asíntota vertical (mult_P(−1) = 0 < mult_Q(−1) = 1)',
              value: 'A',
              correct: true,
            },
            {
              label: 'Tanto x = 1 como x = −1 son asíntotas verticales porque ambos anulan el denominador',
              value: 'B',
              correct: false,
            },
            {
              label: 'x = 1 pertenece al conjunto de ceros C₀ y x = −1 es un agujero evitable',
              value: 'C',
              correct: false,
            },
          ],
          hints: [
            'Factorizá numerador y denominador: P(x) = x(x − 1) y Q(x) = (x − 1)(x + 1).',
            'Donde un factor del denominador se cancela por completo aparece un agujero evitable; donde permanece en Q(x) con mayor multiplicidad surge una asíntota vertical.',
          ],
          solution: 'Como (x − 1) tiene multiplicidad 1 en P y 1 en Q, en x = 1 hay un agujero evitable (en (1; 1/2)), mientras en x = −1 queda una asíntota vertical.',
          validator: (v) =>
            v === 'A'
              ? { ok: true, feedback: '¡Correcto! x = 1 es agujero evitable y x = −1 es asíntota vertical; además C₀ = {0}.' }
              : {
                  ok: false,
                  diagnosticId: 'hole_vs_va_multiplicity_confusion',
                  feedback: 'Factorizá antes de clasificar: un factor común que se cancela por completo produce un agujero fuera del dominio, no una asíntota vertical ni un cero.',
                },
        },
        {
          id: 'sim-enc1-predecir',
          phaseName: 'Predecir',
          kind: 'choice',
          competencyIds: ['irrational.domain_and_radical_equations'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Antes de resolver la inecuación completa, predecí cómo es el dominio máximo real de f(x) = √(x² + 5x):',
          options: [
            {
              label: 'Unión de dos semirrectas con extremos cerrados: (−∞; −5] ∪ [0; +∞), porque el índice par exige x² + 5x >= 0',
              value: 'A',
              correct: true,
            },
            {
              label: 'El intervalo acotado [−5; 0], comprendido entre las dos raíces del radicando',
              value: 'B',
              correct: false,
            },
            {
              label: 'Con extremos abiertos (−∞; −5) ∪ (0; +∞), porque una raíz cuadrada no puede dar 0',
              value: 'C',
              correct: false,
            },
          ],
          hints: [
            'La raíz cuadrada está en el numerador y tiene índice par: el radicando puede ser cero (√0 = 0).',
            'Evaluá en un punto interior como x = −1: x(x + 5) = (−1)(4) = −4 < 0, así que la zona central queda fuera del dominio real.',
          ],
          solution: 'x(x + 5) >= 0 se verifica en (−∞; −5] ∪ [0; +∞) con extremos cerrados.',
          validator: (v) =>
            v === 'A'
              ? { ok: true, feedback: '¡Bien anticipado! Dom(f) = (−∞; −5] ∪ [0; +∞) con corchetes cerrados en −5 y 0.' }
              : {
                  ok: false,
                  diagnosticId: 'even_vs_odd_radical_domain_confusion',
                  feedback: 'Revisá el signo de x(x + 5) en x = −1 y recordá que √0 = 0 está permitido cuando la raíz no divide.',
                },
        },
        {
          id: 'sim-enc1-modelar',
          phaseName: 'Modelar',
          kind: 'expression',
          competencyIds: ['polynomials.parameter_reconstruction_and_modeling'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Escribí en forma factorizada el polinomio P(x) de grado 4 sabiendo que es divisible por (x + 3), P(0) = 0, 2 es raíz doble y P(−1) = 6:',
          placeholder: 'Ej: 2x(x + 1)(x − 3)²',
          hints: [
            'Las cuatro raíces reales contadas con multiplicidad son −3, 0 y 2 (doble): planteá P(x) = a·x·(x + 3)·(x − 2)².',
            'Sustituí x = −1 en la plantilla paramétrica para despejar el coeficiente principal a a partir de P(−1) = 6.',
          ],
          solution: 'P(−1) = a·(−1)·2·(−3)² = −18a = 6 ⇒ a = −1/3, luego P(x) = −(1/3)·x·(x + 3)·(x − 2)².',
          validator: (raw) =>
            validatePolyFactored(
              raw,
              '-(1/3)*x*(x + 3)*(x - 2)^2',
              '¡Excelente modelado! P(x) = −(1/3)x(x + 3)(x − 2)².',
              'Verificá los factores (x + 3), x, (x − 2)² y despejá a de −18a = 6.'
            ),
        },
        {
          id: 'sim-enc1-resolver',
          phaseName: 'Resolver',
          kind: 'expression',
          competencyIds: ['powers.radical_simplification_and_rationalization'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Calculá en forma exacta y en su mínima expresión: 4·∛81 − ⁶√9 + (1/2)·∛24 (podés escribir ∛ como root(3, ...) o ^(1/3)):',
          placeholder: 'Ej: 5∛2 o 5*root(3, 2)',
          hints: [
            'Factorizá cada radicando en potencias de 3 y 2: 81 = 3⁴, 9 = 3² y 24 = 2³·3.',
            'Recordá simplificar el índice de ⁶√(3²) = 3^(2/6) = ∛3 antes de sumar radicales semejantes.',
          ],
          solution: '4·(3∛3) − ∛3 + (1/2)·(2∛3) = 12∛3 − ∛3 + ∛3 = 12∛3.',
          validator: (raw) => validateSimplifiedCubeRoot3(raw),
        },
        {
          id: 'sim-enc1-transferir',
          phaseName: 'Transferir',
          kind: 'pair',
          competencyIds: ['rational.equations_and_inequalities', 'rational.domain_holes_and_asymptotes'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Para f(x) = (2x + 1)/(3 − x), determiná su raíz x₀ (tal que C₀ = {x₀}) y la ordenada y_AH de su asíntota horizontal y = y_AH. Ingresá el par (x₀; y_AH):',
          placeholder: 'Ej: (3; 1)',
          hints: [
            'La raíz x₀ anula el numerador 2x + 1 = 0 dentro del dominio ℝ − {3}.',
            'Para la asíntota horizontal, ordená numerador y denominador según la potencia de x: (2x + 1)/(−x + 3).',
          ],
          solution: 'Dom(f) = ℝ − {3}, C₀ = {−1/2} y A.H.: y = 2/(−1) = −2, par (−1/2; −2).',
          validator: (raw) =>
            validatePair(
              raw,
              '(-1/2; -2)',
              '¡Transferencia lograda! C₀ = {−1/2}, Dom(f) = ℝ − {3} y A.H.: y = −2.',
              'Revisá el signo del coeficiente de x en el denominador (3 − x = −x + 3) y recordá que C₀ anula el numerador, no x = 0.',
              (p) => (approxEqual(p.y, 2, 1e-4) ? 'inverted_ha_degree_or_coeff_ratio' : null),
              'hole_vs_va_multiplicity_confusion'
            ),
        },
      ],
    },
    {
      id: 'enc2',
      title: 'Encuentro 2 · Rectas, Sistemas 2×2 y Función Cuadrática',
      unitsLabel: 'Unidades 03 + 04 + 05',
      phases: [
        {
          id: 'sim-enc2-reconocer',
          phaseName: 'Reconocer',
          kind: 'choice',
          competencyIds: ['linear.definition_slope_and_intercept', 'linear.parallel_perpendicular_and_incidence'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Dada la función lineal f(x) = 5 − (3/2)x, ¿qué terna indica correctamente su pendiente m, su ordenada al origen b y la pendiente m_⊥ de una recta perpendicular?',
          options: [
            { label: 'm = −3/2, b = 5, m_⊥ = 2/3', value: 'A', correct: true },
            { label: 'm = 5, b = −3/2, m_⊥ = −1/5', value: 'B', correct: false },
            { label: 'm = −3/2, b = 5, m_⊥ = −2/3', value: 'C', correct: false },
          ],
          hints: [
            'La pendiente m es el coeficiente que multiplica a x, sin importar el orden en que estén escritos los términos.',
            'Dos rectas oblicuas son perpendiculares cuando m · m_⊥ = −1 (opuesta e inversa).',
          ],
          solution: 'm = −3/2, b = 5 y m_⊥ = −1/(−3/2) = 2/3.',
          validator: (v) =>
            v === 'A'
              ? { ok: true, feedback: '¡Exacto! m = −3/2, b = 5 y m_⊥ = 2/3.' }
              : {
                  ok: false,
                  diagnosticId: v === 'B' ? 'swapped_slope_and_intercept' : 'confused_parallel_with_perpendicular',
                  feedback:
                    v === 'B'
                      ? 'Cuidado: el término 5 es la ordenada al origen b; la pendiente es el coeficiente de x (−3/2).'
                      : 'Para perpendicularidad debe invertirse el signo además de la fracción: (−3/2)·(2/3) = −1.',
                },
        },
        {
          id: 'sim-enc2-predecir',
          phaseName: 'Predecir',
          kind: 'choice',
          competencyIds: ['quadratics.full_analysis_exactas', 'quadratics.canonical_form_and_vertex'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Sin desarrollar la fórmula f(x) = −4(x + 3)² + 1, predecí su conjunto imagen Im(f) y el tipo de extremo:',
          options: [
            { label: 'Im(f) = (−∞; 1] con corchete cerrado en 1, donde alcanza un máximo absoluto', value: 'A', correct: true },
            { label: 'Im(f) = (−∞; 1) con paréntesis abierto en 1, donde alcanza un máximo', value: 'B', correct: false },
            { label: 'Im(f) = [−3; +∞) porque x_v = −3 y el cuadrado es no negativo', value: 'C', correct: false },
          ],
          hints: [
            'En la forma canónica a(x − x_v)² + y_v, el vértice (x_v; y_v) pertenece a la parábola.',
            'Como a = −4 < 0, las ramas abren hacia abajo y el vértice (−3; 1) es el techo máximo.',
          ],
          solution: 'El vértice (−3; 1) pertenece al gráfico y a = −4 < 0, luego Im(f) = (−∞; 1].',
          validator: (v) =>
            v === 'A'
              ? { ok: true, feedback: '¡Correcto! Como f(−3) = 1 se alcanza efectivamente, la imagen lleva corchete cerrado: (−∞; 1].' }
              : {
                  ok: false,
                  diagnosticId: v === 'B' ? 'used_yv_for_monotonicity_or_open_image' : 'inverted_vertex_h_sign',
                  feedback:
                    v === 'B'
                      ? 'A diferencia de una asíntota exponencial, el vértice sí se alcanza: f(−3) = 1 pertenece a la imagen.'
                      : 'La imagen se lee sobre el eje Y usando y_v = 1 y la concavidad a = −4 < 0.',
                },
        },
        {
          id: 'sim-enc2-modelar',
          phaseName: 'Modelar',
          kind: 'expression',
          competencyIds: ['systems.modeling_and_graph_reconstruction'],
          representation: 'verbal',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'En un laboratorio, 1 L de solución A requiere 2 g de ácido acético y 5 g de NaOH; 1 L de solución B requiere 4 g de ácido acético y 3 g de NaOH. Se dispone exactamente de 120 g de ácido acético y 195 g de NaOH. Escribí el sistema 2×2 (usá x, y o a, b separando las dos ecuaciones con ;):',
          placeholder: 'Ej: 3x + y = 10 ; x − 2y = 4',
          hints: [
            'Definí x = litros de solución A e y = litros de solución B.',
            'Armá una ecuación para los gramos totales de ácido acético (120 g) y otra para los gramos totales de NaOH (195 g).',
          ],
          solution: '2x + 4y = 120 ; 5x + 3y = 195.',
          validator: (raw) => validateSystemSetup(raw),
        },
        {
          id: 'sim-enc2-resolver',
          phaseName: 'Resolver',
          kind: 'pair',
          competencyIds: ['systems.linear_2x2_graphical_and_analytical'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Resolvé el sistema { 2A + 4B = 120 ; 5A + 3B = 195 } e ingresá el par ordenado (A; B) con los litros de cada solución:',
          placeholder: 'Ej: (12; 8)',
          hints: [
            'Simplificá la primera ecuación dividiendo por 2: A + 2B = 60 ⇒ A = 60 − 2B.',
            'Sustituí en 5(60 − 2B) + 3B = 195 para despejar B y luego calculá A.',
          ],
          solution: '300 − 7B = 195 ⇒ B = 15 y A = 30; par (30; 15).',
          validator: (raw) => validateSystemSolution(raw),
        },
        {
          id: 'sim-enc2-transferir',
          phaseName: 'Transferir',
          kind: 'pair',
          competencyIds: ['quadratics.extremum_optimization', 'quadratics.canonical_form_and_vertex'],
          representation: 'verbal',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'La concentración de una enzima sigue C(t) = −2t² + 12t + 7 (t >= 0 en minutos). Determiná el instante t_máx de concentración máxima y el valor máximo C_máx, e ingresá el par (t_máx; C_máx):',
          placeholder: 'Ej: (2; 14)',
          hints: [
            'Como a = −2 < 0, el máximo se alcanza en el vértice t_v = −b/(2a).',
            'Evaluá C(t_v) para obtener el valor máximo de concentración.',
          ],
          solution: 't_v = −12/(2·(−2)) = 3 min y C(3) = −2(9) + 36 + 7 = 25; par (3; 25).',
          validator: (raw) =>
            validatePair(
              raw,
              '(3; 25)',
              '¡Transferencia perfecta! La enzima alcanza su máximo de 25 unidades a los 3 minutos: (3; 25).',
              'Revisá el cálculo t_v = −b/(2a) con a = −2, b = 12 y evaluá C(t_v).',
              (p) => (approxEqual(p.x, -3, 1e-4) ? 'inverted_vertex_h_sign' : null),
              'used_yv_for_monotonicity_or_open_image'
            ),
        },
      ],
    },
    {
      id: 'enc3',
      title: 'Encuentro 3 · Exponenciales, Logaritmos y Modelado Temporal',
      unitsLabel: 'Unidades 08 + 09',
      phases: [
        {
          id: 'sim-enc3-reconocer',
          phaseName: 'Reconocer',
          kind: 'choice',
          competencyIds: ['logarithms.operative_properties_and_change_of_base'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Al simplificar log_a(√8) · log_a(4), un estudiante escribió: log_a(√8) + log_a(4) = (1/2)·log_a(32). ¿Cuál es el primer error conceptual?',
          options: [
            {
              label: 'Convirtió un producto de dos logaritmos en suma de logaritmos; la propiedad vale para log_a(x·y), no para log_a(x)·log_a(y)',
              value: 'A',
              correct: true,
            },
            {
              label: 'Confundió √8 con 8^(1/2) cuando en realidad equivale a 8²',
              value: 'B',
              correct: false,
            },
            {
              label: 'Multiplicó mal los argumentos al final porque 8·4 no da 32',
              value: 'C',
              correct: false,
            },
          ],
          hints: [
            'Compará log_a(M·N) = log_a(M) + log_a(N) con la expresión de partida log_a(M)·log_a(N).',
            'Además, en el paso siguiente sacó factor común 1/2 afectando también a log_a(4) sin tenerlo.',
          ],
          solution: 'El producto de dos logaritmos NO se transforma en suma; la propiedad aplica al logaritmo de un producto.',
          validator: (v) =>
            v === 'A'
              ? { ok: true, feedback: '¡Bien auditado! log_a(M)·log_a(N) ≠ log_a(M) + log_a(N).' }
              : {
                  ok: false,
                  diagnosticId: 'false_quotient_or_product_of_logs',
                  feedback: 'El error está en el primer signo "=": transformó el producto de dos logaritmos en suma.',
                },
        },
        {
          id: 'sim-enc3-predecir',
          phaseName: 'Predecir',
          kind: 'choice',
          competencyIds: [
            'exponentials.shifts_and_horizontal_asymptote',
            'exponentials.four_quadrants_monotonicity',
            'exponentials.full_analytical_study',
          ],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Dada f(x) = 1 − (1/2)^x en ℝ, predecí su monotonía y su conjunto imagen sin armar una tabla:',
          options: [
            { label: 'Estrictamente creciente en todo ℝ e Im(f) = (−∞; 1) con extremo abierto en y = 1', value: 'A', correct: true },
            { label: 'Estrictamente decreciente en todo ℝ e Im(f) = (−∞; 1), porque 0 < 1/2 < 1', value: 'B', correct: false },
            { label: 'Estrictamente creciente en todo ℝ e Im(f) = (−∞; 1] con corchete cerrado en 1', value: 'C', correct: false },
          ],
          hints: [
            'El factor k = −1 < 0 delante de (1/2)^x refleja la curva verticalmente e invierte su monotonía.',
            'Como (1/2)^x > 0 jamás se anula, f(x) nunca alcanza la asíntota horizontal y = 1.',
          ],
          solution: 'Con k = −1 < 0 y base a = 1/2 ∈ (0; 1), f crece en todo ℝ hacia la asíntota y = 1 sin tocarla: Im(f) = (−∞; 1).',
          validator: (v) =>
            v === 'A'
              ? { ok: true, feedback: '¡Exacto! Crece en todo ℝ y su imagen abierta es (−∞; 1).' }
              : {
                  ok: false,
                  diagnosticId: v === 'B' ? 'ignored_negative_k_monotonicity' : 'closed_bracket_on_asymptote',
                  feedback:
                    v === 'B'
                      ? 'Al estar precedida por −1, cuanto mayor es x menor es (1/2)^x y por lo tanto más cerca de 1 sube f(x).'
                      : 'La asíntota horizontal y = 1 nunca se alcanza porque (1/2)^x > 0 para todo x ∈ ℝ.',
                },
        },
        {
          id: 'sim-enc3-modelar',
          phaseName: 'Modelar',
          kind: 'expression',
          competencyIds: ['exponentials.time_models_rates_and_euler_base'],
          representation: 'verbal',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Una población de bacterias crece un 3,5% cada 10 horas. Al cabo de 5 días había 200 g. Escribí la fórmula M(t) de la masa en gramos en función del tiempo t en horas:',
          placeholder: 'Ej: 80 * 1,05^(t/6)',
          hints: [
            'Convertí 5 días a horas (5 · 24 = 120 h) y expresá el factor multiplicativo de +3,5% cada 10 h como 1,035^(t/10).',
            'Imponé M(120) = M₀ · 1,035^(120/10) = 200 para despejar M₀.',
          ],
          solution: 'M₀ = 200 / 1,035¹² ≈ 132,36 g ⇒ M(t) = 132,36 · 1,035^(t/10).',
          validator: (raw) => validateExpBacteriaModel(raw),
        },
        {
          id: 'sim-enc3-resolver',
          phaseName: 'Resolver',
          kind: 'set',
          competencyIds: ['logarithms.equations_and_systems'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Resolvé en ℝ la ecuación (log₃(x − 1))² + log₃(x − 1) = 6 e ingresá su conjunto solución entre llaves:',
          placeholder: 'Ej: {4/9; 5}',
          hints: [
            'Usá la sustitución u = log₃(x − 1): resolvé u² + u − 6 = 0 y recordá que un logaritmo puede tomar valores negativos en ℝ.',
            'Deshacelo con x − 1 = 3^u para cada raíz u y verificá la condición de existencia x − 1 > 0.',
          ],
          solution: 'u ∈ {−3; 2} ⇒ x − 1 = 3⁻³ = 1/27 o x − 1 = 3² = 9 ⇒ S = {28/27; 10}.',
          validator: (raw) => {
            const s = String(raw ?? '').trim();
            if (!s) return { empty: true, feedback: 'Ingresá el conjunto solución entre llaves.' };
            try {
              if (equivalentSetExactas(s, '{28/27; 10}')) {
                return {
                  ok: true,
                  feedback: '¡Impecable! A diferencia de u = a^x > 0, u = log₃(x − 1) admite u = −3, dando S = {28/27; 10}.',
                };
              }
              if (equivalentSetExactas(s, '{10}')) {
                return {
                  ok: false,
                  diagnosticId: 'accepted_extraneous_root_in_log_eq',
                  feedback: 'Falta una solución: u = −3 SÍ es válido porque la imagen de log₃ es todo ℝ (3⁻³ = 1/27 > 0).',
                };
              }
              if (equivalentSetExactas(s, '{-3; 2}')) {
                return {
                  ok: false,
                  diagnosticId: 'confused_exp_log_conversion',
                  feedback: '−3 y 2 son los valores auxiliares de u = log₃(x − 1), todavía falta despejar x.',
                };
              }
              return {
                ok: false,
                diagnosticId: 'accepted_extraneous_root_in_log_eq',
                feedback: 'Revisá las raíces de u² + u − 6 = 0 y la conversión x − 1 = 3^u.',
              };
            } catch (err) {
              return { syntaxError: err.message };
            }
          },
        },
        {
          id: 'sim-enc3-transferir',
          phaseName: 'Transferir',
          kind: 'number',
          competencyIds: ['logarithms.real_world_time_and_scale_models'],
          representation: 'verbal',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'La tasa de desintegración de un isótopo sigue A(t) = 120 · e^(−0,05t) (t en horas). Calculá cuántas horas deben transcurrir para que la tasa sea de 40 unidades (exacto con ln o aproximado):',
          placeholder: 'Ej: 10*ln(2) o 6,93',
          hints: [
            'Igualá 120·e^(−0,05t) = 40 y dividí ambos miembros por 120 antes de aplicar logaritmo natural.',
            'Aplicá ln en ambos miembros: −0,05t = ln(1/3) = −ln(3).',
          ],
          solution: 't = ln(3) / 0,05 = 20·ln(3) ≈ 21,97 horas (≈ 22 h).',
          validator: (raw) => validateLogHalfLifeTime(raw),
        },
      ],
    },
    {
      id: 'enc4',
      title: 'Encuentro 4 · Trigonometría, Congruencia y Ecuaciones Periódicas',
      unitsLabel: 'Unidades 10 + 11',
      phases: [
        {
          id: 'sim-enc4-reconocer',
          phaseName: 'Reconocer',
          kind: 'choice',
          competencyIds: [
            'trig_functions.six_functions_domains_graphs_and_bijectivity',
            'trig_functions.congruence_classes_and_cartesian_def',
          ],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Indicá cuál de estas cuatro afirmaciones sobre funciones trigonométricas y congruencia es la ÚNICA VERDADERA:',
          options: [
            { label: 'Los ángulos −870° y 31π/6 pertenecen a la misma clase de congruencia C_{7π/6}', value: 'A', correct: true },
            { label: '{ x ∈ [0; 2π) : cos(x) > 0 } es exactamente [0; π/2)', value: 'B', correct: false },
            { label: 'La imagen de f(x) = tg(x) es ℝ − { π/2 + kπ, k ∈ ℤ }', value: 'C', correct: false },
            { label: 'Existe algún x ∈ ℝ tal que sen(x) = 7/2', value: 'D', correct: false },
          ],
          hints: [
            'Convertí −870° sumando múltiplos de 360° hasta caer en [0°; 360°), y restá múltiplos de 2π a 31π/6.',
            'Recordá distinguir dominio de imagen en tg(x), los dos cuadrantes donde cos(x) > 0 y la cota |sen(x)| <= 1.',
          ],
          solution: '−870° + 3·360° = 210° y 31π/6 − 4π = 7π/6 = 210°, por lo que ambos viven en C_{7π/6}.',
          validator: (v) => {
            if (v === 'A' && areCongruent('-870°', '31pi/6').congruent) {
              return { ok: true, feedback: '¡Exacto! Ambos tienen representante principal 210° = 7π/6.' };
            }
            const diagMap = {
              B: 'missed_second_quadrant_solution_branch',
              C: 'assumed_identical_domain_for_all_six_trig',
              D: 'accepted_sin_cos_outside_unit_interval',
            };
            return {
              ok: false,
              diagnosticId: diagMap[v] || 'assumed_identical_domain_for_all_six_trig',
              feedback: 'Verificá: cos(x) > 0 también en el IV cuadrante, Im(tg) = ℝ y |sen(x)| <= 1.',
            };
          },
        },
        {
          id: 'sim-enc4-predecir',
          phaseName: 'Predecir',
          kind: 'choice',
          competencyIds: ['trig_functions.pythagorean_identities_and_reduction'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Sabiendo que sen(α) = −3/4 y tg(α) > 0, predecí el cuadrante de α y el signo de sec(α) antes de calcular su valor exacto:',
          options: [
            { label: 'Cuadrante III y sec(α) < 0, porque sen(α) < 0 y tg(α) > 0 obligan a cos(α) < 0', value: 'A', correct: true },
            { label: 'Cuadrante IV y sec(α) > 0, porque sen(α) es negativo', value: 'B', correct: false },
            { label: 'Cuadrante III y sec(α) > 0, porque tg(α) es positiva', value: 'C', correct: false },
          ],
          hints: [
            'Como tg(α) = sen(α)/cos(α) > 0 y sen(α) < 0, cos(α) debe ser también negativo.',
            'Recordá que sec(α) = 1/cos(α), por lo que conserva el signo de cos(α).',
          ],
          solution: 'sen < 0 y cos < 0 ubican a α en el III cuadrante, donde sec(α) = 1/cos(α) < 0.',
          validator: (v) =>
            v === 'A'
              ? { ok: true, feedback: '¡Bien anticipado! α está en el III cuadrante y sec(α) < 0.' }
              : {
                  ok: false,
                  diagnosticId: v === 'B' ? 'ignored_quadrant_sign_in_pythagorean' : 'forgot_rationalization_or_reciprocal',
                  feedback: 'En el III cuadrante solo tg y cotg son positivas; cos y sec comparten el signo negativo.',
                },
        },
        {
          id: 'sim-enc4-modelar',
          phaseName: 'Modelar',
          kind: 'number',
          competencyIds: [
            'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
            'trig_ratios.elevation_depression_and_indirect_measurement',
          ],
          representation: 'verbal',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'En un triángulo rectángulo, la altura trazada sobre la hipotenusa mide 1,9 cm y el cateto menor mide 2 cm. Calculá la longitud de la hipotenusa (en cm, con al menos 2 decimales):',
          placeholder: 'Ej: 5,25',
          hints: [
            'La altura forma con el cateto menor un triángulo rectángulo donde 2 cm es la hipotenusa auxiliar y 1,9 cm es el cateto opuesto al otro ángulo agudo B: sen(B) = 1,9 / 2.',
            'En el triángulo original, ese cateto de 2 cm es adyacente al ángulo B, así que hipotenusa = 2 / cos(B).',
          ],
          solution: 'sen(B) = 0,95 ⇒ B ≈ 71° 48\' 18", luego hipotenusa = 2 / √(1 − 0,95²) = 40/√39 ≈ 6,41 cm.',
          validator: (raw) => validateHypotenuseInt2(raw),
        },
        {
          id: 'sim-enc4-resolver',
          phaseName: 'Resolver',
          kind: 'expression',
          competencyIds: ['trig_functions.pythagorean_identities_and_reduction'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Con los mismos datos sen(α) = −3/4 y tg(α) > 0, calculá el valor EXACTO y RACIONALIZADO de sec(α):',
          placeholder: 'Ej: −2√5/5 o −2*sqrt(5)/5',
          hints: [
            'Usá sen²(α) + cos²(α) = 1 con signo negativo en el III cuadrante para hallar cos(α) = −√(1 − 9/16) = −√7/4.',
            'Invertí para obtener sec(α) = 1/cos(α) y racionalizá multiplicando numerador y denominador por √7.',
          ],
          solution: 'cos(α) = −√7/4 ⇒ sec(α) = −4/√7 = −4√7/7.',
          validator: (raw) => validateSecantQ3(raw),
        },
        {
          id: 'sim-enc4-transferir',
          phaseName: 'Transferir',
          kind: 'expression',
          competencyIds: ['trig_functions.periodic_equations_and_domain_checks'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Resolvé en ℝ la ecuación ((1 − sen x)(√3 − tg x)) / cos x = 0 y expresá el conjunto solución como unión de clases C_α con representante principal en [0; 2π):',
          placeholder: 'Ej: C_{π/6} ∪ C_{7π/6}',
          hints: [
            'Exigí las condiciones de dominio antes de anular el numerador: cos(x) ≠ 0 excluye C_{π/2} ∪ C_{3π/2}.',
            'Verificá si la raíz de 1 − sen(x) = 0 sobrevive a la condición cos(x) ≠ 0 y resolvé tg(x) = √3 en [0; 2π).',
          ],
          solution: 'sen(x) = 1 da x = π/2 que anula cos(x) y es polo de tg(x), así que se descarta; tg(x) = √3 da S = C_{π/3} ∪ C_{4π/3}.',
          validator: (raw) => validatePoleFilteredTrigEq(raw),
        },
      ],
    },
    {
      id: 'enc5',
      title: 'Encuentro 5 · Síntesis Cruzada (Modelos U01–U11)',
      unitsLabel: 'Unidades 01 a 11',
      phases: [
        {
          id: 'sim-enc5-reconocer',
          phaseName: 'Reconocer',
          kind: 'choice',
          competencyIds: [
            'functions.domain_image_and_sign_sets',
            'rational.domain_holes_and_asymptotes',
            'logarithms.function_inverse_and_analysis',
            'trig_functions.six_functions_domains_graphs_and_bijectivity',
          ],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: '¿Cuál de estas cuatro correspondencias entre fórmula, dominio máximo real y asíntota es COMPLETAMENTE CORRECTA?',
          options: [
            { label: 'g(x) = log₂(4 − x) tiene Dom = (−∞; 4) y asíntota vertical x = 4', value: 'A', correct: true },
            { label: 'h(x) = tg(x) tiene Dom = ℝ − (C₀ ∪ C_π) y asíntotas verticales en x = kπ', value: 'B', correct: false },
            { label: 'p(x) = 3 − (1/3)^x tiene Dom = (3; +∞) y asíntota horizontal y = −3', value: 'C', correct: false },
            { label: 'q(x) = (x − 1)/(x² − 1) tiene una asíntota vertical en x = 1', value: 'D', correct: false },
          ],
          hints: [
            'Verificá la condición de existencia de cada familia: argumento > 0 en logaritmos, cos(x) ≠ 0 en tg(x) y multiplicidades en racionales.',
            'Recordá que toda función exponencial k·a^x + c tiene dominio ℝ y asíntota horizontal y = c.',
          ],
          solution: 'En g(x) = log₂(4 − x), 4 − x > 0 equivale a x < 4, con asíntota vertical x = 4.',
          validator: (v) => {
            if (v === 'A') {
              return { ok: true, feedback: '¡Exacto! Dom(g) = (−∞; 4) y A.V.: x = 4.' };
            }
            const diagMap = {
              B: 'assumed_identical_domain_for_all_six_trig',
              C: 'closed_bracket_on_asymptote',
              D: 'hole_vs_va_multiplicity_confusion',
            };
            return {
              ok: false,
              diagnosticId: diagMap[v] || 'assumed_identical_domain_for_all_six_trig',
              feedback: 'Revisá los polos de tg (π/2 + kπ), el dominio ℝ de la exponencial y la cancelación de (x − 1) en q(x).',
            };
          },
        },
        {
          id: 'sim-enc5-predecir',
          phaseName: 'Predecir',
          kind: 'choice',
          competencyIds: [
            'trig_functions.six_functions_domains_graphs_and_bijectivity',
            'exponentials.shifts_and_horizontal_asymptote',
          ],
          representation: 'verbal',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Antes de resolver ecuaciones, predecí cuál de estas cuatro funciones reales f: Dom(f) -> ℝ es SURYECTIVA sobre todo ℝ (Im(f) = ℝ):',
          options: [
            { label: 'f(x) = cotg(x), cuya imagen abarca todo ℝ aunque su dominio excluya C₀ ∪ C_π', value: 'A', correct: true },
            { label: 'g(x) = sec(x), porque sus ramas crecen hacia +∞ y decrecen hacia −∞', value: 'B', correct: false },
            { label: 'h(x) = 2^x + 1, porque crece indefinidamente hacia +∞', value: 'C', correct: false },
            { label: 'k(x) = sen(x), porque es continua en todo ℝ', value: 'D', correct: false },
          ],
          hints: [
            'Una función f: Dom(f) -> ℝ es suryectiva cuando su imagen coincide exactamente con todo el codominio ℝ.',
            'Descartá las que dejan franjas vacías: sec(x) omite (−1; 1), 2^x + 1 omite (−∞; 1] y sen(x) está acotada en [−1; 1].',
          ],
          solution: 'Solo cotg(x) (al igual que tg(x)) toma todos los valores reales en cada período: Im(cotg) = ℝ.',
          validator: (v) =>
            v === 'A'
              ? { ok: true, feedback: '¡Correcto! Im(cotg) = ℝ, mientras sec, exponenciales desplazadas y sen dejan valores reales sin cubrir.' }
              : {
                  ok: false,
                  diagnosticId: v === 'C' ? 'closed_bracket_on_asymptote' : 'accepted_sin_cos_outside_unit_interval',
                  feedback: 'Comprobá la imagen exacta de cada función: ni sec(x) ni 2^x + 1 ni sen(x) alcanzan el valor y = 0,5 (o y = 0).',
                },
        },
        {
          id: 'sim-enc5-modelar',
          phaseName: 'Modelar',
          kind: 'choice',
          competencyIds: [
            'powers.real_domain_restrictions_and_abs_root',
            'logarithms.equations_and_systems',
          ],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: '¿Qué transformación algebraica conserva EXACTAMENTE el conjunto de soluciones reales sin perder raíces ni introducir soluciones extraviadas?',
          options: [
            {
              label: 'En log₂(x) + log₂(x − 2) = 3, unificar como log₂(x(x − 2)) = 3 exigiendo simultáneamente x > 0 y x − 2 > 0 (es decir x > 2)',
              value: 'A',
              correct: true,
            },
            { label: 'Sustituir √(x²) por x directamente para todo x ∈ ℝ', value: 'B', correct: false },
            { label: 'En 2^(2x) − 2^x − 6 = 0 con u = 2^x, conservar tanto u = 3 como u = −2', value: 'C', correct: false },
            { label: 'En log(x²) = 2, reescribir 2·log(x) = 2 asumiendo el mismo dominio en ℝ', value: 'D', correct: false },
          ],
          hints: [
            'Al aplicar propiedades de logaritmos sobre la incógnita, hay que intersecar las condiciones de existencia de la ecuación ORIGINAL.',
            'Recordá que √(x²) = |x|, u = 2^x > 0 y log(x²) admite también x < 0 mientras log(x) no.',
          ],
          solution: 'Conservar x > 0 ∧ x − 2 > 0 (x > 2) evita aceptar la raíz extraña x = −2 que proviene de x(x − 2) = 8.',
          validator: (v) => {
            if (v === 'A') {
              return { ok: true, feedback: '¡Impecable! La intersección de los dominios originales x > 2 descarta x = −2.' };
            }
            const diagMap = {
              B: 'forgot_abs_in_even_root',
              C: 'accepted_non_positive_u_in_substitution',
              D: 'non_positive_argument_accepted',
            };
            return {
              ok: false,
              diagnosticId: diagMap[v] || 'non_positive_argument_accepted',
              feedback: 'Cuidado: √(x²) = |x|, u = 2^x > 0 descarta u = −2 y log(x²) admite x = −10 mientras 2·log(x) no.',
            };
          },
        },
        {
          id: 'sim-enc5-resolver',
          phaseName: 'Resolver',
          kind: 'set',
          competencyIds: ['trig_functions.periodic_equations_and_domain_checks'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Resolvé 4·cos²(x) − 1 = 0 en el intervalo [0; 2π) e ingresá el conjunto solución entre llaves (en radianes):',
          placeholder: 'Ej: {π/6; 5π/6; 7π/6; 11π/6}',
          hints: [
            'Despejá cos²(x) = 1/4 y no olvides las dos ramas de la raíz cuadrada: cos(x) = +1/2 y cos(x) = −1/2.',
            'Cada rama aporta dos ángulos en [0; 2π), uno en el semiplano superior y otro simétrico en el inferior.',
          ],
          solution: 'cos(x) = ±1/2 en [0; 2π) produce S = {π/3; 2π/3; 4π/3; 5π/3}.',
          validator: (raw) => validate4Cos2Minus1On0To2Pi(raw),
        },
        {
          id: 'sim-enc5-transferir',
          phaseName: 'Transferir',
          kind: 'expression',
          competencyIds: ['rational.domain_holes_and_asymptotes'],
          representation: 'graphical',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Reconstruí la fórmula de la función racional homográfica f(x) sabiendo que tiene asíntota vertical x = −2, asíntota horizontal y = −1 y corta al eje X en x = −1 (con f(0) = −1/2):',
          placeholder: 'Ej: (2x − 1)/(x + 3)',
          hints: [
            'La asíntota vertical x = −2 fija el denominador (x + 2) y el cero x = −1 fija el factor (x + 1) en el numerador.',
            'La asíntota horizontal y = −1 determina la razón entre los coeficientes principales k/1 = −1.',
          ],
          solution: 'f(x) = −(x + 1)/(x + 2), que verifica A.V. x = −2, A.H. y = −1, f(−1) = 0 y f(0) = −1/2.',
          validator: (raw) => validateHomographicRational(raw),
        },
      ],
    },
  ],
};

if (typeof document !== 'undefined') {
  renderNav();
  initLessonDock();
  initGlossary();

  const host = document.getElementById('boss-simulacro-global-arena');
  if (host) {
    mountBossArena(host, SIMULACRO_GLOBAL_CONFIG);
  }
}
