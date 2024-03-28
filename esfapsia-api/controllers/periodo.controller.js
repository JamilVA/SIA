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

const getPeriodoVigente = async (req, res) => {
    try {
        const periodo = await Periodo.findOne({
            where: { Estado: true }
        })

        res.json({
            periodo: periodo
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al buscar un periodo vigente' })
    }
}

const generarCodigo = (denominacion) => {
    let semestre = denominacion.substring(5)   
    if (semestre !== "0") {
        semestre = semestre.length === 1 ? "1" : "2"
    }
    return denominacion.substring(2, 4).concat(semestre)
}

const crearPeriodo = async (req, res) => {
    try {
        const data = req.body
        const periodo = await Periodo.create({
            ...data,
            Codigo: generarCodigo(data.Denominacion),
            Estado: true
        })

        res.json({
            message: "Periodo académico creado exitosamente",
            periodo
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: 'Error al crear el periodo académico'
        })
    }

}

const editarPeriodo = async (req, res) => {

    try {
        const newData = req.body

        await Periodo.update( newData, { where: { Codigo: newData.Codigo } })

        res.json({
            message: "Datos del periodo académico editados exitosamente",          
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
    getPeriodoVigente,
    crearPeriodo,
    editarPeriodo,
    eliminarPeriodo,
    finalizarPeriodo
}