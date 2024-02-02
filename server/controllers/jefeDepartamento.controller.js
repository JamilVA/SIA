const {CarreraProfesional, JefeDepartamento, Persona, Usuario, NivelUsuario} = require("../config/relations")

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

const asignarCarreraProfesional = async (req, res) => {
  try {
    const carrera = await CarreraProfesional.update(
      {
        CodigoJefeDepartamento: req.body.codigoJefeDepartamento,
      },
      {
        where: {
            Codigo: req.body.codigo,
        },
      }
    );

    res.json({
      Estado: "Actualizado con éxito",
      carrera,
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
  asignarCarreraProfesional
};
