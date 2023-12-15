const { Router } = require('express');
const { getCurso, crearCurso , actualizarCurso, buscarCurso} = require('../controllers/curso.controller');

const router = Router();

router.get('/', getCurso);

router.post('/', crearCurso);

router.put('/', actualizarCurso);

router.get('/buscar', buscarCurso)

module.exports = router;