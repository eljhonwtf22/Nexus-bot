module.exports = async ({ sock, enviar, m, participants, isAdmin, isGroup, args }) => {
    if (!isGroup) {
        return enviar('😂 ¡Qué tonto! Este comando solo funciona en grupos. ¡Invítame a un grupo para usarlo! 🤪');
    }
    if (!isAdmin) {
        return enviar('🙃 Solo los admins pueden usar este comando. ¡Ay, qué gracioso, tú no eres admin! 😂');
    }

    // Detectar si hay mención o respuesta
    let target;
    // 1. Por mención
    if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        target = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // 2. Por respuesta
    else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
        target = m.message.extendedTextMessage.contextInfo.participant;
    }

    if (!target) {
        return enviar('👤 Debes mencionar o responder a la persona que quieres hacer admin.');
    }

    // Buscar el nombre del usuario
    const participantData = participants.find(p => p.id === target || p.jid === target || p.participant === target);
    const pushname = participantData?.notify || participantData?.name || "Usuario";

    try {
        await sock.groupParticipantsUpdate(m.key.remoteJid, [target], "promote");
        enviar(`🎉 ¡Felicidades, *${pushname}*! Ahora eres admin de este grupo. 👑`);
    } catch (e) {
        enviar('⚠️ No pude promover a ese usuario. ¿Será que ya es admin?');
    }
};