const app = require('../app');
const authRoutes = require('./authRoutes');

module.exports = app => {
    app.use('/auth', authRoutes)
}