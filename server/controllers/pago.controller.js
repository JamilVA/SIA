const { response } = require("express");
const {
  ConceptoPago,
  Pago,
  Estudiante,
  Persona,
} = require("../config/relations");

const PDF = require("pdfkit-construct");
const { Sequelize } = require("sequelize");

const getConceptos = async (req, res = response) => {
  try {
    const conceptos = await ConceptoPago.findAll();
    res.json({ conceptos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la carga de conceptos de pago" });
  }
};

const getPagos = async (req, res = response) => {
  try {
    const pagos = await Pago.findAll({
      include: [{ all: true }],
    });

    res.json({
      ok: true,
      pagos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la carga de datos" });
  }
};

const getPagosEstudiante = async (req, res) => {
  console.log(req.query);
  try {
    const { CodigoEstudiante } = req.query;

    const pago = await Pago.findOne({
      attributes: [[Sequelize.fn("COUNT", "CodigoConceptoPago"), "cantidad"]],
      where: {
        CodigoEstudiante: CodigoEstudiante,
        EstadoPago: "R",
        CodigoConceptoPago: "0802",
      },
    });

    res.json({
      mensaje: "Pagos Encotrados",
      pagoMatricula: pago || 0,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en la carga de pagos" });
  }
};

const getPagosByStudent = async (req, res) => {
  try {
    const _codStudent = req.query.codigo;
    const pagos = await Pago.findAll({
      include: [{ all: true }],
      where: {
        CodigoEstudiante: req.query.codigo == undefined ? 0 : _codStudent,
      },
    });

    res.json({
      ok: true,
      pagos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la carga de datos" });
  }
};

const crearPago = async (req, res) => {
  try {
    //const numeroComprob = (await numeroComprobante()).toString();
    const data = req.body;
    const pago = await Pago.create({
      Codigo: null,
      NroTransaccion: data.NroTransaccion,
      Fecha: new Date(),
      EstadoPago: "R",
      Observacion: data.Observacion,
      CodigoEstudiante: data.CodigoEstudiante,
      CodigoConceptoPago: data.CodigoConceptoPago,
    });

    res.json({
      message: "El pago se ha registrado correctamente",
      pago,
    });
  } catch (error) {
    console.log("Ha ocurrido un error", error);
    if ((error.name = "SequelizeUniqueConstraintError")) {
      return res.status(500).json({
        error: "El número de transacción proporcionado ya ha sido registrado",
      });
    }
    return res
      .status(500)
      .json({ error: "Ha ocurrido un error al registrar el pago" });
  }
};

const anularPago = async (req, res) => {
  try {
    await Pago.update(
      { EstadoPago: "A" },
      {
        where: { Codigo: req.body.codigo },
      }
    );

    res.json({
      message: "El pago ha sido anulado correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Ha ocurrido un error al anular el pago" });
  }
};

const obtenerPDFPagos = async (req, res) => {

  anio = new Date(req.query.a).getFullYear();

  const doc = new PDF({
    size: "A4",
    margins: { top: 20, left: 10, right: 10, bottom: 20 },
    bufferPages: true,
  });

  const filename = `LISTA DE PAGOS ${anio}.pdf`;

  const stream = res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-disposition": `attachment;filename=${filename}`,
  });

  try {
    console.log("Recibido:", req.query);

    const conceptoPago = await ConceptoPago.findOne({
      attributes: ["Denominacion", "Monto"],
      where: { Codigo: req.query.c },
    });

    const listaPagos = await Pago.findAll({
      attributes: {
        exclude: ["CodigoConceptoPago", "Observacion"],
      },
      include: [
        {
          model: Estudiante,
          include: [
            {
              model: Persona,
              attributes: ["Paterno", "Materno", "Nombres"],
            },
          ],
          attributes: {
            exclude: [
              "CreditosLlevados",
              "CreditosAprobados",
              "AnioIngreso",
              "Estado",
              "CodigoCarreraProfesional",
            ],
          },
        },
      ],
      where: {
        CodigoConceptoPago: req.query.c,
        Fecha: Sequelize.literal(`YEAR(Fecha) = ${anio}`),
      },
    });

    console.log("CCarrera:", conceptoPago);
    console.log("CCursos:", listaPagos);

    doc.on("data", (data) => {
      stream.write(data);
    });

    doc.on("end", () => {
      stream.end();
    });

    // set the header to render in every page
    doc.setDocumentHeader({ height: "15%" }, () => {
      // Agregar el logo con un tamaño más pequeño
      doc.image("public/logo-escuela.jpg", 40, 22, { width: 70 });

      // Agregar el nombre de la institución y el nombre del director
      doc
        .font("Helvetica-Bold")
        .fontSize(11)

        .text("ESCUELA SUPERIOR DE FORMACIÓN ARTÍSTICA PÚBLICA", {
          align: "center",
          lineGap: 10,
        });
      doc
        .fontSize(12)
        .text("MARIO URTEAGA ALVADADO", { align: "center", lineGap: 10 });

      doc
        .moveTo(50, 75)
        .lineTo(doc.page.width - 50, 75)
        .lineWidth(1.5)
        .stroke("#000000");

      doc.moveDown(2);

      doc.fontSize(16).text(`LISTA DE PAGOS ${anio}`, {
        align: "center",
        lineGap: 5,
      });

      doc
        .fontSize(14)
        .fillColor("blue")
        .text(
          "ConceptoPago: " + (conceptoPago?.dataValues.Denominacion ?? ""),
          {
            align: "center",
          }
        );
    });

    let pagos = [];

    if (listaPagos.length > 0) {
      pagos = listaPagos.map((pago) => ({
        NComprobante: pago.dataValues.NroTransaccion,
        Estudiante:
          pago.dataValues.Estudiante.Persona.Nombres +
          " " +
          pago.dataValues.Estudiante.Persona.Paterno +
          " " +
          pago.dataValues.Estudiante.Persona.Materno +
          " (" +
          pago.dataValues.Estudiante.CodigoSunedu +
          ")",
        Fecha: new Date(pago.dataValues.Fecha).toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        Estado: pago.dataValues.EstadoPago,
      }));
    } else {
      pagos = [
        {
          NComprobante: "",
          Estudiante: "",
          Fecha: "",
          Estado: "",
        },
      ];
    }

    doc.addTable(
      [
        { key: "NComprobante", label: "N° Transacción", align: "left" },
        { key: "Estudiante", label: "Estudiante", align: "left" },
        { key: "Fecha", label: "Fecha", align: "left" },
        { key: "Estado", label: "Estado", align: "left" },
      ],
      pagos,
      {
        border: { size: 0.1, color: "#cdcdcd" },
        width: "fill_body",
        cellsPadding: 10,
        marginLeft: 45,
        marginRight: 45,
        headColor: "#ffffff",
        headAlign: "left",
        headBackground: "#002479",
        headHeight: 20,
        cellsPadding: 5,
      }
    );

    doc.render();

    doc.end();
  } catch (error) {
    console.log('EError',error)
    doc.on("data", (data) => {
      stream.write(data);
    });

    doc.on("end", () => {
      stream.end();
    });

    doc.render();

    doc.end();
  }
};
module.exports = {
  getPagos,
  getPagosEstudiante,
  crearPago,
  anularPago,
  getConceptos,
  getPagosByStudent,
  obtenerPDFPagos,
};
