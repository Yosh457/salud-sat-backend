const Stats = require('../models/statsModel');

const getDashboardStats = async (req, res, next) => {
    try {
        // Ejecutamos las 3 consultas en paralelo para ser más rápidos
        const [porEstado, porPrioridad, ranking] = await Promise.all([
            Stats.getTicketsByStatus(),
            Stats.getPendingByPriority(),
            Stats.getTechnicianRanking()
        ]);

        res.json({
            status: 'success',
            data: {
                resumen_estados: porEstado,
                alertas_prioridad: porPrioridad,
                top_tecnicos: ranking
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };