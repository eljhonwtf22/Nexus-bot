# Nexus-bot

Bot de WhatsApp creado con la librería [Baileys](https://github.com/WhiskeySockets/Baileys), usando Node.js y un sistema modular basado en comandos. Diseñado para ser liviano, flexible y fácil de ampliar.

> **Estado del proyecto:** En desarrollo. Este bot está en proceso de construcción y mejora constante. Poco a poco irá creciendo, añadiendo nuevas funcionalidades, estabilidad y herramientas útiles para los usuarios.

---

## Características

- Uso de **Baileys** (v6.7.17)
- Arquitectura basada en comandos (`require`)
- Soporte para múltiples sub-bots
- Configuración persistente en JSON
- Sistema modular y escalable

---

## Instalación y uso en Termux

Sigue estos pasos para instalar y ejecutar el bot en Termux:

### 1. Clona el repositorio

```bash
termux-setup-storage 
pkg update && pkg upgrade
pkg install nodejs
git clone https://github.com/eljhonwtf22/Nexus-bot.git
cd Nexus-bot
npm install
node index.js
