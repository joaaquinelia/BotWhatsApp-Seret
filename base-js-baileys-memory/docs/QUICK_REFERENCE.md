# ⚡ Quick Reference - Comandos Privados

## 🎯 Configuración de 30 Segundos

### 1. Edita tu número

`src/config/private-commands.config.js`:
```javascript
export const AUTHORIZED_NUMBERS = [
  '5493364015970', // ← Tu número aquí
]
```

### 2. Inicia bot

```bash
npm run dev
```

### 3. Usa comandos

```
/articulo termica 25a
/dolar
/stock cable
/precio disyuntor
```

---

## 📋 Comandos Disponibles

```
/articulo <búsqueda>  → Buscar productos
/dolar                → Cotización del dólar
/stock <búsqueda>     → Consultar stock
/precio <búsqueda>    → Consultar precios
```

---

## ➕ Agregar Número (en 2 líneas)

`src/config/private-commands.config.js`:
```javascript
export const AUTHORIZED_NUMBERS = [
  '5493364015970',  // Existente
  '5491234567890',  // ← Nuevo
]
```

---

## ✏️ Crear Nuevo Comando (3 pasos)

### 1. Handler

`src/services/private-commands.handlers.js`:
```javascript
export async function handleMiComandoCommand(args, context) {
  return {
    success: true,
    message: `Hola! Argumentos: ${args}`
  }
}
```

### 2. Registrar

`src/services/private-commands.init.js`:
```javascript
import { handleMiComandoCommand } from './private-commands.handlers.js'

export function initializePrivateCommands() {
  // ... código existente ...
  registerPrivateCommand(
    'mi-comando',
    'Descripción breve',
    handleMiComandoCommand
  )
}
```

### 3. Usar

```
/mi-comando argumentos
```

---

## 🔍 Verificar Que Funciona

```bash
npm run dev
```

Busca en logs:
```
✅ Comandos privados inicializados correctamente
```

Test:
- Desde tu número: `/articulo test` → Debe responder
- Desde otro número: `/articulo test` → Silencio

---

## 🆘 Quick Fixes

| Problema | Fix |
|----------|-----|
| No funciona | ¿Número correcto en `AUTHORIZED_NUMBERS`? |
| "Número incorrecto" | Debe ser: `5493364015970` (sin + ni espacios) |
| Bot no responde | ¿`privateCommandsFlow` es PRIMERO en app.js? |
| Error en handler | Revisa `console.log` en `npm run dev` |

---

## 📁 Archivos Importantes

| Archivo | Para |
|---------|------|
| `src/config/private-commands.config.js` | Números autorizados |
| `src/services/private-commands.handlers.js` | Lógica de comandos |
| `src/services/private-commands.init.js` | Registrar comandos |
| `src/app.js` | Ya está configurado ✅ |

---

## 📚 Documentación Completa

- 📖 [PRIVATE_COMMANDS_GUIDE.md](./PRIVATE_COMMANDS_GUIDE.md) - Guía detallada
- 💡 [PRIVATE_COMMANDS_EXAMPLES.md](./PRIVATE_COMMANDS_EXAMPLES.md) - Ejemplos
- 🐛 [PRIVATE_COMMANDS_TROUBLESHOOTING.md](./PRIVATE_COMMANDS_TROUBLESHOOTING.md) - Problemas
- 📋 [PRIVATE_COMMANDS_INDEX.md](./PRIVATE_COMMANDS_INDEX.md) - Índice completo

---

## 🎓 Patrón de Reutilización

Todos los handlers siguen el patrón:

```javascript
export async function handle[COMANDO]Command(args, context) {
  if (!args) {
    return { success: false, message: '❌ Debes especificar algo' }
  }
  
  try {
    const resultado = await hacerAlgo(args)
    return {
      success: true,
      message: `✅ ${resultado}`
    }
  } catch (error) {
    return { success: false, message: `❌ Error: ${error.message}` }
  }
}
```

---

## 🚀 Ejemplo Completo: Nuevo Comando

Crear `/clima`:

**1. Handler** (`private-commands.handlers.js`):
```javascript
export async function handleClimaCommand(args, context) {
  try {
    const data = await fetch('...').then(r => r.json())
    return { success: true, message: `🌤️ ${data.temp}°C` }
  } catch (e) {
    return { success: false, message: '❌ Error' }
  }
}
```

**2. Registrar** (`private-commands.init.js`):
```javascript
registerPrivateCommand('clima', 'Ver clima', handleClimaCommand)
```

**3. Usar**:
```
/clima
```

---

## ✨ Atajos

**Ver todos los comandos:**
```javascript
// En any handler:
import { getPrivateCommandsList } from '../services/private-commands.service.js'
const cmds = getPrivateCommandsList()
console.log(cmds)
```

**Validar número:**
```javascript
import { isAuthorizedNumber } from '../config/private-commands.config.js'
if (isAuthorizedNumber(phone)) { /* ... */ }
```

---

**TLDR: Edita número en config → npm run dev → /articulo test ✨**
