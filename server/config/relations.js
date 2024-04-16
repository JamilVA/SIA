const Actividad = require("../models/actividad.model")
const Sesion = require("../models/sesion.model")
const ActividadEstudiante = require("../models/actividadEstudiante.model")
const Estudiante = require("../models/estudiante.model")
const Asistencia = require("../models/asistencia.model")
const Curso = require('../models/curso.model')
const CursoCalificacion = require('../models/cursoCalificacion.model')
const Docente = require('../models/docente.model')
const Matricula = require('../models/matricula.model')
const Periodo = require('../models/periodo.model')
const Persona = require('../models/persona.model')
const UnidadAcademica = require('../models/unidadAcademica.model')
const SemanaAcademica = require('../models/semanaAcademica.model')
const ConceptoPago = require("../models/conceptoPago.model")
const Pago = require("../models/pago.model")
const CarreraProfesional = require("../models/carreraProfesional.model")
const Usuario = require('../models/usuario.model')
const NivelUsuario = require('../models/nivelUsuario.model')
const JefeDepartamento = require('../models/jefeDepartamento.model')
const RecursoAcademico = require('../models/recursoAcademico.model')
const Horario = require('../models/horario.model')
const Acta = require("../models/acta.model")

Pago.belongsTo(ConceptoPago, { foreignKey: "CodigoConceptoPago" });
ConceptoPago.hasMany(Pago, { foreignKey: "CodigoConceptoPago" });

Estudiante.hasMany(Pago, { foreignKey: "CodigoEstudiante" });
Pago.belongsTo(Estudiante, { foreignKey: "CodigoEstudiante" });

Persona.hasOne(Estudiante, { foreignKey: "CodigoPersona" });
Estudiante.belongsTo(Persona, { foreignKey: "CodigoPersona" });

CarreraProfesional.hasMany(Estudiante, { foreignKey: "CodigoCarreraProfesional"})
Estudiante.belongsTo(CarreraProfesional, { foreignKey: "CodigoCarreraProfesional"});

Sesion.hasMany(Actividad, { foreignKey: 'CodigoSesion' })
Actividad.belongsTo(Sesion, { foreignKey: 'CodigoSesion' })

Actividad.hasMany(ActividadEstudiante, { foreignKey: 'CodigoActividad' })
ActividadEstudiante.belongsTo(Actividad, { foreignKey: 'CodigoActividad' })

Estudiante.hasMany(ActividadEstudiante, { foreignKey: 'CodigoEstudiante' })
ActividadEstudiante.belongsTo(Estudiante, { foreignKey: 'CodigoEstudiante' })

CursoCalificacion.belongsTo(Curso, { foreignKey: 'CodigoCurso' })
Curso.hasOne(CursoCalificacion, { foreignKey: 'CodigoCurso' })

Docente.hasMany(CursoCalificacion, { foreignKey: 'CodigoDocente' })
CursoCalificacion.belongsTo(Docente, { foreignKey: 'CodigoDocente' })

CursoCalificacion.hasMany(Matricula, { foreignKey: 'CodigoCursoCalificacion' })
Matricula.belongsTo(CursoCalificacion, { foreignKey: 'CodigoCursoCalificacion' })

Estudiante.hasMany(Matricula, { foreignKey: 'CodigoEstudiante' })
Matricula.belongsTo(Estudiante, { foreignKey: 'CodigoEstudiante' })

CarreraProfesional.hasMany(Curso, { foreignKey: 'CodigoCarreraProfesional' })
Curso.belongsTo(CarreraProfesional, { foreignKey: 'CodigoCarreraProfesional' })

Persona.hasOne(Usuario, { foreignKey: "CodigoPersona" });
Usuario.belongsTo(Persona, { foreignKey: "CodigoPersona" });

Persona.hasOne(Docente, { foreignKey: "CodigoPersona" });
Docente.belongsTo(Persona, { foreignKey: "CodigoPersona" });

NivelUsuario.hasMany(Usuario, { foreignKey: "CodigoNivelUsuario" });
Usuario.belongsTo(NivelUsuario, { foreignKey: "CodigoNivelUsuario" });

JefeDepartamento.belongsTo(Persona, { foreignKey: "CodigoPersona" });
Persona.hasOne(JefeDepartamento, { foreignKey: "CodigoPersona" });

CarreraProfesional.hasMany(Curso, { foreignKey: 'CodigoCarreraProfesional' });
Curso.belongsTo(CarreraProfesional, { foreignKey: 'CodigoCarreraProfesional' });

Periodo.hasMany(CursoCalificacion, { foreignKey: 'CodigoPeriodo' })
CursoCalificacion.belongsTo(Periodo, { foreignKey: 'CodigoPeriodo' })

Sesion.hasMany(RecursoAcademico, { foreignKey: 'CodigoSesion' })
RecursoAcademico.belongsTo(Sesion, { foreignKey: 'CodigoSesion' })

Curso.hasMany(CursoCalificacion, { foreignKey: "CodigoCurso" });
CursoCalificacion.belongsTo(Curso, { foreignKey: "CodigoCurso" });

CursoCalificacion.hasMany(UnidadAcademica, { foreignKey: "CodigoCursoCalificacion" });
UnidadAcademica.belongsTo(CursoCalificacion, { foreignKey: "CodigoCursoCalificacion" });

UnidadAcademica.hasMany(SemanaAcademica, { foreignKey: "CodigoUnidadAcademica" });
SemanaAcademica.belongsTo(UnidadAcademica, { foreignKey: "Codigo" });

SemanaAcademica.hasMany(Sesion, { foreignKey: "CodigoSemanaAcademica" });
Sesion.belongsTo(SemanaAcademica, { foreignKey: "CodigoSemanaAcademica" });

Sesion.hasMany(Asistencia, { foreignKey: "CodigoSesion" });
Asistencia.belongsTo(Sesion, { foreignKey: "CodigoSesion" });

Estudiante.hasMany(Asistencia, { foreignKey: "CodigoEstudiante" });
Asistencia.belongsTo(Estudiante, { foreignKey: "CodigoEstudiante" });

CursoCalificacion.hasMany(Horario, { foreignKey: 'CodigoCursoCalificacion' })
Horario.belongsTo(CursoCalificacion, { foreignKey: 'CodigoCursoCalificacion' })

CursoCalificacion.hasOne(Acta, { foreignKey: 'CodigoCursoCalificacion' })
Acta.belongsTo(CursoCalificacion, { foreignKey: 'CodigoCursoCalificacion' })

module.exports = {
    Actividad,
    Sesion,
    ActividadEstudiante,
    Estudiante,
    Asistencia,
    Curso,
    CursoCalificacion,
    Horario,
    Docente,
    Matricula,
    Periodo,
    Persona,
    UnidadAcademica,
    SemanaAcademica,
    Pago,
    ConceptoPago,
    CarreraProfesional,
    JefeDepartamento,
    RecursoAcademico,
    Usuario,
    NivelUsuario,
    Acta
}