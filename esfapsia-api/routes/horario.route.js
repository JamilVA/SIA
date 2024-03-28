const { Router } = require('express');
const { buscarHorario, crearHorario, eliminarHorario, editarHorario, getHorariosGenerales, getHorarioByStudent, getHorarioByDocente } = require('../controllers/horario.controller');

const router = Router()

router.get('/buscar', buscarHorario)

router.post('/', crearHorario)

router.delete('/', eliminarHorario)

router.put('/', editarHorario)

router.get('/generales', getHorariosGenerales)

router.get('/estudiante', getHorarioByStudent)

router.get('/docente', getHorarioByDocente)

module.exports = router