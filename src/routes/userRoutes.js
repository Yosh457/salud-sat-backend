const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

// GET /api/users/tecnicos -> Listar personal resolutor
router.get('/tecnicos', userController.listarTecnicos);
// GET /api/users/me -> Obtener perfil del usuario autenticado
router.get('/me', userController.obtenerPerfil);

module.exports = router;