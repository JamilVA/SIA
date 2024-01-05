const { Router } = require('express');

const {getSesiones, crearSesion, actualizarSesion, eliminarSesion} = require('../controllers/sesion.controller')

const router = Router();

router.get('/', getSesiones);

router.post('/', crearSesion);

router.put('/', actualizarSesion);

router.post('/eliminar', eliminarSesion);

module.exports = router;