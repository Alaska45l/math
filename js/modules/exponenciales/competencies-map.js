/**
 * Alaska Math Lab · Funciones, Modelos y Ecuaciones Exponenciales
 * Mapa Estático de Competencias y Taxonomía de Diagnósticos Cognitivos (LEARNING_ARCHITECTURE.md §4.9)
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

export const EXP_COMPETENCIES = Object.freeze([
  {
    id: 'exponentials.tables_additive_vs_multiplicative',
    sectionId: 'sec-1',
    chapter: 1,
    order: 1,
    title: 'Discriminación de saltos aditivos vs razones multiplicativas en tablas',
    description:
      'Identifica si un fenómeno con pasos uniformes en x avanza sumando una diferencia constante (lineal) o multiplicando por una razón constante a (exponencial), usando 3 o más filas para descartar parábolas impostoras.',
    prerequisiteIds: [],
    diagnosticIds: ['linear_difference_instead_of_ratio'],
  },
  {
    id: 'exponentials.neutral_and_order_of_operations',
    sectionId: 'sec-2',
    chapter: 1,
    order: 2,
    title: 'Rol del neutro a⁰ = 1 y jerarquía k · aˣ ≠ (k · a)ˣ',
    description:
      'Reconoce al coeficiente k como población en el instante inicial x = 0 y respeta la precedencia estricta de la potenciación sobre la multiplicación exterior, evitando crear falsas bases compuestas.',
    prerequisiteIds: ['exponentials.tables_additive_vs_multiplicative'],
    diagnosticIds: ['multiplied_k_and_base', 'confused_fencepost_x_minus_1'],
  },
  {
    id: 'exponentials.rational_density_and_base_restrictions',
    sectionId: 'sec-3',
    chapter: 2,
    order: 3,
    title: 'Densidad racional y restricciones de la base en ℝ (a > 0, a ≠ 1)',
    description:
      'Comprende por qué la extensión del dominio a los números racionales exige una base estrictamente positiva para evitar discontinuidades complejas y por qué se descartan las bases 0 y 1.',
    prerequisiteIds: ['exponentials.neutral_and_order_of_operations'],
    diagnosticIds: ['invalid_base_restriction'],
  },
  {
    id: 'exponentials.base_reflection_and_asymptote',
    sectionId: 'sec-4',
    chapter: 2,
    order: 4,
    title: 'Simetría (1/a)ˣ = a⁻ˣ y asíntota horizontal y = 0',
    description:
      'Interpreta el decaimiento radiactivo como reflexión especular respecto al eje Y mediante exponentes negativos y reconoce la recta y = 0 como frontera asintótica abierta inalcanzable.',
    prerequisiteIds: ['exponentials.rational_density_and_base_restrictions'],
    diagnosticIds: ['closed_bracket_on_asymptote'],
  },
  {
    id: 'exponentials.four_quadrants_monotonicity',
    sectionId: 'sec-5',
    chapter: 2,
    order: 5,
    title: 'Anatomía de la monotonía en los cuatro cuadrantes (k, a)',
    description:
      'Determina el crecimiento o decrecimiento estricto y el signo de las imágenes analizando conjuntamente si a > 1 o 0 < a < 1 y si k > 0 o k < 0, demostrando que g(x) = −3 · (1/2)ˣ es creciente.',
    prerequisiteIds: ['exponentials.base_reflection_and_asymptote'],
    diagnosticIds: ['ignored_negative_k_monotonicity'],
  },
  {
    id: 'exponentials.analytical_reconstruction_two_points',
    sectionId: 'sec-6',
    chapter: 3,
    order: 6,
    title: 'Reconstrucción analítica y geométrica a partir de dos puntos',
    description:
      'Plantea el sistema de dos puntos, divide miembro a miembro para cancelar k y despejar la base exacta mediante raíces racionales conservando fracciones exactas sin truncar.',
    prerequisiteIds: ['exponentials.four_quadrants_monotonicity'],
    diagnosticIds: [],
  },
  {
    id: 'exponentials.time_models_rates_and_euler_base',
    sectionId: 'sec-7',
    chapter: 3,
    order: 7,
    title: 'Modelos temporales con 1 ± r, períodos compuestos t/T y base e',
    description:
      'Formula modelos de crecimiento porcentual, semidesintegración con exponente compuesto t/T y decaimiento continuo con la constante e, respetando la coherencia de unidades temporales.',
    prerequisiteIds: ['exponentials.analytical_reconstruction_two_points'],
    diagnosticIds: ['raw_percentage_as_base', 'inverted_period_exponent'],
  },
  {
    id: 'exponentials.shifts_and_horizontal_asymptote',
    sectionId: 'sec-8',
    chapter: 4,
    order: 8,
    title: 'Desplazamientos horizontales, verticales y asíntota abierta y = c',
    description:
      'Analiza la traslación rígida f(x) = k · a^(x−h) + c, ubica el anclaje P(h; k + c), traslada la asíntota a y = c y establece la imagen abierta (c; +∞) o (−∞; c) con paréntesis redondo estricto.',
    prerequisiteIds: ['exponentials.base_reflection_and_asymptote'],
    diagnosticIds: ['closed_bracket_on_asymptote'],
  },
  {
    id: 'exponentials.full_analytical_study',
    sectionId: 'sec-9',
    chapter: 4,
    order: 9,
    title: 'Radiografía analítica completa: Dom, Im, asíntota, C₀, C⁺, C⁻ y monotonía',
    description:
      'Realiza el informe exhaustivo de una función trasladada f(x) = c − (1/a)ˣ deduciendo ceros mediante igualación de bases e intervalos de signos coherentes con el crecimiento analítico.',
    prerequisiteIds: ['exponentials.shifts_and_horizontal_asymptote'],
    diagnosticIds: ['closed_bracket_on_asymptote'],
  },
  {
    id: 'exponentials.equations_three_methods_in_reals',
    sectionId: 'sec-10',
    chapter: 4,
    order: 10,
    title: 'Los 3 métodos de ecuaciones exponenciales en ℝ sin logaritmos',
    description:
      'Resuelve ecuaciones mediante igualación de potencias con base común (cuidando paréntesis en cocientes), extracción de factor común y sustitución cuadrática u = aˣ descartando raíces u ≤ 0.',
    prerequisiteIds: ['exponentials.full_analytical_study'],
    diagnosticIds: [
      'subtracted_exponents_without_parens',
      'accepted_non_positive_u_in_substitution',
    ],
  },
]);

export const EXP_DIAGNOSTIC_TAXONOMY = Object.freeze({
  linear_difference_instead_of_ratio: {
    id: 'linear_difference_instead_of_ratio',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'unamused',
    competencyId: 'exponentials.tables_additive_vs_multiplicative',
    shortLabel: 'Confundió salto aditivo constante con razón multiplicativa fija',
  },
  multiplied_k_and_base: {
    id: 'multiplied_k_and_base',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'colapso',
    competencyId: 'exponentials.neutral_and_order_of_operations',
    shortLabel: 'Multiplicó k por a violando la jerarquía: k · aˣ ≠ (k · a)ˣ',
  },
  confused_fencepost_x_minus_1: {
    id: 'confused_fencepost_x_minus_1',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'sospecha',
    competencyId: 'exponentials.neutral_and_order_of_operations',
    shortLabel: 'Desfasaje x − 1 arrastrado de sucesiones discretas en lugar de x = 0',
  },
  invalid_base_restriction: {
    id: 'invalid_base_restriction',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'panico',
    competencyId: 'exponentials.rational_density_and_base_restrictions',
    shortLabel: 'Aceptó base negativa a < 0 o neutra a = 1 en funciones reales',
  },
  raw_percentage_as_base: {
    id: 'raw_percentage_as_base',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'lentes-brillo',
    competencyId: 'exponentials.time_models_rates_and_euler_base',
    shortLabel: 'Usó la tasa r directamente como base en lugar del factor 1 ± r',
  },
  inverted_period_exponent: {
    id: 'inverted_period_exponent',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'pensativa',
    competencyId: 'exponentials.time_models_rates_and_euler_base',
    shortLabel: 'Multiplicó t · T en lugar de dividir t / T para contar ciclos',
  },
  ignored_negative_k_monotonicity: {
    id: 'ignored_negative_k_monotonicity',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'enojada',
    competencyId: 'exponentials.four_quadrants_monotonicity',
    shortLabel: 'Ignoró que k < 0 invierte la monotonía de la curva exponencial',
  },
  closed_bracket_on_asymptote: {
    id: 'closed_bracket_on_asymptote',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'lentes-brillo',
    competencyId: 'exponentials.shifts_and_horizontal_asymptote',
    shortLabel: 'Corchete cerrado en la asíntota horizontal inalcanzable de la imagen',
  },
  subtracted_exponents_without_parens: {
    id: 'subtracted_exponents_without_parens',
    category: ERROR_CATEGORIES.ARITHMETIC,
    pose: 'sospecha',
    competencyId: 'exponentials.equations_three_methods_in_reals',
    shortLabel: 'Restó exponentes en cociente sin paréntesis en el divisor',
  },
  accepted_non_positive_u_in_substitution: {
    id: 'accepted_non_positive_u_in_substitution',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'panico',
    competencyId: 'exponentials.equations_three_methods_in_reals',
    shortLabel: 'Aceptó raíces auxiliares u ≤ 0 en sustitución cuadrática u = aˣ',
  },
});

export function getCompetencyById(id) {
  return EXP_COMPETENCIES.find((c) => c.id === id) || null;
}

export function getCompetenciesForSection(sectionId) {
  return EXP_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return EXP_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}

// Aliases para compatibilidad hacia atrás
export const EXPONENTIALS_COMPETENCIES = EXP_COMPETENCIES;
export const ERROR_TAXONOMY = EXP_DIAGNOSTIC_TAXONOMY;
export const DIAGNOSTIC_TO_TAXONOMY = EXP_DIAGNOSTIC_TAXONOMY;
