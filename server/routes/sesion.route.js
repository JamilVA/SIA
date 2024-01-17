const { Router } = require('express');

const {getSesiones, crearSesion, actualizarSesion, eliminarSesion, marcarIngresoDocente, marcarSalidaDocente} = require('../controllers/sesion.controller')

const router = Router();

router.get('/', getSesiones);

router.post('/', crearSesion);

router.put('/', actualizarSesion);

router.post('/eliminar', eliminarSesion);

router.post('/marcar-ingreso', marcarIngresoDocente);

router.post('/marcar-salida', marcarSalidaDocente);

module.exports = router;