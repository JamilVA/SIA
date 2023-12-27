const { Router } = require("express");
const {getPagos, crearPago, anularPago, getConceptos, getPagosByStudent} = require('../controllers/pago.controller')

const router = Router();

router.get('/', getPagos);

router.post('/', crearPago);

router.put('/', anularPago);

router.get('/conceptos', getConceptos);

router.post('/estudiante', getPagosByStudent);

module.exports = router;