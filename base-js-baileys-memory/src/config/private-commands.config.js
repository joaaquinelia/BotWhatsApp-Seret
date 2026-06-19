/**
 * Configuración de Comandos Privados
 * 
 * Define los comandos disponibles y la forma de extraer
 * el número de teléfono desde el contexto.
 *
 * Aunque el nombre dice "privado", aquí ya no se limita
 * a números autorizados; cualquier remitente puede usar
 * comandos que empiecen con '/'.
 */

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
 * Normalizar un número de teléfono para comparación
 */
export function normalizePhoneNumber(rawPhoneNumber) {
  if (!rawPhoneNumber) return ''
  return String(rawPhoneNumber).replace(/[^\d]/g, '')
}

/**
 * Extraer el número de teléfono desde el contexto de BuilderBot/Baileys
 */
export function getPhoneNumberFromContext(ctx) {
  if (!ctx) return ''

  const rawNumber =
    ctx.from ||
    ctx.key?.remoteJid ||
    ctx.key?.remoteJidAlt ||
    ctx.key?.participant ||
    ctx.key?.sender ||
    ''

  return normalizePhoneNumber(rawNumber)
}

