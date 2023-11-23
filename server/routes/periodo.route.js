const { Router } = require("express");
const { getPeriodo, crearPeriodo } = require("../controllers/periodo.controller");

const router = Router();

router.get('/', getPeriodo);

router.post('/', crearPeriodo);

module.exports = router