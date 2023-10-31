const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Persona = require('./persona.model');

const Estudiante = sequelize.define('Estudiante', {
  codigo:
  {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  creditosLlevados: DataTypes.STRING(20),
  creditosAprobados: DataTypes.STRING(20),
  anioIngreso: DataTypes.STRING(40),
  codigoSunedu: DataTypes.STRING(100),
  estado: DataTypes.DATE,
});

Estudiante.belongsTo(Persona, {foreignKey: 'CodigoPersona'})

module.exports = Estudiante;