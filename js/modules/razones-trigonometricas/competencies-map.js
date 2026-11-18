/**
 * @file js/modules/razones-trigonometricas/competencies-map.js
 * Mapa Estático de Competencias (exactamente los 4 IDs trig_ratios.* de CURRICULUM_AUDIT.md §5 filas 81–84)
 * y Taxonomía de Diagnósticos Cognitivos (10 IDs) para Unidad 10 · Razones Trigonométricas.
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

export const TRIG_RATIOS_COMPETENCIES = Object.freeze([
  {
    id: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
    moduleId: 'razones-trigonometricas',
    sectionId: 'sec-1',
    chapter: 1,
    order: 1,
    title: 'Triángulo rectángulo, Pitágoras, complementarios y SOHCAHTOA',
    description:
      'Resuelve triángulos rectángulos mediante Pitágoras, ángulos agudos complementarios en sistema sexagesimal y razones trigonométricas sen, cos y tg (SOHCAHTOA), comprendiendo la invariancia por semejanza y las cofunciones complementarias.',
    prerequisiteIds: [],
    diagnosticIds: [
      'swapped_opposite_adjacent',
      'calculator_rad_mode_for_degrees',
      'used_sine_instead_of_cosine',
    ],
    exerciseFamilies: ['sohcahtoa_missing_side', 'inverse_trig_angle_dms', 'complementary_ratios'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'trig_ratios.elevation_depression_and_indirect_measurement',
    moduleId: 'razones-trigonometricas',
    sectionId: 'sec-3',
    chapter: 2,
    order: 2,
    title: 'Ángulos de elevación, depresión, doble observación y puente oblicuángulo',
    description:
      'Modela mediciones indirectas con ángulos de elevación y depresión medidos desde la horizontal, sistemas de doble observación y triángulos oblicuángulos resueltos por alturas auxiliares o Teorema del Coseno/Seno.',
    prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
    diagnosticIds: [
      'depression_measured_from_vertical',
      'added_instead_of_subtracted_cotangents',
      'forgot_unit_conversion_or_pythagoras_bridge',
    ],
    exerciseFamilies: ['elevation_depression_single', 'double_observation_height', 'oblique_bridge_cosine_law'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'trig_ratios.polygons_chords_and_solids_geometry',
    moduleId: 'razones-trigonometricas',
    sectionId: 'sec-5',
    chapter: 3,
    order: 3,
    title: 'Polígonos regulares, cuerdas y cuerpos geométricos',
    description:
      'Descompone polígonos regulares de n lados (usando el semiángulo central 180°/n, apotema, radio y lado), cuerdas de circunferencia, rombos, trapecios y diagonales/volúmenes de prismas y pirámides en triángulos rectángulos.',
    prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
    diagnosticIds: ['forgot_half_central_angle_polygon', 'confused_apothem_with_radius'],
    exerciseFamilies: ['regular_polygon_apothem_area', 'chord_and_3d_solid_diagonal'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
  {
    id: 'trig_ratios.angle_systems_and_arc_length',
    moduleId: 'razones-trigonometricas',
    sectionId: 'sec-4',
    chapter: 2,
    order: 4,
    title: 'Sistemas sexagesimal y circular, radianes y longitud de arco (puente a U11)',
    description:
      'Convierte exactamente y de forma aproximada entre grados sexagesimales (DMS) y radianes usando π rad ↔ 180°, y calcula longitudes de arco, radios o ángulos centrales mediante s = r · θ con θ en radianes.',
    prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
    diagnosticIds: ['inverted_pi_180_factor', 'plugged_degrees_directly_into_s_r_theta'],
    exerciseFamilies: ['sexagesimal_circular_conversion', 'arc_length_and_radius'],
    evidenceMechanisms: ['check_verification', 'retos_generator', 'diagnostic_detector'],
  },
]);

export const TRIG_RATIOS_DIAGNOSTIC_TAXONOMY = Object.freeze({
  swapped_opposite_adjacent: {
    id: 'swapped_opposite_adjacent',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'sospecha',
    competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
    shortLabel: 'Intercambio entre cateto opuesto y cateto adyacente',
  },
  used_sine_instead_of_cosine: {
    id: 'used_sine_instead_of_cosine',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'pensativa',
    competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
    shortLabel: 'Uso de seno en lugar de coseno (o viceversa)',
  },
  calculator_rad_mode_for_degrees: {
    id: 'calculator_rad_mode_for_degrees',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'lentes-brillo',
    competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
    shortLabel: 'Calculadora en modo RAD para ángulo sexagesimal',
  },
  depression_measured_from_vertical: {
    id: 'depression_measured_from_vertical',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'unamused',
    competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
    shortLabel: 'Ángulo de depresión medido desde la vertical (90° − α)',
  },
  added_instead_of_subtracted_cotangents: {
    id: 'added_instead_of_subtracted_cotangents',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'colapso',
    competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
    shortLabel: 'Suma en lugar de resta de distancias en doble observación',
  },
  forgot_unit_conversion_or_pythagoras_bridge: {
    id: 'forgot_unit_conversion_or_pythagoras_bridge',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'evaluando',
    competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
    shortLabel: 'Mezcla de unidades (km vs m) o Pitágoras en triángulo oblicuo',
  },
  forgot_half_central_angle_polygon: {
    id: 'forgot_half_central_angle_polygon',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'lentes-brillo',
    competencyId: 'trig_ratios.polygons_chords_and_solids_geometry',
    shortLabel: 'Ángulo central completo 360°/n en vez de semiángulo 180°/n',
  },
  confused_apothem_with_radius: {
    id: 'confused_apothem_with_radius',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'sospecha',
    competencyId: 'trig_ratios.polygons_chords_and_solids_geometry',
    shortLabel: 'Confusión entre apotema, radio circunscripto o diagonal espacial',
  },
  inverted_pi_180_factor: {
    id: 'inverted_pi_180_factor',
    category: ERROR_CATEGORIES.PROCEDURAL,
    pose: 'colapso',
    competencyId: 'trig_ratios.angle_systems_and_arc_length',
    shortLabel: 'Factor π/180 invertido al convertir grados y radianes',
  },
  plugged_degrees_directly_into_s_r_theta: {
    id: 'plugged_degrees_directly_into_s_r_theta',
    category: ERROR_CATEGORIES.CONCEPTUAL,
    pose: 'enojada',
    competencyId: 'trig_ratios.angle_systems_and_arc_length',
    shortLabel: 'Grados reemplazados directamente en s = r · θ sin pasar a radianes',
  },
});

export const TRIG_RATIOS_COMPETENCY_ALIASES = Object.freeze({
  'trigr.sohcahtoa': 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
  'trigr.elevacion': 'trig_ratios.elevation_depression_and_indirect_measurement',
  'trigr.poligonos': 'trig_ratios.polygons_chords_and_solids_geometry',
  'trigr.arcos': 'trig_ratios.angle_systems_and_arc_length',
});

export function getCompetencyById(id) {
  if (!id) return null;
  const canonicalId = TRIG_RATIOS_COMPETENCY_ALIASES[id] || id;
  return TRIG_RATIOS_COMPETENCIES.find((c) => c.id === canonicalId) || null;
}

export function getCompetenciesForSection(sectionId) {
  return TRIG_RATIOS_COMPETENCIES.filter((c) => c.sectionId === sectionId);
}

export function getDiagnosticTaxonomy(diagnosticId) {
  return TRIG_RATIOS_DIAGNOSTIC_TAXONOMY[diagnosticId] || null;
}

// Aliases estándar
export const RAZONES_COMPETENCIES = TRIG_RATIOS_COMPETENCIES;
export const ERROR_TAXONOMY = TRIG_RATIOS_DIAGNOSTIC_TAXONOMY;
export const DIAGNOSTIC_TO_TAXONOMY = TRIG_RATIOS_DIAGNOSTIC_TAXONOMY;
