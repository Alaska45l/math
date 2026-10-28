# Introducción a las sucesiones aritméticas (artículo)

## ¿Qué es una sucesión?

He aquí algunas listas de números:

-   3, 5, 7...

-   21, 16, 11, 6...

-   1, 2, 4, 8...


Las listas ordenadas de números como estas se llaman **sucesiones**. Cada número en la sucesión se llama **término**.

| 3, | 5, | 7,… |
| --- | --- | --- |
| ↑ | ↑ | ↑ |
| 1 er término. t rmino | 2 ndo | 3 er término. t rmino |

Las sucesiones usualmente tienen **patrones**, que nos permiten predecir cuál puede ser el siguiente término.

Por ejemplo, en la sucesión 3,5,7..., siempre sumas *dos* para obtener el siguiente término:

|  | + 2 ↷ |  | + 2 ↷ |  |  |
| --- | --- | --- | --- | --- | --- |
| 3, |  | 5, |  | 7,… |

Los puntos suspensivos que aparecen al final indican que la sucesión puede extenderse, aunque solamente veamos unos pocos términos.

Y podemos extenderla mediante el patrón.

Por ejemplo, el cuarto término de la sucesión debe ser nueve, el quinto término debe ser 11, etc.

|  | + 2 ↷ |  | + 2 ↷ |  | + 2 ↷ |  | + 2 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3, |  | 5, |  | 7, |  | 9, |  | 11,… |

### Comprueba tu comprensión

**Extiende las sucesiones de acuerdo a sus patrones.**

Problema 1

Patrón: suma cinco al término anterior.

|  | + 5 ↷ |  | + 5 ↷ |  | + 5 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3, |  | 8, |  | 13, |  | ,… |

Problema 2

Patrón: resta tres del término anterior.

|  | − 3 ↷ |  | − 3 ↷ |  | − 3 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 20, |  | 17, |  | 14, |  | ,… |

Problema 3

Patrón: multiplica el término anterior por dos.

|  | × 2 ↷ |  | × 2 ↷ |  | × 2 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3, |  | 6, |  | 12, |  | ,… |

¡Estoy atorado! Por favor muéstrame la solución.

Problema 4

**Relaciona cada sucesión con su patrón.**

|
**Sucesión**

 |

**Patrón**

 |
| --- | --- |
|

-   4,11,18,25,…

-   40,20,10,5,…

-   100,96,92,88,…

-   4,12,36,108,…


 |

-   Multiplica el término previo por tres.

-   Divide el término previo entre dos.

-   Suma siete al término previo.

-   Resta cuatro del término previo.


 |


## ¿Qué es una sucesión aritmética?

En muchos de los ejemplos anteriores, el patrón involucra sumar o restar un número a cada término para obtener el siguiente. Las sucesiones con ese tipo de patrones se llaman **sucesiones aritméticas**.

En una sucesión aritmética, la diferencia entre términos consecutivos es siempre la misma.

Por ejemplo, la sucesión 3, 5, 7, 9... es aritmética porque la diferencia entre términos consecutivos es siempre dos.

|  | + 2 ↷ |  | + 2 ↷ |  | + 2 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3, |  | 5, |  | 7, |  | 9,… |

La sucesión 21, 16, 11, 6... también es aritmética porque la diferencia entre términos consecutivos es siempre menos cinco.

|  | − 5 ↷ |  | − 5 ↷ |  | − 5 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 21, |  | 16, |  | 11, |  | 6,… |

La sucesión 1, 2, 4, 8... *no* es aritmética, porque la diferencia entre términos consecutivos no es la misma.

|  | + 1 ↷ |  | + 2 ↷ |  | + 4 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1, |  | 2, |  | 4, |  | 8,… |

### Comprueba tu comprensión

Problema 6

**El primer término de una sucesión es uno. ¿Cuáles de los siguientes patrones hacen que la sucesión sea aritmética?**

## La diferencia común

La **diferencia común** de una sucesión aritmética es la diferencia constante entre términos consecutivos.

Por ejemplo, la diferencia común de 10, 21, 32, 43... es 11:

|  | + 11 ↷ |  | + 11 ↷ |  | + 11 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10, |  | 21, |  | 32, |  | 43,… |

La diferencia común de –2, –5, -8, –11... es menos tres:

|  | − 3 ↷ |  | − 3 ↷ |  | − 3 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| − 2, |  | − 5, |  | − 8, |  | − 11,… |

### Comprueba tu comprensión

Problema 7

**¿Cuál es la diferencia común de 2, 8, 14, 20...?**

Pregunta para reflexionar

**¿Qué debe ser cierto acerca de una sucesión aritmética cuya diferencia común es negativa?**

Problema de desafío

El primer término de una sucesión aritmética es 10 y su diferencia común es menos 7.

**¿Cuál es el cuarto término de la sucesión?**

# Introducción a las fórmulas de sucesiones aritméticas (artículo)


## ¿Qué es una fórmula?

Estamos acostumbrados a describir sucesiones aritméticas de esta manera:

3,5,7,…

Pero hay otras formas. En esta lección vamos a aprender dos nuevas maneras de representar sucesiones aritméticas: **fórmulas recursivas** y **fórmulas explícitas**. Las fórmulas nos dan instrucciones de cómo encontrar cualquier término de una sucesión.

En términos generales, las fórmulas utilizan n para representar cualquier número de término y a (n) para representar el n pésimo.p simo término de la sucesión. Por ejemplo, aquí están algunos de los primeros términos de la sucesión aritmética 3, 5, 7,...

| n | a (n) |
| --- | --- |
| (El número de término) | (El n ésimo.simo término) |
| 1 | 3 |
| 2 | 5 |
| 3 | 7 |

Antes mencionamos que las fórmulas nos dan instrucciones para encontrar cualquier término de una sucesión. Ahora podemos reformular esto como sigue: *las fórmulas nos dicen cómo encontrar a (n) para cualquier posible n.*

### Comprueba tu comprensión

**1) Encuentra a (4) en la sucesión 3, 5, 7,...**

a (4) \=

**2) Para cualquier número de término n, ¿qué representa a (n − 1)?**


## Fórmulas recursivas de sucesiones aritméticas

Las fórmulas recursivas nos dan la siguiente información:

1.  El primer término de una sucesión.

2.  La regla del patrón para obtener cualquier término en una sucesión a partir del término que lo precede.


Esta es la fórmula recursiva de nuestra sucesión 3, 5, 7,... junto con la interpretación de cada parte.

{ a (1) \= 3 ← el primer témino es tres.el primer t mino es tres a (n) \= a (n − 1) + 2 ← suma dos al término anterior.suma dos al t rmino anterior

Para encontrar el quinto término, por ejemplo, tenemos que ampliar la sucesión término por término:

| a (n) | \= a (n − 1) + 2 |  |  |  |
| --- | --- | --- | --- | --- |
| a (1) |  |  | \= 3 |
| a (2) | \= a (1) + 2 | \= 3 + 2 | \= 5 |
| a (3) | \= a (2) + 2 | \= 5 + 2 | \= 7 |
| a (4) | \= a (3) + 2 | \= 7 + 2 | \= 9 |
| a (5) | \= a (4) + 2 | \= 9 + 2 | \= 11 |

¡Genial! Esta fórmula nos da la misma sucesión que lo descrito por 3, 5, 7,...

### Comprueba tu comprensión

Ahora es tu turno de encontrar términos de sucesiones usando sus fórmulas recursivas.

Tal como usamos a (n) para representar el n ésimo.simo término de la sucesión 3, 5, 7,... podemos usar otras letras para representar otras sucesiones. Por ejemplo, podemos usar b (n), c (n) o d (n).

## Fórmulas explícitas de sucesiones aritméticas

He aquí una fórmula explícita de 3, 5, 7,...

a (n) \= 3 + 2 (n − 1)

Esta fórmula nos permite simplemente sustituir el número del término que nos interesa para obtener el valor de ese término.

Para encontrar el quinto término, por ejemplo, necesitamos sustituir n \= 5 en la fórmula explícita.

a (5) \= 3 + 2 (5 − 1) \= 3 + 2 ⋅ 4 \= 3 + 8 \= 11

¡Y he aquí que obtenemos el mismo resultado que antes!

### Comprueba tu comprensión

## Las sucesiones son funciones

Observa que las fórmulas que utilizamos en esta lección operan como *funciones*: sustituimos un valor de entrada n, y con la fórmula obtenemos el término a (n) como valor de salida.

Las sucesiones están de hecho definidas como funciones. Sin embargo, n no puede ser el valor de cualquier número real. No hay tal cosa como el menos quinto término, ni el término 0.4 de una sucesión.

Esto significa que el dominio de las sucesiones (que es el conjunto de todos los valores de entrada posibles de la función) son los *enteros positivos*.

### Un comentario sobre la notación

Hemos escrito a (4), por ejemplo, para representar el cuarto término, pero en otros textos podemos escribir a 4.

Se pueden usar las dos notaciones. Nosotros preferimos a (4) porque hace enfásis en que las sucesiones son funciones.

### Pregunta para reflexionar

**9) ¿Qué tipo de fórmula es más útil para encontrar rápidamente el término 100 de una sucesión aritmética?**


### Problema de desafío

**10)** La fórmula explícita de una sucesión aritmética es f (n) \= 3 − 4 (n − 1).

**¿Cuál término de la sucesión es igual a -65?**

Número de término.

# Fórmulas recursivas para sucesiones aritméticas (artículo)

## Cómo funcionan las fórmulas recursivas

Las fórmulas recursivas nos dan la siguiente información:

1.  El primer término de la sucesión.

2.  La regla del patrón para obtener cualquier término a partir del término que lo precede.


Esta es la fórmula recursiva de la sucesión 3,5,7,… junto con la interpretación de cada parte.

{ a (1) \= 3 ← el primer témino es 3.el primer t mino es 3 a (n) \= a (n − 1) + 2 ← suma 2 al término anterior.suma 2 al t rmino anterior

En la fórmula, n es cualquier número de término y a (n) es el n ésimo.simo término. Esto significa que a (1) es el primer término, y a (n − 1) es el término anterior al n ésimo.simo término.

Para encontrar el quinto término, por ejemplo, tenemos que ampliar la sucesión término por término:

| a (n) | \= a (n − 1) + 2 |  |  |
| --- | --- | --- | --- |
| a (1) |  |  | \= 3 |
| a (2) | \= a (1) + 2 | \= 3 + 2 | \= 5 |
| a (3) | \= a (2) + 2 | \= 5 + 2 | \= 7 |
| a (4) | \= a (3) + 2 | \= 7 + 2 | \= 9 |
| a (5) | \= a (4) + 2 | \= 9 + 2 | \= 11 |

¡Genial! Esta fórmula nos da la misma sucesión que lo descrito por 3,5,7,…

### Comprueba tu comprensión

**3) Encuentra b (4) en la sucesión dada por** { b (1) \= − 5 b (n) \= b (n − 1) + 9

b (4) \=

El significado de esta fórmula puede verbalizarse como sigue:

**El primer término es − 5, y cualquier otro término es el término previo más 9.**

Para encontrar b (4) debemos extender la sucesión término por término:

| b (n) | \= b (n − 1) + 9 |  |  |
| --- | --- | --- | --- |
| b (1) |  |  | \= − 5 |
| b (2) | \= b (1) + 9 | \= − 5 + 9 | \= 4 |
| b (3) | \= b (2) + 9 | \= 4 + 9 | \= 13 |
| b (4) | \= b (3) + 9 | \= 13 + 9 | \= 22 |

**Por tanto, b (4) \= 22.**

## Escribir fórmulas recursivas

Supón que queremos escribir la fórmula recursiva de la sucesión aritmética 5,8,11,…

Las dos partes de la fórmula deben dar la siguiente información:

-   El primer término (que es 5).

-   La regla para obtener cualquier término a partir del término anterior (que es "suma 3 ").


Por tanto, la fórmula recursiva debe verse como sigue:

{ c (1) \= 5 c (n) \= c (n − 1) + 3

### Comprueba tu comprensión

**2) ¿Cuál es la fórmula recursiva de la sucesión 12,7,2,…?**

Las dos partes de la fórmula deben dar la siguiente información:

-   El primer término (que es 12).

-   La regla para obtener cualquier término a partir del término anterior (que es "resta 5 ").


Por tanto, la fórmula recursiva debe verse como sigue:

{ d (1) \= 12 d (n) \= d (n − 1) − 5

**3) Completa los valores faltantes en la fórmula recursiva de la sucesión 2,8,14,...**

{ e (1) \= A e (n) \= e (n − 1) + B

|  |  |  |
| --- | --- | --- |
| A \= | B \= |  |

Las dos partes de la fórmula deben dar la siguiente información:

-   El primer término (que es 2).

-   La regla para obtener cualquier término a partir del término anterior (que es "suma 6 ").


Por tanto, la fórmula recursiva debe verse como sigue:

{ e (1) \= 2 e (n) \= e (n − 1) + 6

**En conclusión, A \= 2 y B \= 6.**

**4) Completa los valores faltantes en la fórmula recursiva de la sucesión − 1,− 4,− 7,….**

{ f (1) \= A f (n) \= f (n − 1) + B

|  |  |  |
| --- | --- | --- |
| A \= | B \= |  |

Las dos partes de la fórmula deben dar la siguiente información:

-   El primer término (que es − 1).

-   La regla para obtener cualquier término a partir del término anterior (que es "resta 3 ").


Por tanto, la fórmula recursiva debe verse como sigue:

{ f (1) \= − 1 f (n) \= f (n − 1) − 3

**En conclusión, A \= − 1 y B \= − 3.**

### Pregunta para reflexionar

**5)** Esta es la fórmula recursiva general de las sucesiones aritméticas.

{ g (1) \= A g (n) \= g (n − 1) + B

**¿Cuál es la diferencia común de la sucesión?**

El significado de esta fórmula puede verbalizarse como sigue:

-   El primer término es A.

-   Para obtener cualquier término a partir del término previo, **suma B.**


Lo que sumamos a cada término para obtener el término siguiente es la diferencia común, **así que la diferencia común es simplemente B.**


# Fórmulas explícitas para sucesiones aritméticas (artículo)

## Cómo funcionan las fórmulas explícitas

Esta es una fórmula explícita de la sucesión 3,5,7,…

> a (n) \= 3 + 2 (n − 1)

En la fórmula, n es cualquier número de término y a (n) es el n ésimo.simo término.

Esta fórmula nos permite simplemente sustituir el número del término que nos interesa, y obtendremos el valor de ese término.

Para encontrar el quinto término, por ejemplo, necesitamos sustituir n \= 5 en la fórmula explícita.

> a (5) \= 3 + 2 (5 − 1) \= 3 + 2 ⋅ 4 \= 3 + 8 \= 11

¡Genial! En efecto este es el quinto término de 3,5,7,…

## Escribir fórmulas explícitas

Considera la sucesión aritmética 5,8,11,… el primer término es 5 y la diferencia común es 3.

Podemos obtener cualquier término de la sucesión al tomar el primer término, 5, y sumarle la diferencia común, 3, repetidamente. Échale un vistazo, por ejemplo, a los siguientes cálculos de algunos de los primeros términos.

| n | Cálculos para obtener el n ésimo.simo término |  |  |
| --- | --- | --- | --- |
| 1 | 5 | \= 5 + 0 ⋅ 3 \= 5 |
| 2 | 5 + 3 | \= 5 + 1 ⋅ 3 \= 8 |
| 3 | 5 + 3 + 3 | \= 5 + 2 ⋅ 3 \= 11 |
| 4 | 5 + 3 + 3 + 3 | \= 5 + 3 ⋅ 3 \= 14 |
| 5 | 5 + 3 + 3 + 3 + 3 | \= 5 + 4 ⋅ 3 \= 17 |

La tabla muestra que podemos obtener el n ésimo.simo término (donde n es un número de término cualquiera) tomando el primer término, 5, y sumándole la diferencia común, 3, repetidamente n − 1 veces. Esto puede escribirse algebraicamente como 5 + 3 (n − 1).

**En general, esta es la fórmula explícita estándar de una sucesión aritmética cuyo primer término es A y cuya diferencia común es B:**

> A + B (n − 1)

### Comprueba tu comprensión

**2) Escribe una fórmula explícita para la sucesión 2,9,16,….**

d (n) \=

**4)** La fórmula explícita de una sucesión es f (n) \= − 6 + 2 (n − 1).

**¿Cuál es el primer término de la sucesión?**

**¿Cuál es la diferencia común?**


## Fórmulas explícitas equivalentes

La fórmulas explícitas pueden escribirse de muchas formas.

Por ejemplo, las siguientes son todas fórmulas explícitas para la sucesión 3,5,7,…

-   3 + 2 (n − 1) (esta es la fórmula estándar)

-   1 + 2 n

-   5 + 2 (n − 2)


Las fórmulas pueden parecer diferentes, pero lo importante es que podamos sustituir un valor de n y obtener el n ésimo.simo término correcto (prueba tú mismo con las otras fórmulas para verificar que son correctas).

A las diferentes fórmulas explícitas que describen la misma sucesión se les llama **formulas equivalentes.**

## Una idea equivocada común

Una sucesión aritmética puede tener diferentes fórmulas equivalentes, pero es importante recordar que **solo la forma estándar nos da el primer término y la diferencia común**.

Por ejemplo, en la sucesión 2,8,14,… el primer término es 2 y la diferencia común es 6.

La fórmula explícita 2 + 6 (n − 1) describe esta sucesión, pero la fórmula explícita 2 + 6 n describe una sucesión diferente. Muéstrame por qué son diferentes.

Para convertir la fórmula 2 + 6 (n − 1) en una fórmula equivalente de la forma A + B n, podemos quitar los paréntesis y simplificar:

> \= 2 + 6 (n − 1) \= 2 + 6 n − 6 \= − 4 + 6 n

Algunas personas pueden preferir la fórmula − 4 + 6 n porque es más corta que la fórmula equivalente 2 + 6 (n − 1). Lo bueno de la fórmula larga es que a partir de ella podemos obtener el primer término.


### Problemas de desafío

**6\*) Encuentra el 124.o término de la sucesión aritmética 199,196,193,…**


**7\*)** El primer término de una sucesión aritmética es 5 y el décimo término es 59.

**¿Cuál es la diferencia común?**

# Convertir formas recursivas y explícitas de sucesiones aritméticas (artículo)

## Convertir de fórmula recursiva a fórmula explícita

Una sucesión aritmética tiene la siguiente fórmula recursiva.

> { a (1) \= 3 a (n) \= a (n − 1) + 2

Recuerda que a partir de esta fórmula tenemos la siguiente información:

-   El primer término es 3.

-   Para obtener cualquier término a partir del término previo, **suma 2.** En otras palabras, la diferencia común es 2.


Vamos a buscar una fórmula explícita para la sucesión.

Recuerda que podemos representar una sucesión cuyo primer término es A y cuya diferencia común es B con la forma explícita estándar A + B (n − 1).

Por tanto, una fórmula explícita de esta sucesión es a (n) \= 3 + 2 (n − 1).

### Comprueba tu comprensión


## Convertir de una fórmula explícita a una fórmula recursiva

### Ejemplo 1: la fórmula está dada en forma estándar

Nos dan la siguiente fórmula explícita de una sucesión aritmética.

> d (n) \= 5 + 16 (n − 1)

Esta fórmula está en la forma explícita estándar A + B (n − 1), donde A es el primer término y B es la diferencia común. Por lo tanto,

-   el primer término de la sucesión es 5, y

-   la diferencia común es 16.


Vamos a buscar una fórmula recursiva para la sucesión. Recordemos que a partir de la fórmula recursiva obtenemos la siguiente información:

1.  El primer término (que sabemos que es 5).

2.  La regla del patrón para obtener cualquier término a partir del término que lo precede (que sabemos que es "suma 16 ").


Por lo tanto, esta es una fórmula recursiva para la sucesión.

{ d (1) \= 5 d (n) \= d (n − 1) + 16

### Ejemplo 2: la fórmula está dada en forma simplificada

Nos dan la siguiente fórmula explícita de una sucesión aritmética.

> e (n) \= 10 + 2 n

Observa que la fórmula ***no*** está dada en la forma explícita estándar A + B (n − 1).

Por esta razón, no podemos simplemente usar la estructura de la fórmula para encontrar el primer término y la diferencia común. En cambio, podemos encontrar los dos primeros términos:

-   e (1) \= 10 + 2 ⋅ 1 \= 12

-   e (2) \= 10 + 2 ⋅ 2 \= 14


Ahora podemos ver que el primer término es 12 y la diferencia común es 2.

Por lo tanto, esta es una fórmula recursiva para la sucesión.

{ e (1) \= 12 e (n) \= e (n − 1) + 2

### Comprueba tu comprensión

**3)** La fórmula explícita de una sucesión aritmética es f (n) \= 5 + 12 (n − 1).

**Completa los valores faltantes en la fórmula recursiva de la sucesión.**

{ f (1) \= A f (n) \= f (n − 1) + B

|  |  |  |
| --- | --- | --- |
| A \= | B \= |

**4)** La fórmula explícita de una sucesión aritmética es g (n) \= − 11 − 8 (n − 1).

**Completa los valores faltantes en la fórmula recursiva de la sucesión.**

{ g (1) \= A g (n) \= g (n − 1) + B

|  |  |  |
| --- | --- | --- |
| A \= | B \= |

**5)** La fórmula explícita de una sucesión aritmética es h (n) \= 1 + 4 n.

**Completa los valores faltantes en la fórmula recursiva de la sucesión.**

{ h (1) \= A h (n) \= h (n − 1) + B

|  |  |  |
| --- | --- | --- |
| A \= | B \= |


**6)** La fórmula explícita de una sucesión aritmética es i (n) \= 23 − 6 n.

**Completa los valores faltantes en la fórmula recursiva de la sucesión.**

{ i (1) \= A i (n) \= i (n − 1) + B

|  |  |  |
| --- | --- | --- |
| A \= | B \= |

# Repaso de sucesiones aritméticas (artículo)


## Partes y fórmulas de sucesiones aritméticas

En las sucesiones aritméticas, la diferencia entre términos consecutivos es siempre la misma. Llamamos a esa diferencia **la diferencia común**.

Por ejemplo, la diferencia común de la siguiente sucesión es + 2:

|  | + 2 ↷ |  | + 2 ↷ |  | + 2 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3, |  | 5, |  | 7, |  | 9,… |

Las fórmulas de una sucesión aritmética nos dan a (n), el n ésimo.simo término de la sucesión.

Esta es la fórmula **explícita** de la sucesión aritmética cuyo primer término es k y cuya diferencia común es d:

a (n) \= k + (n − 1) d

Esta es la **fórmula recursiva** de esa sucesión:

{ a (1) \= k a (n) \= a (n − 1) + d

## Extender sucesiones aritméticas

Supón que queremos extender la sucesión 3,8,13,… Podemos ver que cada término es el término anterior + 5:

|  | + 5 ↷ |  | + 5 ↷ |  | + 5 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3, |  | 8, |  | 13,… |

Así que simplemente sumamos esa diferencia para encontrar que el término siguiente es 18:

|  | + 5 ↷ |  | + 5 ↷ |  | + 5 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3, |  | 8, |  | 13, |  | 18,… |

Problema 1

**¿Cuál es el término siguiente en la sucesión − 5,− 1,3,7,…?**

Cada término es el término anterior + 4:

|  | + 4 ↷ |  | + 4 ↷ |  | + 4 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| − 5, |  | − 1, |  | 3, |  | 7,… |

Por lo tanto, el siguiente término es 11:

|  | + 4 ↷ |  | + 4 ↷ |  | + 4 ↷ |  | + 4 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| − 5, |  | − 1, |  | 3, |  | 7, |  | 11 … |


## Escribir fórmulas recursivas

Supón que queremos escribir una fórmula recursiva para 3,8,13,… Ya sabemos que la diferencia común es + 5. También podemos ver que el primer término es 3. Por lo tanto, esta es una fórmula recursiva para la sucesión:

{ a (1) \= 3 a (n) \= a (n − 1) + 5

Problema 1

**Encuentra k y d en esta fórmula recursiva de la sucesión − 5,− 1,3,7,….**

{ a (1) \= k a (n) \= a (n − 1) + d

k \=

d \=

Cada término es el término anterior + 4:

|  | + 4 ↷ |  | + 4 ↷ |  | + 4 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| − 5, |  | − 1, |  | 3, |  | 7,… |

Por lo que la diferencia común es + 4. También vemos que el primer término es − 5. Esta es la fórmula recursiva:

{ a (1) \= − 5 a (n) \= a (n − 1) + 4

**En conclusión, k \= − 5 y d \= 4.**


## Escribir fórmulas explícitas

Supón que queremos escribir una fórmula explícita para 3,8,13,… Ya sabemos que la diferencia común es + 5 y que el primer término es 3. Por lo tanto, esta es una fórmula explícita para la sucesión:

a (n) \= 3 + 5 (n − 1)

Problema 1

**Escribe una fórmula explícita para − 5,− 1,3,7,…**

a (n) \=

Cada término es el término anterior + 4:

|  | + 4 ↷ |  | + 4 ↷ |  | + 4 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| − 5, |  | − 1, |  | 3, |  | 7,… |

Por lo que la diferencia común es + 4. También vemos que el primer término es − 5. Esta es una fórmula explícita:

a (n) \= − 5 + 4 (n − 1)

Una fórmula equivalente es:

a (n) \= − 9 + 4 n


# Repaso de sucesiones geométricas (artículo)

## Partes y fórmulas de sucesiones geométricas

En sucesiones geométricas, la razón entre términos consecutivos es siempre la misma. Llamamos a esta razón **la razón común**.

Por ejemplo, la razón común de la siguiente sucesión es 2:

|  | × 2 ↷ |  | × 2 ↷ |  | × 2 ↷ |  |
| --- | --- | --- | --- | --- | --- | --- |
| 1, |  | 2, |  | 4, |  | 8,… |

Las fórmulas de una sucesión geométrica nos dan a (n), el n ésimo.simo término de la sucesión.

Esta es la fórmula **explícita** de la sucesión geométrica cuyo primer término es k y cuya razón común es r:

a (n) \= k ⋅ r n − 1

Esta es la **fórmula recursiva** de esa sucesión:

{ a (1) \= k a (n) \= a (n − 1) ⋅ r

## Extender sucesiones geométricas

Supón que queremos extender la sucesión 54,18,6,… Podemos ver que cada término es el término anterior × 1 3:

|  | × 1 3 ↷ |  | × 1 3 ↷ |  |
| --- | --- | --- | --- | --- |
| 54, |  | 18, |  | 6,… |

Así que simplemente multiplicamos por esa razón para encontrar que el término siguiente es 2:

|  | × 1 3 ↷ |  | × 1 3 ↷ |  | × 1 3 ↷ |  |
| --- | --- | --- | --- | --- | --- | --- |
| 54, |  | 18, |  | 6, |  | 2,… |

Problema 1

**¿Cuál es el término siguiente en la sucesión 1 2,2,8,…?**

Cada término es el término anterior × 4:

|  | × 4 ↷ |  | × 4 ↷ |  |  |
| --- | --- | --- | --- | --- | --- |
| 1 2, |  | 2, |  | 8,… |

Por lo tanto, el siguiente término es 32:

|  | × 4 ↷ |  | × 4 ↷ |  | × 4 ↷ |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 2, |  | 2, |  | 8, |  | 32 … |


## Escribir fórmulas recursivas

Supón que queremos escribir una fórmula recursiva para 54,18,6,… Ya sabemos que la razón común es 1 3. También podemos ver que el primer término es 54. Por lo tanto, esta es una fórmula recursiva para la sucesión:

{ a (1) \= 54 a (n) \= a (n − 1) ⋅ 1 3

Problema 1

**Encuentra k y r en esta fórmula recursiva de la sucesión 1 2,2,8,….**

{ a (1) \= k a (n) \= a (n − 1) ⋅ r

k \=

r \=

Cada término es el término anterior × 4:

|  | × 4 ↷ |  | × 4 ↷ |  |  |
| --- | --- | --- | --- | --- | --- |
| 1 2, |  | 2, |  | 8,… |

Así que la razón común es × 4. También vemos que el primer término es 1 2. Esta es la fórmula recursiva:

{ a (1) \= 1 2 a (n) \= a (n − 1) ⋅ 4

**En conclusión, k \= 1 2 y r \= 4.**

## Escribir fórmulas explícitas

Supón que queremos escribir una fórmula explícita para 54,18,6,… Ya sabemos que la razón común es 1 3 y que el primer término es 54. Por lo tanto, esta es una fórmula explícita para la sucesión:

a (n) \= 54 ⋅ (1 3) n − 1

Problema 1

**Escribe una fórmula explícita para 1 2,2,8,…**

a (n) \=

Cada término es el término anterior × 4:

|  | × 4 ↷ |  | × 4 ↷ |  |  |
| --- | --- | --- | --- | --- | --- |
| 1 2, |  | 2, |  | 8,… |

Así que la razón común es × 4. También vemos que el primer término es 1 2. Esta es la fórmula explícita:

a (n) \= 1 2 ⋅ 4 n − 1

Una fórmula equivalente es:

a (n) \= 1 8 ⋅ 4 n