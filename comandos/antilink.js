const fs = require('fs');
const ANTILINK_FILE = './antilink.json';

function cargarAntilink() {
    if (!fs.existsSync(ANTILINK_FILE)) return {};
    return JSON.parse(fs.readFileSync(ANTILINK_FILE));
}

function guardarAntilink(data) {
    fs.writeFileSync(ANTILINK_FILE, JSON.stringify(data, null, 2));
}

module.exports = async ({ sock, m, from, args, enviar }) => {
    const subcomando = args[0]?.toLowerCase();
    const tipo = m.body.includes('antilink1') ? 'antilink1' : m.body.includes('antilink2') ? 'antilink2' : null;

    if (!tipo || !['on', 'off'].includes(subcomando)) {
        enviar(`Usa correctamente:\n.antilink1 on/off\n.antilink2 on/off`);
        return;
    }

    const estado = subcomando === 'on';
    const data = cargarAntilink();

    if (!data[from]) data[from] = {};
    data[from][tipo] = estado;

    guardarAntilink(data);

    enviar(`✅ ${tipo} ${estado ? 'activado' : 'desactivado'} para este grupo.`);
};
