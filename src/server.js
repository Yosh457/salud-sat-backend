const app = require('./app');
const config = require('./config/config');

app.listen(config.PORT, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${config.PORT}`); // <--- URL Clickeable
    console.log(`🌍 Entorno: ${config.NODE_ENV}`);
});