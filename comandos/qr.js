const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('baileys');
const pino = require('pino');
const QR = require('qrcode');
const rimraf = require('rimraf');

const USERS_FILE = path.join(__dirname, 'usuariosSubBots.json');
const maxSubBots = 2;

function cargarUsuarios() {
  if (!fs.existsSync(USERS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE));
  } catch {
    return {};
  }
}

function guardarUsuarios(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

function agregarSubBot(usuarios, userId, subBotId) {
  if (!usuarios[userId]) usuarios[userId] = { bots: [] };
  usuarios[userId].bots.push(subBotId);
  guardarUsuarios(usuarios);
}

function eliminarSubBot(usuarios, userId, subBotId) {
  if (!usuarios[userId]) return false;
  usuarios[userId].bots = usuarios[userId].bots.filter(id => id !== subBotId);
  guardarUsuarios(usuarios);
  return true;
}

module.exports = {
  comandoQR: async ({ sock, m, from, enviar }) => {
    const usuarios = cargarUsuarios();
    const userId = m.sender.replace(/[^0-9]/g, '');

    if (!usuarios[userId]) usuarios[userId] = { bots: [] };

    if (usuarios[userId].bots.length >= maxSubBots) {
      return enviar(`⚠️ Has alcanzado el límite máximo de sub-bots (${maxSubBots}). Elimina uno para crear otro.`);
    }

    await enviar('🔄 Generando código QR para tu sub-bot, espera...');

    const subBotId = Date.now().toString();

    const { state, saveCreds } = await useMultiFileAuthState(`./session-sub-${userId}-${subBotId}`);
    const { version } = await fetchLatestBaileysVersion();

    const subSock = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      logger: pino({ level: 'silent' }),
      browser: ['SubBot', 'Chrome', '1.0.0'],
    });

    subSock.ev.on('connection.update', async (update) => {
      const { qr, connection } = update;

      if (qr) {
        try {
          await enviar(
            '🔑 *Instrucciones para vincular tu sub-bot:*\n\n' +
            '1. Abre WhatsApp en otro dispositivo o WhatsApp Web.\n' +
            '2. Escanea el código QR que te enviaré a continuación.\n' +
            '3. Espera a que se conecte y listo, tu sub-bot estará activo.'
          );

          const buffer = await QR.toBuffer(qr, { type: 'png' });
          await subSock.sendMessage(from, { image: buffer, caption: 'Aquí está tu código QR para vincular tu sub-bot.' }, { quoted: m });

          agregarSubBot(usuarios, userId, subBotId);
        } catch (e) {
          console.error('Error generando QR:', e);
          await enviar('⚠️ Error generando la imagen del código QR.');
        }
      }

      if (connection === 'open') {
        await subSock.sendMessage(from, { text: '✅ Tu sub-bot ya está conectado y listo para usar.' }, { quoted: m });
      }

      if (connection === 'close') {
        await enviar('❌ El sub-bot se desconectó. Usa el comando .qr para generar uno nuevo.');
        eliminarSubBot(usuarios, userId, subBotId);
      }
    });

    subSock.ev.on('creds.update', saveCreds);
  },

  comandoMisBots: async ({ enviar, m }) => {
    const usuarios = cargarUsuarios();
    const userId = m.sender.replace(/[^0-9]/g, '');

    if (!usuarios[userId] || usuarios[userId].bots.length === 0) {
      return enviar('❌ No tienes sub-bots activos.');
    }

    let lista = `🔎 *Tus sub-bots activos (${usuarios[userId].bots.length}):*\n`;
    usuarios[userId].bots.forEach((id, i) => {
      lista += `\n${i + 1}. ID: ${id}`;
    });

    enviar(lista);
  },

  comandoEliminarBot: async ({ enviar, m, args }) => {
    const usuarios = cargarUsuarios();
    const userId = m.sender.replace(/[^0-9]/g, '');
    const subBotId = args[0];

    if (!subBotId) return enviar('❌ Debes indicar el ID del sub-bot a eliminar. Uso: .eliminarbot <ID>');

    if (!usuarios[userId] || !usuarios[userId].bots.includes(subBotId)) {
      return enviar('❌ No encontré ese sub-bot en tu lista.');
    }

    const carpeta = path.join(__dirname, `session-sub-${userId}-${subBotId}`);

    rimraf(carpeta, (err) => {
      if (err) {
        console.error(err);
        return enviar('⚠️ Error eliminando la sesión del sub-bot.');
      }

      eliminarSubBot(usuarios, userId, subBotId);
      enviar(`✅ Sub-bot con ID ${subBotId} eliminado y espacio liberado.`);
    });
  }
};