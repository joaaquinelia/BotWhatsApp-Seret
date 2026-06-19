# 📋 Sistema de Comandos Privados - Guía Completa

## ¿Qué es esto?

Un sistema que permite que **solo tu número de WhatsApp** ejecute comandos especiales dentro de conversaciones normales con el bot, sin interferir con los flujos existentes de clientes.

## 📁 Archivos Creados/Modificados

### Archivos Nuevos:

1. **`src/config/private-commands.config.js`**
   - Configuración de números autorizados
   - Registro de comandos privados

2. **`src/services/private-commands.service.js`**
   - Lógica de detección y validación de comandos
   - Funciones auxiliares

3. **`src/services/private-commands.handlers.js`**
   - Implementación de cada handler de comando

4. **`src/services/private-commands.init.js`**
   - Inicialización de todos los comandos

5. **`src/flows/private-commands.flow.js`**
   - Flow de BuilderBot que intercepta comandos

### Archivos Modificados:

1. **`src/app.js`**
   - Importa sistema de comandos privados
   - Agrega `privateCommandsFlow` al inicio

---

## 🔧 Configuración Inicial

### Paso 1: Agregar tu número

Edita `src/config/private-commands.config.js`:

```javascript
export const AUTHORIZED_NUMBERS = [
  '5493364015970', // Tu número (SIN +, SIN espacios)
  // '5491234567890', // Agregar más números aquí
]
```

**Formato esperado:** Solo dígitos, sin `+`, sin espacios, sin guiones
- ✅ Correcto: `5493364015970`
- ❌ Incorrecto: `+54 9 3364 01-5970`

---

## 🎯 Comandos Privados Disponibles

### 1. `/articulo <término de búsqueda>`

**Función:** Buscar artículos directamente desde tu número

**Ejemplo:**
```
/articulo termica bipolar 25a
```

**Respuesta:** Lista de productos encontrados (formato igual al buscador normal)

---

### 2. `/dolar`

**Función:** Ver cotización del dólar (solo tú puedes usar con barra `/`)

**Ejemplo:**
```
/dolar
```

**Respuesta:** Cotizaciones BNA y Blue actualizadas

**Nota:** Los clientes aún pueden escribir `dolar` (sin barra) para ver la cotización

---

### 3. `/stock <término de búsqueda>`

**Función:** Consultar stock de productos

**Ejemplo:**
```
/stock termica bipolar 25a
```

**Respuesta:** Información de stock disponible

---

### 4. `/precio <término de búsqueda>`

**Función:** Consultar precios de productos

**Ejemplo:**
```
/precio termica bipolar 25a
```

**Respuesta:** Precios de productos encontrados

---

## 📝 Agregar un Nuevo Comando Privado

### Ejemplo: Crear comando `/info`

**Paso 1:** Agregar handler en `src/services/private-commands.handlers.js`

```javascript
export async function handleInfoCommand(args, context) {
  return {
    success: true,
    message: `
📱 Información del Bot
━━━━━━━━━━━━━━━━━━
Versión: 1.0.0
Propietario: Tu Nombre
Soporte: +54 9 3364 01-5970
    `,
  }
}
```

**Paso 2:** Registrar en `src/services/private-commands.init.js`

```javascript
import { handleInfoCommand } from './private-commands.handlers.js'

export function initializePrivateCommands() {
  // ... comandos existentes ...

  // Nuevo comando
  registerPrivateCommand(
    'info',
    'Mostrar información del bot',
    handleInfoCommand
  )
}
```

**Paso 3:** Usar el comando

```
/info
```

---

## 🔐 Seguridad y Comportamiento

### ✅ Lo que funciona:

- Solo números en `AUTHORIZED_NUMBERS` pueden ejecutar comandos con `/`
- Comandos privados se interceptan **ANTES** de los flows normales
- Los clientes no verán ni sabrán que existe este sistema
- Los clientes pueden seguir usando `/buscar`, `/salir`, etc. normalmente

### ❌ Lo que NO funciona:

- Clientes no pueden ejecutar comandos privados (los ignora silenciosamente)
- Si alguien escribe `/comando_inexistente`, se ignora
- No hay loops: el bot no procesa sus propias respuestas

### 📊 Validación de números:

```javascript
// Entrada
+54 9 3364 01-5970
+5493364015970
5493364015970
5493364015970

// Se normaliza a
5493364015970

// Coincide con
AUTHORIZED_NUMBERS = ['5493364015970']
```

---

## 🧪 Testing/Debugging

### Ver logs de comandos privados:

1. Ejecutar bot: `npm run dev`
2. Ver consola para mensajes como:
   - `✅ Comandos privados inicializados correctamente`
   - `❌ Intento de ejecutar comando privado desde número no autorizado: ...`
   - Errores de ejecución de comandos

### Agregar tu número manualmente:

Si tienes dudas, ejecuta esto en Node:

```javascript
const phoneNumber = '+54 9 3364 01-5970'
const normalized = phoneNumber.replace(/[^\d]/g, '')
console.log(normalized) // Verá: 5493364015970
```

---

## 🚀 Ejemplos Prácticos

### Flujo: Clientes consultan producto

```
Cliente: termica 25a
Bot: [Búsqueda con flujo normal]

Cliente: /buscar
Bot: [Activa buscador]
```

### Flujo: Tú consultas desde privado

```
Tú: /articulo termica 25a
Bot: [Búsqueda rápida - resultado en 1 mensaje]

Tú: /dolar
Bot: [Cotización actualizada]

Tú: /precio cable 2.5
Bot: [Precios encontrados]
```

### Flujo: Intento no autorizado

```
Otro número: /articulo termica 25a
Bot: [Silencio - no procesa nada]
```

---

## 📚 Estructura de Archivos

```
src/
├── app.js (MODIFICADO)
├── config/
│   └── private-commands.config.js (NUEVO)
├── flows/
│   └── private-commands.flow.js (NUEVO)
├── services/
│   ├── private-commands.service.js (NUEVO)
│   ├── private-commands.handlers.js (NUEVO)
│   └── private-commands.init.js (NUEVO)
└── ... (archivos existentes sin cambios)
```

---

## ⚡ Solución de Problemas

### Problema: Comando no funciona

**Solución:**
1. Verifica que tu número esté en `AUTHORIZED_NUMBERS`
2. Verifica el formato: `5493364015970` (solo dígitos)
3. Verifica que escribes `/comando` (con barra al inicio)
4. Mira los logs en la consola del bot

### Problema: Los clientes ven los comandos

**Esto NO debe pasar.** Si pasa, verifica que `privateCommandsFlow` esté primero en la lista de flows.

### Problema: El bot enviando dos respuestas

**Solución:** Asegúrate que en `private-commands.flow.js` usas `endFlow()` después de procesar un comando.

---

## 💡 Tips Avanzados

### Múltiples números autorizados (expandible a 5+)

```javascript
export const AUTHORIZED_NUMBERS = [
  '5493364015970', // Propietario
  '5491234567890', // Gerente
  '5499876543210', // Administrador
  '5491111111111', // Soporte
  '5492222222222', // Otro autorizado
]
```

### Crear comandos con parámetros opcionales

```javascript
export async function handleBuscarCommand(args, context) {
  if (!args) {
    return {
      success: true,
      message: 'Uso: /buscar [término]\nSi no especificas, se muestra último...',
    }
  }
  // ... lógica normal
}
```

### Acceder a contexto del mensaje

```javascript
export async function handleMiComando(args, context) {
  console.log(context.ctx) // Acceso al contexto completo
  console.log(context.ctx.from) // Número que envía
  console.log(context.ctx.body) // Mensaje completo
}
```

---

## 📞 Referencia Rápida

| Archivo | Cambiar | Propósito |
|---------|---------|----------|
| `config/private-commands.config.js` | `AUTHORIZED_NUMBERS` | Números autorizados |
| `services/private-commands.handlers.js` | Agregar handler | Nuevo comando |
| `services/private-commands.init.js` | `registerPrivateCommand()` | Registrar comando |
| `app.js` | NO TOCAR | Ya está configurado |

---

## ✨ ¿Qué Sigue?

Puedes:
1. Agregar más comandos siguiendo el patrón de ejemplos
2. Agregar más números autorizados
3. Personalizar respuestas de cada comando
4. Integrar comandos con APIs externas

¡Listo para usar! 🚀
