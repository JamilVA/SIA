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
const UnidadAcemica = require('../models/unidadAcademica.model')
const SemanaAcademica = require('../models/semanaAcademica.model')
const ConceptoPago = require("../models/conceptoPago.model");
const Pago = require("../models/pago.model");

ConceptoPago.hasMany(Pago, { foreignKey: "CodigoConceptoPago" });
Pago.belongsTo(ConceptoPago, { foreignKey: "CodigoConceptoPago" });

Estudiante.hasMany(Pago, { foreignKey: "CodigoEstudiante" });
Pago.belongsTo(Estudiante, { foreignKey: "CodigoEstudiante" });

Persona.hasOne(Estudiante, { foreignKey: "CodigoPersona" });
Estudiante.belongsTo(Persona, { foreignKey: "CodigoPersona" });

Estudiante.hasMany(Asistencia, { foreignKey: 'CodigoEstudiante' })
Asistencia.belongsTo(Estudiante, { foreignKey: 'CodigoEstudiante' })

Sesion.hasMany(Asistencia, { foreignKey: 'CodigoSesion' })
Asistencia.belongsTo(Sesion, { foreignKey: 'CodigoSesion' })

Sesion.hasMany(Actividad, { foreignKey: 'CodigoSesion' })
Actividad.belongsTo(Sesion, { foreignKey: 'CodigoSesion' })

Actividad.hasMany(ActividadEstudiante, { foreignKey: 'CodigoActividad' })
ActividadEstudiante.belongsTo(Actividad, { foreignKey: 'CodigoActividad' })

Estudiante.hasMany(ActividadEstudiante, { foreignKey: 'CodigoEstudiante' })
ActividadEstudiante.belongsTo(Estudiante, { foreignKey: 'CodigoEstudiante' })

CursoCalificacion.belongsTo(Curso, { foreignKey: 'CodigoCurso' })
Curso.hasOne(CursoCalificacion, { foreignKey: 'CodigoCurso' })

Periodo.hasMany(CursoCalificacion, { foreignKey: 'CodigoPeriodo' })
CursoCalificacion.belongsTo(Periodo, { foreignKey: 'CodigoPeriodo' })

Docente.hasMany(CursoCalificacion, { foreignKey: 'CodigoDocente' })
CursoCalificacion.belongsTo(Docente, { foreignKey: 'CodigoDocente' })

CursoCalificacion.hasMany(Matricula, { foreignKey: 'CodigoCursoCalificacion' })
Matricula.belongsTo(CursoCalificacion, { foreignKey: 'CodigoCursoCalificacion' })

Estudiante.hasMany(Matricula, { foreignKey: 'CodigoEstudiante' })
Matricula.belongsTo(Estudiante, { foreignKey: 'CodigoEstudiante' })

CursoCalificacion.hasMany(UnidadAcemica, { foreignKey: 'CodigoCursoCalificacion' })
UnidadAcemica.belongsTo(CursoCalificacion, { foreignKey: 'CodigoCursoCalificacion' })

UnidadAcemica.hasMany(SemanaAcademica, { foreignKey: 'CodigoUnidadAcademica' })
SemanaAcademica.belongsTo(UnidadAcemica, { foreignKey: 'CodigoUnidadAcademica' })

module.exports = {
    Actividad,
    Sesion,
    ActividadEstudiante,
    Estudiante,
    Asistencia,
    Curso,
    CursoCalificacion,
    Docente,
    Matricula,
    Periodo,
    Persona,
    UnidadAcemica,
    SemanaAcademica,
    Pago,
    ConceptoPago
}