const { Sequelize } = require("sequelize");
const { sequelize } = require("../config/database");

const {
  Curso,
  CursoCalificacion,
  UnidadAcademica,
  SemanaAcademica,
  Sesion,
  Asistencia,
  ActividadEstudiante,
  Estudiante,
  Persona,
  Horario,
  Periodo,
  CarreraProfesional,
} = require("../config/relations");

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
          include: [
            {
              model: CarreraProfesional,
              attributes: ["Codigo", "NombreCarrera"],
            },
          ],
        },
        {
          model: Horario,
        },
        {
          model: Periodo,
          attributes: ["FechaInicio"],
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
        exclude: ["EntradaDocente", "SalidaDocente"],
      },
      where: Sequelize.literal(
        `RIGHT(Codigo, 9) = '${CodigoCursoCalificacion}'`
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
    res.status(500).json({
      error: "Ha ocurrido un error al cargar las sesiones del docente",
    });
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
          include: [
            {
              model: CarreraProfesional,
              attributes: ["Codigo", "NombreCarrera"],
            },
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
        exclude: ["EntradaDocente", "SalidaDocente"],
      },
      where: Sequelize.literal(
        `RIGHT(Sesion.Codigo, 9) = '${CodigoCursoCalificacion}'`
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
    res.status(500).json({
      error: "Ha ocurrido un error al cargar las sesiones del estudiante",
    });
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
      LinkClaseVirtual: req.body.linkClaseVirtual,
      Fecha: req.body.fecha,
      HoraInicio: req.body.horaInicio,
      HoraFin: req.body.horaFin,
    });

    res.json({
      Estado: "Guardado con éxito",
      sesion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la creación de la sesión" });
  }
};

const crearSesionV2 = async (req, res) => {
  try {
    const codigoCursoCalificacion = req.body.codigoCursoCalificacion;
    const codigoUnidad = req.body.unidad + codigoCursoCalificacion; //unidad del 1 al 4
    const codigoSemana =
      req.body.semana < 10
        ? `0${req.body.semana}${codigoUnidad}`
        : `${req.body.semana}${codigoUnidad}`;

    const curso = await CursoCalificacion.findByPk(codigoCursoCalificacion, {
      attributes: ["Codigo"],
    });

    if (!curso) return res.json({ message: "El curso no está habilitado" });

    const { count, rows } = await Sesion.findAndCountAll({
      where: {
        CodigoSemanaAcademica: codigoSemana,
      },
      attributes: ["Codigo", "CodigoSemanaAcademica"],
    });

    if (count >= 2)
      return res.json({
        message: "No puede crear más sesiones en la semana seleccionada",
      });

    await sequelize.transaction(async (t) => {
      const [unidad, createdU] = await UnidadAcademica.findOrCreate({
        transaction: t,
        where: { Codigo: codigoUnidad },
        defaults: {
          Codigo: codigoUnidad,
          CodigoCursoCalificacion: codigoCursoCalificacion,
        },
      });

      const [semana, createdS] = await SemanaAcademica.findOrCreate({
        transaction: t,
        where: { Codigo: codigoSemana },
        defaults: {
          Codigo: codigoSemana,
          Descripcion: "",
          CodigoUnidadAcademica: unidad.Codigo,
        },
      });

      const sesion = await Sesion.create(
        {
          ...req.body,
          Codigo: count === 0 ? `1${semana.Codigo}` : `2${semana.Codigo}`,
          CodigoSemanaAcademica: semana.Codigo,
        },
        { transaction: t }
      );

      return res.json({
        message: "La sesión se ha creado correctamente",
        sesion: sesion,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
      message: "Ha ocurrido un error al crear la sesión",
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
    console.error(error);
    res.status(500).json({ error: "Error en la actualización de datos" });
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
    console.error(error);
    res.status(500).json({ error: "Error en la eliminación de la sesión" });
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

const deshabilitarAsistencia = async (req, res) => {
  try {
    let message;
    await Sesion.update(
      { EstadoAsistencia: false },
      {
        where: { Codigo: req.query.codigo },
      }
    );

    res.json({ message: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ha ocurrido un error" });
  }
};

const habilitarAsistencia = async (req, res) => {
  try {
    let message;

    await Sesion.update(
      { EstadoAsistencia: true },
      {
        where: { Codigo: req.query.codigo },
      }
    );

    res.json({ message: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ha ocurrido un error" });
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
  habilitarAsistencia,
  deshabilitarAsistencia,
  crearSesionV2,
};
