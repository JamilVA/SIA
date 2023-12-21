const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Estudiante = require("../models/estudiante.model");

const Matricula = sequelize.define("Matricula", {
  CodigoCursoCalificacion: {
    type: DataTypes.CHAR(8),
    allowNull: false,
    primaryKey: true,
  },
  CodigoEstudiante: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  FechaMatricula: DataTypes.DATE,
  PorcentajeAsistencia: DataTypes.DECIMAL,
  Habilitado: DataTypes.BOOLEAN,
  NotaFinal: DataTypes.INTEGER,
  Observacion: DataTypes.STRING(45),
});

Estudiante.hasMany(Matricula, {foreignKey:"CodigoEstudiante"})
Matricula.belongsTo(Estudiante, {foreignKey:"CodigoEstudiante"})

module.exports = Matricula;
