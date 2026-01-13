const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const errorHandler = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// 🛡️ BLINDAJE CORS
// Solo permitimos el dominio real de producción
const allowedOrigins = ['https://sat.mahosalud.cl'];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origen (como Postman o server-to-server) o si está en la lista
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por CORS: Origen no permitido'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ruta de prueba (Health Check ligero)
app.get('/', (req, res) => {
    res.json({ mensaje: "SAT - Backend Blindado Activo", env: config.NODE_ENV });
});

// Registro de rutas
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res, next) => {
    const error = new Error(`La ruta ${req.originalUrl} no existe`);
    error.statusCode = 404;
    next(error);
});

// Manejo global de errores Middleware
app.use(errorHandler);

module.exports = app;