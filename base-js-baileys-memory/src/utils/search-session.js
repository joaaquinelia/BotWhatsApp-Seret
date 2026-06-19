export const SEARCH_MODE = {
  PROMPTED: 'prompted',
  ACTIVE: 'active',
  DECLINED: 'declined',
}

export const WEB_URL = 'https://electricidadseret.com.ar'

export const WEB_ORDER_MESSAGE =
  '🌐 *¿Querés comprar o reservar?*\n\n' +
  `👉 Entrá a *${WEB_URL}*\n\n` +
  '✔️ Hacé tu pedido online\n' +
  '✔️ Reservá el stock\n' +
  '✔️ Nos comunicamos con vos para concretar el pedido\n\n' +
  'ℹ️ Por WhatsApp solo podés *consultar* precios y disponibilidad.'

export const WEB_ORDER_SHORT =
  `🛒 Para pedir y reservar: *${WEB_URL}*`

export const PROMPT_MESSAGE =
  '👋 *Hola, soy el asistente de Electricidad Seret.*\n\n' +
  'Podés consultar productos, precios y stock por nombre, marca o código de fabricante.\n\n' +
  '¿Querés activar el buscador?\n\n' +
  '✅ Para buscar productos escribí *buscar*\n' +
  '❌ Si *no deseas activarlo*, seguí conversando normalmente\n\n' +
  '💡 En cualquier momento podés activarlo escribiendo *!buscar*'

export const ACTIVE_MESSAGE =
  '✅ *Buscador activado*\n\n' +
  'Escribí el nombre, marca o código del producto que necesitás.\n\n' +
  '🚪 */salir* para salir del buscador.'

export const DECLINED_MESSAGE =
  '👌 Perfecto.\n\n' +
  'Cuando necesites consultar productos, precios o stock, escribí *!buscar*.'

export const EXIT_MESSAGE =
  '🚪 Saliste del buscador.\n\n' +
  '💡 Cuando quieras consultar productos nuevamente, escribí *!buscar*.'

export const INACTIVITY_MESSAGE =
  '💡 Recorda que podés buscar productos, precios y stock con *!buscar*'

export const INACTIVITY_TIMEOUT_MS = 90 * 1000
