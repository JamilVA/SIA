const { Router } = require('express');

const {getSesionesEstudiante, crearSesion, actualizarSesion, eliminarSesion, getSesionesDocente, marcarIngresoDocente, marcarSalidaDocente, getActividadesCalificar, deshabilitarAsistencia, habilitarAsistencia, crearSesionV2} = require('../controllers/sesion.controller')

const router = Router();

router.get('/docente', getSesionesDocente);

router.get('/estudiante', getSesionesEstudiante);

router.post('/', crearSesion);

router.post('/sesionv2', crearSesionV2);

router.put('/', actualizarSesion);

router.post('/eliminar', eliminarSesion);

router.post('/marcar-ingreso', marcarIngresoDocente);

router.post('/marcar-salida', marcarSalidaDocente);

router.get('/actividades-calificar', getActividadesCalificar)

router.put('/habilitar-asistencia', habilitarAsistencia)

router.put('/deshabilitar-asistencia', deshabilitarAsistencia)

module.exports = router;