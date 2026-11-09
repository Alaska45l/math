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
 * - Soporte para highlightSelector en globos de interacción.
 */

const line = (pose, tag, html, highlightSelector = null) => ({
  pose,
  tag,
  html,
  ...(highlightSelector ? { highlightSelector } : {}),
});

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
      "pensativa",
      "La primera mirada a los datos",
      `¡Buenas! Te doy la bienvenida al laboratorio de exponenciales de Exactas. Cuando te tiran una tabla en un parcial o en un práctico, lo primero que mirás no es la última fila para asustarte: mirás la relación entre dos renglones seguidos para cazar el patrón.`
    ),
    line(
      "explicando",
      "El paso fijo de las rectas",
      `Fijate en la primera tabla: cada vez que la variable x avanza un casillero, la salida y suma siempre tres unidades fijas. Sumar siempre el mismo número es la marca registrada de las rectas y de la función lineal clásica.`
    ),
    line(
      "feliz",
      "La aceleración multiplicativa",
      `En la segunda tabla pasa algo completamente distinto: las diferencias entre filas se agrandan cada vez más. Pero si dividís cada número por el anterior, el cociente siempre da tres clavado: estamos multiplicando por un factor constante a igual a tres.`
    ),
    line(
      "unamused",
      "La emboscada de las cuadráticas",
      `¡Cuidado con la tercera tabla! Ahí las diferencias no son iguales ni los cocientes dan lo mismo, porque son los cuadrados de x. No cometas el error de encajar una exponencial a la fuerza cuando en realidad tenés una parábola cuadrática.`
    ),
    line(
      "complice",
      "El machete mental del detective",
      `Anotate este reflejo de supervivencia para cualquier ejercicio: primero probás si las filas se restan con un salto fijo. Si las restas cambian, dividís los valores para buscar la razón multiplicativa limpia de la potencia.`
    ),
    line(
      "evaluando",
      "Inspeccioná las columnas",
      `Probá los tres botones del tablero, cambiá los valores y mirá cómo el clasificador detecta la familia de curvas al instante. Mirá con atención los cocientes en el panel antes de contestar los chequeos que vienen.`,
      "#exp-widget-1"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 2: Cultivo de amebas (El neutro y k·a^x ≠ (k·a)^x)
  // ---------------------------------------------------------------------------
  "sec2-amebas": [
    line(
      "feliz",
      "Un cultivo en la mesada",
      `Imaginate un tubo de ensayo sobre la mesada del laboratorio con un cultivo de amebas que se duplica puntualmente cada hora. Este crecimiento biológico nos sirve para entender qué rol cumple cada número en la fórmula general.`
    ),
    line(
      "pensativa",
      "El momento cero y el neutro uno",
      `Pensá qué pasa en el instante inicial con tres amebas: calculamos <span class="eq">f(0) = 3 &middot; 2<sup>0</sup></span>. Como cualquier número distinto de cero elevado a la cero da uno, nos queda <span class="eq">f(0) = 3</span>: el número que multiplica adelante siempre marca la población en el origen.`
    ),
    line(
      "colapso",
      "El sacrilegio de juntar números",
      `¡Cuidado con juntar el tres y el dos! Si multiplicás tres por dos y ponés <span class="eq">6<sup>x</sup></span>, a las dos horas tendrías treinta y seis amebas, cuando en el cultivo real sólo hay <span class="eq">3 &middot; 2<sup>2</sup> = 12</span>. ¡Inventaste veinticuatro amebas de la nada por apurarte con las cuentas!`
    ),
    line(
      "explicando",
      "La jerarquía manda en Exactas",
      `En álgebra las potencias van primero y las multiplicaciones después. En la fórmula <span class="eq">3 &middot; 2<sup>x</sup></span>, el exponente sólo manda sobre la base contigua dos; el tres espera afuera su turno hasta que la potencia termine de calcularse.`
    ),
    line(
      "complice",
      "Tres tubos independientes",
      `Para no pifiarle nunca más, imaginate tres tubos de ensayo separados. En cada tubo ponés una sola ameba que se duplica según <span class="eq">2<sup>x</sup></span>. Al final sumás los tres tubos y tenés <span class="eq">3 &middot; 2<sup>x</sup></span>, sin inventar mutaciones raras.`
    ),
    line(
      "evaluando",
      "Seguí la curva en el tiempo",
      `Deslizá el control de tiempo de cero a diez horas en el gráfico. Compará la curva de una sola colonia contra la del cultivo triple y comprobá que la altura se mantiene siempre al triple en todo el recorrido.`,
      "#exp-widget-2"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 3: Puente continuo (Densidad racional y restricciones en ℝ)
  // ---------------------------------------------------------------------------
  "sec3-continuo": [
    line(
      "pensativa",
      "El pasaporte de la base",
      `En la fórmula general <span class="eq">f(x) = k &middot; a<sup>x</sup></span>, la base a no puede ser cualquier número: tiene que ser estrictamente positiva y distinta de uno. No es una manía de los profesores para desaprobarte, sino una exigencia lógica para que el gráfico exista.`
    ),
    line(
      "evaluando",
      "Más allá de los enteros",
      `Si sólo usáramos números enteros como uno, dos o tres, el gráfico serían puntos sueltos flotando en el aire. Para trazar una curva continua y sin baches necesitamos calcular valores intermedios, por ejemplo cuando <span class="eq">x = 1/2</span>.`
    ),
    line(
      "explicando",
      "El puente de los racionales",
      `Elevar a un medio equivale a calcular la raíz cuadrada principal. Si nuestra base es nueve, la función vale <span class="eq">9<sup>1/2</sup> = &radic;9 = 3</span>. Los números fraccionarios llenan los huecos infinitos entre los enteros y tienden un puente continuo sobre la recta real.`
    ),
    line(
      "panico",
      "La catástrofe de la base negativa",
      `Mirá el desastre si elegís una base negativa como menos dos: en <span class="eq">x = 1/2</span> tendrías <span class="eq">(&minus;2)<sup>1/2</sup> = &radic;(&minus;2) &notin; &reals;</span>, que no existe en los reales. La curva se rompería en pedazos y no se podría dibujar con trazo continuo.`
    ),
    line(
      "unamused",
      "Bases que no tienen gracia",
      `Tampoco admitimos una base igual a uno porque <span class="eq">1<sup>x</sup> = 1</span> siempre: te quedaría una recta horizontal aburrida. Y si la base fuera cero, al poner un exponente negativo dividirías por cero, destruyendo las reglas de la matemática elemental.`
    ),
    line(
      "feliz",
      "Cambiá la densidad de puntos",
      `Usá el selector de densidad en el pizarrón para pasar de puntos naturales a racionales y luego a la curva continua. Observá cómo el trazo verde se vuelve suave y perfecto únicamente cuando la base cumple todas las condiciones requeridas.`,
      "#exp-widget-3"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 4: Espejo de base (Decaimiento radiactivo y simetría (1/a)^x = a^-x)
  // ---------------------------------------------------------------------------
  "sec4-espejo": [
    line(
      "base",
      "La mitad que sobrevive",
      `Pensá en una muestra de sustancia radiactiva en el laboratorio que pierde la mitad de su masa en cada ciclo regular. La cantidad restante va cayendo a la mitad a cada paso siguiendo la función de decaimiento <span class="eq">f(x) = (1/2)<sup>x</sup></span>.`
    ),
    line(
      "pensativa",
      "El truco del espejo algebraico",
      `Mirá esta igualdad con atención: <span class="eq">(1/2)<sup>x</sup> = 2<sup>&minus;x</sup></span>. Invertir la fracción equivale a cambiarle el signo al exponente: <span class="eq">(1/a)<sup>x</sup> = a<sup>&minus;x</sup></span>. Esa propiedad es el motor matemático de toda la simetría del gráfico.`
    ),
    line(
      "explicando",
      "Geometría de la reflexión",
      `Como cambiar de signo a la variable x produce una reflexión respecto al eje vertical, el gráfico de <span class="eq">(1/2)<sup>x</sup></span> es la misma curva de <span class="eq">2<sup>x</sup></span> reflejada como en un espejo. Lo que antes subía rápido, ahora decae suavemente hacia el suelo.`
    ),
    line(
      "lentes-brillo",
      "El cruce de las potencias",
      `Si comparás <span class="eq">2<sup>x</sup></span> y <span class="eq">3<sup>x</sup></span>, para valores positivos la base mayor sube más empinada. Pero al pasar al lado negativo, ¡el orden se da vuelta! Dividir por dos deja más cantidad que dividir por tres, así que la curva de base dos queda arriba.`
    ),
    line(
      "complice",
      "El límite que nunca se toca",
      `Fijate que la cantidad se reduce sucesivamente a un medio, un cuarto, un octavo y así siguiendo. Por más tiempo que pase, nunca va a ser cero ni negativa. La recta horizontal <span class="eq">y = 0</span> es la asíntota y la imagen es el intervalo abierto <span class="eq">(0; +&infin;)</span>.`
    ),
    line(
      "feliz",
      "Probá la simetría en el lienzo",
      `Activá el modo espejo en el widget interactivo. Comprobá cómo los puntos reflejados coinciden exactamente a la misma altura en ambos lados del eje y verificá cómo la curva abraza a la asíntota sin llegar a cortarla jamás.`,
      "#exp-widget-4"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 5: Los cuatro cuadrantes de k y a (Monotonía y g(x) = -3(1/2)^x)
  // ---------------------------------------------------------------------------
  "sec5-cuadrantes": [
    line(
      "base",
      "Los cuatro caminos de la curva",
      `La silueta y el rumbo de la curva exponencial dependen de dos datos clave: si la base es mayor o menor que uno, y si el coeficiente inicial k es positivo o negativo. Esas dos elecciones arman cuatro familias bien distintas.`
    ),
    line(
      "enojada",
      "La trampa de la base fraccionaria",
      `Hay una equivocación que veo todos los años en los parciales: mirar <span class="eq">g(x) = &minus;3 &middot; (1/2)<sup>x</sup></span>, ver la fracción un medio y decir a las apuradas que decrece. ¡No te confíes! El signo de k cambia por completo la dirección del recorrido.`
    ),
    line(
      "pensativa",
      "Pensalo con tu saldo bancario",
      `Imaginátelo con dinero: en el momento cero debés tres mil pesos. Al siguiente paso tu deuda baja a mil quinientos, y luego a setecientos cincuenta. Como debés cada vez menos plata, tu saldo en la cuenta está subiendo con claridad hacia el cero.`
    ),
    line(
      "explicando",
      "Subiendo desde el sótano",
      `Miralo en la recta numérica: menos setenta y cinco centavos es mayor que menos un peso con cincuenta, que a su vez es mayor que menos tres: <span class="eq">&minus;0,75 &gt; &minus;1,5 &gt; &minus;3</span>. A medida que avanzamos hacia la derecha los números van subiendo: la función es estrictamente creciente en todo su dominio.`
    ),
    line(
      "complice",
      "El reflejo vertical de k",
      `La explicación visual es muy clara: multiplicar por un número negativo como <span class="eq">k = &minus;3</span> da vuelta la curva verticalmente respecto al eje horizontal. Una curva que antes caía, al invertirla boca abajo... ¡pasa a subir! Por eso su imagen es el intervalo abierto <span class="eq">(&minus;&infin;; 0)</span>.`
    ),
    line(
      "evaluando",
      "Explorá los cuatro cuadrantes",
      `Tocá los cuatro cuadrantes en el panel de control. Mirá la tabla viva de valores y confirmá cómo el signo de k y el tamaño de la base deciden juntos si la curva trepa o se hunde en el plano.`,
      "#exp-widget-5"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 6: Constructor de puntos (Reconstrucción analítica y geométrica)
  // ---------------------------------------------------------------------------
  "sec6-constructor": [
    line(
      "pensativa",
      "De las mediciones a la fórmula",
      `En un trabajo práctico o en un problema real casi nunca te dan la fórmula lista: tenés dos puntos de una medición y tenés que reconstruir la función exponencial exacta que pasa por ellos. Vamos a deducirla paso a paso con herramientas analíticas.`
    ),
    line(
      "explicando",
      "El cociente que cancela k",
      `Con las rectas restabas las alturas para sacar la pendiente. En las exponenciales el truco es dividir las ordenadas: al calcular <span class="eq">f(x<sub>2</sub>) / f(x<sub>1</sub>)</span>, la constante inicial se cancela y te queda una potencia pura <span class="eq">a<sup>x<sub>2</sub> &minus; x<sub>1</sub></sup></span> lista para despejar.`
    ),
    line(
      "feliz",
      "Descubrir la base y el origen",
      `Si la curva pasa por los puntos (1; 1) y (2; 3), en un solo paso horizontal la altura se triplica, con lo cual la base vale tres. Reemplazando en el primer punto deducís que en el origen arrancó en un tercio: la fórmula completa es <span class="eq">f(x) = (1/3) &middot; 3<sup>x</sup></span>.`
    ),
    line(
      "lentes-brillo",
      "El atajo en el eje vertical",
      `Si uno de los puntos que te dan es la ordenada al origen en <span class="eq">x = 0</span>, tenés medio ejercicio adentro. Como cualquier base elevada a la cero da uno, esa coordenada vertical te regala directamente el coeficiente k sin despejar nada raro.`
    ),
    line(
      "complice",
      "La regla del mismo signo",
      `Fijate en un detalle que siempre toman en los exámenes: las dos alturas tienen que tener obligatoriamente el mismo signo. Si una fuera positiva y la otra negativa, el cociente daría negativo y no podrías calcular raíces pares en los números reales.`
    ),
    line(
      "evaluando",
      "Arrastrá los puntos en el gráfico",
      `Mové los puntos de control P y Q sobre el lienzo interactivo. Observá cómo el calculador deduce la base fraccionaria y el coeficiente inicial exacto al instante, mostrando el escalón y el factor multiplicativo en el plano.`,
      "#exp-widget-6"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 7: Modelos en el tiempo (Porcentajes, períodos t/T y base e)
  // ---------------------------------------------------------------------------
  "sec7-modelos": [
    line(
      "base",
      "Fenómenos del mundo real",
      `En la vida real las fórmulas no son letras abstractas sueltas: modelan gramos de un isótopo que decae en medicina nuclear, bacterias que se reproducen en un cultivo o poblaciones medidas a lo largo de los años.`
    ),
    line(
      "pensativa",
      "El reloj de la vida media",
      `Si tenés cincuenta gramos de talio con una vida media de tres minutos, a la media hora transcurrieron diez ciclos completos. El exponente cuenta exactamente esas rondas de división por dos: la masa restante responde a <span class="eq">M(t) = 50 &middot; (1/2)<sup>t/3</sup></span>.`
    ),
    line(
      "lentes-brillo",
      "La trampa del porcentaje",
      `Cuando una población crece al doce por ciento cada cinco años, la base multiplicativa no es cero coma doce: es uno coma doce, porque conservás el cien por ciento original y le sumás el incremento. El exponente divide los años por cinco para contar períodos reales.`
    ),
    line(
      "explicando",
      "Cuidado con mezclar unidades",
      `¡Mucho ojo con las unidades de tiempo! Si un cultivo crece al 3,5% cada diez horas y pasaron cinco días, no pongas cinco en el exponente: cinco días son ciento veinte horas, o sea doce ciclos. Despejás la masa inicial haciendo <span class="eq">k = 200 / (1,035)<sup>12</sup> &asymp; 132,36 g</span>.`
    ),
    line(
      "complice",
      "La base natural de Euler",
      `En procesos continuos de física donde el cambio ocurre en cada instante, la base natural es el número <span class="eq">e &asymp; 2,71828</span>. La fórmula <span class="eq">A(t) = 120 &middot; e<sup>&minus;0,05t</sup></span> sigue las mismas reglas que cualquier otra exponencial con base mayor a uno.`
    ),
    line(
      "feliz",
      "Probá los escenarios en el panel",
      `Cambiá de escenario en el selector interactivo. Prestá atención a cómo el cociente del exponente traduce los minutos, horas o años a ciclos de decaimiento sin perder rigor numérico en ningún paso.`,
      "#exp-widget-7"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 8: Desplazamientos y asíntotas (f(x) = k·a^(x-h) + c y trampa de imagen)
  // ---------------------------------------------------------------------------
  "sec8-asintotas": [
    line(
      "base",
      "Curvas que se mudan en el plano",
      `Hasta acá miramos curvas con asíntota en el eje horizontal. Ahora sumamos corrimientos laterales y verticales en la forma general: <span class="eq">f(x) = k &middot; a<sup>x&minus;h</sup> + c</span>. La constante h mueve el gráfico de costado y el número c sube o baja el piso.`
    ),
    line(
      "pensativa",
      "La nueva altura de la asíntota",
      `Cuando nos vamos muy lejos hacia el infinito, el término con la potencia se acerca a cero sin llegar a tocarlo jamás. Por eso la función se aproxima a c, convirtiendo a la recta horizontal <span class="eq">y = c</span> en la nueva asíntota de la curva.`
    ),
    line(
      "lentes-brillo",
      "La trampa del corchete en la imagen",
      `Anotate esto bien grande en la carpeta: si te piden la imagen de <span class="eq">f(x) = 2 &middot; 3<sup>x&minus;1</sup> + 4</span>, muchos ponen cuatro con corchete cerrado. ¡Error grave de concepto! Para tocar el cuatro la potencia tendría que dar cero, y eso es imposible: va con paréntesis abierto <span class="eq">(4; +&infin;)</span>.`
    ),
    line(
      "explicando",
      "El ancla fácil en x = h",
      `Para graficar la curva a mano alzada sin hacer tablas interminables, buscá el punto donde el exponente se hace cero con <span class="eq">x = h</span>. En nuestro ejemplo evaluás en uno y te da directamente seis: el punto clave (1; 6) te ubica la gráfica al instante.`
    ),
    line(
      "complice",
      "¿Tiene o no tiene raíces?",
      `Para buscar los ceros igualás la función a cero: <span class="eq">k &middot; a<sup>x&minus;h</sup> + c = 0</span>. Al despejar te queda la potencia igual a menos c sobre k. Si ese cociente da negativo o cero, no hay soluciones reales y el conjunto de ceros es vacío.`
    ),
    line(
      "evaluando",
      "Mové los controles h y c",
      `Probá mover los deslizadores de corrimiento en el pizarrón. Mirá cómo la línea punteada acompaña a la constante c y cómo la imagen se actualiza en tiempo real manteniendo siempre su extremo con paréntesis abierto.`,
      "#exp-widget-8"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 9: Radiografía analítica (Estudio completo de funciones exponenciales trasladadas)
  // ---------------------------------------------------------------------------
  "sec9-radiografia": [
    line(
      "pensativa",
      "La ficha completa de la curva",
      `Hacer la radiografía analítica de una función es como armar su ficha técnica de punta a punta. Hay que determinar su dominio, su imagen, su asíntota horizontal, los cortes con los ejes y sus conjuntos de positividad y negatividad.`
    ),
    line(
      "explicando",
      "Estudiemos una curva con corrimiento",
      `Analicemos la función <span class="eq">f(x) = 2 &minus; (1/2)<sup>x</sup></span>. El dos de afuera fija la asíntota horizontal en dos. Como la potencia está restando con un signo menos adelante, la curva vive por debajo de ese techo, con imagen abierta <span class="eq">(&minus;&infin;; 2)</span>.`
    ),
    line(
      "lentes-brillo",
      "El despeje exacto de la raíz",
      `Para encontrar el corte con el eje horizontal igualamos la fórmula a cero: <span class="eq">2 &minus; (1/2)<sup>x</sup> = 0 &rArr; (1/2)<sup>x</sup> = 2</span>. Como dos es lo mismo que un medio a la menos uno, deducimos de inmediato que <span class="eq">x = &minus;1</span>: la curva cruza el suelo en ese único punto.`
    ),
    line(
      "feliz",
      "Signos sin adivinar",
      `Como la función viene subiendo desde valores negativos y cruza el eje en menos uno hacia la asíntota dos, el conjunto de negatividad es <span class="eq">C&minus; = (&minus;&infin;; &minus;1)</span> y el de positividad es <span class="eq">C+ = (&minus;1; +&infin;)</span>. ¡Cuidado con no dar vuelta los intervalos!`
    ),
    line(
      "complice",
      "El caso del corte en el origen",
      `Si cambiamos la asíntota al valor uno, tenemos la función <span class="eq">f(x) = 1 &minus; (1/2)<sup>x</sup></span>. Al buscar su raíz vemos que da cero exacto: la curva pasa justo por el origen de coordenadas, coincidiendo la raíz con la ordenada al origen.`
    ),
    line(
      "evaluando",
      "Revisá las ocho tarjetas",
      `Pasadéate por los casos en el panel interactivo. Mirá las ocho tarjetas del análisis y comprobá cómo cada intervalo formal coincide exactamente con la región sombreada en el pizarrón de tiza.`,
      "#exp-widget-9"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 10: Balanza de ecuaciones (3 métodos en ℝ sin logaritmos)
  // ---------------------------------------------------------------------------
  "sec10-ecuaciones": [
    line(
      "feliz",
      "Tres caminos sin logaritmos",
      `Cuando la incógnita x está atrapada en el exponente y querés resolver la ecuación sin recurrir a logaritmos, disponés de tres métodos algebraicos exactos que se apoyan en las propiedades de potencias y en la inyectividad de la función.`
    ),
    line(
      "pensativa",
      "Método 1: Bases gemelas y cocientes",
      `En una ecuación como <span class="eq">2<sup>3x+1</sup> : 16<sup>x&minus;4</sup> = 1</span>, pasamos dieciséis a base dos sabiendo que dieciséis a la x menos cuatro es dos a la cuatro x menos dieciséis. Al restar exponentes con paréntesis protectores nos queda <span class="eq">(3x + 1) &minus; (4x &minus; 16) = 0</span>, y despejamos limpiamente que equis vale diecisiete.`
    ),
    line(
      "explicando",
      "Método 2: El factor común salvador",
      `Cuando aparecen potencias sumadas como en <span class="eq">2<sup>x+1</sup> + 2<sup>x</sup> = 12</span>, desarmamos el exponente y sacamos la potencia repetida como factor común. El paréntesis se transforma en tres, y al dividir doce por tres nos queda <span class="eq">2<sup>x</sup> = 4</span>, despejando que equis vale dos.`
    ),
    line(
      "panico",
      "Método 3: El disfraz cuadrático",
      `Si ves una potencia doble como cuatro a la equis junto a dos a la equis, usamos la sustitución <span class="eq">u = 2<sup>x</sup></span>. La ecuación se transforma en una cuadrática común, pero con una condición innegociable: esa variable auxiliar u debe ser estrictamente positiva.`
    ),
    line(
      "complice",
      "El filtro de raíces negativas",
      `Al resolver la ecuación cuadrática auxiliar podés obtener una raíz positiva y otra negativa. A la negativa la tachás con lápiz rojo sin dudar: una potencia positiva jamás puede dar un resultado negativo en los reales, así que sólo recuperás la solución con la u positiva.`
    ),
    line(
      "evaluando",
      "Operá los tres métodos en el pizarrón",
      `Elegí cualquiera de las tres ecuaciones en el panel interactivo. Seguí la simplificación renglón por renglón en la balanza y mirá cómo cada expresión se reduce paso a paso hasta llegar a su solución final.`,
      "#exp-widget-10"
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
      "Tranqui, nadie nace sabiendo",
      `Si ves una tabla repleta de números y sentís que te marea la vista, respirá hondo y relajate. En la secundaria nos acostumbraron a calcular cuentas sueltas sin mostrarnos la relación que esconden los datos entre un casillero y el siguiente.`
    ),
    line(
      "pensativa",
      "La alcancía frente a la inversión",
      `Pensalo con esta comparación: si guardás quinientos pesos fijos en una alcancía cada semana, tu dinero crece sumando siempre la misma cuota fija. Ese salto constante es una función lineal clásica de la forma <span class="eq">f(x) = mx + b</span>.`
    ),
    line(
      "explicando",
      "La duplicación que se dispara",
      `En cambio, si ponés una inversión que se duplica cada semana, al principio parece poco: un peso pasa a dos, luego a cuatro. Pero en pocos pasos estás en ocho, dieciséis y treinta y dos, siguiendo una ley exponencial como <span class="eq">f(x) = 2<sup>x</sup></span>.`
    ),
    line(
      "base",
      "La prueba rápida con el lápiz",
      `Para descubrir qué tenés adelante hacé una sola cuenta: restá dos renglones consecutivos <span class="eq">y<sub>2</sub> &minus; y<sub>1</sub></span>. Si la resta da siempre lo mismo, es una recta; si la resta cambia pero la división da un número fijo, es una función exponencial.`
    ),
    line(
      "feliz",
      "El detector en tus manos",
      `Con esa simple división entre dos valores seguidos ya tenés un detector infalible para clasificar cualquier tabla de datos sin tener que adivinar nada de memoria.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 2: Base desde cero (Tres platos en la mesa)
  // ---------------------------------------------------------------------------
  "sec2-base": [
    line(
      "empatia",
      "La tentación de juntar números",
      `Es súper común ver la expresión <span class="eq">3 &middot; 2<sup>x</sup></span> y tener ganas de multiplicar el tres por el dos para escribir seis a la x. Nuestro cerebro ve el signo por y quiere liquidar la cuenta rápido para sacarse números de encima.`
    ),
    line(
      "pensativa",
      "Tres platos en la cocina",
      `Miralo con esta imagen cotidiana: imaginate que tenés tres platos hondos sobre la mesa. En cada plato ponés una porción de masa que duplica su tamaño cada hora: una porción pasa a dos, luego a cuatro, siguiendo la ley de potencias <span class="eq">2<sup>x</sup></span>.`
    ),
    line(
      "explicando",
      "La cuenta por separado",
      `En cada plato la masa crece según la fórmula <span class="eq">2<sup>x</sup></span>. Como tenés tres platos sobre la mesa, al final sumás las porciones multiplicando por tres: <span class="eq">3 &middot; 2<sup>x</sup></span>. A las dos horas tenés doce porciones en total, porque tres por cuatro da doce.`
    ),
    line(
      "base",
      "Por qué seis a la x es un disparate",
      `Si multiplicaras tres por dos y pusieras <span class="eq">6<sup>x</sup></span>, estarías diciendo que la masa se sextuplica a cada paso: a las dos horas tendrías <span class="eq">6<sup>2</sup> = 36</span> porciones. ¡Aparecieron veinticuatro porciones mágicas de la nada por saltearte el orden algebraico!`
    ),
    line(
      "orgullosa",
      "El orden que te cuida",
      `El exponente manda únicamente sobre su base vecina; el coeficiente que está adelante multiplica después al resultado final. Acordate de ese orden y no te vas a equivocar nunca más en los exámenes.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 3: Base desde cero (Dibujar sin levantar el lápiz)
  // ---------------------------------------------------------------------------
  "sec3-base": [
    line(
      "empatia",
      "¿Por qué tantas reglas para la base?",
      `Te dicen que la base debe ser positiva con <span class="eq">a &gt; 0</span> y que no puede valer uno con <span class="eq">a &ne; 1</span>, y parece un capricho aburrido de los profesores. Vamos a entender de dónde sale esta exigencia matemática fundamental.`
    ),
    line(
      "pensativa",
      "El salto loco de los negativos",
      `Si la base fuera negativa, por ejemplo menos dos, fijate qué pasa: a la uno da menos dos, al cuadrado da cuatro positivo, y al cubo da menos ocho. Los valores van saltando de signo como una pelota loca según la potencia <span class="eq">(&minus;2)<sup>x</sup></span>.`
    ),
    line(
      "explicando",
      "El pozo en el medio",
      `Una curva real necesita poder dibujarse con un trazo continuo sobre la hoja. ¿Qué pasaría en el punto medio, en <span class="eq">x = 1/2</span>? Elevar a un medio es calcular la raíz cuadrada <span class="eq">&radic;(&minus;2)</span>, que no existe en los números reales.`
    ),
    line(
      "base",
      "El freno en los reales",
      `Como no se puede calcular la raíz cuadrada de un número negativo en el conjunto de los números reales <span class="eq">&reals;</span>, en ese lugar la curva no se puede dibujar: se abre un pozo vacío que rompe el trazo continuo.`
    ),
    line(
      "feliz",
      "La base positiva es tu garantía",
      `Exigir que la base sea estrictamente positiva y distinta de uno no es una regla caprichosa: es la condición necesaria para que la función exista para cualquier número real que pongas en el exponente.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 4: Base desde cero (Cortar una pizza por la mitad)
  // ---------------------------------------------------------------------------
  "sec4-base": [
    line(
      "empatia",
      "Decaimiento radiactivo sin miedo",
      `La frase desintegración radiactiva suena a física pesadísima de película de ciencia ficción, pero en el fondo la matemática es tan sencilla como ir cortando una pizza por la mitad una y otra vez sobre la mesa.`
    ),
    line(
      "pensativa",
      "Siempre queda un pedacito",
      `Empezás con una pizza entera. Al año te queda media pizza; al año siguiente, un cuarto de pizza; al siguiente, un octavo. En cada ciclo vas cortando por la mitad lo que te había quedado, siguiendo la ley de decaimiento <span class="eq">(1/2)<sup>x</sup></span>.`
    ),
    line(
      "explicando",
      "Nunca llegás al cero absoluto",
      `Fijate en este detalle: por más que cortes mil veces la porción con el cuchillo más afilado del mundo, siempre te va a quedar una miga microscópica positiva. Jamás te vas a quedar con cero absoluto <span class="eq">y = 0</span> y mucho menos con una pizza negativa.`
    ),
    line(
      "base",
      "La idea detrás de la asíntota",
      `Esa línea invisible a la que te vas acercando infinitamente sin llegar a tocarla jamás es lo que en matemática llamamos asíntota horizontal, que en este caso es la recta horizontal <span class="eq">y = 0</span>.`
    ),
    line(
      "feliz",
      "Dos caras de la misma moneda",
      `Una base mayor a uno como <span class="eq">a = 2 &gt; 1</span> duplica y sube hacia arriba; una base fraccionaria como <span class="eq">a = 1/2 &lt; 1</span> divide y cae suavemente hacia la mesa. Son dos caras de la misma idea que ahora ya dominás.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 5: Base desde cero (Las deudas: deber menos es subir)
  // ---------------------------------------------------------------------------
  "sec5-base": [
    line(
      "empatia",
      "Los números negativos y la vista",
      `Cuando aparece un signo menos adelante de una función exponencial, como en <span class="eq">f(x) = &minus;a<sup>x</sup></span>, la intuición nos suele jugar una mala pasada porque estamos acostumbrados a pensar en cantidades que crecen hacia arriba.`
    ),
    line(
      "pensativa",
      "Menos deuda significa mejorar",
      `Pensalo con tu billetera: si hoy debés tres mil pesos y mañana tu deuda baja a mil quinientos pesos, ¿tu situación mejoró o empeoró? ¡Mejoró claramente! Como <span class="eq">&minus;1500 &gt; &minus;3000</span>, estás más cerca de salir del pozo.`
    ),
    line(
      "explicando",
      "La curva de -3 por un medio a la x",
      `Eso mismo pasa en <span class="eq">g(x) = &minus;3 &middot; (1/2)<sup>x</sup></span>: en el origen arranca en menos tres, luego sube a menos uno y medio, y después a menos cero setenta y cinco. Los valores se acercan al cero desde abajo: <span class="eq">&minus;0,75 &gt; &minus;1,5 &gt; &minus;3</span>.`
    ),
    line(
      "base",
      "Creciente en los números negativos",
      `Como al avanzar hacia la derecha en el gráfico los valores de y se mueven hacia arriba en el eje vertical, la función es estrictamente creciente en todo su dominio, aunque todos sus valores sean negativos.`
    ),
    line(
      "orgullosa",
      "Probá siempre dos valores",
      `Si en algún ejercicio tenés dudas de si una curva crece o decrece, calculá dos puntos fáciles en <span class="eq">x = 0</span> y <span class="eq">x = 1</span>. Comparás los dos números en la recta y la duda se despeja al instante sin complicaciones.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 6: Base desde cero (Seguir huellas en el barro)
  // ---------------------------------------------------------------------------
  "sec6-base": [
    line(
      "empatia",
      "De dos puntos a una fórmula",
      `Reconstruir una fórmula matemática a partir de dos puntos aislados en el plano parece un truco misterioso, pero en realidad es como seguir dos huellas en el barro para descubrir quién pasó caminando por ahí.`
    ),
    line(
      "pensativa",
      "La distancia entre las huellas",
      `Cuando trabajabas con una recta medías cuántos metros avanzabas y cuántos subías con una regla. En una función exponencial te fijás por qué número se multiplicó la altura al dar un paso hacia adelante.`
    ),
    line(
      "explicando",
      "Dividir para hallar la base",
      `Si en x igual a uno la función vale dos, y en x igual a dos vale seis, el paso multiplicó la salida por tres porque <span class="eq">6 / 2 = 3</span>. ¡Esa es tu base multiplicativa <span class="eq">a = 3</span> sin ninguna vuelta rara!`
    ),
    line(
      "base",
      "El punto de partida k",
      `Una vez que sabés que la base multiplica por tres a cada paso, retrocedés un paso hacia el momento cero para ver de dónde arrancó. Al dividir por tres obtenés directamente tu coeficiente inicial <span class="eq">k = 2/3</span>.`
    ),
    line(
      "feliz",
      "Sin fórmulas de memoria",
      `Dividir las dos salidas <span class="eq">y<sub>2</sub> / y<sub>1</sub></span> te entrega la base multiplicativa, y retroceder al momento cero te da la constante k. Con esos dos pasos resolvés cualquier problema de reconstrucción que te pongan enfrente.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 7: Base desde cero (Las tres piezas de un juguete)
  // ---------------------------------------------------------------------------
  "sec7-base": [
    line(
      "empatia",
      "Enunciados largos sin miedo",
      `Los enunciados largos de examen con bacterias, sustancias radiactivas y porcentajes parecen un trabalenguas imposible. Pero todos los modelos exponenciales se arman con exactamente tres piezas básicas bien reconocibles.`
    ),
    line(
      "pensativa",
      "Pieza 1: El punto de partida",
      `La primera pieza responde a la pregunta inicial: ¿con cuánto arrancás al principio? ¿Con cincuenta gramos o con cincuenta millones de personas? Ese valor medido en el instante <span class="eq">t = 0</span> va adelante de todo: es el coeficiente k.`
    ),
    line(
      "explicando",
      "Pieza 2: El factor de cambio",
      `La segunda pieza responde: ¿qué le pasa a esa cantidad a cada paso? Si se divide por la mitad, ponés <span class="eq">a = 1/2</span>. Si aumenta un doce por ciento, sumás el porcentaje al entero y ponés <span class="eq">a = 1,12</span> como base de acumulación.`
    ),
    line(
      "base",
      "Pieza 3: El ritmo del reloj",
      `La tercera pieza responde: ¿cada cuánto tiempo ocurre esa transformación? Si la cantidad decae cada tres minutos, el tiempo se divide por tres: escribís <span class="eq">t / 3</span> en el exponente para contar las rondas reales.`
    ),
    line(
      "feliz",
      "El modelo completo en su lugar",
      `Juntás las tres piezas en su lugar correspondiente: <span class="eq">M(t) = 50 &middot; (1/2)<sup>t/3</sup></span>. Listo, acabás de armar el modelo analítico completo sin transpirar ni dudar en ningún paso.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 8: Base desde cero (Deslizar un papel transparente)
  // ---------------------------------------------------------------------------
  "sec8-base": [
    line(
      "empatia",
      "Curvas como acetatos transparentes",
      `Imaginate que dibujaste la curva exponencial en una lámina de plástico transparente y ahora podés deslizar esa lámina libremente sobre la mesa hacia arriba, hacia abajo o hacia los costados sin deformarla.`
    ),
    line(
      "pensativa",
      "Subir el piso con el número de afuera",
      `Si a la fórmula le sumás un cuatro al final, como en <span class="eq">f(x) = 2 &middot; 3<sup>x</sup> + 4</span>, estás levantando toda la lámina cuatro unidades hacia arriba respecto a la superficie horizontal de referencia.`
    ),
    line(
      "explicando",
      "El piso nuevo que llamamos asíntota",
      `El piso de la curva, que antes descansaba en la recta <span class="eq">y = 0</span>, ahora subió y flota a cuatro unidades de altura en <span class="eq">y = 4</span>. La curva se acerca a esa recta pero nunca llega a tocarla ni a cruzarla.`
    ),
    line(
      "base",
      "Por qué usamos paréntesis y no corchetes",
      `Como la curva jamás llega a tocar exactamente la recta <span class="eq">y = 4</span>, ese valor es una frontera de aproximación. Por eso escribimos paréntesis abierto al anotar el conjunto imagen: <span class="eq">Im(f) = (4; +&infin;)</span>.`
    ),
    line(
      "orgullosa",
      "El detalle que suma puntos",
      `Poner un paréntesis redondo <span class="eq">(4; +&infin;)</span> en vez de un corchete cerrado es la diferencia entre tener el ejercicio impecable o tropezar con un error conceptual. Ahora ya sabés la razón gráfica de por qué va abierto.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 9: Base desde cero (La ficha médica de una función)
  // ---------------------------------------------------------------------------
  "sec9-base": [
    line(
      "empatia",
      "Una radiografía es una lista de chequeo",
      `Hacer el estudio analítico completo de una función puede parecer un cuestionario infinito y cansador. Miralo como hacerle la verificación técnica al auto: vas revisando pieza por pieza con una lista metódica.`
    ),
    line(
      "pensativa",
      "Las dos preguntas iniciales",
      `Pregunta uno: ¿qué valores de x puedo ingresar a la fórmula? Todos los reales sin excepción: <span class="eq">Dom(f) = &reals;</span>. Pregunta dos: ¿dónde está el piso o techo de la curva? En la recta horizontal <span class="eq">y = c</span>.`
    ),
    line(
      "explicando",
      "La frontera del corte con el eje",
      `Pregunta tres: ¿en qué lugar exacto la curva cruza la línea del suelo? Igualás la fórmula a cero: <span class="eq">f(x) = 0</span> y despejás la raíz. Ese valor de corte divide el mapa entre lo positivo y lo negativo.`
    ),
    line(
      "base",
      "Anotar con la notación de Exactas",
      `En Exactas cuidamos la notación: los intervalos van siempre separados con punto y coma <span class="eq">(a; b)</span> para no confundirlos jamás con números decimales, y las raíces aisladas van escritas entre llaves <span class="eq">C<sub>0</sub> = { x<sub>0</sub> }</span>.`
    ),
    line(
      "feliz",
      "La ficha completa y ordenada",
      `Vas completando cada renglón de la lista metódica y tenés la radiografía analítica de la curva resuelta de punta a punta con total claridad y sin dejar ningún cabo suelto.`
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 10: Base desde cero (Bases gemelas en la balanza)
  // ---------------------------------------------------------------------------
  "sec10-base": [
    line(
      "empatia",
      "Bajar la incógnita del exponente",
      `Ver la incógnita x colgada arriba en el exponente genera cierta desconfianza al principio porque parece inalcanzable con los despejes comunes que nos enseñaron en la escuela secundaria.`
    ),
    line(
      "pensativa",
      "Bases idénticas a los dos lados",
      `El secreto más elegante de todo el álgebra es lograr que ambos platillos de la balanza tengan la misma base numérica. Si lográs escribir <span class="eq">2<sup>x</sup> = 2<sup>5</sup></span>, la respuesta salta sola a la vista: <span class="eq">x = 5</span>.`
    ),
    line(
      "explicando",
      "Igualar los exponentes",
      `Si las bases son idénticas en ambos miembros, los exponentes tienen que ser obligatoriamente iguales entre sí para que la balanza se mantenga en equilibrio: <span class="eq">a<sup>u</sup> = a<sup>v</sup> &rArr; u = v</span>. Descartás las bases y te queda una ecuación común.`
    ),
    line(
      "base",
      "El truco del factor común",
      `Si te aparecen potencias sumadas como <span class="eq">2<sup>x+1</sup> + 2<sup>x</sup></span>, desarmás el primer exponente en una multiplicación y extraés la potencia común afuera del paréntesis, reduciendo todo a una cuenta muy simple.`
    ),
    line(
      "orgullosa",
      "Las tres llaves del álgebra",
      `Igualar bases en la balanza con <span class="eq">a<sup>u</sup> = a<sup>v</sup></span>, sacar factor común de la potencia repetida y aplicar una sustitución cuadrática positiva: esas son las tres llaves maestras para resolver cualquier ecuación exponencial.`
    ),
  ],
};

// =============================================================================
// ALIASING UNIVERSAL DE GUIONES
// =============================================================================

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
