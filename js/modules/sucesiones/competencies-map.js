/**
 * Alaska Math Lab · Sucesiones Numéricas (Unidad 02 · Ampliación didáctica)
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

export const SEQ_COMPETENCIES = Object.freeze([
  {
    id: 'sequences.pattern_recognition_and_classification',
    sectionId: 'sec-1',
    sectionsCovered: ['sec-1', 'sec-2'],
    chapter: 1,
    order: 1,
    title: 'Reconocimiento de regularidades y clasificación aritmética vs geométrica',
    description:
      'Distingue sucesiones aritméticas (diferencia aditiva d constante) de geométricas (razón multiplicativa r constante) y descarta otras reglas.',
    prerequisiteIds: [],
    diagnosticIds: [],
    exerciseFamilies: ['extend', 'classify'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'analytical_evaluator'],
  },
  {
    id: 'sequences.discrete_domain_and_notation',
    sectionId: 'sec-3',
    sectionsCovered: ['sec-3'],
    chapter: 1,
    order: 2,
    title: 'Dominio discreto en ℕ y notación posicional aₙ',
    description:
      'Comprende que una sucesión tiene dominio natural n ∈ {1, 2, 3, ...}, diferenciando la posición n del valor del término aₙ.',
    prerequisiteIds: ['sequences.pattern_recognition_and_classification'],
    diagnosticIds: [],
    exerciseFamilies: ['extend'],
    evidenceMechanisms: ['check_verification', 'interactive_widget'],
  },
  {
    id: 'sequences.recursive_formulas',
    sectionId: 'sec-4',
    sectionsCovered: ['sec-4'],
    chapter: 2,
    order: 3,
    title: 'Fórmulas recursivas con caso base a₁ y regla de paso',
    description:
      'Construye y evalúa definiciones recursivas especificando el primer término a₁ y la relación entre aₙ y aₙ₋₁.',
    prerequisiteIds: ['sequences.discrete_domain_and_notation'],
    diagnosticIds: ['wrong_anchor_a2'],
    exerciseFamilies: ['recursive'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'sequences.arithmetic_explicit_and_membership',
    sectionId: 'sec-5a',
    sectionsCovered: ['sec-5a', 'sec-5b', 'sec-6', 'sec-7'],
    chapter: 2,
    order: 4,
    title: 'Fórmula explícita aritmética a₁ + d(n − 1) y pertenencia',
    description:
      'Modela sucesiones aritméticas con n − 1 saltos desde a₁, traduce entre forma estándar y simplificada, y decide pertenencia resolviendo n ∈ ℕ.',
    prerequisiteIds: ['sequences.recursive_formulas'],
    diagnosticIds: ['off_by_one', 'sign_of_step', 'swapped_k_step', 'not_standard_but_equivalent'],
    exerciseFamilies: ['arithmetic_explicit', 'membership_solve', 'rosetta_arithmetic'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'sequences.geometric_explicit_and_models',
    sectionId: 'sec-8',
    sectionsCovered: ['sec-8', 'sec-9', 'sec-10'],
    chapter: 3,
    order: 5,
    title: 'Fórmula explícita geométrica a₁ · r^(n − 1), paréntesis y modelos',
    description:
      'Formula términos generales geométricos con exponente n − 1, protege bases negativas con paréntesis (−b)^(n−1) y modela crecimiento compuesto.',
    prerequisiteIds: ['sequences.arithmetic_explicit_and_membership'],
    diagnosticIds: ['neg_pow_precedence', 'exponent_n'],
    exerciseFamilies: ['geometric_explicit', 'compound_growth', 'alternating_parentheses'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'sequences.asymptotic_behavior_intuition',
    sectionId: 'sec-11',
    sectionsCovered: ['sec-11'],
    chapter: 4,
    order: 6,
    title: 'Comportamiento asintótico al infinito (n → ∞)',
    description:
      'Anticipa si una sucesión diverge a ±∞, oscila o converge a un valor límite según la razón r o la diferencia d.',
    prerequisiteIds: ['sequences.geometric_explicit_and_models'],
    diagnosticIds: [],
    exerciseFamilies: ['asymptotic_limit'],
    evidenceMechanisms: ['check_verification', 'interactive_widget'],
  },
]);

export const SEQ_DIAGNOSTIC_TAXONOMY = Object.freeze({
  neg_pow_precedence: {
    id: 'neg_pow_precedence',
    category: ERROR_CATEGORIES.SYNTAX,
    pose: 'sospecha',
    competencyId: 'sequences.geometric_explicit_and_models',
    shortLabel: 'Omitió paréntesis en base negativa (−b)^(n−1) dejando el menos afuera',
  },
  exponent_n: {
    id: 'exponent_n',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'pensativa',
    competencyId: 'sequences.geometric_explicit_and_models',
    shortLabel: 'Usó exponente n en lugar de n − 1 adelantando una multiplicación en n = 1',
  },
  wrong_anchor_a2: {
    id: 'wrong_anchor_a2',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'evaluando',
    competencyId: 'sequences.recursive_formulas',
    shortLabel: 'Usó el segundo término a₂ como ancla inicial en vez de a₁',
  },
  off_by_one: {
    id: 'off_by_one',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'sospecha',
    competencyId: 'sequences.arithmetic_explicit_and_membership',
    shortLabel: 'Desfase de un índice (fencepost n vs n − 1) en la fórmula explícita',
  },
  sign_of_step: {
    id: 'sign_of_step',
    category: ERROR_CATEGORIES.ARITHMETIC,
    pose: 'colapso',
    competencyId: 'sequences.arithmetic_explicit_and_membership',
    shortLabel: 'Signo invertido en la diferencia d o razón r de la sucesión',
  },
  swapped_k_step: {
    id: 'swapped_k_step',
    category: ERROR_CATEGORIES.REPRESENTATION,
    pose: 'lentes-brillo',
    competencyId: 'sequences.arithmetic_explicit_and_membership',
    shortLabel: 'Intercambió el primer término a₁ con el paso d o r',
  },
  not_standard_but_equivalent: {
    id: 'not_standard_but_equivalent',
    category: ERROR_CATEGORIES.EQUIVALENT_FORM,
    pose: 'orgullosa',
    competencyId: 'sequences.arithmetic_explicit_and_membership',
    shortLabel: 'Expresión equivalente que no está escrita en forma canónica explícita',
  },
});

export const SEQ_COMPETENCY_ALIASES = Object.freeze({});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = SEQ_COMPETENCY_ALIASES[id] || id;
  return SEQ_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  return SEQ_COMPETENCIES.filter(
    (c) => c.sectionId === sectionId || (Array.isArray(c.sectionsCovered) && c.sectionsCovered.includes(sectionId))
  );
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return SEQ_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}
