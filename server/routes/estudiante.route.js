const { Router } = require('express');
const requireToken = require('../middleware/requireToken');
//const { check } =  require('express-validator');
//const { validarCampos } = require('../middlewares/validar-campos');
const { getEstudiante, crearEstudiante, actualizarEstudiante, buscarEstudiante, getNotas, getEstudianteByCodPersona, obtenerListaEstudiantes, getEstudiantesMatriculados, getEstudiantesMatriculadosCurso, getHistorialByDNI, actualizarDatosPersonales } = require('../controllers/estudiante.controller');

const router = Router();

router.get('/', requireToken, getEstudiante);

router.post('/', requireToken, crearEstudiante);

router.put('/', requireToken, actualizarEstudiante);

router.patch('/upDatosPersonales', requireToken, actualizarDatosPersonales);

router.get('/buscar', requireToken, buscarEstudiante);

router.get('/notas', requireToken, getNotas)

router.get('/getbycod', requireToken, getEstudianteByCodPersona);

router.get('/obtenerListaEstudiantes', requireToken, obtenerListaEstudiantes);

router.get('/estudiantesMatriculados', requireToken, getEstudiantesMatriculados);

router.get('/estudiantesMatriculadosCurso', requireToken, getEstudiantesMatriculadosCurso);

router.get('/buscar-historial-dni', requireToken, getHistorialByDNI)

//router.get('/getbycod', requireToken, getEstudianteByCod)

module.exports = router;