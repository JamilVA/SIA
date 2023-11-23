const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Curso = sequelize.define('Curso', {
  Codigo:
  {
    type: DataTypes.CHAR(5),
    primaryKey: true,
  },
  Nombre: DataTypes.STRING(70),
  HorasTeoria: DataTypes.INTEGER,
  HorasPractica: DataTypes.INTEGER,
  Creditos: DataTypes.INTEGER,
  Nivel: DataTypes.INTEGER,
  Semestre: DataTypes.INTEGER,
  Tipo: DataTypes.STRING(3),
  Estado: DataTypes.BOOLEAN,
  ConPrerequisito: DataTypes.BOOLEAN,
  CodigoCurso: DataTypes.CHAR(5),
  CodigoCarreraProfesional: DataTypes.INTEGER,
});

module.exports = Curso;