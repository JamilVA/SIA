const { Router } = require('express');
const { getActas, crearActa, getActasByEstudiante} = require('../controllers/acta.controller');

const router = Router()

router.get('/', getActas)

router.get('/estudiante', getActasByEstudiante)

router.post('/', crearActa)

module.exports = router