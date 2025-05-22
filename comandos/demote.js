module.exports = {
    name: "demote",
    alias: ["quitaradmin", "degradar"],
    desc: "⚠️ Quitar admin a un usuario",
    use: ".demote @usuario",
    permisos: ["ADMINISTRATOR"],
    run: async ({ sock, m, args, isGroup, enviar, participants }) => {
        if (!isGroup) return enviar("🚫 Solo funciona en grupos");
        
        // Verificar si el bot es admin
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = participants.some(p => p.id === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isBotAdmin) return enviar("❌ Necesito ser admin para esto");

        // Obtener usuario mencionado
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (quoted ? quoted.sender : null);
        const target = mentioned || args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        if (!target) return enviar("ℹ️ Menciona a un usuario o responde a su mensaje");
        if (target === m.sender) return enviar("😂 No puedes degradarte a ti mismo");
        if (target === sock.user.id) return enviar("🤖 ¿En serio? ¡No puedo degradarme!");

        try {
            await sock.groupParticipantsUpdate(m.chat, [target], "demote");
            await enviar(`╭─❍ *USUARIO DEGRADADO* ❍─╮
│✦ @${target.split('@')[0]} ya no es admin 👎
│✦ *Ordenado por:* @${m.sender.split('@')[0]}
╰────────────⳹`, { mentions: [target, m.sender] });
        } catch (error) {
            console.error(error);
            enviar(`❌ Error: ${error.message.includes("401") ? "No tengo permisos suficientes" : "Ocurrió un error"}`);
        }
    }
};