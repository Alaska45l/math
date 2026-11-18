/**
 * @file js/modules/razones-trigonometricas/logic.js
 * Lógica matemática pura (sin DOM, sin eval) para Unidad 10 · Razones Trigonométricas:
 * - Resolución de triángulos rectángulos (Pitágoras, SOHCAHTOA, ángulos complementarios)
 * - Ángulos de elevación, depresión y doble observación topográfica
 * - Polígonos regulares, cuerdas, rombos, trapecios y cuerpos 3D (prisma y pirámide)
 * - Puente angular (sexagesimal <-> circular, s = r * theta) y puente oblicuángulo (Teorema del Coseno/Seno)
 * - Motor cognitivo diagnoseTrigRatios con 10 diagnósticos canónicos
 */

import {
  degToRad,
  radToDeg,
  degToDms,
  dmsToDeg,
  degToRadExact,
  radExactToDeg,
  arcLength,
  solveArcDimension,
  simplifySquareRoot,
  exactRadical,
  exactRadicalEq,
} from '../../core/math/trigonometry.js';
import {
  MINUS_CHAR,
  PI_CHAR,
  SQRT_CHAR,
  fmtNumberEsAR,
  parseNumberOrFraction,
  parseAngleAnswer,
  equivalentNumber,
  equivalentAngle,
  equivalentSetExactas,
} from './expr.js';

export {
  MINUS_CHAR,
  PI_CHAR,
  SQRT_CHAR,
  degToRad,
  radToDeg,
  degToDms,
  dmsToDeg,
  degToRadExact,
  radExactToDeg,
  arcLength,
  solveArcDimension,
  simplifySquareRoot,
  exactRadical,
  exactRadicalEq,
  fmtNumberEsAR,
  parseNumberOrFraction,
  parseAngleAnswer,
  equivalentNumber,
  equivalentAngle,
  equivalentSetExactas,
};

/* ============================================================================
 * 1. Triángulo Rectángulo (recto en A; c = hipotenusa BC, b = AC opuesto a B, a = AB adyacente a B)
 * ========================================================================== */

/**
 * Resuelve completamente un triángulo rectángulo en A (a = AB, b = AC, c = BC, B opuesto a b, C opuesto a a).
 * También acepta { opp, adj, hyp, angleDeg } o { hAlt, leg } (altura sobre la hipotenusa y un cateto).
 */
export function solveRightTriangle(spec = {}) {
  let a = spec.a ?? spec.adj ?? spec.AB ?? null;
  let b = spec.b ?? spec.opp ?? spec.AC ?? null;
  let c = spec.c ?? spec.hyp ?? spec.BC ?? null;
  let B = spec.B ?? spec.angleDeg ?? null;
  let C = spec.C ?? null;
  const hAlt = spec.hAlt ?? null;
  const leg = spec.leg ?? null;

  if (hAlt !== null && leg !== null) {
    if (hAlt <= 0 || leg <= 0 || hAlt >= leg) {
      throw new RangeError('La altura sobre la hipotenusa debe ser positiva y menor que el cateto.');
    }
    // sin(theta) = hAlt / leg
    const thetaRad = Math.asin(hAlt / leg);
    B = (thetaRad * 180) / Math.PI;
    C = 90 - B;
    a = leg;
    // cos(B) = a / c => c = a / cos(B)
    c = a / Math.cos(thetaRad);
    b = Math.sqrt(Math.max(0, c * c - a * a));
  } else if (B !== null) {
    if (B <= 0 || B >= 90) throw new RangeError('El ángulo agudo B debe estar en (0°; 90°).');
    C = 90 - B;
    const radB = degToRad(B);
    if (c !== null) {
      b = c * Math.sin(radB);
      a = c * Math.cos(radB);
    } else if (b !== null) {
      c = b / Math.sin(radB);
      a = b / Math.tan(radB);
    } else if (a !== null) {
      c = a / Math.cos(radB);
      b = a * Math.tan(radB);
    } else {
      throw new TypeError('Falta al menos un lado junto con el ángulo B.');
    }
  } else if (C !== null) {
    return solveRightTriangle({ a, b, c, B: 90 - C });
  } else if (a !== null && b !== null) {
    if (a <= 0 || b <= 0) throw new RangeError('Los catetos deben ser positivos.');
    c = Math.hypot(a, b);
    B = (Math.atan2(b, a) * 180) / Math.PI;
    C = 90 - B;
  } else if (c !== null && b !== null) {
    if (c <= b || b <= 0) throw new RangeError('La hipotenusa debe superar al cateto.');
    a = Math.sqrt(c * c - b * b);
    B = (Math.asin(b / c) * 180) / Math.PI;
    C = 90 - B;
  } else if (c !== null && a !== null) {
    if (c <= a || a <= 0) throw new RangeError('La hipotenusa debe superar al cateto.');
    b = Math.sqrt(c * c - a * a);
    B = (Math.acos(a / c) * 180) / Math.PI;
    C = 90 - B;
  } else {
    throw new TypeError('Se requieren al menos dos datos compatibles (2 lados, o 1 lado + 1 ángulo agudo).');
  }

  const radB = degToRad(B);
  const perimeter = a + b + c;
  const area = (a * b) / 2;
  const altToHyp = (a * b) / c;

  return Object.freeze({
    a,
    b,
    c,
    B,
    C,
    dmsB: degToDms(B, { precisionSec: 0 }),
    dmsC: degToDms(C, { precisionSec: 0 }),
    perimeter,
    area,
    hAlt: altToHyp,
    sinB: Math.sin(radB),
    cosB: Math.cos(radB),
    tanB: Math.tan(radB),
    sinC: Math.cos(radB),
    cosC: Math.sin(radB),
    tanC: 1 / Math.tan(radB),
  });
}

/**
 * Dado únicamente el cociente entre dos catetos (ej. 3:1), determina ángulos agudos
 * pero señala que la hipotenusa queda indeterminada por semejanza.
 */
export function solveRatioOnly(oppOverAdj) {
  const k = typeof oppOverAdj === 'number' ? oppOverAdj : parseNumberOrFraction(oppOverAdj);
  if (!Number.isFinite(k) || k <= 0) {
    throw new RangeError('La razón entre catetos debe ser positiva.');
  }
  const B = (Math.atan(k) * 180) / Math.PI;
  const C = 90 - B;
  return Object.freeze({
    ratio: k,
    B,
    C,
    dmsB: degToDms(B, { precisionSec: 0 }),
    dmsC: degToDms(C, { precisionSec: 0 }),
    hypotenuseDeterminable: false,
    reason: 'Sin una longitud de referencia, existen infinitos triángulos semejantes con los mismos ángulos.',
  });
}

/* ============================================================================
 * 2. Elevación, Depresión y Doble Observación Topográfica
 * ========================================================================== */

export function solveElevationDepression({ height = null, distance = null, hypotenuse = null, angleDeg }) {
  if (!Number.isFinite(angleDeg) || angleDeg <= 0 || angleDeg >= 90) {
    throw new RangeError('El ángulo de elevación o depresión debe estar en (0°; 90°).');
  }
  const tri = solveRightTriangle({
    b: height,
    a: distance,
    c: hypotenuse,
    B: angleDeg,
  });
  return Object.freeze({
    height: tri.b,
    distance: tri.a,
    hypotenuse: tri.c,
    angleDeg: tri.B,
    dmsAngle: tri.dmsB,
  });
}

/**
 * Resuelve sistemas de doble observación:
 * - 'between_points': dos observadores a ambos lados del objeto (d = h * (cot α + cot β))
 * - 'same_side_horizontal': un observador retrocede d metros sobre la horizontal (h = d / (cot α - cot β))
 * - 'vertical_gap': un objeto de altura conocida g sobre otro (faro sobre acantilado, o dos balcones separados g)
 */
export function solveDoubleObservation({
  height = null,
  distance = null,
  heightDiff = null,
  alphaDeg,
  betaDeg,
  mode = 'same_side_horizontal',
} = {}) {
  const cot = (deg) => 1 / Math.tan(degToRad(deg));
  const tan = (deg) => Math.tan(degToRad(deg));

  if (mode === 'between_points') {
    if (height !== null) {
      const d1 = height * cot(alphaDeg);
      const d2 = height * cot(betaDeg);
      return Object.freeze({ mode, height, d1, d2, totalDistance: d1 + d2 });
    }
    if (distance !== null) {
      const h = distance / (cot(alphaDeg) + cot(betaDeg));
      return Object.freeze({ mode, height: h, d1: h * cot(alphaDeg), d2: h * cot(betaDeg), totalDistance: distance });
    }
    throw new TypeError('between_points requiere height o distance.');
  }

  if (mode === 'same_side_horizontal') {
    const aMin = Math.min(alphaDeg, betaDeg);
    const bMax = Math.max(alphaDeg, betaDeg);
    if (Math.abs(aMin - bMax) < 1e-9) throw new RangeError('Los dos ángulos deben ser distintos.');
    if (distance !== null) {
      const h = distance / (cot(aMin) - cot(bMax));
      const dNear = h * cot(bMax);
      const dFar = h * cot(aMin);
      return Object.freeze({ mode, height: h, dNear, dFar, deltaDistance: distance });
    }
    if (height !== null) {
      const dNear = height * cot(bMax);
      const dFar = height * cot(aMin);
      return Object.freeze({ mode, height, dNear, dFar, deltaDistance: dFar - dNear });
    }
    throw new TypeError('same_side_horizontal requiere distance o height.');
  }

  if (mode === 'vertical_gap') {
    const aMin = Math.min(alphaDeg, betaDeg);
    const bMax = Math.max(alphaDeg, betaDeg);
    if (heightDiff === null) throw new TypeError('vertical_gap requiere heightDiff.');
    const horizontalDist = heightDiff / (tan(bMax) - tan(aMin));
    const lowerHeight = horizontalDist * tan(aMin);
    const upperHeight = horizontalDist * tan(bMax);
    return Object.freeze({
      mode,
      horizontalDist,
      lowerHeight,
      upperHeight,
      heightDiff,
    });
  }

  throw new TypeError(`Modo de doble observación desconocido: "${mode}"`);
}

/* ============================================================================
 * 3. Polígonos Regulares, Cuerdas, Rombos, Trapecios, Cuerpos 3D y Puente Oblicuo
 * ========================================================================== */

export function solveRegularPolygon({ n, side = null, radius = null, apothem = null } = {}) {
  if (!Number.isInteger(n) || n < 3) {
    throw new RangeError('Un polígono regular requiere al menos n = 3 lados.');
  }
  const centralAngleDeg = 360 / n;
  const halfAngleDeg = 180 / n;
  const radHalf = degToRad(halfAngleDeg);

  let sVal = side;
  let rVal = radius;
  let apVal = apothem;

  if (rVal !== null) {
    sVal = 2 * rVal * Math.sin(radHalf);
    apVal = rVal * Math.cos(radHalf);
  } else if (sVal !== null) {
    const halfS = sVal / 2;
    rVal = halfS / Math.sin(radHalf);
    apVal = halfS / Math.tan(radHalf);
  } else if (apVal !== null) {
    rVal = apVal / Math.cos(radHalf);
    sVal = 2 * apVal * Math.tan(radHalf);
  } else {
    throw new TypeError('Indicá lado, radio o apotema del polígono.');
  }

  const perimeter = n * sVal;
  const area = (perimeter * apVal) / 2;
  const interiorAngleDeg = ((n - 2) * 180) / n;

  return Object.freeze({
    n,
    centralAngleDeg,
    halfAngleDeg,
    interiorAngleDeg,
    side: sVal,
    radius: rVal,
    apothem: apVal,
    perimeter,
    area,
  });
}

export function solveChord({ r = null, chord = null, centralAngleDeg = null } = {}) {
  if (r !== null && centralAngleDeg !== null) {
    const c = 2 * r * Math.sin(degToRad(centralAngleDeg / 2));
    const apothem = r * Math.cos(degToRad(centralAngleDeg / 2));
    return Object.freeze({ r, chord: c, centralAngleDeg, apothem });
  }
  if (r !== null && chord !== null) {
    if (chord <= 0 || chord > 2 * r) throw new RangeError('La cuerda debe estar en (0; 2r].');
    const halfTheta = (Math.asin(chord / (2 * r)) * 180) / Math.PI;
    const theta = 2 * halfTheta;
    return Object.freeze({
      r,
      chord,
      centralAngleDeg: theta,
      dmsAngle: degToDms(theta, { precisionSec: 0 }),
      apothem: r * Math.cos(degToRad(halfTheta)),
    });
  }
  throw new TypeError('solveChord requiere (r, centralAngleDeg) o (r, chord).');
}

export function solveRhombus({ d1, d2 }) {
  if (d1 <= 0 || d2 <= 0) throw new RangeError('Las diagonales deben ser positivas.');
  const half1 = d1 / 2;
  const half2 = d2 / 2;
  const side = Math.hypot(half1, half2);
  const halfAcute = (Math.atan2(Math.min(half1, half2), Math.max(half1, half2)) * 180) / Math.PI;
  const acuteDeg = 2 * halfAcute;
  const obtuseDeg = 180 - acuteDeg;
  return Object.freeze({
    d1,
    d2,
    side,
    perimeter: 4 * side,
    area: (d1 * d2) / 2,
    acuteDeg,
    obtuseDeg,
    dmsAcute: degToDms(acuteDeg, { precisionSec: 0 }),
    dmsObtuse: degToDms(obtuseDeg, { precisionSec: 0 }),
  });
}

export function solvePrism3D({ a, b, c }) {
  if (a <= 0 || b <= 0 || c <= 0) throw new RangeError('Las aristas del prisma deben ser positivas.');
  const baseDiagonal = Math.hypot(a, b);
  const spaceDiagonal = Math.hypot(baseDiagonal, c);
  const angleWithBaseDeg = (Math.atan2(c, baseDiagonal) * 180) / Math.PI;
  return Object.freeze({
    a,
    b,
    c,
    baseDiagonal,
    spaceDiagonal,
    angleWithBaseDeg,
    dmsAngle: degToDms(angleWithBaseDeg, { precisionSec: 0 }),
  });
}

export function solveSquarePyramid({ baseSide, height = null, lateralApothem = null, lateralEdge = null }) {
  if (baseSide <= 0) throw new RangeError('El lado de la base debe ser positivo.');
  const halfSide = baseSide / 2;
  let h = height;
  if (h === null && lateralApothem !== null) {
    h = Math.sqrt(Math.max(0, lateralApothem * lateralApothem - halfSide * halfSide));
  } else if (h === null && lateralEdge !== null) {
    const halfBaseDiag = (baseSide * Math.SQRT2) / 2;
    h = Math.sqrt(Math.max(0, lateralEdge * lateralEdge - halfBaseDiag * halfBaseDiag));
  }
  if (h === null || h <= 0) throw new RangeError('No se pudo determinar una altura positiva.');
  const volume = (baseSide * baseSide * h) / 3;
  return Object.freeze({ baseSide, height: h, volume });
}

/**
 * Puente oblicuángulo: Teorema del Coseno (c^2 = a^2 + b^2 - 2ab cos γ) y Teorema del Seno.
 */
export function solveObliqueCosineLaw({ sideA, sideB, angleIncludedDeg }) {
  if (sideA <= 0 || sideB <= 0 || angleIncludedDeg <= 0 || angleIncludedDeg >= 180) {
    throw new RangeError('Datos inválidos para triángulo oblicuángulo.');
  }
  const radG = degToRad(angleIncludedDeg);
  const sideC = Math.sqrt(sideA * sideA + sideB * sideB - 2 * sideA * sideB * Math.cos(radG));
  const sinA = (sideA * Math.sin(radG)) / sideC;
  const angleA = (Math.asin(Math.min(1, sinA)) * 180) / Math.PI;
  const angleB = 180 - angleIncludedDeg - angleA;
  const area = 0.5 * sideA * sideB * Math.sin(radG);
  return Object.freeze({
    sideA,
    sideB,
    sideC,
    angleIncludedDeg,
    angleA,
    angleB,
    area,
    perimeter: sideA + sideB + sideC,
  });
}

/* ============================================================================
 * 4. Motor de Diagnóstico Cognitivo (10 IDs Canónicos de CURRICULUM_AUDIT / Blueprint)
 * ========================================================================== */

export const DIAGNOSTIC_DEFINITIONS = Object.freeze({
  swapped_opposite_adjacent: {
    id: 'swapped_opposite_adjacent',
    category: 'conceptual',
    pose: 'sospecha',
    competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
    shortLabel: 'Intercambio de cateto opuesto y cateto adyacente respecto del ángulo',
    tag: 'Ojo con la referencia',
    message:
      'Invertiste el cateto opuesto y el adyacente. Parate exactamente en el vértice del ángulo que estás mirando: el cateto opuesto es el que queda enfrente, nunca el que toca al ángulo.',
  },
  used_sine_instead_of_cosine: {
    id: 'used_sine_instead_of_cosine',
    category: 'conceptual',
    pose: 'pensativa',
    competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
    shortLabel: 'Confusión entre sen (opuesto/hip) y cos (adyacente/hip)',
    tag: 'SOH vs CAH',
    message:
      'Usaste seno donde correspondía coseno (o al revés). Revisá los dos lados que intervienen: opuesto e hipotenusa piden SOH (seno); adyacente e hipotenusa piden CAH (coseno).',
  },
  calculator_rad_mode_for_degrees: {
    id: 'calculator_rad_mode_for_degrees',
    category: 'procedural',
    pose: 'lentes-brillo',
    competencyId: 'trig_ratios.right_triangle_sohcahtoa_and_pythagoras',
    shortLabel: 'Cálculo en modo RAD cuando el ángulo está en grados sexagesimales',
    tag: 'Modo RAD en vez de DEG',
    message:
      '¡Trampa clásica de calculadora! Ese número coincide con evaluar sen/cos/tg tomando el ángulo en radianes (modo RAD) cuando el problema estaba en grados (DEG).',
  },
  depression_measured_from_vertical: {
    id: 'depression_measured_from_vertical',
    category: 'conceptual',
    pose: 'unamused',
    competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
    shortLabel: 'Ángulo de depresión medido desde la vertical (90° − α) en vez de la horizontal',
    tag: 'Desde la horizontal',
    message:
      'Mediste la depresión desde la pared vertical (90° − α). Tanto la elevación como la depresión nacen siempre desde la línea horizontal de vista.',
  },
  added_instead_of_subtracted_cotangents: {
    id: 'added_instead_of_subtracted_cotangents',
    category: 'procedural',
    pose: 'colapso',
    competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
    shortLabel: 'Suma en vez de resta de distancias horizontales en doble observación',
    tag: 'Mismo lado vs lados opuestos',
    message:
      'En doble observación, si el observador retrocede del mismo lado, la distancia conocida es la resta d₂ − d₁ = h(cotg α − cotg β). Solo se suman cuando el objeto queda en el medio.',
  },
  forgot_unit_conversion_or_pythagoras_bridge: {
    id: 'forgot_unit_conversion_or_pythagoras_bridge',
    category: 'procedural',
    pose: 'evaluando',
    competencyId: 'trig_ratios.elevation_depression_and_indirect_measurement',
    shortLabel: 'Unidades mezcladas (km vs m) o aplicación de Pitágoras a un triángulo oblicuángulo',
    tag: 'Unidades o triángulo oblicuo',
    message:
      'Cuidado: verificá que todas las longitudes estén en la misma unidad (por ejemplo pasar km a metros) y recordá que si el ángulo no es de 90°, Pitágoras necesita la corrección −2ab·cos(γ).',
  },
  forgot_half_central_angle_polygon: {
    id: 'forgot_half_central_angle_polygon',
    category: 'conceptual',
    pose: 'lentes-brillo',
    competencyId: 'trig_ratios.polygons_chords_and_solids_geometry',
    shortLabel: 'Uso del ángulo central completo (360°/n) en vez de la mitad (180°/n)',
    tag: 'La mitad del ángulo central',
    message:
      'La apotema parte al triángulo isósceles en dos triángulos rectángulos iguales: adentro de cada uno entra la mitad del ángulo central (180°/n) y la mitad del lado (L/2).',
  },
  confused_apothem_with_radius: {
    id: 'confused_apothem_with_radius',
    category: 'conceptual',
    pose: 'sospecha',
    competencyId: 'trig_ratios.polygons_chords_and_solids_geometry',
    shortLabel: 'Confusión entre apotema (cateto con cos/tg) y radio circunscripto (hipotenusa)',
    tag: 'Apotema vs Radio',
    message:
      'Confundiste el radio circunscripto (que es la hipotenusa hasta el vértice) con la apotema (que es el cateto perpendicular al lado).',
  },
  inverted_pi_180_factor: {
    id: 'inverted_pi_180_factor',
    category: 'procedural',
    pose: 'colapso',
    competencyId: 'trig_ratios.angle_systems_and_arc_length',
    shortLabel: 'Factor de conversión invertido (180/π vs π/180)',
    tag: 'Factor invertido',
    message:
      'Diste vuelta el factor unitario: para pasar de grados a radianes multiplicás por π/180° (los grados se cancelan abajo); de radianes a grados, por 180°/π.',
  },
  plugged_degrees_directly_into_s_r_theta: {
    id: 'plugged_degrees_directly_into_s_r_theta',
    category: 'conceptual',
    pose: 'enojada',
    competencyId: 'trig_ratios.angle_systems_and_arc_length',
    shortLabel: 'Uso directo de grados en s = r·θ sin convertir a radianes',
    tag: 'θ siempre en radianes',
    message:
      '¡Frená! En la fórmula de longitud de arco s = r · θ, el ángulo θ debe estar obligatoriamente en radianes, jamás en grados sexagesimales.',
  },
});

function matchesExpected(userInput, context) {
  if (!context || context.expected === undefined || context.expected === null) return false;
  if (context.kind === 'angle') {
    return equivalentAngle(userInput, context.expected, {
      requireExactPi: Boolean(context.requireExactPi),
      defaultSystem: context.defaultSystem || 'deg',
      tolDeg: context.tolDeg ?? 0.05,
    }).equivalent;
  }
  if (context.kind === 'set' || context.kind === 'interval') {
    try {
      return equivalentSetExactas(userInput, context.expected);
    } catch {
      return false;
    }
  }
  return equivalentNumber(userInput, context.expected, context.tol ?? 0.05);
}

/**
 * Analiza una respuesta errónea para devolver uno de los 10 diagnósticos cognitivos o null.
 */
export function diagnoseTrigRatios(userInput, context = {}) {
  if (matchesExpected(userInput, context)) return null;

  let uNum = null;
  let uDeg = null;
  let uRad = null;
  try {
    uNum = parseNumberOrFraction(userInput);
  } catch {}
  try {
    const parsedAng = parseAngleAnswer(userInput, { defaultSystem: context.defaultSystem || 'deg' });
    uDeg = parsedAng.deg;
    uRad = parsedAng.rad;
  } catch {}

  const near = (a, b, tol = 0.25) => a !== null && b !== null && Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;

  // 1. RAD mode trap when angle is in degrees
  if (uNum !== null && context.angleDeg !== undefined && context.fn) {
    const a = context.angleDeg;
    let radModeVal = null;
    if (context.fn === 'sin') radModeVal = Math.sin(a);
    else if (context.fn === 'cos') radModeVal = Math.cos(a);
    else if (context.fn === 'tan') radModeVal = Math.tan(a);
    else if (context.fn === 'side_from_sin' && context.hyp) radModeVal = context.hyp * Math.sin(a);
    else if (context.fn === 'side_from_cos' && context.hyp) radModeVal = context.hyp * Math.cos(a);
    else if (context.fn === 'side_from_tan' && context.adj) radModeVal = context.adj * Math.tan(a);
    else if (context.fn === 'hyp_from_sin' && context.opp) radModeVal = context.opp / Math.sin(a);
    if (radModeVal !== null && near(uNum, radModeVal, Math.max(0.05, Math.abs(radModeVal) * 0.03))) {
      return DIAGNOSTIC_DEFINITIONS.calculator_rad_mode_for_degrees;
    }
  }

  // 2. Plugged degrees directly into s = r * theta
  if (context.target === 'arc_length' && uNum !== null && context.r !== undefined && context.angleDeg !== undefined) {
    const wrongArc = context.r * context.angleDeg;
    if (near(uNum, wrongArc, Math.max(0.2, Math.abs(wrongArc) * 0.03))) {
      return DIAGNOSTIC_DEFINITIONS.plugged_degrees_directly_into_s_r_theta;
    }
  }
  if (context.target === 'arc_radius' && uNum !== null && context.s !== undefined && context.angleDeg !== undefined) {
    const wrongRadius = context.s / context.angleDeg;
    if (near(uNum, wrongRadius, Math.max(0.05, Math.abs(wrongRadius) * 0.05))) {
      return DIAGNOSTIC_DEFINITIONS.plugged_degrees_directly_into_s_r_theta;
    }
  }

  // 3. Inverted pi / 180 factor
  if (context.target === 'deg_to_rad') {
    const degVal = context.deg;
    if (degVal !== undefined) {
      const invertedVal = (degVal * 180) / Math.PI;
      if (near(uNum, invertedVal, Math.max(0.5, Math.abs(invertedVal) * 0.05)) ||
          near(uRad, invertedVal, Math.max(0.5, Math.abs(invertedVal) * 0.05))) {
        return DIAGNOSTIC_DEFINITIONS.inverted_pi_180_factor;
      }
    }
  }
  if (context.target === 'rad_to_deg') {
    const radVal = context.rad;
    if (radVal !== undefined) {
      const invertedVal = (radVal * Math.PI) / 180;
      if (near(uNum, invertedVal, Math.max(0.005, Math.abs(invertedVal) * 0.05)) ||
          near(uDeg, invertedVal, Math.max(0.005, Math.abs(invertedVal) * 0.05))) {
        return DIAGNOSTIC_DEFINITIONS.inverted_pi_180_factor;
      }
    }
  }

  // 4. Forgot half central angle in polygon / chord
  if (context.target === 'polygon' && uNum !== null && context.n) {
    const fullThetaRad = degToRad(360 / context.n);
    const candidates = [];
    if (context.side) {
      const wrongAp = (context.side / 2) / Math.tan(fullThetaRad);
      const wrongApFull = context.side / Math.tan(fullThetaRad);
      const wrongR = (context.side / 2) / Math.sin(fullThetaRad);
      candidates.push(wrongAp, wrongApFull, wrongR);
    }
    if (context.radius) {
      candidates.push(context.radius * Math.cos(fullThetaRad), 2 * context.radius * Math.sin(fullThetaRad));
    }
    if (candidates.some((c) => near(uNum, c, Math.max(0.1, Math.abs(c) * 0.03)))) {
      return DIAGNOSTIC_DEFINITIONS.forgot_half_central_angle_polygon;
    }
  }

  // 5. Confused apothem with radius (or forgot sqrt in 3D diagonal)
  if (context.target === 'polygon' && uNum !== null) {
    if (context.wrongApothemAsRadius !== undefined && near(uNum, context.wrongApothemAsRadius, 0.2)) {
      return DIAGNOSTIC_DEFINITIONS.confused_apothem_with_radius;
    }
    if (context.altMetric !== undefined && near(uNum, context.altMetric, 0.2)) {
      return DIAGNOSTIC_DEFINITIONS.confused_apothem_with_radius;
    }
  }
  if (context.target === 'prism3d' && uNum !== null && context.baseDiagonal !== undefined) {
    if (near(uNum, context.baseDiagonal, 0.2) || (context.sumWithoutSqrt && near(uNum, context.sumWithoutSqrt, 0.5))) {
      return DIAGNOSTIC_DEFINITIONS.confused_apothem_with_radius;
    }
  }

  // 6. Depression measured from vertical (90 - alpha)
  if (context.target === 'elevation_depression' && context.height !== undefined && context.angleDeg !== undefined) {
    const compDeg = 90 - context.angleDeg;
    const compDist = context.height * Math.tan(degToRad(context.angleDeg));
    const compHyp = context.height / Math.cos(degToRad(context.angleDeg));
    if (uDeg !== null && near(uDeg, compDeg, 0.2)) {
      return DIAGNOSTIC_DEFINITIONS.depression_measured_from_vertical;
    }
    if (uNum !== null && (near(uNum, compDist, Math.max(0.2, compDist * 0.03)) || near(uNum, compHyp, Math.max(0.2, compHyp * 0.03)))) {
      return DIAGNOSTIC_DEFINITIONS.depression_measured_from_vertical;
    }
  }

  // 7. Added instead of subtracted cotangents (or vice versa) in double observation
  if (context.target === 'double_observation' && uNum !== null && context.wrongAddSubValue !== undefined) {
    if (near(uNum, context.wrongAddSubValue, Math.max(0.2, Math.abs(context.wrongAddSubValue) * 0.04))) {
      return DIAGNOSTIC_DEFINITIONS.added_instead_of_subtracted_cotangents;
    }
  }

  // 8. Forgot unit conversion (km vs m) or Pythagoras instead of Law of Cosines
  if (context.target === 'oblique_or_units' && uNum !== null) {
    if (context.unconvertedValue !== undefined && near(uNum, context.unconvertedValue, Math.max(0.5, Math.abs(context.unconvertedValue) * 0.03))) {
      return DIAGNOSTIC_DEFINITIONS.forgot_unit_conversion_or_pythagoras_bridge;
    }
    if (context.pythagorasMistake !== undefined && near(uNum, context.pythagorasMistake, Math.max(0.3, Math.abs(context.pythagorasMistake) * 0.03))) {
      return DIAGNOSTIC_DEFINITIONS.forgot_unit_conversion_or_pythagoras_bridge;
    }
  }

  // 9. Swapped opposite & adjacent (tan -> cot, or complement angle 90 - B)
  if (context.complementaryDeg !== undefined && uDeg !== null && near(uDeg, context.complementaryDeg, 0.2)) {
    return DIAGNOSTIC_DEFINITIONS.swapped_opposite_adjacent;
  }
  if (context.swappedRatioValue !== undefined && uNum !== null && near(uNum, context.swappedRatioValue, Math.max(0.05, Math.abs(context.swappedRatioValue) * 0.04))) {
    return DIAGNOSTIC_DEFINITIONS.swapped_opposite_adjacent;
  }

  // 10. Used sine instead of cosine (or vice versa)
  if (context.sineVsCosineValue !== undefined && uNum !== null && near(uNum, context.sineVsCosineValue, Math.max(0.05, Math.abs(context.sineVsCosineValue) * 0.04))) {
    return DIAGNOSTIC_DEFINITIONS.used_sine_instead_of_cosine;
  }

  return null;
}

/**
 * Unified pure validator for Unit 10 checks and generative retos.
 */
export function validateTrigRatiosAttempt({
  kind = 'number',
  input = '',
  expected,
  tol = 0.05,
  tolDeg = 0.05,
  tolRad = 1e-3,
  requireExactPi = false,
  defaultSystem = 'deg',
  diagContext = {},
} = {}) {
  const raw = String(input ?? '').trim();
  if (!raw) {
    return { ok: false, empty: true, syntaxError: null, needsExactPi: false, diagnostic: null };
  }

  if (kind === 'angle') {
    try {
      parseAngleAnswer(raw, { defaultSystem });
    } catch (err) {
      return {
        ok: false,
        empty: false,
        syntaxError: err.message || 'Formato angular inválido.',
        needsExactPi: false,
        diagnostic: null,
      };
    }
    const res = equivalentAngle(raw, expected, { tolDeg, tolRad, requireExactPi, defaultSystem });
    if (res.equivalent) {
      return { ok: true, empty: false, syntaxError: null, needsExactPi: false, diagnostic: null };
    }
    if (requireExactPi && res.approxMatch) {
      const diag = diagnoseTrigRatios(raw, { ...diagContext, kind, expected, tolDeg, requireExactPi, defaultSystem });
      return {
        ok: false,
        empty: false,
        syntaxError: null,
        needsExactPi: true,
        diagnostic: diag,
      };
    }
    const diag = diagnoseTrigRatios(raw, { ...diagContext, kind, expected, tolDeg, requireExactPi, defaultSystem });
    return { ok: false, empty: false, syntaxError: null, needsExactPi: false, diagnostic: diag };
  }

  if (kind === 'set' || kind === 'interval' || kind === 'set_or_interval' || kind === 'solution_set') {
    try {
      if (equivalentSetExactas(raw, expected)) {
        return { ok: true, empty: false, syntaxError: null, needsExactPi: false, diagnostic: null };
      }
      const diag = diagnoseTrigRatios(raw, { ...diagContext, kind: 'set', expected });
      return { ok: false, empty: false, syntaxError: null, needsExactPi: false, diagnostic: diag };
    } catch (err) {
      return {
        ok: false,
        empty: false,
        syntaxError: err.message || 'Notación de conjunto/intervalo inválida.',
        needsExactPi: false,
        diagnostic: null,
      };
    }
  }

  // number
  try {
    parseNumberOrFraction(raw);
  } catch {
    return {
      ok: false,
      empty: false,
      syntaxError: 'Formato numérico inválido. Usá enteros, decimales con coma/punto o fracciones.',
      needsExactPi: false,
      diagnostic: null,
    };
  }
  if (equivalentNumber(raw, expected, tol)) {
    return { ok: true, empty: false, syntaxError: null, needsExactPi: false, diagnostic: null };
  }
  const diag = diagnoseTrigRatios(raw, { ...diagContext, kind: 'number', expected, tol });
  return { ok: false, empty: false, syntaxError: null, needsExactPi: false, diagnostic: diag };
}

