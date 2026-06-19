import { normalize } from './normalize.js'
import { WEB_ORDER_SHORT } from './search-session.js'

const GREETING_WORDS = new Set([
  'hola',
  'hi',
  'hello',
  'buenas',
  'buen dia',
  'buenos dias',
  'buscar',
  'busco',
  'quiero',
  'necesito',
  'producto',
  'productos',
  'menu',
  'ayuda',
])

export function extractSearchTerm(text) {
  const normalized = normalize(text)
  if (!normalized) return ''

  const terms = normalized
    .split(' ')
    .filter((word) => word && !GREETING_WORDS.has(word))

  return terms.join(' ')
}

export function hasStock(stock) {
  const qty = Number(stock)
  if (!Number.isFinite(qty) || qty <= 0) return false
  if (qty >= 999999) return true
  return qty > 0
}

export function formatStock(stock) {
  return hasStock(stock) ? '✅ *Hay stock*' : '❌ *Sin stock*'
}

export function formatPrice(precio) {
  return Number(precio).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const MAX_PRODUCT_DISPLAY = 15

export function formatProductCard(product) {
  const precio = formatPrice(product.precio)
  const name = product.nombre || 'Sin nombre'
  const marca = product.marca || 'Sin marca'
  const stock = hasStock(product.stock) ? '✅' : '❌'
  const codigoFabricante = product.sinonimo || ''
  const codigoInterno = product.codigo || ''

  return [
    `📦 *${name}* | *${marca}* | *Stock* ${stock}`,
    `Cod. fabricante: ${codigoFabricante} | Cod. Interno: ${codigoInterno}`,
    `💰 *$${precio}*`,
  ].join('\n')
}

export function formatProductList(products, query, totalCount = products.length, offset = 0) {
  const displayedProducts = products.slice(0, MAX_PRODUCT_DISPLAY)
  const page = Math.floor(offset / MAX_PRODUCT_DISPLAY) + 1
  const totalPages = Math.max(1, Math.ceil(totalCount / MAX_PRODUCT_DISPLAY))

  const headerLines = []
  if (totalPages > 1) {
    headerLines.push(`📄 PAGINA ${page}/${totalPages}`)
  }

  const cards = displayedProducts.map((product) => formatProductCard(product))
  const separator = '\n\n'

  const footer = '🚪 */salir* para salir del buscador.'

  return headerLines.length
    ? `${headerLines.join('\n')}\n\n${cards.join(separator)}\n\n${footer}`
    : `${cards.join(separator)}\n\n${footer}`
}

export { normalize }
