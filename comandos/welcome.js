const fs = require('fs');
const path = './bienvenidas.json';

if (!fs.existsSync(path)) fs.writeFileSync(path, '{}');

module.exports = async ({ sock, from, args, isGroup, isAdmin, enviar }) => {
    if (!isGroup) return enviar('Este comando solo funciona en grupos.');
    if (!isAdmin) return enviar('Solo los administradores pueden activar o desactivar la bienvenida.');

    let db = JSON.parse(fs.readFileSync(path));

    const estado = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(estado)) return enviar('Uso correcto: .welcome on / .welcome off');

    db[from] = estado === 'on';
    fs.writeFileSync(path, JSON.stringify(db, null, 2));
    
    enviar(`Bienvenida ${estado === 'on' ? 'activada' : 'desactivada'} correctamente.`);
};