const db = require('../config/db');

const Ticket = {
    // Crear un nuevo ticket
    create: async (data) => {
        const { usuario_id, titulo, descripcion, prioridad, categoria } = data;
        const [result] = await db.query(
            'INSERT INTO tickets (usuario_id, titulo, descripcion, prioridad, categoria) VALUES (?, ?, ?, ?, ?)',
            [usuario_id, titulo, descripcion, prioridad || 'media', categoria || 'General']
        );
        return result.insertId;
    },

    // Obtener todos los tickets (Para Admin/Técnicos)
    findAll: async () => {
        const sql = `
            SELECT t.*, u.nombre_completo as autor, tec.nombre_completo as tecnico
            FROM tickets t
            JOIN usuarios u ON t.usuario_id = u.id
            LEFT JOIN usuarios tec ON t.tecnico_id = tec.id
            ORDER BY t.fecha_creacion DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    // Obtener solo mis tickets (Para Funcionarios)
    findByUserId: async (usuario_id) => {
        const sql = `
            SELECT t.*, tec.nombre_completo as tecnico
            FROM tickets t
            LEFT JOIN usuarios tec ON t.tecnico_id = tec.id
            WHERE t.usuario_id = ?
            ORDER BY t.fecha_creacion DESC
        `;
        const [rows] = await db.query(sql, [usuario_id]);
        return rows;
    },

    // Buscar un ticket por ID (Para ver detalle)
    findById: async (id) => {
        const sql = `
            SELECT t.*, 
                    u.nombre_completo as autor, 
                    tec.nombre_completo as tecnico
            FROM tickets t
            JOIN usuarios u ON t.usuario_id = u.id
            LEFT JOIN usuarios tec ON t.tecnico_id = tec.id
            WHERE t.id = ?
        `;
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    },

    // Actualizar un ticket
    update: async (id, data) => {
        const { estado, tecnico_id, prioridad, categoria } = data;
        const sql = `
            UPDATE tickets 
            SET estado = ?, tecnico_id = ?, prioridad = ?, categoria = ?
            WHERE id = ?
        `;
        const [result] = await db.query(sql, [estado, tecnico_id, prioridad, categoria, id]);
        return result;
    }
}; // Cierre del objeto Ticket

module.exports = Ticket;