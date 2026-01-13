const User = require('../models/userModel');

// 1. Listar Usuarios Vinculados (Para el Panel de Gestión)
const listarUsuarios = async (req, res, next) => {
    try {
        const usuarios = await User.findAllLinkedUsers();
        res.json({ status: 'success', data: usuarios });
    } catch (error) {
        next(error);
    }
};

// 2. Listar Usuarios Globales Disponibles (Para el Select de Vincular)
const listarDisponibles = async (req, res, next) => {
    try {
        const disponibles = await User.findUnlinkedGlobalUsers();
        res.json({ status: 'success', data: disponibles });
    } catch (error) {
        next(error);
    }
};

// 3. Vincular Usuario (Crear registro local)
const vincularUsuario = async (req, res, next) => {
    try {
        const { usuario_global_id, rol } = req.body;
        
        if (!usuario_global_id || !rol) {
            const error = new Error('Faltan datos requeridos (usuario_global_id o rol)');
            error.statusCode = 400;
            throw error;
        }

        const nuevoId = await User.linkUser(usuario_global_id, rol);
        
        res.status(201).json({ 
            status: 'success', 
            message: 'Usuario vinculado exitosamente al SAT',
            data: { id: nuevoId }
        });
    } catch (error) {
        next(error);
    }
};

// 4. Actualizar Permisos (Rol / Estado)
const actualizarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params; // ID Local
        const { rol, activo } = req.body; // Solo permitimos editar esto localmente

        await User.updateLocalUser(id, { rol, activo });

        res.json({ status: 'success', message: 'Usuario actualizado correctamente' });
    } catch (error) {
        next(error);
    }
};

// 5. Listar Técnicos (Para asignar tickets) - Ya existía
const listarTecnicos = async (req, res, next) => {
    try {
        const tecnicos = await User.findTechnicians();
        res.json({ status: 'success', data: tecnicos });
    } catch (error) {
        next(error);
    }
};

// 6. Obtener Perfil (Mi cuenta) - Ya existía
const obtenerPerfil = async (req, res, next) => {
    try {
        // req.user.id viene del token (ID Local)
        const user = await User.findById(req.user.id);
        
        if (!user) {
            const error = new Error('Usuario no encontrado');
            error.statusCode = 404;
            throw error;
        }

        res.json({
            status: 'success',
            data: {
                id: user.id,
                rut: user.rut,
                nombre: user.nombre_completo,
                email: user.email,
                rol: user.rol,
                activo: user.activo
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    listarUsuarios, 
    listarDisponibles, 
    vincularUsuario, 
    actualizarUsuario, 
    listarTecnicos, 
    obtenerPerfil 
};