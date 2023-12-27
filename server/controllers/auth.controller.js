const Usuario = require('../models/usuario.model')
const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken } = require('../utils/tokenManager');

const register = (req, res) => {
    res.json({ ok: "true" });
}

const comparePassword = function (password, candidatePassword) {
    return bcrypt.compareSync(candidatePassword, password);
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await Usuario.findOne({ where: { Email: email } });
        if (!user)
            return res.status(403).json({ error: "Usuario inexistente" });

        const respuestaPassword = comparePassword(user.Password, password);
        if (!respuestaPassword)
            return res.status(403).json({ error: "Contraseña incorrecta" });

        //GENERAR JWT
        const { token, expiresIn } = generateToken(user.Codigo);
        generateRefreshToken(user.Codigo, res);

        const nivelUsuario = user.CodigoNivelUsuario;
        const codigoPersona = user.CodigoPersona;

        res.json({ email, nivelUsuario, codigoPersona, token, expiresIn });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error de servidor" });
    }
}

const refreshToken = (req, res) => {
    try {
        const { token, expiresIn } = generateToken(req.uid);
        return res.json({ token, expiresIn });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error de servidor" });
    }
}

const logout = (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ ok: true });
}

module.exports = { login, register, refreshToken, logout };