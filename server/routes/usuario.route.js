const { Router } = require("express")
const { crearUsuario, getUsuarios, getNivelesUsuario, eliminarUsuario, editarUsuario, inhabilitarUsuario, getAllUsuarios } = require("../controllers/usuario.controller")

const router = Router()

router.post('/', crearUsuario)

router.get('/', getUsuarios)

router.get('/all', getAllUsuarios)

router.get('/niveles', getNivelesUsuario)

router.delete('/', eliminarUsuario)

router.put('/', editarUsuario)

router.put('/inhabilitar', inhabilitarUsuario)

module.exports = router