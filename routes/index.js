const app = require('../app');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const eventRoutes = require('./eventRoutes');
const trackRoutes = require('./trackRoutes');

module.exports = app => {
    app.use('/auth', authRoutes)
    app.use('/users', userRoutes)
    app.use('/projects', projectRoutes)
    app.use('/events', eventRoutes)
    app.use('/tracks', trackRoutes)
}