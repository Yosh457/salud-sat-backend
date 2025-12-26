const config = require('../config/config');

const errorHandler = (err, req, res, next) => {
    // Si el error no trae un código HTTP, usamos 500 (Server Error)
    const statusCode = err.statusCode || 500;
    
    // Respuesta estandarizada
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Error interno del servidor',
        // El stack solo se muestra en desarrollo (para no exponer rutas en cPanel)
        stack: config.NODE_ENV === 'development' ? err.stack : null
    });
};

module.exports = errorHandler;