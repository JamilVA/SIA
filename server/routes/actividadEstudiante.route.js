const { Router } = require('express')
const { getRecursoSubido, crearActividadEstudiante, actualizarActividadEstudiante, eliminarActividadEstudiante, actualizarRutaRecursoGuia, actualizarRutaTarea } = require('../controllers/actividadEstudiante.controller')
const requireToken = require('../middleware/requireToken');
const router = Router()

router.get('/', requireToken, getRecursoSubido)

router.post('/', requireToken, crearActividadEstudiante)

router.put('/', requireToken, actualizarActividadEstudiante)

router.put('/tarea', requireToken, actualizarRutaTarea)

router.delete('/', requireToken, eliminarActividadEstudiante)

module.exports = router