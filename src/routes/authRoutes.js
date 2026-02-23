const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Ruta pública de inicio de sesión
router.post('/login', authController.login);

// Ruta protegida para forzar el cambio de contraseña
router.post('/change-password', verificarToken, authController.cambiarClave);

module.exports = router;