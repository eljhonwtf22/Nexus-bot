module.exports = async ({ sock, m, enviar }) => {
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const replied = m.message?.extendedTextMessage?.contextInfo?.participant;
    const targetId = mentioned || replied || m.sender;

    try {
        const ppUrl = await sock.profilePictureUrl(targetId, 'image');
        await sock.sendMessage(m.key.remoteJid, {
            image: { url: ppUrl },
            caption: `Foto de perfil de @${targetId.split('@')[0]}`,
            mentions: [targetId]
        });
    } catch (err) {
        enviar('No pude obtener la foto, quizás el usuario no tiene foto de perfil o la tiene restringida.');
    }
};