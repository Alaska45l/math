/**
 * @file js/modules/razones-trigonometricas/retos.js
 * Entrenador Determinista por Semilla Mulberry32 (8 familias cubriendo las 4 competencias)
 * + 5 Trampas Clásicas de Examen para Unidad 10 · Razones Trigonométricas.
 */

import { h, clear, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { react as vnReact } from '../../core/vn.js';
import { selectAdaptiveExercise } from '../../core/learning/exercise-selector.js';
import {
  solveRightTriangle,
  solveElevationDepression,
  solveDoubleObservation,
  solveRegularPolygon,
  solveChord,
  solvePrism3D,
  solveObliqueCosineLaw,
  degToRad,
  degToDms,
  degToRadExact,
  arcLength,
  validateTrigRatiosAttempt,
  fmtNumberEsAR,
} from './logic.js';
import { DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import {
  MODULE_ID,
  getProgressStore,
  recordTrigRatiosAttempt,
} from './learning-adapter.js';
import { notifyCompetencyDashboardUpdate } from './components.js';
import { getCompetencyById } from './competencies-map.js';

export const SEED_STORAGE_KEY = 'razones-trigonometricas:seed';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randChoice(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export const CHALLENGE_TYPES = [
  {
    id: 'sohcahtoa_missing_side',
    label: 'SOHCAHTOA: despejar un lado en triángulo rectángulo',
    competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
  },
  {
    id: 'inverse_trig_angle_dms',
    label: 'Razones inversas: ángulo agudo en grados sexagesimales',
    competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
  },
  {
    id: 'complementary_ratios',
    label: 'Cofunciones complementarias (sen B = cos C) y Pitágoras',
    competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
  },
  {
    id: 'elevation_depression_single',
    label: 'Ángulos de elevación y depresión (altura / distancia)',
    competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
  },
  {
    id: 'double_observation_height',
    label: 'Doble observación topográfica (mismo lado vs lados opuestos)',
    competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
  },
  {
    id: 'oblique_bridge_cosine_law',
    label: 'Puente oblicuángulo: Teorema del Coseno y unidades',
    competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
  },
  {
    id: 'regular_polygon_apothem_area',
    label: 'Polígonos regulares (semiángulo 180°/n), cuerdas y prisma 3D',
    competencyId: 'trig_ratios.polygons_chords_and_solids_geometry',
  },
  {
    id: 'sexagesimal_circular_conversion',
    label: 'Conversión DMS ↔ radianes exactos y longitud de arco s = r·θ',
    competencyId: 'trig_ratios.angle_systems_and_arc_length',
  },
];

export function generateTrigRatiosChallenge(seed, forcedType = 'all', problemIndex = 0) {
  const isAll = !forcedType || forcedType === 'all' || forcedType === 'aleatorio';
  let typeObj;
  let rng;

  if (isAll) {
    const baseRng = mulberry32(seed >>> 0);
    const baseIdx = Math.floor(baseRng() * CHALLENGE_TYPES.length);
    typeObj = CHALLENGE_TYPES[(baseIdx + problemIndex) % CHALLENGE_TYPES.length];
    rng = mulberry32(((seed >>> 0) + problemIndex * 7919 + 1013) >>> 0);
  } else {
    typeObj = CHALLENGE_TYPES.find((t) => t.id === forcedType) || CHALLENGE_TYPES[0];
    rng =
      problemIndex === 0
        ? mulberry32(seed >>> 0)
        : mulberry32(((seed >>> 0) + problemIndex * 7919 + 1013) >>> 0);
  }

  const type = typeObj.id;

  // 1. SOHCAHTOA missing side
  if (type === 'sohcahtoa_missing_side') {
    const hyp = randChoice(rng, [12, 15, 18, 22, 26]);
    const angleB = randChoice(rng, [24, 32, 38, 46, 52, 64]);
    const askOpposite = rng() < 0.55;
    const tri = solveRightTriangle({ c: hyp, B: angleB });
    const ans = Number((askOpposite ? tri.b : tri.a).toFixed(2));
    const wrongSwap = Number((askOpposite ? tri.a : tri.b).toFixed(2));

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 1 · Lado por SOHCAHTOA',
      representation: 'symbolic',
      stage: 'guided_practice',
      transferDistance: 'near',
      inputKind: 'number',
      tol: 0.08,
      prompt: askOpposite
        ? `En un triángulo rectángulo en A, la hipotenusa BC mide ${hyp} cm y el ángulo agudo B mide ${angleB}°. Calculá la longitud del cateto opuesto AC (en cm, con 2 decimales):`
        : `En un triángulo rectángulo en A, la hipotenusa BC mide ${hyp} cm y el ángulo agudo B mide ${angleB}°. Calculá la longitud del cateto adyacente AB (en cm, con 2 decimales):`,
      expected: ans,
      placeholder: 'Ej: a,bc cm',
      diagContext: {
        fn: askOpposite ? 'side_from_sin' : 'side_from_cos',
        hyp,
        angleDeg: angleB,
        sineVsCosineValue: wrongSwap,
        swappedRatioValue: wrongSwap,
      },
      hints: [
        `Pista 1: Identificá qué lados intervienen respecto de B = ${angleB}°: conocemos la hipotenusa (${hyp} cm) y buscamos el cateto ${askOpposite ? 'opuesto (AC)' : 'adyacente (AB)'}.`,
        `Pista 2: La razón que vincula ${askOpposite ? 'opuesto e hipotenusa es sen(B)' : 'adyacente e hipotenusa es cos(B)'}.`,
        'Pista 3: Multiplicá la hipotenusa por la razón trigonométrica elegida con la calculadora en modo DEG y redondeá a dos decimales.',
      ],
      explanation: `${askOpposite ? 'AC = BC · sen(B)' : 'AB = BC · cos(B)'} = ${hyp} · ${askOpposite ? 'sen' : 'cos'}(${angleB}°) ≈ ${fmtNumberEsAR(ans, 2)} cm.`,
    };
  }

  // 2. Inverse trig angle in DMS / degrees
  if (type === 'inverse_trig_angle_dms') {
    const legA = randChoice(rng, [5, 7, 9, 11, 14]);
    const legB = randChoice(rng, [4, 6, 8, 12, 16].filter((v) => v !== legA));
    const tri = solveRightTriangle({ a: legA, b: legB });
    const ansDeg = Number(tri.B.toFixed(2));
    const dms = degToDms(tri.B, { precisionSec: 0 });

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 2 · Ángulo agudo con arctg',
      representation: 'symbolic',
      stage: 'retrieval',
      transferDistance: 'near',
      inputKind: 'angle',
      defaultSystem: 'deg',
      tolDeg: 0.08,
      prompt: `Un triángulo rectángulo en A tiene cateto adyacente a B igual a AB = ${legA} cm y cateto opuesto AC = ${legB} cm. Hallá la medida del ángulo agudo B (en grados o DMS, ej. gg° mm' ss"):`,
      expected: `${ansDeg}°`,
      placeholder: 'Ej: gg° mm\' ss"',
      diagContext: {
        complementaryDeg: tri.C,
        swappedRatioValue: tri.C,
      },
      hints: [
        `Pista 1: Conocemos ambos catetos respecto de B: opuesto AC = ${legB} cm y adyacente AB = ${legA} cm.`,
        `Pista 2: Planteá tg(B) = ${legB} / ${legA} y aplicá la función inversa arctan / tg⁻¹ en modo DEG.`,
        'Pista 3: Asegurate de dividir opuesto sobre adyacente (no al revés, o te dará el complemento C) y convertilo a grados, minutos y segundos.',
      ],
      explanation: `tg(B) = ${legB}/${legA} ⇒ B = arctg(${legB}/${legA}) ≈ ${dms.formatted} (${fmtNumberEsAR(ansDeg, 2)}°).`,
    };
  }

  // 3. Complementary cofunctions & Pythagorean exact legs
  if (type === 'complementary_ratios') {
    const triples = [
      { a: 3, b: 4, c: 5 },
      { a: 5, b: 12, c: 13 },
      { a: 8, b: 15, c: 17 },
      { a: 7, b: 24, c: 25 },
      { a: 6, b: 8, c: 10 },
    ];
    const t = randChoice(rng, triples);
    const scale = randChoice(rng, [1, 2]);
    const a = t.a * scale;
    const b = t.b * scale;
    const c = t.c * scale;
    const askSinC = rng() < 0.5;
    // B opposite is b, adjacent is a; C opposite is a, adjacent is b
    const ans = Number(((askSinC ? a : b) / c).toFixed(4));
    const swapped = Number(((askSinC ? b : a) / c).toFixed(4));

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 3 · Cofunciones y Pitágoras',
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'near',
      inputKind: 'number',
      tol: 0.01,
      prompt: askSinC
        ? `En el triángulo rectángulo en A, el cateto AB mide ${a} cm y el cateto AC mide ${b} cm. Calculá el valor exacto (o decimal con 4 cifras) de cos(B), sabiendo que coincide con sen(C):`
        : `En el triángulo rectángulo en A, el cateto AB mide ${a} cm y la hipotenusa BC mide ${c} cm. Calculá sen(B) = cos(C) como fracción o decimal:`,
      expected: ans,
      placeholder: 'Ej: a/b o x,yz',
      diagContext: {
        sineVsCosineValue: swapped,
        swappedRatioValue: swapped,
      },
      hints: [
        `Pista 1: Usá el Teorema de Pitágoras BC² = AB² + AC² para conocer los tres lados del triángulo.`,
        askSinC
          ? `Pista 2: La hipotenusa es √(${a}² + ${b}²) = ${c} cm. El cateto adyacente a B es AB = ${a} cm.`
          : `Pista 2: Por Pitágoras, el cateto opuesto a B es AC = √(${c}² − ${a}²) = ${b} cm.`,
        'Pista 3: Dividí el cateto correspondiente por la hipotenusa para obtener la razón en el intervalo abierto (0; 1).',
      ],
      explanation: askSinC
        ? `BC = ${c} cm; cos(B) = sen(C) = AB/BC = ${a}/${c} ≈ ${fmtNumberEsAR(ans, 4)}.`
        : `AC = ${b} cm; sen(B) = cos(C) = AC/BC = ${b}/${c} ≈ ${fmtNumberEsAR(ans, 4)}.`,
    };
  }

  // 4. Elevation / Depression single triangle
  if (type === 'elevation_depression_single') {
    const height = randChoice(rng, [18, 25, 34, 42, 55]);
    const angleDeg = randChoice(rng, [22, 28, 35, 41, 53]);
    const askDist = rng() < 0.6;
    const sol = solveElevationDepression({ height, angleDeg });
    const ans = Number((askDist ? sol.distance : sol.hypotenuse).toFixed(2));

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 4 · Elevación y Depresión',
      representation: 'verbal',
      stage: 'guided_practice',
      transferDistance: 'near',
      inputKind: 'number',
      tol: 0.12,
      prompt: askDist
        ? `Desde el techo de un edificio de ${height} m de altura se observa un punto en el suelo con un ángulo de depresión de ${angleDeg}°. ¿A qué distancia horizontal de la base está ese punto (en metros, 2 decimales)?`
        : `Desde la cima de un faro de ${height} m sobre el nivel del mar se divisa una boya con un ángulo de depresión de ${angleDeg}°. ¿Cuál es la distancia visual directa en línea recta hasta la boya (en metros)?`,
      expected: ans,
      placeholder: 'Ej: x,yz m',
      diagContext: {
        target: 'elevation_depression',
        height,
        angleDeg,
        fn: askDist ? 'side_from_tan' : 'hyp_from_sin',
        opp: height,
      },
      hints: [
        `Pista 1: El ángulo de depresión (${angleDeg}°) se mide desde la horizontal de la cima y, por alternos internos, coincide con el ángulo de elevación desde el suelo.`,
        askDist
          ? `Pista 2: En el triángulo rectángulo tenés opuesto = ${height} m y buscás el adyacente d, vinculados por tg(${angleDeg}°) = ${height} / d.`
          : `Pista 2: Tenés el cateto opuesto = ${height} m y buscás la hipotenusa visual v, vinculados por sen(${angleDeg}°) = ${height} / v.`,
        'Pista 3: Despejá la incógnita dividiendo la altura por la razón trigonométrica (sin confundir el ángulo con su complemento contra la pared).',
      ],
      explanation: askDist
        ? `Por alternos internos, tg(${angleDeg}°) = ${height}/d ⇒ d = ${height}/tg(${angleDeg}°) ≈ ${fmtNumberEsAR(ans, 2)} m.`
        : `sen(${angleDeg}°) = ${height}/v ⇒ v = ${height}/sen(${angleDeg}°) ≈ ${fmtNumberEsAR(ans, 2)} m.`,
    };
  }

  // 5. Double observation height / total distance
  if (type === 'double_observation_height') {
    const sameSide = rng() < 0.6;
    if (sameSide) {
      const deltaD = randChoice(rng, [18, 20, 24, 30, 35]);
      const alpha = randChoice(rng, [25, 28, 31]);
      const beta = randChoice(rng, [48, 52, 57]);
      const sys = solveDoubleObservation({ distance: deltaD, alphaDeg: alpha, betaDeg: beta, mode: 'same_side_horizontal' });
      const ans = Number(sys.height.toFixed(2));
      const wrongAdded = deltaD / (1 / Math.tan(degToRad(alpha)) + 1 / Math.tan(degToRad(beta)));

      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 5 · Doble Observación (Mismo Lado)',
        representation: 'verbal',
        stage: 'transfer',
        transferDistance: 'far',
        inputKind: 'number',
        tol: 0.15,
        prompt: `Desde la orilla de un río se ve la copa de un árbol con elevación de ${beta}°. Al retroceder ${deltaD} m en línea recta sobre el mismo lado, el ángulo de elevación pasa a ser de ${alpha}°. Calculá la altura del árbol (en metros, 2 decimales):`,
        expected: ans,
        placeholder: 'Ej: x,yz m',
        diagContext: {
          target: 'double_observation',
          wrongAddSubValue: wrongAdded,
        },
        hints: [
          'Pista 1: Armá dos triángulos rectángulos que comparten la altura h: d₁ = h · cotg(β) y d₂ = h · cotg(α).',
          `Pista 2: Como ambos puntos están del mismo lado del árbol, el retroceso es la resta d₂ − d₁ = ${deltaD} m.`,
          'Pista 3: Sacá factor común h en h·(cotg α − cotg β) = Δd y despejá h dividiendo el retroceso por la diferencia de cotangentes.',
        ],
        explanation: `h = ${deltaD} / (cotg(${alpha}°) − cotg(${beta}°)) ≈ ${fmtNumberEsAR(ans, 2)} m.`,
      };
    }

    const hMount = randChoice(rng, [450, 600, 750, 820]);
    const alpha = randChoice(rng, [22, 26, 29]);
    const beta = randChoice(rng, [34, 38, 43]);
    const sys = solveDoubleObservation({ height: hMount, alphaDeg: alpha, betaDeg: beta, mode: 'between_points' });
    const ans = Number(sys.totalDistance.toFixed(2));
    const wrongSub = Math.abs(sys.d1 - sys.d2);

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 5 · Doble Observación (Lados Opuestos)',
      representation: 'verbal',
      stage: 'transfer',
      transferDistance: 'far',
      inputKind: 'number',
      tol: 0.5,
      prompt: `Dos observatorios A y B ubicados en lados opuestos de una montaña de ${hMount} m de altura miden ángulos de elevación hacia la cima de ${alpha}° y ${beta}° respectivamente. Hallá la distancia horizontal total entre A y B (en metros):`,
      expected: ans,
      placeholder: 'Ej: x,yz m',
      diagContext: {
        target: 'double_observation',
        wrongAddSubValue: wrongSub,
      },
      hints: [
        'Pista 1: Como la montaña está entre A y B, la distancia total se obtiene sumando ambos tramos horizontales d₁ + d₂.',
        `Pista 2: Cada tramo cumple d₁ = ${hMount} / tg(${alpha}°) y d₂ = ${hMount} / tg(${beta}°).`,
        'Pista 3: Calculá ambos tramos en metros (modo DEG) y sumalos para obtener la separación total.',
      ],
      explanation: `d = ${hMount}·(cotg(${alpha}°) + cotg(${beta}°)) ≈ ${fmtNumberEsAR(ans, 2)} m.`,
    };
  }

  // 6. Oblique bridge (Law of Cosines + unit conversion)
  if (type === 'oblique_bridge_cosine_law') {
    const useUnits = rng() < 0.45;
    if (useUnits) {
      const sideAKm = randChoice(rng, [0.35, 0.42, 0.55, 0.68]);
      const sideAM = Math.round(sideAKm * 1000);
      const sideBM = randChoice(rng, [280, 340, 410, 520]);
      const gamma = randChoice(rng, [42, 54, 65, 110, 125]);
      const obl = solveObliqueCosineLaw({ sideA: sideAM, sideB: sideBM, angleIncludedDeg: gamma });
      const ans = Number(obl.sideC.toFixed(2));
      const wrongUnconv = Math.sqrt(sideAKm * sideAKm + sideBM * sideBM - 2 * sideAKm * sideBM * Math.cos(degToRad(gamma)));
      const wrongPyth = Math.hypot(sideAM, sideBM);

      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 6 · Puente Oblicuángulo y Unidades',
        representation: 'verbal',
        stage: 'transfer',
        transferDistance: 'far',
        inputKind: 'number',
        tol: 0.4,
        prompt: `Dos rutas rectas parten de un cruce formando ${gamma}°. Un móvil recorre ${fmtNumberEsAR(sideAKm, 2)} km por una ruta y otro recorre ${sideBM} m por la otra. Calculá la distancia en metros entre ambos móviles (2 decimales):`,
        expected: ans,
        placeholder: 'Ej: x,yz m',
        diagContext: {
          target: 'oblique_or_units',
          unconvertedValue: wrongUnconv,
          pythagorasMistake: wrongPyth,
        },
        hints: [
          `Pista 1: Unificá primero las unidades a metros: ${fmtNumberEsAR(sideAKm, 2)} km = ${sideAM} m.`,
          `Pista 2: Como el ángulo comprendido es ${gamma}° ≠ 90°, aplicá el Teorema del Coseno: c² = a² + b² − 2ab·cos(${gamma}°).`,
          'Pista 3: Sumá los cuadrados menos el doble producto por el coseno (respetando el signo) y tomá la raíz cuadrada.',
        ],
        explanation: `En metros: a = ${sideAM} m, b = ${sideBM} m; c = √(${sideAM}² + ${sideBM}² − 2·${sideAM}·${sideBM}·cos ${gamma}°) ≈ ${fmtNumberEsAR(ans, 2)} m.`,
      };
    }

    const sideA = randChoice(rng, [18, 24, 30, 40]);
    const sideB = randChoice(rng, [25, 32, 45, 50]);
    const gamma = randChoice(rng, [55, 68, 115, 125, 135]);
    const obl = solveObliqueCosineLaw({ sideA, sideB, angleIncludedDeg: gamma });
    const ans = Number(obl.sideC.toFixed(2));
    const wrongPyth = Math.hypot(sideA, sideB);

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 6 · Puente Oblicuángulo (Teorema del Coseno)',
      representation: 'symbolic',
      stage: 'guided_practice',
      transferDistance: 'near',
      inputKind: 'number',
      tol: 0.15,
      prompt: `Dos barcos salen de un puerto formando entre sus rumbos un ángulo de ${gamma}°. Tras navegar ${sideA} km y ${sideB} km respectivamente, ¿qué distancia en línea recta los separa (en km, 2 decimales)?`,
      expected: ans,
      placeholder: 'Ej: x,yz km',
      diagContext: {
        target: 'oblique_or_units',
        pythagorasMistake: wrongPyth,
      },
      hints: [
        `Pista 1: Como el ángulo entre los rumbos es ${gamma}° (no es 90°), no podés aplicar Pitágoras directo.`,
        `Pista 2: Planteá c² = ${sideA}² + ${sideB}² − 2·${sideA}·${sideB}·cos(${gamma}°).`,
        'Pista 3: Recordá el signo de cos(γ) si el ángulo es obtuso (> 90°) y aplicá raíz cuadrada al resultado.',
      ],
      explanation: `Por Teorema del Coseno: c = √(${sideA}² + ${sideB}² − 2·${sideA}·${sideB}·cos ${gamma}°) ≈ ${fmtNumberEsAR(ans, 2)} km.`,
    };
  }

  // 7. Regular polygons (half central angle), chords, and 3D prism diagonal
  if (type === 'regular_polygon_apothem_area') {
    const subMode = randChoice(rng, ['polygon_ap', 'chord_len', 'prism_diag']);
    if (subMode === 'polygon_ap') {
      const n = randChoice(rng, [5, 6, 8, 9, 10, 12]);
      const side = randChoice(rng, [10, 12, 16, 20, 24]);
      const poly = solveRegularPolygon({ n, side });
      const ans = Number(poly.apothem.toFixed(2));
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 7 · Apotema de Polígono Regular',
        representation: 'symbolic',
        stage: 'guided_practice',
        transferDistance: 'near',
        inputKind: 'number',
        tol: 0.08,
        prompt: `Calculá la longitud de la apotema de un polígono regular de ${n} lados cuyo lado mide ${side} cm (redondeá a 2 decimales):`,
        expected: ans,
        placeholder: 'Ej: a,bc',
        diagContext: {
          target: 'polygon',
          n,
          side,
          wrongApothemAsRadius: poly.radius,
        },
        hints: [
          `Pista 1: Dividí el polígono en ${n} triángulos isósceles iguales y bajá la apotema perpendicular al lado.`,
          `Pista 2: El triángulo rectángulo interior tiene cateto opuesto L/2 = ${side / 2} cm y semiángulo central 180°/${n} = ${fmtNumberEsAR(poly.halfAngleDeg, 2)}°.`,
          'Pista 3: Despejá la apotema usando tg(semiángulo) = (L/2) / apotema (recordá usar 180°/n, nunca 360°/n).',
        ],
        explanation: `Semiángulo = 180°/${n} = ${fmtNumberEsAR(poly.halfAngleDeg, 2)}°; ap = ${side / 2} / tg(${fmtNumberEsAR(poly.halfAngleDeg, 2)}°) ≈ ${fmtNumberEsAR(ans, 2)} cm.`,
      };
    }

    if (subMode === 'chord_len') {
      const r = randChoice(rng, [8, 10, 12, 15, 18]);
      const theta = randChoice(rng, [40, 50, 72, 84, 110]);
      const ch = solveChord({ r, centralAngleDeg: theta });
      const ans = Number(ch.chord.toFixed(2));
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 7 · Cuerda y Ángulo Central',
        representation: 'symbolic',
        stage: 'retrieval',
        transferDistance: 'near',
        inputKind: 'number',
        tol: 0.08,
        prompt: `En una circunferencia de radio ${r} cm, ¿cuánto mide la cuerda que subtiende un ángulo central de ${theta}° (en cm, 2 decimales)?`,
        expected: ans,
        placeholder: 'Ej: a,bc',
        diagContext: {
          target: 'polygon',
          n: Math.round(360 / theta),
          radius: r,
        },
        hints: [
          'Pista 1: Trazá la perpendicular desde el centro a la cuerda: parte tanto al ángulo central como a la cuerda por la mitad.',
          `Pista 2: En cada triángulo rectángulo la hipotenusa es r = ${r} cm y el semiángulo es ${theta / 2}°.`,
          'Pista 3: Calculá media cuerda con r·sen(θ/2) y multiplicá por 2 para hallar la cuerda completa.',
        ],
        explanation: `Cuerda = 2 · ${r} · sen(${theta / 2}°) ≈ ${fmtNumberEsAR(ans, 2)} cm.`,
      };
    }

    const a = randChoice(rng, [3, 4, 5, 6]);
    const b = randChoice(rng, [4, 7, 8, 9]);
    const c = randChoice(rng, [5, 10, 12, 14]);
    const pr = solvePrism3D({ a, b, c });
    const ans = Number(pr.spaceDiagonal.toFixed(2));
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 7 · Diagonal Espacial de Prisma 3D',
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      inputKind: 'number',
      tol: 0.08,
      prompt: `Calculá la longitud de la diagonal interior (espacial) de un prisma rectangular recto de aristas ${a} cm, ${b} cm y ${c} cm (en cm, 2 decimales):`,
      expected: ans,
      placeholder: 'Ej: a,bc',
      diagContext: {
        target: 'prism3d',
        baseDiagonal: pr.baseDiagonal,
        sumWithoutSqrt: a * a + b * b + c * c,
      },
      hints: [
        `Pista 1: Primero aplicá Pitágoras en el rectángulo de la base (${a} × ${b}) para hallar la diagonal del piso.`,
        `Pista 2: Luego formá un segundo triángulo rectángulo vertical con la diagonal de la base y la altura c = ${c} cm.`,
        'Pista 3: Calculá √(a² + b² + c²) sin olvidar extraer la raíz cuadrada final.',
      ],
      explanation: `D = √(${a}² + ${b}² + ${c}²) = √(${a * a + b * b + c * c}) ≈ ${fmtNumberEsAR(ans, 2)} cm.`,
    };
  }

  // 8. Sexagesimal <-> Circular exact conversion & s = r * theta
  const askArc = rng() < 0.45;
  if (askArc) {
    const r = randChoice(rng, [3, 4, 5, 6, 9, 12]);
    const deg = randChoice(rng, [30, 45, 60, 72, 120, 150]);
    const arc = arcLength({ r, angleDeg: deg });
    const ans = Number(arc.s.toFixed(2));
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 8 · Longitud de Arco s = r · θ',
      representation: 'symbolic',
      stage: 'guided_practice',
      transferDistance: 'near',
      inputKind: 'number',
      tol: 0.05,
      prompt: `Calculá la longitud de arco s (en cm, redondeada a 2 decimales) determinada por un ángulo central de ${deg}° en una circunferencia de radio r = ${r} cm:`,
      expected: ans,
      placeholder: 'Ej: a,bc cm',
      diagContext: {
        target: 'arc_length',
        r,
        angleDeg: deg,
      },
      hints: [
        'Pista 1: En la fórmula s = r · θ, el ángulo θ debe estar obligatoriamente en radianes, jamás en grados.',
        `Pista 2: Convertí ${deg}° multiplicando por π/180° para obtener ${arc.piRat ? `${arc.piRat.n}π/${arc.piRat.d}` : 'radianes'}.`,
        'Pista 3: Multiplicá el radio r por el ángulo ya convertido a radianes y expresalo en cm con 2 decimales.',
      ],
      explanation: `${deg}° = ${degToRadExact(deg).formattedPi} rad; s = ${r} · ${degToRadExact(deg).formattedPi} ≈ ${fmtNumberEsAR(ans, 2)} cm.`,
    };
  }

  const degChoices = [30, 45, 60, 70, 75, 105, 120, 135, 150, 210, 225, 315];
  const deg = randChoice(rng, degChoices);
  const exact = degToRadExact(deg);
  return {
    seed,
    type,
    competencyId: typeObj.competencyId,
    badge: 'Familia 8 · Conversión Exacta Grados → Radianes',
    representation: 'symbolic',
    stage: 'retrieval',
    transferDistance: 'near',
    inputKind: 'angle',
    requireExactPi: true,
    defaultSystem: 'rad',
    prompt: `Convertí ${deg}° al sistema circular expresando el resultado como fracción irreducible exacta de π (ej: aπ/b):`,
    expected: exact.formattedPi,
    placeholder: 'Ej: aπ/b',
    diagContext: {
      target: 'deg_to_rad',
      deg,
    },
    hints: [
      'Pista 1: Partí de la equivalencia exacta 180° ↔ π rad.',
      `Pista 2: Planteá ${deg}° · (π / 180°) para cancelar los grados en el denominador.`,
      'Pista 3: Simplificá la fracción numérica dividiendo numerador y denominador por su máximo común divisor, dejando π indicado.',
    ],
    explanation: `${deg}° · (π / 180°) = ${exact.formattedPi} rad.`,
  };
}

export function generateTrigRatiosChallenges(seed, forcedType = 'all', count = 6) {
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push(generateTrigRatiosChallenge(seed, forcedType, i));
  }
  return list;
}

export function selectAdaptiveTrigRatiosFamily({
  store = getProgressStore(),
  now = new Date(),
  previousCompetencyId = null,
} = {}) {
  return selectAdaptiveExercise({
    moduleId: MODULE_ID,
    availableExercises: CHALLENGE_TYPES,
    store,
    now,
    previousCompetencyId,
  });
}

export const TRAPS = [
  {
    id: 'trap_rad_mode',
    title: 'Trampa 1 · Calculadora en modo RAD cuando el problema está en grados',
    subtitle: 'El clásico de parcial donde sen(30°) da negativo.',
    wrongAttempt: {
      author: 'Tomás (calculadora en RAD)',
      steps: [
        'Lee: hipotenusa c = 10 cm, ángulo B = 30°, calcular el cateto opuesto.',
        'Escribe 10 · sen(30) con la pantalla marcando "R" (radianes).',
        'Anota 10 · (−0,988) = −9,88 cm ¡un lado negativo!',
      ],
    },
    correctResolution: {
      author: 'Resolución verificada en DEG',
      steps: [
        'Comprueba que la pantalla marque "D" (DEG) antes de calcular razones de grados sexagesimales.',
        'Calcula 10 · sen(30°) = 10 · 0,5 = 5 cm.',
        'Chequeo de sentido común: el cateto opuesto mide positivo y menor que la hipotenusa (5 < 10).',
      ],
    },
    question: '¿Cómo detectás al instante que tu calculadora quedó en RAD en lugar de DEG?',
    options: [
      {
        label: 'Probando sen(30°): en DEG da exactamente 0,5; en RAD da ≈ −0,988.',
        correct: true,
        feedback: '¡Exacto! Probar sen(30°) = 0,5 antes de empezar un examen te salva de arruinar toda la hoja.',
      },
      {
        label: 'Porque sen(30°) en RAD siempre da mayor que 1.',
        correct: false,
        feedback: 'No: sen(x) nunca supera 1 en ningún sistema; en RAD sen(30) ≈ −0,988 sigue estando en [−1; 1].',
      },
      {
        label: 'Solo cambia el resultado si el ángulo supera los 90°.',
        correct: false,
        feedback: 'Falso: para cualquier ángulo en grados (como 30°), evaluarlo como 30 radianes da un resultado completamente distinto.',
      },
    ],
  },
  {
    id: 'trap_opposite_adjacent',
    title: 'Trampa 2 · Creer que el cateto vertical es siempre el "opuesto"',
    subtitle: 'El triángulo se rotó o se preguntó desde el vértice C en vez de B.',
    wrongAttempt: {
      author: 'Lucía (catetos fijos de memoria)',
      steps: [
        'Mira el triángulo rectángulo y supone que el lado vertical AC es siempre el opuesto.',
        'Cuando le piden tg(C), calcula AC / AB.',
        'Invierte el cociente y obtiene el ángulo complementario B.',
      ],
    },
    correctResolution: {
      author: 'Resolución desde el vértice objetivo',
      steps: [
        'Se ubica en el vértice C antes de nombrar los catetos.',
        'El cateto que queda enfrente de C es AB (opuesto a C), y el que toca a C es AC (adyacente a C).',
        'Plantea tg(C) = AB / AC, exactamente la recíproca de tg(B).',
      ],
    },
    question: 'En un triángulo rectángulo en A, ¿qué relación cumplen siempre sen(B) y cos(C)?',
    options: [
      {
        label: 'Son exactamente iguales porque el cateto opuesto a B es el adyacente a C.',
        correct: true,
        feedback: '¡Correcto! Al cambiar de vértice agudo, opuesto y adyacente intercambian su rol mientras la hipotenusa queda fija.',
      },
      {
        label: 'Suman 1 porque B + C = 90°.',
        correct: false,
        feedback: 'Lo que suma 90° son los ángulos B y C; sus cofunciones sen(B) y cos(C) son iguales entre sí, no suman 1.',
      },
      {
        label: 'Son recíprocas: sen(B) = 1 / cos(C).',
        correct: false,
        feedback: 'No: la recíproca de sen(B) es cosec(B), mientras que cos(C) = sen(B).',
      },
    ],
  },
  {
    id: 'trap_depression_vertical',
    title: 'Trampa 3 · Medir el ángulo de depresión contra la pared vertical',
    subtitle: 'Usar α = 35° entre la pared del edificio y la visual.',
    wrongAttempt: {
      author: 'Matías (desde la vertical)',
      steps: [
        'Lee: ángulo de depresión de 35° desde un balcón de 20 m.',
        'Coloca 35° entre la pared vertical y la visual hacia el auto.',
        'Calcula la distancia horizontal como d = 20 · tg(35°) = 14,00 m.',
      ],
    },
    correctResolution: {
      author: 'Resolución desde la horizontal',
      steps: [
        'Traza la línea horizontal de los ojos en lo alto del balcón y mide 35° hacia abajo hasta la visual.',
        'Por alternos internos entre horizontales paralelas, el ángulo de elevación desde el auto vale 35°.',
        'Calcula tg(35°) = 20 / d ⇒ d = 20 / tg(35°) ≈ 28,56 m.',
      ],
    },
    question: 'Si el ángulo de depresión desde la terraza hacia un auto es 35°, ¿qué ángulo mide la visual contra la pared vertical?',
    options: [
      {
        label: '55° (= 90° − 35°), porque la depresión de 35° se mide siempre desde la horizontal.',
        correct: true,
        feedback: '¡Bien visto! La horizontal y la pared vertical forman 90°, así que adentro junto a la pared queda el complemento 55°.',
      },
      {
        label: '35°, porque vertical y horizontal son equivalentes.',
        correct: false,
        feedback: 'Cuidado: los 35° siempre nacen de la horizontal; poner 35° contra la pared cambia completamente el triángulo.',
      },
      {
        label: '145° (= 180° − 35°).',
        correct: false,
        feedback: 'Dentro del triángulo rectángulo el ángulo agudo junto a la pared es 90° − 35° = 55°.',
      },
    ],
  },
  {
    id: 'trap_polygon_full_angle',
    title: 'Trampa 4 · Usar el ángulo central completo 360°/n en polígonos regulares',
    subtitle: 'Olvidar que la apotema parte el ángulo central a la mitad.',
    wrongAttempt: {
      author: 'Sofía (ángulo sin dividir por 2)',
      steps: [
        'En un octógono regular (n = 8) de lado L = 20 m, calcula el ángulo central 360°/8 = 45°.',
        'Plantea tg(45°) = 10 / apotema.',
        'Obtiene apotema = 10 m ¡que es menor que la mitad real!',
      ],
    },
    correctResolution: {
      author: 'Resolución con el semiángulo 180°/n',
      steps: [
        'La apotema cae perpendicular al punto medio del lado y biseca el triángulo isósceles.',
        'Cada triángulo rectángulo trabaja con medio lado (L/2 = 10 m) y el semiángulo 45°/2 = 22,5°.',
        'Calcula apotema = 10 / tg(22,5°) ≈ 24,14 m.',
      ],
    },
    question: '¿Qué triángulo rectángulo aparece al bajar la apotema en un hexágono regular (n = 6)?',
    options: [
      {
        label: 'Hipotenusa = radio, un cateto = apotema, otro cateto = L/2 y semiángulo central = 30°.',
        correct: true,
        feedback: '¡Exacto! 360°/6 = 60° es el ángulo central completo; al partirlo a la mitad queda 30° (y radio = lado en el hexágono).',
      },
      {
        label: 'Un triángulo con ángulo agudo de 60° y cateto opuesto igual a L.',
        correct: false,
        feedback: '60° es el ángulo central completo entre dos radios, y L es todo el lado: al bajar la apotema ambos se parten a la mitad.',
      },
      {
        label: 'La apotema es la hipotenusa y el radio es un cateto.',
        correct: false,
        feedback: 'Al revés: el radio llega al vértice (es más largo y es la hipotenusa), la apotema cae perpendicular al lado (cateto).',
      },
    ],
  },
  {
    id: 'trap_arc_degrees',
    title: 'Trampa 5 · Reemplazar grados directamente en s = r · θ',
    subtitle: 'Un error de unidades que multiplica el arco por casi 60.',
    wrongAttempt: {
      author: 'Bruno (grados en fórmula circular)',
      steps: [
        'Tiene r = 3 cm y ángulo central θ = 30°.',
        'Reemplaza directo: s = 3 · 30 = 90 cm.',
        'No advierte que la circunferencia entera apenas mide 2π·3 ≈ 18,85 cm.',
      ],
    },
    correctResolution: {
      author: 'Resolución convirtiendo primero a radianes',
      steps: [
        'Convierte 30° a radianes: 30° · (π / 180°) = π/6 rad.',
        'Aplica s = r · θ_rad = 3 · (π/6) = π/2 ≈ 1,57 cm.',
        'Verifica: 30° es 1/12 de vuelta, y 18,85 / 12 ≈ 1,57 cm.',
      ],
    },
    question: 'Si r = 6 cm y θ = 60°, ¿por qué s = 6 · 60 = 360 cm es físicamente imposible?',
    options: [
      {
        label: 'Porque θ debe ir en radianes (π/3), dando s = 6·(π/3) = 2π ≈ 6,28 cm; toda la vuelta mide 12π ≈ 37,7 cm.',
        correct: true,
        feedback: '¡Impecable! Comparar contra el perímetro total 2πr detecta al instante cualquier error por meter grados.',
      },
      {
        label: 'Porque en s = r · θ el radio r debe ir en metros.',
        correct: false,
        feedback: 'El radio puede ir en cm (entonces el arco s sale en cm); el problema es meter grados en θ en lugar de radianes.',
      },
      {
        label: 'Porque había que dividir por 60 en vez de multiplicar.',
        correct: false,
        feedback: 'Dividir 6/60 tampoco usa radianes; hay que multiplicar 60° por π/180° = π/3 rad.',
      },
    ],
  },
];

function loadSavedSeed() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem) {
      const raw = localStorage.getItem(SEED_STORAGE_KEY);
      if (raw !== null && Number.isFinite(Number(raw))) return Number(raw) >>> 0;
    }
  } catch {}
  return 2026;
}

function saveSeed(seed) {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(SEED_STORAGE_KEY, String(seed >>> 0));
    }
  } catch {}
}

export function mountTrigRatiosRetos(root, { vn } = {}) {
  if (!root) return;
  clear(root);

  const state = {
    seed: loadSavedSeed(),
    family: 'all',
    streak: 0,
    solvedCount: 0,
  };

  const tabsHeader = h('div', { class: 'trigr-retos-tabs pr-chip-row' });
  const tabPrng = h('button', { type: 'button', class: 'pr-chip is-active' }, [
    chalkIcon('spark', 15),
    ' 1. Entrenador Infinito por Semilla PRNG (8 Familias)',
  ]);
  const tabTraps = h('button', { type: 'button', class: 'pr-chip' }, [
    chalkIcon('shield', 15),
    ' 2. Las 5 Trampas Clásicas de Examen',
  ]);
  tabsHeader.append(tabPrng, tabTraps);

  const prngPane = h('div', { class: 'trigr-retos-pane' });
  const trapsPane = h('div', { class: 'trigr-retos-pane', hidden: '' });

  const seedInput = h('input', {
    type: 'number',
    class: 'pr-check-input',
    value: String(state.seed),
    'aria-label': 'Semilla PRNG',
  });
  const familySelect = h(
    'select',
    { class: 'pr-check-input trigr-family-select', 'aria-label': 'Familia de ejercicios' },
    [
      h('option', { value: 'all' }, 'Mixto (Las 8 familias)'),
      h('option', { value: 'adaptativo' }, 'Inteligente (Según tu evidencia)'),
      ...CHALLENGE_TYPES.map((t) => h('option', { value: t.id }, t.label)),
    ]
  );
  const nextSeedBtn = h('button', { type: 'button', class: 'pr-btn' }, [
    chalkIcon('play', 14),
    ' Siguiente semilla',
  ]);
  const randSeedBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, 'Aleatoria');
  const progressPill = h('span', { class: 'exp-trainer-progress-pill' }, '0/6 resueltos · Racha indep.: 0');
  const adaptiveNote = h('p', { class: 'small muted', hidden: '' });

  const toolbar = h('div', { class: 'exp-trainer-toolbar' }, [
    h('label', { class: 'exp-trainer-field' }, [h('span', {}, 'Semilla'), seedInput]),
    h('label', { class: 'exp-trainer-field exp-trainer-field--grow' }, [
      h('span', {}, 'Familia / Modo'),
      familySelect,
    ]),
    h('div', { class: 'exp-trainer-toolbar__btns' }, [nextSeedBtn, randSeedBtn]),
    progressPill,
  ]);
  const cascadeList = h('ol', { class: 'exp-challenges-cascade' });
  prngPane.append(toolbar, adaptiveNote, cascadeList);

  const updatePill = () => {
    progressPill.textContent = `${state.solvedCount}/6 resueltos · Racha indep.: ${state.streak}`;
  };

  function createCard(ch, idx) {
    let hintIndex = 0;
    let solutionRevealed = false;
    const statusEl = h('span', { class: 'exp-challenge-card__status' }, 'Pendiente');
    const inputEl = h('input', {
      type: 'text',
      class: 'pr-check-input',
      placeholder: ch.placeholder,
      'aria-label': ch.prompt,
    });
    const verifyBtn = h('button', { type: 'button', class: 'pr-btn' }, [
      chalkIcon('check', 14),
      ' Verificar',
    ]);
    const hintBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [
      chalkIcon('bulb', 14),
      ` Pista (0/${ch.hints.length})`,
    ]);
    const solutionBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [
      chalkIcon('spark', 14),
      ' Ver solución explicada',
    ]);
    const hintsBox = h('div', { class: 'trigr-check-hints', hidden: '' });
    const feedbackBox = h('div', {
      class: 'pr-check-feedback',
      role: 'status',
      'aria-live': 'polite',
    });

    hintBtn.addEventListener('click', () => {
      playClick();
      if (hintIndex < ch.hints.length) {
        hintsBox.removeAttribute('hidden');
        hintsBox.appendChild(h('div', { class: 'trigr-hint-item' }, ch.hints[hintIndex]));
        hintIndex += 1;
        hintBtn.replaceChildren(
          chalkIcon('bulb', 14),
          hintIndex < ch.hints.length ? ` Pista (${hintIndex}/${ch.hints.length})` : ' Pistas completas'
        );
      }
    });

    solutionBtn.addEventListener('click', () => {
      playClick();
      if (solutionRevealed) return;
      solutionRevealed = true;
      state.streak = 0;
      inputEl.disabled = true;
      verifyBtn.disabled = true;
      hintBtn.disabled = true;
      solutionBtn.disabled = true;
      statusEl.textContent = 'Solución vista (Asistido)';
      statusEl.className = 'exp-challenge-card__status is-solution';
      feedbackBox.className = 'pr-check-feedback is-ok is-solution';
      feedbackBox.replaceChildren(
        chalkIcon('spark', 14),
        h('strong', {}, ' Solución explicada: '),
        h('span', {}, `${ch.explanation} (Respuesta: ${ch.expected})`)
      );
      try {
        recordTrigRatiosAttempt({
          exerciseId: `trigr-reto-${ch.type}-${idx}`,
          competencyId: ch.competencyId,
          correct: true,
          mode: 'assisted',
          hintsUsed: hintIndex,
          solutionRevealed: true,
          representation: ch.representation || 'symbolic',
          stage: ch.stage || 'transfer',
          transferDistance: ch.transferDistance || 'far',
        });
        notifyCompetencyDashboardUpdate();
      } catch {}
      updatePill();
    });

    const onVerify = () => {
      if (solutionRevealed || inputEl.disabled) return;
      const res = validateTrigRatiosAttempt({
        kind: ch.inputKind,
        input: inputEl.value,
        expected: ch.expected,
        tol: ch.tol ?? 0.08,
        tolDeg: ch.tolDeg ?? 0.08,
        tolRad: ch.tolRad ?? 1e-3,
        requireExactPi: Boolean(ch.requireExactPi),
        defaultSystem: ch.defaultSystem || 'deg',
        diagContext: ch.diagContext || {},
      });
      if (res.empty) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = 'Escribí un valor antes de verificar.';
        return;
      }
      if (res.ok) {
        playSuccess();
        const isIndependent = hintIndex === 0 && !solutionRevealed;
        if (isIndependent) state.streak += 1;
        state.solvedCount += 1;
        inputEl.disabled = true;
        verifyBtn.disabled = true;
        hintBtn.disabled = true;
        solutionBtn.disabled = true;
        card.classList.add('is-solved');
        statusEl.textContent = isIndependent ? 'Resuelto (Independiente)' : 'Resuelto (Con apoyo)';
        statusEl.className = `exp-challenge-card__status ${isIndependent ? 'is-solved-indep' : 'is-solved-assisted'}`;
        feedbackBox.className = 'pr-check-feedback is-ok';
        feedbackBox.replaceChildren(
          chalkIcon(isIndependent ? 'spark' : 'bulb', 14),
          h(
            'strong',
            {},
            isIndependent ? ' ¡Correcto! [Logro Independiente] ' : ' ¡Correcto! [Logro Asistido] '
          ),
          h('span', {}, ch.explanation)
        );
        try {
          recordTrigRatiosAttempt({
            exerciseId: `trigr-reto-${ch.type}-${idx}`,
            competencyId: ch.competencyId,
            correct: true,
            mode: isIndependent ? 'independent' : 'assisted',
            hintsUsed: hintIndex,
            solutionRevealed: false,
            representation: ch.representation || 'symbolic',
            stage: ch.stage || 'transfer',
            transferDistance: ch.transferDistance || 'far',
          });
          notifyCompetencyDashboardUpdate();
        } catch {}
        updatePill();
        if (isIndependent && STREAK_REACTIONS[state.streak]) {
          const sr = STREAK_REACTIONS[state.streak];
          if (vn && typeof vn.react === 'function') vn.react(sr.pose, sr.text);
          else vnReact(sr);
        }
        return;
      }

      playError();
      state.streak = 0;
      updatePill();
      if (res.syntaxError) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = res.syntaxError;
        return;
      }
      if (res.needsExactPi) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = 'El valor numérico coincide, pero expresalo como fracción irreducible de π (ej: 7π/18).';
        return;
      }
      const diag = res.diagnostic;
      try {
        recordTrigRatiosAttempt({
          exerciseId: `trigr-reto-${ch.type}-${idx}`,
          competencyId: ch.competencyId,
          correct: false,
          mode: hintIndex > 0 ? 'assisted' : 'independent',
          hintsUsed: hintIndex,
          solutionRevealed: false,
          diagnosticId: diag?.id || null,
          representation: ch.representation || 'symbolic',
          stage: ch.stage || 'transfer',
          transferDistance: ch.transferDistance || 'far',
        });
        notifyCompetencyDashboardUpdate();
      } catch {}
      feedbackBox.className = 'pr-check-feedback is-error';
      feedbackBox.textContent = diag
        ? diag.message
        : 'Todavía no coincide. Usá «Pista» para revisar razones, ángulos o unidades.';
      if (diag) {
        if (vn && typeof vn.react === 'function') vn.react(diag.pose, diag.message);
        else vnReact({ pose: diag.pose, tag: diag.tag || diag.shortLabel, html: diag.message });
      }
    };

    verifyBtn.addEventListener('click', onVerify);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onVerify();
      }
    });

    const card = h(
      'li',
      { class: 'exp-challenge-card trigr-reto-card', 'data-problem-index': String(idx) },
      h('div', { class: 'exp-challenge-card__header' }, [
        h('span', { class: 'exp-challenge-card__badge' }, `Reto ${idx + 1} · ${ch.badge}`),
        statusEl,
      ]),
      h('p', { class: 'pr-check-prompt' }, ch.prompt),
      h('div', { class: 'exp-challenge-card__input-row' }, [inputEl]),
      h('div', { class: 'trigr-reto-actions pr-chip-row' }, [verifyBtn, hintBtn, solutionBtn]),
      hintsBox,
      feedbackBox
    );
    return card;
  }

  function renderCascade() {
    clear(cascadeList);
    state.solvedCount = 0;
    adaptiveNote.setAttribute('hidden', '');
    let challenges;

    if (state.family === 'adaptativo') {
      const store = getProgressStore();
      const now = new Date();
      challenges = [];
      let prevComp = null;
      let firstSelection = null;
      for (let i = 0; i < 6; i++) {
        const sel = selectAdaptiveTrigRatiosFamily({
          store,
          now,
          previousCompetencyId: prevComp,
        });
        if (i === 0) firstSelection = sel;
        const fam = sel.exercise?.id || CHALLENGE_TYPES[i % CHALLENGE_TYPES.length].id;
        const ch = generateTrigRatiosChallenge(state.seed, fam, i);
        prevComp = sel.targetCompetencyId || sel.exercise?.competencyId;
        challenges.push(ch);
      }
      const firstComp = getCompetencyById(firstSelection?.targetCompetencyId || challenges[0]?.competencyId);
      adaptiveNote.removeAttribute('hidden');
      adaptiveNote.textContent = firstSelection?.selectionReason
        ? `Selección adaptativa: ${firstSelection.selectionReason} Prioridad: «${firstComp?.title || 'Razones Trigonométricas'}».`
        : `Selección adaptativa activa: priorizando «${firstComp?.title || 'Razones Trigonométricas'}» según tu evidencia.`;
    } else {
      challenges = generateTrigRatiosChallenges(state.seed, state.family, 6);
    }

    challenges.forEach((ch, idx) => cascadeList.appendChild(createCard(ch, idx)));
    updatePill();
  }

  seedInput.addEventListener('change', () => {
    state.seed = Number(seedInput.value) >>> 0;
    seedInput.value = String(state.seed);
    saveSeed(state.seed);
    renderCascade();
  });
  familySelect.addEventListener('change', () => {
    state.family = familySelect.value;
    renderCascade();
  });
  nextSeedBtn.addEventListener('click', () => {
    playClick();
    state.seed += 1;
    seedInput.value = String(state.seed);
    saveSeed(state.seed);
    renderCascade();
  });
  randSeedBtn.addEventListener('click', () => {
    playClick();
    state.seed = Math.floor(Math.random() * 1000000) >>> 0;
    seedInput.value = String(state.seed);
    saveSeed(state.seed);
    renderCascade();
  });

  // Tab 2: 5 Exam Traps
  const trapChips = h('div', { class: 'pr-chip-row' });
  const trapBody = h('div', { class: 'trigr-trap-body' });
  trapsPane.append(trapChips, trapBody);

  function renderTrap(idx) {
    const trap = TRAPS[idx];
    Array.from(trapChips.children).forEach((b, i) => b.classList.toggle('is-active', i === idx));
    clear(trapBody);

    const feedback = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });
    const opts = h(
      'div',
      { class: 'trigr-trap-options pr-options' },
      trap.options.map((opt) => {
        const btn = h('button', { type: 'button', class: 'pr-option' }, opt.label);
        btn.addEventListener('click', () => {
          Array.from(opts.children).forEach((s) =>
            s.classList.remove('is-selected', 'is-correct', 'is-wrong')
          );
          btn.classList.add('is-selected');
          if (opt.correct) {
            playSuccess();
            btn.classList.add('is-correct');
            feedback.className = 'pr-check-feedback is-ok';
          } else {
            playError();
            btn.classList.add('is-wrong');
            feedback.className = 'pr-check-feedback is-error';
          }
          feedback.textContent = opt.feedback;
        });
        return btn;
      })
    );

    trapBody.append(
      h('h3', { class: 'trigr-trap-title' }, trap.title),
      h('p', { class: 'muted' }, trap.subtitle),
      h('div', { class: 'trigr-trap-compare' }, [
        h('div', { class: 'trigr-trap-col is-wrong' }, [
          h('div', { class: 'trigr-trap-col-head' }, [
            chalkIcon('cross', 15),
            ` ${trap.wrongAttempt.author}`,
          ]),
          h('ol', {}, trap.wrongAttempt.steps.map((s) => h('li', {}, s))),
        ]),
        h('div', { class: 'trigr-trap-col is-right' }, [
          h('div', { class: 'trigr-trap-col-head' }, [
            chalkIcon('check', 15),
            ` ${trap.correctResolution.author}`,
          ]),
          h('ol', {}, trap.correctResolution.steps.map((s) => h('li', {}, s))),
        ]),
      ]),
      h('p', { class: 'pr-check-prompt' }, trap.question),
      opts,
      feedback
    );
  }

  TRAPS.forEach((_, idx) => {
    trapChips.appendChild(
      h(
        'button',
        {
          type: 'button',
          class: `pr-chip${idx === 0 ? ' is-active' : ''}`,
          on: {
            click: () => {
              playClick();
              renderTrap(idx);
            },
          },
        },
        `Trampa ${idx + 1}`
      )
    );
  });

  tabPrng.addEventListener('click', () => {
    playClick();
    tabPrng.classList.add('is-active');
    tabTraps.classList.remove('is-active');
    prngPane.removeAttribute('hidden');
    trapsPane.setAttribute('hidden', '');
  });
  tabTraps.addEventListener('click', () => {
    playClick();
    tabTraps.classList.add('is-active');
    tabPrng.classList.remove('is-active');
    trapsPane.removeAttribute('hidden');
    prngPane.setAttribute('hidden', '');
  });

  renderCascade();
  renderTrap(0);
  root.append(tabsHeader, prngPane, trapsPane);
}

export const initRetosModule = mountTrigRatiosRetos;
export const mountRetos = mountTrigRatiosRetos;
