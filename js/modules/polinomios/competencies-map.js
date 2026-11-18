/**
 * @file js/modules/polinomios/competencies-map.js
 * Mapa Estático de Competencias y Taxonomía de Diagnósticos Cognitivos para Unidad 06 (Polinomios).
 * Usa exactamente los 5 IDs canónicos de CURRICULUM_AUDIT.md §5 (filas 56-60) con prerrequisitos intra-módulo.
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

export const POLY_COMPETENCIES = Object.freeze([
  {
    id: 'polynomials.structure_degree_and_equality',
    sectionId: 'sec-1',
    chapter: 1,
    order: 1,
    title: 'Estructura polinómica, grado, coeficientes, polinomio nulo e igualdad',
    description:
      'Distingue polinomios genuinos de expresiones racionales, radicales o con exponente negativo; identifica grado, coeficiente principal y término independiente aun cuando el polinomio está desordenado, distingue al polinomio nulo (sin grado) e iguala coeficientes semejantes.',
    prerequisiteIds: [],
    diagnosticIds: [
      'non_polynomial_accepted',
      'zero_poly_degree_zero',
      'wrong_leading_coeff_unordered',
    ],
    exerciseFamilies: ['poly_structure_equality'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'polynomials.arithmetic_and_degree_laws',
    sectionId: 'sec-2',
    chapter: 1,
    order: 2,
    title: 'Operaciones polinómicas (suma, resta, producto) y leyes del grado',
    description:
      'Opera términos semejantes y aplica la propiedad distributiva sin fuga de signos en la resta; justifica por qué gr(P + Q) <= máx(gr(P), gr(Q)) ante cancelación de términos principales y gr(P · Q) = gr(P) + gr(Q).',
    prerequisiteIds: ['polynomials.structure_degree_and_equality'],
    diagnosticIds: ['subtract_poly_sign_leak', 'added_degrees_on_sum'],
    exerciseFamilies: ['poly_arithmetic_degree_laws'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'polynomials.division_ruffini_and_remainder',
    sectionId: 'sec-3',
    chapter: 2,
    order: 3,
    title: 'División euclídea, Regla de Ruffini (mónica y ax − b) y Teorema del Resto',
    description:
      'Aplica el algoritmo P(x) = Q(x)·C(x) + R(x) con gr(R) < gr(Q) o R = 0; ejecuta Ruffini completando ceros faltantes, reescala el cociente por 1/a frente a divisores (ax − b) y vincula el resto con P(r) y la divisibilidad.',
    prerequisiteIds: ['polynomials.arithmetic_and_degree_laws'],
    diagnosticIds: [
      'ruffini_sign_error',
      'ruffini_forgot_missing_zero_coeff',
      'ruffini_unscaled_nonmonic_quotient',
    ],
    exerciseFamilies: ['poly_division_euclid', 'ruffini_and_remainder'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'polynomials.factoring_and_gauss_roots',
    sectionId: 'sec-5',
    chapter: 3,
    order: 4,
    title: 'Factorización en factores mónicos primos, 6 métodos y Teorema de Gauss',
    description:
      'Descompone polinomios sobre los reales combinando factor común, agrupación, diferencia de cuadrados, trinomio/cuatrinomio perfecto, resolvente cuadrática y candidatos racionales p/q de Gauss con multiplicidades algebraicas.',
    prerequisiteIds: ['polynomials.division_ruffini_and_remainder'],
    diagnosticIds: ['forgot_leading_coeff_factoring', 'swapped_p_q_in_gauss'],
    exerciseFamilies: ['factoring_and_gauss_roots'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'polynomials.parameter_reconstruction_and_modeling',
    sectionId: 'sec-7',
    chapter: 4,
    order: 5,
    title: 'Reconstrucción desde raíces/multiplicidades, parámetros y modelado geométrico',
    description:
      'Determina parámetros desconocidos mediante restos, divisibilidad o igualdad de polinomios; reconstruye cúbicas a partir de raíces con multiplicidad y un punto de paso y resuelve modelos de volumen mediante factorización.',
    prerequisiteIds: ['polynomials.factoring_and_gauss_roots'],
    diagnosticIds: ['forgot_leading_coeff_factoring', 'ruffini_sign_error'],
    exerciseFamilies: ['parameter_and_volume_modeling'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
]);

export const POLY_DIAGNOSTIC_TAXONOMY = Object.freeze({
  non_polynomial_accepted: {
    id: 'non_polynomial_accepted',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'unamused',
    competencyId: 'polynomials.structure_degree_and_equality',
    shortLabel: 'Aceptó exponente negativo, raíz sobre x o x en el divisor como polinomio',
  },
  zero_poly_degree_zero: {
    id: 'zero_poly_degree_zero',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'lentes-brillo',
    competencyId: 'polynomials.structure_degree_and_equality',
    shortLabel: 'Atribuyó grado 0 al polinomio nulo (en lugar de sin grado)',
  },
  wrong_leading_coeff_unordered: {
    id: 'wrong_leading_coeff_unordered',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'sospecha',
    competencyId: 'polynomials.structure_degree_and_equality',
    shortLabel: 'Leyó el primer término escrito en lugar del mayor exponente en un polinomio desordenado',
  },
  subtract_poly_sign_leak: {
    id: 'subtract_poly_sign_leak',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'colapso',
    competencyId: 'polynomials.arithmetic_and_degree_laws',
    shortLabel: 'Restó solo el primer término de Q(x) sin distribuir el signo menos',
  },
  added_degrees_on_sum: {
    id: 'added_degrees_on_sum',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'pensativa',
    competencyId: 'polynomials.arithmetic_and_degree_laws',
    shortLabel: 'Sumó grados al sumar polinomios o ignoró la cancelación de términos principales',
  },
  ruffini_sign_error: {
    id: 'ruffini_sign_error',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'sospecha',
    competencyId: 'polynomials.division_ruffini_and_remainder',
    shortLabel: 'Invirtió el signo de la raíz r al aplicar Ruffini o el Teorema del Resto',
  },
  ruffini_forgot_missing_zero_coeff: {
    id: 'ruffini_forgot_missing_zero_coeff',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'panico',
    competencyId: 'polynomials.division_ruffini_and_remainder',
    shortLabel: 'Omitió los ceros de potencias faltantes en el renglón superior de Ruffini',
  },
  ruffini_unscaled_nonmonic_quotient: {
    id: 'ruffini_unscaled_nonmonic_quotient',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'lentes-brillo',
    competencyId: 'polynomials.division_ruffini_and_remainder',
    shortLabel: 'Olvidó dividir el cociente por a al aplicar Ruffini con divisor (ax − b)',
  },
  forgot_leading_coeff_factoring: {
    id: 'forgot_leading_coeff_factoring',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'pensativa',
    competencyId: 'polynomials.factoring_and_gauss_roots',
    shortLabel: 'Omitió el coeficiente principal a_n ≠ 1 al escribir la forma factorizada',
  },
  swapped_p_q_in_gauss: {
    id: 'swapped_p_q_in_gauss',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'unamused',
    competencyId: 'polynomials.factoring_and_gauss_roots',
    shortLabel: 'Invirtió el Teorema de Gauss usando q/p en lugar de p/q (p | a₀, q | a_n)',
  },
});

export const POLY_COMPETENCY_ALIASES = Object.freeze({});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = POLY_COMPETENCY_ALIASES[id] || id;
  return POLY_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  if (sectionId === 'sec-4') {
    return POLY_COMPETENCIES.filter((c) => c.id === 'polynomials.division_ruffini_and_remainder');
  }
  if (sectionId === 'sec-6') {
    return POLY_COMPETENCIES.filter((c) => c.id === 'polynomials.factoring_and_gauss_roots');
  }
  return POLY_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return POLY_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}

export const POLINOMIOS_COMPETENCIES = POLY_COMPETENCIES;
export const ERROR_TAXONOMY = POLY_DIAGNOSTIC_TAXONOMY;
export const DIAGNOSTIC_TO_TAXONOMY = POLY_DIAGNOSTIC_TAXONOMY;
