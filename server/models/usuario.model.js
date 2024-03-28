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
  Email: {
    type: DataTypes.STRING(100),
    unique: true
  },
  Password: DataTypes.STRING(100)
});

module.exports = Usuario;