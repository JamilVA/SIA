const { response } = require('express')
const Periodo = require('../models/periodo.model')

const getPeriodo = async (req, res) => {
    const periodos = await Periodo.findAll()

    res.json({
        mensaje: 'ok',
        periodos
    })
}

const crearPeriodo = async (req, res) => {

    const periodo = await Periodo.create({
        Codigo: req.body.codigo,
        Denominacion: req.body.denominacion,
        FechaInicio: req.body.fechaInicio,
        FechaFin: req.body.fechaFin,
        InicioMatricula: req.body.inicioMatricula,
        FinMatricula: req.body.finMatricula,
        Estado: 1
    })

    res.json({
        mensaje: "Perido creado exitosamente",
        periodo
    })
}

module.exports = {
    getPeriodo,
    crearPeriodo
}