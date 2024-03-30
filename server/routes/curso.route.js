const { Router } = require('express');
const { getCurso, crearCurso , actualizarCurso, buscarCurso, getCursosByDP, obtenerListaCursos} = require('../controllers/curso.controller');

const router = Router();

router.get('/', requireToken, getCurso);

router.post('/', requireToken, crearCurso);

router.put('/', requireToken, actualizarCurso);

router.get('/buscar', requireToken, buscarCurso)

router.get('/obtenerListaCursos', requireToken, obtenerListaCursos)

router.get('/cursosdp', requireToken, getCursosByDP);

module.exports = router;