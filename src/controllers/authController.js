const jwt = require('jsonwebtoken');
const axios = require('axios');
const config = require('../config/config');
const User = require('../models/userModel');

const login = async (req, res, next) => {
    console.log("🔵 Intento de Login recibido:", req.body.email);

    try {
        const { email, password } = req.body;

        // 1️⃣ Conexión con Portal TICs (API)
        console.log(`📡 Consultando Portal TICs: ${config.PORTAL_URL}/api/auth/sso-login`);

        let portalResp;
        try {
            portalResp = await axios.post(
                `${config.PORTAL_URL}/api/auth/sso-login`,
                { email, password },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000 // Timeout de 5 segundos para no colgar
                }
            );
        } catch (axiosError) {
            // Manejo detallado de errores de Axios
            if (axiosError.response) {
                // El portal respondió con un error (401, 400, 500)
                console.error("🔴 Error del Portal TICs:", axiosError.response.status, axiosError.response.data);
                const msg = axiosError.response.data.message || 'Error en autenticación global';
                return res.status(axiosError.response.status).json({ message: msg });
            } else if (axiosError.request) {
                // No hubo respuesta (Portal caído o URL mal)
                console.error("🔴 El Portal TICs no responde. URL incorrecta o servidor caído.");
                return res.status(503).json({ message: 'El Portal de Identidad no responde.' });
            } else {
                console.error("🔴 Error configurando Axios:", axiosError.message);
                return res.status(500).json({ message: 'Error interno de conexión.' });
            }
        }

        const identity = portalResp.data.user;
        console.log("✅ Identidad Global validada:", identity.email);

        // 2️⃣ Autorización LOCAL (SAT)
        // Buscamos si ese ID global existe en nuestra tabla local
        // Nota: Asegúrate de usar findByGlobalId si tu modelo lo tiene, o findByEmail
        // Como limpiaste la tabla, usaremos el modelo híbrido o la consulta directa.

        // Usaremos el modelo que ya definimos en mensajes anteriores que busca por global_id
        // Si no tienes ese método específico, usamos el findUnlinked o adaptamos:
        const userLocal = await User.findByGlobalId(identity.usuario_global_id);

        if (!userLocal) {
            console.warn("⛔ Usuario válido en Portal pero SIN VÍNCULO en SAT");
            return res.status(403).json({ message: 'No tienes acceso habilitado al sistema SAT.' });
        }

        if (!userLocal.activo) {
            console.warn("⛔ Usuario desactivado localmente");
            return res.status(403).json({ message: 'Tu acceso al SAT ha sido revocado.' });
        }

        // 3️⃣ Generar Token SAT
        const token = jwt.sign(
            {
                id: userLocal.id,           // ID Local
                rol: userLocal.rol,         // Rol Local
                nombre: identity.nombre,    // Dato visual del Portal
                rut: identity.rut           // Dato visual del Portal
            },
            config.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            status: 'success',
            token,
            user: {
                nombre: identity.nombre,
                email: identity.email,
                rol: userLocal.rol
            }
        });

    } catch (error) {
        console.error("💥 Error Crítico en authController:", error);
        next(error);
    }
};

module.exports = { login };