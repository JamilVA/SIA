const { Router } = require('express');
//const { check } =  require('express-validator');
//const { validarCampos } = require('../middlewares/validar-campos');
const { crearPersona, getPersona} = require('../controllers/persona.controller');
//const { validarJWT } = require ('../middlewares/validar-jwt');

const router = Router();

router.get('/', getPersona);

router.post('/', crearPersona);


module.exports = router;