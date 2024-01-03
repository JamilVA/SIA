const Asistencia = require("../models/asistencia.model")
const Estudiante = require("../models/estudiante.model")
const Sesion = require("../models/sesion.model")

Estudiante.hasMany(Asistencia, { foreignKey: 'CodigoEstudiante' })
Asistencia.belongsTo(Estudiante, { foreignKey: 'CodigoEstudiante' })

Sesion.hasMany(Asistencia, { foreignKey: 'CodigoSesion' })
Asistencia.belongsTo(Sesion, { foreignKey: 'CodigoSesion' })

const crearAsistencia = async (req, res) => {
    try {
        await Asistencia.findOrCreate({
            where: { CodigoSesion: req.query.codigoSesion},
            defaults: {
                CodigoSesion: req.body.CodigoSesion,
                CodigoEstudiante: req.body.CodigoEstudiante,
                Estado: req.body.Estado,
                Fecha: new Date(),
                Hora: new Date()
            }
        })
        res.json({ message: 'Asistencia registrada correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al registar la asistencia' })
    }
}

