const { response } = require("express");
const { ConceptoPago, Pago, Estudiante, Persona } = require("../config/relations");

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
  try {
    const { Email } = req.query;
    let pagos = await Pago.findAll({
      include: [
        {
          model: Estudiante,
          include: [
            {
              model: Persona,
              where: { Email }
            }
          ]
        }, {
          model: ConceptoPago
        }
      ],
      where: { EstadoPago: 'R' },
      attributes: { exclude: ['Fecha', 'NumeroComprobante'] }
    });

    res.json({
      mensaje: "Pagos Encotrados",
      pagos,
    });
  } catch (error) {
    console.log(error);
  }
};

const getPagosByStudent = async (req, res) => {
  try {
    const _codStudent = req.query.codigo
    const pagos = await Pago.findAll({
      include: [{ all: true }],
      where: {
        CodigoEstudiante: req.query.codigo == undefined ? 0 : _codStudent
      }
    })

    res.json({
      ok: true,
      pagos
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error en la carga de datos' })
  }
}

async function numeroComprobante() {
  let cantidad = (await Pago.count()) + 1;
  let correlativo;

  if (cantidad >= 0 && cantidad < 10) {
    correlativo = "000" + cantidad;
  }

  if (cantidad >= 10 && cantidad < 100) {
    correlativo = "00" + cantidad;
  }

  if (cantidad >= 100 && cantidad < 1000) {
    correlativo = "0" + cantidad;
  }

  if (cantidad >= 1000) {
    correlativo = cantidad.toString();
  }

  const fecha = new Date();

  return "C" + fecha.getFullYear().toString().slice(-2) + correlativo;
}

const crearPago = async (req, res) => {
  try {
    //const numeroComprob = (await numeroComprobante()).toString();
    const data = req.body
    const pago = await Pago.create({
      Codigo: null,
      NroTransaccion: data.NroTransaccion,
      Fecha: new Date(),
      EstadoPago: "R",    
      CodigoEstudiante: data.CodigoEstudiante,
      CodigoConceptoPago: data.CodigoConceptoPago,
    });

    res.json({
      message: "El pago se ha registrado correctamente",
      pago,
    });
  } catch (error) {
    console.log("Ha ocurrido un error", error);
    if (error.name = "SequelizeUniqueConstraintError") {
      return res.status(500).json({ error: "El número de transacción proporcionado ya ha sido registrado" });
    }
    return res.status(500).json({ error: "Ha ocurrido un error al registrar el pago" });
  }
};

const anularPago = async (req, res) => {
  try {   
    await Pago.update({ EstadoPago: 'A' }, {
      where: { Codigo: req.body.codigo }
    })

    res.json({
      message: "El pago ha sido anulado correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Ha ocurrido un error al anular el pago" });
  }
};

module.exports = {
  getPagos,
  getPagosEstudiante,
  crearPago,
  anularPago,
  getConceptos,
  getPagosByStudent,
};
