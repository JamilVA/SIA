const { Router } = require('express');
const { getCurso, crearCurso , actualizarCurso, bajaCurso} = require('../controllers/curso.controller');

const router = Router();

router.get('/', getCurso);

router.post('/', crearCurso);

router.put('/', actualizarCurso);

router.put('/', bajaCurso);


module.exports = router;