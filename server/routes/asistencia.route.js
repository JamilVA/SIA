const { Router } = require('express')
const { desmarcarAsistencia, generarAsistencias, marcarAsistencia } = require('../controllers/asistencia.controller')
const requireToken = require('../middleware/requireToken');
const router = Router()

router.post('/generar', requireToken, generarAsistencias)

router.post('/marcar', requireToken, marcarAsistencia),

router.delete('/desmarcar', requireToken, desmarcarAsistencia)

router.post('/marcar-todo', requireToken, generarAsistencias)

module.exports = router