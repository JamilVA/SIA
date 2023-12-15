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

app.use('/api/persona', require('./routes/persona.route'));
app.use('/api/estudiante', require('./routes/estudiante.route'));
app.use('/api/pago', require('./routes/pago.route'));
app.use('/api/docente', require('./routes/docente.route'));
app.use('/api/jefeDepartamento', require('./routes/jefeDepartamento.route'));
app.use('/api/curso', require('./routes/curso.route'));
app.use('/api/periodo', require('./routes/periodo.route'));
app.use('/api/curso-calificacion', require('./routes/cursoCalificacion.route'));
app.use('/api/horario', require('./routes/horario.route'));


//Para levantar el servidor
app.listen(process.env.PORT, ()=>{
    console.log('Server running on port ' + process.env.PORT)
})

