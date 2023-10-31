const { response } = require('express');
const Estudiante = require('../models/estudiante.model');
const Persona = require('../models/persona.model');

const getEstudiante = async (req, res) => {
    //const desde = Number(req.query.desde) || 0;
    //const limite = Number(req.query.limite) || 0;
    const estudiantes = await Estudiante.findAll({
        include: Persona
    });

    res.json({
        ok: true,
        estudiantes,
    });
}

module.exports = {
    getEstudiante
}