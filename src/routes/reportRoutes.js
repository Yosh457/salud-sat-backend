const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

// Middleware inline para verificar rol de admin
const soloAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        const error = new Error('Acceso denegado. Solo administradores.');
        error.statusCode = 403;
        return next(error);
    }
    next();
};

// GET /api/reports/excel
router.get('/excel', soloAdmin, reportController.descargarReporteExcel);

module.exports = router;