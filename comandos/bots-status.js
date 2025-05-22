const fs = require('fs');
const CONFIG_PATH = './subbot-config.json';

function cargarConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return { subbots_enabled: true };
  return JSON.parse(fs.readFileSync(CONFIG_PATH));
}

function guardarConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

module.exports = async ({ enviar, args, from, OWNER_JID, m }) => {
  if (from !== OWNER_JID && m.key.participant !== OWNER_JID) {
    return enviar('❌ Solo el Owner puede usar este comando.');
  }

  const config = cargarConfig();
  const accion = args[0]?.toLowerCase();

  if (accion === 'on') {
    config.subbots_enabled = true;
    guardarConfig(config);
    return enviar('✅ Sub-bots habilitados.');
  }

  if (accion === 'off') {
    config.subbots_enabled = false;
    guardarConfig(config);
    return enviar('⛔ Sub-bots deshabilitados.');
  }

  const estado = config.subbots_enabled ? '🟢 ACTIVADOS' : '🔴 DESACTIVADOS';
  enviar(`*Estado actual de los sub-bots:* ${estado}\nUsa *.bots on* o *.bots off* para cambiar.`);
};
