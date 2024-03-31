const { Router } = require('express');
const requireToken = require('../middleware/requireToken');
const {getDocente, crearDocente, actualizarDocente, actualizarFoto, getPerfilDocente} = require('../controllers/docente.controller')


const router = Router();

router.get('/', requireToken, getDocente);

router.get('/perfil', requireToken, getPerfilDocente);

router.post('/', requireToken, crearDocente);

router.put('/', requireToken, actualizarDocente);

router.put('/actualizar-foto', requireToken, actualizarFoto);

module.exports = router;