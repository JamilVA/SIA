const Estudiante = require('../models/estudiante.model');
const Persona = require('../models/persona.model');
const CarreraProfesional = require('../models/carreraProfesional.model');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

Estudiante.belongsTo(Persona, { foreignKey: 'codigoPersona' })
Estudiante.belongsTo(CarreraProfesional, { foreignKey: 'codigoCarreraProfesional' })

const getEstudiante = async (req, res) => {
    const estudiantes = await Estudiante.findAll({
        include: [Persona, CarreraProfesional]
    });

    /*const estudiantes = await sequelize.query("SELECT E.Codigo, Estado, Paterno, Materno, Nombres, RutaFoto, AnioIngreso, FechaNacimiento, Sexo, DNI, Email, CodigoSunedu, CreditosLlevados, CreditosAprobados, CodigoCarreraProfesional, C.NombreCarrera, CodigoPersona FROM persona as P INNER JOIN estudiante as E ON E.CodigoPersona = P.Codigo INNER JOIN carreraprofesional as C ON E.CodigoCarreraProfesional = C.Codigo",
        { Type: QueryTypes.SELECT })*/

    res.json({
        ok: true,
        estudiantes,
    });
}

const crearEstudiante = async (req, res) => {

    try {
        const persona = await Persona.create(
            {
                codigo: null,
                paterno: req.body.Paterno,
                materno: req.body.Materno,
                nombres: req.body.Nombres,
                rutaFoto: req.body.RutaFoto,
                fechaNacimiento: req.body.FechaNacimiento,
                sexo: req.body.Sexo,
                DNI: req.body.DNI,
                email: req.body.Email,
            }
        )

        const estudiante = await Estudiante.create(
            {
                codigo: null,
                codigoSunedu: req.body.CodigoSunedu,
                creditosLlevados: 0,
                creditosAprobados: 0,
                anioIngreso: new Date().getFullYear().toString(),
                estado: true,
                codigoPersona: persona.Codigo,
                codigoCarreraProfesional: req.body.CodigoCarreraProfesional,
            })

        res.json({
            "Estado": "Guardado con éxito",
            persona,
            estudiante
        })
    } catch (error) {
        res.json({
            "Estado": "Error",
        })
    }
}

const actualizarEstudiante = async (req, res) => {
    try {
        const persona = await Persona.update(
            {
                paterno: req.body.Paterno,
                materno: req.body.Materno,
                nombres: req.body.Nombres,
                rutaFoto: req.body.RutaFoto,
                fechaNacimiento: req.body.FechaNacimiento,
                sexo: req.body.Sexo,
                DNI: req.body.DNI,
                email: req.body.Email,
            }, {
            where: {
                codigo: req.body.CodigoPersona,
            }
        }
        )

        const estudiante = await Estudiante.update(
            {
                codigoSunedu: req.body.CodigoSunedu,
                creditosLlevados: req.body.CreditosLlevados,
                creditosAprobados: req.body.CreditosAprobados,
                anioIngreso: new Date().getFullYear().toString(),
                estado: req.body.Estado,
                codigoCarreraProfesional: req.body.CodigoCarreraProfesional,
            }, {
            where: {
                codigo: req.body.Codigo,
            }
        })

        res.json({
            "Estado": "Actualizado con éxito",
            persona,
            estudiante
        })
    } catch (error) {
        res.json({
            "Estado": "Error",
        })
    }
}

module.exports = {
    getEstudiante,
    crearEstudiante,
    actualizarEstudiante
}
