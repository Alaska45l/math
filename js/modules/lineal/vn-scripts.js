/**
 * @file js/modules/lineal/vn-scripts.js
 * 10 guiones artesanales de Alaska (5 principales de 6 globos + 5 "Base desde cero" de 5 globos)
 * en voseo rioplatense natural, con reacciones diagnósticas y de racha.
 *
 * Cero plantillas, cero emojis Unicode, cero LaTeX crudo, máximo 2 eureka en todo el módulo.
 */

import { LINEAR_DIAGNOSTIC_DEFINITIONS } from './logic.js';

export const VN_SCRIPTS = {
  'sec1-pendiente': [
    {
      pose: 'base',
      tag: 'La escalera constante',
      highlightSelector: '[data-widget="constructor-rectas"]',
      html: 'Una función lineal <span class="eq">f(x) = mx + b</span> no tiene misterios escondidos: es el único modelo donde la tasa de cambio entre dos puntos cualesquiera da siempre el mismo número, sin importar qué tan lejos los elijas sobre la recta.',
    },
    {
      pose: 'pensativa',
      tag: 'Subida sobre avance',
      highlightSelector: '[data-widget="constructor-rectas"]',
      html: 'Fijate en el triángulo punteado del pizarrón entre <span class="eq">P</span> y <span class="eq">Q</span>. La pendiente <span class="eq">m</span> mide cuánto cambia <span class="eq">y</span> arriba por cada paso unitario que avanzás en <span class="eq">x</span> hacia la derecha.',
    },
    {
      pose: 'explicando',
      tag: 'El peligro de dividir por cero',
      highlightSelector: '[data-widget="constructor-rectas"]',
      html: '¿Y si apilás <span class="eq">Q</span> justo encima de <span class="eq">P</span> con <span class="eq">x<sub>1</sub> = x<sub>2</sub></span>? Entonces <span class="eq">Δx = 0</span> y dividir por cero explota: la recta queda vertical, no tiene pendiente y deja de ser función.',
    },
    {
      pose: 'evaluando',
      tag: 'Ordenada vs raíz',
      highlightSelector: '[data-widget="constructor-rectas"]',
      html: 'Probá ahora en el tablero con el preset <span class="eq">f(x) = &minus;<span class="fr"><span class="top">8</span><span class="bot">3</span></span>x + 4</span>. Mirá dónde corta al eje <span class="eq">Y</span> y en qué abscisa <span class="eq">x<sub>0</sub></span> cruza al eje <span class="eq">X</span>.',
    },
    {
      pose: 'complice',
      tag: 'Atajo para C⁺ y C⁻',
      html: 'Te paso un secreto para no confundirte en el parcial: los conjuntos <span class="eq">C<sup>+</sup></span> y <span class="eq">C<sup>&minus;</sup></span> siempre se leen sobre el eje <span class="eq">X</span> partiendo desde la raíz <span class="eq">x<sub>0</sub></span>, jamás usando la altura <span class="eq">b</span>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Biyectividad en ℝ',
      html: 'Si <span class="eq">m &ne; 0</span>, la recta oblicua barre todo el eje <span class="eq">Y</span> sin repetir alturas: es biyectiva en <span class="eq">ℝ</span>. Pero apenas <span class="eq">m = 0</span>, la recta horizontal repite siempre <span class="eq">b</span> y pierde la biyectividad.',
    },
  ],

  'sec1-base': [
    {
      pose: 'empatia',
      tag: 'Paso a paso desde cero',
      html: 'Tranquila, al principio cuesta acordarse qué va arriba y qué va abajo en la fórmula de la pendiente. No te la aprendas de memoria como un trabalenguas: pensá en una rampa o una escalera común.',
    },
    {
      pose: 'explicando',
      tag: 'Altura primero, avance después',
      highlightSelector: '[data-widget="constructor-rectas"]',
      html: 'Una rampa empinada sube mucho en vertical mientras avanzás poco en horizontal. Por eso en <span class="eq">m = <span class="fr"><span class="top">y<sub>2</sub> &minus; y<sub>1</sub></span><span class="bot">x<sub>2</sub> &minus; x<sub>1</sub></span></span></span> la diferencia de alturas <span class="eq">y</span> siempre manda en el numerador y el avance <span class="eq">x</span> va abajo.',
    },
    {
      pose: 'pensativa',
      tag: 'Respetar el orden',
      html: 'El único cuidado sagrado al restar coordenadas negativas es respetar el orden de los puntos: si arriba arrancaste con <span class="eq">y<sub>2</sub></span> menos <span class="eq">y<sub>1</sub></span>, abajo tenés que arrancar con <span class="eq">x<sub>2</sub></span> menos <span class="eq">x<sub>1</sub></span>, sin darlos vuelta.',
    },
    {
      pose: 'explicando',
      tag: 'Cómo nace b',
      html: 'Una vez que calculaste <span class="eq">m</span>, la ordenada al origen <span class="eq">b</span> es simplemente la altura donde la recta cruza el eje vertical en <span class="eq">x = 0</span>. Reemplazás uno de tus puntos y despejás <span class="eq">b</span> en un renglón.',
    },
    {
      pose: 'feliz',
      tag: 'Lista para probar',
      highlightSelector: '[data-widget="constructor-rectas"]',
      html: 'Mové los puntos <span class="eq">P</span> y <span class="eq">Q</span> en el pizarrón hasta que tengan distinta altura y mirá cómo la cuenta del triángulo coincide exactamente con el dibujo. Cuando lo ves, no te lo olvidás más.',
    },
  ],

  'sec2-formas': [
    {
      pose: 'base',
      tag: 'Tres vestidos, una recta',
      highlightSelector: '[data-widget="traductor-formas"]',
      html: 'Una misma recta del plano se puede escribir con tres disfraces distintos según qué dato te convenga mostrar de entrada: explícita, implícita o segmentaria. El objeto geométrico dibujado no cambia ni un milímetro.',
    },
    {
      pose: 'explicando',
      tag: 'La pendiente es tangente',
      highlightSelector: '[data-widget="traductor-formas"]',
      html: 'Cuando la recta forma un ángulo <span class="eq">&alpha;</span> con el semieje positivo <span class="eq">+X</span>, el cateto opuesto sobre el adyacente del triángulo rectángulo da <span class="eq">m = tg(&alpha;)</span>. Para <span class="eq">45&deg;</span> vale <span class="eq">1</span>; para <span class="eq">135&deg;</span> cae a <span class="eq">&minus;1</span>.',
    },
    {
      pose: 'pensativa',
      tag: 'El regalo de la segmentaria',
      highlightSelector: '[data-widget="traductor-formas"]',
      html: 'Mirá qué cómoda es la forma segmentaria <span class="eq"><span class="fr"><span class="top">x</span><span class="bot">a</span></span> + <span class="fr"><span class="top">y</span><span class="bot">b</span></span> = 1</span>: sin hacer ninguna cuenta, te canta directamente los dos cortes con los ejes en <span class="eq">(a; 0)</span> y <span class="eq">(0; b)</span>.',
    },
    {
      pose: 'lentes-brillo',
      tag: 'Casos degenerados',
      highlightSelector: '[data-widget="traductor-formas"]',
      html: 'Acá viene la pregunta favorita de cátedra: ¿todas las rectas tienen forma segmentaria? ¡No! Si pasa por <span class="eq">(0; 0)</span>, es horizontal o es vertical, algún denominador valdría cero y la segmentaria colapsa.',
    },
    {
      pose: 'eureka',
      tag: 'La implícita nunca falla',
      highlightSelector: '[data-widget="traductor-formas"]',
      html: 'En cambio la ecuación implícita <span class="eq">ax + by + c = 0</span> es universal: representa rectas oblicuas, horizontales, rectas por el origen y hasta rectas verticales <span class="eq">x = k</span> donde la forma explícita ni siquiera existe.',
    },
    {
      pose: 'evaluando',
      tag: 'Probá las degeneraciones',
      highlightSelector: '[data-widget="traductor-formas"]',
      html: 'Hacé clic en los tres presets de casos degenerados en el traductor del pizarrón y fijate cuál de las tres tarjetas se apaga con alerta en cada situación.',
    },
  ],

  'sec2-base': [
    {
      pose: 'empatia',
      tag: 'No son temas separados',
      html: 'Es súper normal marearse cuando un ejercicio te tira tres nombres raros para la misma recta. Pensalo así: es como decir «un metro», «cien centímetros» o «mil milímetros» para la misma regla.',
    },
    {
      pose: 'explicando',
      tag: 'De implícita a explícita',
      highlightSelector: '[data-widget="traductor-formas"]',
      html: 'Si tenés <span class="eq">2x + 3y &minus; 6 = 0</span> y querés pasar a explícita, solo despejás <span class="eq">y</span> como en cualquier ecuación común: dejás <span class="eq">3y = &minus;2x + 6</span> y dividís todo por <span class="eq">3</span> para llegar a <span class="eq">y = &minus;<span class="fr"><span class="top">2</span><span class="bot">3</span></span>x + 2</span>.',
    },
    {
      pose: 'complice',
      tag: 'Truco para la segmentaria',
      highlightSelector: '[data-widget="traductor-formas"]',
      html: '¿Y para pasar rápido a segmentaria sin memorizar nada? Pasá el término independiente al otro lado (<span class="eq">2x + 3y = 6</span>) y dividí todo por ese número <span class="eq">6</span> para fabricar el <span class="eq">1</span> obligatorio en la derecha.',
    },
    {
      pose: 'pensativa',
      tag: 'Cuando el 0 molesta',
      html: 'Probá ese truco con <span class="eq">2x + 3y = 0</span>: al querer dividir todo por <span class="eq">0</span> para fabricar un <span class="eq">1</span>, te quedás trabada al instante. Ahí ves con tus propios ojos por qué las rectas por el origen no tienen segmentaria.',
    },
    {
      pose: 'feliz',
      tag: 'Ángulos con calma',
      highlightSelector: '[data-widget="traductor-formas"]',
      html: 'Y sobre el ángulo <span class="eq">&alpha;</span>, recordá siempre medirlo en sentido antihorario desde la parte derecha del eje <span class="eq">X</span>: si la recta baja, <span class="eq">&alpha;</span> es obtuso y su tangente da negativa.',
    },
  ],

  'sec3-posiciones': [
    {
      pose: 'base',
      tag: 'Dos rectas en el mismo plano',
      highlightSelector: '[data-widget="paralelas-perpendiculares"]',
      html: 'Cuando dibujás dos rectas en un mismo plano cartesiano solo hay cuatro escenarios posibles: paralelas separadas, paralelas superpuestas, secantes oblicuas o secantes perpendiculares formando exactamente <span class="eq">90&deg;</span>.',
    },
    {
      pose: 'explicando',
      tag: 'Misma inclinación',
      highlightSelector: '[data-widget="paralelas-perpendiculares"]',
      html: 'Si dos rectas no verticales tienen igual pendiente <span class="eq">m<sub>1</sub> = m<sub>2</sub></span>, suben al mismo ritmo y jamás se cruzan salvo que compartan también la ordenada al origen <span class="eq">b<sub>1</sub> = b<sub>2</sub></span>, caso en que son la misma recta.',
    },
    {
      pose: 'pensativa',
      tag: 'El giro de 90 grados',
      highlightSelector: '[data-widget="paralelas-perpendiculares"]',
      html: 'Para girar una rampa <span class="eq">90&deg;</span>, lo que era avance horizontal <span class="eq">&Delta;x</span> pasa a ser caída vertical, y lo que era subida <span class="eq">&Delta;y</span> se vuelve avance. Por eso la pendiente se invierte Y cambia de signo: <span class="eq">m<sub>2</sub> = &minus;<span class="fr"><span class="top">1</span><span class="bot">m<sub>1</sub></span></span></span>.',
    },
    {
      pose: 'complice',
      tag: 'El atajo del producto',
      html: 'Una forma comodísima de verificar perpendicularidad en un examen es multiplicar ambas pendientes: si <span class="eq">m<sub>1</sub> &middot; m<sub>2</sub> = &minus;1</span>, el ángulo es recto seguro. Si te da <span class="eq">+1</span>, ¡faltó el signo menos!',
    },
    {
      pose: 'lentes-brillo',
      tag: 'Horizontal vs Vertical',
      highlightSelector: '[data-widget="paralelas-perpendiculares"]',
      html: 'Cuidado con el caso límite donde la fórmula <span class="eq">&minus;<span class="fr"><span class="top">1</span><span class="bot">m<sub>1</sub></span></span></span> se rompe: una recta horizontal (<span class="eq">m = 0</span>) es perpendicular a cualquier recta vertical (<span class="eq">x = k</span>) por geometría directa, jamás dividiendo por cero.',
    },
    {
      pose: 'evaluando',
      tag: 'Tu turno en el tablero',
      highlightSelector: '[data-widget="paralelas-perpendiculares"]',
      html: 'Elegí un preset del apunte en el laboratorio, arrastrá el punto de paso <span class="eq">P</span> y observá cómo el cuadradito verde de <span class="eq">90&deg;</span> aparece únicamente cuando se cumple la condición exacta.',
    },
  ],

  'sec3-base': [
    {
      pose: 'empatia',
      tag: 'Paso a paso con los signos',
      html: 'El error número uno acá es tan común que hasta nos pasa apurados: acordarse de dar vuelta la fracción o acordarse de cambiar el signo, pero olvidarse de hacer las dos cosas juntas.',
    },
    {
      pose: 'explicando',
      tag: 'Las dos transformaciones',
      highlightSelector: '[data-widget="paralelas-perpendiculares"]',
      html: 'Si tu recta tiene pendiente <span class="eq">m<sub>1</sub> = <span class="fr"><span class="top">2</span><span class="bot">3</span></span></span> positiva, la perpendicular debe bajar (negativa) y cambiar de proporción: invertís la fracción y le ponés el menos, quedando <span class="eq">m<sub>2</sub> = &minus;<span class="fr"><span class="top">3</span><span class="bot">2</span></span></span>.',
    },
    {
      pose: 'pensativa',
      tag: '¿Y si la recta viene implícita?',
      html: 'Cuando te dan <span class="eq">2x + 3y + 4 = 0</span>, no intentes leer la pendiente mirando el <span class="eq">2</span> suelto delante de la <span class="eq">x</span>. Despejá primero la <span class="eq">y</span> para ver que <span class="eq">m = &minus;<span class="fr"><span class="top">2</span><span class="bot">3</span></span></span>.',
    },
    {
      pose: 'explicando',
      tag: 'Después usás el punto',
      highlightSelector: '[data-widget="paralelas-perpendiculares"]',
      html: 'Con la pendiente correcta en la mano y el punto de paso <span class="eq">B(2; 3)</span>, enchufás <span class="eq">x = 2</span> e <span class="eq">y = 3</span> en <span class="eq">y = mx + b</span> y despejás la nueva ordenada al origen.',
    },
    {
      pose: 'feliz',
      tag: 'Chequeo visual rápido',
      highlightSelector: '[data-widget="paralelas-perpendiculares"]',
      html: 'Antes de entregar, mirá mentalmente el signo: si una recta sube hacia la derecha, cualquier recta perpendicular a ella tiene que bajar. Ese chequeo de dos segundos salva puntos enteros.',
    },
  ],

  'sec4-geometria': [
    {
      pose: 'base',
      tag: 'Pitágoras en coordenadas',
      highlightSelector: '[data-widget="geometria-analitica"]',
      html: 'Toda la geometría métrica del plano nace de armar un triángulo rectángulo con catetos horizontales <span class="eq">|x<sub>2</sub> &minus; x<sub>1</sub>|</span> y verticales <span class="eq">|y<sub>2</sub> &minus; y<sub>1</sub>|</span>. De ahí salen el punto medio y la distancia exacta.',
    },
    {
      pose: 'explicando',
      tag: 'Radicales exactos, sin redondear',
      highlightSelector: '[data-widget="geometria-analitica"]',
      html: 'En Exactas preferimos la longitud exacta <span class="eq">&radic;50 = 5&radic;2</span> antes que una aproximación decimal cortada. Y para clasificar un triángulo o verificar si tres puntos están alineados, comparar <span class="eq">d<sup>2</sup></span> evita hasta los errores de redondeo.',
    },
    {
      pose: 'eureka',
      tag: 'El secreto de la mediatriz',
      highlightSelector: '[data-widget="geometria-analitica"]',
      html: 'Mirá el Modo B del tablero: la mediatriz de <span class="eq">PQ</span> no es solo «la perpendicular que pasa por el punto medio <span class="eq">M</span>». Es el lugar geométrico exacto de todos los puntos <span class="eq">X</span> que están a igual distancia de <span class="eq">P</span> y de <span class="eq">Q</span>.',
    },
    {
      pose: 'pensativa',
      tag: 'La distancia más corta a una recta',
      highlightSelector: '[data-widget="geometria-analitica"]',
      html: '¿Cómo medís la distancia desde un punto <span class="eq">P</span> hasta una recta <span class="eq">r</span> si hay infinitos puntos sobre ella? Bajando en caída perpendicular hasta el pie ortogonal <span class="eq">H</span>.',
    },
    {
      pose: 'complice',
      tag: 'Fórmula con módulo',
      highlightSelector: '[data-widget="geometria-analitica"]',
      html: 'Esa proyección ortogonal se resume en <span class="eq">d(P; r) = <span class="fr"><span class="top">|Ax<sub>0</sub> + By<sub>0</sub> + C|</span><span class="bot">&radic;(A<sup>2</sup> + B<sup>2</sup>)</span></span></span>. Nunca te olvides las barras de módulo arriba ni la raíz cuadrada abajo.',
    },
    {
      pose: 'evaluando',
      tag: 'Explorá los 3 modos',
      highlightSelector: '[data-widget="geometria-analitica"]',
      html: 'Cambiá entre Triángulos, Mediatriz y Distancia Punto-Recta en el pizarrón, mové el punto prueba <span class="eq">X</span> y comprobá en vivo cómo <span class="eq">d(X; P)</span> y <span class="eq">d(X; Q)</span> quedan idénticas.',
    },
  ],

  'sec4-base': [
    {
      pose: 'empatia',
      tag: 'Desarmando las fórmulas',
      html: 'Ver tres o cuatro fórmulas juntas en Geometría Analítica asusta a cualquiera, pero si mirás de dónde viene cada una vas a ver que en el fondo ya las sabías usar.',
    },
    {
      pose: 'explicando',
      tag: 'El punto medio es un promedio',
      highlightSelector: '[data-widget="geometria-analitica"]',
      html: 'Si sacaste un <span class="eq">4</span> y un <span class="eq">10</span> en dos exámenes, el promedio es <span class="eq">(4 + 10)/2 = 7</span>. El punto medio <span class="eq">M</span> hace exactamente lo mismo: promedia las <span class="eq">x</span> por un lado y promedia las <span class="eq">y</span> por el otro.',
    },
    {
      pose: 'explicando',
      tag: 'Mediatriz en dos pasos',
      highlightSelector: '[data-widget="geometria-analitica"]',
      html: 'Para armar la mediatriz de <span class="eq">PQ</span> sin enredarte: paso 1, calculás el punto medio <span class="eq">M</span>; paso 2, hallás la recta perpendicular al segmento pasando por ese punto <span class="eq">M</span>. Nunca la hagas pasar por <span class="eq">P</span> ni por <span class="eq">Q</span>.',
    },
    {
      pose: 'pensativa',
      tag: 'Distancia con ecuación implícita',
      highlightSelector: '[data-widget="geometria-analitica"]',
      html: 'Antes de usar la fórmula de distancia punto-recta, pasá siempre la recta a su forma implícita <span class="eq">Ax + By + C = 0</span>. Si dejás la <span class="eq">y</span> del otro lado sin pasarla, el signo de <span class="eq">B</span> te queda al revés.',
    },
    {
      pose: 'feliz',
      tag: 'Distancia siempre positiva',
      html: 'Y acordate: una distancia jamás puede dar negativa ni quedar al cuadrado. Si la cuenta de arriba dio negativa, las barras de valor absoluto la vuelven positiva al instante.',
    },
  ],

  'sec5-tramos': [
    {
      pose: 'base',
      tag: 'Modelos y fronteras',
      highlightSelector: '[data-widget="tramos-lineal"]',
      html: 'En problemas reales de tanques, tarifas de tren o conversión de temperaturas, la pendiente <span class="eq">m</span> tiene unidades físicas concretas y la ordenada <span class="eq">b</span> marca el estado inicial en <span class="eq">t = 0</span>.',
    },
    {
      pose: 'explicando',
      tag: 'Una función, varias reglas',
      highlightSelector: '[data-widget="tramos-lineal"]',
      html: 'Una función lineal por tramos aplica fórmulas distintas según en qué zona del eje <span class="eq">X</span> caiga tu entrada. Lo primero que mirás es la condición (<span class="eq">x &lt; 0</span>, <span class="eq">0 &le; x &lt; 4</span>, <span class="eq">x &ge; 4</span>) para saber qué renglón se activa.',
    },
    {
      pose: 'pensativa',
      tag: 'El borde abierto manda',
      highlightSelector: '[data-widget="tramos-lineal"]',
      html: 'Mirá el salto en <span class="eq">x = 0</span> del tramo izquierdo <span class="eq">&minus;2x &minus; 1</span> para <span class="eq">x &lt; 0</span>: a medida que <span class="eq">x</span> se acerca a <span class="eq">0</span> desde la izquierda, la altura se acerca a <span class="eq">&minus;1</span>, pero nunca llega a tocar <span class="eq">&minus;1</span>.',
    },
    {
      pose: 'complice',
      tag: 'Paréntesis abierto en la imagen',
      highlightSelector: '[data-widget="tramos-lineal"]',
      html: 'Por ese círculo hueco en <span class="eq">(0; &minus;1)</span>, la imagen de toda la función queda con paréntesis abierto <span class="eq">(&minus;1; +&infin;)</span> y nunca con corchete cerrado. Un detalle milimétrico que define medio ejercicio de parcial.',
    },
    {
      pose: 'evaluando',
      tag: 'Unicidad y biyectividad',
      highlightSelector: '[data-widget="tramos-lineal"]',
      html: 'Deslizá la sonda vertical <span class="eq">x</span> en el tablero de tramos y observá qué pasa en los bordes: cada <span class="eq">x</span> tiene a lo sumo un punto cerrado, pero el tramo constante horizontal impide que sea inyectiva.',
    },
    {
      pose: 'orgullosa',
      tag: 'Todo conectado',
      html: 'Ya dominás pendiente, formas de la recta, perpendicularidad, mediatriz y tramos. Con estas herramientas tenés cubierta la base lineal para enfrentar sistemas de ecuaciones sin tropezar.',
    },
  ],

  'sec5-base': [
    {
      pose: 'empatia',
      tag: 'Leer la llave por partes',
      html: 'Cuando aparece una llave grande con tres fórmulas una abajo de la otra parece un monstruo, pero en realidad es como una tarifa por horarios: según a qué hora entrás, pagás una tarifa u otra.',
    },
    {
      pose: 'explicando',
      tag: 'Primero mirá la condición',
      highlightSelector: '[data-widget="tramos-lineal"]',
      html: 'Si te piden calcular <span class="eq">f(0)</span>, nunca metas el <span class="eq">0</span> en las tres fórmulas juntas. Buscá primero en qué condición entra el <span class="eq">0</span> (la que tiene el signo <span class="eq">&le;</span> o <span class="eq">&ge;</span>) y usá únicamente ese renglón.',
    },
    {
      pose: 'pensativa',
      tag: 'Círculo relleno vs hueco',
      highlightSelector: '[data-widget="tramos-lineal"]',
      html: 'En el gráfico, el signo <span class="eq">&le;</span> se dibuja con un punto relleno porque ese borde pertenece al tramo, mientras que <span class="eq">&lt;</span> se dibuja con un círculo hueco para avisar que el borde no entra.',
    },
    {
      pose: 'explicando',
      tag: 'Leer la imagen desde abajo',
      html: 'Para leer la imagen de abajo hacia arriba en el eje <span class="eq">Y</span>, fijate cuál es la altura más baja que toca o roza la curva: si llega con círculo hueco en <span class="eq">&minus;1</span>, arrancás con paréntesis abierto <span class="eq">(&minus;1; +&infin;)</span>.',
    },
    {
      pose: 'feliz',
      tag: 'A practicar en el tablero',
      highlightSelector: '[data-widget="tramos-lineal"]',
      html: 'Cambiá entre el ejemplo del apunte, la represa y la tarifa escalonada en el simulador de abajo y probá mover la sonda vertical por cada frontera.',
    },
  ],
};

export const SCRIPTS = VN_SCRIPTS;

export const DIAGNOSE_REACTIONS = Object.freeze(
  Object.fromEntries(
    Object.entries(LINEAR_DIAGNOSTIC_DEFINITIONS).map(([id, def]) => [
      id,
      {
        id: def.id,
        pose: def.pose,
        tag: def.tag,
        text: def.message,
      },
    ])
  )
);

export const STREAK_REACTIONS = Object.freeze({
  firstTry: {
    pose: 'orgullosa',
    tag: 'A la primera',
    text: '¡Impecable al primer intento y sin pistas! Leíste bien la geometría antes de hacer cuentas.',
  },
  recovered: {
    pose: 'feliz',
    tag: 'Error corregido',
    text: '¡Bien ahí! Detectaste el detalle que te trababa y lo diste vuelta con criterio.',
  },
  repeatedError: {
    pose: 'enojada',
    tag: 'Frená y mirá el signo',
    text: '¡Pará la mano con los intentos al azar! Abrí la pista progresiva y revisá cada paso sobre el eje correcto.',
  },
  flawlessRun: {
    pose: 'sonrojada',
    tag: 'Bloque impecable',
    text: 'C-completaste todo el pizarrón sin un solo error ni pista... Bueno, admito que estuviste brillante.',
  },
  showSolution: {
    pose: 'colapso',
    tag: 'Solución revelada',
    text: 'Ahí tenés el desarrollo paso a paso. Estudialo bien y después intentá otro parecido sin mirar.',
  },
  solutionAfter: {
    pose: 'empatia',
    tag: 'Para retomar impulso',
    text: 'Ver la solución sirve para destrabar el planteo. La próxima vez probá llegar hasta el segundo paso antes de mirar.',
  },
  1: {
    pose: 'feliz',
    tag: 'Buen comienzo',
    text: 'Primer acierto independiente registrado. Seguí leyendo con ese mismo rigor.',
  },
  2: {
    pose: 'orgullosa',
    tag: 'Racha de 2',
    text: 'Dos seguidos sin ayudas. Estás conectando el dibujo con el álgebra sin recetas mágicas.',
  },
  3: {
    pose: 'complice',
    tag: 'Racha de 3',
    text: 'Tres aciertos limpios al hilo. Ya le agarraste la vuelta a la notación de Exactas.',
  },
  5: {
    pose: 'sonrojada',
    tag: 'Racha de 5',
    text: '¡Cinco aciertos independientes seguidos! N-no te agrandes, pero venís con nivel de parcial aprobado.',
  },
});
