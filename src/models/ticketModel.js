const db = require('../config/db');

const Ticket = {
    // Crear un nuevo ticket (Sin cambios, usa IDs locales)
    create: async (data) => {
        const { usuario_id, titulo, descripcion, prioridad, categoria } = data;
        const [result] = await db.query(
            'INSERT INTO tickets (usuario_id, titulo, descripcion, prioridad, categoria, estado) VALUES (?, ?, ?, ?, ?, "pendiente")',
            [usuario_id, titulo, descripcion, prioridad || 'media', categoria || 'General']
        );
        return result.insertId;
    },

    // Obtener todos los tickets (Admin/Técnicos) - JOIN CON GLOBAL
    findAll: async () => {
        const sql = `
            SELECT 
                t.*, 
                g_autor.nombre_completo AS autor,
                g_tec.nombre_completo AS tecnico
            FROM tickets t
            -- Join para el Autor
            JOIN usuarios u_autor ON t.usuario_id = u_autor.id
            JOIN mahosalu_usuarios_global.usuarios_global g_autor ON u_autor.usuario_global_id = g_autor.id
            -- Join para el Técnico (LEFT JOIN porque puede ser null)
            LEFT JOIN usuarios u_tec ON t.tecnico_id = u_tec.id
            LEFT JOIN mahosalu_usuarios_global.usuarios_global g_tec ON u_tec.usuario_global_id = g_tec.id
            ORDER BY t.fecha_creacion DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    // Obtener solo mis tickets (Funcionarios) - JOIN CON GLOBAL
    findByUserId: async (usuario_id) => {
        const sql = `
            SELECT 
                t.*, 
                g_tec.nombre_completo AS tecnico
            FROM tickets t
            -- Join para el Técnico
            LEFT JOIN usuarios u_tec ON t.tecnico_id = u_tec.id
            LEFT JOIN mahosalu_usuarios_global.usuarios_global g_tec ON u_tec.usuario_global_id = g_tec.id
            WHERE t.usuario_id = ?
            ORDER BY t.fecha_creacion DESC
        `;
        const [rows] = await db.query(sql, [usuario_id]);
        return rows;
    },

    // Buscar un ticket por ID (Detalle) - JOIN CON GLOBAL COMPLETO
    findById: async (id) => {
        const sql = `
            SELECT 
                t.*, 
                g_autor.nombre_completo AS autor, 
                g_autor.email AS autor_email,  
                g_tec.nombre_completo AS tecnico,
                g_tec.email AS tecnico_email 
            FROM tickets t
            -- Autor
            JOIN usuarios u_autor ON t.usuario_id = u_autor.id
            JOIN mahosalu_usuarios_global.usuarios_global g_autor ON u_autor.usuario_global_id = g_autor.id
            -- Técnico
            LEFT JOIN usuarios u_tec ON t.tecnico_id = u_tec.id
            LEFT JOIN mahosalu_usuarios_global.usuarios_global g_tec ON u_tec.usuario_global_id = g_tec.id
            WHERE t.id = ?
        `;
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    },

    // Actualizar un ticket (Sin cambios)
    update: async (id, data) => {
        const { estado, tecnico_id, prioridad, categoria } = data;
        // Construcción dinámica para no sobrescribir con NULL si no se envía el dato
        // Pero para simplificar, usaremos tu lógica actual si te funciona
        const sql = `
            UPDATE tickets 
            SET estado = COALESCE(?, estado), 
                tecnico_id = COALESCE(?, tecnico_id), 
                prioridad = COALESCE(?, prioridad), 
                categoria = COALESCE(?, categoria)
            WHERE id = ?
        `;
        const [result] = await db.query(sql, [estado, tecnico_id, prioridad, categoria, id]);
        return result;
    }
};

module.exports = Ticket;