const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const RecursoAcademico = sequelize.define('RecursoAcademico', {
    Codigo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Titulo: DataTypes.STRING(100),
    Ruta: DataTypes.STRING(100),
    Tipo: DataTypes.STRING(10),
})

module.exports = RecursoAcademico