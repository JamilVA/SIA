const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Persona = require('./persona.model');

const Docente = sequelize.define('Docente', {
    Codigo:
    {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CodigoInterno: DataTypes.STRING(12),
    CondicionLaboral: DataTypes.STRING(20),
    Estado: DataTypes.BOOLEAN,
  });

module.exports = Docente;