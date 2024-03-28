const {
  CarreraProfesional,
  JefeDepartamento,
  Persona,
  Usuario,
} = require("../config/relations");

const getJefeDepartamento = async (req, res) => {
  try {
    const jefesDepartamento = await JefeDepartamento.findAll({
      include: [
        {
          model: Persona,
          attributes: {
            exclude: ["Direccion", "Celular", "EmailPersonal"],
          },
          include: [
            {
              model: Usuario,
            },
          ],
        },
      ],
    });

    res.json({
      ok: true,
      jefesDepartamento,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la carga de datos" });
  }
};

const crearJefeDepartamento = async (req, res) => {
  try {
    const persona = await Persona.create({
      Codigo: null,
      Paterno: req.body.paterno,
      Materno: req.body.materno,
      Nombres: req.body.nombres,
      FechaNacimiento: req.body.fechaNacimiento,
      Sexo: req.body.sexo,
      DNI: req.body.DNI,
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
      Email: req.body.email,
    });
    res.json({
      Estado: "Guardado con éxito",
      persona,
      jefeDepartamento,
      usuario,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el registro de datos" });
  }
};

const actualizarJefeDepartamento = async (req, res) => {
  try {
    const persona = await Persona.update(
      {
        Paterno: req.body.paterno,
        Materno: req.body.materno,
        Nombres: req.body.nombres,
        FechaNacimiento: req.body.fechaNacimiento,
        Sexo: req.body.sexo,
        DNI: req.body.DNI,
      },
      {
        where: {
          Codigo: req.body.codigoPersona,
        },
      }
    );

    const usuario = await Usuario.create(
      {
        Email: req.body.email,
      },
      {
        where: {
          CodigoPersona: req.body.codigoPersona,
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
      usuario,
      persona,
      jefeDepartamento,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el registro de datos" });
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
    console.error(error);
    res.status(500).json({ error: "Error en la asignación de carrera" });
  }
};

const asignarDocente = async (req, res) => {
  try {
    const usuario = await Usuario.update(
      {
        CodigoNivelUsuario: 2,
      },
      {
        where: {
          CodigoPersona: req.body.Codigo,
        },
      }
    );

    const jefeDepartamento = await JefeDepartamento.create({
      Codigo: null,
      Departamento: req.body.Departamento,
      FechaAlta: new Date(),
      Estado: true,
      CodigoPersona: req.body.Codigo,
    });

    res.json({
      Estado: "Guardado con éxito",
      jefeDepartamento,
      usuario,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error en la asignación de docente como jefe" });
  }
};

module.exports = {
  getJefeDepartamento,
  crearJefeDepartamento,
  actualizarJefeDepartamento,
  asignarCarreraProfesional,
  asignarDocente,
};
