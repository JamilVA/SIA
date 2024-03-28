const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Actividad = sequelize.define('Actividad', {
    Codigo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Titulo: DataTypes.STRING(100),
    RutaRecursoGuia: DataTypes.STRING(100),
    FechaApertura: DataTypes.DATE,
    FechaCierre: DataTypes.DATE
})

module.exports = Actividad