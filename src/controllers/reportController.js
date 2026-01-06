const ExcelJS = require('exceljs');
const Ticket = require('../models/ticketModel'); // Reusamos el modelo

const descargarReporteExcel = async (req, res, next) => {
    try {
        // 1. Obtener datos de la BD (Reusamos findAll que trae los joins)
        const tickets = await Ticket.findAll();

        // 2. Crear el libro de Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte de Tickets');

        // 3. Definir columnas
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Fecha Creación', key: 'fecha_creacion', width: 20 },
            { header: 'Estado', key: 'estado', width: 15 },
            { header: 'Prioridad', key: 'prioridad', width: 15 },
            { header: 'Categoría', key: 'categoria', width: 20 },
            { header: 'Solicitante', key: 'autor', width: 30 },
            { header: 'Técnico Asignado', key: 'tecnico', width: 30 },
            { header: 'Título', key: 'titulo', width: 40 },
            // { header: 'Descripción', key: 'descripcion', width: 50 } // Opcional, puede ser muy largo
        ];

        // 4. Dar estilo a la cabecera (Negrita y fondo azul claro)
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2563EB' } // Azul SAT
        };

        // 5. Agregar filas
        tickets.forEach(ticket => {
            // Aseguramos que sea string, incluso si es null, undefined, o un número extraño.
            const estadoRaw = (ticket.estado || 'sin_estado').toString();
            const prioridadRaw = (ticket.prioridad || 'sin_prioridad').toString();
            
            const estadoFormat = estadoRaw.replace('_', ' ').toUpperCase();
            const prioridadFormat = prioridadRaw.toUpperCase();

            const row = worksheet.addRow({
                id: ticket.id,
                fecha_creacion: ticket.fecha_creacion,
                estado: estadoFormat,
                prioridad: prioridadFormat,
                categoria: ticket.categoria || "Sin categoría",
                autor: ticket.autor || 'No registrado',
                tecnico: ticket.tecnico || 'Sin asignar',
                titulo: ticket.titulo
            });

            // Colorear celda de estado según valor
            const estadoCell = row.getCell('estado');
            if (ticket.estado === 'resuelto') estadoCell.font = { color: { argb: 'FF16A34A' } }; // Verde
            if (ticket.estado === 'pendiente') estadoCell.font = { color: { argb: 'FFDC2626' } }; // Rojo
            if (ticket.estado === 'en_proceso') estadoCell.font = { color: { argb: 'FF2563EB' } }; // Azul
        });

        // 6. Configurar la respuesta HTTP para descarga
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + `reporte_tickets_${Date.now()}.xlsx`
        );

        // 7. Escribir el Excel directamente en la respuesta (Stream)
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        next(error);
    }
};

module.exports = { descargarReporteExcel };