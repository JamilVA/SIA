//const mysql = require("mysql");
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.CONEX, {
    //host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true, //Esta opción evita que se busquen las tablas en plural
        timestamps: false //Esta opción evita las columnas createdAt y updatedAt
      }
  });


const dbConnection = async() => {
    try {
        
        await sequelize.authenticate();       
        //await mysql.createConnection(process.env.CONEX);
        console.log('Se ha conectado exitosamente a siaDB');

    } catch (error) {

        console.log(error);
        throw new Error('Error al conectar a siaDB');
        //process.exit(1); // detener la app
    }
    
}

module.exports ={
    sequelize,
    dbConnection
}