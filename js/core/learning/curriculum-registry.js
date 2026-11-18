/**
 * @file js/core/learning/curriculum-registry.js
 * Canonical 2-step global curriculum registry implementing Contract 1 & CURRICULUM_AUDIT.md §5.
 * Step 1: Register all active module maps with `deferValidation: true`.
 * Step 2: Apply declarative cross-module prerequisites (`CROSS_MODULE_PREREQUISITES`)
 *         and validate the entire global DAG (`validateGlobalGraph`).
 *
 * Pure Vanilla ES2022. Zero external dependencies. Zero DOM. Zero eval. Zero emojis.
 */

import {
  registerModuleCompetencies,
  registerCrossModulePrerequisites,
  validateGlobalGraph,
  clearRegistry,
  getAllCompetencies,
} from './competencies.js';
import { MODULE_IDS } from './events.js';

import {
  CIRCUITOS_COMPETENCIES,
  CIRCUITOS_DIAGNOSTIC_TAXONOMY,
  CIRCUITOS_COMPETENCY_ALIASES,
} from '../../modules/circuitos/competencies-map.js';
import {
  UNITS_COMPETENCIES,
  UNITS_DIAGNOSTIC_TAXONOMY,
  UNITS_COMPETENCY_ALIASES,
} from '../../modules/dimensional/competencies-map.js';
import {
  FUNCTIONS_COMPETENCIES,
  FUNCTIONS_DIAGNOSTIC_TAXONOMY,
  FUNCTIONS_COMPETENCY_ALIASES,
} from '../../modules/funciones/competencies-map.js';
import {
  POW_COMPETENCIES,
  POW_DIAGNOSTIC_TAXONOMY,
  POW_COMPETENCY_ALIASES,
} from '../../modules/potencias-raices/competencies-map.js';
import {
  ABS_COMPETENCIES,
  ABS_DIAGNOSTIC_TAXONOMY,
  ABS_COMPETENCY_ALIASES,
} from '../../modules/valor-absoluto/competencies-map.js';
import {
  SEQ_COMPETENCIES,
  SEQ_DIAGNOSTIC_TAXONOMY,
  SEQ_COMPETENCY_ALIASES,
} from '../../modules/sucesiones/competencies-map.js';
import {
  LIN_COMPETENCIES,
  LIN_DIAGNOSTIC_TAXONOMY,
  LIN_COMPETENCY_ALIASES,
} from '../../modules/lineal/competencies-map.js';
import {
  SYS_COMPETENCIES,
  SYS_DIAGNOSTIC_TAXONOMY,
  SYS_COMPETENCY_ALIASES,
} from '../../modules/sistemas/competencies-map.js';
import {
  QUAD_COMPETENCIES,
  QUAD_DIAGNOSTIC_TAXONOMY,
  QUAD_COMPETENCY_ALIASES,
} from '../../modules/cuadraticas/competencies-map.js';
import {
  POLY_COMPETENCIES,
  POLY_DIAGNOSTIC_TAXONOMY,
  POLY_COMPETENCY_ALIASES,
} from '../../modules/polinomios/competencies-map.js';
import {
  RI_COMPETENCIES,
  RI_DIAGNOSTIC_TAXONOMY,
  RI_COMPETENCY_ALIASES,
} from '../../modules/racionales-irracionales/competencies-map.js';
import {
  EXP_COMPETENCIES,
  EXP_DIAGNOSTIC_TAXONOMY,
  EXP_COMPETENCY_ALIASES,
} from '../../modules/exponenciales/competencies-map.js';
import {
  LOG_COMPETENCIES,
  LOG_DIAGNOSTIC_TAXONOMY,
  LOG_COMPETENCY_ALIASES,
} from '../../modules/logaritmicas/competencies-map.js';
import {
  TRIG_RATIOS_COMPETENCIES,
  TRIG_RATIOS_DIAGNOSTIC_TAXONOMY,
  TRIG_RATIOS_COMPETENCY_ALIASES,
} from '../../modules/razones-trigonometricas/competencies-map.js';
import {
  TRIG_FUNCTIONS_COMPETENCIES,
  TRIG_FUNCTIONS_DIAGNOSTIC_TAXONOMY,
  TRIG_FUNCTIONS_COMPETENCY_ALIASES,
} from '../../modules/funciones-trigonometricas/competencies-map.js';

export const ACTIVE_CURRICULUM_MODULES = Object.freeze([
  Object.freeze({
    moduleId: MODULE_IDS.POTENCIAS_RAICES,
    data: Object.freeze({
      competencies: POW_COMPETENCIES,
      diagnosticTaxonomy: POW_DIAGNOSTIC_TAXONOMY,
      aliases: POW_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.DESIGUALDADES,
    data: Object.freeze({
      competencies: CIRCUITOS_COMPETENCIES,
      diagnosticTaxonomy: CIRCUITOS_DIAGNOSTIC_TAXONOMY,
      aliases: CIRCUITOS_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.UNIDADES,
    data: Object.freeze({
      competencies: UNITS_COMPETENCIES,
      diagnosticTaxonomy: UNITS_DIAGNOSTIC_TAXONOMY,
      aliases: UNITS_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.FUNCIONES,
    data: Object.freeze({
      competencies: FUNCTIONS_COMPETENCIES,
      diagnosticTaxonomy: FUNCTIONS_DIAGNOSTIC_TAXONOMY,
      aliases: FUNCTIONS_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.VALOR_ABSOLUTO,
    data: Object.freeze({
      competencies: ABS_COMPETENCIES,
      diagnosticTaxonomy: ABS_DIAGNOSTIC_TAXONOMY,
      aliases: ABS_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.SUCESIONES,
    data: Object.freeze({
      competencies: SEQ_COMPETENCIES,
      diagnosticTaxonomy: SEQ_DIAGNOSTIC_TAXONOMY,
      aliases: SEQ_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.LINEAL,
    data: Object.freeze({
      competencies: LIN_COMPETENCIES,
      diagnosticTaxonomy: LIN_DIAGNOSTIC_TAXONOMY,
      aliases: LIN_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.SISTEMAS,
    data: Object.freeze({
      competencies: SYS_COMPETENCIES,
      diagnosticTaxonomy: SYS_DIAGNOSTIC_TAXONOMY,
      aliases: SYS_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.CUADRATICAS,
    data: Object.freeze({
      competencies: QUAD_COMPETENCIES,
      diagnosticTaxonomy: QUAD_DIAGNOSTIC_TAXONOMY,
      aliases: QUAD_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.POLINOMIOS,
    data: Object.freeze({
      competencies: POLY_COMPETENCIES,
      diagnosticTaxonomy: POLY_DIAGNOSTIC_TAXONOMY,
      aliases: POLY_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.RACIONALES_IRRACIONALES,
    data: Object.freeze({
      competencies: RI_COMPETENCIES,
      diagnosticTaxonomy: RI_DIAGNOSTIC_TAXONOMY,
      aliases: RI_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.EXPONENCIALES,
    data: Object.freeze({
      competencies: EXP_COMPETENCIES,
      diagnosticTaxonomy: EXP_DIAGNOSTIC_TAXONOMY,
      aliases: EXP_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.LOGARITMICAS,
    data: Object.freeze({
      competencies: LOG_COMPETENCIES,
      diagnosticTaxonomy: LOG_DIAGNOSTIC_TAXONOMY,
      aliases: LOG_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.RAZONES_TRIGONOMETRICAS,
    data: Object.freeze({
      competencies: TRIG_RATIOS_COMPETENCIES,
      diagnosticTaxonomy: TRIG_RATIOS_DIAGNOSTIC_TAXONOMY,
      aliases: TRIG_RATIOS_COMPETENCY_ALIASES,
    }),
  }),
  Object.freeze({
    moduleId: MODULE_IDS.FUNCIONES_TRIGONOMETRICAS,
    data: Object.freeze({
      competencies: TRIG_FUNCTIONS_COMPETENCIES,
      diagnosticTaxonomy: TRIG_FUNCTIONS_DIAGNOSTIC_TAXONOMY,
      aliases: TRIG_FUNCTIONS_COMPETENCY_ALIASES,
    }),
  }),
]);

/**
 * Canonical cross-module DAG prerequisites overlay (CURRICULUM_AUDIT.md §5).
 * Intra-module prerequisites stay in each module's competencies-map.js.
 */
export const CROSS_MODULE_PREREQUISITES = Object.freeze({
  'units.unitary_factor_neutral_one': ['powers.quotient_and_product_laws'],
  'units.compound_rates_and_powers': ['powers.geometric_squares_and_cubes'],
  'functions.concept_and_uniqueness': ['inequalities.intervals_and_number_line'],
  'functions.domain_image_and_sign_sets': ['inequalities.compound_and_or_sets'],
  'abs.distance_1d_and_equations': [
    'powers.real_domain_restrictions_and_abs_root',
    'inequalities.intervals_and_number_line',
  ],
  'abs.cartesian_mirror_parent': ['functions.concept_and_uniqueness'],
  'abs.full_analytical_study_and_inequalities': [
    'functions.monotonicity_extrema_and_continuity',
    'inequalities.compound_and_or_sets',
  ],
  'abs.piecewise_domain_customs': ['functions.domain_image_and_sign_sets'],
  'sequences.pattern_recognition_and_classification': [
    'functions.concept_and_uniqueness',
    'powers.additive_vs_multiplicative_worlds',
  ],
  'sequences.geometric_explicit_and_models': ['powers.precedence_and_paradox_auditing'],
  'linear.definition_slope_and_intercept': ['functions.bijectivity_and_inverse'],
  'linear.analytic_geometry_distance_midpoint_bisector': ['powers.geometric_squares_and_cubes'],
  'linear.modeling_and_piecewise': ['abs.piecewise_domain_customs'],
  'systems.linear_2x2_graphical_and_analytical': ['linear.parallel_perpendicular_and_incidence'],
  'systems.modeling_and_graph_reconstruction': ['linear.modeling_and_piecewise'],
  'quadratics.area_model_and_notable_products': [
    'powers.binomial_power_non_distributivity',
    'linear.definition_slope_and_intercept',
  ],
  'quadratics.full_analysis_exactas': [
    'functions.bijectivity_and_inverse',
    'inequalities.linear_and_factored_solving',
  ],
  'quadratics.parabola_line_tangency': ['systems.linear_2x2_graphical_and_analytical'],
  'polynomials.structure_degree_and_equality': ['quadratics.area_model_and_notable_products'],
  'polynomials.factoring_and_gauss_roots': [
    'quadratics.grouping_and_factoring_strategy',
    'quadratics.discriminant_and_vieta',
  ],
  'rational.simplification_lcm_and_operations': ['polynomials.factoring_and_gauss_roots'],
  'rational.equations_and_inequalities': ['inequalities.linear_and_factored_solving'],
  'rational.domain_holes_and_asymptotes': ['functions.monotonicity_extrema_and_continuity'],
  'irrational.domain_and_radical_equations': [
    'powers.real_domain_restrictions_and_abs_root',
    'inequalities.linear_and_factored_solving',
    'quadratics.discriminant_and_vieta',
  ],
  'irrational.graphs_analysis_and_piecewise': ['abs.piecewise_domain_customs'],
  'exponentials.tables_additive_vs_multiplicative': [
    'linear.definition_slope_and_intercept',
    'sequences.geometric_explicit_and_models',
  ],
  'exponentials.neutral_and_order_of_operations': ['powers.additive_vs_multiplicative_worlds'],
  'exponentials.rational_density_and_base_restrictions': [
    'powers.rational_exponents_and_nth_roots',
    'powers.real_domain_restrictions_and_abs_root',
  ],
  'exponentials.base_reflection_and_asymptote': ['powers.negative_exponents_and_reciprocals'],
  'exponentials.full_analytical_study': ['functions.bijectivity_and_inverse'],
  'exponentials.equations_three_methods_in_reals': ['quadratics.discriminant_and_vieta'],
  'logarithms.definition_existence_and_special_bases': [
    'exponentials.rational_density_and_base_restrictions',
    'exponentials.full_analytical_study',
  ],
  'logarithms.equations_and_systems': [
    'exponentials.equations_three_methods_in_reals',
    'systems.linear_2x2_graphical_and_analytical',
  ],
  'logarithms.function_inverse_and_analysis': ['functions.bijectivity_and_inverse'],
  'logarithms.real_world_time_and_scale_models': ['exponentials.time_models_rates_and_euler_base'],
  'trig_ratios.right_triangle_sohcahtoa_and_pythagoras': [
    'powers.geometric_squares_and_cubes',
    'linear.analytic_geometry_distance_midpoint_bisector',
  ],
  'trig_ratios.elevation_depression_and_indirect_measurement': [
    'systems.linear_2x2_graphical_and_analytical',
  ],
  'trig_ratios.angle_systems_and_arc_length': ['units.unitary_factor_neutral_one'],
  'trig_functions.congruence_classes_and_cartesian_def': [
    'trig_ratios.angle_systems_and_arc_length',
    'functions.concept_and_uniqueness',
  ],
  'trig_functions.six_functions_domains_graphs_and_bijectivity': [
    'functions.bijectivity_and_inverse',
    'rational.domain_holes_and_asymptotes',
  ],
  'trig_functions.periodic_equations_and_domain_checks': ['quadratics.discriminant_and_vieta'],
});

/**
 * Deterministic 2-step global curriculum registration.
 * Order-independent across modules.
 *
 * @param {object} [options={}]
 * @returns {{ validation: object, competencyCount: number, moduleCount: number }}
 */
export function initCurriculumRegistry({
  modules = ACTIVE_CURRICULUM_MODULES,
  crossEdges = CROSS_MODULE_PREREQUISITES,
  ignoreMissingCrossPrereqs = false,
  reset = false,
  strictEvidence = true,
} = {}) {
  if (reset) {
    clearRegistry();
  }

  // Step 1: Register all modules with deferred cross-module validation
  for (const mod of modules) {
    registerModuleCompetencies(mod.moduleId, mod.data, { deferValidation: true });
  }

  // Step 2: Apply cross-module prerequisites and validate the entire global graph
  registerCrossModulePrerequisites(crossEdges, { ignoreMissing: ignoreMissingCrossPrereqs });
  const validation = validateGlobalGraph({ strictEvidence });

  return {
    validation,
    competencyCount: getAllCompetencies().length,
    moduleCount: modules.length,
  };
}

export const registerAllCurricula = initCurriculumRegistry;
