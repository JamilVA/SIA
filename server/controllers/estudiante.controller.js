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
                Codigo: null,
                Paterno: req.body.Paterno,
                Materno: req.body.Materno,
                Nombres: req.body.Nombres,
                RutaFoto: req.body.RutaFoto,
                FechaNacimiento: req.body.FechaNacimiento,
                Sexo: req.body.Sexo,
                DNI: req.body.DNI,
                Email: req.body.Email,
            }
        )

        const estudiante = await Estudiante.create(
            {
                Codigo: null,
                CodigoSunedu: req.body.CodigoSunedu,
                CreditosLlevados: req.body.CreditosLlevados,
                CreditosAprobados: req.body.CreditosAprobados,
                AnioIngreso: new Date().getFullYear().toString(),
                Estado: req.body.Estado,
                CodigoPersona: persona.Codigo,
                CodigoCarreraProfesional: req.body.CodigoCarreraProfesional,
            })

        res.json({
            "Estado": "Guardado con éxito",
            persona,
            estudiante
        })
    } catch (error) {
        res.json({
            "Estado": "Error",
            "Error": error
        })
    }
}

const actualizarEstudiante = async (req, res) => {
    try {
        const persona = await Persona.update(
            {
                Paterno: req.body.Paterno,
                Materno: req.body.Materno,
                Nombres: req.body.Nombres,
                RutaFoto: req.body.RutaFoto,
                FechaNacimiento: req.body.FechaNacimiento,
                Sexo: req.body.Sexo,
                DNI: req.body.DNI,
                Email: req.body.Email,
            }, {
            where: {
                Codigo: req.body.CodigoPersona,
            }
        }
        )

        const estudiante = await Estudiante.update(
            {
                CodigoSunedu: req.body.CodigoSunedu,
                CreditosLlevados: req.body.CreditosLlevados,
                CreditosAprobados: req.body.CreditosAprobados,
                AnioIngreso: new Date().getFullYear().toString(),
                Estado: req.body.Estado,
                CodigoCarreraProfesional: req.body.CodigoCarreraProfesional,
            }, {
            where: {
                Codigo: req.body.Codigo,
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
            "Error": error
        })
    }
}

module.exports = {
    getEstudiante,
    crearEstudiante,
    actualizarEstudiante
}
