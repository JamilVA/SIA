const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Estudiante = sequelize.define('Estudiante', {
  Codigo:
  {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  CreditosLlevados: DataTypes.STRING(20),
  CreditosAprobados: DataTypes.STRING(20),
  AnioIngreso: DataTypes.STRING(4),
  CodigoSunedu: DataTypes.STRING(10),
  Estado: DataTypes.BOOLEAN,
  CodigoPersona: DataTypes.INTEGER,
  CodigoCarreraProfesional: DataTypes.INTEGER,
});

module.exports = Estudiante;
