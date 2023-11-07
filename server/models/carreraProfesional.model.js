const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const JefeDepartamento = require('./jefeDepartamento.model');

const CarreraProfesional = sequelize.define('CarreraProfesional', {
    Codigo:
    {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    NombreCarrera: DataTypes.STRING(60),
    RutaPlanEstudios: DataTypes.STRING(45),
    CodigoJefeDepartamento: DataTypes.INTEGER
  });

  CarreraProfesional.belongsTo(JefeDepartamento, {foreignKey: 'CodigoJefeDepartamento'})

module.exports = CarreraProfesional;