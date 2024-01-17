const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Asistencia = sequelize.define('Asistencia', {
    CodigoSesion: {
        type: DataTypes.CHAR(12),
        primaryKey: true
    },
    CodigoEstudiante: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    Estado: DataTypes.BOOLEAN,
    Fecha: DataTypes.DATEONLY,
    Hora: DataTypes.TIME
})

module.exports = Asistencia