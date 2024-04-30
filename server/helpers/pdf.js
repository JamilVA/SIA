const PDFDocument = require("pdfkit-table");

const pdfOptions = {
    size: "A4",
    margins: { top: 20, left: 40, right: 40, bottom: 20 },
    font: 'Helvetica',
    bufferPages: true //Mejora rendimiento en documentos grandes
}

const setHeader = (doc) => {
    doc.image("public/logo-escuela.jpg", 40, 15, { width: 80 });
    doc.image("public/logo-sunedu.png", doc.page.width - 40 - 80, 15, { width: 80 });

    doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("ESCUELA SUPERIOR DE FORMACIÓN ARTÍSTICA PÚBLICA", {
            align: "center",
            lineGap: 10,
        });
    doc.fontSize(12).text("MARIO URTEAGA ALVARADO", { align: "center", lineGap: 10 });

    doc
        .moveTo(40, 70)
        .lineTo(doc.page.width - 40, 70)
        .lineWidth(1.5)
        .stroke("#000000");
}

const generarPDFMatriculados = async (data, res) => {
    const doc = new PDFDocument(pdfOptions);
    setHeader(doc); //Establece el encabezado
    doc.moveDown(1)
    doc.font("Helvetica")
    doc.fontSize(12).text(`${data.curso.CarreraProfesional.NombreCarrera}`, { align: "center", lineGap: 5 });
    doc.fontSize(12).text(`${data.curso.Nombre} (${data.curso.Codigo})`, { align: "center", lineGap: 5 });

    const table = {
        headers: [
            { property: 'Numero', label: '#', width: 40, align: 'center' },
            { property: 'CodigoSunedu', label: 'CÓDIGO SUNEDU', width: 100, align: 'center' },
            { property: 'DNI', label: 'DNI', width: 100, align: 'center' },
            { property: 'Estudiante', label: 'ESTUDIANTE', width: 275, align: 'left', headerAlign: 'center' }
        ],
        datas: data.lista,
        options: {
            minRowHeight: 10,
            divider: {
                header: { disabled: true },
                horizontal: { disabled: true },
            }
        }
    }

    doc.table(table);

    // Enviamos el PDF al cliente como respuesta HTTP
    doc.pipe(res);
    doc.end();

}

const generarPDFAsistencia = async (data, res) => {
    const doc = new PDFDocument(pdfOptions);
    setHeader(doc); //Establece el encabezado
    doc.moveDown(1)
    doc.font("Helvetica").fontSize(12)
    doc.text(`${data.curso.CarreraProfesional.NombreCarrera}`, { align: "center", lineGap: 5 });
    doc.text(`${data.curso.Nombre} (${data.curso.Codigo})`, { align: "center", lineGap: 5 });

    doc.text(`${data.sesion.Descripcion}`, { align: "center", lineGap: 5 });
    doc.text(`Fecha: ${new Date(data.sesion.Fecha + "T05:00:00Z").toLocaleDateString()}`, { align: "center", lineGap: 5 });

    const table = {
        headers: [
            { property: 'Numero', label: '#', width: 40, align: 'center' },
            { property: 'CodigoSunedu', label: 'CÓDIGO SUNEDU', width: 100, align: 'center' },
            { property: 'DNI', label: 'DNI', width: 80, align: 'center' },
            { property: 'Estudiante', label: 'ESTUDIANTE', width: 200, align: 'left', headerAlign: 'center' },
            { property: 'Asistencia', label: 'ASISTENCIA', width: 80, align: 'center' }
        ],
        datas: data.lista,
        options: {
            minRowHeight: 10,
            divider: {
                header: { disabled: true },
                horizontal: { disabled: true },
            }
        }
    }

    doc.table(table);

    // Enviamos el PDF al cliente como respuesta HTTP
    doc.pipe(res);
    doc.end();

}

const generarPDFActa = async (data, res) => {
    const doc = new PDFDocument(pdfOptions);
    setHeader(doc); //Establece el encabezado
    doc.moveDown(1)
    doc.font("Helvetica")
    doc.fontSize(11).text(`ACTA DE EVALUACIÓN ${data.acta.Codigo}`, { align: 'center' })
    const table = {
        headers: [
            { property: 'Numero', label: '#', width: 20, align: 'center', headerColor: 'blue' },
            { property: 'CodigoSunedu', label: 'CÓDIGO', width: 80, align: 'center', headerColor: 'blue' },
            { property: 'Estudiante', label: 'ESTUDIANTE', width: 175, headerAlign: 'center', headerColor: 'blue' },
            { property: 'Estado', label: 'ESTADO', width: 80, align: 'center', headerAlign: 'center', headerColor: 'blue' },
            { property: 'Promedio', label: 'PROMEDIO', width: 80, align: 'center', headerColor: 'blue' },
            { property: 'Obs', label: 'OBS', width: 80, align: 'center', headerAlign: 'center', headerColor: 'blue' }
        ],
        datas: data.lista,
        options: {
            // title: { label: 'Acta', fontSize: 11, fontFamily: "Helvetica", align: 'center' },
            // subtitle: "Subtitle",
            x: 40,
            minRowHeight: 10,
            divider: {
                header: { disabled: true },
                horizontal: { disabled: true },
            }
        }
    }
    doc.table({
        headers:
            [
                { property: 'labels', label: 'Carrera', width: 114, columnColor: 'blue' },
                { property: 'values', label: 'Curso', width: 400, columnColor: 'gray', columnOpacity: 0.05 }
            ],
        datas: [
            { labels: "bold:CARRERA PROFESIONAL:", values: data.curso.CarreraProfesional.NombreCarrera },
            { labels: "bold:CURSO:", values: data.curso.Nombre }
        ],
        options: {
            y: 100,
            divider: {
                header: { disabled: true },
                horizontal: { disabled: true },
            },
            hideHeader: true,
            padding: 5
        }
    })
    doc.table({
        headers:
            [
                { label: 'PERIODO ACADÉMICO', width: 110, align: 'center', headerColor: 'blue' },
                { label: 'SEMESTRE ACADÉMICO', width: 110, align: 'center', headerColor: 'blue' }
            ],
        rows: [[data.periodo.Denominacion, data.periodo.Denominacion.substring(5)]],
        options: {
            y: 140,
            divider: {
                header: { disabled: true },
                horizontal: { disabled: true },
            }
        }
    })

    doc.table({
        headers:
            [
                { label: 'DOCENTE', align: 'center', headerColor: 'blue' }
            ],
        rows: [[`${data.docente.Persona.Paterno} ${data.docente.Persona.Materno}, ${data.docente.Persona.Nombres}`]],
        options: {
            x: 280,
            y: 140,
            divider: {
                header: { disabled: true },
                horizontal: { disabled: true },
            }
        }
    })

    doc.table(table) //Tabla principal de lista de estudiantes
    doc.moveDown(1)
    doc.table({
        headers: [
            { label: 'RESUMEN', width: 100, headerAlign: 'center', headerColor: 'blue', headerOpacity: 0.05, columnColor: 'blue', columnOpacity: 0.05 },
            { label: 'Nro.', width: 80, align: 'center', headerColor: 'gray', headerOpacity: 0.05, columnColor: 'gray', columnOpacity: 0.05 },
        ],
        rows: [
            ["Matriculados", data.stats.numeroMatriculados],
            ["Aprobados", data.stats.aprobados],
            ["Desaprobados", data.stats.desaprobados],
            ["Límite de inasistencias", data.stats.desaprobadosInasistencia],
        ],
        options: {
            divider: {
                header: { disabled: true },
                horizontal: { disabled: true },
            },
            padding: 5,
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8)
        }
    })
    // Enviamos el PDF al cliente como respuesta HTTP
    doc.pipe(res);
    doc.end();

}

const generarPDFHistorialNotas = async (data, res) => {
    const doc = new PDFDocument(pdfOptions);
    setHeader(doc); //Establece el encabezado
    doc.moveDown(1)
    doc.font("Helvetica").fontSize(10)
    doc.text("HISTORIAL DE NOTAS", { align: "center", lineGap: 5 });
    doc.text(`Código Estudiante: ${data.carrera.Siglas + data.estudiante.CodigoSunedu.substring(2, 10)}`, { align: "left", lineGap: 5 });
    doc.text(`Apellidos y nombres: ${data.estudiante.Persona.Paterno} ${data.estudiante.Persona.Materno} ${data.estudiante.Persona.Nombres}`, { align: "left", lineGap: 5 });
    doc.text(`Especialidad: ${data.carrera.NombreCarrera}`, { align: "left", lineGap: 5 });
    doc.moveDown(1)

    const table = {
        headers: [
            { property: 'Codigo', label: 'CÓDIGO', width: 60, align: 'center' },
            { property: 'Curso', label: 'CURSO', width: 150, align: 'left', headerAlign: 'center' },
            { property: 'Nota', label: 'NOTA', width: 50, align: 'center' },
            { property: 'Ciclo', label: 'CICLO', width: 50, align: 'center' },
            { property: 'Creditos', label: 'CRÉDITOS', width: 60, align: 'center' },
            { property: 'Acta', label: 'ACTA', width: 60, align: 'center' },
            { property: 'Fecha', label: 'FECHA', width: 60, align: 'center',
                renderer: (value, indexColumn, indexRow, row, rectRow, rectCell) => { 
                    if(value === undefined) return ''
                    return new Date(value).toLocaleDateString() 
                } 
            }
        ],
        datas: data.historial,
        options: {
            minRowHeight: 10,
            divider: {
                header: { disabled: true },
                horizontal: { disabled: true },
            },
            padding: 2
        }
    }

    await doc.table(table);

    // Enviamos el PDF al cliente como respuesta HTTP
    doc.pipe(res);
    doc.end();

}

module.exports = {
    generarPDFMatriculados,
    generarPDFAsistencia,
    generarPDFActa,
    generarPDFHistorialNotas
}

