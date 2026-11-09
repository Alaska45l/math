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
      family: 'calculo_discriminante',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['neg_b_or_square_sign_in_resolvente'],
      kind: 'number',
      prompt:
        'Calculá el valor exacto del discriminante Δ = b² − 4ac para la ecuación x² − 6x + 2 = 0:',
      expected: 28,
      placeholder: 'Ej: 28',
      diagContext: { target: 'discriminant', a: 1, b: -6, c: 2 },
      hints: [
        'Anotá los tres coeficientes con sus signos: a = 1, b = −6 y c = 2.',
        'Al elevar b = −6 al cuadrado encerralo entre paréntesis: (−6)² = (−6)·(−6) = +36 positivo.',
        'Efectuá la resta entre b² = (−6)² = 36 y el término 4·a·c = 4·1·2 para obtener el valor numérico exacto del discriminante.',
      ],
      solution:
        'Δ = (−6)² − 4·1·2 = 36 − 8 = 28 > 0 (y sus raíces exactas simplificadas son 3 − √7 y 3 + √7).',
    },
    {
      id: 'sec7-q2',
      competencyId: 'quadratics.discriminant_and_vieta',
      prerequisiteIds: ['quadratics.completing_the_square', 'quadratics.factored_form_and_symmetry'],
      family: 'discriminante_parametro',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['neg_b_or_square_sign_in_resolvente'],
      kind: 'number',
      prompt:
        '¿Qué valor positivo debe tomar el parámetro k para que la ecuación x² − kx + 9 = 0 tenga una única raíz real doble (parábola tangente al eje X)?',
      expected: 6,
      placeholder: 'Ej: 6',
      diagContext: { target: 'discriminant', a: 1, b: -6, c: 9 },
      hints: [
        'Para que las dos raíces colisionen en una única raíz doble, el discriminante bajo la raíz cuadrada tiene que valer exactamente cero: Δ = 0.',
        'Planteá b² − 4ac = 0 con a = 1, b = −k y c = 9: te queda (−k)² − 4·1·9 = k² − 36 = 0.',
        'Planteá la raíz cuadrada del término independiente para despejar el valor absoluto |k| y seleccioná la solución estrictamente positiva.',
      ],
      solution:
        'Exigiendo Δ = (−k)² − 4·1·9 = k² − 36 = 0 obtenemos |k| = 6; el valor positivo buscado es k = 6.',
    },
    {
      id: 'sec7-q3',
      competencyId: 'quadratics.discriminant_and_vieta',
      prerequisiteIds: ['quadratics.completing_the_square', 'quadratics.factored_form_and_symmetry'],
      family: 'cardano_vieta_suma',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['confused_sum_product_signs_vieta'],
      kind: 'number',
      prompt:
        'Sin calcular las raíces por separado, usá Cardano-Vieta para hallar cuánto vale la suma de las raíces x₁ + x₂ en la ecuación 2x² − 14x + 19 = 0:',
      expected: 7,
      placeholder: 'Ej: 7',
      diagContext: { target: 'vieta_sum', a: 2, b: -14, c: 19 },
      hints: [
        'Por las relaciones de Cardano-Vieta, la suma de las dos raíces de ax² + bx + c = 0 es siempre x₁ + x₂ = −b / a.',
        '¡Ojo con el doble signo menos! Acá el coeficiente lineal es b = −14 y el principal es a = 2.',
        'Aplicá la regla de los signos para simplificar −(−14) en el numerador y dividilo por 2 para concluir el valor de la suma.',
      ],
      solution:
        'Por Cardano-Vieta, la suma de las raíces es x₁ + x₂ = −b/a = −(−14)/2 = 7.',
    },
  ],

  'sec-radiografia-cuadratica': [
    {
      id: 'sec8-q1',
      competencyId: 'quadratics.full_analysis_exactas',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.discriminant_and_vieta'],
      family: 'imagen_parabola',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['used_yv_for_monotonicity_or_open_image'],
      kind: 'set',
      prompt:
        'Dada la función f(x) = 16 − (x − 4)², escribí su conjunto Imagen Im(f) en notación de intervalo:',
      expected: '(-inf; 16]',
      placeholder: 'Ej: (-inf; 16]',
      diagContext: {
        target: 'image',
        a: -1,
        b: 8,
        c: 0,
        xv: 4,
        yv: 16,
      },
      hints: [
        'Reordená mentalmente la forma canónica como f(x) = −(x − 4)² + 16: su vértice está en V(4; 16) y su coeficiente principal es a = −1 < 0.',
        'Como a < 0, las ramas abren hacia abajo y la altura yᵥ = 16 es el techo máximo que alcanza la curva sobre el eje Y.',
        'Escribí el intervalo que arranca en −inf y llega hasta la altura máxima del vértice yᵥ = 16, prestando atención a cerrar con corchete en el valor alcanzado.',
      ],
      solution:
        'Con vértice en (4; 16) y concavidad hacia abajo (a = −1 < 0), las alturas cubren desde −∞ hasta 16 inclusive: Im(f) = (−∞; 16].',
    },
    {
      id: 'sec8-q2',
      competencyId: 'quadratics.full_analysis_exactas',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.discriminant_and_vieta'],
      family: 'intervalo_crecimiento',
      representation: 'graphical',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['used_yv_for_monotonicity_or_open_image'],
      kind: 'set',
      prompt:
        'Para f(x) = −(x + 3)² + 1, cuyo vértice es V(−3; 1), indicá su intervalo de crecimiento I↑ mirando el eje correspondiente:',
      expected: '(-inf; -3)',
      placeholder: 'Ej: (-inf; -3)',
      diagContext: {
        target: 'increasing',
        a: -1,
        b: -6,
        c: -8,
        xv: -3,
        yv: 1,
      },
      hints: [
        '¡Prohibido usar el 1 de la altura! Los intervalos de crecimiento y decrecimiento se leen exclusivamente sobre el piso del eje X.',
        'El eje de simetría parte el dominio en la abscisa del vértice xᵥ = −3.',
        'Considerá que la curva asciende desde el extremo izquierdo de la recta real hasta la abscisa del vértice xᵥ = −3 y expresalo en notación de intervalo abierto.',
      ],
      solution:
        'Mirando el eje X, la parábola sube desde la izquierda hasta la abscisa del vértice xᵥ = −3: I↑ = (−∞; −3).',
    },
    {
      id: 'sec8-q3',
      competencyId: 'quadratics.full_analysis_exactas',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.discriminant_and_vieta'],
      family: 'conjunto_negatividad',
      representation: 'graphical',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['used_yv_for_monotonicity_or_open_image'],
      kind: 'set',
      prompt:
        'La parábola f(x) = −2(x − 1)² rebota en el eje X en su raíz doble x = 1 y abre hacia abajo. ¿Cuál es su conjunto de negatividad C⁻?',
      expected: '(-inf; 1) U (1; +inf)',
      placeholder: 'Ej: (-inf; 1) U (1; +inf) o R - {1}',
      diagContext: {
        target: 'CMinus',
        a: -2,
        b: 4,
        c: -2,
        xv: 1,
        yv: 0,
      },
      hints: [
        'Preguntate qué signo tiene −2(x − 1)²: el cuadrado (x − 1)² es siempre positivo salvo en x = 1 donde vale exactamente cero.',
        'Al multiplicar por −2 negativo, la función queda estrictamente bajo el eje X (negativa) en todos los números reales excepto en x = 1 (donde vale 0 y no es negativa).',
        'Expresá la unión de los dos intervalos abiertos que cubren toda la recta real excepto el único punto x = 1 donde la función se hace cero.',
      ],
      solution:
        'En x = 1 vale 0 (pertenece a C₀) y en cualquier otro real es estrictamente negativa: C⁻ = (−∞; 1) ∪ (1; +∞) = ℝ − {1}.',
    },
  ],

  'sec-interseccion-recta-parabola': [
    {
      id: 'sec9-q1',
      competencyId: 'quadratics.parabola_line_tangency',
      prerequisiteIds: ['quadratics.discriminant_and_vieta'],
      family: 'tangencia_recta_parabola',
      representation: 'verbal',
      difficulty: 2,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['neg_b_or_square_sign_in_resolvente', 'confused_c_with_canonical_k'],
      kind: 'choice',
      prompt:
        'Queremos saber cuántos puntos de intersección tienen la parábola f(x) = x² − 2x + 3 y la recta g(x) = 2x − 1. ¿Qué ocurre al igualarlas?',
      options: [
        {
          label: 'Son tangentes en un único punto (2; 3), porque al igualar queda x² − 4x + 4 = (x − 2)² = 0 con Δ_int = 0.',
          correct: true,
        },
        {
          label: 'Son secantes en dos puntos porque el discriminante de f(x) se suma con la pendiente.',
          correct: false,
          diagnosticId: 'neg_b_or_square_sign_in_resolvente',
        },
        {
          label: 'No se cortan en ningún punto (recta exterior) porque f(x) no tiene raíces reales.',
          correct: false,
          diagnosticId: 'confused_c_with_canonical_k',
        },
      ],
      hints: [
        'Que la parábola f(x) sola no corte al eje X no impide que se cruce con la recta g(x): lo que importa es la ecuación igualada f(x) = g(x).',
        'Igualá x² − 2x + 3 = 2x − 1 y pasá 2x restando y 1 sumando al primer miembro: te queda x² − 4x + 4 = 0.',
        'Calculá el discriminante Δ de la ecuación cuadrática diferencia x² − 4x + 4 = 0: un discriminante nulo indica exactamente un punto de contacto.',
      ],
      solution:
        'La ecuación diferencia es x² − 4x + 4 = (x − 2)² = 0 (Δ_int = 0), por lo que la recta es tangente a la parábola en el punto (2; 3).',
    },
    {
      id: 'sec9-q2',
      competencyId: 'quadratics.parabola_line_tangency',
      prerequisiteIds: ['quadratics.discriminant_and_vieta'],
      family: 'tangencia_parametro_k',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['neg_b_or_square_sign_in_resolvente'],
      kind: 'set',
      prompt:
        'Hallá el conjunto de los dos valores del parámetro k para los cuales la recta y = kx − 1 resulta tangente a la parábola y = x² + 2x + 3:',
      expected: '{-2; 6}',
      placeholder: 'Ej: {-2; 6}',
      diagContext: { target: 'roots', a: 1, b: -4, c: -12 },
      hints: [
        'Igualá la parábola con la recta: x² + 2x + 3 = kx − 1, y pasá todo a la izquierda agrupando los términos con x: x² + (2 − k)x + 4 = 0.',
        'Exigí la condición de tangencia Δ_int = 0: el coeficiente lineal al cuadrado menos 4·a·c debe anularse, es decir (2 − k)² − 4·1·4 = (2 − k)² − 16 = 0.',
        'Despejá k en las dos ramas lineales 2 − k = 4 y 2 − k = −4 y anotá ambos valores entre llaves separados por punto y coma.',
      ],
      solution:
        'En x² + (2 − k)x + 4 = 0 imponemos Δ_int = (2 − k)² − 16 = 0 ⇒ |2 − k| = 4, obteniendo k₁ = −2 y k₂ = 6: conjunto {−2; 6}.',
    },
    {
      id: 'sec9-q3',
      competencyId: 'quadratics.parabola_line_tangency',
      prerequisiteIds: ['quadratics.discriminant_and_vieta'],
      family: 'punto_contacto_tangente',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['inverted_vertex_h_sign'],
      kind: 'pair',
      prompt:
        'La parábola y = x² − 4x + 5 y la recta horizontal y = 1 son tangentes. ¿Cuáles son las coordenadas (x; y) de su único punto de contacto?',
      expected: '(2; 1)',
      placeholder: 'Ej: (2; 1)',
      diagContext: { target: 'vertex', a: 1, b: -4, c: 5, xv: 2, yv: 1 },
      hints: [
        'Igualá ambas alturas: x² − 4x + 5 = 1, y restá 1 en ambos lados para obtener x² − 4x + 4 = 0.',
        'Reconocé el trinomio cuadrado perfecto (x − 2)² = 0, cuya única solución es la abscisa de contacto x = 2.',
        'Uní la abscisa x = 2 con la altura constante y = 1 de la recta tangente en un par ordenado (x; y).',
      ],
      solution:
        'Igualando x² − 4x + 5 = 1 queda (x − 2)² = 0 ⇒ x = 2, con altura y = 1: punto de tangencia (2; 1).',
    },
  ],

  'sec-optimizacion-extremos': [
    {
      id: 'sec10-q1',
      competencyId: 'quadratics.extremum_optimization',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.full_analysis_exactas'],
      family: 'optimizacion_corte_xv',
      representation: 'verbal',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['inverted_vertex_h_sign'],
      kind: 'number',
      prompt:
        'En el problema del cuadrado inscrito dentro de un cuadrado de 16 cm de lado, el área interior en función del corte x es S(x) = 2x² − 32x + 256. ¿Para qué medida de corte x (en cm) se alcanza el área mínima?',
      expected: 8,
      placeholder: 'Ej: 8',
      diagContext: { target: 'xv', a: 2, b: -32, c: 256, xv: 8, yv: 128 },
      hints: [
        'Mirá qué te pide la pregunta: te pide la medida del corte x (la coordenada horizontal xᵥ del vértice), no todavía el valor del área S.',
        'En S(x) = 2x² − 32x + 256 tenés a = 2 > 0 (abre hacia arriba, tiene mínimo) y b = −32.',
        'Efectuá la división de 32 por 2·a = 4 para obtener la longitud del corte en centímetros que minimiza el área interior.',
      ],
      solution:
        'El mínimo de S(x) = 2x² − 32x + 256 ocurre en la abscisa del vértice xᵥ = −(−32)/(2·2) = 8 cm.',
    },
    {
      id: 'sec10-q2',
      competencyId: 'quadratics.extremum_optimization',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.full_analysis_exactas'],
      family: 'optimizacion_area_minima_yv',
      representation: 'verbal',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['used_yv_for_monotonicity_or_open_image'],
      kind: 'number',
      prompt:
        'Continuando con S(x) = 2x² − 32x + 256 para el cuadrado inscrito en el cuadrado de 16 cm de lado, ¿cuál es el valor de esa área mínima (en cm²)?',
      expected: 128,
      placeholder: 'Ej: 128',
      diagContext: { target: 'yv', a: 2, b: -32, c: 256, xv: 8, yv: 128 },
      hints: [
        'Ya sabés por la pregunta anterior que el área mínima se alcanza cuando el corte mide xᵥ = 8 cm.',
        'Para saber cuánto vale esa área mínima yᵥ, evaluá x = 8 en la función S(8) = 2·(8)² − 32·(8) + 256 (o usá Pitágoras con dos catetos de 8 cm: 8² + 8²).',
        'Calculá 2·(64) − 32·(8) + 256 realizando las sumas y restas para hallar el valor numérico en centímetros cuadrados.',
      ],
      solution:
        'Evaluando en el punto medio xᵥ = 8 cm obtenemos S(8) = 8² + (16 − 8)² = 64 + 64 = 128 cm².',
    },
    {
      id: 'sec10-q3',
      competencyId: 'quadratics.extremum_optimization',
      prerequisiteIds: ['quadratics.canonical_form_and_vertex', 'quadratics.full_analysis_exactas'],
      family: 'optimizacion_tiro_vertical',
      representation: 'verbal',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['inverted_vertex_h_sign', 'used_yv_for_monotonicity_or_open_image'],
      kind: 'number',
      prompt:
        'Se lanza una pelota verticalmente hacia arriba y su altura (en metros) a los t segundos está dada por h(t) = −5t² + 20t. ¿Cuál es la altura máxima (en metros) que alcanza la pelota?',
      expected: 20,
      placeholder: 'Ej: 20',
      diagContext: { target: 'yv', a: -5, b: 20, c: 0, xv: 2, yv: 20 },
      hints: [
        'Como a = −5 < 0, la trayectoria altura-tiempo es una parábola cóncava hacia abajo cuya altura máxima es la coordenada vertical del vértice yᵥ.',
        'Primero encontrá en qué instante tᵥ llega a la cima: tᵥ = −b / (2a) = −20 / (2·(−5)) = −20 / (−10) = 2 segundos.',
        'Reemplazá el tiempo t = 2 segundos en la ecuación de h(t) para sumar el término de desaceleración gravitatoria con el impulso lineal.',
      ],
      solution:
        'La pelota alcanza su cumbre a los tᵥ = 2 segundos, logrando una altura máxima de h(2) = −5(4) + 40 = 20 metros.',
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
