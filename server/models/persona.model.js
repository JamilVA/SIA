const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Persona = sequelize.define('Persona', {
  codigo:
  {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  paterno: DataTypes.STRING(20),
  materno: DataTypes.STRING(20),
  nombres: DataTypes.STRING(40),
  rutaFoto: DataTypes.STRING(100),
  fechaNacimiento: DataTypes.DATE,
  sexo: DataTypes.CHAR(1),
  DNI: DataTypes.CHAR(8),
  email: DataTypes.STRING(100),
});

module.exports = Persona;
