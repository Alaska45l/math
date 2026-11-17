/**
 * Alaska Math Lab · Valor Absoluto y Funciones por Partes (Unidad 01 / 02)
 * Mapa Estático de Competencias y Taxonomía de Diagnósticos Cognitivos
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

export const ABS_COMPETENCIES = Object.freeze([
  {
    id: 'abs.distance_1d_and_equations',
    sectionId: 'sec-1',
    chapter: 1,
    order: 1,
    title: 'Distancia 1D en ℝ y ecuaciones básicas |x − a| = d',
    description:
      'Interpreta el valor absoluto |x − a| como distancia geométrica sobre la recta real y resuelve ecuaciones considerando ambas ramas.',
    prerequisiteIds: [],
    diagnosticIds: [],
    exerciseFamilies: ['resolver_modulo'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'analytical_evaluator'],
  },
  {
    id: 'abs.cartesian_mirror_parent',
    sectionId: 'sec-2',
    chapter: 1,
    order: 2,
    title: 'Espejo cartesiano y función matriz f(x) = |x|',
    description:
      'Reconoce la gráfica en V de la función matriz |x| como reflexión de la rama negativa de y = x sobre el eje X.',
    prerequisiteIds: ['abs.distance_1d_and_equations'],
    diagnosticIds: ['missing_abs_bars'],
    exerciseFamilies: ['ecuacion_desde_grafica'],
    evidenceMechanisms: ['check_verification', 'diagnostic_detector'],
  },
  {
    id: 'abs.translations_vertex_hk',
    sectionId: 'sec-3',
    chapter: 2,
    order: 3,
    title: 'Traslaciones horizontal y vertical del vértice (h; k)',
    description:
      'Determina el vértice (h; k) en |x − h| + k distinguiendo el signo de h dentro de las barras y el corrimiento vertical k afuera.',
    prerequisiteIds: ['abs.cartesian_mirror_parent'],
    diagnosticIds: ['inverted_h_sign', 'swapped_h_k'],
    exerciseFamilies: ['hallar_vertice'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'abs.vertical_scale_and_reflection',
    sectionId: 'sec-4',
    chapter: 2,
    order: 4,
    title: 'Escala vertical, pendiente de ramas y reflexión (a ≷ 0)',
    description:
      'Analiza el efecto del coeficiente principal a sobre la apertura y orientación de la V calculando Δy / Δx desde el vértice.',
    prerequisiteIds: ['abs.cartesian_mirror_parent'],
    diagnosticIds: ['wrong_reflection_sign', 'inverted_slope_fraction'],
    exerciseFamilies: ['graficar_interactivo'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'abs.canonical_form_synthesis',
    sectionId: 'sec-5',
    chapter: 2,
    order: 5,
    title: 'Síntesis de forma canónica f(x) = a|x − h| + k',
    description:
      'Reconstruye la fórmula canónica desde gráfica o vértice + punto y extrae factores internos como |mx − c| = |m|·|x − c/m|.',
    prerequisiteIds: ['abs.translations_vertex_hk', 'abs.vertical_scale_and_reflection'],
    diagnosticIds: ['unfactored_inner_coeff'],
    exerciseFamilies: ['ecuacion_desde_grafica', 'graficar_interactivo'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'abs.piecewise_decomposition',
    sectionId: 'sec-6',
    chapter: 3,
    order: 6,
    title: 'Apertura de barras en función lineal por tramos',
    description:
      'Desarma f(x) = a|x − h| + k en dos ramas lineales según el signo de (x − h) manteniendo continuidad en x = h.',
    prerequisiteIds: ['abs.canonical_form_synthesis'],
    diagnosticIds: ['inverted_h_sign'],
    exerciseFamilies: ['desarmar_en_partes'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'abs.full_analytical_study_and_inequalities',
    sectionId: 'sec-7',
    chapter: 3,
    order: 7,
    title: 'Estudio analítico completo e inecuaciones con módulo',
    description:
      'Determina Dominio, Imagen, C₀, C⁺, C⁻, monotonía en el eje X y resuelve ecuaciones e inecuaciones |x − h| ≤ d o ≥ d.',
    prerequisiteIds: ['abs.piecewise_decomposition'],
    diagnosticIds: ['confused_x_and_y_in_intervals'],
    exerciseFamilies: ['rango_y_positividad', 'resolver_modulo'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'abs.piecewise_domain_customs',
    sectionId: 'sec-8',
    chapter: 4,
    order: 8,
    title: 'Aduana de dominio y evaluación en funciones por tramos',
    description:
      'Selecciona la fórmula correspondiente a un valor dado x verificando desigualdades estrictas y no estrictas en cada intervalo.',
    prerequisiteIds: ['abs.full_analytical_study_and_inequalities'],
    diagnosticIds: [],
    exerciseFamilies: ['evaluar_por_partes'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'analytical_evaluator'],
  },
  {
    id: 'abs.boundary_continuity_and_uniqueness',
    sectionId: 'sec-9',
    chapter: 4,
    order: 9,
    title: 'Unicidad en fronteras, huecos, saltos y continuidad',
    description:
      'Verifica unicidad en puntos frontera (extremo cerrado vs abierto) y distingue discontinuidades evitables y de salto.',
    prerequisiteIds: ['abs.piecewise_domain_customs'],
    diagnosticIds: ['both_endpoints_closed_violation'],
    exerciseFamilies: ['dominio_rango_partes'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'abs.step_floor_and_ceiling',
    sectionId: 'sec-10',
    chapter: 4,
    order: 10,
    title: 'Funciones escalonadas piso ⌊x⌋ y techo ⌈x⌉',
    description:
      'Evalúa y grafica funciones escalonadas en intervalos positivos y negativos distinguiendo extremos cerrados y abiertos de cada peldaño.',
    prerequisiteIds: ['abs.boundary_continuity_and_uniqueness'],
    diagnosticIds: [],
    exerciseFamilies: ['dominio_rango_partes'],
    evidenceMechanisms: ['check_verification', 'interactive_widget'],
  },
]);

export const ABS_DIAGNOSTIC_TAXONOMY = Object.freeze({
  inverted_h_sign: {
    id: 'inverted_h_sign',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'sospecha',
    competencyId: 'abs.translations_vertex_hk',
    shortLabel: 'Signo invertido en el corrimiento horizontal h dentro de |x − h|',
  },
  swapped_h_k: {
    id: 'swapped_h_k',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'colapso',
    competencyId: 'abs.translations_vertex_hk',
    shortLabel: 'Intercambió las coordenadas h (eje X) y k (eje Y) del vértice',
  },
  wrong_reflection_sign: {
    id: 'wrong_reflection_sign',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'evaluando',
    competencyId: 'abs.vertical_scale_and_reflection',
    shortLabel: 'Signo erróneo del coeficiente a que controla si la V abre arriba o abajo',
  },
  inverted_slope_fraction: {
    id: 'inverted_slope_fraction',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'colapso',
    competencyId: 'abs.vertical_scale_and_reflection',
    shortLabel: 'Pendiente invertida Δx/Δy en lugar de Δy/Δx',
  },
  missing_abs_bars: {
    id: 'missing_abs_bars',
    category: ERROR_CATEGORIES.SYNTAX,
    pose: 'enojada',
    competencyId: 'abs.cartesian_mirror_parent',
    shortLabel: 'Omitió las barras de valor absoluto |...| escribiendo una recta',
  },
  unfactored_inner_coeff: {
    id: 'unfactored_inner_coeff',
    category: ERROR_CATEGORIES.EQUIVALENT_FORM,
    pose: 'orgullosa',
    competencyId: 'abs.canonical_form_synthesis',
    shortLabel: 'Forma equivalente con factor multiplicativo sin extraer fuera de las barras',
  },
  confused_x_and_y_in_intervals: {
    id: 'confused_x_and_y_in_intervals',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'enojada',
    competencyId: 'abs.full_analytical_study_and_inequalities',
    shortLabel: 'Usó la coordenada y = k del vértice en intervalos definidos sobre el eje X (x = h)',
  },
  both_endpoints_closed_violation: {
    id: 'both_endpoints_closed_violation',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'sospecha',
    competencyId: 'abs.boundary_continuity_and_uniqueness',
    shortLabel: 'Cerró dos tramos distintos en la misma frontera violando unicidad funcional',
  },
});

export const ABS_COMPETENCY_ALIASES = Object.freeze({});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = ABS_COMPETENCY_ALIASES[id] || id;
  return ABS_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  return ABS_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return ABS_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}
