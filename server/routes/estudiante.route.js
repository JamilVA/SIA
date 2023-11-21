const { Router } = require('express');
//const { check } =  require('express-validator');
//const { validarCampos } = require('../middlewares/validar-campos');
const { getEstudiante, crearEstudiante, actualizarEstudiante, buscarPorDNI } = require('../controllers/estudiante.controller');
//const { validarJWT } = require ('../middlewares/validar-jwt');

const router = Router();

router.get('/', getEstudiante);

router.get('/buscar', buscarPorDNI);

router.post('/', crearEstudiante);

router.put('/', actualizarEstudiante);

module.exports = router;