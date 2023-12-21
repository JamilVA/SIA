const Curso = require("../models/curso.model");
const CursoCalificacion = require("../models/cursoCalificacion.model");
const Estudiante = require("../models/estudiante.model");
const Matricula = require("../models/matricula.model");
const Periodo = require("../models/periodo.model");
const Persona = require("../models/persona.model");
const CarreraProfesional = require("../models/carreraProfesional.model");

CarreraProfesional.hasMany(Curso,{foreignKey:'CodigoCarreraProfesional'})
Curso.belongsTo(CarreraProfesional,{foreignKey:'CodigoCarreraProfesional'})

Curso.hasMany(CursoCalificacion,{foreignKey:'CodigoCurso'})
CursoCalificacion.belongsTo(Curso,{foreignKey:'CodigoCurso'})

Periodo.hasMany(CursoCalificacion,{foreignKey:'CodigoPeriodo'})
CursoCalificacion.belongsTo(Periodo,{foreignKey:'CodigoPeriodo'})

CursoCalificacion.hasMany(Matricula, {foreignKey:"CodigoCursoCalificacion"})
Matricula.belongsTo(CursoCalificacion, {foreignKey:"CodigoCursoCalificacion"})

Estudiante.hasMany(Matricula, {foreignKey:"CodigoEstudiante"})
Matricula.belongsTo(Estudiante, {foreignKey:"CodigoEstudiante"})

const getMatricula = async (req, res) => {
  try {
    const { Email } = req.query;

    const estudiante = await Estudiante.findOne({
      include:[
        {
          model:Persona,
          attributes: ['Nombres','Paterno','Materno','Email'],
          where:{Email}
        }
      ]
    })

    const matriculas = await Matricula.findAll({
      attributes: { exclude: ['Observacion', 'Habilitado', 'PorcentajeAsistencia'] },
      where: {CodigoEstudiante: estudiante.Codigo}
    });

    const cursosCalificacion = await CursoCalificacion.findAll({
      attributes:['Codigo'],
      include:[
        {
          model:Curso,
          attributes:['Codigo','Nombre','Creditos','Nivel','Semestre','CodigoCurso','CodigoCarreraProfesional'],
          where:{CodigoCarreraProfesional:estudiante.CodigoCarreraProfesional}
        },{
          model:Periodo,
          attributes:['Codigo','InicioMatricula','FinMatricula'],
          where:{Estado:true}
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
          model:Persona,
          attributes: { exclude: ['DNI', 'FechaNacimiento', 'Sexo','RutaFoto'] },
        }
      ],
      where:{CodigoSunedu:CodigoSunedu}
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
      where:{
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

module.exports = {
  getMatricula,
  crearMatricula,
  actualizarMatricula,
  eliminarMatricula,
  buscarEstudiante
};
