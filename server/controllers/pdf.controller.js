const { generarPDFMatriculados, generarPDFAsistencia, generarPDFActa, generarPDFHistorialNotas } = require("../helpers/pdf")
const { Matricula, Estudiante, Persona, CursoCalificacion, Curso, CarreraProfesional, Asistencia, Sesion, Acta, Periodo } = require("../config/relations")
const { Op } = require("sequelize")

const getMatriculados = async (codigoCurso) => {
    try {
        const list = await Matricula.findAll({
            where: { CodigoCursoCalificacion: codigoCurso },
            include: [
                {
                    model: Estudiante,
                    include: Persona
                }
            ],
            order: [[Estudiante, Persona, "Paterno", "ASC"]]
        })

        const lista = list.map((item, index) => ({
            Numero: index + 1,
            CodigoSunedu: item.dataValues.Estudiante.CodigoSunedu,
            DNI: item.dataValues.Estudiante.Persona.DNI,
            Estudiante: item.dataValues.Estudiante.Persona.Paterno + ' ' + item.dataValues.Estudiante.Persona.Materno + ', ' + item.dataValues.Estudiante.Persona.Nombres
        }))

        let cursoData = await CursoCalificacion.findByPk(codigoCurso, {
            attributes: [],
            include: {
                model: Curso,
                include: CarreraProfesional
            }
        })

        const curso = cursoData.dataValues.Curso.toJSON()

        const data = { lista, curso }

        return data
    } catch (error) {
        console.error(error)
        throw new Error("Error al obtener la lista de matriculados")
    }
}

const getAsistentes = async (codigoCurso, codigoSesion) => {
    try {
        const matriculados = await Matricula.findAll({
            where: { CodigoCursoCalificacion: codigoCurso },
            attributes: { exclude: ['FechaMatricula', 'NotaFinal', 'Observacion', 'Nota1', 'Nota2', 'Nota3', 'Nota4', 'NotaRecuperacion', 'NotaAplazado'] },
            include: [
                {
                    model: Estudiante,
                    include: [
                        {
                            model: Persona
                        },
                        {
                            model: Asistencia,
                            where: { CodigoSesion: codigoSesion },
                            limit: 1
                        }
                    ]
                }
            ],
            order: [[Estudiante, Persona, "Paterno", "ASC"]]

        })

        const lista = matriculados.map((item, index) => ({
            Numero: index + 1,
            CodigoSunedu: item.dataValues.Estudiante.CodigoSunedu,
            DNI: item.dataValues.Estudiante.Persona.DNI,
            Estudiante: item.dataValues.Estudiante.Persona.Paterno + ' ' + item.dataValues.Estudiante.Persona.Materno + ', ' + item.dataValues.Estudiante.Persona.Nombres,
            Asistencia: item.dataValues.Estudiante.Asistencia.length == 0 ? 'No' : 'Sí'
        }))

        const cursoData = await CursoCalificacion.findByPk(codigoCurso, {
            attributes: [],
            include: {
                model: Curso,
                include: CarreraProfesional
            }
        })

        const sesionData = await Sesion.findByPk(codigoSesion)

        const curso = cursoData.dataValues.Curso.toJSON()
        const sesion = sesionData.toJSON()

        const data = { lista, curso, sesion }

        console.log(data)

        return data
    } catch (error) {
        console.error(error)

    }
}

const getActa = async (codigoCurso) => {
    try {
        let acta = await Acta.findOne({ where: { CodigoCursoCalificacion: codigoCurso } })
        const cursoCalificacion = await acta.getCursoCalificacion();

        acta = acta.toJSON()

        let curso = await cursoCalificacion.getCurso({ include: CarreraProfesional })
        curso = curso.toJSON()

        let docente = await cursoCalificacion.getDocente({ include: Persona })
        docente = docente.toJSON()

        let periodo = await cursoCalificacion.getPeriodo()
        periodo = periodo.toJSON()

        const matriculados = await cursoCalificacion.getMatriculas({
            include: [{
                model: Estudiante,
                attributes: ['Codigo', 'CodigoSunedu'],
                include: Persona
            }],
            order: [[Estudiante, Persona, 'Paterno', 'ASC']]
        })

        const lista = matriculados.map((item, index) => ({
            Numero: index + 1,
            CodigoSunedu: item.Estudiante.CodigoSunedu,
            Estudiante: item.Estudiante.Persona.Paterno + ' ' + item.Estudiante.Persona.Materno + ', ' + item.Estudiante.Persona.Nombres,
            Estado: item.Habilitado ? 'HABILITADO' : 'INHABILITADO',
            Promedio: item.NotaFinal,
            Obs: item.Observacion
        }))

        const numeroMatriculados = matriculados.length
        const aprobados = lista.filter(item => item.NotaFinal >= 11).length
        const desaprobados = lista.filter(item => item.NotaFinal < 11).length
        const desaprobadosInasistencia = lista.filter(item => item.Estado === "INHABILITADO").length
        const stats = { numeroMatriculados, aprobados, desaprobados, desaprobadosInasistencia }

        const data = { lista, curso, docente, acta, periodo, stats }

        return data
    } catch (error) {
        console.error(error)
    }
}

const getHistorialNotas = async (codigoEstudiante, carrera) => {
    try {
        const matriculas = await Matricula.findAll({
            where: { CodigoEstudiante: codigoEstudiante, NotaFinal: { [Op.not]: null }, '$CursoCalificacion.Periodo.Estado$': false},
            include: {
                model: CursoCalificacion,
                attributes: ["Codigo"],
                include: [Curso, Acta, Periodo]
            }
        })

        let estudiante = await Estudiante.findByPk(codigoEstudiante, {
            include: [Persona, CarreraProfesional]
        })

        estudiante = estudiante.toJSON()

        const _historial = matriculas.map(item => ({
            Codigo: item.CursoCalificacion.Curso.Codigo,
            Curso: item.CursoCalificacion.Curso.Nombre,
            Nota: item.NotaFinal,
            Ciclo: (item.CursoCalificacion.Curso.Nivel -1) * 2 + item.CursoCalificacion.Curso.Semestre,
            Creditos: item.CursoCalificacion.Curso.Creditos,
            Acta: item.CursoCalificacion.Actum?.Codigo,
            Fecha: item.CursoCalificacion.Actum?.FechaGeneracion,
        }))

        const historial = _historial.filter((acta) => acta.Codigo.substring(0, 2) === carrera.Siglas);


        const data = { historial, estudiante, carrera }

        return data
    } catch (error) {
        console.error(error)
    }
}

const getPDFMatriculados = async (req, res) => {
    try {
        const data = await getMatriculados(req.query.codigoCurso)
        console.log(data)
        await generarPDFMatriculados(data, res)
    } catch (error) {
        console.error(error)
    }
}

const getPDFAsistencia = async (req, res) => {
    try {
        const data = await getAsistentes(req.query.codigoCurso, req.query.codigoSesion)
        console.log(data)
        await generarPDFAsistencia(data, res)
    } catch (error) {
        console.error(error)
    }
}

const getPDFActa = async (req, res) => {
    try {
        const data = await getActa(req.query.codigoCurso)
        console.log(data)
        await generarPDFActa(data, res)
    } catch (error) {
        console.error(error)
    }
}

const getPDFHistorialNotas = async (req, res) => {
    try {
        const data = await getHistorialNotas(req.query.codigoEstudiante, req.query.carrera)
        console.log(data)
        await generarPDFHistorialNotas(data, res)

    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    getPDFMatriculados,
    getPDFAsistencia,
    getPDFActa,
    getPDFHistorialNotas
}