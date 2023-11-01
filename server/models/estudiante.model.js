const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Persona = require('./persona.model');

const Estudiante = sequelize.define('Estudiante', {
  codigo:
  {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  creditosLlevados: DataTypes.STRING(20),
  creditosAprobados: DataTypes.STRING(20),
  anioIngreso: DataTypes.STRING(4),
  codigoSunedu: DataTypes.STRING(100),
  estado: DataTypes.BOOLEAN,
  codigoPersona: DataTypes.INTEGER
});

Estudiante.belongsTo(Persona, {foreignKey: 'CodigoPersona'})

module.exports = Estudiante;