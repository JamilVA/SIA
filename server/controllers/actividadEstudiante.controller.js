const {Actividad, ActividadEstudiante} = require("../config/relations")

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
    console.log(req.body)
    try {
        const actividadE = await ActividadEstudiante.findOne({
            where: { CodigoActividad: req.body.CodigoActividad, CodigoEstudiante: req.body.CodigoEstudiante }
        })

        let actividadEstudiante

        if(!actividadE){
            actividadEstudiante = await ActividadEstudiante.create(req.body)
        }else{
            actividadE.RutaTarea = req.body.RutaTarea
            actividadEstudiante = actividadE.save()
        }

        res.json({ 
            actividad: actividadEstudiante,
            message: 'Tarea subida correctamente' 
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al subir la tarea' })
    }
}

const actualizarActividadEstudiante = async (req, res) => {
    try {
        let newData = req.body
        await ActividadEstudiante.update(newData, {
            where: {
                CodigoEstudiante: newData.codigoEstudiante,
                CodigoActividad: newData.codigoActividad,
            },
        })
        res.json({message: 'Tarea actualizada correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error al actualizar la tarea'})
    }
}

const actualizarRutaTarea = async (req, res) => {
    try {
        console.error('1Ruta:',req.body)
        let path = req.body.RutaTarea
        await ActividadEstudiante.update({RutaTarea: path}, {
            where: {
                CodigoEstudiante: req.body.CodigoEstudiante,
                CodigoActividad: req.body.CodigoActividad,
            },
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
        res.json({message: 'Tarea eliminada correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error al eliminar la tarea'})
    }
}

module.exports = {
    getRecursoSubido,
    crearActividadEstudiante,
    actualizarActividadEstudiante,
    eliminarActividadEstudiante,
    actualizarRutaTarea
}

