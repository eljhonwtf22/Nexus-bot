module.exports = async ({ sock, m, from, pushname, args, enviar, isGroup, participants }) => {
    if (isGroup) {
        // Obtenemos el ID del usuario expulsado
        const usuarioExpulsado = m.action === 'remove' ? m.participant : null;
        
        if (usuarioExpulsado) {
            // Verificamos si el que intenta expulsar es el dueño del grupo
            const groupMetadata = await sock.groupMetadata(from);
            const ownerId = groupMetadata.owner;  // El ID del dueño del grupo

            // Si el dueño del grupo intenta expulsarse a sí mismo
            if (usuarioExpulsado === ownerId) {
                return enviar('No puedo eliminarlo, ¡es el creador del grupo, tonto! 😜');
            }

            // Si no es el dueño del grupo, procedemos con la expulsión
            let fotoUsuario = await sock.profilePictureUrl(usuarioExpulsado, 'image').catch(() => null);
            
            // Si no tiene foto de perfil, usamos una imagen predeterminada
            if (!fotoUsuario) {
                fotoUsuario = 'https://example.com/imagen_predeterminada.jpg'; // Cambia esto por una URL de imagen predeterminada si lo prefieres
            }
            
            // Diseño del mensaje
            const texto = `
╭─❍ 𝘾𝙃𝙄𝙎𝙈𝙀 𝘿𝙀 𝙋𝘼𝙏𝙄𝙊 ❍─╮
│✿ @${usuarioExpulsado.split('@')[0]} fue sacado
│✿ Dice la leyenda que nadie lo soportaba
│✿ ${process.env.BOT_NAME || 'Nexus-bot'} hizo lo correcto
╰───────────⳹ Fin ⳼───────────╯
            `;

            // Enviamos el mensaje con la foto y el texto
            await sock.sendMessage(from, {
                image: { url: fotoUsuario },
                caption: texto
            });
        } else {
            // Si no se encuentra un usuario o se ejecuta mal el comando
            return enviar('Por favor, usa el comando de la siguiente manera:\n\n#expulsar @usuario');
        }
    }
};