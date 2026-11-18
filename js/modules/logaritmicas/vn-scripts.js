/**
 * vn-scripts.js — Guiones teatrales interactivos de Alaska ("Modo Novela Visual")
 * Unidad 09: Función Logarítmica (logaritmicas.html)
 *
 * - 12 guiones artesanales en voseo rioplatense auténtico:
 *   - 6 guiones principales (sec1 a sec6, 5-6 globos cada uno)
 *   - 6 guiones "Base desde cero" (sec1 a sec6, 5 globos cada uno, iniciando en 'empatia')
 * - DIAGNOSE_REACTIONS para los 10 códigos cognitivos de logic.js
 * - STREAK_REACTIONS para estados de racha y apoyo
 * - Cero emojis Unicode, cero comandos LaTeX crudos, máximo 2 'eureka' en todo el módulo.
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
  non_positive_argument_accepted: line(
    "panico",
    "¡Alerta de Dominio!",
    `¡Frená todo en la aduana de argumentos! En los números reales ninguna potencia con base positiva puede dar cero ni un número negativo, así que el argumento del logaritmo debe ser siempre mayor que cero. Cuando metés cero o un negativo adentro de <span class="eq">log<sub>a</sub>(x)</span>, estás buscando un exponente imposible en los reales.`
  ),

  invalid_log_base_accepted: line(
    "panico",
    "Base Inválida en ℝ",
    `¡Peligro en los cimientos de la definición! La base de un logaritmo tiene prohibido valer uno, cero o ser negativa. Si pusieras <span class="eq">a = 1</span>, elevar uno a cualquier exponente siempre daría uno y sería imposible despejar otro número. Y con bases negativas o nulas, la función exponencial asociada se rompe sobre la recta real.`
  ),

  confused_exp_log_conversion: line(
    "sospecha",
    "Espejo Exponencial",
    `Mmm... me parece que cruzaste los cables al pasar de potencia a logaritmo. Cada vez que leés <span class="eq">log<sub>a</sub>(x) = y</span>, la pregunta que tenés que hacerte en voz alta es: ¿a qué exponente tengo que elevar la base para conseguir el argumento? El resultado del logaritmo siempre ocupa el lugar del exponente en <span class="eq">a<sup>y</sup> = x</span>.`
  ),

  false_sum_identity_log_a_plus_b: line(
    "unamused",
    "Identidad Falsa",
    `¡Alto ahí con esa distributiva inventada! El logaritmo no se reparte adentro de una suma ni de una resta: <span class="eq">log<sub>2</sub>(4 + 4) = 3</span>, mientras que sumar los logaritmos por separado da cuatro. La suma de dos logaritmos nace únicamente cuando adentro tenés una multiplicación de factores, jamás cuando hay términos sumándose.`
  ),

  false_power_of_whole_log: line(
    "colapso",
    "Paréntesis de Potencia",
    `¡Ay, ese paréntesis traicionero! La regla de bajar el exponente multiplicando sirve exclusivamente cuando la potencia está pegada al argumento interior. En <span class="eq">(log<sub>2</sub> 8)<sup>2</sup></span>, primero resolvés el logaritmo que vale tres y recién después lo elevás al cuadrado para obtener nueve, muy distinto del seis que da bajar el dos.`
  ),

  false_quotient_or_product_of_logs: line(
    "lentes-brillo",
    "Trampa de Parcial",
    `¡Cazabobos clásico de examen! Multiplicar dos logaritmos sueltos no te autoriza a multiplicar ni a sumar sus argumentos por dentro, y dividir un logaritmo por otro tampoco se transforma en resta de argumentos. Cada propiedad conecta una operación adentro del argumento con una operación distinta afuera: producto adentro va con suma afuera.`
  ),

  inverted_change_of_base: line(
    "pensativa",
    "Cambio de Base",
    `Pará un segundo y mirá el orden de esa fracción: la diste vuelta sin querer. En la fórmula de cambio de base <span class="eq">log<sub>a</sub>(x) = log<sub>b</sub>(x) / log<sub>b</sub>(a)</span>, el argumento original queda arriba en el numerador y la base vieja se queda abajo en el denominador. Acordate así: la base siempre va abajo, tanto en el subíndice como en la división.`
  ),

  accepted_extraneous_root_in_log_eq: line(
    "enojada",
    "Aduana de Argumentos",
    `¡Frená la mano antes de encuadrar ese conjunto solución! Despejaste bien la ecuación cuadrática auxiliar, pero te olvidaste el paso obligatorio: volver a meter cada candidata dentro de los logaritmos del enunciado original. Toda solución matemática que vuelva cero o negativo algún argumento es una raíz extraña y hay que tacharla sin piedad.`
  ),

  closed_bracket_or_horizontal_asymptote_confusion: line(
    "lentes-brillo",
    "Frontera Asintótica",
    `¡Ojo con la frontera del dominio y la dirección de la asíntota! Al reflejar la exponencial sobre la recta diagonal, su asíntota horizontal se convierte en una asíntota vertical que el argumento nunca puede tocar. Por eso el dominio de <span class="eq">log<sub>a</sub>(x &minus; h)</span> lleva siempre paréntesis redondo abierto en el borde, jamás corchete cerrado.`
  ),

  linear_ratio_confusion_in_log_scale: line(
    "unamused",
    "Escala No Lineal",
    `¡No apliques regla de tres directa sobre una escala logarítmica! Cuando una magnitud sube de cuatro coma uno a ocho coma dos en la escala de Richter, la potencia del sismo no se duplica: el exponente crece en cuatro coma uno, lo que multiplica la energía liberada por diez elevado a esa diferencia, más de doce mil quinientas veces.`
  ),
};

// =============================================================================
// REACCIONES A ESTADOS DE RACHA (STREAK_REACTIONS)
// =============================================================================

export const STREAK_REACTIONS = {
  firstTry: line(
    "orgullosa",
    "Impecable a la primera",
    `¡Excelente deducción! Resolviste el ejercicio al primer intento cuidando el dominio y aplicando la propiedad exacta sin caer en ningún amague. Guardá este mismo reflejo de verificación en tu libreta para los desafíos de ecuaciones e inversas que siguen.`
  ),
  recovered: line(
    "feliz",
    "Ahí encontraste el camino",
    `¡Muy bien corregido! Tropezaste primero, leíste la pista sin apurarte a adivinar y reconstruiste el razonamiento paso por paso. Diagnosticar dónde estuvo el tropiezo y ajustar la cuenta es exactamente la forma en que se consolida la matemática de verdad.`
  ),
  repeatedError: line(
    "enojada",
    "Basta de adivinar",
    `¡Frená un momento con el teclado! Ya van dos intentos fallidos seguidos y tirar respuestas al azar no te va a destrabar el ejercicio. Abrí la primera pista, chequeá la condición de existencia de los argumentos y planteá la transformación por escrito en un borrador.`
  ),
  flawlessRun: line(
    "sonrojada",
    "N-no te agrandes...",
    `¿Sacaste todo este bloque limpio al primer intento y sin usar pistas?... B-bueno, admito que estuviste muy sólida en cada paso y no caíste en ninguna trampa clásica. No te relajes igual, que todavía quedan las ecuaciones con filtro de dominio y los modelos reales.`
  ),
  showSolution: line(
    "colapso",
    "Resolución desglosada",
    `Tranquila, trabarse en un despeje logarítmico le pasa a todo el mundo cuando se mezclan las leyes de exponentes con los filtros de positividad. Vamos a abrir el desarrollo completo paso a paso para identificar exactamente en qué eslabón se cortaba la cadena.`
  ),
  solutionAfter: line(
    "empatia",
    "Seguimos construyendo",
    `Ahora que tenés toda la resolución a la vista, no te quedes solo con el número final: fijate por qué se aplicó esa propiedad y cómo se controló el dominio al terminar. En el próximo ejercicio vas a poder reproducir la misma estructura por tu cuenta.`
  ),
};

// =============================================================================
// LOS 12 GUIONES ARTESANALES (6 PRINCIPALES + 6 BASE DESDE CERO)
// =============================================================================

export const VN_SCRIPTS = {
  // ---------------------------------------------------------------------------
  // SECCIÓN 1: Definición, existencia y bases especiales
  // ---------------------------------------------------------------------------
  "sec1-definicion": [
    line(
      "base",
      "La pregunta inversa a la potencia",
      `Te doy la bienvenida al último eslabón del dúo exponencial. Hasta acá sabíamos responder cuánto da una potencia cuando conocemos el exponente. El logaritmo da vuelta el tablero: nos da la base y el resultado, y nos pregunta cuál fue el exponente que los conectó.`
    ),
    line(
      "pensativa",
      "Traducción al idioma potencia",
      `Cada vez que veas escrito <span class="eq">log<sub>2</sub>(64)</span>, leelo sin miedo como una pregunta directa: ¿a qué exponente tengo que elevar el dos para llegar a sesenta y cuatro? Como dos a la sexta da sesenta y cuatro, el logaritmo vale exactamente seis.`
    ),
    line(
      "explicando",
      "Los tres candados de la aduana",
      `Para que esta operación exista en los reales heredamos las reglas de la exponencial: la base <span class="eq">a</span> debe ser positiva y distinta de uno, y el argumento <span class="eq">x</span> debe ser estrictamente positivo. Ni cero ni negativos pueden entrar al argumento.`
    ),
    line(
      "complice",
      "Dos apodos famosos de calculadora",
      `Por comodidad histórica, dos bases ni siquiera se escriben en el subíndice. Cuando leas <span class="eq">log(x)</span> sin numerito abajo, la base implícita es diez; y cuando veas <span class="eq">ln(x)</span>, estás frente al logaritmo natural en base e.`
    ),
    line(
      "evaluando",
      "Poné a prueba la aduana",
      `Probá los deslizadores y botones en el explorador de bases del pizarrón. Mirá qué le pasa a la curva cuando acercás la base a uno o intentás evaluar argumentos nulos o negativos antes de pasar a los chequeos.`,
      "#log-widget-1"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 2: Las 5 propiedades operativas y cambio de base
  // ---------------------------------------------------------------------------
  "sec2-propiedades": [
    line(
      "base",
      "Logaritmos y exponentes son el mismo idioma",
      `Las cinco propiedades operativas de los logaritmos no salieron de una galera mágica: son el reflejo exacto de las leyes de potencias leídas desde el exponente. Si recordás qué pasa con los exponentes al multiplicar potencias, ya sabés por qué los logaritmos suman.`
    ),
    line(
      "explicando",
      "Producto, cociente, potencia y raíz",
      `Multiplicar argumentos adentro se transforma en suma de logaritmos afuera; dividir argumentos se transforma en resta. Si el argumento está elevado a una potencia o metido bajo una raíz de índice n, ese exponente o fracción baja multiplicando adelante.`
    ),
    line(
      "complice",
      "El salvavidas del cambio de base",
      `¿Necesitás operar con <span class="eq">log<sub>&radic;b</sub>(2)</span> o calcular un logaritmo en base siete con calculadora? El cambio de base transforma cualquier base incómoda en un cociente limpio: <span class="eq">log<sub>a</sub>(x) = log<sub>b</sub>(x) / log<sub>b</sub>(a)</span>, siempre con el argumento arriba y la base abajo.`
    ),
    line(
      "lentes-brillo",
      "Cuidado con las falsas distributivas",
      `Acá cae la mayoría en los parciales: el logaritmo de una suma jamás se separa en suma de logaritmos, y multiplicar dos logaritmos sueltos tampoco se junta sumando sus argumentos. Ante cualquier duda, enchufá números sencillos y verificá que las cuentas no coinciden.`
    ),
    line(
      "evaluando",
      "Laborate el detector de leyes",
      `Compará en el tablero las cinco leyes verdaderas contra las cuatro identidades tramposas. Observá cómo las barras de colores coinciden al milímetro en las reglas reales y muestran un hueco rosa de contraejemplo apenas elegís una fórmula falsa.`,
      "#log-widget-2"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 3: Ecuaciones logarítmicas, exponenciales no comunes y sistemas
  // ---------------------------------------------------------------------------
  "sec3-ecuaciones": [
    line(
      "pensativa",
      "Despejar sin perder restricciones",
      `Cuando resolvemos ecuaciones logarítmicas, nuestro primer paso ocurre antes de hacer cuentas: anotamos las condiciones de existencia exigiendo que cada argumento original sea positivo. Ese filtro es nuestra aduana final cuando aparezcan las candidatas.`
    ),
    line(
      "explicando",
      "Unificar y aplicar definición o inyectividad",
      `Primero condensamos los logaritmos de igual base con las propiedades operativas hasta dejar un único logaritmo igualado a otro o a un número. En <span class="eq">log<sub>2</sub>(x+1) + log<sub>2</sub>(x&minus;2) = log<sub>2</sub>(4)</span>, la cuadrática arroja tres y menos dos, pero menos dos se descarta porque negativiza ambos argumentos.`
    ),
    line(
      "complice",
      "El contraste clave en las cuadráticas",
      `¡Ojo con mezclar sustituciones! Cuando hacés <span class="eq">u = e<sup>x</sup></span>, solo sirven raíces positivas porque la exponencial jamás es negativa ni cero. En cambio, cuando sustituís <span class="eq">u = log<sub>3</sub>(x&minus;1)</span>, la imagen del logaritmo cubre todo el eje real, así que una u negativa sí produce una solución válida.`
    ),
    line(
      "feliz",
      "Exponenciales rebeldes y sistemas",
      `Si te aparece <span class="eq">4<sup>x</sup> = 9</span> y las bases no se pueden igualar, aplicás logaritmo a ambos lados para bajar la equis del exponente. Y en sistemas de dos incógnitas, podés sustituir los logaritmos como variables lineales y chequear al final que ambas incógnitas den positivas.`
    ),
    line(
      "evaluando",
      "Equilibrá la balanza algebraica",
      `Avanzá paso a paso en la balanza de ecuaciones para ver cómo se filtra el dominio. Probá también el botón que simula aceptar la raíz extraña y observá por qué la balanza colapsa al intentar evaluar el logaritmo de un número negativo.`,
      "#log-widget-3"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 4: Inversa de la exponencial y reflexión respecto de y = x
  // ---------------------------------------------------------------------------
  "sec4-espejo": [
    line(
      "base",
      "Dos caras simétricas de la misma moneda",
      `Toda función exponencial estrictamente monótona es inyectiva, y si ajustamos su codominio a su imagen abierta se vuelve biyectiva y admite inversa. Esa función inversa es precisamente el logaritmo en la misma base, reflejado al otro lado del espejo.`
    ),
    line(
      "eureka",
      "El intercambio total en el espejo",
      `¡Esta es la conexión más elegante de toda la unidad! Al reflejar respecto de la diagonal <span class="eq">y = x</span>, cada par ordenado intercambia sus coordenadas: el punto clave cero coma uno de la exponencial salta al uno coma cero del logaritmo, y el dominio y la imagen permutan sus papeles.`
    ),
    line(
      "explicando",
      "La asíntota también gira noventa grados",
      `Fijate qué le pasa a la frontera invisible: si la exponencial tenía una asíntota horizontal en <span class="eq">y = &minus;3</span> con imagen abierta desde menos tres a más infinito, su inversa logarítmica hereda una asíntota vertical en <span class="eq">x = &minus;3</span> con exactamente ese intervalo como dominio.`
    ),
    line(
      "pensativa",
      "Receta limpia para despejar la inversa",
      `Para hallar la fórmula explícita de la inversa de <span class="eq">f(x) = 2e<sup>x</sup> &minus; 3</span>, aislás la potencia sumando tres y dividiendo por dos, aplicás logaritmo natural y declarás sin falta el dominio restringido a los valores donde el argumento queda positivo.`
    ),
    line(
      "evaluando",
      "Mové el punto sobre el espejo",
      `Arrastrá el punto amarillo sobre la curva exponencial en el tablero o usá las flechas del teclado para moverlo paso a paso. Mirá cómo el punto azul reflejado cruza perpendicularmente la recta diagonal manteniendo intacta la simetría exacta.`,
      "#log-widget-4"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 5: Radiografía funcional, desplazamientos y cortes
  // ---------------------------------------------------------------------------
  "sec5-radiografia": [
    line(
      "base",
      "Leer la anatomía completa de un vistazo",
      `Para estudiar cualquier función logarítmica desplazada, lo primero que mirás es el signo y el borde del argumento. Igualar lo de adentro a cero te entrega inmediatamente la ecuación de la asíntota vertical, y exigir que sea mayor que cero te da el dominio completo.`
    ),
    line(
      "sospecha",
      "Cuidado cuando la x tiene signo menos",
      `Mirá el contraste entre <span class="eq">log<sub>2</sub>(x &minus; 4)</span> y <span class="eq">log<sub>2</sub>(4 &minus; x)</span>. En la segunda, la variable viene restando: para que cuatro menos equis sea positivo necesitás valores menores que cuatro, así que la curva vive a la izquierda de su asíntota vertical y cambia su sentido de crecimiento.`
    ),
    line(
      "explicando",
      "Ceros, ordenada y conjuntos de signos",
      `Mientras la exponencial puede no tener raíz real cuando no cruza al eje equis, todo logaritmo tiene imagen igual a todos los reales y por eso corta exactamente una vez al eje horizontal. En cambio, puede no tener ordenada al origen si cero queda fuera de su dominio.`
    ),
    line(
      "complice",
      "Biyectividad natural e intersecciones",
      `Si definís el codominio como todos los reales y el dominio como su intervalo maximal abierto, la función logarítmica es biyectiva sin tener que recortar ramas. Y para hallar el corte entre dos curvas logarítmicas, igualás sus fórmulas respetando la intersección de ambos dominios.`
    ),
    line(
      "evaluando",
      "Inspeccioná cada región en el pizarrón",
      `Probá los casos clásicos del selector en la radiografía funcional y alterná los filtros de raíz, ordenada y signos. Verificá con los deslizadores cómo se invierte el sombreado positivo y negativo al cambiar la base o el signo dentro del argumento.`,
      "#log-widget-5"
    ),
  ],

  // ---------------------------------------------------------------------------
  // SECCIÓN 6: Modelos reales de tiempo y escalas logarítmicas
  // ---------------------------------------------------------------------------
  "sec6-modelos": [
    line(
      "base",
      "Despejar la incógnita atrapada en el tiempo",
      `En la unidad anterior podíamos predecir cuántas bacterias habría tras cierto tiempo o qué masa quedaría después de tres horas. Ahora el logaritmo nos da la llave inversa: nos permite preguntar cuánto tiempo tiene que pasar para alcanzar una meta o eliminar el cincuenta por ciento de un contaminante.`
    ),
    line(
      "eureka",
      "El mismo método destraba todos los modelos",
      `¡Mirá qué unidad conceptual tan limpia! Ya sea un cultivo bacteriano con base e, un fármaco que decae al ochenta por ciento por hora o un modelo logístico con tope, siempre aislás primero la exponencial hasta dejarla sola y recién ahí aplicás el logaritmo para bajar el tiempo del exponente.`
    ),
    line(
      "unamused",
      "La trampa de la escala de Richter",
      `Mucho cuidado cuando modelás terremotos con <span class="eq">M = log(p)</span>. Como la escala es logarítmica en base diez, cada punto entero que sube la magnitud multiplica la potencia por diez. Pasar de magnitud cuatro coma uno a ocho coma dos no duplica la fuerza: la multiplica por diez elevado a cuatro coma uno.`
    ),
    line(
      "pensativa",
      "Coherencia estricta de unidades",
      `Antes de meter números en la fórmula, chequeá las unidades de medida del enunciado. Si la altura del árbol está en centímetros y te preguntan cuándo alcanza dos metros, convertí primero a doscientos centímetros; y si la presión pide altura en kilómetros, pasá tres mil quinientos metros a tres coma cinco kilómetros.`
    ),
    line(
      "evaluando",
      "Modelá y contrastá los casos reales",
      `Recorré los ejemplos resueltos paso a paso y el comparador de escalas antes de resolver los chequeos finales de la sección. Prestá atención a cuándo el problema pide usar logaritmo natural y cuándo conviene trabajar en base diez.`,
      "#sec-6-modelos"
    ),
  ],

  // ===========================================================================
  // LOS 6 GUIONES DE "BASE DESDE CERO: LO QUE NADIE TE EXPLICA"
  // ===========================================================================

  "sec1-base": [
    line(
      "empatia",
      "La palabra rara que solo pregunta por un exponente",
      `Escuchar la palabra logaritmo por primera vez suena a código secreto de ingeniería, pero la idea de fondo ya la usás desde que aprendiste potencias. Solo estamos dando vuelta la pregunta que siempre hacías al multiplicar un número varias veces por sí mismo.`
    ),
    line(
      "pensativa",
      "Pensalo como un ascensor de multiplicaciones",
      `Imaginate un ascensor donde cada piso multiplica tu número por dos: en el piso uno tenés dos, en el dos tenés cuatro, en el tres llegás a ocho. El logaritmo en base dos simplemente te dice en qué número de piso te bajaste para ver el ocho: piso tres.`
    ),
    line(
      "explicando",
      "Por qué no podés pedir piso cero ni negativo",
      `Como el ascensor arranca multiplicando desde uno y siempre multiplica por un número positivo, jamás vas a pasar por cero ni por números negativos sin importar cuánto subas o bajes. Por eso <span class="eq">log<sub>2</sub>(0)</span> y <span class="eq">log<sub>2</sub>(&minus;4)</span> no existen en los reales.`
    ),
    line(
      "base",
      "Exponentes negativos sí valen afuera",
      `Ojo con no confundir el argumento con el resultado del logaritmo. El argumento adentro del paréntesis debe ser positivo, pero el resultado afuera sí puede ser negativo: bajar tres pisos en base dos te lleva a un octavo, así que <span class="eq">log<sub>2</sub>(1/8) = &minus;3</span>.`
    ),
    line(
      "feliz",
      "Una sola frase para recordar todo",
      `Cada vez que te trabes con un logaritmo, traducilo mentalmente a una potencia con casillero vacío: la base elevada a cuánto me da lo que está adentro del paréntesis. Con esa traducción ya tenés medio problema resuelto.`
    ),
  ],

  "sec2-base": [
    line(
      "empatia",
      "¿Por qué la multiplicación se vuelve suma?",
      `Ver que un producto adentro del logaritmo se transforma en una suma afuera parece magia arbitraria si te lo hacen memorizar de una tabla. En realidad pasa exactamente lo mismo que hacías cuando sumabas exponentes al multiplicar potencias de igual base.`
    ),
    line(
      "pensativa",
      "Contando saltos con los dedos",
      `Mirá este ejemplo con base dos: ocho es tres saltos de multiplicación y cuatro son dos saltos. Si multiplicás ocho por cuatro obtenés treinta y dos, que en total son tres más dos igual cinco saltos. Como el logaritmo cuenta saltos, el logaritmo de un producto suma los saltos de cada factor.`
    ),
    line(
      "explicando",
      "Por qué la suma adentro no funciona igual",
      `En cambio, si sumás ocho más cuatro te da doce, que no equivale a juntar paquetes multiplicativos de dos. Las reglas de potencias jamás te permiten sumar exponentes cuando hay una suma de términos en el medio, y por eso el logaritmo tampoco se reparte sobre una suma.`
    ),
    line(
      "complice",
      "El truco del sombrero para potencias",
      `Cuando el argumento tiene un exponente como <span class="eq">log<sub>2</sub>(8<sup>5</sup>)</span>, multiplicar cinco veces por ocho es repetir cinco veces sus tres saltos. Por eso el cinco del sombrero baja multiplicando afuera. Pero si el cuadrado está afuera de todo el logaritmo, primero resolvés el logaritmo entero y después elevás.`
    ),
    line(
      "feliz",
      "Probá siempre con números chicos",
      `Si alguna vez en un examen dudás de una propiedad, no adivines a ciegas: elegí base dos, poné cuatro y ocho, y hacé las dos cuentas con números reales. En diez segundos sabés con certeza absoluta si la regla es verdadera o es una trampa.`
    ),
  ],

  "sec3-base": [
    line(
      "empatia",
      "¿Por qué se tachan soluciones que despejé bien?",
      `Da mucha bronca resolver perfecta una ecuación cuadrática, sacar dos números lindos y que al final te digan que uno no sirve. No es que tu álgebra falló: es que al juntar dos logaritmos en uno solo ampliaste sin querer los valores permitidos.`
    ),
    line(
      "sospecha",
      "El efecto colateral de juntar productos",
      `Pensá en multiplicar dos números negativos: menos uno por menos cuatro da más cuatro positivo, aunque cada factor por separado era negativo. Al unir <span class="eq">log<sub>2</sub>(x+1) + log<sub>2</sub>(x&minus;2)</span> en un único producto adentro, dejaste colar valores de equis que vuelven negativos a los paréntesis originales.`
    ),
    line(
      "explicando",
      "La regla de oro de la verificación",
      `Por eso en toda ecuación logarítmica la cuenta algebraica solo entrega candidatas, nunca el conjunto solución definitivo. Tenés que agarrar cada candidata y reemplazarla en todos los logaritmos del enunciado inicial para chequear que cada argumento quede mayor que cero.`
    ),
    line(
      "base",
      "No confundas x con el valor del logaritmo",
      `También recordá esta diferencia vital: una cosa es que el argumento adentro deba ser positivo, y otra muy distinta es cuánto puede valer el logaritmo entero. Si la incógnita sustituye al logaritmo completo <span class="eq">u = log<sub>3</sub>(x&minus;1)</span>, un resultado como u igual menos tres es perfectamente válido.`
    ),
    line(
      "feliz",
      "Aduana limpia, solución segura",
      `Acostumbrate a escribir la condición de existencia arriba a la derecha antes de empezar a despejar. Cuando termines las cuentas, mirás ese renglón y en cinco segundos sabés qué raíz entra al conjunto solución y cuál queda afuera.`
    ),
  ],

  "sec4-base": [
    line(
      "empatia",
      "¿Qué significa reflejar sobre la recta y = x?",
      `La frase simetría respecto de la bisectriz del primer cuadrante suena abstracta hasta que doblás una hoja de papel por la diagonal que corta a cuarenta y cinco grados. Todo lo que está de un lado de la diagonal se calca exactamente del otro lado.`
    ),
    line(
      "pensativa",
      "Dar vuelta las columnas de una tabla",
      `Para construir la inversa no hace falta imaginar giros complicados en el espacio: agarrá una tabla de <span class="eq">2<sup>x</sup></span> y da vuelta las dos columnas. Donde decía x igual cero e y igual uno, ahora escribís x igual uno e y igual cero; donde decía tres coma ocho, ponés ocho coma tres.`
    ),
    line(
      "explicando",
      "El piso se convierte en pared",
      `Como la recta <span class="eq">y = x</span> intercambia lo horizontal con lo vertical, todo límite horizontal de la exponencial gira y se vuelve un límite vertical en el logaritmo. Si la exponencial nunca podía bajar del piso cero, su inversa nunca podrá cruzar la pared vertical del eje Y.`
    ),
    line(
      "complice",
      "Dominio e imagen cambian de camiseta",
      `Este atajo te ahorra la mitad del trabajo en análisis de funciones: apenas conocés la imagen abierta de tu exponencial, automáticamente ya conocés el dominio exacto de su función inversa logarítmica, sin tener que resolver ninguna inecuación extra.`
    ),
    line(
      "feliz",
      "Dos curvas que se entienden juntas",
      `Una vez que ves las dos gráficas dibujadas juntas alrededor de la línea punteada diagonal, dejás de estudiar exponenciales y logaritmos como dos capítulos sueltos y pasás a verlos como la misma curva mirada desde el otro eje.`
    ),
  ],

  "sec5-base": [
    line(
      "empatia",
      "¿Por qué a veces el dominio va hacia la izquierda?",
      `La mayoría de los ejemplos rápidos muestran logaritmos que viven hacia la derecha de una asíntota vertical, así que cuando aparece <span class="eq">log<sub>2</sub>(4 &minus; x)</span> es normal quedarse mirando raro el signo menos delante de la equis.`
    ),
    line(
      "pensativa",
      "La única regla que manda es lo de adentro mayor a cero",
      `No memorices para qué lado apunta el dominio: planteá siempre la desigualdad <span class="eq">4 &minus; x &gt; 0</span> y despejá con calma. Al pasar la equis sumando te queda cuatro mayor que equis, es decir, equis menor que cuatro: toda la gráfica vive a la izquierda de cuatro.`
    ),
    line(
      "explicando",
      "Cómo leer el crecimiento sin adivinar",
      `Si el coeficiente adelante es positivo y la base es mayor que uno, normalmente la curva sube. Pero si adentro la equis viene con signo menos, al avanzar hacia la derecha el argumento se achica hacia cero y hace caer el logaritmo: la función se vuelve decreciente.`
    ),
    line(
      "base",
      "Raíz garantizada y ordenada opcional",
      `Como el logaritmo recorre todas las alturas desde menos infinito hasta más infinito, siempre va a cruzar el eje horizontal en un punto. En cambio, si el dominio quedó todo de un lado del origen, la curva nunca tocará el eje vertical y no habrá ordenada al origen.`
    ),
    line(
      "feliz",
      "Paso a paso no falla ninguna gráfica",
      `Con estos cuatro chequeos ordenados —borde del argumento, dominio abierto, raíz donde el argumento vale uno y signo de crecimiento— podés hacer la radiografía completa de cualquier logaritmo en menos de dos minutos.`
    ),
  ],

  "sec6-base": [
    line(
      "empatia",
      "¿Para qué inventaron la escala de Richter o el pH?",
      `Cuando en la naturaleza tenés fenómenos donde un evento puede ser diez mil o diez millones de veces más grande que otro, dibujarlos en una regla común es imposible: o no ves los chicos o se te sale del cuaderno el grande.`
    ),
    line(
      "pensativa",
      "Comprimir potencias de diez en escalones suaves",
      `La escala logarítmica resuelve eso midiendo el exponente en lugar del número gigante. Si un sismo libera cien veces la potencia base, su logaritmo en base diez es dos; si libera un millón de veces, su logaritmo es apenas seis. Así podés comparar ambos en la misma tabla.`
    ),
    line(
      "explicando",
      "El precio de comprimir: cada punto vale por diez",
      `Pero esa comodidad trae una trampa mental: en nuestra cabeza seis parece apenas el triple de dos, cuando en potencia real diez a la sexta es diez mil veces más fuerte que diez al cuadrado. Cada unidad que subís en una escala logarítmica multiplica por la base.`
    ),
    line(
      "complice",
      "Aislar la potencia antes de aplicar logaritmo",
      `En problemas de bacterias, fármacos o lagos contaminados, nunca apliques logaritmo mientras haya coeficientes sumando o multiplicando afuera. Primero dejá sola la potencia <span class="eq">e<sup>kt</sup> = número</span>, y recién ahí aplicás <span class="eq">ln</span> a ambos miembros.`
    ),
    line(
      "feliz",
      "Un traductor entre escalas y tiempo real",
      `Cada vez que un modelo te pregunte cuánto tiempo falta para alcanzar una meta o cuántas veces mayor es una intensidad, pensá en el logaritmo como la herramienta que baja exponentes a la tierra firme de la aritmética.`
    ),
  ],
};

// =============================================================================
// ALIAS UNIVERSAL (secN-why, sec-N, sec-N-basico)
// =============================================================================

const MAIN_SHORT_NAMES = [
  "definicion",
  "propiedades",
  "ecuaciones",
  "espejo",
  "radiografia",
  "modelos",
];

for (let i = 1; i <= 6; i++) {
  const canonicalMain = `sec${i}-${MAIN_SHORT_NAMES[i - 1]}`;
  const canonicalBase = `sec${i}-base`;
  VN_SCRIPTS[`sec${i}-why`] = VN_SCRIPTS[canonicalMain];
  VN_SCRIPTS[`sec-${i}`] = VN_SCRIPTS[canonicalMain];
  VN_SCRIPTS[`sec-${i}-basico`] = VN_SCRIPTS[canonicalBase];
}
