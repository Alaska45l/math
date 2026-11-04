/**
 * vn-scripts.js — Guiones teatrales interactivos de Alaska ("Modo Novela Visual")
 * Laboratorio 7: Funciones, Modelos y Ecuaciones Exponenciales (exponenciales.html)
 *
 * Contiene:
 * - 20 guiones artesanales en voseo rioplatense auténtico:
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
    `¡Ay, no! ¡Colapso total de álgebra en el pizarrón! La potenciación tiene prioridad absoluta sobre la multiplicación: en <span class="eq">3 &middot; 2<sup>x</sup></span>, el exponente sólo afecta a la base contigua <span class="eq">2</span>; el factor <span class="eq">k = 3</span> espera afuera su turno pacientemente. Si hacés <span class="eq">3 &middot; 2 = 6</span> y escribís <span class="eq">6<sup>x</sup></span>, para <span class="eq">x = 2</span> tendrías <span class="eq">6<sup>2</sup> = 36</span> amebas, pero en el frasco real sólo contamos <span class="eq">3 &middot; 2<sup>2</sup> = 3 &middot; 4 = 12</span> amebas reales. ¡Inventaste <span class="eq">24</span> amebas de la nada por saltarte la jerarquía algebraica!`
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
    `¡Peligro crítico en el laboratorio matemático! En los números reales la base exige obligatoriamente <span class="eq">a &gt; 0</span> y <span class="eq">a &ne; 1</span>. Si metés una base negativa como <span class="eq">a = &minus;2</span>, al querer calcular la función en <span class="eq">x = 1/2</span> tendrías <span class="eq">(&minus;2)<sup>1/2</sup> = &radic;(&minus;2) &notin; &reals;</span>, que no existe en el conjunto de los números reales y destruye la curva continua. Y si elegís base <span class="eq">a = 1</span>, la potencia <span class="eq">1<sup>x</sup> = 1</span> vale siempre uno: te queda una recta constante horizontal <span class="eq">f(x) = k</span> completamente aburrida.`
  ),

  // 5. Usó la tasa porcentual bruta r en vez de 1 ± r
  raw_percentage_as_base: line(
    "lentes-brillo",
    "Trampa de acumulación",
    `¡Clásica trampa al modelar porcentajes! Si una población o una sustancia crece un <span class="eq">12%</span> (<span class="eq">r = 0,12</span>), al valor inicial le tenés que sumar ese incremento: conservás el <span class="eq">100%</span> original más el extra decimal de <span class="eq">0,12</span>. La base multiplicativa acumulada es <span class="eq">a = 1 + r = 1 + 0,12 = 1,12</span>. Si ponés <span class="eq">a = 0,12</span> directo como base de la potencia <span class="eq">P(t) = P<sub>0</sub> &middot; (0,12)<sup>t</sup></span>, ¡hacés desaparecer el <span class="eq">88%</span> de la población en el primer período transcurrido!`
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
    "Trampa de frontera",
    `¡Cazabobos clásico en el análisis de curvas! La gráfica exponencial se aproxima tanto como quieras a la recta horizontal <span class="eq">y = c</span>, pero como una potencia <span class="eq">k &middot; a<sup>x</sup></span> jamás se anula en los números reales, la función nunca llega a tocar ese piso ni ese techo. La asíntota horizontal no pertenece al conjunto imagen de la función: va SIEMPRE con paréntesis redondo abierto, como <span class="eq">(c; +&infin;)</span> o <span class="eq">(&minus;&infin;; c)</span>, jamás con un corchete cerrado <span class="eq">[c; +&infin;)</span> que afirme que ese valor se alcanza.`
  ),

  // 9. Restó exponentes sin paréntesis en un cociente
  subtracted_exponents_without_parens: line(
    "sospecha",
    "Error de signos",
    `Mmm... acá hay olor a signo cambiado por apuro. Cuando restás un exponente compuesto en un cociente de igual base, el signo menos abraza a todo el divisor con paréntesis de hierro: escribí obligatoriamente <span class="eq">(3x + 1) &minus; (4x &minus; 16)</span>. Al distribuir el menos, el dieciséis se vuelve positivo y despejás <span class="eq">x = 17</span>. Si te comés los paréntesis, el dieciséis queda restando y la cuenta queda arruinada.`
  ),

  // 10. Aceptó u <= 0 en sustitución cuadrática u = a^x
  accepted_non_positive_u_in_substitution: line(
    "panico",
    "¡Alerta de Laboratorio!",
    `¡Pará la máquina de calcular un segundo! Pusiste <span class="eq">u = a<sup>x</sup></span>, pero en los reales una base positiva elevada a cualquier exponente cumple estrictamente <span class="eq">a<sup>x</sup> &gt; 0</span>. Si la fórmula resolvente de la cuadrática auxiliar te arroja raíces como <span class="eq">u<sub>1</sub> = 3</span> y <span class="eq">u<sub>2</sub> = &minus;1</span>, tenés que descartar de inmediato <span class="eq">u<sub>2</sub> &le; 0</span> con lápiz rojo: la ecuación <span class="eq">a<sup>x</sup> = &minus;1</span> no tiene solución en <span class="eq">&reals;</span>. ¡No me arrastres raíces fantasma a la solución final!`
  ),
};

// =============================================================================
// REACCIONES A ESTADOS DE RACHA (STREAK_REACTIONS)
// =============================================================================

export const STREAK_REACTIONS = {
  firstTry: line(
    "orgullosa",
    "Impecable a la primera",
    `¡Excelente deducción matemática! Diste en el blanco al primer intento, respetando los primeros principios sin titubear. Guardá bien este razonamiento en tu libreta de notas, porque en los próximos desafíos te van a cambiar los números pero la estructura algebraica de fondo va a ser exactamente idéntica a esta.`
  ),
  recovered: line(
    "feliz",
    "Ahí encontraste el camino",
    `¡Bien pensado y corregido! Tropezaste en el primer intento, consultaste la pista orientativa y reconstruiste el paso algebraico que faltaba sin ponerte a adivinar. Así es exactamente como se aprende matemática rigurosa: diagnosticando el desfasaje, entendiendo la propiedad y ajustando la cuenta final.`
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
    `No te preocupes por haberte trabado: todos los que estudiamos acá tuvimos que desarmar estas ecuaciones en el pizarrón alguna vez. Vamos a abrir el desarrollo analítico completo renglón por renglón para que veas con claridad dónde estaba el nudo conceptual y cómo se destraba formalmente con las reglas del álgebra.`
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
      "El paso constante de la recta",
      `Fijate en la primera columna: cada vez que la variable horizontal avanza tres pasos iguales, la salida salta exactamente siete unidades. Sumar siempre la misma cantidad fija en cada tramo es la firma inconfundible de una función lineal <span class="eq">y = mx + b</span>, donde la pendiente mide ese escalón constante.`
    ),
    line(
      "explicando",
      "La escala multiplicativa",
      `En cambio, en la segunda tabla las diferencias se descontrolan a toda velocidad. Pero si dividís cada casillero por el anterior, el cociente siempre da tres clavado. No estás sumando ladrillos iguales: estás triplicando lo acumulado con una razón multiplicativa fija <span class="eq">a = 3</span>.`
    ),
    line(
      "unamused",
      "La trampa cuadrática",
      `¡Mucho cuidado con la tercera tabla! Cuando la entrada avanza de dos en dos, las salidas van dando cuatro, nueve, dieciséis y veinticinco. Ni las restas dan diferencias fijas ni las divisiones arrojan cocientes constantes. ¡No es lineal ni exponencial! Es una parábola de cuadrados <span class="eq">y = x<sup>2</sup></span>: no caigas en la trampa de forzar un modelo donde no encaja.`
    ),
    line(
      "complice",
      "El reflejo del buen detective",
      `Anotate este secreto de supervivencia para cualquier tabla: primero probás si los valores suman una diferencia constante. Si las restas cambian, dividís términos consecutivos para ver si multiplican. Ese cociente limpio es el motor de la potencia y te regala la base <span class="eq">a</span> sin vueltas.`
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
      "El experimento del frasco térmico",
      `Imaginate un frasco térmico con un medio nutritivo perfecto y una colonia de amebas que se duplica puntualmente cada sesenta minutos. Este cultivo biológico es el escenario ideal para ver nacer la matemática de la duplicación desde sus raíces físicas y entender qué controla cada parámetro.`
    ),
    line(
      "pensativa",
      "El momento cero y el neutro uno",
      `¿Qué sucede exactamente al comenzar el experimento en el momento inicial? Si arrancamos con tres amebas, evaluamos <span class="eq">f(0) = 3 &middot; 2<sup>0</sup></span>. Como todo número no nulo elevado a la cero vale uno, nos queda <span class="eq">f(0) = 3</span>. Ese número inicial que multiplica adelante representa siempre la población en el origen.`
    ),
    line(
      "colapso",
      "El gran sacrilegio: 3 · 2ˣ ≠ 6ˣ",
      `¡Ay, no! El error más sangriento en los exámenes es multiplicar el tres por el dos y escribir <span class="eq">6<sup>x</sup></span>. Si pasaran dos horas, esa fórmula errónea inventaría treinta y seis amebas, cuando en el frasco real sólo contamos doce porque <span class="eq">3 &middot; 2<sup>2</sup> = 12</span>. ¡Inventaste veinticuatro amebas mágicas de la nada por violar la jerarquía!`
    ),
    line(
      "explicando",
      "Jerarquía terca pero sabia",
      `La regla algebraica es inflexible: la potencia tiene mayor jerarquía que la multiplicación. En la expresión <span class="eq">3 &middot; 2<sup>x</sup></span>, el exponente sólo tiene autoridad sobre la base dos que tiene pegada al lado. La escala inicial <span class="eq">k = 3</span> espera afuera con paciencia y recién multiplica al resultado final cuando la potencia ya terminó de actuar.`
    ),
    line(
      "complice",
      "El truco mental del laboratorio",
      `Para no meter la pata jamás al modelar, imaginate tres frascos separados sobre la mesada. En cada frasco ponés una sola ameba que se duplica siguiendo la ley <span class="eq">2<sup>x</sup></span>. Al final sumás las tres colonias independientes y obtenés <span class="eq">f(x) = 3 &middot; 2<sup>x</sup></span>, jamás un monstruo mutante que se sextuplica por hora.`
    ),
    line(
      "evaluando",
      "Seguí el cultivo hora por hora",
      `Deslizá el control de tiempo de cero a diez horas en el simulador. Compará la curva celeste de una sola ameba <span class="eq">2<sup>x</sup></span> contra la dorada del cultivo triple <span class="eq">3 &middot; 2<sup>x</sup></span> y comprobá que la razón vertical entre ambas siempre se mantiene clavada en tres en todo el recorrido.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 3: Puente continuo (Densidad racional y restricciones en ℝ)
  // ---------------------------------------------------------------------------
  "sec3-continuo": [
    line(
      "base",
      "El pasaporte de la base en los reales",
      `Una función exponencial real tiene la forma canónica <span class="eq">f(x) = k &middot; a<sup>x</sup></span>, pero la base viene con un pasaporte estricto: debe ser estrictamente positiva y distinta de uno. ¿Por qué ponemos aduanas tan rígidas a la entrada de los números reales? Vamos a descubrirlo.`
    ),
    line(
      "pensativa",
      "Pisar entre los enteros",
      `Si únicamente utilizáramos exponentes enteros positivos como <span class="eq">x = 1, 2, 3</span>, la gráfica de la función serían puntos aislados flotando en el plano cartesiano. Para trazar un trazo suave y continuo necesitamos poder calcular qué ocurre en los números intermedios, por ejemplo cuando <span class="eq">x = 0,5 = 1/2</span>.`
    ),
    line(
      "explicando",
      "El puente del radical",
      `Por las leyes de los exponentes, elevar a un medio equivale a calcular la raíz cuadrada principal. Si nuestra base es nueve y evaluamos en un medio, la función vale <span class="eq">9<sup>1/2</sup> = &radic;9 = 3</span>. Los números racionales rellenan los huecos infinitos entre enteros y tienden un puente continuo sobre la recta real <span class="eq">&reals;</span>.`
    ),
    line(
      "panico",
      "¡Colapso con base negativa!",
      `Pero mirá la catástrofe que ocurre si elegís una base negativa como <span class="eq">a = &minus;2</span>: al querer evaluar la función en un medio tendrías <span class="eq">(&minus;2)<sup>1/2</sup> = &radic;(&minus;2) &notin; &reals;</span>, ¡un cálculo prohibido en los números reales! La curva se desintegra en puntos que saltan sin sentido y rompen la continuidad física del trazo.`
    ),
    line(
      "unamused",
      "Las dos bases aburridas: 0 y 1",
      `Tampoco permitimos una base igual a uno porque la potencia <span class="eq">1<sup>x</sup> = 1</span> vale siempre uno: la gráfica degeneraría en una recta horizontal constante. Y si la base fuera cero, al calcular una potencia negativa tendrías <span class="eq">0<sup>&minus;1</sup> = 1/0</span>, rompiendo la matemática al dividir por cero de forma inadmisible.`
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
      "La mitad que sobrevive",
      `Pensá en una muestra de material radiactivo de un kilo que pierde exactamente la mitad de su masa en cada año que transcurre. Al cabo de cada ciclo conservás la mitad de lo que tenías: la masa restante responde a la curva de decaimiento <span class="eq">f(x) = (1/2)<sup>x</sup></span>.`
    ),
    line(
      "pensativa",
      "El puente del espejo algebraico",
      `Mirá esta identidad con ojos de lince matemático: <span class="eq">(1/2)<sup>x</sup> = (2<sup>&minus;1</sup>)<sup>x</sup> = 2<sup>&minus;x</sup></span>. Cambiar la base por su inversa fraccionaria equivale algebraicamente a cambiar el signo del exponente: <span class="eq">(1/a)<sup>x</sup> = a<sup>&minus;x</sup></span>. Esa es la clave analítica de la simetría.`
    ),
    line(
      "explicando",
      "Geometría del reflejo",
      `Como cambiar de signo al exponente produce una reflexión geométrica respecto al eje vertical de ordenadas, la gráfica de <span class="eq">(1/2)<sup>x</sup></span> es exactamente la misma curva de <span class="eq">2<sup>x</sup></span> pero vista a través de un espejo perfecto. Lo que antes crecía vertiginosamente, ahora decae suavemente hacia el piso del cero.`
    ),
    line(
      "lentes-brillo",
      "El cruce de las potencias",
      `Si comparás potencias como <span class="eq">2<sup>x</sup></span> y <span class="eq">3<sup>x</sup></span>, para valores positivos la base mayor trepa más empinada hacia el cielo. Pero al cruzar al lado negativo del eje, ¡el orden se invierte por completo! Dividir por dos deja más cantidad que dividir por tres, así que la base menor queda por arriba.`
    ),
    line(
      "complice",
      "La recta que nunca se toca",
      `Fijate que la masa radiactiva se reduce sucesivamente a un medio, un cuarto, un octavo y una dieciseisava parte. Por más años que dejes pasar, jamás llegará a valer cero absoluto ni será negativa. La recta horizontal <span class="eq">y = 0</span> es la asíntota horizontal formal: la imagen es el intervalo abierto <span class="eq">(0; +&infin;)</span>.`
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
      "El mapa de los cuatro cuadrantes",
      `El comportamiento global y la silueta de la curva exponencial dependen de dos interruptores independientes: si la base multiplica hacia arriba o reparte en fracciones, y si el coeficiente inicial es positivo o negativo. Dos llaves de paso que abren cuatro familias de curvas completamente distintas.`
    ),
    line(
      "enojada",
      "La trampa de la base fraccionaria",
      `Hay un tropiezo clásico que hace caer a muchísima gente en la trampa: mirar la función <span class="eq">g(x) = &minus;3 &middot; (1/2)<sup>x</sup></span>, ver la base fraccionaria un medio y cantar sin pensar que es decreciente. ¡Frená la mano! El signo del coeficiente exterior altera toda la física del problema.`
    ),
    line(
      "pensativa",
      "Pensalo como saldo bancario",
      `Hagamos las cuentas sin repetir recetas: en el momento cero debés tres pesos. Al siguiente paso tu deuda baja a un peso con cincuenta, y después debés setenta y cinco centavos. Como tus pérdidas se van achicando, tu situación financiera está subiendo con claridad hacia el nivel del mar.`
    ),
    line(
      "explicando",
      "Subiendo desde el sótano",
      `Preguntate mirando la recta numérica real: ¿quién está más a la derecha, menos tres o menos uno y medio? ¡Estar en menos uno y medio es estar más arriba! Y menos cero setenta y cinco es todavía mayor: <span class="eq">&minus;0,75 &gt; &minus;1,5 &gt; &minus;3</span>. A medida que avanzamos hacia la derecha las imágenes van trepando hacia el cero: la función es estrictamente creciente en todo <span class="eq">&reals;</span>.`
    ),
    line(
      "complice",
      "La regla de los dos signos",
      `El misterio se resuelve entendiendo las transformaciones del plano: multiplicar por una constante negativa como <span class="eq">k = &minus;3</span> refleja toda la curva respecto al eje horizontal. Una curva que antes caía, al darla vuelta verticalmente... ¡empieza a subir! Por eso la función resulta creciente y su imagen es el intervalo abierto <span class="eq">(&minus;&infin;; 0)</span>.`
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
      "Detectives del plano cartesiano",
      `En el laboratorio real casi nadie te regala la fórmula matemática ya cocinada: solo disponés de dos mediciones aisladas sobre el gráfico y necesitás deducir qué función exponencial exacta pasó por esos dos puntos. Vamos a actuar como auténticos peritos forenses del plano cartesiano.`
    ),
    line(
      "pensativa",
      "El truco de la división",
      `Cuando trabajabas con rectas calculabas la pendiente restando las coordenadas de ambos puntos. Pero en las exponenciales la magia se logra dividiendo: al armar el cociente <span class="eq">f(x<sub>2</sub>) / f(x<sub>1</sub>)</span>, la escala inicial del numerador y del denominador se cancela limpiamente y te queda una potencia pura <span class="eq">a<sup>x<sub>2</sub> &minus; x<sub>1</sub></sup></span>.`
    ),
    line(
      "explicando",
      "Descubrir la base y el origen",
      `Si una curva pasa por los puntos (1; 1) y (2; 3), en un único paso horizontal la altura se triplicó, así que la base multiplicativa vale tres. Reemplazando en el primer punto deducís que en el origen arrancó en un tercio: la fórmula completa es <span class="eq">f(x) = (1/3) &middot; 3<sup>x</sup></span>.`
    ),
    line(
      "lentes-brillo",
      "El ancla en el eje vertical",
      `Si uno de los puntos conocidos corta al eje vertical en <span class="eq">x = 0</span>, tenés medio trabajo resuelto. Como cualquier base positiva elevada a la cero da uno, esa coordenada vertical te entrega el coeficiente inicial en bandeja sin tener que despejar ningún sistema complicado.`
    ),
    line(
      "complice",
      "La condición de mismo signo",
      `Fijate en una sutileza de rigor formal que distingue a un estudiante senior: las dos alturas de los puntos dados deben tener estrictamente el mismo signo. Si una fuera positiva y la otra negativa, el cociente daría negativo y no podrías calcular raíces pares para despejar la base en el conjunto de los números reales <span class="eq">&reals;</span>.`
    ),
    line(
      "evaluando",
      "Arrastrá los puntos en el pizarrón",
      `Agarrá los dos puntos de control <span class="eq">P</span> y <span class="eq">Q</span> con el cursor sobre el lienzo interactivo. Llevalos a nuevas posiciones del plano cartesiano y comprobá cómo el calculador deduce la base multiplicativa y la escala inicial de forma inmediata sin destruir ningún elemento visual.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 7: Modelos en el tiempo (Porcentajes, períodos t/T y base e)
  // ---------------------------------------------------------------------------
  "sec7-modelos": [
    line(
      "base",
      "La matemática aplicada a fenómenos reales",
      `En las aplicaciones reales no te van a tirar una variable <span class="eq">x</span> abstracta sin contexto: te vas a encontrar con gramos de sustancia radiactiva que decaen, poblaciones que se expanden a ritmo constante o cultivos medidos en laboratorio a lo largo de varias jornadas continuas.`
    ),
    line(
      "pensativa",
      "El reloj de la vida media",
      `Si disponés de cincuenta gramos de talio radiactivo con una vida media de tres minutos, a la media hora transcurrieron diez vidas medias completas. El exponente fraccionario cuenta exactamente cuántas rondas de reducción a la mitad ocurrieron: la masa restante es <span class="eq">M(t) = 50 &middot; (1/2)<sup>t/3</sup></span>.`
    ),
    line(
      "lentes-brillo",
      "El porcentaje acumulado",
      `Cuando una población de cincuenta y cinco millones crece un doce por ciento cada cinco años, la base multiplicativa no es cero coma doce: es uno coma doce porque conserva el total y le suma el extra. La escala temporal divide los años por cinco para contar períodos reales transcurridos.`
    ),
    line(
      "explicando",
      "La trampa de unidades de las bacterias",
      `¡Mucho ojo con la escala temporal de los enunciados! Si un cultivo bacteriano crece al 3,5% cada diez horas y al cabo de cinco días pesa doscientos gramos, no mezcles días con horas: cinco días equivalen a ciento veinte horas, es decir doce ciclos de diez horas. La masa inicial en el origen se despeja como <span class="eq">k = 200 / (1,035)<sup>12</sup> &asymp; 132,36 g</span>.`
    ),
    line(
      "complice",
      "La base natural e de Euler",
      `En procesos continuos de física o finanzas como la desintegración de isótopos con <span class="eq">A(t) = 120 &middot; e<sup>&minus;0,05t</sup></span>, la base es la constante de Euler <span class="eq">e &asymp; 2,71828</span>. Funciona con las mismas leyes exactas que cualquier otra base mayor que uno, sin ningún secreto místico oculto.`
    ),
    line(
      "evaluando",
      "Probá los 4 modelos en el simulador",
      `Alterná entre los cuatro escenarios en el selector del panel interactivo. Observá con atención cómo el exponente compuesto <span class="eq">t / T</span> traduce el paso del tiempo real a ciclos de transformación biológica o física sin perder la precisión decimal.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 8: Desplazamientos y asíntotas (f(x) = k·a^(x-h) + c y trampa de imagen)
  // ---------------------------------------------------------------------------
  "sec8-asintotas": [
    line(
      "base",
      "La anatomía completa de la función",
      `Hasta acá estudiamos la curva centrada en el origen. Ahora la soltamos en el plano agregándole desplazamientos horizontales y verticales en su forma completa: <span class="eq">f(x) = k &middot; a<sup>x&minus;h</sup> + c</span>. El parámetro h la traslada lateralmente y la constante c traslada el piso o techo del gráfico.`
    ),
    line(
      "pensativa",
      "La asíntota se muda con c",
      `Como la potencia positiva se aproxima a cero cuando nos alejamos hacia el infinito adecuado, ese término tiende a desaparecer y la función se aproxima a <span class="eq">k &middot; 0 + c = c</span>. La recta horizontal <span class="eq">y = c</span> es la nueva asíntota que delimita la frontera del conjunto imagen.`
    ),
    line(
      "lentes-brillo",
      "La trampa del corchete cerrado",
      `Prestá muchísima atención a esta trampa clásica: te piden la imagen de la función <span class="eq">f(x) = 2 &middot; 3<sup>x&minus;1</sup> + 4</span>. Como el piso está en cuatro y la curva sube, muchos anotan cuatro cerrado con corchete. ¡Error conceptual grave! Para que la función toque el piso cuatro la potencia debería anularse, lo cual es imposible. Va siempre con paréntesis abierto <span class="eq">(4; +&infin;)</span>.`
    ),
    line(
      "explicando",
      "El punto de anclaje h",
      `Para graficar la curva a mano alzada con total precisión sin hacer tablas eternas, buscá el punto donde el exponente se anula con <span class="eq">x = h</span>. En nuestro ejemplo anterior, evaluando en uno obtenemos de forma inmediata el valor seis: el punto de anclaje <span class="eq">P(1; 6)</span> te ubica toda la gráfica sobre la cuadrícula.`
    ),
    line(
      "complice",
      "¿Tiene o no tiene raíces reales?",
      `Para hallar los ceros de la función igualás la fórmula a cero: <span class="eq">k &middot; a<sup>x&minus;h</sup> + c = 0</span>. Al despejar te queda la potencia igualada a menos c sobre k. Si ese cociente resulta ser menor o igual a cero, la ecuación no tiene ninguna solución real y el conjunto de ceros es el conjunto vacío <span class="eq">C<sub>0</sub> = &empty;</span>.`
    ),
    line(
      "evaluando",
      "Manipulá los deslizadores h y c",
      `Modificá los controles de desplazamiento en el pizarrón. Mirá cómo la línea punteada de la asíntota acompaña fielmente a la constante <span class="eq">c</span> y cómo el intervalo del conjunto imagen se actualiza en tiempo real manteniendo siempre su extremo abierto <span class="eq">(c; +&infin;)</span>.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 9: Radiografía analítica (Estudio completo de funciones exponenciales trasladadas)
  // ---------------------------------------------------------------------------
  "sec9-radiografia": [
    line(
      "base",
      "La ficha técnica de una función",
      `Hacer el estudio analítico completo de una función es como levantar una ficha técnica exhaustiva. No alcanza con tirar un bosquejo al voleo: tenés que determinar su dominio, su imagen, su asíntota horizontal, dónde corta a los ejes y en qué tramos es estrictamente positiva o creciente.`
    ),
    line(
      "pensativa",
      "Análisis de una curva trasladada",
      `Tomemos la función trasladada <span class="eq">f(x) = 2 &minus; (1/2)<sup>x</sup></span>. Su término independiente traslada el techo horizontal a la recta <span class="eq">y = 2</span>. Como el factor que acompaña a la potencia es negativo, la gráfica vive enteramente por debajo del techo, con imagen abierta hasta el dos.`
    ),
    line(
      "explicando",
      "El cruce por el eje horizontal",
      `Para encontrar los ceros igualamos la fórmula a cero y buscamos qué exponente equilibra las potencias de base dos. El despeje nos revela que en <span class="eq">x = &minus;1</span> la curva perfora el suelo horizontal, formando el conjunto de ceros con un único elemento aislado.`
    ),
    line(
      "lentes-brillo",
      "Los intervalos de signos con punto y coma",
      `Como el coeficiente exterior es negativo y la base es menor que uno, la función resulta estrictamente creciente en toda la recta real. Viene subiendo desde valores negativos, cruza el suelo en menos uno y sigue trepando hacia la asíntota dos. Por lo tanto, los signos quedan divididos en <span class="eq">C&minus; = (&minus;&infin;; &minus;1)</span> y <span class="eq">C+ = (&minus;1; +&infin;)</span>.`
    ),
    line(
      "complice",
      "El caso del corte en el origen",
      `Si ajustamos la asíntota al valor uno, tenemos la curva gemela <span class="eq">f(x) = 1 &minus; (1/2)<sup>x</sup></span>. Al buscar su raíz vemos que la potencia vale uno exactamente en cero: la gráfica pasa justo por el origen de coordenadas, compartiendo la raíz y la ordenada al origen.`
    ),
    line(
      "evaluando",
      "Comparación en el tablero",
      `Alterná entre los dos casos representativos en el tablero interactivo. Cotejá cada una de las ocho tarjetas de la radiografía y confirmá cómo cada intervalo algebraico concuerda punto por punto con el trazo dibujado en el pizarrón de tiza.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 10: Balanza de ecuaciones (3 métodos en ℝ sin logaritmos)
  // ---------------------------------------------------------------------------
  "sec10-ecuaciones": [
    line(
      "base",
      "Ecuaciones exponenciales sin logaritmos",
      `Cuando te encontrás con la incógnita atrapada en el exponente y querés resolver la ecuación sin recurrir a logaritmos, disponés de tres caminos analíticos puros. Todos se apoyan con firmeza en las propiedades de las potencias y en la inyectividad de la función exponencial.`
    ),
    line(
      "pensativa",
      "Camino 1: La balanza de igualación",
      `El primer método transforma todos los términos a una base común, como expresar dieciséis en potencias de dos. Al restar exponentes en el cociente con paréntesis protectores, igualamos potencias gemelas y despejamos limpiamente la solución única <span class="eq">x = 17</span>.`
    ),
    line(
      "explicando",
      "Camino 2: El factor común salvador",
      `Cuando aparecen potencias sumadas como en <span class="eq">2<sup>x+1</sup> + 2<sup>x</sup> = 12</span>, desarmamos el exponente y extraemos la potencia repetida como factor común. El paréntesis se reduce a un número simple, y al dividir nos queda una potencia elemental cuya solución es <span class="eq">x = 2</span>.`
    ),
    line(
      "panico",
      "Camino 3: El disfraz cuadrático",
      `Si reconocés una potencia doble frente a una simple, como nueve a la equis frente a tres a la equis, aplicás la sustitución <span class="eq">u = 3<sup>x</sup></span>. Eso transforma la ecuación en una cuadrática común, pero con una condición innegociable: esa variable auxiliar debe ser estrictamente positiva.`
    ),
    line(
      "complice",
      "El filtro de raíces auxiliares",
      `Al resolver la resolvente cuadrática obtenés dos valores auxiliares. Si ambos son positivos, recuperás las soluciones originales; pero si alguna raíz auxiliar fuera menor o igual a cero, la descartás sin titubear porque una potencia positiva jamás puede dar un resultado negativo en los reales.`
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
      `Pensalo con esta comparación cotidiana: si guardás quinientos pesos fijos en una alcancía todas las semanas, tu dinero crece sumando siempre la misma cuota semana a semana. Siempre el mismo salto aditivo constante: eso es una función lineal <span class="eq">f(x) = mx + b</span>.`
    ),
    line(
      "explicando",
      "El crecimiento que se acelera",
      `En cambio, si ponés una inversión que se duplica cada semana, al principio parece poca plata: un peso salta a dos, dos salta a cuatro. Pero en pocos pasos estás en ocho, dieciséis, treinta y dos y sesenta y cuatro. Cada paso multiplica por dos el valor anterior siguiendo una ley exponencial como <span class="eq">f(x) = 2<sup>x</sup></span>.`
    ),
    line(
      "base",
      "La prueba del lápiz",
      `Para descubrir qué tenés adelante hacé una sola cuenta con lápiz: restá dos renglones consecutivos <span class="eq">y<sub>2</sub> &minus; y<sub>1</sub></span>. Si la resta da siempre la misma constante, es una recta. Si la resta cambia, calculá el cociente <span class="eq">y<sub>2</sub> / y<sub>1</sub></span>: si da el mismo factor, estás ante una función exponencial.`
    ),
    line(
      "feliz",
      "¡Ya tenés el detector!",
      `Con esa simple división de dos términos consecutivos ya tenés en la mano el detector infalible para clasificar cualquier tabla de datos o de desafíos analíticos sin dudar jamás de tu deducción.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 2: Base desde cero (Tres platos en la mesa)
  // ---------------------------------------------------------------------------
  "sec2-base": [
    line(
      "empatia",
      "La tentación de multiplicar 3 por 2",
      `Es súper común ver la expresión <span class="eq">3 &middot; 2<sup>x</sup></span> y sentir la tentación automática de multiplicar tres por dos y escribir <span class="eq">6<sup>x</sup></span>. Nuestro cerebro ve el signo por y quiere liquidar la cuenta rápido para sacarse números de encima.`
    ),
    line(
      "pensativa",
      "Tres platos en la mesa",
      `Miralo con esta imagen: imaginate que tenés tres platos hondos sobre la mesa de la cocina. En cada plato colocás una sola porción de levadura que duplica su tamaño cada hora: una porción pasa a dos, luego a cuatro, luego a ocho siguiendo la ley de potencias <span class="eq">2<sup>x</sup></span>.`
    ),
    line(
      "explicando",
      "La cuenta por separado",
      `En cada plato la levadura crece según la fórmula <span class="eq">2<sup>x</sup></span>. Como tenés tres platos sobre la mesa, al final sumás las masas multiplicando por tres: <span class="eq">3 &middot; 2<sup>x</sup></span>. A las dos horas tenés doce porciones en total, porque tres por cuatro da doce.`
    ),
    line(
      "base",
      "Por qué seis a la equis es una locura",
      `Si multiplicaras tres por dos y escribieras <span class="eq">6<sup>x</sup></span>, estarías diciendo que en cada plato la levadura se sextuplica: a las dos horas tendrías <span class="eq">6<sup>2</sup> = 36</span> porciones. ¡Aparecieron veinticuatro porciones mágicas de la nada por saltarte el orden de las operaciones!`
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
      `Te dicen que la base debe ser positiva con <span class="eq">a &gt; 0</span> y que no puede valer uno con <span class="eq">a &ne; 1</span>, y parece un capricho aburrido de profesores que quieren complicarte la vida. Vamos a entender juntos de dónde sale esta exigencia física.`
    ),
    line(
      "pensativa",
      "El signo loco de los negativos",
      `Si la base fuera negativa, por ejemplo con <span class="eq">a = &minus;2</span>, hacé las cuentas: a la uno da menos dos, al cuadrado da cuatro positivo, y al cubo da menos ocho. Los valores alternan de signo permanentemente según la ley <span class="eq">(&minus;2)<sup>x</sup></span>: van saltando de arriba a abajo como una pelota fuera de control.`
    ),
    line(
      "explicando",
      "El agujero del medio",
      `Una función matemática real necesita poder dibujarse con un trazo continuo sin agujeros sobre la hoja. ¿Qué pasaría en el punto medio, en <span class="eq">x = 1/2</span>? Elevar a un medio es calcular la raíz cuadrada <span class="eq">&radic;(&minus;2)</span>, que no existe en el conjunto de los números reales.`
    ),
    line(
      "base",
      "El freno de mano en los reales",
      `Como no podés calcular la raíz cuadrada de un número negativo en el conjunto de los números reales <span class="eq">&reals;</span>, en ese lugar la gráfica no se puede dibujar: se abre un pozo negro sin fondo que rompe la continuidad de la curva.`
    ),
    line(
      "feliz",
      "La base positiva es tu garantía",
      `Exigir que la base sea estrictamente positiva con <span class="eq">a &gt; 0</span> y distinta de uno con <span class="eq">a &ne; 1</span> no es una manía reglamentaria: es el escudo protector que asegura que la función exista para cualquier número real que metas en el exponente.`
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
      `Empezás con una pizza entera. Al año te queda media pizza; al año siguiente, un cuarto de pizza; al siguiente, un octavo. En cada ciclo vas cortando por la mitad la porción que te había quedado del año anterior, siguiendo la ley de decaimiento <span class="eq">(1/2)<sup>x</sup></span>.`
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
      `Pensalo con el saldo de una cuenta bancaria: si hoy debés tres mil pesos y mañana tu deuda se reduce a mil quinientos pesos, ¿tu situación económica subió o empeoró? ¡Subió claramente! Como <span class="eq">&minus;1500 &gt; &minus;3000</span>, estás más cerca de salir del pozo.`
    ),
    line(
      "explicando",
      "La curva de -3 · (1/2)^x",
      `Eso es exactamente lo que ocurre en la función <span class="eq">g(x) = &minus;3 &middot; (1/2)<sup>x</sup></span>: en el origen arranca en menos tres, en el siguiente paso sube a menos uno y medio, y luego a menos cero setenta y cinco. Los valores se acercan al cero desde abajo y satisfacen la desigualdad <span class="eq">&minus;0,75 &gt; &minus;1,5 &gt; &minus;3</span>.`
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
      `Si en x igual a uno la función vale dos, y en x igual a dos la función vale seis, el paso multiplicó la salida por tres porque <span class="eq">6 / 2 = 3</span>. ¡Esa es tu base multiplicativa <span class="eq">a = 3</span> sin ninguna vuelta complicada!`
    ),
    line(
      "base",
      "El punto de partida k",
      `Una vez que sabés que la base multiplica por tres a cada paso, retrocedés un paso hacia el momento inicial cero para descubrir de dónde arrancó la cuenta. Al dividir por tres obtenés directamente tu coeficiente inicial <span class="eq">k = 2/3</span>.`
    ),
    line(
      "feliz",
      "Sin memorizar fórmulas",
      `Dividir las dos alturas <span class="eq">y<sub>2</sub> / y<sub>1</sub></span> te revela el factor multiplicativo, y retroceder al momento cero te da la escala inicial <span class="eq">k</span>. Con esos dos pasos simples resolvés cualquier problema de reconstrucción que te pongan enfrente.`
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
      `La primera pieza es responder: ¿con cuánto arrancás al inicio? ¿Con cincuenta gramos de material o cincuenta y cinco millones de habitantes? Ese valor inicial medido en el instante <span class="eq">t = 0</span> va colocado adelante de todo: es el coeficiente <span class="eq">k</span>.`
    ),
    line(
      "explicando",
      "Ladrillo 2: La tasa de cambio",
      `La segunda pieza es responder: ¿qué le pasa a esa cantidad a cada paso? Si se corta por la mitad, ponés <span class="eq">a = 1/2</span>. Si aumenta un doce por ciento, sumás el porcentaje al entero y ponés <span class="eq">a = 1,12</span> como base de acumulación.`
    ),
    line(
      "base",
      "Ladrillo 3: El ritmo del reloj",
      `La tercera pieza es responder: ¿cada cuánto tiempo ocurre esa transformación? Si la cantidad se duplica cada tres minutos, el tiempo transcurrido se divide por tres: escribís <span class="eq">t / 3</span> arriba en el exponente fraccionario para contar los ciclos reales.`
    ),
    line(
      "feliz",
      "Ensamblado final",
      `Juntás las tres piezas en su lugar correspondiente: <span class="eq">M(t) = 50 &middot; (1/2)<sup>t/3</sup></span>. Listo, acabás de armar el modelo formal analítico sin transpirar ni dudar un solo instante.`
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
      "Un detalle de rigor analítico",
      `Poner un paréntesis redondo <span class="eq">(4; +&infin;)</span> o un corchete cerrado <span class="eq">[4; +&infin;)</span> al escribir la imagen es la diferencia entre tener la deducción matemáticamente impecable o cometer un error conceptual grave. Ahora ya sabés la razón geométrica de por qué va abierto.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 9: Base desde cero (La VTV o chequeo médico)
  // ---------------------------------------------------------------------------
  "sec9-base": [
    line(
      "empatia",
      "Una radiografía no es más que una ficha médica",
      `Hacer el estudio analítico completo de una función puede parecer a primera vista un cuestionario infinito y agotador. Miralo como hacerle la verificación técnica al auto: vas revisando pieza por pieza con una lista de control metódica.`
    ),
    line(
      "pensativa",
      "Las tres preguntas básicas",
      `Pregunta uno: ¿qué valores de la variable independiente puedo ingresar a la máquina? Todos los números reales sin ninguna excepción: <span class="eq">Dom(f) = &reals;</span>. Pregunta dos: ¿dónde está el piso o techo de la curva? En la recta asíntota horizontal <span class="eq">y = c</span>.`
    ),
    line(
      "explicando",
      "La frontera del suelo: el cero",
      `Pregunta tres: ¿en qué lugar exacto la curva cruza la línea del suelo? Igualás la fórmula a cero: <span class="eq">f(x) = 0</span> y despejás la raíz. Ese número de corte divide el mapa entre lo que queda sobre el nivel del suelo y lo que queda bajo tierra.`
    ),
    line(
      "base",
      "Anotar con notación formal",
      `En matemática rigurosa cuidamos la caligrafía formal: los intervalos van siempre separados con punto y coma <span class="eq">(a; b)</span> para no confundirlos jamás con números decimales, y los cortes aislados con el eje van escritos entre llaves <span class="eq">C<sub>0</sub> = { x<sub>0</sub> }</span>.`
    ),
    line(
      "feliz",
      "Completar la ficha",
      `Vas completando cada casillero de la ficha técnica siguiendo el orden metódico y tenés la radiografía analítica de la curva resuelta de punta a punta con total elegancia y sin dejar ningún hueco sin justificar.`
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
      `Si te aparecen potencias sumadas como <span class="eq">2<sup>x+1</sup> + 2<sup>x</sup></span>, desarmás el primer exponente en una multiplicación y extraés la potencia común afuera del paréntesis, obteniendo <span class="eq">2<sup>x</sup> &middot; (2 + 1)</span> para reducir todo a una cuenta simple.`
    ),
    line(
      "orgullosa",
      "Las tres llaves maestras",
      `Igualar bases en la balanza con <span class="eq">a<sup>u</sup> = a<sup>v</sup></span>, sacar factor común de la potencia repetida y aplicar una sustitución cuadrática positiva como <span class="eq">u = a<sup>x</sup> &gt; 0</span>: esas son las tres llaves maestras que abren cualquier ecuación exponencial que te pongan enfrente.`
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
