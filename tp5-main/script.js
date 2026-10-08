// URL de la API

const url = "https://apidemo.geoeducacion.com.ar/api/testing/pearson/1";


// --------------------------------------
// FUNCIÓN PARA CALCULAR PEARSON
// --------------------------------------

function calcularPearson(x, y) {

    let n = x.length;

    let sumaX = 0;
    let sumaY = 0;
    let sumaXY = 0;
    let sumaX2 = 0;
    let sumaY2 = 0;


    for (let i = 0; i < n; i++) {

        sumaX = sumaX + x[i];

        sumaY = sumaY + y[i];

        sumaXY = sumaXY + x[i] * y[i];

        sumaX2 = sumaX2 + x[i] * x[i];

        sumaY2 = sumaY2 + y[i] * y[i];
    }


    let numerador =
        n * sumaXY - sumaX * sumaY;


    let denominador = Math.sqrt(
        (n * sumaX2 - sumaX * sumaX) *
        (n * sumaY2 - sumaY * sumaY)
    );


    return numerador / denominador;
}


// --------------------------------------
// FUNCIÓN PARA EXPLICAR EL PEARSON
// --------------------------------------

function explicarPearson(valor) {

    let valorAbsoluto = Math.abs(valor);


    if (valorAbsoluto >= 0.8) {

        if (valor > 0) {

            return "Existe una correlación positiva fuerte. Las dos variables tienden a aumentar juntas.";

        } else {

            return "Existe una correlación negativa fuerte. Cuando una variable aumenta, la otra tiende a disminuir.";
        }


    } else if (valorAbsoluto >= 0.5) {

        if (valor > 0) {

            return "Existe una correlación positiva moderada.";

        } else {

            return "Existe una correlación negativa moderada.";
        }


    } else {

        return "Existe una correlación lineal débil o prácticamente inexistente.";
    }
}


// --------------------------------------
// FUNCIÓN PARA HACER EL GRÁFICO
// --------------------------------------

function hacerGrafico(canvas, x, y) {

    let ctx = canvas.getContext("2d");


    let ancho = canvas.width;

    let alto = canvas.height;


    let minX = Math.min(...x);

    let maxX = Math.max(...x);

    let minY = Math.min(...y);

    let maxY = Math.max(...y);


    // Dibujamos cada punto

    for (let i = 0; i < x.length; i++) {

        let posicionX =
            ((x[i] - minX) / (maxX - minX))
            * (ancho - 40) + 20;


        let posicionY =
            alto -
            (((y[i] - minY) / (maxY - minY))
            * (alto - 40) + 20);


        ctx.beginPath();

        ctx.arc(
            posicionX,
            posicionY,
            5,
            0,
            2 * Math.PI
        );

        ctx.fillStyle = "blue";

        ctx.fill();
    }
}


// --------------------------------------
// FUNCIÓN PRINCIPAL
// --------------------------------------

async function obtenerDatos() {

    try {

        // Pedimos los datos a la API

        let respuesta = await fetch(url);


        // Convertimos la respuesta a JSON

        let datos = await respuesta.json();


        // Obtenemos los valores

        let valores = datos.data[0].valores;


        // --------------------------------------
        // COMBINACIONES
        // --------------------------------------

        let combinaciones = [

            {
                nombre: "Presión y Temperatura",
                x: "presion",
                y: "temperatura"
            },

            {
                nombre: "Presión y Humedad",
                x: "presion",
                y: "humedad"
            },

            {
                nombre: "Presión y Velocidad del viento",
                x: "presion",
                y: "viento"
            },

            {
                nombre: "Temperatura y Humedad",
                x: "temperatura",
                y: "humedad"
            },

            {
                nombre: "Temperatura y Velocidad del viento",
                x: "temperatura",
                y: "viento"
            },

            {
                nombre: "Humedad y Velocidad del viento",
                x: "humedad",
                y: "viento"
            }

        ];


        let contenedor =
            document.getElementById("contenedor");


        let resultados = [];


        // --------------------------------------
        // RECORREMOS LAS COMBINACIONES
        // --------------------------------------

        for (let combinacion of combinaciones) {


            let valoresX = [];

            let valoresY = [];


            // Sacamos los valores de cada variable

            for (let dato of valores) {

                valoresX.push(
                    dato[combinacion.x]
                );

                valoresY.push(
                    dato[combinacion.y]
                );
            }


            // Calculamos Pearson

            let pearson =
                calcularPearson(
                    valoresX,
                    valoresY
                );


            // Guardamos el resultado

            resultados.push({

                nombre: combinacion.nombre,

                pearson: pearson

            });


            // --------------------------------------
            // CREAMOS LA CARD
            // --------------------------------------

            let card =
                document.createElement("div");


            card.className = "card";


            // Título

            let titulo =
                document.createElement("h2");


            titulo.textContent =
                combinacion.nombre;


            // Pearson

            let resultado =
                document.createElement("p");


            resultado.className = "pearson";


            resultado.textContent =
                "Coeficiente de Pearson: "
                + pearson.toFixed(3);


            // Explicación

            let explicacion =
                document.createElement("p");


            explicacion.textContent =
                explicarPearson(pearson);


            // --------------------------------------
            // CREAMOS EL CANVAS
            // --------------------------------------

            let canvas =
                document.createElement("canvas");


            canvas.width = 400;

            canvas.height = 250;


            // Agregamos los elementos a la card

            card.appendChild(titulo);

            card.appendChild(resultado);

            card.appendChild(canvas);

            card.appendChild(explicacion);


            // Agregamos la card a la página

            contenedor.appendChild(card);


            // Hacemos el gráfico

            hacerGrafico(
                canvas,
                valoresX,
                valoresY
            );

        }


        // --------------------------------------
        // BUSCAMOS LA MAYOR CORRELACIÓN
        // --------------------------------------

        let mayor = resultados[0];


        for (let resultado of resultados) {

            if (
                Math.abs(resultado.pearson) >
                Math.abs(mayor.pearson)
            ) {

                mayor = resultado;

            }
        }


        // --------------------------------------
        // MOSTRAMOS EL RESULTADO
        // --------------------------------------

        document.getElementById(
            "mayorCorrelacion"
        ).textContent =

            "La mayor correlación es entre "
            + mayor.nombre
            + ", con un coeficiente de Pearson de "
            + mayor.pearson.toFixed(3)
            + ". "
            + explicarPearson(mayor.pearson);


    } catch (error) {

        console.log(error);


        document.getElementById(
            "mayorCorrelacion"
        ).textContent =
            "Ocurrió un error al obtener los datos.";

    }
}


// --------------------------------------
// EJECUTAMOS EL PROGRAMA
// --------------------------------------

obtenerDatos();