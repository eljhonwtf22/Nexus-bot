const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = async ({ sock, m, enviar }) => {
  const media = m.message?.imageMessage || m.message?.videoMessage;
  if (!media) return enviar('Responde a una imagen o video de máximo 10 segundos.');

  // Crear carpeta temp si no existe
  const tempPath = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath);
  }

  const inputPath = path.join(tempPath, 'input');
  const outputPath = path.join(tempPath, 'output.webp');

  try {
    // Descargar el archivo multimedia
    const buffer = await sock.downloadMediaMessage(m);
    fs.writeFileSync(inputPath, buffer);

    // Convertir a sticker con ffmpeg
    const cmd = `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -loop 0 -ss 0 -t 10 -preset default -an -vsync 0 "${outputPath}"`;

    exec(cmd, async (err) => {
      if (err) {
        console.error('Error al convertir:', err);
        return enviar('Error al crear el sticker.');
      }

      const sticker = fs.readFileSync(outputPath);
      await sock.sendMessage(m.key.remoteJid, {
        sticker,
      }, { quoted: m });

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (e) {
    console.error(e);
    enviar('Hubo un error procesando el archivo.');
  }
};