const { response } = require('express')
const Periodo = require('../models/periodo.model')

const getPeriodo = async (req, res) => {
    const periodos = await Periodo.findAll({
        order: [['Codigo', 'desc']]
    })

    res.json({
        mensaje: 'ok',
        periodos
    })
}

const crearPeriodo = async (req, res) => {

    try {
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
            mensaje: "Periodo creado exitosamente",
            periodo
        })

    } catch (error) {
        res.json({
            error: 'error'
        })
        console.log(error)
    }

}

const editarPeriodo = async (req, res) => {

    const periodo = await Periodo.findByPk(req.body.codigo)

    periodo.Denominacion = req.body.denominacion,
        periodo.FechaInicio = req.body.fechaInicio,
        periodo.FechaFin = req.body.fechaFin,
        periodo.InicioMatricula = req.body.inicioMatricula,
        periodo.FinMatricula = req.body.finMatricula,

        await periodo.save()

    res.json({
        mensaje: "Periodo editado exitosamente",
        periodo
    })
}

const eliminarPeriodo = async (req, res) => {
    await Periodo.destroy({
        where: {
            Codigo: req.query.codigo
        }
    })
        .then(() => {
            res.json({
                mensaje: "Periodo eliminado correctamente",
                codigo: req.query.codigo
            })
        })
        .catch(error => {
            console.log(error)
        })
}

const finalizarPeriodo = async (req, res) => {
    try {
        console.log("Código finalizado", req.query.codigo)
        await Periodo.update({
            Estado: false
        }, {
            where: {
                Codigo: req.query.codigo
            }
        })
        res.json({
            mensaje: "Periodo finalizado exitosamente",
            codigo: req.query.codigo
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getPeriodo,
    crearPeriodo,
    editarPeriodo,
    eliminarPeriodo,
    finalizarPeriodo
}