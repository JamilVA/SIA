const { Router } = require('express');
//const { check } =  require('express-validator');
//const { validarCampos } = require('../middlewares/validar-campos');
const { getEstudiante, crearEstudiante } = require('../controllers/estudiante.controller');
//const { validarJWT } = require ('../middlewares/validar-jwt');

const router = Router();

router.get('/', getEstudiante);

router.post('/', crearEstudiante);

module.exports = router;