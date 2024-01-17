const { Router } = require('express')
const { desmarcarAsistencia, generarAsistencias, marcarAsistencia } = require('../controllers/asistencia.controller')

const router = Router()

router.post('/generar', generarAsistencias)

router.post('/marcar', marcarAsistencia),

router.delete('/desmarcar', desmarcarAsistencia)

module.exports = router