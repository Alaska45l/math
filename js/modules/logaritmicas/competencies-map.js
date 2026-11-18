/**
 * competencies-map.js — Mapa de Competencias y Taxonomía de Diagnósticos Cognitivos
 * Unidad 09: Función Logarítmica (logaritmicas.html) · Alaska Math Lab.
 * 100% puro, determinista y libre de DOM.
 * Los prerrequisitos son estrictamente intra-módulo; los enlaces inter-módulo viven en
 * js/core/learning/curriculum-registry.js (CROSS_MODULE_PREREQUISITES).
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

export const LOG_COMPETENCIES = Object.freeze([
  {
    id: 'logarithms.definition_existence_and_special_bases',
    sectionId: 'sec-1',
    chapter: 1,
    order: 1,
    title: 'Definición, existencia en ℝ y bases especiales (log, ln)',
    description:
      'Evalúa logₐ(x) = y ⇔ aʸ = x exigiendo a > 0, a ≠ 1 y x > 0; convierte entre forma exponencial y logarítmica y opera con logaritmo decimal y natural.',
    prerequisiteIds: [],
    diagnosticIds: [
      'non_positive_argument_accepted',
      'invalid_log_base_accepted',
      'confused_exp_log_conversion',
    ],
    exerciseFamilies: ['definicion_y_existencia', 'conversion_exp_log'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector', 'analytical_evaluator'],
  },
  {
    id: 'logarithms.operative_properties_and_change_of_base',
    sectionId: 'sec-2',
    chapter: 1,
    order: 2,
    title: 'Las 5 propiedades operativas y cambio de base',
    description:
      'Aplica producto, cociente, potencia del argumento, raíz del argumento y cambio de base para unificar expresiones sin caer en identidades falsas sobre sumas o productos de logaritmos.',
    prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
    diagnosticIds: [
      'false_sum_identity_log_a_plus_b',
      'false_power_of_whole_log',
      'false_quotient_or_product_of_logs',
      'inverted_change_of_base',
    ],
    exerciseFamilies: ['propiedades_unificacion', 'cambio_de_base_exacto'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector', 'analytical_evaluator'],
  },
  {
    id: 'logarithms.equations_and_systems',
    sectionId: 'sec-3',
    chapter: 2,
    order: 3,
    title: 'Ecuaciones logarítmicas, exponenciales no comunes y sistemas 2×2',
    description:
      'Resuelve ecuaciones logarítmicas descartando raíces extrañas con argumento ≤ 0 (conservando u < 0 en u = logₐ x ∈ ℝ), ecuaciones aˣ = b y sistemas 2×2 con control de dominio.',
    prerequisiteIds: ['logarithms.operative_properties_and_change_of_base'],
    diagnosticIds: [
      'accepted_extraneous_root_in_log_eq',
      'non_positive_argument_accepted',
    ],
    exerciseFamilies: ['ecuacion_log_con_filtro', 'ecuacion_exp_no_comun', 'sistema_logaritmico'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector', 'analytical_evaluator'],
  },
  {
    id: 'logarithms.function_inverse_and_analysis',
    sectionId: 'sec-4',
    chapter: 3,
    order: 4,
    title: 'Inversa de la exponencial, reflexión y estudio analítico completo',
    description:
      'Construye la función inversa por reflexión respecto de y = x intercambiando dominio, imagen y asíntotas, y realiza la radiografía completa (Dom, Im, asíntota vertical, C₀, C⁺, C⁻, monotonía y biyectividad).',
    prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
    diagnosticIds: ['closed_bracket_or_horizontal_asymptote_confusion'],
    exerciseFamilies: ['inversa_explicita_exp_log', 'radiografia_log_completa'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector', 'analytical_evaluator'],
  },
  {
    id: 'logarithms.real_world_time_and_scale_models',
    sectionId: 'sec-6',
    chapter: 4,
    order: 5,
    title: 'Modelos temporales continuos/discretos y escalas logarítmicas',
    description:
      'Despeja tiempos, tasas y magnitudes en modelos biológicos, físicos y en la escala de Richter distinguiendo incrementos multiplicativos 10^ΔM frente a proporciones lineales.',
    prerequisiteIds: ['logarithms.equations_and_systems'],
    diagnosticIds: ['linear_ratio_confusion_in_log_scale'],
    exerciseFamilies: ['modelo_tiempo_y_escala_richter'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector', 'analytical_evaluator'],
  },
]);

export const LOG_DIAGNOSTIC_TAXONOMY = Object.freeze({
  non_positive_argument_accepted: {
    id: 'non_positive_argument_accepted',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'panico',
    competencyId: 'logarithms.definition_existence_and_special_bases',
    shortLabel: 'Aceptó argumento nulo o negativo (x ≤ 0) en un logaritmo real',
  },
  invalid_log_base_accepted: {
    id: 'invalid_log_base_accepted',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'panico',
    competencyId: 'logarithms.definition_existence_and_special_bases',
    shortLabel: 'Aceptó base a ≤ 0 o base neutra a = 1 en un logaritmo real',
  },
  confused_exp_log_conversion: {
    id: 'confused_exp_log_conversion',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'sospecha',
    competencyId: 'logarithms.definition_existence_and_special_bases',
    shortLabel: 'Intercambió base, argumento o exponente al convertir exp ↔ log',
  },
  false_sum_identity_log_a_plus_b: {
    id: 'false_sum_identity_log_a_plus_b',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'unamused',
    competencyId: 'logarithms.operative_properties_and_change_of_base',
    shortLabel: 'Aplicó falsa distributiva sobre suma o resta: logₐ(x ± y) ≠ logₐx ± logₐy',
  },
  false_power_of_whole_log: {
    id: 'false_power_of_whole_log',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'colapso',
    competencyId: 'logarithms.operative_properties_and_change_of_base',
    shortLabel: 'Bajó exponente externo de todo el logaritmo: (logₐx)ⁿ ≠ n·logₐx',
  },
  false_quotient_or_product_of_logs: {
    id: 'false_quotient_or_product_of_logs',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'lentes-brillo',
    competencyId: 'logarithms.operative_properties_and_change_of_base',
    shortLabel: 'Confundió producto o cociente de logaritmos con propiedades del argumento',
  },
  inverted_change_of_base: {
    id: 'inverted_change_of_base',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'pensativa',
    competencyId: 'logarithms.operative_properties_and_change_of_base',
    shortLabel: 'Invirtió numerador y denominador en la fórmula de cambio de base',
  },
  accepted_extraneous_root_in_log_eq: {
    id: 'accepted_extraneous_root_in_log_eq',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'enojada',
    competencyId: 'logarithms.equations_and_systems',
    shortLabel: 'Conservó una raíz extraña que vuelve ≤ 0 algún argumento original',
  },
  closed_bracket_or_horizontal_asymptote_confusion: {
    id: 'closed_bracket_or_horizontal_asymptote_confusion',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'lentes-brillo',
    competencyId: 'logarithms.function_inverse_and_analysis',
    shortLabel: 'Cerró con corchete el borde del dominio o confundió A.V. con A.H.',
  },
  linear_ratio_confusion_in_log_scale: {
    id: 'linear_ratio_confusion_in_log_scale',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'unamused',
    competencyId: 'logarithms.real_world_time_and_scale_models',
    shortLabel: 'Aplicó proporción lineal en vez de razón exponencial 10^ΔM en escala log',
  },
});

export const LOG_COMPETENCY_ALIASES = Object.freeze({
  'logarithms.definition_and_existence': 'logarithms.definition_existence_and_special_bases',
  'logarithms.properties_and_change_of_base': 'logarithms.operative_properties_and_change_of_base',
  'logarithms.inverse_and_full_analysis': 'logarithms.function_inverse_and_analysis',
  'logarithms.time_and_scale_models': 'logarithms.real_world_time_and_scale_models',
});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = LOG_COMPETENCY_ALIASES[id] || id;
  return LOG_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  if (sectionId === 'sec-5') {
    return LOG_COMPETENCIES.filter((c) => c.id === 'logarithms.function_inverse_and_analysis');
  }
  return LOG_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return LOG_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}

export const LOGARITHMS_COMPETENCIES = LOG_COMPETENCIES;
export const ERROR_TAXONOMY = LOG_DIAGNOSTIC_TAXONOMY;
export const DIAGNOSTIC_TO_TAXONOMY = LOG_DIAGNOSTIC_TAXONOMY;
