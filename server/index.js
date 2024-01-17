const express = require('express'); //de esta forma se importa en node

require('dotenv').config();
const { dbConnection } = require('./config/database');
const cors = require('cors');
const cookieParser = require('cookie-parser');

//Creando el servidor express
const app = express();

//Configuracion de CORS
app.use(cors({ origin: true, credentials: true }));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT ,DELETE');
    res.header('Access-Control-Allow-Credentials', true);
    next();
})

//Lectura y parseo del body
app.use(express.json());

//Lectuta de cookies
app.use(cookieParser());

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
app.use('/api/matricula', require('./routes/matricula.route'));
app.use('/api', require('./routes/auth.route'));
app.use('/api/asistencia', require('./routes/asistencia.route'))
app.use('/api/sesion', require('./routes/sesion.route'))
app.use('/api/actividad', require('./routes/actividad.route'))
app.use('/api/files', require('./routes/files.route'))

//Para levantar el servidor
app.listen(process.env.PORT, () => {
    console.log('Server running on port ' + process.env.PORT)
})

