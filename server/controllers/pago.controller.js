const { response } = require("express");
const {
  ConceptoPago,
  Pago,
  Estudiante,
  Persona,
} = require("../config/relations");

const PDF = require("pdfkit-table");
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


const setHeader = (doc, conceptoPago, anio) => {

  doc.image("public/logo-escuela.jpg", 40, 15, { width: 80 });
  doc.image("public/logo-sunedu.png", doc.page.width - 40 - 80, 15, {
    width: 80,
  });

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("ESCUELA SUPERIOR DE FORMACIÓN ARTÍSTICA PÚBLICA", 0, 20, {
      align: "center",
      lineGap: 10,
    });
  doc
    .fontSize(12)
    .text("MARIO URTEAGA ALVARADO", { align: "center", lineGap: 20 });

    doc.fontSize(10).text(`LISTA DE PAGOS ${anio}`, {
      align: "center",
      lineGap: 5,
    });

    doc
      .fontSize(8)
      .fillColor("blue")
      .text(
        "CONCEPTO: " + (conceptoPago?.dataValues.Denominacion ?? "") + '('+ (conceptoPago?.dataValues.Codigo ?? "") + ')',
        {
          align: "center",
        }
      );

  doc
    .moveTo(30, 70)
    .lineTo(doc.page.width - 30, 70)
    .lineWidth(1.5)
    .stroke("#000000");

  doc.fillColor("black");
};

const obtenerPDFPagos = async (req, res) => {

  try {

    anio = new Date(req.query.a).getFullYear();

    const conceptoPago = await ConceptoPago.findOne({
      attributes: ['Codigo',"Denominacion", "Monto"],
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

    const doc = new PDF({
      size: "A4",
      margins: { top: 20, left: 10, right: 10, bottom: 20 },
      autoFirstPage: false,
      bufferPages: true,
    });

    doc.on("pageAdded", () => {
      setHeader(doc, conceptoPago, anio);
      doc.page.margins = { top: 120, left: 10, right: 10, bottom: 20 };

    });

    doc.addPage();

    const table = {
      headers: [
        { key: "NComprobante", label: "N° TRANSACCIÓN", align: "left", width: 100 },
        { key: "Estudiante", label: "ESTUDIANTE", align: "left", width: 300 },
        { key: "Fecha", label: "FECHA", align: "left", width: 80 },
        { key: "Estado", label: "ESTADO", align: "left", width: 50 },

      ],
      rows: pagos.map((curso) => Object.values(curso)),
      options: {
        x: 30,
        divider: {
          header: { disabled: true },
          horizontal: { disabled: false },
        },
      },
    };

    doc.moveDown(1);

    doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Helvetica").fontSize(8);
      },
    });

    doc.pipe(res);

    doc.end();
  } catch (error) {
    console.error("Error al generar la lista de cursos:", error);
    res.status(500).send("Error al generar la lista de cursos");
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
