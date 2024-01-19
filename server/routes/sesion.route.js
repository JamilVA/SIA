const { Router } = require('express');

const {getSesionesEstudiante, crearSesion, actualizarSesion, eliminarSesion, getSesionesDocente, marcarIngresoDocente, marcarSalidaDocente} = require('../controllers/sesion.controller')

const router = Router();

router.get('/docente', getSesionesDocente);

router.get('/estudiante', getSesionesEstudiante);

router.post('/', crearSesion);

router.put('/', actualizarSesion);

router.post('/eliminar', eliminarSesion);

router.post('/marcar-ingreso', marcarIngresoDocente);

router.post('/marcar-salida', marcarSalidaDocente);

module.exports = router;