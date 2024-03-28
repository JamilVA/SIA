const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Pago = require('./pago.model')

const ConceptoPago = sequelize.define('ConceptoPago', {
    Codigo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Denominacion: DataTypes.STRING(25),
    Monto: DataTypes.DECIMAL
})

module.exports = ConceptoPago;