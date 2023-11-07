const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Pago = require('./pago.model');

const Periodo = sequelize.define('Periodo', {
    Codigo:{
        type: DataTypes.CHAR(3),
        primaryKey: true
    },
    Denominacion: DataTypes.CHAR(7),
    FechaInicio: DataTypes.DATE,
    FechaFin: DataTypes.DATE,
    InicioMatricula: DataTypes.DATE,
    FinMatricula: DataTypes.DATE,
    Estado: DataTypes.BOOLEAN
})

module.exports = Periodo;