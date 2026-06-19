# 📋 Resumen: Qué Copiar y Pegar

Este documento te muestra **EXACTAMENTE** qué hacer en cada archivo.

---

## 🎯 Resumen Ejecutivo

**5 archivos nuevos + 1 archivo modificado = Todo listo**

```
✨ CREAR 5 archivos nuevos
✏️ MODIFICAR 1 archivo existente
🚀 INICIAR BOT
✅ LISTO
```

---

## ✨ Archivos a Crear

### 1️⃣ `src/config/private-commands.config.js`

**Acción:** Crear archivo NUEVO
**Ubicación:** `src/config/private-commands.config.js`
**Contenido:** Copia TODO esto:

```javascript
/**
 * Configuración de Comandos Privados
 * 
 * Define los números autorizados y los comandos disponibles
 * para ejecución restringida (solo por propietarios del bot)
 */

// Números autorizados para ejecutar comandos privados (sin el formato +xx)
// Formato: solo la parte numérica, ej: "5493364015970"
export const AUTHORIZED_NUMBERS = [
  '5493364015970', // Tu número principal
  // Agregar más números aquí si es necesario:
  // '5491234567890',
  // '5499876543210',
]

/**
 * Registro de comandos privados
 * Cada comando debe tener:
 * - comando: palabra clave del comando (sin la barra inicial)
 * - descripción: qué hace el comando
 * - handler: función que ejecuta el comando
 */
export const PRIVATE_COMMANDS_REGISTRY = []

/**
 * Agregar un comando privado al registro
 * Uso: registerPrivateCommand('mi-comando', 'Descripción', handlerFunction)
 */
export function registerPrivateCommand(comando, descripcion, handler) {
  PRIVATE_COMMANDS_REGISTRY.push({
    comando: comando.toLowerCase(),
    descripcion,
    handler,
  })
}

/**
 * Obtener un comando privado por nombre
 */
export function getPrivateCommand(comando) {
  const cmd = comando.toLowerCase()
  return PRIVATE_COMMANDS_REGISTRY.find(c => c.comando === cmd)
}

/**
 * Verificar si un número está autorizado
 */
export function isAuthorizedNumber(phoneNumber) {
  // Normalizar el número (remover espacios, guiones, signos)
  const normalized = phoneNumber.replace(/[^\d]/g, '')
  return AUTHORIZED_NUMBERS.includes(normalized)
}
```

**✏️ Personalización:**
- Cambia `'5493364015970'` por tu número (SIN +, SIN espacios)

---

### 2️⃣ `src/services/private-commands.service.js`

**Acción:** Crear archivo NUEVO
**Ubicación:** `src/services/private-commands.service.js`
**Contenido:** Copia TODO esto:

```javascript
/**
 * Servicio de Comandos Privados
 * 
 * Maneja la detección, validación y ejecución de comandos
 * que solo pueden ser ejecutados por números autorizados
 */

import {
  AUTHORIZED_NUMBERS,
  PRIVATE_COMMANDS_REGISTRY,
  isAuthorizedNumber,
  getPrivateCommand,
} from '../config/private-commands.config.js'

/**
 * Verificar si un mensaje es un comando privado
 * Retorna: { isPrivateCommand: boolean, command: string, args: string }
 */
export function parsePrivateCommand(messageText) {
  const trimmed = messageText.trim()

  // Verificar si comienza con /
  if (!trimmed.startsWith('/')) {
    return {
      isPrivateCommand: false,
      command: null,
      args: null,
    }
  }

  // Extraer comando y argumentos
  const parts = trimmed.substring(1).split(/\s+/) // Remover / y dividir por espacios
  const command = parts[0].toLowerCase()
  const args = parts.slice(1).join(' ')

  // Verificar si el comando existe en el registro
  const commandExists = PRIVATE_COMMANDS_REGISTRY.some(
    c => c.comando === command
  )

  return {
    isPrivateCommand: commandExists,
    command: commandExists ? command : null,
    args: commandExists ? args : null,
  }
}

/**
 * Procesar un mensaje privado
 * Retorna: null si no es un comando privado, o el resultado del handler
 */
export async function handlePrivateCommand(
  messageText,
  phoneNumber,
  context
) {
  // Verificar si es un comando privado
  const { isPrivateCommand, command, args } = parsePrivateCommand(messageText)

  if (!isPrivateCommand) {
    return null
  }

  // Verificar si el número está autorizado
  if (!isAuthorizedNumber(phoneNumber)) {
    console.warn(
      `❌ Intento de ejecutar comando privado desde número no autorizado: ${phoneNumber}`
    )
    return null
  }

  // Obtener el comando registrado
  const cmdObj = getPrivateCommand(command)

  if (!cmdObj) {
    console.warn(`⚠️ Comando privado no encontrado: ${command}`)
    return null
  }

  try {
    // Ejecutar el handler del comando
    const result = await cmdObj.handler(args, context)
    return result
  } catch (error) {
    console.error(`❌ Error al ejecutar comando privado /${command}:`, error)
    return {
      success: false,
      message: `❌ Error al ejecutar el comando: ${error.message}`,
    }
  }
}

/**
 * Verificar si un mensaje debe ser ignorado por el bot
 * (es decir, NO debe procesarse en los flows normales)
 * 
 * Retorna true si es un comando privado ejecutado por número autorizado
 */
export function shouldIgnoreMessageForFlows(messageText, phoneNumber) {
  const { isPrivateCommand, command } = parsePrivateCommand(messageText)

  if (!isPrivateCommand || !command) {
    return false
  }

  return isAuthorizedNumber(phoneNumber)
}

/**
 * Obtener lista de todos los comandos privados registrados
 */
export function getPrivateCommandsList() {
  return PRIVATE_COMMANDS_REGISTRY.map(cmd => ({
    comando: cmd.comando,
    descripcion: cmd.descripcion,
  }))
}
```

**Sin cambios necesarios** ✅

---

### 3️⃣ `src/services/private-commands.handlers.js`

**Acción:** Crear archivo NUEVO
**Ubicación:** `src/services/private-commands.handlers.js`
**Contenido:** Copia TODO esto:

```javascript
/**
 * Handlers de Comandos Privados
 * 
 * Implementa la lógica específica de cada comando privado
 */

import { searchProductsWithMeta } from './products.service.js'
import { formatProductList } from '../utils/index.js'
import { getDolarListMessage } from './dolar.service.js'

/**
 * Handler para comando /articulo
 * Busca un artículo en la base de datos
 * 
 * Uso: /articulo termica bipolar 25a
 */
export async function handleArticuloCommand(searchTerm, context) {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return {
      success: false,
      message:
        '❌ Debes especificar qué producto buscar.\n' +
        'Uso: */articulo termica bipolar 25a*',
    }
  }

  try {
    const meta = await searchProductsWithMeta(searchTerm.trim(), 0)

    if (!meta.products.length) {
      return {
        success: true,
        message: `😕 No encontré productos para: *${searchTerm}*`,
      }
    }

    const intro =
      meta.totalCount > meta.products.length
        ? `📌 Encontré ${meta.totalCount} productos. Mostrando los primeros:\n\n`
        : ''

    return {
      success: true,
      message: intro + formatProductList(meta.products, searchTerm, meta.totalCount),
    }
  } catch (error) {
    console.error('Error en comando /articulo:', error)
    return {
      success: false,
      message: '❌ Error al buscar productos. Intenta de nuevo.',
    }
  }
}

/**
 * Handler para comando /dolar
 * Obtiene las cotizaciones del dólar actual
 * 
 * Uso: /dolar
 */
export async function handleDolarCommand(args, context) {
  try {
    const message = await getDolarListMessage()
    return {
      success: true,
      message,
    }
  } catch (error) {
    console.error('Error en comando /dolar:', error)
    return {
      success: false,
      message: '❌ No pude obtener la cotización del dólar.',
    }
  }
}

/**
 * Handler para comando /stock
 * Busca información de stock de un producto
 * (Placeholder - implementar según necesidad)
 */
export async function handleStockCommand(searchTerm, context) {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return {
      success: false,
      message:
        '❌ Debes especificar qué producto consultar.\n' +
        'Uso: */stock termica bipolar 25a*',
    }
  }

  try {
    const meta = await searchProductsWithMeta(searchTerm.trim(), 0)

    if (!meta.products.length) {
      return {
        success: true,
        message: `😕 No encontré productos para: *${searchTerm}*`,
      }
    }

    // Filtrar y mostrar solo información de stock
    const stockInfo = meta.products
      .map(
        p =>
          `📦 ${p.nombre || 'N/A'}\n` +
          `   Código: ${p.codigo || 'N/A'}\n` +
          `   Stock: ${p.stock !== undefined ? p.stock : 'N/A'}`
      )
      .join('\n\n')

    return {
      success: true,
      message: stockInfo,
    }
  } catch (error) {
    console.error('Error en comando /stock:', error)
    return {
      success: false,
      message: '❌ Error al consultar stock.',
    }
  }
}

/**
 * Handler para comando /precio
 * Busca información de precio de un producto
 * (Placeholder - implementar según necesidad)
 */
export async function handlePrecioCommand(searchTerm, context) {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return {
      success: false,
      message:
        '❌ Debes especificar qué producto consultar.\n' +
        'Uso: */precio termica bipolar 25a*',
    }
  }

  try {
    const meta = await searchProductsWithMeta(searchTerm.trim(), 0)

    if (!meta.products.length) {
      return {
        success: true,
        message: `😕 No encontré productos para: *${searchTerm}*`,
      }
    }

    // Filtrar y mostrar solo información de precio
    const precioInfo = meta.products
      .map(
        p =>
          `💲 ${p.nombre || 'N/A'}\n` +
          `   Código: ${p.codigo || 'N/A'}\n` +
          `   Precio: $${p.precio !== undefined ? p.precio : 'N/A'}`
      )
      .join('\n\n')

    return {
      success: true,
      message: precioInfo,
    }
  } catch (error) {
    console.error('Error en comando /precio:', error)
    return {
      success: false,
      message: '❌ Error al consultar precios.',
    }
  }
}
```

**Sin cambios necesarios** ✅

---

### 4️⃣ `src/services/private-commands.init.js`

**Acción:** Crear archivo NUEVO
**Ubicación:** `src/services/private-commands.init.js`
**Contenido:** Copia TODO esto:

```javascript
/**
 * Inicializador de Comandos Privados
 * 
 * Registra todos los comandos privados disponibles
 * Importar este archivo en app.js para que se inicialicen los comandos
 */

import { registerPrivateCommand } from '../config/private-commands.config.js'
import {
  handleArticuloCommand,
  handleDolarCommand,
  handleStockCommand,
  handlePrecioCommand,
} from './private-commands.handlers.js'

/**
 * Registrar todos los comandos privados
 * Esto se ejecuta al importar este archivo
 */
export function initializePrivateCommands() {
  // Comando: /articulo
  registerPrivateCommand(
    'articulo',
    'Buscar artículos en la base de datos (solo para propietario)',
    handleArticuloCommand
  )

  // Comando: /dolar (ahora solo para propietario)
  registerPrivateCommand(
    'dolar',
    'Obtener cotización del dólar (solo para propietario)',
    handleDolarCommand
  )

  // Comando: /stock (opcional, para expansión futura)
  registerPrivateCommand(
    'stock',
    'Consultar stock de productos (solo para propietario)',
    handleStockCommand
  )

  // Comando: /precio (opcional, para expansión futura)
  registerPrivateCommand(
    'precio',
    'Consultar precios de productos (solo para propietario)',
    handlePrecioCommand
  )

  console.log('✅ Comandos privados inicializados correctamente')
}
```

**Sin cambios necesarios** ✅

---

### 5️⃣ `src/flows/private-commands.flow.js`

**Acción:** Crear archivo NUEVO
**Ubicación:** `src/flows/private-commands.flow.js`
**Contenido:** Copia TODO esto:

```javascript
/**
 * Flow de Comandos Privados
 * 
 * Intercepta mensajes que comienzan con / y verifica si son
 * comandos privados ejecutables solo por propietarios
 */

import { addKeyword, EVENTS } from '@builderbot/bot'
import {
  parsePrivateCommand,
  handlePrivateCommand,
  shouldIgnoreMessageForFlows,
} from '../services/private-commands.service.js'

/**
 * Extraer número de teléfono del contexto
 * Intenta múltiples formas de acceder (compatibilidad BuilderBot + Baileys)
 */
function extractPhoneNumber(ctx) {
  // Intentar en orden de probabilidad
  const phoneNumber =
    ctx.from || // BuilderBot + Baileys
    ctx.number || // Alternativa
    ctx.sender || // Otra alternativa
    ctx.remoteJid || // Baileys puro
    ctx.key?.remoteJid || // Si viene anidado
    ''

  return phoneNumber
}

/**
 * Flow que intercepta y procesa comandos privados
 * Se ejecuta antes de los otros flows (orden importa en app.js)
 */
export const privateCommandsFlow = addKeyword(EVENTS.MESSAGE)
  .addAction(async (ctx, { flowDynamic, endFlow }) => {
    // Obtener información del mensaje
    const messageText = ctx.body || ''
    const phoneNumber = extractPhoneNumber(ctx)

    // Log para debugging
    if (messageText.startsWith('/')) {
      console.log(
        `🔍 Comando detectado: "${messageText.substring(0, 30)}" desde: ${phoneNumber}`
      )
    }

    // Verificar si comienza con /
    if (!messageText.startsWith('/')) {
      return endFlow() // No es un comando, continuar con otros flows
    }

    // Verificar si es un comando privado
    const { isPrivateCommand, command } = parsePrivateCommand(messageText)

    if (!isPrivateCommand) {
      // Es un comando que no existe en privados, continuar con flows normales
      // (permitir que otros flows lo manejen, ej: /buscar, /salir)
      return endFlow()
    }

    // Es un comando privado, intentar ejecutarlo
    const result = await handlePrivateCommand(messageText, phoneNumber, { ctx })

    if (result === null) {
      // Número no autorizado o no es realmente un comando privado
      // Ignorar silenciosamente (no procesar en flows normales)
      console.log(`❌ Acceso denegado - Comando privado desde número no autorizado`)
      return endFlow() // Terminar sin enviar nada
    }

    // Comando ejecutado exitosamente o con error
    if (result.message) {
      await flowDynamic(result.message)
    }

    // Terminar este flow (no continuar con otros)
    return endFlow()
  })
```

**Sin cambios necesarios** ✅

---

## ✏️ Archivos a Modificar

### `src/app.js`

**Acción:** Modificar archivo EXISTENTE

**PASO 1:** En la sección de imports (al principio), DESPUÉS de:
```javascript
import { getDolarListMessage } from './services/dolar.service.js'
```

**AGREGAR estas dos líneas:**
```javascript
import { privateCommandsFlow } from './flows/private-commands.flow.js'
import { initializePrivateCommands } from './services/private-commands.init.js'
```

---

**PASO 2:** Localiza el `dolarFlow` (línea ~69) y REEMPLAZALO:

**BUSCA ESTO:**
```javascript
// ----------------------
// FLOW SAMPLES
// ----------------------
const dolarFlow = addKeyword([
    'dolar',
    '/dólar',
    '/bna',
    '/blue'
])
```

**REEMPLAZA CON ESTO:**
```javascript
// ----------------------
// FLOW SAMPLES - DOLAR (público, solo sin barra)
// ----------------------
const dolarFlow = addKeyword([
    'dolar',
    '/bna',
    '/blue'
])
```

---

**PASO 3:** En la función `main()` (línea ~94), DESPUÉS de `await poolPromise` y ANTES de `const adapterFlow`:

**BUSCA ESTO:**
```javascript
const main = async () => {
  await poolPromise

  const adapterFlow = createFlow([
```

**REEMPLAZA CON ESTO:**
```javascript
const main = async () => {
  await poolPromise

  // Inicializar comandos privados
  initializePrivateCommands()

  const adapterFlow = createFlow([
```

---

**PASO 4:** En `createFlow([...])`, REEMPLAZA la lista de flows:

**BUSCA ESTO:**
```javascript
  const adapterFlow = createFlow([
    searchExitFlow,
    searchActivateFlow,
    helpFlow,
    discordFlow,
    registerFlow,
    fullSamplesFlow,
    dolarFlow,
    searchWelcomeFlow,
  ])
```

**REEMPLAZA CON ESTO:**
```javascript
  const adapterFlow = createFlow([
    // ⚠️ IMPORTANTE: privateCommandsFlow debe ir PRIMERO para interceptar comandos privados
    privateCommandsFlow,
    searchExitFlow,
    searchActivateFlow,
    helpFlow,
    discordFlow,
    registerFlow,
    fullSamplesFlow,
    dolarFlow,
    searchWelcomeFlow,
  ])
```

---

## 🎯 Configuración Final

**En `src/config/private-commands.config.js`:**

Cambia ESTE número:
```javascript
export const AUTHORIZED_NUMBERS = [
  '5493364015970', // ← AQUÍ VA TU NÚMERO
]
```

Por TU número en formato: `'5493364015970'` (sin +, sin espacios)

---

## 🚀 Prueba

1. Inicia bot:
   ```bash
   npm run dev
   ```

2. Verifica que aparezca:
   ```
   ✅ Comandos privados inicializados correctamente
   ```

3. Desde tu número en WhatsApp, envía:
   ```
   /articulo cable 2.5
   ```

4. El bot debe responder con productos encontrados ✅

---

**¡LISTO! Ya está todo configurado 🎉**
