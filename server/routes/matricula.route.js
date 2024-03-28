const { Router } = require('express');

const {getMatricula, crearMatricula, actualizarMatricula, eliminarMatricula, buscarEstudiante, getMatriculaByCurso, updateNotas, obtenerConstancia, getCursosMatriculados, getCursosLlevar, guardarMatriculas, updateObs} = require('../controllers/matricula.controller')


const router = Router();

router.get('/', getMatricula);

router.get('/cursosMatriculados', getCursosMatriculados);

router.get('/cursosLlevar', getCursosLlevar);

router.post('/', crearMatricula);

router.post('/guardarMatriculas', guardarMatriculas);

router.put('/', actualizarMatricula);

router.post('/eliminar', eliminarMatricula);

router.get('/buscarEstudiante', buscarEstudiante);

router.get('/obtenerConstancia', obtenerConstancia);

router.get('/getMatriculaByCurso', getMatriculaByCurso);

router.patch('/updateNotas', updateNotas);

router.patch('/updateNotas', updateObs);

module.exports = router;