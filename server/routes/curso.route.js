const { Router } = require('express');
const { getCurso, crearCurso , actualizarCurso, buscarCurso, getCursosByDP, obtenerListaCursos} = require('../controllers/curso.controller');

const router = Router();

router.get('/', getCurso);

router.post('/', crearCurso);

router.put('/', actualizarCurso);

router.get('/buscar', buscarCurso)

router.get('/obtenerListaCursos', obtenerListaCursos)

router.get('/cursosdp', getCursosByDP);

module.exports = router;