/**
 * Alaska Math Lab · Laboratorio 8: Función Cuadrática, Factorización y Parábolas (cuadraticas.html)
 * Orquestador principal de los 10 pizarrones, widgets SVG, chequeos graduados y Modo Novela Visual.
 */

import { h, clear, qsa, chalkIcon } from '../../core/dom.js';
import { renderNav, initLessonDock } from '../../core/nav.js';
import { initGlossary } from '../../core/glossary.js';
import {
  annotatedQuadFormula,
  threeFormsRosettaStrip,
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
  QUAD_COMPETENCIES,
  QUADRATICS_COMPETENCIES,
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
  mountQuadraticRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateQuadChallenge,
  generateQuadChallenges,
  makeChallenge,
  makeChallenges,
  TRAPS,
  mulberry32,
} from './retos.js';

export const LESSON_SECTIONS = [
  {
    id: 'sec-area-binomios',
    chapter: 'Capítulo 1',
    title: 'Del Rectángulo al Polinomio y Productos Notables',
    short: '1 · Área y Binomios',
  },
  {
    id: 'sec-balanza-suma-producto',
    chapter: 'Capítulo 1',
    title: 'Ingeniería Inversa: Factor Común y Suma-Producto (a = 1)',
    short: '2 · Suma-Producto',
  },
  {
    id: 'sec-agrupacion-estrategia',
    chapter: 'Capítulo 1',
    title: 'Cuando a ≠ 1: Agrupación y la Brújula de los 5 Pasos',
    short: '3 · Agrupación',
  },
  {
    id: 'sec-canonica-vertice',
    chapter: 'Capítulo 2',
    title: 'De la «V» a la Curva: Forma Canónica y Despeje por Raíz',
    short: '4 · Forma Canónica',
  },
  {
    id: 'sec-factorizada-simetria',
    chapter: 'Capítulo 2',
    title: 'Forma Factorizada, Producto Cero y el Secreto del Espejo',
    short: '5 · Factorizada',
  },
  {
    id: 'sec-completar-cuadrado',
    chapter: 'Capítulo 2',
    title: 'El Puente Alquimista: Completar el Cuadrado y xᵥ = −b/(2a)',
    short: '6 · Completar Cuadrado',
  },
  {
    id: 'sec-discriminante-vieta',
    chapter: 'Capítulo 3',
    title: 'La Fórmula Resolvente por Dentro, Radar Δ y Cardano-Vieta',
    short: '7 · Discriminante Δ',
  },
  {
    id: 'sec-radiografia-cuadratica',
    chapter: 'Capítulo 3',
    title: 'Radiografía Completa: Imagen, Signos (C⁺, C⁻), Monotonía y Biyectividad',
    short: '8 · Radiografía',
  },
  {
    id: 'sec-interseccion-recta-parabola',
    chapter: 'Capítulo 3',
    title: 'Encuentros en el Plano: Sistemas Parábola-Recta y Tangencia',
    short: '9 · Parábola y Recta',
  },
  {
    id: 'sec-optimizacion-extremos',
    chapter: 'Capítulo 4',
    title: 'Dominar los Extremos: Proyectiles, Cercos y el Cuadrado Inscrito',
    short: '10 · Optimización',
  },
];

/**
 * 30 preguntas de chequeo conceptual (3 por cada una de las 10 secciones)
 * con 90 pistas escritas a mano específicamente para los números de cada problema.
 */
export const CHECKS_DATA = {
  'sec-area-binomios': [
    {
      id: 'sec1-q1',
      competencyId: 'quadratics.area_model_and_notable_products',
      prerequisiteIds: [],
      family: 'modelo_area_binomios',
      representation: 'manipulative',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['distributed_square_over_sum'],
      kind: 'expression',
      requireForm: 'polynomial',
      prompt:
        'Desarrollá por completo el producto de binomios (x − 4)·(x + 7) sumando las cuatro regiones del modelo de área y escribilo en forma polinómica:',
      expected: 'x^2 + 3x - 28',
      placeholder: 'Ej: x^2 + 3x - 28',
      diagContext: { a: 1, b: 3, c: -28 },
      hints: [
        'Partí el rectángulo de lados (x − 4) y (x + 7) en sus cuatro parcelas: arriba a la izquierda tenés x·x = x² y abajo a la derecha el cruce numérico (−4)·(+7).',
        'En las dos parcelas cruzadas aparecen +7x y −4x; al juntarlas como términos semejantes te queda (+7 − 4)x = +3x.',
        'Sumá el término cuadrático x², la reducción lineal (+7 − 4)x y el producto constante (−4)·7 para ensamblar el trinomio final en potencias decrecientes.',
      ],
      solution:
        'Al sumar las cuatro parcelas obtenemos x² + 7x − 4x − 28 = x² + 3x − 28.',
    },
    {
      id: 'sec1-q2',
      competencyId: 'quadratics.area_model_and_notable_products',
      prerequisiteIds: [],
      family: 'cuadrado_binomio',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['distributed_square_over_sum'],
      kind: 'expression',
      requireForm: 'polynomial',
      prompt:
        'Desarrollá el cuadrado del binomio (2 − 3x)² en forma polinómica sin olvidar los dos rectángulos cruzados del doble producto:',
      expected: '9x^2 - 12x + 4',
      placeholder: 'Ej: 9x^2 - 12x + 4',
      diagContext: {
        target: 'expand_binomial_square',
        a: 9,
        b: -12,
        c: 4,
      },
      hints: [
        'Recordá que el exponente 2 nunca se reparte directo sobre la resta: en un cuadrado de lado (2 − 3x) hay dos cuadrados en la diagonal y dos rectángulos iguales en los cruces.',
        'Los cuadrados de las esquinas son 2² = 4 y (−3x)² = +9x² positivo (porque menos por menos da más), mientras que cada rectángulo lateral vale 2·(−3x) = −6x.',
        'Reuní los dos cuadrados de las esquinas con el doble producto central (−6x − 6x) y ordená los términos de mayor a menor grado.',
      ],
      solution:
        'En (2 − 3x)² aparecen 2² = 4, el doble producto 2·2·(−3x) = −12x y (−3x)² = +9x², dando 9x² − 12x + 4.',
    },
    {
      id: 'sec1-q3',
      competencyId: 'quadratics.area_model_and_notable_products',
      prerequisiteIds: [],
      family: 'falsa_cuadratica',
      representation: 'verbal',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['distributed_square_over_sum'],
      kind: 'choice',
      prompt:
        'Analizá la expresión f(n) = 2(n − 1)² − 2n². Al abrir el paréntesis y simplificar, ¿es realmente una función cuadrática?',
      options: [
        {
          label: 'No: al expandir 2(n² − 2n + 1) − 2n², los términos +2n² y −2n² se cancelan y queda la recta f(n) = −4n + 2.',
          correct: true,
        },
        {
          label: 'Sí: como aparece n² en la fórmula, es una parábola cóncava hacia arriba con a = 2.',
          correct: false,
          diagnosticId: 'distributed_square_over_sum',
        },
        {
          label: 'No: queda la función constante f(n) = 2 porque (n − 1)² es n² + 1.',
          correct: false,
          diagnosticId: 'distributed_square_over_sum',
        },
      ],
      hints: [
        'Para que una función sea genuinamente cuadrática, su coeficiente principal "a" luego de reducir términos semejantes tiene que ser distinto de cero.',
        'Desarrollá primero (n − 1)² = n² − 2n + 1 y multiplicá cada pieza por 2: te queda 2n² − 4n + 2.',
        'Al cancelar los términos cuadráticos opuestos (+2n² − 2n²), observá qué grado le queda a la variable en la expresión resultante.',
      ],
      solution:
        'Era una falsa cuadrática disfrazada: 2(n² − 2n + 1) − 2n² = 2n² − 4n + 2 − 2n² = −4n + 2 (grado 1).',
    },
  ],

  'sec-balanza-suma-producto': [
    {
      id: 'sec2-q1',
      competencyId: 'quadratics.sum_product_factoring',
      prerequisiteIds: ['quadratics.area_model_and_notable_products'],
      family: 'trinomio_suma_producto',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['confused_sum_product_signs_vieta'],
      kind: 'expression',
      requireForm: 'factored',
      prompt:
        'Usando la balanza suma-producto, factorizá el trinomio mónico x² − 5x + 6 como producto de dos binomios:',
      expected: '(x - 2)(x - 3)',
      placeholder: 'Ej: (x - 2)(x - 3)',
      diagContext: { target: 'factor', a: 1, b: -5, c: 6 },
      hints: [
        'Buscamos dos números enteros m y n que multiplicados den el término independiente c = +6 y sumados den el coeficiente lineal b = −5.',
        'Como el producto +6 es positivo, ambos números tienen el mismo signo; y como la suma −5 es negativa, los dos números buscados son negativos.',
        'Identificá cuál de los pares de divisores negativos de +6 suma exactamente −5 y armá el producto de dos factores (x + m)(x + n) con esos valores.',
      ],
      solution:
        'Como (−2)·(−3) = +6 y (−2) + (−3) = −5, el trinomio se factoriza exactamente como (x − 2)(x − 3).',
    },
    {
      id: 'sec2-q2',
      competencyId: 'quadratics.sum_product_factoring',
      prerequisiteIds: ['quadratics.area_model_and_notable_products'],
      family: 'trinomio_suma_producto',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['confused_sum_product_signs_vieta'],
      kind: 'expression',
      requireForm: 'factored',
      prompt:
        'Factorizá el trinomio x² − x − 42 encontrando los dos números que cierran el producto −42 y la suma −1:',
      expected: '(x - 7)(x + 6)',
      placeholder: 'Ej: (x - 7)(x + 6)',
      diagContext: { target: 'factor', a: 1, b: -1, c: -42 },
      hints: [
        'Acá el producto c = −42 es negativo, lo que garantiza que uno de los números es positivo y el otro es negativo.',
        'Como la suma es b = −1 (apenas a un paso del cero), necesitamos dos divisores de 42 que sean vecinos consecutivos y donde el más grande lleve signo menos.',
        'Como el producto es negativo (−42), los números tienen signos contrarios; asigná el signo negativo al de mayor valor absoluto para que la suma dé −1 y armá los binomios.',
      ],
      solution:
        'Con m = −7 y n = +6 verificamos (−7)·6 = −42 y −7 + 6 = −1, obteniendo (x − 7)(x + 6).',
    },
    {
      id: 'sec2-q3',
      competencyId: 'quadratics.sum_product_factoring',
      prerequisiteIds: ['quadratics.area_model_and_notable_products'],
      family: 'factor_comun_y_trinomio',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['forgot_leading_a_in_factored_form'],
      kind: 'expression',
      requireForm: 'factored',
      prompt:
        'Extraé primero el factor común numérico y luego factorizá por completo 3x² + 15x + 18:',
      expected: '3(x + 2)(x + 3)',
      placeholder: 'Ej: 3(x + 2)(x + 3)',
      diagContext: { target: 'factor', a: 3, b: 15, c: 18 },
      hints: [
        'Antes de buscar raíces, fijate que 3, 15 y 18 son todos múltiplos de 3: sacá el 3 adelante como factor común para aliviar los números.',
        'Al extraer el 3 te queda 3·(x² + 5x + 6), y adentro del paréntesis ahora tenés un trinomio mónico sencillo con suma +5 y producto +6.',
        'Factorizá el trinomio mónico interior buscando dos enteros que sumen 5 y multipliquen 6, manteniendo el factor común 3 multiplicando a todo el producto.',
      ],
      solution:
        'Sacando factor común 3 queda 3(x² + 5x + 6) y factorizando por suma-producto llegamos a 3(x + 2)(x + 3).',
    },
  ],

  'sec-agrupacion-estrategia': [
    {
      id: 'sec3-q1',
      competencyId: 'quadratics.grouping_and_factoring_strategy',
      prerequisiteIds: ['quadratics.sum_product_factoring'],
      family: 'diferencia_cuadrados',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['forgot_leading_a_in_factored_form'],
      kind: 'expression',
      requireForm: 'factored',
      prompt:
        'Aplicando la brújula de factorización (primero factor común y luego diferencia de cuadrados), factorizá por completo 5x² − 80:',
      expected: '5(x - 4)(x + 4)',
      placeholder: 'Ej: 5(x - 4)(x + 4)',
      diagContext: { target: 'factor', a: 5, b: 0, c: -80 },
      hints: [
        'Pregunta 1 de la brújula: ¿hay factor común en 5x² y −80? Sí, ambos son divisibles por 5.',
        'Al dividir ambos términos por 5 queda 5·(x² − 16), y adentro del paréntesis aparece una resta de dos cuadrados perfectos: x² − 4².',
        'Reconocé que adentro del paréntesis tenés una diferencia de cuadrados x² − 4² y factorizala como producto de binomios conjugados conservando el factor 5 exterior.',
      ],
      solution:
        'Extrayendo el factor común 5 obtenemos 5(x² − 16), que por diferencia de cuadrados se factoriza en 5(x − 4)(x + 4).',
    },
    {
      id: 'sec3-q2',
      competencyId: 'quadratics.grouping_and_factoring_strategy',
      prerequisiteIds: ['quadratics.sum_product_factoring'],
      family: 'agrupacion_no_monico',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['forgot_leading_a_in_factored_form'],
      kind: 'expression',
      requireForm: 'factored',
      prompt:
        'Factorizá por agrupación el trinomio 2x² + 7x + 3 partiendo el término central con el producto maestro a·c = 6:',
      expected: '(2x + 1)(x + 3)',
      placeholder: 'Ej: (2x + 1)(x + 3)',
      diagContext: { target: 'factor', a: 2, b: 7, c: 3 },
      hints: [
        'Como a = 2 y c = 3, el producto maestro es a·c = 2·3 = 6; los dos números que multiplican 6 y suman b = 7 son 1 y 6.',
        'Reescribí el término del medio 7x como +1x + 6x para tener cuatro términos: 2x² + x + 6x + 3.',
        'Extraé factor común x de la primera pareja y 3 de la segunda; notarás que el paréntesis (2x + 1) se repite, permitiéndote extraerlo como factor común global.',
      ],
      solution:
        'Descomponiendo 7x = x + 6x agrupamos x(2x + 1) + 3(2x + 1) = (2x + 1)(x + 3).',
    },
    {
      id: 'sec3-q3',
      competencyId: 'quadratics.grouping_and_factoring_strategy',
      prerequisiteIds: ['quadratics.sum_product_factoring'],
      family: 'trinomio_cuadrado_perfecto',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['distributed_square_over_sum'],
      kind: 'expression',
      requireForm: 'factored',
      prompt:
        'Reconocé la estructura de trinomio cuadrado perfecto y escribí en forma factorizada compacta 4x² + 12x + 9:',
      expected: '(2x + 3)^2',
      placeholder: 'Ej: (2x + 3)^2',
      diagContext: { target: 'factor', a: 4, b: 12, c: 9 },
      hints: [
        'Mirá las dos puntas del trinomio: 4x² es el cuadrado exacto de 2x, y 9 es el cuadrado exacto de 3.',
        'Verificá si el término central coincide con el doble producto de esas dos bases: 2 · (2x) · 3 = 12x.',
        'Habiendo verificado las bases 2x y 3 y el doble producto central, escribí la expresión como el binomio suma de ambas bases elevado al cuadrado.',
      ],
      solution:
        'Al ser (2x)² + 2·(2x)·3 + 3², es un trinomio cuadrado perfecto que se compacta en (2x + 3)².',
    },
  ],

  'sec-canonica-vertice': [
    {
      id: 'sec4-q1',
      competencyId: 'quadratics.canonical_form_and_vertex',
      prerequisiteIds: ['quadratics.area_model_and_notable_products'],
      family: 'vertice_forma_canonica',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['inverted_vertex_h_sign'],
      kind: 'pair',
      prompt:
        'Dada la función cuadrática en forma canónica f(x) = 3(x + 2)² + 1, indicá las coordenadas exactas de su vértice como par ordenado (xᵥ; yᵥ):',
      expected: '(-2; 1)',
      placeholder: 'Ej: (-2; 1)',
      diagContext: { target: 'vertex', a: 3, b: 12, c: 13, xv: -2, yv: 1 },
      hints: [
        'En el molde canónico a(x − xᵥ)² + yᵥ, la abscisa del vértice xᵥ es el valor de x que hace que el interior del paréntesis valga exactamente cero.',
        'Preguntate: ¿qué número puesto en el lugar de x cumple x + 2 = 0? Despejando sale xᵥ = −2 (con signo opuesto al +2 visible).',
        'Reuní la abscisa hallada donde el paréntesis se anula con el término independiente exterior en la notación de par ordenado (x; y).',
      ],
      solution:
        'El paréntesis (x + 2)² se anula en xᵥ = −2 y la altura mínima en ese punto es yᵥ = 1: vértice V(−2; 1).',
    },
    {
      id: 'sec4-q2',
      competencyId: 'quadratics.canonical_form_and_vertex',
      prerequisiteIds: ['quadratics.area_model_and_notable_products'],
      family: 'ordenada_forma_canonica',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['confused_c_with_canonical_k'],
      kind: 'number',
      prompt:
        'Para la función f(x) = −5(x + 1)² − 6, calculá el valor numérico de su ordenada al origen f(0):',
      expected: '-11',
      placeholder: 'Ej: -11',
      diagContext: {
        target: 'y_intercept',
        a: -5,
        b: -10,
        c: -11,
        xv: -1,
        yv: -6,
      },
      hints: [
        '¡No caigas en la trampa de contestar −6! Ese −6 es la altura del vértice en x = −1, no el corte con el eje Y.',
        'La ordenada al origen se halla siempre reemplazando x = 0 en toda la fórmula: f(0) = −5·(0 + 1)² − 6.',
        'Calculá el cuadrado (0 + 1)², multiplicalo por −5 y restale 6 para obtener el valor numérico final de la ordenada al origen.',
      ],
      solution:
        'Evaluando en x = 0 obtenemos f(0) = −5(0 + 1)² − 6 = −5(1) − 6 = −11. Corta al eje Y en (0; −11).',
    },
    {
      id: 'sec4-q3',
      competencyId: 'quadratics.canonical_form_and_vertex',
      prerequisiteIds: ['quadratics.area_model_and_notable_products'],
      family: 'despeje_raices_canonica',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['omitted_plus_minus_in_square_root'],
      kind: 'set',
      prompt:
        'Despejá directamente desde la forma canónica (x − 3)² − 4 = 0 y escribí el conjunto de sus raíces entre llaves:',
      expected: '{1; 5}',
      placeholder: 'Ej: {1; 5}',
      diagContext: { target: 'roots', a: 1, b: -6, c: 5, xv: 3, yv: -4 },
      hints: [
        'Pasá el 4 sumando al miembro derecho para dejar solo al cuadrado: (x − 3)² = 4.',
        'Al aplicar raíz cuadrada en ambos lados aparece el valor absoluto: √((x − 3)²) = |x − 3| = √4 = 2, lo que abre dos caminos: x − 3 = −2 o x − 3 = +2.',
        'Despejá la x en cada una de las dos ramas sumando 3 a ambos miembros (3 − 2 y 3 + 2) y escribí ambas soluciones separadas por punto y coma entre llaves.',
      ],
      solution:
        'De (x − 3)² = 4 deducimos x − 3 = ±2, luego x = 3 ± 2, entregando las dos raíces simétricas {1; 5}.',
    },
  ],

  'sec-factorizada-simetria': [
    {
      id: 'sec5-q1',
      competencyId: 'quadratics.factored_form_and_symmetry',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.sum_product_factoring'],
      family: 'producto_cero_incompleta',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['divided_by_x_lost_zero_root'],
      kind: 'set',
      prompt:
        'Resolvé la ecuación cuadrática incompleta x² − 4x = 0 extrayendo factor común (sin tachar la x) e indicá su conjunto solución entre llaves:',
      expected: '{0; 4}',
      placeholder: 'Ej: {0; 4}',
      diagContext: { target: 'roots', a: 1, b: -4, c: 0 },
      hints: [
        'Si pasás 4x al otro lado y dividís por x, matás una solución porque estás prohibiendo que x sea cero.',
        'Extraé factor común x en el primer miembro: la ecuación se reescribe como x · (x − 4) = 0.',
        'Aplicá la propiedad del producto nulo igualando a cero cada factor por separado (x = 0 y x − 4 = 0) y presentá las dos raíces obtenidas entre llaves.',
      ],
      solution:
        'Factorizando x(x − 4) = 0 y aplicando la propiedad del producto nulo obtenemos las dos raíces: {0; 4}.',
    },
    {
      id: 'sec5-q2',
      competencyId: 'quadratics.factored_form_and_symmetry',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.sum_product_factoring'],
      family: 'simetria_raices_vertice',
      representation: 'graphical',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['inverted_vertex_h_sign'],
      kind: 'pair',
      prompt:
        'Dada la parábola en forma factorizada f(x) = −2(x + 1)(x − 3), usá la simetría entre sus raíces para hallar las coordenadas del vértice V(xᵥ; yᵥ):',
      expected: '(1; 8)',
      placeholder: 'Ej: (1; 8)',
      diagContext: { target: 'vertex', a: -2, b: 4, c: 6, xv: 1, yv: 8 },
      hints: [
        'Leé primero las raíces que anulan cada paréntesis: x + 1 = 0 da x₁ = −1, y x − 3 = 0 da x₂ = 3.',
        'Por simetría, la abscisa del vértice xᵥ cae justo en el promedio entre ambas raíces: xᵥ = (−1 + 3) / 2 = 2 / 2 = 1.',
        'Calculá el producto −2·(1 + 1)·(1 − 3) para encontrar la ordenada del vértice y armá el par ordenado con la abscisa hallada antes.',
      ],
      solution:
        'El punto medio entre las raíces x₁ = −1 y x₂ = 3 es xᵥ = 1, y su ordenada vale f(1) = −2(2)(−2) = 8: vértice (1; 8).',
    },
    {
      id: 'sec5-q3',
      competencyId: 'quadratics.factored_form_and_symmetry',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.sum_product_factoring'],
      family: 'reconstruccion_factorizada',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['forgot_leading_a_in_factored_form'],
      kind: 'expression',
      requireForm: null,
      prompt:
        'Reconstruí la ecuación de la parábola que corta al eje X en x₁ = −2 y en x₂ = 4 y cuya ordenada al origen es f(0) = 16:',
      expected: '-2(x + 2)(x - 4)',
      placeholder: 'Ej: -2(x + 2)(x - 4)',
      diagContext: { target: 'factor', a: -2, b: 4, c: 16 },
      hints: [
        'Como conocés las dos raíces x₁ = −2 y x₂ = 4, armá el molde factorizado f(x) = a·(x + 2)·(x − 4) dejando el coeficiente principal "a" listo para despejar.',
        'Usá el dato de la ordenada al origen (0; 16) reemplazando x = 0 e igualando a 16: 16 = a·(0 + 2)·(0 − 4) = a·(−8).',
        'Despejá el valor de a dividiendo 16 por el producto de los dos factores evaluados en cero y colocá ese coeficiente delante de (x + 2)(x − 4).',
      ],
      solution:
        'En f(x) = a(x + 2)(x − 4), imponiendo f(0) = a(2)(−4) = 16 despejamos a = −2, por lo que f(x) = −2(x + 2)(x − 4).',
    },
  ],

  'sec-completar-cuadrado': [
    {
      id: 'sec6-q1',
      competencyId: 'quadratics.completing_the_square',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.area_model_and_notable_products'],
      family: 'completar_cuadrado_monico',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['unbalanced_completing_square'],
      kind: 'expression',
      requireForm: 'canonical',
      prompt:
        'Completá el cuadrado paso a paso en f(x) = x² − 6x + 2 formando el neutro aditivo (+9 − 9) y escribila en forma canónica:',
      expected: '(x - 3)^2 - 7',
      placeholder: 'Ej: (x - 3)^2 - 7',
      diagContext: {
        target: 'canonical',
        a: 1,
        b: -6,
        c: 2,
        xv: 3,
        yv: -7,
      },
      hints: [
        'Partí a la mitad el coeficiente lineal −6: la mitad es −3, por lo que el cuadrado que necesitamos cerrar tiene lado (x − 3).',
        'Para completar el trinomio necesitamos sumar (−3)² = 9; para no alterar la función sumamos y restamos 9: (x² − 6x + 9) − 9 + 2.',
        'Compactá el trinomio cuadrado perfecto en el binomio al cuadrado y operá aritméticamente los términos numéricos restantes fuera del paréntesis.',
      ],
      solution:
        'Sumando y restando 3² = 9: x² − 6x + 9 − 9 + 2 = (x − 3)² − 7, con vértice en (3; −7).',
    },
    {
      id: 'sec6-q2',
      competencyId: 'quadratics.completing_the_square',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.area_model_and_notable_products'],
      family: 'completar_cuadrado_no_monico',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['unbalanced_completing_square'],
      kind: 'expression',
      requireForm: 'canonical',
      prompt:
        'Pasá a forma canónica la función f(x) = 3x² − 6x − 1 extrayendo primero el factor común a = 3 de los términos con x:',
      expected: '3(x - 1)^2 - 4',
      placeholder: 'Ej: 3(x - 1)^2 - 4',
      diagContext: {
        target: 'canonical',
        a: 3,
        b: -6,
        c: -1,
        xv: 1,
        yv: -4,
      },
      hints: [
        'Sacá factor común 3 de los dos primeros términos dejando al −1 afuera del corchete: f(x) = 3 · [x² − 2x] − 1.',
        'Adentro del corchete la mitad de −2 es −1 y (−1)² = 1; sumá y restá 1 adentro: 3 · [(x² − 2x + 1) − 1] − 1.',
        'Distribuí el factor 3 sobre el término que resta dentro del corchete, sumalo al término independiente final y dejá armada la forma canónica.',
      ],
      solution:
        '3[x² − 2x + 1 − 1] − 1 = 3[(x − 1)² − 1] − 1 = 3(x − 1)² − 3 − 1 = 3(x − 1)² − 4.',
    },
    {
      id: 'sec6-q3',
      competencyId: 'quadratics.completing_the_square',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.area_model_and_notable_products'],
      family: 'deduccion_vertice_formula',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['inverted_vertex_h_sign'],
      kind: 'pair',
      prompt:
        'En f(x) = −1/2 x² + 2x − 9/2, usá la relación deducida xᵥ = −b/(2a) y evaluá yᵥ = f(xᵥ) para dar las coordenadas del vértice (xᵥ; yᵥ):',
      expected: '(2; -5/2)',
      placeholder: 'Ej: (2; -5/2) o (2; -2,5)',
      diagContext: {
        target: 'vertex',
        a: -0.5,
        b: 2,
        c: -4.5,
        xv: 2,
        yv: -2.5,
      },
      hints: [
        'Identificá con cuidado los coeficientes con su signo: a = −1/2 y b = 2. Al calcular 2·a obtenés 2·(−1/2) = −1.',
        'Entonces la abscisa del vértice es xᵥ = −b / (2a) = −2 / (−1) = +2.',
        'Evaluá f(2) sumando −2 + 4 − 9/2 con denominador común fraccionario y combiná el resultado con la abscisa en formato de par ordenado.',
      ],
      solution:
        'Con a = −1/2 y b = 2 resulta xᵥ = −2/(−1) = 2 e yᵥ = −2 + 4 − 9/2 = −5/2: vértice V(2; −5/2).',
    },
  ],

  'sec-discriminante-vieta': [
    {
      id: 'sec7-q1',
      competencyId: 'quadratics.discriminant_and_vieta',
      prerequisiteIds: ['quadratics.completing_the_square', 'quadratics.factored_form_and_symmetry'],
      family: 'reconstruccion_suma_producto_vieta',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['confused_sum_product_signs_vieta'],
      kind: 'expression',
      requireForm: 'polynomial',
      prompt:
        'Dadas la suma S = x₁ + x₂ = 5 y el producto P = x₁ · x₂ = 6 de las raíces de una función cuadrática mónica f(x) = x² + bx + c, escribí su fórmula polinómica usando las relaciones de Cardano-Viète:',
      expected: 'x^2 - 5x + 6',
      placeholder: 'Ej: x^2 - 5x + 6',
      diagContext: { target: 'vieta_reconstruct', a: 1, b: -5, c: 6 },
      hints: [
        'Recordá que al distribuir f(x) = (x − x₁)(x − x₂) el término lineal resulta b = −(x₁ + x₂) = −S y el término independiente es c = x₁ · x₂ = P.',
        'Como la suma es S = 5, el término lineal de la cuadrática mónica debe llevar el signo opuesto b = −5, mientras que el término independiente conserva el signo del producto c = +6.',
        'Ensamblá el polinomio mónico comenzando con x², agregando el término lineal con signo invertido respecto a la suma y terminando con el producto numérico.',
      ],
      solution:
        'Por Cardano-Viète, cualquier cuadrática mónica cumple x² − Sx + P = 0, dando f(x) = x² − 5x + 6 sin necesidad de aplicar Bhaskara.',
    },
    {
      id: 'sec7-q2',
      competencyId: 'quadratics.discriminant_and_vieta',
      prerequisiteIds: ['quadratics.completing_the_square', 'quadratics.factored_form_and_symmetry'],
      family: 'cardano_vieta_producto_parametro',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['confused_sum_product_signs_vieta', 'neg_b_or_square_sign_in_resolvente'],
      kind: 'number',
      prompt:
        'En la ecuación 2x² − 10x + c = 0, una de las raíces vale x₁ = 1. Sabiendo que por Cardano-Viète la suma es x₁ + x₂ = −b/a = 5, utilizá el producto x₁ · x₂ = c/a para deducir el valor exacto del término independiente c:',
      expected: 8,
      placeholder: 'Ej: 8',
      diagContext: { target: 'vieta_parameter', a: 2, b: -10, c: 8 },
      hints: [
        'Averiguá primero la segunda raíz x₂: sabiendo que x₁ + x₂ = 5 y que x₁ = 1, al restar obtenés x₂ = 5 − 1 = 4.',
        'Por la relación de Cardano-Viète para el producto, x₁ · x₂ = c/a: multiplicá las dos raíces (1 · 4 = 4) e igualalo a la fracción c/2.',
        'Multiplicá el producto obtenido entre las raíces por el coeficiente principal a = 2 para despejar el valor del parámetro c.',
      ],
      solution:
        'Como x₁ = 1 y la suma es 5, x₂ = 4. Por Cardano-Viète, x₁ · x₂ = c/a ⇒ 1 · 4 = c/2 ⇒ c = 8.',
    },
    {
      id: 'sec7-q3',
      competencyId: 'quadratics.discriminant_and_vieta',
      prerequisiteIds: ['quadratics.completing_the_square', 'quadratics.factored_form_and_symmetry'],
      family: 'discriminante_rango_k',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['neg_b_or_square_sign_in_resolvente'],
      kind: 'interval',
      prompt:
        '¿Para qué valores del parámetro real k la ecuación x² − 6x + k = 0 no tiene ninguna raíz real (su discriminante cumple Δ < 0)? Escribí el conjunto solución de k en notación de intervalo:',
      expected: '(9; +inf)',
      placeholder: 'Ej: (9; +inf)',
      diagContext: { target: 'discriminant', a: 1, b: -6, c: 9 },
      hints: [
        'Una ecuación cuadrática no tiene raíces reales cuando el radicando de la resolvente es estrictamente negativo: Δ = b² − 4ac < 0.',
        'Con a = 1, b = −6 y c = k, planteá (−6)² − 4·1·k < 0, lo que conduce a 36 − 4k < 0.',
        'Aislá el parámetro k pasando 4k sumando al otro miembro y expresá la semirrecta de valores mayores como intervalo abierto hacia +inf.',
      ],
      solution:
        'Imponiendo Δ = 36 − 4k < 0 obtenemos 4k > 36 ⇒ k > 9. En notación de intervalos de Exactas: (9; +inf).',
    },
  ],

  'sec-radiografia-cuadratica': [
    {
      id: 'sec8-q1',
      competencyId: 'quadratics.full_analysis_exactas',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.discriminant_and_vieta'],
      family: 'ceros_desde_factorizada',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['used_yv_for_monotonicity_or_open_image'],
      kind: 'set',
      prompt:
        'Dada la función cuadrática en forma factorizada f(x) = −2(x + 1)(x − 5), determiná su conjunto de ceros C₀ escribiendo las raíces entre llaves:',
      expected: '{-1; 5}',
      placeholder: 'Ej: {-1; 5}',
      diagContext: { target: 'roots', a: -2, b: 8, c: 10, xv: 2, yv: 18 },
      hints: [
        'En la forma factorizada a·(x − x₁)·(x − x₂), las raíces son los valores numéricos que anulan cada paréntesis por la propiedad del producto nulo.',
        'Planteá x + 1 = 0 y x − 5 = 0 para despejar individualmente el valor de cada raíz real.',
        'Escribí ambas soluciones encontradas entre llaves { ... } ordenadas de menor a mayor y separadas por punto y coma.',
      ],
      solution:
        'Los factores se anulan en x = −1 y x = 5, por lo que el conjunto de ceros es C₀ = {−1; 5}.',
    },
    {
      id: 'sec8-q2',
      competencyId: 'quadratics.full_analysis_exactas',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.discriminant_and_vieta'],
      family: 'intervalo_decrecimiento',
      representation: 'graphical',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['used_yv_for_monotonicity_or_open_image'],
      kind: 'set',
      prompt:
        'Para la parábola f(x) = 2(x − 3)² − 8, con vértice en V(3; −8) y ramas hacia arriba (a = 2 > 0), indicá su intervalo de decrecimiento I↓ sobre el eje X:',
      expected: '(-inf; 3)',
      placeholder: 'Ej: (-inf; 3)',
      diagContext: {
        target: 'decreasing',
        a: 2,
        b: -12,
        c: 10,
        xv: 3,
        yv: -8,
      },
      hints: [
        'Los intervalos de monotonía se leen SIEMPRE sobre el eje horizontal X, divididos por la abscisa del vértice xᵥ = 3 (nunca uses la altura yᵥ = −8).',
        'Al ser a = 2 > 0 (cóncava hacia arriba), la curva desciende a medida que se avanza hacia la derecha hasta llegar al punto más bajo en xᵥ = 3.',
        'Armá el intervalo sobre la recta numérica desde el extremo izquierdo hasta la abscisa del vértice con paréntesis abiertos.',
      ],
      solution:
        'Mirando el eje X, la curva decrece desde −∞ hasta la abscisa del vértice xᵥ = 3: I↓ = (−∞; 3).',
    },
    {
      id: 'sec8-q3',
      competencyId: 'quadratics.full_analysis_exactas',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.discriminant_and_vieta'],
      family: 'restriccion_inversibilidad',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['used_yv_for_monotonicity_or_open_image'],
      kind: 'set',
      prompt:
        'Para que f(x) = (x − 4)² + 2 admita función inversa, se debe restringir su dominio a una rama monótona maximal a partir del vértice V(4; 2). ¿Cuál es la restricción maximal estándar hacia la derecha [xᵥ; +∞)?',
      expected: '[4; +inf)',
      placeholder: 'Ej: [4; +inf)',
      diagContext: {
        target: 'invertibility',
        a: 1,
        b: -8,
        c: 18,
        xv: 4,
        yv: 2,
      },
      hints: [
        'Una parábola completa no tiene inversa en ℝ porque no es inyectiva (dos valores de x comparten la misma altura f(x)). Para invertirla se toma una única rama monótona.',
        'La partición natural ocurre en el eje de simetría xᵥ = 4: la rama derecha comienza en la abscisa del vértice e incluye todos los valores mayores o iguales.',
        'Escribí el intervalo semiabierto que arranca en la abscisa del vértice con corchete cerrado y continúa hacia la derecha hacia +inf.',
      ],
      solution:
        'Restringiendo el dominio a la rama monótona derecha a partir del vértice xᵥ = 4 se obtiene una función inyectiva y sobreyectiva: Dom_restringido = [4; +∞).',
    },
  ],

  'sec-interseccion-recta-parabola': [
    {
      id: 'sec9-q1',
      competencyId: 'quadratics.parabola_line_tangency',
      prerequisiteIds: ['quadratics.discriminant_and_vieta'],
      family: 'clasificacion_tres_rectas',
      representation: 'verbal',
      difficulty: 2,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['neg_b_or_square_sign_in_resolvente', 'confused_c_with_canonical_k'],
      kind: 'choice',
      prompt:
        'Considerá la parábola f(x) = x² + 3 y tres rectas paralelas r₁(x) = 2x + 6, r₂(x) = 2x + 2 y r₃(x) = 2x − 1. Al plantear la ecuación f(x) − r(x) = 0 y evaluar su discriminante Δ_int, ¿cómo se clasifica cada recta?',
      options: [
        {
          label: 'r₁ es secante (Δ_int > 0, 2 cortes), r₂ es tangente (Δ_int = 0, 1 contacto) y r₃ es exterior (Δ_int < 0, 0 cortes).',
          correct: true,
        },
        {
          label: 'r₁ es tangente, r₂ es secante y r₃ es exterior porque la pendiente es 2 en todas.',
          correct: false,
          diagnosticId: 'neg_b_or_square_sign_in_resolvente',
        },
        {
          label: 'Las tres rectas son exteriores porque la parábola tiene vértice en (0; 3) y no corta al eje X.',
          correct: false,
          diagnosticId: 'confused_c_with_canonical_k',
        },
      ],
      hints: [
        'Para cada recta r(x) = 2x + d, la ecuación diferencia es x² + 3 − (2x + d) = x² − 2x + (3 − d) = 0, con discriminante Δ_int = (−2)² − 4·1·(3 − d) = 4d − 8.',
        'Calculá el valor de 4d − 8 para cada una de las tres ordenadas: d = 6 da 16 > 0; d = 2 da 0; d = −1 da −12 < 0.',
        'Relacioná cada signo del discriminante con el número de puntos de intersección: mayor que cero corta dos veces, igual a cero es tangente y menor que cero no tiene corte.',
      ],
      solution:
        'Con Δ_int = 4d − 8: r₁ (d=6) da Δ=16 > 0 (secante); r₂ (d=2) da Δ=0 (tangente); r₃ (d=−1) da Δ=−12 < 0 (exterior).',
    },
    {
      id: 'sec9-q2',
      competencyId: 'quadratics.parabola_line_tangency',
      prerequisiteIds: ['quadratics.discriminant_and_vieta'],
      family: 'parametro_secante_bounds',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['neg_b_or_square_sign_in_resolvente'],
      kind: 'set',
      prompt:
        'Dada la parábola f(x) = x² − 4x + 7 y la recta horizontal y = k, ¿para qué valores del parámetro k la recta corta a la parábola en dos puntos distintos (recta secante, Δ_int > 0)? Escribí el intervalo de valores para k:',
      expected: '(3; +inf)',
      placeholder: 'Ej: (3; +inf)',
      diagContext: { target: 'roots', a: 1, b: -4, c: 7 },
      hints: [
        'Igualá la parábola con la recta y pasá el parámetro al primer miembro: x² − 4x + (7 − k) = 0.',
        'Para que corte en dos puntos, exigí discriminante estrictamente positivo: Δ_int = (−4)² − 4·1·(7 − k) = 16 − 28 + 4k = 4k − 12 > 0.',
        'Despejá k de la desigualdad 4k > 12 y volcá la semirrecta resultante como intervalo abierto hacia +inf.',
      ],
      solution:
        'Exigiendo Δ_int = 4k − 12 > 0 despejamos k > 3. En notación de intervalo: k ∈ (3; +inf) (coincide geométricamente con superar la altura del vértice yᵥ = 3).',
    },
    {
      id: 'sec9-q3',
      competencyId: 'quadratics.parabola_line_tangency',
      prerequisiteIds: ['quadratics.discriminant_and_vieta'],
      family: 'parametro_exterior_bounds',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['neg_b_or_square_sign_in_resolvente'],
      kind: 'set',
      prompt:
        '¿Para qué valores de la ordenada al origen d la recta g(x) = 2x + d resulta completamente exterior a la parábola f(x) = x² + 2x + 5 (sin puntos de contacto, Δ_int < 0)? Escribí el intervalo correspondiente para d:',
      expected: '(-inf; 5)',
      placeholder: 'Ej: (-inf; 5)',
      diagContext: { target: 'roots', a: 1, b: 0, c: 5 },
      hints: [
        'Formá la ecuación diferencia f(x) − g(x) = 0: x² + 2x + 5 − (2x + d) = x² + (5 − d) = 0.',
        'Al no haber término lineal (b = 0), el discriminante es Δ_int = 0² − 4·1·(5 − d) = 4(d − 5). Para que sea exterior debe ser Δ_int < 0.',
        'Resolvé la inecuación 4(d − 5) < 0 dividiendo por 4 y expresá los valores estrictamente menores en notación de intervalo abierto desde -inf.',
      ],
      solution:
        'Con Δ_int = 4(d − 5) < 0 tenemos d − 5 < 0 ⇒ d < 5: intervalo (−inf; 5).',
    },
  ],

  'sec-optimizacion-extremos': [
    {
      id: 'sec10-q1',
      competencyId: 'quadratics.extremum_optimization',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.full_analysis_exactas'],
      family: 'optimizacion_vertice_interior',
      representation: 'verbal',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['inverted_vertex_h_sign'],
      kind: 'number',
      prompt:
        'Un cerco rectangular aprovecha una pared existente y se completan los otros tres lados con 40 metros de alambre. El área en función del ancho x (en metros) es A(x) = x·(40 − 2x) = −2x² + 40x para x ∈ (0; 20). ¿Cuál es el área máxima encerrada (en m²)?',
      expected: 200,
      placeholder: 'Ej: 200',
      diagContext: { target: 'yv', a: -2, b: 40, c: 0, xv: 10, yv: 200 },
      hints: [
        'En la función A(x) = −2x² + 40x tenés a = −2 < 0 (abre hacia abajo), lo que garantiza un máximo absoluto en la cumbre del vértice.',
        'La abscisa del vértice es xᵥ = −b / (2a) = −40 / (2·(−2)) = 10 metros, que pertenece al dominio físico admisible (0; 20).',
        'Evaluá la función de área reemplazando el ancho óptimo x = 10 en la fórmula A(10) para calcular el valor numérico en metros cuadrados.',
      ],
      solution:
        'El ancho óptimo es xᵥ = 10 m ∈ (0; 20), entregando un área máxima de A(10) = 10 · (40 − 20) = 200 m².',
    },
    {
      id: 'sec10-q2',
      competencyId: 'quadratics.extremum_optimization',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.full_analysis_exactas'],
      family: 'optimizacion_vertice_exterior',
      representation: 'verbal',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['used_yv_for_monotonicity_or_open_image'],
      kind: 'number',
      prompt:
        'El consumo de combustible de un generador según su potencia p está modelado por C(p) = 2p² − 12p + 50 (cuyo vértice matemático se ubica en pᵥ = 3). Por especificación técnica, el generador solo puede operar en el intervalo restringido p ∈ [5; 8] (el vértice queda afuera). ¿Para qué valor de potencia p se obtiene el consumo mínimo dentro del rango permitido?',
      expected: 5,
      placeholder: 'Ej: 5',
      diagContext: { target: 'xv', a: 2, b: -12, c: 50, xv: 3, yv: 32 },
      hints: [
        '¡Cuidado con usar el vértice ciegamente! El vértice vive en pᵥ = 3, pero ese valor no es físicamente admisible porque está fuera de [5; 8].',
        'Como a = 2 > 0, para todo p ≥ 3 la curva es estrictamente creciente; en consecuencia, a mayor potencia dentro de [5; 8], mayor es el consumo.',
        'Elegí el borde del intervalo admisible [5; 8] donde comienza el tramo monótono creciente para señalar la potencia de menor consumo.',
      ],
      solution:
        'Como pᵥ = 3 ∉ [5; 8] y en ese intervalo la función es estrictamente creciente, el mínimo se ubica en el borde izquierdo: p = 5 (con consumo C(5) = 40).',
    },
    {
      id: 'sec10-q3',
      competencyId: 'quadratics.extremum_optimization',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.full_analysis_exactas'],
      family: 'optimizacion_candidatos_cerrado',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['used_yv_for_monotonicity_or_open_image'],
      kind: 'number',
      prompt:
        'Se analiza la función cuadrática f(x) = −x² + 6x en el intervalo cerrado [1; 6]. Su vértice está en xᵥ = 3 con f(3) = 9. Comparando los valores en los extremos f(1) y f(6) con el vértice, ¿cuál es el valor numérico del mínimo absoluto de f(x) en dicho intervalo?',
      expected: 0,
      placeholder: 'Ej: 0',
      diagContext: { target: 'yv', a: -1, b: 6, c: 0, xv: 3, yv: 9 },
      hints: [
        'En un intervalo cerrado [a; b], los candidatos a extremos absolutos son siempre los bordes a y b, junto con el vértice xᵥ si cae dentro del intervalo.',
        'Calculá el valor en los dos extremos del intervalo: f(1) = −(1)² + 6(1) = 5 y f(6) = −(6)² + 6(6) = −36 + 36 = 0.',
        'Compará las alturas de los tres candidatos calculados en los pasos anteriores para identificar cuál de ellas representa el menor valor alcanzado.',
      ],
      solution:
        'Los candidatos en [1; 6] son f(3) = 9 (máximo), f(1) = 5 y f(6) = 0. El menor valor absoluto alcanzado es 0.',
    },
  ],
};

const WIDGETS = [
  ['modelo-area-binomios', './widgets/modelo-area-binomios.js', 'initModeloAreaBinomios'],
  ['balanza-suma-producto', './widgets/balanza-suma-producto.js', 'initBalanzaSumaProducto'],
  ['agrupacion-estrategia', './widgets/agrupacion-estrategia.js', 'initAgrupacionEstrategia'],
  ['canonica-vertice', './widgets/canonica-vertice.js', 'initCanonicaVertice'],
  ['factorizada-simetria', './widgets/factorizada-simetria.js', 'initFactorizadaSimetria'],
  ['completar-cuadrado', './widgets/completar-cuadrado.js', 'initCompletarCuadrado'],
  ['discriminante-vieta', './widgets/discriminante-vieta.js', 'initDiscriminanteVieta'],
  ['radiografia-cuadratica', './widgets/radiografia-cuadratica.js', 'initRadiografiaCuadratica'],
  [
    'interseccion-recta-parabola',
    './widgets/interseccion-recta-parabola.js',
    'initInterseccionRectaParabola',
  ],
  ['optimizacion-extremos', './widgets/optimizacion-extremos.js', 'initOptimizacionExtremos'],
];

const activeWidgets = new WeakMap();

export function initBlackboardController() {
  const content = document.querySelector('.seq-content');
  if (!content || content.dataset.blackboardReady === 'true') return;
  content.dataset.blackboardReady = 'true';

  const page = document.querySelector('.seq-page');
  const sidebar = document.querySelector('.seq-sidebar');
  const menuGlyph = String.fromCodePoint(0x2630);
  const sidebarToggle = h(
    'button',
    {
      type: 'button',
      class: 'chip exp-sidebar-toggle pr-sidebar-toggle',
      'data-sidebar-toggle': 'true',
      'aria-controls': 'quad-sidebar-index',
    },
    'Índice'
  );
  const badge = h('span', {
    class: 'seq-blackboard-toolbar__badge',
    id: 'seq-board-badge',
  });
  const title = h('strong', { id: 'seq-board-title' });
  const toggle = h(
    'button',
    { type: 'button', class: 'chip', id: 'seq-mode-toggle' },
    'Pizarrón por lección (activo)'
  );
  const bar = h(
    'div',
    { class: 'seq-blackboard-toolbar', id: 'seq-board-toolbar' },
    sidebarToggle,
    h('div', { class: 'seq-blackboard-toolbar__info' }, badge, title),
    h('div', { class: 'seq-blackboard-toolbar__actions' }, toggle)
  );
  content.prepend(bar);
  initLessonDock();

  if (sidebar) {
    sidebar.id = 'quad-sidebar-index';
  }

  const sidebarKey = 'cuadraticas:sidebar:v1';
  const setSidebar = (collapsed, persist = true) => {
    page?.classList.toggle('is-sidebar-collapsed', collapsed);
    sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
    sidebarToggle.textContent = collapsed
      ? `${menuGlyph} Índice`
      : '◀ Ocultar índice';
    if (persist) {
      try {
        localStorage.setItem(sidebarKey, collapsed ? 'collapsed' : 'open');
      } catch {
        // Ignore storage error
      }
    }
  };

  let savedSidebar = null;
  try {
    savedSidebar = localStorage.getItem(sidebarKey);
  } catch {
    // Ignore storage error
  }
  setSidebar(
    savedSidebar
      ? savedSidebar === 'collapsed'
      : typeof window !== 'undefined' && window.innerWidth < 1280,
    false
  );
  sidebarToggle.addEventListener('click', () =>
    setSidebar(!page?.classList.contains('is-sidebar-collapsed'))
  );

  let focused = true;
  let current = LESSON_SECTIONS[0].id;

  const activate = (id, scroll = true) => {
    const index = LESSON_SECTIONS.findIndex((item) => item.id === id);
    const isExtraSection = id === 'sec-retos' || id === 'sec-repaso';
    if (index < 0 && !isExtraSection) return;

    const activeSection = document.getElementById(id);
    current = id;

    for (const item of LESSON_SECTIONS) {
      document.getElementById(item.id)?.classList.toggle('is-active', item.id === id);
    }
    document.getElementById('sec-retos')?.classList.toggle('is-active', id === 'sec-retos');
    document.getElementById('sec-repaso')?.classList.toggle('is-active', id === 'sec-repaso');

    qsa('.seq-sidebar__link[data-sec]').forEach((link) =>
      link.classList.toggle('is-active', link.dataset.sec === id)
    );

    if (index >= 0) {
      badge.textContent = `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length}`;
      title.textContent = `${LESSON_SECTIONS[index].chapter} · ${LESSON_SECTIONS[index].title}`;
    } else if (id === 'sec-retos') {
      badge.textContent = 'Entrenamiento';
      title.textContent = 'Entrenador Contrastivo y las 5 Trampas de Examen';
    } else if (id === 'sec-repaso') {
      badge.textContent = 'Síntesis';
      title.textContent = 'Hoja de Repaso Imprimible · Función Cuadrática';
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
    toggle.textContent = focused
      ? 'Pizarrón por lección (activo)'
      : 'Pizarra continua (ver todo)';
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
            {
              type: 'button',
              class: 'chip seq-chalk-tray__btn',
              on: { click: () => activate(previous.id) },
            },
            `← ${previous.short}`
          )
        : h('span', { class: 'muted small' }, 'Primer pizarrón'),
      h(
        'span',
        { class: 'seq-chalk-tray__info' },
        `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length} · ${item.chapter}`
      ),
      next
        ? h(
            'button',
            {
              type: 'button',
              class: 'btn seq-chalk-tray__btn',
              on: { click: () => activate(next.id) },
            },
            `${next.short} →`
          )
        : h(
            'button',
            {
              type: 'button',
              class: 'btn seq-chalk-tray__btn',
              on: { click: () => activate('sec-retos') },
            },
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
      if (typeof window !== 'undefined' && window.innerWidth < 1280) {
        setSidebar(true, false);
      }
      if (typeof history !== 'undefined') {
        history.replaceState(null, '', `#${link.dataset.sec}`);
      }
    })
  );

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      const isCollapsed = page?.classList.contains('is-sidebar-collapsed');
      if (window.innerWidth < 1280 && !isCollapsed) {
        setSidebar(true, false);
      } else if (window.innerWidth >= 1280 && isCollapsed && !savedSidebar) {
        setSidebar(false, false);
      }
    });
    window.addEventListener('keydown', (event) => {
      const activeEl = document.activeElement;
      if (
        !focused ||
        ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(activeEl?.tagName) ||
        activeEl?.getAttribute?.('role') === 'slider' ||
        activeEl?.closest?.('svg')
      )
        return;
      if (!['ArrowRight', 'PageDown', 'ArrowLeft', 'PageUp'].includes(event.key))
        return;
      const index = LESSON_SECTIONS.findIndex((item) => item.id === current);
      if (index < 0) return;
      const next =
        index + (['ArrowRight', 'PageDown'].includes(event.key) ? 1 : -1);
      if (LESSON_SECTIONS[next]) {
        event.preventDefault();
        activate(LESSON_SECTIONS[next].id);
      }
    });

    const initial = location.hash.slice(1);
    const validIds = [...LESSON_SECTIONS.map((s) => s.id), 'sec-retos', 'sec-repaso'];
    activate(validIds.includes(initial) ? initial : LESSON_SECTIONS[0].id, false);
    content.classList.add('mode-blackboard');
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  }
}

if (typeof document !== 'undefined') {
  renderNav();

  const progress = getProgress();
  const solvedSections = new Set();
  for (const sec of LESSON_SECTIONS) {
    const qs = CHECKS_DATA[sec.id] || [];
    const allQsSolved = qs.length > 0 && qs.every((q) => Boolean(progress[q.id]));
    if (progress[sec.id] === true || allQsSolved) {
      solvedSections.add(sec.id);
    }
  }
  const progressHost = document.getElementById('seq-progress-text');

  // 1. Montar los 10 widgets interactivos
  for (const [name, modPath, fnName] of WIDGETS) {
    const hosts = document.querySelectorAll(`[data-widget="${name}"]`);
    if (hosts.length) {
      import(modPath)
        .then((mod) => {
          const fn = mod.initWidget || mod[fnName] || mod.default;
          if (typeof fn === 'function') {
            hosts.forEach((host) => {
              try {
                const instance = fn(host);
                if (instance) activeWidgets.set(host, instance);
              } catch (err) {
                console.error(`[widget:${name}] initialization failed:`, err);
              }
            });
          }
        })
        .catch((err) => {
          console.warn(`[widget:${name}] could not load ${modPath}:`, err?.message || err);
        });
    }
  }

  // 2. Montar fórmulas anotadas y tira Rosetta
  qsa('[data-quad-formula]').forEach((host) => {
    const form = host.getAttribute('data-quad-formula') || 'canonical';
    const a = Number(host.getAttribute('data-a') ?? 1);
    const b = Number(host.getAttribute('data-b') ?? -6);
    const c = Number(host.getAttribute('data-c') ?? 5);
    host.replaceChildren(annotatedQuadFormula({ form, a, b, c }));
  });

  qsa('[data-quad-rosetta]').forEach((host) => {
    const a = Number(host.getAttribute('data-a') ?? 1);
    const b = Number(host.getAttribute('data-b') ?? -6);
    const c = Number(host.getAttribute('data-c') ?? 5);
    host.replaceChildren(threeFormsRosettaStrip({ a, b, c }));
  });

  // 3. Montar los 10 bloques de chequeo conceptual (30 preguntas)
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

  // Restaurar checkmarks de la barra lateral para secciones ya completadas
  for (const sectionId of solvedSections) {
    const link = document.querySelector(`.seq-sidebar__link[data-sec="${sectionId}"] .seq-sidebar__status`);
    if (link) {
      link.replaceChildren(chalkIcon('check', 14));
      link.classList.add('is-done');
    }
  }

  // 4. Montar módulo de Retos (8 Familias PRNG + 5 Trampas)
  const retosHost = document.getElementById('quad-challenges');
  if (retosHost) {
    mountQuadraticRetos(retosHost);
  }

  // 5. Panel de Competencias y Atlas de Errores en #sec-repaso
  const dashboardHost = document.getElementById('quad-competency-dashboard');
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
      },
    });
  }

  // 6. Botones de impresión en #sec-repaso
  qsa('[data-print-sheet]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print();
      }
    });
  });

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
  mountQuadraticRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateQuadChallenge,
  generateQuadChallenges,
  makeChallenge,
  makeChallenges,
  TRAPS,
  mulberry32,
  QUAD_COMPETENCIES,
  QUADRATICS_COMPETENCIES,
  ERROR_TAXONOMY,
  DIAGNOSTIC_TO_TAXONOMY,
  PROGRESS_KEY,
  getProgress,
  saveProgress,
  markSectionCompleted,
  mountCompetencyDashboard,
  getCompetencyReport,
};
