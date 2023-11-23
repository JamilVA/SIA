const Docente = require("../models/docente.model");
const Persona = require("../models/persona.model");
const Usuario = require("../models/usuario.model");
const NivelUsuario = require("../models/nivelUsuario.model");

NivelUsuario.hasMany(Usuario, { foreignKey: "CodigoNivelUsuario" });
Usuario.belongsTo(NivelUsuario, { foreignKey: "CodigoNivelUsuario" });

Persona.hasOne(Usuario, { foreignKey: "CodigoPersona" });
Usuario.belongsTo(Persona, { foreignKey: "CodigoPersona" });

Persona.hasOne(Docente, { foreignKey: "CodigoPersona" });
Docente.belongsTo(Persona, { foreignKey: "CodigoPersona" });

const getDocente = async (req, res) => {
  const docentes = await Docente.findAll({
    include: Persona,
    // where: { estado: true },
  });

  res.json({
    ok: true,
    docentes,
  });
};

const crearDocente = async (req, res) => {
  try {
    const persona = await Persona.create({
      Codigo: null,
      Paterno: req.body.paterno,
      Materno: req.body.materno,
      Nombres: req.body.nombres,
      RutaFoto: req.body.rutaFoto,
      FechaNacimiento: req.body.fechaNacimiento,
      Sexo: req.body.sexo,
      DNI: req.body.DNI,
      Email: req.body.email,
    });

    const docente = await Docente.create({
      Codigo: null,
      CondicionLaboral: req.body.condicionLaboral,
      Estado: true,
      CodigoPersona: persona.Codigo,
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
      docente,
      usuario,
    });
  } catch (error) {
    res.json({
      Estado: "Error al guardar, " + error,
    });
  }
};

const actualizarDocente = async (req, res) => {
  try {
    const persona = await Persona.update(
      {
        Paterno: req.body.paterno,
        Materno: req.body.materno,
        Nombres: req.body.nombres,
        RutaFoto: req.body.rutaFoto,
        FechaNacimiento: req.body.fechaNacimiento,
        Sexo: req.body.sexo,
        DNI: req.body.DNI,
        Email: req.body.email,
      },
      {
        where: {
          Codigo: req.body.codigoPersona,
        },
      }
    );

    const docente = await Docente.update(
      {
        CondicionLaboral: req.body.condicionLaboral,
        Estado: req.body.estado,
      },
      {
        where: {
          Codigo: req.body.codigo,
        },
      }
    );

    res.json({
      Estado: "Actualizado con éxito",
      persona,
      docente,
    });
  } catch (error) {
    res.json({
      Estado: "Error al Actualizar, " + error,
    });
  }
};

module.exports = {
  getDocente,
  crearDocente,
  actualizarDocente,
};
