const { Router } = require("express")
const { crearUsuario, getUsuarios, getNivelesUsuario, eliminarUsuario, editarUsuario, inhabilitarUsuario, getAllUsuarios } = require("../controllers/usuario.controller")
const requireToken = require('../middleware/requireToken');
const router = Router()

router.post('/', requireToken, crearUsuario)

router.get('/', requireToken, getUsuarios)

router.get('/all', requireToken, getAllUsuarios)

router.get('/niveles', requireToken, getNivelesUsuario)

router.delete('/', requireToken, eliminarUsuario)

router.put('/', requireToken, editarUsuario)

router.put('/inhabilitar', requireToken, inhabilitarUsuario)

module.exports = router