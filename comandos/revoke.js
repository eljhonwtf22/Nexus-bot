module.exports = async ({ sock, from, isGroup, isAdmin, enviar }) => {
    if (!isGroup) 
        return enviar('🚫 Este comando solo funciona en grupos. Intenta en un grupo, genio. 😏');
    if (!isAdmin) 
        return enviar('👑 Solo los admins pueden resetear el link del grupo.\n¿Quieres mandar el nuevo link siendo simple mortal? 😜');

    try {
        await sock.groupRevokeInvite(from); // Revoca el link del grupo
        const code = await sock.groupInviteCode(from); // Nuevo código de invitación
        enviar(
            '🔄 *¡Enlace de invitación restablecido!* 🔄\n\n' +
            'Ahora tienes un link fresquecito para invitar a quien quieras:\n' +
            `👉 https://chat.whatsapp.com/${code}\n\n` +
            'Comparte con sabiduría… o maldad. 😈'
        );
    } catch (e) {
        enviar('❌ No se pudo restablecer el enlace. ¿Seguro que el bot es admin? 🤔');
    }
};