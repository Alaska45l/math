/**
 * vn-scripts.js — Los 12 guiones scripteados de «Explicación Profunda»
 * para el Laboratorio de Sucesiones.
 * Voz de Alaska: tutora de Exactas, voseo rioplatense auténtico, humor universitario y rigor matemático.
 */

export const VN_SCRIPTS = {
  // Sección 1 · ¿Qué es una sucesión?
  'sec1-intro': [
    {
      pose: 'feliz',
      tag: '😊 ¡Bienvenida al lab!',
      html: '¡Buenas! Te doy la bienvenida oficial a mi laboratorio. Te aviso desde ya: olvidate de que las sucesiones son «esas listas aburridas de la secundaria para adivinar el numerito que sigue». En Exactas son el cimiento de todo el mundo discreto, los algoritmos y el análisis numérico.',
    },
    {
      pose: 'base',
      tag: '👓 Mirá los arcos',
      html: 'Fijate en la cinta de postes: cada número ocupa una posición fija <span class="eq">n ∈ ℕ</span>. Los puntos suspensivos <code>…</code> significan que la lista sigue hasta el infinito. Lo crucial no es el número aislado, sino la <strong>regularidad del salto</strong> que ves dibujado en el arco superior.',
    },
    {
      pose: 'orgullosa',
      tag: '😏 A ver si te animás',
      html: 'Te desafío a probar el widget de abajo: elegí un patrón y tipea directamente en los postes vacíos. ¡Ojo con el signo en los saltos decrecientes, no me hagas pasar vergüenza en el primer pizarrón!',
    },
  ],

  // Sección 2 · Aritmética, geométrica o ninguna
  'sec2-detective': [
    {
      pose: 'base',
      tag: '👓 El método detective',
      html: 'Para clasificar una sucesión no adivinamos: aplicamos el método científico. Calculamos la resta consecutiva <span class="eq">a(n) − a(n − 1)</span>. Si da siempre la misma constante <span class="eq">d</span>, es aritmética. Si probás dividiendo <span class="eq">a(n) / a(n − 1)</span> y da constante <span class="eq">r</span>, es geométrica.',
    },
    {
      pose: 'colapso',
      tag: '💧 No te apures con 2 términos',
      html: '¡Por favor no cometas el pecado de mirar solo dos números! Si ves <code>1, 2…</code>, puede seguir como <code>3, 4</code> sumando 1 (aritmética) o como <code>4, 8</code> duplicando (geométrica). ¡Necesitás al menos <strong>3 términos</strong> para confirmar cualquier patrón!',
    },
    {
      pose: 'orgullosa',
      tag: '😏 La constante tramposa',
      html: '¿Querés una joyita de final? La sucesión constante <code>5, 5, 5, 5…</code> cumple las dos cosas a la vez: es aritmética con diferencia <span class="eq">d = 0</span> y es geométrica con razón <span class="eq">r = 1</span>. Guardátela bajo la manga.',
    },
  ],

  // Sección 3 · Una sucesión es una función discreta
  'sec3-discreto': [
    {
      pose: 'base',
      tag: '👓 Conexión con Funciones',
      html: 'Acá está el secreto mejor guardado: una sucesión <strong>es una función</strong>. Su regla es <span class="eq">f(n) = a(n)</span>. La única diferencia con las funciones de Análisis I es su dominio: en vez de toda la recta real ℝ, acá la entrada son exclusivamente los enteros positivos <span class="eq">ℕ = {1, 2, 3…}</span>.',
    },
    {
      pose: 'enojada',
      tag: '💢 ¡Prohibido unir puntos!',
      html: '¡Ni se te ocurra unir los puntos de una sucesión con una línea continua como si fuera un gráfico de temperatura! Entre el poste 1 y el poste 2 hay vacío absoluto: <strong>no existe el término 1,4</strong>. Los términos son islas discretas flotando en el plano.',
    },
    {
      pose: 'feliz',
      tag: '😊 Probá el vacío',
      html: 'Hacé clic o arrastrá el cursor entre dos postes en el gráfico cartesiano de acá abajo. Fijate cómo salta la cruz magenta avisándote que caíste en el vacío de <span class="eq">n ∉ ℕ</span>. ¡Es hipnótico!',
    },
  ],

  // Sección 4 · Fórmulas recursivas y Fibonacci
  'sec4-escalera': [
    {
      pose: 'base',
      tag: '👓 Las dos piezas',
      html: 'Toda fórmula recursiva es como subir una escalera caracol y necesita dos piezas sagradas: el <strong>ancla inicial</strong> <span class="eq">a(1) = k</span> (dónde pisás primero) y la <strong>regla del escalón</strong> <span class="eq">a(n) = a(n − 1) + d</span> (cómo subís al siguiente paso).',
    },
    {
      pose: 'colapso',
      tag: '💧 La trampa del cavernícola',
      html: 'Ahora imaginate que en el parcial te piden calcular <span class="eq">a(100)</span> y solo tenés la fórmula recursiva... ¿Vas a hacer 99 cuentas a mano como un cavernícola? Te jubilás antes de terminar el renglón. Por eso inventamos el teletransportador explícito.',
    },
    {
      pose: 'orgullosa',
      tag: '😏 El misterio de Fibonacci',
      html: 'Fijate en la pestaña de Fibonacci: como la regla suma los <em>dos</em> escalones previos <span class="eq">a(n − 1) + a(n − 2)</span>, ¡necesitás obligatoriamente <strong>dos anclas</strong> (<span class="eq">a(1)</span> y <span class="eq">a(2)</span>)! Si apagás la segunda ancla, el motor se apaga.',
    },
  ],

  // Sección 5A · El misterio del (n - 1) en el Teletransportador
  'sec5a-postes': [
    {
      pose: 'base',
      tag: '👓 Paradoja de postes y vallas',
      html: 'Esta es la famosa paradoja de las vallas y los postes. Si estás parado en el poste 1, ¿cuántos saltos diste para llegar al poste 1? <strong>Cero saltos</strong>. Y como <span class="eq">0 · d = 0</span>, el neutro aditivo no te mueve de donde arrancaste.',
    },
    {
      pose: 'orgullosa',
      tag: '😏 Teletransportación pura',
      html: 'Por eso para llegar al poste <span class="eq">n</span> siempre das exactamente <span class="eq">(n − 1)</span> saltos. El teletransportador <span class="eq">a(n) = k + d(n − 1)</span> te clava en el término 124 en un solo renglón sin subir ningún escalón previo.',
    },
    {
      pose: 'base',
      tag: '👓 Ojo con el índice cero',
      html: 'Aclaro por si ves bibliografía extranjera o de computación: si algún psicópata numera el primer poste como <span class="eq">a(0)</span> (en vez de 1), recién ahí van <span class="eq">n</span> saltos. Pero en matemática clásica y en el CBC arrancamos siempre en <span class="eq">n = 1</span>.',
    },
  ],

  // Sección 5B · Usar el teletransportador al revés
  'sec5b-alreves': [
    {
      pose: 'base',
      tag: '👓 Despejando como ingeniera',
      html: 'Cuando te preguntan «¿qué posición ocupa el número 97?», usamos el teletransportador al revés. Restamos <span class="eq">k</span> a ambos lados para medir la distancia total recorrida, dividimos por el paso <span class="eq">d</span> para contar cuántos saltos entraron, y le sumamos 1 para saber el poste final.',
    },
    {
      pose: 'enojada',
      tag: '💢 ¡No me redondees con coma!',
      html: '¡Si al despejar <span class="eq">n</span> te da <span class="eq">49,5</span>, no me redondees para arriba ni me inventes decimales! Que dé con coma significa que caíste en el abismo entre el poste 49 y el 50: <strong>ese número NO pertenece a la sucesión</strong>.',
    },
  ],

  // Sección 6 · Fórmulas equivalentes y la trampa de 2 + 6n
  'sec6-trampa': [
    {
      pose: 'colapso',
      tag: '💧 El cementerio de parciales',
      html: 'Este es el clásico cementerio de los exámenes: ven primer término <span class="eq">k = 2</span> y paso <span class="eq">d = 6</span>, y escriben apurados <span class="eq">2 + 6n</span> olvidándose del <span class="eq">(n − 1)</span>. ¡Grave error!',
    },
    {
      pose: 'base',
      tag: '👓 Distributiva al rescate',
      html: 'Si aplicás distributiva en la fórmula real: <span class="eq">2 + 6(n − 1) = 2 + 6n − 6 = −4 + 6n</span>. ¿Ves de dónde sale ese <span class="eq">−4</span>? Es el término anterior al primero, lo que valdría el poste fantasma <span class="eq">a(0)</span>.',
    },
    {
      pose: 'orgullosa',
      tag: '😏 Mi regla de oro',
      html: 'Anotate mi regla de oro en el margen de la libreta: si te dan una fórmula simplificada como <span class="eq">−4 + 6n</span>, <strong>evaluá siempre n = 1</strong>: <span class="eq">−4 + 6(1) = 2</span>. ¡Ahí recuperás el verdadero primer término sin comerte ningún amague!',
    },
  ],

  // Sección 7 · La Piedra de Rosetta
  'sec7-rosetta': [
    {
      pose: 'feliz',
      tag: '😊 El mismo objeto matemático',
      html: 'La Piedra de Rosetta te muestra cómo las 5 vistas (la cinta de saltos, la tabla de valores, el gráfico cartesiano, la recursiva y la explícita) son exactamente el mismo objeto matemático disfrazado con distinta ropa.',
    },
    {
      pose: 'base',
      tag: '👓 El truco de dos valores',
      html: 'Cuando te den una fórmula simplificada cualquiera como <span class="eq">e(n) = 10 + 2n</span> y te pidan la cinta o la recursiva, hacé esto: calculá <span class="eq">e(1) = 12</span> y <span class="eq">e(2) = 14</span>. Listo: tu ancla es <span class="eq">k = 12</span> y la diferencia es <span class="eq">d = 14 − 12 = 2</span>.',
    },
  ],

  // Sección 8 · El Espejo Geométrico y el Neutro Multiplicativo
  'sec8-espejo': [
    {
      pose: 'base',
      tag: '👓 El primer puente',
      html: 'Pasamos al territorio de las multiplicaciones. Primer puente sagrado: en matemática formal jamás escribimos «÷ 3». Dividir por 3 es multiplicar por el inverso fraccionario <span class="eq">· 1/3</span>. Acostumbrá el ojo a las fracciones.',
    },
    {
      pose: 'orgullosa',
      tag: '😏 Neutro aditivo vs multiplicativo',
      html: 'Acá está la belleza simétrica: en aritmética, en <span class="eq">n = 1</span> teníamos 0 saltos aditivos (<span class="eq">0 · d = 0</span>). En geométrica, en <span class="eq">n = 1</span> tenemos 0 factores multiplicativos: <span class="eq">r⁰ = 1</span> (el neutro de la multiplicación). Acumular <span class="eq">(n − 1)</span> multiplicaciones es la potencia <span class="eq">rⁿ⁻¹</span>.',
    },
  ],

  // Sección 9 · El Radar de r: paréntesis y raíces prohibidas
  'sec9-radar': [
    {
      pose: 'enojada',
      tag: '💢 ¡Poné esos paréntesis!',
      html: '¡Escuchame bien esto porque no lo repito! Si la razón es negativa como <span class="eq">r = −5</span> y escribís <span class="eq">−5ⁿ⁻¹</span> sin paréntesis, la potencia tiene mayor jerarquía y agarra solo al 5 dejando el menos afuera. ¡Te quedan todos negativos en vez de alternar de signo!',
    },
    {
      pose: 'colapso',
      tag: '💧 Explosión en los Reales',
      html: 'Probá tocar el botón de «Curva continua en ℝ» con <span class="eq">r < 0</span> en el Radar de abajo: en <span class="eq">n = 1,5</span> el sistema colapsa porque aparece <span class="eq">(−5)¹/² = √−5 ∉ ℝ</span>. ¡Por eso las geométricas alternantes son estrictamente discretas!',
    },
  ],

  // Sección 10 · Ahorro fijo vs. Interés compuesto de Caden
  'sec10-caden': [
    {
      pose: 'base',
      tag: '👓 La trampa de Caden',
      html: 'Mirá el problema de Caden: si un capital crece 10% mensual y multiplicás por <span class="eq">0,10</span>, te quedás solamente con la ganancia de los intereses y perdiste todo el capital inicial en el camino.',
    },
    {
      pose: 'orgullosa',
      tag: '😏 Propiedad distributiva pura',
      html: 'Por propiedad distributiva: conservar el 100% de tu plata (<span class="eq">1</span>) más el 10% de interés (<span class="eq">0,10</span>) es multiplicar por <span class="eq">(1 + 0,10) = 1,10</span>. ¡Esa es la razón común de todo el interés compuesto!',
    },
  ],

  // Sección 11 · Puente a Análisis I: Hacia el infinito
  'sec11-limites': [
    {
      pose: 'feliz',
      tag: '😊 Tu primer límite al infinito',
      html: '¡Llegaste a la cumbre! Mirá qué elegancia: cuando la razón cumple <span class="eq">|r| < 1</span> (como <span class="eq">64, 16, 4, 1, 1/4…</span> con <span class="eq">r = 1/4</span>), los términos se van aplastando contra el eje horizontal <span class="eq">y = 0</span>.',
    },
    {
      pose: 'orgullosa',
      tag: '😏 Así nace el cálculo',
      html: 'Nunca tocan el cero en ningún paso finito, pero la distancia se vuelve tan microscópica como quieras. Acabás de ver nacer tu primer límite formal de Análisis I: <span class="eq">lim (n → ∞) a(n) = 0</span>. ¡Bienvenida a las grandes ligas de Exactas!',
    },
  ],
};
