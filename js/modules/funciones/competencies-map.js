/**
 * Alaska Math Lab · Laboratorio de Funciones (Unidad 02)
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

export const FUNCTIONS_COMPETENCIES = Object.freeze([
  {
    id: 'functions.concept_and_uniqueness',
    sectionId: 'panel-scanner',
    chapter: 2,
    order: 1,
    title: 'Concepto de función, existencia y unicidad (prueba de la recta vertical)',
    description:
      'Distingue funciones de relaciones no funcionales verificando que cada entrada del dominio posea exactamente una única imagen en la representación gráfica, tabular o simbólica.',
    prerequisiteIds: [],
    diagnosticIds: ['vertical_line_two_outputs_ignored'],
    exerciseFamilies: ['function_uniqueness'],
    evidenceMechanisms: ['scanner', 'CHECKS_DATA panel-scanner', 'diagnoseFunction'],
  },
  {
    id: 'functions.domain_image_and_sign_sets',
    sectionId: 'panel-scanner',
    chapter: 2,
    order: 2,
    title: 'Dominio, imagen y conjuntos de ceros y signos (C₀, C⁺, C⁻)',
    description:
      'Lee dominio e imagen por proyección sobre los ejes X e Y excluyendo puntos abiertos y asíntotas, y determina C₀, C⁺ y C⁻ como subconjuntos del dominio sobre el eje X.',
    prerequisiteIds: ['functions.concept_and_uniqueness'],
    diagnosticIds: ['read_y_axis_instead_of_x_for_sets', 'closed_bracket_on_excluded_point_or_extremum'],
    exerciseFamilies: ['domain_image_and_signs'],
    evidenceMechanisms: ['scanner', 'radiografia Lente 1', 'CHECKS_DATA panel-scanner/panel-radiografia'],
  },
  {
    id: 'functions.monotonicity_extrema_and_continuity',
    sectionId: 'panel-radiografia',
    chapter: 2,
    order: 3,
    title: 'Monotonía (I↑, I↓), extremos locales vs. absolutos y continuidad gráfica',
    description:
      'Identifica intervalos de crecimiento y decrecimiento sobre el eje X sin confundir signo con monotonía, distingue extremos locales de absolutos y reconoce discontinuidades evitables o de salto.',
    prerequisiteIds: ['functions.domain_image_and_sign_sets'],
    diagnosticIds: [
      'read_y_axis_instead_of_x_for_sets',
      'confused_negative_with_decreasing',
      'closed_bracket_on_excluded_point_or_extremum',
    ],
    exerciseFamilies: ['monotonicity_and_extrema'],
    evidenceMechanisms: ['radiografia Lentes 2-4', '#rad-quiz', 'CHECKS_DATA panel-radiografia'],
  },
  {
    id: 'functions.bijectivity_and_inverse',
    sectionId: 'panel-inversa',
    chapter: 2,
    order: 4,
    title: 'Inyectividad, biyectividad, función inversa y simetría espejo y = x',
    description:
      'Verifica la condición de inyectividad (falla en m = 0), invierte la tubería de operaciones por propiedad uniforme e interpreta el intercambio (x; y) ⟺ (y; x) respecto de y = x.',
    prerequisiteIds: ['functions.monotonicity_extrema_and_continuity'],
    diagnosticIds: ['inverted_inverse_operations_wrong_order', 'vertical_line_two_outputs_ignored'],
    exerciseFamilies: ['bijectivity_and_inverse'],
    evidenceMechanisms: ['inversa', 'CHECKS_DATA panel-inversa', 'computeLinearInverse'],
  },
  {
    id: 'functions.average_rate_of_change',
    sectionId: 'panel-secante',
    chapter: 2,
    order: 5,
    title: 'Tasa de cambio promedio (TCP) y pendiente de la recta secante',
    description:
      'Calcula Δy / Δx con sus unidades físicas entre dos instantes distintos, interpreta tasa positiva, negativa o nula y explica por qué Δx = 0 no define tasa promedio.',
    prerequisiteIds: ['functions.domain_image_and_sign_sets'],
    diagnosticIds: ['inverted_tcp_ratio_dx_over_dy'],
    exerciseFamilies: ['average_rate_of_change'],
    evidenceMechanisms: ['secante', 'CHECKS_DATA panel-secante', 'computeSecantTcp'],
  },
]);

export const FUNCTIONS_DIAGNOSTIC_TAXONOMY = Object.freeze({
  vertical_line_two_outputs_ignored: {
    id: 'vertical_line_two_outputs_ignored',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'panico',
    competencyId: 'functions.concept_and_uniqueness',
    shortLabel: 'Aceptó dos salidas para un mismo x o confundió unicidad con inyectividad',
  },
  read_y_axis_instead_of_x_for_sets: {
    id: 'read_y_axis_instead_of_x_for_sets',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'lentes-brillo',
    competencyId: 'functions.domain_image_and_sign_sets',
    shortLabel: 'Leyó alturas del eje Y en lugar de valores de x sobre el eje X (Candado del eje X)',
  },
  confused_negative_with_decreasing: {
    id: 'confused_negative_with_decreasing',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'sospecha',
    competencyId: 'functions.monotonicity_extrema_and_continuity',
    shortLabel: 'Confundió función negativa (C⁻, debajo del eje X) con función decreciente (I↓)',
  },
  inverted_tcp_ratio_dx_over_dy: {
    id: 'inverted_tcp_ratio_dx_over_dy',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'colapso',
    competencyId: 'functions.average_rate_of_change',
    shortLabel: 'Invirtió el cociente incremental calculando Δx / Δy en lugar de Δy / Δx',
  },
  inverted_inverse_operations_wrong_order: {
    id: 'inverted_inverse_operations_wrong_order',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'pensativa',
    competencyId: 'functions.bijectivity_and_inverse',
    shortLabel: 'Al invertir f(x) = mx + b no invirtió el orden/signo de las operaciones o ignoró m = 0',
  },
  closed_bracket_on_excluded_point_or_extremum: {
    id: 'closed_bracket_on_excluded_point_or_extremum',
    category: ERROR_CATEGORIES.SYNTAX,
    pose: 'unamused',
    competencyId: 'functions.domain_image_and_sign_sets',
    shortLabel: 'Incluyó un punto excluido/asíntota o usó corchete incorrecto en el intervalo',
  },
});

export const FUNCTIONS_COMPETENCY_ALIASES = Object.freeze({});

export const CROSS_MODULE_PREREQUISITES = Object.freeze({
  'functions.concept_and_uniqueness': ['inequalities.intervals_and_number_line'],
  'functions.domain_image_and_sign_sets': ['functions.concept_and_uniqueness', 'inequalities.compound_and_or_sets'],
});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = FUNCTIONS_COMPETENCY_ALIASES[id] || id;
  return FUNCTIONS_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  return FUNCTIONS_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return FUNCTIONS_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}

export const FN_COMPETENCIES = FUNCTIONS_COMPETENCIES;
export const ERROR_TAXONOMY = FUNCTIONS_DIAGNOSTIC_TAXONOMY;
export const DIAGNOSTIC_TO_TAXONOMY = FUNCTIONS_DIAGNOSTIC_TAXONOMY;
