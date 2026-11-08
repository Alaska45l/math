import { h } from "./dom.js";
import { frac } from "./math-format.js";
import { react } from "./vn.js";

export const GLOSSARY_TERMS = {
  neutro_multiplicativo: {
    title: "Neutro multiplicativo",
    pose: "explicando",
    text: "Es el número que, al multiplicar, deja intacto cualquier factor. Lo descubrimos preguntando qué valor puede ocupar el lugar de una casilla sin modificar a. En la suma ese papel lo cumple cero; en la multiplicación lo cumple uno. Confundirlos mezcla dos operaciones distintas.",
    example:
      "Con 7, sumar cero mantiene 7 y multiplicar por uno también mantiene 7.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "7 · 1 = 7;   7 + 0 = 7;   ",
        frac("7", "7"),
        " = 1",
      ),
    contrast:
      "El cero sí es neutro para sumar, pero al multiplicar absorbe: 7 · 0 da 0 y destruye la escala.",
  },
  inverso_multiplicativo: {
    title: "Inverso multiplicativo",
    pose: "complice",
    text: "El inverso de un número es el factor que deshace su cambio de escala y devuelve el neutro uno. Para a distinto de cero, buscamos un número que al multiplicarse por a produzca exactamente uno. La división por a equivale a multiplicar por ese inverso.",
    example:
      "El inverso de 4 es un cuarto: juntos forman una pareja cuyo producto es el neutro.",
    formula: () => h("span", { class: "eq" }, "4 · ", frac("1", "4"), " = 1"),
    contrast:
      "No es el opuesto aditivo −a: sumar a su opuesto produce cero, mientras el inverso multiplicativo produce uno.",
  },
  radicando: {
    title: "Radicando",
    pose: "explicando",
    text: "El radicando es la cantidad que queda debajo del techo del símbolo de raíz. La pregunta de la raíz es qué número, repetido como factor el número de veces indicado por el índice, reconstruye esa cantidad. Por ejemplo, bajo una raíz cuadrada buscamos dos factores iguales.",
    example:
      "En la raíz cuadrada de 36, el radicando es 36; buscamos un factor que al repetirse dos veces dé 36.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "√",
        h("span", { class: "pr-gloss-highlight" }, "36"),
        " = 6;   36 : 6 = ",
        frac("36", "6"),
      ),
    contrast:
      "El radicando no es el índice: uno es el número que se transforma y el otro cuenta cuántas repeticiones buscamos.",
  },
  indice_raiz: {
    title: "Índice de la raíz",
    pose: "pensativa",
    text: "El índice cuenta cuántas copias iguales del resultado hay que multiplicar para reconstruir el radicando. En la raíz cuadrada el índice dos suele quedar implícito; en raíces cúbicas y superiores lo escribimos para que sepamos cuántas cajas iguales debemos formar.",
    example:
      "La raíz cúbica de 64 pregunta por el factor que debe aparecer tres veces; cuatro cumple porque cuatro por cuatro por cuatro da 64.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "∛64 = 4;   4 · 4 · 4 = 64;   64",
        h("sup", null, frac("1", "3")),
        " = 4",
      ),
    contrast:
      "El índice no indica cuántos factores hay en el radicando, sino en cuántas agrupaciones iguales los repartimos.",
  },
  racionalizar: {
    title: "Racionalizar",
    pose: "complice",
    text: "Racionalizar es reescribir una fracción equivalente para que su denominador ya no contenga una raíz. Multiplicamos arriba y abajo por el mismo factor, que vale uno, y así conservamos el valor mientras cambiamos la forma. Es una técnica de escritura algebraica, no una operación mágica.",
    example:
      "Para quitar la raíz del denominador de uno sobre raíz de dos, multiplicamos arriba y abajo por raíz de dos.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        frac("1", "√2"),
        " · ",
        frac("√2", "√2"),
        " = ",
        frac("√2", "2"),
      ),
    contrast:
      "No se puede multiplicar sólo el denominador: la equivalencia se conserva porque el factor aplicado arriba y abajo vale uno.",
  },
  factor_primo: {
    title: "Factor primo",
    pose: "explicando",
    text: "Un factor primo es uno de los ladrillos básicos de una multiplicación: es primo y aparece multiplicando a otros factores. Desarmar un número en primos permite ver qué paquetes iguales podemos reunir para extraerlos de una raíz sin adivinar raíces de memoria.",
    example:
      "El 36 puede abrirse como dos doses y dos treses; al reordenarlos aparecen dos paquetes iguales, cada uno con un dos y un tres.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "36 = 2 · 2 · 3 · 3 = (2 · 3)(2 · 3);   36",
        h("sup", null, frac("1", "2")),
        " = 6",
      ),
    contrast:
      "Un factor primo no es cualquier divisor compuesto: 6 divide a 36, pero sus propios ladrillos son 2 y 3.",
  },
  campo_aditivo: {
    title: "Campo aditivo",
    pose: "pensativa",
    text: "El campo aditivo organiza situaciones donde avanzamos sumando cantidades y retrocedemos sumando sus opuestos. Su punto de partida natural es cero, porque agregar cero no mueve la posición. Repetir varios saltos iguales se resume con una multiplicación, que cuenta sumandos.",
    example:
      "Tres saltos de tamaño cuatro desde cero llegan a doce; el contador tres abrevia las tres copias de cuatro.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "0 + 4 + 4 + 4 = 4 · 3 = 12;   12 · ",
        frac("1", "3"),
        " = 4",
      ),
    contrast:
      "Ese contador aditivo no es una potencia: cuenta sumandos, mientras que el exponente contará factores.",
  },
  campo_multiplicativo: {
    title: "Campo multiplicativo",
    pose: "explicando",
    text: "El campo multiplicativo describe cambios de escala: cada paso multiplica el estado anterior por el mismo factor. Empezamos en uno porque multiplicar por uno conserva la escala inicial. Repetir el factor a cierta cantidad de veces se resume con una potencia.",
    example:
      "Aplicar tres veces el factor dos desde uno produce dos, cuatro y ocho; el exponente tres cuenta esos cambios.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "1 · 2 · 2 · 2 = 2³ = 8;   16",
        h("sup", null, frac("1", "2")),
        " = 4",
      ),
    contrast:
      "La suma avanza desde cero con saltos del mismo tamaño; la potencia escala repetidamente desde uno.",
  },
  raiz_principal: {
    title: "Raíz principal",
    pose: "evaluando",
    text: "Para una raíz de índice par y radicando no negativo, la raíz principal es el resultado no negativo. Aunque dos números opuestos tienen el mismo cuadrado, el símbolo de raíz elige el que queda sobre cero. Esta elección hace que la operación tenga un único resultado.",
    example:
      "Tanto seis como menos seis al cuadrado dan 36, pero la raíz cuadrada principal de 36 es seis.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "√36 = 6;   √(−6)² = |−6| = 6;   √",
        h("span", null, frac("9", "4")),
        " = ",
        frac("3", "2"),
      ),
    contrast:
      "La raíz principal no devuelve automáticamente la variable: √(x²) es |x|, porque x puede ser negativo.",
  },
  asintota_horizontal: {
    title: "Asíntota horizontal",
    pose: "lentes-brillo",
    text: "Es una recta horizontal y = c a la que la gráfica exponencial se aproxima indefinidamente cuando la variable independiente tiende a infinito positivo o negativo, sin tocarla jamás en valor finito. Define la frontera abierta del conjunto imagen.",
    example:
      "En f(x) = (1/2)ˣ + 3, cuando x crece hacia +∞ la potencia tiende a cero y la curva se aplasta sobre la recta y = 3.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "lim_(x→+∞) ((",
        frac("1", "2"),
        ")ˣ + 3) = 3;   y = 3;   Im = (3; +∞)",
      ),
    contrast:
      "¡Alerta de examen! La imagen NUNCA lleva corchete cerrado en la asíntota: se escribe (3; +∞), jamás [3; +∞).",
  },
  crecimiento_exponencial: {
    title: "Crecimiento exponencial",
    pose: "explicando",
    text: "Ocurre cuando la base a es estrictamente mayor que uno y el coeficiente de escala k es positivo. En cada etapa de tamaño Δx = 1, la función no suma una cantidad constante, sino que multiplica su valor acumulado por el factor a.",
    example:
      "Un cultivo que duplica sus amebas cada hora crece siguiendo la ley multiplicativa f(x) = 2ˣ.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "f(x) = k · aˣ   (a > 1);   ",
        frac("f(x+1)", "f(x)"),
        " = a",
      ),
    contrast:
      "No confundir con función lineal: la lineal suma un salto constante Δy; la exponencial multiplica por la razón constante a.",
  },
  decaimiento_exponencial: {
    title: "Decaimiento exponencial",
    pose: "pensativa",
    text: "Se produce cuando la base es un número positivo menor que uno con coeficiente k positivo. Cada período temporal reduce la cantidad multiplicándola por esa fracción constante, como en la desintegración radiactiva o amortiguación.",
    example:
      "Una masa de 50 g con vida media de 3 min decae según la función M(t) = 50 · (1/2)^(t/3).",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "(",
        frac("1", "a"),
        ")ˣ = a⁻ˣ;   (",
        frac("1", "2"),
        ")ˣ = 2⁻ˣ",
      ),
    contrast:
      "El decaimiento nunca llega a cero en un tiempo finito: la curva se aplasta contra la asíntota horizontal pero permanece estrictamente positiva.",
  },
  base_natural_e: {
    title: "Número e y base natural",
    pose: "complice",
    text: "La constante matemática e (aproximadamente 2,71828) es la base canónica del crecimiento continuo en matemática. Surge al componer tasas en infinitas subdivisiones infinitesimales y modela fenómenos físicos, biológicos y financieros continuos.",
    example:
      "Un isótopo decae con tasa continua instantánea según la ley A(t) = 120 · e^(−0,05t).",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "e = lim_(n→∞) (1 + ",
        frac("1", "n"),
        ")ⁿ ≈ 2,71828;   f(x) = eˣ",
      ),
    contrast:
      "El número e es una constante matemática irracional fija, no una incógnita o variable a despejar.",
  },
  sustitucion_cuadratica: {
    title: "Sustitución cuadrática exponencial",
    pose: "evaluando",
    text: "Técnica para resolver ecuaciones con potencias cuadráticas e intermedias definiendo una variable auxiliar positiva. Transforma la ecuación en una cuadrática común, y tras hallar las raíces auxiliares se debe descartar obligatoriamente cualquier valor menor o igual a cero.",
    example:
      "En 3²ˣ − 4·3ˣ + 3 = 0, con u = 3ˣ queda u² − 4u + 3 = 0, dando soluciones auxiliares u = 1 o u = 3.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "u = aˣ > 0;   u = ",
        frac("−b ± √(b² − 4ac)", "2a"),
        " ⟹ u > 0",
      ),
    contrast:
      "¡Trampa de parcial! aˣ es estrictamente positivo en los números reales: una raíz auxiliar u menor o igual a cero no genera ninguna solución real.",
  },
  diferencias_finitas: {
    title: "Primeras diferencias finitas",
    pose: "explicando",
    text: "Son las restas entre valores verticales consecutivos Δy = y_{i+1} − y_i en una tabla con paso horizontal uniforme Δx. En el álgebra lineal clásica indican la tasa de variación constante; si las primeras diferencias dan siempre el mismo número m, la función es una recta de pendiente m. Si no son constantes pero crecen de forma proporcional al valor acumulado, estás ante una curva exponencial.",
    example:
      "Con x = 0, 1, 2, 3 e y = 5, 8, 11, 14, restamos 8 − 5 = 3, 11 − 8 = 3 y 14 − 11 = 3: la primera diferencia fija es 3.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "Δy = y_{i+1} − y_i;   m = ",
        frac("Δy", "Δx"),
        ";   Δ²y = Δy_{i+1} − Δy_i",
      ),
    contrast:
      "No confundir primeras diferencias con razón multiplicativa: la diferencia resta (y_{i+1} − y_i) para detectar rectas; la razón divide (y_{i+1} / y_i) para detectar potencias.",
  },
  razon_multiplicativa: {
    title: "Razón multiplicativa constante",
    pose: "lentes-brillo",
    text: "Es el cociente constante a = y_{i+1} / y_i entre dos salidas consecutivas de una función cuando la variable independiente avanza en un paso uniforme Δx = 1. Representa el factor de escala por el cual se multiplica la cantidad previa en cada unidad de tiempo o avance. Si la razón se mantiene idéntica en toda la tabla, la relación es estrictamente exponencial.",
    example:
      "Para x = 0, 1, 2, 3 e y = 3, 6, 12, 24, dividimos 6 / 3 = 2, 12 / 6 = 2 y 24 / 12 = 2: la razón constante es 2.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        frac("y_{i+1}", "y_i"),
        " = a;   f(x+1) = a · f(x);   a = (",
        frac("y_2", "y_1"),
        ")",
        h("sup", null, frac("1", "x_2 − x_1")),
      ),
    contrast:
      "¡Cuidado con pasos desiguales! Si el salto en x no vale 1 sino Δx, el cociente entre ordenadas no es la base a sino a^(Δx). Siempre tenés que despejar la raíz de índice Δx.",
  },
  jerarquia_operaciones: {
    title: "Jerarquía de operaciones",
    pose: "colapso",
    text: "Orden de precedencia formal que dicta cómo evaluar una expresión algebraica: primero se resuelven los paréntesis, luego las potencias y raíces, a continuación las multiplicaciones y divisiones, y finalmente las sumas y restas. En f(x) = k · aˣ, el exponente afecta exclusivamente a la base a, jamás al coeficiente k.",
    example:
      "En 3 · 2³, calculamos primero 2³ = 8 y luego multiplicamos 3 · 8 = 24. Escribir 6³ = 216 destruye la jerarquía.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "k · aˣ ≠ (k · a)ˣ;   3 · 2³ = 3 · 8 = 24;   ",
        frac("k · aˣ", "k"),
        " = aˣ",
      ),
    contrast:
      "¡Trampa clásica de examen! Multiplicar el factor k por la base a antes de elevar (ej. 3 · 2ˣ = 6ˣ o 4 · 2ˣ = 8ˣ) es un error grave: sólo podés unificar bases si ambas están elevadas a la misma potencia.",
  },
  exponentes_racionales: {
    title: "Exponentes racionales y radicales",
    pose: "pensativa",
    text: "Un exponente fraccionario m/n traduce algebraicamente una potencia elevada a m bajo una raíz de índice n. Densificar el dominio real con racionales exige que la base a sea estrictamente positiva: si a fuese negativa, raíces con índice par como x = 1/2 generarían raíces de radicando negativo, expulsando el resultado del conjunto de los números reales.",
    example:
      "4^(3/2) equivale a la raíz cuadrada de 4 al cubo: raíz cuadrada de 64, que resulta exactamente 8.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "a",
        h("sup", null, frac("m", "n")),
        " = ⁿ√(aᵐ) = (ⁿ√a)ᵐ;   a > 0",
      ),
    contrast:
      "Si la base es negativa como −2, (−2)^(1/2) = √(−2) no existe en ℝ. Por eso las funciones exponenciales reales exigen obligatoriamente base a > 0.",
  },
  simetria_axial: {
    title: "Simetría axial respecto al eje Y",
    pose: "complice",
    text: "Transformación geométrica que refleja cada punto (x; y) de una gráfica hacia (−x; y), tomando el eje vertical Y como un espejo plano. En las funciones exponenciales se manifiesta al reemplazar la base a por su inverso multiplicativo 1/a, pues (1/a)ˣ = a⁻ˣ: el comportamiento futuro hacia +∞ se traslada al pasado en −∞ y viceversa.",
    example:
      "La gráfica de f(x) = (1/2)ˣ es el reflejo especular de g(x) = 2ˣ: ambas comparten la ordenada (0; 1) y la asíntota y = 0.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "(",
        frac("1", "a"),
        ")ˣ = a⁻ˣ;   f(−x) = g(x);   P(x; y) ⟷ P′(−x; y)",
      ),
    contrast:
      "No confundir con reflexión horizontal respecto al eje X: invertir la base (1/2)ˣ refleja horizontalmente con respecto a Y; cambiar el signo exterior −2ˣ refleja verticalmente con respecto a X hacia el semiplano inferior.",
  },
  monotonia_creciente: {
    title: "Monotonía estrictamente creciente",
    pose: "lentes-brillo",
    text: "Propiedad de una función donde a mayores valores del dominio corresponden siempre mayores imágenes: si x₁ < x₂, entonces f(x₁) < f(x₂). En la exponencial f(x) = k · aˣ, la monotonía depende de dos factores combinados: la base a y el signo del coeficiente k. Un coeficiente negativo k < 0 invierte por completo el sentido de la base.",
    example:
      "En g(x) = −3 · (1/2)ˣ, aunque la base 1/2 decae, multiplicar por −3 hace que las imágenes pasen de −3 a −1,5 y a −0,75, creciendo hacia cero.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "x₁ < x₂ ⟹ f(x₁) < f(x₂);   k < 0 ∧ 0 < a < 1 ⟹ f ↑ en ℝ;   ",
        frac("Δy", "Δx"),
        " > 0",
      ),
    contrast:
      "¡Trampa clásica de parcial! Mirar sólo la base a = 1/2 y asumir automáticamente que la función decrece: si el coeficiente frontal es negativo (k < 0), la curva se da vuelta y se vuelve estrictamente creciente.",
  },
  conjunto_imagen: {
    title: "Conjunto imagen de la función exponencial",
    pose: "evaluando",
    text: "Es el conjunto de todos los valores que efectivamente toma la variable dependiente y. En una exponencial desplazada f(x) = k · a^(x−h) + c, el término potencial k · a^(x−h) jamás se anula ni cambia de signo. Por lo tanto, la curva queda confinada a un solo lado de la asíntota horizontal y = c, sin tocarla nunca en un punto finito.",
    example:
      "Para f(x) = 2 − (1/2)ˣ, como k = −1 < 0 y c = 2, la imagen es el intervalo abierto (−∞; 2).",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "k > 0 ⟹ Im(f) = (c; +∞);   k < 0 ⟹ Im(f) = (−∞; c);   f(x) ≠ c,   ∀x ∈ ℝ;   ",
        frac("k · aˣ", "k"),
        " > 0",
      ),
    contrast:
      "¡Alerta roja de examen! Jamás uses corchete en el extremo de la asíntota: escribir [c; +∞) o (−∞; c] cuesta puntos directos porque la función nunca alcanza el valor c.",
  },
  parabola_matriz: {
    title: "Parábola matriz (y = x²)",
    pose: "apuntando",
    text: "En criollo, es el molde original de fábrica de todas las funciones cuadráticas: la curva f(x) = x² con vértice clavado en el origen (0; 0) y ramas que abren hacia arriba en escalones cuadráticos (1, 4, 9...). Cualquier otra parábola del universo es simplemente esta misma curva estirada, aplastada, dada vuelta o corrida de lugar en el plano.",
    example:
      "Si en y = x² te movés 1 unidad a la derecha o a la izquierda del (0; 0), subís 1; si te movés 2 unidades, subís 2² = 4; si te movés 3 unidades, subís 3² = 9.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "f(x) = x²;   V = (0; 0);   f(−x) = f(x);   ",
        frac("f(2)", "f(1)"),
        " = ",
        frac("4", "1"),
      ),
    contrast:
      "No confundir con el módulo y = |x|: en valor absoluto los escalones suben parejos (1, 2, 3) formando una V puntiaguda; en y = x² suben acelerando (1, 4, 9) formando una curva suave en la base.",
  },
  concavidad: {
    title: "Concavidad de la parábola",
    pose: "lentes-brillo",
    text: "Es el sentido hacia donde abren los brazos de la parábola, gobernado exclusivamente por el signo del coeficiente principal a. Si a > 0, la parábola tiene concavidad positiva (abre hacia arriba como una copa ∪ y tiene un piso mínimo). Si a < 0, tiene concavidad negativa (abre hacia abajo como una montaña ∩ y tiene un techo máximo).",
    example:
      "En f(x) = 3x² − 6x + 1, como a = 3 > 0 abre hacia arriba. En g(x) = −(x − 2)² + 5, como a = −1 < 0 abre hacia abajo.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "a > 0 ⟹ ∪ (mínimo en yᵥ);   a < 0 ⟹ ∩ (máximo en yᵥ);   |a| = ",
        frac("|Δy|", "(Δx)²"),
      ),
    contrast:
      "El tamaño |a| cambia qué tan cerrada o abierta es la curva, pero el signo de b o de c jamás cambian hacia dónde apuntan las ramas.",
  },
  vertice_parabola: {
    title: "Vértice de la parábola V(xᵥ; yᵥ)",
    pose: "explicando",
    text: "Es el punto cumbre donde la parábola pega la vuelta: deja de bajar para empezar a subir (si a > 0) o deja de subir para empezar a bajar (si a < 0). Su coordenada horizontal xᵥ parte el gráfico al medio y su coordenada vertical yᵥ marca el valor mínimo o máximo absoluto que alcanza la función en su imagen.",
    example:
      "En f(x) = 2(x − 3)² − 4, el paréntesis se hace cero en xᵥ = 3 y la altura en ese punto es yᵥ = −4, así que el vértice es V(3; −4).",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "V = (xᵥ; yᵥ);   xᵥ = −",
        frac("b", "2a"),
        " = ",
        frac("x₁ + x₂", "2"),
        ";   yᵥ = f(xᵥ)",
      ),
    contrast:
      "¡Ojo! El vértice es un punto con dos coordenadas (xᵥ; yᵥ). No mezcles xᵥ (donde quiebra el crecimiento en el eje X) con yᵥ (donde arranca o termina la Imagen en el eje Y).",
  },
  eje_simetria: {
    title: "Eje de simetría (x = xᵥ)",
    pose: "complice",
    text: "Es la recta vertical imaginaria que pasa justo por el vértice y funciona como un espejo plano perfecto: cada punto de la rama derecha tiene su gemelo a la misma altura y a la misma distancia horizontal del otro lado. Por eso las dos raíces reales x₁ y x₂ están siempre a igual distancia del eje.",
    example:
      "Si una parábola corta al eje X en x₁ = −1 y en x₂ = 5, su espejo vertical pasa exactamente por el promedio: x = (−1 + 5)/2 = 2.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "x = xᵥ = −",
        frac("b", "2a"),
        " = ",
        frac("x₁ + x₂", "2"),
        ";   f(xᵥ − d) = f(xᵥ + d)",
      ),
    contrast:
      "El eje de simetría no es un número suelto sino una recta vertical completa, por eso en los exámenes se escribe siempre como ecuación: x = xᵥ.",
  },
  forma_canonica: {
    title: "Forma canónica f(x) = a(x − xᵥ)² + yᵥ",
    pose: "apuntando",
    text: "Es la vestimenta de la función cuadrática que te muestra el vértice V(xᵥ; yᵥ) en bandeja de plata sin hacer cuentas. Se construye agrupando toda la variable x adentro de un único paréntesis elevado al cuadrado: cuando x = xᵥ ese paréntesis se anula y sobrevive únicamente la altura yᵥ.",
    example:
      "En f(x) = −2(x + 4)² + 7, como adentro dice x + 4 = x − (−4), leemos al instante el vértice en V(−4; 7) y concavidad hacia abajo (a = −2).",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "f(x) = a(x − xᵥ)² + yᵥ;   (x − xᵥ)² = ",
        frac("f(x) − yᵥ", "a"),
      ),
    contrast:
      "¡Doble trampa clásica! Primero: xᵥ se lee con el signo cambiado respecto al paréntesis. Segundo: el número de afuera yᵥ NO es la ordenada al origen f(0).",
  },
  forma_factorizada: {
    title: "Forma factorizada f(x) = a(x − x₁)(x − x₂)",
    pose: "lentes-brillo",
    text: "Es la vestimenta de la cuadrática expresada como multiplicación de factores lineales, ideal para leer de un vistazo las raíces x₁ y x₂ donde la parábola corta al eje X. Sólo puede escribirse con números reales cuando la parábola efectivamente toca o cruza el suelo (discriminante Δ ≥ 0).",
    example:
      "La función f(x) = 3(x − 2)(x + 5) tiene coeficiente principal a = 3 y corta al eje X en x₁ = 2 y en x₂ = −5.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "f(x) = a(x − x₁)(x − x₂);   xᵥ = ",
        frac("x₁ + x₂", "2"),
      ),
    contrast:
      "Nunca te olvides de escribir adelante el coeficiente principal a: (x − x₁)(x − x₂) sola tiene coeficiente 1 y otra abertura vertical distinta.",
  },
  forma_polinomica: {
    title: "Forma polinómica f(x) = ax² + bx + c",
    pose: "neutral",
    text: "Es la expresión totalmente desarrollada término a término: el término cuadrático ax² (con a ≠ 0), el término lineal bx y el término independiente c. El dato geométrico que te regala gratis a simple vista es la ordenada al origen f(0) = c, es decir, la altura donde la parábola corta al eje vertical Y.",
    example:
      "En f(x) = 2x² − 8x + 6, sabemos sin calcular nada que corta al eje Y en (0; 6) y que abre hacia arriba porque a = 2 > 0.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "f(x) = ax² + bx + c;   f(0) = c;   xᵥ = −",
        frac("b", "2a"),
      ),
    contrast:
      "El número c es el corte con el eje Y, ¡no el vértice! Y el coeficiente b por sí solo no es la abscisa del vértice: necesitás hacer −b/(2a).",
  },
  propiedad_producto_cero: {
    title: "Propiedad del producto cero (o producto nulo)",
    pose: "enojada",
    text: "Ley fundamental del álgebra: si multiplicás dos o más expresiones y el resultado da exactamente 0, entonces obligatoriamente al menos una de las piezas multiplicadas tiene que valer 0. Es la llave maestra que permite transformar una ecuación de grado 2 factorizada en dos ecuaciones lineales chiquitas y fáciles.",
    example:
      "En x · (x − 4) = 0, hay dos factores multiplicándose: o bien el primero vale cero (x₁ = 0) o bien el paréntesis vale cero (x − 4 = 0 ⇒ x₂ = 4).",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "A · B = 0 ⟺ A = 0 ∨ B = 0;   a(x − x₁)(x − x₂) = 0 ⟹ x = x₁ ∨ x = x₂;   ",
        frac("0", "a"),
        " = 0",
      ),
    contrast:
      "¡Atención! Esta propiedad sólo funciona cuando del otro lado del igual hay un CERO. Si tenés (x − 1)(x − 2) = 6, NO podés decir que x − 1 = 6: primero tenés que desarrollar, restar 6 e igualar a 0.",
  },
  completar_cuadrado: {
    title: "Completar el cuadrado",
    pose: "pensativa",
    text: "Técnica quirúrgica para pasar de la forma polinómica a la forma canónica sin usar fórmulas de memoria. Consiste en partir a la mitad el coeficiente lineal y sumar y restar su cuadrado (sumando el neutro aditivo +0) para fabricar un trinomio cuadrado perfecto que se pliega en un binomio al cuadrado.",
    example:
      "En x² − 6x + 2, la mitad de −6 es −3 y (−3)² = 9. Hacemos (x² − 6x + 9) − 9 + 2 y obtenemos (x − 3)² − 7.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "x² + bx = (x + ",
        frac("b", "2"),
        ")² − (",
        frac("b", "2"),
        ")²",
      ),
    contrast:
      "Si el coeficiente principal a no es 1, primero sacá factor común a de los términos con x, y cuando saques afuera el término restado acordate de multiplicarlo por ese factor a.",
  },
  discriminante: {
    title: "Discriminante (Δ = b² − 4ac)",
    pose: "evaluando",
    text: "Es el número que vive adentro de la raíz cuadrada en la fórmula resolvente y actúa como un detector de raíces reales antes de terminar la cuenta. Su signo decide si la parábola corta al eje X en dos puntos distintos (Δ > 0), si rebota tocándolo en un único punto (Δ = 0) o si flota sin tocarlo (Δ < 0).",
    example:
      "En x² − 4x + 4 = 0, Δ = (−4)² − 4·1·4 = 16 − 16 = 0, lo que confirma que tiene una única raíz doble en x = 2.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "Δ = b² − 4ac;   x₁,₂ = −",
        frac("b", "2a"),
        " ± ",
        frac("√Δ", "2a"),
      ),
    contrast:
      "El discriminante es solamente el número b² − 4ac SIN el símbolo de raíz cuadrada. Y cuidado: como b va al cuadrado, el primer término b² da siempre positivo aunque b sea negativo.",
  },
  cardano_vieta: {
    title: "Propiedades de las raíces (Cardano-Vieta)",
    pose: "orgullosa",
    text: "Relaciones directas que vinculan las dos raíces x₁ y x₂ con los coeficientes del polinomio sin necesidad de calcular cada raíz por separado: la suma de las raíces es siempre −b/a y el producto de las raíces es siempre c/a. Son un atajo de oro cuando un problema te da un dato sobre las raíces y te pide hallar un parámetro k.",
    example:
      "En 2x² − 10x + 12 = 0, sin resolver nada sabemos que las raíces suman x₁ + x₂ = −(−10)/2 = 5 y se multiplican dando x₁ · x₂ = 12/2 = 6 (son 2 y 3).",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "x₁ + x₂ = −",
        frac("b", "a"),
        ";   x₁ · x₂ = ",
        frac("c", "a"),
      ),
    contrast:
      "¡No te olvides del signo menos en la suma! Al expandir a(x − x₁)(x − x₂) = ax² − a(x₁ + x₂)x + ax₁x₂, la suma queda acompañada de un signo negativo.",
  },
  recta_tangente_parabola: {
    title: "Recta tangente a una parábola",
    pose: "apuntando",
    text: "Una recta no vertical y = mx + d es tangente a una parábola cuando se tocan en un único punto del plano rozándose sin atravesarse. Analíticamente, al igualar ax² + bx + c = mx + d y pasar todo a un miembro, la ecuación cuadrática diferencia tiene raíz doble, es decir, su discriminante de intersección vale exactamente cero (Δ_int = 0).",
    example:
      "La recta y = 2x − 1 es tangente a la parábola y = x² porque al igualar queda x² − 2x + 1 = (x − 1)² = 0, con Δ_int = 0 y punto de contacto único (1; 1).",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "ax² + (b − m)x + (c − d) = 0;   Δ_int = (b − m)² − 4a(c − d) = 0;   x_tan = −",
        frac("b − m", "2a"),
      ),
    contrast:
      "Si Δ_int > 0 la recta corta en dos puntos y se llama secante; si Δ_int < 0 no se tocan nunca y se llama exterior.",
  },
};

function wordCount(term) {
  return `${term.title} ${term.text} ${term.example} ${term.contrast}`
    .trim()
    .split(/\s+/).length;
}

export function initGlossary(root = document) {
  root.querySelectorAll("[data-gloss]").forEach((node) => {
    const term = GLOSSARY_TERMS[node.dataset.gloss];
    if (!term || node.dataset.glossReady) return;
    node.dataset.glossReady = "true";
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
    node.setAttribute(
      "aria-label",
      `${term.title}: abrir explicación de Alaska`,
    );
    const explain = () => {
      const formulaHtml = term.formula().outerHTML;
      react({
        pose: term.pose,
        tag: term.title,
        html: `<p>${term.text}</p><p><strong>Ejemplo:</strong> ${term.example}</p><p class="eq">${formulaHtml}</p><p><strong>Cuidado:</strong> ${term.contrast}</p>`,
      });
    };
    node.addEventListener("click", explain);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        explain();
      }
    });
  });
}

export const GLOSSARY_AUDIT = Object.fromEntries(
  Object.entries(GLOSSARY_TERMS).map(([key, term]) => [
    key,
    { words: wordCount(term), pose: term.pose },
  ]),
);
