/**
 * @file js/modules/sistemas/vn-scripts.js
 * 8 guiones artesanales de Alaska (4 principales de 6 globos + 4 "Base desde cero" de 5 globos)
 * en voseo rioplatense natural, con reacciones diagnósticas y de racha para Unidad 04 · Sistemas 2×2.
 *
 * Cero plantillas, cero emojis Unicode, cero LaTeX crudo, máximo 2 eureka en todo el módulo.
 */

import { SYSTEM_DIAGNOSTIC_DEFINITIONS } from './logic.js';

export const VN_SCRIPTS = {
  'sec1-metodos': [
    {
      pose: 'base',
      tag: 'Dos rectas, un encuentro',
      highlightSelector: '[data-widget="laboratorio-intersecciones"]',
      html: 'Un sistema lineal de dos por dos no es un capricho de cuentas: cada ecuación dibuja una recta en el plano, y resolver el sistema significa encontrar el punto exacto <span class="eq">(x<sub>0</sub>; y<sub>0</sub>)</span> donde ambas rectas se cruzan al mismo tiempo.',
    },
    {
      pose: 'explicando',
      tag: 'Tres caminos al mismo punto',
      highlightSelector: '[data-widget="laboratorio-intersecciones"]',
      html: 'Sustitución, igualación y reducción por suma y resta son tres herramientas para llegar al mismo cruce. Cuando despejás una letra y la metés en la otra ecuación, estás buscando la abscisa <span class="eq">x<sub>0</sub></span> donde comparten altura.',
    },
    {
      pose: 'complice',
      tag: 'Limpiar primero, despejar después',
      highlightSelector: '[data-widget="laboratorio-intersecciones"]',
      html: 'Te tiro un secreto de corrección para ecuaciones con fracciones como <span class="eq"><span class="fr"><span class="top">6x &minus; 3</span><span class="bot">3</span></span> + 3y = 14</span>: antes de sustituir nada, distribuí paréntesis y multiplicá cada renglón por su denominador común.',
    },
    {
      pose: 'pensativa',
      tag: 'Elegir el método más cómodo',
      highlightSelector: '[data-widget="laboratorio-intersecciones"]',
      html: 'Si ya ves <span class="eq">+2y</span> en una fila y <span class="eq">&minus;2y</span> en la otra, sumarlas por reducción te borra la <span class="eq">y</span> en un segundo y te ahorra arrastrar fracciones molestas por media hoja.',
    },
    {
      pose: 'evaluando',
      tag: 'Probalo paso a paso',
      highlightSelector: '[data-widget="laboratorio-intersecciones"]',
      html: 'Cambiá de método arriba del pizarrón entre Sustitución, Igualación y Reducción, avanzá con los pasos y fijate cómo las tres rutas convergen exactamente al mismo punto verde.',
    },
    {
      pose: 'orgullosa',
      tag: 'El par ordenado completo',
      html: 'Acordate siempre del remate: despejar <span class="eq">x<sub>0</sub> = 6</span> es solo la mitad del camino. Hay que volver a cualquiera de las rectas para sacar <span class="eq">y<sub>0</sub> = 1</span> y cerrar <span class="eq">S = {(6; 1)}</span>.',
    },
  ],

  'sec1-base': [
    {
      pose: 'empatia',
      tag: 'Tranquila con las dos incógnitas',
      html: 'Cuando pasás de resolver ecuaciones con una sola letra a sistemas con <span class="eq">x</span> e <span class="eq">y</span> juntas, es normal sentir que falta un dato. Por eso necesitamos dos ecuaciones: cada condición recorta posibilidades hasta dejar un solo punto.',
    },
    {
      pose: 'explicando',
      tag: 'Sustitución en tres pasos',
      highlightSelector: '[data-widget="laboratorio-intersecciones"]',
      html: 'En sustitución elegís la letra más fácil de despejar en una ecuación, la encerrás entre paréntesis y la enchufás en lugar de esa letra dentro de la otra ecuación para quedarte con una sola incógnita.',
    },
    {
      pose: 'pensativa',
      tag: 'Cuidado con el menos delante',
      html: 'Si tenés <span class="eq">x &minus; 3(2y &minus; 1) = 3y</span>, el signo menos delante del <span class="eq">3</span> multiplica a los dos términos de adentro: <span class="eq">&minus;6y + 3</span>. Un solo signo olvidado corre toda la solución.',
    },
    {
      pose: 'explicando',
      tag: 'La prueba de oro',
      html: '¿Querés salir de cualquier examen sabiendo si tu solución <span class="eq">(x<sub>0</sub>; y<sub>0</sub>)</span> está bien? Meté ambos números en las dos ecuaciones originales: tienen que verificar las dos igualdades a la vez.',
    },
    {
      pose: 'feliz',
      tag: 'Tu turno de probar',
      highlightSelector: '[data-widget="laboratorio-intersecciones"]',
      html: 'Elegí el preset con fracciones en el laboratorio de abajo y recorré los cuatro pasos de a uno hasta ver aparecer la intersección verde en el gráfico.',
    },
  ],

  'sec2-clasificacion': [
    {
      pose: 'base',
      tag: 'Tres destinos posibles',
      highlightSelector: '[data-widget="clasificador-scd-sci-si"]',
      html: 'Dos rectas en el plano solo pueden hacer tres cosas: cortarse en un único punto (SCD), correr paralelas sin tocarse nunca (SI) o estar dibujadas exactamente una encima de la otra (SCI).',
    },
    {
      pose: 'explicando',
      tag: 'Cuando las letras desaparecen',
      highlightSelector: '[data-widget="clasificador-scd-sci-si"]',
      html: 'En el pizarrón algebraico te das cuenta enseguida porque al despejar desaparecen tanto <span class="eq">x</span> como <span class="eq">y</span>. Si te queda <span class="eq">0 = 0</span>, es identidad siempre verdadera (SCI); si te queda <span class="eq">0 = 5</span>, es absurdo imposible (SI).',
    },
    {
      pose: 'eureka',
      tag: 'No confundir 0 = 0 con x = 0',
      highlightSelector: '[data-widget="clasificador-scd-sci-si"]',
      html: '¡Ojo con esta conexión clave! Que quede <span class="eq">0&middot;x = 0</span> NO significa que <span class="eq">x</span> valga cero: significa que cualquier número real multiplicado por cero da cero, así que todo punto de la recta es solución.',
    },
    {
      pose: 'pensativa',
      tag: 'Pendiente y ordenada juntas',
      highlightSelector: '[data-widget="clasificador-scd-sci-si"]',
      html: 'Si comparás formas explícitas, ver que <span class="eq">m<sub>1</sub> = m<sub>2</sub></span> solo alcanza para saber que son paralelas. Recién cuando chequeás si <span class="eq">b<sub>1</sub> = b<sub>2</sub></span> decidís entre coincidentes (SCI) y separadas (SI).',
    },
    {
      pose: 'complice',
      tag: 'El radar auxiliar Δ',
      highlightSelector: '[data-widget="clasificador-scd-sci-si"]',
      html: 'Como ampliación visual del tablero podés mirar el indicador <span class="eq">&Delta; = ab&prime; &minus; a&prime;b</span>: si da distinto de cero se cortan seguro en un punto; si da cero son paralelas y pasás a mirar los términos independientes.',
    },
    {
      pose: 'evaluando',
      tag: 'Mové la segunda recta',
      highlightSelector: '[data-widget="clasificador-scd-sci-si"]',
      html: 'Deslizá ahora la ordenada <span class="eq">b<sub>2</sub></span> manteniendo <span class="eq">m<sub>1</sub> = m<sub>2</sub></span> y mirá cómo la brecha paralela colapsa en una única línea iluminada justo cuando <span class="eq">b<sub>1</sub> = b<sub>2</sub></span>.',
    },
  ],

  'sec2-base': [
    {
      pose: 'empatia',
      tag: 'Nombres largos, idea simple',
      html: 'Decir «Sistema Compatible Indeterminado» suena intimidante, pero traducido al español llano significa apenas esto: «compatible» quiere decir que hay solución, e «indeterminado» que hay infinitas y no una sola.',
    },
    {
      pose: 'explicando',
      tag: 'El cartel de Incompatible',
      highlightSelector: '[data-widget="clasificador-scd-sci-si"]',
      html: 'En cambio «Incompatible» (SI) quiere decir que las dos condiciones se contradicen: es como pedir dos números que sumen <span class="eq">5</span> y al mismo tiempo sumen <span class="eq">8</span>. Ningún par cumple ambas cosas, así que <span class="eq">S = &empty;</span>.',
    },
    {
      pose: 'pensativa',
      tag: 'Cómo escribir el conjunto SCI',
      html: 'Cuando dos ecuaciones esconden la misma recta <span class="eq">2x + y = 3</span>, despejamos <span class="eq">y = &minus;2x + 3</span> y anotamos todos sus puntos así: <span class="eq">S = {(x; &minus;2x + 3) / x &isin; &Ropf;}</span>.',
    },
    {
      pose: 'explicando',
      tag: 'Un truco de verificación',
      highlightSelector: '[data-widget="clasificador-scd-sci-si"]',
      html: 'Si dividís los coeficientes de <span class="eq">x</span> y de <span class="eq">y</span> entre las dos filas y dan la misma proporción, pero el término de la derecha da otra proporción distinta, las rectas son paralelas separadas (SI).',
    },
    {
      pose: 'feliz',
      tag: 'Explorá los 3 presets',
      highlightSelector: '[data-widget="clasificador-scd-sci-si"]',
      html: 'Tocá los botones de SCD, SCI y SI en el pizarrón para comparar la imagen geométrica de cada caso con su reducción algebraica.',
    },
  ],

  'sec3-parametros': [
    {
      pose: 'base',
      tag: 'Una recta que gira con k',
      highlightSelector: '[data-widget="explorador-parametrico"]',
      html: 'Cuando aparece un parámetro <span class="eq">k</span> multiplicando a las variables, dejás de tener dos rectas fijas: ahora tenés una familia entera de sistemas donde al cambiar <span class="eq">k</span> una recta gira como una aguja.',
    },
    {
      pose: 'lentes-brillo',
      tag: 'Primero la aduana del dominio',
      highlightSelector: '[data-widget="explorador-parametrico"]',
      html: 'Antes de tocar una sola cuenta, leé la restricción del enunciado: si dice <span class="eq">k &isin; &Ropf; &minus; {0}</span> o <span class="eq">a &isin; &Ropf; &minus; {1}</span>, ese valor prohibido queda tachado de entrada y jamás entra en tu respuesta.',
    },
    {
      pose: 'explicando',
      tag: 'Cazar los valores críticos',
      highlightSelector: '[data-widget="explorador-parametrico"]',
      html: 'Para saber en qué valores de <span class="eq">k</span> las rectas dejan de cruzarse, igualás pendientes o planteás la condición de paralelismo. Ahí suelen aparecer uno o dos valores críticos candidatos.',
    },
    {
      pose: 'eureka',
      tag: 'Evaluar uno por uno es obligatorio',
      highlightSelector: '[data-widget="explorador-parametrico"]',
      html: '¡Nunca clasifiques a ciegas! Tenés que agarrar cada valor crítico por separado, reemplazarlo en el sistema original y mirar si queda <span class="eq">0 = 0</span> (SCI) o una contradicción <span class="eq">0 = c &ne; 0</span> (SI).',
    },
    {
      pose: 'pensativa',
      tag: '¿Y todo el resto de la recta real?',
      highlightSelector: '[data-widget="explorador-parametrico"]',
      html: 'Para cualquier valor de <span class="eq">k</span> permitido que NO anule el paralelismo, las rectas tienen distinta pendiente y se cortan siempre en un único punto: el sistema resulta Compatible Determinado (SCD).',
    },
    {
      pose: 'evaluando',
      tag: 'Barrido continuo en vivo',
      highlightSelector: '[data-widget="explorador-parametrico"]',
      html: 'Deslizá el parámetro <span class="eq">k</span> sobre el explorador de abajo y mirá en la barra superior cómo al tocar los imanes críticos la tijera de rectas se alinea paralela o coincidente.',
    },
  ],

  'sec3-base': [
    {
      pose: 'empatia',
      tag: 'Por qué marea el parámetro k',
      html: 'Ver tres letras juntas (<span class="eq">x</span>, <span class="eq">y</span> y <span class="eq">k</span>) confunde a todo el mundo al comienzo. La clave mental es separar los roles: <span class="eq">x</span> e <span class="eq">y</span> son las coordenadas del plano, mientras <span class="eq">k</span> es una perilla numérica.',
    },
    {
      pose: 'explicando',
      tag: 'Paso 1: detectar el paralelismo',
      highlightSelector: '[data-widget="explorador-parametrico"]',
      html: 'Para encontrar los valores críticos podés eliminar <span class="eq">y</span> o comparar las pendientes <span class="eq">m<sub>1</sub>(k) = m<sub>2</sub>(k)</span>. Eso te fabrica una ecuación en <span class="eq">k</span> (lineal o cuadrática) cuyas raíces son los únicos puntos conflictivos.',
    },
    {
      pose: 'explicando',
      tag: 'Paso 2: sustituir y leer',
      highlightSelector: '[data-widget="explorador-parametrico"]',
      html: 'Por ejemplo en el sistema con <span class="eq">k = 2</span> te queda <span class="eq">2x + y = 7</span> y <span class="eq">4x + 2y = 14</span>: la segunda es el doble exacto de la primera, así que <span class="eq">k = 2</span> da SCI.',
    },
    {
      pose: 'pensativa',
      tag: 'Paso 3: probar el otro crítico',
      html: 'En cambio al reemplazar <span class="eq">k = &minus;1</span> obtenés <span class="eq">&minus;x + y = 7</span> y <span class="eq">x &minus; y = 14</span>. Si las sumás te da <span class="eq">0 = 21</span>, un absurdo total: entonces <span class="eq">k = &minus;1</span> da SI.',
    },
    {
      pose: 'feliz',
      tag: 'Todo ordenado en la recta real',
      highlightSelector: '[data-widget="explorador-parametrico"]',
      html: 'Con la recta del parámetro dibujada en el pizarrón, no te olvidás nunca de quitar también el valor excluido <span class="eq">k = 0</span> al escribir cuándo es SCD.',
    },
  ],

  'sec4-modelado': [
    {
      pose: 'base',
      tag: 'Del gráfico o el texto al sistema',
      highlightSelector: '[data-widget="traductor-problemas"]',
      html: 'En el último bloque conectamos el mundo real y los dibujos con el álgebra: reconstruir un sistema desde dos rectas graficadas y traducir problemas verbales de mezclas, encuentros, precios y geometría.',
    },
    {
      pose: 'explicando',
      tag: 'Reconstruir rectas perpendiculares',
      highlightSelector: '[data-widget="traductor-problemas"]',
      html: 'Cuando un gráfico te marca un ángulo recto entre <span class="eq">r<sub>1</sub></span> y <span class="eq">r<sub>2</sub></span>, primero sacás la ecuación de <span class="eq">r<sub>1</sub></span> con dos puntos claros y después invertís y cambiás el signo de su pendiente para armar <span class="eq">r<sub>2</sub></span>.',
    },
    {
      pose: 'lentes-brillo',
      tag: 'La trampa del descuento',
      highlightSelector: '[data-widget="traductor-problemas"]',
      html: 'Si comprás una heladera con <span class="eq">10%</span> de descuento y una cocina con <span class="eq">5%</span> de descuento y pagás <span class="eq">$36.400</span> en caja, la ecuación del dinero pagado usa <span class="eq">0,90h + 0,95c</span>, jamás <span class="eq">0,10h + 0,05c</span>.',
    },
    {
      pose: 'pensativa',
      tag: '¿Quién excede a quién?',
      html: 'Cuidado al traducir comparaciones: si <span class="eq">h</span> excede en <span class="eq">5500</span> a <span class="eq">c</span>, el valor más grande es <span class="eq">h</span>. Por eso la igualdad es <span class="eq">h &minus; 5500 = c</span> o <span class="eq">h = c + 5500</span>.',
    },
    {
      pose: 'complice',
      tag: 'Auditoría de realidad',
      highlightSelector: '[data-widget="traductor-problemas"]',
      html: 'Siempre revisá si el resultado tiene sentido en el contexto: un rectángulo con perímetro <span class="eq">20</span> donde el largo más el ancho no cierra da un Sistema Incompatible y se responde que es imposible construirlo.',
    },
    {
      pose: 'evaluando',
      tag: 'Dos modos en el traductor',
      highlightSelector: '[data-widget="traductor-problemas"]',
      html: 'Alterná en el pizarrón entre Reconstrucción desde Gráfica y Modelización de Enunciados para ver cómo cada frase del problema dibuja una recta y fija el cruce exacto.',
    },
  ],

  'sec4-base': [
    {
      pose: 'empatia',
      tag: 'Traducir sin adivinar',
      html: 'Muchos estudiantes saben resolver sistemas perfectos pero se traban al leer un problema en castellano. El secreto es no intentar escribir las dos ecuaciones de golpe: definí primero con nombre y apellido qué representa <span class="eq">x</span> y qué representa <span class="eq">y</span>.',
    },
    {
      pose: 'explicando',
      tag: 'Una ecuación por cada frase',
      highlightSelector: '[data-widget="traductor-problemas"]',
      html: 'Casi todos los enunciados del cuadernillo tienen dos oraciones independientes: una habla de cantidades totales (por ejemplo litros, monedas o empleados) y la otra habla de precios, porcentajes o comparaciones.',
    },
    {
      pose: 'pensativa',
      tag: 'Descuentos como porcentajes pagados',
      html: 'Pensalo en una compra cotidiana: si algo cuesta <span class="eq">$100</span> y te hacen <span class="eq">10%</span> de descuento, te descuentan <span class="eq">$10</span> pero vos sacás de la billetera <span class="eq">$90</span>, o sea <span class="eq">0,90</span> del precio de lista.',
    },
    {
      pose: 'explicando',
      tag: 'Leer la gráfica con precisión',
      highlightSelector: '[data-widget="traductor-problemas"]',
      html: 'Si el problema viene como dibujo en ejes cartesianos, buscá dos puntos con coordenadas enteras exactas sobre cada recta (como los cortes con los ejes) para armar sus fórmulas sin estimar a ojo.',
    },
    {
      pose: 'feliz',
      tag: 'Unidades y sentido común',
      html: 'Al terminar, respondé siempre la pregunta con su unidad (pesos, litros, kilómetros, horas) y chequeá que el resultado cierre con los datos del texto.',
    },
  ],
};

export const SCRIPTS = VN_SCRIPTS;

export const DIAGNOSE_REACTIONS = Object.freeze(
  Object.fromEntries(
    Object.entries(SYSTEM_DIAGNOSTIC_DEFINITIONS).map(([id, def]) => [
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
    text: '¡Impecable al primer intento y sin pistas! Leíste la estructura del sistema antes de hacer cuentas.',
  },
  recovered: {
    pose: 'feliz',
    tag: 'Error corregido',
    text: '¡Bien ahí! Encontraste el signo o la restricción que fallaba y lo resolviste.',
  },
  repeatedError: {
    pose: 'enojada',
    tag: 'Frená y verificá',
    text: '¡Pará con los intentos al azar! Abrí una pista y comprobá tu par ordenado en ambas ecuaciones.',
  },
  flawlessRun: {
    pose: 'sonrojada',
    tag: 'Bloque impecable',
    text: 'R-resolviste todo el pizarrón sin pistas ni errores... Bueno, admito que estuviste impecable.',
  },
  showSolution: {
    pose: 'colapso',
    tag: 'Solución revelada',
    text: 'Ahí tenés el desarrollo completo. Revisá en qué paso difería tu planteo y probá otro similar en el entrenador.',
  },
  solutionAfter: {
    pose: 'empatia',
    tag: 'Para retomar impulso',
    text: 'Usar la solución explicada sirve para desbloquear el método. En el siguiente intentá plantear el sistema sola.',
  },
  1: {
    pose: 'feliz',
    tag: 'Buen arranque',
    text: 'Primer acierto independiente registrado. Seguí verificando cada solución en las dos ecuaciones.',
  },
  2: {
    pose: 'orgullosa',
    tag: 'Racha de 2',
    text: 'Dos seguidos sin ayudas. Estás conectando el álgebra con la intersección gráfica.',
  },
  3: {
    pose: 'complice',
    tag: 'Racha de 3',
    text: 'Tres aciertos limpios al hilo. Ya manejás SCD, SCI, SI y parámetros con soltura.',
  },
  5: {
    pose: 'sonrojada',
    tag: 'Racha de 5',
    text: '¡Cinco aciertos independientes seguidos! N-no te agrandes, pero estás lista para cualquier parcial.',
  },
});
