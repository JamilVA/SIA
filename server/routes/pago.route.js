const { Router } = require("express");
const {getPagos, crearPago, anularPago, getConceptos, getPagosByStudent, getPagosEstudiante} = require('../controllers/pago.controller')

const router = Router();

router.get('/', getPagos);

router.post('/', crearPago);

router.put('/', anularPago);

router.get('/conceptos', getConceptos);

router.post('/estudiante', getPagosByStudent);

router.get('/pagosEstudiante', getPagosEstudiante);

module.exports = router;