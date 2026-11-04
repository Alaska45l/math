/**
 * vn-scripts.js — Guiones teatrales interactivos de Alaska ("Modo Novela Visual")
 * Laboratorio 7: Funciones, Modelos y Ecuaciones Exponenciales (exponenciales.html)
 *
 * Contiene:
 * - 20 guiones artesanales en voseo rioplatense auténtico de Exactas UNMDP:
 *   - 10 guiones principales (sec1 a sec10, 6 globos cada uno)
 *   - 10 guiones "Base desde cero" (sec1 a sec10, 5 globos cada uno)
 * - DIAGNOSE_REACTIONS para los 10 códigos cognitivos de logic.js
 * - STREAK_REACTIONS para estados de racha y progreso
 *
 * Restricciones estrictas:
 * - Cero emojis Unicode.
 * - Cada línea posee >= 20 palabras; promedio global >= 30 palabras.
 * - Poses del catálogo de 17 sprites en 4 tiers de frecuencia.
 */

const line = (pose, tag, html) => ({ pose, tag, html });
const fraction = (top, bottom) =>
  `<span class="fr"><span class="top">${top}</span><span class="bar" aria-hidden="true"></span><span class="bot">${bottom}</span></span>`;

// =============================================================================
// REACCIONES A DIAGNÓSTICOS COGNITIVOS (10 IDs de logic.js)
// =============================================================================

export const DIAGNOSE_REACTIONS = {
  // 1. Confundió salto aditivo con razón multiplicativa
  linear_difference_instead_of_ratio: line(
    "unamused",
    "Sin recetas mágicas",
    `¡Frená el carro un segundo! Estás contando saltos aditivos como si estuviéramos en una función lineal de primer año. En una exponencial los valores no avanzan sumando siempre la misma diferencia: se multiplican por un factor constante <span class="eq">a</span> a cada paso regular. Mirá la tabla con atención: <span class="eq">10 &minus; 5 = 5</span>, pero en la otra columna hacés <span class="eq">6 : 2 = 3</span> y <span class="eq">18 : 6 = 3</span>. Es una escala multiplicativa pura con razón <span class="eq">a = 3</span>, no una suma repetida de escuela primaria.`
  ),

  // 2. Multiplicó el coeficiente k por la base a: 3 · 2^x = 6^x
  multiplied_k_and_base: line(
    "colapso",
    "Jerarquía de operaciones",
    `¡Ay, no! ¡Colapso total de cátedra en el pizarrón! La potenciación tiene prioridad absoluta sobre la multiplicación: en <span class="eq">3 &middot; 2<sup>x</sup></span>, el exponente sólo afecta a la base contigua <span class="eq">2</span>; el factor <span class="eq">k = 3</span> espera afuera su turno pacientemente. Si hacés <span class="eq">3 &middot; 2 = 6</span> y escribís <span class="eq">6<sup>x</sup></span>, para <span class="eq">x = 2</span> tendrías <span class="eq">6<sup>2</sup> = 36</span> amebas, pero en el frasco real sólo contamos <span class="eq">3 &middot; 2<sup>2</sup> = 3 &middot; 4 = 12</span> amebas reales. ¡Inventaste <span class="eq">24</span> amebas de la nada por saltarte la jerarquía algebraica!`
  ),

  // 3. Desfasaje x - 1 arrastrado de sucesiones discretas
  confused_fencepost_x_minus_1: line(
    "sospecha",
    "Desfasaje de ancla",
    `Mmm... ojo con ese desfasaje traicionero. Estás arrastrando de memoria la fórmula de sucesiones geométricas donde se empieza a contar desde el término <span class="eq">n = 1</span>. Pero acá estamos en funciones reales continuas y arrancamos en el momento inicial <span class="eq">x = 0</span> exacto. Como <span class="eq">2<sup>0</sup> = 1</span>, el valor inicial es directamente <span class="eq">f(0) = k &middot; 2<sup>0</sup> = k &middot; 1 = k</span>. Si escribís <span class="eq">k &middot; a<sup>x&minus;1</sup></span> en <span class="eq">x = 0</span>, tendrías <span class="eq">k &middot; a<sup>&minus;1</sup> = k/a</span>, dividiendo la población antes de empezar a medirla.`
  ),

  // 4. Aceptó base negativa o unitaria en ℝ
  invalid_base_restriction: line(
    "panico",
    "¡Alerta de Laboratorio!",
    `¡Peligro crítico en el laboratorio de Exactas! En los números reales la base exige obligatoriamente <span class="eq">a &gt; 0</span> y <span class="eq">a &ne; 1</span>. Si metés una base negativa como <span class="eq">a = &minus;2</span>, al querer calcular la función en <span class="eq">x = 1/2</span> tendrías <span class="eq">(&minus;2)<sup>1/2</sup> = &radic;(&minus;2) &notin; &reals;</span>, que no existe en el conjunto de los números reales y destruye la curva continua. Y si elegís base <span class="eq">a = 1</span>, la potencia <span class="eq">1<sup>x</sup> = 1</span> vale siempre uno: te queda una recta constante horizontal <span class="eq">f(x) = k</span> completamente aburrida.`
  ),

  // 5. Usó la tasa porcentual bruta r en vez de 1 ± r
  raw_percentage_as_base: line(
    "lentes-brillo",
    "Trampa de Parcial",
    `¡Clásica trampa cazabobos de examen parcial! Si una población o una sustancia crece un <span class="eq">12%</span> (<span class="eq">r = 0,12</span>), al valor inicial le tenés que sumar ese incremento: conservás el <span class="eq">100%</span> original más el extra decimal de <span class="eq">0,12</span>. La base multiplicativa acumulada es <span class="eq">a = 1 + r = 1 + 0,12 = 1,12</span>. Si ponés <span class="eq">a = 0,12</span> directo como base de la potencia <span class="eq">P(t) = P<sub>0</sub> &middot; (0,12)<sup>t</sup></span>, ¡hacés desaparecer el <span class="eq">88%</span> de la población en el primer período transcurrido!`
  ),

  // 6. Invirtió el período compuesto t · T en vez de t / T
  inverted_period_exponent: line(
    "pensativa",
    "Escala de tiempo",
    `A ver, pensemos despacio la escala temporal del fenómeno físico. Si la semidesintegración radiactiva ocurre cada período <span class="eq">T = 3 min</span>, en un tiempo <span class="eq">t = 30 min</span> transcurrieron <span class="eq">t / T = 30 / 3 = 10</span> vidas medias completas, jamás <span class="eq">30 &middot; 3 = 90</span> ciclos. El exponente de la función mide cuántas veces se repitió el proceso de división por dos: siempre se divide el tiempo total transcurrido por la duración de cada ciclo, escribiendo <span class="eq">M(t) = M<sub>0</sub> &middot; (1/2)<sup>t/T</sup></span>.`
  ),

  // 7. Ignoró que k < 0 invierte el sentido de monotonía
  ignored_negative_k_monotonicity: line(
    "enojada",
    "¡Frená la mano!",
    `¡Frená la mano antes de marcar cualquier opción! No podés mirar la base <span class="eq">a = 1/2</span> aislada y cantar decreciente en automático. La potencia <span class="eq">(1/2)<sup>x</sup></span> decae hacia cero con valores positivos, pero en <span class="eq">g(x) = &minus;3 &middot; (1/2)<sup>x</sup></span>, al multiplicarla por la constante negativa <span class="eq">k = &minus;3 &lt; 0</span>, todos los valores se vuelven negativos y se acercan al cero desde abajo: <span class="eq">g(0) = &minus;3</span>, <span class="eq">g(1) = &minus;1,5</span>, <span class="eq">g(2) = &minus;0,75</span>... ¡como <span class="eq">&minus;0,75 &gt; &minus;1,5 &gt; &minus;3</span>, están subiendo en la recta numérica! Por eso es estrictamente creciente.`
  ),

  // 8. Corchete cerrado en la asíntota horizontal de la imagen
  closed_bracket_on_asymptote: line(
    "lentes-brillo",
    "Cazabobos de Exactas",
    `¡Cazabobos clásico de final de carrera en Exactas! La gráfica exponencial se aproxima tanto como quieras a la recta horizontal <span class="eq">y = c</span>, pero como una potencia <span class="eq">k &middot; a<sup>x</sup></span> jamás se anula en los números reales, la función nunca llega a tocar ese piso ni ese techo. La asíntota horizontal no pertenece al conjunto imagen de la función: va SIEMPRE con paréntesis redondo abierto, como <span class="eq">(c; +&infin;)</span> o <span class="eq">(&minus;&infin;; c)</span>, jamás con un corchete cerrado <span class="eq">[c; +&infin;)</span> que afirme que ese valor se alcanza.`
  ),

  // 9. Restó exponentes sin paréntesis en un cociente
  subtracted_exponents_without_parens: line(
    "sospecha",
    "Error de signos",
    `Mmm... acá hay olor a signo cambiado por apuro. Cuando restás un exponente compuesto en un cociente de igual base como <span class="eq">2<sup>3x+1</sup> : 2<sup>4x&minus;16</sup> = 2<sup>0</sup></span>, el signo menos afecta a TODO el binomio del divisor: tenés que poner paréntesis obligatorios. Escribí <span class="eq">(3x + 1) &minus; (4x &minus; 16) = 0</span>. Al distribuir el signo menos, queda <span class="eq">3x + 1 &minus; 4x + 16 = 0 &rArr; &minus;x + 17 = 0 &rArr; x = 17</span>. Si te comés el paréntesis y ponés <span class="eq">3x + 1 &minus; 4x &minus; 16</span>, el dieciséis queda restando y el ejercicio queda arruinado.`
  ),

  // 10. Aceptó u <= 0 en sustitución cuadrática u = a^x
  accepted_non_positive_u_in_substitution: line(
    "panico",
    "¡Alerta de Laboratorio!",
    `¡Pará la máquina de calcular un segundo! Pusiste <span class="eq">u = a<sup>x</sup></span>, pero en los reales una base positiva elevada a cualquier exponente cumple estrictamente <span class="eq">a<sup>x</sup> &gt; 0</span>. Si la fórmula resolvente de la cuadrática auxiliar te arroja raíces como <span class="eq">u<sub>1</sub> = 3</span> y <span class="eq">u<sub>2</sub> = &minus;1</span>, tenés que descartar de inmediato <span class="eq">u<sub>2</sub> &le; 0</span> con lápiz rojo: la ecuación <span class="eq">a<sup>x</sup> = &minus;1</span> no tiene solución en <span class="eq">&reals;</span>. ¡No me arrastres raíces fantasma a la respuesta final del parcial!`
  ),
};

// =============================================================================
// REACCIONES A ESTADOS DE RACHA (STREAK_REACTIONS)
// =============================================================================

export const STREAK_REACTIONS = {
  firstTry: line(
    "orgullosa",
    "Impecable a la primera",
    `¡Excelente deducción matemática! Diste en el blanco al primer intento, respetando los primeros principios de la cátedra sin titubear. Guardá bien este razonamiento en tu libreta de notas, porque en el examen parcial te van a cambiar los números pero la estructura algebraica de fondo va a ser exactamente idéntica a esta.`
  ),
  recovered: line(
    "feliz",
    "Ahí encontraste el camino",
    `¡Bien pensado y corregido! Tropezaste en el primer intento, consultaste la pista orientativa y reconstruiste el paso algebraico que faltaba sin ponerte a adivinar. Así es exactamente como se aprende matemática rigurosa en Exactas: diagnosticando el desfasaje, entendiendo la propiedad y ajustando la cuenta final.`
  ),
  repeatedError: line(
    "enojada",
    "Basta de adivinar",
    `¡Pará la mano un segundo! Ya van dos intentos fallidos seguidos en la misma pregunta. No tires números al azar esperando que el sistema te apruebe por casualidad cósmica. Leé con atención la pista progresiva, agarrá papel y lápiz, y desarmá la ecuación paso a paso con las propiedades de potencias que vimos.`
  ),
  flawlessRun: line(
    "sonrojada",
    "N-no te agrandes...",
    `¿Completaste todas las preguntas de este bloque al primer intento y sin pedir ninguna pista de auxilio?... B-bueno, admito que tu razonamiento fue impecable de punta a punta. No te agrandes demasiado, todavía nos faltan los desafíos del siguiente capítulo, pero... reconozco que estuviste realmente brillante hoy.`
  ),
  showSolution: line(
    "colapso",
    "Resolución desglosada",
    `No te preocupes por haberte trabado: todos los que estudiamos acá tuvimos que desarmar estas ecuaciones en el pizarrón alguna vez. Vamos a abrir el desarrollo analítico completo renglón por renglón para que veas con claridad dónde estaba el nudo conceptual y cómo se destraba formalmente con las reglas de la cátedra.`
  ),
  solutionAfter: line(
    "empatia",
    "Seguimos construyendo",
    `Ahora que viste la resolución paso a paso con los cálculos intermedios, no te limites a memorizar el número final. Fijate bien qué propiedad de potencias o qué neutralidad multiplicativa hizo posible el despeje de la incógnita. Probá aplicar esa misma idea en el siguiente ejercicio que nos toque resolver.`
  ),
};

// =============================================================================
// LOS 20 GUIONES ARTESANALES (10 PRINCIPALES + 10 BASE DESDE CERO)
// =============================================================================

export const VN_SCRIPTS = {
  // ---------------------------------------------------------------------------
  // SECCIÓN 1: Detective de tablas (Lineal vs Exponencial vs Cuadrática)
  // ---------------------------------------------------------------------------
  "sec1-tablas": [
    line(
      "base",
      "Dos maneras de avanzar en una tabla",
      `¡Te doy la bienvenida al laboratorio de exponenciales! Mirá la pantalla con ojos de detective analítico: cuando te entregan una tabla de valores con pasos horizontales regulares, lo primero que mirás no es la última fila, sino la relación exacta entre dos renglones consecutivos. Vamos a descubrir si estamos sumando o multiplicando.`
    ),
    line(
      "pensativa",
      "El salto aditivo de Khan",
      `Fijate en la primera tabla de Khan Academy: cuando <span class="eq">x</span> avanza con <span class="eq">&Delta;x = 3</span> por <span class="eq">x = 12, 15, 18, 21</span>, las salidas hacen <span class="eq">5 &minus; (&minus;2) = 7</span>, <span class="eq">12 &minus; 5 = 7</span> y <span class="eq">19 &minus; 12 = 7</span>. Como la resta da <span class="eq">&Delta;y = 7</span> constante, estamos frente a una función lineal <span class="eq">y = mx + b</span> con salto aditivo uniforme.`
    ),
    line(
      "explicando",
      "La escala multiplicativa",
      `Ahora compará con la segunda tabla: con <span class="eq">&Delta;x = 1</span> en <span class="eq">x = 0, 1, 2, 3</span>, las salidas son <span class="eq">y = 1, 3, 9, 27</span>. Las restas dan <span class="eq">&Delta;y = 2, 6, 18</span>, ¡crecen sin control! Pero al dividir términos consecutivos, <span class="eq">3 / 1 = 3</span>, <span class="eq">9 / 3 = 3</span> y <span class="eq">27 / 9 = 3</span>. Es una razón multiplicativa constante <span class="eq">a = 3</span>.`
    ),
    line(
      "unamused",
      "La trampa cuadrática",
      `¡Mucho cuidado con la tercera tabla! Con <span class="eq">x = 2, 4, 6, 8</span>, las salidas hacen <span class="eq">y = 4, 9, 16, 25</span>. Las diferencias dan <span class="eq">&Delta;y = 5, 7, 9</span> y las divisiones dan <span class="eq">9/4 = 2,25</span> y <span class="eq">16/9 &asymp; 1,78</span>. ¡No es lineal ni exponencial! Es la parábola de cuadrados <span class="eq">y = x<sup>2</sup></span>: no caigas en la trampa de forzar un modelo.`
    ),
    line(
      "complice",
      "La regla de oro de Exactas",
      `Anotate este secreto de supervivencia para el examen parcial: primero calculás las diferencias verticales <span class="eq">&Delta;y = y<sub>i+1</sub> &minus; y<sub>i</sub></span>. Si dan un valor constante, declarás modelo lineal. Si no dan constante, calculás los cocientes <span class="eq">y<sub>i+1</sub> / y<sub>i</sub></span> con <span class="eq">&Delta;x</span> fijo: si ese cociente es constante, ésa es tu base multiplicativa <span class="eq">a</span>.`
    ),
    line(
      "evaluando",
      "Tu turno con las tablas",
      `Probá los tres botones del tablero interactivo, modificá los valores numéricos y observá cómo el velocímetro de tiza clasifica el modelo analítico en tiempo real. Yo me quedo acá mirando cómo inspeccionás los datos; asegurate de verificar los cocientes antes de confirmar tu deducción en los chequeos.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 2: Cultivo de amebas (El neutro y k·a^x ≠ (k·a)^x)
  // ---------------------------------------------------------------------------
  "sec2-amebas": [
    line(
      "base",
      "El experimento de Exactas",
      `En la página ochenta y nueve del apunte oficial de Exactas aparece el famoso Problema Uno del cultivo biológico. Colocamos amebas en un medio nutritivo ideal y observamos que cada individuo se divide en dos células hijas al cumplirse cada hora exacta. Vamos a desarmar la matemática que gobierna este frasco.`
    ),
    line(
      "pensativa",
      "El momento cero y el neutro uno",
      `¿Qué sucede exactamente al comenzar el experimento en <span class="eq">x = 0</span>? Si arrancamos con <span class="eq">3</span> amebas, la fórmula indica <span class="eq">f(0) = 3 &middot; 2<sup>0</sup></span>. Como todo número real no nulo cumple <span class="eq">2<sup>0</sup> = 1</span>, nos queda <span class="eq">f(0) = 3 &middot; 1 = 3</span>. El coeficiente inicial <span class="eq">k = 3</span> representa siempre la población en el origen.`
    ),
    line(
      "colapso",
      "El gran sacrilegio: 3 · 2ˣ ≠ 6ˣ",
      `¡Ay, no! El error más sangriento de los ingresantes es hacer <span class="eq">3 &middot; 2 = 6</span> y escribir <span class="eq">6<sup>x</sup></span>. Para <span class="eq">x = 2</span>, con <span class="eq">6<sup>2</sup> = 36</span> amebas, pero en el frasco real sólo contamos <span class="eq">3 &middot; 2<sup>2</sup> = 3 &middot; 4 = 12</span> amebas. ¡Inventaste <span class="eq">24</span> amebas de la nada por saltarte la jerarquía de las operaciones!`
    ),
    line(
      "explicando",
      "Jerarquía terca pero sabia",
      `La regla algebraica es inflexible: la potencia es una operación de mayor jerarquía que la multiplicación. En <span class="eq">3 &middot; 2<sup>x</sup></span>, el exponente <span class="eq">x</span> sólo tiene autoridad sobre la base contigua <span class="eq">2</span>. El coeficiente inicial <span class="eq">k = 3</span> espera afuera y recién multiplica al resultado de la duplicación acumulada.`
    ),
    line(
      "complice",
      "El truco mental del laboratorio",
      `Para no meter la pata jamás en un parcial, imaginate que el coeficiente <span class="eq">k = 3</span> son tres frascos separados sobre la mesada. En cada frasco ponés una sola ameba duplicándose con <span class="eq">2<sup>x</sup></span>. Al final sumás las tres colonias independientes: <span class="eq">f(x) = 3 &middot; 2<sup>x</sup></span>, jamás un monstruo mutante <span class="eq">6<sup>x</sup></span>.`
    ),
    line(
      "evaluando",
      "Seguí el cultivo hora por hora",
      `Deslizá el control de tiempo de <span class="eq">0</span> a <span class="eq">10 h</span> en el simulador. Compará la curva celeste de una sola ameba <span class="eq">2<sup>x</sup></span> contra la dorada de tres amebas <span class="eq">3 &middot; 2<sup>x</sup></span> y comprobá que la razón vertical entre ambas siempre se mantiene clavada en <span class="eq">k = 3</span> en todo el recorrido.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 3: Puente continuo (Densidad racional y restricciones en ℝ)
  // ---------------------------------------------------------------------------
  "sec3-continuo": [
    line(
      "base",
      "El pasaporte de la base en Exactas",
      `Llegamos a la definición formal de la página noventa del apunte: la función exponencial real tiene la forma <span class="eq">f(x) = k &middot; a<sup>x</sup></span>, con la base <span class="eq">a &isin; &reals;⁺ &minus; {1}</span> y la constante <span class="eq">k &isin; &reals; &minus; {0}</span>. ¿Por qué los matemáticos de Exactas son tan estrictos con estas aduanas de frontera?`
    ),
    line(
      "pensativa",
      "Pisar entre los enteros",
      `Si únicamente utilizáramos exponentes enteros positivos como <span class="eq">x = 1, 2, 3</span>, la gráfica de la función serían puntos aislados flotando en el plano cartesiano. Para trazar un trazo suave y continuo necesitamos poder calcular qué ocurre en los números intermedios, por ejemplo cuando <span class="eq">x = 0,5 = 1/2</span>.`
    ),
    line(
      "explicando",
      "El puente del radical",
      `Por las leyes fundamentales de los exponentes, elevar a la <span class="eq">1/2</span> equivale a calcular la raíz cuadrada principal. Si nuestra base es <span class="eq">a = 9</span>, en <span class="eq">x = 1/2</span> la función vale <span class="eq">9<sup>1/2</sup> = &radic;9 = 3</span>. Los números racionales rellenan los huecos infinitos entre enteros y tienden un puente continuo sobre <span class="eq">&reals;</span>.`
    ),
    line(
      "panico",
      "¡Colapso con base negativa!",
      `Pero mirá la catástrofe que ocurre si elegís una base negativa como <span class="eq">a = &minus;2</span>: al querer evaluar la función en <span class="eq">x = 1/2</span> tendrías <span class="eq">(&minus;2)<sup>1/2</sup> = &radic;(&minus;2) &notin; &reals;</span>, ¡que no existe en el conjunto de los números reales! La curva se desintegra en puntos que saltan sin sentido y rompen la continuidad.`
    ),
    line(
      "unamused",
      "Las dos bases aburridas: 0 y 1",
      `Tampoco permitimos base <span class="eq">a = 1</span> porque la potencia <span class="eq">1<sup>x</sup> = 1</span> vale siempre uno: la gráfica sería una recta horizontal constante. Y si eligieras base <span class="eq">a = 0</span>, al intentar calcular <span class="eq">0<sup>&minus;1</sup></span> tendrías <span class="eq">1/0</span>, rompiendo la matemática al dividir por cero de forma prohibida.`
    ),
    line(
      "evaluando",
      "Conectá los puntos en el simulador",
      `Utilizá el selector de densidad del pizarrón para pasar de la nube de números naturales a los racionales y luego al continuo real. Observá cómo la curva verde cobra vida de forma suave y sin fisuras únicamente cuando la base cumple todas las exigencias impuestas por la teoría formal.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 4: Espejo de base (Decaimiento radiactivo y simetría (1/a)^x = a^-x)
  // ---------------------------------------------------------------------------
  "sec4-espejo": [
    line(
      "base",
      "El Problema 2 del apunte",
      `En el Problema Dos de la página noventa nos presentan una muestra radiactiva de <span class="eq">1 kg</span> que pierde la mitad de su masa en cada año que transcurre. La sustancia restante responde a <span class="eq">f(x) = (1/2)<sup>x</sup></span>; si empezás con <span class="eq">2 kg</span>, la función es <span class="eq">g(x) = 2 &middot; (1/2)<sup>x</sup></span>.`
    ),
    line(
      "pensativa",
      "El puente del espejo algebraico",
      `Mirá esta identidad con ojos de lince matemático: <span class="eq">(1/2)<sup>x</sup> = (2<sup>&minus;1</sup>)<sup>x</sup> = 2<sup>&minus;x</sup></span>. Cambiar la base por su inversa fraccionaria equivale algebraicamente a cambiar el signo del exponente: <span class="eq">(1/a)<sup>x</sup> = a<sup>&minus;x</sup></span>. Esa es la clave analítica de la simetría.`
    ),
    line(
      "explicando",
      "Geometría del reflejo",
      `Como la transformación <span class="eq">x &rarr; &minus;x</span> produce una reflexión geométrica respecto al eje vertical <span class="eq">y</span>, la gráfica de <span class="eq">(1/2)<sup>x</sup></span> es exactamente la misma curva de <span class="eq">2<sup>x</sup></span> pero vista a través de un espejo perfecto. Lo que antes crecía vertiginosamente, ahora decae hacia el piso del cero.`
    ),
    line(
      "lentes-brillo",
      "La trampa del Ejercicio 3 de Exactas",
      `En el Ejercicio Tres te piden comparar <span class="eq">2<sup>x</sup></span>, <span class="eq">3<sup>x</sup></span> y <span class="eq">e<sup>x</sup></span>. Para <span class="eq">x &gt; 0</span>, la base mayor va por arriba: <span class="eq">3<sup>x</sup> &gt; e<sup>x</sup> &gt; 2<sup>x</sup></span>. Pero para <span class="eq">x &lt; 0</span>, ¡el orden se invierte! En <span class="eq">x = &minus;1</span>, <span class="eq">2<sup>&minus;1</sup> = 0,5</span> supera a <span class="eq">3<sup>&minus;1</sup> &asymp; 0,33</span>; la base menor queda arriba.`
    ),
    line(
      "complice",
      "La recta que nunca se toca",
      `Fijate que la masa radiactiva se reduce sucesivamente a <span class="eq">1/2, 1/4, 1/8, 1/16 &hellip;</span> Por más años que dejes pasar, jamás llegará a valer cero absoluto y mucho menos será negativa. La recta horizontal <span class="eq">y = 0</span> es la asíntota horizontal formal: la imagen es <span class="eq">(0; +&infin;)</span> abierta.`
    ),
    line(
      "evaluando",
      "Activá el modo espejo",
      `Tocá el interruptor de reflexión en el widget interactivo. Comprobá cómo la curva de decaimiento radiactivo se superpone punto por punto con la curva de crecimiento al reflejarla horizontalmente, y verificá la asíntota horizontal acercando los valores hacia el infinito positivo.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 5: Los cuatro cuadrantes de k y a (Monotonía y g(x) = -3(1/2)^x)
  // ---------------------------------------------------------------------------
  "sec5-cuadrantes": [
    line(
      "base",
      "El mapa de los 4 cuadrantes",
      `En la página noventa del apunte oficial se ilustran cuatro gráficas fundamentales. La forma y el comportamiento de la curva exponencial <span class="eq">f(x) = k &middot; a<sup>x</sup></span> dependen de dos interruptores analíticos: si <span class="eq">a &gt; 1</span> o <span class="eq">0 &lt; a &lt; 1</span>, y si <span class="eq">k &gt; 0</span> o <span class="eq">k &lt; 0</span>.`
    ),
    line(
      "enojada",
      "¡La masacre del parcial de Exactas!",
      `Te voy a mostrar el ejercicio de examen que deja afuera a medio curso de ingreso: analizar la monotonía de <span class="eq">g(x) = &minus;3 &middot; (1/2)<sup>x</sup></span>. Los alumnos ven la base fraccionaria <span class="eq">a = 1/2 &lt; 1</span> y cantan en automático: como la base es fraccionaria, es decreciente. ¡Cero gigante en la hoja del parcial!`
    ),
    line(
      "pensativa",
      "Mirá los números, no la receta",
      `Hagamos la cuenta despacito y con la verdad numérica en la mano: en <span class="eq">x = 0</span> tenemos <span class="eq">g(0) = &minus;3 &middot; 1 = &minus;3</span>. En <span class="eq">x = 1</span> tenemos <span class="eq">g(1) = &minus;3 &middot; (1/2) = &minus;1,5</span>. En <span class="eq">x = 2</span> tenemos <span class="eq">g(2) = &minus;3 &middot; (1/4) = &minus;0,75</span>.`
    ),
    line(
      "explicando",
      "Subiendo desde el sótano",
      `Preguntate mirando la recta numérica real: ¿quién está más a la derecha, <span class="eq">&minus;3</span> o <span class="eq">&minus;1,5</span>? ¡<span class="eq">&minus;1,5</span> es más grande! Y <span class="eq">&minus;0,75</span> es todavía mayor: <span class="eq">&minus;0,75 &gt; &minus;1,5 &gt; &minus;3</span>. A medida que avanzamos hacia la derecha, las imágenes van subiendo hacia el cero: la función es estrictamente CRECIENTE en todo su dominio.`
    ),
    line(
      "complice",
      "La regla de los dos signos",
      `El misterio se resuelve entendiendo las transformaciones del plano: multiplicar por la constante <span class="eq">k = &minus;3 &lt; 0</span> refleja toda la curva respecto al eje horizontal <span class="eq">x</span>. Una curva que antes caía, al darla vuelta... ¡empieza a subir! Por eso <span class="eq">g(x)</span> es creciente y su imagen es <span class="eq">(&minus;&infin;; 0)</span> abierta.`
    ),
    line(
      "evaluando",
      "Inspeccioná los cuatro cuadrantes",
      `Recorré los cuatro cuadrantes interactivos en el tablero de mandos. Observá la tabla viva de valores y confirmá cómo el signo del coeficiente multiplicador y el tamaño de la base colaboran de manera estricta para definir si la curva sube o baja en la recta real.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 6: Constructor de puntos (Reconstrucción analítica y geométrica)
  // ---------------------------------------------------------------------------
  "sec6-constructor": [
    line(
      "base",
      "Forenses de funciones exponenciales",
      `En el Ejercicio 7 de la guía oficial de Exactas no te regalan la fórmula matemática ya cocinada: te entregan dos puntos del plano cartesiano que pertenecen a la gráfica y te exigen reconstruir con exactitud los parámetros <span class="eq">k</span> y <span class="eq">a</span> de la función exponencial general <span class="eq">f(x) = k &middot; a<sup>x</sup></span>.`
    ),
    line(
      "pensativa",
      "El truco de la división",
      `Cuando trabajabas con rectas calculabas la pendiente restando las coordenadas para hacer <span class="eq">&Delta;y / &Delta;x</span>. Pero en las exponenciales la magia se logra dividiendo: si hacés <span class="eq">f(x<sub>2</sub>) / f(x<sub>1</sub>)</span>, la constante <span class="eq">k</span> del numerador y del denominador se cancela limpiamente y te queda <span class="eq">a<sup>x<sub>2</sub> &minus; x<sub>1</sub></sup></span>.`
    ),
    line(
      "explicando",
      "Resolviendo el Ejercicio 7c",
      `Apliquemos el método al inciso 7c: la curva pasa por los puntos <span class="eq">P(1; 1)</span> y <span class="eq">Q(2; 3)</span>. Dividimos las ordenadas: <span class="eq">3 / 1 = a<sup>2&minus;1</sup> &rArr; a = 3</span> directamente. Luego reemplazamos en el primer punto: <span class="eq">k &middot; 3<sup>1</sup> = 1 &rArr; k = 1/3</span>. ¡La fórmula completa es <span class="eq">f(x) = (1/3) &middot; 3<sup>x</sup></span> sin titubear!`
    ),
    line(
      "lentes-brillo",
      "El regalo del punto en el eje Y",
      `Si uno de los dos puntos del enunciado tiene abscisa <span class="eq">x = 0</span>, como en el examen parcial con <span class="eq">P(0; &minus;3)</span> y <span class="eq">Q(2; &minus;3/4)</span>, ¡la cátedra te está regalando <span class="eq">k</span> servido en bandeja! Como <span class="eq">a<sup>0</sup> = 1</span>, tenés directamente <span class="eq">f(0) = k &middot; a<sup>0</sup> = k = &minus;3</span> sin despejar nada.`
    ),
    line(
      "complice",
      "La condición de mismo signo",
      `Fijate en una sutileza de rigor formal que distingue a un estudiante senior: las dos ordenadas <span class="eq">y<sub>1</sub></span> e <span class="eq">y<sub>2</sub></span> de los puntos dados DEBEN tener estrictamente el mismo signo. Si una fuera positiva y la otra negativa, el cociente daría negativo y no podrías calcular raíces pares en los números reales <span class="eq">&reals;</span> para despejar la base <span class="eq">a</span>.`
    ),
    line(
      "evaluando",
      "Arrastrá los puntos en el pizarrón",
      `Agarrá los dos puntos <span class="eq">P(x<sub>1</sub>; y<sub>1</sub>)</span> y <span class="eq">Q(x<sub>2</sub>; y<sub>2</sub>)</span> con el cursor sobre el lienzo interactivo. Llevalos a nuevas posiciones del plano y comprobá cómo el calculador paso a paso deduce la base <span class="eq">a</span> y la escala inicial <span class="eq">k</span> de forma inmediata sin destruir ningún elemento del árbol visual.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 7: Modelos en el tiempo (Porcentajes, períodos t/T y base e)
  // ---------------------------------------------------------------------------
  "sec7-modelos": [
    line(
      "base",
      "La matemática aplicada de los parciales",
      `En los parciales reales de Exactas no te van a tirar una variable <span class="eq">x</span> abstracta sin contexto: te van a plantear problemas de enunciado con gramos de talio radiactivo, millones de habitantes en censos urbanos o cultivos de bacterias medidos en placas de Petri a lo largo de varias jornadas.`
    ),
    line(
      "pensativa",
      "El Talio de Exactas 5b",
      `Analicemos el Ejercicio 5b: una muestra de <span class="eq">50 g</span> de Talio-206 tiene una vida media de <span class="eq">T = 3 min</span>. La masa restante responde a <span class="eq">M(t) = 50 &middot; (1/2)<sup>t/3</sup></span>. A los <span class="eq">t = 30 min</span> transcurrieron <span class="eq">30/3 = 10</span> vidas medias: queda <span class="eq">M(30) = 50 &middot; (1/2)<sup>10</sup> &asymp; 0,049 g</span>.`
    ),
    line(
      "lentes-brillo",
      "El doce por ciento que no es 0,12",
      `En el Ejercicio 5c tenemos <span class="eq">55</span> millones de habitantes con un crecimiento demográfico del <span class="eq">12%</span> cada <span class="eq">5</span> años. La base de acumulación es <span class="eq">a = 1 + 0,12 = 1,12</span>. La fórmula es <span class="eq">P(t) = 55 &middot; (1,12)<sup>t/5</sup></span>. A los <span class="eq">50</span> años hay <span class="eq">50/5 = 10</span> períodos y la población roza <span class="eq">P(50) &asymp; 170,8</span> millones.`
    ),
    line(
      "explicando",
      "La trampa de unidades de las bacterias",
      `¡Mucho ojo con este problema de parcial! Un cultivo bacteriano crece al <span class="eq">3,5%</span> cada <span class="eq">10 h</span> y al cabo de <span class="eq">5</span> días pesa <span class="eq">200 g</span>. No mezcles días con horas: <span class="eq">5</span> días equivalen a <span class="eq">120 h</span>, que representan <span class="eq">120/10 = 12</span> períodos. La masa inicial era <span class="eq">k = 200 / (1,035)<sup>12</sup> &asymp; 132,36 g</span>.`
    ),
    line(
      "complice",
      "La base natural e de Euler",
      `En procesos continuos de física o finanzas como la desintegración de isótopos con <span class="eq">A(t) = 120 &middot; e<sup>&minus;0,05t</sup></span>, la base es la constante de Euler <span class="eq">e &asymp; 2,71828</span>. Funciona con las mismas leyes exactas que cualquier otra base mayor que uno, sin ningún secreto místico oculto.`
    ),
    line(
      "evaluando",
      "Probá los 4 modelos en el simulador",
      `Alterná entre los cuatro escenarios de examen en el selector del panel interactivo. Observá con atención cómo el exponente compuesto <span class="eq">t / T</span> traduce el paso del tiempo real a ciclos de transformación biológica o física sin perder la precisión decimal.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 8: Desplazamientos y asíntotas (f(x) = k·a^(x-h) + c y trampa de imagen)
  // ---------------------------------------------------------------------------
  "sec8-asintotas": [
    line(
      "base",
      "La anatomía completa de la función",
      `Hasta acá estudiamos la curva centrada en el origen. Ahora la soltamos en el plano agregándole desplazamientos horizontales y verticales: <span class="eq">f(x) = k &middot; a<sup>x&minus;h</sup> + c</span>. El parámetro <span class="eq">h</span> la traslada lateralmente y la constante <span class="eq">c</span> traslada el piso o techo del gráfico.`
    ),
    line(
      "pensativa",
      "La asíntota se muda con c",
      `Como la potencia positiva <span class="eq">a<sup>x&minus;h</sup></span> se aproxima a cero cuando nos alejamos hacia el infinito adecuado, el término de la potencia tiende a desaparecer y la función se aproxima a <span class="eq">k &middot; 0 + c = c</span>. La recta horizontal <span class="eq">y = c</span> es la nueva asíntota que delimita la frontera del conjunto imagen.`
    ),
    line(
      "lentes-brillo",
      "La trampa mortal del corchete cerrado",
      `Prestá muchísima atención a esta trampa mortal de examen: te piden la imagen de <span class="eq">f(x) = 2 &middot; 3<sup>x&minus;1</sup> + 4</span>. Como el piso es <span class="eq">y = 4</span> y la curva sube, la mayoría anota <span class="eq">[4; +&infin;)</span> con corchete cerrado. ¡Error imperdonable! Para que valga <span class="eq">4</span> la potencia debería anularse, pero <span class="eq">3<sup>x&minus;1</sup> &gt; 0</span> jamás da cero. Va SIEMPRE con paréntesis abierto <span class="eq">(4; +&infin;)</span>.`
    ),
    line(
      "explicando",
      "El punto de anclaje h",
      `Para graficar la curva a mano alzada en una hoja de parcial sin hacer tablas eternas, buscá el punto donde el exponente se anula: <span class="eq">x = h</span>. En nuestro ejemplo, con <span class="eq">x = 1</span> tenemos <span class="eq">f(1) = 2 &middot; 3<sup>0</sup> + 4 = 2 &middot; 1 + 4 = 6</span>. El punto <span class="eq">P(1; 6)</span> es el ancla perfecta de la gráfica.`
    ),
    line(
      "complice",
      "¿Tiene o no tiene raíces reales?",
      `Para hallar los ceros de la función igualás la expresión a cero: <span class="eq">k &middot; a<sup>x&minus;h</sup> + c = 0</span>. Al despejar te queda la potencia <span class="eq">a<sup>x&minus;h</sup> = &minus;c / k</span>. Si el cociente <span class="eq">&minus;c / k &le; 0</span> resulta ser menor o igual a cero, la ecuación no tiene solución en los reales y el conjunto de ceros es el conjunto vacío formal <span class="eq">C<sub>0</sub> = &empty;</span>.`
    ),
    line(
      "evaluando",
      "Manipulá los deslizadores h y c",
      `Modificá los controles de desplazamiento <span class="eq">h</span> y <span class="eq">c</span> en el pizarrón. Mirá cómo la línea punteada de la asíntota acompaña fielmente a la constante <span class="eq">c</span> y cómo el intervalo del conjunto imagen se actualiza en tiempo real manteniendo siempre su extremo abierto.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 9: Radiografía de examen (Estudio completo de Ej. 14 y Parcial 2025)
  // ---------------------------------------------------------------------------
  "sec9-radiografia": [
    line(
      "base",
      "El estándar de oro del parcial de Exactas",
      `Cuando en un examen de la Facultad de Ciencias Exactas te piden realizar el estudio completo de una función, no alcanza con un croquis aproximado. Tenés que redactar con precisión milimétrica el Dominio, la Imagen, la Asíntota Horizontal, el Conjunto de Ceros, Positividad, Negatividad y los intervalos de Monotonía.`
    ),
    line(
      "pensativa",
      "Desarmando el Ejercicio 14",
      `Tomemos el Ejercicio 14 de la guía: <span class="eq">f(x) = 2 &minus; (1/2)<sup>x</sup></span>. Identifiquemos cada parámetro: la constante es <span class="eq">c = 2</span>, por lo que la asíntota horizontal es la recta <span class="eq">y = 2</span>. Como el coeficiente multiplicador es <span class="eq">k = &minus;1</span>, la gráfica vive por debajo de la asíntota y la imagen es <span class="eq">Im(f) = (&minus;&infin;; 2)</span> abierto.`
    ),
    line(
      "explicando",
      "Cálculo exacto de la raíz en C₀",
      `Calculemos el conjunto de ceros igualando a cero: <span class="eq">2 &minus; (1/2)<sup>x</sup> = 0 &rArr; (1/2)<sup>x</sup> = 2</span>. Escribimos ambos miembros en base dos: <span class="eq">2<sup>&minus;x</sup> = 2<sup>1</sup> &rArr; &minus;x = 1 &rArr; x = &minus;1</span>. El conjunto de ceros es el conjunto unitario con el elemento <span class="eq">C<sub>0</sub> = { &minus;1 }</span> entre llaves formales.`
    ),
    line(
      "lentes-brillo",
      "Los intervalos de signos con punto y coma",
      `Como <span class="eq">k = &minus;1 &lt; 0</span> y la base es <span class="eq">a = 1/2 &lt; 1</span>, la función es estrictamente creciente en todo su dominio <span class="eq">&reals;</span>. Viene subiendo desde valores muy negativos, cruza el eje horizontal en <span class="eq">x = &minus;1</span> y sigue subiendo hacia <span class="eq">y = 2</span>. Por lo tanto, el conjunto de negatividad es <span class="eq">C&minus; = (&minus;&infin;; &minus;1)</span> y el de positividad es <span class="eq">C+ = (&minus;1; +&infin;)</span>.`
    ),
    line(
      "complice",
      "El gemelo del 2° Parcial 2025",
      `En el 2° Parcial del año 2025 tomaron una función gemela: <span class="eq">f(x) = 1 &minus; (1/2)<sup>x</sup></span>. La estructura analítica es calcada pero con <span class="eq">c = 1</span>. Al calcular la raíz tenemos <span class="eq">(1/2)<sup>x</sup> = 1 &rArr; x = 0</span>: el corte con el eje horizontal coincide exactamente con el origen de coordenadas <span class="eq">(0; 0)</span>.`
    ),
    line(
      "evaluando",
      "Compará las dos radiografías",
      `Alterná entre el Ejercicio 14 y el Parcial 2025 en el tablero interactivo. Cotejá cada una de las ocho fichas del informe técnico y confirmá cómo cada intervalo y conjunto algebraico concuerda con la curva dibujada en la pizarra de tiza.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 10: Balanza de ecuaciones (3 métodos en ℝ sin logaritmos)
  // ---------------------------------------------------------------------------
  "sec10-ecuaciones": [
    line(
      "base",
      "Ecuaciones exponenciales sin logaritmos",
      `En el curso de ingreso a la facultad te evalúan ecuaciones con la incógnita atrapada en el exponente pero todavía no te enseñaron la definición formal de logaritmo. ¿Cómo se resuelven con total rigor? A través de tres caminos algebraicos exactos basados en las propiedades puras de la potenciación.`
    ),
    line(
      "pensativa",
      "Camino 1: La balanza de igualación de bases",
      `Veamos el Ejercicio 8: <span class="eq">2<sup>3x+1</sup> : 16<sup>x&minus;4</sup> = 1</span>. Expresamos <span class="eq">16 = 2<sup>4</sup></span>, por lo que el divisor queda <span class="eq">2<sup>4(x&minus;4)</sup> = 2<sup>4x&minus;16</sup></span>. Restamos exponentes respetando los signos con paréntesis: <span class="eq">3x + 1 &minus; (4x &minus; 16) = 0 &rArr; &minus;x + 17 = 0 &rArr; x = 17</span>, de modo que <span class="eq">S = { 17 }</span>.`
    ),
    line(
      "explicando",
      "Camino 2: El factor común salvador",
      `En el segundo camino resolvemos <span class="eq">2<sup>x+1</sup> + 2<sup>x</sup> = 12</span>. Desarmamos el primer término como producto de potencias: <span class="eq">2<sup>x</sup> &middot; 2<sup>1</sup> + 2<sup>x</sup> &middot; 1 = 12</span>. Extraemos factor común: <span class="eq">2<sup>x</sup>(2 + 1) = 12 &rArr; 2<sup>x</sup> &middot; 3 = 12 &rArr; 2<sup>x</sup> = 4 = 2<sup>2</sup> &rArr; x = 2</span>, concluyendo que <span class="eq">S = { 2 }</span>.`
    ),
    line(
      "panico",
      "Camino 3: Sustitución cuadrática con trampa",
      `En el Ejercicio 8i de examen: <span class="eq">3<sup>2x</sup> &minus; 4 &middot; 3<sup>x+1</sup>/9 + 1/3 = 0</span>. Simplificamos el término central: <span class="eq">4 &middot; 3 &middot; 3<sup>x</sup> / 9 = (4/3) &middot; 3<sup>x</sup></span>. Hacemos la sustitución cuadrática <span class="eq">u = 3<sup>x</sup></span> con la condición de existencia obligatoria <span class="eq">u &gt; 0</span> en los números reales.`
    ),
    line(
      "complice",
      "Descartar soluciones extrañas",
      `La resolvente cuadrática de <span class="eq">u<sup>2</sup> &minus; (4/3)u + 1/3 = 0</span> arroja dos raíces: <span class="eq">u<sub>1</sub> = 1</span> y <span class="eq">u<sub>2</sub> = 1/3</span>. Ambas son positivas, por lo que <span class="eq">3<sup>x</sup> = 1 &rArr; x = 0</span>, y <span class="eq">3<sup>x</sup> = 1/3 = 3<sup>&minus;1</sup> &rArr; x = &minus;1</span>, dando <span class="eq">S = { &minus;1; 0 }</span>. ¡Si alguna raíz auxiliar fuera <span class="eq">u &le; 0</span>, la tachábamos de inmediato!`
    ),
    line(
      "evaluando",
      "Resolvé paso a paso en la balanza",
      `Seleccioná cualquiera de los tres métodos algebraicos en el tablero de ecuaciones. Seguí cada paso de simplificación en la balanza interactiva y observá cómo cada ecuación colapsa con total elegancia hacia su conjunto solución en los reales.`
    ),
  ],

  // ===========================================================================
  // LOS 10 GUIONES DE "BASE DESDE CERO: LO QUE NADIE TE EXPLICA"
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // SECCIÓN 1: Base desde cero (Sueldo vs Interés compuesto)
  // ---------------------------------------------------------------------------
  "sec1-base": [
    line(
      "empatia",
      "Tranqui, que nadie nace sabiendo tablas",
      `Si ves una tabla repleta de números y sentís que te marea la vista, respirá hondo y relajate. No sos vos: en el colegio nos acostumbraron a calcular cuentas sueltas de memoria sin enseñarnos la historia viva que cuenta cada columna de datos.`
    ),
    line(
      "pensativa",
      "La alcancía vs el interés",
      `Pensalo con esta comparación cotidiana: si guardás <span class="eq">$500</span> fijos en una alcancía todas las semanas, tu dinero crece sumando siempre <span class="eq">+500</span>, <span class="eq">+500</span> y <span class="eq">+500</span>. Siempre el mismo salto aditivo constante: eso es una función lineal <span class="eq">f(x) = mx + b</span>.`
    ),
    line(
      "explicando",
      "El crecimiento que se acelera",
      `En cambio, si ponés una inversión que se duplica cada semana, al principio parece poca plata: <span class="eq">1</span> salta a <span class="eq">2</span>, <span class="eq">2</span> salta a <span class="eq">4</span>. Pero en pocos pasos estás en <span class="eq">8</span>, <span class="eq">16</span>, <span class="eq">32</span> y <span class="eq">64</span>. Cada paso multiplica por dos el valor anterior: eso es un modelo exponencial.`
    ),
    line(
      "base",
      "La prueba del lápiz",
      `Para descubrir qué tenés adelante hacé una sola cuenta con lápiz: restá dos renglones consecutivos <span class="eq">y<sub>2</sub> &minus; y<sub>1</sub></span>. Si la resta da siempre la misma constante, es una recta. Si la resta cambia, calculá el cociente <span class="eq">y<sub>2</sub> / y<sub>1</sub></span>: si da el mismo factor, estás ante una función exponencial.`
    ),
    line(
      "feliz",
      "¡Ya tenés el detector!",
      `Con esa simple división de dos términos consecutivos ya tenés en la mano el detector infalible para clasificar cualquier tabla de Khan Academy o de los parciales de Exactas sin dudar jamás de tu deducción.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 2: Base desde cero (Tres platos en la mesa)
  // ---------------------------------------------------------------------------
  "sec2-base": [
    line(
      "empatia",
      "La tentación de multiplicar 3 por 2",
      `Es súper común ver la expresión <span class="eq">3 &middot; 2<sup>x</sup></span> y sentir la tentación automática de hacer <span class="eq">3 &middot; 2 = 6</span> y escribir <span class="eq">6<sup>x</sup></span>. Nuestro cerebro ve el signo por y quiere liquidar la cuenta rápido para sacarse números de encima.`
    ),
    line(
      "pensativa",
      "Tres platos en la mesa",
      `Miralo con esta imagen: imaginate que tenés tres platos hondos sobre la mesa de la cocina. En cada plato colocás una sola porción de levadura que duplica su tamaño cada hora: una porción pasa a <span class="eq">2</span>, luego a <span class="eq">4</span>, luego a <span class="eq">8</span>.`
    ),
    line(
      "explicando",
      "La cuenta por separado",
      `En cada plato la levadura crece según la fórmula <span class="eq">2<sup>x</sup></span>. Como tenés tres platos en total sobre la mesa, al final de la jornada sumás las tres masas o multiplicás por tres: <span class="eq">3 &middot; 2<sup>x</sup></span>. A las dos horas tenés <span class="eq">3 &middot; 2<sup>2</sup> = 3 &middot; 4 = 12</span> porciones en total.`
    ),
    line(
      "base",
      "Por qué seis a la equis es una locura",
      `Si hicieras <span class="eq">3 &middot; 2 = 6</span> y escribieras <span class="eq">6<sup>x</sup></span>, estarías diciendo que en cada plato la levadura se sextuplica: a las dos horas tendrías <span class="eq">6<sup>2</sup> = 36</span> porciones. ¡Aparecieron <span class="eq">24</span> porciones mágicas de la nada por saltarte el orden de las operaciones!`
    ),
    line(
      "orgullosa",
      "El orden que te salva",
      `El exponente manda únicamente sobre su base vecina; el coeficiente que está adelante multiplica después al resultado final. Grabate este orden de operaciones en la memoria y nunca más te van a confundir en un ejercicio.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 3: Base desde cero (Dibujar sin levantar el lápiz)
  // ---------------------------------------------------------------------------
  "sec3-base": [
    line(
      "empatia",
      "¿Por qué tantas restricciones con la base?",
      `Te dicen que la base <span class="eq">a</span> tiene que ser positiva <span class="eq">a &gt; 0</span> y que no puede valer uno <span class="eq">a &ne; 1</span>, y parece un capricho aburrido de profesores de matemática que quieren complicarte la vida. Vamos a entender juntos de dónde sale esta exigencia.`
    ),
    line(
      "pensativa",
      "El signo loco de los negativos",
      `Si la base fuera negativa, por ejemplo <span class="eq">a = &minus;2</span>, hacé las cuentas: <span class="eq">(&minus;2)<sup>1</sup> = &minus;2</span>; al cuadrado da <span class="eq">(&minus;2)<sup>2</sup> = 4</span>; al cubo da <span class="eq">(&minus;2)<sup>3</sup> = &minus;8</span>. Los puntos van saltando de arriba a abajo como una pelota rebotando fuera de control.`
    ),
    line(
      "explicando",
      "El agujero del medio",
      `Una función matemática real necesita poder dibujarse con un trazo continuo sin agujeros sobre la hoja. ¿Qué pasaría en el punto medio, en <span class="eq">x = 0,5 = 1/2</span>? Elevar a la <span class="eq">1/2</span> es calcular la raíz cuadrada <span class="eq">&radic;(&minus;2)</span>, que no existe en el conjunto de los números reales <span class="eq">&reals;</span>.`
    ),
    line(
      "base",
      "El freno de mano en los reales",
      `Como no podés calcular la raíz cuadrada de un número negativo en el conjunto de los números reales <span class="eq">&reals;</span>, en ese lugar la gráfica no se puede dibujar: se abre un pozo negro sin fondo que rompe la continuidad de la curva.`
    ),
    line(
      "feliz",
      "La base positiva es tu garantía",
      `Exigir que la base sea estrictamente positiva <span class="eq">a &gt; 0</span> y distinta de uno <span class="eq">a &ne; 1</span> no es una manía reglamentaria: es el escudo protector que asegura que la función exista para cualquier número real que metas en el exponente <span class="eq">x</span>.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 4: Base desde cero (Cortar una pizza por la mitad)
  // ---------------------------------------------------------------------------
  "sec4-base": [
    line(
      "empatia",
      "Decaimiento radiactivo sin pánico",
      `La expresión desintegración radiactiva suena a física atómica hiper pesada de película de ciencia ficción, pero en realidad la matemática de fondo es tan sencilla como cortar una pizza por la mitad una y otra vez.`
    ),
    line(
      "pensativa",
      "Siempre queda una porción",
      `Empezás con una pizza entera. Al año te queda <span class="eq">1/2</span> de pizza; al año siguiente, <span class="eq">1/4</span> de pizza; al siguiente, <span class="eq">1/8</span>. En cada ciclo vas cortando por la mitad la porción que te había quedado del año anterior: <span class="eq">(1/2)<sup>x</sup></span>.`
    ),
    line(
      "explicando",
      "Nunca llegás a cero absoluto",
      `Fijate en este detalle fascinante: por más que cortes mil veces la porción con el cuchillo más afilado del mundo, siempre te va a quedar una miga microscópica positiva. Jamás te vas a quedar con cero absoluto <span class="eq">y = 0</span> y mucho menos con una pizza negativa.`
    ),
    line(
      "base",
      "El concepto de asíntota",
      `Esa línea invisible a la que te vas acercando infinitamente en la mesa sin llegar a tocarla jamás es lo que en matemática universitaria llamamos asíntota horizontal, que en este caso es la recta horizontal <span class="eq">y = 0</span>.`
    ),
    line(
      "feliz",
      "Crecer o achicar",
      `Una base mayor que uno como <span class="eq">a = 2 &gt; 1</span> duplica y sube hacia el cielo; una base fraccionaria como <span class="eq">a = 1/2 &lt; 1</span> divide y cae suavemente hacia la mesa. Son dos caras de la misma moneda exponencial que ya sabés dominar.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 5: Base desde cero (Las deudas: deber menos es subir)
  // ---------------------------------------------------------------------------
  "sec5-base": [
    line(
      "empatia",
      "Los números negativos y la trampa del ojo",
      `Cuando aparece un signo menos adelante de una función exponencial, como en <span class="eq">f(x) = &minus;a<sup>x</sup></span>, la intuición visual nos suele traicionar porque estamos acostumbrados a pensar en cantidades físicas que se acumulan hacia arriba.`
    ),
    line(
      "pensativa",
      "Menos deuda es ir para arriba",
      `Pensalo con el saldo de una cuenta bancaria: si hoy debés <span class="eq">-$3000</span> y mañana tu deuda se reduce a <span class="eq">-$1500</span>, ¿tu situación económica subió o empeoró? ¡Subió claramente! Como <span class="eq">&minus;1500 &gt; &minus;3000</span>, estás más cerca de salir del pozo.`
    ),
    line(
      "explicando",
      "La curva de -3 · (1/2)^x",
      `Eso es exactamente lo que ocurre en la función <span class="eq">g(x) = &minus;3 &middot; (1/2)<sup>x</sup></span>: en <span class="eq">x = 0</span> arranca en <span class="eq">&minus;3</span>, luego pasa a <span class="eq">&minus;1,5</span> en <span class="eq">x = 1</span>, y luego a <span class="eq">&minus;0,75</span> en <span class="eq">x = 2</span>. Los números se están acercando al cero desde abajo.`
    ),
    line(
      "base",
      "Creciente en el sótano",
      `Como al avanzar hacia la derecha en el gráfico los valores de <span class="eq">y</span> se mueven hacia arriba en el eje vertical, la función es estrictamente CRECIENTE en todo su dominio, a pesar de que todos sus valores numéricos sean negativos.`
    ),
    line(
      "orgullosa",
      "Probá siempre dos números",
      `Si en algún examen tenés dudas de si una curva crece o decrece, calculá dos puntos fáciles en <span class="eq">x = 0</span> y <span class="eq">x = 1</span>. Comparás los dos números en la recta real y la duda se termina en diez segundos sin discutir con nadie.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 6: Base desde cero (Seguir huellas en el barro)
  // ---------------------------------------------------------------------------
  "sec6-base": [
    line(
      "empatia",
      "De dos puntos a una fórmula",
      `Reconstruir una fórmula matemática a partir de dos puntos aislados en el plano parece un truco de magia negra, pero en realidad es como seguir dos huellas en el barro para deducir quién pasó caminando.`
    ),
    line(
      "pensativa",
      "La distancia entre las huellas",
      `Cuando trabajabas con una recta medías cuántos metros avanzabas y cuántos metros subías con una regla. En una función exponencial, te fijás por qué número se multiplicó la altura al dar un paso hacia adelante.`
    ),
    line(
      "explicando",
      "Dividir para descubrir la base",
      `Si en <span class="eq">x = 1</span> la función vale <span class="eq">y = 2</span>, y en <span class="eq">x = 2</span> la función vale <span class="eq">y = 6</span>, el paso multiplicó la salida por tres porque <span class="eq">6 / 2 = 3</span>. ¡Esa es tu base <span class="eq">a = 3</span> sin ninguna vuelta complicada!`
    ),
    line(
      "base",
      "El punto de partida k",
      `Una vez que sabés que la base multiplica por tres a cada paso, retrocedés un paso hacia el momento <span class="eq">x = 0</span> para descubrir de dónde arrancó la cuenta: <span class="eq">2 / 3</span>. Ese resultado es directamente tu coeficiente inicial <span class="eq">k = 2/3</span>.`
    ),
    line(
      "feliz",
      "Sin memorizar fórmulas",
      `Dividir las dos alturas <span class="eq">y<sub>2</sub> / y<sub>1</sub></span> te revela la base multiplicativa; retroceder al momento inicial <span class="eq">x = 0</span> te da la escala <span class="eq">k</span>. Con esos dos pasos simples resolvés cualquier ejercicio de reconstrucción de la guía de estudio.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 7: Base desde cero (Las tres piezas de un juguete)
  // ---------------------------------------------------------------------------
  "sec7-base": [
    line(
      "empatia",
      "Problemas de enunciado sin miedo",
      `Los enunciados largos de examen con bacterias, sustancias radiactivas e inflación parecen un trabalenguas imposible de descifrar. Pero todos los modelos exponenciales se arman con exactamente tres piezas básicas.`
    ),
    line(
      "pensativa",
      "Ladrillo 1: El punto de partida",
      `La primera pieza es responder: ¿con cuánto arrancás al inicio? ¿Con <span class="eq">50 g</span> de material? ¿Con <span class="eq">55</span> millones de personas? Ese valor inicial medido en <span class="eq">t = 0</span> va colocado adelante de todo: es el coeficiente <span class="eq">k</span>.`
    ),
    line(
      "explicando",
      "Ladrillo 2: La tasa de cambio",
      `La segunda pieza es responder: ¿qué le pasa a esa cantidad a cada paso? Si se corta por la mitad, ponés <span class="eq">a = 1/2</span>. Si aumenta un doce por ciento, sumás <span class="eq">1 + 0,12</span> y ponés <span class="eq">a = 1,12</span> como base de acumulación.`
    ),
    line(
      "base",
      "Ladrillo 3: El ritmo del reloj",
      `La tercera pieza es responder: ¿cada cuánto tiempo ocurre esa transformación? Si la cantidad se duplica cada <span class="eq">3 min</span>, el tiempo <span class="eq">t</span> se divide por <span class="eq">3</span>: escribís <span class="eq">t / 3</span> arriba en el exponente fraccionario.`
    ),
    line(
      "feliz",
      "Ensamblado final",
      `Juntás las tres piezas en su lugar correspondiente: <span class="eq">M(t) = 50 &middot; (1/2)<sup>t/3</sup></span>. Listo, acabás de armar el modelo formal de la facultad de Exactas sin transpirar ni dudar un solo instante.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 8: Base desde cero (Deslizar un papel transparente)
  // ---------------------------------------------------------------------------
  "sec8-base": [
    line(
      "empatia",
      "Trasladar curvas como una transparencia",
      `Imaginate que dibujaste la curva exponencial en una lámina de acetato transparente y ahora podés deslizar esa lámina libremente sobre la superficie de tu mesa hacia arriba, hacia abajo o hacia los costados.`
    ),
    line(
      "pensativa",
      "Subir el piso con el número de afuera",
      `Si a la fórmula le sumás un término <span class="eq">+4</span> al final, como en <span class="eq">f(x) = 2 &middot; 3<sup>x</sup> + 4</span>, estás levantando toda la lámina cuatro unidades hacia arriba respecto a la superficie horizontal de referencia.`
    ),
    line(
      "explicando",
      "El piso nuevo que llamamos asíntota",
      `El piso de la curva, que antes descansaba en la línea <span class="eq">y = 0</span>, ahora subió y flota a cuatro unidades de altura en <span class="eq">y = 4</span>. La curva se acerca a esa recta horizontal pero nunca llega a tocarla ni a cruzarla.`
    ),
    line(
      "base",
      "Por qué usamos paréntesis y no corchetes",
      `Como la curva jamás llega a tocar exactamente el valor <span class="eq">y = 4</span>, ese número es una frontera de aproximación asintótica. Por eso escribimos paréntesis redondo abierto en el conjunto imagen: <span class="eq">Im(f) = (4; +&infin;)</span>.`
    ),
    line(
      "orgullosa",
      "Un detalle de un punto entero",
      `Poner un paréntesis redondo <span class="eq">(4; +&infin;)</span> o un corchete cerrado <span class="eq">[4; +&infin;)</span> en el parcial es la diferencia entre tener el ejercicio con puntaje perfecto o perder el punto entero. Ahora ya sabés la razón geométrica de por qué va abierto.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 9: Base desde cero (La VTV o chequeo médico)
  // ---------------------------------------------------------------------------
  "sec9-base": [
    line(
      "empatia",
      "Una radiografía no es más que una ficha médica",
      `Cuando en el examen te piden el estudio completo de una función parece un cuestionario infinito y agotador. Miralo como hacerle la verificación técnica al auto: vas revisando pieza por pieza con una lista de control.`
    ),
    line(
      "pensativa",
      "Las tres preguntas básicas",
      `Pregunta uno: ¿qué valores de <span class="eq">x</span> puedo ingresar a la máquina? Todos los números reales sin ninguna excepción: <span class="eq">Dom(f) = &reals;</span>. Pregunta dos: ¿dónde está el piso o techo de la curva? En la recta asíntota horizontal <span class="eq">y = c</span>.`
    ),
    line(
      "explicando",
      "La frontera del suelo: el cero",
      `Pregunta tres: ¿en qué lugar exacto la curva cruza la línea del suelo? Igualás la fórmula a cero: <span class="eq">f(x) = 0</span> y despejás la raíz. Ese número de corte divide el mapa entre lo que queda sobre el nivel del suelo y lo que queda bajo tierra.`
    ),
    line(
      "base",
      "Anotar con la notación de Exactas",
      `En la facultad son muy exigentes con la caligrafía matemática: los intervalos van siempre separados con punto y coma <span class="eq">(a; b)</span> para no confundirlos con números decimales, y las raíces aisladas van escritas entre llaves formales <span class="eq">C<sub>0</sub> = { x<sub>0</sub> }</span>.`
    ),
    line(
      "feliz",
      "Completar la ficha",
      `Vas completando cada casillero de la ficha técnica siguiendo el orden metódico y tenés el ejercicio más largo y temido del examen resuelto de forma impecable y con máxima calificación.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 10: Base desde cero (Bases gemelas en la balanza)
  // ---------------------------------------------------------------------------
  "sec10-base": [
    line(
      "empatia",
      "Bajar la x que quedó atrapada arriba",
      `Ver la incógnita <span class="eq">x</span> colgada arriba en el exponente genera cierta impotencia al principio porque parece que no la podés alcanzar con las operaciones comunes de despeje que aprendiste en la escuela secundaria.`
    ),
    line(
      "pensativa",
      "Bases gemelas a los dos lados",
      `El secreto más poderoso de todo el álgebra es lograr que ambos platillos de la balanza tengan exactamente la misma base numérica. Si lográs escribir <span class="eq">2<sup>x</sup> = 2<sup>5</sup></span>, la respuesta salta a la vista sola: <span class="eq">x = 5</span>.`
    ),
    line(
      "explicando",
      "Igualar las alturas",
      `Si las bases son idénticas en ambos lados de la igualdad, los exponentes tienen que ser obligatoriamente iguales entre sí para que la balanza no se desequilibre: <span class="eq">a<sup>u</sup> = a<sup>v</sup> &rArr; u = v</span>. Hacés a un lado las bases y te queda una ecuación sencilla de resolver.`
    ),
    line(
      "base",
      "El truco de sacar factor común",
      `Si te aparecen potencias sumadas como <span class="eq">2<sup>x+1</sup> + 2<sup>x</sup></span>, desarmás la suma en una multiplicación <span class="eq">2<sup>x</sup> &middot; 2<sup>1</sup> + 2<sup>x</sup> &middot; 1</span> y extraés <span class="eq">2<sup>x</sup></span> de factor común afuera del paréntesis, reduciendo todo a una cuenta simple.`
    ),
    line(
      "orgullosa",
      "Las tres llaves maestras",
      `Igualar bases numéricas <span class="eq">a<sup>u</sup> = a<sup>v</sup></span>, sacar factor común <span class="eq">a<sup>x</sup></span> y hacer un cambio de variable auxiliar cuadrática <span class="eq">u = a<sup>x</sup> &gt; 0</span>: esas son las tres llaves maestras que abren cualquier ecuación exponencial de examen que te pongan enfrente.`
    ),
  ],
};

// =============================================================================
// ALIASING UNIVERSAL DE GUIONES
// =============================================================================
// Asegura que sec1-why, sec1-tablas y sec-1 resuelvan al mismo objeto,
// y análogamente para sec1-base y sec-1-basico.

const MAIN_ALIASES = [
  ["sec1-tablas", ["sec1-why", "sec-1"]],
  ["sec2-amebas", ["sec2-why", "sec-2"]],
  ["sec3-continuo", ["sec3-why", "sec-3"]],
  ["sec4-espejo", ["sec4-why", "sec-4"]],
  ["sec5-cuadrantes", ["sec5-why", "sec-5"]],
  ["sec6-constructor", ["sec6-why", "sec-6"]],
  ["sec7-modelos", ["sec7-why", "sec-7"]],
  ["sec8-asintotas", ["sec8-why", "sec-8"]],
  ["sec9-radiografia", ["sec9-why", "sec-9"]],
  ["sec10-ecuaciones", ["sec10-why", "sec-10"]],
];

for (const [canonical, aliases] of MAIN_ALIASES) {
  const script = VN_SCRIPTS[canonical];
  if (script) {
    for (const alias of aliases) {
      VN_SCRIPTS[alias] = script;
    }
  }
}

for (let i = 1; i <= 10; i++) {
  const canonicalBase = `sec${i}-base`;
  const aliasBase = `sec-${i}-basico`;
  if (VN_SCRIPTS[canonicalBase]) {
    VN_SCRIPTS[aliasBase] = VN_SCRIPTS[canonicalBase];
    VN_SCRIPTS[`sec${i}-basico`] = VN_SCRIPTS[canonicalBase];
  }
}
