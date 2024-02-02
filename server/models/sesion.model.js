const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Sesion = sequelize.define('Sesion', {
    Codigo: {
        type: DataTypes.STRING(12),
        primaryKey: true
    },
    Numero: DataTypes.INTEGER,
    Descripcion: DataTypes.STRING(100),
    EstadoAsistencia: DataTypes.TINYINT,
    LinkClaseVirtual: DataTypes.STRING(60),
    Fecha: DataTypes.DATEONLY,
    HoraInicio: DataTypes.TIME,
    HoraFin: DataTypes.TIME,
    EntradaDocente: DataTypes.TIME,
    SalidaDocente: DataTypes.TIME,
})

module.exports = Sesion