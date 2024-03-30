const { Router } = require('express');
const { buscarHorario, crearHorario, eliminarHorario, editarHorario, getHorariosGenerales, getHorarioByStudent, getHorarioByDocente } = require('../controllers/horario.controller');
const requireToken = require('../middleware/requireToken');
const router = Router()

router.get('/buscar', requireToken, buscarHorario)

router.post('/', requireToken, crearHorario)

router.delete('/', requireToken, eliminarHorario)

router.put('/', requireToken, editarHorario)

router.get('/generales', requireToken, getHorariosGenerales)

router.get('/estudiante', requireToken, getHorarioByStudent)

router.get('/docente', requireToken, getHorarioByDocente)

module.exports = router