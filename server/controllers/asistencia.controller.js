const {Asistencia, Matricula} = require("../config/relations")
const { sequelize } = require("../config/database");

const generarAsistencias = async (req, res) => {
    try {
        await Asistencia.bulkCreate(req.body.asistencias)
        res.json({message: 'Asistencias generadas correctamente'})
    } catch (error) {
        console.error(error)
        res.status(500).json({message: 'Error al generar las asitencias'})
    }
}

const contarAsistencias = async (codigoCurso, codigoEstudiante, t) => {
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
        const [results, metadata] = await sequelize.query(QUERY, { replacements: [codigoCurso, codigoEstudiante], transaction: t })
        return metadata[0]
    } catch (error) {
        throw new Error(error.message)
    }
}


const marcarAsistencia = async (req, res) => {
    try {
        await sequelize.transaction(async (t) => {
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
                }, transaction: t
            })
            await consolidarAsistencia(req.body.codigoCurso, req.body.codigoEstudiante, t) 
        })      
        res.json({ message: 'Asistencia marcada correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al registar la asistencia' })
    }
}

const desmarcarAsistencia = async (req, res) => {
    try {
        await sequelize.transaction(async(t) => {
            await Asistencia.destroy({
                where: { 
                    CodigoSesion: req.query.codigoSesion,
                    CodigoEstudiante: req.query.codigoEstudiante
                }, transaction: t
            })
            await consolidarAsistencia(req.query.codigoCurso, req.query.codigoEstudiante, t)
        })   
        res.json({ message: 'Asistencia desmarcada correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al desmarcar la asistencia' })
    }
}

const consolidarAsistencia = async (codigoCurso, codigoEstudiante, t) => {
    try {
        const asistencias = await contarAsistencias(codigoCurso, codigoEstudiante, t)
        const numeroSesiones = await contarSesiones(codigoCurso)
        const porcentaje = asistencias.asistencias / numeroSesiones.sesiones * 100
        await Matricula.update({
            PorcentajeAsistencia: porcentaje,
            Habilitado: porcentaje < 75 ? false : true
        }, {
            where: { 
                CodigoCursoCalificacion: codigoCurso,
                CodigoEstudiante: codigoEstudiante
            }, 
            transaction: t
        })
        console.log(asistencias, " ", numeroSesiones, " ", porcentaje)        
    } catch (error) {
        throw new Error(error.message)
    }
}

const contarSesiones = async (codigoCurso) => {
    try {
        const QUERY = "select count(*) as `sesiones` " +
            "from cursocalificacion as c " +
            "inner join unidadacademica as u " +
            "on c.Codigo = u.CodigoCursoCalificacion and c.Codigo like ? " +
            "inner join semanaacademica as sa " +
            "on u.Codigo = sa.CodigoUnidadAcademica " +
            "inner join sesion as s " +
            "on sa.Codigo = s.CodigoSemanaAcademica"
        const [results, metadata] = await sequelize.query(QUERY, { replacements: [codigoCurso] })
        let numeroSesiones = 0
        numeroSesiones = metadata[0]
        return numeroSesiones
    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports = {
    generarAsistencias,
    marcarAsistencia,
    desmarcarAsistencia
}

