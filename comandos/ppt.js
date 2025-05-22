module.exports = async ({ enviar, args }) => {
    if (!args[0]) return enviar('Usa: .ppt piedra | papel | tijera');

    const opciones = [
        { nombre: 'piedra', emoji: '✊' },
        { nombre: 'papel', emoji: '🖐️' },
        { nombre: 'tijera', emoji: '✌️' }
    ];
    const eleccionUsuario = args[0].toLowerCase();
    const opcionUsuario = opciones.find(o => o.nombre === eleccionUsuario);

    if (!opcionUsuario) return enviar('Opción inválida. Escribe: piedra, papel o tijera');

    const opcionBot = opciones[Math.floor(Math.random() * 3)];

    let resultado = '';
    if (opcionUsuario.nombre === opcionBot.nombre) {
        resultado = '🤝 ¡Empate!';
    } else if (
        (opcionUsuario.nombre === 'piedra' && opcionBot.nombre === 'tijera') ||
        (opcionUsuario.nombre === 'tijera' && opcionBot.nombre === 'papel') ||
        (opcionUsuario.nombre === 'papel' && opcionBot.nombre === 'piedra')
    ) {
        resultado = '🎉 ¡Ganaste!';
    } else {
        resultado = '😢 ¡Perdiste!';
    }

    enviar(
        `Tú elegiste: ${opcionUsuario.emoji} *${opcionUsuario.nombre}*\n` +
        `Bot eligió: ${opcionBot.emoji} *${opcionBot.nombre}*\n\n` +
        `Resultado: ${resultado}`
    );
};