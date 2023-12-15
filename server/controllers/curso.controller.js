const Curso = require('../models/curso.model');
const CarreraProfesional = require('../models/carreraProfesional.model');
const CursoCalificacion = require('../models/cursoCalificacion.model');

CarreraProfesional.hasMany(Curso, { foreignKey: 'CodigoCarreraProfesional' })
Curso.belongsTo(CarreraProfesional, { foreignKey: 'CodigoCarreraProfesional' })

const getCurso = async (req, res) => {
    const cursos = await Curso.findAll(
        { include: CarreraProfesional }
    );

    const carreras = await CarreraProfesional.findAll();

    res.json({
        ok: true,
        cursos,
        carreras,
    });
}

const crearCurso = async (req, res) => {
    try {
        const curso = await Curso.create(
            {
                Codigo: req.body.Codigo,
                Nombre: req.body.Nombre,
                HorasTeoria: req.body.HorasTeoria,
                HorasPractica: req.body.HorasPractica,
                Creditos: req.body.Creditos,
                Nivel: req.body.Nivel,
                Semestre: req.body.Semestre,
                Tipo: req.body.Tipo,
                Estado: req.body.Estado,
                ConPrerequisito: req.body.ConPrerequisito,
                CodigoCurso: req.body.CodigoCurso,
                CodigoCarreraProfesional: req.body.CodigoCarreraProfesional
            }
        )

        res.json({
            "Estado": "Creado con éxito",
            curso
        })
    } catch (error) {
        res.json({
            "Estado": "Error",
            "Error": error
        })
    }
}

const actualizarCurso = async (req, res) => {
    try {
        const curso = await Curso.update(
            {
                Nombre: req.body.Nombre,
                HorasTeoria: req.body.HorasTeoria,
                HorasPractica: req.body.HorasPractica,
                Creditos: req.body.Creditos,
                Nivel: req.body.Nivel,
                Semestre: req.body.Semestre,
                Tipo: req.body.Tipo,
                Estado: req.body.Estado,
                ConPrerequisito: req.body.ConPrerequisito,
                CodigoCurso: req.body.CodigoCurso,
                CodigoCarreraProfesional: req.body.CodigoCarreraProfesional
            }, {
            where: {
                Codigo: req.body.Codigo,
            }
        }
        )

        res.json({
            "Estado": "Actualizado con éxito",
            curso
        })
    } catch (error) {
        res.json({
            "Estado": "Error"
        })
    }
}

const buscarCurso = async (req, res) => {
    try {
        const curso = await Curso.findOne({
            include: [{
                model: CursoCalificacion,
                where: {
                    'Codigo': req.query.codigo
                }
            }]
        })
        if (!curso) {
            return res.json({ message: 'Curso no encontrado' })
        }
        res.json({ curso })
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error al buscar el curso'})
    }
}

module.exports = { getCurso, crearCurso, actualizarCurso, buscarCurso }