const db = require('../config/db');

const Stats = {
    // Contar tickets por estado
    getTicketsByStatus: async () => {
        const sql = `
            SELECT estado, COUNT(*) as total 
            FROM tickets 
            GROUP BY estado
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    // Contar tickets por prioridad
    getPendingByPriority: async () => {
        const sql = `
            SELECT prioridad, COUNT(*) as total 
            FROM tickets 
            WHERE estado IN ('pendiente', 'en_proceso')
            GROUP BY prioridad
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    // Ranking de técnicos (JOIN GLOBAL para el nombre)
    getTechnicianRanking: async () => {
        const sql = `
            SELECT 
                g.nombre_completo, 
                COUNT(t.id) as tickets_resueltos
            FROM tickets t
            JOIN usuarios u ON t.tecnico_id = u.id
            JOIN mahosalu_usuarios_global.usuarios_global g ON u.usuario_global_id = g.id
            WHERE t.estado IN ('resuelto', 'cerrado')
            GROUP BY t.tecnico_id, g.nombre_completo
            ORDER BY tickets_resueltos DESC
            LIMIT 5
        `;
        const [rows] = await db.query(sql);
        return rows;
    }
};

module.exports = Stats;