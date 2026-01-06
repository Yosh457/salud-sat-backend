const nodemailer = require('nodemailer');
const config = require('../config/config'); // O usa process.env directo
require('dotenv').config();

// Configuración Transporter para GMAIL / Google Workspace
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT, // 587
    secure: false, // false para 587 (STARTTLS), true para 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verificación de conexión al arrancar (Opcional, útil para debug)
transporter.verify().then(() => {
    console.log('📧 Listo para enviar correos con Google Workspace');
}).catch(err => {
    console.error('❌ Error conexión SMTP:', err.message);
});

// Función genérica de envío
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const info = await transporter.sendMail({
            from: `"SAT Salud" <${process.env.SMTP_USER}>`, // Ej: "SAT Salud" <unidad.tics@mahosalud.cl>
            to: to, 
            subject: subject,
            html: htmlContent, 
        });
        console.log("📨 Correo enviado ID:", info.messageId);
        return true;
    } catch (error) {
        console.error("❌ Error enviando correo:", error);
        return false;
    }
};

// Plantilla 1: Notificar al Técnico (Nueva Asignación)
const notificarAsignacion = async (emailTecnico, nombreTecnico, ticketId, tituloTicket) => {
    const asunto = `🆕 [SAT] Nuevo Ticket Asignado #${ticketId}`;
    const mensaje = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">SAT Salud</h1>
            </div>
            <div style="padding: 20px;">
                <h2 style="color: #1f2937;">Hola, ${nombreTecnico} 👋</h2>
                <p style="font-size: 16px; line-height: 1.5;">Se te ha asignado un nuevo requerimiento que requiere tu atención.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>🎫 Ticket ID:</strong> #${ticketId}</p>
                    <p style="margin: 5px 0;"><strong>📝 Asunto:</strong> ${tituloTicket}</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://sat.mahosalud.cl/dashboard/tickets/${ticketId}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Gestionar Ticket</a>
                </div>
            </div>
            <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
                Departamento de Salud - Alto Hospicio<br>
                Este es un mensaje automático, por favor no responder.
            </div>
        </div>
    `;
    return sendEmail(emailTecnico, asunto, mensaje);
};

// Plantilla 2: Notificar al Funcionario (Ticket Resuelto)
const notificarResolucion = async (emailFuncionario, nombreFuncionario, ticketId, tituloTicket) => {
    const asunto = `✅ [SAT] Ticket Resuelto #${ticketId}`;
    const mensaje = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #16a34a; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Problema Resuelto</h1>
            </div>
            <div style="padding: 20px;">
                <h2 style="color: #1f2937;">Hola, ${nombreFuncionario}</h2>
                <p style="font-size: 16px; line-height: 1.5;">Tu solicitud ha sido marcada como <strong>RESUELTA</strong> por el equipo técnico.</p>
                
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #bbf7d0;">
                    <p style="margin: 5px 0;"><strong>🎫 Ticket ID:</strong> #${ticketId}</p>
                    <p style="margin: 5px 0;"><strong>📝 Asunto:</strong> ${tituloTicket}</p>
                </div>

                <p>Si consideras que el problema persiste, por favor contáctanos nuevamente o crea un nuevo ticket.</p>
            </div>
            <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
                Departamento de Salud - Alto Hospicio
            </div>
        </div>
    `;
    return sendEmail(emailFuncionario, asunto, mensaje);
};

module.exports = { notificarAsignacion, notificarResolucion };