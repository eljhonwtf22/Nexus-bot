// comandos/economia.js
const fs = require('fs');
const path = require('path');

const DB_PATH = './db_economia.json';

// Carga o inicializa la base de datos
function cargarDB() {
  if (!fs.existsSync(DB_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(DB_PATH));
  } catch {
    return {};
  }
}

// Guarda la base de datos
function guardarDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Obtiene saldo o inicializa en 0
function getSaldo(db, user) {
  if (!db[user]) db[user] = { saldo: 0, trabajo: null };
  return db[user].saldo;
}

// Ajusta saldo (puede ser positivo o negativo)
function ajustarSaldo(db, user, cantidad) {
  if (!db[user]) db[user] = { saldo: 0, trabajo: null };
  db[user].saldo += cantidad;
  if (db[user].saldo < 0) db[user].saldo = 0;
}

module.exports = {
  // Mostrar saldo personal
  saldo: async ({ enviar, sender }) => {
    const db = cargarDB();
    const saldo = getSaldo(db, sender);
    enviar(`💰 Tu saldo es: $${saldo}`);
  },

  // Trabajar para ganar dinero aleatorio
  trabajar: async ({ enviar, sender }) => {
    const db = cargarDB();
    const ganancia = Math.floor(Math.random() * 100) + 50; // 50 a 149
    ajustarSaldo(db, sender, ganancia);
    guardarDB(db);
    enviar(`💼 Trabajaste y ganaste $${ganancia}. ¡Buen trabajo!`);
  },

  // Enviar dinero a otro usuario (por @mencion o número)
  enviar: async ({ enviar, sender, args }) => {
    if (args.length < 2) return enviar('Uso: enviar <@usuario> <cantidad>');

    const usuarioDestino = args[0].replace(/[^0-9@s.]/g, '');
    const cantidad = parseInt(args[1], 10);
    if (isNaN(cantidad) || cantidad <= 0) return enviar('Cantidad inválida.');

    const db = cargarDB();
    if (getSaldo(db, sender) < cantidad) return enviar('No tienes suficiente saldo.');

    ajustarSaldo(db, sender, -cantidad);
    ajustarSaldo(db, usuarioDestino, cantidad);
    guardarDB(db);
    enviar(`✅ Enviaste $${cantidad} a ${usuarioDestino}.`);
  },

  // Robar saldo de otro usuario (probabilidad y riesgo)
  robar: async ({ enviar, sender, args }) => {
    if (args.length < 1) return enviar('Uso: robar <@usuario>');

    const objetivo = args[0].replace(/[^0-9@s.]/g, '');
    if (objetivo === sender) return enviar('No puedes robarte a ti mismo.');

    const db = cargarDB();
    const saldoObjetivo = getSaldo(db, objetivo);

    if (saldoObjetivo <= 0) return enviar('El objetivo no tiene saldo para robar.');

    // Chance de éxito 50%
    if (Math.random() < 0.5) {
      const cantidadRobada = Math.floor(Math.random() * Math.min(100, saldoObjetivo)) + 1;
      ajustarSaldo(db, sender, cantidadRobada);
      ajustarSaldo(db, objetivo, -cantidadRobada);
      guardarDB(db);
      enviar(`💰 Robaste $${cantidadRobada} a ${objetivo}.`);
    } else {
      const multa = 50;
      ajustarSaldo(db, sender, -multa);
      guardarDB(db);
      enviar(`❌ Te atraparon y pagaste una multa de $${multa}.`);
    }
  },

  // Mostrar leaderboard top 5
  leaderboard: async ({ enviar }) => {
    const db = cargarDB();
    const ordenados = Object.entries(db)
      .sort((a, b) => b[1].saldo - a[1].saldo)
      .slice(0, 5);

    let texto = '🏆 Top 5 usuarios con más dinero:\n\n';
    ordenados.forEach(([user, data], i) => {
      texto += `${i + 1}. ${user} - $${data.saldo}\n`;
    });
    enviar(texto);
  },

  // Comprar ítem (simulado)
  comprar: async ({ enviar, sender, args }) => {
    if (args.length < 1) return enviar('Uso: comprar <item>');

    const item = args[0].toLowerCase();
    const precios = {
      pizza: 100,
      moto: 1000,
      casa: 10000,
    };

    if (!precios[item]) return enviar('Ítem no disponible para comprar.');

    const db = cargarDB();
    if (getSaldo(db, sender) < precios[item]) return enviar('No tienes suficiente dinero.');

    ajustarSaldo(db, sender, -precios[item]);
    // Aquí podrías guardar el inventario, pero omitido para simplicidad
    guardarDB(db);
    enviar(`✔️ Compraste un(a) ${item} por $${precios[item]}.`);
  },

  // Mostrar ayuda de economía
  ayuda: async ({ enviar }) => {
    enviar(
      `Comandos de economía disponibles:\n` +
      `.saldo - Ver tu saldo\n` +
      `.trabajar - Trabajar y ganar dinero\n` +
      `.enviar <usuario> <cantidad> - Enviar dinero\n` +
      `.robar <usuario> - Intentar robar dinero\n` +
      `.leaderboard - Top usuarios\n` +
      `.comprar <item> - Comprar ítems\n`
    );
  },

  // Más comandos sencillos para completar 15
  casino: async ({ enviar, sender }) => {
    const db = cargarDB();
    const apuesta = Math.floor(Math.random() * 200) + 50;
    if (getSaldo(db, sender) < apuesta) return enviar('No tienes suficiente saldo para apostar.');

    ajustarSaldo(db, sender, -apuesta);

    const ganar = Math.random() < 0.4;
    if (ganar) {
      const premio = apuesta * 2;
      ajustarSaldo(db, sender, premio);
      guardarDB(db);
      enviar(`🎰 Ganaste en el casino $${premio}!`);
    } else {
      guardarDB(db);
      enviar(`💸 Perdiste $${apuesta} en el casino. Mejor suerte la próxima.`);
    }
  },

  trabajo: async ({ enviar, sender }) => {
    // Simular elección de trabajo y paga
    const trabajos = [
      { nombre: 'Camarero', paga: 50 },
      { nombre: 'Programador', paga: 120 },
      { nombre: 'Taxista', paga: 70 },
      { nombre: 'Doctor', paga: 150 }
    ];
    const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)];
    const db = cargarDB();
    ajustarSaldo(db, sender, trabajo.paga);
    guardarDB(db);
    enviar(`👔 Trabajaste como ${trabajo.nombre} y ganaste $${trabajo.paga}.`);
  },

  apuesta: async ({ enviar, sender, args }) => {
    if (args.length < 1) return enviar('Uso: apuesta <cantidad>');
    const cantidad = parseInt(args[0], 10);
    if (isNaN(cantidad) || cantidad <= 0) return enviar('Cantidad inválida.');

    const db = cargarDB();
    if (getSaldo(db, sender) < cantidad) return enviar('No tienes suficiente saldo.');

    ajustarSaldo(db, sender, -cantidad);
    const ganar = Math.random() < 0.5;

    if (ganar) {
      const premio = cantidad * 2;
      ajustarSaldo(db, sender, premio);
      guardarDB(db);
      enviar(`🎉 Ganaste $${premio} apostando.`);
    } else {
      guardarDB(db);
      enviar(`😢 Perdiste $${cantidad} apostando.`);
    }
  },

  diario: async ({ enviar, sender }) => {
    const db = cargarDB();
    if (!db[sender]) db[sender] = { saldo: 0, lastDiario: 0 };
    const ahora = Date.now();
    if (db[sender].lastDiario && ahora - db[sender].lastDiario < 86400000) {
      const restante = Math.ceil((86400000 - (ahora - db[sender].lastDiario)) / 3600000);
      return enviar(`⏳ Ya reclamaste tu premio diario. Intenta de nuevo en ${restante} horas.`);
    }
    const premio = 500;
    ajustarSaldo(db, sender, premio);
    db[sender].lastDiario = ahora;
    guardarDB(db);
    enviar(`🎁 Premio diario recibido: $${premio}`);
  },

  trabajarHoy: async ({ enviar, sender }) => {
    const db = cargarDB();
    if (!db[sender]) db[sender] = { saldo: 0, lastTrabajo: 0 };
    const ahora = Date.now();
    if (db[sender].lastTrabajo && ahora - db[sender].lastTrabajo < 3600000) {
      const restante = Math.ceil((3600000 - (ahora - db[sender].lastTrabajo)) / 60000);
      return enviar(`⏳ Ya trabajaste hace poco. Intenta de nuevo en ${restante} minutos.`);
    }
    const ganancia = Math.floor(Math.random() * 100) + 50;
    ajustarSaldo(db, sender, ganancia);
    db[sender].lastTrabajo = ahora;
    guardarDB(db);
    enviar(`💼 Trabajaste y ganaste $${ganancia}.`);
  },

  limpiarSaldo: async ({ enviar, sender }) => {
    const db = cargarDB();
    if (!db[sender]) return enviar('No tienes saldo registrado.');
    db[sender].saldo = 0;
    guardarDB(db);
    enviar('🧹 Tu saldo ha sido limpiado a $0.');
  },
};