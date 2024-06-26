const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Acta = sequelize.define('Acta', {
    Codigo: {
        type: DataTypes.CHAR(8),
        primaryKey: true
    },
    FechaGeneracion: DataTypes.DATE,
})

module.exports = Acta