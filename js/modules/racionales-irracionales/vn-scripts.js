/**
 * @file js/modules/racionales-irracionales/vn-scripts.js
 * 12 handcrafted Visual Novel scripts (6 main + 6 -base) for Unit 07
 * (Funciones Racionales e Irracionales), plus DIAGNOSE_REACTIONS and STREAK_REACTIONS.
 * Rioplatense voseo, max 1-2 short math expressions per balloon, zero raw LaTeX,
 * zero bureaucratic booklet citations, zero Unicode emojis, eureka <= 2.
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
   * SECCIÓN 1 · EXPRESIONES RACIONALES, SIMPLIFICACIÓN Y M(x)
   * ======================================================================== */
  sec1: [
    balloon(
      'base',
      'Fracciones con polinomios',
      'Una expresión racional P(x)/Q(x) funciona igual que una fracción numérica, pero con polinomios y una regla de oro: el divisor Q(x) jamás puede valer 0.'
    ),
    balloon(
      'lentes-brillo',
      'La aduana del dominio',
      'Antes de tachar cualquier paréntesis en (x<sup>2</sup> − 9)/(x − 3), anotá los valores prohibidos del denominador original. Aunque simplifiques a x + 3, en x = 3 la fórmula original sigue rota.',
      '[data-widget="inspector-dominio"]'
    ),
    balloon(
      'unamused',
      'Aduana de factores',
      'Si ves (x + 3)/x, ni se te ocurra tachar la x de arriba con la de abajo. Solo se cancelan factores que multiplican a todo el numerador y a todo el denominador, nunca sumandos.'
    ),
    balloon(
      'explicando',
      'El mínimo común múltiplo M(x)',
      'Para sumar fracciones con distinto denominador, factorizalos primero y armá M(x) tomando cada factor primo con su mayor exponente. Así no inflás el grado multiplicando al azar.'
    ),
    balloon(
      'complice',
      'Cuidado al dividir fracciones',
      'Al dividir P/Q por R/S invertís la segunda fracción y multiplicás por S/R. Por eso el dominio excluye las raíces de Q, las de S y también las de R.'
    ),
  ],

  'sec1-base': [
    balloon(
      'empatia',
      'De los números a las letras',
      'Si las fracciones con x te intimidan, pensá primero en 6/9 = 2/3. Simplificar es exactamente dividir arriba y abajo por el mismo bloque multiplicativo.'
    ),
    balloon(
      'explicando',
      '¿Cuándo puedo tachar?',
      'En (2 · 5)/(2 · 7) podés cancelar el 2 porque multiplica a todo. En (2 + 5)/2 no podés tachar el 2 porque está sumando. Con polinomios rige exactamente la misma ley.'
    ),
    balloon(
      'pensativa',
      'Factorizar antes de mirar',
      'Tu primer movimiento siempre es factorizar numerador y denominador. Recién cuando todo quedó escrito como multiplicación de paréntesis aparecen los factores comunes.'
    ),
    balloon(
      'evaluando',
      'La etiqueta que no se borra',
      'Si cancelás (x − 3) arriba y abajo, la expresión se vuelve más cómoda para operar, pero lleva una etiqueta pegada: válida para x ≠ 3.'
    ),
    balloon(
      'feliz',
      'Probalo con la sonda',
      'Mové la sonda x₀ en el inspector de dominio y mirá cómo la compuerta se cierra justo en los valores que anulan el denominador original.'
    ),
  ],

  /* ========================================================================
   * SECCIÓN 2 · ECUACIONES E INECUACIONES RACIONALES
   * ======================================================================== */
  sec2: [
    balloon(
      'explicando',
      'Limpiar el denominador',
      'Para resolver una ecuación racional, primero declarás qué valores prohíbe cada denominador. Después llevás todo a un mismo M(x) e igualás a cero el numerador resultante.'
    ),
    balloon(
      'panico',
      'La trampa de multiplicar por cero',
      'Multiplicar ambos miembros por M(x) puede fabricar soluciones que anulan el denominador original. Si al resolver el numerador aparece x = 1 cuando (x − 1) estaba abajo, se descarta sin piedad.'
    ),
    balloon(
      'sospecha',
      'Nunca pases multiplicando en inecuaciones',
      'En una inecuación como 7/(x + 6) ≤ 1 no podés pasar (x + 6) multiplicando al otro lado, porque no sabés si es positivo o negativo y si da vuelta la desigualdad.'
    ),
    balloon(
      'explicando',
      'Llevar todo a cero y estudiar signos',
      'Restás 1, juntás todo en una única fracción (1 − x)/(x + 6) ≤ 0 y estudiás el signo de arriba y abajo en cada intervalo separado por las raíces.'
    ),
    balloon(
      'lentes-brillo',
      'Polos siempre abiertos',
      'Aunque la inecuación diga ≤ o ≥, las raíces del denominador jamás entran en la solución. Un polo siempre lleva paréntesis abierto porque dividir por cero no existe.'
    ),
  ],

  'sec2-base': [
    balloon(
      'empatia',
      'Un paso previo que salva parciales',
      'Antes de despejar cualquier ecuación con x abajo, anotá en un rincón «x ≠ ...». Ese segundo de orden evita aceptar respuestas imposibles al final.'
    ),
    balloon(
      'explicando',
      'Una fracción es cero solo arriba',
      'Para que N(x)/D(x) = 0, alcanza y sobra con que N(x) = 0 mientras D(x) ≠ 0. Si los dos dan cero a la vez, la división sigue prohibida.'
    ),
    balloon(
      'pensativa',
      '¿Qué pasa si se descarta la única raíz?',
      'Puede pasar perfectamente que el numerador dé una sola raíz y esa raíz coincida con un valor prohibido. En ese caso el conjunto solución es vacío: S = ∅.'
    ),
    balloon(
      'evaluando',
      'Signo de un cociente',
      'Para saber si N(x)/D(x) es positivo o negativo en un intervalo, elegí un número de prueba cualquiera de ese tramo y aplicá la regla de signos.'
    ),
    balloon(
      'complice',
      'Corchete o paréntesis',
      'Las raíces del numerador pueden llevar corchete si el signo es ≤ o ≥; las raíces del denominador llevan paréntesis abierto siempre, sin excepciones.'
    ),
  ],

  /* ========================================================================
   * SECCIÓN 3 · DOMINIO, CEROS, AGUJEROS VS. ASÍNTOTAS VERTICALES
   * ======================================================================== */
  sec3: [
    balloon(
      'sospecha',
      'No todo cero abajo es asíntota',
      'Compará (x<sup>2</sup> − 1)/(x − 1) con (x − 1)/(x − 1)<sup>2</sup>. En las dos funciones x = 1 anula arriba y abajo al mismo tiempo, pero sus gráficas hacen cosas opuestas.',
      '[data-widget="agujero-asintota"]'
    ),
    balloon(
      'explicando',
      'Duelo de multiplicidades',
      'Gana quien tiene más copias del factor (x − a): si mult<sub>P</sub>(a) ≥ mult<sub>Q</sub>(a), el factor de abajo se cancela por completo y queda un punto agujero evitable.'
    ),
    balloon(
      'lentes-brillo',
      '¿Dónde queda el agujero?',
      'La altura del hueco no se lee haciendo 0/0: se evalúa la fórmula simplificada en x = a. En (x<sup>2</sup> − 1)/(x − 1), simplificás a x + 1 y el agujero cae en (1; 2).'
    ),
    balloon(
      'evaluando',
      'Cuando gana el denominador',
      'Si mult<sub>P</sub>(a) < mult<sub>Q</sub>(a), sobra al menos un factor (x − a) abajo después de simplificar. Al acercarte a x = a, el cociente explota hacia +∞ o −∞ formando una asíntota vertical.'
    ),
    balloon(
      'eureka',
      'Agujero sobre el eje X no es raíz',
      'En 2x<sup>2</sup>/(x<sup>2</sup> + x), x = 0 deja un agujero en (0; 0). Como 0 no pertenece al dominio, no entra en C<sub>0</sub>: esa función tiene C<sub>0</sub> = ∅.'
    ),
  ],

  'sec3-base': [
    balloon(
      'empatia',
      'Dos formas de romperse en x = a',
      'Que una función no exista en x = a significa que ahí falta un punto de la curva. Puede faltar apenas un puntito pinchado o partirse en dos ramas que se disparan.'
    ),
    balloon(
      'explicando',
      'La sonda numérica no miente',
      'Si probás x = 1,01 y x = 0,99 y los resultados se quedan cerca de 2, hay un agujero en (1; 2). Si saltan a 100 y −100, hay una pared vertical infranqueable.'
    ),
    balloon(
      'pensativa',
      '¿Cuándo dos funciones son iguales?',
      'No alcanza con que tengan la misma fórmula simplificada: deben tener exactamente el mismo dominio. Por eso (x<sup>2</sup> − 6x + 9)/(x − 3) y x − 3 son funciones distintas.'
    ),
    balloon(
      'base',
      'Ceros reales de f',
      'Una raíz de la función es un x dentro del dominio donde f(x) = 0. Primero revisá que el candidato no esté en la lista de exclusiones del denominador.'
    ),
    balloon(
      'feliz',
      'Jugá con las multiplicidades',
      'Mové los deslizadores de mult<sub>P</sub> y mult<sub>Q</sub> en el pizarrón y observá cómo el gráfico pasa instantáneamente de muro asintótico a hueco abierto.'
    ),
  ],

  /* ========================================================================
   * SECCIÓN 4 · ASÍNTOTAS HORIZONTALES Y ESTUDIO COMPLETO
   * ======================================================================== */
  sec4: [
    balloon(
      'base',
      'Mirar los grados al infinito',
      'Cuando |x| se vuelve enorme, solo mandan los términos de mayor grado de P(x) y Q(x). El cociente completo termina comportándose como la razón entre sus líderes.'
    ),
    balloon(
      'explicando',
      'Los tres casos por grado',
      'Si gr(P) < gr(Q), la curva se aplasta sobre y = 0. Si gr(P) = gr(Q), tiende al cociente a<sub>n</sub>/b<sub>m</sub>. Si gr(P) > gr(Q), no hay asíntota horizontal.'
    ),
    balloon(
      'lentes-brillo',
      'Denominador desordenado',
      'En (2x + 1)/(3 − x) no leas 2/3 por mirar el primer número de abajo. Ordenado es (−x + 3), así que el coeficiente principal de abajo es −1 y la A.H. es y = −2.',
      '[data-widget="explorador-asintotas"]'
    ),
    balloon(
      'evaluando',
      'La imagen y los huecos',
      'En una homográfica sin huecos, la asíntota horizontal y = a/c queda fuera de la imagen. Y si la curva tiene un agujero cuya altura no se repite en otro x, ese y también sale de Im(f).'
    ),
    balloon(
      'complice',
      'Alcance del programa de ingreso',
      'Cuando gr(P) > gr(Q) confirmamos que no existe asíntota horizontal. La recta oblicua que aparece cuando gr(P) = gr(Q) + 1 figura solo como ampliación didáctica opcional.'
    ),
  ],

  'sec4-base': [
    balloon(
      'empatia',
      'Vertical vs. Horizontal sin confusiones',
      'Una recta vertical corta al eje X en un número fijo, por eso se escribe x = a. Una recta horizontal corta al eje Y a una altura fija, por eso se escribe y = b.'
    ),
    balloon(
      'explicando',
      '¿Por qué gana el grado mayor?',
      'Compará x<sup>2</sup> frente a x cuando x = 1000: arriba o abajo, la potencia más grande deja chiquita a la otra y empuja el cociente a 0 o a infinito.'
    ),
    balloon(
      'pensativa',
      'Cuando empatan en grado',
      'Si arriba tenés 4x y abajo 2x − 2, para x muy grande el −2 casi no pesa y 4x/(2x) se estabiliza cerca de 4/2 = 2.'
    ),
    balloon(
      'evaluando',
      'Reconstruir desde un gráfico',
      'De un gráfico de homográfica leés dos rectas punteadas enseguida: la vertical fija el cero del denominador y la horizontal fija la razón de coeficientes principales.'
    ),
    balloon(
      'feliz',
      'Arrastrá el punto hacia los bordes',
      'Llevá la sonda de x hacia los extremos del explorador y comprobá cómo f(x) se pega a la recta amarilla de la asíntota horizontal.'
    ),
  ],

  /* ========================================================================
   * SECCIÓN 5 · FUNCIÓN IRRACIONAL, DOMINIO PAR VS. IMPAR Y ECUACIONES
   * ======================================================================== */
  sec5: [
    balloon(
      'base',
      'La paridad del índice manda',
      'En k · <sup>n</sup>√g(x), si n es impar el radicando puede ser negativo sin problema en ℝ. Si n es par, exigimos g(x) ≥ 0, y si la raíz divide abajo, exigimos g(x) > 0.'
    ),
    balloon(
      'sospecha',
      'Ojo con el signo menos en el radicando',
      'Para hallar el dominio de √(3 − x) planteás 3 − x ≥ 0. Al despejar −x ≥ −3 y multiplicar o dividir por −1, el sentido cambia a x ≤ 3: queda (−∞; 3].'
    ),
    balloon(
      'colapso',
      'Prohibido distribuir raíces',
      'Jamás escribas √(x<sup>2</sup> + 9) = x + 3 ni (√x + 2)<sup>2</sup> = x + 4. La radicación y la potencia no se reparten sobre sumas ni restas.'
    ),
    balloon(
      'lentes-brillo',
      'El nacimiento de raíces extraviadas',
      'Al resolver √(x + 6) = x elevando al cuadrado, resolvés también la rama fantasma −√(x + 6) = x. Ahí aparece x = −2, que hace 2 = −2 y debe descartarse.',
      '[data-widget="ecuaciones-irracionales"]'
    ),
    balloon(
      'eureka',
      'Verificación obligatoria al final',
      'En toda ecuación irracional de índice par comprobá dos filtros sobre cada candidato: que viva dentro del dominio del radicando y que el miembro derecho sea ≥ 0.'
    ),
  ],

  'sec5-base': [
    balloon(
      'empatia',
      '¿Por qué √(−4) no vive en los reales?',
      'Porque ningún número real elevado al cuadrado da negativo: positivo por positivo da positivo, y negativo por negativo también. En cambio <sup>3</sup>√(−8) = −2 existe perfecto.'
    ),
    balloon(
      'explicando',
      'Desigualdades cuadráticas en el radicando',
      'Si adentro de una raíz cuadrada tenés x<sup>2</sup> − 6x + 8, primero buscás las raíces 2 y 4, y después te quedás con las zonas donde la parábola está arriba o sobre el eje X.'
    ),
    balloon(
      'pensativa',
      'La raíz cuadrada siempre devuelve ≥ 0',
      'El símbolo √ representa la raíz principal no negativa. Por eso √(x − 1) = −5 es imposible antes de hacer ninguna cuenta: una cantidad ≥ 0 nunca iguala a −5.'
    ),
    balloon(
      'evaluando',
      'La prueba del reemplazo',
      'Cuando encuentres candidatos después de elevar al cuadrado, metelos uno por uno en la ecuación original sin tocar. Si los dos lados coinciden, se queda; si no, afuera.'
    ),
    balloon(
      'feliz',
      'Mirá la rama fantasma en rosa',
      'En el pizarrón de ecuaciones podés ver punteada en rosa la rama −√g(x): justo ahí es donde chocan las soluciones extraviadas.'
    ),
  ],

  /* ========================================================================
   * SECCIÓN 6 · GRÁFICAS RADICALES DESPLAZADAS Y FUNCIONES POR TRAMOS
   * ======================================================================== */
  sec6: [
    balloon(
      'explicando',
      'El punto de partida de la semirrecta curva',
      'Toda gráfica de f(x) = k · √(ax + b) + c arranca en el punto donde el radicando vale 0: allí x = −b/a y la altura vale c. Ese vértice fija a la vez el borde del dominio y el de la imagen.'
    ),
    balloon(
      'pensativa',
      'El techo o el piso en la imagen',
      'Como √(ax + b) ≥ 0, si k > 0 sumás desde c hacia arriba y la imagen es [c; +∞). Si k < 0 (como en 2 − √(x + 1)), restás desde c hacia abajo y la imagen es (−∞; 2].'
    ),
    balloon(
      'evaluando',
      'Reflexión horizontal cuando a < 0',
      'En 2 − √(3 − x) el coeficiente de x dentro de la raíz es −1: la curva arranca en (3; 2) y crece hacia la izquierda en (−∞; 3], bajando desde 2 hacia −∞.'
    ),
    balloon(
      'sospecha',
      'Funciones por tramos mixtas',
      'Cuando combinás una rama racional como 1/x para x < 0 con √x para x ∈ [0; 9], respetá estrictamente dónde cada borde está abierto o cerrado para no violar la unicidad.'
    ),
    balloon(
      'orgullosa',
      'Lectura integrada completa',
      'Con dominio, bordes cerrados o abiertos, ceros dentro de cada tramo e imagen real, ya podés estudiar funciones mixtas completas sin depender de tablas ciegas.'
    ),
  ],

  'sec6-base': [
    balloon(
      'empatia',
      'Media parábola acostada',
      'Si te cuesta imaginar √x, pensá en la mitad positiva de la parábola y = x<sup>2</sup> acostada sobre el costado derecho, saliendo desde (0; 0).'
    ),
    balloon(
      'explicando',
      'Cómo leer cada parámetro',
      'Lo que suma afuera (c) sube o baja toda la curva. El signo de k decide si apunta hacia arriba o se refleja hacia abajo. Lo de adentro decide desde qué x arranca y hacia qué lado corre.'
    ),
    balloon(
      'pensativa',
      '¿Siempre corta al eje X?',
      'No siempre. Si f(x) = 3 + √(x + 1), arranca en altura 3 y solo sube: jamás baja hasta y = 0, así que C<sub>0</sub> = ∅.'
    ),
    balloon(
      'evaluando',
      'Coser tramos sin superposiciones',
      'En una función por partes, un mismo valor de x nunca puede pertenecer a dos tramos cerrados a distinta altura. Un borde va cerrado con corchete y el otro abierto o en otro x.'
    ),
    balloon(
      'feliz',
      'Cambiá a Modo 2 en el pizarrón',
      'Probá los deslizadores de k, a, b y c o cargá los ejemplos por tramos para ver cómo se mueve el punto de partida y cambian los bordes de dominio e imagen.'
    ),
  ],
};

export const SCRIPTS = VN_SCRIPTS;

export const DIAGNOSE_REACTIONS = Object.freeze({
  lost_excluded_domain_on_cancel: {
    pose: 'lentes-brillo',
    tag: 'Dominio fantasma',
    text: 'Simplificaste bien los factores, pero dejaste caer la restricción del denominador original. Anotá el valor excluido siempre.',
  },
  cancelled_terms_instead_of_factors: {
    pose: 'unamused',
    tag: 'Aduana de factores',
    text: 'No se pueden tachar sumandos sueltos con + o −. Factorizá primero y simplificá solo factores que multipliquen a todo.',
  },
  wrong_lcm_product_instead_of_lcm: {
    pose: 'pensativa',
    tag: 'Mínimo común múltiplo',
    text: 'Para armar M(x), factorizá cada denominador y elegí cada factor primo con su mayor exponente, escalando arriba por lo que falta.',
  },
  accepted_excluded_root_in_equation: {
    pose: 'panico',
    tag: 'División por cero',
    text: '¡Cuidado! Ese valor anula un denominador original: no puede entrar en el conjunto solución y en inecuaciones lleva paréntesis abierto.',
  },
  hole_vs_va_multiplicity_confusion: {
    pose: 'sospecha',
    tag: 'Agujero vs. Asíntota',
    text: 'Compará mult_P(a) con mult_Q(a): si arriba hay al menos tantas copias como abajo es agujero; si sobran copias abajo es asíntota vertical.',
  },
  inverted_ha_degree_or_coeff_ratio: {
    pose: 'evaluando',
    tag: 'Asíntota horizontal',
    text: 'Revisá el orden de los términos líderes y recordá que la A.H. compara grados: y = a_n/b_m si empatan, y = 0 si gana abajo, o no tiene si gana arriba.',
  },
  even_vs_odd_radical_domain_confusion: {
    pose: 'sospecha',
    tag: 'Paridad del índice',
    text: 'Índice par exige radicando ≥ 0 (o > 0 si está en el denominador, invirtiendo al dividir por negativo); índice impar no restringe el signo.',
  },
  accepted_extraneous_squaring_root: {
    pose: 'lentes-brillo',
    tag: 'Solución extraviada',
    text: 'Elevar al cuadrado agregó una raíz fantasma que da miembro derecho negativo. Verificá siempre en la ecuación original.',
  },
  distributed_radical_over_sum: {
    pose: 'colapso',
    tag: 'No distributividad',
    text: 'Ni la raíz ni el cuadrado se reparten sobre sumas o restas: √(x² + 9) ≠ x + 3.',
  },
  wrong_radical_image_or_piecewise_bound: {
    pose: 'pensativa',
    tag: 'Imagen y bordes',
    text: 'Acordate de que √g(x) ≥ 0 acota la imagen en [c; +∞) si k > 0 o (−∞; c] si k < 0, y revisá corchetes abiertos/cerrados en tramos.',
  },
  domain_mismatch: {
    pose: 'lentes-brillo',
    tag: 'Dominio incompleto',
    text: 'La expresión simplificada coincide algebraicamente, pero cambiaste su dominio al olvidar los valores prohibidos originales.',
  },
  unsimplified_rational: {
    pose: 'evaluando',
    tag: 'Falta simplificar',
    text: 'Tu fracción es equivalente, pero todavía quedan factores comunes entre numerador y denominador que podés cancelar.',
  },
  equivalent_form: {
    pose: 'evaluando',
    tag: 'Forma equivalente',
    text: 'La expresión es equivalente, pero revisá la forma simplificada pedida.',
  },
});

export const STREAK_REACTIONS = Object.freeze({
  2: {
    pose: 'feliz',
    tag: 'Racha ×2',
    text: 'Dos seguidas sin pistas ni ayuda. Ya tenés el radar de dominios bien calibrado.',
  },
  4: {
    pose: 'orgullosa',
    tag: 'Racha ×4',
    text: 'Cuatro al hilo en forma independiente. Ni agujeros ni soluciones extraviadas te hacen pisar el palito.',
  },
  6: {
    pose: 'eureka',
    tag: 'Racha ×6',
    text: 'Seis seguidas sin ayudas. Dominás racionales e irracionales con rigor completo de Exactas.',
  },
});
