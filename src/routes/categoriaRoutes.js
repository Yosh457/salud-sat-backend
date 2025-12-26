const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { verificarToken } = require('../middlewares/authMiddleware'); // <--- Importar

// ENDPOINT PÚBLICO
router.get('/health', categoriaController.getStatus);

// ENDPOINT PROTEGIDO
router.get('/', verificarToken, categoriaController.listarCategorias);

module.exports = router;