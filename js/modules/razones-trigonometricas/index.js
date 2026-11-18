/**
 * @file js/modules/razones-trigonometricas/index.js
 * Orquestador principal de Unidad 10 · Razones Trigonométricas (`razones-trigonometricas.html`).
 * 6 secciones (sec-1..sec-6), 5 widgets SVG accesibles con POE en 2 etapas,
 * 18 chequeos de 8-tupla (54 pistas progresivas sin fuga de respuesta),
 * entrenador determinista Mulberry32 (8 familias + 5 trampas) y dashboard de competencias.
 */

import { h, qsa, chalkIcon } from '../../core/dom.js';
import { renderNav } from '../../core/nav.js';
import { initGlossary } from '../../core/glossary.js';
import { degToRad } from './logic.js';
import {
  annotatedTrigRatioFormula,
  createCheckBlock,
  bindTutorButtons,
  mountProgress,
  mountCompetencyDashboard,
  getCompetencyReport,
  PROGRESS_KEY,
  getProgress,
  saveProgress,
  markSectionCompleted,
} from './components.js';
import {
  TRIG_RATIOS_COMPETENCIES,
  RAZONES_COMPETENCIES,
  ERROR_TAXONOMY,
  DIAGNOSTIC_TO_TAXONOMY,
} from './competencies-map.js';
import {
  VN_SCRIPTS,
  SCRIPTS,
  DIAGNOSE_REACTIONS,
  STREAK_REACTIONS,
} from './vn-scripts.js';
import {
  mountTrigRatiosRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateTrigRatiosChallenge,
  generateTrigRatiosChallenges,
  selectAdaptiveTrigRatiosFamily,
  TRAPS,
  mulberry32,
} from './retos.js';

export const LESSON_SECTIONS = [
  {
    id: 'sec-1',
    chapter: 'Capítulo 1 · Triángulo Rectángulo y SOHCAHTOA',
    title: 'Triángulo rectángulo, Pitágoras, semejanza y ángulos complementarios',
    short: '1 · Pitágoras y Semejanza',
  },
  {
    id: 'sec-2',
    chapter: 'Capítulo 1 · Triángulo Rectángulo y SOHCAHTOA',
    title: 'Razones SOHCAHTOA y cofunciones complementarias',
    short: '2 · SOHCAHTOA',
  },
  {
    id: 'sec-3',
    chapter: 'Capítulo 2 · Mediciones Indirectas y Puente Angular',
    title: 'Ángulos de elevación, depresión y doble observación',
    short: '3 · Elevación y Depresión',
  },
  {
    id: 'sec-4',
    chapter: 'Capítulo 2 · Mediciones Indirectas y Puente Angular',
    title: 'Sistemas sexagesimal y circular, radianes y longitud de arco (puente U11)',
    short: '4 · Grados, Radianes y Arco',
  },
  {
    id: 'sec-5',
    chapter: 'Capítulo 3 · Geometría Plana, Espacial y Oblicuángulos',
    title: 'Polígonos regulares, cuerdas, rombos, trapecios y cuerpos 3D',
    short: '5 · Polígonos y Cuerpos 3D',
  },
  {
    id: 'sec-6',
    chapter: 'Capítulo 3 · Geometría Plana, Espacial y Oblicuángulos',
    title: 'Triángulos oblicuángulos: alturas auxiliares y puente del Coseno/Seno',
    short: '6 · Puente Oblicuángulo',
  },
];

export const CHECKS_DATA = {
  'sec-1': [
    {
      id: 'trigr-sec1-q1',
      competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
      prerequisiteIds: [],
      family: 'sohcahtoa_missing_side',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['used_sine_instead_of_cosine', 'calculator_rad_mode_for_degrees'],
      kind: 'number',
      tol: 0.08,
      prompt:
        'En un triángulo rectángulo en A, la hipotenusa BC mide 15 cm y el ángulo agudo B mide 46°. Calculá la longitud del cateto opuesto AC (en cm, con 2 decimales):',
      expected: 10.79,
      placeholder: 'Ej: 99,15',
      diagContext: {
        fn: 'side_from_sin',
        hyp: 15,
        angleDeg: 46,
        sineVsCosineValue: 15 * Math.cos(degToRad(46)),
        swappedRatioValue: 15 * Math.cos(degToRad(46)),
      },
      hints: [
        'Ubicá el ángulo B = 46°: el lado AC está enfrente de B (cateto opuesto) y BC = 15 cm es la hipotenusa.',
        'La razón que relaciona opuesto e hipotenusa es sen(46°) = AC / 15.',
        'Multiplicá la hipotenusa por el seno del ángulo en modo DEG y redondeá el resultado a dos cifras decimales.',
      ],
      solution: 'AC = 15 · sen(46°) ≈ 10,79 cm (verificando que es menor que la hipotenusa 15 cm).',
    },
    {
      id: 'trigr-sec1-q2',
      competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
      prerequisiteIds: [],
      family: 'inverse_trig_angle_dms',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['swapped_opposite_adjacent', 'calculator_rad_mode_for_degrees'],
      kind: 'angle',
      defaultSystem: 'deg',
      tolDeg: 0.08,
      prompt:
        'En un triángulo rectángulo en A, el cateto opuesto al ángulo B mide el triple que el cateto adyacente a B (razón 3 : 1). Hallá la medida del ángulo agudo B en sistema sexagesimal:',
      expected: '71.57°',
      placeholder: 'Ej: 55° 12\' 34"',
      diagContext: {
        complementaryDeg: 18.4349,
        swappedRatioValue: 18.4349,
      },
      hints: [
        'Llamá k al cateto adyacente y 3k al cateto opuesto: la razón tg(B) = (3k) / k cancela k.',
        'Te queda tg(B) = 3, donde B es el ángulo agudo mayor del triángulo.',
        'Aplicá la función inversa arctg(3) con la calculadora en modo DEG y convertí los decimales a minutos y segundos.',
      ],
      solution: 'tg(B) = 3 ⇒ B = arctg(3) ≈ 71° 33\' 54" (y su complemento C ≈ 18° 26\' 6").',
    },
    {
      id: 'trigr-sec1-q3',
      competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
      prerequisiteIds: [],
      family: 'complementary_ratios',
      representation: 'verbal',
      difficulty: 2,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['swapped_opposite_adjacent'],
      kind: 'choice',
      prompt:
        'Si solo sabés que los dos catetos de un triángulo rectángulo están en razón 3 : 1, ¿por qué podés calcular sus ángulos agudos pero NO la longitud exacta de su hipotenusa?',
      options: [
        {
          label: 'Porque existen infinitos triángulos rectángulos semejantes con la misma razón 3 : 1 y los mismos ángulos, pero distintas escalas.',
          correct: true,
        },
        {
          label: 'Porque el Teorema de Pitágoras no funciona cuando los catetos son múltiplos de 3.',
          correct: false,
          diagnosticId: 'swapped_opposite_adjacent',
        },
        {
          label: 'Porque la hipotenusa siempre vale 4 cuando los catetos están en razón 3 : 1.',
          correct: false,
          diagnosticId: 'swapped_opposite_adjacent',
        },
      ],
      hints: [
        'Pensá qué pasa si multiplicás ambos catetos (1 y 3) por 2, por 5 o por 10.',
        'El cociente (3k)/k = 3 no depende de k, pero la hipotenusa vale k·√10.',
        'Elegí la opción que explica la diferencia entre la invariancia angular por semejanza y la falta de una longitud de referencia.',
      ],
      solution:
        'Por semejanza, todas las escalas k·(1; 3; √10) conservan exactamente los mismos ángulos, pero la hipotenusa k√10 queda indeterminada hasta fijar k.',
    },
  ],

  'sec-2': [
    {
      id: 'trigr-sec2-q1',
      competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
      prerequisiteIds: [],
      family: 'complementary_ratios',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['used_sine_instead_of_cosine', 'swapped_opposite_adjacent'],
      kind: 'number',
      tol: 0.01,
      prompt:
        'En un triángulo rectángulo en A, el cateto AB mide 5 cm y el cateto AC mide 12 cm. Calculá cos(B) (= sen(C)) con 4 decimales o como fracción:',
      expected: 0.3846,
      placeholder: 'Ej: 0,9876',
      diagContext: {
        sineVsCosineValue: 12 / 13,
        swappedRatioValue: 12 / 13,
      },
      hints: [
        'Hallá primero la hipotenusa BC aplicando Pitágoras: BC = √(5² + 12²).',
        'Respecto del vértice B, el cateto adyacente es AB = 5 cm y el opuesto es AC = 12 cm.',
        'Calculá el cociente entre el cateto adyacente a B y la hipotenusa exacta hallada.',
      ],
      solution: 'BC = √(25 + 144) = 13 cm; luego cos(B) = sen(C) = 5/13 ≈ 0,3846.',
    },
    {
      id: 'trigr-sec2-q2',
      competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
      prerequisiteIds: [],
      family: 'complementary_ratios',
      representation: 'manipulative',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['swapped_opposite_adjacent'],
      kind: 'choice',
      prompt:
        'En cualquier triángulo rectángulo ABC (recto en A), ¿por qué se cumple siempre la identidad de cofunciones sen(B) = cos(C)?',
      options: [
        {
          label: 'Porque el cateto AC que queda enfrente de B (opuesto a B) es el mismo lado que toca a C (adyacente a C), con igual hipotenusa BC.',
          correct: true,
        },
        {
          label: 'Porque los dos ángulos agudos B y C miden siempre 45°.',
          correct: false,
          diagnosticId: 'swapped_opposite_adjacent',
        },
        {
          label: 'Porque el seno y el coseno de un mismo ángulo son siempre iguales.',
          correct: false,
          diagnosticId: 'used_sine_instead_of_cosine',
        },
      ],
      hints: [
        'Cambiá tu punto de vista en el laboratorio SOHCAHTOA entre el vértice B y el vértice C.',
        'Fijate qué lado es AC para el ángulo B y qué rol pasa a cumplir AC para el ángulo C.',
        'Elegí la opción que relaciona el intercambio de opuesto y adyacente con el denominador común BC.',
      ],
      solution:
        'Al pasar del vértice B al complementario C = 90° − B, opuesto y adyacente intercambian roles: sen(B) = AC/BC = cos(C).',
    },
    {
      id: 'trigr-sec2-q3',
      competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
      prerequisiteIds: [],
      family: 'sohcahtoa_missing_side',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['swapped_opposite_adjacent'],
      kind: 'number',
      tol: 0.05,
      prompt:
        'Un triángulo rectángulo en A tiene catetos AB = 6 cm y AC = 8 cm. Calculá la longitud de la altura trazada desde A perpendicularmente sobre la hipotenusa BC (en cm):',
      expected: 4.8,
      placeholder: 'Ej: 9,75',
      diagContext: {},
      hints: [
        'Por Pitágoras, la hipotenusa BC de catetos 6 y 8 mide exactamente 10 cm.',
        'Podés usar el doble cálculo de área: (AB · AC)/2 = (BC · h)/2, o bien h = AB · sen(B) con sen(B) = 8/10.',
        'Despejá h multiplicando los catetos y dividiendo por la hipotenusa.',
      ],
      solution: 'BC = 10 cm; igualando áreas 6·8 = 10·h (o h = 6 · (8/10)) obtenemos h = 4,8 cm.',
    },
  ],

  'sec-3': [
    {
      id: 'trigr-sec3-q1',
      competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
      prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
      family: 'elevation_depression_single',
      representation: 'verbal',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['depression_measured_from_vertical', 'calculator_rad_mode_for_degrees'],
      kind: 'number',
      tol: 0.1,
      prompt:
        'Desde una terraza a 24 m de altura se observa un auto detenido con un ángulo de depresión de 32°. ¿A qué distancia horizontal de la base del edificio se encuentra el auto (en metros, 2 decimales)?',
      expected: 38.41,
      placeholder: 'Ej: 91,47',
      diagContext: {
        target: 'elevation_depression',
        height: 24,
        angleDeg: 32,
      },
      hints: [
        'El ángulo de depresión de 32° se mide desde la horizontal superior; por alternos internos, el ángulo de elevación desde el auto también vale 32°.',
        'En el triángulo rectángulo formado, el cateto opuesto mide 24 m y buscás la base horizontal d.',
        'Despejá d desde tg(32°) = 24 / d cuidando que la calculadora esté en modo DEG.',
      ],
      solution: 'tg(32°) = 24 / d ⇒ d = 24 / tg(32°) ≈ 38,41 m.',
    },
    {
      id: 'trigr-sec3-q2',
      competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
      prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
      family: 'double_observation_height',
      representation: 'verbal',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['added_instead_of_subtracted_cotangents', 'depression_measured_from_vertical'],
      kind: 'number',
      tol: 0.15,
      prompt:
        'Desde la orilla de un río se mide un ángulo de elevación de 50° hacia la copa de un árbol en la orilla opuesta. Al retroceder 20 m en línea recta del mismo lado, el ángulo baja a 30°. Calculá la altura del árbol (en m, 2 decimales):',
      expected: 22.4,
      placeholder: 'Ej: 93,14',
      diagContext: {
        target: 'double_observation',
        wrongAddSubValue: 20 / (1 / Math.tan(degToRad(30)) + 1 / Math.tan(degToRad(50))),
      },
      hints: [
        'Llamá h a la altura del árbol y d₁ al ancho del río: d₁ = h·cotg(50°) y d₂ = h·cotg(30°).',
        'Como retrocediste 20 m sobre el mismo lado, se cumple la diferencia d₂ − d₁ = 20 m.',
        'Sacá factor común h en h·(cotg 30° − cotg 50°) = 20 y despejá h en metros.',
      ],
      solution: 'h = 20 / (cotg 30° − cotg 50°) ≈ 20 / (1,7321 − 0,8391) ≈ 22,40 m.',
    },
    {
      id: 'trigr-sec3-q3',
      competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
      prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
      family: 'elevation_depression_single',
      representation: 'graphical',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['depression_measured_from_vertical'],
      kind: 'choice',
      prompt:
        'Un vigía en lo alto de un acantilado ve un barco con ángulo de depresión de 28°. ¿Por qué el ángulo de elevación desde el barco hacia el vigía también mide 28°?',
      options: [
        {
          label: 'Porque la línea horizontal de vista del vigía y la superficie horizontal del mar son paralelas, formando ángulos alternos internos iguales.',
          correct: true,
        },
        {
          label: 'Porque en todo triángulo rectángulo los dos ángulos agudos son iguales.',
          correct: false,
          diagnosticId: 'depression_measured_from_vertical',
        },
        {
          label: 'No valen lo mismo: desde el barco mide 62° (= 90° − 28°).',
          correct: false,
          diagnosticId: 'depression_measured_from_vertical',
        },
      ],
      hints: [
        'Trazá la horizontal que pasa por los ojos del vigía arriba y la horizontal del mar abajo.',
        'La línea visual actúa como recta transversal cortando esas dos horizontales paralelas.',
        'Identificá la relación geométrica en Z entre los ángulos medidos respecto de ambas horizontales.',
      ],
      solution:
        'Ambas horizontales son paralelas cortadas por la visual: los ángulos de depresión arriba y elevación abajo son alternos internos congruentes (28°).',
    },
  ],

  'sec-4': [
    {
      id: 'trigr-sec4-q1',
      competencyId: 'trig_ratios.angle_systems_and_arc_length',
      prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
      family: 'sexagesimal_circular_conversion',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['inverted_pi_180_factor'],
      kind: 'angle',
      requireExactPi: true,
      defaultSystem: 'rad',
      prompt:
        'Convertí el ángulo sexagesimal 120° 30\' al sistema circular expresándolo como fracción irreducible exacta de π (ej: 7π/18):',
      expected: '241π/360',
      placeholder: 'Ej: 97π/113',
      diagContext: {
        target: 'deg_to_rad',
        deg: 120.5,
      },
      hints: [
        'Expresá primero 30 minutos como medio grado: 120° 30\' = 120,5° = 241/2 grados.',
        'Multiplicá por el factor unitario π / 180° para cancelar la unidad de grados.',
        'Multiplicá los denominadores (2 · 180) verificando que la fracción con π sea irreducible.',
      ],
      solution: '120° 30\' = (241/2)° · (π / 180°) = 241π/360 rad (≈ 2,103 rad).',
    },
    {
      id: 'trigr-sec4-q2',
      competencyId: 'trig_ratios.angle_systems_and_arc_length',
      prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
      family: 'sexagesimal_circular_conversion',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['inverted_pi_180_factor'],
      kind: 'angle',
      defaultSystem: 'deg',
      tolDeg: 0.1,
      prompt:
        'Expresá el ángulo de 3 radianes en el sistema sexagesimal (grados, minutos y segundos, o grados decimales con 2 cifras):',
      expected: '171.89°',
      placeholder: 'Ej: 88° 12\' 34"',
      diagContext: {
        target: 'rad_to_deg',
        rad: 3,
      },
      hints: [
        'Como 3 no trae π explícito, usá el factor 180° / π para pasar de radianes a grados.',
        'Calculá 3 · 180 / π ≈ 171,8873° (un poco menos que media vuelta porque 3 < π).',
        'Convertí la parte decimal en minutos (× 60) y segundos (× 60) para escribirlo en sistema sexagesimal.',
      ],
      solution: '3 · (180° / π) ≈ 171,8873° = 171° 53\' 14".',
    },
    {
      id: 'trigr-sec4-q3',
      competencyId: 'trig_ratios.angle_systems_and_arc_length',
      prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
      family: 'sexagesimal_circular_conversion',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['plugged_degrees_directly_into_s_r_theta', 'inverted_pi_180_factor'],
      kind: 'number',
      tol: 0.05,
      prompt:
        'En una circunferencia de radio r = 3 cm, calculá la longitud de arco s (en cm, con 2 decimales) correspondiente a un ángulo central de 30°:',
      expected: 1.57,
      placeholder: 'Ej: 99,14',
      diagContext: {
        target: 'arc_length',
        r: 3,
        angleDeg: 30,
      },
      hints: [
        '¡Atención! En s = r · θ el ángulo θ debe estar obligatoriamente en radianes, jamás en grados.',
        'Convertí 30° al sistema circular: 30° · (π / 180°) = π/6 rad.',
        'Multiplicá r = 3 cm por la medida circular obtenida y redondeá a dos decimales.',
      ],
      solution: 'θ = 30° = π/6 rad; luego s = 3 · (π/6) = π/2 ≈ 1,57 cm.',
    },
  ],

  'sec-5': [
    {
      id: 'trigr-sec5-q1',
      competencyId: 'trig_ratios.polygons_chords_and_solids_geometry',
      prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
      family: 'regular_polygon_apothem_area',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['forgot_half_central_angle_polygon', 'confused_apothem_with_radius'],
      kind: 'number',
      tol: 0.1,
      prompt:
        'Un octógono regular tiene lados de 20 m de longitud. Calculá la longitud de su apotema (en metros, con 2 decimales):',
      expected: 24.14,
      placeholder: 'Ej: 99,15',
      diagContext: {
        target: 'polygon',
        n: 8,
        side: 20,
        wrongApothemAsRadius: 10 / Math.sin(degToRad(22.5)),
      },
      hints: [
        'En un octógono (n = 8), el ángulo central completo mide 360°/8 = 45°, pero la apotema lo divide a la mitad.',
        'En el triángulo rectángulo formado por apotema, radio y medio lado, el cateto opuesto mide L/2 = 10 m y el semiángulo es 22,5°.',
        'Despejá la apotema desde tg(22,5°) = 10 / apotema (sin confundirla con el radio circunscripto).',
      ],
      solution: 'Semiángulo = 180°/8 = 22,5°; ap = 10 / tg(22,5°) ≈ 24,14 m.',
    },
    {
      id: 'trigr-sec5-q2',
      competencyId: 'trig_ratios.polygons_chords_and_solids_geometry',
      prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
      family: 'regular_polygon_apothem_area',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['forgot_half_central_angle_polygon', 'confused_apothem_with_radius'],
      kind: 'number',
      tol: 0.08,
      prompt:
        'En una circunferencia de radio r = 10 cm, ¿cuánto mide la cuerda que subtiende un ángulo central de 60° (en cm)?',
      expected: 10,
      placeholder: 'Ej: 99,15',
      diagContext: {
        target: 'polygon',
        n: 6,
        radius: 10,
      },
      hints: [
        'La perpendicular desde el centro biseca la cuerda y parte al ángulo central de 60° en dos semiángulos de 30°.',
        'En cada triángulo rectángulo, la hipotenusa es r = 10 cm y el opuesto es media cuerda: (cuerda/2) = 10 · sen(30°).',
        'Calculá media cuerda usando sen(30°) y multiplicá por 2 para obtener la longitud total.',
      ],
      solution: 'cuerda = 2 · 10 · sen(30°) = 2 · 10 · 0,5 = 10 cm (triángulo equilátero inscrito).',
    },
    {
      id: 'trigr-sec5-q3',
      competencyId: 'trig_ratios.polygons_chords_and_solids_geometry',
      prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
      family: 'regular_polygon_apothem_area',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['confused_apothem_with_radius'],
      kind: 'number',
      tol: 0.05,
      prompt:
        'Calculá la diagonal espacial interior de un prisma rectangular recto cuyas aristas miden 3 cm, 4 cm y 12 cm (en cm):',
      expected: 13,
      placeholder: 'Ej: 99,15',
      diagContext: {
        target: 'prism3d',
        baseDiagonal: 5,
        sumWithoutSqrt: 169,
      },
      hints: [
        'Primero aplicá Pitágoras en el piso del prisma (3 × 4) para hallar la diagonal de la base: d_base = √(3² + 4²) = 5 cm.',
        'Luego armá el triángulo rectángulo vertical que tiene catetos d_base = 5 cm y altura c = 12 cm.',
        'Aplicá Pitágoras por segunda vez con ambos catetos y extraé la raíz cuadrada final.',
      ],
      solution: 'd_base = 5 cm; D = √(5² + 12²) = √169 = 13 cm.',
    },
  ],

  'sec-6': [
    {
      id: 'trigr-sec6-q1',
      competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
      prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
      family: 'oblique_bridge_cosine_law',
      representation: 'verbal',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['forgot_unit_conversion_or_pythagoras_bridge'],
      kind: 'number',
      tol: 0.15,
      prompt:
        'Dos barcos parten simultáneamente de un puerto formando entre sus trayectorias un ángulo de 125°. Tras recorrer 30 km y 40 km respectivamente, ¿a qué distancia entre sí se encuentran (en km, 2 decimales)?',
      expected: 62.26,
      placeholder: 'Ej: 99,45',
      diagContext: {
        target: 'oblique_or_units',
        pythagorasMistake: 50,
      },
      hints: [
        'Como el ángulo comprendido es 125° (≠ 90°), Pitágoras directo daría 50 km y sería incorrecto.',
        'Usando el puente del Teorema del Coseno: c² = 30² + 40² − 2·30·40·cos(125°).',
        'Tené en cuenta que cos(125°) es negativo, por lo que el término corrector termina sumando; luego tomá la raíz cuadrada.',
      ],
      solution: 'c = √(900 + 1600 − 2400·cos 125°) ≈ √(2500 + 1376,58) ≈ 62,26 km.',
    },
    {
      id: 'trigr-sec6-q2',
      competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
      prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
      family: 'oblique_bridge_cosine_law',
      representation: 'verbal',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['forgot_unit_conversion_or_pythagoras_bridge'],
      kind: 'number',
      tol: 0.35,
      prompt:
        'Dos rutas rectas se cruzan formando 42°. Un ciclista recorre 0,426 km por una ruta y otro recorre 368 m por la otra desde el cruce. ¿A qué distancia en metros están entre sí (2 decimales)?',
      expected: 289.67,
      placeholder: 'Ej: 987,65',
      diagContext: {
        target: 'oblique_or_units',
        unconvertedValue: Math.sqrt(
          0.426 * 0.426 + 368 * 368 - 2 * 0.426 * 368 * Math.cos(degToRad(42))
        ),
        pythagorasMistake: Math.hypot(426, 368),
      },
      hints: [
        'Pasá primero todas las longitudes a metros: 0,426 km = 426 m (nunca mezcles km con m).',
        'Aplicá el Teorema del Coseno en el triángulo oblicuángulo: c² = 426² + 368² − 2·426·368·cos(42°).',
        'Calculá el valor bajo la raíz en modo DEG y extraé la raíz cuadrada en metros.',
      ],
      solution: 'En metros: a = 426 m, b = 368 m; c = √(426² + 368² − 2·426·368·cos 42°) ≈ 289,67 m.',
    },
    {
      id: 'trigr-sec6-q3',
      competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
      prerequisiteIds: ['trig_ratios.right_triangle_sohcahtoa_and_pythagoras'],
      family: 'oblique_bridge_cosine_law',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['forgot_unit_conversion_or_pythagoras_bridge'],
      kind: 'choice',
      prompt:
        'En el Teorema del Coseno c² = a² + b² − 2ab·cos(γ), ¿qué ocurre cuando el ángulo comprendido γ vale exactamente 90°?',
      options: [
        {
          label: 'Como cos(90°) = 0, el término corrector desaparece y recuperás exactamente el Teorema de Pitágoras c² = a² + b².',
          correct: true,
        },
        {
          label: 'Como cos(90°) = 1, queda c² = (a − b)².',
          correct: false,
          diagnosticId: 'forgot_unit_conversion_or_pythagoras_bridge',
        },
        {
          label: 'El Teorema del Coseno no se puede evaluar en 90° porque cos(90°) no existe.',
          correct: false,
          diagnosticId: 'forgot_unit_conversion_or_pythagoras_bridge',
        },
      ],
      hints: [
        'Evaluá cos(90°) usando la definición del coseno o probá γ = 90° en el deslizador del widget.',
        'Cuando cos(γ) = 0, todo el producto 2·a·b·cos(γ) se anula.',
        'Elegí la opción que identifica al Teorema de Pitágoras como el caso particular recto del Teorema del Coseno.',
      ],
      solution:
        'Pitágoras es el caso particular γ = 90° del Teorema del Coseno: como cos(90°) = 0, el término −2ab·cos(γ) se anula.',
    },
  ],
};

const WIDGETS = [
  ['constructor-triangulos', './widgets/constructor-triangulos.js', 'initConstructorTriangulos'],
  ['laboratorio-sohcahtoa', './widgets/laboratorio-sohcahtoa.js', 'initLaboratorioSohcahtoa'],
  ['elevacion-depresion', './widgets/elevacion-depresion.js', 'initElevacionDepresion'],
  ['conversor-angulos', './widgets/conversor-angulos.js', 'initConversorAngulos'],
  ['geometria-poligonos-arcos', './widgets/geometria-poligonos-arcos.js', 'initGeometriaPoligonosArcos'],
];

const activeWidgets = new Map();

function initFadingExamples() {
  qsa('.trigr-worked-fading').forEach((box) => {
    const btns = Array.from(box.querySelectorAll('[data-fade-btn]'));
    const panels = Array.from(box.querySelectorAll('[data-fade-panel]'));
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const level = btn.getAttribute('data-fade-btn');
        btns.forEach((b) => b.classList.toggle('is-active', b === btn));
        panels.forEach((p) => {
          if (p.getAttribute('data-fade-panel') === level) p.removeAttribute('hidden');
          else p.setAttribute('hidden', '');
        });
      });
    });
  });
}

function initBlackboardController() {
  const page = document.querySelector('.trigr-page');
  const sidebar = document.querySelector('.seq-sidebar');
  const content = document.querySelector('.seq-content');
  if (!page || !sidebar || !content) return;

  const isNarrow = () => (typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);
  let savedSidebar = false;
  try {
    savedSidebar = localStorage.getItem('trigr:sidebarCollapsed') === '1';
  } catch {}
  if (isNarrow() || savedSidebar) page.classList.add('is-sidebar-collapsed');

  const sidebarToggle = h(
    'button',
    {
      type: 'button',
      class: 'exp-sidebar-toggle',
      'aria-label': 'Mostrar u ocultar índice de pizarrones',
    },
    page.classList.contains('is-sidebar-collapsed') ? 'Índice' : 'Ocultar índice'
  );

  const setSidebar = (collapsed, persist = true) => {
    page.classList.toggle('is-sidebar-collapsed', collapsed);
    sidebarToggle.textContent = collapsed ? 'Índice' : 'Ocultar índice';
    if (persist) {
      try {
        localStorage.setItem('trigr:sidebarCollapsed', collapsed ? '1' : '0');
      } catch {}
    }
  };

  sidebarToggle.addEventListener('click', () =>
    setSidebar(!page.classList.contains('is-sidebar-collapsed'))
  );

  const badge = h('span', { class: 'seq-blackboard-toolbar__badge' }, 'Pizarrón 1 de 6');
  const title = h('strong', {}, LESSON_SECTIONS[0].title);
  const toggle = h(
    'button',
    { type: 'button', class: 'chip seq-blackboard-toolbar__toggle' },
    'Pizarrón por lección (activo)'
  );
  const toolbar = h(
    'div',
    { class: 'seq-blackboard-toolbar' },
    sidebarToggle,
    h('div', { class: 'seq-blackboard-toolbar__info' }, badge, title),
    toggle
  );
  content.prepend(toolbar);

  let current = LESSON_SECTIONS[0].id;
  let focused = true;

  const activate = (id, scroll = true) => {
    current = id;
    qsa('.seq-section, #sec-retos, #sec-repaso').forEach((sec) =>
      sec.classList.toggle('is-active', sec.id === id)
    );
    qsa('.seq-sidebar__link').forEach((a) =>
      a.classList.toggle('is-active', a.dataset.sec === id)
    );
    const activeSection = document.getElementById(id);
    if (activeSection) {
      activeSection.querySelectorAll('svg').forEach((svg) => svg.getBoundingClientRect());
    }
    const index = LESSON_SECTIONS.findIndex((sec) => sec.id === id);
    if (index >= 0) {
      badge.textContent = `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length}`;
      title.textContent = `${LESSON_SECTIONS[index].chapter} · ${LESSON_SECTIONS[index].title}`;
    } else if (id === 'sec-retos') {
      badge.textContent = 'Entrenamiento';
      title.textContent = 'Entrenador PRNG y las 5 Trampas Clásicas de Examen';
    } else if (id === 'sec-repaso') {
      badge.textContent = 'Síntesis';
      title.textContent = 'Hoja de Repaso Imprimible · Razones Trigonométricas';
    }

    if (scroll) {
      const target = focused ? content : activeSection;
      if (target && typeof window !== 'undefined') {
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
  };

  toggle.addEventListener('click', () => {
    focused = !focused;
    content.classList.toggle('mode-blackboard', focused);
    toggle.textContent = focused ? 'Pizarrón por lección (activo)' : 'Pizarra continua (ver todo)';
    if (focused) activate(current);
  });

  LESSON_SECTIONS.forEach((item, index) => {
    const section = document.getElementById(item.id);
    if (!section) return;
    const previous = LESSON_SECTIONS[index - 1];
    const next = LESSON_SECTIONS[index + 1];
    const tray = h(
      'nav',
      { class: 'seq-chalk-tray', 'aria-label': 'Navegación entre pizarrones' },
      previous
        ? h(
            'button',
            { type: 'button', class: 'chip seq-chalk-tray__btn', on: { click: () => activate(previous.id) } },
            `← ${previous.short}`
          )
        : h('span', { class: 'muted small' }, 'Primer pizarrón'),
      h('span', { class: 'seq-chalk-tray__info' }, `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length} · ${item.chapter}`),
      next
        ? h(
            'button',
            { type: 'button', class: 'btn seq-chalk-tray__btn', on: { click: () => activate(next.id) } },
            `${next.short} →`
          )
        : h(
            'button',
            { type: 'button', class: 'btn seq-chalk-tray__btn', on: { click: () => activate('sec-retos') } },
            'Ir al Entrenador y Trampas →'
          )
    );
    section.append(tray);
  });

  qsa('.seq-sidebar__link[data-sec]').forEach((link) =>
    link.addEventListener('click', (event) => {
      if (!focused) return;
      event.preventDefault();
      activate(link.dataset.sec);
      if (typeof window !== 'undefined' && window.innerWidth <= 1024) setSidebar(true, false);
      if (typeof history !== 'undefined') history.replaceState(null, '', `#${link.dataset.sec}`);
    })
  );

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      const isCollapsed = page?.classList.contains('is-sidebar-collapsed');
      if (window.innerWidth <= 1024 && !isCollapsed) setSidebar(true, false);
      else if (window.innerWidth > 1024 && isCollapsed && !savedSidebar) setSidebar(false, false);
    });
    const initial = location.hash.slice(1);
    const validIds = [...LESSON_SECTIONS.map((sec) => sec.id), 'sec-retos', 'sec-repaso'];
    activate(validIds.includes(initial) ? initial : LESSON_SECTIONS[0].id, false);
    content.classList.add('mode-blackboard');
  }
}

if (typeof document !== 'undefined') {
  renderNav();

  const progress = getProgress();
  const solvedSections = new Set();
  for (const sec of LESSON_SECTIONS) {
    const qs = CHECKS_DATA[sec.id] || [];
    if (progress[sec.id] === true || (qs.length > 0 && qs.every((q) => Boolean(progress[q.id])))) {
      solvedSections.add(sec.id);
    }
  }
  const progressHost = document.getElementById('seq-progress-text');

  // 1. Montar los 5 widgets SVG
  for (const [name, modPath, fnName] of WIDGETS) {
    const hosts = document.querySelectorAll(`[data-widget="${name}"]`);
    if (hosts.length) {
      import(modPath)
        .then((mod) => {
          const fn = mod[fnName] || mod.default;
          if (typeof fn === 'function') {
            hosts.forEach((host) => {
              const inst = fn(host);
              if (inst) activeWidgets.set(host, inst);
            });
          }
        })
        .catch((err) => console.warn(`[widget:${name}] error:`, err));
    }
  }

  // 2. Montar fórmulas anotadas interactivas
  qsa('[data-trigr-formula]').forEach((host) => {
    const kind = host.getAttribute('data-trigr-formula') || 'sohcahtoa';
    host.replaceChildren(annotatedTrigRatioFormula(kind));
  });

  // 3. Montar los 6 bloques de chequeo (18 preguntas)
  for (const [sectionId, questions] of Object.entries(CHECKS_DATA)) {
    const host = document.querySelector(`[data-check="${sectionId}"]`);
    if (host) {
      createCheckBlock(host, questions, {
        sectionId,
        onSectionDone: () => {
          solvedSections.add(sectionId);
          markSectionCompleted(sectionId);
          mountProgress(progressHost, solvedSections, LESSON_SECTIONS.length);
          const link = document.querySelector(`.seq-sidebar__link[data-sec="${sectionId}"] .seq-sidebar__status`);
          if (link) {
            link.replaceChildren(chalkIcon('check', 14));
            link.classList.add('is-done');
          }
        },
      });
    }
  }

  for (const sectionId of solvedSections) {
    const link = document.querySelector(`.seq-sidebar__link[data-sec="${sectionId}"] .seq-sidebar__status`);
    if (link) {
      link.replaceChildren(chalkIcon('check', 14));
      link.classList.add('is-done');
    }
  }

  // 4. Montar Entrenador PRNG + 5 Trampas
  const retosHost = document.getElementById('trigr-challenges');
  if (retosHost) mountTrigRatiosRetos(retosHost);

  // 5. Panel de Competencias en #sec-repaso
  const dashboardHost = document.getElementById('trigr-competency-dashboard');
  if (dashboardHost) {
    mountCompetencyDashboard(dashboardHost, {
      onSelectSection: (sectionId) => {
        const link = document.querySelector(`.seq-sidebar__link[data-sec="${sectionId}"]`);
        if (link) link.click();
        else location.hash = `#${sectionId}`;
      },
      onPracticeCompetency: (competencyId) => {
        const link = document.querySelector('.seq-sidebar__link[data-sec="sec-retos"]');
        if (link) link.click();
        else location.hash = '#sec-retos';
        const familySelect = document.querySelector('.trigr-family-select');
        if (familySelect) {
          const matchedType = CHALLENGE_TYPES.find((t) => t.competencyId === competencyId);
          familySelect.value = matchedType ? matchedType.id : 'adaptativo';
          familySelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      },
    });
  }

  qsa('[data-print-sheet]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (typeof window !== 'undefined' && typeof window.print === 'function') window.print();
    });
  });

  initFadingExamples();
  bindTutorButtons(document);
  mountProgress(progressHost, solvedSections, LESSON_SECTIONS.length);
  initGlossary();
  initBlackboardController();
}

export {
  VN_SCRIPTS,
  SCRIPTS,
  DIAGNOSE_REACTIONS,
  STREAK_REACTIONS,
  mountTrigRatiosRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateTrigRatiosChallenge,
  generateTrigRatiosChallenges,
  selectAdaptiveTrigRatiosFamily,
  TRAPS,
  mulberry32,
  TRIG_RATIOS_COMPETENCIES,
  RAZONES_COMPETENCIES,
  ERROR_TAXONOMY,
  DIAGNOSTIC_TO_TAXONOMY,
  PROGRESS_KEY,
  getProgress,
  saveProgress,
  markSectionCompleted,
  mountCompetencyDashboard,
  getCompetencyReport,
};
