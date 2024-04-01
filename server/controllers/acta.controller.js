const { Acta } = require("../config/relations")
const { sequelize } = require('../config/database')
const { QueryTypes } = require("sequelize");

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
        const actas = await sequelize.query(`select c.codigo as Codigo, c.nombre as Nombre, m.NotaFinal, c.Nivel, c.Semestre, c.Creditos, a.Codigo as CodActa, a.FechaGeneracion
        from Acta a join CursoCalificacion cc
        on a.CodigoCursoCalificacion = cc.Codigo
        join Curso c on cc.CodigoCurso = c.Codigo
        join Matricula m on cc.Codigo = m.CodigoCursoCalificacion
        join Estudiante e on m.CodigoEstudiante = e.Codigo
        where e.Codigo = '${req.query.CodigoEstudiante}';`, { type: QueryTypes.SELECT })
        res.json({ actas })
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