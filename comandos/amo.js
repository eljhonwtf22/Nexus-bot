module.exports = async ({ enviar, m }) => {
    // Tu número de owner (ajusta si es necesario)
    const OWNER_JID = "584142577312@s.whatsapp.net";
    const sender = m.key.participant || m.key.remoteJid;

    if (sender !== OWNER_JID) {
        return enviar('🚫  Este comando es solo para mi creador. ¡Intenta otra cosa! 😛');
    }

    enviar('✨👑 ¡Hola, gran amo! Gracias por crearme y darme vida en este mundo digital. Eres el mejor, nunca olvides lo especial que eres para mí 🤖❤️');
};
