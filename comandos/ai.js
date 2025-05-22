const axios = require('axios');
// Si algún día necesitas jidDecode:
// const { jidDecode } = require('@whiskeysockets/baileys');

const emoji = '🤖';
const emoji2 = '💬';

// Puedes definir estos datos según tu preferencia o hacerlos globales
const botname = 'Nexus';
const etiqueta = 'eljhonwtf22';
const vs = '1.0';
const msm = '[IA]';

// Analiza imagen (si hay)
async function fetchImageBuffer(content, imageBuffer) {
  try {
    const response = await axios.post('https://Luminai.my.id', {
      content: content,
      imageBuffer: imageBuffer
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Llama a la IA por texto
async function luminsesi(q, username, logic) {
  try {
    const response = await axios.post("https://Luminai.my.id", {
      content: q,
      user: username,
      prompt: logic,
      webSearchMode: false
    });
    return response.data.result;
  } catch (error) {
    console.error(`${msm} Error al obtener:`, error);
    throw error;
  }
}

module.exports = async ({ sock, m, args }) => {
  try {
    // Si necesitas obtener el user de un JID, hazlo así:
    // const decoded = jidDecode(m.sender) || {};
    // const user = decoded.user || '';

    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/');
    const username = m.pushName || (m.sender && m.sender.split('@')[0]) || 'usuario';
    const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`;
    const text = args.join(' ').trim();

    if (isQuotedImage) {
      const q = m.quoted;
      const img = await q.download?.();
      if (!img || !Buffer.isBuffer(img)) {
        console.error(`${msm} Error: No image buffer available o no es buffer`);
        return await sock.sendMessage(m.chat, { text: '✘ ChatGpT no pudo descargar la imagen.' }, { quoted: m });
      }
      const content = `${emoji} ¿Qué se observa en la imagen?`;
      try {
        const imageAnalysis = await fetchImageBuffer(content, img);
        const query = `${emoji} Descríbeme la imagen y detalla por qué actúan así. También dime quién eres`;
        const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`;
        const description = await luminsesi(query, username, prompt);
        await sock.sendMessage(m.chat, { text: description }, { quoted: m });
      } catch {
        await sock.sendMessage(m.chat, { text: '✘ ChatGpT no pudo analizar la imagen.' }, { quoted: m });
      }
    } else {
      if (!text) {
        return await sock.sendMessage(m.chat, { text: `${emoji} Ingrese una petición para que el ChatGpT lo responda.` }, { quoted: m });
      }
      try {
        await sock.sendMessage(m.chat, { text: `${emoji2} ChatGPT está procesando tu petición, espera unos segundos.` }, { quoted: m });
        const query = text;
        const prompt = `${basePrompt}. Responde lo siguiente: ${query}`;
        const response = await luminsesi(query, username, prompt);
        await sock.sendMessage(m.chat, { text: response }, { quoted: m });
      } catch {
        await sock.sendMessage(m.chat, { text: '✘ ChatGpT no puede responder a esa pregunta.' }, { quoted: m });
      }
    }
  } catch (e) {
    console.error(e);
    await sock.sendMessage(m.chat, { text: 'Ocurrió un error al procesar tu solicitud.' }, { quoted: m });
  }
};
