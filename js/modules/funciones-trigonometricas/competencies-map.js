/**
 * @file js/modules/funciones-trigonometricas/competencies-map.js
 * Mapa Estático de Competencias (exactamente los 4 IDs trig_functions.* de CURRICULUM_AUDIT.md §5 filas 85–88)
 * y Taxonomía de Diagnósticos Cognitivos (10 IDs) para Unidad 11 · Funciones Trigonométricas.
 *
 * Prerrequisitos estrictamente intra-módulo (las aristas inter-módulo viven en curriculum-registry.js).
 * 100% puro, determinista, sin DOM, sin eval, sin emojis.
 */

export const ERROR_CATEGORIES = Object.freeze({
  CONCEPTUAL: 'conceptual',
  PROCEDURAL: 'procedural',
  ARITHMETIC: 'arithmetic',
  REPRESENTATION: 'representation',
  SYNTAX: 'syntax',
});

export const TRIG_FUNCTIONS_COMPETENCIES = Object.freeze([
  {
    id: 'trig_functions.congruence_classes_and_cartesian_def',
    moduleId: 'funciones-trigonometricas',
    sectionId: 'sec-1',
    chapter: 1,
    order: 1,
    title: 'Congruencia angular, clases C_α y definición cartesiana en los 4 cuadrantes',
    description:
      'Convierte entre grados sexagesimales y radianes, reduce ángulos al representante principal en [0; 2π) o [0°; 360°) en clases de congruencia C_α, y determina las 6 razones trigonométricas mediante (abs, ord, r.v.) y signos por cuadrante.',
    prerequisiteIds: [],
    diagnosticIds: [
      'negative_angle_not_reduced_to_principal',
      'swapped_abs_ord_in_cartesian_def',
    ],
    exerciseFamilies: ['congruence_principal_rep', 'cartesian_def_six_ratios'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
    moduleId: 'funciones-trigonometricas',
    sectionId: 'sec-3',
    chapter: 2,
    order: 2,
    title: 'Las 6 funciones trigonométricas: dominios diferenciados, gráficas, períodos y biyectividad',
    description:
      'Distingue con precisión dominios excluidos (π/2 + kπ para tg/sec vs kπ para cotg/cosec), imágenes ([−1; 1], ℝ, (−∞; −1] ∪ [1; +∞)), ceros, períodos (2π vs π) y restricciones de dominio/codominio para lograr biyectividad.',
    prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
    diagnosticIds: [
      'assumed_identical_domain_for_all_six_trig',
      'confused_tan_period_2pi_with_pi',
      'accepted_sin_cos_outside_unit_interval',
    ],
    exerciseFamilies: ['six_functions_domain_image_period', 'bijectivity_domain_restriction'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'trig_functions.pythagorean_identities_and_reduction',
    moduleId: 'funciones-trigonometricas',
    sectionId: 'sec-5',
    chapter: 3,
    order: 3,
    title: 'Identidades pitagóricas, ángulos notables y reducción al primer cuadrante',
    description:
      'Calcula valores exactos con radicales racionalizados dado un cuadrante y una razón trigonométrica, reduce ángulos de los cuadrantes II, III y IV al I conservando el signo y verifica identidades trigonométricas.',
    prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
    diagnosticIds: [
      'ignored_quadrant_sign_in_pythagorean',
      'forgot_rationalization_or_reciprocal',
      'wrong_quadrant_reduction_formula',
    ],
    exerciseFamilies: ['exact_quadrant_six_ratios', 'first_quadrant_reduction_numeric'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'trig_functions.periodic_equations_and_domain_checks',
    moduleId: 'funciones-trigonometricas',
    sectionId: 'sec-6',
    chapter: 3,
    order: 4,
    title: 'Ecuaciones trigonométricas periódicas, uniones de clases C_α y control de dominio',
    description:
      'Resuelve ecuaciones trigonométricas elementales y cuadráticas en [0; π/2], [0; 2π) y ℝ expresando soluciones periódicas como uniones de clases C_α y descartando raíces que anulan denominadores o caen en polos.',
    prerequisiteIds: [
      'trig_functions.six_functions_domains_graphs_and_bijectivity',
      'trig_functions.pythagorean_identities_and_reduction',
    ],
    diagnosticIds: [
      'missed_second_quadrant_solution_branch',
      'accepted_pole_root_in_trig_equation',
    ],
    exerciseFamilies: ['trig_equation_0_to_2pi', 'trig_equation_periodic_R_classes'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
]);

export const TRIG_FUNCTIONS_DIAGNOSTIC_TAXONOMY = Object.freeze({
  negative_angle_not_reduced_to_principal: {
    id: 'negative_angle_not_reduced_to_principal',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'sospecha',
    competencyId: 'trig_functions.congruence_classes_and_cartesian_def',
    shortLabel: 'Representante de clase C_α negativo o mayor que 2π / 360° sin reducir al intervalo principal',
  },
  swapped_abs_ord_in_cartesian_def: {
    id: 'swapped_abs_ord_in_cartesian_def',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'pensativa',
    competencyId: 'trig_functions.congruence_classes_and_cartesian_def',
    shortLabel: 'Intercambio entre abscisa (cos) y ordenada (sen) o radio vector r.v. omitido',
  },
  assumed_identical_domain_for_all_six_trig: {
    id: 'assumed_identical_domain_for_all_six_trig',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'lentes-brillo',
    competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
    shortLabel: 'Confusión entre polos de tg/sec (cos x = 0) y polos de cotg/cosec (sen x = 0), o asumir Dom = ℝ',
  },
  confused_tan_period_2pi_with_pi: {
    id: 'confused_tan_period_2pi_with_pi',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'unamused',
    competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
    shortLabel: 'Confusión entre período π (tg/cotg) y período 2π (sen/cos/sec/cosec)',
  },
  accepted_sin_cos_outside_unit_interval: {
    id: 'accepted_sin_cos_outside_unit_interval',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'panico',
    competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
    shortLabel: 'Violación de imagen: |sen x| > 1, |cos x| > 1, o |sec x| < 1',
  },
  ignored_quadrant_sign_in_pythagorean: {
    id: 'ignored_quadrant_sign_in_pythagorean',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'enojada',
    competencyId: 'trig_functions.pythagorean_identities_and_reduction',
    shortLabel: 'Ignoró el signo del cuadrante al despejar ±√(1 − sen² α) o ±√(1 − cos² α)',
  },
  forgot_rationalization_or_reciprocal: {
    id: 'forgot_rationalization_or_reciprocal',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'evaluando',
    competencyId: 'trig_functions.pythagorean_identities_and_reduction',
    shortLabel: 'Recíproca cruzada (sec ↔ 1/sen o cosec ↔ 1/cos) o radical sin racionalizar',
  },
  wrong_quadrant_reduction_formula: {
    id: 'wrong_quadrant_reduction_formula',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'sospecha',
    competencyId: 'trig_functions.pythagorean_identities_and_reduction',
    shortLabel: 'Fórmula de reducción al I cuadrante incorrecta o pérdida de signo en QII/QIII/QIV',
  },
  missed_second_quadrant_solution_branch: {
    id: 'missed_second_quadrant_solution_branch',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'colapso',
    competencyId: 'trig_functions.periodic_equations_and_domain_checks',
    shortLabel: 'Falta la segunda rama simétrica en [0; 2π) o la rama negativa ± en ecuación cuadrática',
  },
  accepted_pole_root_in_trig_equation: {
    id: 'accepted_pole_root_in_trig_equation',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'panico',
    competencyId: 'trig_functions.periodic_equations_and_domain_checks',
    shortLabel: 'Aceptó una raíz prohibida que anula un denominador o cae en un polo de tg/sec/cosec/cotg',
  },
});

export const TRIG_FUNCTIONS_COMPETENCY_ALIASES = Object.freeze({
  'trigf.congruencia': 'trig_functions.congruence_classes_and_cartesian_def',
  'trigf.funciones': 'trig_functions.six_functions_domains_graphs_and_bijectivity',
  'trigf.identidades': 'trig_functions.pythagorean_identities_and_reduction',
  'trigf.ecuaciones': 'trig_functions.periodic_equations_and_domain_checks',
});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = TRIG_FUNCTIONS_COMPETENCY_ALIASES[id] || id;
  return TRIG_FUNCTIONS_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  return TRIG_FUNCTIONS_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return TRIG_FUNCTIONS_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}

// Aliases estándar
export const FUNCIONES_TRIG_COMPETENCIES = TRIG_FUNCTIONS_COMPETENCIES;
export const ERROR_TAXONOMY = TRIG_FUNCTIONS_DIAGNOSTIC_TAXONOMY;
export const DIAGNOSTIC_TO_TAXONOMY = TRIG_FUNCTIONS_DIAGNOSTIC_TAXONOMY;
