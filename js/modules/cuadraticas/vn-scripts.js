/**
 * Alaska Math Lab · Función Cuadrática, Factorización y Parábolas
 * Guiones Artesanales de Visual Novel (20 guiones: 10 principales + 10 de base desde cero)
 * Redacción conversacional en voseo rioplatense, con símbolos Unicode limpios y cero texto de manual.
 */

const balloon = (pose, tag, content) => ({
  pose,
  tag,
  speaker: 'Alaska',
  html: content,
  text: content,
});

export const VN_SCRIPTS = {
  /* ========================================================================
   * CAPÍTULO 1 · DEL ÁREA AL POLINOMIO Y EL ARTE DE FACTORIZAR
   * ======================================================================== */
  'sec1-area': [
    balloon(
      'base',
      'Del terreno al álgebra',
      'Olvidate por un rato de las flechitas mecánicas de la secundaria para multiplicar paréntesis. Si entendés cómo se parte un terreno rectangular en cuatro parcelas, nunca más te vas a olvidar un término en el camino.'
    ),
    balloon(
      'explicando',
      'Las cuatro parcelas',
      'Mirá el rectángulo del pizarrón: si la base mide x + 3 y la altura mide x + 2, al trazar las líneas divisorias aparecen cuatro regiones bien distintas: el cuadrado grande x², dos rectángulos laterales de 3x y 2x, y la esquina numérica de 3 · 2 = 6.'
    ),
    balloon(
      'lentes-brillo',
      'El secreto del doble producto',
      'Por eso cuando elevás un binomio al cuadrado como (x + 3)², jamás da x² + 9. En las esquinas diagonales viven dos rectángulos gemelos de área 3x cada uno, y juntos forman el famoso doble producto +6x.'
    ),
    balloon(
      'eureka',
      'Diferencia de cuadrados',
      'En cambio, cuando multiplicás una suma por una resta como (x + 3)·(x − 3), un rectángulo suma +3x y el otro descuenta −3x: se neutralizan exactamente a cero y sobrevive limpia la diferencia de cuadrados x² − 9.'
    ),
    balloon(
      'sospecha',
      'Falsas cuadráticas disfrazadas',
      'Y abrí bien los ojos con las falsas cuadráticas disfrazadas: en expresiones como 2(x − 1)² − 2x², al desarrollar el cuadrado el término 2x² se anula con −2x² y lo que parecía una parábola resulta ser una simple recta.'
    ),
  ],

  'sec1-base': [
    balloon(
      'empatia',
      'Desde cero absoluto',
      'Si hace mucho que no tocás álgebra y ver letras con exponentes te pone a la defensiva, respirá hondo que arrancamos desde el piso. Una letra como x es simplemente una medida que todavía podemos estirar o encoger.'
    ),
    balloon(
      'base',
      'Por qué x² no se junta con 2x',
      'Cuando multiplicamos x por x escribimos x² porque coincide con el área de un cuadrado de lado x. En cambio, 2x significa sumar dos tiras de largo x una al lado de la otra: son especies distintas y no se pueden mezclar en una sola bolsa.'
    ),
    balloon(
      'pensativa',
      'Áreas con restas',
      '¿Y qué significa tener un número negativo como (x − 4) si en la carpintería nadie vende maderas de menos cuatro metros? Pensalo como una contabilidad de áreas: primero calculás el terreno completo y después descontás la franja de ancho 4.'
    ),
    balloon(
      'explicando',
      'Menos por menos en la esquina',
      'Al cruzar dos descuentos negativos, como −4 por −3, aplicamos la regla de signos: descontar tres veces una deuda de cuatro equivale a recuperar +12 unidades a favor en la esquina inferior derecha del tablero.'
    ),
    balloon(
      'complice',
      'A probar en el tablero',
      'Probá mover los divisores del modelo de área en el pizarrón y mirá cómo cada parcela cambia de color según su signo antes de sumarse en el polinomio final.'
    ),
  ],

  'sec2-balanza': [
    balloon(
      'pensativa',
      'Rebobinar la película',
      'Factorizar no es ningún hechizo nuevo: es exactamente rebobinar la película de la sección anterior. Te entregan el área total desplegada, por ejemplo x² + 5x + 6, y tu misión de detective es descubrir cuánto medían los lados del rectángulo original.'
    ),
    balloon(
      'explicando',
      'Las dos pistas del detective',
      'Si los lados buscados son (x + m) y (x + n), al multiplicarlos queda x² + (m + n)x + m · n. Ahí tenés las dos huellas dactilares: el término independiente c es el producto m · n y el coeficiente lineal b es la suma m + n.'
    ),
    balloon(
      'lentes-brillo',
      'El truco de los signos (c > 0)',
      'Para no tirar números al azar, mirá primero el signo del producto c: si c es positivo, los dos números m y n tienen obligatoriamente el mismo signo, y el signo de b te revela si ambos son positivos o ambos negativos.'
    ),
    balloon(
      'evaluando',
      'El truco de los signos (c < 0)',
      'Si en cambio el producto c es negativo, como en x² − x − 42, sabés al instante que uno es positivo y el otro es negativo; como la suma da −1, el de mayor tamaño absoluto tiene que llevar el signo menos, dándote −7 y +6.'
    ),
    balloon(
      'orgullosa',
      'Estrategia ganadora',
      'Siempre empezá listando las parejas de divisores enteros del término independiente c, que son poquitas, y probá en la balanza cuál de esas parejas clava la suma b.'
    ),
  ],

  'sec2-base': [
    balloon(
      'empatia',
      'Términos vs. Factores',
      'Vamos a aclarar una duda súper común: ¿qué diferencia hay entre un término y un factor? Cuando tenés x² + 5x + 6, las tres piezas están separadas por sumas y se llaman términos; cuando lo reescribís como (x + 2)·(x + 3), pasan a multiplicarse y se llaman factores.'
    ),
    balloon(
      'base',
      'Para qué sirve factorizar',
      '¿Y para qué nos tomamos el trabajo de transformar sumas en una multiplicación? Porque si querés saber cuándo una expresión vale cero, con sumas es difícil, pero con una multiplicación basta con que cualquiera de los paréntesis valga cero.'
    ),
    balloon(
      'explicando',
      'Primero el factor común',
      'Antes de buscar paréntesis dobles, fijate siempre si todos los términos comparten un número o una letra repetida. Por ejemplo, en 3x² + 15x + 18 todos son múltiplos de 3, así que podés aliviar la cuenta sacando el 3 adelante: 3·(x² + 5x + 6).'
    ),
    balloon(
      'eureka',
      'Achicar el problema',
      'Ese primer paso se llama extraer factor común y es como sacar el zoom de una foto: deja adentro del paréntesis números mucho más chicos y manejables para tu cabeza.'
    ),
    balloon(
      'feliz',
      'Manos a la balanza',
      'Jugá con los candidatos de la balanza en el widget: vas a ver cómo la aguja de la suma se inclina hasta que encontrás el par exacto que cierra el rectángulo.'
    ),
  ],

  'sec3-agrupacion': [
    balloon(
      'sospecha',
      'Cuando a no vale 1',
      'Cuando delante de x² aparece un coeficiente distinto de 1, como en 2x² + 7x + 3, buscar dos números que multiplicados den 3 y sumados den 7 ya no funciona porque ese 2 principal multiplica a una de las alas del rectángulo.'
    ),
    balloon(
      'evaluando',
      'El producto maestro a · c',
      'El secreto está en multiplicar primero los extremos a · c: acá hacemos 2 · 3 = 6. Ahora sí buscamos dos números m y n cuyo producto sea 6 y cuya suma sea el 7 del medio: claramente son 1 y 6.'
    ),
    balloon(
      'explicando',
      'Partir el término central',
      '¿Qué hacemos con ese 1 y ese 6? ¡No los metemos directo en paréntesis! Los usamos para desarmar el término central 7x en dos pedazos: 2x² + 1x + 6x + 3, volviendo a mostrar las cuatro parcelas del modelo de área.'
    ),
    balloon(
      'lentes-brillo',
      'Factor común por grupos',
      'Ahora agrupamos de a dos: en la primera pareja (2x² + x) sacamos factor común x quedando x(2x + 1), y en la segunda pareja (6x + 3) sacamos factor común 3 quedando 3(2x + 1). Como el paréntesis (2x + 1) se repite idéntico, lo extraemos y queda (2x + 1)(x + 3).'
    ),
    balloon(
      'orgullosa',
      'La brújula de 5 pasos',
      'Si te topás con cualquier polinomio en frío, seguí siempre la brújula en orden: primero factor común, segundo diferencia de cuadrados, tercero trinomio cuadrado perfecto, cuarto suma-producto y quinto agrupación.'
    ),
  ],

  'sec3-base': [
    balloon(
      'empatia',
      'Cuidado con el signo menos',
      'El paso de agrupación suele asustar cuando el tercer término trae un signo menos, por ejemplo al desarmar 3x² − 10x + 8 como 3x² − 6x − 4x + 8. Vamos a mirarlo con lupa para que ese signo no te tienda una trampa.'
    ),
    balloon(
      'base',
      'Primera pareja lista',
      'En los dos primeros términos, 3x² − 6x, sacamos factor común 3x y nos queda 3x·(x − 2). Nuestro objetivo ahora es que en la segunda pareja, −4x + 8, aparezca exactamente el mismo paréntesis (x − 2).'
    ),
    balloon(
      'evaluando',
      'Extraer factor negativo',
      'Si de −4x + 8 sacaras +4 positivo, adentro te quedaría (−x + 2), que tiene los signos al revés de (x − 2). En cambio, al extraer −4 con signo negativo incluido, dividís +8 por −4 y el signo cambia a −2: queda −4·(x − 2).'
    ),
    balloon(
      'explicando',
      'Chequeo mental inmediato',
      'Podés verificarlo al instante multiplicando mentalmente hacia atrás: −4 por x da −4x, y −4 por −2 vuelve a dar +8 positivo. Así los dos bloques comparten el factor binomial (x − 2) y se funden en (3x − 4)·(x − 2).'
    ),
    balloon(
      'complice',
      'Recorré el árbol',
      'Activá el modo Árbol de Decisión en el pizarrón para recorrer los casos clásicos y ver cómo el primer paso de sacar factor común achica cualquier monstruo algebraico.'
    ),
  ],

  /* ========================================================================
   * CAPÍTULO 2 · LAS TRES VESTIMENTAS DE LA PARÁBOLA
   * ======================================================================== */
  'sec4-canonica': [
    balloon(
      'base',
      'De la V a la parábola',
      'Si venís del laboratorio de Valor Absoluto, la forma canónica f(x) = a(x − xᵥ)² + yᵥ te va a resultar recontra familiar: cambiamos las barras rígidas por un paréntesis al cuadrado y la esquina en V se suaviza en una parábola.'
    ),
    balloon(
      'evaluando',
      'Por qué cambia el signo de xᵥ',
      '¿Por qué la coordenada horizontal del vértice xᵥ se lee con el signo cambiado respecto al interior del paréntesis? Porque cualquier número real al cuadrado da cero o positivo; entonces (x − xᵥ)² toca su piso mínimo de cero recién cuando x vale exactamente xᵥ.'
    ),
    balloon(
      'explicando',
      'El vértice V(xᵥ; yᵥ)',
      'En ese instante x = xᵥ todo el término cuadrático se apaga y la altura de la función queda clavada en el número de afuera, yᵥ. Por eso el punto V(xᵥ; yᵥ) es la cumbre o el valle absoluto de la curva.'
    ),
    balloon(
      'lentes-brillo',
      'Escalones 1a, 4a, 9a',
      'El coeficiente principal "a" maneja dos cosas a la vez: su signo define la concavidad (si a > 0 abre hacia arriba con mínimo; si a < 0 abre hacia abajo con máximo) y su módulo marca los escalones cuadráticos 1a, 4a, 9a al alejarte 1, 2 o 3 unidades del vértice.'
    ),
    balloon(
      'eureka',
      'Despejar sin desarrollar',
      'Y cuando quieras hallar las raíces desde la forma canónica, no hace falta que desarrolles todo el cuadrado: igualás a cero, despejás (x − xᵥ)² y aplicás raíz cuadrada en ambos lados recordando que √((x − xᵥ)²) = |x − xᵥ| abre dos ramas simétricas ±.'
    ),
  ],

  'sec4-base': [
    balloon(
      'empatia',
      'Por qué se curva el gráfico',
      'Pausemos un segundo en la pregunta del millón: ¿por qué la gráfica de y = x² se curva cada vez más empinada en lugar de subir derechito como una rampa lineal?'
    ),
    balloon(
      'base',
      'Los cuadrados aceleran',
      'En una recta subís en escalones constantes: avanzás 1 a la derecha y subís 1; avanzás 2 y subís 2. Pero al elevar al cuadrado, cuando te alejás 1 unidad del origen la altura es 1² = 1; cuando te alejás 2 unidades salta a 2² = 4; y a las 3 unidades ya trepó a 3² = 9.'
    ),
    balloon(
      'explicando',
      'El espejo de los signos',
      'Además, como elevar al cuadrado mata el signo menos —porque (−2)·(−2) también da +4—, lo que pasa a la izquierda del vértice es el reflejo en espejo exacto de lo que pasa a la derecha.'
    ),
    balloon(
      'sospecha',
      'yᵥ no es la ordenada al origen',
      'Atención a una confusión que cuesta carísimo: el número suelto yᵥ de la forma canónica a(x − xᵥ)² + yᵥ es la altura del vértice, ¡no la ordenada al origen! Para saber dónde corta al eje Y tenés que reemplazar x = 0 y hacer la cuenta completa.'
    ),
    balloon(
      'feliz',
      'Arrastrá el vértice',
      'Arrastrá el nodo del vértice y el punto de paso en el gráfico para sentir en la mano cómo responden los escalones 1a y 4a.'
    ),
  ],

  'sec5-factorizada': [
    balloon(
      'base',
      'Las raíces a la vista',
      'Si la forma canónica te entrega el vértice en bandeja de plata, la forma factorizada f(x) = a(x − x₁)(x − x₂) te regala directamente los puntos donde la parábola pisa el suelo del eje X: sus raíces x₁ y x₂.'
    ),
    balloon(
      'explicando',
      'Propiedad del producto cero',
      'Funciona gracias a la Propiedad del Producto Cero: como tenés tres piezas multiplicándose, la única manera de que toda la cuenta dé cero es que el primer paréntesis valga cero (cuando x = x₁) o que el segundo paréntesis valga cero (cuando x = x₂).'
    ),
    balloon(
      'enojada',
      'Prohibido tachar la x',
      'Por eso mismo, cuando tengas una cuadrática incompleta como x² − 4x = 0, jamás pases el 4x al otro lado para tachar una x de cada lado. Si dividís por x estás prohibiendo en secreto que x valga cero y asesinás la raíz x₁ = 0; lo correcto es sacar factor común x·(x − 4) = 0.'
    ),
    balloon(
      'lentes-brillo',
      'El vértice en el promedio',
      'Una vez que ubicaste las dos raíces x₁ y x₂ en el eje X, encontrar el eje de simetría es un paseo: como la parábola es simétrica, el vértice cae clavado en el promedio exacto entre ambas raíces, xᵥ = (x₁ + x₂) / 2.'
    ),
    balloon(
      'orgullosa',
      'Reconstruir el factor a',
      'Y si te piden reconstruir la fórmula dándote las raíces y un punto de paso, armás el esqueleto a(x − x₁)(x − x₂) y reemplazás las coordenadas del punto para destrabar cuánto vale el coeficiente principal "a".'
    ),
  ],

  'sec5-base': [
    balloon(
      'empatia',
      'Cómo promediar con negativos',
      'Vamos a asegurarnos de que el cálculo del punto medio entre dos raíces te salga sin dudar, incluso cuando una o las dos raíces son negativas.'
    ),
    balloon(
      'base',
      'Sumar y dividir por dos',
      'Promediar dos números sobre la recta numérica es siempre sumarlos con su signo y dividir el resultado por 2. Por ejemplo, si las raíces son x₁ = −2 y x₂ = 6, hacés (−2 + 6) / 2 = 4 / 2 = 2.'
    ),
    balloon(
      'pensativa',
      'Distancia simétrica',
      'Mirá en la recta si tiene sentido geométrico: desde −2 hasta 2 hay 4 pasos de distancia, y desde 2 hasta 6 también hay 4 pasos de distancia. El eje de simetría x = 2 parte la distancia total de 8 exactamente en dos mitades de 4.'
    ),
    balloon(
      'explicando',
      'De xᵥ a la altura yᵥ',
      'Ese valor xᵥ = 2 es apenas la coordenada horizontal del vértice; para averiguar a qué altura yᵥ está el piso o el techo de la curva, simplemente metés x = 2 adentro de la fórmula factorizada y multiplicás.'
    ),
    balloon(
      'complice',
      'Probá el espejo en vivo',
      'Mové las dos raíces sobre el eje X en el pizarrón y observá cómo la línea punteada del eje de simetría las persigue manteniéndose siempre a mitad de camino.'
    ),
  ],

  'sec6-completar': [
    balloon(
      'pensativa',
      'El misterio de −b / (2a)',
      'Acá llegamos al puente maestro del laboratorio. Casi siempre las cuadráticas aparecen vestidas en forma polinómica f(x) = ax² + bx + c, donde el único dato visible a simple vista es la ordenada al origen c, pero el vértice está oculto.'
    ),
    balloon(
      'evaluando',
      'Abrir la caja negra',
      'Muchos memorizan xᵥ = −b / (2a) como un loro sin saber de dónde sale. Hoy vamos a abrir la caja negra con el método geométrico de Completar el Cuadrado sobre x² − 6x + 2.'
    ),
    balloon(
      'explicando',
      'Dos alas simétricas',
      'Tomamos el término lineal −6x y lo partimos en dos alas iguales de −3x para rodear al cuadrado x². Para que esas dos alas cierren un cuadrado perfecto de lado (x − 3), nos falta la esquinita numérica de 3² = 9.'
    ),
    balloon(
      'lentes-brillo',
      'La jugada del neutro +0',
      'Como en matemática no podemos regalar un 9 porque cambiaríamos la función, hacemos la jugada del neutro aditivo: sumamos +9 y restamos −9 en el mismo renglón. Los tres primeros términos x² − 6x + 9 se pliegan en (x − 3)² y afuera queda −9 + 2 = −7.'
    ),
    balloon(
      'eureka',
      'Deducción universal',
      'Si repetís exactamente ese mismo truco con letras generales en ax² + bx + c, la mitad de b/a es b/(2a), y al cerrar el cuadrado aparece (x + b/(2a))²: ¡de ahí nace para toda la vida que la abscisa del vértice es xᵥ = −b / (2a)!'
    ),
  ],

  'sec6-base': [
    balloon(
      'empatia',
      'Cuando hay un factor a adelante',
      'Cuando adelante de x² hay un coeficiente "a" distinto de 1, como en 3x² − 6x − 1, completar el cuadrado tiene un detalle delicado donde medio curso tropieza. Vamos a blindarlo paso a paso.'
    ),
    balloon(
      'base',
      'El corchete protector',
      'Antes de partir a la mitad el término con x, sacamos factor común 3 únicamente de los dos primeros términos: escribimos 3 · [x² − 2x] − 1, dejando al −1 esperando tranquilo afuera del corchete.'
    ),
    balloon(
      'explicando',
      'Sumar y restar adentro',
      'Adentro del corchete tenemos x² − 2x: la mitad de −2 es −1, y su cuadrado es (−1)² = 1. Sumamos y restamos 1 adentro del corchete: 3 · [(x² − 2x + 1) − 1] − 1.'
    ),
    balloon(
      'sospecha',
      'El peaje al salir del corchete',
      '¡Acá viene el momento crítico! Ese −1 que sobra adentro del corchete está afectado por el 3 que vigila en la puerta. Para sacarlo afuera tenés que multiplicarlo por 3: sale como −3, y al juntarse con el −1 externo da yᵥ = −4 en 3(x − 1)² − 4.'
    ),
    balloon(
      'feliz',
      'Mirá la barra Rosetta',
      'Recorré los cuatro pasos con el deslizador del rompecabezas geométrico y compará en la barra Rosetta cómo las tres formas describen exactamente la misma parábola.'
    ),
  ],

  /* ========================================================================
   * CAPÍTULO 3 · DISCRIMINANTE, RADIOGRAFÍA DE EXAMEN E INTERSECCIONES
   * ======================================================================== */
  'sec7-discriminante': [
    balloon(
      'base',
      'La resolvente por dentro',
      'La famosa fórmula resolvente no bajó en una nave espacial: es simplemente igualar a cero la forma canónica que acabamos de construir completando el cuadrado y despejar la x.'
    ),
    balloon(
      'evaluando',
      'Eje más/menos distancia',
      'Si en vez de escribir todo sobre una raya larga la separás en dos bloques como x = −b/(2a) ± √(b² − 4ac)/(2a), la fórmula te habla en castellano: parate en el eje de simetría xᵥ = −b/(2a) y caminá la misma distancia a izquierda y derecha.'
    ),
    balloon(
      'lentes-brillo',
      'El radar Δ = b² − 4ac',
      'Lo que vive adentro de la raíz cuadrada es el Discriminante Δ = b² − 4ac, y funciona como un radar geométrico antes de calcular nada: si Δ > 0 caminás una distancia real y hay 2 raíces distintas; si Δ = 0 caminás cero y las dos raíces se funden en 1 raíz doble donde la parábola besa al eje X.'
    ),
    balloon(
      'explicando',
      'Cuando Δ es negativo',
      'Y si Δ < 0, en los números reales no existe la raíz cuadrada de un negativo: eso significa geométricamente que la parábola flota entera por encima o por debajo del eje X sin cortarlo jamás, dándote conjunto de ceros vacío C₀ = ∅.'
    ),
    balloon(
      'orgullosa',
      'Atajo Cardano-Vieta',
      'Además, al sumar las dos ramas de la resolvente las raíces cuadradas opuestas se cancelan dando x₁ + x₂ = −b/a, y al multiplicarlas queda x₁ · x₂ = c/a: son las fórmulas de Cardano-Vieta para destrabar parámetros ocultos en segundos.'
    ),
  ],

  'sec7-base': [
    balloon(
      'empatia',
      'Las dos emboscadas de signos',
      'El noventa por ciento de los errores al usar la fórmula resolvente no son por no saber la fórmula, sino por dos emboscadas de signos cuando el coeficiente b es negativo, por ejemplo en x² − 6x + 2 = 0.'
    ),
    balloon(
      'colapso',
      'Cuidado con −b y con (−b)²',
      'Primera emboscada: la fórmula arranca con "−b", que significa "el opuesto de b". Si b vale −6, entonces −b es −(−6) = +6 positivo. Segunda emboscada: adentro de la raíz va (−6)² con paréntesis, que da +36 positivo, ¡jamás −36!'
    ),
    balloon(
      'explicando',
      'Radicales exactos sin redondear',
      '¿Y qué pasa cuando el discriminante da un número positivo que no tiene raíz exacta, como Δ = 28? No corras a la calculadora a redondear decimales: como 28 = 4 · 7, sacás la raíz de 4 afuera y escribís 2√7.'
    ),
    balloon(
      'evaluando',
      'Simplificación limpia',
      'Entonces en x = (6 ± 2√7) / 2 dividís tanto el 6 como el 2 de afuera por el denominador 2, y te quedan las dos raíces irracionales exactas e impecables: x₁ = 3 − √7 y x₂ = 3 + √7.'
    ),
    balloon(
      'complice',
      'Deslizá el parámetro k',
      'Mové el control del parámetro en el radar Δ del pizarrón para ver en vivo el instante exacto en que las dos raíces colisionan en el vértice y despegan del eje X.'
    ),
  ],

  'sec8-radiografia': [
    balloon(
      'evaluando',
      'Cada pregunta en su eje',
      'Cuando te piden el análisis completo de una cuadrática —dominio, imagen, ceros, positividad, negatividad y monotonía—, el secreto para no perder ni medio punto es saber qué eje estás mirando en cada pregunta.'
    ),
    balloon(
      'explicando',
      'El piso horizontal (Eje X)',
      'Crecimiento, decrecimiento, positividad C⁺ y negatividad C⁻ son preguntas sobre el recorrido horizontal: se responden SIEMPRE leyendo intervalos sobre el piso del eje X. Jamás metas la altura yᵥ adentro de un intervalo de crecimiento.'
    ),
    balloon(
      'lentes-brillo',
      'Corchete cerrado en la Imagen',
      'En cambio, la Imagen pregunta qué alturas verticales alcanza la gráfica sobre el eje Y. Y acá va un contraste fundamental con las exponenciales: como la parábola sí toca y pisa su propio vértice, en yᵥ va SIEMPRE corchete cerrado: [yᵥ; +∞) si abre hacia arriba o (−∞; yᵥ] si abre hacia abajo.'
    ),
    balloon(
      'sospecha',
      'El punto de rebote en signos',
      'Prestá mucha atención a los conjuntos de signos C⁺ y C⁻ cuando la parábola rebota en el eje X con raíz doble xᵥ: si abre hacia arriba, es positiva en todos lados salvo en ese punto donde vale cero, así que escribimos (−∞; xᵥ) ∪ (xᵥ; +∞) o ℝ − {xᵥ}.'
    ),
    balloon(
      'pensativa',
      'Restringir para invertir',
      'Finalmente, como cualquier recta horizontal corta las dos ramas simétricas al mismo tiempo, ninguna cuadrática es inyectiva en todo ℝ; para poder invertirla con una raíz cuadrada tenés que elegir una sola de sus dos ramas a partir de xᵥ.'
    ),
  ],

  'sec8-base': [
    balloon(
      'empatia',
      'Caminar de izquierda a derecha',
      'Si todavía te marea decidir cuándo una curva crece y cuándo decrece, imaginá una persona chiquita caminando sobre el dibujo de la parábola avanzando siempre de izquierda a derecha, desde −∞ hacia +∞.'
    ),
    balloon(
      'base',
      'Subiendo la colina',
      'Tomemos f(x) = −(x + 3)² + 1, que tiene su cumbre máxima en el vértice (−3; 1). Mientras nuestro caminante avanza desde la izquierda hasta el kilómetro x = −3 del piso, va subiendo la colina: por eso crece en (−∞; −3).'
    ),
    balloon(
      'evaluando',
      'Bajando del otro lado',
      'Apenas pasa el kilómetro x = −3 hacia la derecha, empieza a bajar la pendiente rumbo a +∞: por eso decrece en (−3; +∞). Fijate que el número 1 de la altura no participó en ninguno de los dos intervalos.'
    ),
    balloon(
      'explicando',
      'Arriba o abajo del nivel del mar',
      '¿Y para positividad C⁺ y negatividad C⁻? Pintá el eje X como si fuera el nivel del mar: los tramos del eje X donde la curva vuela por encima del agua son C⁺, y los tramos donde la curva se hunde bajo el agua son C⁻.'
    ),
    balloon(
      'feliz',
      'Probá los cuatro lentes',
      'Activá uno por uno los cuatro lentes de Rayos X del pizarrón para ver cómo se ilumina el eje Y en la imagen y el eje X en la monotonía y los signos.'
    ),
  ],

  'sec9-interseccion': [
    balloon(
      'base',
      'Láser contra parábola',
      '¿Qué pasa cuando en el mismo plano cartesiano conviven una parábola f(x) = ax² + bx + c y una recta g(x) = mx + d? Buscar sus puntos de encuentro es preguntar en qué coordenadas x ambas fórmulas dan exactamente la misma altura y.'
    ),
    balloon(
      'explicando',
      'La ecuación diferencia',
      'Planteamos la igualdad ax² + bx + c = mx + d y pasamos los términos de la recta restando al primer miembro para dejar un cero a la derecha: nos queda una nueva ecuación cuadrática limpia, ax² + (b − m)x + (c − d) = 0.'
    ),
    balloon(
      'lentes-brillo',
      'Secante, tangente o exterior',
      'A esa cuadrática resta le calculamos su propio discriminante de intersección Δ_int = (b − m)² − 4a(c − d), que clasifica el choque sin necesidad de graficar: si Δ_int > 0 la recta atraviesa en 2 puntos y es secante; si Δ_int < 0 pasa de largo y es exterior.'
    ),
    balloon(
      'eureka',
      'Condición exacta de tangencia',
      'El caso estrella de examen es cuando Δ_int = 0: las dos soluciones se funden en un único punto de contacto y la recta resulta ser tangente a la parábola, rozándola suavemente sin cruzar al otro lado.'
    ),
    balloon(
      'orgullosa',
      'Plan maestro para parámetros',
      'Por eso, cada vez que un enunciado te pida hallar el valor de un parámetro k para que una recta sea tangente a una parábola, tu plan maestro es igualar ambas ecuaciones, pasar todo a un lado y exigir que Δ_int valga cero.'
    ),
  ],

  'sec9-base': [
    balloon(
      'empatia',
      'No entregues a mitad de camino',
      'Hay un detalle en los sistemas parábola-recta donde muchos entregan el ejercicio a mitad de camino pensando que ya terminaron. Vamos a asegurarnos de que vos remates el problema completo.'
    ),
    balloon(
      'base',
      'Primero salen las x',
      'Cuando resolvés la ecuación cuadrática igualada ax² + (b − m)x + (c − d) = 0, lo que obtenés son únicamente las coordenadas horizontales x de los puntos donde se cruzan.'
    ),
    balloon(
      'evaluando',
      'Falta la coordenada y',
      'Pero un punto del plano tiene dos coordenadas (x; y). Una vez que encontraste, digamos, x₁ = −1 y x₂ = 2, tenés que calcular la altura y de cada uno reemplazando esas x en cualquiera de las dos funciones originales.'
    ),
    balloon(
      'explicando',
      'Doble verificación rápida',
      'Consejo de amiga: reemplazá en la ecuación de la recta y = mx + d, que es una cuenta muchísimo más rápida que elevar al cuadrado en la parábola, y después verificá en la parábola para quedarte cien por ciento tranquilo de que dan la misma altura.'
    ),
    balloon(
      'complice',
      'Mirá las dos vistas',
      'Probá inclinar la recta en la vista superior del simulador y mirá cómo en la vista inferior las raíces de la función resta coinciden verticalmente con los puntos de choque.'
    ),
  ],

  /* ========================================================================
   * CAPÍTULO 4 · OPTIMIZACIÓN EN CONTEXTO Y ENTRENADOR CONTRASTIVO
   * ======================================================================== */
  'sec10-optimizacion': [
    balloon(
      'base',
      'El vértice en el mundo real',
      'En el mundo real nadie entra a un taller o a un laboratorio preguntando "disculpe, ¿me calcula el vértice?". Te preguntan qué medida hace máxima el área de un cerco, qué altura tope alcanza un proyectil o qué corte minimiza el desperdicio de material.'
    ),
    balloon(
      'evaluando',
      'Detectar el modelo cuadrático',
      'Apenas traducís el enunciado a una fórmula y ves que la variable aparece elevada al cuadrado, ya ganaste la mitad de la batalla: el gráfico es una parábola y su máximo o mínimo vive en el vértice (xᵥ; yᵥ).'
    ),
    balloon(
      'explicando',
      'El misterio del cuadrado inscrito',
      'Mirá el desafío clásico del cuadrado inscrito dentro de otro cuadrado de 16 cm de lado: al marcar un corte de longitud x en cada esquina, quedan cuatro triángulos rectángulos iguales cuyos catetos miden x y 16 − x.'
    ),
    balloon(
      'lentes-brillo',
      'Pitágoras construye la parábola',
      'Por el Teorema de Pitágoras, el lado al cuadrado de la figura interior —que es directamente su área S(x)— vale x² + (16 − x)² = 2x² − 32x + 256. Como a = 2 > 0, la parábola abre hacia arriba y en xᵥ = 8 cm alcanza su área mínima de 128 cm².'
    ),
    balloon(
      'sospecha',
      'Dominio físico vs. matemático',
      'Y no te olvides nunca de declarar el dominio físico: mientras que la fórmula algebraica acepta cualquier número real, un corte sobre un lado de 16 cm solo tiene sentido geométrico dentro del intervalo cerrado [0; 16], en cuyos bordes el área es máxima.'
    ),
  ],

  'sec10-base': [
    balloon(
      'empatia',
      'Repaso de Pitágoras desde cero',
      'Antes de meternos con fórmulas de optimización geométrica, repasemos desde cero qué dice el Teorema de Pitágoras y por qué encaja tan limpio con las funciones cuadráticas.'
    ),
    balloon(
      'base',
      'Catetos e hipotenusa',
      'En cualquier triángulo rectángulo —esos que tienen una esquina en escuadra de noventa grados—, los dos lados que forman la esquina recta se llaman catetos y el lado inclinado más largo que los une se llama hipotenusa.'
    ),
    balloon(
      'explicando',
      'El área es la hipotenusa al cuadrado',
      'Pitágoras demostró que el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los dos catetos: L² = cateto₁² + cateto₂². Y como el área de un cuadrado de lado L es justamente L², ¡ni siquiera necesitás pasar la raíz cuadrada!'
    ),
    balloon(
      'evaluando',
      'Sumando los dos cuadrados',
      'En nuestro cuadrado de 16 cm, un cateto mide x y el pedazo restante de borde mide 16 − x. Al sumar x² + (16 − x)² y desarrollar el binomio como x² + 256 − 32x + x², nace el modelo cuadrático 2x² − 32x + 256.'
    ),
    balloon(
      'eureka',
      'Girando el cuadrado interior',
      'Arrastrá el punto de corte sobre el cuadrado en el pizarrón para ver cómo el cuadrado interior gira y se encoge hasta la mitad exacta del área cuando x pasa por el punto medio.'
    ),
  ],
};

export const SCRIPTS = VN_SCRIPTS;

export const DIAGNOSE_REACTIONS = {
  inverted_vertex_h_sign: balloon(
    'sospecha',
    'Signo invertido en xᵥ',
    '¡Caíste en el espejismo del signo dentro del paréntesis! En la forma canónica a(x − xᵥ)² + yᵥ, preguntate qué valor de x hace que adentro del paréntesis quede cero: el signo de xᵥ siempre es el opuesto al que ves escrito al lado de la x.'
  ),
  confused_c_with_canonical_k: balloon(
    'lentes-brillo',
    'yᵥ no es la ordenada al origen',
    '¡Alto ahí! El número suelto afuera de la forma canónica es la altura del vértice yᵥ, no la ordenada al origen. Para encontrar dónde corta al eje Y tenés que evaluar f(0) y desarrollar el paréntesis al cuadrado.'
  ),
  distributed_square_over_sum: balloon(
    'colapso',
    'El cuadrado no se distribuye',
    '¡No distribuyas el cuadrado en una suma o resta! En el modelo de área vimos que (a ± b)² tiene cuatro parcelas: además de a² y b², están los dos rectángulos cruzados que forman el doble producto ±2ab.'
  ),
  divided_by_x_lost_zero_root: balloon(
    'enojada',
    'Prohibido tachar la x',
    '¡Prohibido tachar la x! Cuando dividís ambos lados por x en una cuadrática incompleta, estás matando la solución x = 0. Sacá siempre factor común x para mantener vivas las dos raíces.'
  ),
  omitted_plus_minus_in_square_root: balloon(
    'evaluando',
    'Falta la rama simétrica ±',
    'Te comiste la rama simétrica del otro lado del eje. Recordá que al aplicar raíz cuadrada a un cuadrado perfecto aparece el módulo: √((x − xᵥ)²) = |x − xᵥ|, lo que abre dos caminos con ±.'
  ),
  forgot_leading_a_in_factored_form: balloon(
    'pensativa',
    'Falta el coeficiente principal a',
    'Ubicaste bien las raíces en (x − x₁)(x − x₂), pero te faltó multiplicar adelante por el coeficiente principal "a". Usá el punto de paso adicional para despejar cuánto vale ese factor de escala.'
  ),
  unbalanced_completing_square: balloon(
    'sospecha',
    'Balanza descompensada',
    'Al completar el cuadrado tenés que mantener la balanza en equilibrio: lo que sumás para cerrar el trinomio también tenés que restarlo, y si hay un factor "a" afuera del corchete, multiplica al término que sale.'
  ),
  neg_b_or_square_sign_in_resolvente: balloon(
    'colapso',
    'Signos en la resolvente',
    '¡Cuidado con los signos en la resolvente cuando b es negativo! Adelante, −b cambia a positivo; y adentro de la raíz, (−b)² encerrado entre paréntesis da siempre positivo.'
  ),
  used_yv_for_monotonicity_or_open_image: balloon(
    'lentes-brillo',
    'Eje X vs. Eje Y y corchete',
    'Revisá qué eje estás leyendo: crecimiento y decrecimiento se miran en el eje X quebrando en xᵥ, mientras que la Imagen se mira en el eje Y y lleva corchete cerrado en yᵥ porque el vértice pertenece a la curva.'
  ),
  confused_sum_product_signs_vieta: balloon(
    'pensativa',
    'Signo de la suma en Vieta',
    'Recordá que al expandir a(x − x₁)(x − x₂) aparece un signo menos delante de la suma de las raíces: por eso x₁ + x₂ = −b/a lleva el signo cambiado, mientras que el producto es x₁ · x₂ = c/a.'
  ),
  equivalent_form: balloon(
    'evaluando',
    'Forma equivalente en otra vestimenta',
    'Tu expresión describe exactamente la misma parábola —¡las cuentas están bien!—, pero la consigna te pide escribirla vestida en otra de las tres formas (polinómica, canónica o factorizada).'
  ),
  default: balloon(
    'pensativa',
    'Revisemos el paso',
    'Todavía no cierra la cuenta. Mirá el gráfico del pizarrón o abrí una pista progresiva para destrabar el paso intermedio sin adivinar.'
  ),
};

export const STREAK_REACTIONS = {
  3: balloon(
    'complice',
    '¡Racha de 3!',
    '¡Tres aciertos al hilo! Ya estás leyendo el vértice, las raíces y el discriminante como si tuvieras rayos X en los ojos.'
  ),
  5: balloon(
    'eureka',
    '¡Racha de 5!',
    '¡Cinco seguidas sin caer en ninguna trampa de signos! Con este dominio de las tres formas de la parábola, el parcial de Exactas te queda chico.'
  ),
};
