const { Router } = require('express')
const { subir, descargar } = require('../controllers/files.controller')

const router = Router()

router.use('/download', descargar)

router.post('/upload', subir)

module.exports = router