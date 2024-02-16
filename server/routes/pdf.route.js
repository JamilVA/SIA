const { Router } = require('express')
const { getPDFMatriculados } = require('../controllers/pdf.controller')

const router = Router()

router.get('/lista-matriculados', getPDFMatriculados)

module.exports = router