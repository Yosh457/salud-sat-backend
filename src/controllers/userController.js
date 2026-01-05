const User = require('../models/userModel');

const listarTecnicos = async (req, res, next) => {
    try {
        const tecnicos = await User.findTechnicians();
        res.json({ status: 'success', data: tecnicos });
    } catch (error) {
        next(error);
    }
};

module.exports = { listarTecnicos };

// NUEVO MÉTODO
const obtenerPerfil = async (req, res, next) => {
    try {
        // req.user.id viene del token decodificado en el middleware
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
                nombre: user.nombre_completo, // ✅ Aquí viaja limpio en JSON UTF-8
                email: user.email,
                rol: user.rol
            }
        });
    } catch (error) {
        next(error);
    }
};

// ... exportar ...
module.exports = { listarTecnicos, obtenerPerfil }; // <--- Agregar obtenerPerfil