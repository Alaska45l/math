import { h, mount, qsa } from "../../core/dom.js";
import { renderNav, initLessonDock } from "../../core/nav.js";
import { initGlossary } from "../../core/glossary.js";
import { initRetosModule } from "./retos.js";
import {
  bindTutorButtons,
  mountCheckBlock,
  mountProgress,
  annotatedPowFormula,
  worldsComparisonCard,
} from "./components.js";
import { initDosMundosWidget } from "./widgets/dos-mundos.js";
import { initCintaNegativaWidget } from "./widgets/cinta-negativa.js";
import { initNeutroCancelacionWidget } from "./widgets/neutro-cancelacion.js";
import { initMitadMundosWidget } from "./widgets/mitad-mundos.js";
import { initGeometriaRaicesWidget } from "./widgets/geometria-raices.js";
import { initArbolFactoresWidget } from "./widgets/arbol-factores.js";
import { initSimplificadorRadicalWidget } from "./widgets/simplificador-radical.js";
import { initChoqueMundosWidget } from "./widgets/choque-mundos.js";
import { initEspejoDominioRealWidget } from "./widgets/espejo-dominio-real.js";
import { initInspectorParadojasWidget } from "./widgets/inspector-paradojas.js";

export const CHECKS_DATA = {
  "sec-1": [
    {
      type: "number",
      prompt: "Cuatro saltos aditivos de tamaño 3: calculá 3 · 4.",
      spec: { value: 12, context: "producto repetido 3 por 4" },
      hints: [
        "Frená, que acá el 4 está abajo y cuenta saltos aditivos: ¿cuántas veces vas a sumar el mismo 3 desde el cero? No es una potencia.",
        "Escribí los cuatro saltos completos: 3 + 3 + 3 + 3. Agrupá primero dos parejas para que la suma se vea, en vez de apretar teclas por reflejo.",
        "Las dos primeras fichas dan 6 y las dos últimas también dan 6. Completá 6 + 6 y verificá que no aparecieron factores multiplicándose.",
      ],
      solution: [
        "3 · 4 significa cuatro sumandos iguales.",
        "3 + 3 + 3 + 3 = 6 + 6 = 12.",
        "Respuesta: 12; el contador es aditivo.",
      ],
    },
    {
      type: "number",
      prompt: "Sin multiplicar factores: ¿cuánto vale 7⁰?",
      spec: { value: 1, context: "7^0 exponente cero" },
      hints: [
        "Antes de responder, ubicá el mundo: el cero está en un exponente, así que cuenta cambios de escala desde el neutro multiplicativo, no sumandos.",
        "Imaginá que empezás en 1 y todavía no multiplicaste por 7 ninguna vez. ¿Qué número quedó intacto cuando no hubo pasos?",
        "La comprobación es breve: el número que no modifica una multiplicación es 1. Por eso completá 7⁰ = 1, aunque 7 · 0 sí dé 0.",
      ],
      solution: [
        "Toda potencia se interpreta desde la escala inicial 1.",
        "Cero pasos no modifica ese punto de partida.",
        "7⁰ = 1.",
      ],
    },
    {
      type: "choice",
      prompt: "Elegí la reescritura correcta de 4 · 2ⁿ para n entero.",
      options: [
        "8ⁿ, porque se multiplican las bases",
        "2ⁿ⁺², porque 4 = 2²",
        "2⁴ⁿ, porque se suman exponentes",
      ],
      expected: 1,
      diagnosis: "multiplied_bases_in_same_base_prod",
      diagnosisMessage:
        "El 4 no es otro factor 2ⁿ: primero escribilo como 2² y recién entonces combiná potencias de la misma base.",
      hints: [
        "No multipliques las bases de entrada: la potencia variable ya tiene base 2. Preguntate cómo expresar el 4 usando exactamente esa misma base.",
        "Como 4 = 2², la expresión pasa a ser 2² · 2ⁿ. Recién ahora hay factores de la misma base y podés usar la ley de exponentes.",
        "Al juntar dos doses y n doses, el contador total es n + 2. Elegí la opción que conserve base 2 y escriba 2ⁿ⁺².",
      ],
      solution: [
        "4 = 2².",
        "Entonces 4 · 2ⁿ = 2² · 2ⁿ.",
        "Al concatenar factores iguales, 2² · 2ⁿ = 2ⁿ⁺²; no es 8ⁿ.",
      ],
    },
  ],
  "sec-2": [
    {
      type: "number",
      prompt: "Calculá 2⁻³ como una fracción positiva.",
      spec: { value: 0.125, context: "2^-3 exponente negativo" },
      hints: [
        "El menos está en el exponente, no delante de la base: indica retroceder en el mundo multiplicativo. ¿Cuál es el punto de partida de ese recorrido?",
        "Salí de 1 y dividí por 2 una vez, otra vez y una tercera vez: 1 : 2 : 2 : 2. Anotá cada parada antes de saltar al final.",
        "Las paradas son un medio, un cuarto y un octavo. Escribí la última como fracción positiva y, si querés, comprobá que su decimal es 0,125.",
      ],
      solution: [
        "2⁻³ = 1 : 2 : 2 : 2.",
        "Las divisiones dan 1/2, luego 1/4 y luego 1/8.",
        "Respuesta: 1/8 = 0,125; el exponente negativo no vuelve negativo el resultado.",
      ],
    },
    {
      type: "number",
      prompt: "Evaluá (2/3)⁻².",
      spec: { value: 2.25, context: "(2/3)^-2 exponente negativo fracción" },
      hints: [
        "El exponente negativo no invierte sólo el 2 ni sólo el 3: te pide el inverso de la fracción completa. ¿Qué fracción multiplicada por 2/3 devuelve 1?",
        "Intercambiá numerador y denominador: 2/3 se vuelve 3/2. Ahora sí tenés dos factores iguales de 3/2 para multiplicar.",
        "Multiplicá numeradores entre sí y denominadores entre sí: 3² sobre 2². Terminá la fracción 9/4 y comprobá que vale 2,25.",
      ],
      solution: [
        "Un exponente negativo usa el inverso multiplicativo de la base.",
        "(2/3)⁻² = (3/2)².",
        "(3/2)² = 9/4 = 2,25.",
      ],
    },
    {
      type: "choice",
      prompt: "Un compañero dice que 2⁻³ = −8. ¿Qué falla?",
      options: [
        "El signo del exponente indica dividir desde 1; da 1/8",
        "El exponente negativo vuelve negativa cualquier potencia",
        "La potencia no está definida en los reales",
      ],
      expected: 0,
      diagnosis: "negative_exponent_is_negative_number",
      diagnosisMessage:
        "El menos del exponente invierte la operación multiplicativa. No cambia el signo de la base positiva.",
      hints: [
        "Mirá dónde está el signo menos: no pertenece a la base 2. En una potencia negativa el signo avisa operación inversa, no resultado negativo.",
        "Retrocedé desde el neutro 1: al dividir por 2 obtenés 1/2, luego 1/4 y después 1/8. ¿En qué paso aparecería un número negativo?",
        "Como todos los números de ese recorrido son positivos, elegí la explicación que termina en 1/8. El −8 sería confundir exponente negativo con base negativa.",
      ],
      solution: [
        "2³ avanza desde 1 multiplicando tres veces por 2.",
        "2⁻³ retrocede dividiendo: 1 : 2 : 2 : 2 = 1/8.",
        "La respuesta es positiva; el error leyó el exponente como signo del resultado.",
      ],
    },
  ],
  "sec-3": [
    {
      type: "expr",
      prompt: "Simplificá 3⁴ / 3¹⁰ con exponente entero.",
      spec: {
        value: 1 / 729,
        context: "3^4 dividido 3^10 cociente cancelación",
      },
      hints: [
        "No digas «se cancela» todavía: expandí mentalmente los cuatro treses de arriba y los diez de abajo. ¿Cuántas parejas verticales iguales podés formar?",
        "Cada pareja se escribe 3/3 y vale 1, el neutro multiplicativo. Después de usar los cuatro de arriba, contá los treses que siguen sobrando abajo.",
        "Quedan seis treses en el denominador, acompañados por 1 · 1 · 1 · 1. Escribí 1/3⁶ o 3⁻⁶ y verificá que no apareció ni un cero ni un cuatro.",
      ],
      solution: [
        "Hay cuatro factores que forman cuatro cocientes 3/3 = 1.",
        "En el denominador quedan seis factores 3: 1 · 1 · 1 · 1 · 1/3⁶.",
        "El resultado es 1/3⁶ = 3⁻⁶ = 1/729.",
      ],
    },
    {
      type: "number",
      prompt: "Calculá 2³ · 2⁴.",
      spec: { value: 128, context: "producto misma base potencias" },
      hints: [
        "Ambas potencias viven en el mundo multiplicativo y tienen base 2. Antes de calcular, preguntate cuántos factores dos aporta cada una.",
        "2³ aporta tres doses y 2⁴ aporta cuatro más; al unir los productos no cambiaste de base, sólo alargaste la fila de factores.",
        "La fila completa tiene siete doses, así que escribí 2⁷ y calculá su valor. Podés chequearlo duplicando sucesivamente desde 1.",
      ],
      solution: [
        "2³ aporta tres factores 2 y 2⁴ aporta cuatro.",
        "Juntos forman 2⁷.",
        "2⁷ = 128.",
      ],
    },
    {
      type: "choice",
      prompt: "¿Qué valor tiene cada pareja 5/5 al dividir potencias iguales?",
      options: [
        "0, porque se tachó",
        "1, el neutro multiplicativo",
        "2, porque hay dos cincos",
      ],
      expected: 1,
      diagnosis: "canceled_to_zero_or_counted_ones",
      diagnosisMessage:
        "La pareja no desaparece: 5/5 vale exactamente 1. Ese neutro mantiene intacto el producto restante.",
      hints: [
        "Preguntate cuántas veces cabe cinco dentro de cinco, o qué factor multiplicado por 5 lo deja igual. Esa pregunta revela el neutro correcto.",
        "Como 5 no es cero, 5/5 forma una pareja de factores idénticos. Una división así vale el neutro multiplicativo; no vale cero por haberla tachado.",
        "Completá 5/5 = 1. Si hubiera varias parejas, se multiplicarían como 1 · 1 · …, y por eso el producto restante no se altera.",
      ],
      solution: [
        "5/5 pregunta cuántas veces cabe cinco en cinco.",
        "Cabe una vez, así que 5/5 = 1.",
        "Al emparejar factores iguales queda un factor ×1, nunca ×0 ni una suma de unos.",
      ],
    },
  ],
  "sec-4": [
    {
      type: "pair",
      prompt:
        "Para x = 36, completá mitad aditiva y raíz cuadrada: x · 1/2 ; x^(1/2).",
      firstLabel: "mitad aditiva",
      secondLabel: "raíz cuadrada",
      expected: [18, 6],
      hints: [
        "Hay dos preguntas distintas escondidas en el mismo 36: la primera reparte una cantidad desde cero; la segunda busca una escala que se repite desde uno.",
        "Para la mitad aditiva pedí dos sumandos iguales; para la raíz pedí dos factores iguales. Escribí ambas ecuaciones antes de anotar respuestas.",
        "Verificá 18 + 18 = 36 y, por separado, 6 · 6 = 36. Colocá 18 en el primer casillero y 6 en el segundo, respetando el orden.",
      ],
      solution: [
        "36 · 1/2 = 36 ÷ 2 = 18.",
        "36^(1/2) = √36, porque el exponente 1/2 pide el factor que se repite dos veces.",
        "√36 = 6; por lo tanto las respuestas son 18 y 6.",
      ],
    },
    {
      type: "number",
      prompt: "Calculá 27^(1/3).",
      spec: { value: 3, context: "27^(1/3) raíz cúbica" },
      hints: [
        "El denominador 3 del exponente fraccionario pide tres etapas multiplicativas iguales. No dividas 27 por tres como si la pregunta fuera aditiva.",
        "Probá factores pequeños repetidos: 3 · 3 da 9, y una tercera vez por 3 llega a 27. Ése es el recorrido desde el neutro 1.",
        "Como 3³ reconstruye 27, completá 27^(1/3) = 3. La prueba siempre es elevar de nuevo el candidato al índice de la raíz.",
      ],
      solution: [
        "El denominador 3 indica tres factores iguales.",
        "3³ = 27.",
        "Entonces 27^(1/3) = ∛27 = 3.",
      ],
    },
    {
      type: "number",
      prompt: "Evaluá 16^(3/4).",
      spec: { value: 8, context: "16^(3/4) exponente racional raíz" },
      hints: [
        "Leé primero el denominador: el 4 pide una raíz cuarta, mientras que el 3 del numerador recién actúa después. No multipliques 16 por una fracción.",
        "Buscá el factor que repetido cuatro veces da 16: 2 · 2 · 2 · 2. Así convertís 16^(3/4) en (⁴√16)³.",
        "La raíz cuarta vale 2; repetí ahora ese factor tres veces. Completá 2³ y verificá que llegás a 8.",
      ],
      solution: ["16^(3/4) = (⁴√16)³.", "⁴√16 = 2 porque 2⁴ = 16.", "2³ = 8."],
    },
  ],
  "sec-5": [
    {
      type: "number",
      prompt: "¿Cuántas baldosas de una unidad cubren un cuadrado de lado 8?",
      spec: { value: 64, context: "área cuadrado lado 8" },
      hints: [
        "Imaginá el piso antes de poner una cuenta: una fila tiene ocho baldosas y hay ocho filas. ¿Estás contando una longitud o una superficie?",
        "El área junta dos direcciones perpendiculares, largo por ancho. Escribí 8 · 8 en vez de sumar 8 + 8, que todavía mediría una línea.",
        "Ocho filas de ocho completan 64 baldosas. Escribí 8² = 64 y conservá la unidad cuadrada, porque estás cubriendo superficie.",
      ],
      solution: [
        "Un cuadrado tiene dos dimensiones: largo y ancho.",
        "El conteo es 8 · 8.",
        "Área = 8² = 64 unidades cuadradas.",
      ],
    },
    {
      type: "number",
      prompt: "Calculá la arista de un cubo cuyo volumen es 27 u³.",
      spec: { value: 3, context: "raíz cúbica volumen 27" },
      hints: [
        "Un volumen de cubo usa la misma arista en largo, ancho y altura. El índice tres te avisa que necesitás un factor repetido tres veces.",
        "Llamá L a la arista y planteá L · L · L = 27. Probá cuántos cubitos van por borde sin mezclar ese dato con el volumen total.",
        "Tres capas de 3 por 3 cubitos dan 27, es decir 3³ = 27. Concluí que la arista mide 3 unidades.",
      ],
      solution: [
        "Volumen = L³.",
        "La operación inversa es la raíz cúbica: L = ∛27.",
        "Como 3³ = 27, la arista mide 3 unidades.",
      ],
    },
    {
      type: "choice",
      prompt:
        "¿Qué unidad corresponde a un área construida con lados en centímetros?",
      options: ["cm", "cm²", "cm³"],
      expected: 1,
      diagnosis: "additive_instead_of_multiplicative",
      diagnosisMessage:
        "El área multiplica dos longitudes: cm · cm produce cm².",
      hints: [
        "Una superficie se extiende en dos direcciones: largo y ancho. Antes de elegir, preguntate qué unidad tendría una sola baldosita de un centímetro por lado.",
        "Al calcular área multiplicás cm por cm. No son dos centímetros puestos uno detrás de otro; son dos direcciones formando una región plana.",
        "El producto de las unidades se escribe cm². Elegí esa opción: cm sería longitud y cm³ correspondería a un volumen con una tercera dimensión.",
      ],
      solution: [
        "Una longitud lleva unidades cm.",
        "El área combina largo por ancho: cm · cm.",
        "Por eso la unidad es cm², no cm ni cm³.",
      ],
    },
  ],
  "sec-6": [
    {
      type: "number",
      prompt: "Calculá la raíz cuarta de 81 por agrupación prima.",
      spec: { value: 3, context: "raíz cuarta 81 factores primos" },
      hints: [
        "El índice cuatro pide cuatro cajas idénticas. Primero preguntate qué ladrillo primo se repite al desarmar 81, sin intentar adivinar la raíz de memoria.",
        "81 = 3 · 3 · 3 · 3: repartí un 3 en cada una de las cuatro cajas. Así cada caja tiene exactamente el mismo producto.",
        "El producto de una caja es 3 y, al repetirla cuatro veces, 3⁴ recupera 81. Completá ⁴√81 = 3.",
      ],
      solution: [
        "Descomponemos 81 = 3⁴.",
        "La raíz cuarta reparte los cuatro factores 3 entre cuatro cajas.",
        "Cada caja vale 3, así que ⁴√81 = 3.",
      ],
    },
    {
      type: "number",
      prompt: "¿Cuánto vale la raíz quinta de 243?",
      spec: { value: 3, context: "raíz quinta 243" },
      hints: [
        "El índice cinco pide encontrar un bloque que se repita cinco veces. Empezá desarmando 243 en primos, sin aproximar con decimales.",
        "La descomposición contiene cinco factores 3: 3 · 3 · 3 · 3 · 3. Imaginá que cada una de las cinco cajas recibe un solo 3.",
        "Cada caja vale 3 y cinco cajas idénticas reconstruyen 243 como 3⁵. Por eso la raíz quinta que buscás es 3.",
      ],
      solution: [
        "La raíz quinta pregunta qué factor aparece cinco veces.",
        "3 · 3 · 3 · 3 · 3 = 243.",
        "⁵√243 = 3.",
      ],
    },
    {
      type: "number",
      prompt: "Calculá la raíz séptima de 128.",
      spec: { value: 2, context: "raíz séptima 128" },
      hints: [
        "No hace falta tener 128 memorizado: dividilo por 2 una y otra vez hasta llegar a 1. Contá cuántos doses aparecen en esa escalera.",
        "La escalera escribe 128 = 2⁷, es decir siete doses. El índice siete pide justamente repartir un dos en cada caja idéntica.",
        "Cada caja contiene 2 y siete cajas multiplicadas dan 2⁷ = 128. Cerrá la cuenta con ⁷√128 = 2.",
      ],
      solution: [
        "128 = 2 · 2 · 2 · 2 · 2 · 2 · 2.",
        "La raíz séptima arma siete grupos idénticos.",
        "Cada grupo vale 2; ⁷√128 = 2.",
      ],
    },
  ],
  "sec-7": [
    {
      type: "expr",
      prompt: "Simplificá √12 extrayendo todos los cuadrados perfectos.",
      spec: {
        value: Math.sqrt(12),
        context: "simplificar radical raíz cuadrada",
      },
      hints: [
        "En una raíz cuadrada sólo salen paquetes de dos factores iguales. Buscá dentro de 12 un cuadrado perfecto antes de intentar calcular la raíz entera.",
        "Escribí 12 = 4 · 3 = 2 · 2 · 3. La pareja de doses cruza junta la raíz; el 3 queda solo y no puede salir.",
        "Aplicá √4 = 2 y conservá √3 bajo el radical. La forma final 2√3 se controla al cuadrarla: recupera 4 · 3.",
      ],
      solution: [
        "12 = 2² · 3.",
        "El paquete de dos doses sale del radical como 2.",
        "Queda √12 = 2√3.",
      ],
    },
    {
      type: "expr",
      prompt: "Simplificá √(20x⁸), suponiendo x ≥ 0.",
      spec: {
        value: 32 * Math.sqrt(5),
        vars: { x: 2 },
        requireSimplified: true,
        canonical: "2x^4*sqrt(5)",
        context: "simplificar radical variables raíz cuadrada",
      },
      hints: [
        "El índice es dos, así que buscá parejas tanto en el número como en las ocho x. La condición x ≥ 0 te autoriza a sacar una potencia par sin cambiar el signo.",
        "Separá 20 = 4 · 5 y x⁸ = (x⁴)². Identificá los dos cuadrados completos: 4 y (x⁴)²; el 5 no completa ningún paquete.",
        "√4 aporta 2 y √((x⁴)²) aporta x⁴. Escribí 2x⁴√5 y comprobá, por ejemplo con x = 2, que ambos lados dan el mismo valor.",
      ],
      solution: [
        "√(20x⁸) = √(4 · 5 · x⁸).",
        "√4 = 2 y √(x⁸) = x⁴ para x real.",
        "La forma simplificada es 2x⁴√5.",
      ],
    },
    {
      type: "choice",
      prompt: "Para √(54x⁷), con x ≥ 0, ¿qué factores permanecen adentro?",
      options: ["6x", "2x", "3x²"],
      expected: 0,
      diagnosis: "unsimplified_radical",
      diagnosisMessage:
        "Los paquetes completos de 3 y de x salen; adentro permanecen 6 y una x.",
      hints: [
        "Tratemos al número y a la letra como fichas: en una raíz cuadrada salen parejas. Desarmá 54 y contá las siete x antes de decidir qué queda adentro.",
        "54 = 2 · 3 · 3 · 3: una pareja de treses forma 3² y el 2 · 3 restante es 6. De las siete x, seis forman (x³)² y sobra una x.",
        "Los paquetes 3² y (x³)² salen como 3x³; bajo el techo quedan 6x. Elegí la opción 6x y verificá 3x³√(6x) al elevar al cuadrado.",
      ],
      solution: [
        "54x⁷ = 3² · 6 · (x³)² · x.",
        "Salen el paquete 3² como 3 y el paquete (x³)² como x³.",
        "√(54x⁷) = 3x³√(6x), de modo que queda 6x bajo el radical.",
      ],
    },
  ],
  "sec-8": [
    {
      type: "choice",
      prompt: "¿Cuál es el desarrollo correcto de (2 − 3x)²?",
      options: ["4 − 9x²", "4 − 12x + 9x²", "4 + 12x + 9x²"],
      expected: 1,
      diagnosis: "distributed_power_over_sum",
      diagnosisMessage:
        "Faltó el término cruzado. El mosaico del cuadrado contiene dos rectángulos de área −6x.",
      hints: [
        "El cuadrado afecta al binomio completo, así que abrí dos copias del mismo paréntesis. ¿Qué cuatro productos aparecen al multiplicarlas?",
        "Distribuí 2 y −3x sobre 2 y −3x: anotá 4, −6x, −6x y 9x². Los dos productos cruzados son piezas reales del mosaico.",
        "Sumá los términos semejantes del medio: −6x − 6x = −12x. Elegí el desarrollo que conserva 4, −12x y 9x².",
      ],
      solution: [
        "(2 − 3x)² = (2 − 3x)(2 − 3x).",
        "Los productos son 4, −6x, −6x y 9x².",
        "Sumando las cuatro piezas queda 4 − 12x + 9x².",
      ],
    },
    {
      type: "number",
      prompt: "Calculá (x − √3)(x + √3) para x = 5.",
      spec: { value: 22, context: "diferencia de cuadrados conjugados" },
      hints: [
        "Los paréntesis difieren sólo en el signo central: son conjugados. Eso hace que los dos términos cruzados se anulen al multiplicar, no por magia sino por ser opuestos.",
        "Tomá u = x y v = √3: el producto queda u² − v², o sea x² − (√3)². Recién después reemplazá x por 5.",
        "Con x = 5 obtenés 25 − 3. Completá esa resta para llegar al valor pedido y comprobá que los radicales ya desaparecieron legalmente.",
      ],
      solution: [
        "Tomamos u = x y v = √3.",
        "(x − √3)(x + √3) = x² − (√3)² = x² − 3.",
        "Al sustituir x = 5 obtenemos 25 − 3 = 22.",
      ],
    },
    {
      type: "expr",
      prompt: "Simplificá ∛54 + ∛16 como múltiplo de ∛2.",
      spec: {
        value: 5 * Math.cbrt(2),
        requireSimplified: true,
        canonical: "5*root(3,2)",
        context: "sumar radicales cúbicos semejantes",
      },
      hints: [
        "Para sumar raíces cúbicas primero necesitás que ambas tengan el mismo radical, como cuando juntás términos semejantes. Buscá cubos perfectos dentro de 54 y 16.",
        "Separá 54 = 27 · 2 y 16 = 8 · 2. Como ∛27 = 3 y ∛8 = 2, ambas expresiones quedarán acompañando a ∛2.",
        "Transformá la suma en 3∛2 + 2∛2 y juntá los coeficientes. Completá 5∛2, sin dejar los cubos perfectos escondidos adentro.",
      ],
      solution: [
        "∛54 = ∛(27 · 2) = 3∛2.",
        "∛16 = ∛(8 · 2) = 2∛2.",
        "Son radicales semejantes: 3∛2 + 2∛2 = 5∛2.",
      ],
    },
  ],
  "sec-9": [
    {
      type: "number",
      prompt: "Evaluá √((-5)²).",
      spec: { value: 5, context: "sqrt(x^2) raíz cuadrada valor absoluto" },
      hints: [
        "Leé la tubería de adentro hacia afuera: los paréntesis obligan a elevar −5 al cuadrado antes de pedir la raíz. No intentes una raíz de negativo.",
        "Multiplicá −5 por −5: dos signos negativos producen 25. Ahora el radicando ya es no negativo y la raíz cuadrada real tiene permiso para existir.",
        "La raíz principal de 25 es el valor no negativo 5. Terminá √((-5)²) = 5 y recordá que ese resultado coincide con |−5|.",
      ],
      solution: [
        "El orden escrito pide elevar primero: (−5)² = 25.",
        "√25 = 5 porque la raíz cuadrada principal devuelve el valor no negativo.",
        "Así, √(x²) = |x| y el resultado es 5.",
      ],
    },
    {
      type: "choice",
      prompt: "¿En qué dominio está definida (√x)² en ℝ?",
      options: ["Para todo x real", "Sólo para x ≥ 0", "Sólo para x ≤ 0"],
      expected: 1,
      diagnosis: "illegal_real_root_distribution",
      diagnosisMessage:
        "La primera operación es √x, que en los reales requiere x ≥ 0.",
      hints: [
        "No mires todavía el cuadrado exterior: en (√x)² la primera puerta que hay que atravesar es √x. Preguntate para qué x esa raíz es real.",
        "Una raíz cuadrada principal en ℝ sólo acepta un radicando mayor o igual que cero. El cuadrado posterior no puede rescatar una operación que ya se bloqueó.",
        "Por eso el permiso es x ≥ 0. Elegí esa opción y separala de √(x²), cuyo orden sí permite empezar con cualquier real.",
      ],
      solution: [
        "Antes de elevar al cuadrado hay que calcular √x.",
        "En ℝ, √x existe sólo cuando x ≥ 0.",
        "Por lo tanto (√x)² tiene dominio [0, ∞), y allí vale x.",
      ],
    },
    {
      type: "choice",
      prompt: "¿Por qué no se separa √((-1)(-4)) en √(−1)√(−4) dentro de ℝ?",
      options: [
        "Porque el producto interior sí existe, pero cada raíz negativa no",
        "Porque √4 es negativa",
        "Porque la raíz cuadrada distribuye sólo en sumas",
      ],
      expected: 0,
      diagnosis: "illegal_real_root_distribution",
      diagnosisMessage:
        "El producto es 4 y su raíz existe. Las dos raíces separadas tienen radicandos negativos y no pertenecen a ℝ.",
      hints: [
        "Antes de distribuir una raíz par, comprobá que cada raíz nueva exista. Acá conviene hacer primero la multiplicación que ya está dentro del único radical.",
        "(−1)(−4) = 4, así que √4 sí existe y vale 2. Pero separar crearías √(−1) y √(−4), dos puertas bloqueadas en ℝ.",
        "Elegí la explicación que distingue producto interior legal de raíces separadas ilegales. La regla de producto necesita radicandos individuales no negativos.",
      ],
      solution: [
        "El lado izquierdo es √4 = 2.",
        "La regla de producto para raíces pares exige que las raíces individuales existan en ℝ.",
        "√(−1) y √(−4) no son reales; por eso esa separación es ilegal.",
      ],
    },
  ],
  "sec-10": [
    {
      type: "number",
      prompt: "Evaluá −4² respetando la prioridad de operaciones.",
      spec: { value: -16, context: "precedencia paréntesis -4^2" },
      hints: [
        "Marcá con el dedo la base de la potencia: en −4² no hay paréntesis alrededor del menos, así que el exponente sólo alcanza al 4.",
        "Respetá la prioridad: calculá primero 4² = 16. El signo menos sigue esperando afuera como el opuesto del resultado de esa potencia.",
        "Aplicá finalmente ese signo externo y escribí −16. Comparalo con (−4)² para comprobar por qué los paréntesis cambian toda la base.",
      ],
      solution: [
        "La potencia tiene prioridad sobre el signo menos suelto.",
        "−4² = −(4²) = −16.",
        "Con paréntesis sería distinto: (−4)² = 16.",
      ],
    },
    {
      type: "choice",
      prompt: "¿Qué afirmación describe la trampa de (−2)^(2·1/2) = 2?",
      options: [
        "El paso intermedio exige √(−2), que no existe en ℝ",
        "Toda potencia de base negativa es inválida",
        "La raíz cuadrada de 4 vale −2",
      ],
      expected: 0,
      diagnosis: "neg_base_precedence",
      diagnosisMessage:
        "La potencia de potencia se aplicó fuera de sus condiciones: al invertir el orden aparece la raíz par de un negativo.",
      hints: [
        "No alcanza con multiplicar 2 por 1/2: auditá qué operación intermedia exige esa reagrupación sobre la base negativa −2.",
        "Al invertir el orden aparece (−2)^(1/2), que significa √(−2). Una raíz cuadrada real necesita un radicando no negativo y acá no lo tiene.",
        "Elegí la opción que señala √(−2) como el bloqueo. La base negativa no prohíbe todas las potencias; prohíbe esta raíz par dentro de ℝ.",
      ],
      solution: [
        "La expresión inicial (−2)¹ sí vale −2.",
        "La regla transforma la potencia racional en [ (−2)^(1/2) ]².",
        "La raíz √(−2) no está definida en ℝ; por eso no se puede concluir que −2 = 2.",
      ],
    },
    {
      type: "pair",
      prompt: "Compará −4² y (−4)²: ingresá ambos resultados.",
      firstLabel: "−4²",
      secondLabel: "(−4)²",
      expected: [-16, 16],
      hints: [
        "Compará primero las bases, no los signos finales: en la primera sólo está elevado el 4; en la segunda el paquete completo entre paréntesis es −4.",
        "Escribí la primera como −(4²) y la segunda como (−4)(−4). Esa traducción hace visible qué operación toma prioridad en cada caso.",
        "Calculá −16 para la primera y +16 para la segunda. Ingresalos en ese orden: el orden de los casilleros también forma parte de la respuesta.",
      ],
      solution: [
        "−4² = −(4²) porque la potencia precede al signo suelto.",
        "−(4 · 4) = −16.",
        "(−4)² = (−4)(−4) = 16; los paréntesis cambian la base.",
      ],
    },
  ],
};

export const LESSON_SECTIONS = [
  {
    id: "sec-1",
    chapter: "Capítulo 1",
    title: "Dos mundos: sumar y multiplicar",
    short: "1 · Dos mundos",
  },
  {
    id: "sec-2",
    chapter: "Capítulo 1",
    title: "Exponentes negativos",
    short: "2 · Retroceso",
  },
  {
    id: "sec-3",
    chapter: "Capítulo 1",
    title: "Cociente y neutro multiplicativo",
    short: "3 · El neutro",
  },
  {
    id: "sec-4",
    chapter: "Capítulo 2",
    title: "Fracciones en la suma y el exponente",
    short: "4 · Medios saltos",
  },
  {
    id: "sec-5",
    chapter: "Capítulo 2",
    title: "Geometría dimensional",
    short: "5 · Dimensiones",
  },
  {
    id: "sec-6",
    chapter: "Capítulo 2",
    title: "Árboles de factores primos",
    short: "6 · Factorización",
  },
  {
    id: "sec-7",
    chapter: "Capítulo 2",
    title: "Simplificación de radicales",
    short: "7 · Aduana",
  },
  {
    id: "sec-8",
    chapter: "Capítulo 3",
    title: "Binomios y términos cruzados",
    short: "8 · Choque",
  },
  {
    id: "sec-9",
    chapter: "Capítulo 3",
    title: "Dominio real y raíces pares",
    short: "9 · Dominio",
  },
  {
    id: "sec-10",
    chapter: "Capítulo 3",
    title: "Signos, paréntesis y paradojas",
    short: "10 · Paradojas",
  },
  {
    id: "sec-retos",
    chapter: "Capítulo 4",
    title: "Entrenador y 5 Trampas de Examen",
    short: "11 · Práctica y trampas",
  },
  {
    id: "sec-repaso",
    chapter: "Capítulo 4",
    title: "Hoja de repaso",
    short: "12 · Repaso",
  },
];

const WIDGETS = [
  ["dos-mundos", initDosMundosWidget],
  ["cinta-negativa", initCintaNegativaWidget],
  ["neutro-cancelacion", initNeutroCancelacionWidget],
  ["mitad-mundos", initMitadMundosWidget],
  ["geometria-raices", initGeometriaRaicesWidget],
  ["arbol-factores", initArbolFactoresWidget],
  ["simplificador-radical", initSimplificadorRadicalWidget],
  ["choque-mundos", initChoqueMundosWidget],
  ["espejo-dominio-real", initEspejoDominioRealWidget],
  ["inspector-paradojas", initInspectorParadojasWidget],
];

export function initBlackboardController() {
  const content = document.querySelector(".seq-content");
  const page = document.querySelector(".pr-page");
  const sidebar = document.querySelector(".seq-sidebar");
  if (!content) return;
  const menuGlyph = String.fromCodePoint(0x2630);
  const closeGlyph = String.fromCodePoint(0x2715);
  document.querySelectorAll(".pr-workbench").forEach((workbench) => {
    const probe = workbench.querySelector(":scope > .pr-probe");
    if (probe) workbench.insertBefore(probe, workbench.firstElementChild);
  });
  const badge = h("span", {
    class: "seq-blackboard-toolbar__badge",
    id: "seq-board-badge",
  });
  const title = h("strong", { id: "seq-board-title" });
  const toggle = h(
    "button",
    { type: "button", class: "chip", id: "seq-mode-toggle" },
    "Pizarrón por lección (activo)",
  );
  const toolbar = h(
    "div",
    { class: "seq-blackboard-toolbar", id: "seq-board-toolbar" },
    h(
      "button",
      {
        type: "button",
        class: "chip pr-sidebar-toggle",
        "data-sidebar-toggle": "true",
        "aria-controls": "pr-sidebar-index",
      },
      "Índice",
    ),
    h("div", { class: "seq-blackboard-toolbar__info" }, badge, title),
    h("div", { class: "seq-blackboard-toolbar__actions" }, toggle),
  );
  content.prepend(toolbar);
  initLessonDock();
  const sidebarToggle = toolbar.querySelector("[data-sidebar-toggle]");
  const sidebarClose = h(
    "button",
    {
      type: "button",
      class: "pr-sidebar-close",
      "data-sidebar-close": "true",
      "aria-label": "Cerrar índice",
    },
    closeGlyph,
  );
  if (sidebar) {
    sidebar.id = "pr-sidebar-index";
    sidebar.prepend(sidebarClose);
  }
  const sidebarKey = "potencias_raices:sidebar:v1";
  const setSidebar = (collapsed, persist = true) => {
    page?.classList.toggle("is-sidebar-collapsed", collapsed);
    sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
    sidebarToggle.textContent = collapsed
      ? `${menuGlyph} Índice`
      : "◀ Ocultar índice";
    if (persist) localStorage.setItem(sidebarKey, collapsed ? "collapsed" : "open");
  };
  const savedSidebar = localStorage.getItem(sidebarKey);
  setSidebar(
    savedSidebar ? savedSidebar === "collapsed" : window.innerWidth < 1280,
    false,
  );
  sidebarToggle.addEventListener("click", () =>
    setSidebar(!page?.classList.contains("is-sidebar-collapsed")),
  );
  sidebarClose.addEventListener("click", () => setSidebar(true));
  let focused = true;
  let current = "sec-1";
  const activate = (id, scroll = true) => {
    const index = LESSON_SECTIONS.findIndex((item) => item.id === id);
    if (index < 0) return;
    const activeSection = document.getElementById(id);
    current = id;
    LESSON_SECTIONS.forEach((item) =>
      document
        .getElementById(item.id)
        ?.classList.toggle("is-active", item.id === id),
    );
    qsa(".seq-sidebar__link[data-sec]").forEach((link) =>
      link.classList.toggle("is-active", link.dataset.sec === id),
    );
    badge.textContent = `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length}`;
    title.textContent = `${LESSON_SECTIONS[index].chapter} · ${LESSON_SECTIONS[index].title}`;
    if (scroll) {
      /* En modo pizarrón apuntamos a la columna completa para conservar a la
         vista la barra de contexto, el título y la frase guía. */
      const target = focused ? content : activeSection;
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    }
  };
  toggle.addEventListener("click", () => {
    focused = !focused;
    content.classList.toggle("mode-blackboard", focused);
    toggle.textContent = focused
      ? "Pizarrón por lección (activo)"
      : "Pizarra continua (ver todo)";
    if (focused) activate(current);
  });
  LESSON_SECTIONS.forEach((item, index) => {
    const section = document.getElementById(item.id);
    if (!section) return;
    const previous = LESSON_SECTIONS[index - 1];
    const next = LESSON_SECTIONS[index + 1];
    const tray = h(
      "nav",
      { class: "seq-chalk-tray", "aria-label": "Navegación entre pizarrones" },
      previous
        ? h(
            "button",
            {
              type: "button",
              class: "chip seq-chalk-tray__btn",
              on: { click: () => activate(previous.id) },
            },
            `← ${previous.short}`,
          )
        : h("span", { class: "muted small" }, "Primer pizarrón"),
      h(
        "span",
        { class: "seq-chalk-tray__info" },
        `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length} · ${item.chapter}`,
      ),
      next
        ? h(
            "button",
            {
              type: "button",
              class: "btn seq-chalk-tray__btn",
              on: { click: () => activate(next.id) },
            },
            `${next.short} →`,
          )
        : h(
            "button",
            {
              type: "button",
              class: "btn seq-chalk-tray__btn",
              on: { click: () => activate("sec-1") },
            },
            "Volver al inicio ↑",
          ),
    );
    section.append(tray);
  });
  qsa(".seq-sidebar__link[data-sec]").forEach((link) =>
    link.addEventListener("click", (event) => {
      if (!focused) return;
      event.preventDefault();
      activate(link.dataset.sec);
      history.replaceState(null, "", `#${link.dataset.sec}`);
    }),
  );
  window.addEventListener("keydown", (event) => {
    if (
      !focused ||
      ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(
        document.activeElement?.tagName,
      )
    )
      return;
    if (!["ArrowRight", "PageDown", "ArrowLeft", "PageUp"].includes(event.key))
      return;
    const index = LESSON_SECTIONS.findIndex((item) => item.id === current);
    const next =
      index + (["ArrowRight", "PageDown"].includes(event.key) ? 1 : -1);
    if (LESSON_SECTIONS[next]) {
      event.preventDefault();
      activate(LESSON_SECTIONS[next].id);
    }
  });
  const initial = location.hash.slice(1);
  activate(
    LESSON_SECTIONS.some((item) => item.id === initial) ? initial : "sec-1",
    false,
  );
  content.classList.add("mode-blackboard");
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

renderNav();
for (const [name, initialize] of WIDGETS) {
  document
    .querySelectorAll(`[data-widget="${name}"]`)
    .forEach((host) => initialize(host));
}
for (const [sectionId, questions] of Object.entries(CHECKS_DATA)) {
  const host = document.querySelector(`[data-check="${sectionId}"]`);
  if (host) mountCheckBlock(host, questions, sectionId, mountProgress);
}
qsa(".pr-annotated-host").forEach((host) =>
  annotatedPowFormula(host, { sectionId: host.closest("section")?.id }),
);
const worldHost = document.querySelector("[data-worlds-comparison]");
if (worldHost) worldsComparisonCard(worldHost);
bindTutorButtons();
mountProgress();
initRetosModule();
initGlossary();
initBlackboardController();
