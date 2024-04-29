const { Acta, Matricula, CursoCalificacion, Curso, Periodo, CarreraProfesional } = require("../config/relations")
const { sequelize } = require('../config/database')
const { QueryTypes } = require("sequelize");
const { Op } = require("sequelize");

const middCodigoActa = (n) => {
    let c = '';
    if (n >= 0 && n < 10) {
        c = '00' + n;
    } else if (n >= 10 && n < 100) {
        c = '0' + n;
    } else {
        c = n.toString()
    }

    return c;
}

const crearActa = async (req, res) => {
    try {

        const countActas = await sequelize.query(`select count(*)
        from Acta a join CursoCalificacion cc
        on a.CodigoCursoCalificacion = cc.Codigo
        join Periodo p on cc.CodigoPeriodo = p.Codigo
        join Curso c on cc.CodigoCurso = c.Codigo
        join CarreraProfesional cp on c.CodigoCarreraProfesional = cp.Codigo
        where p.Codigo = '${req.body.CodigoPeriodo}' and cp.Codigo = ${req.body.CodigoCarrera};`, { type: QueryTypes.SELECT })

        const acta = await Acta.create({
            Codigo: req.body.Codigo + middCodigoActa(countActas.length + 1),
            FechaGeneracion: new Date(),
            CodigoCursoCalificacion: req.body.CodigoCursoCalificacion,
        })
        res.json({
            message: 'Acta creada correctamente',
            acta
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al crear acta' })
    }
}

const getActas = async (req, res) => {
    try {
        const actas = await Acta.findAll({
            where: {
                CodigoCursoCalificacion: req.query.CodCursoCal
            }
        });
        res.json({ actas })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al cargar la lista de actas' })
    }
}

const getActasByEstudiante = async (req, res) => {
    try {
        const matriculas = await Matricula.findAll({
            where: { 
                CodigoEstudiante: req.query.CodigoEstudiante, 
                NotaFinal: { [Op.not]: null }, 
                '$CursoCalificacion.Periodo.Estado$': false 
            },
            include: {
                model: CursoCalificacion,
                attributes: ["Codigo"],
                include: [Curso, Acta, Periodo]
            }
        })

        const historial = matriculas.map(item => ({
            CodigoMat: item.CursoCalificacion.Curso.Codigo + item.CodigoEstudiante,
            Codigo: item.CursoCalificacion.Curso.Codigo,
            Curso: item.CursoCalificacion.Curso.Nombre,
            Nota: item.NotaFinal,
            Nivel: item.CursoCalificacion.Curso.Nivel,
            Ciclo: (item.CursoCalificacion.Curso.Nivel - 1) * 2 + item.CursoCalificacion.Curso.Semestre,
            Semestre: item.CursoCalificacion.Curso.Semestre,
            Creditos: item.CursoCalificacion.Curso.Creditos,
            Acta: item.CursoCalificacion.Actum?.Codigo,
            Fecha: item.CursoCalificacion.Actum?.FechaGeneracion,
            Periodo: item.CursoCalificacion.Periodo.Estado,
        }))

        const [result, metadata] = await sequelize.query(`
        SELECT SUBSTRING(CodigoCursoCalificacion, 1, 2) AS Siglas
        FROM Matricula
        where CodigoEstudiante = ${req.query.CodigoEstudiante}
        GROUP BY SUBSTRING(CodigoCursoCalificacion, 1, 2)`)

        const siglas = result.map(item => (item.Siglas))

        const carreras = await CarreraProfesional.findAll({
            where: { Siglas: { [Op.in]: siglas } }
        })

        res.json({ historial, carreras })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al cargar la lista de actas' })
    }
}

module.exports = {
    getActas,
    crearActa,
    getActasByEstudiante
}