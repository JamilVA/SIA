const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ActividadEstudiante = sequelize.define('ActividadEstudiante', {

    Nota: DataTypes.DECIMAL,
    Observacion: DataTypes.TEXT,
    RutaTarea: DataTypes.STRING(100)
})

module.exports = ActividadEstudiante