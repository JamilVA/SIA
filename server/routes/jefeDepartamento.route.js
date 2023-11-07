const { Router } = require('express');

const {getJefeDepartamento, crearJefeDepartamento, actualizarJefeDepartamento} = require('../controllers/jefeDepartamento.controller')


const router = Router();

router.get('/', getJefeDepartamento);

router.post('/', crearJefeDepartamento);

router.put('/', actualizarJefeDepartamento);

module.exports = router;