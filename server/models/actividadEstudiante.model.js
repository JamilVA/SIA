const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ActividadEstudiante = sequelize.define('ActividadEstudiante', {
    CodigoActividad: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },

    Nota: DataTypes.DECIMAL,
    Observacion: DataTypes.TEXT,
    RutaTarea: DataTypes.STRING(100)
})

module.exports = ActividadEstudiante