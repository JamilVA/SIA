const Estudiante = require('../models/estudiante.model');
const Persona = require('../models/persona.model');
const CarreraProfesional = require('../models/carreraProfesional.model')

Estudiante.belongsTo(Persona, { foreignKey: 'CodigoPersona' })
Estudiante.belongsTo(CarreraProfesional, { foreignKey: 'CodigoCarreraProfesional' })

const getEstudiante = async (req, res) => {
    const estudiantes = await Estudiante.findAll({
        include: Persona
    });

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
                Paterno: req.body.paterno,
                Materno: req.body.materno,
                Nombres: req.body.nombres,
                RutaFoto: req.body.rutaFoto,
                FechaNacimiento: req.body.fechaNacimiento,
                Sexo: req.body.sexo,
                DNI: req.body.DNI,
                Email: req.body.email,
            }
        )

        const estudiante = await Estudiante.create(
            {
                Codigo: null,
                CodigoSunedu: req.body.codigoSunedu,
                CreditosLlevados: 0,
                CreditosAprobados: 0,
                AnioIngreso: new Date().getFullYear().toString(),
                Estado: true,
                CodigoPersona: persona.Codigo,
                CodigoCarreraProfesional: req.body.codigoCarreraProfesional,
            })

        res.json({
            "Estado": "Guardado con éxito",
            persona,
            estudiante
        })
    } catch (error) {
        res.json({
            "Estado": "Error al guardar, " + error,
        })
    }
}

const actualizarEstudiante = async (req, res) => {
    try {
        const persona = await Persona.update(
            {
                Paterno: req.body.paterno,
                Materno: req.body.materno,
                Nombres: req.body.nombres,
                RutaFoto: req.body.rutaFoto,
                FechaNacimiento: req.body.fechaNacimiento,
                Sexo: req.body.sexo,
                DNI: req.body.DNI,
                Email: req.body.email,
            }, {
            where: {
                Codigo: req.body.codigo,
            }
        }
        )

        const estudiante = await Estudiante.update(
            {
                CodigoSunedu: req.body.codigoSunedu,
                CreditosLlevados: req.body.creditosLlevados,
                CreditosAprobados: req.body.creditosAprobados,
                AnioIngreso: new Date().getFullYear().toString(),
                Estado: req.body.estado,
            }, {
            where: {
                CodigoPersona: req.body.codigo,
            }
        })

        res.json({
            "Estado": "Actualizado con éxito",
            persona,
            estudiante
        })
    } catch (error) {
        res.json({
            "Estado": "Error al Actualizar, " + error,
        })
    }
}

module.exports = {
    getEstudiante,
    crearEstudiante,
    actualizarEstudiante
}

