const { Router } = require("express");
const {getPagos, crearPago, anularPago, getConceptos} = require('../controllers/pago.controller')

const router = Router();

router.get('/', getPagos);

router.post('/', crearPago);

router.put('/', anularPago);

router.get('/conceptos', getConceptos);

module.exports = router;