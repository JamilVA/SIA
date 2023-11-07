const { DataTypes } = require ('sequelize');
import sequelize from "../config/database.js";

const Curso = sequelize.define('Curso', {
  Codigo:DataTypes.CHAR(5),
  Nombre: DataTypes.STRING(70),
  HorasTeoria: DataTypes.INTEGER,
  HorasPractica: DataTypes.INTEGER,
  Creditos: DataTypes.INTEGER,
  Nivel: DataTypes.INTEGER,
  Semestre: DataTypes.INTEGER,
  Tipo: DataTypes.STRING(3),
  Estado: DataTypes.BOOLEAN,
  ConPrerequisito: DataTypes.BOOLEAN,
  CodigoCurso: CHAR(5)
});

module.exports = Curso;