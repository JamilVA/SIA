const JefeDepartamento = require("../models/jefeDepartamento.model");
const Persona = require("../models/persona.model");
const Usuario = require("../models/usuario.model");
const NivelUsuario = require("../models/nivelUsuario.model");

NivelUsuario.hasMany(Usuario, { foreignKey: "CodigoNivelUsuario" });
Usuario.belongsTo(NivelUsuario, { foreignKey: "CodigoNivelUsuario" });

Persona.hasOne(Usuario, { foreignKey: "CodigoPersona" });
Usuario.belongsTo(Persona, { foreignKey: "CodigoPersona" });

JefeDepartamento.belongsTo(Persona, { foreignKey: "CodigoPersona" });
Persona.hasOne(JefeDepartamento, { foreignKey: "CodigoPersona" });

const getJefeDepartamento = async (req, res) => {
  const jefesDepartamento = await JefeDepartamento.findAll({
    include: Persona,
  });

  res.json({
    ok: true,
    jefesDepartamento,
  });
};

const crearJefeDepartamento = async (req, res) => {
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

    const jefeDepartamento = await JefeDepartamento.create({
      Codigo: null,
      Departamento: req.body.departamento,
      FechaAlta: new Date(),
      Estado: true,
      CodigoPersona: persona.Codigo,
    });
    const usuario = await Usuario.create({
      Codigo: null,
      Estado: true,
      CodigoPersona: persona.Codigo,
      CodigoNivelUsuario: 2,
    });
    res.json({
      Estado: "Guardado con éxito",
      persona,
      jefeDepartamento,
      usuario
    });
  } catch (error) {
    res.json({
      Estado: "Error al guardar, " + error,
    });
  }
};

const actualizarJefeDepartamento = async (req, res) => {
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

    const jefeDepartamento = await JefeDepartamento.update(
      {
        Departamento: req.body.departamento,
        FechaBaja: req.body.fechaBaja,
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
      jefeDepartamento,
    });
  } catch (error) {
    res.json({
      Estado: "Error al Actualizar, " + error,
    });
  }
};

module.exports = {
  getJefeDepartamento,
  crearJefeDepartamento,
  actualizarJefeDepartamento,
};
