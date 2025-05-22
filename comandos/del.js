module.exports = async ({ sock, m, isGroup, enviar }) => {
    if (!isGroup) return enviar('Este comando solo funciona en grupos.');

    const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
    const participants = groupMetadata.participants;
    const senderId = m.key.participant || m.key.remoteJid;
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    const isAdmin = participants.find(p => p.id === senderId)?.admin || groupMetadata.owner === senderId;
    const isBotAdmin = participants.find(p => p.id === botId)?.admin;

    if (!isAdmin) return enviar('Ay que tonto este😂, Solo administradores pueden usar este comando.');
    if (!isBotAdmin) return enviar('No soy administrador, no puedo borrar mensajes.');

    const quoted = m.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const participant = m.message?.extendedTextMessage?.contextInfo?.participant;

    if (!quoted || !participant) return enviar('Debes responder al mensaje que quieres eliminar usando el comando .delete');

    await sock.sendMessage(m.key.remoteJid, {
        delete: {
            remoteJid: m.key.remoteJid,
            fromMe: false,
            id: quoted,
            participant: participant
        }
    });
};
