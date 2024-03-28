const { Router } = require('express')
const { getRecursoSubido, crearActividadEstudiante, actualizarActividadEstudiante, eliminarActividadEstudiante, actualizarRutaRecursoGuia, actualizarRutaTarea } = require('../controllers/actividadEstudiante.controller')

const router = Router()

router.get('/', getRecursoSubido)

router.post('/', crearActividadEstudiante)

router.put('/', actualizarActividadEstudiante)

router.put('/tarea', actualizarRutaTarea)

router.delete('/', eliminarActividadEstudiante)

module.exports = router