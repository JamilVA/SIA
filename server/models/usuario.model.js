const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  Codigo:
  {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Estado: DataTypes.BOOLEAN,
  Email: DataTypes.STRING(100),
  Password: DataTypes.STRING(100)
});

module.exports = Usuario;