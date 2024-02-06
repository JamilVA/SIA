const Curso = require("../models/curso.model");
const CursoCalificacion = require("../models/cursoCalificacion.model");
const Estudiante = require("../models/estudiante.model");
const Matricula = require("../models/matricula.model");
const Periodo = require("../models/periodo.model");
const Persona = require("../models/persona.model");
const CarreraProfesional = require("../models/carreraProfesional.model");
const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");

CarreraProfesional.hasMany(Curso, { foreignKey: 'CodigoCarreraProfesional' })
Curso.belongsTo(CarreraProfesional, { foreignKey: 'CodigoCarreraProfesional' })

Curso.hasMany(CursoCalificacion, { foreignKey: 'CodigoCurso' })
CursoCalificacion.belongsTo(Curso, { foreignKey: 'CodigoCurso' })

Periodo.hasMany(CursoCalificacion, { foreignKey: 'CodigoPeriodo' })
CursoCalificacion.belongsTo(Periodo, { foreignKey: 'CodigoPeriodo' })

CursoCalificacion.hasMany(Matricula, { foreignKey: "CodigoCursoCalificacion" })
Matricula.belongsTo(CursoCalificacion, { foreignKey: "CodigoCursoCalificacion" })

Estudiante.hasMany(Matricula, { foreignKey: "CodigoEstudiante" })
Matricula.belongsTo(Estudiante, { foreignKey: "CodigoEstudiante" })

const getMatricula = async (req, res) => {
  try {
    const { Email } = req.query;

    const estudiante = await Estudiante.findOne({
      include: [
        {
          model: Persona,
          attributes: ['Nombres', 'Paterno', 'Materno', 'Email'],
          where: { Email }
        }
      ]
    })

    const matriculas = await Matricula.findAll({
      attributes: { exclude: ['Observacion', 'Habilitado', 'PorcentajeAsistencia'] },
      where: { CodigoEstudiante: estudiante.Codigo }
    });

    const cursosCalificacion = await CursoCalificacion.findAll({
      attributes: ['Codigo'],
      include: [
        {
          model: Curso,
          attributes: ['Codigo', 'Nombre', 'Creditos', 'Nivel', 'Semestre', 'CodigoCurso', 'CodigoCarreraProfesional'],
          where: { CodigoCarreraProfesional: estudiante.CodigoCarreraProfesional }
        }, {
          model: Periodo,
          attributes: ['Codigo', 'InicioMatricula', 'FinMatricula'],
          where: { Estado: true }
        }
      ]
    })

    const periodo = await Periodo.findOne({
      where: { estado: true },
    });

    res.json({
      ok: true,
      estudiante,
      matriculas,
      cursosCalificacion,
      periodo,
    });
  } catch (error) {
    res.json({
      Estado: "Error al cargar matriculas, " + error,
    });
  }
};

const buscarEstudiante = async (req, res) => {
  try {
    const { CodigoSunedu } = req.query;
    let estudiante = await Estudiante.findOne({
      include: [
        {
          model: Persona,
          attributes: { exclude: ['DNI', 'FechaNacimiento', 'Sexo', 'RutaFoto'] },
        }
      ],
      where: { CodigoSunedu: CodigoSunedu }
    });

    res.json({
      mensaje: "Encontrado",
      estudiante,
    });
  } catch (error) {
    console.log(error);
  }
};

const crearMatricula = async (req, res) => {
  try {
    const matricula = await Matricula.create({
      CodigoCursoCalificacion: req.body.codigoCursoCalificacion,
      CodigoEstudiante: req.body.codigoEstudiante,
      FechaMatricula: req.body.fechaMatricula,
    });

    res.json({
      Estado: "Guardado con éxito",
      matricula,
    });

  } catch (error) {
    res.json({
      Estado: "Error al guardar, " + error,
    });
  }
};

const eliminarMatricula = async (req, res) => {
  try {
    const matriculaEliminada = await Matricula.destroy({
      where: {
        CodigoCursoCalificacion: req.body.codigoCursoCalificacion,
        CodigoEstudiante: req.body.codigoEstudiante,
      }
    });

    res.json({
      Estado: "Eliminado con éxito",
      matriculaEliminada,
    });

  } catch (error) {
    res.json({
      Estado: "Error al eliminar, " + error,
    });
  }
};

const actualizarMatricula = async (req, res) => {
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

const getMatriculaByCurso = async (req, res) => {
  try {
    const curso = await Curso.findOne({
      attributes: ['Codigo', 'Nombre'],
      include: [
        {
          model: CursoCalificacion,
          attributes: ['Codigo', 'EstadoNotas', 'EstadoRecuperacion', 'EstadoAplazado'],
          where: { Codigo: req.query.codCurso },
          include: [
            {
              model: Periodo,
              attributes: ['Codigo', 'Estado'],
              where: { Estado: true }
            }
          ]
        },
        {
          model: CarreraProfesional,
          attributes: ['Codigo']
        }
      ]
    });

    const registroMatricula = await sequelize.query(`select e.CodigoSunedu, m.CodigoEstudiante, m.CodigoCursoCalificacion, concat(p.Paterno,' ', p.Materno,' ', p.Nombres) as Alumno, m.Nota1, m.Nota2, m.Nota3, m.Nota4, m.NotaRecuperacion, m.NotaFinal, m.NotaAplazado, m.PorcentajeAsistencia 
    from curso c join cursocalificacion cc
    on c.Codigo = cc.CodigoCurso join matricula m
    on cc.Codigo = m.CodigoCursoCalificacion join periodo pd
    on cc.CodigoPeriodo = pd.Codigo join estudiante e
    on m.CodigoEstudiante = e.Codigo join persona p
    on e.CodigoPersona = p.Codigo
    where cc.Codigo = '${req.query.codCurso}' and pd.Estado = 1
    order by Alumno ASC;`, { type: QueryTypes.SELECT });

    res.json({
      curso,
      registroMatricula,
    });
  } catch (error) {
    res.json({
      error: error + ''
    });
  }
}

const updateNotas = async (req, res) => {
  const n1 = req.body.Nota1;
  try {
    const matricula = await Matricula.update({
      Nota1: req.body.Nota1,
      Nota2: req.body.Nota2,
      Nota3: req.body.Nota3,
      Nota4: req.body.Nota4,
      NotaRecuperacion: req.body.NotaRecuperacion,
      NotaAplazado: req.body.NotaAplazado,
      NotaFinal: req.body.NotaFinal,
    },
      {
        where: {
          CodigoEstudiante: req.body.CodigoEstudiante,
          CodigoCursoCalificacion: req.body.CodigoCursoCalificacion
        }
      })
    res.json({
      Matricula: matricula,
      Estado: "Actualizado con éxito",
    });
  } catch (error) {
    res.json({
      Estado: 'Error' + error
    })
  }
}

module.exports = {
  getMatricula,
  crearMatricula,
  actualizarMatricula,
  eliminarMatricula,
  buscarEstudiante,
  getMatriculaByCurso,
  updateNotas
};
