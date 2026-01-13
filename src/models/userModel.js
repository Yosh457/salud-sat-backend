const db = require("../config/db");

const User = {
    // 🔐 LOGIN: Buscar por ID Global
    findByGlobalId: async (globalId) => {
        const [rows] = await db.query(
            `SELECT id, rol, activo 
             FROM usuarios 
             WHERE usuario_global_id = ?`,
            [globalId]
        );
        return rows[0];
    },

    // 👤 PERFIL: Buscar por ID Local + JOIN Global
    findById: async (id) => {
        const sql = `
            SELECT 
                u.id, 
                u.rol, 
                u.activo,
                g.rut, 
                g.nombre_completo, 
                g.email 
            FROM usuarios u
            JOIN mahosalu_usuarios_global.usuarios_global g 
                ON u.usuario_global_id = g.id
            WHERE u.id = ?
        `;
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    },

    // 🔧 TÉCNICOS: Listar técnicos
    findTechnicians: async () => {
        const [rows] = await db.query(
            `SELECT u.id, u.rol, g.nombre_completo 
             FROM usuarios u 
             JOIN mahosalu_usuarios_global.usuarios_global g 
               ON u.usuario_global_id = g.id
             WHERE u.rol IN ('admin','tecnico') 
               AND u.activo = 1`
        );
        return rows;
    },

    // 📋 GESTIÓN: Listar todos los usuarios vinculados
    // 🚨 CORRECCIÓN AQUÍ: Usamos 'creado_at' AS 'fecha_creacion'
    findAllLinkedUsers: async () => {
        const [rows] = await db.query(
            `SELECT u.id, u.rol, u.activo, 
                    u.creado_at AS fecha_creacion, -- 👈 EL ALIAS MÁGICO
                    g.rut, g.nombre_completo, g.email
             FROM usuarios u
             JOIN mahosalu_usuarios_global.usuarios_global g
               ON u.usuario_global_id = g.id
             ORDER BY g.nombre_completo ASC`
        );
        return rows;
    },

    // 🔗 VINCULACIÓN: Buscar candidatos
    findUnlinkedGlobalUsers: async () => {
        const [rows] = await db.query(
            `SELECT id, rut, nombre_completo, email 
             FROM mahosalu_usuarios_global.usuarios_global
             WHERE activo = 1 
               AND id NOT IN (
                   SELECT usuario_global_id 
                   FROM usuarios
                   WHERE usuario_global_id IS NOT NULL
               )
             ORDER BY nombre_completo ASC`
        );
        return rows;
    },

    // 🔗 CREAR VÍNCULO
    // 🚨 CORRECCIÓN: Agregamos 'creado_at' explícitamente
    linkUser: async (globalId, rol) => {
        const [result] = await db.query(
            `INSERT INTO usuarios (usuario_global_id, rol, activo, creado_at)
             VALUES (?, ?, 1, NOW())`,
            [globalId, rol]
        );
        return result.insertId;
    },

    // ✏️ ACTUALIZAR LOCAL
    updateLocalUser: async (id, data) => {
        const { rol, activo } = data;
        let sql = 'UPDATE usuarios SET ';
        const params = [];

        if (rol) {
            sql += 'rol = ?, ';
            params.push(rol);
        }
        if (activo !== undefined) {
            sql += 'activo = ?, ';
            params.push(activo);
        }

        sql = sql.slice(0, -2); // Quitar coma extra
        sql += ' WHERE id = ?';
        params.push(id);

        await db.query(sql, params);
    },
};

module.exports = User;