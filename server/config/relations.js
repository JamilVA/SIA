const Actividad = require("../models/actividad.model")
const Sesion = require("../models/sesion.model")
const ActividadEstudiante = require("../models/actividadEstudiante.model")
const Estudiante = require("../models/estudiante.model")

Sesion.hasMany(Actividad, { foreignKey: 'CodigoSesion' })
Actividad.belongsTo(Sesion, { foreignKey: 'CodigoSesion' })

Actividad.hasMany(ActividadEstudiante, { foreignKey: 'CodigoActividad' })
ActividadEstudiante.belongsTo(Actividad, { foreignKey: 'CodigoActividad' })

Estudiante.hasMany(ActividadEstudiante, { foreignKey: 'CodigoEstudiante' })
ActividadEstudiante.belongsTo(Estudiante, { foreignKey: 'CodigoEstudiante' })

module.exports = {
    Actividad,
    Sesion,
    ActividadEstudiante,
    Estudiante
}