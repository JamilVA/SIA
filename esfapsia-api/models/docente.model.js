const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Docente = sequelize.define('Docente', {
    Codigo:
    {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CondicionLaboral: DataTypes.STRING(20),
    Estado: DataTypes.BOOLEAN,
  });

module.exports = Docente;