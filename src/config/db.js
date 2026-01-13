const mysql = require('mysql2/promise');
const config = require('./config');

// 🛡️ CONFIGURACIÓN BLINDADA PARA PASSENGER/CPANEL
const pool = mysql.createPool({
    host: config.DB.HOST,
    user: config.DB.USER,
    password: config.DB.PASS,
    database: config.DB.NAME,
    
    waitForConnections: true,
    connectionLimit: 5,        // 👈 Límite estricto para evitar saturar MySQL con múltiples workers
    queueLimit: 0,
    
    enableKeepAlive: true,     // 👈 Mantiene conexiones vivas para eficiencia
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4'
});

// NOTA: Se eliminó la verificación de conexión al inicio (pool.getConnection)
// para evitar que cada worker de Passenger genere tráfico innecesario al arrancar.

module.exports = pool;