const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");


const CursoCalificacion = sequelize.define('CursoCalificacion', {
    Codigo: {
        primaryKey: true,
        type: DataTypes.CHAR(8)
    },
    EstadoAplazado: DataTypes.BOOLEAN,
    EstadoRecuperacion: DataTypes.BOOLEAN,
    EstadoNotas: DataTypes.BOOLEAN,
    RutaSyllabus: DataTypes.STRING(100),
    RutaNormas: DataTypes.STRING(100),
    RutaPresentacionCurso: DataTypes.STRING(100),
    RutaPresentacionDocente: DataTypes.STRING(100),
    RutaImagenPortada: DataTypes.STRING(100),
    Competencia: DataTypes.TEXT,
    Capacidad: DataTypes.TEXT,
})

module.exports = CursoCalificacion;

