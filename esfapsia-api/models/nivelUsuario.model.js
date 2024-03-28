const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NivelUsuario = sequelize.define('NivelUsuario', {
    Codigo:
    {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nombre: DataTypes.STRING(20),
  });

module.exports = NivelUsuario;