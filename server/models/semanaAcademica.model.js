const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SemanaAcademica = sequelize.define('SemanaAcademica', {
    Codigo: {
        type: DataTypes.STRING(11),
        primaryKey: true
    },
    Descripcion: DataTypes.STRING(45)
})

module.exports = SemanaAcademica