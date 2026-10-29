/**
 * vn-scripts.js — Los 20 guiones scripteados de Alaska:
 * - 10 guiones principales de «Explicación Profunda» (sec1-distancia .. sec10-escalon, 5-6 mensajes c/u)
 * - 10 guiones fundacionales «Repaso de Base: ¿Qué necesito saber?» (sec1-basico .. sec10-basico, 4-6 mensajes c/u)
 * - Diccionario DIAGNOSE_REACTIONS para diagnoseAbs() y colisiones de frontera.
 */

const DOT_OPEN = '<span class="va-dot va-dot--open" title="Círculo abierto"></span>';
const DOT_CLOSED = '<span class="va-dot va-dot--closed" title="Punto cerrado"></span>';
const FRAC_HALF = '<span class="fr"><span class="num">1</span><span class="den">2</span></span>';

export const VN_SCRIPTS = {
  // =========================================================================
  // SECCIÓN 1 · DISTANCIA EN 1D Y EL MITO DE "−x"
  // =========================================================================
  'sec1-distancia': [
    {
      pose: 'feliz',
      tag: '¡Bienvenida al lab!',
      html: '¡Buenas! Te doy la bienvenida al quinto laboratorio. Hoy vamos a demoler uno de los traumas más grandes del ingreso a Exactas: el valor absoluto <span class="eq">|x|</span>. Olvidate de esa frase escolar de «el módulo le borra el signo menos al número». Eso sirve para números sueltos, pero cuando aparece una letra <span class="eq">x</span> te destruye el cerebro.',
    },
    {
      pose: 'base',
      tag: 'Distancia geométrica',
      html: 'En la universidad, <span class="eq">|x|</span> se define geométricamente como la <strong>distancia desde el punto x hasta el origen 0</strong> en la recta real. Y cuando escribimos <span class="eq">|x − h|</span>, estamos midiendo la distancia entre tu posición <span class="eq">x</span> y un centro fijo <span class="eq">h</span>. Como una cinta métrica nunca mide distancias negativas, <span class="eq">|x − h| ≥ 0</span> siempre.',
    },
    {
      pose: 'colapso',
      tag: 'El cortocircuito de «−x»',
      html: 'Acá viene el bloqueo mortal: cuando ven la llave formal <span class="eq">|x| = −x si x &lt; 0</span>, ¡entran en pánico y gritan «¿cómo va a dar −x si el módulo nunca es negativo?»! ¡Respirá hondo! Si <span class="eq">x = −4</span>, la letra <span class="eq">x</span> ya guarda un signo menos adentro de su caja.',
    },
    {
      pose: 'orgullosa',
      tag: 'La Máquina Inversora',
      html: 'Ese signo menos que escribimos delante en <span class="eq">−x</span> NO es un cartel de «número negativo»: es una <strong>máquina inversora de signo</strong> (multiplicar por <span class="eq">−1</span>). Cuando entra <span class="eq">x = −4</span>, la máquina hace <span class="eq">−x = −(−4) = +4 &gt; 0</span>. ¡El menos de afuera mata al menos que estaba escondido adentro de <span class="eq">x</span>!',
    },
    {
      pose: 'base',
      tag: 'Simetría en ecuaciones',
      html: 'Por eso la ecuación <span class="eq">|x − 2| = 4</span> no se resuelve adivinando: pregunta literalmente <em>«¿qué puntos de la recta están a 4 pasos del centro 2?»</em>. Caminás 4 a la derecha (<span class="eq">2 + 4 = 6</span>) y 4 a la izquierda (<span class="eq">2 − 4 = −2</span>). ¡Dos soluciones simétricas sin hacer magia!',
    },
  ],

  'sec1-basico': [
    {
      pose: 'base',
      tag: 'Base 1 · La recta real',
      html: 'Si hace mucho que no operás con negativos en la recta numérica, repasemos desde cero. Imaginá el <span class="eq">0</span> en el centro: hacia la derecha viven los positivos (<span class="eq">+1, +2, +3…</span>) y hacia la izquierda los negativos (<span class="eq">−1, −2, −3…</span>).',
    },
    {
      pose: 'feliz',
      tag: 'Base 1 · Restar es medir el viaje',
      html: 'Cuando hacés la resta <span class="eq">x − h</span>, estás midiendo el desplazamiento con signo desde <span class="eq">h</span> hasta <span class="eq">x</span>. Si estás en <span class="eq">x = 7</span> y el centro es <span class="eq">h = 2</span>, <span class="eq">7 − 2 = +5</span> (5 pasos a la derecha). Pero si estás en <span class="eq">x = −3</span> y el centro es <span class="eq">h = 2</span>, <span class="eq">(−3) − 2 = −5</span> (5 pasos a la izquierda).',
    },
    {
      pose: 'base',
      tag: 'Base 1 · ¿Qué significa el menos adelante?',
      html: 'En álgebra, poner un signo <span class="eq">−</span> delante de un paréntesis o de una letra significa <strong>tomar su opuesto</strong> (espejarlo respecto al cero). El opuesto de <span class="eq">+5</span> es <span class="eq">−(+5) = −5</span>, y el opuesto de <span class="eq">−5</span> es <span class="eq">−(−5) = +5</span>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Base 1 · Regla de signos clara',
      html: 'Así que cada vez que leas <span class="eq">−u</span> en matemática universitaria, no leas «menos u es negativo»: leé <strong>«el opuesto de u»</strong>. Si <span class="eq">u</span> era negativo, su opuesto <span class="eq">−u</span> es 100% positivo. ¡Probá la Máquina Inversora del widget para verlo en vivo!',
    },
  ],

  'sec1-duda-distancia': [
    {
      pose: 'colapso',
      tag: 'El dilema de |x + 2| = 6',
      html: '¡Te entiendo tanto! Ves una ecuación como <span class="eq">|x + 2| = 6</span> y tu cabeza entra en cortocircuito: <em>«¡Pará! Si la fórmula de la distancia tiene una resta <span class="eq">|x − h|</span>, ¿de dónde salió ese signo más? ¿Y por qué al despejar el 6 no pasa como negativo?»</em>. No te preocupes: es la traba clásica del ingreso. Vamos a desarmarla con lupa paso por paso.',
    },
    {
      pose: 'base',
      tag: 'Paso 1 · El molde de la resta',
      html: 'En geometría, la distancia entre dos posiciones <span class="eq">A</span> y <span class="eq">B</span> en la recta se define siempre con una resta: <span class="eq">|A − B|</span>. Para ver el ancla real, tenés que forzar esa resta. ¿Cómo convertís un <span class="eq">+2</span> en resta? Por regla de signos, <span class="eq">+2 = −(−2)</span>. Por eso <span class="eq">|x + 2|</span> se reescribe como <span class="eq">|x − (−2)|</span>. ¡El ancla o centro NO es 2, sino <span class="eq">h = −2</span>!',
    },
    {
      pose: 'orgullosa',
      tag: 'Paso 2 · El truco ninja del cero',
      html: 'Si no te querés acordar de memoria de «cambiarle el signo a <span class="eq">h</span>», te regalo el truco que uso yo: <strong>preguntale al interior de las barras qué número lo anula</strong>. Hacé la cuenta mental: <span class="eq">x + 2 = 0 ⟹ x = −2</span>. ¡Listo! El número que apaga lo de adentro a cero es siempre tu ancla física en la recta.',
    },
    {
      pose: 'base',
      tag: 'Paso 3 · La distancia se desdobla',
      html: 'Ahora la duda mortal del despeje: <em>¿por qué la distancia 6 no pasa negativa?</em> ¡Porque el 6 NUNCA cambia de miembro! El 6 es una distancia fijada. Lo que hace el valor absoluto al abrirse es abrir dos caminos físicos posibles: podés estar 6 pasos a la derecha o 6 pasos a la izquierda. O sea: <strong>Camino 1:</strong> <span class="eq">x + 2 = +6</span> y <strong>Camino 2:</strong> <span class="eq">x + 2 = −6</span> (compacto: <span class="eq">x + 2 = ±6</span>).',
    },
    {
      pose: 'feliz',
      tag: 'Paso 4 · El despeje limpio',
      html: 'El único número que «pasa» (se traslada de miembro) es el <span class="eq">+2</span> que acompañaba a la <span class="eq">x</span>, que pasa restando como <span class="eq">−2</span> a ambos lados: <span class="eq">x = −2 ± 6</span>. Caminando hacia la izquierda: <span class="eq">x₁ = −2 − 6 = −8</span>. Caminando hacia la derecha: <span class="eq">x₂ = −2 + 6 = 4</span>. Ordenadas de menor a mayor: <span class="eq">x₁ = −8</span> y <span class="eq">x₂ = 4</span>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Paso 5 · Verificación de examen',
      html: 'Para tener 100% de seguridad en un examen, probá ambos números en la ecuación original: con <span class="eq">x = −8</span> tenés <span class="eq">|(−8) + 2| = |−6| = 6</span>. ¡Dio 6! Y con <span class="eq">x = 4</span> tenés <span class="eq">|4 + 2| = |6| = 6</span>. ¡Dio 6 de nuevo! La distancia desde el ancla <span class="eq">−2</span> hasta ambos puntos es de exactamente 6 unidades. ¡Ahora andá al chequeo de comprensión y resolvelo con total seguridad!',
    },
  ],

  // =========================================================================
  // SECCIÓN 2 · EL ESPEJO DEL EJE X (y = |x|)
  // =========================================================================
  'sec2-espejo': [
    {
      pose: 'base',
      tag: 'El espejo tectónico',
      html: '¿Por qué la gráfica de <span class="eq">y = |x|</span> tiene forma de «V» corta con un pico filoso en el origen en lugar de ser una curva suave? Pensá primero en la recta identidad <span class="eq">y = x</span>: una rampa a <span class="eq">45°</span> que pasa por <span class="eq">(−2; −2), (0; 0), (2; 2)</span>.',
    },
    {
      pose: 'colapso',
      tag: 'Prohibido bajar bajo tierra',
      html: 'Para los <span class="eq">x</span> negativos, la recta <span class="eq">y = x</span> se hunde bajo tierra en el semiplano inferior (<span class="eq">y &lt; 0</span>). ¡Pero el valor absoluto tiene prohibido devolver alturas negativas! Ningún punto de <span class="eq">y = |x|</span> puede vivir debajo del eje X.',
    },
    {
      pose: 'orgullosa',
      tag: 'Rebote simétrico',
      html: 'Ponerle las barras <span class="eq">|x|</span> equivale físicamente a apoyar un <strong>espejo horizontal sobre el eje X</strong>. Todo lo que estaba arriba (<span class="eq">x ≥ 0</span>) queda intacto como la semirrecta <span class="eq">y = x</span> de pendiente <span class="eq">+1</span>, pero el tramo subterráneo (<span class="eq">x &lt; 0</span>) rebota hacia arriba como la semirrecta <span class="eq">y = −x</span> de pendiente <span class="eq">−1</span>.',
    },
    {
      pose: 'base',
      tag: 'El nacimiento del vértice',
      html: 'En <span class="eq">x = 0</span> la pendiente cambia de golpe de <span class="eq">−1</span> (bajando) a <span class="eq">+1</span> (subiendo). Ese cambio abrupto de dirección forma el <strong>vértice en punta V(0; 0)</strong>.',
    },
    {
      pose: 'feliz',
      tag: 'Simetría par perfecta',
      html: 'Además, como <span class="eq">|−x| = |x|</span>, el eje Y (<span class="eq">x = 0</span>) funciona como espejo vertical entre las dos ramas: cada punto <span class="eq">(x; |x|)</span> tiene su gemelo a la misma altura en <span class="eq">(−x; |x|)</span>. ¡Arrastrá el punto verde sobre el gráfico para ver el rebote y su gemelo!',
    },
  ],

  'sec2-basico': [
    {
      pose: 'base',
      tag: 'Base 2 · El plano cartesiano',
      html: 'Repasemos cómo funciona el mapa cartesiano: todo punto se escribe como un par ordenado <span class="eq">(x; y)</span>. La primera coordenada <span class="eq">x</span> te dice cuánto caminás en horizontal (izquierda o derecha), y la segunda coordenada <span class="eq">y</span> te dice a qué <strong>altura vertical</strong> subís o bajás.',
    },
    {
      pose: 'feliz',
      tag: 'Base 2 · Arriba vs. bajo tierra',
      html: 'El eje horizontal X es el «nivel del suelo» (<span class="eq">y = 0</span>). Todos los puntos con <span class="eq">y &gt; 0</span> están en el aire (semiplano superior verde en el gráfico), y todos los puntos con <span class="eq">y &lt; 0</span> están bajo tierra (semiplano inferior rosa).',
    },
    {
      pose: 'base',
      tag: 'Base 2 · La recta identidad y = x',
      html: 'La función más simple del universo es <span class="eq">y = x</span>: la altura <span class="eq">y</span> copia exactamente el valor de <span class="eq">x</span>. En <span class="eq">x = 3</span> vale <span class="eq">y = 3</span>; en <span class="eq">x = 0</span> vale <span class="eq">0</span>; y en <span class="eq">x = −3</span> vale <span class="eq">y = −3</span> (3 pisos bajo tierra).',
    },
    {
      pose: 'orgullosa',
      tag: 'Base 2 · El efecto del espejo',
      html: 'Cuando aplicamos valor absoluto <span class="eq">y = |x|</span>, el punto <span class="eq">(−3; −3)</span> que estaba 3 pisos bajo tierra se refleja verticalmente hasta <span class="eq">(−3; +3)</span> (3 pisos hacia arriba). Por eso las dos mitades quedan arriba del eje X formando una «V».',
    },
  ],

  // =========================================================================
  // SECCIÓN 3 · DESPLAZAR LA V SIN RECETAS: f(x) = |x - h| + k
  // =========================================================================
  'sec3-vertice': [
    {
      pose: 'enojada',
      tag: '¡Basta de recetas ciegas!',
      html: '¡Prohibido repetir como un loro «el número de adentro va con el signo cambiado y el de afuera con el mismo signo»! Por memorizar esa frase sin entenderla, después en el parcial les ponen <span class="eq">f(x) = |x + 3| − 2</span>, dudan en pleno nervio y marcan el vértice en <span class="eq">(3; −2)</span>.',
    },
    {
      pose: 'base',
      tag: 'El punto de distancia cero',
      html: 'El antídoto definitivo es pensarlo físicamente: el pico o vértice de la «V» ocurre siempre en el único lugar donde <strong>la distancia dentro de las barras se hace CERO</strong>. Preguntate siempre: <em>«¿Qué valor de x hace que lo de adentro valga 0?»</em>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Despejando el interior',
      html: 'En <span class="eq">f(x) = |x − 4| − 2</span>, planteás mentalmente <span class="eq">x − 4 = 0 ⟹ x = 4</span>. En cambio, en <span class="eq">g(x) = |x + 3| − 2</span>, planteás <span class="eq">x + 3 = 0 ⟹ x = −3</span>. ¡No es magia ni signo invertido caprichoso: es buscar dónde la cinta métrica marca distancia cero!',
    },
    {
      pose: 'feliz',
      tag: '¿Y de dónde sale k?',
      html: 'Una vez que encontraste la coordenada horizontal del vértice (<span class="eq">x = h</span>), la sustituís en la función. Como en <span class="eq">x = h</span> las barras valen <span class="eq">|0| = 0</span> (el neutro de la suma), todo el bloque de las barras desaparece y queda <span class="eq">f(h) = 0 + k = k</span>.',
    },
    {
      pose: 'base',
      tag: 'Eje de simetría móvil',
      html: 'Al trasladar el vértice a <span class="eq">V(h; k)</span>, el espejo vertical se muda con él: el nuevo <strong>eje de simetría</strong> es la recta vertical <span class="eq">x = h</span>. Tocá cada parte de la fórmula anotada para ver qué controla cada número.',
    },
  ],

  'sec3-basico': [
    {
      pose: 'base',
      tag: 'Base 3 · ¿Qué significa anular un bloque?',
      html: 'En matemática, «anular» una expresión significa encontrar para qué valor de <span class="eq">x</span> esa cuenta da exactamente <span class="eq">0</span>. Por ejemplo, si tenés la resta <span class="eq">x − 5</span>, ¿qué número le tenés que poner a <span class="eq">x</span> para que <span class="eq">x − 5</span> dé <span class="eq">0</span>? Claro: <span class="eq">x = 5</span>, porque <span class="eq">5 − 5 = 0</span>.',
    },
    {
      pose: 'feliz',
      tag: 'Base 3 · ¿Y si adentro hay una suma?',
      html: 'Si adentro de las barras dice <span class="eq">|x + 3|</span>, buscamos qué número sumado a <span class="eq">3</span> da <span class="eq">0</span>. Si ponés <span class="eq">x = 3</span>, te da <span class="eq">3 + 3 = 6</span> (¡no dio cero!). Para cancelar un <span class="eq">+3</span> necesitás su opuesto: <span class="eq">x = −3</span>, porque <span class="eq">(−3) + 3 = 0</span>.',
    },
    {
      pose: 'base',
      tag: 'Base 3 · El 0 como neutro aditivo',
      html: '¿Por qué nos importa tanto el momento en que las barras valen <span class="eq">0</span>? Porque en cualquier función <span class="eq">f(x) = |x − h| + k</span>, el término <span class="eq">|x − h|</span> siempre es mayor o igual que <span class="eq">0</span>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Base 3 · El punto más bajo de la V',
      html: 'Como <span class="eq">|x − h|</span> nunca puede ser negativo, el valor más chico posible que pueden aportar las barras es <span class="eq">0</span>. Justo en ese instante (<span class="eq">x = h</span>), la cuenta total da <span class="eq">0 + k = k</span>, marcando el fondo exacto del vértice <span class="eq">(h; k)</span>.',
    },
  ],

  'sec3-que-es-vertice': [
    {
      pose: 'feliz',
      tag: '¿Qué es un vértice?',
      html: '¡Qué buena pregunta! En matemática los profes suelen decir: <em>«Bueno, acá está el vértice V(h, k) y se mueve a la derecha…»</em> ¡y nadie se frena a explicar qué cuernos es un vértice! Empecemos desde cero total: la palabra <strong>vértice</strong> viene del latín y significa «giro» o «punta». Es exactamente la esquina o el pico donde dos caminos rectos se encuentran.',
    },
    {
      pose: 'base',
      tag: 'El choque de dos rectas',
      html: 'Pensalo así: si dibujás una recta común, sigue de largo para siempre sin doblar nunca. Pero una función con valor absoluto no es una sola recta: ¡son <strong>dos semirrectas distintas pegadas</strong>! Una rama viene bajando desde la izquierda y otra sale subiendo hacia la derecha. El punto exacto donde se dan la mano y quiebran en punta es el <strong>vértice</strong>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Físicamente: distancia cero',
      html: '¿Por qué se produce ese quiebre justo ahí? Porque el módulo mide distancia a un ancla <span class="eq">h</span>. A medida que te acercás a <span class="eq">h</span>, la distancia se va achicando: <span class="eq">3, 2, 1…</span> hasta que tocás el ancla (<span class="eq">x = h</span>) y la distancia llega a su piso absoluto: <strong style="color:var(--green)">|0| = 0</strong>. ¡Menos de cero no puede dar! Al pasar de largo, la distancia vuelve a crecer. El vértice es el <strong>punto de distancia cero</strong>.',
    },
    {
      pose: 'base',
      tag: 'Las coordenadas V(h, k)',
      html: 'Ese punto necesita dos datos para ubicarse en el mapa cartesiano, como una coordenada GPS: <span class="eq">V(h; k)</span>.<br>• La primera es <span class="eq">h</span> (en el eje X horizontal): te dice en qué número se apagan las barras a cero (<span class="eq">x − h = 0</span>).<br>• La segunda es <span class="eq">k</span> (en el eje Y vertical): te dice a qué altura queda el pico cuando las barras valen cero (<span class="eq">f(h) = 0 + k = k</span>).',
    },
    {
      pose: 'colapso',
      tag: '¿Piso o techo?',
      html: 'Si la «V» apunta hacia arriba (como una copa, cuando <span class="eq">a &gt; 0</span>), el vértice es el <strong>piso o mínimo absoluto</strong>: la función nunca va a bajar más de <span class="eq">k</span>. Pero si la «V» está invertida hacia abajo (como un techo, cuando <span class="eq">a &lt; 0</span>), el vértice es el <strong>techo o máximo absoluto</strong>: jamás subirá más arriba de <span class="eq">k</span>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Nivel Exactas: punto anguloso',
      html: 'Y un secreto universitario para cuando curses Análisis I: a este pico se lo llama <strong>punto anguloso</strong>. A diferencia de una parábola suave, acá hay un quiebre filoso: la pendiente pasa de golpe de bajar a subir sin ninguna transición redonda. ¡Por eso en el vértice no existe derivada! Ahora que sabés qué es, ¡arrastralo por toda la pizarra!',
    },
  ],

  // =========================================================================
  // SECCIÓN 4 · ESCALAR Y REFLEJAR: EL FACTOR a
  // =========================================================================
  'sec4-escalado': [
    {
      pose: 'base',
      tag: 'El control de apertura a',
      html: `En <span class="eq">f(x) = a|x|</span>, el coeficiente externo <span class="eq">a</span> controla qué tan cerradas o abiertas están las ramas y hacia dónde apunta la «V». Geométricamente, <span class="eq">a</span> es la <strong>pendiente exacta de la rama derecha</strong> (y <span class="eq">−a</span> es la pendiente de la rama izquierda).`,
    },
    {
      pose: 'feliz',
      tag: 'Láser angosto vs. paraguas ancho',
      html: `Si <span class="eq">|a| &gt; 1</span> (por ejemplo <span class="eq">a = 3</span>), por cada paso horizontal que avanzás desde el vértice, la altura salta <span class="eq">3</span> unidades: la «V» se estira verticalmente y parece un láser cerrado. En cambio, si <span class="eq">0 &lt; |a| &lt; 1</span> (como <span class="eq">a = ${FRAC_HALF}</span>), por cada paso horizontal solo sube medio paso: la «V» se abre ancha como un paraguas.`,
    },
    {
      pose: 'colapso',
      tag: 'Menos afuera vs. Menos adentro',
      html: '¡Cuidado con la trampa favorita de los parciales! No confundas un signo menos <strong>afuera</strong> de las barras (<span class="eq">−|x|</span>) con un signo menos <strong>adentro</strong> de las barras (<span class="eq">|−x|</span>). Parecen iguales de lejos, pero hacen cosas completamente opuestas.',
    },
    {
      pose: 'orgullosa',
      tag: 'Por qué |−x| no invierte la V',
      html: 'Adentro de las barras, <span class="eq">|−x| = |−1| · |x| = 1 · |x| = |x|</span>. Las barras se tragan el signo menos interno y la gráfica sigue abriendo hacia arriba (<span class="eq">V</span>). En cambio, en <span class="eq">−|x|</span> el signo menos espera afuera y multiplica por <span class="eq">−1</span> todas las alturas finales, reflejando la gráfica hacia abajo como un techo <span class="eq">Λ</span>.',
    },
    {
      pose: 'base',
      tag: 'De mínimo a máximo',
      html: 'Cuando <span class="eq">a &gt; 0</span>, el vértice es el <strong>mínimo absoluto</strong> (el piso de la función). Cuando <span class="eq">a &lt; 0</span>, la «V» queda invertida (<span class="eq">Λ</span>) y el vértice pasa a ser el <strong>máximo absoluto</strong> (la cumbre más alta).',
    },
  ],

  'sec4-basico': [
    {
      pose: 'base',
      tag: 'Base 4 · ¿Qué es la pendiente?',
      html: 'La <strong>pendiente</strong> <span class="eq">m</span> de una recta mide su inclinación: cuánto subís o bajás en vertical (<span class="eq">Δy</span>) por cada <span class="eq">1</span> unidad que caminás hacia la derecha en horizontal (<span class="eq">Δx = 1</span>). Es decir: <span class="eq">m = <span class="fr"><span class="num">Δy</span><span class="den">Δx</span></span></span>.',
    },
    {
      pose: 'feliz',
      tag: 'Base 4 · Pendiente positiva vs. negativa',
      html: 'Mirando siempre el gráfico de izquierda a derecha: si al avanzar <span class="eq">1</span> paso a la derecha la recta sube <span class="eq">2</span> unidades, tiene pendiente <span class="eq">m = +2</span>. Si al avanzar <span class="eq">1</span> paso a la derecha la recta baja <span class="eq">2</span> unidades, tiene pendiente <span class="eq">m = −2</span>.',
    },
    {
      pose: 'base',
      tag: 'Base 4 · Multiplicar por fracciones',
      html: `¿Por qué multiplicar por <span class="eq">${FRAC_HALF}</span> achata el gráfico? Porque <span class="eq">${FRAC_HALF} = 0,5</span> reduce todas las alturas a la mitad: donde antes había altura <span class="eq">4</span>, ahora queda <span class="eq">${FRAC_HALF} · 4 = 2</span>.`,
    },
    {
      pose: 'orgullosa',
      tag: 'Base 4 · Las dos pendientes de la V',
      html: 'Una función de valor absoluto no tiene una sola pendiente, sino dos pendientes simétricas que se chocan en el vértice: a la derecha del vértice tiene pendiente <span class="eq">+a</span> y a la izquierda tiene pendiente opuesta <span class="eq">−a</span>.',
    },
  ],

  // =========================================================================
  // SECCIÓN 5 · EL LABORATORIO MAESTRO: f(x) = a|x - h| + k
  // =========================================================================
  'sec5-lab': [
    {
      pose: 'feliz',
      tag: 'Graficar con las manos en 2 pasos',
      html: 'Para graficar cualquier función canónica <span class="eq">f(x) = a|x − h| + k</span> en hoja cuadriculada no necesitás hacer una tabla gigante de valores. Te alcanzan exactamente <strong>dos pasos geométricos</strong>.',
    },
    {
      pose: 'base',
      tag: 'Paso 1 · Anclar el vértice',
      html: '<strong>Paso 1:</strong> Mirás qué valor de <span class="eq">x</span> anula el interior de las barras (<span class="eq">x = h</span>) y leés la altura externa (<span class="eq">y = k</span>). Marcás el punto <span class="eq">V(h; k)</span> y punteás la línea vertical de simetría <span class="eq">x = h</span>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Paso 2 · El triángulo de pendiente',
      html: '<strong>Paso 2:</strong> Desde el vértice <span class="eq">(h; k)</span> caminás <span class="eq">1</span> unidad a la derecha hasta <span class="eq">x = h + 1</span> y te movés verticalmente <span class="eq">a</span> unidades hasta <span class="eq">(h + 1; k + a)</span>. Por simetría, a <span class="eq">1</span> unidad a la izquierda tenés el punto gemelo <span class="eq">(h − 1; k + a)</span>. ¡Trazás las dos semirrectas y terminaste!',
    },
    {
      pose: 'base',
      tag: 'El problema inverso de examen',
      html: '¿Y si en el parcial te dan el dibujo de la «V» y te piden escribir su fórmula? Hacés el camino inverso: primero leés las coordenadas de la punta <span class="eq">(h; k)</span> y ya armás el esqueleto <span class="eq">f(x) = a|x − h| + k</span>.',
    },
    {
      pose: 'feliz',
      tag: 'Hallar a sin equivocarse',
      html: 'Después elegís cualquier punto claro <span class="eq">(x₁; y₁)</span> de la rama derecha y calculás la pendiente <span class="eq">a = <span class="fr"><span class="num">y₁ − k</span><span class="den">x₁ − h</span></span></span> (o sustituís el punto en la ecuación y despejás <span class="eq">a</span>). ¡Entrenalo con las 6 Gráficas Misteriosas del Modo 2!',
    },
  ],

  'sec5-basico': [
    {
      pose: 'base',
      tag: 'Base 5 · Orden de operaciones',
      html: 'Cuando tenés que calcular a mano cuánto vale <span class="eq">f(x) = −2|x − 1| + 3</span> para un número como <span class="eq">x = 4</span>, el error más común es mezclar el orden de las cuentas (por ejemplo, intentar sumar <span class="eq">−2 + 3</span> antes de tiempo).',
    },
    {
      pose: 'enojada',
      tag: 'Base 5 · Las barras son como paréntesis blindados',
      html: 'Las barras de valor absoluto actúan como un paréntesis con prioridad máxima. El orden obligatorio de cálculo tiene <strong>4 escalones</strong>:',
    },
    {
      pose: 'base',
      tag: 'Base 5 · Los 4 escalones',
      html: '<strong>1° Adentro de las barras:</strong> <span class="eq">4 − 1 = 3</span>.<br><strong>2° Aplicar valor absoluto:</strong> <span class="eq">|3| = 3</span>.<br><strong>3° Multiplicar por a afuera:</strong> <span class="eq">−2 · 3 = −6</span>.<br><strong>4° Sumar o restar k al final:</strong> <span class="eq">−6 + 3 = −3</span>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Base 5 · Verificación instantánea',
      html: 'Respetando siempre ese orden (1° interior, 2° barras, 3° producto por <span class="eq">a</span>, 4° suma de <span class="eq">k</span>), jamás vas a fallar al evaluar un punto ni al comprobar tu ecuación con el gráfico.',
    },
  ],

  // =========================================================================
  // SECCIÓN 6 · TODO VALOR ABSOLUTO ES UNA FUNCIÓN POR PARTES
  // =========================================================================
  'sec6-partes': [
    {
      pose: 'orgullosa',
      tag: 'Desenmascarando las barras',
      html: 'En la secundaria suelen dar «Valor Absoluto» en una unidad y «Funciones por Partes» en otra distinta. En Análisis I te revelamos el secreto: <strong>toda función de valor absoluto es una función lineal por partes</strong> escrita de forma compacta.',
    },
    {
      pose: 'base',
      tag: 'La frontera está en x = h',
      html: 'Para abrir las barras de <span class="eq">f(x) = a|x − h| + k</span> sin usar el símbolo <span class="eq">|·|</span>, primero buscamos dónde cambia de signo el interior: <span class="eq">x − h = 0 ⟹ x = h</span>. Ese punto <span class="eq">x = h</span> parte la recta real en dos zonas.',
    },
    {
      pose: 'feliz',
      tag: 'Rama derecha (x ≥ h)',
      html: 'En la <strong>Zona Derecha (<span class="eq">x ≥ h</span>)</strong>, la resta <span class="eq">x − h</span> ya es positiva o cero. Entonces las barras se sacan directamente reemplanzándolas por paréntesis normales: <span class="eq">f(x) = a(x − h) + k</span>. Distribuís <span class="eq">a</span> y te queda una recta de pendiente <span class="eq">+a</span>.',
    },
    {
      pose: 'base',
      tag: 'Rama izquierda (x < h)',
      html: 'En la <strong>Zona Izquierda (<span class="eq">x &lt; h</span>)</strong>, la resta <span class="eq">x − h</span> da negativa. Para que el módulo devuelva su opuesto positivo, reemplazamos las barras por un paréntesis con un signo menos adelante: <span class="eq">f(x) = −a(x − h) + k</span>, que al distribuir da pendiente <span class="eq">−a</span>.',
    },
    {
      pose: 'colapso',
      tag: '¡Cuidado con el factor interno |bx − c|!',
      html: 'Si adentro de las barras hay un número multiplicando a la <span class="eq">x</span>, como en <span class="eq">f(x) = |2x − 6| + 1</span>, ¡el vértice NO está en <span class="eq">6</span>! Igualás todo el interior a cero: <span class="eq">2x − 6 = 0 ⟹ x = 3</span>, o sacás factor común <span class="eq">|2(x − 3)| + 1 = |2|·|x − 3| + 1 = 2|x − 3| + 1</span>.',
    },
  ],

  'sec6-basico': [
    {
      pose: 'base',
      tag: 'Base 6 · La propiedad distributiva',
      html: 'Cuando abrimos las barras de valor absoluto nos quedan expresiones como <span class="eq">−(x − 3) + 2</span> o <span class="eq">−2(x − 3) + 1</span>. Para simplificarlas a la forma de recta <span class="eq">m·x + b</span>, usamos la <strong>propiedad distributiva</strong>.',
    },
    {
      pose: 'enojada',
      tag: 'Base 6 · El error del segundo término',
      html: 'El error clásico al hacer <span class="eq">−(x − 3)</span> es cambiarle el signo solo a la <span class="eq">x</span> y escribir <span class="eq">−x − 3</span>. ¡No! El signo menos de afuera multiplica a <strong>todos</strong> los términos de adentro del paréntesis.',
    },
    {
      pose: 'feliz',
      tag: 'Base 6 · Paso a paso con signos',
      html: 'Hagámoslo en cámara lenta para <span class="eq">−2(x − 3) + 1</span>:<br>• Primer producto: <span class="eq">(−2) · x = −2x</span>.<br>• Segundo producto: <span class="eq">(−2) · (−3) = +6</span> (menos por menos es más).<br>• Sumamos el término de afuera: <span class="eq">−2x + 6 + 1 = −2x + 7</span>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Base 6 · Verificá en la frontera',
      html: 'Un truco de oro para saber si distribuiste bien: evaluá ambas rectas (la rama izquierda y la rama derecha) en el vértice <span class="eq">x = h</span>. ¡Las dos rectas te tienen que dar exactamente la misma altura <span class="eq">y = k</span>!',
    },
  ],

  // =========================================================================
  // SECCIÓN 7 · RADIOGRAFÍA PARA EXACTAS: IMAGEN, C+, C- Y √(x²) = |x|
  // =========================================================================
  'sec7-exactas': [
    {
      pose: 'base',
      tag: 'Eje X versus Eje Y',
      html: 'En el estudio completo de funciones de Exactas hay una regla sagrada: <strong>Dominio, Crecimiento (<span class="eq">I↑</span>), Decrecimiento (<span class="eq">I↓</span>), Ceros (<span class="eq">C₀</span>), Positividad (<span class="eq">C⁺</span>) y Negatividad (<span class="eq">C⁻</span>) se leen TODOS en el Eje X</strong>. El único que se lee en el Eje Y es el <strong>Conjunto Imagen <span class="eq">Im(f)</span></strong>.',
    },
    {
      pose: 'enojada',
      tag: '¡No mezcles h con k en monotonía!',
      html: 'Si el vértice es <span class="eq">V(3; −2)</span> y abre hacia arriba, la función decrece hasta el vértice y crece después. Como el crecimiento pregunta <em>«para qué valores de x sube»</em>, corta en <span class="eq">h = 3</span>: <span class="eq">I↑ = (3; +∞)</span>. ¡Jamás pongas <span class="eq">k = −2</span> en el intervalo de crecimiento! En cambio, la Imagen sí mira las alturas en Y: <span class="eq">Im(f) = [−2; +∞)</span>.',
    },
    {
      pose: 'feliz',
      tag: 'El láser horizontal y = c',
      html: 'Activá las 4 Lentes del widget de abajo: cuando cruzás la «V» con el láser horizontal <span class="eq">y = c</span>, estás resolviendo gráficamente <span class="eq">a|x − h| + k = c</span>. Si el láser pasa por encima del piso <span class="eq">k</span> (cuando <span class="eq">a &gt; 0</span>), corta a las dos ramas en dos soluciones simétricas; si toca el vértice hay 1 solución; y si pasa por debajo del vértice el conjunto solución es vacío <span class="eq">∅</span>.',
    },
    {
      pose: 'base',
      tag: 'Bola interior vs. exterior en inecuaciones',
      html: 'Para inecuaciones: pedir <span class="eq">|x − h| &lt; d</span> significa «estar a distancia menor que <span class="eq">d</span> del centro <span class="eq">h</span>», lo que encierra un único intervalo central <span class="eq">(h − d; h + d)</span>. En cambio, pedir <span class="eq">|x − h| &gt; d</span> significa «alejarse a más de <span class="eq">d</span> pasos», lo que dispara dos semirrectas hacia afuera: <span class="eq">(−∞; h − d) ∪ (h + d; +∞)</span>.',
    },
    {
      pose: 'colapso',
      tag: '¡La identidad √(x²) = |x|!',
      html: 'Y cerramos el capítulo con la trampa universitaria número uno: al despejar <span class="eq">(x − 3)² = 4</span> aplicando raíz cuadrada, ¡no taches raíz con cuadrado dejando <span class="eq">x − 3 = 2</span>! Porque <span class="eq">√(u²) = |u|</span>. Queda <span class="eq">|x − 3| = 2</span>, que abre las dos ramas <span class="eq">x − 3 = 2</span> (<span class="eq">x = 5</span>) y <span class="eq">x − 3 = −2</span> (<span class="eq">x = 1</span>).',
    },
  ],

  'sec7-basico': [
    {
      pose: 'base',
      tag: 'Base 7 · Paréntesis, corchetes y llaves',
      html: 'En Análisis usamos tres símbolos distintos para agrupar números y cada uno significa algo muy preciso:<br>• <strong>Corchetes <span class="eq">[a; b]</span>:</strong> intervalo continuo que SÍ incluye a los bordes.<br>• <strong>Paréntesis <span class="eq">(a; b)</span>:</strong> intervalo continuo que NO incluye a los bordes.<br>• <strong>Llaves <span class="eq">{a; b}</span>:</strong> elementos sueltos aislados (solo el número <span class="eq">a</span> y el número <span class="eq">b</span>, sin los decimales del medio).',
    },
    {
      pose: 'feliz',
      tag: 'Base 7 · ¿Por qué Imagen lleva corchete en k?',
      html: 'En una función de valor absoluto <span class="eq">f(x) = |x − 1| − 2</span>, el vértice <span class="eq">(1; −2)</span> es un punto real de la gráfica: cuando <span class="eq">x = 1</span>, la altura vale efectivamente <span class="eq">−2</span>. Como esa altura mínima sí se alcanza, la Imagen arranca con corchete: <span class="eq">[−2; +∞)</span> (y el infinito siempre lleva paréntesis).',
    },
    {
      pose: 'base',
      tag: 'Base 7 · ¿Qué son C₀, C⁺ y C⁻?',
      html: 'El eje X es la línea de flotación (<span class="eq">y = 0</span>):<br>• <strong>Ceros <span class="eq">C₀</span>:</strong> los puntos exactos donde la gráfica corta al eje X (<span class="eq">f(x) = 0</span>), escritos entre llaves.<br>• <strong>Positividad <span class="eq">C⁺</span>:</strong> los intervalos del eje X donde la gráfica asoma la cabeza arriba del agua (<span class="eq">f(x) &gt; 0</span>).<br>• <strong>Negatividad <span class="eq">C⁻</span>:</strong> los intervalos del eje X donde la gráfica está sumergida bajo el eje X (<span class="eq">f(x) &lt; 0</span>).',
    },
    {
      pose: 'orgullosa',
      tag: 'Base 7 · Probá las 4 lentes',
      html: 'Si te cuesta imaginar cómo se proyecta la gráfica sobre el Eje Y o sobre el Eje X, tocá los botones <strong>Lente 1, Lente 2 y Lente 3</strong> del pizarrón interactivo: vas a ver pintadas las bandas luminosas directamente sobre cada eje.',
    },
  ],

  'sec7-ayuda-analisis': [
    {
      pose: 'feliz',
      tag: '¡Cero drama! Guía de rescate',
      html: '¡Tranqui, que acá nadie nació sabiendo Análisis Matemático! Si hace años que no tocás funciones o en la secundaria te daban reglas de memoria que ya te olvidaste, vamos a reconstruir el mapa mental desde cero absoluto. Analizar una función no es más que <strong>hacerle 5 preguntas lógicas a su gráfica</strong>. Y la primera clave de oro es: <em>¿a qué eje del mapa le preguntamos cada cosa?</em>',
    },
    {
      pose: 'base',
      tag: '1. Dominio vs. Imagen (Entradas vs. Alturas)',
      html: '• <strong>Dominio <span class="eq">Dom(f)</span>:</strong> son todas las <span class="eq">x</span> que podés enchufar sin romper la matemática. Como el valor absoluto no tiene divisiones por cero ni raíces negativas, podés meter cualquier número real: <span class="eq">Dom(f) = ℝ = (−∞; +∞)</span>.<br>• <strong>Imagen <span class="eq">Im(f)</span>:</strong> es la proyección de sombras sobre el <strong>Eje Y</strong> (las alturas posibles). Si la «V» abre hacia arriba, el punto más bajo es el piso <span class="eq">k</span> del vértice: arranca con corchete <span class="eq">[k; +∞)</span> porque la altura <span class="eq">k</span> sí se toca. Si abre hacia abajo, el techo es <span class="eq">k</span>: <span class="eq">(−∞; k]</span>. ¡El infinito siempre lleva paréntesis!',
    },
    {
      pose: 'enojada',
      tag: '2. Monotonía (¡Siempre se lee en X!)',
      html: 'Acá cometen el 90% de los errores en los exámenes: <strong>Crecimiento e Intervalos se leen SIEMPRE sobre el Eje X</strong>, mirando de izquierda a derecha.<br>• <strong>Decrecimiento <span class="eq">I↓</span>:</strong> el tramo donde vas esquiando colina abajo. En <span class="eq">f(x) = |x − 2| − 3</span>, venís bajando desde <span class="eq">−∞</span> hasta que chocás con la pared del vértice en <span class="eq">x = 2</span>: <span class="eq">I↓ = (−∞; 2)</span>.<br>• <strong>Crecimiento <span class="eq">I↑</span>:</strong> el tramo donde vas escalando colina arriba: desde el vértice <span class="eq">x = 2</span> en adelante: <span class="eq">I↑ = (2; +∞)</span>.<br>¡Jamás pongas la altura <span class="eq">−3</span> en el crecimiento! La pregunta es <em>«¿en qué tramo de x sube?»</em>, no <em>«¿a qué altura llegó?»</em>.',
    },
    {
      pose: 'base',
      tag: '3. Ceros C₀ (Puntos entre llaves)',
      html: '• <strong>Ceros o Raíces <span class="eq">C₀</span>:</strong> son los valores de <span class="eq">x</span> donde la gráfica corta exactamente a la línea de flotación (<span class="eq">y = 0</span>). Para hallarlos, igualás la fórmula a cero: <span class="eq">|x − 2| − 3 = 0 ⟹ |x − 2| = 3</span>, dando <span class="eq">x = −1</span> y <span class="eq">x = 5</span>.<br><strong>¡Atención con los símbolos!</strong> Como son puntos aislados y no un intervalo continuo de números, en la facultad se escriben obligatoriamente <strong>entre llaves</strong>: <span class="eq">C₀ = {−1; 5}</span>. Si pusieras paréntesis <span class="eq">(−1; 5)</span> parecería un intervalo o un punto cartesiano, y si pusieras corchetes <span class="eq">[−1; 5]</span> incluirías al <span class="eq">0, 1, 2, 3, 4</span> que no son raíces.',
    },
    {
      pose: 'colapso',
      tag: '4. Positividad C⁺ y Negatividad C⁻',
      html: 'Imaginá que el eje X es la superficie del agua del mar:<br>• <strong>Positividad <span class="eq">C⁺</span>:</strong> son los intervalos de <span class="eq">x</span> donde la gráfica está <strong>por arriba del agua</strong> (<span class="eq">f(x) &gt; 0</span>).<br>• <strong>Negatividad <span class="eq">C⁻</span>:</strong> los intervalos de <span class="eq">x</span> donde la gráfica está <strong>sumergida bajo el agua</strong> (<span class="eq">f(x) &lt; 0</span>).<br>¿Quién marca la frontera entre estar sumergido o en el aire? ¡Exacto, los Ceros <span class="eq">C₀</span>! En nuestro ejemplo, la punta de la V se hunde entre las dos raíces: <span class="eq">C⁻ = (−1; 5)</span>. Las dos alas que quedan flotando afuera forman <span class="eq">C⁺ = (−∞; −1) ∪ (5; +∞)</span>.<br>Siempre llevan <strong>paréntesis</strong> porque en las raíces exactas la altura es cero (ni positivo ni negativo).',
    },
    {
      pose: 'orgullosa',
      tag: '5. La regla mnemotécnica de oro',
      html: 'Guardate esta chuleta mental para no dudar nunca más en una hoja de parcial:<br>1. <strong>La Imagen <span class="eq">Im(f)</span> es la única que mira el Eje Y</strong> (arranca o frena en la altura <span class="eq">k</span> con corchete).<br>2. <strong>La Monotonía (<span class="eq">I↑ / I↓</span>) mira el Eje X</strong> y siempre se corta en la abscisa del vértice <span class="eq">h</span>.<br>3. <strong>Los signos (<span class="eq">C⁺ / C⁻</span>) miran el Eje X</strong> y siempre se cortan en las raíces <span class="eq">C₀</span>.<br>4. <span class="eq">∪</span> significa «unión» (pegar dos intervalos separados).<br>¡Ahora activá las 4 Lentes en el pizarrón interactivo de abajo para ver brillar cada conjunto sobre los ejes!',
    },
  ],

  'sec7-q2-signo-despeje': [
    {
      pose: 'colapso',
      tag: '¡Frená un segundo! Analicemos el signo',
      html: '¡No te desanimes ni tires números al azar! Sé con certeza qué te está haciendo ruido acá: al ver <span class="eq">−2|x − 3| + 6 = 0</span> pensás: <em>«si los términos cambiaron de signo, ¿por qué el −3 de adentro no se volvió +3?»</em>. Vamos a desarmar el paso completo para que lo veas con total claridad.',
    },
    {
      pose: 'base',
      tag: 'Las barras son un paquete blindado',
      html: 'En álgebra, las barras de valor absoluto <span class="eq">|x − 3|</span> actúan como un <strong>bloque sellado</strong>. Llamémoslo temporalmente <span class="eq">A</span>, donde <span class="eq">A = |x − 3|</span>. Mirá cómo queda la ecuación:<br><span class="eq">−2 · A + 6 = 0</span>.<br>El coeficiente <span class="eq">−2</span> multiplica al <em>resultado completo</em> del paquete <span class="eq">A</span>, <strong>no distribuye</strong> adentro de los términos de la resta.',
    },
    {
      pose: 'orgullosa',
      tag: 'Camino 1 · Propiedad uniforme (sin magia de «pasar»)',
      html: '¡Desterremos la frase escolar de «pasa sumando»! Las expresiones no tienen piernas ni cruzan el signo igual por arte de magia. En matemática rigurosa usamos la <strong>propiedad uniforme</strong>: sumamos el opuesto aditivo <span class="eq">+2 · A</span> en ambos miembros de la ecuación:<br><span class="eq">(−2 · A + 6) + 2 · A = 0 + 2 · A</span>.<br>A la izquierda, <span class="eq">−2 · A + 2 · A = 0</span> (se cancelan) y sobrevive únicamente el <span class="eq">6</span>. A la derecha queda <span class="eq">2 · A</span>:<br><span class="eq">6 = 2 · A ⟹ 2 · A = 6 ⟹ 2|x − 3| = 6</span>.<br>¡Fijate en la estructura real! Le agregamos la misma cantidad <span class="eq">2 · A</span> a los dos platillos de la balanza. Lo que estaba adentro de las barras (<span class="eq">x − 3</span>) jamás se alteró porque el bloque <span class="eq">A</span> operó completo como una unidad indivisible.',
    },
    {
      pose: 'colapso',
      tag: 'Camino 2 · ¿Y si multiplicamos por −1?',
      html: 'Muchos dicen: <em>«¡Pero Alaska, yo multipliqué toda la ecuación por −1!»</em>. ¡Perfecto! Miremos qué hace exactamente ese <span class="eq">−1</span>:<br><span class="eq">(−1) · [−2 · |x − 3| + 6] = (−1) · 0</span>.<br>Por propiedad distributiva respecto a la suma:<br><span class="eq">(−1) · (−2 · |x − 3|) + (−1) · (+6) = 0</span>.<br>El segundo término da <span class="eq">−6</span>. Pero en el primer término tenés un producto de factores: <span class="eq">(−1) · (−2) · |x − 3|</span>.',
    },
    {
      pose: 'enojada',
      tag: '¡Regla de oro del producto en Exactas!',
      html: '¡Grabate esto a fuego! En un producto <span class="eq">k · (a · b)</span>, la constante <span class="eq">k</span> multiplica a <strong>un solo factor</strong>, no a los dos: <span class="eq">(−1) · (−2) = +2</span>. Te queda <span class="eq">+2 · |x − 3| − 6 = 0</span>.<br>Si además le cambiaras el signo al interior (<span class="eq">|−x + 3|</span> o <span class="eq">|x + 3|</span>), ¡estarías multiplicando por <span class="eq">−1</span> <strong>dos veces</strong>! Eso sería multiplicar por <span class="eq">(−1) · (−1) = +1</span>, alterando la ecuación.',
    },
    {
      pose: 'feliz',
      tag: 'El paso final hacia las dos raíces',
      html: `Con <span class="eq">2|x − 3| = 6</span>, aplicamos propiedad uniforme multiplicando por el inverso ${FRAC_HALF} (dividir por 2) a ambos miembros:<br><span class="eq">|x − 3| = 3</span>.<br>Esto pregunta geométricamente: <em>«¿qué números están a 3 unidades de distancia del centro 3?»</em>:<br>• <strong>Rama izquierda:</strong> sumamos 3 a ambos miembros: <span class="eq">x − 3 + 3 = −3 + 3 ⟹ x₁ = 0</span>.<br>• <strong>Rama derecha:</strong> sumamos 3 a ambos miembros: <span class="eq">x − 3 + 3 = +3 + 3 ⟹ x₂ = 6</span>.<br>Por eso las dos raíces son <span class="eq">x₁ = 0</span> y <span class="eq">x₂ = 6</span>.`,
    },
  ],

  // =========================================================================
  // SECCIÓN 8 · LA ADUANA DE DOMINIOS: EVALUAR POR PARTES
  // =========================================================================
  'sec8-aduana': [
    {
      pose: 'base',
      tag: 'El protocolo de la Aduana',
      html: 'Entramos al Capítulo 3: funciones definidas por partes generales. Acá una sola función <span class="eq">f(x)</span> tiene varios renglones dentro de una llave grande, y cada renglón gobierna exclusivamente en su propio territorio del eje X.',
    },
    {
      pose: 'enojada',
      tag: '¡No evalúes en todos los renglones!',
      html: 'Cuando en un ejercicio te piden calcular <span class="eq">f(−2)</span>, el error de principiante es reemplazar <span class="eq">x = −2</span> en los tres renglones y entregar tres resultados distintos. ¡Frená! Si es una función, para <span class="eq">x = −2</span> tiene que salir un <strong>único</strong> número.',
    },
    {
      pose: 'orgullosa',
      tag: 'Primero la condición, después la fórmula',
      html: 'El orden correcto es: primero mirás la columna de la derecha (la <strong>Aduana de Condiciones</strong>) y probás en cuál desigualdad es verdadera tu <span class="eq">x</span>. Recién cuando la aduana te da luz verde en ese único renglón, evaluás su fórmula de la izquierda.',
    },
    {
      pose: 'base',
      tag: '¿Quién manda en la frontera exacta?',
      html: `El momento clave es cuando te piden evaluar justo en el borde entre dos tramos, por ejemplo <span class="eq">f(1)</span> cuando un renglón dice <span class="eq">x &lt; 1</span> y el otro dice <span class="eq">x ≥ 1</span>. Como <span class="eq">1 &lt; 1</span> es falso pero <span class="eq">1 ≥ 1</span> es verdadero, ¡gobierna el renglón que tiene la rayita del igual!`,
    },
    {
      pose: 'feliz',
      tag: 'Lectura visual en el gráfico',
      html: `En el plano cartesiano, la desigualdad estricta (<span class="eq">&lt;</span> o <span class="eq">&gt;</span>) se dibuja con un <strong>círculo abierto</strong> ${DOT_OPEN} (hueco: la rama llega hasta ahí pero no incluye el punto), mientras que la desigualdad con igual (<span class="eq">≤</span> o <span class="eq">≥</span>) se dibuja con un <strong>punto cerrado relleno</strong> ${DOT_CLOSED} (el dueño oficial de la frontera).`,
    },
  ],

  'sec8-basico': [
    {
      pose: 'base',
      tag: 'Base 8 · Leer desigualdades sin dudar',
      html: 'Repasemos rápido los cuatro símbolos de desigualdad: la «boca abierta» del símbolo apunta siempre al número más grande, y el «piquito cerrado» apunta al más chico.<br>• <span class="eq">x &lt; 2</span>: «x es estrictamente menor que 2» (el 2 NO entra).<br>• <span class="eq">x ≤ 2</span>: «x es menor o igual que 2» (el 2 SÍ entra).',
    },
    {
      pose: 'feliz',
      tag: 'Base 8 · Desigualdades dobles',
      html: 'Cuando ves escrito <span class="eq">−1 ≤ x &lt; 2</span>, significa que <span class="eq">x</span> está atrapado entre <span class="eq">−1</span> y <span class="eq">2</span>: puede valer exactamente <span class="eq">−1</span> (porque tiene <span class="eq">≤</span> a la izquierda), puede valer cualquier número intermedio como <span class="eq">0</span> o <span class="eq">1,5</span>, pero NO puede valer <span class="eq">2</span> (porque a la derecha tiene <span class="eq">&lt;</span> estricto).',
    },
    {
      pose: 'base',
      tag: 'Base 8 · La metáfora del cine o peaje',
      html: 'Pensá una función por partes como la boletería de un cine: «Menores de 12 años pagan $1000; de 12 a 65 años pagan $3000; mayores de 65 pagan $1500». Si tenés 20 años, no pagás las tres tarifas sumadas: mirás en qué categoría cae tu edad y pagás solo esa tarifa.',
    },
    {
      pose: 'orgullosa',
      tag: 'Base 8 · Las tarjetas de aduana',
      html: 'En el widget de abajo, a medida que movés <span class="eq">x</span> vas a ver las tres tarjetas de <strong>Inspección de Aduana</strong> mostrando en vivo qué condiciones dan <strong>VERDADERO</strong> y cuáles dan <strong>FALSO</strong>.',
    },
  ],

  // =========================================================================
  // SECCIÓN 9 · FRONTERAS ABIERTA VS. CERRADA Y PRUEBA DE LA RECTA VERTICAL
  // =========================================================================
  'sec9-frontera': [
    {
      pose: 'enojada',
      tag: '¡Alerta de colisión vertical!',
      html: `¿Qué pasa si en la frontera <span class="eq">x = 1</span> ponés punto cerrado ${DOT_CLOSED} en el tramo de arriba (<span class="eq">x ≤ 1</span>) y TAMBIÉN punto cerrado ${DOT_CLOSED} en el tramo de abajo (<span class="eq">x ≥ 1</span>) a distinta altura? ¡Catástrofe matemática! Para una misma entrada <span class="eq">x = 1</span> habría dos salidas distintas.`,
    },
    {
      pose: 'base',
      tag: 'La Prueba de la Recta Vertical',
      html: `Geométricamente, una gráfica en el plano representa una <strong>función</strong> si y solo si cualquier recta vertical <span class="eq">x = c</span> la corta <strong>a lo sumo una vez</strong> (0 o 1 vez). Si en <span class="eq">x = 1</span> la recta vertical pincha dos puntos cerrados ${DOT_CLOSED} a distinta altura, viola la unicidad y deja de ser función.`,
    },
    {
      pose: 'feliz',
      tag: '¿Y si ambos puntos son abiertos?',
      html: `En cambio, si en <span class="eq">x = 1</span> ambos tramos tienen círculo abierto ${DOT_OPEN} (<span class="eq">x &lt; 1</span> y <span class="eq">x &gt; 1</span>), la recta vertical pasa por los dos agujeros sin tocar ningún punto (0 cortes ≤ 1). ¡Sigue siendo una función totalmente válida, solo que <span class="eq">x = 1</span> queda fuera de su dominio!`,
    },
    {
      pose: 'orgullosa',
      tag: 'Pegado continuo tipo Exactas',
      html: '¿Cuándo dos tramos se pegan sin dar un salto brusco? Cuando al acercarte a la frontera <span class="eq">x = c</span> por la izquierda y por la derecha, ambas fórmulas llegan exactamente a la <strong>misma altura</strong>. En los parciales de Exactas te piden hallar una letra <span class="eq">k</span> igualando ambas ramas en el borde.',
    },
    {
      pose: 'base',
      tag: 'Sombras de Dominio y Rango',
      html: 'En el widget de abajo podés hacer clic directamente sobre los círculos de la frontera en el gráfico para abrirlos o cerrarlos, y encender las <strong>Sombras de Dominio (en el eje X) y Rango (en el eje Y)</strong> para ver cómo influyen los bordes.',
    },
  ],

  'sec9-basico': [
    {
      pose: 'base',
      tag: 'Base 9 · ¿Qué hace que algo sea una función?',
      html: 'Desde el día uno de matemática, una <strong>función</strong> es una regla que a cada valor de entrada <span class="eq">x</span> del dominio le asigna <strong>una única</strong> salida <span class="eq">y</span>. Podés imaginarlo como un sensor de temperatura: a las 15:00 hs (<span class="eq">x = 15</span>) puede hacer <span class="eq">24 °C</span>, pero no puede hacer <span class="eq">24 °C</span> y <span class="eq">10 °C</span> al mismo tiempo en el mismo lugar.',
    },
    {
      pose: 'feliz',
      tag: 'Base 9 · Cómo usar la recta vertical',
      html: 'Si te dan un dibujo y te preguntan «¿es función?», imaginá que barrés el gráfico de izquierda a derecha con una regla vertical (paralela al eje Y). Si en todas partes la regla toca la curva una sola vez (o ninguna), es función.',
    },
    {
      pose: 'colapso',
      tag: 'Base 9 · Por qué chocan dos puntos cerrados',
      html: `Si en la frontera <span class="eq">x = 1</span> el tramo izquierdo termina con punto cerrado ${DOT_CLOSED} en <span class="eq">(1; 2)</span> y el tramo derecho arranca con punto cerrado ${DOT_CLOSED} en <span class="eq">(1; 4)</span>, cuando tu regla vertical pasa por <span class="eq">x = 1</span> toca AMBOS puntos cerrados. Eso significa que <span class="eq">f(1)</span> valdría <span class="eq">2</span> y <span class="eq">4</span> a la vez: ¡imposible!`,
    },
    {
      pose: 'orgullosa',
      tag: 'Base 9 · Cómo arreglar la colisión',
      html: `Para que sea función cuando hay un salto vertical, al menos uno de los dos extremos en <span class="eq">x = 1</span> tiene que ceder el paso y convertirse en círculo abierto ${DOT_OPEN}. ¡Hacé clic sobre uno de los círculos en el gráfico del widget para comprobarlo!`,
    },
  ],

  // =========================================================================
  // SECCIÓN 10 · FUNCIONES ESCALONADAS: PISO ⌊x⌋ Y TECHO ⌈x⌉
  // =========================================================================
  'sec10-escalon': [
    {
      pose: 'feliz',
      tag: 'La escalera del mundo real',
      html: 'Llegamos al pizarrón 10: las <strong>funciones escalonadas o de paso</strong>. Son funciones definidas por partes donde cada tramo es constante (horizontal) y en cada frontera pega un salto vertical como los peldaños de una escalera.',
    },
    {
      pose: 'base',
      tag: 'Función Piso ⌊x⌋ vs. Techo ⌈x⌉',
      html: 'Las dos reinas de esta familia son la <strong>función parte entera o piso <span class="eq">⌊x⌋</span></strong> (que devuelve el mayor entero menor o igual que <span class="eq">x</span>, redondeando siempre hacia abajo/izquierda) y la <strong>función techo <span class="eq">⌈x⌉</span></strong> (el menor entero mayor o igual que <span class="eq">x</span>, como el estacionamiento que te cobra la hora entera apenas te pasás un minuto).',
    },
    {
      pose: 'enojada',
      tag: '¡La trampa mortal de ⌊−1,4⌋!',
      html: '¡Atención máxima cuando evalúes la función piso en un número negativo con coma como <span class="eq">⌊−1,4⌋</span>! La mayoría tacha los decimales y responde <span class="eq">−1</span>. ¡ERROR! El número <span class="eq">−1</span> es MÁS GRANDE que <span class="eq">−1,4</span> (está a su derecha). El entero que está inmediatamente a la izquierda (el piso donde estás parada) es <strong><span class="eq">⌊−1,4⌋ = −2</span></strong>.',
    },
    {
      pose: 'colapso',
      tag: '¡El Rango NO es un intervalo continuo!',
      html: 'Segunda trampa clásica: si una tarifa postal tiene cuatro escalones a alturas <span class="eq">$300, $500, $700</span> y <span class="eq">$900</span>, su Conjunto Imagen (Rango) <strong>NO es el intervalo entre corchetes <span class="eq">[300; 900]</span></strong>, porque el correo jamás te cobra <span class="eq">$412,50</span>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Sombra discreta entre llaves {…}',
      html: 'Mirá en el widget qué pasa cuando activás la <strong>Proyección de Rango contra el Eje Y</strong>: cada escalón horizontal entero se proyecta de costado en un <strong>único punto aislado brillante</strong> sobre el eje Y. Por eso el rango de toda función escalonada es un conjunto discreto entre llaves: <span class="eq">{300; 500; 700; 900}</span> o <span class="eq">ℤ</span>.',
    },
  ],

  'sec10-basico': [
    {
      pose: 'base',
      tag: 'Base 10 · ¿Qué son los números enteros ℤ?',
      html: 'El conjunto de los <strong>números enteros</strong> se representa con la letra <span class="eq">ℤ</span> y contiene a los números «redondos» sin parte decimal: <span class="eq">ℤ = {…, −3, −2, −1, 0, 1, 2, 3, …}</span>. Entre dos enteros consecutivos (como entre <span class="eq">2</span> y <span class="eq">3</span>) viven infinitos números con coma.',
    },
    {
      pose: 'feliz',
      tag: 'Base 10 · Orden en los negativos',
      html: 'En la recta numérica, un número es <strong>menor</strong> cuanto más a la izquierda está. En los positivos es obvio que <span class="eq">1 &lt; 2</span>. Pero en los negativos funciona en espejo: <span class="eq">−2</span> está a la izquierda de <span class="eq">−1</span>, así que <span class="eq">−2 &lt; −1,4 &lt; −1</span> (deber $2 es tener menos plata que deber $1).',
    },
    {
      pose: 'base',
      tag: 'Base 10 · La regla del ascensor subterráneo',
      html: 'Pensá en los pisos de un edificio con subsuelos: si el ascensor se frena en el nivel <span class="eq">−1,4</span> (entre el primer subsuelo <span class="eq">−1</span> y el segundo subsuelo <span class="eq">−2</span>), el <strong>piso</strong> que tenés bajo tus pies es el subsuelo <span class="eq">−2</span> (<span class="eq">⌊−1,4⌋ = −2</span>), y el <strong>techo</strong> sobre tu cabeza es el subsuelo <span class="eq">−1</span> (<span class="eq">⌈−1,4⌉ = −1</span>).',
    },
    {
      pose: 'orgullosa',
      tag: 'Base 10 · Extremos de cada peldaño',
      html: `Por eso cada peldaño de <span class="eq">⌊x⌋</span> en <span class="eq">[n; n + 1)</span> empieza con punto cerrado ${DOT_CLOSED} a la izquierda (en el entero exacto <span class="eq">n</span>) y termina con círculo abierto ${DOT_OPEN} a la derecha justo cuando salta al peldaño <span class="eq">n + 1</span>.`,
    },
  ],
};

/**
 * Reacciones específicas de Alaska ante los diagnósticos de diagnoseAbs() y colisiones de frontera.
 */
export const DIAGNOSE_REACTIONS = {
  inverted_h_sign: {
    pose: 'colapso',
    tag: '¡El signo de h!',
    html: '¡Caíste en la trampa clásica del signo de <span class="eq">h</span>! Acordate: el vértice ocurre donde lo de adentro de las barras se hace <strong>CERO</strong> (<span class="eq">x − h = 0 ⟺ x = h</span>). Revisá qué valor de <span class="eq">x</span> anula el módulo.',
  },
  swapped_h_k: {
    pose: 'colapso',
    tag: 'Cables cruzados (h ↔ k)',
    html: '¡Me cruzaste el eje X con el eje Y! El desplazamiento horizontal <span class="eq">h</span> vive <strong>adentro</strong> de las barras <span class="eq">|x − h|</span>, y el piso/techo vertical <span class="eq">k</span> vive <strong>afuera</strong> sumando o restando.',
  },
  wrong_reflection_sign: {
    pose: 'base',
    tag: 'Mirá para dónde abre',
    html: 'Calculaste bien la inclinación, pero pusiste el signo de <span class="eq">a</span> al revés: si abre hacia arriba (<span class="eq">V</span>) <span class="eq">a &gt; 0</span>; si está reflejada hacia abajo (<span class="eq">Λ</span>) tiene que llevar un signo menos adelante (<span class="eq">a &lt; 0</span>).',
  },
  inverted_slope_fraction: {
    pose: 'colapso',
    tag: 'Pendiente invertida',
    html: '¡Ojo con la fracción de la pendiente! Pusiste <span class="eq"><span class="fr"><span class="num">Δx</span><span class="den">Δy</span></span></span> en lugar de <span class="eq"><span class="fr"><span class="num">Δy</span><span class="den">Δx</span></span></span>. Siempre es cuánto subís o bajás en vertical dividido cuánto avanzás en horizontal.',
  },
  missing_abs_bars: {
    pose: 'enojada',
    tag: '¿¡Y las barras!?',
    html: '¡Te olvidaste las barras de valor absoluto <span class="eq">|...|</span>! Sin las barras escribiste una recta común y corriente que sigue de largo bajo tierra sin rebotar en el vértice.',
  },
  unfactored_inner_coeff: {
    pose: 'orgullosa',
    tag: 'Equivalente pero escondida',
    html: '¡Bien ahí! Tu fórmula es matemáticamente equivalente y grafica la misma «V». Igual te doy un consejo de Exactas: sacá el factor común afuera de las barras como <span class="eq">a|x − h| + k</span> para leer el vértice <span class="eq">h</span> directo sin tener que dividir mentalmente.',
  },
  confused_x_and_y_in_intervals: {
    pose: 'enojada',
    tag: '¡Eje equivocado!',
    html: '¡Frená todo! Usaste la coordenada <span class="eq">y = k</span> del vértice para armar un intervalo que vive en el <strong>eje X</strong>. El crecimiento, decrecimiento y positividad siempre cortan en <span class="eq">x = h</span>.',
  },
  both_endpoints_closed_violation: {
    pose: 'enojada',
    tag: '¡Colisión en la recta vertical!',
    html: `¡Acabás de romper la definición de función! Si dejás punto cerrado ${DOT_CLOSED} en ambos tramos sobre la misma vertical <span class="eq">x = 1</span> a distinta altura, una misma entrada tiene dos salidas. ¡Abrí uno de los dos extremos como ${DOT_OPEN}!`,
  },
};

/**
 * Guión detallado de Alaska para el ejercicio sec7-q2:
 * Explica por qué en −2|x − 3| + 6 = 0 ⇒ 2|x − 3| = 6 ⇒ |x − 3| = 3
 * el −3 dentro de las barras no cambia de signo.
 * isSuccess = true adapta el primer mensaje como felicitación + profundización.
 * isSuccess = false adapta el primer mensaje como rescate ante error reiterado.
 */
export function getSec7Q2Script(isSuccess = true) {
  const opening = isSuccess
    ? {
        pose: 'feliz',
        tag: '¡Ceros clavados! Pero analicemos el truco',
        html: '¡Excelente! Sacaste impecables las dos raíces: <span class="eq">x₁ = 0</span> y <span class="eq">x₂ = 6</span>. Pero detengámonos un minuto acá, porque este paso esconde una duda que hace dudar a casi todos: ¿por qué al pasar de <span class="eq">−2|x − 3| + 6 = 0</span> a <span class="eq">2|x − 3| = 6</span>, el <span class="eq">−3</span> adentro del módulo no cambió a <span class="eq">+3</span>? ¡Veámoslo con lupa!',
      }
    : {
        pose: 'colapso',
        tag: '¡Frená un segundo! Analicemos el signo',
        html: '¡No te desanimes ni tires números al azar! Sé con certeza qué te está haciendo ruido acá: al ver <span class="eq">−2|x − 3| + 6 = 0</span> pensás: <em>«si los términos cambiaron de signo, ¿por qué el −3 de adentro no se volvió +3?»</em>. Vamos a desarmar el paso completo para que lo veas con total claridad.',
      };

  return [
    opening,
    ...VN_SCRIPTS['sec7-q2-signo-despeje'].slice(1),
  ];
}

export const SEC7_Q2_EXPLANATION = VN_SCRIPTS['sec7-q2-signo-despeje'];

