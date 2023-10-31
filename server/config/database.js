const mysql = require("mysql");


const dbConnection = async() => {
    try {
        //Debemos utilizar la cadena de conexion que tenemos en mongocompass        
        await mysql.createConnection(process.env.CONEX);
        console.log('Se ha conectado exitosamente a siaDB')

    } catch (error) {

        console.log(error);
        throw new Error('Error al conectar a siaDB');
        //process.exit(1); // detener la app
    }
    
}

module.exports ={
    dbConnection
}