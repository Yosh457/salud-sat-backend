const jwt = require('jsonwebtoken');
const config = require('../config/config');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        const error = new Error('Acceso denegado. No se proporcionó token.');
        error.statusCode = 401;
        return next(error);
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded; // Inyectamos los datos del usuario en la petición
        next();
    } catch (err) {
        const error = new Error('Token inválido o expirado');
        error.statusCode = 403;
        next(error);
    }
};

module.exports = { verificarToken };