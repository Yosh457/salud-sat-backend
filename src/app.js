const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const errorHandler = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: "SAT - Salud Alto Hospicio Funcionando", env: config.NODE_ENV });
});

// Registro de rutas
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res, next) => {
    const error = new Error(`La ruta ${req.originalUrl} no existe`);
    error.statusCode = 404;
    next(error);
});

// Manejo global de errores Middleware
app.use(errorHandler);

module.exports = app;