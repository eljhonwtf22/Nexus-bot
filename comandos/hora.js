const moment = require('moment-timezone');

module.exports = async ({ enviar, args }) => {
    if (!args[0]) {
        return enviar('🕒 Por favor, dime el país o ciudad de la que quieres saber la hora actual. Ejemplo: `.hora Venezuela` o `.hora Caracas`');
    }

    // Une los argumentos por si es un país/ciudad compuesto
    const lugar = args.join(' ');

    // Intenta encontrar la zona horaria asociada
    const zonas = moment.tz.names().filter(z => 
        z.toLowerCase().includes(lugar.toLowerCase())
    );

    if (zonas.length === 0) {
        return enviar('❌ No encontré ese país o ciudad. Intenta con otro nombre o escribe uno más específico.');
    }

    // Usa la primera zona encontrada
    const zona = zonas[0];
    const hora = moment().tz(zona).format('HH:mm:ss');
    const fecha = moment().tz(zona).format('dddd, DD MMMM YYYY');

    enviar(`🕒 La hora actual en *${zona}* es:\n*${hora}* (${fecha})`);
};