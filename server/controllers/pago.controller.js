const { response } = require("express");
const ConceptoPago = require("../models/conceptoPago.model");
const Pago = require('../models/pago.model');
const Estudiante = require("../models/estudiante.model");
const { json } = require("sequelize");

ConceptoPago.hasMany(Pago, { foreignKey: 'CodigoConceptoPago' })
Pago.belongsTo(ConceptoPago, { foreignKey: 'CodigoConceptoPago' })

Estudiante.hasMany(Pago, { foreignKey: 'CodigoEstudiante' })
Pago.belongsTo(Estudiante, { foreignKey: 'CodigoEstudiante' })

const getConceptos = async (req, res = response) => {
    try {
        const conceptos = await ConceptoPago.findAll()

        res.json({
            ok: true,
            conceptos
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error en la carga de conceptos de pago' })
    }
}

const getPagos = async (req, res = response) => {
    try {
        const pagos = await Pago.findAll({
            include: [{ all: true }]
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
    let cantidad = await Pago.count() + 1;
    let correlativo;

    if (cantidad >= 0 && cantidad < 10) {
        correlativo = "000" + cantidad
    }

    if (cantidad >= 10 && cantidad < 100) {
        correlativo = "00" + cantidad
    }

    if (cantidad >= 100 && cantidad < 1000) {
        correlativo = "0" + cantidad
    }

    if (cantidad >= 1000) {
        correlativo = cantidad.toString()
    }

    const fecha = new Date();

    return "C" + fecha.getFullYear().toString().slice(-2) + correlativo
}

const crearPago = async (req, res) => {
    try {
        const numeroComprob = (await numeroComprobante()).toString()
        const pago = await Pago.create({
            Codigo: null,
            NumeroComprobante: numeroComprob,
            EstadoPago: 'R',
            Fecha: Date.now(),
            CodigoEstudiante: req.body.CodigoEstudiante,
            CodigoConceptoPago: req.body.CodigoConceptoPago,
        })

        res.json({
            mensaje: 'El pago se ha registrado correctamente',
            pago
        })
    } catch (error) {
        console.log("Ha ocurrido un error", error)
        res.status(500).json({ error: 'Ha ocurrido un error al registrar el pago' })
    }
}

const anularPago = async (req, res) => {

    try {
        let pago = await Pago.findByPk(req.body.codigo)

        pago.EstadoPago = "A"

        pago.save()

        res.json({
            mensaje: 'El pago ha sido anulado',
            pago
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Ha ocurrido un error al anular el pago' })
    }
}


module.exports = {
    getPagos,
    crearPago,
    anularPago,
    getConceptos
}