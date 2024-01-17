const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SemanaAcademica = sequelize.define('SemanaAcademica', {
    Codigo: {
        type: DataTypes.STRING(9),
        primaryKey: true
    },
    Denominacion: DataTypes.STRING(45)
})

module.exports = SemanaAcademica