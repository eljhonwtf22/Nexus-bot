const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = async ({ sock, m, enviar }) => {
  try {
    // Verificamos que el mensaje contenga sticker
    const sticker = m.message?.stickerMessage;
    if (!sticker) return enviar('Responde a un sticker .webp para convertirlo en imagen');

    // Creamos la carpeta 'temp' si no existe
    const tempPath = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath);
    }

    // Definimos rutas
    const inputPath = path.join(tempPath, 'sticker.webp');
    const outputPath = path.join(tempPath, 'imagen.png');

    // Descargamos el sticker
    const buffer = await sock.downloadMediaMessage(m);
    fs.writeFileSync(inputPath, buffer);

    // Convertimos con ffmpeg
    exec(`ffmpeg -i "${inputPath}" "${outputPath}"`, async (error) => {
      if (error) {
        console.error('Error al convertir:', error);
        return enviar('Error al convertir el sticker.');
      }

      // Enviamos la imagen
      const imageBuffer = fs.readFileSync(outputPath);
      await sock.sendMessage(m.key.remoteJid, {
        image: imageBuffer,
        caption: 'Aquí está tu imagen.'
      }, { quoted: m });

      // Borramos los archivos temporales
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });

  } catch (err) {
    console.error(err);
    enviar('Ocurrió un error al procesar el sticker.');
  }
};