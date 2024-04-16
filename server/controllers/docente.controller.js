const { sequelize } = require("../config/database");
const { Docente, Persona, Usuario } = require("../config/relations");
const bcrypt = require("bcryptjs");

const getDocente = async (req, res) => {
  try {
    const docentes = await Docente.findAll({
      include: [
        {
          model: Persona,
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
      docentes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la carga de datos" });
  }
};

const getPerfilDocente = async (req, res) => {
  try {
    const { CodigoDocente } = req.query;

    const docente = await Docente.findOne({
      attributes: {
        exclude: ["CondicionLaboral", "Estado"],
      },
      include: [
        {
          model: Persona,
          attributes: ["Nombres", "Paterno", "Materno", "RutaFoto", "DNI"],
        },
      ],
      where: { CodigoPersona: CodigoDocente },
    });

    res.json({
      ok: true,
      docente,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la carga de datos del docente" });
  }
};

const hash = (password) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    return hashPassword;
  } catch (error) {
    console.log(error);
  }
};

const crearDocente = async (req, res) => {
  try {
    let persona = null
    let docente = null
    let usuario = null
    await sequelize.transaction(async (t) => {
      persona = await Persona.create({
        Codigo: null,
        Paterno: req.body.paterno,
        Materno: req.body.materno,
        Nombres: req.body.nombres,
        RutaFoto: req.body.rutaFoto,
        FechaNacimiento: req.body.fechaNacimiento,
        Sexo: req.body.sexo,
        DNI: req.body.DNI,
      }, { transaction: t });

      docente = await Docente.create({
        Codigo: null,
        CondicionLaboral: req.body.condicionLaboral,
        Estado: true,
        CodigoPersona: persona.Codigo,
      }, { transaction: t });

      usuario = await Usuario.create({
        Codigo: null,
        Estado: true,
        CodigoPersona: persona.Codigo,
        CodigoNivelUsuario: 3,
        Email: req.body.email,
        Password: hash(req.body.DNI),
      }, { transaction: t });
    })

    res.json({
      Estado: "Guardado con éxito",
      persona,
      docente,
      usuario,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el registro de datos" });
  }
};

const actualizarDocente = async (req, res) => {
  try {
    let persona = null
    let usuario = null
    let docente = null
    await sequelize.transaction(async (t) => {
      persona = await Persona.update(
        {
          Paterno: req.body.paterno,
          Materno: req.body.materno,
          Nombres: req.body.nombres,
          RutaFoto: req.body.rutaFoto,
          FechaNacimiento: req.body.fechaNacimiento,
          Sexo: req.body.sexo,
          DNI: req.body.DNI,
        },
        {
          where: {
            Codigo: req.body.codigoPersona,
          }, transaction: t
        }
      );

      usuario = await Usuario.update(
        {
          Email: req.body.email,
        },
        {
          where: {
            CodigoPersona: req.body.codigoPersona,
          }, transaction: t
        }
      );

      docente = await Docente.update(
        {
          CondicionLaboral: req.body.condicionLaboral,
          Estado: req.body.estado,
        },
        {
          where: {
            Codigo: req.body.codigo,
          }, transaction: t
        }
      );
    })

    res.json({
      Estado: "Actualizado con éxito",
      usuario,
      persona,
      docente,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la actualización de datos" });
  }
};

const actualizarFoto = async (req, res) => {
  try {
    const persona = await Persona.update(
      {
        RutaFoto: req.body.rutaFoto,
      },
      {
        where: {
          Codigo: req.body.codigoPersona,
        },
      }
    );

    res.json({
      Estado: "Actualizado con éxito",
      persona,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error en la actualización de foto docente" });
  }
};

module.exports = {
  getDocente,
  getPerfilDocente,
  crearDocente,
  actualizarDocente,
  actualizarFoto,
};
