const Curso = require('../models/curso.model');
const CarreraProfesional = require('../models/carreraProfesional.model')

CarreraProfesional.hasMany(Curso, { foreignKey: 'CodigoCarreraProfesional' })
Curso.belongsTo(CarreraProfesional, { foreignKey: 'CodigoCarreraProfesional' })

const getCurso = async (req, res) => {
    const cursos = await Curso.findAll();

    res.json({
        ok: true,
        cursos,
    });
}

const crearCurso = async (req, res) => {
    try {
        const curso = await Curso.create(
            {
                Codigo: 'ABC02',
                Nombre: req.body.nombre,
                HorasTeoria: req.body.horasTeoria,
                HorasPractica: req.body.horasPractica,
                Creditos: req.body.creditos,
                Nivel: req.body.nivel,
                Semestre: req.body.semestre,
                Tipo: req.body.tipo,
                Estado: true,
                ConPrerequisito: req.body.conPrerequisito,
                CodigoCurso: req.body.codigoCurso,
                CodigoCarreraProfesional: req.body.codigoCarreraProfesional
            }
        )

        res.json({
            "Estado": "Creado con éxito",
            curso
        })
    } catch (error) {
        res.json({
            "Estado": "Error al guardar, " + error
        })
    }
}

const actualizarCurso = async (req, res) => {
    try {
        const curso = await Curso.update(
            {
                Nombre: req.body.nombre,
                HorasTeoria: req.body.horasTeoria,
                HorasPractica: req.body.horasPractica,
                Creditos: req.body.creditos,
                Nivel: req.body.nivel,
                Semestre: req.body.semestre,
                Tipo: req.body.tipo,
                Estado: req.body.estado,
                ConPrerequisito: req.body.conPrerequisito,
                CodigoCurso: req.body.codigoCurso,
                CodigoCarreraProfesional: req.body.codigoCarreraProfesional
            }, {
            where: {
                Codigo: req.body.codigo,
            }
        }
        )

        res.json({
            "Estado": "Actualizado con éxito",
            curso
        })
    } catch (error) {
        res.json({
            "Estado": "Error al actualizar, " + error
        })
    }
}

const bajaCurso = async (req, res) => {
    try {
        const curso = await Curso.update(
            {
                Estado: false
            }, {
            where: {
                Codigo: req.body.codigo,
            }
        }
        )

        res.json({
            "Estado": "Actualizado con éxito",
            curso
        })
    } catch (error) {
        res.json({
            "Estado": "Error al actualizar, " + error
        })
    }
}

module.exports = { getCurso, crearCurso, actualizarCurso, bajaCurso }