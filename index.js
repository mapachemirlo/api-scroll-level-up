const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport'); 
const app = require('./app');
require('./config/passport')(passport); // Carga la configuración de passport

dotenv.config();

const routesV1 = require('./routes');
routesV1(app);

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO, {})
    .then(() => {
        console.log('--> Connected to mongodb <--');
        app.listen(PORT, () => {
            console.log(`==> API Running on port: ${PORT} <==`);
        });
    })
    .catch(error => {
        console.log('!! MONGODB ERROR: ', error);
    });
