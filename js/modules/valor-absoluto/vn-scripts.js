/**
 * vn-scripts.js — Los 10 guiones scripteados de «Explicación Profunda» de Alaska
 * y el diccionario de reacciones para diagnoseAbs() y failStreak
 * en el Laboratorio de Valor Absoluto y Funciones por Partes.
 */

export const VN_SCRIPTS = {
  // Sección 1 · Distancia en 1D y el mito de "-x"
  'sec1-distancia': [
    {
      pose: 'feliz',
      tag: '¡Bienvenida al lab!',
      html: '¡Buenas! Te doy la bienvenida al quinto laboratorio. Hoy vamos a demoler uno de los traumas más grandes del ingreso a Exactas: el valor absoluto <span class="eq">|x|</span>. Olvidate de esa frase escolar de «el módulo le borra el signo menos al número». Eso sirve para números sueltos, pero cuando aparece una letra <span class="eq">x</span> te destruye el cerebro.',
    },
    {
      pose: 'base',
      tag: 'Distancia geométrica',
      html: 'En la universidad, <span class="eq">|x|</span> se define geométricamente como la <strong>distancia desde el punto x hasta el 0</strong> en la recta real. Y cuando escribimos <span class="eq">|x − h|</span>, estamos midiendo la distancia entre tu posición <span class="eq">x</span> y un faro fijo <span class="eq">h</span>. Como una cinta métrica nunca mide distancias negativas, <span class="eq">|x| ≥ 0</span> siempre.',
    },
    {
      pose: 'colapso',
      tag: 'El cortocircuito de «−x»',
      html: 'Acá viene el bloqueo mortal: cuando ven la llave formal <span class="eq">|x| = −x si x &lt; 0</span>, ¡entran en pánico y gritan «¿cómo va a dar −x si el módulo nunca es negativo?»! ¡Respirá! Si <span class="eq">x = −4</span>, ese signo menos delante de la <span class="eq">x</span> no es un cartel de negativo: es un <strong>inversor de signo</strong> que choca contra el menos del <span class="eq">−4</span> y lo vuelve positivo: <span class="eq">−(−4) = +4</span>.',
    },
  ],

  // Sección 2 · El Espejo del Eje X (y = |x|)
  'sec2-espejo': [
    {
      pose: 'base',
      tag: 'El espejo tectónico',
      html: '¿Por qué la gráfica de <span class="eq">y = |x|</span> tiene forma de «V» corta con un pico filoso en el origen? Pensá en la recta identidad <span class="eq">y = x</span>: para los <span class="eq">x</span> negativos, la recta se hunde bajo tierra en el semiplano negativo (<span class="eq">C⁻</span>).',
    },
    {
      pose: 'orgullosa',
      tag: 'Rebote simétrico',
      html: 'Ponerle las barras <span class="eq">|x|</span> equivale físicamente a apoyar un <strong>espejo sobre el eje X</strong>. Todo lo que estaba arriba (<span class="eq">y ≥ 0</span>) queda intacto con pendiente <span class="eq">+1</span>, pero el tramo subterráneo rebota hacia el cielo con pendiente opuesta <span class="eq">−1</span>.',
    },
    {
      pose: 'feliz',
      html: 'Probá el deslizador de plegado de acá abajo: vas a ver en cámara lenta cómo nace el <strong>vértice (0; 0)</strong> justo donde la recta original cortaba al eje X, y cómo <span class="eq">x = 0</span> se convierte en el eje de simetría.',
    },
  ],

  // Sección 3 · Desplazar la V sin recetas (f(x) = |x - h| + k)
  'sec3-vertice': [
    {
      pose: 'enojada',
      tag: '¡Basta de recetas ciegas!',
      html: '¡Prohibido decir «el de adentro va con el signo cambiado y el de afuera con el mismo signo» como un loro! Por memorizar esa frase sin entenderla, después en el parcial ven <span class="eq">y = |x + 3| − 2</span> y clavan el vértice en <span class="eq">(3; −2)</span>.',
    },
    {
      pose: 'base',
      tag: 'El punto de distancia cero',
      html: 'El antídoto es pensarlo físicamente: el vértice es el único punto donde <strong>lo de adentro de las barras vale CERO</strong> (distancia nula al faro). Preguntate siempre: <em>«¿Qué valor de x anula a x + 3?»</em>. ¡La respuesta inmediata es <span class="eq">x = −3</span>!',
    },
    {
      pose: 'orgullosa',
      tag: 'Neutro aditivo en acción',
      html: 'Y mirá qué belleza: justo cuando <span class="eq">x = −3</span>, todo el bloque <span class="eq">|x + 3|</span> se hace <span class="eq">0</span> (neutro aditivo), así que la altura de salida queda pura y exclusivamente <span class="eq">y = 0 − 2 = −2</span>. ¡De ahí nace el vértice <span class="eq">(−3; −2)</span> sin memorizar nada!',
    },
  ],

  // Sección 4 · Escalar y reflejar: el factor a
  'sec4-escalado': [
    {
      pose: 'base',
      tag: 'El control de apertura',
      html: 'El número <span class="eq">a</span> que multiplica afuera de las barras en <span class="eq">f(x) = a|x|</span> es la pendiente de la rama derecha. Si <span class="eq">|a| &gt; 1</span> (como <span class="eq">3|x|</span>), las salidas se triplican y la «V» se cierra como un láser. Si <span class="eq">0 &lt; |a| &lt; 1</span> (como <span class="eq">1/2 |x|</span>), se abre como un paraguas.',
    },
    {
      pose: 'colapso',
      tag: 'Menos afuera vs. Menos adentro',
      html: '¡Ojo con la trampa mortal de los signos! Un menos <strong>afuera</strong> (<span class="eq">−|x|</span>) multiplica las salidas por <span class="eq">−1</span> y vuelca toda la «V» hacia abajo como una carpa <span class="eq">Λ</span>. En cambio, un menos <strong>adentro</strong> (<span class="eq">|−x|</span>) no hace absolutamente nada, porque <span class="eq">|−x| = |x|</span> para todo número real.',
    },
  ],

  // Sección 5 · El Laboratorio Maestro: f(x) = a|x - h| + k en dos pasos
  'sec5-lab': [
    {
      pose: 'feliz',
      tag: 'Graficar con las manos',
      html: 'Para graficar cualquier función <span class="eq">f(x) = a|x − h| + k</span> no hace falta armar una tabla de 20 valores. Te alcanzan exactamente <strong>dos pasos geométricos</strong> sobre la pizarra.',
    },
    {
      pose: 'base',
      tag: 'Paso 1 y Paso 2',
      html: '<strong>Paso 1:</strong> Buscás qué <span class="eq">x</span> anula las barras (<span class="eq">x = h</span>) y clavás el vértice en <span class="eq">(h; k)</span>. <br><strong>Paso 2:</strong> Desde el vértice caminás <span class="eq">1</span> unidad hacia la derecha y subís o bajás <span class="eq">a</span> unidades hasta <span class="eq">(h + 1; k + a)</span> (y por simetría a la izquierda hasta <span class="eq">(h − 1; k + a)</span>). ¡Unís con dos semirrectas y listo!',
    },
  ],

  // Sección 6 · Todo Valor Absoluto es una Función por Partes
  'sec6-partes': [
    {
      pose: 'orgullosa',
      tag: 'Desenmascarando las barras',
      html: 'En la secundaria te enseñan «Valor absoluto» en un mes y «Funciones por partes» en otro, como si fueran primos lejanos. En Análisis I te revelamos la verdad: <strong>toda función de valor absoluto es una función definida por partes</strong> disfrazada en un solo renglón.',
    },
    {
      pose: 'base',
      tag: 'La frontera x = h',
      html: 'El vértice <span class="eq">x = h</span> es la frontera aduanera. A la derecha (<span class="eq">x ≥ h</span>), lo de adentro es positivo y las barras desaparecen dejando <span class="eq">a(x − h) + k</span> (pendiente <span class="eq">+a</span>). A la izquierda (<span class="eq">x &lt; h</span>), lo de adentro es negativo y las barras anteponen un menos dejando <span class="eq">−a(x − h) + k</span> (pendiente <span class="eq">−a</span>).',
    },
  ],

  // Sección 7 · Radiografía para Exactas: Imagen, C+, C- y sqrt(x^2) = |x|
  'sec7-exactas': [
    {
      pose: 'base',
      tag: 'El láser horizontal y = c',
      html: 'Mirá qué pasa cuando cruzás la «V» con un láser horizontal <span class="eq">y = c</span>: resolvés visualmente la ecuación <span class="eq">a|x − h| + k = c</span>. Si <span class="eq">a &gt; 0</span>, el vértice <span class="eq">k</span> es el <strong>piso absoluto</strong>: por debajo de <span class="eq">k</span> el láser pasa de largo sin tocar la gráfica (¡0 soluciones!). Justo en <span class="eq">c = k</span> toca el vértice (1 solución), y arriba de <span class="eq">k</span> corta a las dos ramas simétricas (2 soluciones).',
    },
    {
      pose: 'enojada',
      tag: '¡La trampa de cancelar √(x²)!',
      html: '¡Grabate esto a fuego para el primer parcial de Exactas! Simplificar <span class="eq">√(x²)</span> como <span class="eq">x</span> a secas está <strong>MAL</strong> si <span class="eq">x</span> puede ser negativo. Si <span class="eq">x = −5</span>, <span class="eq">√((−5)²) = √25 = +5 = |−5|</span>. La identidad universal verdadera es <span class="eq">√(x²) = |x|</span>.',
    },
  ],

  // Sección 8 · Evaluación de funciones definidas por partes
  'sec8-aduana': [
    {
      pose: 'base',
      tag: 'El protocolo de la Aduana',
      html: 'Una función definida por partes divide el eje X en «territorios» con distintas leyes. Cuando te piden calcular <span class="eq">f(c)</span>, <strong>no reemplaces en todos los renglones</strong>: primero pasás por la aduana de la derecha (las desigualdades de dominio) para ver qué único territorio acepta a <span class="eq">x = c</span>.',
    },
    {
      pose: 'orgullosa',
      tag: 'Atención al borde',
      html: 'El momento de máxima adrenalina es cuando <span class="eq">x</span> cae justo en la frontera entre dos tramos. Ahí mirás con lupa quién tiene el signo igual (<span class="eq">≤</span> o <span class="eq">≥</span>, punto cerrado <span class="eq">•</span>) y quién tiene desigualdad estricta (<span class="eq">&lt;</span> o <span class="eq">&gt;</span>, agujero abierto <span class="eq">◦</span>).',
    },
  ],

  // Sección 9 · Graficar por partes, Unicidad, Dominio y Rango
  'sec9-frontera': [
    {
      pose: 'enojada',
      tag: '¡Alerta de colisión vertical!',
      html: '¿Qué pasa si en la frontera <span class="eq">x = 2</span> ponés punto cerrado <span class="eq">•</span> en el tramo de arriba y también punto cerrado <span class="eq">•</span> en el tramo de abajo a distinta altura? ¡Catástrofe! Para una misma entrada <span class="eq">x = 2</span> habría dos salidas distintas: falla la prueba de la recta vertical y <strong>deja de ser función</strong>.',
    },
    {
      pose: 'base',
      tag: 'Sombras en los ejes',
      html: 'Para leer el <strong>Dominio</strong>, aplastás toda la gráfica verticalmente contra el eje X (su sombra horizontal). Para leer el <strong>Rango (Imagen)</strong>, proyectás una linterna de costado contra el eje Y (su sombra vertical). Si un extremo tiene solo un agujero abierto <span class="eq">◦</span> sin nadie que lo cubra, va paréntesis.',
    },
  ],

  // Sección 10 · Funciones de paso (escalonadas)
  'sec10-escalon': [
    {
      pose: 'feliz',
      tag: 'La escalera del estacionamiento',
      html: 'Las funciones de paso o escalonadas aparecen en todos lados en la vida real: tarifas de estacionamiento por hora, envío de correo por gramos o la función piso <span class="eq">⌊x⌋</span> en computación. En cada intervalo el valor se mantiene horizontal y constante, y en el borde pega un salto.',
    },
    {
      pose: 'colapso',
      tag: '¡El rango NO es un intervalo!',
      html: '¡No caigas en la trampa número uno de Khan Academy! Si una función escalonada vale <span class="eq">2</span>, <span class="eq">4</span> y <span class="eq">6</span>, su imagen <strong>NO es el intervalo continuo <span class="eq">[2; 6]</span></strong> (porque nunca vale <span class="eq">3</span> ni <span class="eq">4,5</span>). Al proyectar cada escalón horizontal contra el eje Y, se aplasta en un punto aislado: el rango es el conjunto discreto entre llaves <span class="eq">{2; 4; 6}</span>.',
    },
  ],
};

/**
 * Reacciones específicas de Alaska ante los 7 diagnósticos de diagnoseAbs().
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
    html: '¡Ojo con la fracción de la pendiente! Pusiste <span class="eq">Δx / Δy</span> en lugar de <span class="eq">Δy / Δx</span>. Siempre es cuánto subís o bajás en vertical dividido cuánto avanzás en horizontal.',
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
};
