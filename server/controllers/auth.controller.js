const { JefeDepartamento, Docente, Estudiante, Persona, Usuario } = require("../config/relations");
const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken } = require('../utils/tokenManager');

const register = (req, res) => {
    res.json({ ok: "true" });
}

const comparePassword = function (password, candidatePassword) {
    return bcrypt.compareSync(candidatePassword, password);
}

const hash = (password) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    return hashPassword;
  } catch (error) {
    console.log(error);
  }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await Usuario.findOne({ where: { Email: email } });
        if (!user)
            return res.status(403).json({ error: "Usuario y/o contraseña incorrectos" });

        const respuestaPassword = comparePassword(user.Password, password);
        if (!respuestaPassword)
            return res.status(403).json({ error: "Usuario y/o contraseña incorrectos" });

        //GENERAR JWT
        const { token, expiresIn } = generateToken(user.Codigo);
        generateRefreshToken(user.Codigo, res);

        const nivelUsuario = user.CodigoNivelUsuario;
        let codigoPersona = user.CodigoPersona;
        let codigoDocente = 0;
        let codigoEstudiante = 0;
        let codigoJefe = 0;

        if (nivelUsuario == 2) {
            let _jefe = await JefeDepartamento.findOne({ where: { CodigoPersona: user.CodigoPersona } });
            let _docente = await Docente.findOne({ where: { CodigoPersona: user.CodigoPersona } });
            codigoJefe = _jefe.Codigo;
            codigoDocente = _docente.Codigo;
        } else if (nivelUsuario == 3) {
            let _docente = await Docente.findOne({ where: { CodigoPersona: user.CodigoPersona } });
            codigoDocente = _docente.Codigo;
        } else if (nivelUsuario == 4) {
            let _estudiante = await Estudiante.findOne({ where: { CodigoPersona: user.CodigoPersona } });
            codigoEstudiante = _estudiante.Codigo;
        }

        res.json({ email, nivelUsuario, codigoPersona, codigoDocente, codigoJefe, codigoEstudiante, token, expiresIn });

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

const changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        let user = await Usuario.findOne({ where: { Email: email } });

        if (!user)
            return res.status(403).json({ error: "Usuario inexistente" });

        const respuestaPassword = comparePassword(user.Password, oldPassword);

        if (!respuestaPassword)
            return res.status(403).json({ error: "Contraseña incorrecta" });

        await user.update(
            {
                Password: hash(newPassword)
            },
            {
                where: {
                    Email: email,
                }
            }
        )
        res.json({ ok: true, 'message': 'Password updated successfull' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error de servidor" });
    }
}

module.exports = { login, register, refreshToken, logout, changePassword };