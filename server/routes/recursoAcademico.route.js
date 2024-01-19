const { Router } = require('express')
const { getRecursosAcademicos, crearRecursoAcademico, actualizarRecursoAcademico, actualizarRutaRecursoGuia, eliminarRecursoAcademico } = require('../controllers/recursoAcademico.controller')

const router = Router()

router.get('/', getRecursosAcademicos)

router.post('/', crearRecursoAcademico)

router.put('/', actualizarRecursoAcademico)

router.put('/recurso-guia', actualizarRutaRecursoGuia)

router.delete('/', eliminarRecursoAcademico)

module.exports = router