/**
 * Servicio de Comandos Privados
 * 
 * Maneja la detección, validación y ejecución de comandos
 * que solo pueden ser ejecutados por números autorizados
 */

import {
  PRIVATE_COMMANDS_REGISTRY,
  getPrivateCommand,
} from '../config/private-commands.config.js'

/**
 * Verificar si un mensaje es un comando privado
 * Retorna: { isPrivateCommand: boolean, command: string, args: string }
 */
function normalizeCommandString(command) {
  return command
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

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
  const parts = trimmed.substring(1).split(/\s+/)
  const commandRaw = parts[0].toLowerCase()
  const command = normalizeCommandString(commandRaw)
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

