const { Router } = require("express");
const {getPagos, crearPago, anularPago} = require('../controllers/pago.controller')

const router = Router();


router.get('/', getPagos);

router.post('/', crearPago);

router.put('/', anularPago);

module.exports = router;