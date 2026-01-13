const jwt = require('jsonwebtoken');
const config = require('../config/config'); // Asegúrate que esto apunte a tu config

// 1. Middleware para verificar que el usuario está logueado
const verificarToken = (req, res, next) => {
    // Buscar el header de autorización
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        const error = new Error('Acceso denegado. No se proporcionó token.');
        error.statusCode = 401;
        return next(error);
    }

    try {
        // Verificar el token usando la clave secreta (variable de entorno)
        const verified = jwt.verify(token, config.JWT_SECRET);
        req.user = verified; // Guardamos los datos del usuario en la request
        next(); // Continuamos
    } catch (error) {
        const err = new Error('Token inválido o expirado.');
        err.statusCode = 401;
        return next(err);
    }
};

// 2. Middleware para restringir acceso por roles (ESTA ERA LA QUE FALTABA O FALLABA)
const permitirRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
            const error = new Error('No tienes permisos para realizar esta acción.');
            error.statusCode = 403; // Forbidden
            return next(error);
        }
        next();
    };
};

// 👇 IMPORTANTE: Exportar AMBAS funciones
module.exports = {
    verificarToken,
    permitirRoles
};