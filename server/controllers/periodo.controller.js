const { Periodo } = require('../config/relations')

const getPeriodo = async (req, res) => {
    try {
        const periodos = await Periodo.findAll({
            order: [['Codigo', 'desc']]
        })

        res.json({
            mensaje: 'ok',
            periodos
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error en la carga de datos' })
    }
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
            message: "Periodo académico creado exitosamente",
            periodo
        })

    } catch (error) {
        console.log(error)
        res.json({
            error: 'Error al crear el periodo académico'
        })
    }

}

const editarPeriodo = async (req, res) => {

    try {
        const periodo = await Periodo.findByPk(req.body.codigo)

        periodo.Denominacion = req.body.denominacion,
            periodo.FechaInicio = req.body.fechaInicio,
            periodo.FechaFin = req.body.fechaFin,
            periodo.InicioMatricula = req.body.inicioMatricula,
            periodo.FinMatricula = req.body.finMatricula,

            await periodo.save()

        res.json({
            message: "Datos del periodo académico editados exitosamente",
            periodo
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al editar los datos del perido académico' })
    }
}

const eliminarPeriodo = async (req, res) => {
    await Periodo.destroy({
        where: {
            Codigo: req.query.codigo
        }
    })
        .then(() => {
            res.json({
                message: "Periodo eliminado correctamente",
                codigo: req.query.codigo
            })
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({ error: 'Ha ocurrido un error al eliminar el perido académico' })
        })
}

const finalizarPeriodo = async (req, res) => {
    try {
        await Periodo.update({
            Estado: false
        }, {
            where: {
                Codigo: req.query.codigo
            }
        })
        res.json({
            message: "Periodo finalizado exitosamente",
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