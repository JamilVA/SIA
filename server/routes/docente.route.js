const { Router } = require('express');

const {getDocente, crearDocente, actualizarDocente, actualizarFoto, getPerfilDocente} = require('../controllers/docente.controller')


const router = Router();

router.get('/', getDocente);

router.get('/perfil', getPerfilDocente);

router.post('/', crearDocente);

router.put('/', actualizarDocente);

router.put('/actualizar-foto', actualizarFoto);

module.exports = router;