const express = require('express'); //de esta forma se importa en node

require('dotenv').config();
const { dbConnection } = require('./config/database');
const cors  = require('cors');

//Creando el servidor express
const app = express();

//Configuracion de CORS
app.use(cors());

//Lectura y parseo del body
app.use(express.json());

//Conexion a la BD
dbConnection();
//Para levantar el servidor
app.listen(process.env.PORT, ()=>{
    console.log('Server running on port ' + process.env.PORT)
})

