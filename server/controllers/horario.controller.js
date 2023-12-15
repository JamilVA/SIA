const Horario = require('../models/horario.model')
const CursoCalificacion = require('../models/cursoCalificacion.model')

CursoCalificacion.hasMany(Horario, {foreignKey: 'CodigoCursoCalificacion'})
Horario.belongsTo(CursoCalificacion, {foreignKey: 'CodigoCursoCalificacion'})

const crearHorario = async (req, res) => {
    try {
        const horario = await Horario.create(req.body)
        res.json({
            message: 'Día asignado correctamente',
            horario
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Ha ocurrido un error al asignar el horario' })
    }
}

const editarHorario = async (req, res) => {
    try {
        let campos = req.body
        await Horario.update(campos, {
            where: {            
                Codigo: req.query.codigo
            }
        })
        res.json({message: 'El horario se ha actualizado correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Ha ocurrido un error al actualizar'})
    }
}

const eliminarHorario = async (req, res) => {
    try {
        await Horario.destroy({
            where: {
                Codigo: req.query.codigo
            }
        })
        res.json({message: 'Horario eliminado correctamente'})
    } catch (error) {
        console.error(error)
        res.json({error: 'Error al eliminar el horario'})
    }
}

const buscarHorario = async (req, res) => {
    try {
        const horarios = await Horario.findAll({
            where: {
                CodigoCursoCalificacion: req.query.codigo
            }
        })
        res.json({ horarios })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al buscar horario' })
    }
}

module.exports = {
    crearHorario,
    editarHorario,
    eliminarHorario,
    buscarHorario
}