import { addKeyword, EVENTS } from '@builderbot/bot'

import { SEARCH_LIMIT } from '../config/search.config.js'
import { searchProductsWithMeta } from '../services/products.service.js'
import { isAIEnabled } from '../services/ai-provider.service.js'
import { extractSearchTerm, formatProductList, normalize } from '../utils/index.js'
import {
  ACTIVE_MESSAGE,
  DECLINED_MESSAGE,
  EXIT_MESSAGE,
  INACTIVITY_TIMEOUT_MS,
  INACTIVITY_MESSAGE,
  PROMPT_MESSAGE,
  SEARCH_MODE,
  WEB_ORDER_SHORT,
} from '../utils/search-session.js'
import { parsePrivateCommand, handlePrivateCommand } from '../services/private-commands.service.js'
import { getPhoneNumberFromContext } from '../config/private-commands.config.js'

async function handleProductSearch(ctx, flowDynamic, state) {
  const now = Date.now()
  const lastActivityTime = state.get('lastActivityTime')

  // Solo aplicar timeout si el usuario está en modo búsqueda activa.
  if (
    state.get('searchMode') === SEARCH_MODE.ACTIVE &&
    lastActivityTime &&
    now - lastActivityTime > INACTIVITY_TIMEOUT_MS
  ) {
    await state.update({
      searchMode: SEARCH_MODE.DECLINED,
      isInactiveMode: true,
      refineSession: null,
      lastActivityTime: now,
      hasBeenAsked: true,
    })
    // No enviar notificación al usuario; simplemente dejar de molestar.
    return
  }

  await state.update({ lastActivityTime: now })

  const normalizedBody = normalize(ctx.body)
  const userInput = extractSearchTerm(ctx.body)
  const refine = state.get('refineSession')
  const searchSession = state.get('searchSession')
  const isSeeMore = ['ver mas', 'ver más', 'mostrar mas', 'mostrar más'].includes(normalizedBody)

  if (isSeeMore && searchSession?.query) {
    const nextOffset = (searchSession.offset ?? 0) + SEARCH_LIMIT
    const meta = await searchProductsWithMeta(searchSession.query, nextOffset)

    if (!meta.products.length) {
      return await flowDynamic(
        'No hay más productos disponibles. Probá con otra búsqueda o escribí */buscar*.'
      )
    }

    await state.update({
      searchSession: {
        query: searchSession.query,
        offset: nextOffset,
        totalCount: meta.totalCount,
      },
    })

    const totalDisplayed = nextOffset + meta.products.length
    const intro =
      meta.totalCount > totalDisplayed
        ? `🔴 TE ESTAMOS MOSTRANDO ${meta.products.length} DE ${meta.totalCount} PRODUCTOS, PARA PASAR DE PAGINA ESCRIBI "VER MAS".`
        : ''

    if (intro) {
      await flowDynamic(intro)
    }
    return await flowDynamic(
      formatProductList(meta.products, searchSession.query, meta.totalCount, nextOffset)
    )
  }

  if (!userInput && !refine?.active) {
    return await flowDynamic(ACTIVE_MESSAGE)
  }

  let fullQuery = userInput
  let session = refine
  let offset = 0

  if (refine?.active) {
    const filters = [...refine.filters, userInput].filter(Boolean)
    fullQuery = [refine.baseQuery, ...filters].join(' ')
    offset = refine.offset || 0
    session = {
      active: true,
      baseQuery: refine.baseQuery,
      filters,
      step: refine.step + 1,
      offset,
    }
  }

  const thinkingMsg = isAIEnabled()
    ? '🔍 Buscando...'
    : '🔍 Buscando...'

  await flowDynamic(thinkingMsg)

  const meta = await searchProductsWithMeta(fullQuery, offset)

  await state.update({
    searchSession: {
      query: fullQuery,
      offset,
      totalCount: meta.totalCount,
    },
  })

  await state.update({ refineSession: null })

  if (!meta.products.length) {
    return await flowDynamic(
      `😕 No encontré productos para: *${fullQuery}*\n\n` +
        'Probá con otra descripción o medida.\n\n' +
        '🚪 */salir* para salir del buscador.'
    )
  }

  const totalDisplayed = offset + meta.products.length
  const intro =
    meta.totalCount > totalDisplayed
      ? `🔴 TE ESTAMOS MOSTRANDO ${Math.min(SEARCH_LIMIT, meta.products.length)} DE ${meta.totalCount} PRODUCTOS, PARA PASAR DE PAGINA ESCRIBI "VER MAS".`
      : ''

  if (intro) {
    await flowDynamic(intro)
  }

  return await flowDynamic(
    formatProductList(meta.products, fullQuery, meta.totalCount, offset)
  )
}

const searchActivateFlow = addKeyword(['/buscar', '!buscar', 'buscar productos'])
  .addAction(async (_, { flowDynamic, state }) => {
    await state.update({
      searchMode: SEARCH_MODE.ACTIVE,
      refineSession: null,
      isInactiveMode: false,
      lastActivityTime: Date.now(),
      hasBeenAsked: true,
    })
    await flowDynamic(ACTIVE_MESSAGE)
  })

const privateCommandFlow = addKeyword([
  '/articulo',
  '/dolar',
  '/dólar',
  '/stock',
  '/precio',
])
  .addAction(async (ctx, { flowDynamic, endFlow }) => {
    const messageText = (ctx.body || '').trim()
    const { isPrivateCommand } = parsePrivateCommand(messageText)

    if (!isPrivateCommand) {
      await flowDynamic(
        'No reconozco ese comando. Usá /dolar, /articulo, /stock o /precio.'
      )
      return await endFlow()
    }

    const phoneNumber = getPhoneNumberFromContext(ctx)
    const result = await handlePrivateCommand(messageText, phoneNumber, { ctx })

    if (result?.message) {
      await flowDynamic(result.message)
    } else {
      await flowDynamic(
        'No reconozco ese comando. Usá /dolar, /articulo, /stock o /precio.'
      )
    }

    return await endFlow()
  })

const searchExitFlow = addKeyword(['/salir', '/exit', 'salir buscador'])
  .addAction(async (_, { flowDynamic, state }) => {
    await state.update({
      searchMode: SEARCH_MODE.DECLINED,
      refineSession: null,
      searchSession: null,
      lastActivityTime: Date.now(),
      isInactiveMode: true,
      hasBeenAsked: true,
    })
    await flowDynamic(EXIT_MESSAGE)
  })

function isAffirmative(text) {
  const normalizedText = normalize(text).trim().toLowerCase()
  return ['buscar'].includes(normalizedText)
}

async function handleSearchWelcome(ctx, { flowDynamic, state, endFlow }) {
  const messageText = (ctx.body || '').trim()
  const phoneNumber = getPhoneNumberFromContext(ctx)

  if (messageText.startsWith('/')) {
    const { isPrivateCommand, command } = parsePrivateCommand(messageText)

    if (isPrivateCommand) {
      const result = await handlePrivateCommand(messageText, phoneNumber, { ctx })

      if (result !== null) {
        if (result.message) {
          await flowDynamic(result.message)
        }
        console.log(`✅ Comando privado procesado: ${command}`)
        return await endFlow()
      }

      console.log(`❌ Comando privado no reconocido: ${messageText}`)
      return await endFlow()
    }
  }

  const mode = state.get('searchMode')
  const hasBeenAsked = state.get('hasBeenAsked')
  const lastActivityTime = state.get('lastActivityTime')
  const isInactiveMode = state.get('isInactiveMode')
  const now = Date.now()

  if (
    mode === SEARCH_MODE.ACTIVE &&
    lastActivityTime &&
    now - lastActivityTime > INACTIVITY_TIMEOUT_MS &&
    !isInactiveMode
  ) {
    await state.update({
      searchMode: SEARCH_MODE.DECLINED,
      isInactiveMode: true,
      refineSession: null,
    })
    await flowDynamic(INACTIVITY_MESSAGE)
    return await endFlow()
  }

  if (mode === SEARCH_MODE.PROMPTED && lastActivityTime && now - lastActivityTime > INACTIVITY_TIMEOUT_MS && !isInactiveMode) {
    await state.update({
      searchMode: SEARCH_MODE.DECLINED,
      isInactiveMode: true,
      refineSession: null,
    })
    await flowDynamic(INACTIVITY_MESSAGE)
    return await endFlow()
  }

  if (isInactiveMode) {
    return await endFlow()
  }

  if (mode === SEARCH_MODE.DECLINED) {
    return await endFlow()
  }

  if (mode === SEARCH_MODE.PROMPTED) {
    if (isAffirmative(messageText)) {
      await state.update({
        searchMode: SEARCH_MODE.ACTIVE,
        refineSession: null,
        isInactiveMode: false,
        lastActivityTime: now,
      })
      await flowDynamic(ACTIVE_MESSAGE)
      return await endFlow()
    }

    if (isNegative(messageText)) {
      await state.update({
        searchMode: SEARCH_MODE.DECLINED,
        refineSession: null,
        isInactiveMode: true,
        lastActivityTime: now,
      })
      await flowDynamic(DECLINED_MESSAGE)
      return await endFlow()
    }

    return await endFlow()
  }

  if (!mode && !hasBeenAsked) {
    await state.update({
      searchMode: SEARCH_MODE.PROMPTED,
      refineSession: null,
      isInactiveMode: false,
      lastActivityTime: now,
      hasBeenAsked: true,
    })
    await flowDynamic(PROMPT_MESSAGE)
    return await endFlow()
  }

  if (mode === SEARCH_MODE.DECLINED) {
    return await endFlow()
  }

  await state.update({ lastActivityTime: now })

  if (mode === SEARCH_MODE.ACTIVE) {
    try {
      return await handleProductSearch(ctx, flowDynamic, state, endFlow)
    } catch (err) {
      console.error('Error buscando productos:', err)
      return await flowDynamic(
        '⚠️ Hubo un error al consultar la base de datos. Intentá de nuevo en unos segundos.'
      )
    }
  }

  return await endFlow()
}

function isNegative(text) {
  const normalizedText = normalize(text).trim().toLowerCase()
  return ['no', 'n', 'nah'].includes(normalizedText)
}

const searchWelcomeFlow = addKeyword(EVENTS.WELCOME).addAction(handleSearchWelcome)
const searchFallbackFlow = addKeyword('/^[\\s\\S]*$/', { regex: true }).addAction(handleSearchWelcome)

export { searchActivateFlow, searchExitFlow, searchWelcomeFlow, searchFallbackFlow, privateCommandFlow }
