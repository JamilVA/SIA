const Estudiante = require("../models/estudiante.model");
const Persona = require("../models/persona.model");
const CarreraProfesional = require("../models/carreraProfesional.model");

const Usuario = require("../models/usuario.model");
const NivelUsuario = require("../models/nivelUsuario.model");

const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");

Persona.hasOne(Usuario, { foreignKey: "CodigoPersona" });
Usuario.belongsTo(Persona, { foreignKey: "CodigoPersona" });

Persona.hasOne(Estudiante, { foreignKey: "CodigoPersona" });
Estudiante.belongsTo(Persona, { foreignKey: "CodigoPersona" });

Estudiante.belongsTo(Persona, { foreignKey: "CodigoPersona" });
Persona.hasOne(Estudiante, { foreignKey: "CodigoPersona" });
Estudiante.belongsTo(CarreraProfesional, {
  foreignKey: "CodigoCarreraProfesional",
});

const getEstudiante = async (req, res) => {
  const estudiantes = await Estudiante.findAll({
    include: [Persona, CarreraProfesional],
  });

  res.json({
    ok: true,
    estudiantes,
  });
};

const crearEstudiante = async (req, res) => {
  try {
    const persona = await Persona.create({
      Codigo: null,
      Paterno: req.body.Paterno,
      Materno: req.body.Materno,
      Nombres: req.body.Nombres,
      RutaFoto: req.body.RutaFoto,
      FechaNacimiento: req.body.FechaNacimiento,
      Sexo: req.body.Sexo,
      DNI: req.body.DNI,
      Email: req.body.Email,
    });

    const estudiante = await Estudiante.create({
      Codigo: null,
      CodigoSunedu: req.body.CodigoSunedu,
      CreditosLlevados: req.body.CreditosLlevados,
      CreditosAprobados: req.body.CreditosAprobados,
      AnioIngreso: new Date().getFullYear().toString(),
      Estado: req.body.Estado,
      CodigoPersona: persona.Codigo,
      CodigoCarreraProfesional: req.body.CodigoCarreraProfesional,
    });

    const usuario = await Usuario.create({
      Codigo: null,
      Estado: true,
      CodigoPersona: persona.Codigo,
      CodigoNivelUsuario: 3,
    });

    res.json({
      Estado: "Guardado con éxito",
      persona,
      estudiante,
      usuario
    });
  } catch (error) {
    res.json({
      Estado: "Error",
      Error: error,
    });
  }
};

const actualizarEstudiante = async (req, res) => {
  try {
    const persona = await Persona.update(
      {
        Paterno: req.body.Paterno,
        Materno: req.body.Materno,
        Nombres: req.body.Nombres,
        RutaFoto: req.body.RutaFoto,
        FechaNacimiento: req.body.FechaNacimiento,
        Sexo: req.body.Sexo,
        DNI: req.body.DNI,
        Email: req.body.Email,
      },
      {
        where: {
          Codigo: req.body.CodigoPersona,
        },
      }
    );

    const estudiante = await Estudiante.update(
      {
        CodigoSunedu: req.body.CodigoSunedu,
        CreditosLlevados: req.body.CreditosLlevados,
        CreditosAprobados: req.body.CreditosAprobados,
        AnioIngreso: new Date().getFullYear().toString(),
        Estado: req.body.Estado,
        CodigoCarreraProfesional: req.body.CodigoCarreraProfesional,
      },
      {
        where: {
          Codigo: req.body.Codigo,
        },
      }
    );

    res.json({
      Estado: "Actualizado con éxito",
      persona,
      estudiante,
    });
  } catch (error) {
    res.json({
      Estado: "Error",
      Error: error,
    });
  }
};

const buscarEstudiante = async (req, res) => {
  try {
    let estudiante = await Estudiante.findOne({
      where: {
        "$Persona.DNI$": req.query.dni,
      },
      include: Persona,
    });

    res.json({
      mensaje: "Encontrado",
      estudiante,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getEstudiante,
  crearEstudiante,
  actualizarEstudiante,
  buscarEstudiante,
};
