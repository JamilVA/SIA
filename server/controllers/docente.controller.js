const {Docente, Persona, Usuario, Persona} = require("../config/relations")

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
