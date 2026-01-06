const { getIo } = require('../services/socketService');
const Ticket = require('../models/ticketModel');
const TicketEvidence = require('../models/ticketEvidenceModel');
const TicketHistory = require('../models/ticketHistoryModel');
const User = require('../models/userModel');
const emailService = require('../services/emailService'); // Importar servicio de email

const crearTicket = async (req, res, next) => {
    try {
        const { titulo, descripcion, prioridad, categoria } = req.body;

        // El ID del usuario viene del Token (req.user.id) gracias al authMiddleware
        const nuevoId = await Ticket.create({
            usuario_id: req.user.id,
            titulo,
            descripcion,
            prioridad,
            categoria
        });

        // Registrar historial
        await TicketHistory.create({
            ticket_id: nuevoId,
            usuario_id: req.user.id,
            accion: 'CREADO',
            detalle: `Ticket creado con título: ${titulo}`
        });
        // Notificar en tiempo real a técnicos/admins conectados
        // 'nuevo_ticket' es el nombre del evento que escucharán en el frontend
        getIo().emit('nuevo_ticket', {
            id: nuevoId,
            titulo,
            prioridad,
            mensaje: '¡Nuevo ticket ingresado!'
        });

        res.status(201).json({
            status: 'success',
            message: 'Ticket creado exitosamente',
            ticketId: nuevoId
        });
    } catch (error) {
        next(error);
    }
};

const listarTickets = async (req, res, next) => {
    try {
        let tickets;
        // Si es Admin o Técnico, ve todo. Si es Funcionario, solo lo suyo.
        if (req.user.rol === 'admin' || req.user.rol === 'tecnico') {
            tickets = await Ticket.findAll();
        } else {
            tickets = await Ticket.findByUserId(req.user.id);
        }

        res.json({ status: 'success', data: tickets });
    } catch (error) {
        next(error);
    }
};

const obtenerTicket = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findById(id);

        if (!ticket) {
            const error = new Error('Ticket no encontrado');
            error.statusCode = 404;
            throw error;
        }

        // Validación de seguridad:
        // Si es funcionario, SOLO puede ver SU ticket. Admin/Tecnico ven cualquiera.
        if (req.user.rol === 'funcionario' && ticket.usuario_id !== req.user.id) {
            const error = new Error('No tienes permiso para ver este ticket');
            error.statusCode = 403;
            throw error;
        }

        res.json({ status: 'success', data: ticket });
    } catch (error) {
        next(error);
    }
};

const actualizarTicket = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { estado, tecnico_id, prioridad, categoria } = req.body;

        // 1. Obtener ticket actual
        const ticketActual = await Ticket.findById(id);
        if (!ticketActual) {
            const error = new Error('Ticket no encontrado');
            error.statusCode = 404;
            throw error;
        }

        // 2. Preparar cambios
        const cambios = {
            prioridad: prioridad || ticketActual.prioridad,
            categoria: categoria || ticketActual.categoria,
            tecnico_id: tecnico_id !== undefined ? tecnico_id : ticketActual.tecnico_id,
            estado: estado || ticketActual.estado
        };

        // 3. Automatización de Estados
        // Importante: comparar con != null para atrapar null y undefined
        if (tecnico_id && tecnico_id != ticketActual.tecnico_id && ticketActual.estado === 'pendiente') {
            cambios.estado = 'en_proceso';
        }
        // Si el técnico marca "resuelto", respetamos ese estado.
        if (estado === 'resuelto') {
            cambios.estado = 'resuelto';
        }

        // 4. Guardar en BD
        await Ticket.update(id, cambios);

        // =================================================================
        // 🛡️ ZONA DE NOTIFICACIONES (A PRUEBA DE FALLOS)
        // Envolvemos esto en try/catch para que NUNCA rompa la respuesta http
        // =================================================================
        try {
            // CASO A: Se asignó un técnico nuevo
            if (cambios.tecnico_id && cambios.tecnico_id != ticketActual.tecnico_id) {
                // Buscamos datos del técnico nuevo
                const tecnicoNuevo = await User.findById(cambios.tecnico_id);

                // Solo enviamos si el técnico existe y tiene email
                if (tecnicoNuevo && tecnicoNuevo.email) {
                    console.log(`📧 Intentando notificar a técnico: ${tecnicoNuevo.email}`);
                    await emailService.notificarAsignacion(
                        tecnicoNuevo.email,
                        tecnicoNuevo.nombre_completo,
                        id,
                        ticketActual.titulo
                    );
                } else {
                    console.warn(`⚠️ No se pudo notificar: Técnico ID ${cambios.tecnico_id} no tiene email o no existe.`);
                }
            }

            // CASO B: Se resolvió el ticket
            if (cambios.estado === 'resuelto' && ticketActual.estado !== 'resuelto') {
                if (ticketActual.autor_email) {
                    console.log(`📧 Intentando notificar a funcionario: ${ticketActual.autor_email}`);
                    await emailService.notificarResolucion(
                        ticketActual.autor_email,
                        ticketActual.autor,
                        id,
                        ticketActual.titulo
                    );
                } else {
                    console.warn(`⚠️ No se pudo notificar resolución: El autor del ticket no tiene email registrado.`);
                }
            }
        } catch (emailError) {
            // Si algo falla aquí, SOLO lo logueamos, pero NO detenemos el request
            console.error("❌ ERROR EN ENVÍO DE CORREOS (No crítico):", emailError.message);
        }
        // =================================================================
        // 🛡️ FIN ZONA DE NOTIFICACIONES
        // =================================================================

        // 6. Historial
        let accionHistorial = 'ACTUALIZADO';
        if (cambios.estado === 'resuelto' && ticketActual.estado !== 'resuelto') accionHistorial = 'RESUELTO';
        else if (cambios.estado === 'cerrado' && ticketActual.estado !== 'cerrado') accionHistorial = 'CERRADO';
        else if (cambios.tecnico_id && cambios.tecnico_id != ticketActual.tecnico_id) accionHistorial = 'ASIGNADO';

        // 7. Generar el detalle de texto
        let detalles = [];
        if (cambios.estado !== ticketActual.estado) detalles.push(`Estado cambia a: ${cambios.estado}`);
        if (cambios.tecnico_id != ticketActual.tecnico_id) detalles.push(`Técnico asignado ID: ${cambios.tecnico_id}`);
        if (cambios.prioridad !== ticketActual.prioridad) detalles.push(`Prioridad cambia a: ${cambios.prioridad}`);

        // Solo guardamos en historial si hubo cambios reales
        if (detalles.length > 0) {
            await TicketHistory.create({
                ticket_id: id,
                usuario_id: req.user.id,
                accion: accionHistorial, // <--- Usamos la etiqueta dinámica
                detalle: detalles.join('. ')
            });
        }

        res.json({
            status: 'success',
            message: 'Ticket actualizado correctamente',
            data: cambios
        });

    } catch (error) {
        next(error);
    }
};

const subirEvidencia = async (req, res, next) => {
    try {
        const { id } = req.params; // ID del Ticket
        const file = req.file;     // El archivo viene aquí gracias a Multer

        if (!file) {
            const error = new Error('No se subió ningún archivo');
            error.statusCode = 400;
            throw error;
        }

        // Guadar referencia en la base de datos
        const evidenciaId = await TicketEvidence.create({
            ticket_id: id,
            nombre_archivo: file.filename, // El nombre único generado (UUID)
            ruta_archivo: `/uploads/evidence/${file.filename}`, // Ruta web pública
            tipo_mime: file.mimetype
        });

        // Registrar en el historial del ticket
        await TicketHistory.create({
            ticket_id: id,
            usuario_id: req.user.id,
            accion: 'EVIDENCIA',
            detalle: `Se adjuntó archivo: ${file.originalname}`
        });

        res.status(201).json({
            status: 'success',
            message: 'Evidencia guardada exitosamente',
            data: {
                id: evidenciaId,
                filename: file.filename,
                path: `/uploads/evidence/${file.filename}`
            }
        });

    } catch (error) {
        next(error);
    }
};

const listarEvidencias = async (req, res, next) => {
    try {
        const { id } = req.params; // ID del ticket
        const evidencias = await TicketEvidence.findByTicketId(id);
        res.json({ status: 'success', data: evidencias });
    } catch (error) {
        next(error);
    }
};

const verHistorial = async (req, res, next) => {
    try {
        const { id } = req.params; // ID del ticket
        const historial = await TicketHistory.findByTicketId(id);
        res.json({ status: 'success', data: historial });
    } catch (error) {
        next(error);
    }
};

module.exports = { crearTicket, listarTickets, obtenerTicket, actualizarTicket, subirEvidencia, listarEvidencias, verHistorial };