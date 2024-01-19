const Asistencia = require("../models/asistencia.model")
const Estudiante = require("../models/estudiante.model")
const Sesion = require("../models/sesion.model")
const { sequelize } = require("../config/database");
const Matricula = require("../models/matricula.model");

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

const contarAsistencias = async (codigoCurso, codigoEstudiante) => {
    try {
        const QUERY = "select count(*) as `asistencias` " +
        "from cursocalificacion as c " +
        "inner join unidadacademica as u " +
        "on c.Codigo = u.CodigoCursoCalificacion and c.Codigo like ? " +
        "inner join semanaacademica as sa " +
        "on u.Codigo = sa.CodigoUnidadAcademica " +
        "inner join sesion as s " +
        "on sa.Codigo = s.CodigoSemanaAcademica " +
        "inner join asistencia as a " +
        "on a.CodigoSesion = s.Codigo and a.CodigoEstudiante = ? "
        const [results, metadata] = await sequelize.query(QUERY, { replacements: [codigoCurso, codigoEstudiante] })
        return metadata[0]
    } catch (error) {
        console.error(error)
        return new Error("Error al contar las asistencias")
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
        await consolidarAsistencia(req.body.codigoCurso, req.body.codigoEstudiante) 
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
        await consolidarAsistencia(req.body.codigoCurso, req.body.codigoEstudiante) 
        res.json({ message: 'Asistencia desmarcada correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al desmarcar la asistencia' })
    }
}

const consolidarAsistencia = async (codigoCurso, codigoEstudiante) => {
    try {
        const asistencias = await contarAsistencias(codigoCurso, codigoEstudiante)
        const params = { codigoCurso: codigoCurso }
        const queryString = new URLSearchParams(params).toString()
        const response = await fetch('http://localhost:3001/api/curso-calificacion/sesiones?' + queryString)
        const data = await response.json()
        const porcentaje = asistencias.asistencias / data.sesiones * 100
        await Matricula.update({
            PorcentajeAsistencia: porcentaje,
            Habilitado: porcentaje < 75 ? true : false
        }, {
            where: { 
                CodigoCursoCalificacion: codigoCurso,
                CodigoEstudiante: codigoEstudiante
            }
        })
        console.log(asistencias, " ", data, " ", porcentaje)        
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    generarAsistencias,
    marcarAsistencia,
    desmarcarAsistencia
}

