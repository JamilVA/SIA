const { response, request } = require('express');
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

    console.log("Código de la persona insertada: ", persona.codigo)

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

}

module.exports = {
    getEstudiante,
    crearEstudiante
}