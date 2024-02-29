const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Persona = sequelize.define('Persona', {
  Codigo:
  {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Paterno: DataTypes.STRING(20),
  Materno: DataTypes.STRING(20),
  Nombres: DataTypes.STRING(40),
  RutaFoto: DataTypes.STRING(100),
  FechaNacimiento: DataTypes.DATE,
  Sexo: DataTypes.CHAR(1),
  DNI: DataTypes.CHAR(8),
  Direccion: DataTypes.STRING(100),
  EmailPersonal: DataTypes.STRING(100),
  Celular: DataTypes.CHAR(9)
});

module.exports = Persona;

