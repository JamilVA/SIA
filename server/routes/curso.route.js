const { Router } = require('express');
const { getCurso, crearCurso , actualizarCurso} = require('../controllers/curso.controller');

const router = Router();

router.get('/', getCurso);

router.post('/', crearCurso);

router.put('/', actualizarCurso);


module.exports = router;