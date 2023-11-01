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

const crearEstudiante = async (req, res = response) => {
    const persona = await Persona.create(
        {
            paterno: req.body.paterno,
            materno: req.body.materno,
            nombres: req.body.nombres,
            rutaFoto: req.body.rutaFoto,
            fechaNacimiento: req.body.fechaNacimiento,
            sexo: req.body.sexo,
            DNI: req.body.DNI,
            correo: req.body.correo,
        }
    )
    const person = await persona.save()

    /*const estudiante = await Estudiante.create(
        {
            codigoSunedu: req.body.codigoSunedu,
            creditosLlevados: req.body.creditosLlevados,
            creditosAprobados: req.body.creditosAprobados,
            anioIngreso: new Date().getFullYear().toString(),
            codigoPersona: person.codigo
        }
    )
    await estudiante.save()*/

    console.log(persona)

    res.json({
        ok: true,
        persona,
        //estudiante
    });

}

module.exports = {
    getEstudiante,
    crearEstudiante
}