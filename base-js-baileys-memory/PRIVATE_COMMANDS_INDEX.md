# 🤖 Sistema de Comandos Privados - Índice Completo

## 📋 Descripción General

Sistema que permite ejecutar **comandos especiales privados** (`/articulo`, `/dolar`, `/stock`, `/precio`) que solo el propietario del bot puede usar. Los clientes no verán ni podrán ejecutar estos comandos.

**Características:**
- ✅ Solo números autorizados pueden ejecutar comandos con `/`
- ✅ No interfiere con flujos existentes de clientes
- ✅ Fácil de extender con nuevos comandos
- ✅ Soporta múltiples números autorizados (hasta 5+)
- ✅ Sistema seguro y modular

---

## 🚀 Inicio Rápido

### 1. Verifica que tengas estos archivos

```
src/
├── app.js ✏️ (MODIFICADO)
├── config/
│   └── private-commands.config.js ✨ (NUEVO)
├── flows/
│   └── private-commands.flow.js ✨ (NUEVO)
└── services/
    ├── private-commands.service.js ✨ (NUEVO)
    ├── private-commands.handlers.js ✨ (NUEVO)
    └── private-commands.init.js ✨ (NUEVO)
```

### 2. Edita tu número en `src/config/private-commands.config.js`

```javascript
export const AUTHORIZED_NUMBERS = [
  '5493364015970', // Reemplaza con tu número (sin +, sin espacios)
]
```

### 3. Inicia el bot

```bash
npm run dev
```

### 4. ¡Prueba un comando!

```
/articulo termica bipolar 25a
```

---

## 📚 Documentación Completa

### Para entender cómo funciona:
👉 [**PRIVATE_COMMANDS_GUIDE.md**](./PRIVATE_COMMANDS_GUIDE.md)

- Qué es el sistema
- Cómo funciona
- Comandos disponibles
- Cómo agregar números autorizados

### Para ver ejemplos y crear nuevos comandos:
👉 [**PRIVATE_COMMANDS_EXAMPLES.md**](./PRIVATE_COMMANDS_EXAMPLES.md)

- Ejemplos de nuevos comandos
- Comandos con parámetros
- Integración con APIs
- Validación de permisos

### Si algo no funciona:
👉 [**PRIVATE_COMMANDS_TROUBLESHOOTING.md**](./PRIVATE_COMMANDS_TROUBLESHOOTING.md)

- Checklist de verificación
- Problemas comunes y soluciones
- Debugging avanzado
- Errores típicos

---

## 📁 Archivos Creados (Explicación)

### `src/config/private-commands.config.js`
**Para qué:** Configuración central del sistema
- Lista de números autorizados
- Registro de comandos disponibles
- Funciones de validación

**Modificar cuando:** Agregar números autorizados o cambiar configuración

---

### `src/services/private-commands.service.js`
**Para qué:** Lógica principal de comandos privados
- Detecta si es un comando privado
- Valida números autorizados
- Ejecuta los handlers

**Modificar:** Raramente (solo si necesitas lógica avanzada)

---

### `src/services/private-commands.handlers.js`
**Para qué:** Implementación de cada comando
- `/articulo` - Busca productos
- `/dolar` - Cotización del dólar
- `/stock` - Consulta de stock
- `/precio` - Consulta de precios

**Modificar cuando:** Necesites cambiar comportamiento de un comando o agregar nuevo

---

### `src/services/private-commands.init.js`
**Para qué:** Registra todos los comandos privados
- Se ejecuta al iniciar el bot
- Conecta handlers con configuración

**Modificar cuando:** Agregues un nuevo comando (registrarlo aquí)

---

### `src/flows/private-commands.flow.js`
**Para qué:** Flow de BuilderBot que intercepta comandos
- Detecta mensajes que comienzan con `/`
- Ejecuta comandos privados si son autorizados
- Deja que otros flows procesen si no es comando privado

**Modificar:** Raramente (solo debugging o cambios avanzados)

---

### `src/app.js`
**Cambios:**
1. Importa sistema de comandos privados
2. Inicializa comandos en `main()`
3. Agrega `privateCommandsFlow` al inicio de flows
4. Modifica `dolarFlow` para remover `/dolar` (ahora es privado)

**Importante:** El orden de flows importa: `privateCommandsFlow` debe ser PRIMERO

---

## 🎯 Comandos Privados Disponibles

| Comando | Uso | Ejemplo |
|---------|-----|---------|
| `/articulo` | Buscar artículos | `/articulo termica bipolar 25a` |
| `/dolar` | Cotización del dólar | `/dolar` |
| `/stock` | Consultar stock | `/stock cable 2.5` |
| `/precio` | Consultar precios | `/precio disyuntor` |

---

## 🔐 Validación de Seguridad

### ✅ Lo que está protegido:
```
Tú (número autorizado):
  /articulo test → ✅ Funciona
  
Otro número:
  /articulo test → 🔇 Silencio (ignorado)
```

### ✅ Lo que sigue funcionando normal:
```
Clientes:
  /buscar → ✅ Funciona (búsqueda normal)
  /salir → ✅ Funciona
  "cable 2.5" → ✅ Búsqueda automática
```

---

## 🛠️ Tareas Comunes

### Agregar un nuevo número autorizado

1. Abre `src/config/private-commands.config.js`
2. Agrega a `AUTHORIZED_NUMBERS`:
```javascript
export const AUTHORIZED_NUMBERS = [
  '5493364015970', // Existente
  '5491234567890', // Nuevo
]
```
3. Reinicia: `npm run dev`

### Crear un nuevo comando

1. Agregar handler en `src/services/private-commands.handlers.js`
2. Registrar en `src/services/private-commands.init.js`
3. Usar: `/mi-comando argumentos`

Ver [PRIVATE_COMMANDS_EXAMPLES.md](./PRIVATE_COMMANDS_EXAMPLES.md) para ejemplos detallados.

### Verificar que funciona

1. Inicia bot: `npm run dev`
2. Busca: `✅ Comandos privados inicializados correctamente`
3. Prueba: `/articulo test`
4. Verifica que responda

---

## 🐛 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Comando no funciona | Verifica número en `AUTHORIZED_NUMBERS` |
| Formato del número | Debe ser solo dígitos: `5493364015970` (sin +) |
| Bot no responde | Verifica que `privateCommandsFlow` sea PRIMERO |
| Otro número ejecuta comando | Esto es un error: revisa `AUTHORIZED_NUMBERS` |

👉 Ver [PRIVATE_COMMANDS_TROUBLESHOOTING.md](./PRIVATE_COMMANDS_TROUBLESHOOTING.md) para debugging completo

---

## 📊 Estructura de Datos

### Contexto del comando (en handlers)

```javascript
export async function handleMiComando(args, context) {
  // args = texto después del comando
  // context.ctx = objeto completo del contexto
  
  args // "esto es el argumento"
  context.ctx.body // "/mi-comando esto es el argumento"
  context.ctx.from // "5493364015970" (número que envía)
}
```

### Respuesta esperada del handler

```javascript
return {
  success: true,  // ✅ Comando ejecutado OK
  message: '...'  // Mensaje a enviar
}

// O

return {
  success: false,
  message: '❌ Error: ...'
}
```

---

## 🚀 Próximos Pasos

### Sí quieres expandir el sistema:

1. **Agregar más números:** Ver "Tareas Comunes" arriba
2. **Crear nuevos comandos:** Ver [PRIVATE_COMMANDS_EXAMPLES.md](./PRIVATE_COMMANDS_EXAMPLES.md)
3. **Integrar con APIs:** Ver ejemplos en documento de Examples
4. **Validar permisos avanzados:** Ver "Ejemplo 7" en Examples

### Si algo no funciona:

1. Lee [PRIVATE_COMMANDS_TROUBLESHOOTING.md](./PRIVATE_COMMANDS_TROUBLESHOOTING.md)
2. Ejecuta checklist de verificación
3. Revisa logs en consola
4. Prueba debugging steps

---

## 📝 Resumen de Cambios

### Archivos Nuevos (5):
- ✨ `src/config/private-commands.config.js`
- ✨ `src/services/private-commands.service.js`
- ✨ `src/services/private-commands.handlers.js`
- ✨ `src/services/private-commands.init.js`
- ✨ `src/flows/private-commands.flow.js`

### Archivos Modificados (1):
- ✏️ `src/app.js` (imports, inicialización, orden de flows)

### Documentación (4):
- 📄 `PRIVATE_COMMANDS_GUIDE.md` (esta carpeta)
- 📄 `PRIVATE_COMMANDS_EXAMPLES.md` (esta carpeta)
- 📄 `PRIVATE_COMMANDS_TROUBLESHOOTING.md` (esta carpeta)
- 📄 `PRIVATE_COMMANDS_INDEX.md` (esta carpeta - eres aquí)

**Total:** 10 archivos nuevos/modificados

---

## ✨ ¿Listo para usar?

1. ✅ Verifica archivos existen
2. ✅ Configura tu número
3. ✅ Inicia bot
4. ✅ Prueba comando
5. ✅ ¡Disfruta!

---

**Última actualización:** 2024
**Versión:** 1.0
**Compatibilidad:** BuilderBot 1.4.2 + Baileys Provider 1.4.2
