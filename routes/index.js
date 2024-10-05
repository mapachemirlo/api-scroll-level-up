const app = require('../app');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

module.exports = app => {
    app.use('/auth', authRoutes)
    app.use('/user', userRoutes)
}