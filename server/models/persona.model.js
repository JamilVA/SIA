const   { Sequelize, DataTypes } = require ('sequelize');

const sequelize = new Sequelize('mysql::memory:');

const Persona = sequelize.define('Persona', {
  codigo: DataTypes.INTEGER,
  paterno: DataTypes.STRING(20),
  materno: DataTypes.STRING(20),
  nombres: DataTypes.STRING(40),
  rutaFoto: DataTypes.STRING(100),
  fechaNacimiento: DataTypes.DATE,
  sexo: DataTypes.CHAR(1),
  DNI: DataTypes.CHAR(8),
  email: DataTypes.STRING(100),
});

module.exports =  {Persona};
