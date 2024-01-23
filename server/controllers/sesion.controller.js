const { Sequelize } = require("sequelize");

const {Curso, CursoCalificacion, UnidadAcademica, SemanaAcademica, Sesion, Asistencia, ActividadEstudiante, Estudiante, Persona} = require("../config/relations")

const getSesionesDocente = async (req, res) => {
  try {
    const { CodigoCursoCalificacion } = req.query;

    const curso = await CursoCalificacion.findOne({
      attributes: {
        exclude: [
          "EstadoAplazado",
          "EstadoRecuperacion",
          "EstadoNotas",
          "CodigoDocente",
        ],
      },
      include: [
        {
          model: Curso,
          attributes: [
            "Codigo",
            "Nombre",
            "Creditos",
            "Nivel",
            "Semestre",
            "HorasTeoria",
            "HorasPractica",
          ],
        },
      ],
      where: { Codigo: CodigoCursoCalificacion },
    });

    const unidades = await UnidadAcademica.findAll({
      where: {
        CodigoCursoCalificacion: CodigoCursoCalificacion,
      },
    });

    const semanas = await SemanaAcademica.findAll({
      where: {
        CodigoUnidadAcademica: unidades.map((unidad) => unidad.Codigo),
      },
    });

    const sesiones = await Sesion.findAll({
      attributes: {
        exclude: ["HoraInicio", "HoraFin", "EntradaDocente", "SalidaDocente"],
      },
      where: Sequelize.literal(
        `RIGHT(Codigo, 8) = '${CodigoCursoCalificacion}'`
      ),
    });

    res.json({
      ok: true,
      curso,
      unidades,
      semanas,
      sesiones,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Ha ocurrido un error al procesar la solicitud" });
  }
};

const getSesionesEstudiante = async (req, res) => {
  try {
    const { CodigoCursoCalificacion, CodigoEstudiante } = req.query;

    const curso = await CursoCalificacion.findOne({
      attributes: {
        exclude: [
          "EstadoAplazado",
          "EstadoRecuperacion",
          "EstadoNotas",
          "CodigoDocente",
        ],
      },
      include: [
        {
          model: Curso,
          attributes: [
            "Codigo",
            "Nombre",
            "Creditos",
            "Nivel",
            "Semestre",
            "HorasTeoria",
            "HorasPractica",
          ],
        },
      ],
      where: { Codigo: CodigoCursoCalificacion },
    });

    const unidades = await UnidadAcademica.findAll({
      where: {
        CodigoCursoCalificacion: CodigoCursoCalificacion,
      },
    });

    const semanas = await SemanaAcademica.findAll({
      where: {
        CodigoUnidadAcademica: unidades.map((unidad) => unidad.Codigo),
      },
    });

    const sesiones = await Sesion.findAll({
      attributes: {
        exclude: ["HoraInicio", "HoraFin", "EntradaDocente", "SalidaDocente"],
      },
      where: Sequelize.literal(
        `RIGHT(Sesion.Codigo, 8) = '${CodigoCursoCalificacion}'`
      ),
      include: [
        {
          model: Asistencia,
          attributes: ["Estado"],
          where: {
            CodigoEstudiante: CodigoEstudiante,
          },
          required: false, // Hacer la inclusión como un LEFT JOIN
        },
      ],
    });

    res.json({
      ok: true,
      curso,
      unidades,
      semanas,
      sesiones,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Ha ocurrido un error al procesar la solicitud" });
  }
};

const crearSesion = async (req, res) => {
  try {
    const sesion = await Sesion.create({
      Codigo: req.body.codigo,
      Numero: parseInt(req.body.numero),
      Descripcion: req.body.descripcion,
      EstadoAsistencia: true,
      CodigoSemanaAcademica: req.body.codigoSemanaAcademica,
      // LinkClaseVirtual: req.body.linkClaseVirtual,
      // Fecha: req.body.fecha,
      // HoraInicio: req.body.horaInicio,
      // HoraFin: req.body.horaFin,
    });

    res.json({
      Estado: "Guardado con éxito",
      sesion,
    });
  } catch (error) {
    res.json({
      Estado: "Error al guardar, " + error,
    });
  }
};

const actualizarSesion = async (req, res) => {
  try {
    const sesion = await Sesion.update(
      {
        Descripcion: req.body.descripcion,
        EstadoAsistencia: req.body.estadoAsistencia,
        LinkClaseVirtual: req.body.linkClaseVirtual,
        Fecha: req.body.fecha,
        HoraInicio: req.body.horaInicio,
        HoraFin: req.body.horaFin,
      },
      {
        where: { Codigo: req.body.codigo },
      }
    );

    res.json({
      Estado: "Actualizado con éxito",
      sesion,
    });
  } catch (error) {
    res.json({
      Estado: "Error al Actualizar, " + error,
    });
  }
};

const eliminarSesion = async (req, res) => {
  try {
    const sesionEliminada = await Sesion.destroy({
      where: { Codigo: req.body.codigoSesion },
    });

    res.json({
      Estado: "Eliminado con éxito",
      sesionEliminada,
    });
  } catch (error) {
    res.json({
      Estado: "Error al eliminar, " + error,
    });
  }
};

const marcarIngresoDocente = async (req, res) => {
  try {
    await Sesion.update(
      { EntradaDocente: new Date() },
      {
        where: { Codigo: req.query.codigoSesion },
      }
    );
    res.json({ message: "Ingreso del docente marcada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al marcar el ingreso del docente" });
  }
};

const marcarSalidaDocente = async (req, res) => {
  try {
    await Sesion.update(
      { SalidaDocente: new Date() },
      {
        where: { Codigo: req.query.codigoSesion },
      }
    );
    res.json({ message: "Ingreso del docente marcada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al marcar la salida del docente" });
  }
};

const getActividadesCalificar = async (req, res) => {
  try {
    const actividades = await ActividadEstudiante.findAll({
      where: { CodigoActividad: req.query.codigoActividad },
      include: {
        model: Estudiante,
        include: Persona,
      },
    });
    res.json({ actividades: actividades });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener las actividades de la sesión" });
  }
};

module.exports = {
  getSesionesDocente,
  getSesionesEstudiante,
  crearSesion,
  actualizarSesion,
  eliminarSesion,
  marcarIngresoDocente,
  marcarSalidaDocente,
  getActividadesCalificar,
};
