# ✅ Checklist de Instalación - Comandos Privados

Usa este checklist para verificar que todo está correctamente instalado.

---

## 📋 Fase 1: Verificar Archivos Creados

Navega a tu carpeta `base-js-baileys-memory` y verifica que existan estos archivos:

### Archivos de Configuración

- [ ] `src/config/private-commands.config.js` existe
  ```bash
  # Test (Windows)
  dir src\config\private-commands.config.js
  ```

### Archivos de Servicios

- [ ] `src/services/private-commands.service.js` existe
- [ ] `src/services/private-commands.handlers.js` existe
- [ ] `src/services/private-commands.init.js` existe
  ```bash
  # Test (Windows)
  dir src\services\private-commands*
  ```

### Archivos de Flows

- [ ] `src/flows/private-commands.flow.js` existe
  ```bash
  # Test (Windows)
  dir src\flows\private-commands.flow.js
  ```

### Documentación

- [ ] `PRIVATE_COMMANDS_GUIDE.md` en raíz
- [ ] `PRIVATE_COMMANDS_EXAMPLES.md` en raíz
- [ ] `PRIVATE_COMMANDS_TROUBLESHOOTING.md` en raíz
- [ ] `PRIVATE_COMMANDS_INDEX.md` en raíz
- [ ] `QUICK_REFERENCE.md` en raíz

---

## 📝 Fase 2: Verificar Contenido de Archivos

### ✏️ `src/app.js`

Verifica que tenga:

- [ ] Import de private-commands:
  ```javascript
  import { privateCommandsFlow } from './flows/private-commands.flow.js'
  import { initializePrivateCommands } from './services/private-commands.init.js'
  ```

- [ ] En función `main()`, antes de `createFlow`:
  ```javascript
  initializePrivateCommands()
  ```

- [ ] En `createFlow([...])`, `privateCommandsFlow` es el PRIMERO:
  ```javascript
  const adapterFlow = createFlow([
    privateCommandsFlow, // ← Debe ser PRIMERO
    searchExitFlow,
    // ... resto
  ])
  ```

- [ ] `dolarFlow` no tiene `'/dolar'` ni `'/dólar'`:
  ```javascript
  // ✅ Debe ser así:
  const dolarFlow = addKeyword([
    'dolar',   // Solo sin barra
    '/bna',
    '/blue'
  ])
  ```

### 🔧 `src/config/private-commands.config.js`

- [ ] Archivo existe
- [ ] Tiene al menos un número en `AUTHORIZED_NUMBERS`
- [ ] El número está en formato correcto: `'5493364015970'` (solo dígitos)

**Verifica:**
```javascript
export const AUTHORIZED_NUMBERS = [
  '5493364015970', // ← Debe estar aquí
]
```

### 🔧 `src/services/private-commands.handlers.js`

- [ ] Tiene al menos 4 handlers (articulo, dolar, stock, precio)
- [ ] Cada handler retorna `{ success: bool, message: string }`

**Verifica exportados:**
- [ ] `handleArticuloCommand`
- [ ] `handleDolarCommand`
- [ ] `handleStockCommand`
- [ ] `handlePrecioCommand`

### 🔧 `src/services/private-commands.init.js`

- [ ] Importa todos los handlers
- [ ] Función `initializePrivateCommands()` existe
- [ ] Registra al menos 4 comandos (articulo, dolar, stock, precio)

**Verifica:**
```javascript
export function initializePrivateCommands() {
  registerPrivateCommand('articulo', '...', handleArticuloCommand)
  registerPrivateCommand('dolar', '...', handleDolarCommand)
  registerPrivateCommand('stock', '...', handleStockCommand)
  registerPrivateCommand('precio', '...', handlePrecioCommand)
}
```

### 🔧 `src/flows/private-commands.flow.js`

- [ ] Exporta `privateCommandsFlow`
- [ ] Usa `EVENTS.MESSAGE`
- [ ] Llama a `handlePrivateCommand()`
- [ ] Llama a `endFlow()` apropiadamente

---

## 🚀 Fase 3: Verificación en Tiempo de Ejecución

### 1. Inicia el Bot

```bash
npm run dev
```

### 2. Verifica Logs Iniciales

Busca en la salida (primeros 5 segundos):

- [ ] `✅ Comandos privados inicializados correctamente`

Si NO ves esto:
- ❌ Hay error en imports o inicialización
- 👉 Busca mensajes de ERROR en rojo
- 👉 Ve a [TROUBLESHOOTING](./PRIVATE_COMMANDS_TROUBLESHOOTING.md)

### 3. Prueba Comando desde tu Número

Envía desde **tu número** en WhatsApp:
```
/articulo cable 2.5
```

Esperado:
- [ ] ✅ Bot responde con productos encontrados
- [ ] En consola ves logs del comando

Si NO responde:
- ❌ Verificar número en `AUTHORIZED_NUMBERS`
- ❌ Verificar formato del número
- 👉 Ve a [TROUBLESHOOTING](./PRIVATE_COMMANDS_TROUBLESHOOTING.md)

### 4. Prueba desde Otro Número

Envía desde **otro número** en WhatsApp:
```
/articulo cable 2.5
```

Esperado:
- [ ] 🔇 Bot NO responde (silencio)
- [ ] En consola ves: `❌ Intento de ejecutar comando...`

Si bot responde:
- ❌ Hay problema de validación
- 👉 Ve a [TROUBLESHOOTING](./PRIVATE_COMMANDS_TROUBLESHOOTING.md)

### 5. Prueba Comando Público

Desde **cualquier número**:
```
/buscar
```

Esperado:
- [ ] ✅ Bot activa búsqueda normal (flujo existente)

Si no responde:
- ❌ Hay problema en orden de flows
- 👉 Verifica que `privateCommandsFlow` sea PRIMERO

---

## 🔍 Fase 4: Validación de Número

### Método Manual

1. Abre `src/config/private-commands.config.js`
2. Verifica el número:
   ```javascript
   export const AUTHORIZED_NUMBERS = [
     '5493364015970', // Este es tu número?
   ]
   ```

3. Si es incorrecto, actualízalo

### Método Automático

1. Inicia bot: `npm run dev`
2. Envía comando: `/articulo test`
3. En consola busca línea con: `🔍 Comando detectado:`
4. Copia el número que aparece `desde:`
5. Verifica que coincida con `AUTHORIZED_NUMBERS`

Si no coincide:
- Actualiza `AUTHORIZED_NUMBERS` con el número correcto
- Reinicia bot

---

## 💾 Fase 5: Confirmación Final

Marca todas estas casillas:

- [ ] Todos los 5 archivos nuevos existen
- [ ] `app.js` está correctamente modificado
- [ ] `AUTHORIZED_NUMBERS` tiene tu número correcto
- [ ] Bot muestra `✅ Comandos privados inicializados`
- [ ] Tu número ejecuta `/articulo test` → Respuesta ✅
- [ ] Otro número ejecuta `/articulo test` → Silencio 🔇
- [ ] `/buscar` funciona normalmente
- [ ] No hay errores rojos en consola

---

## 🎓 Si Algo Falla

### Paso 1: Localizar el Problema

- [ ] ¿Error durante `npm run dev`? → Problema en código
  - 👉 Ve a [TROUBLESHOOTING](./PRIVATE_COMMANDS_TROUBLESHOOTING.md) "Problema 3"

- [ ] ¿Bot no responde a comandos? → Problema de configuración
  - 👉 Ve a [TROUBLESHOOTING](./PRIVATE_COMMANDS_TROUBLESHOOTING.md) "Problema 1"

- [ ] ¿Otros números pueden ejecutar? → Problema de validación
  - 👉 Ve a [TROUBLESHOOTING](./PRIVATE_COMMANDS_TROUBLESHOOTING.md) "Problema 2"

### Paso 2: Revertir a Estado Conocido

Si nada funciona:

1. Borra los cambios locales en `app.js`
2. Copia nuevamente desde [app.js mostrado en documentación]
3. Reinicia bot

### Paso 3: Buscar Error Específico

Si hay error específico:
1. Copia el FULL error stack trace
2. Busca en [TROUBLESHOOTING](./PRIVATE_COMMANDS_TROUBLESHOOTING.md)
3. Sigue los pasos recomendados

---

## 📚 Documentos de Referencia

Luego de completar este checklist, consulta:

- 🎯 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Para uso rápido
- 📖 [PRIVATE_COMMANDS_GUIDE.md](./PRIVATE_COMMANDS_GUIDE.md) - Entender cómo funciona
- 💡 [PRIVATE_COMMANDS_EXAMPLES.md](./PRIVATE_COMMANDS_EXAMPLES.md) - Crear nuevos comandos
- 🐛 [PRIVATE_COMMANDS_TROUBLESHOOTING.md](./PRIVATE_COMMANDS_TROUBLESHOOTING.md) - Resolver problemas
- 📋 [PRIVATE_COMMANDS_INDEX.md](./PRIVATE_COMMANDS_INDEX.md) - Índice completo

---

## ✨ ¡Listo!

Si completaste TODO este checklist correctamente:

✅ El sistema está **100% funcional**

Puedes:
1. Usar los comandos privados
2. Agregar más números autorizados
3. Crear nuevos comandos
4. Confiar que los clientes no pueden acceder

**¡Disfruta del sistema! 🚀**

---

**Última verificación:** [Escribe fecha actual]
**Estado:** ☐ Incompleto | ☐ Completado | ☐ Funcionando ✨
