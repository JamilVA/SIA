const { response } = require("express");
const ConceptoPago = require("../models/conceptoPago.model");
const Periodo = require("../models/periodo.model");
const Pago = require('../models/pago.model');
const Estudiante = require("../models/estudiante.model");

ConceptoPago.hasMany(Pago, {foreignKey: 'CodigoConceptoPago'})
Pago.belongsTo(ConceptoPago, {foreignKey: 'CodigoConceptoPago'})

Periodo.hasMany(Pago, {foreignKey: 'CodigoPeriodo'})
Pago.belongsTo(Periodo, {foreignKey: 'CodigoPeriodo'})

Estudiante.hasMany(Pago, {foreignKey: 'CodigoEstudiante'})
Pago.belongsTo(Estudiante, {foreignKey: 'CodigoEstudiante'})

const getPagos = async (req, res = response) => {
    const pagos = await Pago.findAll({
        include: [{all: true}]
    })

    res.json({
        ok: true,
        pagos
    })
}

const crearPago = async (req, res) => {
    try {
        const pago = await Pago.create({
            Codigo: null,
            NumeroComprobante: 'B00003',
            EstadoPago: 'R', 
            CodigoEstudiante: req.body.CodigoEstudiante,
            CodigoConceptoPago: req.body.CodigoConceptoPago,
            CodigoPeriodo: req.body.CodigoPeriodo
        })
    
        res.json({
            mensaje: 'El pago se ha registrado correctamente',
            pago
        })
    } catch (error) {
        console.log("Ha ocurrido un error", error)
    }
}

const actualizarPago = async (req, res) => {
    
}

const anularPago = async (req, res) => {
    
}


module.exports = {
    getPagos,
    crearPago
}