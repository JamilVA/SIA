const { Router } = require('express')
const { crearActividad, getActividades, eliminarActividad, actualizarActividad, actualizarRutaRecursoGuia, calificarActividad, getActividadesEstudiante } = require('../controllers/actividad.controller')

const router = Router()

router.get('/', getActividades)

router.get('/estudiante', getActividadesEstudiante)

router.post('/', crearActividad)

router.put('/', actualizarActividad)

router.put('/recurso-guia', actualizarRutaRecursoGuia)

router.delete('/', eliminarActividad)

router.put('/calificar', calificarActividad)

module.exports = router