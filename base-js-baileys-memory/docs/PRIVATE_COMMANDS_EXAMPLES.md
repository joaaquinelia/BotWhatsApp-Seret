/**
 * Ejemplos de Uso - Comandos Privados
 * 
 * Este archivo muestra EJEMPLOS de cómo usar y extender
 * el sistema de comandos privados.
 * 
 * NO necesitas ejecutar esto - es solo referencia.
 */

// ============================================================
// EJEMPLO 1: Agregar más números autorizados
// ============================================================
// En src/config/private-commands.config.js:

/*
export const AUTHORIZED_NUMBERS = [
  '5493364015970',  // Propietario principal
  '5491234567890',  // Gerente (autorizado)
  '5499876543210',  // Administrador (autorizado)
  '5491111111111',  // Soporte técnico (autorizado)
]
*/

// ============================================================
// EJEMPLO 2: Crear un nuevo comando personalizado
// ============================================================

// Paso 1: Agregar handler en src/services/private-commands.handlers.js

/*
export async function handleReporteCommand(args, context) {
  // args = parámetros después del comando
  // context.ctx = contexto completo del mensaje
  
  try {
    // Obtener reporte de base de datos
    const reporte = await obtenerReporteVentas()
    
    return {
      success: true,
      message: `
📊 Reporte de Ventas - ${new Date().toLocaleDateString('es-AR')}
━━━━━━━━━━━━━━━━━━━━━━━
Total: $${reporte.total}
Productos vendidos: ${reporte.cantidad}
Clientes: ${reporte.clientes}
      `
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ Error al generar reporte: ${error.message}`
    }
  }
}
*/

// Paso 2: Registrar en src/services/private-commands.init.js

/*
import { handleReporteCommand } from './private-commands.handlers.js'

export function initializePrivateCommands() {
  // ... comandos existentes ...
  
  registerPrivateCommand(
    'reporte',
    'Generar reporte de ventas',
    handleReporteCommand
  )
}
*/

// Paso 3: Usar el comando
/*
/reporte
→ Respuesta: Reporte actual
*/

// ============================================================
// EJEMPLO 3: Comando con parámetros
// ============================================================

/*
export async function handleBorrarCommand(args, context) {
  // args contiene lo que escribes después de /borrar
  // Ej: "/borrar producto123" → args = "producto123"
  
  if (!args || args.trim().length === 0) {
    return {
      success: false,
      message: '❌ Debes especificar qué borrar.\nUso: */borrar ID*'
    }
  }
  
  const id = args.trim()
  
  // Validar permiso
  if (!isAdminUser(context.ctx.from)) {
    return {
      success: false,
      message: '❌ No tienes permisos para borrar'
    }
  }
  
  // Realizar operación
  await borrarProductoDB(id)
  
  return {
    success: true,
    message: `✅ Producto ${id} eliminado correctamente`
  }
}

// Uso:
// /borrar ITEM_123
// → ✅ Producto ITEM_123 eliminado correctamente
*/

// ============================================================
// EJEMPLO 4: Comando que llama servicio externo
// ============================================================

/*
export async function handleClimateCommand(args, context) {
  try {
    const response = await fetch('https://api.example.com/weather')
    const data = await response.json()
    
    return {
      success: true,
      message: `
🌤️ Clima Actual
━━━━━━━━━━━━
Temperatura: ${data.temp}°C
Humedad: ${data.humidity}%
Viento: ${data.wind} km/h
      `
    }
  } catch (error) {
    return {
      success: false,
      message: '❌ No pude obtener el clima'
    }
  }
}

registerPrivateCommand(
  'clima',
  'Ver clima actual',
  handleClimateCommand
)

// Uso: /clima
*/

// ============================================================
// EJEMPLO 5: Comando que modifica estado/base de datos
// ============================================================

/*
export async function handleActivarPromoCommand(args, context) {
  if (!args || args.trim().length === 0) {
    return {
      success: false,
      message: '❌ Especifica el código de promoción.\nUso: */activar CODE123*'
    }
  }
  
  const codigoPromo = args.trim().toUpperCase()
  
  try {
    // Verificar si promoción existe
    const promo = await buscarPromoEnBD(codigoPromo)
    if (!promo) {
      return {
        success: false,
        message: `❌ Promoción ${codigoPromo} no existe`
      }
    }
    
    // Activar
    await activarPromocionBD(codigoPromo)
    
    return {
      success: true,
      message: `
✅ Promoción Activada
━━━━━━━━━━━━━━━
Código: ${codigoPromo}
Descuento: ${promo.descuento}%
Válida hasta: ${promo.fechaExpira}
      `
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ Error al activar: ${error.message}`
    }
  }
}

registerPrivateCommand(
  'activar',
  'Activar código de promoción',
  handleActivarPromoCommand
)

// Uso: /activar PROMO2024
*/

// ============================================================
// EJEMPLO 6: Comando de información/help
// ============================================================

/*
export async function handleHelpCommand(args, context) {
  const { getPrivateCommandsList } = await import('../services/private-commands.service.js')
  const comandos = getPrivateCommandsList()
  
  const lista = comandos
    .map(c => `• */${c.comando}* - ${c.descripcion}`)
    .join('\n')
  
  return {
    success: true,
    message: `
📚 Comandos Disponibles (Solo para ti)
━━━━━━━━━━━━━━━━━━━━━━━
${lista}

💡 Escribe el comando con barra: /comando
    `
  }
}

registerPrivateCommand(
  'help',
  'Mostrar lista de comandos privados',
  handleHelpCommand
)

// Uso: /help
*/

// ============================================================
// EJEMPLO 7: Validación de permisos personalizada
// ============================================================

/*
export function isAdminUser(phoneNumber) {
  const ADMIN_NUMBERS = ['5493364015970', '5491234567890']
  const normalized = phoneNumber.replace(/[^\d]/g, '')
  return ADMIN_NUMBERS.includes(normalized)
}

export async function handleBorrarTodoCommand(args, context) {
  if (!isAdminUser(context.ctx.from)) {
    return {
      success: false,
      message: '❌ Solo administradores pueden ejecutar esto'
    }
  }
  
  // Operación destructiva
  await borrarTodaBaseDatos()
  
  return {
    success: true,
    message: '✅ Base de datos reiniciada'
  }
}

registerPrivateCommand(
  'borrar-todo',
  'Borrar base de datos (SOLO ADMINS)',
  handleBorrarTodoCommand
)
*/

// ============================================================
// EJEMPLO 8: Comando de estadísticas
// ============================================================

/*
export async function handleStatsCommand(args, context) {
  try {
    const stats = {
      usuariosActivos: await contarUsuariosActivos(),
      conversacionesHoy: await contarConversacionesHoy(),
      productosConsultados: await contarProductosConsultados(),
      errorLog: await obtenerUltimosErrores(5),
    }
    
    return {
      success: true,
      message: `
📊 Estadísticas del Bot
━━━━━━━━━━━━━━━━━━
👥 Usuarios activos: ${stats.usuariosActivos}
💬 Conversaciones hoy: ${stats.conversacionesHoy}
🔍 Productos consultados: ${stats.productosConsultados}

⚠️ Últimos errores:
${stats.errorLog.map(e => `• ${e}`).join('\n')}
      `
    }
  } catch (error) {
    return {
      success: false,
      message: '❌ Error al obtener estadísticas'
    }
  }
}

registerPrivateCommand(
  'stats',
  'Ver estadísticas del bot',
  handleStatsCommand
)

// Uso: /stats
*/

// ============================================================
// FLUJO DE TRABAJO TÍPICO
// ============================================================

/*
1. Identificas necesidad: "Quiero poder consultar inventario rápidamente"

2. Creas handler:
   - Función handleInventarioCommand() en private-commands.handlers.js
   - Consulta BD
   - Retorna {success, message}

3. Registras comando:
   - registerPrivateCommand('inventario', 'desc', handleInventarioCommand)
   - En private-commands.init.js

4. Usas:
   - /inventario
   - Obtienes respuesta instantánea

5. Expandes:
   - /inventario XXXXXX (específico)
   - /inventario-bajo (productos con poco stock)
   - /inventario-reporte (reporte completo)
*/

// ============================================================
// CONSIDERACIONES DE SEGURIDAD
// ============================================================

/*
✅ Buenas prácticas:
- Validar inputs: if (!args) return error
- Usar try/catch en handlers
- Normalizar números de teléfono
- Loguear intentos no autorizados
- Limitar operaciones destructivas

❌ Evitar:
- Procesar comandos públicos en handlers privados
- Crear loops de mensajes
- Guardar tokens/secretos en código
- Ejecutar operaciones sin validación
*/

// ============================================================
// TESTING - Cómo verificar que funciona
// ============================================================

/*
1. Inicia el bot:
   npm run dev

2. Verifica logs:
   ✅ Comandos privados inicializados correctamente

3. Prueba comando:
   - Envía: /articulo termica 25a
   - Verifica que responda

4. Prueba no autorizado:
   - Desde otro número: /articulo termica 25a
   - Verifica que NO responda

5. Verifica logs de intentos no autorizados:
   ❌ Intento de ejecutar comando privado desde número no autorizado: ...
*/
