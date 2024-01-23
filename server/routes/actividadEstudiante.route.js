const { Router } = require('express')
const { getRecursoSubido, crearActividadEstudiante, actualizarActividadEstudiante, eliminarActividadEstudiante, actualizarRutaRecursoGuia } = require('../controllers/actividadEstudiante.controller')

const router = Router()

router.get('/', getRecursoSubido)

router.post('/', crearActividadEstudiante)

router.put('/', actualizarActividadEstudiante)

router.put('/recurso-guia', actualizarRutaRecursoGuia)

router.delete('/', eliminarActividadEstudiante)

module.exports = router