/**
 * Alaska Math Lab · Análisis Dimensional y Neutro Multiplicativo (Unidad 01)
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

export const UNITS_COMPETENCIES = Object.freeze([
  {
    id: 'units.unitary_factor_neutral_one',
    sectionId: 'sec-neutro',
    chapter: 1,
    order: 1,
    title: 'Conversión de unidades mediante factores unitarios (neutro multiplicativo 1)',
    description:
      'Construye cocientes equivalentes a 1 orientando numerador (pin) y denominador (hueco) para cancelar dimensiones no deseadas sin alterar la magnitud física.',
    prerequisiteIds: [],
    diagnosticIds: ['inverted_conversion_factor', 'confused_prefix_scale_power10', 'omitted_target_unit_or_direction'],
    exerciseFamilies: ['unitary_factor_conversion'],
    evidenceMechanisms: ['PROBLEMS 0,1,2,4', 'CHECKS_DATA sec-neutro', 'compute (sameUnits, neutral)'],
  },
  {
    id: 'units.compound_rates_and_powers',
    sectionId: 'sec-compuestas',
    chapter: 1,
    order: 2,
    title: 'Tasas compuestas y potencias dimensionales (áreas, volúmenes cm³ -> m³)',
    description:
      'Convierte razones entre dos magnitudes y aplica factores repetidos según la dimensión espacial (100² para áreas, 100³ = 10⁶ para volúmenes).',
    prerequisiteIds: ['units.unitary_factor_neutral_one'],
    diagnosticIds: ['forgot_power_exponent_on_unit', 'inverted_conversion_factor', 'omitted_target_unit_or_direction'],
    exerciseFamilies: ['compound_rates_and_powers'],
    evidenceMechanisms: ['PROBLEMS[3] (cubeApplied)', 'CHECKS_DATA sec-compuestas', 'diagnoseDimensional'],
  },
]);

export const UNITS_DIAGNOSTIC_TAXONOMY = Object.freeze({
  inverted_conversion_factor: {
    id: 'inverted_conversion_factor',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'sospecha',
    competencyId: 'units.unitary_factor_neutral_one',
    shortLabel: 'Invirtió el factor unitario (apiló pines o huecos en vez de cancelarlos)',
  },
  forgot_power_exponent_on_unit: {
    id: 'forgot_power_exponent_on_unit',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'colapso',
    competencyId: 'units.compound_rates_and_powers',
    shortLabel: 'Aplicó el factor lineal una sola vez sin elevarlo a la potencia de la dimensión (cm² o cm³)',
  },
  confused_prefix_scale_power10: {
    id: 'confused_prefix_scale_power10',
    category: ERROR_CATEGORIES.ARITHMETIC,
    pose: 'pensativa',
    competencyId: 'units.unitary_factor_neutral_one',
    shortLabel: 'Usó una potencia de 10 o equivalencia horaria incorrecta (ej. 1 kg = 100 g o 1 h = 60 s)',
  },
  omitted_target_unit_or_direction: {
    id: 'omitted_target_unit_or_direction',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'unamused',
    competencyId: 'units.compound_rates_and_powers',
    shortLabel: 'Predicción de escala invertida o conversión incompleta de una sola unidad',
  },
});

export const UNITS_COMPETENCY_ALIASES = Object.freeze({});

export const CROSS_MODULE_PREREQUISITES = Object.freeze({
  'units.unitary_factor_neutral_one': ['powers.quotient_and_product_laws'],
  'units.compound_rates_and_powers': ['units.unitary_factor_neutral_one', 'powers.geometric_squares_and_cubes'],
});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = UNITS_COMPETENCY_ALIASES[id] || id;
  return UNITS_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  return UNITS_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return UNITS_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}

export const DIM_COMPETENCIES = UNITS_COMPETENCIES;
export const ERROR_TAXONOMY = UNITS_DIAGNOSTIC_TAXONOMY;
export const DIAGNOSTIC_TO_TAXONOMY = UNITS_DIAGNOSTIC_TAXONOMY;
