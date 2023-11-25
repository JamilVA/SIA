const { Router } = require('express');

const {getJefeDepartamento, crearJefeDepartamento, actualizarJefeDepartamento , asignarCarreraProfesional} = require('../controllers/jefeDepartamento.controller')


const router = Router();

router.get('/', getJefeDepartamento);

router.post('/', crearJefeDepartamento);

router.put('/', actualizarJefeDepartamento);

router.put('/carrera', asignarCarreraProfesional);

module.exports = router;