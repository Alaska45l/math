/**
 * Alaska Math Lab · Desigualdades Compuestas e Intervalos (Unidad 01)
 * Mapa Estático de Competencias y Taxonomía de Diagnósticos Cognitivos.
 * 100% puro, determinista y libre de DOM.
 */

export const ERROR_CATEGORIES = Object.freeze({
  CONCEPTUAL: 'conceptual',
  PROCEDURAL: 'procedural',
  ARITHMETIC: 'arithmetic',
  REPRESENTATION: 'representation',
  SYNTAX: 'syntax',
  EQUIVALENT_FORM: 'equivalent_form',
  GUESSING_PATTERN: 'guessing_pattern',
});

export const CIRCUITOS_COMPETENCIES = Object.freeze([
  {
    id: 'inequalities.intervals_and_number_line',
    sectionId: 'sec-intervalos',
    chapter: 1,
    order: 1,
    title: 'Intervalos reales, extremos abiertos/cerrados y representación en la recta',
    description:
      'Traduce desigualdades simples e intervalos entre notación algebraica, paréntesis/corchetes de Exactas y recta numérica, respetando extremos abiertos en el infinito.',
    prerequisiteIds: [],
    diagnosticIds: ['swapped_open_closed_bracket', 'closed_bracket_on_infinity', 'swapped_interval_bounds'],
    exerciseFamilies: ['intervals_translation'],
    evidenceMechanisms: ['CHECKS_DATA sec-intervalos', 'intervalOf', 'formatSet', 'diagnoseInequality'],
  },
  {
    id: 'inequalities.compound_and_or_sets',
    sectionId: 'sec-compuestas',
    chapter: 1,
    order: 2,
    title: 'Desigualdades compuestas (AND / OR), intersección, unión y De Morgan',
    description:
      'Resuelve conjunciones (serie / intersección) y disyunciones (paralelo / unión), detecta tautologías ℝ, conjuntos vacíos ∅ y huecos entre intervalos disjuntos.',
    prerequisiteIds: ['inequalities.intervals_and_number_line'],
    diagnosticIds: ['confused_and_with_or', 'swapped_open_closed_bracket'],
    exerciseFamilies: ['compound_and_or_sets'],
    evidenceMechanisms: ['RETOS 1-5', 'CHECKS_DATA sec-compuestas', 'intersect', 'union', 'compute'],
  },
  {
    id: 'inequalities.linear_and_factored_solving',
    sectionId: 'sec-inecuaciones',
    chapter: 1,
    order: 3,
    title: 'Resolución algebraica de inecuaciones lineales, dobles y cuadráticas factorizadas',
    description:
      'Despeja inecuaciones lineales y encadenadas invirtiendo el sentido al multiplicar o dividir por negativos, y resuelve productos (x − a)(x − b) ≶ 0 analizando ambos pares de signos.',
    prerequisiteIds: ['inequalities.compound_and_or_sets'],
    diagnosticIds: [
      'forgot_flip_on_negative_div',
      'factored_assumed_both_positive_only',
      'confused_and_with_or',
      'swapped_open_closed_bracket',
    ],
    exerciseFamilies: ['linear_and_factored_solving'],
    evidenceMechanisms: ['CHECKS_DATA sec-inecuaciones', 'solveLinearInequality', 'solveFactoredQuadratic', 'diagnoseInequality'],
  },
]);

export const CIRCUITOS_DIAGNOSTIC_TAXONOMY = Object.freeze({
  forgot_flip_on_negative_div: {
    id: 'forgot_flip_on_negative_div',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'lentes-brillo',
    competencyId: 'inequalities.linear_and_factored_solving',
    shortLabel: 'Dividió o multiplicó por un negativo sin invertir el sentido de la desigualdad',
  },
  swapped_open_closed_bracket: {
    id: 'swapped_open_closed_bracket',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'sospecha',
    competencyId: 'inequalities.intervals_and_number_line',
    shortLabel: 'Confundió paréntesis abierto ( ) con corchete cerrado [ ] en el extremo',
  },
  closed_bracket_on_infinity: {
    id: 'closed_bracket_on_infinity',
    category: ERROR_CATEGORIES.SYNTAX,
    pose: 'colapso',
    competencyId: 'inequalities.intervals_and_number_line',
    shortLabel: 'Escribió corchete cerrado en −∞ o +∞ (el infinito nunca se alcanza)',
  },
  confused_and_with_or: {
    id: 'confused_and_with_or',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'pensativa',
    competencyId: 'inequalities.compound_and_or_sets',
    shortLabel: 'Confundió intersección (AND / ∧) con unión (OR / ∨)',
  },
  factored_assumed_both_positive_only: {
    id: 'factored_assumed_both_positive_only',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'panico',
    competencyId: 'inequalities.linear_and_factored_solving',
    shortLabel: 'En un producto > 0 o < 0 solo analizó un caso de signos e ignoró (−)·(−) = (+)',
  },
  swapped_interval_bounds: {
    id: 'swapped_interval_bounds',
    category: ERROR_CATEGORIES.SYNTAX,
    pose: 'unamused',
    competencyId: 'inequalities.intervals_and_number_line',
    shortLabel: 'Escribió el extremo mayor antes que el menor en el intervalo (b; a)',
  },
});

export const CIRCUITOS_COMPETENCY_ALIASES = Object.freeze({});
export const CROSS_MODULE_PREREQUISITES = Object.freeze({});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = CIRCUITOS_COMPETENCY_ALIASES[id] || id;
  return CIRCUITOS_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  return CIRCUITOS_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return CIRCUITOS_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}

export const INEQUALITIES_COMPETENCIES = CIRCUITOS_COMPETENCIES;
export const ERROR_TAXONOMY = CIRCUITOS_DIAGNOSTIC_TAXONOMY;
export const DIAGNOSTIC_TO_TAXONOMY = CIRCUITOS_DIAGNOSTIC_TAXONOMY;
