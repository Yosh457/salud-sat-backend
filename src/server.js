const http = require('http');
const app = require('./app');
const config = require('./config/config');
const socketService = require('./services/socketService');

// 1. Crear el servidor HTTP nativo
const server = http.createServer(app);

// 2. Inicializar Socket.IO
socketService.init(server);

// 🛡️ BLINDAJE DE TIMEOUTS (Anti-Zombies)
// Evita que conexiones muertas ocupen RAM y sockets en Passenger
server.keepAliveTimeout = 60000;  // 60 segundos
server.headersTimeout = 65000;    // 65 segundos (Debe ser mayor que keepAlive)
server.requestTimeout = 30000;    // 30 segundos (Si un request tarda más, se corta)

// 3. Iniciar el servidor
server.listen(config.PORT, () => {
    console.log(`🛡️ Servidor Blindado corriendo en puerto: ${config.PORT}`);
    console.log(`🌍 Entorno: ${config.NODE_ENV}`);
});