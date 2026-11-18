/**
 * @file js/modules/lineal/competencies-map.js
 * Mapa Estático de Competencias (5 competencias canónicas de CURRICULUM_AUDIT.md §5 filas 37–41)
 * y Taxonomía de Diagnósticos Cognitivos (10 IDs) para Unidad 03 · Función Lineal.
 *
 * 100% puro, determinista, sin DOM, sin eval, sin emojis.
 */

export const ERROR_CATEGORIES = Object.freeze({
  CONCEPTUAL: 'conceptual',
  PROCEDURAL: 'procedural',
  ARITHMETIC: 'arithmetic',
  REPRESENTATION: 'representation',
  SYNTAX: 'syntax',
});

export const LIN_COMPETENCIES = Object.freeze([
  {
    id: 'linear.definition_slope_and_intercept',
    moduleId: 'lineal',
    sectionId: 'sec-pendiente-estudio',
    chapter: 1,
    order: 1,
    title: 'Definición, pendiente entre dos puntos, recta vertical y estudio completo',
    description:
      'Interpreta f(x) = mx + b, calcula m = (y₂ − y₁)/(x₂ − x₁) distinguiendo rectas verticales sin pendiente (x₁ = x₂) y realiza el estudio analítico completo (Dom, Im, C₀, C⁺, C⁻, monotonía y biyectividad).',
    prerequisiteIds: [],
    diagnosticIds: [
      'inverted_slope_dx_over_dy',
      'sign_error_in_slope_subtraction',
      'swapped_slope_and_intercept',
      'divided_by_zero_vertical_horizontal',
      'confused_x_and_y_in_linear_sets',
    ],
    exerciseFamilies: ['slope_and_explicit_two_points', 'linear_study_c0_cp_cm'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'linear.angle_and_three_equation_forms',
    moduleId: 'lineal',
    sectionId: 'sec-formas-angulo',
    chapter: 1,
    order: 2,
    title: 'Pendiente trigonométrica m = tg(α) y las 3 ecuaciones de la recta',
    description:
      'Relaciona la pendiente con el ángulo de inclinación respecto al semieje +X, convierte entre forma explícita, implícita y segmentaria, e identifica los casos degenerados donde la segmentaria o explícita no existe.',
    prerequisiteIds: ['linear.definition_slope_and_intercept'],
    diagnosticIds: ['segmentary_invalid_zero_case', 'swapped_slope_and_intercept'],
    exerciseFamilies: ['convert_three_forms', 'angle_and_point_equation'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'linear.parallel_perpendicular_and_incidence',
    moduleId: 'lineal',
    sectionId: 'sec-paralelas-perpendiculares',
    chapter: 2,
    order: 3,
    title: 'Posiciones relativas en el plano: paralelismo, perpendicularidad e incidencia',
    description:
      'Clasifica rectas secantes (oblicuas y perpendiculares con m₁·m₂ = −1) y paralelas (coincidentes y no coincidentes), incluyendo el caso singular horizontal perpendicular a vertical, y construye rectas paralelas o perpendiculares por un punto.',
    prerequisiteIds: ['linear.angle_and_three_equation_forms'],
    diagnosticIds: ['confused_parallel_with_perpendicular', 'divided_by_zero_vertical_horizontal'],
    exerciseFamilies: ['parallel_perpendicular_parameter'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'linear.analytic_geometry_distance_midpoint_bisector',
    moduleId: 'lineal',
    sectionId: 'sec-geometria-analitica',
    chapter: 2,
    order: 4,
    title: 'Geometría analítica: punto medio, distancia, mediatriz y distancia punto-recta',
    description:
      'Calcula exactamente punto medio, distancia entre dos puntos, colinealidad, clasificación de triángulos, ecuación de la mediatriz de un segmento y distancia exacta punto-recta con radicales simplificados.',
    prerequisiteIds: ['linear.parallel_perpendicular_and_incidence'],
    diagnosticIds: [
      'mediatriz_missing_midpoint_or_perp',
      'forgot_abs_or_sqrt_in_distance',
      'confused_parallel_with_perpendicular',
    ],
    exerciseFamilies: ['mediatriz_segment', 'point_line_distance_exact'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'linear.modeling_and_piecewise',
    moduleId: 'lineal',
    sectionId: 'sec-modelizacion-tramos',
    chapter: 3,
    order: 5,
    title: 'Modelización lineal en contexto y función lineal por tramos',
    description:
      'Traduce situaciones reales a modelos lineales, evalúa restricciones de dominio físico y analiza funciones definidas por tramos lineales (Dom, Im, C₀, C⁺, C⁻, saltos y biyectividad).',
    prerequisiteIds: ['linear.definition_slope_and_intercept'],
    diagnosticIds: ['piecewise_boundary_inclusion_error', 'confused_x_and_y_in_linear_sets'],
    exerciseFamilies: ['piecewise_linear_eval_and_image', 'linear_modeling_context'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
]);

export const LIN_DIAGNOSTIC_TAXONOMY = Object.freeze({
  inverted_slope_dx_over_dy: {
    id: 'inverted_slope_dx_over_dy',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'colapso',
    competencyId: 'linear.definition_slope_and_intercept',
    shortLabel: 'Pendiente invertida como Δx / Δy en vez de Δy / Δx',
  },
  sign_error_in_slope_subtraction: {
    id: 'sign_error_in_slope_subtraction',
    category: ERROR_CATEGORIES.ARITHMETIC,
    pose: 'sospecha',
    competencyId: 'linear.definition_slope_and_intercept',
    shortLabel: 'Orden cruzado o error de signo en (y₂ − y₁)/(x₂ − x₁)',
  },
  swapped_slope_and_intercept: {
    id: 'swapped_slope_and_intercept',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'pensativa',
    competencyId: 'linear.definition_slope_and_intercept',
    shortLabel: 'Intercambio entre pendiente m y ordenada al origen b',
  },
  confused_parallel_with_perpendicular: {
    id: 'confused_parallel_with_perpendicular',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'unamused',
    competencyId: 'linear.parallel_perpendicular_and_incidence',
    shortLabel: 'Perpendicular escrita como +1/m o −m en vez de −1/m',
  },
  divided_by_zero_vertical_horizontal: {
    id: 'divided_by_zero_vertical_horizontal',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'panico',
    competencyId: 'linear.parallel_perpendicular_and_incidence',
    shortLabel: 'División por cero en recta vertical o confusión vertical vs horizontal',
  },
  segmentary_invalid_zero_case: {
    id: 'segmentary_invalid_zero_case',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'lentes-brillo',
    competencyId: 'linear.angle_and_three_equation_forms',
    shortLabel: 'Forma segmentaria aplicada cuando c = 0, a = 0 o b = 0, o ejes invertidos',
  },
  mediatriz_missing_midpoint_or_perp: {
    id: 'mediatriz_missing_midpoint_or_perp',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'pensativa',
    competencyId: 'linear.analytic_geometry_distance_midpoint_bisector',
    shortLabel: 'Mediatriz trazada por un extremo o sin invertir pendiente',
  },
  forgot_abs_or_sqrt_in_distance: {
    id: 'forgot_abs_or_sqrt_in_distance',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'lentes-brillo',
    competencyId: 'linear.analytic_geometry_distance_midpoint_bisector',
    shortLabel: 'Omisión de √ en distancia entre puntos o de |·| / √(A²+B²) en punto-recta',
  },
  confused_x_and_y_in_linear_sets: {
    id: 'confused_x_and_y_in_linear_sets',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'unamused',
    competencyId: 'linear.definition_slope_and_intercept',
    shortLabel: 'Uso de y/ordenada en C⁺/C⁻ o inclusión de la raíz con corchete',
  },
  piecewise_boundary_inclusion_error: {
    id: 'piecewise_boundary_inclusion_error',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'sospecha',
    competencyId: 'linear.modeling_and_piecewise',
    shortLabel: 'Error de frontera abierta/cerrada (< vs ≤) en función por tramos',
  },
});

export const LIN_COMPETENCY_ALIASES = Object.freeze({
  'lineal.pendiente': 'linear.definition_slope_and_intercept',
  'lineal.formas': 'linear.angle_and_three_equation_forms',
  'lineal.posiciones': 'linear.parallel_perpendicular_and_incidence',
  'lineal.geometria': 'linear.analytic_geometry_distance_midpoint_bisector',
  'lineal.tramos': 'linear.modeling_and_piecewise',
});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = LIN_COMPETENCY_ALIASES[id] || id;
  return LIN_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  return LIN_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return LIN_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}

// Aliases de interfaz estándar
export const LINEAL_COMPETENCIES = LIN_COMPETENCIES;
export const ERROR_TAXONOMY = LIN_DIAGNOSTIC_TAXONOMY;
export const DIAGNOSTIC_TO_TAXONOMY = LIN_DIAGNOSTIC_TAXONOMY;
