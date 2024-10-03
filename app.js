const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configura express-session antes de inicializar passport
app.use(session({
  secret: 'your_secret_key',  // Cambia esto por una clave secreta adecuada
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Cambiar a true si usamos HTTPS
}));


app.use(passport.initialize());
app.use(passport.session());

module.exports = app;











// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const passport = require('passport');

// const app = express();

// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// // Inicializa passport
// app.use(passport.initialize()); // Para que Passport funcione en todas las rutas

// // Si voy a  utilizar sesiones, activar esto (si no, no darle bola):
// // const session = require('express-session');
// // app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
// // app.use(passport.session()); 

// module.exports = app;