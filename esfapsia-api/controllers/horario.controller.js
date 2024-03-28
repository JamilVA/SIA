const Horario = require('../models/horario.model')
const CursoCalificacion = require('../models/cursoCalificacion.model')
const { sequelize } = require('../config/database')
const { QueryTypes } = require("sequelize");

CursoCalificacion.hasMany(Horario, { foreignKey: 'CodigoCursoCalificacion' })
Horario.belongsTo(CursoCalificacion, { foreignKey: 'CodigoCursoCalificacion' })

const crearHorario = async (req, res) => {
    try {
        const horario = await Horario.create(req.body)
        res.json({
            message: 'Día asignado correctamente',
            horario
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Ha ocurrido un error al asignar el horario' })
    }
}

const editarHorario = async (req, res) => {
    try {
        let campos = req.body
        await Horario.update(campos, {
            where: {
                Codigo: req.query.codigo
            }
        })
        res.json({ message: 'El horario se ha actualizado correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Ha ocurrido un error al actualizar' })
    }
}

const eliminarHorario = async (req, res) => {
    try {
        await Horario.destroy({
            where: {
                Codigo: req.query.codigo
            }
        })
        res.json({ message: 'Horario eliminado correctamente' })
    } catch (error) {
        console.error(error)
        res.json({ error: 'Error al eliminar el horario' })
    }
}

const buscarHorario = async (req, res) => {
    try {
        const horarios = await Horario.findAll({
            where: {
                CodigoCursoCalificacion: req.query.codigo
            }
        })
        res.json({ horarios })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al buscar horario' })
    }
}

const getHorariosGenerales = async (req, res) => {
    try {
        const horarios = await sequelize.query(`select c.Codigo as CodigoCurso, c.Nombre, h.Codigo as CodigoHorario, h.Dia, h.HoraInicio, h.HoraFin, h.NombreAula, h.NumeroAula 
        from horario h join cursocalificacion cc
        on h.CodigoCursoCalificacion = cc.Codigo
        join periodo p on cc.CodigoPeriodo = p.Codigo
        join curso c on cc.CodigoCurso = c.Codigo
        join carreraprofesional cp on c.CodigoCarreraProfesional = cp.Codigo
        where cp.Codigo = '${req.query.CodCarrera}' and c.Nivel = '${req.query.Nivel}' and c.Semestre = '${req.query.Semestre}' and p.Estado = 1`, { type: QueryTypes.SELECT })
        res.json({ horarios })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener horarios' })
    }
}

const getHorarioByStudent = async (req, res) => {
    try {
        const horario = await sequelize.query(`select c.Codigo as CodigoCurso, c.Nombre, h.Codigo as CodigoHorario, h.Dia, h.HoraInicio, h.HoraFin, h.NombreAula, h.NumeroAula 
        from horario h join cursocalificacion cc
        on h.CodigoCursoCalificacion = cc.Codigo
        join periodo p on cc.CodigoPeriodo = p.Codigo
        join curso c on cc.CodigoCurso = c.Codigo
        join matricula m on cc.Codigo = m.CodigoCursoCalificacion
        join estudiante e on m.CodigoEstudiante = e.Codigo
        where e.Codigo = '${req.query.CodEstudiante}' and p.Estado = 1;`, { type: QueryTypes.SELECT })
        res.json({ horario })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener horario' })
    }
}

const getHorarioByDocente = async (req, res) => {
    try {
        const horario = await sequelize.query(`select c.Codigo as CodigoCurso, c.Nombre, h.Codigo as CodigoHorario, h.Dia, h.HoraInicio, h.HoraFin, h.NombreAula, h.NumeroAula 
        from horario h join cursocalificacion cc
        on h.CodigoCursoCalificacion = cc.Codigo
        join periodo p on cc.CodigoPeriodo = p.Codigo
        join curso c on cc.CodigoCurso = c.Codigo
        join docente d on cc.CodigoDocente = d.Codigo
        where d.Codigo = '${req.query.CodDocente}' and p.Estado = 1;`, { type: QueryTypes.SELECT })
        res.json({ horario })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener horario' })
    }
}

module.exports = {
    crearHorario,
    editarHorario,
    eliminarHorario,
    buscarHorario,
    getHorariosGenerales,
    getHorarioByStudent,
    getHorarioByDocente
}