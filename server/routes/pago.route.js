const { Router } = require("express");
const {getPagos, crearPago, anularPago, getConceptos, getPagosByStudent, getPagosEstudiante, obtenerPDFPagos} = require('../controllers/pago.controller')
const requireToken = require('../middleware/requireToken');
const router = Router();

router.get('/', requireToken, getPagos);

router.post('/', requireToken, crearPago);

router.put('/', requireToken, anularPago);

router.get('/conceptos', requireToken, getConceptos);

router.get('/estudiante', requireToken, getPagosByStudent);

router.get('/pagosEstudiante', requireToken, getPagosEstudiante);

router.get('/listaPagos', requireToken, obtenerPDFPagos);

module.exports = router;