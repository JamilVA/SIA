const { Curso } = require('../models/curso.model')

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
                Codigo: null,
                Nombre: req.body.nombre,
                HorasTeoria: req.body.horasTeoria,
                HorasPractica: req.body.horasPractica,
                Creditos: req.body.creditos,
                Nivel: req.body.nivel,
                Semestre: req.body.semestre,
                Tipo: req.body.tipo,
                Estado: req.body,estado,
                ConPrerequisito: req.body.conPrerequisito,
                CodigoCurso: req.body.codigoCurso,
                CodigoCarreraProfesional: req.body.codigoCarreraProfesional
            }
        )

        res.json({
            "Estado": "Creado con éxito",
            malla
        })
    } catch (error) {
        res.json({
            "Estado": "Error al guardar, " + error,
            malla
        })
    }
}

const actualizarCurso = async (req, res) => {
    try{

    }catch(error){
        const curso = await MallaCurricular.update(
            {
                Nombre: req.body.nombre,
                HorasTeoria: req.body.horasTeoria,
                HorasPractica: req.body.horasPractica,
                Creditos: req.body.creditos,
                Nivel: req.body.nivel,
                Semestre: req.body.semestre,
                Tipo: req.body.tipo,
                Estado: req.body,estado,
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
    }
}

const bajaCurso = async (req, res) => {
    try{

    }catch(error){
        const curso = await MallaCurricular.update(
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
    }
}

module.exports = {getCurso, crearCurso, actualizarCurso, bajaCurso}