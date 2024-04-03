const { Router } = require('express');
const requireToken = require('../middleware/requireToken');
//const { check } =  require('express-validator');
//const { validarCampos } = require('../middlewares/validar-campos');
const { getEstudiante, crearEstudiante, actualizarEstudiante, buscarEstudiante, getNotas, getEstudianteByCodPersona, obtenerListaEstudiantes, getEstudiantesMatriculados } = require('../controllers/estudiante.controller');

const router = Router();

router.get('/', requireToken, getEstudiante);

router.post('/', requireToken, crearEstudiante);

router.put('/', requireToken, actualizarEstudiante);

router.get('/buscar', requireToken, buscarEstudiante);

router.get('/notas', requireToken, getNotas)

router.get('/getbycod', requireToken, getEstudianteByCodPersona);

router.get('/obtenerListaEstudiantes', requireToken, obtenerListaEstudiantes);

router.get('/estudiantesMatriculados', requireToken, getEstudiantesMatriculados);

//router.get('/getbycod', requireToken, getEstudianteByCod)

module.exports = router;