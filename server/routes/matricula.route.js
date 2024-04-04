const { Router } = require('express');
const {getMatricula, crearMatricula, actualizarMatricula, eliminarMatricula, buscarEstudiante, getMatriculaByCurso, updateNotas, obtenerConstancia, getCursosMatriculados, getCursosLlevar, guardarMatriculas, updateObs} = require('../controllers/matricula.controller')
const requireToken = require('../middleware/requireToken');
const router = Router();

router.get('/', requireToken, getMatricula);

router.get('/cursosMatriculados', requireToken, getCursosMatriculados);

router.get('/cursosLlevar', requireToken, getCursosLlevar);

router.post('/', requireToken, crearMatricula);

router.post('/guardarMatriculas', requireToken, guardarMatriculas);

router.put('/', requireToken, actualizarMatricula);

router.post('/eliminar', requireToken, eliminarMatricula);

router.get('/buscarEstudiante', requireToken, buscarEstudiante);

router.get('/obtenerConstancia', requireToken, obtenerConstancia);

router.get('/getMatriculaByCurso', requireToken, getMatriculaByCurso);

router.patch('/updateNotas', requireToken, updateNotas);

router.patch('/updateObs', requireToken, updateObs);

module.exports = router;