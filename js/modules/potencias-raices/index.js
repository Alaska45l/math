import { h, mount, qsa } from "../../core/dom.js";
import { renderNav } from "../../core/nav.js";
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
        "El 4 cuenta cuántas veces se suma el 3.",
        "Escribí 3 + 3 + 3 + 3 antes de abreviar.",
        "La suma repetida vale 12; no eleves 3 a 4 en este ítem.",
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
        "El exponente cuenta cambios de escala desde el origen multiplicativo.",
        "Con cero cambios te quedás en el neutro de la multiplicación.",
        "El neutro multiplicativo es 1.",
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
        "La base de la potencia variable es 2.",
        "Reescribí el factor 4 como una potencia de base 2.",
        "2² · 2ⁿ suma exponentes y da 2ⁿ⁺².",
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
        "El signo menos invierte el recorrido multiplicativo.",
        "Desde 1 dividí por 2 tres veces.",
        "La fracción final es 1/8, que vale 0,125.",
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
        "Invertí la escala completa antes de elevar.",
        "El recíproco de 2/3 es 3/2.",
        "Elevá 3/2 al cuadrado: 9/4.",
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
        "Diferenciá el signo de la base del signo del exponente.",
        "Retrocedé desde el neutro 1 dividiendo por 2.",
        "Tres divisiones producen 1/8, no −8.",
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
        "Emparejá los cuatro factores 3 del numerador.",
        "Cada pareja 3/3 vale el neutro 1; quedan seis treses abajo.",
        "Escribí el residuo como 1/3⁶ o como 3⁻⁶.",
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
        "Expansión: tres doses por cuatro doses más.",
        "En total hay siete factores 2.",
        "2⁷ = 128.",
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
        "Preguntate qué número multiplicado por 5 devuelve 5.",
        "Un número no nulo dividido por sí mismo vale el neutro multiplicativo.",
        "5/5 = 1.",
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
        "La primera pregunta parte 36 en dos sumandos iguales.",
        "La segunda busca un factor que se repita dos veces.",
        "18 + 18 = 36; 6 · 6 = 36.",
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
        "Buscá tres factores iguales cuyo producto sea 27.",
        "Probá 3 · 3 · 3.",
        "La raíz cúbica de 27 es 3.",
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
        "El denominador 4 busca una raíz cuarta.",
        "La raíz cuarta de 16 es 2; después elevá al cubo.",
        "2³ = 8.",
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
        "Contá ocho filas con ocho baldosas cada una.",
        "El área es lado por lado.",
        "8² = 64 baldosas cuadradas.",
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
        "La arista aparece tres veces en el volumen.",
        "Buscá L tal que L · L · L = 27.",
        "3³ = 27.",
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
        "Pensá cuántas direcciones mide una superficie.",
        "El área multiplica dos lados.",
        "Dos factores cm producen cm².",
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
        "81 = 3 · 3 · 3 · 3.",
        "Repartí los cuatro factores en cuatro cajas iguales.",
        "Cada caja contiene un 3.",
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
        "243 es una potencia de 3.",
        "Multiplicá 3 por sí mismo cinco veces.",
        "3⁵ = 243.",
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
        "Descomponé 128 dividiendo sucesivamente por 2.",
        "128 = 2⁷.",
        "Cada una de las siete cajas recibe un 2.",
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
        "Factorizá 12 como 4 · 3.",
        "La raíz de 4 sale como 2.",
        "El factor 3 queda bajo la raíz: 2√3.",
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
        "Separá 20 = 4 · 5 y x⁸ = (x⁴)².",
        "El 4 sale como 2 y x⁴ también sale como un factor.",
        "Resultado: 2x⁴√5.",
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
        "Factorizá 54 = 3² · 6.",
        "Separá x⁷ = x⁶ · x = (x³)² · x.",
        "El resto bajo la raíz es 6x.",
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
        "Escribí (2 − 3x)(2 − 3x).",
        "Distribuí cada término del primer paréntesis por los dos del segundo.",
        "Los términos cruzados suman −6x − 6x = −12x.",
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
        "Son binomios conjugados.",
        "Usá (u − v)(u + v) = u² − v².",
        "Con x = 5: 25 − 3.",
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
        "Buscá cubos perfectos dentro de 54 y 16.",
        "54 = 27 · 2 y 16 = 8 · 2.",
        "Extraé 3 y 2; luego sumá coeficientes.",
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
        "Primero resolvé el cuadrado dentro de la raíz.",
        "(−5)² = 25.",
        "La raíz principal de 25 es no negativa.",
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
        "Mirá cuál operación ocurre primero.",
        "La raíz cuadrada principal necesita radicando no negativo.",
        "El dominio es x ≥ 0.",
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
        "Calculá primero el producto dentro del radical.",
        "(−1)(−4) es positivo.",
        "La raíz del producto es 2; las raíces de −1 y −4 no son reales.",
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
        "El signo menos no está dentro de paréntesis.",
        "Primero calculá 4².",
        "Después aplicá el signo externo.",
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
        "Inspeccioná la reagrupación que introduce exponente 1/2.",
        "Una base negativa elevada a 1/2 requiere raíz cuadrada real.",
        "√(−2) no existe en ℝ: ahí está el paso ilegal.",
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
        "En la primera expresión los paréntesis no incluyen el signo.",
        "En la segunda, el signo sí forma parte de la base.",
        "Calculá −(4²) y (−4)(−4).",
      ],
      solution: [
        "−4² = −(4²) porque la potencia precede al signo suelto.",
        "−(4 · 4) = −16.",
        "(−4)² = (−4)(−4) = 16; los paréntesis cambian la base.",
      ],
    },
  ],
};

/* Las pistas llegan de a una: cada una formula una pregunta y deja una acción
   concreta, para que Alaska acompañe el razonamiento sin regalar el resultado
   en el primer clic. El contenido final de cada pista sigue siendo propio de
   su ejercicio; esta envoltura conserva una voz estable en los treinta chequeos. */
const HINT_OPENINGS = [
  "Frená un segundo, che: antes de buscar un número, mirá qué operación está contando el ejercicio. Alaska te propone este primer paso:",
  "Bien, ahora acerquemos la lupa sin saltear nada. Preguntate qué cambia y qué conserva la operación antes de hacer cuentas:",
  "Ya estás muy cerca; verificá el camino completo en lugar de confiar en una receta apurada. La pista decisiva es ésta:",
];
const HINT_CLOSINGS = [
  "Decilo con tus propias palabras y recién después escribí el resultado.",
  "Si algo parece raro, volvé al neutro correspondiente: ahí se ve el error.",
  "N-no te apures: una línea bien justificada vale más que acertar de casualidad.",
];

Object.values(CHECKS_DATA).forEach((questions) => {
  questions.forEach((question) => {
    question.hints = question.hints.map(
      (hint, index) => `${HINT_OPENINGS[index]} ${hint} ${HINT_CLOSINGS[index]}`,
    );
  });
});

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
    title: "Entrenador, trampas y la Forja",
    short: "11 · Entrenamiento",
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
    h("div", { class: "seq-blackboard-toolbar__info" }, badge, title),
    h("div", { class: "seq-blackboard-toolbar__actions" }, toggle),
  );
  content.prepend(toolbar);
  const sidebarToggle = h(
    "button",
    {
      type: "button",
      class: "pr-sidebar-toggle",
      "data-sidebar-toggle": "true",
      "aria-controls": "pr-sidebar-index",
    },
    "Índice",
  );
  if (sidebar) {
    sidebar.id = "pr-sidebar-index";
    page?.append(sidebarToggle);
  }
  const sidebarKey = "potencias_raices:sidebar:v1";
  const setSidebar = (collapsed, persist = true) => {
    page?.classList.toggle("is-sidebar-collapsed", collapsed);
    sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
    sidebarToggle.textContent = collapsed ? "Abrir índice" : "Plegar índice";
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
      page?.classList.add("is-board-navigated");
      /* El toolbar se queda sticky debajo de la navegación. Desplazamos la
         sección, no el toolbar: así su encabezado no queda escondido detrás
         de la barra ni de los banners de capítulos anteriores. */
      activeSection?.scrollIntoView({ behavior: "smooth", block: "start" });
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
