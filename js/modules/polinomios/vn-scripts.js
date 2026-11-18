/**
 * @file js/modules/polinomios/vn-scripts.js
 * Guiones artesanales de Visual Novel para Unidad 06: Polinomios (14 guiones: 7 principales + 7 -base).
 * Voseo rioplatense natural, cero citas burocráticas de página, cero LaTeX crudo, cero emojis.
 */

const balloon = (pose, tag, content, highlightSelector = null) => {
  const b = {
    pose,
    tag,
    speaker: 'Alaska',
    html: content,
    text: content,
  };
  if (highlightSelector) b.highlightSelector = highlightSelector;
  return b;
};

export const VN_SCRIPTS = {
  /* ========================================================================
   * SECCIÓN 1 · ESTRUCTURA, GRADO Y POLINOMIO NULO
   * ======================================================================== */
  sec1: [
    balloon(
      'base',
      'ADN de un polinomio',
      'Un polinomio es una suma ordenada de potencias enteras no negativas de x. En cuanto ves una x metida en un denominador o abajo de una raíz, saliste del club.'
    ),
    balloon(
      'sospecha',
      'Cuidado con el desorden',
      'Si alguien escribe 5 − 3x<sup>2</sup> + 2x<sup>4</sup>, no le creas al primer número de la izquierda. El grado y el coeficiente principal siempre los manda el exponente más alto, acá 2x<sup>4</sup>.',
      '[data-widget="inspector-polinomios"]'
    ),
    balloon(
      'lentes-brillo',
      'El caso cero',
      'El polinomio nulo P(x) = 0 es el único rebelde que no tiene grado. Una constante como P(x) = 5 sí tiene grado 0 porque equivale a 5x<sup>0</sup>.'
    ),
    balloon(
      'explicando',
      'Mónico y completo',
      'Decimos que es mónico cuando su coeficiente principal vale 1. Y completarlo significa rellenar con 0x<sup>k</sup> los huecos para que no falte ningún escalón.'
    ),
    balloon(
      'complice',
      'Igualdad sin misterios',
      'Dos polinomios son iguales únicamente cuando coinciden coeficiente a coeficiente en cada potencia de x, por más disfrazados que vengan los paréntesis.'
    ),
  ],

  'sec1-base': [
    balloon(
      'empatia',
      'Sin miedo a las potencias',
      'Si ver muchos términos juntos te marea, pensalo como una estantería con casilleros numerados: el casillero x<sup>3</sup>, el casillero x<sup>2</sup>, el de x y el número suelto.'
    ),
    balloon(
      'explicando',
      'Cada casillero en su lugar',
      'Cada término lleva un número multiplicando (su coeficiente) y una potencia entera de x. Nunca mezclamos cosas de distintos casilleros al sumar.'
    ),
    balloon(
      'pensativa',
      '¿Qué es el término independiente?',
      'Es el número que no tiene x a la vista, como el −2 al final. En realidad acompaña a x<sup>0</sup> = 1 y marca cuánto vale P(0).'
    ),
    balloon(
      'evaluando',
      '¿Por qué 1/x no entra?',
      'Porque 1/x equivale a x<sup>−1</sup>, y los polinomios solo admiten exponentes naturales más el cero: 0, 1, 2, 3...'
    ),
    balloon(
      'feliz',
      'Probalo en el inspector',
      'Cargá expresiones en el inspector del pizarrón y mirá cómo cada término cae en su casillero o se enciende en rosa si rompe las reglas.'
    ),
  ],

  /* ========================================================================
   * SECCIÓN 2 · OPERACIONES Y LEYES DEL GRADO
   * ======================================================================== */
  sec2: [
    balloon(
      'explicando',
      'Sumar por especie',
      'Sumar o restar polinomios es juntar coeficientes de potencias idénticas: x<sup>3</sup> con x<sup>3</sup>, x<sup>2</sup> con x<sup>2</sup>. Jamás cambian los exponentes al sumar.'
    ),
    balloon(
      'colapso',
      'La fuga del signo menos',
      'El error más caro en P(x) − Q(x) es cambiar el signo solo del primer término de Q(x). El menos delante del paréntesis da vuelta absolutamente todos los signos de Q(x).',
      '[data-widget="constructor-algebraico"]'
    ),
    balloon(
      'pensativa',
      '¿Qué pasa con el grado al sumar?',
      'Al sumar dos polinomios de grado 3, el resultado suele tener grado 3... salvo que los términos principales sean opuestos (+x<sup>3</sup> y −x<sup>3</sup>) y se cancelen, bajando el grado.'
    ),
    balloon(
      'evaluando',
      'Multiplicar suma exponentes',
      'En el producto P(x) · Q(x), la propiedad distributiva multiplica cada término con cada término y los grados sí se suman: gr(P · Q) = gr(P) + gr(Q).'
    ),
    balloon(
      'orgullosa',
      'Despejar un polinomio incógnita',
      'Cuando te piden hallar P(x) en una ecuación polinómica, operá los términos conocidos primero y tratá a P(x) como una incógnita limpia de álgebra.'
    ),
  ],

  'sec2-base': [
    balloon(
      'empatia',
      'Orden antes de operar',
      'Antes de restar o multiplicar dos polinomios largos, acomodalos en columnas por grado. Ese minuto extra evita el noventa por ciento de los errores tontos.'
    ),
    balloon(
      'explicando',
      'El paréntesis protector',
      'Cada vez que restes Q(x), encerralo entero entre paréntesis después del signo menos: P(x) − (Q(x)). Recién en el renglón siguiente repartí el −1.'
    ),
    balloon(
      'pensativa',
      'Potencia de un polinomio',
      'Elevar un binomio al cuadrado o al cubo es multiplicarlo por sí mismo. Recordá que la potencia nunca se reparte sobre la suma.'
    ),
    balloon(
      'evaluando',
      'Atajo para el coeficiente principal',
      'Si solo te piden el coeficiente principal o el término independiente de un producto gigante, no hace falta desarrollar todo: multiplicá únicamente los extremos.'
    ),
    balloon(
      'complice',
      'Verificalo en los rieles',
      'Cambiá la operación a resta en el pizarrón y mirá cómo la fila de Q(x) invierte todos sus signos antes de sumarse.'
    ),
  ],

  /* ========================================================================
   * SECCIÓN 3 · DIVISIÓN EUCLÍDEA Y DIVISIBILIDAD
   * ======================================================================== */
  sec3: [
    balloon(
      'base',
      'La identidad de la división',
      'Dividir P(x) por Q(x) no es adivinar: es encontrar C(x) y R(x) tales que P(x) = Q(x) · C(x) + R(x).'
    ),
    balloon(
      'explicando',
      '¿Cuándo se detiene la cuenta?',
      'El proceso termina en el instante exacto en que el resto es cero o su grado resulta estrictamente menor que el grado del divisor Q(x).',
      '[data-widget="division-polinomica"]'
    ),
    balloon(
      'sospecha',
      'Dos cuidados clave',
      'Completá con ceros los grados faltantes del dividendo y no te olvides de restar todo el subtraendo multiplicado en cada paso.'
    ),
    balloon(
      'eureka',
      'Cuatro formas de decir lo mismo',
      'Si R(x) = 0, entonces P(x) es divisible por Q(x), P(x) es múltiplo de Q(x) y Q(x) es divisor de P(x). Cuatro frases equivalentes para el mismo resto nulo.'
    ),
    balloon(
      'orgullosa',
      'La prueba infalible',
      'Siempre podés chequear tu cuenta en treinta segundos multiplicando Q(x) · C(x) y sumando R(x): si no reconstruye P(x) exacto, algo falló.'
    ),
  ],

  'sec3-base': [
    balloon(
      'empatia',
      'Igual que dividir números',
      '¿Te acordás de la división larga de la primaria? Con polinomios es idéntico, solo que en vez de mirar la primera cifra mirás el término de mayor grado.'
    ),
    balloon(
      'explicando',
      'Primer paso del algoritmo',
      'Dividís el término principal del dividendo por el término principal del divisor: ese cociente va abajo del divisor y te dicta el próximo paso.'
    ),
    balloon(
      'evaluando',
      'Restar para bajar un grado',
      'Multiplicás ese término por todo Q(x) y lo restás debajo de P(x). Si elegiste bien, el término de mayor grado se cancela siempre a cero.'
    ),
    balloon(
      'pensativa',
      '¿Qué pasa si gr(P) < gr(Q)?',
      'Entonces no podés ni empezar: el cociente es C(x) = 0 y el resto es directamente todo el dividendo P(x).'
    ),
    balloon(
      'feliz',
      'Seguilo paso a paso',
      'Avanzá la división larga con los botones del pizarrón y mirá cómo en cada renglón baja un escalón el grado del resto.'
    ),
  ],

  /* ========================================================================
   * SECCIÓN 4 · REGLA DE RUFFINI Y TEOREMA DEL RESTO
   * ======================================================================== */
  sec4: [
    balloon(
      'base',
      'El atajo para divisores lineales',
      'Cuando el divisor tiene forma (x − a), la Regla de Ruffini comprime toda la división larga en una tabla de tres filas usando solo los coeficientes.'
    ),
    balloon(
      'panico',
      '¡No te comas los ceros!',
      'Si falta un término, como en x<sup>4</sup> − 2, tenés que escribir 1, 0, 0, 0, −2 en el renglón de arriba. Omitir un cero desarma toda la tabla.'
    ),
    balloon(
      'sospecha',
      'Ojo con el signo de la esquina',
      'En la esquina izquierda ponés la raíz a que anula al divisor: para (x − 2) va +2, pero para (x + 3) va −3.',
      '[data-widget="laboratorio-ruffini"]'
    ),
    balloon(
      'lentes-brillo',
      'Divisor no mónico (ax − b)',
      'Si dividís por (3x + 1), ponés r = −1/3 en la esquina. El resto sale exacto, pero el cociente de la tabla queda multiplicado por 3: dividilo por 3 al final.'
    ),
    balloon(
      'complice',
      'Teorema del Resto',
      'Si solo necesitás el resto de dividir P(x) por (x − a), ni armes la tabla: evaluá P(a) directamente. Y si P(a) = 0, encontraste una raíz.'
    ),
  ],

  'sec4-base': [
    balloon(
      'empatia',
      'De la tabla al significado',
      'Ruffini parece mágico hasta que ves qué hace: bajar el primer número, multiplicar por a, sumar y repetir es exactamente la evaluación anidada de Horner.'
    ),
    balloon(
      'explicando',
      'Dónde vive el resto',
      'El último número de la fila inferior de Ruffini no forma parte del cociente: separalo con una rayita vertical porque es el resto R.'
    ),
    balloon(
      'evaluando',
      'El grado del cociente',
      'Al dividir por un polinomio de grado 1, el cociente C(x) siempre tiene exactamente un grado menos que el dividendo P(x).'
    ),
    balloon(
      'pensativa',
      'Raíz = resto cero',
      'Decir que a es raíz de P(x), que P(a) = 0 o que (x − a) divide exactamente a P(x) son tres formas de enunciar el mismo hecho.'
    ),
    balloon(
      'feliz',
      'Probá el caso 3x + 1',
      'Elegí el preset no mónico en el laboratorio y observá cómo la barra inferior divide el cociente por 3 mientras deja intacto el resto.'
    ),
  ],

  /* ========================================================================
   * SECCIÓN 5 · FACTORIZACIÓN EN PRIMOS Y LOS 6 MÉTODOS
   * ======================================================================== */
  sec5: [
    balloon(
      'base',
      'Desarmar hasta factores primos',
      'Factorizar un polinomio es escribirlo como producto de su coeficiente principal a<sub>n</sub> por polinomios mónicos primos: lineales (x − r) o cuadráticos sin raíces reales.'
    ),
    balloon(
      'pensativa',
      'No abandones al coeficiente principal',
      'Si P(x) = 2x<sup>2</sup> + 4x − 6, sus raíces son 1 y −3, pero escribir (x − 1)(x + 3) está mal: falta el 2 adelante multiplicando todo.'
    ),
    balloon(
      'explicando',
      'La caja de 6 herramientas',
      'Siempre empezá buscando factor común. Después revisá agrupación, diferencia de cuadrados, trinomio o cuatrinomio perfecto y resolvente cuadrática.',
      '[data-widget="detector-raices"]'
    ),
    balloon(
      'evaluando',
      'Multiplicidad algebraica',
      'Si un factor aparece como (x − r)<sup>m</sup>, decimos que r es raíz de multiplicidad m. Un polinomio de grado n tiene como máximo n raíces reales contadas con su multiplicidad.'
    ),
    balloon(
      'complice',
      'Ojo con los cuadráticos irreducibles',
      'Un factor como (x<sup>2</sup> + 1) o (x<sup>2</sup> + 3x + 9) tiene discriminante negativo: no se parte más en ℝ, por eso queda entero como factor primo.'
    ),
  ],

  'sec5-base': [
    balloon(
      'empatia',
      '¿Qué es un polinomio primo?',
      'Igual que el 7 en los enteros no se parte en factores menores, (x − 3) o (x<sup>2</sup> + 1) son ladrillos irreducibles en ℝ[x].'
    ),
    balloon(
      'explicando',
      'Regla de oro del primer paso',
      'Antes de asustarte con un polinomio de grado 4 o 5, mirá si todos los términos comparten una x o un número. Sacar x de factor común ya te regala la raíz 0.'
    ),
    balloon(
      'evaluando',
      'El cuatrinomio cubo perfecto',
      'Cuando veas cuatro términos con cubos en las puntas, verificá los triples productos 3a<sup>2</sup>b y 3ab<sup>2</sup> en el medio antes de afirmar que es (a ± b)<sup>3</sup>.'
    ),
    balloon(
      'sospecha',
      'Diferencia de cuadrados encubierta',
      'En x<sup>4</sup> − 16 aplicás diferencia de cuadrados una vez: (x<sup>2</sup> − 4)(x<sup>2</sup> + 4), pero (x<sup>2</sup> − 4) todavía se parte en (x − 2)(x + 2).'
    ),
    balloon(
      'feliz',
      'Ampliación visual opcional',
      'En el tablero podés activar la ampliación gráfica fuera de programa para ver cómo una raíz doble rebota y una simple cruza el eje X.'
    ),
  ],

  /* ========================================================================
   * SECCIÓN 6 · TEOREMA DE GAUSS Y RAÍCES REALES
   * ======================================================================== */
  sec6: [
    balloon(
      'base',
      'Cazando raíces racionales',
      '¿Cómo encontramos una raíz cuando no funciona el factor común ni la agrupación? El Teorema de Gauss acota la búsqueda infinita a una lista finita de fracciones p/q.'
    ),
    balloon(
      'unamused',
      'Prohibido invertir p y q',
      'En la fracción irreducible p/q, p divide al término independiente a<sub>0</sub> y q divide al coeficiente principal a<sub>n</sub>. Si los invertís, buscás en el lugar equivocado.',
      '[data-widget="explorador-gauss"]'
    ),
    balloon(
      'explicando',
      '¿Y si falta a₀?',
      'Gauss exige coeficientes enteros y término independiente distinto de cero. Si a<sub>0</sub> = 0, primero sacá x<sup>k</sup> de factor común y aplicá Gauss al resto.'
    ),
    balloon(
      'eureka',
      'La cadena ganadora: Gauss + Ruffini + Resolvente',
      'Apenas encontrás una raíz racional con Gauss, bajás un grado por Ruffini. Cuando el cociente llega a grado 2, la resolvente rescata incluso raíces irracionales como √7.'
    ),
    balloon(
      'orgullosa',
      'Verificá multiplicidades',
      'Una misma raíz racional puede volver a anular el cociente reducido: siempre volvé a probar la raíz que ya funcionó por si es doble o triple.'
    ),
  ],

  'sec6-base': [
    balloon(
      'empatia',
      '¿Para qué sirve Gauss?',
      'Probar números al azar puede llevar horas si la raíz es −1/2. Gauss te da una tabla chica con los únicos candidatos racionales posibles.'
    ),
    balloon(
      'explicando',
      'Armando la grilla p/q',
      'Listás todos los divisores positivos de a<sub>0</sub> en las filas (p), todos los de a<sub>n</sub> en las columnas (q), y formás ±p/q.'
    ),
    balloon(
      'evaluando',
      'Si el polinomio es mónico',
      'Cuando a<sub>n</sub> = 1, los únicos divisores q posibles son ±1, así que cualquier raíz racional de un mónico entero tiene que ser entera.'
    ),
    balloon(
      'pensativa',
      '¿Qué pasa si ningún p/q da cero?',
      'Significa que el polinomio no tiene raíces racionales: sus raíces pueden ser irracionales o directamente no tener raíces reales.'
    ),
    balloon(
      'feliz',
      'Probá la matriz interactiva',
      'Hacé clic en las celdas del explorador de Gauss para evaluar P(p/q) al instante y encadenar Ruffini hasta terminar de factorizar.'
    ),
  ],

  /* ========================================================================
   * SECCIÓN 7 · RECONSTRUCCIÓN, PARÁMETROS Y MODELADO
   * ======================================================================== */
  sec7: [
    balloon(
      'base',
      'Ingeniería inversa polinómica',
      'Cuando conocés las raíces de un polinomio de grado n, ya conocés casi toda su fórmula: P(x) = a<sub>n</sub> · (x − r<sub>1</sub>)...(x − r<sub>n</sub>). Solo falta fijar a<sub>n</sub>.'
    ),
    balloon(
      'explicando',
      'Un dato extra fija aₙ',
      'Si te dan tres raíces de una cúbica y además P(1) = 3, sustituís x = 1 e igualás a 3 para despejar el coeficiente principal a<sub>3</sub> de un solo golpe.'
    ),
    balloon(
      'sospecha',
      '¿Y si faltan raíces?',
      'Si solo conocés dos raíces de una cúbica, como P(0) = P(5) = 0, queda libre un factor lineal extra y existen infinitos polinomios que cumplen lo pedido.'
    ),
    balloon(
      'lentes-brillo',
      'Parámetros por divisibilidad',
      'Cuando piden k para que (x − r) divida a P(x), usá P(r) = 0. Así transformás un problema de división entera en una simple ecuación para k.'
    ),
    balloon(
      'orgullosa',
      'Volumen y sentido físico',
      'En problemas de prismas o cubos, igualás el polinomio volumen al valor dado, pasás todo a un lado para igualar a 0, factorizás con Gauss y descartás longitudes negativas.'
    ),
  ],

  'sec7-base': [
    balloon(
      'empatia',
      'Cómo leer el enunciado',
      'Cada frase del problema es una ecuación escondida: "es raíz" significa P(r) = 0; "es raíz doble" significa que (x − r)<sup>2</sup> aparece en el molde.'
    ),
    balloon(
      'explicando',
      'No te olvides del parámetro aₙ',
      'Muchos ponen directamente (x − r<sub>1</sub>)(x − r<sub>2</sub>)(x − r<sub>3</sub>) asumiendo a<sub>3</sub> = 1. Siempre dejá la letra a delante hasta comprobar cuánto vale.'
    ),
    balloon(
      'evaluando',
      'De raíz doble a grado 3',
      'Si una cúbica tiene a −2 como raíz doble y es divisible por (x − 5), su molde completo es Q(x) = a · (x + 2)<sup>2</sup> · (x − 5).'
    ),
    balloon(
      'pensativa',
      'Filtrar raíces en geometría',
      'Aunque la ecuación cúbica tenga tres soluciones reales, en un prisma real las aristas x, x − 2 o x + 2 tienen que ser todas estrictamente positivas.'
    ),
    balloon(
      'complice',
      'A practicar con foco',
      'Resolvé los últimos chequeos y después pasá al Entrenador para mezclar todos los métodos con semilla propia.'
    ),
  ],
};

export const SCRIPTS = VN_SCRIPTS;

export const DIAGNOSE_REACTIONS = Object.freeze({
  non_polynomial_accepted: {
    pose: 'unamused',
    tag: 'Fuera de los polinomios',
    text: 'Si aparece x con exponente negativo, bajo una raíz o en el denominador, esa expresión no es un polinomio.',
  },
  zero_poly_degree_zero: {
    pose: 'lentes-brillo',
    tag: 'Caso especial: P(x) = 0',
    text: '¡Ojo! El polinomio nulo P(x) = 0 es el único que NO tiene grado. El grado 0 es para constantes distintas de cero.',
  },
  wrong_leading_coeff_unordered: {
    pose: 'sospecha',
    tag: 'Polinomio desordenado',
    text: 'No leas el primer término de la izquierda sin mirar los exponentes: el coeficiente principal pertenece al término de mayor grado.',
  },
  subtract_poly_sign_leak: {
    pose: 'colapso',
    tag: 'Fuga de signo',
    text: 'En P(x) − Q(x), el signo menos cambia TODOS los signos dentro de Q(x), no solo el primero.',
  },
  added_degrees_on_sum: {
    pose: 'pensativa',
    tag: 'Leyes del grado',
    text: 'Los grados solo se suman al multiplicar polinomios. Al sumar o restar, gr(P + Q) <= máx(gr(P), gr(Q)).',
  },
  ruffini_sign_error: {
    pose: 'sospecha',
    tag: 'Signo en Ruffini',
    text: 'Cambiaste el signo de la raíz: en la esquina de Ruffini y en el Teorema del Resto va el valor que anula al divisor.',
  },
  ruffini_forgot_missing_zero_coeff: {
    pose: 'panico',
    tag: 'Faltaron ceros',
    text: 'En Ruffini el dividendo debe estar completo: agregá 0 por cada potencia ausente antes de armar la tabla.',
  },
  ruffini_unscaled_nonmonic_quotient: {
    pose: 'lentes-brillo',
    tag: 'Falta dividir por a',
    text: 'Al dividir por (ax − b) con Ruffini, el resto ya está listo pero al cociente de la tabla tenés que dividirlo por a.',
  },
  forgot_leading_coeff_factoring: {
    pose: 'pensativa',
    tag: 'Falta a_n',
    text: '¡Casi! Te faltó conservar el coeficiente principal a_n multiplicando adelante de los factores mónicos.',
  },
  swapped_p_q_in_gauss: {
    pose: 'unamused',
    tag: 'p/q invertido',
    text: 'Gauss dice p/q con p divisor del término independiente a₀ y q divisor del coeficiente principal a_n, nunca al revés.',
  },
  equivalent_form: {
    pose: 'lentes-brillo',
    tag: 'Factorización incompleta o forma distinta',
    text: 'Tu expresión es algebraicamente equivalente, pero acá necesitamos la forma factorizada completa en factores primos sobre ℝ.',
  },
});

export const STREAK_REACTIONS = Object.freeze({
  3: {
    pose: 'feliz',
    tag: 'Racha de 3',
    text: 'Tres al hilo sin pistas. Se nota que ya le agarraste la mano a los grados y signos.',
  },
  5: {
    pose: 'orgullosa',
    tag: 'Racha de 5',
    text: 'Cinco seguidas sin ayuda. Así se entra a un parcial: mirando los coeficientes antes de hacer cuentas de más.',
  },
  8: {
    pose: 'complice',
    tag: 'Racha de 8',
    text: 'Ocho resoluciones limpias sin pistas. Estás listo para cruzar unidades en el Jefe Integrador.',
  },
});
