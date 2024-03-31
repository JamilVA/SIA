const { Router } = require('express')
const { crearActividad, getActividades, eliminarActividad, actualizarActividad, actualizarRutaRecursoGuia, calificarActividad, getActividadesEstudiante } = require('../controllers/actividad.controller')
const requireToken = require('../middleware/requireToken');

const router = Router()

router.get('/', requireToken, getActividades)

router.get('/estudiante', requireToken, getActividadesEstudiante)

router.post('/', requireToken, crearActividad)

router.put('/', requireToken, actualizarActividad)

router.put('/recurso-guia', requireToken, actualizarRutaRecursoGuia)

router.delete('/', requireToken, eliminarActividad)

router.put('/calificar', requireToken, calificarActividad)

module.exports = router