const fs = require('fs');
const path = require('path');

module.exports = async ({ sock, from, enviar }) => {
    try {
        await enviar('🔄 Cargando archivos de comandos...');

        // Cierra conexión actual
        if (sock.ws && sock.ws.readyState === 1) {
            await sock.ws.close();
        }

        // Elimina caché del archivo principal
        delete require.cache[require.resolve('../index.js')];

        // Requiere de nuevo index.js
        require('../index.js');

        await enviar('✅ Archivo cargado: *index.js*');
    } catch (err) {
        console.error('❌ Error al recargar el bot:', err);
        await enviar(`❌ Error al recargar:\n${err.message}`);
    }
};