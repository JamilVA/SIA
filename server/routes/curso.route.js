const { Router } = require('express');
const { getCurso, crearCurso , actualizarCurso, getCursosByDP} = require('../controllers/curso.controller');

const router = Router();

router.get('/', getCurso);

router.post('/', crearCurso);

router.put('/', actualizarCurso);

router.post('/cursosdp', getCursosByDP);

module.exports = router;