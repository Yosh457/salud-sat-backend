const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

// GET /api/stats/dashboard -> Solo para Admins y Jefatura
router.get('/dashboard', statsController.getDashboardStats);

module.exports = router;