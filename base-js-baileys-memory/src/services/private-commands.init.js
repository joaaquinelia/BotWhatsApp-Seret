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
