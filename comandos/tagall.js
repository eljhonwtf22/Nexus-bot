module.exports = async function({ enviar, participants, pushname, isGroup, isAdmin }) {
    if (!isGroup) return enviar('¡Ay que tonto! Este comando solo funciona en grupos. 😅');
    if (!isAdmin) return enviar('¿Tú qué? 🤨 Solo los administradores pueden usar este comando.');

    const menciones = participants.map(p => p.id);
    const lista = participants.map(p => `@${p.id.split('@')[0]}`).join(' ');

    // Título con estilo Unicode y emojis
    const titulo = '𝗠𝗘𝗡𝗖𝗜Ó𝗡 𝗔 𝗧𝗢𝗗𝗢 𝗘𝗟 𝗚𝗥𝗨𝗣𝗢';

    const texto = 
        `${titulo}\n\n` +
        '🔔 *Atención, miembros del grupo:*\n\n' +
        `${lista}\n\n` +
        `📢 Mensaje del administrador (${pushname})\n` +
        'Activen el grupo. 🙌';

    enviar(texto, { mentions: menciones });
};