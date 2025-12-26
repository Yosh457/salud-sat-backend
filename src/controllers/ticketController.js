const Ticket = require('../models/ticketModel');

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

module.exports = { crearTicket, listarTickets };