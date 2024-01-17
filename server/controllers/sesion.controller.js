const { Sequelize } = require("../config/database");
const CursoCalificacion = require("../models/cursoCalificacion.model");

const UnidadAcemica = require("../models/unidadAcademica.model");
const SemanaAcademica = require("../models/unidadAcademica.model");
const Sesion = require("../models/sesion.model");

CursoCalificacion.hasMany(UnidadAcemica, {
  foreignKey: "CodigoCursoCalificacion",
});
UnidadAcemica.belongsTo(CursoCalificacion, {
  foreignKey: "CodigoCursoCalificacion",
});

UnidadAcemica.hasMany(SemanaAcademica, { foreignKey: "CodugoUnidadAcademica" });
SemanaAcademica.belongsTo(UnidadAcemica, {
  foreignKey: "CodigoUnidadAcademica",
});

SemanaAcademica.hasMany(Sesion, { foreignKey: "CodigoSemanaAcademica" });
Sesion.belongsTo(SemanaAcademica, { foreignKey: "CodigoSemanaAcademica" });

const getSesiones = async (res, req) => {
  try {
    const { CodigoCursoCalificacion } = req.query;
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
      Codigo: req.body.codigoSesion,
      Numero: req.body.numero,
      Descripcion: req.body.descripcion,
      EstadoAsistencia: req.body.estadoAsistencia,
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
    res.json({
      Estado: "Error al guardar, " + error,
    });
  }
};

const actualizarSesion = async (req, res) => {
  try {
    const sesion = await Sesion.create(
      {
        Numero: req.body.numero,
        Descripcion: req.body.descripcion,
        EstadoAsistencia: req.body.estadoAsistencia,
        LinkClaseVirtual: req.body.linkClaseVirtual,
        Fecha: req.body.fecha,
        HoraInicio: req.body.horaInicio,
        HoraFin: req.body.horaFin,
      },
      {
        where: { Codigo: req.body.codigoSesion },
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
    await Sesion.update({ EntradaDocente: new Date() }, {
      where: { Codigo: req.query.codigoSesion }
    })
    res.json({message: 'Ingreso del docente marcada correctamente'})
  } catch (error) {
    console.error(error)
    res.status(500).json({message: 'Error al marcar el ingreso del docente'})
  }
}

const marcarSalidaDocente = async (req, res) => {
  try {
    await Sesion.update({ SalidaDocente: new Date() }, {
      where: { Codigo: req.query.codigoSesion }
    })
    res.json({message: 'Ingreso del docente marcada correctamente'})
  } catch (error) {
    console.error(error)
    res.status(500).json({message: 'Error al marcar la salida del docente'})
  }
}

module.exports ={
    getSesiones,
    crearSesion,
    actualizarSesion,
    eliminarSesion,
    marcarIngresoDocente,
    marcarSalidaDocente
}