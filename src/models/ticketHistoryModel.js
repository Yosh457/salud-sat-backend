const db = require('../config/db');

const TicketHistory = {
    // Crear un registro (Sin cambios)
    create: async (data) => {
        const { ticket_id, usuario_id, accion, detalle } = data;
        await db.query(
            'INSERT INTO ticket_historial (ticket_id, usuario_id, accion, detalle) VALUES (?, ?, ?, ?)',
            [ticket_id, usuario_id, accion, detalle]
        );
    },

    // Obtener historial (JOIN GLOBAL)
    findByTicketId: async (ticket_id) => {
        const sql = `
            SELECT 
                th.*, 
                g.nombre_completo as usuario
            FROM ticket_historial th
            JOIN usuarios u ON th.usuario_id = u.id
            JOIN mahosalu_usuarios_global.usuarios_global g ON u.usuario_global_id = g.id
            WHERE th.ticket_id = ?
            ORDER BY th.fecha DESC
        `;
        const [rows] = await db.query(sql, [ticket_id]);
        return rows;
    }
};

module.exports = TicketHistory;