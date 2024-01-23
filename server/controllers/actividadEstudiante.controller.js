const Actividad = require("../models/actividad.model")
const Sesion = require("../models/sesion.model")

Sesion.hasMany(Actividad, { foreignKey: 'CodigoSesion' })
Actividad.belongsTo(Sesion, { foreignKey: 'CodigoSesion' })

const getActividades = async (req, res) => {
    try {
        const actividades = await Actividad.findAll({
            where: {
                CodigoSesion: req.query.codigoSesion
            }
        })
        res.json({ actividades })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al cargar la lista de actividades' })
    }
}

const crearActividad = async (req, res) => {
    try {
        const actividad = await Actividad.create(req.body)
        res.json({ 
            actividad: actividad,
            message: 'Actividad creada correctamente' 
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al crear la actividad' })
    }
}

const actualizarActividad = async (req, res) => {
    try {
        let newData = req.body
        await Actividad.update(newData, {
            where: { Codigo: newData.Codigo }
        })
        res.json({message: 'Actividad actualizada correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error al actualizar la actividad'})
    }
}

const actualizarRutaRecursoGuia = async (req, res) => {
    try {
        let path = req.body.ruta
        await Actividad.update({RutaRecursoGuia: path}, {
            where: { Codigo: req.query.codigo }
        })
        res.json({message: 'Ruta de archivo actualizada correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error al actualizar la ruta del archivo'})
    }
}

const eliminarActividad = async (req, res) => {
    try {
        await Actividad.destroy({
            where: { Codigo: req.query.codigo }
        })
        res.json({message: 'Actividad eliminada correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error al eliminar la actividad'})
    }
}

module.exports = {
    getActividades,
    crearActividad,
    actualizarActividad,
    eliminarActividad,
    actualizarRutaRecursoGuia
}

