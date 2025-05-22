module.exports = {
  nombre: 'eventosgrupo',
  descripcion: 'Detecta eventos en grupos y envía notificaciones',

  ejecutar: async ({ sock, m }) => {
    if (!m.isGroup || !m.messageStubType) return;

    const groupId = m.key.remoteJid;

    switch(m.messageStubType) {
      case 1: // Nuevo miembro añadido
        if (m.messageStubParameters?.length) {
          const nuevoMiembro = m.messageStubParameters[0];
          await sock.sendMessage(groupId, { 
            text: `👤 Nuevo miembro añadido: @${nuevoMiembro.split('@')[0]}`,
            contextInfo: { mentionedJid: [nuevoMiembro] }
          });
        }
        break;

      case 2: // Miembro removido
        if (m.messageStubParameters?.length) {
          const miembroSalio = m.messageStubParameters[0];
          await sock.sendMessage(groupId, { 
            text: `❌ Miembro salió o fue removido: @${miembroSalio.split('@')[0]}`,
            contextInfo: { mentionedJid: [miembroSalio] }
          });
        }
        break;

      case 3: // Cambio de nombre del grupo
        if (m.messageStubParameters?.length) {
          const nuevoNombre = m.messageStubParameters[0];
          await sock.sendMessage(groupId, { text: `✏️ El nombre del grupo cambió a: *${nuevoNombre}*` });
        }
        break;

      case 4: // Cambio de foto del grupo
        await sock.sendMessage(groupId, { text: '🖼️ La foto del grupo ha sido actualizada.' });
        break;

      case 5: // Cambio de descripción del grupo
        if (m.messageStubParameters?.length) {
          const nuevaDescripcion = m.messageStubParameters[0];
          await sock.sendMessage(groupId, { text: `📝 La descripción del grupo cambió a:\n${nuevaDescripcion}` });
        }
        break;

      default:
        break;
    }
  }
};