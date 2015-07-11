gnuplot = new Gnuplot('gnuplot.js');
nodos = [];
valores = [];
funciones = [];
function zeros(dimensions) {
	var array = [];
	for (var i = 0; i < dimensions[0]; ++i)
		array[i] = (dimensions.length == 1 ? 0 : zeros([dimensions[1]]));

	return array;
}
// Resuelve el sistema de ecuaciones
// Prec: el sistema es unisolvente
function Gauss(A, B) {
	if (A.length == 1)
		return [B[0]/A[0][0]];
		
	if (A[0][0] == 0) {
		var fila;
		for (fila = 1; A[fila][0] != 0; fila++);
		var aux_a = A[0];
		var aux_b = B[0];
		A[0] = A[fila];
		B[0] = B[fila];
		A[fila] = aux_a;
		B[fila] = aux_b;
		var sol = Gauss(A,B);
		var aux = sol[0];
		sol[0] = sol[fila]; sol[fila] = aux;
		return sol;
	}
	
	for (var i = 1; i < A.length; i++) {
		var lambda = A[i][0]/A[0][0]
		for (var j = 0; j < A.length; j++)
			A[i][j] -= A[0][j]*lambda;
			
		B[i] -= B[0]*lambda;
	}
	var sA = zeros([A.length-1,A.length-1]);
	for (var i=1; i<A.length; i++)
		for (var j=1; j<A.length; j++)
			sA[i-1][j-1] = A[i][j];
	
	var sB = [];
	for (var i=1; i<B.length; i++)
		sB[i-1] = B[i];
	
	var sol = Gauss(sA, sB);
	var sum = sol[0]*A[0][1];
	for (var i = 1; i < sol.length; i++) {
		sum += sol[i]*A[0][i+1];}
	
	return [(B[0]-sum)/A[0][0]].concat(sol);
}

var generaSpline = function() {
	funciones = [];
	nodos = document.getElementById('nodos').value.split(" ");
	var dim = nodos.length;
	if (dim == 0) return;
	for (var i=0; i < dim; i++) {
		if (isNaN(nodos[i]))
		{ alert('Número no reconocido en el nodo ' + i + ': ' + nodos[i]); return }
		else {
			nodos[i] = parseFloat(nodos[i]);
			if (i > 0 && nodos[i] <= nodos[i-1])
			{ alert('Los nodos deben ser distintos y estar ordenados'); return }
		}
	}
			
	valores = document.getElementById('valores').value.split(" ");
	if (valores.length < dim) { alert('Hay menos valores que nodos'); return };
	for (var i=0; i < dim; i++) {
		if (isNaN(nodos[i]))
		{ alert('Número no reconocido en el valor ' + i + ': ' + valores[i]); return }
	}
	var tipo = document.getElementById('tipo').value;
	var d = document.getElementById('derivadas').value.split(" ");
	var h = [];
	for (var i = 1; i < dim; i++)
		h[i-1] = nodos[i]-nodos[i-1];
	var n = 3 - (tipo == "sujeto1" || tipo == "sujeto2" || tipo == "periodico2");
	if (n == 3) {
		var A = zeros([dim, dim]);
		var B = zeros([dim]);
		for (var i = 1; i < dim-1; i++) {
			A[i][i-1] = h[i-1]/6;
			A[i][i] = (h[i-1]+h[i])/3;
			A[i][i+1] = h[i]/6;
			B[i] = (valores[i+1]-valores[i])/h[i] - (valores[i]-valores[i-1])/h[i-1]
		}
		if (tipo == "sujeto") {
			if (d.length < 2 || isNaN(d[0]) || isNaN(d[1]))
			{ alert('Para este spline debe indicarse la derivada en los extremos'); return}
			A[0][0] = h[0]/3;
			A[0][1] = h[0]/6;
			A[dim-1][dim-2] = h[dim-2]/6;
			A[dim-1][dim-1] = h[dim-2]/3;
			B[0] = (valores[1]-valores[0])/h[0] - d[0];
			B[dim-1] = d[1] - (valores[dim-1]-valores[dim-2])/h[dim-2];
		} else if (tipo == "not-a-knot") {
			A[0][0] = -1/h[0];
			A[0][1] = (h[0]+h[1])/h[0]/h[1];
			A[0][2] = -1/h[1];
			A[dim-1][dim-3] = -1/h[dim-3];
			A[dim-1][dim-2] = (h[dim-3]+h[dim-2])/h[dim-3]/h[dim-2];
			A[dim-1][dim-1] = -1/h[dim-2];
		} else if (tipo == "periodico") {
			A[0][0] = 1;
			A[0][dim-1] = -1;
			A[dim-1][0] = h[0]/3
			A[dim-1][1] = h[0]/6
			A[dim-1][dim-2] = h[dim-2]/6
			A[dim-1][dim-1] = h[dim-2]/3
			B[dim-1] = (valores[1]-valores[0])/h[0] - (valores[dim-1]-valores[dim-2])/h[dim-2]
		} else {	// Se presupondrá natural si no se indica nada
			A[0][0] = 1;
			A[dim-1][dim-1] = 1
		}
		var sol = Gauss(A,B);
		for (var i=1; i<sol.length; i++)
			funciones[i-1] = ((sol[i]-sol[i-1])/6/h[i-1]) + "*(x-" + nodos[i-1] + ")**3 + " + (sol[i-1]/2) + "*(x-" + nodos[i-1] + ")**2 + " + ((valores[i]-valores[i-1])/h[i-1] - h[i-1]/3*sol[i-1] - h[i-1]/6*sol[i]) + "*(x-" + nodos[i-1] + ") + " + valores[i-1];
			
	} else if (n==2) {
		var A = zeros([dim, dim]);
		var B = zeros([dim]);
		// Método local. Igualando derivadas en extremos de intervalo:
		// f'(xi) + f'(xi+1) = 2*(yi+1-yi)/hi
		
		for (var i = 0; i < dim-1; i++) {
			A[i][i] = 1;
			A[i][i+1] = 1;
			B[i] = 2*(valores[i+1]-valores[i])/h[i];
		}
		if (tipo == 'sujeto1') {
			if (d[0] == "" || isNaN(d[0]))
			{ alert('Para este spline debe indicarse la derivada en el primer nodo'); return}
			A[dim-1][0] = 1;
			B[dim-1] = d[0];
		} else if (tipo == 'sujeto2') {
			if (d[0] == "" || isNaN(d[0]))
			{ alert('Para este spline debe indicarse la derivada en el último nodo'); return}
			A[dim-1][dim-1] = 1;
			B[dim-1] = d[0];
		} else {	// Se presupondrá periódico si no se indica nada
			if (dim%2 == 1) {
				alert('La condición de periodicidad en splines cuadráticos puede aplicarse solo con número par de nodos'); return
			}
			A[dim-1][0] = 1;
			A[dim-1][dim-1] = -1;
		}
		var sol = Gauss(A,B);
		for (var i=1; i<sol.length; i++)
			funciones[i-1] = (((valores[i]-valores[i-1])/h[i-1]-sol[i-1])/h[i-1]) + "*(x-" + nodos[i-1] + ")**2 + " + sol[i-1] + "*(x-" + nodos[i-1] + ") + " + valores[i-1];
			
	}
	
	var salida = "s(x) =";
	for (var i=0; i<funciones.length; i++)
		salida += "\n\n " + funciones[i].split('**').join('^').split("--").join("+").split("(x-0)").join("x").split("+ -").join("- ") + "\nsi " + nodos[i] + " <= x < " + nodos[i+1];
	
	salida = salida.split("+ 0\n").join("\n").split("+ 0*");
	for (var i=1; i<salida.length; i++)
		salida[i] = salida[i].substring(salida[i].indexOf(" ")+1);
		
	salida = salida.join("");
	
	if (salida != "s(x) =") {
		document.getElementById('spline').value = salida.split("\n ").join("\n");
		return true;
	}
	return false;
}

var pow = function(b, e) {
	var res = b;
	for (var i = 1; i < e; i++)
		res *= b;
	return res;
}

var evaluarSpline = function() {
	var x = document.getElementById('evaluar').value;
	var y = '';
	if (!isNaN(x)) {
		var spline = document.getElementById('spline').value;
		spline = spline.split("\n\n");
		for (var i = 1; i < spline.length && y == ''; i++)
			if (eval((spline[i].split("\nsi ")[1]).split("<= x <").join("<= " + x + " && " + x + " <=")))
				y = eval(spline[i].split("\nsi ")[0].split("*x").join("*(x)").split("x").join(x).split(")^3").join(", 3]").split(")^2").join(", 2]").split(")").join(", 1)").split("]").join(")").split("(").join("pow("));
	}
	document.getElementById('evaluado').value = y;
}

var runScript = function() {
	if (!generaSpline()) return;
	var input = "set terminal svg enhanced size 960,540\nset output 'out.svg'\nset xlabel 'x'\nset datafile missing 'NaN'\nset zeroaxis\nset samples 1200\n";
	input += "plot [" + nodos[0] + ":" + nodos[nodos.length-1] + "] '-' title 'Valores' with impulses pt 1 ps 3, ";

	var trozos = [];
	for (var i=0; i<nodos.length-1; i++)
		trozos[i] = "(x > " + nodos[i] + " && x < " + nodos[i+1] + ")*(" + funciones[i] + ")"
		
	input += trozos.join(" + ") + " title 's(x)'\n";
	for (var i=0; i<nodos.length; i++)
		input += nodos[i] + ". " + valores[i] + ".\n"
	input += "e\n"
	
	gnuplot.run(input, function(e) {
		gnuplot.getFile('out.svg', function(e) {
			if (!e.content) {
				return;
			}
			var img = document.getElementById('gnuimg');
			try {
				var ab = new Uint8Array(e.content);
				var blob = new Blob([ab], {"type": "image\/svg+xml"});
				window.URL = window.URL || window.webkitURL;
				img.src = window.URL.createObjectURL(blob);
			} catch (err) { // in case blob / URL missing, fallback to data-uri
				if (!window.blobalert) {
					alert('Warning - your browser does not support Blob-URLs, using data-uri with a lot more memory and time required. Err: ' + err);
					window.blobalert = true;
				}
				var rstr = '';
				for (var i = 0; i < e.content.length; i++)
					rstr += String.fromCharCode(e.content[i]);
				img.src = 'data:image\/svg+xml;base64,' + btoa(rstr);
			}
		});
	});
};
