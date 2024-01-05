const { Router } = require('express');
const { login, register, refreshToken, logout } = require('../controllers/auth.controller');
const requireToken = require('../middleware/requireToken');
const requireRefreshToken = require('../middleware/requireRefreshToken');
const { bodyRegisterValidator, bodyLoginValidator } = require('../middleware/validatorManager');

const router = Router();

router.post('/register', bodyRegisterValidator, register);

router.post('/login', bodyLoginValidator, login);
router.get('/refresh', requireRefreshToken, refreshToken)
router.get('/logout', logout)

module.exports = router;