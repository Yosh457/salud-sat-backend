require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET,
    PORTAL_URL: process.env.PORTAL_URL,
    DB: {
        HOST: process.env.DB_HOST,
        USER: process.env.DB_USER,
        PASS: process.env.DB_PASS,
        NAME: process.env.DB_NAME
    }
};