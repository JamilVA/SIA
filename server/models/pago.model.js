const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pago = sequelize.define('Pago', {
    Codigo:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NroTransaccion: {
        type: DataTypes.STRING(7),
        unique: true
    },   
    Fecha: DataTypes.DATE,
    EstadoPago: DataTypes.CHAR(1),
    Observacion: DataTypes.STRING(100),
})

module.exports = Pago;