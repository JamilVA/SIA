const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UnidadAcemica = sequelize.define('UnidadAcademica', {
    Codigo: {
        type: DataTypes.STRING(9),
        primaryKey: true
    },
    Denominacion: DataTypes.STRING(45)
})

module.exports = UnidadAcemica