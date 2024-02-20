const PDFDocument = require('pdfkit-construct')

const generarPDF = async (data, res) => {

    // Creamos el documento PDF
    const doc = new PDFDocument();
    doc.text('Usando pdfkit')
    doc.addTable(
        [
            { key: 'Estudiante.CodigoSunedu', label: 'CÓDIGO SUNEDU', align: 'left' },
            { key: 'Estudiante.Persona.DNI', label: 'DNI', align: 'left' },
            // {key: 'price', label: 'Price', align: 'right'},
            // {key: 'quantity', label: 'Quantity'},
            // {key: 'amount', label: 'Amount', align: 'right'}
        ],
        data, {
        border: null,
        width: "fill_body",
        striped: true,
        stripedColors: ["#f6f6f6", "#d6c4dd"],
        cellsPadding: 10,
        marginLeft: 45,
        marginRight: 45,
        headAlign: 'center'
    });
    //doc.render();
    // Enviamos el PDF al cliente como respuesta HTTP
    doc.pipe(res);
    doc.end();

}

module.exports = generarPDF

