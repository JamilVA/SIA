const { Router } = require('express');
const { crearPersona, getPersona} = require('../controllers/persona.controller');

const router = Router();

router.get('/', getPersona);

router.post('/', crearPersona);


module.exports = router;