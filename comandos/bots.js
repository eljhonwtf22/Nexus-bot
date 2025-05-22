const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const configPath = path.join(__dirname, '..', 'config.json');

function cargarConfig() {
  if (!fs.existsSync(configPath)) return { subBotsActivos: false };
  return JSON.parse(fs.readFileSync(configPath));
}

function guardarConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

module.exports = async ({ enviar, args, from, m, OWNER_JID }) => {
  const sender = m.key.participant || m.sender || m.key.remoteJid;
  if (sender !== OWNER_JID) {
    return enviar('❌ Solo el *owner* puede usar este comando.🙃');
  }

  const opcion = args[0]?.toLowerCase();
  const config = cargarConfig();

  if (opcion === 'on') {
    config.subBotsActivos = true;
    guardarConfig(config);
    return enviar('✅ Función de sub-bots *activada*. Los usuarios ahora pueden usar *.qr* y *.code*.');
  }

  if (opcion === 'off') {
    config.subBotsActivos = false;
    guardarConfig(config);
    return enviar('⛔ Función de sub-bots *desactivada*. Los comandos *.qr* y *.code* están bloqueados.');
  }

  return enviar('ℹ️ Usa: *.bots on* o *.bots off*');
};
