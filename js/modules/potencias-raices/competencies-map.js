/**
 * Alaska Math Lab · Potencias, Raíces y Radicales (Unidad 01)
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

export const POW_COMPETENCIES = Object.freeze([
  {
    id: 'powers.additive_vs_multiplicative_worlds',
    sectionId: 'sec-1',
    chapter: 1,
    order: 1,
    title: 'Mundos aditivo (+0) vs multiplicativo (×1) y lectura de exponentes',
    description:
      'Distingue la suma reiterada desde el neutro aditivo 0 de la potenciación como multiplicación repetida desde el neutro multiplicativo 1.',
    prerequisiteIds: [],
    diagnosticIds: ['additive_instead_of_multiplicative'],
    exerciseFamilies: ['dos_mundos_mitad'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'powers.negative_exponents_and_reciprocals',
    sectionId: 'sec-2',
    chapter: 1,
    order: 2,
    title: 'Exponente cero y exponentes negativos como recíprocos multiplicativos',
    description:
      'Interpreta a⁰ = 1 como ausencia de saltos desde el neutro y a⁻ⁿ = 1/aⁿ como división iterada manteniendo el signo de la base positiva.',
    prerequisiteIds: ['powers.additive_vs_multiplicative_worlds'],
    diagnosticIds: ['zero_exponent_is_zero', 'negative_exponent_is_negative_number'],
    exerciseFamilies: ['exponente_negativo_neutro'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'powers.quotient_and_product_laws',
    sectionId: 'sec-3',
    chapter: 1,
    order: 3,
    title: 'Leyes de producto y cociente de potencias con igual base',
    description:
      'Aplica aᵐ · aⁿ = aᵐ⁺ⁿ y aᵐ : aⁿ = aᵐ⁻ⁿ conservando la base común y reduciendo parejas idénticas al neutro multiplicativo 1.',
    prerequisiteIds: ['powers.negative_exponents_and_reciprocals'],
    diagnosticIds: ['canceled_to_zero_or_counted_ones', 'multiplied_bases_in_same_base_prod'],
    exerciseFamilies: ['cociente_potencias_neutro'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'powers.rational_exponents_and_nth_roots',
    sectionId: 'sec-4',
    chapter: 2,
    order: 4,
    title: 'Exponentes racionales a^(m/n) y raíces enésimas reales',
    description:
      'Traduce entre exponentes fraccionarios y radicales reconociendo el denominador como índice de raíz y el numerador como potencia.',
    prerequisiteIds: ['powers.quotient_and_product_laws'],
    diagnosticIds: [],
    exerciseFamilies: ['dos_mundos_mitad'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'analytical_evaluator'],
  },
  {
    id: 'powers.geometric_squares_and_cubes',
    sectionId: 'sec-5',
    chapter: 2,
    order: 5,
    title: 'Interpretación geométrica de cuadrados, cubos y medidas exactas',
    description:
      'Modela áreas y volúmenes exactos mediante cuadrados, cubos y raíces cuadradas o cúbicas sin aproximar irracionales.',
    prerequisiteIds: ['powers.rational_exponents_and_nth_roots'],
    diagnosticIds: [],
    exerciseFamilies: ['dos_mundos_mitad'],
    evidenceMechanisms: ['check_verification', 'interactive_widget'],
  },
  {
    id: 'powers.prime_factor_tree_extraction',
    sectionId: 'sec-6',
    chapter: 2,
    order: 6,
    title: 'Descomposición en factores primos y extracción de paquetes del radical',
    description:
      'Factoriza radicandos numéricos y algebraicos en potencias primas para extraer grupos completos de tamaño igual al índice.',
    prerequisiteIds: ['powers.rational_exponents_and_nth_roots'],
    diagnosticIds: ['unsimplified_radical'],
    exerciseFamilies: ['arbol_raiz_orden_n'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'powers.radical_simplification_and_rationalization',
    sectionId: 'sec-7',
    chapter: 3,
    order: 7,
    title: 'Simplificación de radicales, operaciones exactas y racionalización',
    description:
      'Opera sumas de radicales semejantes, productos con distinto índice y racionalización de denominadores monomios y binomios conjugados.',
    prerequisiteIds: ['powers.prime_factor_tree_extraction'],
    diagnosticIds: ['unsimplified_radical'],
    exerciseFamilies: ['simplificar_radical_vars', 'producto_radicales'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'powers.binomial_power_non_distributivity',
    sectionId: 'sec-8',
    chapter: 3,
    order: 8,
    title: 'No distributividad sobre la suma: (a ± b)ⁿ ≠ aⁿ ± bⁿ',
    description:
      'Evita distribuir exponentes o raíces sobre sumas y restas desarrollando los términos cruzados en cuadrado y cubo de binomio.',
    prerequisiteIds: ['powers.geometric_squares_and_cubes'],
    diagnosticIds: ['distributed_power_over_sum'],
    exerciseFamilies: ['choque_mundos_binomio'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'powers.real_domain_restrictions_and_abs_root',
    sectionId: 'sec-9',
    chapter: 4,
    order: 9,
    title: 'Restricciones de dominio en ℝ y la identidad √(x²) = |x|',
    description:
      'Controla radicandos de índice par ≥ 0, evita distribuir raíces sobre factores negativos y aplica el valor absoluto en raíces pares de potencias.',
    prerequisiteIds: ['powers.radical_simplification_and_rationalization'],
    diagnosticIds: ['forgot_abs_in_even_root', 'illegal_real_root_distribution'],
    exerciseFamilies: ['auditoria_reales_exactas'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'powers.precedence_and_paradox_auditing',
    sectionId: 'sec-10',
    chapter: 4,
    order: 10,
    title: 'Precedencia −aⁿ vs (−a)ⁿ y auditoría de paradojas en ℝ',
    description:
      'Distingue el signo externo de la base negativa entre paréntesis y audita cadenas algebraicas verificando validez real paso a paso.',
    prerequisiteIds: [
      'powers.real_domain_restrictions_and_abs_root',
      'powers.binomial_power_non_distributivity',
    ],
    diagnosticIds: ['neg_base_precedence', 'illegal_real_root_distribution'],
    exerciseFamilies: ['auditoria_reales_exactas'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
]);

export const POW_DIAGNOSTIC_TAXONOMY = Object.freeze({
  additive_instead_of_multiplicative: {
    id: 'additive_instead_of_multiplicative',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'unamused',
    competencyId: 'powers.additive_vs_multiplicative_worlds',
    shortLabel: 'Confundió potencia con multiplicación aditiva (sumó en lugar de multiplicar factores)',
  },
  zero_exponent_is_zero: {
    id: 'zero_exponent_is_zero',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'sospecha',
    competencyId: 'powers.negative_exponents_and_reciprocals',
    shortLabel: 'Asignó 0 en lugar del neutro multiplicativo 1 a una potencia con exponente 0',
  },
  negative_exponent_is_negative_number: {
    id: 'negative_exponent_is_negative_number',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'colapso',
    competencyId: 'powers.negative_exponents_and_reciprocals',
    shortLabel: 'Convirtió el exponente negativo en signo negativo de la base en vez de recíproco',
  },
  canceled_to_zero_or_counted_ones: {
    id: 'canceled_to_zero_or_counted_ones',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'lentes-brillo',
    competencyId: 'powers.quotient_and_product_laws',
    shortLabel: 'Sumó o anuló parejas simplificadas en cociente en lugar de multiplicar por 1',
  },
  distributed_power_over_sum: {
    id: 'distributed_power_over_sum',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'enojada',
    competencyId: 'powers.binomial_power_non_distributivity',
    shortLabel: 'Distribuyó potencia o raíz sobre una suma omitiendo los términos cruzados',
  },
  neg_base_precedence: {
    id: 'neg_base_precedence',
    category: ERROR_CATEGORIES.SYNTAX,
    pose: 'sospecha',
    competencyId: 'powers.precedence_and_paradox_auditing',
    shortLabel: 'Confundió precedencia entre −aⁿ y (−a)ⁿ por falta de paréntesis',
  },
  forgot_abs_in_even_root: {
    id: 'forgot_abs_in_even_root',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'lentes-brillo',
    competencyId: 'powers.real_domain_restrictions_and_abs_root',
    shortLabel: 'Omitió las barras de valor absoluto al extraer √(x²) = |x|',
  },
  illegal_real_root_distribution: {
    id: 'illegal_real_root_distribution',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'panico',
    competencyId: 'powers.real_domain_restrictions_and_abs_root',
    shortLabel: 'Aplicó propiedad distributiva de raíz par pasando por radicandos negativos fuera de ℝ',
  },
  multiplied_bases_in_same_base_prod: {
    id: 'multiplied_bases_in_same_base_prod',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'colapso',
    competencyId: 'powers.quotient_and_product_laws',
    shortLabel: 'Multiplicó las bases iguales en aᵐ · aⁿ en vez de conservar la base y sumar exponentes',
  },
  unsimplified_radical: {
    id: 'unsimplified_radical',
    category: ERROR_CATEGORIES.EQUIVALENT_FORM,
    pose: 'evaluando',
    competencyId: 'powers.radical_simplification_and_rationalization',
    shortLabel: 'Expresión equivalente que aún conserva factores extraíbles dentro del radical',
  },
});

export const POW_COMPETENCY_ALIASES = Object.freeze({});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = POW_COMPETENCY_ALIASES[id] || id;
  return POW_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  return POW_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return POW_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}
