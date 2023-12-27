const { validationResult, body } = require("express-validator");

const validationResultExpress = (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    next();
}

const bodyRegisterValidator = [
    body("email", "Formato de email incorrecto").trim().isEmail().normalizeEmail(),
    body("password", "formato de password incorrecto").isLength({ min: 6 }),
    validationResultExpress
]

const bodyLoginValidator = [
    body("email", "Formato de email incorrecto").trim().isEmail().normalizeEmail(),
    body("password", "formato de password incorrecto").isLength({ min: 6 }),
    validationResultExpress
]

module.exports = { bodyRegisterValidator, bodyLoginValidator }