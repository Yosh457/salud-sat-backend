const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
    host: config.DB.HOST,
    user: config.DB.USER,
    password: config.DB.PASS,
    database: config.DB.NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificación inicial de conexión (Solo para log de consola al arrancar)
pool.getConnection()
    .then(conn => {
        console.log('✅ Conexión a MySQL exitosa');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a MySQL:', err.message);
    });

module.exports = pool;