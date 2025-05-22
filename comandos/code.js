const { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, default: makeWASocket } = require('baileys');
const pino = require('pino');

module.exports = async ({ sock, m, from, enviar }) => {
  await enviar('🔄 Generando código alfanumérico para tu sub-bot, espera...');

  const userId = m.sender.replace(/[^0-9]/g, '');
  const { state, saveCreds } = await useMultiFileAuthState(`./session-sub-${userId}`);
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
    const { pairingCode, connection } = update;

    if (pairingCode) {
      await enviar(
        `🔑 *Código alfanumérico para vincular tu sub-bot:*\n\n` +
        `\`${pairingCode.match(/.{1,4}/g).join('-')}\`\n\n` +
        `*Instrucciones:*\n` +
        `1. Abre WhatsApp en otro dispositivo o WhatsApp Web.\n` +
        `2. En la opción de vincular dispositivo, ingresa este código manualmente.\n` +
        `3. Espera a que el sub-bot se conecte y listo.`
      );
    }

    if (connection === 'open') {
      await subSock.sendMessage(from, { text: '✅ Tu sub-bot ya está conectado y listo para usar.' }, { quoted: m });
    }

    if (connection === 'close') {
      await enviar('❌ El sub-bot se desconectó. Usa el comando .code para generar uno nuevo.');
    }
  });

  subSock.ev.on('creds.update', saveCreds);
};
