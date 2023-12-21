const { Router } = require('express');

const {getMatricula, crearMatricula, actualizarMatricula, eliminarMatricula, buscarEstudiante} = require('../controllers/matricula.controller')


const router = Router();

router.get('/', getMatricula);

router.post('/', crearMatricula);

router.put('/', actualizarMatricula);

router.post('/eliminar', eliminarMatricula);

router.get('/buscarEstudiante', buscarEstudiante);

module.exports = router;