const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = require('./app')

dotenv.config()

const routesV1 = require('./routes')
routesV1(app)

const PORT = process.env.PORT || 3001

mongoose.connect(process.env.MONGO, {
}).then(() => {
    console.log('--> Connected to mongodb <--')
    app.listen(PORT, () => {
        console.log(`==> API Running on port: ${PORT} <==`)
    })
}).catch(error => {
    console.log('!! MONGODB ERROR: ', error)
})