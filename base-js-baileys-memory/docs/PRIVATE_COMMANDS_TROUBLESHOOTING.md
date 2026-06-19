# 🐛 Troubleshooting - Comandos Privados

## ¿Cómo verificar que está funcionando?

### 1️⃣ Verificar que los archivos estén en su lugar

```bash
# Desde la carpeta base-js-baileys-memory/
ls src/config/private-commands.config.js
ls src/services/private-commands.service.js
ls src/services/private-commands.handlers.js
ls src/services/private-commands.init.js
ls src/flows/private-commands.flow.js
```

**✅ Si ves todos los archivos:** Bien, continúa a paso 2

**❌ Si falta alguno:** Crea los archivos faltantes usando el contenido de esta guía

---

### 2️⃣ Verificar que app.js está modificado correctamente

Abre `src/app.js` y busca:

```javascript
// Debe estar al inicio (después de imports)
import { privateCommandsFlow } from './flows/private-commands.flow.js'
import { initializePrivateCommands } from './services/private-commands.init.js'

// Dentro de const main():
initializePrivateCommands()

// En createFlow([...]):
const adapterFlow = createFlow([
  privateCommandsFlow, // ⚠️ DEBE ser PRIMERO
  // ... otros flows ...
])
```

**✅ Si está todo:** Continúa a paso 3

**❌ Si falta algo:** Copia del archivo app.js mostrado arriba

---

### 3️⃣ Verificar tu número en la configuración

Abre `src/config/private-commands.config.js`:

```javascript
export const AUTHORIZED_NUMBERS = [
  '5493364015970', // ⚠️ ¿Es tu número? ¿Sin + y sin espacios?
]
```

**Para saber tu número exacto:**

1. Envía un comando privado: `/articulo test`
2. Mira la consola del bot
3. Busca una línea como: `🔍 Comando detectado: ... desde: 5493364015970`
4. Copia el número que aparece (la parte que dice `desde: ...`)
5. Verifica que coincida con tu entrada en `AUTHORIZED_NUMBERS`

---

### 4️⃣ Ejecutar el bot y verificar logs

```bash
npm run dev
```

**🔍 Busca estos logs iniciales:**

```
✅ Comandos privados inicializados correctamente
```

Si NO ves este mensaje:
- ❌ Hay un error en la importación o inicialización
- Busca mensajes de error rojo en la consola
- Verifica que todos los archivos existan

---

## 🆘 Problemas Comunes

### Problema 1: "No me funciona el comando"

**Checklist:**

```
□ ¿Escribiste con barra? /articulo termica 25a (NO articulo termica 25a)
□ ¿Tu número está en AUTHORIZED_NUMBERS?
□ ¿Sin espacios/guiones/+ en el número?
□ ¿Esperaste 2 segundos después de arrancar el bot?
□ ¿El comando existe? (/articulo, /dolar, /stock, /precio)
```

**Debugging:**

Abre consola y ejecuta:
```javascript
const phone = '+54 9 3364 01-5970'
const clean = phone.replace(/[^\d]/g, '')
console.log(clean) // Debe mostrar: 5493364015970
```

---

### Problema 2: "¿Cómo sé qué número me está enviando mensajes?"

**Solución:** Agrega esta línea en `private-commands.flow.js` temporalmente:

```javascript
export const privateCommandsFlow = addKeyword(EVENTS.MESSAGE)
  .addAction(async (ctx, { flowDynamic, endFlow }) => {
    const messageText = ctx.body || ''
    const phoneNumber = extractPhoneNumber(ctx)
    
    // AGREGAR ESTA LÍNEA:
    console.log(`📱 Mensaje de: ${phoneNumber} | Contenido: ${messageText}`)
    
    // ... resto del código ...
  })
```

Reinicia el bot, envía un comando, y verá en consola:
```
📱 Mensaje de: 5493364015970 | Contenido: /articulo test
```

---

### Problema 3: "El bot no responde a nada"

**Checklist:**

```
□ ¿Está el bot corriendo? (¿ves "✅ Comandos privados inicializados"?)
□ ¿Está privateCommandsFlow primero en createFlow([...])?
□ ¿No hay errores en consola (rojo)?
```

**Debugging:**

1. Agrega `console.log` al inicio de `privateCommandsFlow`:

```javascript
export const privateCommandsFlow = addKeyword(EVENTS.MESSAGE)
  .addAction(async (ctx, { flowDynamic, endFlow }) => {
    console.log('🔵 Flow de comandos privados ejecutado')
    const messageText = ctx.body || ''
    // ...
  })
```

2. Envía cualquier mensaje
3. Si NO ves "🔵 Flow de comandos privados ejecutado" en consola:
   - El flow no está siendo llamado
   - Verifica que esté primero en `createFlow([])`

---

### Problema 4: "¿Por qué mi número funciona pero otros no?"

**Es correcto.** El sistema está funcionando bien:

```
Tú (5493364015970):
  /articulo test → ✅ Respuesta

Otro número:
  /articulo test → 🔇 Sin respuesta (silencio)
```

Esto es lo esperado.

---

### Problema 5: "¿Cómo agrego otro número?"

**Solución:**

1. Determina el número exacto (paso del Problema 2)
2. Edita `src/config/private-commands.config.js`:

```javascript
export const AUTHORIZED_NUMBERS = [
  '5493364015970', // Propietario
  '5491234567890', // ← Agregar aquí
]
```

3. Reinicia el bot
4. Prueba desde el nuevo número

---

## 📊 Debugging Avanzado

### Ver todos los comandos registrados

Agreguemos a `src/services/private-commands.service.js`:

```javascript
export function debugCommands() {
  console.log('📋 Comandos Privados Registrados:')
  PRIVATE_COMMANDS_REGISTRY.forEach((cmd, idx) => {
    console.log(`  ${idx + 1}. /${cmd.comando} - ${cmd.descripcion}`)
  })
}
```

En `src/app.js`, en la función main():

```javascript
const main = async () => {
  await poolPromise
  initializePrivateCommands()
  
  // AGREGAR:
  const { debugCommands } = await import('./services/private-commands.service.js')
  debugCommands()
  
  // ...
}
```

Ejecutar: `npm run dev`

Verá algo como:
```
📋 Comandos Privados Registrados:
  1. /articulo - Buscar artículos...
  2. /dolar - Obtener cotización...
  3. /stock - Consultar stock...
  4. /precio - Consultar precios...
```

---

### Ver intentos de acceso no autorizado

Mira los logs mientras el bot está corriendo. Si alguien intenta un comando privado desde un número no autorizado, verá:

```
❌ Intento de ejecutar comando privado desde número no autorizado: 5491111111111
```

---

### Verificar que privateCommandsFlow está en primer lugar

En `src/app.js`, dentro de `createFlow([...])`:

```javascript
const adapterFlow = createFlow([
  privateCommandsFlow,  // ⚠️ DEBE ser PRIMERO (línea 1)
  searchExitFlow,
  searchActivateFlow,
  // ... otros flows
])
```

Si NO es el primero:
- Los comandos privados podrían no ser interceptados
- Otros flows podrían procesarlos primero

---

## ✅ Validación Final

Haz este test completo:

### Test 1: Comando privado válido

```
Desde tu número:
  Envía: /articulo cable
  
Esperado:
  ✅ Bot responde con productos encontrados
```

### Test 2: Número no autorizado

```
Desde otro número:
  Envía: /articulo cable
  
Esperado:
  🔇 Sin respuesta (silencio)
```

### Test 3: Comando que no existe

```
Desde tu número:
  Envía: /comando_inexistente test
  
Esperado:
  🔇 Sin respuesta (silencio - comando no registrado)
```

### Test 4: Comando público normal

```
Desde cualquier número:
  Envía: /buscar
  
Esperado:
  ✅ Bot activa modo búsqueda (flujo normal)
```

**Si todos los tests pasan: ✨ ¡Sistema funcionando correctamente!**

---

## 🎯 Errores Típicos en Código

### ❌ Error: No normaliza el número

```javascript
// MALO
const AUTHORIZED_NUMBERS = ['+54 9 3364 01-5970']
const phoneNumber = '+54 9 3364 01-5970'
if (AUTHORIZED_NUMBERS.includes(phoneNumber)) // Nunca matchea
```

### ✅ Correcto:

```javascript
// BIEN
const AUTHORIZED_NUMBERS = ['5493364015970']
const phoneNumber = '+54 9 3364 01-5970'
const normalized = phoneNumber.replace(/[^\d]/g, '') // '5493364015970'
if (AUTHORIZED_NUMBERS.includes(normalized)) // ✅ Matchea
```

---

### ❌ Error: privateCommandsFlow no es primero

```javascript
// MALO
const adapterFlow = createFlow([
  dolarFlow, // Esto puede procesar /dolar antes
  privateCommandsFlow, // Llega muy tarde
])
```

### ✅ Correcto:

```javascript
// BIEN
const adapterFlow = createFlow([
  privateCommandsFlow, // Primero
  dolarFlow,
])
```

---

## 📞 ¿Sigue sin funcionar?

1. Verifica **TODOS** los pasos de arriba
2. Busca mensajes rojos en consola (errores)
3. Copia el FULL error stack trace
4. Verifica que los archivos estén **exactamente** como en la guía
5. Intenta:
   ```bash
   # Limpiar módulos en caché
   rm -rf node_modules/.cache
   # Reiniciar bot
   npm run dev
   ```

---

## 🆒 Tips Pro

**Loguear información de debug sin afectar el bot:**

```javascript
// En handlers, cuando necesites info:
console.error('🔍 DEBUG:', {
  comando,
  args,
  phoneNumber,
  isAuthorized,
  timestamp: new Date().toISOString(),
})
```

Úsalo para troubleshooting sin cambiar la lógica del bot.

---

**¿Necesitas más ayuda? Revisa PRIVATE_COMMANDS_GUIDE.md y PRIVATE_COMMANDS_EXAMPLES.md**
