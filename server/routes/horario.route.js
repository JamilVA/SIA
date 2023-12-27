const { Router } = require('express');
const { buscarHorario, crearHorario, eliminarHorario, editarHorario } = require('../controllers/horario.controller');

const router = Router()

router.get('/buscar', buscarHorario)

router.post('/', crearHorario)

router.delete('/', eliminarHorario)

router.put('/', editarHorario)

module.exports = router