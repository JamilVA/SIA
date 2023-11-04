const Estudiante = require('../models/estudiante.model');
const Persona = require('../models/persona.model');

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
                codigo: null,
                paterno: req.body.paterno,
                materno: req.body.materno,
                nombres: req.body.nombres,
                rutaFoto: req.body.rutaFoto,
                fechaNacimiento: req.body.fechaNacimiento,
                sexo: req.body.sexo,
                DNI: req.body.DNI,
                email: req.body.email,
            }
        )

        const estudiante = await Estudiante.create(
            {
                codigo: null,
                codigoSunedu: req.body.codigoSunedu,
                creditosLlevados: req.body.creditosLlevados,
                creditosAprobados: req.body.creditosAprobados,
                anioIngreso: new Date().getFullYear().toString(),
                estado: true,
                codigoPersona: persona.codigo
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
                paterno: req.body.paterno,
                materno: req.body.materno,
                nombres: req.body.nombres,
                rutaFoto: req.body.rutaFoto,
                fechaNacimiento: req.body.fechaNacimiento,
                sexo: req.body.sexo,
                DNI: req.body.DNI,
                email: req.body.email,
            },{
                where:{
                    codigo:req.body.codigo,
                }
            }
        )

        const estudiante = await Estudiante.update(
            {
                codigoSunedu: req.body.codigoSunedu,
                creditosLlevados: req.body.creditosLlevados,
                creditosAprobados: req.body.creditosAprobados,
                anioIngreso: new Date().getFullYear().toString(),
                estado: req.body.estado,
            },{
                where:{
                    codigoPersona:req.body.codigo,
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