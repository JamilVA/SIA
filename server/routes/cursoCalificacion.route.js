const { Router } = require("express");
const { getCursosCalificacion, crearCursoCalificacion, habilitarIngresos, deshabilitarIngresos, eliminarCursoCalificacion, asignarDocente, habilitarIngreso, deshabilitarIngreso , getAsistentes, editarCursoCalificacion, getCursosEstudiante, contarSesiones, getMatriculados, getCarrerasByJefe, habilitarCursosPorCiclo, generarUnidades } = require("../controllers/cursoCalificacion.controller");
const requireToken = require('../middleware/requireToken');
const router = Router()

router.get('/carreras', requireToken, getCarrerasByJefe)

router.get('/', requireToken, getCursosCalificacion)

router.get('/cursos-estudiante', requireToken, getCursosEstudiante)

router.post('/', requireToken, crearCursoCalificacion)

router.post('/habilitar-ciclo', requireToken, habilitarCursosPorCiclo)

router.put('/', requireToken, editarCursoCalificacion)

router.put('/habilitar-ingresos', requireToken, habilitarIngresos)

router.put('/deshabilitar-ingresos', requireToken, deshabilitarIngresos)

router.put('/habilitar-ingreso', requireToken, habilitarIngreso)

router.put('/deshabilitar-ingreso', requireToken, deshabilitarIngreso)

router.delete('/eliminar', requireToken, eliminarCursoCalificacion)

router.put('/asignar-docente', requireToken, asignarDocente)

router.get('/asistentes', requireToken, getAsistentes)

router.get('/sesiones', requireToken, contarSesiones)

router.get('/matriculados', requireToken, getMatriculados)

router.post('/generar-unidades', requireToken, generarUnidades)

module.exports = router