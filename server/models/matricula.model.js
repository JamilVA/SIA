const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Matricula = sequelize.define("Matricula", {
  CodigoCursoCalificacion: {
    type: DataTypes.CHAR(8),
    allowNull: false,
    primaryKey: true,
  },
  CodigoEstudiante: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  FechaMatricula: DataTypes.DATE,
  PorcentajeAsistencia: DataTypes.DECIMAL,
  Habilitado: DataTypes.BOOLEAN,
  Nota1: DataTypes.FLOAT,
  Nota2: DataTypes.FLOAT,
  Nota3: DataTypes.FLOAT,
  Nota4: DataTypes.FLOAT,
  NotaRecuperacion: DataTypes.FLOAT,
  NotaAplazado: DataTypes.FLOAT,
  NotaFinal: DataTypes.INTEGER,
  Observacion: DataTypes.STRING(45),
});

module.exports = Matricula;
