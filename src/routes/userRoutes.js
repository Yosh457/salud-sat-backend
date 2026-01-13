const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

// Todas las rutas requieren Token
router.use(verificarToken);

// --- RUTAS PÚBLICAS (Para cualquier usuario logueado) ---
// Obtener mi perfil
router.get('/me', userController.obtenerPerfil);
// Listar técnicos (Necesario para que un Admin o Técnico asigne tickets)
router.get('/tecnicos', userController.listarTecnicos); 


// --- RUTAS ADMINISTRATIVAS (Solo Admin) ---
// Gestión de Usuarios (Vínculos con Portal TICs)

// 1. Listar todos los usuarios vinculados (Panel)
router.get('/', permitirRoles('admin'), userController.listarUsuarios);

// 2. Listar usuarios globales NO vinculados (Select del Modal)
router.get('/disponibles', permitirRoles('admin'), userController.listarDisponibles);

// 3. Crear vínculo
router.post('/vincular', permitirRoles('admin'), userController.vincularUsuario);

// 4. Editar usuario local (Cambiar rol o desactivar)
router.put('/:id', permitirRoles('admin'), userController.actualizarUsuario);

module.exports = router;