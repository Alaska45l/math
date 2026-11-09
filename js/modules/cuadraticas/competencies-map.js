/**
 * Alaska Math Lab · Función Cuadrática, Factorización y Parábolas
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

export const QUAD_COMPETENCIES = Object.freeze([
  {
    id: 'quadratics.area_model_and_notable_products',
    sectionId: 'sec-area-binomios',
    chapter: 1,
    order: 1,
    title: 'Multiplicación de binomios, modelo de área y productos notables',
    description:
      'Desarrolla productos de dos binomios mediante partición geométrica en cuatro regiones, identifica cuadrado de un binomio, diferencia de cuadrados y detecta falsas cuadráticas por cancelación del término de grado 2.',
    prerequisiteIds: [],
    diagnosticIds: ['distributed_square_over_sum'],
  },
  {
    id: 'quadratics.sum_product_factoring',
    sectionId: 'sec-balanza-suma-producto',
    chapter: 1,
    order: 2,
    title: 'Factor común y factorización de trinomios mónicos por suma y producto',
    description:
      'Reconstruye el producto (x + m)(x + n) a partir de x² + bx + c determinando pares enteros m, n tales que m + n = b y m · n = c guiándose por la regla de signos.',
    prerequisiteIds: ['quadratics.area_model_and_notable_products'],
    diagnosticIds: ['confused_sum_product_signs_vieta'],
  },
  {
    id: 'quadratics.grouping_and_factoring_strategy',
    sectionId: 'sec-agrupacion-estrategia',
    chapter: 1,
    order: 3,
    title: 'Factorización por agrupación (a ≠ 1) y brújula estratégica de 5 pasos',
    description:
      'Aplica el árbol de decisión completo (factor común, diferencia de cuadrados, trinomio cuadrado perfecto, suma-producto y descomposición de bx en mx + nx con m · n = a · c).',
    prerequisiteIds: ['quadratics.sum_product_factoring'],
    diagnosticIds: ['forgot_leading_a_in_factored_form'],
  },
  {
    id: 'quadratics.canonical_form_and_vertex',
    sectionId: 'sec-canonica-vertice',
    chapter: 2,
    order: 4,
    title: 'Forma canónica f(x) = a(x − xᵥ)² + yᵥ, concavidad, vértice y despeje por raíz',
    description:
      'Interpreta desplazamientos y escalado vertical respecto de la parábola matriz y = x², lee coordenadas del vértice (xᵥ; yᵥ) y despeja raíces recordando √(u²) = |u|.',
    prerequisiteIds: ['quadratics.area_model_and_notable_products'],
    diagnosticIds: [
      'inverted_vertex_h_sign',
      'confused_c_with_canonical_k',
      'omitted_plus_minus_in_square_root',
    ],
  },
  {
    id: 'quadratics.factored_form_and_symmetry',
    sectionId: 'sec-factorizada-simetria',
    chapter: 2,
    order: 5,
    title: 'Forma factorizada f(x) = a(x − x₁)(x − x₂), producto nulo y simetría de raíces',
    description:
      'Halla ceros por propiedad del producto cero sin cancelar variables, ubica el eje de simetría en el promedio xᵥ = (x₁ + x₂)/2 y reconstruye el coeficiente principal a con un punto de paso.',
    prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.sum_product_factoring'],
    diagnosticIds: ['divided_by_x_lost_zero_root', 'forgot_leading_a_in_factored_form'],
  },
  {
    id: 'quadratics.completing_the_square',
    sectionId: 'sec-completar-cuadrado',
    chapter: 2,
    order: 6,
    title: 'Completar el cuadrado con neutro aditivo (+0) y deducción de xᵥ = −b/(2a)',
    description:
      'Transforma cualquier cuadrática de forma polinómica a canónica sumando y restando (b/(2a))² y distribuyendo el coeficiente principal a sin alterar la igualdad.',
    prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.area_model_and_notable_products'],
    diagnosticIds: ['unbalanced_completing_square', 'inverted_vertex_h_sign'],
  },
  {
    id: 'quadratics.discriminant_and_vieta',
    sectionId: 'sec-discriminante-vieta',
    chapter: 3,
    order: 7,
    title: 'Fórmula resolvente, naturaleza de las raíces por Δ = b² − 4ac y Cardano-Vieta',
    description:
      'Descompone la resolvente como xᵥ ± √Δ/(2a), clasifica las raíces según el signo de Δ y utiliza las relaciones x₁ + x₂ = −b/a y x₁ · x₂ = c/a con parámetros.',
    prerequisiteIds: ['quadratics.completing_the_square', 'quadratics.factored_form_and_symmetry'],
    diagnosticIds: ['neg_b_or_square_sign_in_resolvente', 'confused_sum_product_signs_vieta'],
  },
  {
    id: 'quadratics.full_analysis_exactas',
    sectionId: 'sec-radiografia-cuadratica',
    chapter: 3,
    order: 8,
    title: 'Radiografía analítica completa: Imagen, C₀, C⁺, C⁻, monotonía y restricción de inversibilidad',
    description:
      'Distingue coordenadas del eje X (dominio, intervalos de crecimiento/decrecimiento, positividad y negatividad) de alturas del eje Y (imagen con corchete cerrado en yᵥ) y restringe ramas para biyectividad.',
    prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.discriminant_and_vieta'],
    diagnosticIds: ['used_yv_for_monotonicity_or_open_image'],
  },
  {
    id: 'quadratics.parabola_line_tangency',
    sectionId: 'sec-interseccion-recta-parabola',
    chapter: 3,
    order: 9,
    title: 'Sistemas mixtos parábola-recta y condición analítica de tangencia (Δ_int = 0)',
    description:
      'Plantea la ecuación diferencia ax² + (b − m)x + (c − d) = 0, clasifica la recta en secante, tangente o exterior y despeja parámetros de tangencia.',
    prerequisiteIds: ['quadratics.discriminant_and_vieta'],
    diagnosticIds: ['neg_b_or_square_sign_in_resolvente'],
  },
  {
    id: 'quadratics.extremum_optimization',
    sectionId: 'sec-optimizacion-extremos',
    chapter: 4,
    order: 10,
    title: 'Optimización de extremos en problemas geométricos y físicos con dominio restringido',
    description:
      'Modela áreas, costos o trayectorias mediante funciones cuadráticas, determina el dominio físico de validez y calcula extremos absolutos en el vértice y en los bordes del intervalo.',
    prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.full_analysis_exactas'],
    diagnosticIds: ['inverted_vertex_h_sign', 'used_yv_for_monotonicity_or_open_image'],
  },
]);

export const QUAD_DIAGNOSTIC_TAXONOMY = Object.freeze({
  inverted_vertex_h_sign: {
    id: 'inverted_vertex_h_sign',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'sospecha',
    competencyId: 'quadratics.canonical_form_and_vertex',
    shortLabel: 'Signo invertido en la abscisa del vértice xᵥ',
  },
  confused_c_with_canonical_k: {
    id: 'confused_c_with_canonical_k',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'lentes-brillo',
    competencyId: 'quadratics.canonical_form_and_vertex',
    shortLabel: 'Confusión entre altura del vértice yᵥ y ordenada al origen f(0)',
  },
  distributed_square_over_sum: {
    id: 'distributed_square_over_sum',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'colapso',
    competencyId: 'quadratics.area_model_and_notable_products',
    shortLabel: 'Distribución inválida del exponente en (a ± b)² sin doble producto',
  },
  divided_by_x_lost_zero_root: {
    id: 'divided_by_x_lost_zero_root',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'enojada',
    competencyId: 'quadratics.factored_form_and_symmetry',
    shortLabel: 'División por x en cuadrática incompleta perdiendo la raíz x = 0',
  },
  omitted_plus_minus_in_square_root: {
    id: 'omitted_plus_minus_in_square_root',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'evaluando',
    competencyId: 'quadratics.canonical_form_and_vertex',
    shortLabel: 'Omisión de la rama negativa al despejar √(u²) = |u|',
  },
  forgot_leading_a_in_factored_form: {
    id: 'forgot_leading_a_in_factored_form',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'pensativa',
    competencyId: 'quadratics.factored_form_and_symmetry',
    shortLabel: 'Omisión del coeficiente principal a ≠ 1 en la forma factorizada',
  },
  unbalanced_completing_square: {
    id: 'unbalanced_completing_square',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'sospecha',
    competencyId: 'quadratics.completing_the_square',
    shortLabel: 'Desbalance al completar el cuadrado (no sumar +0 o no multiplicar por a)',
  },
  neg_b_or_square_sign_in_resolvente: {
    id: 'neg_b_or_square_sign_in_resolvente',
    category: ERROR_CATEGORIES.ARITHMETIC,
    pose: 'colapso',
    competencyId: 'quadratics.discriminant_and_vieta',
    shortLabel: 'Error de signo en −b o en (−b)² dentro de la fórmula resolvente',
  },
  used_yv_for_monotonicity_or_open_image: {
    id: 'used_yv_for_monotonicity_or_open_image',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'lentes-brillo',
    competencyId: 'quadratics.full_analysis_exactas',
    shortLabel: 'Uso de yᵥ en intervalos de monotonía o paréntesis abierto en la imagen',
  },
  confused_sum_product_signs_vieta: {
    id: 'confused_sum_product_signs_vieta',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'pensativa',
    competencyId: 'quadratics.discriminant_and_vieta',
    shortLabel: 'Inversión de signos en suma (−b/a) y producto (c/a) de raíces',
  },
});

export function getCompetencyById(id) {
  return QUAD_COMPETENCIES.find((c) => c.id === id) || null;
}

export function getCompetenciesForSection(sectionId) {
  return QUAD_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return QUAD_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}

// Aliases para compatibilidad hacia atrás
export const QUADRATICS_COMPETENCIES = QUAD_COMPETENCIES;
export const ERROR_TAXONOMY = QUAD_DIAGNOSTIC_TAXONOMY;
export const DIAGNOSTIC_TO_TAXONOMY = QUAD_DIAGNOSTIC_TAXONOMY;
