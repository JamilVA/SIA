const Actividad = require("../models/actividad.model")
const Matricula = require("../models/matricula.model")
const ActividadEstudiante = require("../models/actividadEstudiante.model")

Actividad.hasMany(ActividadEstudiante, { foreignKey: 'CodigoActividad' })
ActividadEstudiante.belongsTo(Actividad, { foreignKey: 'CodigoActividad' })

Matricula.hasMany(ActividadEstudiante, { foreignKey: 'CodigoEstudiante' })
ActividadEstudiante.belongsTo(Matricula, { foreignKey: 'CodigoEstudiante' })

const getRecursoSubido = async (req, res) => {
    try {
        console.log(req.query)
        const actividadEstudiante = await ActividadEstudiante.findOne({
            where: {
                CodigoEstudiante: req.query.codigoEstudiante,
                CodigoActividad: req.query.codigoActividad,
            },
            attributes: {exclude:['id']}
            
        })
        res.json({ actividadEstudiante })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al cargar el recurso subido' })
    }
}

const crearActividadEstudiante = async (req, res) => {
    try {
        const actividad = await ActividadEstudiante.create(req.body)
        res.json({ 
            actividad: actividad,
            message: 'ActividadEstudiante creada correctamente' 
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al crear la actividad' })
    }
}

const actualizarActividadEstudiante = async (req, res) => {
    try {
        let newData = req.body
        await ActividadEstudiante.update(newData, {
            where: { Codigo: newData.Codigo }
        })
        res.json({message: 'ActividadEstudiante actualizada correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error al actualizar la actividad'})
    }
}

const actualizarRutaRecursoGuia = async (req, res) => {
    try {
        let path = req.body.ruta
        await ActividadEstudiante.update({RutaRecursoGuia: path}, {
            where: { Codigo: req.query.codigo }
        })
        res.json({message: 'Ruta de archivo actualizada correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error al actualizar la ruta del archivo'})
    }
}

const eliminarActividadEstudiante = async (req, res) => {
    try {
        await ActividadEstudiante.destroy({
            where: { Codigo: req.query.codigo }
        })
        res.json({message: 'ActividadEstudiante eliminada correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error al eliminar la actividad'})
    }
}

module.exports = {
    getRecursoSubido,
    crearActividadEstudiante,
    actualizarActividadEstudiante,
    eliminarActividadEstudiante,
    actualizarRutaRecursoGuia
}

