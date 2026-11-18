/**
 * @file js/modules/racionales-irracionales/competencies-map.js
 * Static Competency Map and 10-Diagnostic Cognitive Taxonomy for Unit 07
 * (Funciones Racionales e Irracionales — racionales-irracionales.html).
 * Exact 5 canonical IDs from CURRICULUM_AUDIT.md §5 rows 61-65 with intra-module DAG only.
 * Pure Vanilla ES2023. Zero DOM. Zero eval. Zero emojis.
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

export const RI_COMPETENCIES = Object.freeze([
  {
    id: 'rational.simplification_lcm_and_operations',
    sectionId: 'sec-1',
    submodule: 'racionales',
    chapter: 1,
    order: 1,
    title: 'Simplificación racional con dominio preservado, M(x) y operaciones',
    description:
      'Factoriza numerador y denominador antes de simplificar expresiones P(x)/Q(x), conserva las exclusiones originales del denominador en el dominio de validez, construye el MCM polinómico M(x) y opera fracciones racionales sin tachar sumandos.',
    prerequisiteIds: [],
    diagnosticIds: [
      'lost_excluded_domain_on_cancel',
      'cancelled_terms_instead_of_factors',
      'wrong_lcm_product_instead_of_lcm',
    ],
    exerciseFamilies: ['rational_simplify_and_lcm', 'rational_operations'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'rational.equations_and_inequalities',
    sectionId: 'sec-2',
    submodule: 'racionales',
    chapter: 1,
    order: 2,
    title: 'Ecuaciones e inecuaciones racionales con exclusión de polos',
    description:
      'Resuelve ecuaciones racionales mediante M(x) descartando raíces prohibidas del denominador, y resuelve inecuaciones racionales por estudio de signos respetando extremos abiertos sobre las raíces de Q(x).',
    prerequisiteIds: ['rational.simplification_lcm_and_operations'],
    diagnosticIds: ['accepted_excluded_root_in_equation'],
    exerciseFamilies: ['rational_equations_inequalities'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'rational.domain_holes_and_asymptotes',
    sectionId: 'sec-3',
    submodule: 'racionales',
    chapter: 1,
    order: 3,
    title: 'Dominio, ceros, agujeros vs. asíntotas verticales y asíntotas horizontales',
    description:
      'Distingue discontinuidades evitables (mult_P >= mult_Q, ordenada evaluada en la simplificada) de asíntotas verticales (mult_P < mult_Q), ubica C₀ dentro del dominio, determina la asíntota horizontal según los grados y reconstruye fórmulas desde gráficos.',
    prerequisiteIds: ['rational.simplification_lcm_and_operations'],
    diagnosticIds: [
      'hole_vs_va_multiplicity_confusion',
      'inverted_ha_degree_or_coeff_ratio',
    ],
    exerciseFamilies: ['rational_holes_vs_asymptotes', 'rational_full_study_and_ha'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'irrational.domain_and_radical_equations',
    sectionId: 'sec-5',
    submodule: 'irracionales',
    chapter: 2,
    order: 4,
    title: 'Dominio de radicales (par vs. impar) y ecuaciones con soluciones extraviadas',
    description:
      'Determina el dominio máximo según la paridad del índice y la posición del radical (g(x) >= 0, g(x) > 0 en divisor, o todo Dom g si n es impar) y resuelve ecuaciones irracionales verificando dominio y compatibilidad de signo para descartar raíces extraviadas.',
    prerequisiteIds: [],
    diagnosticIds: [
      'even_vs_odd_radical_domain_confusion',
      'accepted_extraneous_squaring_root',
      'distributed_radical_over_sum',
    ],
    exerciseFamilies: ['irrational_domain_and_equations'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'irrational.graphs_analysis_and_piecewise',
    sectionId: 'sec-6',
    submodule: 'irracionales',
    chapter: 2,
    order: 5,
    title: 'Gráficas radicales desplazadas, imagen, ceros y funciones por tramos mixtas',
    description:
      'Analiza dominio, imagen cerrada según el signo de k, ceros e intersecciones de curvas k·√(ax + b) + c, y estudia funciones definidas por tramos combinando ramas racionales, cuadráticas y radicales.',
    prerequisiteIds: [
      'irrational.domain_and_radical_equations',
      'rational.domain_holes_and_asymptotes',
    ],
    diagnosticIds: ['wrong_radical_image_or_piecewise_bound'],
    exerciseFamilies: ['irrational_graphs_and_piecewise'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
]);

export const RI_DIAGNOSTIC_TAXONOMY = Object.freeze({
  lost_excluded_domain_on_cancel: {
    id: 'lost_excluded_domain_on_cancel',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'lentes-brillo',
    competencyId: 'rational.simplification_lcm_and_operations',
    shortLabel: 'Simplificó factores sin conservar las exclusiones del denominador original en el dominio',
  },
  cancelled_terms_instead_of_factors: {
    id: 'cancelled_terms_instead_of_factors',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'unamused',
    competencyId: 'rational.simplification_lcm_and_operations',
    shortLabel: 'Tachó sumandos separados por + o − en lugar de factores multiplicativos',
  },
  wrong_lcm_product_instead_of_lcm: {
    id: 'wrong_lcm_product_instead_of_lcm',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'pensativa',
    competencyId: 'rational.simplification_lcm_and_operations',
    shortLabel: 'Multiplicó denominadores sin factorizar potencias repetidas u olvidó escalar el numerador',
  },
  accepted_excluded_root_in_equation: {
    id: 'accepted_excluded_root_in_equation',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'panico',
    competencyId: 'rational.equations_and_inequalities',
    shortLabel: 'Aceptó una raíz que anula un denominador original o cerró el corchete sobre el polo',
  },
  hole_vs_va_multiplicity_confusion: {
    id: 'hole_vs_va_multiplicity_confusion',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'sospecha',
    competencyId: 'rational.domain_holes_and_asymptotes',
    shortLabel: 'Confundió punto agujero (mult_P >= mult_Q) con asíntota vertical o lo incluyó en C₀',
  },
  inverted_ha_degree_or_coeff_ratio: {
    id: 'inverted_ha_degree_or_coeff_ratio',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'evaluando',
    competencyId: 'rational.domain_holes_and_asymptotes',
    shortLabel: 'Invirtió b_m/a_n, leyó el término desordenado en la A.H. o confundió x= con y=',
  },
  even_vs_odd_radical_domain_confusion: {
    id: 'even_vs_odd_radical_domain_confusion',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'sospecha',
    competencyId: 'irrational.domain_and_radical_equations',
    shortLabel: 'Confundió dominio de índice par vs. impar, extremo abierto en 1/√g o cambio de signo',
  },
  accepted_extraneous_squaring_root: {
    id: 'accepted_extraneous_squaring_root',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'lentes-brillo',
    competencyId: 'irrational.domain_and_radical_equations',
    shortLabel: 'Conservó una solución extraviada que hace negativo al miembro derecho al elevar al cuadrado',
  },
  distributed_radical_over_sum: {
    id: 'distributed_radical_over_sum',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'colapso',
    competencyId: 'irrational.domain_and_radical_equations',
    shortLabel: 'Distribuyó la raíz o el cuadrado sobre una suma o resta (√(a+b) ≠ √a + √b)',
  },
  wrong_radical_image_or_piecewise_bound: {
    id: 'wrong_radical_image_or_piecewise_bound',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'pensativa',
    competencyId: 'irrational.graphs_analysis_and_piecewise',
    shortLabel: 'Asignó ℝ a la imagen de √, invirtió el sentido de k < 0 o erró el borde en tramos',
  },
});

export const RI_COMPETENCY_ALIASES = Object.freeze({});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = RI_COMPETENCY_ALIASES[id] || id;
  return RI_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  if (sectionId === 'sec-4') {
    return RI_COMPETENCIES.filter((c) => c.id === 'rational.domain_holes_and_asymptotes');
  }
  return RI_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return RI_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}

export const RACIONALES_IRRACIONALES_COMPETENCIES = RI_COMPETENCIES;
export const ERROR_TAXONOMY = RI_DIAGNOSTIC_TAXONOMY;
export const DIAGNOSTIC_TO_TAXONOMY = RI_DIAGNOSTIC_TAXONOMY;
