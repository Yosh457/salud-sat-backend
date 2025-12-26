const db = require('../config/db');

const User = {
    // Buscar usuario por RUT (ahora usamos rut en vez de username)
    findByRut: async (rut) => {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE rut = ?', [rut]);
        return rows[0];
    },

    // Buscar usuario por ID
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        return rows[0];
    },

    // Crear usuario (útil para futuros registros)
    create: async (userData) => {
        const { rut, nombre_completo, email, password_hash, rol } = userData;
        const [result] = await db.query(
            'INSERT INTO usuarios (rut, nombre_completo, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
            [rut, nombre_completo, email, password_hash, rol || 'funcionario']
        );
        return result.insertId;
    }
};

module.exports = User;