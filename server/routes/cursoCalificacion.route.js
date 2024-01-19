const { Router } = require("express");
const { getCursosCalificacion, crearCursoCalificacion, habilitarIngresos, deshabilitarIngresos, eliminarCursoCalificacion, asignarDocente, habilitarIngreso, deshabilitarIngreso , getMatriculados, editarCursoCalificacion, getCursosEstudiante } = require("../controllers/cursoCalificacion.controller");

const router = Router()

router.get('/', getCursosCalificacion)

router.get('/cursos-estudiante', getCursosEstudiante)

router.post('/', crearCursoCalificacion)

router.put('/', editarCursoCalificacion)

router.put('/habilitar-ingresos', habilitarIngresos)

router.put('/deshabilitar-ingresos', deshabilitarIngresos)

router.put('/habilitar-ingreso', habilitarIngreso)

router.put('/deshabilitar-ingreso', deshabilitarIngreso)

router.delete('/eliminar', eliminarCursoCalificacion)

router.put('/asignar-docente', asignarDocente)

router.get('/matriculados', getMatriculados)

module.exports = router