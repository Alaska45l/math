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
    pose: "explicando",
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
    pose: "explicando",
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
    pose: "base",
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
    pose: "explicando",
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
  pendiente_recta: {
    title: "Pendiente de una recta (m)",
    pose: "explicando",
    text: "Mide la inclinación constante de una recta no vertical: indica cuántas unidades cambia la coordenada vertical y por cada unidad que avanzamos horizontalmente en x. Se calcula como el cociente incremental Δy sobre Δx entre dos puntos distintos cualesquiera de la recta y coincide con la tangente trigonométrica del ángulo de inclinación.",
    example:
      "La recta que pasa por A(1; 2) y B(4; 8) tiene pendiente m = (8 − 2)/(4 − 1) = 6/3 = 2: sube 2 por cada paso a la derecha.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "m = ",
        frac("y₂ − y₁", "x₂ − x₁"),
        " = ",
        frac("Δy", "Δx"),
        " = tg(α);   x₁ ≠ x₂",
      ),
    contrast:
      "¡Ojo con el orden y el divisor! Invertir el cociente como Δx/Δy arruina la pendiente; además, las rectas verticales tienen Δx = 0 y no poseen pendiente definida en ℝ.",
  },
  ordenada_al_origen: {
    title: "Ordenada al origen (b)",
    pose: "base",
    text: "Es la coordenada vertical donde la gráfica de una función o de una recta no vertical corta al eje Y, es decir, el valor que toma la salida cuando x = 0. En la ecuación explícita y = mx + b aparece a simple vista como el término independiente y funciona como punto de ancla inicial.",
    example:
      "En y = −3x + 5, al reemplazar x = 0 obtenemos y = 5, por lo que la recta corta al eje vertical en el punto (0; 5).",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "f(0) = b;   P₀ = (0; b);   y = mx + b ⟹ b = y − mx;   ",
        frac("b", "1"),
        " = f(0)",
      ),
    contrast:
      "No confundir ordenada al origen (corte con el eje Y donde x = 0) con raíz o abscisa al origen (corte con el eje X donde y = 0).",
  },
  ecuacion_segmentaria: {
    title: "Ecuación segmentaria (canónica de la recta)",
    pose: "lentes-brillo",
    text: "Es la forma de la recta que deja al desnudo sus dos intersecciones con los ejes coordenados: p marca el corte con el eje X en (p; 0) y q marca el corte con el eje Y en (0; q). Sólo existe cuando la recta corta a ambos ejes fuera del origen, es decir, cuando p ≠ 0 y q ≠ 0.",
    example:
      "La recta 2x + 3y = 6 se divide miembro a miembro por 6 para igualar a 1 y queda x/3 + y/2 = 1: corta en (3; 0) y (0; 2).",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        frac("x", "p"),
        " + ",
        frac("y", "q"),
        " = 1;   p ≠ 0,  q ≠ 0;   m = −",
        frac("q", "p"),
      ),
    contrast:
      "Las rectas horizontales, verticales o que pasan por el origen (0; 0) no admiten ecuación segmentaria porque no se puede dividir por cero.",
  },
  ecuacion_implicita: {
    title: "Ecuación general o implícita (Ax + By + C = 0)",
    pose: "pensativa",
    text: "Es la escritura universal de cualquier recta en el plano cartesiano, incluyendo las rectas verticales que no son funciones. Exige que los coeficientes A y B no sean simultáneamente nulos. Despejando y cuando B ≠ 0 recuperamos la forma explícita con pendiente −A/B y ordenada al origen −C/B.",
    example:
      "La recta 3x − 2y + 8 = 0 tiene A = 3, B = −2 y C = 8; si despejamos y resulta y = (3/2)x + 4, con pendiente 3/2.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "Ax + By + C = 0;   m = −",
        frac("A", "B"),
        ",   b = −",
        frac("C", "B"),
        "   (B ≠ 0)",
      ),
    contrast:
      "Si B = 0 y A ≠ 0, queda Ax + C = 0, es decir x = −C/A: representa una recta vertical que no tiene forma explícita y = mx + b.",
  },
  mediatriz: {
    title: "Mediatriz de un segmento",
    pose: "complice",
    text: "Es la recta perpendicular a un segmento dado AB que pasa exactamente por su punto medio M. Geométricamente reúne todos los puntos del plano que están a la misma distancia de A que de B. Para hallar su ecuación calculamos el punto medio M y usamos la pendiente opuesta e inversa respecto del segmento.",
    example:
      "Para A(0; 0) y B(4; 2), el punto medio es M(2; 1), la pendiente del segmento es 1/2 y la mediatriz tiene pendiente −2: y = −2(x − 2) + 1.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "M = (",
        frac("x_A + x_B", "2"),
        "; ",
        frac("y_A + y_B", "2"),
        ");   m_⊥ = −",
        frac("1", "m_{AB}"),
      ),
    contrast:
      "Si el segmento AB es horizontal (m = 0), su mediatriz es una recta vertical x = x_M y no se calcula haciendo −1/0.",
  },
  sistema_compatible_determinado: {
    title: "Sistema compatible determinado (SCD)",
    pose: "evaluando",
    text: "Es un sistema de ecuaciones lineales 2×2 que posee exactamente una única solución (x₀; y₀). En el plano cartesiano corresponde a dos rectas secantes con distinta inclinación que se cruzan en un único punto común. Al resolver algebraicamente se obtiene un valor concreto para cada incógnita.",
    example:
      "El sistema x + y = 5 y x − y = 1 tiene pendientes −1 y +1 distintas; sus rectas se cruzan únicamente en el punto S = {(3; 2)}.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "m₁ ≠ m₂ ⟺ ",
        frac("a₁", "a₂"),
        " ≠ ",
        frac("b₁", "b₂"),
        " ⟹ S = {(x₀; y₀)}",
      ),
    contrast:
      "Una solución de un sistema 2×2 siempre es un par ordenado (x₀; y₀), nunca dos números sueltos desconectados.",
  },
  sistema_compatible_indeterminado: {
    title: "Sistema compatible indeterminado (SCI)",
    pose: "lentes-brillo",
    text: "Es un sistema de ecuaciones lineales 2×2 que admite infinitas soluciones porque ambas ecuaciones describen exactamente la misma recta (son proporcionales en todos sus coeficientes). Al reducir por sustitución o igualación aparece una identidad verdadera como 0·x = 0 o 5 = 5, indicando rectas coincidentes.",
    example:
      "En 2x − y = 4 y 4x − 2y = 8, la segunda ecuación es el doble de la primera: comparten todos sus puntos y S = {(x; 2x − 4) / x ∈ ℝ}.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        frac("a₁", "a₂"),
        " = ",
        frac("b₁", "b₂"),
        " = ",
        frac("c₁", "c₂"),
        " ⟹ 0·x = 0   (∞ soluciones)",
      ),
    contrast:
      "¡Cuidado! Infinitas soluciones no significa «cualquier par del plano»: sólo pertenecen al conjunto solución los puntos que yacen sobre esa recta.",
  },
  sistema_incompatible: {
    title: "Sistema incompatible (SI)",
    pose: "sospecha",
    text: "Es un sistema de ecuaciones que no posee ninguna solución real porque sus condiciones se contradicen simultáneamente. Gráficamente corresponde a dos rectas paralelas no coincidentes: tienen exactamente la misma pendiente pero distinta ordenada al origen, de modo que nunca se intersecan. Algebraicamente conduce a un absurdo como 0·x = 5.",
    example:
      "El sistema y = 2x + 1 e y = 2x − 3 iguala las rectas dando 2x + 1 = 2x − 3 ⇒ 0 = −4, absurdo; el conjunto solución es S = ∅.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        frac("a₁", "a₂"),
        " = ",
        frac("b₁", "b₂"),
        " ≠ ",
        frac("c₁", "c₂"),
        " ⟹ 0·x = k ≠ 0;   S = ∅",
      ),
    contrast:
      "No confundir 0·x = 0 (identidad verdadera ⇒ SCI) con 0·x = k ≠ 0 (absurdo ⇒ SI, conjunto solución vacío ∅).",
  },
  grado_polinomio: {
    title: "Grado de un polinomio",
    pose: "explicando",
    text: "Es el mayor exponente natural con coeficiente distinto de cero que aparece en la variable x del polinomio. Define la cota máxima de raíces reales, el comportamiento en los extremos y se mantiene o suma en operaciones: al multiplicar polinomios no nulos sus grados se suman, mientras al sumar pueden cancelarse los términos líderes.",
    example:
      "En P(x) = 0·x⁴ + 5x³ − 2x + 7, el coeficiente de x⁴ es cero, por lo que el término líder real es 5x³ y gr(P) = 3.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "gr(P · Q) = gr(P) + gr(Q);   gr(P + Q) ≤ máx(gr(P); gr(Q));   ",
        frac("P(x)", "xⁿ"),
        " → aₙ ≠ 0",
      ),
    contrast:
      "El polinomio nulo P(x) = 0 no tiene grado definido; además, al sumar P + Q el grado puede bajar si sus coeficientes principales son opuestos.",
  },
  teorema_del_resto: {
    title: "Teorema del Resto",
    pose: "complice",
    text: "Establece que el resto R de dividir un polinomio P(x) por un divisor lineal de la forma (x − c) coincide exactamente con el valor numérico del polinomio evaluado en c, es decir, R = P(c). Permite comprobar divisibilidad de forma instantánea sin ejecutar toda la división larga ni la tabla de Ruffini.",
    example:
      "El resto de dividir P(x) = x³ − 2x + 5 por (x − 2) es directamente P(2) = 2³ − 2·2 + 5 = 9; y si da 0, (x − 2) es divisor exacto.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        frac("P(x)", "x − c"),
        " ⟹ R = P(c);   (x − c) | P(x) ⟺ P(c) = 0",
      ),
    contrast:
      "¡Atención al signo del divisor! Al dividir por (x + 3) = (x − (−3)), tenés que evaluar en x = −3, no en +3.",
  },
  regla_de_ruffini: {
    title: "Regla de Ruffini",
    pose: "evaluando",
    text: "Es el algoritmo sintético abreviado para dividir un polinomio P(x) por un binomio mónico de grado uno (x − c). Exige escribir todos los coeficientes del dividendo ordenados en forma decreciente y completos con ceros donde falten potencias. Entrega de una sola pasada los coeficientes del cociente C(x) y el resto numérico final.",
    example:
      "Para dividir x³ − 4x + 1 por (x − 2), ordenamos los coeficientes completos [1, 0, −4, 1] y aplicamos Ruffini con c = 2, obteniendo cociente x² + 2x y resto 1.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "P(x) = (x − c) · C(x) + R;   ",
        frac("P(x)", "ax − b"),
        " = ",
        frac("1", "a"),
        " · ",
        frac("P(x)", "x − b/a"),
      ),
    contrast:
      "¡Dos trampas clásicas! Nunca te saltees los ceros de los términos faltantes; y si dividís por (ax − b) con a ≠ 1, después de usar c = b/a debés dividir el cociente obtenido por a.",
  },
  teorema_de_gauss: {
    title: "Teorema de Gauss (raíces racionales)",
    pose: "lentes-brillo",
    text: "Para todo polinomio P(x) con coeficientes enteros cuyo término independiente a₀ y coeficiente principal aₙ son no nulos, cualquier raíz racional p/q (expresada como fracción irreducible) cumple necesariamente que p divide a a₀ y q divide a aₙ. Acota la búsqueda de raíces racionales a una lista finita de candidatos.",
    example:
      "En 2x³ − 3x² − 2x + 3, los divisores de a₀ = 3 son ±1, ±3 y los de aₙ = 2 son ±1, ±2; los candidatos posibles p/q son ±1, ±3, ±1/2 y ±3/2.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "x = ",
        frac("p", "q"),
        "   (mcd(p; q) = 1) ⟹ p | a₀  ∧  q | aₙ",
      ),
    contrast:
      "El Teorema de Gauss sólo propone candidatos racionales: un polinomio puede no tener raíces racionales y sí poseer raíces irracionales como √2 o ninguna raíz real.",
  },
  discontinuidad_evitable_agujero: {
    title: "Discontinuidad evitable (agujero)",
    pose: "sospecha",
    text: "Se produce en una función racional P(x)/Q(x) cuando un valor x₀ anula simultáneamente al numerador y al denominador, pero su factor (x − x₀) tiene mayor o igual multiplicidad en el numerador que en el denominador. Al simplificar el factor común la curva parece continua, pero x₀ sigue excluido del dominio original formando un punto vacío.",
    example:
      "En f(x) = (x² − 1)/(x − 1), para x ≠ 1 vale x + 1, pero en x = 1 no existe división por cero: la gráfica es la recta y = x + 1 con un agujero en (1; 2).",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "f(x) = ",
        frac("(x − 1)(x + 1)", "x − 1"),
        " = x + 1   (x ≠ 1);   Dom(f) = ℝ − {1}",
      ),
    contrast:
      "¡Error fatal de simplificación! Nunca calcules el dominio después de tachar factores comunes: la restricción Q(x) ≠ 0 nace de la fórmula original.",
  },
  asintota_vertical: {
    title: "Asíntota vertical (x = x₀)",
    pose: "pensativa",
    text: "Es una recta vertical x = x₀ que actúa como barrera infranqueable para la gráfica de una función: al acercarse a x₀, los valores de |f(x)| crecen sin límite hacia +∞ o −∞. Aparece en funciones racionales cuando un polo del denominador no queda neutralizado por el numerador, y también en el borde del dominio de toda función logarítmica.",
    example:
      "En f(x) = (x − 1)/(x − 1)² = 1/(x − 1) sobrevive un factor (x − 1) en el denominador, generando asíntota vertical en x = 1.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "f(x) = ",
        frac("x − 1", "(x − 1)²"),
        " = ",
        frac("1", "x − 1"),
        " ⟹ AV: x = 1;   Dom = ℝ − {1}",
      ),
    contrast:
      "Que Q(x₀) = 0 no alcanza por sí solo para asegurar una asíntota vertical: primero verificá las multiplicidades para distinguir si es polo (asíntota) o agujero.",
  },
  solucion_extraviada: {
    title: "Solución extraviada (raíz extraña)",
    pose: "enojada",
    text: "Es un valor numérico que surge válidamente al elevar ambos miembros de una ecuación irracional al cuadrado (u otra potencia par), pero que NO satisface la ecuación original al verificarlo. Aparece porque elevar al cuadrado no es una operación reversible cuando un miembro puede ser negativo frente a una raíz principal no negativa.",
    example:
      "Al resolver √(x + 2) = x, elevar al cuadrado da x² − x − 2 = 0 con candidatos x = 2 y x = −1; al verificar, √(−1 + 2) = 1 ≠ −1, por lo que x = −1 es extraviada.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "√(g(x)) = h(x) ⟹ g(x) ≥ 0  ∧  h(x) ≥ 0;   ",
        frac("√(−1 + 2)", "−1"),
        " = −1 ≠ 1",
      ),
    contrast:
      "En ecuaciones irracionales es obligatorio verificar cada candidato en la ecuación original (y chequear el dominio del radicando) antes de escribir el conjunto solución.",
  },
  logaritmo: {
    title: "Logaritmo en base a (logₐ(x))",
    pose: "explicando",
    text: "El logaritmo en base a de un argumento x es el exponente y al que debemos elevar la base a para obtener x: logₐ(x) = y equivale exactamente a aʸ = x. En los números reales exige tres condiciones simultáneas: argumento estrictamente positivo (x > 0), base positiva (a > 0) y base distinta de uno (a ≠ 1).",
    example:
      "Como 2⁵ = 32, el logaritmo en base 2 de 32 vale 5; del mismo modo, log₃(1/9) = −2 porque 3⁻² = 1/9.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "logₐ(x) = y ⟺ aʸ = x;   logₐ(",
        frac("1", "a"),
        ") = −1;   x > 0,  a > 0,  a ≠ 1",
      ),
    contrast:
      "¡Prohibido inventar propiedades! logₐ(x + y) NO es logₐ(x) + logₐ(y); el logaritmo convierte multiplicaciones en sumas, nunca sumas en sumas.",
  },
  cambio_de_base: {
    title: "Cambio de base logarítmica",
    pose: "complice",
    text: "Identidad fundamental que permite expresar un logaritmo de base arbitraria a como un cociente de logaritmos en cualquier otra base válida b (como base 10 o base natural e). Se deduce despejando y en aʸ = x mediante log_b a ambos lados y resulta clave para calcular valores aproximados o igualar bases en ecuaciones.",
    example:
      "Para evaluar log₄(8) usando base 2 escribimos log₂(8) / log₂(4) = 3 / 2 = 1,5, ya que 4^(3/2) = 8.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "logₐ(x) = ",
        frac("log_b(x)", "log_b(a)"),
        " = ",
        frac("ln(x)", "ln(a)"),
        ";   a, b > 0;  a, b ≠ 1",
      ),
    contrast:
      "No confundir el cociente de dos logaritmos log_b(x) / log_b(a) con el logaritmo de un cociente log_b(x / a) = log_b(x) − log_b(a).",
  },
  razones_trigonometricas_sohcahtoa: {
    title: "Razones trigonométricas (SOHCAHTOA)",
    pose: "explicando",
    text: "Son los cocientes invariantes entre los lados de un triángulo rectángulo respecto de uno de sus ángulos agudos α: seno (opuesto sobre hipotenusa), coseno (adyacente sobre hipotenusa) y tangente (opuesto sobre adyacente). Sólo dependen de la medida angular porque todos los triángulos rectángulos con el mismo ángulo son semejantes.",
    example:
      "En un triángulo rectángulo de catetos 3 y 4 e hipotenusa 5, para el ángulo α opuesto al cateto 3 vale sen(α) = 3/5, cos(α) = 4/5 y tg(α) = 3/4.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "sen(α) = ",
        frac("Op", "Hip"),
        ";   cos(α) = ",
        frac("Ady", "Hip"),
        ";   tg(α) = ",
        frac("Op", "Ady"),
        " = ",
        frac("sen(α)", "cos(α)"),
      ),
    contrast:
      "La hipotenusa es siempre el lado mayor opuesto al ángulo recto, mientras que opuesto y adyacente se intercambian al cambiar de ángulo agudo.",
  },
  sistema_circular_radian: {
    title: "Sistema circular y radián",
    pose: "evaluando",
    text: "Un radián es el ángulo central de una circunferencia que subtiende un arco s de longitud exactamente igual al radio r. Como la circunferencia completa mide 2π·r, una vuelta entera equivale a 2π radianes (360°) y media vuelta equivale a π radianes (180°). Simplifica directamente la fórmula de longitud de arco s = r·θ.",
    example:
      "Un ángulo de 60° equivale a π/3 radianes; si el radio mide 6 cm, el arco abarcado vale s = 6 · (π/3) = 2π cm.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "θ = ",
        frac("s", "r"),
        " (rad);   ",
        frac("α°", "180°"),
        " = ",
        frac("θ_rad", "π"),
        ";   π rad = 180°",
      ),
    contrast:
      "¡Verificá el modo de tu calculadora y las expresiones! En funciones reales f(x) = sen(x), la variable x representa radianes (número real), no grados sexagesimales.",
  },
  clase_de_congruencia: {
    title: "Clase de congruencia angular (C_α)",
    pose: "lentes-brillo",
    text: "Agrupa a todos los ángulos orientados que comparten exactamente el mismo lado terminal sobre la circunferencia trigonométrica, difiriendo entre sí por un número entero de vueltas completas (2kπ radianes o 360°·k con k ∈ ℤ). Su representante principal es el único ángulo de la clase perteneciente al intervalo [0; 2π).",
    example:
      "Los ángulos −π/3, 5π/3 y 11π/3 pertenecen todos a la misma clase de congruencia porque 11π/3 = 5π/3 + 2π y −π/3 = 5π/3 − 2π.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "C_α = { α + 2kπ  /  k ∈ ℤ };   α₀ ∈ [0; 2π);   ",
        frac("11π", "3"),
        " ≡ ",
        frac("5π", "3"),
      ),
    contrast:
      "Dos ángulos congruentes tienen exactamente los mismos valores para las seis razones trigonométricas, aunque correspondan a distinta cantidad de giros.",
  },
  periodo_trigonometrico: {
    title: "Período trigonométrico (T)",
    pose: "pensativa",
    text: "Es la menor longitud positiva T sobre el eje real después de la cual los valores de una función trigonométrica se repiten exactamente: f(x + T) = f(x) para todo x del dominio. El seno, coseno, cosecante y secante tienen período fundamental 2π, mientras que la tangente y la cotangente repiten su ciclo cada π radianes.",
    example:
      "La función f(x) = cos(2x) completa dos ciclos en 2π, de modo que su período reducido es T = 2π / 2 = π.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "T_{sen, cos} = ",
        frac("2π", "|b|"),
        ";   T_{tg, cotg} = ",
        frac("π", "|b|"),
        ";   f(x + T) = f(x)",
      ),
    contrast:
      "No asignes el mismo dominio ni el mismo período a las seis funciones: tg(x) y sec(x) excluyen π/2 + kπ, mientras cotg(x) y cosec(x) excluyen kπ.",
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
