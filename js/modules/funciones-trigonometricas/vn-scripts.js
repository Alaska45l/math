/**
 * @file js/modules/funciones-trigonometricas/vn-scripts.js
 * 14 guiones artesanales de Alaska (7 principales + 7 "Base desde cero")
 * en voseo rioplatense natural para Unidad 11 · Funciones Trigonométricas.
 *
 * Reglas estrictas:
 * - Cero plantillas, cero emojis Unicode, cero LaTeX crudo, cero citas burocráticas
 * - Todo -base inicia con 'empatia'
 * - Máximo 2 'eureka' en todo el módulo
 * - Tier 1-2 >= 80% del total de globos
 * - Todas las poses válidas en VN_POSES y existentes como .webp físicos en assets/vn/
 */

import { DIAGNOSTIC_DEFINITIONS } from './logic.js';

export const VN_SCRIPTS = {
  'sec1-congruencia': [
    {
      pose: 'base',
      tag: 'Vueltas completas en el plano',
      highlightSelector: '[data-widget="explorador-congruencia"]',
      html: '¿Qué tienen en común girar <span class="eq">&minus;870&deg;</span> y girar <span class="eq">31&pi;/6</span> radianes? Que aunque uno dé vueltas hacia atrás y el otro hacia adelante, ambos rayos terminan apuntando exactamente al mismo lugar: <span class="eq">210&deg; = 7&pi;/6</span>.',
    },
    {
      pose: 'pensativa',
      tag: 'La regla de la diferencia entera',
      highlightSelector: '[data-widget="explorador-congruencia"]',
      html: 'Dos ángulos son <strong>congruentes</strong> cuando su diferencia es un número entero de giros completos: <span class="eq">&alpha; &minus; &beta; = 2k&pi;</span> (o <span class="eq">k &middot; 360&deg;</span>) con <span class="eq">k &isin; &#8484;</span>.',
    },
    {
      pose: 'explicando',
      tag: 'El representante principal',
      html: 'La clase <span class="eq">C<sub>&alpha;</sub></span> reúne a infinitos ángulos coterminales, pero para no escribir cualquiera elegimos siempre al <strong>representante principal</strong> en el primer giro positivo: <span class="eq">[0; 2&pi;)</span> o <span class="eq">[0&deg;; 360&deg;)</span>.',
    },
    {
      pose: 'lentes-brillo',
      tag: 'No dejes representantes negativos',
      html: 'Ojo con un detalle que cuesta puntos: si dejás escrito <span class="eq">C<sub>&minus;&pi;/3</sub></span>, la clase es la misma que <span class="eq">C<sub>5&pi;/3</sub></span>, pero en el examen te piden reducir al representante principal en <span class="eq">[0; 2&pi;)</span>.',
    },
    {
      pose: 'evaluando',
      tag: 'Desenrollá el espiral',
      highlightSelector: '[data-widget="explorador-congruencia"]',
      html: 'Probá en el explorador el preset <span class="eq">&minus;870&deg; vs 31&pi;/6</span> y mové el deslizador de vueltas <span class="eq">k</span>: vas a ver los dos espirales caer sobre el mismo rayo terminal.',
    },
  ],

  'sec1-base': [
    {
      pose: 'empatia',
      tag: 'Paso a paso desde cero',
      html: 'Si te marea ver ángulos enormes como <span class="eq">2920&deg;</span> o negativos como <span class="eq">&minus;500&deg;</span>, pensalo como las agujas de un reloj: dar una vuelta entera de más te deja mirando exactamente la misma hora.',
    },
    {
      pose: 'explicando',
      tag: 'Medir en radianes sin miedo',
      html: 'Recordá la equivalencia madre: media vuelta son <span class="eq">180&deg; = &pi;</span> radianes y una vuelta completa son <span class="eq">360&deg; = 2&pi;</span> radianes. Y en arcos de circunferencia, <span class="eq">s = r &middot; &theta;</span> siempre usa radianes.',
    },
    {
      pose: 'pensativa',
      tag: 'Cómo reducir fracciones de π',
      highlightSelector: '[data-widget="explorador-congruencia"]',
      html: 'Para reducir <span class="eq">9&pi;/2</span> sin pasar a decimales, preguntate cuántas veces entra <span class="eq">2&pi; = 4&pi;/2</span> dentro de <span class="eq">9&pi;/2</span>: entra <span class="eq">2</span> vueltas (<span class="eq">8&pi;/2</span>) y sobra exactamente <span class="eq">&pi;/2</span>.',
    },
    {
      pose: 'explicando',
      tag: 'Y si el ángulo es negativo',
      html: 'Con <span class="eq">&minus;&pi;/3</span> estás un sexto de media vuelta hacia atrás. Sumale una vuelta completa (<span class="eq">+2&pi; = +6&pi;/3</span>) y caés derechito en <span class="eq">5&pi;/3</span>.',
    },
    {
      pose: 'feliz',
      tag: 'Verificá con el rayo',
      highlightSelector: '[data-widget="explorador-congruencia"]',
      html: 'Cada vez que reduzcas un ángulo, chequeá que el resultado haya quedado dentro de <span class="eq">[0; 2&pi;)</span>. Si todavía es negativo o mayor o igual que <span class="eq">2&pi;</span>, te falta sumar o restar un giro.',
    },
  ],

  'sec2-cartesiana': [
    {
      pose: 'base',
      tag: 'Del triángulo al plano entero',
      highlightSelector: '[data-widget="circulo-trigonometrico"]',
      html: 'En triángulos rectángulos estábamos encerrados entre <span class="eq">0&deg;</span> y <span class="eq">90&deg;</span>. Al pasar al plano cartesiano con un punto <span class="eq">P(abs; ord)</span> y radio vector <span class="eq">r.v. = &radic;(abs<sup>2</sup> + ord<sup>2</sup>) &gt; 0</span>, liberamos todos los ángulos reales.',
    },
    {
      pose: 'explicando',
      tag: 'Abscisa, ordenada y radio vector',
      highlightSelector: '[data-widget="circulo-trigonometrico"]',
      html: 'El programa oficial define <span class="eq">sen(&alpha;) = ord / r.v.</span>, <span class="eq">cos(&alpha;) = abs / r.v.</span> y <span class="eq">tg(&alpha;) = ord / abs</span>, con sus tres recíprocas dando vuelta cada fracción cuando el denominador no es cero.',
    },
    {
      pose: 'pensativa',
      tag: 'Por qué cambian los signos',
      html: 'Como el radio vector <span class="eq">r.v.</span> es una distancia positiva siempre, el signo de <span class="eq">sen(&alpha;)</span> lo manda la ordenada <span class="eq">y</span> y el signo de <span class="eq">cos(&alpha;)</span> lo manda la abscisa <span class="eq">x</span>.',
    },
    {
      pose: 'complice',
      tag: 'Ampliación didáctica: círculo r = 1',
      highlightSelector: '[data-widget="circulo-trigonometrico"]',
      html: 'Si elegimos como ampliación didáctica la circunferencia unitaria <span class="eq">r.v. = 1</span>, las divisiones por <span class="eq">1</span> desaparecen y la abscisa y ordenada te muestran directamente el coseno y el seno como segmentos.',
    },
    {
      pose: 'evaluando',
      tag: 'Girando por los 4 cuadrantes',
      highlightSelector: '[data-widget="circulo-trigonometrico"]',
      html: 'Arrastrá el punto <span class="eq">P</span> al tercer cuadrante en el tablero: ahí tanto <span class="eq">abs</span> como <span class="eq">ord</span> son negativas, así que seno y coseno dan negativos, pero al dividirlos la tangente vuelve a ser positiva.',
    },
  ],

  'sec2-base': [
    {
      pose: 'empatia',
      tag: 'Abscisa y ordenada sin enredos',
      html: 'Tranquila: llamar «abscisa» a la coordenada horizontal <span class="eq">x</span> y «ordenada» a la vertical <span class="eq">y</span> confunde a cualquiera el primer día. Asociá <strong>ord</strong>enad<strong>a</strong> con altura vertical y <strong>abs</strong>cisa con paso horizontal.',
    },
    {
      pose: 'explicando',
      tag: 'Coseno horizontal, seno vertical',
      highlightSelector: '[data-widget="circulo-trigonometrico"]',
      html: 'Recordalo así: el <strong>coseno</strong> vive en el eje horizontal (<span class="eq">abs / r.v.</span>) y el <strong>seno</strong> vive en el eje vertical (<span class="eq">ord / r.v.</span>). Si los intercambiás, te quedan rotados <span class="eq">90&deg;</span>.',
    },
    {
      pose: 'pensativa',
      tag: 'La regla de signos por cuadrante',
      html: 'No hace falta memorizar tablas gigantes: en el cuadrante II (<span class="eq">x &lt; 0, y &gt; 0</span>) solo seno y cosecante son positivos; en el III solo tangente y cotangente; en el IV solo coseno y secante.',
    },
    {
      pose: 'explicando',
      tag: '¿Qué pasa en los ejes?',
      html: 'Cuando el punto cae sobre el eje vertical (<span class="eq">90&deg;</span> o <span class="eq">270&deg;</span>), <span class="eq">abs = 0</span> y entonces <span class="eq">tg</span> y <span class="eq">sec</span> no existen porque no podés dividir por cero.',
    },
    {
      pose: 'feliz',
      tag: 'Probá con P(−3; −√7)',
      highlightSelector: '[data-widget="circulo-trigonometrico"]',
      html: 'En modo cartesiano general probá mover el punto por los cuatro cuadrantes y mirá cómo el radio vector <span class="eq">r.v.</span> se mantiene positivo aunque las coordenadas cambien de signo.',
    },
  ],

  'sec3-senocoseno': [
    {
      pose: 'base',
      tag: 'De la vuelta al gráfico de onda',
      highlightSelector: '[data-widget="sincronizador-graficas"]',
      html: 'Cuando desenrollamos la altura vertical (<span class="eq">sen x</span>) y la proyección horizontal (<span class="eq">cos x</span>) a lo largo del eje <span class="eq">x</span>, nacen dos ondas suaves definidas en todo <span class="eq">&Ropf;</span> y encerradas para siempre entre <span class="eq">&minus;1</span> y <span class="eq">1</span>.',
    },
    {
      pose: 'eureka',
      tag: 'Misma onda, distinto punto de partida',
      highlightSelector: '[data-widget="sincronizador-graficas"]',
      html: 'Mirá el sincronizador: <span class="eq">sen(0) = 0</span> arranca subiendo desde el origen, mientras <span class="eq">cos(0) = 1</span> arranca en la cresta. Son exactamente la misma curva corrida un cuarto de giro (<span class="eq">&pi;/2</span>).',
    },
    {
      pose: 'explicando',
      tag: 'Por qué no son biyectivas en ℝ → ℝ',
      html: 'Como toda onda periódica repite sus valores infinitas veces cada <span class="eq">2&pi;</span>, falla la inyectividad. Y como nunca supera <span class="eq">1</span> ni baja de <span class="eq">&minus;1</span>, tampoco es suryectiva si el codominio es todo <span class="eq">&Ropf;</span>.',
    },
    {
      pose: 'pensativa',
      tag: 'Recortar para poder invertir',
      html: 'Para volverlas biyectivas ajustamos el codominio a <span class="eq">[&minus;1; 1]</span> y elegimos un intervalo donde recorran todo de punta a punta sin repetir: <span class="eq">[&minus;&pi;/2; &pi;/2]</span> para seno y <span class="eq">[0; &pi;]</span> para coseno.',
    },
    {
      pose: 'complice',
      tag: 'Ampliación: parámetros A, B, C, D',
      highlightSelector: '[data-widget="sincronizador-graficas"]',
      html: 'El programa de ingreso evalúa las funciones canónicas sin desplazamientos, pero en el tablero podés activar la ampliación didáctica <span class="eq">A&middot;sen(Bx &minus; C) + D</span> para ver cómo cambian la amplitud y el período.',
    },
  ],

  'sec3-base': [
    {
      pose: 'empatia',
      tag: 'De dónde sale la curva sinusoidal',
      html: 'Si alguna vez pensaste que la onda del seno era un dibujo caprichoso para memorizar, acá vas a ver de dónde sale cada punto en tiempo real.',
    },
    {
      pose: 'explicando',
      tag: 'Altura en el círculo = altura en la onda',
      highlightSelector: '[data-widget="sincronizador-graficas"]',
      html: 'A medida que el ángulo <span class="eq">x</span> avanza desde <span class="eq">0</span> hasta <span class="eq">2&pi;</span>, la altura del punto en el círculo sube de <span class="eq">0</span> a <span class="eq">1</span>, baja a <span class="eq">0</span>, baja a <span class="eq">&minus;1</span> y vuelve a <span class="eq">0</span>.',
    },
    {
      pose: 'pensativa',
      tag: 'Sus ceros no coinciden',
      html: 'El seno vale <span class="eq">0</span> cuando el punto toca el eje horizontal (<span class="eq">0</span> y <span class="eq">&pi;</span>), mientras el coseno vale <span class="eq">0</span> cuando toca el eje vertical (<span class="eq">&pi;/2</span> y <span class="eq">3&pi;/2</span>).',
    },
    {
      pose: 'explicando',
      tag: 'La barra de techo y piso',
      html: 'Ninguna coordenada del círculo unitario puede salir del radio <span class="eq">1</span>. Por eso <span class="eq">Im(sen) = Im(cos) = [&minus;1; 1]</span> con corchetes cerrados, porque <span class="eq">&minus;1</span> y <span class="eq">1</span> sí se alcanzan.',
    },
    {
      pose: 'feliz',
      tag: 'Mové la sonda horizontal',
      highlightSelector: '[data-widget="sincronizador-graficas"]',
      html: 'Deslizá la sonda de fase sobre el plano cartesiano con el teclado o el mouse: la línea punteada te muestra al mismo tiempo el punto en el círculo y su valor en la gráfica.',
    },
  ],

  'sec4-derivadas': [
    {
      pose: 'base',
      tag: 'Las cuatro funciones con asíntotas',
      highlightSelector: '[data-widget="sincronizador-graficas"]',
      html: 'A diferencia de seno y coseno, <span class="eq">tg</span>, <span class="eq">cotg</span>, <span class="eq">sec</span> y <span class="eq">cosec</span> son cocientes: cada vez que el denominador vale cero, el dominio se rompe y nace una asíntota vertical.',
    },
    {
      pose: 'lentes-brillo',
      tag: '¡No tienen el mismo dominio!',
      html: 'Grabate esta separación a fuego para el parcial: <span class="eq">tg x</span> y <span class="eq">sec x</span> dividen por <span class="eq">cos x</span>, así que excluyen <span class="eq">C<sub>&pi;/2</sub> &cup; C<sub>3&pi;/2</sub></span>. En cambio, <span class="eq">cotg x</span> y <span class="eq">cosec x</span> dividen por <span class="eq">sen x</span>, así que excluyen <span class="eq">C<sub>0</sub> &cup; C<sub>&pi;</sub></span>.',
    },
    {
      pose: 'explicando',
      tag: 'Imágenes y períodos opuestos',
      highlightSelector: '[data-widget="sincronizador-graficas"]',
      html: 'Mientras <span class="eq">tg x</span> y <span class="eq">cotg x</span> barren todo <span class="eq">&Ropf;</span> con período <span class="eq">&pi;</span>, <span class="eq">sec x</span> y <span class="eq">cosec x</span> rebotan hacia afuera de la franja central con imagen <span class="eq">(&minus;&infin;; &minus;1] &cup; [1; +&infin;)</span> y período <span class="eq">2&pi;</span>.',
    },
    {
      pose: 'unamused',
      tag: 'Cuidado con la suryectividad',
      html: 'Si el codominio es <span class="eq">&Ropf;</span>, ni seno, ni coseno, ni secante ni cosecante son suryectivas porque dejan valores sin cubrir. La tangente y la cotangente, en cambio, sí cubren todo <span class="eq">&Ropf;</span>.',
    },
    {
      pose: 'evaluando',
      tag: 'Alineá los ceros con los polos',
      highlightSelector: '[data-widget="sincronizador-graficas"]',
      html: 'Activá <span class="eq">tg x</span> o <span class="eq">cosec x</span> en el sincronizador y mirá las líneas verticales punteadas: justo donde la curva de abajo cruza el eje <span class="eq">X</span>, la curva derivada salta por una asíntota.',
    },
  ],

  'sec4-base': [
    {
      pose: 'empatia',
      tag: 'Cuatro curvas, dos familias',
      html: 'Ver cuatro nombres nuevos juntos parece un montón, pero se ordenan facilísimo en cuanto mirás quién está en el denominador de cada una.',
    },
    {
      pose: 'explicando',
      tag: 'Grupo A: coseno en el piso',
      html: 'Tanto <span class="eq">tg x = sen x / cos x</span> como <span class="eq">sec x = 1 / cos x</span> tienen a <span class="eq">cos x</span> dividiendo. Por eso ambas fallan exactamente en los mismos puntos: <span class="eq">&pi;/2</span>, <span class="eq">3&pi;/2</span> y sus congruentes.',
    },
    {
      pose: 'pensativa',
      tag: 'Grupo B: seno en el piso',
      html: 'Tanto <span class="eq">cotg x = cos x / sen x</span> como <span class="eq">cosec x = 1 / sen x</span> dividen por <span class="eq">sen x</span>. Por eso ambas fallan en <span class="eq">0</span>, <span class="eq">&pi;</span> y sus congruentes.',
    },
    {
      pose: 'explicando',
      tag: 'Por qué sec y cosec dejan un hueco',
      html: 'Si un número <span class="eq">s</span> está entre <span class="eq">&minus;1</span> y <span class="eq">1</span>, al darlo vuelta (<span class="eq">1/s</span>) su valor absoluto siempre da mayor o igual que <span class="eq">1</span>. Jamás vas a conseguir <span class="eq">sec x = 0,5</span>.',
    },
    {
      pose: 'feliz',
      tag: 'Ceros de tg y cotg',
      highlightSelector: '[data-widget="sincronizador-graficas"]',
      html: 'Una fracción vale cero cuando su numerador vale cero y el denominador no: <span class="eq">tg x = 0</span> donde <span class="eq">sen x = 0</span>, mientras <span class="eq">sec x</span> y <span class="eq">cosec x</span> tienen numerador <span class="eq">1</span> y no tienen ceros (<span class="eq">&empty;</span>).',
    },
  ],

  'sec5-identidades': [
    {
      pose: 'base',
      tag: 'Una sola identidad madre',
      highlightSelector: '[data-widget="detector-cuadrantes"]',
      html: 'Por Pitágoras en el plano cartesiano, <span class="eq">abs<sup>2</sup> + ord<sup>2</sup> = r.v.<sup>2</sup></span>. Al dividir todo por <span class="eq">r.v.<sup>2</sup></span> obtenés la identidad fundamental: <span class="eq">sen<sup>2</sup>(&alpha;) + cos<sup>2</sup>(&alpha;) = 1</span>.',
    },
    {
      pose: 'enojada',
      tag: '¡El signo lo decide el cuadrante!',
      highlightSelector: '[data-widget="detector-cuadrantes"]',
      html: 'Al despejar <span class="eq">cos(&alpha;) = &plusmn;&radic;(1 &minus; sen<sup>2</sup>(&alpha;))</span>, elegir siempre el signo positivo es un error gravísimo. Si <span class="eq">&alpha;</span> está en el cuadrante II o III, el coseno es obligatoriamente negativo.',
    },
    {
      pose: 'explicando',
      tag: 'Reducción al primer cuadrante',
      html: 'Cualquier ángulo de los cuadrantes II, III o IV comparte el mismo valor absoluto de seno y coseno que su ángulo de referencia en el I (<span class="eq">&pi;&minus;&alpha;</span>, <span class="eq">&alpha;&minus;&pi;</span> o <span class="eq">2&pi;&minus;&alpha;</span>); solo conservás el signo del cuadrante original.',
    },
    {
      pose: 'complice',
      tag: 'Racionalizar sin dejar raíces abajo',
      html: 'Si te piden valores exactos y te queda <span class="eq">&minus;4 / &radic;7</span>, multiplicá numerador y denominador por <span class="eq">&radic;7</span> para entregar el formato elegante de cátedra: <span class="eq">&minus;4&radic;7 / 7</span>.',
    },
    {
      pose: 'evaluando',
      tag: 'Probalo con el caso Global',
      highlightSelector: '[data-widget="detector-cuadrantes"]',
      html: 'Elegí <span class="eq">sen &alpha; = &minus;3/4, tg &alpha; &gt; 0</span> en el detector: vas a ver cómo ambas condiciones encierran a <span class="eq">&alpha;</span> en el cuadrante III y calculan las 6 razones exactas.',
    },
  ],

  'sec5-base': [
    {
      pose: 'empatia',
      tag: 'Exacto no significa decimal',
      html: 'Cuando un enunciado dice «calculá en forma exacta», guardar la calculadora científica es tu mejor jugada: la respuesta lleva fracciones y raíces como <span class="eq">&radic;3/2</span> o <span class="eq">&minus;4&radic;7/7</span>, no decimales redondeados.',
    },
    {
      pose: 'explicando',
      tag: 'Los 5 ángulos notables',
      html: 'En el primer cuadrante te alcanza con recordar la escalera del seno para <span class="eq">0, &pi;/6, &pi;/4, &pi;/3, &pi;/2</span>: <span class="eq">&radic;0/2, &radic;1/2, &radic;2/2, &radic;3/2, &radic;4/2</span>. El coseno es la misma escalera bajando.',
    },
    {
      pose: 'pensativa',
      tag: 'Cómo saber qué recíproca va con cuál',
      html: 'Para no cruzarlas nunca, acordate del truco de las iniciales distintas: <strong>s</strong>ecante va con <strong>c</strong>oseno (<span class="eq">1/cos</span>), y <strong>c</strong>osecante va con <strong>s</strong>eno (<span class="eq">1/sen</span>).',
    },
    {
      pose: 'explicando',
      tag: 'Cómo usar la relación pitagórica',
      html: 'Si te dan <span class="eq">sen(&alpha;)</span>, elevás al cuadrado, restás de <span class="eq">1</span>, sacás raíz cuadrada y al final mirás el cuadrante para poner el <span class="eq">+</span> o el <span class="eq">&minus;</span> adelante.',
    },
    {
      pose: 'feliz',
      tag: 'Verificar identidades',
      html: 'Para demostrar una identidad nunca asumas que vale desde el arranque: transformá un miembro usando <span class="eq">tg = sen/cos</span>, <span class="eq">cotg = cos/sen</span> y <span class="eq">sen<sup>2</sup> + cos<sup>2</sup> = 1</span> hasta llegar al otro.',
    },
  ],

  'sec6-ecuaciones': [
    {
      pose: 'base',
      tag: 'Una ecuación, infinitas vueltas',
      highlightSelector: '[data-widget="soluciones-periodicas"]',
      html: 'Resolver <span class="eq">cos x = 1/2</span> en <span class="eq">&Ropf;</span> no termina con un solo número: la recta <span class="eq">y = 1/2</span> corta al círculo en dos ángulos del primer giro (<span class="eq">&pi;/3</span> y <span class="eq">5&pi;/3</span>), y cada uno genera toda su clase de congruencia.',
    },
    {
      pose: 'colapso',
      tag: '¡No te olvides la segunda rama!',
      highlightSelector: '[data-widget="soluciones-periodicas"]',
      html: 'La calculadora solo devuelve una rama (por ejemplo <span class="eq">&pi;/3</span>). Además, si despejás <span class="eq">4cos<sup>2</sup> x &minus; 1 = 0</span>, aparecen dos valores (<span class="eq">cos x = +1/2</span> y <span class="eq">cos x = &minus;1/2</span>), que en un giro dan cuatro soluciones.',
    },
    {
      pose: 'panico',
      tag: 'Aduana obligatoria de dominio',
      highlightSelector: '[data-widget="soluciones-periodicas"]',
      html: '¡Antes de festejar un resultado, pasalo por la aduana del denominador! En ecuaciones con <span class="eq">tg x</span>, <span class="eq">sec x</span> o un <span class="eq">/ cos x</span>, cualquier candidato con <span class="eq">cos x = 0</span> (como <span class="eq">&pi;/2</span>) queda eliminado.',
    },
    {
      pose: 'explicando',
      tag: 'Ecuaciones cuadráticas trigonométricas',
      html: 'Cuando veas <span class="eq">sen<sup>2</sup> x</span> y <span class="eq">cos x</span> mezclados, reemplazá <span class="eq">sen<sup>2</sup> x = 1 &minus; cos<sup>2</sup> x</span> para unificar en una sola función, resolvé la cuadrática auxiliar y recién ahí buscá los ángulos.',
    },
    {
      pose: 'evaluando',
      tag: 'Mirá los polos rechazados en rosa',
      highlightSelector: '[data-widget="soluciones-periodicas"]',
      html: 'Activá el caso de exclusión de polo en el visor de soluciones periódicas: vas a ver el anillo rosa abierto en <span class="eq">&pi;/2</span> mostrando por qué <span class="eq">1 &minus; sen(&pi;/2) = 0</span> NO sirve si anula <span class="eq">cos(&pi;/2)</span> abajo.',
    },
  ],

  'sec6-base': [
    {
      pose: 'empatia',
      tag: 'Leer el dominio que pide el enunciado',
      html: 'Antes de escribir la respuesta final, mirá siempre dónde te piden <span class="eq">x</span>: si es en <span class="eq">[0; &pi;/2]</span> es un ángulo agudo; si es en <span class="eq">[0; 2&pi;)</span> es una lista entre llaves; si es en <span class="eq">&Ropf;</span> es unión de clases <span class="eq">C<sub>&alpha;</sub></span>.',
    },
    {
      pose: 'explicando',
      tag: 'Dos ángulos en cada vuelta',
      highlightSelector: '[data-widget="soluciones-periodicas"]',
      html: 'Para <span class="eq">sen x = k</span> (con <span class="eq">&minus;1 &lt; k &lt; 1</span>), trazá una línea horizontal a altura <span class="eq">k</span>: siempre corta el círculo en dos puntos simétricos respecto del eje vertical (<span class="eq">&alpha;</span> y <span class="eq">&pi; &minus; &alpha;</span>).',
    },
    {
      pose: 'pensativa',
      tag: 'Simetría para el coseno',
      html: 'Para <span class="eq">cos x = k</span>, la línea es vertical en <span class="eq">x = k</span>: corta arriba y abajo, así que los dos ángulos del giro son <span class="eq">&alpha;</span> y <span class="eq">2&pi; &minus; &alpha;</span>.',
    },
    {
      pose: 'explicando',
      tag: 'Cuándo da conjunto vacío ∅',
      html: 'Si al resolver una cuadrática auxiliar te sale <span class="eq">sen x = 3/2</span> o <span class="eq">cos x = &minus;2</span>, esa rama no aporta ninguna solución real porque seno y coseno nunca salen de <span class="eq">[&minus;1; 1]</span>.',
    },
    {
      pose: 'feliz',
      tag: 'Unión ordenada de clases',
      html: 'Cuando estés en <span class="eq">&Ropf;</span>, reducí cada ángulo al intervalo <span class="eq">[0; 2&pi;)</span> y unilos con <span class="eq">&cup;</span>, por ejemplo <span class="eq">S = C<sub>&pi;/3</sub> &cup; C<sub>4&pi;/3</sub></span>.',
    },
  ],

  'sec7-restricciones': [
    {
      pose: 'base',
      tag: 'Auditar afirmaciones e inversas',
      highlightSelector: '[data-widget="analizador-dominio-imagen"]',
      html: 'En este último pizarrón juntamos todo para justificar afirmaciones de verdadero/falso y diseñar restricciones de dominio que vuelvan biyectiva a cada una de las 6 funciones.',
    },
    {
      pose: 'lentes-brillo',
      tag: 'Las 3 trampas de Verdadero/Falso',
      html: 'Primero: <span class="eq">sen x = 7/2</span> es falsa porque <span class="eq">7/2 = 3,5 &notin; [&minus;1; 1]</span>. Segundo: <span class="eq">tg x = &minus;8</span> o <span class="eq">tg x = 15</span> sí tienen solución real porque <span class="eq">Im(tg) = &Ropf;</span>. Tercero: <span class="eq">cos x &gt; 0</span> en <span class="eq">[0; 2&pi;)</span> ocurre en dos tramos: <span class="eq">[0; &pi;/2) &cup; (3&pi;/2; 2&pi;)</span>.',
    },
    {
      pose: 'eureka',
      tag: 'Prueba de la recta horizontal en vivo',
      highlightSelector: '[data-widget="analizador-dominio-imagen"]',
      html: 'Para que una función sea biyectiva en <span class="eq">A &rarr; B</span>, toda recta horizontal en <span class="eq">B</span> debe cortar al gráfico en <strong>un único punto</strong> sobre el dominio <span class="eq">A</span>.',
    },
    {
      pose: 'explicando',
      tag: 'Restricciones estándar de las 6 funciones',
      html: 'Para <span class="eq">sen</span> restringimos a <span class="eq">[&minus;&pi;/2; &pi;/2]</span>; para <span class="eq">cos</span> a <span class="eq">[0; &pi;]</span>; para <span class="eq">tg</span> al abierto <span class="eq">(&minus;&pi;/2; &pi;/2)</span>; y para <span class="eq">cotg</span> a <span class="eq">(0; &pi;)</span>, dejando afuera los polos donde no existen.',
    },
    {
      pose: 'evaluando',
      tag: 'Escaneá el intervalo con las flechas',
      highlightSelector: '[data-widget="analizador-dominio-imagen"]',
      html: 'Mové los extremos <span class="eq">[a; b]</span> en el analizador y observá cuándo pasa de «No inyectiva» a «Biyectiva» al quedar contenida una única rama monótona.',
    },
  ],

  'sec7-base': [
    {
      pose: 'empatia',
      tag: 'Inyectiva vs Suryectiva en criollo',
      html: 'Si todavía mezclás «inyectiva» con «suryectiva», pensalo así: <strong>inyectiva</strong> significa que no repite alturas (cada valor <span class="eq">y</span> tiene un solo <span class="eq">x</span>), y <strong>suryectiva</strong> significa que cubre todo el codominio prometido.',
    },
    {
      pose: 'explicando',
      tag: 'Por qué el codominio importa',
      html: 'Si definís <span class="eq">f: [&minus;&pi;/2; &pi;/2] &rarr; &Ropf;</span> con <span class="eq">f(x) = sen x</span>, es inyectiva pero NO suryectiva porque ningún <span class="eq">x</span> alcanza <span class="eq">y = 2</span>. Tenés que achicar el codominio a <span class="eq">[&minus;1; 1]</span>.',
    },
    {
      pose: 'pensativa',
      tag: 'Paréntesis abierto en los polos',
      highlightSelector: '[data-widget="analizador-dominio-imagen"]',
      html: 'Para <span class="eq">tg x</span> la rama central vive entre <span class="eq">&minus;&pi;/2</span> y <span class="eq">&pi;/2</span>, pero lleva paréntesis abiertos <span class="eq">(&minus;&pi;/2; &pi;/2)</span> porque en los bordes hay asíntotas verticales.',
    },
    {
      pose: 'explicando',
      tag: 'Comparar para no confundir',
      html: 'Cuando dudes entre <span class="eq">tg x</span> y <span class="eq">cosec x</span>, compará tres datos: polos (<span class="eq">cos x = 0</span> vs <span class="eq">sen x = 0</span>), imagen (<span class="eq">&Ropf;</span> vs <span class="eq">(&minus;&infin;; &minus;1] &cup; [1; +&infin;)</span>) y período (<span class="eq">&pi;</span> vs <span class="eq">2&pi;</span>).',
    },
    {
      pose: 'feliz',
      tag: 'Lista para el Simulacro Global',
      html: 'Con dominios, congruencia, reducción y ecuaciones controladas por dominio, tenés todo el capítulo 10 armado de principio a fin. ¡Pasá al entrenador o a la Hoja de Repaso!',
    },
  ],
};

export const SCRIPTS = VN_SCRIPTS;

export const DIAGNOSE_REACTIONS = Object.freeze(
  Object.fromEntries(
    Object.values(DIAGNOSTIC_DEFINITIONS).map((d) => [
      d.id,
      {
        id: d.id,
        pose: d.pose,
        tag: d.tag,
        text: d.message,
        message: d.message,
      },
    ])
  )
);

export const STREAK_REACTIONS = Object.freeze({
  1: {
    pose: 'feliz',
    tag: 'Buen arranque',
    text: '¡Bien ahí! Arrancaste con el pie derecho resolviendo sin pistas.',
  },
  3: {
    pose: 'orgullosa',
    tag: '3 al hilo sin ayuda',
    text: 'Tres seguidos de forma independiente: ya estás leyendo cuadrantes, períodos y dominios sin caer en trampas.',
  },
  5: {
    pose: 'sonrojada',
    tag: 'Racha impecable',
    text: 'Cinco al hilo sin ninguna pista... b-bueno, admito que dominaste las funciones trigonométricas con bastante elegancia.',
  },
  repeatedError: {
    pose: 'empatia',
    tag: 'Frenemos a revisar juntos',
    text: 'Cuando dos intentos seguidos no cierran, no adivines a ciegas: desplegá una pista progresiva o abrí el pizarrón del concepto para ver qué condición te falta.',
  },
});
