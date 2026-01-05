const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const User = require('../models/userModel');

const login = async (req, res, next) => {
    try {
        const { rut, password } = req.body;

        // 1. Buscar usuario en el modelo
        const user = await User.findByRut(rut);

        // 2. Verificar contraseña de forma segura
        // bcrypt.compare compara el texto plano con el hash de la DB
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            const error = new Error('Credenciales incorrectas');
            error.statusCode = 401;
            throw error;
        }

        // 3. Generar JWT (Igual que antes)
        const token = jwt.sign(
            { id: user.id, rut: user.rut, rol: user.rol },
            config.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ status: 'success', token });
    } catch (error) {
        next(error);
    }
};

module.exports = { login };