module.exports = async ({ sock, from, isGroup, isAdmin, args, enviar }) => {
    if (!isGroup) return enviar('❌ Este comando solo funciona en grupos.');
    if (!isAdmin) return enviar('❌ Solo los administradores pueden usar este comando.');

    if (!args[0]) return enviar('🔹 Debes escribir el número internacional, por ejemplo:\n.agregar 584123456789');

    // Normaliza el número a formato internacional y sin espacios
    let numero = args[0].replace(/[^0-9]/g, '');
    if (numero.length < 10) return enviar('❌ Número inválido. Usa formato internacional, ejemplo: 584123456789');

    let jid = numero + '@s.whatsapp.net';

    try {
        await sock.groupParticipantsUpdate(from, [jid], 'add');
        enviar(`✅ Usuario agregado: wa.me/${numero}`);
    } catch (e) {
        enviar('❌ No se pudo agregar. Puede que el número no exista, no tenga WhatsApp, o que el usuario haya restringido ser añadido por bots.');
    }
};
