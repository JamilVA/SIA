const { Estudiante, Persona, Usuario, CarreraProfesional, Matricula } = require("../config/relations")
const bcrypt = require('bcryptjs');

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

const getEstudianteByCodPersona = async (req, res) => {
  try {
    const estudiante = await Estudiante.findOne({
      include: [Persona, CarreraProfesional],
      where: {
        Codigo: req.query.CodigoPersona,
      },
    });

    res.json({
      ok: true,
      estudiante,
    });
  } catch (error) {
    console.log(error);
  }
};

const hash = (password) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    console.log(hashPassword)
    return hashPassword;
  } catch (error) {
    console.log(error);
  }
}

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
      Direccion: req.body.Direccion,
      EmailPersonal: req.body.EmailPersonal,
      Celular: req.body.Celular
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

    const usuario = await Usuario.create(
      {
        Codigo: null,
        Estado: true,
        CodigoPersona: persona.Codigo,
        CodigoNivelUsuario: 4,
        Email: req.body.Email,
        Password: hash(req.body.DNI)
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
        Direccion: req.body.Direccion,
        EmailPersonal: req.body.EmailPersonal,
        Celular: req.body.Celular
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

const getNotas = async (req, res) => {
  try {
    const matricula = await Matricula.findOne({
      where: {
        CodigoCursoCalificacion: req.query.codigoCurso,
        CodigoEstudiante: req.query.codigoEstudiante
      }
    })
    if (!matricula) {
      return res.status(404).json({ message: 'Las notas no se han encontrado' })
    }
    res.json({ matricula: matricula })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener las notas' })
  }
}

module.exports = {
  getEstudiante,
  crearEstudiante,
  actualizarEstudiante,
  buscarEstudiante,
  getNotas,
  getEstudianteByCodPersona
};
