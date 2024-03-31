const { Router } = require('express');
const { getActas, crearActa, getActasByEstudiante} = require('../controllers/acta.controller');
const requireToken = require('../middleware/requireToken');

const router = Router()

router.get('/', requireToken, getActas)

router.get('/estudiante', requireToken, getActasByEstudiante)

router.post('/', requireToken, crearActa)

module.exports = router