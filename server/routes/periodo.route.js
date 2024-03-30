const { Router } = require("express");
const { getPeriodo, crearPeriodo, editarPeriodo, eliminarPeriodo, finalizarPeriodo, getPeriodoVigente } = require("../controllers/periodo.controller");
const requireToken = require('../middleware/requireToken');
const router = Router();

router.get('/', requireToken, getPeriodo);

router.get('/vigente', requireToken, getPeriodoVigente);

router.post('/', requireToken, crearPeriodo);

router.put('/', requireToken, editarPeriodo);

router.delete('/', requireToken, eliminarPeriodo)

router.put('/finalizar', requireToken, finalizarPeriodo)

module.exports = router