const { Router } = require('express');
const requireToken = require('../middleware/requireToken');
//const { check } =  require('express-validator');
//const { validarCampos } = require('../middlewares/validar-campos');
const { getEstudiante, crearEstudiante, actualizarEstudiante, buscarEstudiante, getEstudianteByCod } = require('../controllers/estudiante.controller');

const router = Router();

router.get('/', getEstudiante);

router.post('/', crearEstudiante);

router.put('/', actualizarEstudiante);

router.get('/buscar', buscarEstudiante);

router.get('/getbycod', requireToken, getEstudianteByCod)

module.exports = router;