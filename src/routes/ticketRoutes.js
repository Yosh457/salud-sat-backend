const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verificarToken } = require('../middlewares/authMiddleware');
const upload = require('../services/storageService');

// Todas las rutas de tickets requieren autenticación
router.use(verificarToken);

// POST /api/tickets -> Crear ticket
router.post('/', ticketController.crearTicket);

// GET /api/tickets -> Listar tickets (con filtro automático por rol)
router.get('/', ticketController.listarTickets);

// GET /api/tickets/:id -> Ver detalle
router.get('/:id', ticketController.obtenerTicket);

// PUT /api/tickets/:id -> Actualizar (Asignar, Cerrar, Cambiar prioridad)
router.put('/:id', ticketController.actualizarTicket);

// POST /api/tickets/:id/evidencia
router.post('/:id/evidencia', upload.single('evidencia'), ticketController.subirEvidencia);

// GET /api/tickets/:id/evidencia -> Ver lista de archivos
router.get('/:id/evidencia', ticketController.listarEvidencias);

// GET /api/tickets/:id/historial -> Ver bitácora del ticket
router.get('/:id/historial', ticketController.verHistorial);

module.exports = router;