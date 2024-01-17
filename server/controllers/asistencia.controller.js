const Asistencia = require("../models/asistencia.model")
const Estudiante = require("../models/estudiante.model")
const Sesion = require("../models/sesion.model")

Estudiante.hasMany(Asistencia, {foreignKey: 'CodigoEstudiante'})
Asistencia.belongsTo(Estudiante, {foreignKey: 'CodigoEstudiante'})

Sesion.hasMany(Asistencia, {foreignKey: 'CodigoSesion'})
Asistencia.belongsTo(Sesion, {foreignKey: 'CodigoSesion'})

const generarAsistencias = async (req, res) => {
    try {
        await Asistencia.bulkCreate(req.body.asistencias)
        res.json({message: 'Asistencias generadas correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({message: 'Error al generar las asitencias'})
    }
}

const marcarAsistencia = async (req, res) => {
    try {
        await Asistencia.findOrCreate({
            where: { 
                CodigoSesion: req.body.codigoSesion,
                CodigoEstudiante: req.body.codigoEstudiante
            },
            defaults: {
                CodigoSesion: req.body.codigoSesion,
                CodigoEstudiante: req.body.codigoEstudiante,
                Estado: true,
                Fecha: new Date(),
                Hora: new Date()
            }
        })
        res.json({ message: 'Asistencia marcada correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al registar la asistencia' })
    }
}

const desmarcarAsistencia = async (req, res) => {
    try {
        await Asistencia.destroy({
            where: { 
                CodigoSesion: req.query.codigoSesion,
                CodigoEstudiante: req.query.codigoEstudiante
            }
        })
        res.json({ message: 'Asistencia desmarcada correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al desmarcar la asistencia' })
    }
}

module.exports = {
    generarAsistencias,
    marcarAsistencia,
    desmarcarAsistencia
}

