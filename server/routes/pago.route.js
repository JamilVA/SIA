const { Router } = require("express");
const {getPagos, crearPago} = require('../controllers/pago.controller')

const router = Router();


router.get('/', getPagos);

router.post('/', crearPago);


module.exports = router;