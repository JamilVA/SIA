const { Router } = require('express')
const { getPDFMatriculados, getPDFAsistencia, getPDFActa, getPDFHistorialNotas } = require('../controllers/pdf.controller')

const router = Router()

router.get('/lista-matriculados', getPDFMatriculados)

router.get('/lista-asistencia', getPDFAsistencia)

router.get('/acta', getPDFActa)

router.get('/historial-notas', getPDFHistorialNotas)

module.exports = router