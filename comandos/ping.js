module.exports = async ({ enviar }) => {
    const start = Date.now();
    const end = Date.now();
    enviar(`🏓 ¡Pong! Velocidad del bot: ${end - start} ms`);
};