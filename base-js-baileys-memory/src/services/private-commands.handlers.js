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
