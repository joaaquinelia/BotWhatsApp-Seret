import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  utils,
} from '@builderbot/bot'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env') })
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

import { poolPromise } from './database/db.js'
import {
  searchActivateFlow,
  searchExitFlow,
  searchWelcomeFlow,
  searchFallbackFlow,
  privateCommandFlow,
} from './flows/search.flow.js'
import { ACTIVE_MESSAGE } from './utils/search-session.js'
import { getDolarListMessage } from './services/dolar.service.js'
import { initializePrivateCommands } from './services/private-commands.init.js'

const PORT = process.env.PORT ?? 3008

// Nota: Eliminado `AUTHORIZED_NUMBERS` desde el punto de entrada.

// ----------------------
// FLOW AYUDA
// ----------------------
const helpFlow = addKeyword(['ayuda', 'menu', 'help', '/ayuda'])
  .addAction(async (_, { flowDynamic }) => {
    await flowDynamic(ACTIVE_MESSAGE)
  })

// ----------------------
// FLOW DOC (ejemplo base)
// ----------------------
const discordFlow = addKeyword('doc').addAnswer(
  [
    'You can see the documentation here',
    '📄 https://builderbot.app/docs',
    'Do you want to continue? *yes*'
  ].join('\n'),
  { capture: true },
  async (ctx, { gotoFlow, flowDynamic }) => {
    if (ctx.body.toLowerCase().includes('yes')) {
      return await flowDynamic('OK 👍')
    }
    return await flowDynamic('Thanks!')
  }
)

// ----------------------
// FLOW REGISTRO
// ----------------------
const registerFlow = addKeyword(utils.setEvent('REGISTER_FLOW'))
  .addAnswer('What is your name?', { capture: true }, async (ctx, { state }) => {
    await state.update({ name: ctx.body })
  })
  .addAnswer('What is your age?', { capture: true }, async (ctx, { state }) => {
    await state.update({ age: ctx.body })
  })
  .addAction(async (_, { flowDynamic, state }) => {
    await flowDynamic(
      `${state.get('name')}, thanks! Age: ${state.get('age')}`
    )
  })

// ----------------------
// FLOW SAMPLES - DOLAR (público, ahora con slash también)
// ----------------------
const dolarFlow = addKeyword([
    'dolar',
    '/dolar',
    '/dólar',
    '/bna',
    '/blue'
]).addAction(async (_, { flowDynamic }) => {
    try {
        const message = await getDolarListMessage()

        await flowDynamic(message)
    } catch (error) {
        console.error(error)

        await flowDynamic(
            '❌ No pude obtener la cotización del dólar.'
        )
    }
})

const fullSamplesFlow = addKeyword(['samples', utils.setEvent('SAMPLES')])
  .addAnswer('💪 Sending files...')
  .addAnswer('Image', { media: join(process.cwd(), 'assets', 'sample.png') })

// ----------------------
// MAIN
// ----------------------
const main = async () => {
  await poolPromise

  // Inicializar comandos privados
  initializePrivateCommands()

  const adapterFlow = createFlow([
    searchExitFlow,
    searchActivateFlow,
    privateCommandFlow,
    helpFlow,
    discordFlow,
    registerFlow,
    fullSamplesFlow,
    dolarFlow,
    searchWelcomeFlow,
    searchFallbackFlow,
  ])

  const adapterProvider = createProvider(Provider, {
    version: [2, 3000, 1035824857],
    writeMyself: 'host',
    emitOwnEvents: true,
  })

  const adapterDB = new Database()

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  adapterProvider.server.post(
    '/v1/messages',
    handleCtx(async (bot, req, res) => {
      const { number, message, urlMedia } = req.body
      await bot.sendMessage(number, message, { media: urlMedia ?? null })
      return res.end('sended')
    })
  )

  httpServer(+PORT)
}

main()
