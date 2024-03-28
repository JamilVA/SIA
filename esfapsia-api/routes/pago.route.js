const { Router } = require("express");
const {getPagos, crearPago, anularPago, getConceptos, getPagosByStudent, getPagosEstudiante, obtenerPDFPagos} = require('../controllers/pago.controller')

const router = Router();

router.get('/', getPagos);

router.post('/', crearPago);

router.put('/', anularPago);

router.get('/conceptos', getConceptos);

router.get('/estudiante', getPagosByStudent);

router.get('/pagosEstudiante', getPagosEstudiante);

router.get('/listaPagos', obtenerPDFPagos);

module.exports = router;