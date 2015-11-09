# splinesJS
Genera y representa funciones polinómicas a trozos usando HTML y JavaScript


Este script genera el [spline] (https://es.wikipedia.org/wiki/Spline) del tipo que guste el usuario que interpole ciertos valores en ciertos nodos, y, con ayuda de una minimalista interfaz gráfica proporcionada por el documento HTML y de un gnuplot compilado en JavaScript, lo representa y permite que el usuario evalúe el spline en el punto que desee.

El contenido inicial de este repositorio forma parte de un trabajo elaborado para Métodos Numéricos I. El script aplica la teoría desarrollada en el mismo por [**@AntonioCheca**] (https://github.com/AntonioCheca), [**@DarioSierra**] (https://github.com/DarioSierra), [**@JesusJMMA**] (https://github.com/JesusJMMA) y yo, para obtener cada spline a partir de la resolución de un sistema de ecuaciones (cuyas incógnitas son las derivadas n-ésimas en los nodos, siendo n la clase del spline) por el método de Gauss. La implementación del método de Gauss es recursiva y está pensada solo para que funcione en caso de sistema unisolvente, pero la teoría garantiza que el programa siempre lo usará para resolver un sistema con único grupo de soluciones.

"Compilación": juntar en una sola carpeta `splines.html`, `splines.js` y los archivos `gnuplot.js` y `gnuplot_api.js` de [esta carpeta] (https://github.com/chhu/gnuplot-JS/tree/master/www) del repositorio de [**@chhu**] (https://github.com/chhu). Podría funcionar con un gnuplot más reciente compilado en JavaScript (en [ese mismo repositorio] (https://github.com/chhu/gnuplot-JS) se explica cómo compilar gnuplot en JS).

Uso: Ejecútese `splines.html` con el navegador favorito del usuario. Después, introdúzcanse, separados por espacios en blanco, los nodos y los valores; selecciónese el tipo de spline y rellénese el cuadro con las derivadas, si el tipo de spline así lo exige. Púlsese Generar y se mostrará una gráfica del spline. Después, puede evaluarse el spline en un punto arbitrario (siempre entre el primer y el último nodo) rellenando el cuadro correspondiente.

El script es capaz de generar los siguientes splines:
- Cúbicos de clase 2: polinomios de grado 3 o menor en cada trozo:
  - Sujeto: permite fijar la primera derivada en el primer nodo y en el último nodo (sepárense ambos valores por espacios).
  - Not-a-knot: fuerza que la tercera derivada sea continua en los nodos segundo y penúltimo. Esto provoca que el polinomio en el primer trozo sea el mismo que en el segundo, e igual situación con los trozos penúltimo y último.
  - Natural: fuerza que la segunda derivada en los nodos extremos sea 0.
  - Periódico: fuerza que las primeras derivadas en los nodos extremos coincidan y que las segundas derivadas en los nodos extremos coincidan.
- Cuadráticos de clase 1: polinomios de grado 2 o menor en cada trozo:
  - Sujeto por el primer nodo: permite fijar la derivada en el primer nodo.
  - Sujeto por el último nodo: permite fijar la derivada en el último nodo.
  - Periódico: fuerza que las primeras derivadas en los nodos extremos coincidan. Según se ve en la teoría, solo puede aplicarse si el número de nodos es par.
