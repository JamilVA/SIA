const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Horario = sequelize.define('Horario', {
    Codigo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Dia: DataTypes.STRING(10),
    HoraInicio: DataTypes.TIME,
    HoraFin: DataTypes.TIME,
    NombreAula: DataTypes.STRING(25),
    NumeroAula: DataTypes.INTEGER
})

module.exports = Horario

