const { Router } = require('express');

const {getDocente, crearDocente, actualizarDocente} = require('../controllers/docente.controller')


const router = Router();

router.get('/', getDocente);

router.post('/', crearDocente);

router.put('/', actualizarDocente);

module.exports = router;