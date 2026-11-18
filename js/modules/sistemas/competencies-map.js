/**
 * @file js/modules/sistemas/competencies-map.js
 * Mapa Estático de Competencias (4 competencias canónicas de CURRICULUM_AUDIT.md §5 filas 42–45)
 * y Taxonomía de Diagnósticos Cognitivos (9 IDs) para Unidad 04 · Sistemas de Ecuaciones.
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

export const SYS_COMPETENCIES = Object.freeze([
  {
    id: 'systems.linear_2x2_graphical_and_analytical',
    moduleId: 'sistemas',
    sectionId: 'sec-metodos-interseccion',
    chapter: 1,
    order: 1,
    title: 'Resolución analítica (sustitución, igualación, reducción) e intersección gráfica 2×2',
    description:
      'Interpreta un sistema lineal 2×2 como el cruce de dos rectas en ℝ² y lo resuelve con aritmética racional exacta mediante sustitución, igualación o reducción por suma y resta, limpiando fracciones y distributivas.',
    prerequisiteIds: [],
    diagnosticIds: [
      'forgot_to_find_second_variable',
      'sign_error_in_elimination_or_substitution',
    ],
    exerciseFamilies: ['solve_2x2_integer_and_rational', 'solve_2x2_fractions_distribution'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'systems.classification_scd_sci_si',
    moduleId: 'sistemas',
    sectionId: 'sec-clasificacion-scd-sci-si',
    chapter: 1,
    order: 2,
    title: 'Clasificación de sistemas: Compatible Determinado (SCD), Indeterminado (SCI) e Incompatible (SI)',
    description:
      'Distingue solución única (secantes), infinitas soluciones sobre una recta (coincidentes, 0 = 0) y ausencia de solución (paralelas no coincidentes, 0 = k ≠ 0) comparando pendientes/ordenadas y reducción algebraica.',
    prerequisiteIds: ['systems.linear_2x2_graphical_and_analytical'],
    diagnosticIds: ['confused_sci_with_si', 'only_checked_slopes_ignored_intercepts'],
    exerciseFamilies: ['classify_scd_sci_si', 'construct_sci_or_si_partner'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'systems.parametric_systems',
    moduleId: 'sistemas',
    sectionId: 'sec-sistemas-parametricos',
    chapter: 2,
    order: 3,
    title: 'Sistemas lineales con parámetros (k ∈ ℝ − {a}) para SCD, SCI y SI',
    description:
      'Determina valores críticos de un parámetro k respetando las exclusiones de dominio iniciales y analiza cada valor crítico por separado para decidir si produce SCI o SI.',
    prerequisiteIds: ['systems.classification_scd_sci_si'],
    diagnosticIds: [
      'ignored_parametric_exclusion_domain',
      'only_checked_slopes_ignored_intercepts',
      'confused_sci_with_si',
    ],
    exerciseFamilies: ['parametric_k_for_si_or_sci', 'parametric_k_domain_exclusion'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'systems.modeling_and_graph_reconstruction',
    moduleId: 'sistemas',
    sectionId: 'sec-modelizacion-reconstruccion',
    chapter: 2,
    order: 4,
    title: 'Reconstrucción de sistemas desde gráficas y modelización de problemas',
    description:
      'Reconstruye el sistema 2×2 desde gráficas (incluyendo rectas perpendiculares), traduce enunciados verbales de mezclas, cinemática, porcentajes/descuentos y geometría, y verifica la factibilidad física del resultado.',
    prerequisiteIds: ['systems.classification_scd_sci_si'],
    diagnosticIds: [
      'discount_instead_of_paid_percentage',
      'reversed_comparison_difference',
      'wrong_perpendicular_reconstruction',
      'unrealistic_or_unchecked_solution_in_context',
    ],
    exerciseFamilies: ['reconstruct_from_graph_perpendicular', 'word_problem_discount_or_mixture'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
]);

export const SYS_DIAGNOSTIC_TAXONOMY = Object.freeze({
  confused_sci_with_si: {
    id: 'confused_sci_with_si',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'sospecha',
    competencyId: 'systems.classification_scd_sci_si',
    shortLabel: 'Confusión entre identidad 0 = 0 (SCI) y absurdo 0 = k (SI)',
  },
  forgot_to_find_second_variable: {
    id: 'forgot_to_find_second_variable',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'pensativa',
    competencyId: 'systems.linear_2x2_graphical_and_analytical',
    shortLabel: 'Respuesta incompleta (solo x₀) o coordenadas invertidas (y₀; x₀)',
  },
  sign_error_in_elimination_or_substitution: {
    id: 'sign_error_in_elimination_or_substitution',
    category: ERROR_CATEGORIES.ARITHMETIC,
    pose: 'colapso',
    competencyId: 'systems.linear_2x2_graphical_and_analytical',
    shortLabel: 'Error de signo al distribuir resta o fracción al sustituir',
  },
  discount_instead_of_paid_percentage: {
    id: 'discount_instead_of_paid_percentage',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'lentes-brillo',
    competencyId: 'systems.modeling_and_graph_reconstruction',
    shortLabel: 'Uso del descuento (0,10) en lugar del porcentaje efectivamente pagado (0,90)',
  },
  reversed_comparison_difference: {
    id: 'reversed_comparison_difference',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'unamused',
    competencyId: 'systems.modeling_and_graph_reconstruction',
    shortLabel: 'Inversión de suma y resta en enunciados de comparación ("excede en")',
  },
  ignored_parametric_exclusion_domain: {
    id: 'ignored_parametric_exclusion_domain',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'lentes-brillo',
    competencyId: 'systems.parametric_systems',
    shortLabel: 'Inclusión de valores prohibidos del parámetro (ej. k = 0 o a = 1)',
  },
  only_checked_slopes_ignored_intercepts: {
    id: 'only_checked_slopes_ignored_intercepts',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'pensativa',
    competencyId: 'systems.classification_scd_sci_si',
    shortLabel: 'Conclusión de SCI/SI solo con pendientes/Δ = 0 sin revisar ordenadas',
  },
  wrong_perpendicular_reconstruction: {
    id: 'wrong_perpendicular_reconstruction',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'sospecha',
    competencyId: 'systems.modeling_and_graph_reconstruction',
    shortLabel: 'Pendiente perpendicular mal reconstruida desde el gráfico (faltó −1/m)',
  },
  unrealistic_or_unchecked_solution_in_context: {
    id: 'unrealistic_or_unchecked_solution_in_context',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'unamused',
    competencyId: 'systems.modeling_and_graph_reconstruction',
    shortLabel: 'Aceptación de cantidades físicamente imposibles o sin verificar SI',
  },
});

export const SYS_COMPETENCY_ALIASES = Object.freeze({
  'sistemas.metodos': 'systems.linear_2x2_graphical_and_analytical',
  'sistemas.clasificacion': 'systems.classification_scd_sci_si',
  'sistemas.parametricos': 'systems.parametric_systems',
  'sistemas.modelizacion': 'systems.modeling_and_graph_reconstruction',
});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = SYS_COMPETENCY_ALIASES[id] || id;
  return SYS_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  return SYS_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return SYS_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}

export const SISTEMAS_COMPETENCIES = SYS_COMPETENCIES;
export const ERROR_TAXONOMY = SYS_DIAGNOSTIC_TAXONOMY;
export const DIAGNOSTIC_TO_TAXONOMY = SYS_DIAGNOSTIC_TAXONOMY;
