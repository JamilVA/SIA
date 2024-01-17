const { sequelize } = require('../config/database')
const Curso = require('../models/curso.model')
const CursoCalificacion = require('../models/cursoCalificacion.model')
const Docente = require('../models/docente.model')
const Periodo = require('../models/periodo.model')
const Persona = require('../models/persona.model')
const UnidadAcemica = require('../models/unidadAcademica.model')
const Estudiante = require('../models/estudiante.model')
const Matricula = require('../models/matricula.model')
const Asistencia = require('../models/asistencia.model')
const Sesion = require('../models/sesion.model')

CursoCalificacion.belongsTo(Curso, { foreignKey: 'CodigoCurso' })
Curso.hasOne(CursoCalificacion, { foreignKey: 'CodigoCurso' })

Periodo.hasMany(CursoCalificacion, { foreignKey: 'CodigoPeriodo' })
CursoCalificacion.belongsTo(Periodo, { foreignKey: 'CodigoPeriodo' })

Docente.hasMany(CursoCalificacion, { foreignKey: 'CodigoDocente' })
CursoCalificacion.belongsTo(Docente, { foreignKey: 'CodigoDocente' })

CursoCalificacion.hasMany(UnidadAcemica, { foreignKey: 'CodigoCursoCalificacion' })
UnidadAcemica.belongsTo(CursoCalificacion, { foreignKey: 'CodigoCursoCalificacion' })

const getCursosCalificacion = async (req, res) => {
    try {
        const cursosCalificacion = await CursoCalificacion.findAll({
            attributes: { exclude: ['RutaSyllabus', 'RutaNormas', 'RutaPresentacionDocente', 'RutaPresentacionCurso'] },
            include: [
                {
                    model: Periodo,
                    attributes: ['Codigo', 'Denominacion', 'Estado'],
                    where: { 'Estado': true }
                },
                {
                    model: Curso
                },
                {
                    model: Docente,
                    attributes: ['Codigo'],
                    include: [{ model: Persona, attributes: ['Paterno', 'Materno', 'Nombres'] }]
                }
            ],
        })
        res.json({ cursosCalificacion })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Ha ocurrido un error al procesar la solicitud' })
    }
}

const crearCursoCalificacion = async (req, res) => {
    try {
        await sequelize.transaction(async (t) => {
            const cursoCalificacion = await CursoCalificacion.create(req.body, { transaction: t })
            await UnidadAcemica.bulkCreate(unidades(cursoCalificacion.Codigo), { transaction: t })
            return res.json({
                mensaje: 'Curso a calificar creado',
                cursoCalificacion
            })
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Ha ocurrido un error al habilitar el curso' })
    }
}

const unidades = (codigo) => {
    let unidades = [
        { Codigo: '1' + codigo, Denominacion: 'Unidad I', CodigoCursoCalificacion: codigo },
        { Codigo: '2' + codigo, Denominacion: 'Unidad II', CodigoCursoCalificacion: codigo },
        { Codigo: '3' + codigo, Denominacion: 'Unidad III', CodigoCursoCalificacion: codigo },
        { Codigo: '4' + codigo, Denominacion: 'Unidad IV', CodigoCursoCalificacion: codigo }
    ]
    return unidades
}

const habilitarIngreso = async (req, res) => {
    try {

        let campo = req.query.campo
        let updateCampo
        let message
        console.log(campo, req.query.codigo)
        switch (campo) {
            case 'notas':
                updateCampo = { EstadoNotas: true }
                message = "Ingreso de notas habilitado correctamente"
                break;
            case 'recuperacion':
                updateCampo = { EstadoRecuperacion: true }
                message = "Ingreso de recuperaciones habilitado correctamente"
                break;
            case 'aplazado':
                updateCampo = { EstadoAplazado: true }
                message = "Ingreso de aplazados habilitado correctamente"
                break;
        }

        const result = await CursoCalificacion.update(updateCampo, {
            where: { Codigo: req.query.codigo }
        })

        if (result[0] === 0) {
            return res.json({ message: 'No se ha habilitado el ingreso' })
        }

        res.json({ message: message });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Ha ocurrido un error' })
    }
}

const deshabilitarIngreso = async (req, res) => {
    try {

        let campo = req.query.campo
        let updateCampo
        let message

        switch (campo) {
            case 'notas':
                updateCampo = { EstadoNotas: false }
                message = "Ingreso de notas deshabilitado correctamente"
                break;
            case 'recuperacion':
                updateCampo = { EstadoRecuperacion: false }
                message = "Ingreso de recuperaciones deshabilitado correctamente"
                break;
            case 'aplazado':
                updateCampo = { EstadoAplazado: false }
                message = "Ingreso de aplazados deshabilitado correctamente"
                break;
        }

        await CursoCalificacion.update(updateCampo, {
            where: { Codigo: req.query.codigo }
        })

        res.json({ message: message });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Ha ocurrido un error' })
    }
}

const habilitarIngresos = async (req, res) => {
    try {

        let campo = req.query.campo
        let updateCampo
        let message

        switch (campo) {
            case 'notas':
                updateCampo = { EstadoNotas: true }
                message = "Notas habilitadas correctamente"
                break;
            case 'recuperacion':
                updateCampo = { EstadoRecuperacion: true }
                message = "Recuperaciones habilitadas correctamente"
                break;
            case 'aplazado':
                updateCampo = { EstadoAplazado: true }
                message = "Aplazados habilitados correctamente"
                break;
        }

        await CursoCalificacion.update(updateCampo, {
            where: { CodigoPeriodo: req.query.periodo }
        })

        res.json({ message: message });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Ha ocurrido un error' })
    }
}

const deshabilitarIngresos = async (req, res) => {
    try {

        let campo = req.query.campo
        let updateCampo
        let message

        switch (campo) {
            case 'notas':
                updateCampo = { EstadoNotas: false }
                message = "Notas deshabilitadas correctamente"
                break;
            case 'recuperacion':
                updateCampo = { EstadoRecuperacion: false }
                message = "Recuperaciones deshabilitadas correctamente"
                break;
            case 'aplazado':
                updateCampo = { EstadoAplazado: false }
                message = "Aplazados deshabilitados correctamente"
                break;
        }

        await CursoCalificacion.update(updateCampo, {
            where: { CodigoPeriodo: req.query.periodo }
        })

        res.json({ message: message });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Ha ocurrido un error' })
    }
}

const eliminarCursoCalificacion = async (req, res) => {
    try {
        await CursoCalificacion.destroy({
            where: {
                Codigo: req.query.codigo
            }
        })

        res.json({ message: 'El curso habilitado ha sido eliminado correctamente' })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al procesar la solicitud' })
    }
}

const asignarDocente = async (req, res) => {
    try {
        await CursoCalificacion.update({ CodigoDocente: req.query.codigoDocente }, {
            where: { Codigo: req.query.codigo }
        })
        res.json({ message: 'Docente asignado correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al asignar el docente' })
    }
}

const getMatriculados = async (req, res) => {
    try {
        const matriculados = await Matricula.findAll({
            where: { CodigoCursoCalificacion: req.query.codigoCursoCalificacion },
            attributes: { exclude: ['FechaMatricula', 'NotaFinal', 'Observacion'] },           
            include: [
                {
                    model: Estudiante,
                    include: [
                        {
                            model: Persona
                        },
                        {
                            model: Asistencia,
                            where: { CodigoSesion:  req.query.codigoSesion},
                            limit: 1
                        }
                    ]
                }
            ]
             
        })

        res.json({ matriculados })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al obtener la lista de matriculados' })
    }
}

const contarSesiones = async (req, res) => {
    
}

module.exports = {
    getCursosCalificacion,
    crearCursoCalificacion,
    habilitarIngresos,
    deshabilitarIngresos,
    eliminarCursoCalificacion,
    asignarDocente,
    habilitarIngreso,
    deshabilitarIngreso,
    getMatriculados
}