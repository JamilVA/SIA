const { sequelize } = require('../config/database')
const { Curso, CursoCalificacion, Docente, Estudiante, Matricula, Periodo, Persona, UnidadAcademica, SemanaAcademica, Asistencia, CarreraProfesional, Sesion } = require('../config/relations')

const getCarrerasByJefe = async (req, res) => {
    try {
        const carreras = await CarreraProfesional.findAll({
            where: { CodigoJefeDepartamento: req.query.codigoJefe }
        })
        res.json({ carreras })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Ha ocurrido un error al cargar las carreras' })
    }
}

const getCursosCalificacion = async (req, res) => {
    try {
        const cursosCalificacion = await CursoCalificacion.findAll({
            attributes: ['Codigo', 'EstadoAplazado', 'EstadoRecuperacion', 'EstadoNotas', 'CodigoDocente', 'CodigoCurso', 'CodigoPeriodo'],
            include: [
                {
                    model: Periodo,
                    attributes: ['Codigo', 'Denominacion', 'Estado'],
                    where: { 'Estado': true }
                },
                {
                    model: Curso,
                    include: [{
                        model: CarreraProfesional,
                        attributes: [],
                    }
                    ]
                },
                {
                    model: Docente,
                    attributes: ['Codigo'],
                    include: [{ model: Persona, attributes: ['Paterno', 'Materno', 'Nombres'] }]
                }
            ],
            where: { '$Curso.CarreraProfesional.CodigoJefeDepartamento$': req.query.CodigoJefe }
        })
        res.json({ cursosCalificacion })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Ha ocurrido un error al procesar la solicitud' })
    }
}

const getCursosEstudiante = async (req, res) => {
    try {

        const { CodigoEstudiante } = req.query;

        const cursosCalificacion = await CursoCalificacion.findAll({
            include: [
                {
                    model: Periodo,
                    attributes: ['Codigo', 'Denominacion', 'Estado'],
                    where: { 'Estado': true }
                },
                {
                    model: Curso,
                    attributes: ['Codigo', 'Nombre'],
                },
                {
                    model: Matricula,
                    attributes: ['CodigoCursoCalificacion', 'CodigoEstudiante'],
                    where: { CodigoEstudiante }
                }
            ],
        })
        res.json({
            ok: true,
            cursosCalificacion
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Ha ocurrido un error al procesar la solicitud' })
    }
}

const crearCursoCalificacion = async (req, res) => {
    try {
        await sequelize.transaction(async (t) => {
            const cursoCalificacion = await CursoCalificacion.create(req.body, { transaction: t })

            await UnidadAcademica.bulkCreate(unidades(cursoCalificacion.Codigo), { transaction: t });

            const unidadesGeneradas = unidades(cursoCalificacion.Codigo);

            let semanaGlobalIndex = 1;

            for (let unidad of unidadesGeneradas) {
                const totalSemanas = (unidad.Codigo.charAt(0) === '4') ? 6 : 4;

                for (let semanaIndex = 1; semanaIndex <= totalSemanas; semanaIndex++) {
                    const codigoSemana = `${semanaGlobalIndex.toString().padStart(2, '0')}${unidad.Codigo}`;
                    const descripcionSemana = `Semana ${semanaGlobalIndex.toString().padStart(2, '0')}`;

                    await SemanaAcademica.create({
                        Codigo: codigoSemana,
                        Descripcion: descripcionSemana,
                        CodigoUnidadAcademica: unidad.Codigo
                    }, { transaction: t });

                    semanaGlobalIndex++;
                }
            }


            return res.json({
                mensaje: 'Curso a calificar creado',
                cursoCalificacion
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Ha ocurrido un error al habilitar el curso' })
    }
};

const generarUnidades = async (req, res) => {
    const codigoCurso = req.body.codigoCurso
    try {
        await sequelize.transaction(async (t) => {

            await UnidadAcademica.bulkCreate(unidades(codigoCurso), { transaction: t });

            const unidadesGeneradas = unidades(codigoCurso);

            let semanaGlobalIndex = 1;

            for (let unidad of unidadesGeneradas) {
                const totalSemanas = (unidad.Codigo.charAt(0) === '4') ? 6 : 4;

                for (let semanaIndex = 1; semanaIndex <= totalSemanas; semanaIndex++) {
                    const codigoSemana = `${semanaGlobalIndex.toString().padStart(2, '0')}${unidad.Codigo}`;
                    const descripcionSemana = `Semana ${semanaGlobalIndex.toString().padStart(2, '0')}`;

                    await SemanaAcademica.create({
                        Codigo: codigoSemana,
                        Descripcion: descripcionSemana,
                        CodigoUnidadAcademica: unidad.Codigo
                    }, { transaction: t });

                    semanaGlobalIndex++;
                }
            }


            return res.json({
                message: 'Unidades generadas correctamente',
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Ha ocurrido un error al generar las unidades' })
    }
};

const habilitarCursosPorCiclo = async (req, res) => {
    try {
        const codigoPeriodo = req.query.codigoPeriodo
        const codigoCarrera = req.query.codigoCarrera
        const ciclo = req.query.semestre // 1 -> impar, 2 -> par

        const periodo = await Periodo.findByPk(codigoPeriodo)

        if (!periodo) return res.json({ message: 'El periodo académico ingresado no existe' })
        if (periodo.Estado === false) return res.json({ message: 'No puede habilitar cursos en un periodo finalizado' })

        const cursos = await Curso.findAll({ where: { Semestre: ciclo, CodigoCarreraProfesional: codigoCarrera } })
        const cursosHabilitados = cursos.map(curso => ({
            Codigo: curso.Codigo + codigoPeriodo,
            EstadoAplazado: false,
            EstadoRecuperacion: false,
            EstadoNotas: false,
            CodigoCurso: curso.Codigo,
            CodigoPeriodo: codigoPeriodo
        }))

        await CursoCalificacion.bulkCreate(cursosHabilitados)

        return res.json({
            message: 'Los cursos se han habilitado correctamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Ha ocurrido un error al habilitar los cursos' })
    }
};

const editarCursoCalificacion = async (req, res) => {
    try {
        const curso = await CursoCalificacion.update(
            {
                Competencia: req.body.competencia,
                Capacidad: req.body.capacidad,
                RutaSyllabus: req.body.rutaSyllabus,
                RutaNormas: req.body.rutaNormas,
                RutaPresentacionCurso: req.body.rutaPresentacionCurso,
                RutaPresentacionDocente: req.body.rutaPresentacionDocente,
                RutaImagenPortada: req.body.rutaImagenPortada,
            },
            {
                where: {
                    Codigo: req.body.codigo,
                },
            }
        );
        res.json({
            Estado: "Actualizado con éxito",
            curso,
        });
    } catch (error) {
        res.json({
            Estado: "Error al Actualizar, " + error,
        });
    }
};



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

const getAsistentes = async (req, res) => {
    try {
        const matriculas = await Matricula.findAll({
            where: { CodigoCursoCalificacion: req.query.codigoCursoCalificacion },
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
                            where: { CodigoSesion: req.query.codigoSesion },
                            limit: 1
                        }
                    ]
                }
            ]

        })

        const sesion = await Sesion.findByPk(req.query.codigoSesion)

        const data = matriculas.sort((a, b) => {
            if (a.Estudiante.Persona.Paterno < b.Estudiante.Persona.Paterno) {
                return -1;
            }
            if (a.Estudiante.Persona.Paterno > b.Estudiante.Persona.Paterno) {
                return 1;
            }
            return 0;
        })

        const matriculados = data.map((matricula, index) => ({
            Numero: index + 1,
            Codigo: matricula.Estudiante.Codigo,
            Estudiante: `${matricula.Estudiante.Persona.Paterno} ${matricula.Estudiante.Persona.Materno} ${matricula.Estudiante.Persona.Nombres}`,
            Asistencias: matricula.PorcentajeAsistencia,
            Habilitado: matricula.Habilitado,
            Asistencia: matricula.Estudiante.Asistencia[0] === undefined ? false : matricula.Estudiante.Asistencia[0].Estado
        }))
        console.log(matriculados)
        res.json({ matriculados, sesion })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al obtener la lista de asistentes' })
    }
}

const getMatriculados = async (req, res) => {
    try {
        const matriculados = await Matricula.findAll({
            where: { CodigoCursoCalificacion: req.query.codigoCursoCalificacion },
            attributes: [],
            include: [
                {
                    model: Estudiante,
                    include: Persona
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
    try {
        const codigoCurso = req.query.codigoCurso
        const QUERY = "select count(*) as `sesiones` " +
            "from CursoCalificacion as c " +
            "inner join UnidadAcademica as u " +
            "on c.Codigo = u.CodigoCursoCalificacion and c.Codigo like ? " +
            "inner join SemanaAcademica as sa " +
            "on u.Codigo = sa.CodigoUnidadAcademica " +
            "inner join sesion as s " +
            "on sa.Codigo = s.CodigoSemanaAcademica"
        const [results, metadata] = await sequelize.query(QUERY, { replacements: [codigoCurso] })
        res.json(metadata[0])
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener la cantidad de sesiones' })
    }
}

module.exports = {
    getCursosCalificacion,
    getCursosEstudiante,
    crearCursoCalificacion,
    editarCursoCalificacion,
    habilitarIngresos,
    deshabilitarIngresos,
    eliminarCursoCalificacion,
    asignarDocente,
    habilitarIngreso,
    deshabilitarIngreso,
    getAsistentes,
    contarSesiones,
    getMatriculados,
    getCarrerasByJefe,
    habilitarCursosPorCiclo,
    generarUnidades
}