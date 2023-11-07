const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Persona = require('./persona.model');

const JefeDepartamento = sequelize.define('JefeDepartamento', {
    Codigo:
    {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Departamento: DataTypes.STRING(60),
    FechaAlta: DataTypes.DATE,
    FechaBaja: DataTypes.DATE,
    Estado: DataTypes.BOOLEAN,
  });

  JefeDepartamento.belongsTo(Persona, {foreignKey: 'CodigoPersona'})

module.exports = JefeDepartamento;