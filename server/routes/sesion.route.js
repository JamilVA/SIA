const { Router } = require('express');
const {getSesionesEstudiante, crearSesion, actualizarSesion, eliminarSesion, getSesionesDocente, marcarIngresoDocente, marcarSalidaDocente, getActividadesCalificar, deshabilitarAsistencia, habilitarAsistencia, crearSesionV2} = require('../controllers/sesion.controller')
const requireToken = require('../middleware/requireToken');
const router = Router();

router.get('/docente', requireToken, getSesionesDocente);

router.get('/estudiante', requireToken, getSesionesEstudiante);

router.post('/', requireToken, crearSesion);

router.post('/sesionv2', requireToken, crearSesionV2);

router.put('/', requireToken, actualizarSesion);

router.post('/eliminar', requireToken, eliminarSesion);

router.post('/marcar-ingreso', requireToken, marcarIngresoDocente);

router.post('/marcar-salida', requireToken, marcarSalidaDocente);

router.get('/actividades-calificar', requireToken, getActividadesCalificar)

router.put('/habilitar-asistencia', requireToken, habilitarAsistencia)

router.put('/deshabilitar-asistencia', requireToken, deshabilitarAsistencia)

module.exports = router;