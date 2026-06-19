# 🚀 Sistema de Comandos Privados - EMPEZA AQUÍ

**¿Nuevo en esto?** Lee esto primero (2 min de lectura).

---

## 🎯 ¿Qué Hicimos?

Agregamos **comandos secretos** que solo TÚ puedes ejecutar en tu número de WhatsApp.

**Ejemplo:**
```
Tú escribes:        /articulo termica bipolar 25a
Bot responde:       ✅ Productos encontrados...

Otro cliente escribe: /articulo termica bipolar 25a
Bot responde:         🔇 (Silencio - no lo autoriza)
```

---

## ⚡ 3 Pasos para Empezar

### 1️⃣ EDITA tu número

Abre: `src/config/private-commands.config.js`

Cambia esto:
```javascript
export const AUTHORIZED_NUMBERS = [
  '5493364015970', // ← CAMBIA ESTE NÚMERO
]
```

Por tu número en formato: `'5493364015970'` (sin +, sin espacios, solo dígitos)

### 2️⃣ INICIA el bot

```bash
npm run dev
```

Busca en la consola:
```
✅ Comandos privados inicializados correctamente
```

### 3️⃣ PRUEBA

Desde tu número en WhatsApp, escribe:
```
/articulo cable
```

El bot debe responder con productos.

---

## ✅ ¡Listo!

Ya tienes estos comandos disponibles:

- `/articulo termica 25a` - Buscar productos
- `/dolar` - Ver cotización del dólar
- `/stock cable` - Consultar stock
- `/precio disyuntor` - Ver precios

**Solo tú puedes usarlos.** Los clientes no verán nada.

---

## 📚 ¿Necesitas Más?

| Quiero... | Leer... |
|-----------|---------|
| Copiar y pegar el código | [COPY_PASTE_GUIDE.md](./COPY_PASTE_GUIDE.md) |
| Entender cómo funciona | [PRIVATE_COMMANDS_GUIDE.md](./PRIVATE_COMMANDS_GUIDE.md) |
| Agregar un nuevo comando | [PRIVATE_COMMANDS_EXAMPLES.md](./PRIVATE_COMMANDS_EXAMPLES.md) |
| Solucionar un problema | [PRIVATE_COMMANDS_TROUBLESHOOTING.md](./PRIVATE_COMMANDS_TROUBLESHOOTING.md) |
| Referencia rápida | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |
| Verificar instalación | [INSTALLATION_CHECKLIST.md](./INSTALLATION_CHECKLIST.md) |
| Ver resumen visual | [SUMMARY.md](./SUMMARY.md) |
| Índice completo | [PRIVATE_COMMANDS_INDEX.md](./PRIVATE_COMMANDS_INDEX.md) |

---

## 🆘 ¿No funciona?

**Checklist rápido:**

- ✅ ¿Editaste tu número en `src/config/private-commands.config.js`?
- ✅ ¿El número está en formato correcto? (`5493364015970` sin +)
- ✅ ¿Escribiste el comando CON barra? (`/articulo` no `articulo`)
- ✅ ¿El bot dice `✅ Comandos privados inicializados`?

Si NO, lee: [PRIVATE_COMMANDS_TROUBLESHOOTING.md](./PRIVATE_COMMANDS_TROUBLESHOOTING.md)

---

## 📁 Archivos Agregados

Se crearon **5 archivos nuevos** + se modificó **1 archivo existente**:

```
✨ src/config/private-commands.config.js
✨ src/services/private-commands.service.js
✨ src/services/private-commands.handlers.js
✨ src/services/private-commands.init.js
✨ src/flows/private-commands.flow.js
✏️ src/app.js (modificado)
```

Todo está automatizado y listo para usar.

---

## 💡 Ejemplos de Uso

### Búsqueda rápida desde propietario:

```
Tú: /articulo termica bipolar
Bot: 📌 Encontré 8 productos. Mostrando los primeros:
     1. Termica Bipolar 16A
        Código: 12345
        Precio: $450
        Stock: 5
     ...
```

### Cotización del dólar (solo para ti):

```
Tú: /dolar
Bot: 📈 Cotizaciones del dólar
     🏦 BNA
     Compra: $850
     Venta: $860
     💙 Blue
     Compra: $900
     Venta: $910
```

### Clientes siguen usando normalmente:

```
Cliente: /buscar
Bot: ✅ Modo búsqueda activado
     Escribí lo que necesitás...

Cliente: termica 25a
Bot: 🔍 Analizando...
     Productos encontrados...
```

---

## 🔐 ¿Es Seguro?

✅ **Sí, completamente**

- Solo tu número puede ejecutar comandos privados
- Los clientes NO ven ni pueden usar estos comandos
- No afecta los flujos normales del bot
- Logging de intentos no autorizados

---

## 🚀 Próximo Nivel

Una vez que funcione, puedes:

1. **Agregar más números autorizados**
   - Para que gerentes o admins también usen

2. **Crear nuevos comandos**
   - `/inventario`, `/reporte`, `/estadisticas`, etc.

3. **Integrar APIs externas**
   - APIs de clima, noticias, etc.

Ver: [PRIVATE_COMMANDS_EXAMPLES.md](./PRIVATE_COMMANDS_EXAMPLES.md)

---

## 📞 Referencia Rápida

```javascript
// Para agregar otro número:
export const AUTHORIZED_NUMBERS = [
  '5493364015970',  // Existente
  '5491234567890',  // Nuevo
]

// Para crear un nuevo comando:
// 1. Crear handler en private-commands.handlers.js
// 2. Registrar en private-commands.init.js
// 3. Usar: /nuevo-comando argumentos
```

---

## ✨ Resumen

| Antes | Después |
|-------|---------|
| Todos pueden usar `/dolar` | Solo tú puedes usar `/dolar` |
| No hay búsqueda privada | Tienes `/articulo` para búsqueda rápida |
| Sistema manual de comandos | Sistema automático y seguro |
| Difícil de mantener | Fácil de extender |

---

## 🎯 Próximos Pasos

**AHORA:**
1. Edita tu número en `src/config/private-commands.config.js`
2. Ejecuta `npm run dev`
3. Prueba `/articulo cable`

**CUANDO FUNCIONE:**
- Lee documentación según necesites
- Agrega más números si quieres
- Crea nuevos comandos personalizados

**SI HAY PROBLEMA:**
- Consulta [TROUBLESHOOTING](./PRIVATE_COMMANDS_TROUBLESHOOTING.md)
- O sigue [INSTALLATION_CHECKLIST.md](./INSTALLATION_CHECKLIST.md)

---

## 📖 Documentación Completa

Todo está documentado en esta carpeta. Elegí según tu necesidad:

- 🚀 **EMPEZA AQUÍ** (este archivo) - Intro rápida
- ⚡ [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Referencia de 30 segundos
- 📋 [COPY_PASTE_GUIDE.md](./COPY_PASTE_GUIDE.md) - Copiar y pegar exacto
- 📚 [PRIVATE_COMMANDS_GUIDE.md](./PRIVATE_COMMANDS_GUIDE.md) - Guía completa
- 💡 [PRIVATE_COMMANDS_EXAMPLES.md](./PRIVATE_COMMANDS_EXAMPLES.md) - Ejemplos
- 🐛 [PRIVATE_COMMANDS_TROUBLESHOOTING.md](./PRIVATE_COMMANDS_TROUBLESHOOTING.md) - Problemas
- ✅ [INSTALLATION_CHECKLIST.md](./INSTALLATION_CHECKLIST.md) - Verificación
- 📊 [SUMMARY.md](./SUMMARY.md) - Resumen visual
- 📋 [PRIVATE_COMMANDS_INDEX.md](./PRIVATE_COMMANDS_INDEX.md) - Índice

---

**¿Listo? → Edita tu número y ejecuta `npm run dev` 🚀**

**¿Preguntas? → Consulta la documentación o troubleshooting**

**¿Funciona? → ¡Disfruta tus comandos privados! 🎉**
