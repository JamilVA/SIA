const { Router } = require('express');
const { crearPersona, getPersona} = require('../controllers/persona.controller');
const requireToken = require('../middleware/requireToken');
const router = Router();

router.get('/', requireToken, getPersona);

router.post('/', requireToken, crearPersona);


module.exports = router;