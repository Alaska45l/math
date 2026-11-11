/**
 * Alaska Math Lab · Función Cuadrática, Factorización y Parábolas
 * Entrenador Contrastivo Infinito (PRNG Mulberry32 · 8 Familias) + 5 Trampas Clásicas de Examen
 */

import { h, clear, num, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { react as vnReact } from '../../core/vn.js';
import {
  fromPolynomial,
  fromCanonical,
  fromFactored,
  analyzeQuadratic,
  intersectParabolaLine,
  diagnoseQuad,
  equivalentQuadExpr,
  parseNumberOrFraction,
  parseOrderedPair,
  equivalentSetExactas,
  fmtNumClean,
} from './logic.js';
import { DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import { recordQuadAttempt } from './learning-adapter.js';
import { getCompetencyById } from './competencies-map.js';

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
    id: 'factor_trinomial',
    label: 'Factorización de trinomios',
    competencyId: 'quadratics.sum_product_factoring',
  },
  {
    id: 'convert_to_canonical',
    label: 'Completar el cuadrado y Canónica',
    competencyId: 'quadratics.completing_the_square',
  },
  {
    id: 'reconstruct_from_graph_or_data',
    label: 'Reconstrucción desde datos/gráfico',
    competencyId: 'quadratics.factored_form_and_symmetry',
  },
  {
    id: 'discriminant_parameter_k',
    label: 'Discriminante Δ y Parámetro k',
    competencyId: 'quadratics.discriminant_and_vieta',
  },
  {
    id: 'full_exactas_radiografia',
    label: 'Radiografía Exactas (Im, C⁺, C⁻, I↑)',
    competencyId: 'quadratics.full_analysis_exactas',
  },
  {
    id: 'solve_quadratic_equation',
    label: 'Resolución de ecuaciones cuadráticas',
    competencyId: 'quadratics.canonical_form_and_vertex',
  },
  {
    id: 'parabola_line_intersection',
    label: 'Intersección y Tangencia Parábola-Recta',
    competencyId: 'quadratics.parabola_line_tangency',
  },
  {
    id: 'optimization_context',
    label: 'Optimización de extremos en contexto',
    competencyId: 'quadratics.extremum_optimization',
  },
];

function _generateQuadChallengeRaw(seed, forcedType = 'all', problemIndex = 0) {
  let rng;
  let typeObj;

  const isAll = !forcedType || forcedType === 'all' || forcedType === 'aleatorio';

  if (isAll) {
    if (problemIndex === 0) {
      rng = mulberry32(seed >>> 0);
      typeObj = randChoice(rng, CHALLENGE_TYPES);
    } else {
      const baseRng = mulberry32(seed >>> 0);
      const baseIndex = Math.floor(baseRng() * CHALLENGE_TYPES.length);
      const chosenIndex = (baseIndex + problemIndex) % CHALLENGE_TYPES.length;
      typeObj = CHALLENGE_TYPES[chosenIndex];
      const subSeed = (seed + problemIndex * 7919 + 1013) >>> 0;
      rng = mulberry32(subSeed);
    }
  } else {
    typeObj = CHALLENGE_TYPES.find((t) => t.id === forcedType) || CHALLENGE_TYPES[0];
    if (problemIndex === 0) {
      rng = mulberry32(seed >>> 0);
    } else {
      const subSeed = (seed + problemIndex * 7919 + 1013) >>> 0;
      rng = mulberry32(subSeed);
    }
  }
  const type = typeObj.id;

  // 1. factor_trinomial
  if (type === 'factor_trinomial') {
    const a = randChoice(rng, [1, 1, 2, 3]);
    const r1 = randChoice(rng, [-5, -4, -3, -2, -1, 1, 2, 3, 4]);
    let r2 = randChoice(rng, [-6, -3, -2, 1, 2, 3, 5, 6]);
    if (r1 === r2) r2 += 1;
    const model = fromFactored({ a, x1: r1, x2: r2 });
    const prodAC = model.a * model.c;
    const m = -model.a * r1;
    const n = -model.a * r2;
    const mStr = m >= 0 ? `+${m}` : `${m}`;
    const nStr = n >= 0 ? `+${n}` : `${n}`;

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 1 · Factorización',
      prompt: `Escribí en forma factorizada el trinomio f(x) = ${model.forms.polynomial}:`,
      inputKind: 'expression',
      requireForm: 'factored',
      expected: model.forms.factored,
      placeholder: 'Ej: (x - 2)(x + 5) o 2(x - 1)(x + 3)',
      diagContext: { target: 'factor', a: model.a, b: model.b, c: model.c },
      hints: [
        `Pista 1 (Orientación): Mirá el coeficiente principal a = ${model.a}, el lineal b = ${model.b} y el término independiente c = ${model.c}. ${
          model.a === 1
            ? `Como a = 1, buscás dos números enteros m y n cuyo producto sea c = ${model.c} y cuya suma sea b = ${model.b}.`
            : `Como a = ${model.a} ≠ 1, podés buscar las raíces x₁ y x₂ y armar a·(x − x₁)·(x − x₂) sin olvidarte del factor ${model.a} adelante.`
        }`,
        `Pista 2 (Paso intermedio): ${
          model.a === 1
            ? `Los factores que multiplicados dan ${model.c} y sumados dan ${model.b} son ${-r1} y ${-r2}, por lo que las raíces son x₁ = ${r1} y x₂ = ${r2}.`
            : `El producto maestro a·c vale ${prodAC} y la suma b vale ${model.b}. Los dos enteros que multiplicados dan ${prodAC} y sumados dan ${model.b} son m = ${m} y n = ${n}; descomponé el término central ${model.b}x en (${mStr}x ${nStr}x) y agrupá por parejas.`
        }`,
        `Pista 3 (Remate): ${
          model.a === 1
            ? `Escribí el producto de los dos binomios (x − x₁)·(x − x₂) invirtiendo el signo de cada raíz al ubicarla dentro de su paréntesis.`
            : `Tras agrupar por parejas y extraer los factores comunes, asegurate de que el coeficiente principal a = ${model.a} quede multiplicando adelante de la forma factorizada.`
        }`,
      ],
      explanation: `Las raíces de ${model.forms.polynomial} son x₁ = ${model.roots[0]} y x₂ = ${model.roots[1]}. Multiplicando por el coeficiente principal a = ${model.a}, la forma factorizada exacta es ${model.forms.factored}.`,
    };
  }

  // 2. convert_to_canonical
  if (type === 'convert_to_canonical') {
    const a = randChoice(rng, [1, 1, -1, 2, 3]);
    const xv = randChoice(rng, [-4, -3, -2, -1, 1, 2, 3, 4]);
    const yv = randChoice(rng, [-7, -5, -4, -2, 1, 3, 5, 8]);
    const model = fromCanonical({ a, xv, yv });
    const halfLinear = fmtNumClean(model.b / (2 * model.a));
    const sqAdd = fmtNumClean((model.b / (2 * model.a)) ** 2);

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 2 · Completar el Cuadrado',
      prompt: `Completá el cuadrado y escribí en forma canónica la función f(x) = ${model.forms.polynomial}:`,
      inputKind: 'expression',
      requireForm: 'canonical',
      expected: model.forms.canonical,
      placeholder: 'Ej: (x - 3)^2 - 7 o 2(x + 1)^2 - 5',
      diagContext: {
        target: 'canonical',
        a: model.a,
        b: model.b,
        c: model.c,
        xv: model.vertex.xv,
        yv: model.vertex.yv,
      },
      hints: [
        `Pista 1 (Orientación): En f(x) = ${model.forms.polynomial}, tenés a = ${model.a} y b = ${model.b}. La abscisa del vértice vive en xᵥ = −b / (2a).`,
        `Pista 2 (Paso intermedio): Al dividir b/a = ${fmtNumClean(model.b / model.a)} por 2 obtenés ${halfLinear}. Sumando y restando (${halfLinear})² = ${sqAdd} adentro del corchete formás el cuadrado (x ${xv > 0 ? '− ' + xv : '+ ' + Math.abs(xv)})².`,
        `Pista 3 (Remate): Con el vértice V(${xv}; ${yv}) y el coeficiente a = ${model.a}, armá el molde canónico a·(x − xᵥ)² + yᵥ invirtiendo el signo de xᵥ dentro del binomio al cuadrado y manteniendo el signo de yᵥ afuera.`,
      ],
      explanation: `Al completar el cuadrado en ${model.forms.polynomial}, el eje de simetría queda en xᵥ = ${xv} y la altura del vértice es f(${xv}) = ${yv}, resultando f(x) = ${model.forms.canonical}.`,
    };
  }

  // 3. reconstruct_from_graph_or_data
  if (type === 'reconstruct_from_graph_or_data') {
    const subMode = randChoice(rng, ['vertex_point', 'roots_yint']);
    if (subMode === 'vertex_point') {
      const a = randChoice(rng, [-2, -1, 1, 2, 3]);
      const xv = randChoice(rng, [-3, -2, -1, 1, 2, 3]);
      const yv = randChoice(rng, [-4, -2, 1, 3, 5]);
      const dx = randChoice(rng, [1, 2]);
      const px = xv + dx;
      const py = a * dx * dx + yv;
      const model = fromCanonical({ a, xv, yv });

      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 3 · Reconstrucción Analítica',
        prompt: `Hallá la fórmula de la función cuadrática cuyo vértice es V(${xv}; ${yv}) y cuya gráfica pasa por el punto P(${px}; ${py}):`,
        inputKind: 'expression',
        requireForm: null,
        expected: model.forms.canonical,
        placeholder: 'Ej: 2(x - 1)^2 - 3',
        diagContext: {
          target: 'canonical',
          a: model.a,
          b: model.b,
          c: model.c,
          xv,
          yv,
        },
        hints: [
          `Pista 1 (Orientación): Como te dan las coordenadas del vértice V(${xv}; ${yv}), arrancá planteando el molde canónico f(x) = a·(x ${xv > 0 ? '− ' + xv : '+ ' + Math.abs(xv)})² ${yv >= 0 ? '+ ' + yv : '− ' + Math.abs(yv)}.`,
          `Pista 2 (Paso intermedio): Reemplazá las coordenadas del punto P(${px}; ${py}) en x y en f(x): ${py} = a·(${px} − (${xv}))² + (${yv}), es decir, ${py} = a·${dx * dx} + (${yv}).`,
          `Pista 3 (Remate): Despejá el coeficiente a resolviendo la cuenta (${py} ${yv >= 0 ? '− ' + yv : '+ ' + Math.abs(yv)}) / ${dx * dx} y colócalo adelante en el molde canónico con vértice V(${xv}; ${yv}) para escribir la función.`,
        ],
        explanation: `Usando el molde canónico con V(${xv}; ${yv}) y evaluando en P(${px}; ${py}) despejamos a = ${a}, obteniendo f(x) = ${model.forms.canonical} (o ${model.forms.polynomial}).`,
      };
    }

    const a = randChoice(rng, [-2, -1, 2, 3]);
    const r1 = randChoice(rng, [-4, -3, -2, -1]);
    const r2 = randChoice(rng, [1, 2, 3, 4]);
    const model = fromFactored({ a, x1: r1, x2: r2 });
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 3 · Reconstrucción Analítica',
      prompt: `Hallá la expresión de la parábola cuyas raíces son x₁ = ${r1} y x₂ = ${r2} y cuya ordenada al origen es f(0) = ${model.c}:`,
      inputKind: 'expression',
      requireForm: null,
      expected: model.forms.factored,
      placeholder: 'Ej: -2(x + 1)(x - 3)',
      diagContext: { target: 'factor', a: model.a, b: model.b, c: model.c },
      hints: [
        `Pista 1 (Orientación): Conociendo las dos raíces x₁ = ${r1} y x₂ = ${r2}, planteá el molde factorizado f(x) = a·(x + ${Math.abs(r1)})·(x − ${r2}). ¡No asumas que a vale 1!`,
        `Pista 2 (Paso intermedio): La ordenada al origen es el punto (0; ${model.c}). Reemplazá x = 0: ${model.c} = a·(0 + ${Math.abs(r1)})·(0 − ${r2}) = a·(${r1 * r2}).`,
        `Pista 3 (Remate): Despejá el coeficiente a dividiendo la ordenada al origen ${model.c} por el producto de raíces (${r1 * r2}) y colócalo multiplicando al frente del molde a·(x − x₁)·(x − x₂).`,
      ],
      explanation: `Planteando f(x) = a(x + ${Math.abs(r1)})(x − ${r2}) y evaluando en (0; ${model.c}) resulta a = ${a}, por lo que f(x) = ${model.forms.factored}.`,
    };
  }

  // 4. discriminant_parameter_k
  if (type === 'discriminant_parameter_k') {
    const a = randChoice(rng, [1, 2, 3]);
    const r0 = randChoice(rng, [-4, -3, -2, 2, 3, 4]);
    const b = -2 * a * r0;
    const kVal = a * r0 * r0;
    const bSign = b >= 0 ? `+ ${b}x` : `− ${Math.abs(b)}x`;

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 4 · Discriminante y Parámetros',
      prompt: `¿Qué valor debe tomar el parámetro real k para que la ecuación ${a === 1 ? '' : a}x² ${bSign} + k = 0 tenga una única raíz real doble?`,
      inputKind: 'number',
      expected: kVal,
      placeholder: 'Ej: 9',
      diagContext: { target: 'discriminant', a, b, c: kVal },
      hints: [
        `Pista 1 (Orientación): Una ecuación cuadrática tiene raíz real única (raíz doble) exactamente cuando su discriminante vale cero: Δ = b² − 4·a·c = 0.`,
        `Pista 2 (Paso intermedio): Acá tenés a = ${a}, b = ${b} y c = k. Armá la ecuación (${b})² − 4·(${a})·k = 0, que equivale a ${b * b} − ${4 * a}k = 0.`,
        `Pista 3 (Remate): De la igualdad obtenida en el paso anterior, despejá el parámetro k dividiendo el término constante por el coeficiente que acompaña a k para hallar el valor numérico.`,
      ],
      explanation: `Imponiendo la condición de raíz doble Δ = (${b})² − 4·(${a})·k = ${b * b} − ${4 * a}k = 0, despejamos k = ${kVal} (con lo cual la raíz doble queda en x = ${r0}).`,
    };
  }

  // 5. full_exactas_radiografia
  if (type === 'full_exactas_radiografia') {
    const a = randChoice(rng, [-2, -1, 1, 2]);
    const r1 = randChoice(rng, [-4, -3, -2, -1]);
    const r2 = randChoice(rng, [1, 2, 3, 5]);
    // Asegurar xv entero parando r1 y r2 con igual paridad
    const adjR2 = (r1 + r2) % 2 !== 0 ? r2 + 1 : r2;
    const ana = analyzeQuadratic(fromFactored({ a, x1: r1, x2: adjR2 }));
    const subTarget = randChoice(rng, ['image', 'CPlus', 'CMinus', 'increasing']);

    const labels = {
      image: {
        q: `Determiná el conjunto Imagen Im(f) de la función f(x) = ${ana.forms.canonical}:`,
        ans: ana.image,
        target: 'image',
        h1: `Pista 1 (Orientación): La Imagen se lee sobre el eje vertical Y a partir de la altura del vértice yᵥ = ${ana.vertex.yv}, mirando hacia dónde abren las ramas según el signo de a = ${ana.a}.`,
        h2: `Pista 2 (Paso intermedio): Como a = ${ana.a} ${ana.a > 0 ? '> 0, el vértice es un piso mínimo y las alturas van desde yᵥ hacia +∞' : '< 0, el vértice es un techo máximo y las alturas vienen desde −∞ hasta yᵥ'}.`,
        h3: `Pista 3 (Remate): ${
          ana.a > 0
            ? `Armá el intervalo desde el piso mínimo ${ana.vertex.yv} (con corchete cerrado) hacia +inf (con paréntesis abierto), separando con punto y coma.`
            : `Armá el intervalo desde -inf (con paréntesis abierto) hasta el techo máximo ${ana.vertex.yv} (con corchete cerrado), separando con punto y coma.`
        }`,
      },
      CPlus: {
        q: `Hallá el conjunto de positividad C⁺ de f(x) = ${ana.forms.polynomial} (sabiendo que sus raíces son x₁ = ${r1} y x₂ = ${adjR2}):`,
        ans: ana.CPlus,
        target: 'CPlus',
        h1: `Pista 1 (Orientación): El conjunto de positividad C⁺ son los tramos del eje X donde la parábola está estrictamente por encima del eje X (f(x) > 0).`,
        h2: `Pista 2 (Paso intermedio): Las raíces x₁ = ${r1} y x₂ = ${adjR2} parten al eje X en tres zonas. Como a = ${ana.a} ${ana.a > 0 ? '> 0 (ramas hacia arriba), la curva es positiva afuera de las raíces' : '< 0 (ramas hacia abajo), la curva es positiva entre las dos raíces'}.`,
        h3: `Pista 3 (Remate): ${
          ana.a > 0
            ? "Uní los dos intervalos exteriores con 'U': desde -inf hasta la raíz menor y desde la mayor hasta +inf, usando paréntesis abiertos en todos los extremos."
            : `Escribí el intervalo abierto acotado entre ambas raíces (${r1} y ${adjR2}) separado por punto y coma, sin incluir los extremos.`
        }`,
      },
      CMinus: {
        q: `Hallá el conjunto de negatividad C⁻ de f(x) = ${ana.forms.polynomial} (sabiendo que sus raíces son x₁ = ${r1} y x₂ = ${adjR2}):`,
        ans: ana.CMinus,
        target: 'CMinus',
        h1: `Pista 1 (Orientación): El conjunto de negatividad C⁻ son los tramos del eje X donde el dibujo queda por debajo del eje X (f(x) < 0).`,
        h2: `Pista 2 (Paso intermedio): Mirá la concavidad: como a = ${ana.a} ${ana.a > 0 ? '> 0, la panza que se hunde bajo el eje X es el tramo central entre las dos raíces' : '< 0, las dos ramas que caen bajo el eje X están hacia los costados exteriores de las raíces'}.`,
        h3: `Pista 3 (Remate): ${
          ana.a > 0
            ? `Escribí el intervalo abierto acotado entre ambas raíces (${r1} y ${adjR2}) separado por punto y coma, ya que allí la curva se hunde bajo el eje X.`
            : "Uní los dos tramos exteriores con 'U': desde -inf hasta la raíz menor y desde la mayor hasta +inf, con paréntesis abiertos."
        }`,
      },
      increasing: {
        q: `Indicá el intervalo de crecimiento I↑ de la función f(x) = ${ana.forms.canonical}:`,
        ans: ana.increasingInterval,
        target: 'increasing',
        h1: `Pista 1 (Orientación): Los intervalos de crecimiento y decrecimiento se leen SIEMPRE en el eje horizontal X quebrando en la abscisa del vértice xᵥ = ${ana.vertex.xv} (¡nunca uses la altura yᵥ = ${ana.vertex.yv}!).`,
        h2: `Pista 2 (Paso intermedio): Caminando de izquierda a derecha sobre la curva con a = ${ana.a}, ${ana.a > 0 ? `bajás hasta xᵥ = ${ana.vertex.xv} y subís a partir de xᵥ = ${ana.vertex.xv} hacia la derecha` : `subís desde −∞ hasta alcanzar la cumbre en xᵥ = ${ana.vertex.xv}`}.`,
        h3: `Pista 3 (Remate): ${
          ana.a > 0
            ? `El crecimiento empieza en la abscisa del vértice xᵥ = ${ana.vertex.xv} y continúa hacia la derecha: armá el intervalo con corchete cerrado en ${ana.vertex.xv} y paréntesis abierto en +inf.`
            : `La curva crece desde la izquierda hasta llegar a la cumbre en xᵥ = ${ana.vertex.xv}: armá el intervalo con paréntesis abierto en -inf y corchete cerrado en ${ana.vertex.xv}.`
        }`,
      },
    };

    const chosen = labels[subTarget];
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 5 · Radiografía Completa',
      prompt: chosen.q,
      inputKind: 'set',
      expected: chosen.ans,
      placeholder: 'Ej: [-4; +inf) o (-inf; -1) U (3; +inf)',
      diagContext: {
        target: chosen.target,
        a: ana.a,
        b: ana.b,
        c: ana.c,
        xv: ana.vertex.xv,
        yv: ana.vertex.yv,
      },
      hints: [chosen.h1, chosen.h2, chosen.h3],
      explanation: `Para f(x) = ${ana.forms.canonical} con vértice V(${ana.vertex.xv}; ${ana.vertex.yv}) y raíces en ${r1} y ${adjR2}, el resultado exacto es ${chosen.ans}.`,
    };
  }

  // 6. solve_quadratic_equation
  if (type === 'solve_quadratic_equation') {
    const subKind = randChoice(rng, ['incomplete_bx', 'canonical_eq']);
    if (subKind === 'incomplete_bx') {
      const a = randChoice(rng, [1, 2, 3]);
      const rNonZero = randChoice(rng, [-6, -5, -4, -3, 3, 4, 5, 6]);
      const model = fromFactored({ a, x1: 0, x2: rNonZero });
      const ansSet = rNonZero < 0 ? `{${rNonZero}; 0}` : `{0; ${rNonZero}}`;

      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 6 · Ecuaciones Cuadráticas',
        prompt: `Hallá el conjunto solución completo (entre llaves) de la ecuación cuadrática incompleta ${model.forms.polynomial} = 0:`,
        inputKind: 'set',
        expected: ansSet,
        placeholder: 'Ej: {0; 4}',
        diagContext: { target: 'roots', a: model.a, b: model.b, c: 0 },
        hints: [
          `Pista 1 (Orientación): ¡Prohibido pasar el término lineal al otro lado y dividir por x! Si tachás la x, perdés una solución. El camino limpio es extraer factor común x.`,
          `Pista 2 (Paso intermedio): Al sacar factor común te queda ${model.forms.factored} = 0. Por propiedad del producto cero, igualás cada factor a cero por separado.`,
          `Pista 3 (Remate): Igualá cada factor a cero: de la x extraída surge la primera raíz nula y del paréntesis despejás la segunda; luego agrupá ambas soluciones entre llaves { ... } separadas por punto y coma.`,
        ],
        explanation: `Extrayendo factor común en ${model.forms.polynomial} = 0 obtenemos ${model.forms.factored} = 0, cuyas dos raíces son x = 0 y x = ${rNonZero}: conjunto solución ${ansSet}.`,
      };
    }

    const a = randChoice(rng, [1, 2]);
    const xv = randChoice(rng, [-3, -2, 1, 2, 3]);
    const dist = randChoice(rng, [2, 3, 4]);
    const yv = -a * dist * dist;
    const model = fromCanonical({ a, xv, yv });
    const r1 = xv - dist;
    const r2 = xv + dist;
    const ansSet = `{${r1}; ${r2}}`;

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 6 · Ecuaciones Cuadráticas',
      prompt: `Despejá directamente desde la forma canónica y escribí el conjunto de raíces (entre llaves) de ${model.forms.canonical} = 0:`,
      inputKind: 'set',
      expected: ansSet,
      placeholder: 'Ej: {-1; 5}',
      diagContext: { target: 'roots', a: model.a, b: model.b, c: model.c, xv, yv },
      hints: [
        `Pista 1 (Orientación): No hace falta expandir el cuadrado. Pasá el término constante ${yv} al otro miembro y dividí por a = ${a} para dejar solo al cuadrado: (x ${xv > 0 ? '− ' + xv : '+ ' + Math.abs(xv)})² = ${dist * dist}.`,
        `Pista 2 (Paso intermedio): Al aplicar raíz cuadrada en ambos lados, recordá que √(u²) = |u|: te queda x ${xv > 0 ? '− ' + xv : '+ ' + Math.abs(xv)} = ±${dist}.`,
        `Pista 3 (Remate): Resolvé los dos caminos del módulo x = ${xv} − ${dist} y x = ${xv} + ${dist}, y escribí ambas raíces dentro de llaves { ... } ordenadas y separadas por punto y coma.`,
      ],
      explanation: `Despejando (x − (${xv}))² = ${dist * dist} y aplicando módulo |x − (${xv})| = ${dist}, resultan x₁ = ${r1} y x₂ = ${r2}: conjunto solución ${ansSet}.`,
    };
  }

  // 7. parabola_line_intersection
  if (type === 'parabola_line_intersection') {
    const xTan = randChoice(rng, [-3, -2, -1, 1, 2, 3]);
    const b = randChoice(rng, [-2, 0, 2, 4]);
    const m = randChoice(rng, [-2, 1, 2, 4]);
    // Para que sea tangente en xTan con a = 1: (b - m) / (-2) = xTan => b - m = -2*xTan
    const adjustedM = b + 2 * xTan;
    const c = randChoice(rng, [1, 2, 3, 5]);
    // c - d = xTan^2 => d = c - xTan^2
    const dTan = c - xTan * xTan;
    const yTan = adjustedM * xTan + dTan;
    const polyStr = fromPolynomial({ a: 1, b, c }).forms.polynomial;
    const lineStr = `${adjustedM === 1 ? '' : adjustedM === -1 ? '-' : adjustedM}x ${
      dTan >= 0 ? '+ ' + dTan : '− ' + Math.abs(dTan)
    }`;

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 7 · Sistemas Parábola-Recta',
      prompt: `La recta g(x) = ${lineStr} es tangente a la parábola f(x) = ${polyStr}. Hallá las coordenadas del punto de tangencia como par ordenado (x; y):`,
      inputKind: 'pair',
      expected: `(${xTan}; ${yTan})`,
      placeholder: 'Ej: (2; 5)',
      diagContext: { target: 'intersection', a: 1, b: b - adjustedM, c: c - dTan },
      hints: [
        `Pista 1 (Orientación): Igualá la parábola con la recta (${polyStr} = ${lineStr}) y pasá todos los términos al primer miembro para armar la ecuación diferencia f(x) − g(x) = 0.`,
        `Pista 2 (Paso intermedio): Al restar te queda x² ${
          b - adjustedM >= 0 ? '+ ' + (b - adjustedM) : '− ' + Math.abs(b - adjustedM)
        }x + ${xTan * xTan} = 0, que es el trinomio cuadrado perfecto (x ${
          xTan > 0 ? '− ' + xTan : '+ ' + Math.abs(xTan)
        })² = 0, así que el contacto ocurre en x = ${xTan}.`,
        `Pista 3 (Remate): Calculá la coordenada y evaluando x = ${xTan} en la recta (${adjustedM}·(${xTan}) ${dTan >= 0 ? '+ ' + dTan : '− ' + Math.abs(dTan)}) y escribí el punto de tangencia como par ordenado (x; y).`,
      ],
      explanation: `Al igualar f(x) = g(x) obtenemos (x − (${xTan}))² = 0 (Δ_int = 0). Evaluando en x = ${xTan} obtenemos y = ${yTan}, por lo que el único punto de contacto es (${xTan}; ${yTan}).`,
    };
  }

  // 8. optimization_context
  const halfPerim = randChoice(rng, [12, 16, 20, 24, 30]);
  const xv = halfPerim / 2;
  const maxArea = xv * xv;
  return {
    seed,
    type: 'optimization_context',
    competencyId: 'quadratics.extremum_optimization',
    badge: 'Familia 8 · Optimización en Contexto',
    prompt: `Se dispone de ${halfPerim * 2} metros de alambre para cercar los cuatro lados de una huerta rectangular de base x. El área en función de la base es A(x) = x·(${halfPerim} − x) = −x² + ${halfPerim}x. ¿Cuál es el área máxima (en m²) que puede encerrarse?`,
    inputKind: 'number',
    expected: maxArea,
    placeholder: 'Ej: 64',
    diagContext: { target: 'yv', a: -1, b: halfPerim, c: 0, xv, yv: maxArea },
    hints: [
      `Pista 1 (Orientación): La función de área A(x) = −x² + ${halfPerim}x es una parábola con a = −1 < 0 (abre hacia abajo), por lo que alcanza su área máxima en el vértice (xᵥ; yᵥ).`,
      `Pista 2 (Paso intermedio): Las raíces de A(x) = x·(${halfPerim} − x) son x₁ = 0 y x₂ = ${halfPerim}. Por simetría, la base óptima que maximiza el área está en el punto medio xᵥ = ${halfPerim} / 2 = ${xv} m.`,
      `Pista 3 (Remate): ¡Atención! La pregunta pide el área máxima yᵥ, no la base xᵥ. Calculá el valor numérico del área evaluando A(${xv}) = ${xv}·(${halfPerim} − ${xv}).`,
    ],
    explanation: `El vértice de A(x) = −x² + ${halfPerim}x se alcanza cuando la base mide xᵥ = ${xv} m (un cuadrado perfecto de ${xv} × ${xv}), entregando un área máxima de yᵥ = ${maxArea} m².`,
  };
}

export function generateQuadChallenge(seed, forcedType = 'all', problemIndex = 0) {
  const ch = _generateQuadChallengeRaw(seed, forcedType, problemIndex);
  const compDef = getCompetencyById(ch.competencyId);
  return {
    ...ch,
    seed,
    problemIndex,
    totalProblems: 8,
    family: ch.family || ch.type,
    prerequisiteIds: ch.prerequisiteIds || (compDef?.prerequisiteIds ? [...compDef.prerequisiteIds] : []),
    representation: ch.representation || 'symbolic',
    difficulty: ch.difficulty || 2,
    stage: ch.stage || 'transfer',
    transferDistance: ch.transferDistance || 'near',
    diagnosticIds: ch.diagnosticIds || (compDef?.diagnosticIds ? [...compDef.diagnosticIds] : []),
  };
}

export function generateQuadChallenges(seed, forcedType = 'all', count = 8) {
  return Array.from({ length: count }, (_, i) => generateQuadChallenge(seed, forcedType, i));
}

export const TRAPS = [
  {
    id: 'trap-1-canonica-ordenada',
    title: 'Trampa 1 · La Ilusión de la Ordenada en Forma Canónica',
    subtitle: '¿Por qué f(x) = −5(x + 1)² − 6 NO corta al eje Y en −6 ni tiene vértice en (1; −6)?',
    competencyId: 'quadratics.canonical_form_and_vertex',
    diagnosticId: 'confused_c_with_canonical_k',
    wrongAttempt: {
      author: 'Resolución apresurada de parcial',
      steps: [
        'Miro f(x) = −5(x + 1)² − 6.',
        'Como adentro del paréntesis dice +1, anoto que la abscisa del vértice es xᵥ = 1.',
        'Como el número suelto al final es −6, digo que la ordenada al origen es f(0) = −6.',
      ],
    },
    correctResolution: {
      author: 'Lectura analítica paso a paso',
      steps: [
        'En la forma canónica a(x − xᵥ)² + yᵥ, el paréntesis (x + 1)² vale 0 recién cuando x = −1. Por lo tanto, el vértice real es V(−1; −6).',
        'El número −6 de afuera es la altura del vértice yᵥ, ¡no la ordenada al origen!',
        'Para hallar la ordenada al origen evaluamos x = 0: f(0) = −5·(0 + 1)² − 6 = −5·(1) − 6 = −11. Corta al eje Y en (0; −11).',
      ],
    },
    question:
      'En la función g(x) = 2(x − 3)² − 5, ¿cuál es el valor exacto de la ordenada al origen g(0)?',
    options: [
      {
        label: 'g(0) = 13, porque al evaluar x = 0 queda 2·(−3)² − 5 = 2·9 − 5 = 13.',
        correct: true,
        feedback:
          '¡Impecable! Desarrollaste el cuadrado con x = 0 y multiplicaste por el coeficiente principal antes de restar 5.',
      },
      {
        label: 'g(0) = −5, porque −5 es el término independiente que aparece suelto al final.',
        correct: false,
        diagnosticId: 'confused_c_with_canonical_k',
        feedback:
          '¡Caíste en la trampa! Ese −5 es la coordenada vertical del vértice yᵥ en x = 3, no la altura en x = 0.',
      },
      {
        label: 'g(0) = 4, porque hago (0 − 3)² − 5 = 9 − 5 = 4.',
        correct: false,
        diagnosticId: 'unbalanced_completing_square',
        feedback:
          'Evaluaste bien (−3)² = 9, pero te olvidaste de multiplicarlo por el coeficiente principal a = 2 que multiplica al paréntesis.',
      },
    ],
  },
  {
    id: 'trap-2-tachar-x',
    title: 'Trampa 2 · El Crimen Algebraico de «Tachar la x»',
    subtitle: 'Dividir por la incógnita vs. Extraer Factor Común en x² − 4x = 0',
    competencyId: 'quadratics.factored_form_and_symmetry',
    diagnosticId: 'divided_by_x_lost_zero_root',
    wrongAttempt: {
      author: 'Atajo ilegal («tachar la x»)',
      steps: [
        'Parto de x² − 4x = 0 y paso el 4x sumando: x² = 4x.',
        'Divido ambos lados por x (tacho una x de cada lado).',
        'Concluyo que la única solución de la ecuación es x = 4.',
      ],
    },
    correctResolution: {
      author: 'Factor común y Propiedad del Producto Cero',
      steps: [
        'Nunca podemos dividir por x sin saber si x vale 0, porque dividir por cero está prohibido y mata la solución x = 0.',
        'En x² − 4x = 0 extraemos factor común x: queda x · (x − 4) = 0.',
        'Por la propiedad del producto nulo, un producto da 0 si y solo si alguno de sus factores es 0: x₁ = 0 o x − 4 = 0 ⇒ x₂ = 4. Conjunto solución: {0; 4}.',
      ],
    },
    question:
      '¿Cuál es el conjunto solución completo de la ecuación 3x² + 12x = 0?',
    options: [
      {
        label: 'S = {−4; 0}, porque al factorizar 3x·(x + 4) = 0 se anula en x = 0 y en x = −4.',
        correct: true,
        feedback:
          '¡Exacto! Sacar factor común 3x deja a la vista los dos factores que hacen cero la expresión.',
      },
      {
        label: 'S = {−4}, porque paso 12x restando y divido ambos miembros por 3x.',
        correct: false,
        diagnosticId: 'divided_by_x_lost_zero_root',
        feedback:
          'Al dividir por 3x eliminaste de un plumazo la raíz x = 0, que verifica perfectamente 3(0)² + 12(0) = 0.',
      },
      {
        label: 'S = {0; 4}, porque de 3x(x + 4) = 0 leo las raíces con el mismo signo +4.',
        correct: false,
        diagnosticId: 'inverted_vertex_h_sign',
        feedback:
          'Sacaste bien el factor común, pero para que el paréntesis (x + 4) valga cero, x tiene que valer −4.',
      },
    ],
  },
  {
    id: 'trap-3-imagen-parabola-vs-exponencial',
    title: 'Trampa 3 · Imagen de Parábola vs. Imagen de Exponencial (Contraste Inter-Módulo)',
    subtitle: '¿Por qué la parábola f(x) = 2 − (x − 1)² lleva corchete cerrado (−∞; 2] y la exponencial g(x) = 2 − (1/2)ˣ lleva paréntesis abierto (−∞; 2)?',
    competencyId: 'quadratics.full_analysis_exactas',
    diagnosticId: 'used_yv_for_monotonicity_or_open_image',
    wrongAttempt: {
      author: 'Confusión de bordes en el eje Y',
      steps: [
        'Veo que tanto f(x) = 2 − (x − 1)² como g(x) = 2 − (1/2)ˣ tienen un tope superior en y = 2.',
        'Por costumbre del módulo de exponenciales, pongo paréntesis abierto en ambas: Im(f) = (−∞; 2).',
        'Además, digo que f crece en (−∞; 2) usando el 2 de la altura.',
      ],
    },
    correctResolution: {
      author: 'Contraste geométrico Vértice vs. Asíntota',
      steps: [
        'En la exponencial g(x) = 2 − (1/2)ˣ, el término (1/2)ˣ se acerca a 0 pero NUNCA vale 0: por eso y = 2 es una asíntota inalcanzable y su imagen es abierta (−∞; 2).',
        'En cambio, en la parábola f(x) = 2 − (x − 1)², cuando x = 1 el cuadrado (1 − 1)² SÍ vale exactamente 0 y la curva alcanza la altura f(1) = 2. Por eso el vértice se incluye con CORCHETE CERRADO: Im(f) = (−∞; 2].',
        'Y el intervalo de crecimiento de f se mira en el eje X hasta la abscisa del vértice xᵥ = 1: I↑ = (−∞; 1).',
      ],
    },
    question:
      'Para la función cuadrática h(x) = (x + 4)² − 3, ¿cuáles son su Imagen Im(h) y su intervalo de decrecimiento I↓?',
    options: [
      {
        label: 'Im(h) = [−3; +∞) con corchete cerrado en yᵥ = −3, e I↓ = (−∞; −4) mirando xᵥ = −4 en el eje X.',
        correct: true,
        feedback:
          '¡Brillante! Separaste el piso horizontal xᵥ = −4 para el decrecimiento y la altura vertical yᵥ = −3 con corchete cerrado para la imagen.',
      },
      {
        label: 'Im(h) = (−3; +∞) con paréntesis abierto, e I↓ = (−∞; −4).',
        correct: false,
        diagnosticId: 'used_yv_for_monotonicity_or_open_image',
        feedback:
          '¡Ojo! −3 no es una asíntota: cuando x = −4 la función vale exactamente h(−4) = −3, así que el −3 pertenece a la imagen y lleva corchete cerrado [−3; +∞).',
      },
      {
        label: 'Im(h) = [−3; +∞) e I↓ = (−∞; −3).',
        correct: false,
        diagnosticId: 'used_yv_for_monotonicity_or_open_image',
        feedback:
          'Metiste la altura yᵥ = −3 dentro del intervalo de decrecimiento. La monotonía siempre quiebra en la coordenada horizontal xᵥ = −4.',
      },
    ],
  },
  {
    id: 'trap-4-signos-resolvente',
    title: 'Trampa 4 · La Doble Emboscada de Signos en la Fórmula Resolvente',
    subtitle: 'Qué pasa con −b y con b² cuando el coeficiente lineal b es negativo (b = −6)',
    competencyId: 'quadratics.discriminant_and_vieta',
    diagnosticId: 'neg_b_or_square_sign_in_resolvente',
    wrongAttempt: {
      author: 'Hoja con doble tropiezo de signos en x² − 6x + 5 = 0',
      steps: [
        'Identifico a = 1, b = −6, c = 5 y reemplazo sin paréntesis en la resolvente.',
        'Escribo −6 ± √(−6² − 4·1·5) / 2 = −6 ± √(−36 − 20) / 2 = −6 ± √(−56) / 2.',
        'Como dentro de la raíz me quedó −56 negativo, digo que no tiene raíces reales.',
      ],
    },
    correctResolution: {
      author: 'Sustitución blindada con paréntesis',
      steps: [
        'En la fórmula (−b ± √(b² − 4ac)) / (2a), "−b" es el opuesto de b: como b = −6, adelante queda −(−6) = +6 positivo.',
        'Adentro de la raíz se eleva todo el número b al cuadrado con su signo: (−6)² = (−6)·(−6) = +36 positivo (jamás −36).',
        'El discriminante real es Δ = 36 − 20 = 16 > 0, y las raíces son (6 ± 4) / 2, dando x₁ = 1 y x₂ = 5.',
      ],
    },
    question:
      'Al aplicar la fórmula resolvente a la ecuación 2x² − 8x + 6 = 0 (donde a = 2, b = −8, c = 6), ¿cuál es el reemplazo correcto?',
    options: [
      {
        label: 'x = (8 ± √((−8)² − 4·2·6)) / (2·2) = (8 ± √(64 − 48)) / 4 = (8 ± 4) / 4.',
        correct: true,
        feedback:
          '¡Perfecto! Tanto el opuesto −(−8) = +8 como el cuadrado (−8)² = +64 quedaron con el signo positivo que les corresponde.',
      },
      {
        label: 'x = (−8 ± √(64 − 48)) / 4, porque copio el −8 tal cual viene en la ecuación.',
        correct: false,
        diagnosticId: 'neg_b_or_square_sign_in_resolvente',
        feedback:
          'Te olvidaste de que la fórmula tiene un signo menos propio delante de b: −(−8) se transforma en +8 positivo.',
      },
      {
        label: 'x = (8 ± √(−64 − 48)) / 4, porque −8 al cuadrado da −64.',
        correct: false,
        diagnosticId: 'neg_b_or_square_sign_in_resolvente',
        feedback:
          'Cualquier número real negativo multiplicado por sí mismo ((−8)·(−8)) da resultado positivo (+64).',
      },
    ],
  },
  {
    id: 'trap-5-falsa-cuadratica',
    title: 'Trampa 5 · La Falsa Cuadrática Disfrazada y el Cuadrado mal Distribuido',
    subtitle: 'El caso f(n) = 2(n − 1)² − 2n² y el peligro de expandir (2 − 3x)² como 4 − 9x²',
    competencyId: 'quadratics.area_model_and_notable_products',
    diagnosticId: 'distributed_square_over_sum',
    wrongAttempt: {
      author: 'Lectura superficial sin desarrollar el binomio',
      steps: [
        'Veo un exponente 2 en f(n) = 2(n − 1)² − 2n² y aseguro que es una función cuadrática.',
        'Además, distribuyo el cuadrado como 2(n² − 1) − 2n² = −2 y digo que es constante.',
      ],
    },
    correctResolution: {
      author: 'Desarrollo con doble producto y verificación de grado',
      steps: [
        'Primero desarrollamos el cuadrado del binomio con sus tres términos: (n − 1)² = n² − 2n + 1.',
        'Multiplicamos por el 2 de adelante y restamos 2n²: f(n) = 2(n² − 2n + 1) − 2n² = 2n² − 4n + 2 − 2n².',
        'Los términos cuadráticos +2n² y −2n² suman exactamente 0 (a = 0). Sobrevive f(n) = −4n + 2, que es una función lineal de pendiente −4, ¡no una parábola!',
      ],
    },
    question:
      'Si desarrollás la expresión h(x) = (2 − 3x)² − 9x², ¿qué tipo de función obtenés y cuál es su fórmula reducida?',
    options: [
      {
        label: 'Es una función lineal: como (2 − 3x)² = 4 − 12x + 9x², al restar 9x² se cancela el grado 2 y queda h(x) = −12x + 4.',
        correct: true,
        feedback:
          '¡Excelente ojo algebraico! El doble producto −12x sobrevive mientras que +9x² se cancela con −9x².',
      },
      {
        label: 'Es una función constante h(x) = 4, porque (2 − 3x)² es 4 + 9x² y se cancela con −9x².',
        correct: false,
        diagnosticId: 'distributed_square_over_sum',
        feedback:
          '¡Te comiste el doble producto del cuadrado del binomio! En (2 − 3x)² aparecen dos rectángulos de −6x que suman −12x.',
      },
      {
        label: 'Es una función cuadrática h(x) = −18x² − 12x + 4.',
        correct: false,
        diagnosticId: 'distributed_square_over_sum',
        feedback:
          'Ojo con el signo de (−3x)²: menos por menos da +9x² positivo, que al restarse con −9x² se anula a cero.',
      },
    ],
  },
];

function validateRetoAnswer(challenge, rawInput) {
  const trimmed = String(rawInput ?? '').trim();
  if (!trimmed) {
    return { ok: false, empty: true };
  }

  if (challenge.inputKind === 'number') {
    try {
      const val = parseNumberOrFraction(trimmed);
      const ok = Math.abs(val - Number(challenge.expected)) < 1e-6;
      return { ok };
    } catch {
      return { ok: false, syntaxError: 'Ingresá un número o fracción válida (ej: 9 o -3/2).' };
    }
  }

  if (challenge.inputKind === 'pair') {
    try {
      const userPair = parseOrderedPair(trimmed);
      const expPair = parseOrderedPair(challenge.expected);
      const ok =
        Math.abs(userPair.x - expPair.x) < 1e-6 &&
        Math.abs(userPair.y - expPair.y) < 1e-6;
      return { ok };
    } catch (err) {
      return { ok: false, syntaxError: err.message };
    }
  }

  if (challenge.inputKind === 'set') {
    try {
      const ok = equivalentSetExactas(trimmed, challenge.expected);
      return { ok };
    } catch (err) {
      return { ok: false, syntaxError: err.message };
    }
  }

  // Expression
  const eq = equivalentQuadExpr(trimmed, challenge.expected, challenge.requireForm || null);
  if (eq.status === 'syntax_error') {
    return { ok: false, syntaxError: eq.error };
  }
  if (eq.equivalent && !eq.sameForm) {
    return { ok: false, equivalentWrongForm: true, actualForm: eq.actualForm };
  }
  return { ok: eq.equivalent && eq.sameForm };
}

export function mountQuadraticRetos(root, { seed, vn } = {}) {
  if (!root) return;
  clear(root);

  const initialSeed = (typeof seed === 'number' && Number.isFinite(seed) ? seed : 202608) >>> 0;

  const state = {
    activeTab: 'prng',
    family: 'all',
    seed: initialSeed,
    problemIndex: 0,
    streak: 0,
    solvedCount: 0,
    hintIndex: 0,
    currentChallenge: null,
    problemsState: {},
    activeTrapIndex: 0,
  };

  const tabBtnPrng = h(
    'button',
    {
      type: 'button',
      class: 'pr-chip is-active',
    },
    [chalkIcon('spark', 15), ' Pestaña 1 · Entrenador Infinito (8 Familias PRNG)']
  );

  const tabBtnTraps = h(
    'button',
    {
      type: 'button',
      class: 'pr-chip',
    },
    [chalkIcon('warn', 15), ' Pestaña 2 · Las 5 Trampas Clásicas de Examen']
  );

  const tabsHeader = h('div', { class: 'pr-chip-row quad-retos-tabs' }, [
    tabBtnPrng,
    tabBtnTraps,
  ]);

  const prngPane = h('div', { class: 'quad-retos-pane' });
  const trapsPane = h('div', { class: 'quad-retos-pane', hidden: '' });

  // Construir Pestaña 1 (PRNG): Toolbar + Cascada vertical de 8 retos
  const seedInput = h('input', {
    type: 'number',
    min: '0',
    step: '1',
    value: String(state.seed),
    class: 'quad-seed-input',
    'aria-label': 'Semilla del generador',
    style: { width: '120px' },
  });

  const familySelect = h(
    'select',
    { 'aria-label': 'Familia de reto', class: 'quad-family-select' },
    [
      h('option', { value: 'all' }, 'Todas las familias (Aleatorio)'),
      ...CHALLENGE_TYPES.map((fam) => h('option', { value: fam.id }, fam.label)),
    ]
  );

  const seedField = h(
    'label',
    { class: 'exp-trainer-field' },
    h('span', null, 'Semilla PRNG'),
    seedInput
  );

  const familyField = h(
    'label',
    { class: 'exp-trainer-field exp-trainer-field--grow' },
    h('span', null, 'Modo / Familia de reto'),
    familySelect
  );

  const newSeedBtn = h(
    'button',
    { type: 'button', class: 'btn btn--ghost pr-btn pr-btn-secondary quad-new-batch-btn' },
    chalkIcon('reset', 15),
    ' ↻ Nueva Semilla (Semilla +1)'
  );

  const randomSeedBtn = h(
    'button',
    { type: 'button', class: 'btn btn--ghost pr-btn pr-btn-secondary quad-random-seed-btn' },
    chalkIcon('reset', 15),
    ' ↻ Semilla aleatoria'
  );

  const copySeedText = h('span', { class: 'copy-seed-text' }, ' Copiar semilla');
  const copySeedBtn = h(
    'button',
    {
      type: 'button',
      class: 'btn btn--ghost pr-btn pr-btn-secondary quad-copy-seed-btn',
      'aria-label': 'Copiar semilla al portapapeles',
      on: {
        click: () => {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(String(state.seed)).then(() => {
              copySeedText.textContent = ' Copiada';
              setTimeout(() => {
                copySeedText.textContent = ' Copiar semilla';
              }, 1500);
            }).catch(() => {});
          }
        },
      },
    },
    chalkIcon('bulb', 15),
    copySeedText
  );

  const toolbarBtns = h(
    'div',
    { class: 'exp-trainer-toolbar__btns' },
    newSeedBtn,
    randomSeedBtn,
    copySeedBtn
  );

  const seedBadge = h('span', { class: 'quad-seed-badge' });
  const solvedBadge = h('span', { class: 'quad-solved-badge' });
  const streakBadge = h('span', { class: 'quad-streak-badge' });

  const progressPill = h(
    'div',
    { class: 'exp-trainer-progress-pill quad-progress-pill' },
    'Semilla actual (',
    seedBadge,
    '): ',
    solvedBadge,
    ' · ',
    streakBadge
  );

  const toolbar = h(
    'div',
    { class: 'exp-trainer-toolbar quad-trainer-toolbar' },
    seedField,
    familyField,
    toolbarBtns,
    progressPill
  );

  const cascadeList = h('ol', {
    class: 'exp-challenges-cascade seq-check quad-challenges-cascade',
  });

  prngPane.append(toolbar, cascadeList);

  function updateProgressPill() {
    const solvedInSeed = [0, 1, 2, 3, 4, 5, 6, 7].filter(
      (i) => state.problemsState[`${state.seed}-${state.family}-${i}`]?.solved
    ).length;
    seedBadge.textContent = `Semilla #${state.seed}`;
    solvedBadge.textContent = `${solvedInSeed}/8 resueltos`;
    streakBadge.textContent = `Racha actual: ${state.streak}`;
    progressPill.replaceChildren(
      'Semilla actual (',
      seedBadge,
      '): ',
      solvedBadge,
      ' · ',
      streakBadge
    );
  }

  function createQuadChallengeCard(ch, problemIndex) {
    const pKey = `${state.seed}-${state.family}-${problemIndex}`;
    const pState = state.problemsState[pKey] || {
      hintIndex: 0,
      solutionRevealed: false,
      solved: false,
      isIndependent: false,
      userAnswer: '',
      hints: [],
      feedbackClass: '',
      feedbackText: '',
      feedbackNodes: null,
    };

    let hintIndex = pState.hintIndex || 0;
    let solutionRevealed = !!pState.solutionRevealed;

    const badgeEl = h('span', { class: 'exp-challenge-card__badge quad-reto-badge' }, `Reto #${problemIndex + 1}`);
    const familyEl = h('span', { class: 'exp-challenge-card__family' }, ch.badge || ch.type);
    const statusEl = h('span', { class: 'exp-challenge-card__status' }, 'Pendiente');

    const headerEl = h(
      'div',
      { class: 'exp-challenge-card__header' },
      badgeEl,
      familyEl,
      statusEl
    );

    const promptEl = h('p', { class: 'exp-challenge__prompt pr-challenge__prompt quad-reto-prompt' }, ch.prompt);

    const inputEl = h('input', {
      type: 'text',
      inputmode: 'text',
      autocomplete: 'off',
      class: 'pr-check-input quad-reto-input',
      placeholder: ch.placeholder || 'Tu respuesta...',
      'aria-label': 'Respuesta del desafío cuadrático',
      value: pState.userAnswer || '',
      style: { maxWidth: '360px' },
    });

    const previewEl = h(
      'p',
      { class: 'exp-check__preview pr-check__preview', 'aria-live': 'polite' },
      `Interpretado como: ${pState.userAnswer || '—'}`
    );

    const inputRow = h(
      'div',
      { class: 'exp-challenge-card__input-row' },
      h('label', { class: 'exp-control pr-control' }, h('span', null, 'Tu respuesta'), inputEl),
      previewEl
    );

    const verifyBtn = h(
      'button',
      { type: 'button', class: 'btn pr-btn pr-check-submit quad-reto-verify-btn' },
      chalkIcon('check', 15),
      ' Revisar'
    );

    const hintBtn = h(
      'button',
      { type: 'button', class: 'btn btn--ghost pr-btn pr-btn-secondary quad-reto-hint-btn' },
      chalkIcon('bulb', 15),
      ` Pista (${hintIndex}/3)`
    );

    const solutionBtn = h(
      'button',
      { type: 'button', class: 'btn btn--ghost pr-btn pr-btn-secondary quad-reto-solution-btn' },
      chalkIcon('book', 15),
      ' Ver solución paso a paso'
    );

    const actionsEl = h(
      'div',
      { class: 'exp-check__actions pr-check__actions quad-reto-actions' },
      verifyBtn,
      hintBtn,
      solutionBtn
    );

    const hintsBox = h('div', { class: 'exp-check__hints pr-check__hints quad-reto-hints', hidden: '' });
    const feedbackBox = h('div', {
      class: 'exp-check__feedback pr-check-feedback',
      role: 'status',
      'aria-live': 'polite',
    });
    const solutionBox = h('div', { class: 'exp-check__solution quad-reto-solution', hidden: '' });

    if (pState.hints && pState.hints.length > 0) {
      hintsBox.removeAttribute('hidden');
      pState.hints.forEach((hText) => {
        hintsBox.appendChild(h('div', { class: 'quad-hint-item' }, hText));
      });
      if (hintIndex >= ch.hints.length) {
        hintBtn.textContent = 'Todas las pistas desplegadas';
      }
    }

    if (pState.solved || solutionRevealed) {
      inputEl.disabled = true;
      verifyBtn.disabled = true;
      hintBtn.disabled = true;
      solutionBtn.disabled = true;
    }

    if (solutionRevealed) {
      statusEl.textContent = 'Resuelto (Con apoyo)';
      statusEl.className = 'exp-challenge-card__status is-solution';
      feedbackBox.className = 'exp-check__feedback pr-check-feedback is-ok is-solution';
      feedbackBox.replaceChildren(
        chalkIcon('spark', 14),
        h('strong', {}, ' Solución explicada: '),
        h('span', {}, ch.explanation)
      );
      solutionBox.removeAttribute('hidden');
      solutionBox.replaceChildren(
        chalkIcon('spark', 14),
        h('strong', {}, ' Solución explicada: '),
        h('p', {}, ch.explanation)
      );
    } else if (pState.solved && pState.feedbackNodes) {
      statusEl.textContent = pState.isIndependent ? 'Resuelto (Independiente)' : 'Resuelto (Con apoyo)';
      statusEl.className = `exp-challenge-card__status ${pState.isIndependent ? 'is-solved-indep' : 'is-solved-assisted'}`;
      feedbackBox.className = pState.feedbackClass || 'exp-check__feedback pr-check-feedback is-ok';
      feedbackBox.replaceChildren(...pState.feedbackNodes.map((n) => n.cloneNode(true)));
    } else if (pState.feedbackText) {
      feedbackBox.className = pState.feedbackClass || 'exp-check__feedback pr-check-feedback';
      feedbackBox.textContent = pState.feedbackText;
    }

    inputEl.addEventListener('input', () => {
      previewEl.textContent = `Interpretado como: ${inputEl.value.trim() || '—'}`;
    });

    solutionBtn.addEventListener('click', () => {
      playClick();
      solutionRevealed = true;
      inputEl.disabled = true;
      verifyBtn.disabled = true;
      hintBtn.disabled = true;
      solutionBtn.disabled = true;
      state.streak = 0;
      statusEl.textContent = 'Resuelto (Con apoyo)';
      statusEl.className = 'exp-challenge-card__status is-solution';

      if (ch.competencyId) {
        try {
          recordQuadAttempt({
            exerciseId: `quad-reto-${ch.type}-${problemIndex}`,
            competencyId: ch.competencyId,
            correct: true,
            mode: 'assisted',
            hintsUsed: hintIndex,
            solutionRevealed: true,
            diagnosticId: null,
            representation: ch.representation || 'symbolic',
            stage: ch.stage || 'transfer',
            transferDistance: ch.transferDistance || 'near',
          });
        } catch {}
      }

      feedbackBox.className = 'exp-check__feedback pr-check-feedback is-ok is-solution';
      feedbackBox.replaceChildren(
        chalkIcon('spark', 14),
        h('strong', {}, ' Solución explicada: '),
        h('span', {}, ch.explanation)
      );
      solutionBox.removeAttribute('hidden');
      solutionBox.replaceChildren(
        chalkIcon('spark', 14),
        h('strong', {}, ' Solución explicada: '),
        h('p', {}, ch.explanation)
      );
      state.problemsState[pKey] = {
        hintIndex,
        hints: state.problemsState[pKey]?.hints || [],
        solutionRevealed: true,
        solved: false,
        userAnswer: inputEl.value,
        feedbackClass: feedbackBox.className,
      };
      updateProgressPill();
    });

    hintBtn.addEventListener('click', () => {
      playClick();
      if (hintIndex < ch.hints.length) {
        hintsBox.removeAttribute('hidden');
        const p = h('div', { class: 'quad-hint-item' }, ch.hints[hintIndex]);
        hintsBox.appendChild(p);
        hintIndex += 1;
        hintBtn.textContent =
          hintIndex < ch.hints.length
            ? `Pista (${hintIndex}/${ch.hints.length})`
            : 'Todas las pistas desplegadas';

        if (!state.problemsState[pKey]) state.problemsState[pKey] = {};
        state.problemsState[pKey].hintIndex = hintIndex;
        if (!state.problemsState[pKey].hints) state.problemsState[pKey].hints = [];
        state.problemsState[pKey].hints.push(ch.hints[hintIndex - 1]);
      }
    });

    const onVerify = () => {
      if (solutionRevealed || inputEl.disabled) return;
      const res = validateRetoAnswer(ch, inputEl.value);
      if (res.empty) {
        feedbackBox.className = 'exp-check__feedback pr-check-feedback is-warn';
        feedbackBox.textContent = 'Escribí una expresión, número o intervalo antes de verificar.';
        return;
      }
      if (res.ok) {
        playSuccess();
        const isIndependent = hintIndex === 0 && !solutionRevealed;
        if (isIndependent) {
          state.streak += 1;
        }
        state.solvedCount += 1;
        inputEl.disabled = true;
        verifyBtn.disabled = true;
        hintBtn.disabled = true;
        solutionBtn.disabled = true;

        if (ch.competencyId) {
          try {
            recordQuadAttempt({
              exerciseId: `quad-reto-${ch.type}-${problemIndex}`,
              competencyId: ch.competencyId,
              correct: true,
              mode: isIndependent ? 'independent' : 'assisted',
              hintsUsed: hintIndex,
              solutionRevealed: false,
              diagnosticId: null,
              representation: ch.representation || 'symbolic',
              stage: ch.stage || 'transfer',
              transferDistance: ch.transferDistance || 'near',
            });
          } catch {}
        }

        card.classList.add('is-solved');
        statusEl.textContent = isIndependent ? 'Resuelto (Independiente)' : 'Resuelto (Con apoyo)';
        statusEl.className = `exp-challenge-card__status ${isIndependent ? 'is-solved-indep' : 'is-solved-assisted'}`;

        const masteryTag = isIndependent ? '[Logro Independiente]' : '[Logro Asistido]';
        feedbackBox.className = 'exp-check__feedback pr-check-feedback is-ok';
        feedbackBox.replaceChildren(
          chalkIcon(isIndependent ? 'spark' : 'bulb', 14),
          h('strong', {}, ` ¡Correcto! ${masteryTag} `),
          h('span', {}, ch.explanation)
        );

        state.problemsState[pKey] = {
          hintIndex,
          hints: state.problemsState[pKey]?.hints || [],
          solutionRevealed: false,
          solved: true,
          isIndependent,
          userAnswer: inputEl.value,
          feedbackClass: feedbackBox.className,
          feedbackNodes: Array.from(feedbackBox.childNodes).map((n) => n.cloneNode(true)),
        };

        updateProgressPill();

        if (isIndependent && STREAK_REACTIONS[state.streak]) {
          if (vn && typeof vn.react === 'function') {
            vn.react(STREAK_REACTIONS[state.streak].pose, STREAK_REACTIONS[state.streak].text);
          } else {
            vnReact(STREAK_REACTIONS[state.streak]);
          }
        }
        return;
      }

      playError();
      state.streak = 0;
      updateProgressPill();

      if (res.syntaxError) {
        feedbackBox.className = 'exp-check__feedback pr-check-feedback is-warn';
        feedbackBox.textContent = `Revisá el formato: ${res.syntaxError}`;
        state.problemsState[pKey] = {
          hintIndex,
          hints: state.problemsState[pKey]?.hints || [],
          solutionRevealed: false,
          solved: false,
          userAnswer: inputEl.value,
          feedbackClass: feedbackBox.className,
          feedbackText: feedbackBox.textContent,
        };
        return;
      }

      if (res.equivalentWrongForm) {
        if (ch.competencyId) {
          try {
            recordQuadAttempt({
              exerciseId: `quad-reto-${ch.type}-${problemIndex}`,
              competencyId: ch.competencyId,
              correct: false,
              mode: hintIndex > 0 ? 'assisted' : 'independent',
              hintsUsed: hintIndex,
              solutionRevealed: false,
              diagnosticId: 'forgot_leading_a_in_factored_form',
              representation: ch.representation || 'symbolic',
              stage: ch.stage || 'transfer',
              transferDistance: ch.transferDistance || 'near',
            });
          } catch {}
        }
        feedbackBox.className = 'exp-check__feedback pr-check-feedback is-warn';
        feedbackBox.textContent = DIAGNOSE_REACTIONS.equivalent_form.text;
        state.problemsState[pKey] = {
          hintIndex,
          hints: state.problemsState[pKey]?.hints || [],
          solutionRevealed: false,
          solved: false,
          userAnswer: inputEl.value,
          feedbackClass: feedbackBox.className,
          feedbackText: feedbackBox.textContent,
        };
        if (vn && typeof vn.react === 'function') {
          vn.react(DIAGNOSE_REACTIONS.equivalent_form.pose, DIAGNOSE_REACTIONS.equivalent_form.text);
        } else {
          vnReact(DIAGNOSE_REACTIONS.equivalent_form);
        }
        return;
      }

      const diag = diagnoseQuad(inputEl.value, ch.diagContext);
      if (diag) {
        if (ch.competencyId) {
          try {
            recordQuadAttempt({
              exerciseId: `quad-reto-${ch.type}-${problemIndex}`,
              competencyId: ch.competencyId,
              correct: false,
              mode: hintIndex > 0 ? 'assisted' : 'independent',
              hintsUsed: hintIndex,
              solutionRevealed: false,
              diagnosticId: diag.id || null,
              representation: ch.representation || 'symbolic',
              stage: ch.stage || 'transfer',
              transferDistance: ch.transferDistance || 'near',
            });
          } catch {}
        }
        feedbackBox.className = 'exp-check__feedback pr-check-feedback is-error';
        feedbackBox.textContent = diag.message;
        state.problemsState[pKey] = {
          hintIndex,
          hints: state.problemsState[pKey]?.hints || [],
          solutionRevealed: false,
          solved: false,
          userAnswer: inputEl.value,
          feedbackClass: feedbackBox.className,
          feedbackText: feedbackBox.textContent,
        };
        if (vn && typeof vn.react === 'function') {
          vn.react(diag.pose, diag.message);
        } else {
          vnReact({ pose: diag.pose, tag: diag.shortLabel || 'Diagnóstico', html: diag.message });
        }
      } else {
        if (ch.competencyId) {
          try {
            recordQuadAttempt({
              exerciseId: `quad-reto-${ch.type}-${problemIndex}`,
              competencyId: ch.competencyId,
              correct: false,
              mode: hintIndex > 0 ? 'assisted' : 'independent',
              hintsUsed: hintIndex,
              solutionRevealed: false,
              diagnosticId: null,
              representation: ch.representation || 'symbolic',
              stage: ch.stage || 'transfer',
              transferDistance: ch.transferDistance || 'near',
            });
          } catch {}
        }
        feedbackBox.className = 'exp-check__feedback pr-check-feedback is-error';
        feedbackBox.textContent =
          'El resultado todavía no coincide. Usá el botón «Pedir pista» para revisar el paso intermedio.';
        state.problemsState[pKey] = {
          hintIndex,
          hints: state.problemsState[pKey]?.hints || [],
          solutionRevealed: false,
          solved: false,
          userAnswer: inputEl.value,
          feedbackClass: feedbackBox.className,
          feedbackText: feedbackBox.textContent,
        };
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
      {
        class: `exp-challenge-card exp-challenge__item seq-check__card quad-reto-card${pState?.solved ? ' is-solved' : ''}`,
        'data-problem-index': String(problemIndex),
      },
      headerEl,
      promptEl,
      inputRow,
      actionsEl,
      hintsBox,
      feedbackBox,
      solutionBox
    );

    return card;
  }

  function renderPrngCascade() {
    clear(cascadeList);
    const challenges = generateQuadChallenges(state.seed, state.family, 8);
    challenges.forEach((ch, idx) => {
      const card = createQuadChallengeCard(ch, idx);
      cascadeList.appendChild(card);
    });
    updateProgressPill();
  }

  seedInput.addEventListener('change', () => {
    state.seed = Number(seedInput.value) >>> 0;
    seedInput.value = String(state.seed);
    renderPrngCascade();
  });

  seedInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      seedInput.dispatchEvent(new Event('change'));
    }
  });

  familySelect.addEventListener('change', () => {
    state.family = familySelect.value;
    renderPrngCascade();
  });

  newSeedBtn.addEventListener('click', () => {
    playClick();
    state.seed += 1;
    seedInput.value = String(state.seed);
    renderPrngCascade();
  });

  randomSeedBtn.addEventListener('click', () => {
    playClick();
    state.seed = Math.floor(Math.random() * 1000000) >>> 0;
    seedInput.value = String(state.seed);
    renderPrngCascade();
  });

  renderPrngCascade();

  // Construir Pestaña 2 (5 Trampas Clásicas)
  const trapSelectorRow = h('div', { class: 'pr-chip-row' });
  const trapBody = h('div', { class: 'quad-trap-body' });
  trapsPane.append(trapSelectorRow, trapBody);

  function renderTrap(index) {
    state.activeTrapIndex = index;
    const trap = TRAPS[index];
    for (const [i, b] of Array.from(trapSelectorRow.children).entries()) {
      b.classList.toggle('is-active', i === index);
    }

    clear(trapBody);
    const header = h('div', { class: 'quad-trap-header' }, [
      h('h3', { class: 'quad-trap-title' }, trap.title),
      h('p', { class: 'quad-trap-subtitle' }, trap.subtitle),
    ]);

    const compareGrid = h('div', { class: 'quad-trap-compare' }, [
      h('div', { class: 'quad-trap-col is-wrong' }, [
        h('div', { class: 'quad-trap-col-head' }, [
          chalkIcon('cross', 15),
          ` ${trap.wrongAttempt.author}`,
        ]),
        h(
          'ol',
          { class: 'quad-trap-steps' },
          trap.wrongAttempt.steps.map((s) => h('li', {}, s))
        ),
      ]),
      h('div', { class: 'quad-trap-col is-right' }, [
        h('div', { class: 'quad-trap-col-head' }, [
          chalkIcon('check', 15),
          ` ${trap.correctResolution.author}`,
        ]),
        h(
          'ol',
          { class: 'quad-trap-steps' },
          trap.correctResolution.steps.map((s) => h('li', {}, s))
        ),
      ]),
    ]);

    const quizBox = h('div', { class: 'quad-trap-quiz' }, [
      h('p', { class: 'quad-trap-question' }, trap.question),
    ]);
    const optionsWrap = h('div', { class: 'quad-trap-options' });
    const trapFeedback = h('div', {
      class: 'pr-check-feedback',
      role: 'status',
      'aria-live': 'polite',
    });

    trap.options.forEach((opt) => {
      const optBtn = h('button', { type: 'button', class: 'pr-option' }, opt.label);
      optBtn.addEventListener('click', () => {
        for (const sibling of optionsWrap.querySelectorAll('.pr-option')) {
          sibling.classList.remove('is-selected', 'is-correct', 'is-wrong');
        }
        optBtn.classList.add('is-selected');
        if (opt.correct) {
          playSuccess();
          optBtn.classList.add('is-correct');
          trapFeedback.className = 'pr-check-feedback is-ok';
          trapFeedback.textContent = opt.feedback;
        } else {
          playError();
          optBtn.classList.add('is-wrong');
          trapFeedback.className = 'pr-check-feedback is-error';
          trapFeedback.textContent = opt.feedback;
          if (opt.diagnosticId && DIAGNOSE_REACTIONS[opt.diagnosticId]) {
            const r = DIAGNOSE_REACTIONS[opt.diagnosticId];
            if (vn && typeof vn.react === 'function') {
              vn.react(r.pose, r.text);
            } else {
              vnReact(r);
            }
          }
        }
      });
      optionsWrap.appendChild(optBtn);
    });

    quizBox.append(optionsWrap, trapFeedback);
    trapBody.append(header, compareGrid, quizBox);
  }

  TRAPS.forEach((trap, idx) => {
    const btn = h(
      'button',
      {
        type: 'button',
        class: `pr-chip${idx === 0 ? ' is-active' : ''}`,
      },
      `Trampa ${idx + 1}`
    );
    btn.addEventListener('click', () => {
      playClick();
      renderTrap(idx);
    });
    trapSelectorRow.appendChild(btn);
  });

  tabBtnPrng.addEventListener('click', () => {
    playClick();
    tabBtnPrng.classList.add('is-active');
    tabBtnTraps.classList.remove('is-active');
    prngPane.removeAttribute('hidden');
    trapsPane.setAttribute('hidden', '');
  });

  tabBtnTraps.addEventListener('click', () => {
    playClick();
    tabBtnTraps.classList.add('is-active');
    tabBtnPrng.classList.remove('is-active');
    trapsPane.removeAttribute('hidden');
    prngPane.setAttribute('hidden', '');
  });

  renderPrngCascade();
  renderTrap(0);

  root.append(tabsHeader, prngPane, trapsPane);
}

export const makeChallenge = generateQuadChallenge;
export const makeChallenges = generateQuadChallenges;
export const initRetosModule = mountQuadraticRetos;
