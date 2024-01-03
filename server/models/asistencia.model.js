const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Asistencia = sequelize.define('Asistencia', {
    Codigo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Tipo: DataTypes.BOOLEAN,
    Fecha: DataTypes.DATE,
    Hora: DataTypes.TIME
})

module.exports = Asistencia