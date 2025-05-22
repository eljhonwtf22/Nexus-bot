const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const cfonts = require('cfonts');
const readline = require('readline');
const moment = require('moment-timezone');
const qrcode = require('qrcode-terminal');
const QRImage = require('qrcode');
global.currentQR = null;
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} = require('baileys');
const pino = require('pino');
const NodeCache = require('node-cache');
const axios = require('axios');

const OWNER_JID = '584142577312@s.whatsapp.net';
const ANTILINK_FILE = './antilink.json';

function cargarAntilink() {
  if (!fs.existsSync(ANTILINK_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(ANTILINK_FILE));
  } catch (e) {
    return {};
  }
}

function guardarAntilink(obj) {
  fs.writeFileSync(ANTILINK_FILE, JSON.stringify(obj, null, 2));
}

global.antilinkGroups = cargarAntilink();

function mostrarBanner() {
  cfonts.say('Drakobot', {
    font: 'pallet',
    align: 'center',
    colors: ['magenta', 'white'],
    background: 'transparent',
  });
}

const color = (text, color) => (!color ? chalk.green(text) : chalk.keyword(color)(text));
const hora = () => moment().tz('America/Buenos_Aires').format('HH:mm:ss');

const comandosPath = path.join(__dirname, 'comandos');

global.comandos = {};
global.cargarComandos = function () {
  global.comandos = {};
  if (fs.existsSync(comandosPath)) {
    fs.readdirSync(comandosPath).forEach((file) => {
      if (file.endsWith('.js')) {
        const comando = file.replace('.js', '');
        delete require.cache[require.resolve(path.join(comandosPath, file))];
        global.comandos[comando] = require(path.join(comandosPath, file));
      }
    });
  }
};
global.cargarComandos();

if (global.comandos['sticker']) {
  global.comandos['s'] = global.comandos['sticker'];
}

if (global.comandos['ai']) {
  global.comandos['ia'] = global.comandos['ai'];
  global.comandos['gpt'] = global.comandos['ai'];
  global.comandos['chat'] = global.comandos['ai'];
}

async function pedirNumero() {
  mostrarBanner();
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      chalk.yellowBright('\n╭──────────────────────────────╮\n') +
        chalk.yellowBright('│') +
        chalk.black.bgYellowBright(' Hola, pon tu número de teléfono ') +
        chalk.yellowBright('│\n│') +
        chalk.black.bgYellowBright(' ejemplo: 58414*****             ') +
        chalk.yellowBright('│\n╰──────────────────────────────╯\n'),
      (numero) => {
        rl.close();
        numero = numero.replace(/[^0-9]/g, '');
        if (!/^[0-9]{10,15}$/.test(numero)) {
          console.log(
            chalk.red('\n╭──── ATENCIÓN ────╮') +
              `\n│ ` +
              chalk.whiteBright('Formato incorrecto') +
              `\n╰──────────────────╯`
          );
          process.exit(1);
        }
        resolve(numero);
      }
    );
  });
}

async function startBot(numeroUsuario = null, usarQR = true) {
  const store = makeInMemoryStore({
    logger: pino().child({ level: 'silent', stream: 'store' }),
  });
  const msgRetryCounterCache = new NodeCache();
  let { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const pairingCode = !state.creds.registered;

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino({ level: 'fatal' }).child({ level: 'fatal' })
      ),
    },
    msgRetryCounterCache,
  });

  store.bind(sock.ev);

  if (!usarQR && pairingCode) {
    let code = await sock.requestPairingCode(numeroUsuario);
    code = code?.match(/.{1,4}/g)?.join('-') || code;
    console.log(
      chalk.yellowBright('\n╭──────── Código de Vinculación ────────╮') +
        `\n│ Tu código es: ` +
        chalk.black.bgYellowBright(code) +
        `\n╰──────────────────────────────────────╯`
    );
    console.log(
      chalk.cyan(
        '\n╭──────────────────────────────────────────────╮' +
          '\n│ Ingresa este código en WhatsApp Web          │' +
          '\n╰──────────────────────────────────────────────╯'
      )
    );
  }

sock.ev.on('connection.update', async (update) => {
  console.log('Connection update:', JSON.stringify(update, null, 2));

  const { connection, qr, lastDisconnect } = update;

if (qr && usarQR) {
  global.currentQR = qr; // Guarda el QR para los comandos .qr y .code
  console.log(
    chalk.yellowBright('\n╭──────── Escanea este código QR ───────╮')
  );
  qrcode.generate(qr, { small: true });
  console.log(chalk.yellowBright('╰──────────────────────────────────────╯'));
}

  if (connection === 'close') {
    console.log('Connection closed. Reason:', lastDisconnect?.error?.output?.statusCode);
    const reason = lastDisconnect?.error?.output?.statusCode;
    if (
      reason === DisconnectReason.loggedOut ||
      reason === DisconnectReason.badSession
    ) {
      console.log(
        chalk.red(
          '\n╭─── ERROR ────╮\n│ Sesión cerrada o corrupta.\n│ Borra la carpeta "session".\n╰──────────────╯'
        )
      );
      process.exit();
    } else {
      console.log('Intentando reconectar...');
      startBot(numeroUsuario, usarQR);
    }
  }

  if (connection === 'open') {
    mostrarBanner();
    console.log(
      chalk.greenBright('\n╭───────── CONEXIÓN ─────────╮') +
        '\n│ Drakobot conectado          │' +
        '\n╰────────────────────────────╯\n'
    );
  }
});

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const m = messages[0];
      if (!m.message || (m.key && m.key.remoteJid === 'status@broadcast')) return;
      const from = m.key.remoteJid;
      const pushname = m.pushName || '';
      const isGroup = from.endsWith('@g.us');
      const body =
        m.message.conversation || m.message?.extendedTextMessage?.text || '';
      const multiPrefijo = ['.', '!', '/', '#'];
      const isCmd = multiPrefijo.some((p) => body.startsWith(p));

      // DEFINICIÓN CORRECTA DE esIA:
      const palabrasClaveIA = ['bot', 'nexus', '.ia', '.bot'];
      const esMensajePropio = m.key.fromMe;
      const esIA = !esMensajePropio && palabrasClaveIA.some(p =>
        body?.toLowerCase().includes(p)
      );

      const comando = isCmd ? body.slice(1).split(' ')[0].toLowerCase() : null;
      const args = isCmd ? body.trim().split(/ +/).slice(1) : [];
      const enviar = (texto, opciones = {}) =>
        sock.sendMessage(from, { text: texto, ...opciones }, { quoted: m });

      let isAdmin = false;
      let participants = [];
      if (isGroup) {
        const groupMetadata = await sock.groupMetadata(from);
        participants = groupMetadata.participants;
        const sender = m.key.participant || m.participant || m.key.remoteJid;
        isAdmin =
          participants.some(
            (p) =>
              (p.id === sender || p.jid === sender || p.participant === sender) &&
              (p.admin === 'admin' || p.admin === 'superadmin')
          ) || groupMetadata.owner === sender;
      }

      if (isGroup && antilinkGroups[from]) {
        const textoMsg = body.toLowerCase();
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
        const whatsappGroupLink = /chat\.whatsapp\.com\/([A-Za-z0-9]+)/i;
        const usuario = m.key.participant || m.participant || from;

        let esAdminUsuario = false;
        if (participants && Array.isArray(participants)) {
          esAdminUsuario = participants.some(
            (p) =>
              (p.id === usuario || p.jid === usuario || p.participant === usuario) &&
              (p.admin === 'admin' || p.admin === 'superadmin')
          );
        }

        const linkEnMensaje = textoMsg.match(whatsappGroupLink);
        if (linkEnMensaje) {
          const codeDetectado = linkEnMensaje[1]?.toLowerCase();
          const codeGrupo = (await sock.groupInviteCode(from)).toLowerCase();

          if (codeDetectado !== codeGrupo) {
            if (!esAdminUsuario) {
              await sock.sendMessage(from, { delete: m.key });
              await sock.groupParticipantsUpdate(from, [usuario], 'remove').catch(() => {});
              await sock.sendMessage(from, {
                text: `🚨 Se detectó un enlace de otro grupo y el usuario fue expulsado.`,
              });
            } else {
              enviar(
                '🙃 ¡Tonto! Solo los admins pueden mandar enlaces, pero no te puedo expulsar porque eres admin. 👑'
              );
            }
            return;
          }
        }

        if (urlRegex.test(textoMsg)) {
          if (!esAdminUsuario) {
            await sock.sendMessage(from, { delete: m.key });
            await sock.groupParticipantsUpdate(from, [usuario], 'remove').catch(() => {});
            await sock.sendMessage(from, {
              text: `🚨 Se detectó un enlace no permitido y el usuario fue expulsado.`,
            });
          } else {
            enviar(
              '🙃 ¡Tonto! Solo los admins pueden mandar enlaces, pero no te puedo expulsar porque eres admin. 👑'
            );
          }
          return;
        }
      }

      console.log(
        chalk.yellowBright(`\n╭───────── MENSAJE ─────────╮\n│ ${hora()} | ${pushname}\n│ ${from}\n│ ${isCmd ? `→ Comando: ${comando}` : '→ Mensaje sin comando'}\n╰────────────────────────────╯`)
      );

      if ((isCmd && global.comandos[comando]) || esIA) {
        const comandoAEjecutar = global.comandos[comando] || global.comandos['ia'];
        if (comandoAEjecutar) {
          await comandoAEjecutar({
            sock, m, from, pushname, args, enviar, isGroup, OWNER_JID,
            participants, isAdmin, guardarAntilink
          });
        }
      }
    } catch (e) {
      console.log(chalk.red(`\n╭──── ERROR ────╮\n│ ${e.message}\n╰──────────────╯`));
    }
  });
}

(async () => {
  if (fs.existsSync('./session/creds.json')) {
    await startBot(null, true);
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log(chalk.cyan('\n╭────────────────────────────╮\n│ Selecciona el método       │\n╰────────────────────────────╯'));
    console.log(chalk.green('[1] Código QR (recomendado)'));
    console.log(chalk.yellow('[2] Código de 8 dígitos'));

    rl.question(chalk.blueBright('\nTu elección (1 o 2): '), async (respuesta) => {
      rl.close();
      const usarQR = respuesta.trim() === '1';

      let numero = null;
      if (!usarQR) {
        numero = await pedirNumero();
      }

      await startBot(numero, usarQR);
    });
  }
})();
