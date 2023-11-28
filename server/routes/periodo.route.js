const { Router } = require("express");
const { getPeriodo, crearPeriodo, editarPeriodo, eliminarPeriodo, finalizarPeriodo } = require("../controllers/periodo.controller");

const router = Router();

router.get('/', getPeriodo);

router.post('/', crearPeriodo);

router.put('/', editarPeriodo);

router.delete('/', eliminarPeriodo)

router.put('/finalizar', finalizarPeriodo)

module.exports = router