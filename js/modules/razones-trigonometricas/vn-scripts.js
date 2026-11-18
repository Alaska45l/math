/**
 * @file js/modules/razones-trigonometricas/vn-scripts.js
 * 12 guiones artesanales de Alaska (6 principales de 5-6 globos + 6 "Base desde cero" de 5 globos)
 * en voseo rioplatense natural, con reacciones diagnósticas y de racha.
 *
 * Cero plantillas, cero emojis Unicode, cero LaTeX crudo, cero números de página,
 * máximo 2 eureka en todo el módulo.
 */

import { DIAGNOSTIC_DEFINITIONS } from './logic.js';

export const VN_SCRIPTS = {
  'sec1-pitagoras': [
    {
      pose: 'base',
      tag: 'La invariancia por semejanza',
      highlightSelector: '[data-widget="constructor-triangulos"]',
      html: '¿Por qué dos escaleras apoyadas con el mismo ángulo tienen exactamente el mismo seno, aunque una mida 5 metros y la otra 15? Porque al agrandar todos los lados por el mismo factor, los cocientes entre ellos se cancelan y quedan idénticos.',
    },
    {
      pose: 'pensativa',
      tag: 'Catetos vs hipotenusa',
      highlightSelector: '[data-widget="constructor-triangulos"]',
      html: 'En todo triángulo rectángulo en <span class="eq">A</span>, los lados que forman el ángulo recto son los catetos y el lado que mira al de <span class="eq">90&deg;</span> es siempre la hipotenusa <span class="eq">BC</span>, la más larga de los tres.',
    },
    {
      pose: 'explicando',
      tag: 'Dos leyes que cierran el triángulo',
      html: 'Los lados se atan por el Teorema de Pitágoras <span class="eq">BC<sup>2</sup> = AB<sup>2</sup> + AC<sup>2</sup></span>, y los dos ángulos agudos se atan por complementariedad: <span class="eq">B + C = 90&deg;</span>.',
    },
    {
      pose: 'lentes-brillo',
      tag: 'La trampa de la razón 3:1',
      highlightSelector: '[data-widget="constructor-triangulos"]',
      html: 'Ojo con esto: si solo te dicen que un cateto mide el triple del otro (<span class="eq">3 : 1</span>), podés clavar los ángulos agudos (<span class="eq">71&deg; 33\' 54"</span> y <span class="eq">18&deg; 26\' 6"</span>), pero la hipotenusa queda indeterminada porque faltan medidas reales.',
    },
    {
      pose: 'evaluando',
      tag: 'Probalo en el pizarrón',
      highlightSelector: '[data-widget="constructor-triangulos"]',
      html: 'Activá el botón de duplicar escala en el constructor o mové el vértice <span class="eq">C</span> con las flechas del teclado: vas a ver cómo cambian <span class="eq">a</span>, <span class="eq">b</span> y <span class="eq">c</span> pero el cociente <span class="eq">b/c</span> ni se mueve.',
    },
    {
      pose: 'complice',
      tag: 'Grados, minutos y segundos',
      html: 'Cuando la calculadora te tire un ángulo decimal como <span class="eq">53,13&deg;</span>, pasalo a sistema sexagesimal (<span class="eq">53&deg; 7\' 48"</span>) apretando la tecla de grados, minutos y segundos.',
    },
  ],

  'sec1-base': [
    {
      pose: 'empatia',
      tag: 'Arrancamos sin apuro',
      html: 'Si al ver un triángulo rectángulo rotado te cuesta identificar cuál es la hipotenusa y cuáles son los catetos, no te hagas problema: hay un truco visual infalible que nunca falla sin importar cómo esté dibujado.',
    },
    {
      pose: 'explicando',
      tag: 'Buscá el cuadradito de 90°',
      highlightSelector: '[data-widget="constructor-triangulos"]',
      html: 'Primero ubicá el ángulo recto de <span class="eq">90&deg;</span>. Los dos lados que se apoyan directamente en esa esquina son los <strong>catetos</strong>; el lado que queda enfrente, sin tocar el ángulo recto, es la <strong>hipotenusa</strong>.',
    },
    {
      pose: 'pensativa',
      tag: 'Qué dice Pitágoras de verdad',
      html: 'Pitágoras no es un hechizo de letras: significa que el área del cuadrado apoyado sobre la hipotenusa equivale a la suma de las áreas de los dos cuadrados apoyados sobre los catetos.',
    },
    {
      pose: 'explicando',
      tag: 'Complementarios al rescate',
      html: 'Como los tres ángulos de cualquier triángulo suman <span class="eq">180&deg;</span> y el ángulo recto ya gasta <span class="eq">90&deg;</span>, los dos ángulos agudos comparten los otros <span class="eq">90&deg;</span>: si uno vale <span class="eq">46&deg;</span>, el otro vale <span class="eq">44&deg;</span>.',
    },
    {
      pose: 'feliz',
      tag: 'A probar con números',
      highlightSelector: '[data-widget="constructor-triangulos"]',
      html: 'Elegí el clásico <span class="eq">3-4-5</span> en el pizarrón y verificá que <span class="eq">3<sup>2</sup> + 4<sup>2</sup> = 9 + 16 = 25 = 5<sup>2</sup></span>. Cuando veas esa cuenta viva, el resto sale solo.',
    },
  ],

  'sec2-sohcahtoa': [
    {
      pose: 'base',
      tag: 'No hay cateto fijo',
      highlightSelector: '[data-widget="laboratorio-sohcahtoa"]',
      html: 'El error número uno en trigonometría es creer que el cateto vertical es siempre el "opuesto". ¡Falso! Un cateto no es opuesto ni adyacente por su posición en la hoja, sino según desde qué vértice lo estés mirando.',
    },
    {
      pose: 'explicando',
      tag: 'La regla SOHCAHTOA',
      highlightSelector: '[data-widget="laboratorio-sohcahtoa"]',
      html: 'Parado en un ángulo agudo <span class="eq">B</span>, <span class="eq">sen(B)</span> divide el cateto opuesto por la hipotenusa, <span class="eq">cos(B)</span> divide el adyacente por la hipotenusa y <span class="eq">tg(B)</span> divide opuesto por adyacente.',
    },
    {
      pose: 'eureka',
      tag: 'Cofunciones en espejo',
      highlightSelector: '[data-widget="laboratorio-sohcahtoa"]',
      html: 'Mirá lo que pasa al saltar del vértice <span class="eq">B</span> al vértice <span class="eq">C</span>: el lado <span class="eq">AC</span> que era opuesto a <span class="eq">B</span> pasa a ser adyacente a <span class="eq">C</span>. Por eso <span class="eq">sen(B) = cos(90&deg; &minus; B)</span> vale siempre.',
    },
    {
      pose: 'lentes-brillo',
      tag: 'Cuidado con la calculadora en RAD',
      html: 'Si calculás <span class="eq">sen(30&deg;)</span> y la pantalla te devuelve <span class="eq">&minus;0,988</span> en lugar de <span class="eq">0,5</span>, tu calculadora está en radianes (RAD) en vez de grados sexagesimales (DEG). Revisá esa letra arriba antes de rendir.',
    },
    {
      pose: 'evaluando',
      tag: 'Cambiá de vértice en vivo',
      highlightSelector: '[data-widget="laboratorio-sohcahtoa"]',
      html: 'Tocá el selector entre <span class="eq">Desde ángulo B</span> y <span class="eq">Desde ángulo C</span> en el tablero: mirá cómo intercambian colores el cateto amarillo y el azul mientras la hipotenusa rosa queda fija.',
    },
  ],

  'sec2-base': [
    {
      pose: 'empatia',
      tag: 'Palabra rara, idea simple',
      html: 'Tranquila: SOHCAHTOA suena a grito de guerra, pero es solo un recordatorio fonético de tres fracciones súper simples que comparan los lados de un triángulo rectángulo.',
    },
    {
      pose: 'explicando',
      tag: 'Tres letras, tres cocientes',
      html: '<strong>SOH</strong> es Seno = Opuesto / Hipotenusa. <strong>CAH</strong> es Coseno = Adyacente / Hipotenusa. <strong>TOA</strong> es Tangente = Opuesto / Adyacente.',
    },
    {
      pose: 'pensativa',
      tag: 'Cómo no confundir opuesto y adyacente',
      highlightSelector: '[data-widget="laboratorio-sohcahtoa"]',
      html: 'Imaginá que estás parada justo en la punta del ángulo elegido: el lado que ves enfrente, sin tocar tus pies, es el <strong>opuesto</strong>; el cateto que sale desde tus pies es el <strong>adyacente</strong>.',
    },
    {
      pose: 'explicando',
      tag: 'Cuándo usar cada una',
      html: 'Si conocés el ángulo y la hipotenusa y buscás el lado de enfrente, elegís seno. Si el dato y la incógnita son los dos catetos sin hipotenusa, la herramienta directa es tangente.',
    },
    {
      pose: 'feliz',
      tag: 'Chequeo de sentido común',
      html: 'Como la hipotenusa es siempre el lado más largo, tanto <span class="eq">sen</span> como <span class="eq">cos</span> de un ángulo agudo quedan obligatoriamente entre <span class="eq">0</span> y <span class="eq">1</span>. Si te da mayor que <span class="eq">1</span>, invertiste la fracción.',
    },
  ],

  'sec3-elevacion': [
    {
      pose: 'base',
      tag: 'La horizontal manda siempre',
      highlightSelector: '[data-widget="elevacion-depresion"]',
      html: 'Cuando un piloto mira la pista desde arriba o vos mirás la cima de una torre desde el suelo, el ángulo visual nunca se mide contra la pared vertical: nace siempre desde la línea <strong>horizontal</strong> de los ojos.',
    },
    {
      pose: 'explicando',
      tag: 'La Z de alternos internos',
      highlightSelector: '[data-widget="elevacion-depresion"]',
      html: 'Como la horizontal del balcón de arriba y el suelo de abajo son rectas paralelas cortadas por tu visual, el ángulo de depresión desde arriba mide exactamente lo mismo que el ángulo de elevación desde abajo.',
    },
    {
      pose: 'sospecha',
      tag: 'Doble observación: ¿sumar o restar?',
      highlightSelector: '[data-widget="elevacion-depresion"]',
      html: 'Cuando hay dos mediciones sobre el suelo, frená un segundo a mirar el croquis: si el árbol o montaña está <strong>entre</strong> los dos puntos, la distancia total suma ambas bases; si retrocedés del <strong>mismo lado</strong>, los <span class="eq">20&nbsp;m</span> son la resta.',
    },
    {
      pose: 'pensativa',
      tag: 'El sistema de dos ecuaciones',
      html: 'En problemas sin la distancia a la base, planteás dos triángulos rectángulos que comparten la altura <span class="eq">h</span>: despejás cada base como <span class="eq">h &middot; cotg(&alpha;)</span> y reemplazás en la suma o resta conocida.',
    },
    {
      pose: 'orgullosa',
      tag: 'Probá los 4 escenarios',
      highlightSelector: '[data-widget="elevacion-depresion"]',
      html: 'Recorré los presets del explorador (avión, árbol y río, faro en acantilado, dos pueblos) y mové al observador para ver cómo la Z paralela y las dos tangentes resuelven todo.',
    },
  ],

  'sec3-base': [
    {
      pose: 'empatia',
      tag: 'Dibujar antes de calcular',
      html: 'En problemas con texto largo sobre barcos, faros o balcones, casi nadie se traba en las cuentas: el nudo aparece por no dibujar primero la línea horizontal de los ojos.',
    },
    {
      pose: 'explicando',
      tag: 'Elevación vs Depresión',
      highlightSelector: '[data-widget="elevacion-depresion"]',
      html: 'Mirá recto hacia el horizonte. Si levantás la vista hacia un pico, barrís un <strong>ángulo de elevación</strong>; si bajás la vista hacia un auto en la calle, barrís un <strong>ángulo de depresión</strong>.',
    },
    {
      pose: 'pensativa',
      tag: 'Por qué coinciden arriba y abajo',
      html: 'Dibujá la horizontal arriba y la horizontal abajo: la línea visual las cruza formando una Z. Los dos ángulos escondidos en las esquinas de esa Z son alternos internos entre paralelas, por eso valen igual.',
    },
    {
      pose: 'explicando',
      tag: 'Nunca uses el ángulo contra la pared',
      html: 'Si te dicen que el ángulo de depresión es de <span class="eq">25&deg;</span>, ese ángulo queda afuera del triángulo contra la horizontal superior, o bien adentro abajo junto al suelo, nunca pegado a la pared del edificio.',
    },
    {
      pose: 'feliz',
      tag: 'Una altura compartida',
      html: 'Cuando aparezcan dos ángulos distintos sin distancia a la base, no busques un triángulo raro: armá dos triángulos rectángulos uno dentro del otro y conectalos por la altura compartida.',
    },
  ],

  'sec4-sistemas': [
    {
      pose: 'base',
      tag: 'Puente al próximo capítulo',
      highlightSelector: '[data-widget="conversor-angulos"]',
      html: 'En el programa oficial, los sistemas de medición angular y la longitud de arco abren la unidad siguiente de funciones trigonométricas. Los sumamos acá como puente para que domines el lenguaje circular desde hoy.',
    },
    {
      pose: 'explicando',
      tag: 'Qué es un radián de verdad',
      highlightSelector: '[data-widget="conversor-angulos"]',
      html: 'Un grado es una fracción artificial (<span class="eq">1/90</span> de un recto). En cambio, un <strong>radián</strong> es natural: es el ángulo central cuyo arco mide exactamente lo mismo que el radio (<span class="eq">s = r</span>), cerca de <span class="eq">57&deg; 17\' 45"</span>.',
    },
    {
      pose: 'eureka',
      tag: 'La regla de oro π rad ↔ 180°',
      highlightSelector: '[data-widget="conversor-angulos"]',
      html: 'Como la circunferencia completa mide <span class="eq">2&pi;r</span>, el giro completo vale <span class="eq">2&pi;</span> radianes y medio giro equivale exactamente a <span class="eq">&pi; rad &harr; 180&deg;</span>. Desde ahí convertís cualquier ángulo sin perder exactitud.',
    },
    {
      pose: 'lentes-brillo',
      tag: 'Factor unitario sin darlo vuelta',
      html: 'Para pasar grados a radianes, multiplicá por <span class="eq">&pi; / 180&deg;</span> para cancelar grados abajo. Para pasar radianes a grados, multiplicá por <span class="eq">180&deg; / &pi;</span>. Si te queda <span class="eq">120&deg; 30\'</span>, primero escribilo como <span class="eq">120,5&deg; = 241/2&deg;</span>.',
    },
    {
      pose: 'enojada',
      tag: 'Cuidado con s = r · θ',
      highlightSelector: '[data-widget="conversor-angulos"]',
      html: '¡Jamás metas grados en <span class="eq">s = r &middot; &theta;</span>! Con <span class="eq">r = 3&nbsp;cm</span> y <span class="eq">30&deg;</span>, si hacés <span class="eq">3 &middot; 30 = 90&nbsp;cm</span> es un disparate: antes pasá <span class="eq">30&deg;</span> a <span class="eq">&pi;/6</span> para obtener <span class="eq">&pi;/2 &approx; 1,57&nbsp;cm</span>.',
    },
  ],

  'sec4-base': [
    {
      pose: 'empatia',
      tag: 'Dos idiomas para el mismo giro',
      html: 'Tranquila: grados y radianes no son ángulos distintos, son simplemente dos unidades distintas para medir la misma abertura, igual que medir una mesa en metros o en centímetros.',
    },
    {
      pose: 'explicando',
      tag: 'Un piolin sobre el borde',
      highlightSelector: '[data-widget="conversor-angulos"]',
      html: 'Agarrá un piolín del largo del radio <span class="eq">r</span> y doblalo pegado al borde del círculo. La abertura que queda marcada en el centro mide exactamente <span class="eq">1</span> radián.',
    },
    {
      pose: 'pensativa',
      tag: 'Por qué aparece el número π',
      html: '¿Cuántas veces entra ese piolín en media vuelta? Entra <span class="eq">3,14159...</span> veces, o sea exactamente <span class="eq">&pi;</span> veces. Por eso media vuelta son <span class="eq">180&deg;</span> en grados y <span class="eq">&pi;</span> en radianes.',
    },
    {
      pose: 'explicando',
      tag: 'De fracción de π a número real',
      html: 'En ángulos exactos como <span class="eq">30&deg;</span> o <span class="eq">70&deg;</span> conviene dejar la respuesta como fracción de <span class="eq">&pi;</span> (<span class="eq">&pi;/6</span> o <span class="eq">7&pi;/18</span>) antes de aproximar con decimales.',
    },
    {
      pose: 'feliz',
      tag: 'Arrastrá el arco en vivo',
      highlightSelector: '[data-widget="conversor-angulos"]',
      html: 'Mové el punto amarillo sobre la circunferencia en el conversor y mirá cómo la longitud del arco amarillo <span class="eq">s</span> cambia en proporción directa al ángulo en radianes.',
    },
  ],

  'sec5-poligonos': [
    {
      pose: 'base',
      tag: 'El triángulo escondido en cada figura',
      highlightSelector: '[data-widget="geometria-poligonos-arcos"]',
      html: 'Ni rombos, ni trapecios, ni polígonos regulares, ni prismas 3D traen fórmulas mágicas nuevas: todo se resuelve encontrando un triángulo rectángulo escondido adentro de la figura.',
    },
    {
      pose: 'lentes-brillo',
      tag: 'La mitad del ángulo central',
      highlightSelector: '[data-widget="geometria-poligonos-arcos"]',
      html: 'En un polígono regular de <span class="eq">n</span> lados, el ángulo central de un lado vale <span class="eq">360&deg;/n</span>. Al bajar la apotema perpendicular al lado, partís el triángulo isósceles al medio: entra el semiángulo <span class="eq">180&deg;/n</span> y medio lado <span class="eq">L/2</span>.',
    },
    {
      pose: 'explicando',
      tag: 'Cuerdas y diagonales en dos pasos',
      html: 'En una cuerda de circunferencia pasa exactamente lo mismo: la distancia desde el centro corta la cuerda por la mitad formando dos triángulos rectángulos con hipotenusa igual al radio <span class="eq">r</span>.',
    },
    {
      pose: 'pensativa',
      tag: 'Dos Pitágoras en el prisma 3D',
      highlightSelector: '[data-widget="geometria-poligonos-arcos"]',
      html: 'Para hallar la diagonal espacial de un prisma rectangular de aristas <span class="eq">a, b, c</span>, primero sacás la diagonal de la base <span class="eq">d = &radic;(a<sup>2</sup>+b<sup>2</sup>)</span> y después armás el triángulo vertical con <span class="eq">d</span> y la altura <span class="eq">c</span>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Del octógono al círculo',
      highlightSelector: '[data-widget="geometria-poligonos-arcos"]',
      html: 'Subí el deslizador de lados <span class="eq">n</span> desde <span class="eq">3</span> hasta <span class="eq">12</span> y mirá cómo la apotema se acerca cada vez más al radio circunscripto.',
    },
  ],

  'sec5-base': [
    {
      pose: 'empatia',
      tag: 'No memorices diez fórmulas',
      html: 'Si ves un octógono, una cuerda o un prisma y sentís que necesitás acordarte diez fórmulas distintas, respirá hondo: todas salen de cortar la figura con simetría hasta ver un ángulo de <span class="eq">90&deg;</span>.',
    },
    {
      pose: 'explicando',
      tag: 'Apotema vs Radio',
      highlightSelector: '[data-widget="geometria-poligonos-arcos"]',
      html: 'El <strong>radio</strong> va del centro hasta una punta (vértice) y es la hipotenusa del triángulo interior. La <strong>apotema</strong> cae perpendicular justo al medio del lado y es el cateto adyacente al semiángulo.',
    },
    {
      pose: 'pensativa',
      tag: 'Por qué se divide el ángulo por dos',
      html: 'Si un pentágono tiene <span class="eq">5</span> lados, cada porción central mide <span class="eq">360&deg;/5 = 72&deg;</span>. Pero la apotema parte esa porción a la mitad, así que tu triángulo rectángulo trabaja con <span class="eq">36&deg;</span>.',
    },
    {
      pose: 'explicando',
      tag: 'En el rombo, las diagonales se cortan a 90°',
      html: 'Un rombo queda partido por sus dos diagonales en cuatro triángulos rectángulos iguales cuyos catetos miden la mitad de cada diagonal y cuya hipotenusa es el lado del rombo.',
    },
    {
      pose: 'feliz',
      tag: 'Probá cada modo en el pizarrón',
      html: 'Alterná entre polígono regular, cuerda y prisma 3D en el laboratorio para ver en colores exactamente dónde está el triángulo rectángulo en cada caso.',
    },
  ],

  'sec6-oblicuangulos': [
    {
      pose: 'base',
      tag: 'Cuando no hay ángulo de 90°',
      highlightSelector: '[data-widget="geometria-poligonos-arcos"]',
      html: '¿Qué hacés cuando dos barcos salen de un puerto formando <span class="eq">125&deg;</span> o dos rutas se cruzan a <span class="eq">42&deg;</span>? No podés aplicar Pitágoras ni SOHCAHTOA directo porque el triángulo es oblicuángulo.',
    },
    {
      pose: 'explicando',
      tag: 'Estrategia 1: Trazar una altura',
      html: 'El primer recurso clásico consiste en bajar una altura auxiliar perpendicular desde un vértice para partir el triángulo oblicuo en dos triángulos rectángulos pegados.',
    },
    {
      pose: 'complice',
      tag: 'Puente: Teorema del Coseno y del Seno',
      highlightSelector: '[data-widget="geometria-poligonos-arcos"]',
      html: 'Como ampliación puente, si aplicás Pitágoras a los dos subtriángulos de esa altura deducís el <strong>Teorema del Coseno</strong>: <span class="eq">c<sup>2</sup> = a<sup>2</sup> + b<sup>2</sup> &minus; 2ab&middot;cos(&gamma;)</span>, que generaliza a Pitágoras cuando <span class="eq">&gamma; &ne; 90&deg;</span>.',
    },
    {
      pose: 'evaluando',
      tag: 'Cuidado con las unidades mezcladas',
      html: 'Si una distancia viene en <span class="eq">0,426&nbsp;km</span> y la otra en <span class="eq">368&nbsp;m</span>, unificá ambas a metros (<span class="eq">426&nbsp;m</span>) antes de elevar al cuadrado. Mezclar kilómetros con metros destroza el resultado.',
    },
    {
      pose: 'orgullosa',
      tag: 'Probá el deslizador del ángulo γ',
      highlightSelector: '[data-widget="geometria-poligonos-arcos"]',
      html: 'Abrí la pestaña de puente oblicuángulo y llevá el ángulo <span class="eq">&gamma;</span> a <span class="eq">90&deg;</span>: el término corrector <span class="eq">&minus;2ab&middot;cos(90&deg;)</span> desaparece en cero y recuperás Pitágoras exacto.',
    },
  ],

  'sec6-base': [
    {
      pose: 'empatia',
      tag: 'Pitágoras con una salvedad',
      html: 'Muchos estudiantes intentan usar <span class="eq">a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup></span> en cualquier triángulo. Es comprensible, pero Pitágoras solo funciona si el ángulo entre <span class="eq">a</span> y <span class="eq">b</span> es exactamente <span class="eq">90&deg;</span>.',
    },
    {
      pose: 'explicando',
      tag: 'Qué pasa si abrís o cerrás las agujas',
      highlightSelector: '[data-widget="geometria-poligonos-arcos"]',
      html: 'Pensá en dos varillas de largo fijo unidas por una bisagra. Si cerrás el ángulo a menos de <span class="eq">90&deg;</span>, las puntas se acercan; si lo abrís a <span class="eq">125&deg;</span>, se alejan mucho más que la diagonal de Pitágoras.',
    },
    {
      pose: 'pensativa',
      tag: 'El término corrector del coseno',
      html: 'Justamente ese ajuste mide el término <span class="eq">&minus;2ab&middot;cos(&gamma;)</span>: cuando el ángulo es obtuso (<span class="eq">&gamma; &gt; 90&deg;</span>), <span class="eq">cos(&gamma;)</span> es negativo y el término termina sumando para estirar el tercer lado.',
    },
    {
      pose: 'explicando',
      tag: 'Y si tenés dos ángulos y un lado',
      html: 'Cuando conocés dos ángulos y un lado, el puente más rápido es el Teorema del Seno (<span class="eq">a/sen(A) = b/sen(B)</span>) o simplemente trazar la altura interna.',
    },
    {
      pose: 'feliz',
      tag: 'Todo conectado',
      html: 'En cuanto entendés que el Teorema del Coseno es Pitágoras corregido por el ángulo comprendido, ya no te olvidás nunca más de su fórmula.',
    },
  ],
};

export const SCRIPTS = VN_SCRIPTS;

export const DIAGNOSE_REACTIONS = Object.freeze(
  Object.fromEntries(
    Object.values(DIAGNOSTIC_DEFINITIONS).map((d) => [
      d.id,
      {
        pose: d.pose,
        tag: d.tag,
        text: d.message,
      },
    ])
  )
);

export const STREAK_REACTIONS = Object.freeze({
  3: {
    pose: 'feliz',
    tag: 'Racha de 3 sin pistas',
    text: '¡Tres al hilo sin pedir pistas! Estás leyendo los triángulos y las referencias con precisión de cátedra.',
  },
  6: {
    pose: 'orgullosa',
    tag: 'Racha de 6 · Dominio sólido',
    text: '¡Seis seguidas en forma independiente! Pasaste de aplicar fórmulas a elegir qué modelo geométrico corresponde en cada problema.',
  },
});
