const { Op } = require("sequelize")
const { Usuario, Persona, NivelUsuario } = require("../config/relations")
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");

const getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            include: [Persona, NivelUsuario],
            where: {
                '$NivelUsuario.Nombre$': {
                    [Op.or]: ["Administrador", "Tesoreria"]
                }
            }
        })
        res.json({ usuarios: usuarios })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al cargar los usuarios' })
    }
}

const getNivelesUsuario = async (req, res) => {
    try {
        const niveles = await NivelUsuario.findAll({
            where: {
                'Nombre': {
                    [Op.or]: ["Administrador", "Tesoreria"]
                }
            }
        })
        res.json({ niveles: niveles })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al cargar los niveles de usuario' })
    }
}

const crearUsuario = async (req, res) => {
    try {

        await sequelize.transaction(async (t) => {
            const persona = await Persona.create(req.body.Persona, { transaction: t });

            await Usuario.create(
                {
                    Estado: true,
                    CodigoPersona: persona.Codigo,
                    CodigoNivelUsuario: req.body.NivelUsuario.Codigo,
                    Email: req.body.Email,
                    Password: hash(req.body.Persona.DNI)
                },
                { transaction: t }
            );
        })

        res.json({ message: 'Usuario creado correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al crear el usuario' })
    }
}

const editarUsuario = async (req, res) => {
    try {
        await sequelize.transaction(async (t) => {

            await Usuario.update({
                Email: req.body.Email
            }, {
                where: { CodigoPersona: req.body.Persona.Codigo }
            }, { transaction: t });

            await Persona.update(req.body.Persona, {
                where: { Codigo: req.body.Persona.Codigo }
            }, { transaction: t });

        })

        res.json({ message: 'Usuario creado correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al crear el usuario' })
    }
}

const hash = (password) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
        console.log(hashPassword)
        return hashPassword;
    } catch (error) {
        console.log(error);
    }
}

const eliminarUsuario = async (req, res) => {
    try {
        await sequelize.transaction(async (t) => {
            await Usuario.destroy({
                where: { CodigoPersona: req.query.codigoPersona }
            }, { transaction: t });
            await Persona.destroy({
                where: { Codigo: req.query.codigoPersona }
            }, { transaction: t });
        })

        res.json({ message: 'Usuario eliminado correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al eliminar el usuario' })
    }
}

const inhabilitarUsuario = async (req, res) => {
    try {
        await Usuario.update({
            Estado: false
        }, {
            where: { Codigo: req.query.codigo }
        });
   
        res.json({ message: 'Usuario inhabilitado correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al inhabilitar el usuario' })
    }
}

module.exports = {
    getUsuarios,
    crearUsuario,
    getNivelesUsuario,
    eliminarUsuario,
    editarUsuario,
    inhabilitarUsuario
}