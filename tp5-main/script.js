
 // URL de la API de donde obtenemos los datos
const url = "https://apidemo.geoeducacion.com.ar/api/testing/pearson/1";

// Funcion para calcular el coeficiente de Pearson
// Recibe dos listas de valores: x e y
function calcularPearson(x, y) {
    let n = x.length;

    // Variables para guardar las sumas necesarias
    let sumaX = 0;
    let sumaY = 0;
    let sumaXY = 0;
    let sumaX2 = 0;
    let sumaY2 = 0;

    // Recorrer los valores y calcular las sumas
    for (let i = 0; i < n; i++) {
        sumaX += x[i];
        sumaY += y[i];
        sumaXY += x[i] * y[i];
        sumaX2 += x[i] * x[i];
        sumaY2 += y[i] * y[i];
    }

    // Aplicar la formula de Pearson
    let numerador = n * sumaXY - sumaX * sumaY;

    let denominador = Math.sqrt(
        (n * sumaX2 - sumaX * sumaX) *
        (n * sumaY2 - sumaY * sumaY)
    );

    // Evitar dividir por cero si no hay variacion en los datos
    if (denominador == 0) {
        return 0;
    }

    // Devolver el resultado
    return numerador / denominador;
}

// Funcion que explica el resultado de Pearson
function explicarPearson(valor) {

    // Si el valor es cercano a 1, la correlacion es positiva fuerte
    if (valor >= 0.8) {
        return "Correlacion positiva fuerte.";
    }

    // Si el valor es cercano a -1, la correlacion es negativa fuerte
    if (valor <= -0.8) {
        return "Correlacion negativa fuerte.";
    }

    // Correlacion positiva moderada
    if (valor >= 0.5) {
        return "Correlacion positiva moderada.";
    }

    // Correlacion negativa moderada
    if (valor <= -0.5) {
        return "Correlacion negativa moderada.";
    }

    // Si no cumple las condiciones anteriores, es debil
    return "Correlacion debil.";
}

// Funcion para dibujar el grafico de dispersion
function hacerGrafico(canvas, x, y) {

    // Obtener el contexto para dibujar
    let ctx = canvas.getContext("2d");

    // Buscar los valores minimos y maximos
    let minX = Math.min(...x);
    let maxX = Math.max(...x);
    let minY = Math.min(...y);
    let maxY = Math.max(...y);

    // Dibujar los ejes del grafico
    ctx.beginPath();
    ctx.moveTo(30, 10);
    ctx.lineTo(30, 180);
    ctx.lineTo(390, 180);
    ctx.stroke();

    // Dibujar la linea de tendencia
    if (maxX != minX) {

        let n = x.length;
        let sumaX = 0;
        let sumaY = 0;
        let sumaXY = 0;
        let sumaX2 = 0;

        // Calcular las sumas necesarias para la linea
        for (let i = 0; i < n; i++) {
            sumaX += x[i];
            sumaY += y[i];
            sumaXY += x[i] * y[i];
            sumaX2 += x[i] * x[i];
        }

        // Calcular la pendiente de la linea
        let numerador = n * sumaXY - sumaX * sumaY;
        let denominador = n * sumaX2 - sumaX * sumaX;
        let pendiente = numerador / denominador;

        // Calcular donde empieza y termina la linea
        let promedioX = sumaX / n;
        let promedioY = sumaY / n;
        let inicioY = promedioY + pendiente * (minX - promedioX);
        let finalY = promedioY + pendiente * (maxX - promedioX);

        // Pasar los valores a posiciones del grafico
        let px1 = 30;
        let px2 = 390;
        let py1 = 180;
        let py2 = 180;

        if (maxY != minY) {
            py1 = 180 - (inicioY - minY) / (maxY - minY) * 160;
            py2 = 180 - (finalY - minY) / (maxY - minY) * 160;
        }

        // Dibujar la linea roja
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Recorrer los datos para dibujar cada punto
    for (let i = 0; i < x.length; i++) {

        // Calcular la posicion horizontal
        let px = 30;
        let py = 180;

        if (maxX != minX) {
            px = 30 + (x[i] - minX) / (maxX - minX) * 360;
        }

        // Calcular la posicion vertical
        if (maxY != minY) {
            py = 180 - (y[i] - minY) / (maxY - minY) * 160;
        }

        // Dibujar el circulito azul
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();
    }
}

// Funcion principal para obtener y mostrar los datos
async function obtenerDatos() {
    try {

        // Pedir los datos a la API
        let respuesta = await fetch(url);

        // Convertir la respuesta a formato JSON
        let datos = await respuesta.json();

        // Obtener la lista de datos meteorologicos
        let valores = datos.data[0].valores;

        // Guardar las seis combinaciones que tenemos que analizar
        let combinaciones = [
            { nombre: "Presion y Temperatura", x: "presion", y: "temperatura" },
            { nombre: "Presion y Humedad", x: "presion", y: "humedad" },
            { nombre: "Presion y Viento", x: "presion", y: "viento" },
            { nombre: "Temperatura y Humedad", x: "temperatura", y: "humedad" },
            { nombre: "Temperatura y Viento", x: "temperatura", y: "viento" },
            { nombre: "Humedad y Viento", x: "humedad", y: "viento" }
        ];

        // Buscar el contenedor donde se mostraran las tarjetas
        let contenedor = document.getElementById("contenedor");

        // Lista para guardar los resultados de Pearson
        let resultados = [];

        // Recorrer las seis combinaciones
        for (let combinacion of combinaciones) {

            // Crear las listas para las dos variables
            let x = [];
            let y = [];

            // Obtener los valores de cada variable
            for (let dato of valores) {
                x.push(dato[combinacion.x]);
                y.push(dato[combinacion.y]);
            }

            // Calcular Pearson para esta combinacion
            let pearson = calcularPearson(x, y);

            // Guardar el nombre y el resultado
            resultados.push({
                nombre: combinacion.nombre,
                pearson: pearson
            });

            // Crear la tarjeta
            let tarjeta = document.createElement("div");
            tarjeta.className = "card";

            // Crear el titulo de la tarjeta
            let titulo = document.createElement("h2");
            titulo.textContent = combinacion.nombre;

            // Mostrar el coeficiente con tres decimales
            let resultado = document.createElement("p");
            resultado.className = "pearson";
            resultado.textContent = "Pearson: " + pearson.toFixed(3);

            // Crear el espacio para el grafico
            let canvas = document.createElement("canvas");
            canvas.width = 400;
            canvas.height = 200;

            // Mostrar la explicacion de la correlacion
            let explicacion = document.createElement("p");
            explicacion.textContent = explicarPearson(pearson);

            // Agregar los elementos a la tarjeta
            tarjeta.appendChild(titulo);
            tarjeta.appendChild(resultado);
            tarjeta.appendChild(canvas);
            tarjeta.appendChild(explicacion);

            // Agregar la tarjeta a la pagina
            contenedor.appendChild(tarjeta);

            // Dibujar el grafico con los valores de esta combinacion
            hacerGrafico(canvas, x, y);
        }

        // Tomar el primer resultado como la correlacion mas fuerte
        let mayor = resultados[0];

        // Comparar los seis resultados
        for (let resultado of resultados) {

            // Comparar la intensidad sin importar si es positiva o negativa
            if (Math.abs(resultado.pearson) > Math.abs(mayor.pearson)) {
                mayor = resultado;
            }
        }

        // Mostrar cual es la correlacion mas fuerte
        document.getElementById("mayorCorrelacion").textContent =
            "La correlacion mas fuerte es entre " + mayor.nombre +
            ", con un coeficiente de " + mayor.pearson.toFixed(3) +
            ". " + explicarPearson(mayor.pearson);

    } catch (error) {

        // Mostrar un mensaje si ocurre un error
        console.log(error);

        document.getElementById("mayorCorrelacion").textContent =
            "Error al obtener los datos de la API.";
    }
}

// Ejecutar la funcion principal
obtenerDatos();
