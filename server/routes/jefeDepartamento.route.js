const { Router } = require('express');

const {getJefeDepartamento, crearJefeDepartamento, actualizarJefeDepartamento , asignarCarreraProfesional, asignarDocente} = require('../controllers/jefeDepartamento.controller')


const router = Router();

router.get('/', requireToken, getJefeDepartamento);

router.post('/', requireToken, crearJefeDepartamento);

router.put('/', requireToken, actualizarJefeDepartamento);

router.put('/carrera', requireToken, asignarCarreraProfesional);

router.put('/asignarDocente', requireToken, asignarDocente);

module.exports = router;