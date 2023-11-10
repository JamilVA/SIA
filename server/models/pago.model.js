const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ConceptoPago = require('./conceptoPago.model');
const Periodo = require('./periodo.model');
const Estudiante = require('./estudiante.model');

const Pago = sequelize.define('Pago', {
    Codigo:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NumeroComprobante: DataTypes.STRING(10),   
    Fecha: DataTypes.DATE,
    EstadoPago: DataTypes.CHAR(1),
})

module.exports = Pago;