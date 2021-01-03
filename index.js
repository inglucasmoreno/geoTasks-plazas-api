const chalk = require('chalk');
require('dotenv').config();

// [Express]
const express = require('express');
const app = express();
const api_port = process.env.API_PORT || 3001;

// [Base de datos] - MongoDB
const dbConnection = require('./database/config');
dbConnection();

// [Configuraciones]
app.use(require('cors')());
app.use(express.json());
app.use(express.static('public'));

// [Rutas]
app.get('/', (req, res) => res.json({welcome: 'Bienvenidos a Equinoccio Technology'}));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/plazas', require('./routes/plazas.routes'));

// [Ejecucion de servidor]
app.listen(api_port, () => {
    console.log(chalk.blue('[Desarrollador]') + ' - Equinoccio Technology');    
    console.log(chalk.blue('[Express]') + ` - Servidor corriendo en http://localhost:${api_port}`);
});