const {RecursoAcademico, Sesion} = require("../config/relations")

const getRecursosAcademicos = async (req, res) => {
    try {
        const recursosAcademicos = await RecursoAcademico.findAll({
            include:{model:Sesion},
            where: {
                CodigoSesion: req.query.codigoSesion
            }
        })

        const sesion = await Sesion.findOne({
            where: {
                Codigo: req.query.codigoSesion
            }
        })
        res.json({ recursosAcademicos,sesion})
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al cargar la lista de recursos académicos' })
    }
}

const crearRecursoAcademico = async (req, res) => {
    try {
        const recursoAcademico = await RecursoAcademico.create(req.body)
        res.json({ 
            recursoAcademico: recursoAcademico,
            message: 'RecursoAcademico creado correctamente' 
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al crear el recurso académico' })
    }
}

const actualizarRecursoAcademico = async (req, res) => {
    try {
        let recursoAcademico = req.body
        await RecursoAcademico.update(recursoAcademico, {
            where: { Codigo: recursoAcademico.Codigo }
        })
        res.json({message: 'Recurso Académico actualizado correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error al actualizar el recurso académico'})
    }
}

const actualizarRutaRecursoGuia = async (req, res) => {
    try {
        let path = req.body.ruta
        await RecursoAcademico.update({RutaRecursoGuia: path}, {
            where: { Codigo: req.query.codigo }
        })
        res.json({message: 'Ruta de archivo actualizada correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error al actualizar la ruta del archivo'})
    }
}

const eliminarRecursoAcademico = async (req, res) => {
    try {
        await RecursoAcademico.destroy({
            where: { Codigo: req.query.codigo }
        })
        res.json({message: 'Recurso Académico eliminado correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error al eliminar el recurso académico'})
    }
}

module.exports = {
    getRecursosAcademicos,
    crearRecursoAcademico,
    actualizarRecursoAcademico,
    eliminarRecursoAcademico,
    actualizarRutaRecursoGuia
}

