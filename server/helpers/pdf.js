const PDFDocument = require('pdfmake')

const generarPDF = async (data, res) => {
    const fonts = {
        Roboto: {
            normal: 'utils/fonts/Montserrat-Regular.ttf',
            bold: 'utils/fonts/Montserrat-Medium.ttf',
            italics: 'utils/fonts/Montserrat-Italic.ttf',
            bolditalics: 'utils/fonts/Montserrat-MediumItalic.ttf'
        }
    };

    // Definimos el contenido del PDF
    var docDefinition = {
        header: function (currentPage, pageCount, pageSize) {
            // you can apply any logic and return any valid pdfmake element

            return [
                { text: 'Este es un encabezado', alignment: (currentPage % 2) ? 'left' : 'right' },
                { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
            ]
        },
        content: [
            {
                layout: 'lightHorizontalLines',
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    //headerRows: 1,
                    widths: ['auto', 'auto', '*'],

                    body:
                        [
                            ["CÓDIGO SUNEDU", "DNI", "APELLIDOS Y NOMBRES"],
                            ...data.map((item) => [
                                item.Estudiante.CodigoSunedu,
                                item.Estudiante.Persona.DNI,
                                item.Estudiante.Persona.Paterno + " " + item.Estudiante.Persona.Materno + ", " + item.Estudiante.Persona.Nombres
                            ])
                        ]
                }
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 16,
                bold: true,
                margin: [0, 10, 0, 5]
            },
            tableExample: {
                margin: [0, 5, 0, 15]
            },
            tableOpacityExample: {
                margin: [0, 5, 0, 15],
                fillColor: 'blue',
                fillOpacity: 0.3
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
            }
        },
        defaultStyle: {
            // alignment: 'justify'
        }
    };

    // Creamos el documento PDF
    const doc = new PDFDocument(fonts);

    const pdfDoc = doc.createPdfKitDocument(docDefinition);

    // Enviamos el PDF al cliente como respuesta HTTP
    pdfDoc.pipe(res);
    pdfDoc.end();

}

module.exports = generarPDF

