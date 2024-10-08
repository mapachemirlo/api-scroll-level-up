const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();


const ensureAuth = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(403).send({ status: 'ERROR', message: 'The request does not have the authentication header' });
        }
        const token = req.headers.authorization.split(' ')[1];
        try {
            var payload = jwt.decode(token, process.env.JWT_SECRET);
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({ status: 'ERROR', message: 'TOKEN EXPIRED' });
            }
        } catch (e) {
            return res.status(404).send({ status: 'ERROR', message: 'INVALID TOKEN' });
        }
        req.user = payload;
        next();
    } catch (e) {
        res.status(e.code || 500).send({ status: e.status || 'ERROR', message: e.message });
    }
};

module.exports = {
    //authenticateJWT,
    ensureAuth
}






// const authenticateJWT = (req, res, next) => {
//     const token = req.headers.authorization?.split(' ')[1]; // Recibe el token del header (Bearer token)
  
//     if (!token) {
//       return res.status(401).json({ message: 'Token is missing' });
//     }
  
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) {
//         return res.status(403).json({ message: 'Invalid token' });
//       }
//       // Si el token es válido, guarda la info del usuario en req.user
//       req.user = decoded.user;
//       console.log(req.user)
//       next();
//     });
//   };
