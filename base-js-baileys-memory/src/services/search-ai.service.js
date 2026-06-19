import { DOMAIN_SYNONYMS } from '../config/search.config.js'
import { askAIJson } from './ai-provider.service.js'
import { normalize } from '../utils/normalize.js'

const planCache = new Map()
const CACHE_TTL_MS = 10 * 60 * 1000

const SEARCH_SYSTEM_PROMPT = `Sos un asistente de búsqueda para Electricidad Seret (ferretería/eléctrica argentina).
Los productos tienen descripciones como "INTERRUPTOR TERMOMAGNETICO 2X20A", "INTERRUPTOR DIFERENCIAL 2X25A", "CABLE UNIPOLAR 2,5MM".

En Argentina el cliente usa lenguaje informal:
- "disyuntor" puede ser interruptor diferencial → incluir ambos grupos de sinónimos
- "termica" = interruptor termomagnético (según contexto)
- "cable 2.5" debe ser búsqueda específica

Respondé SOLO JSON:
{
  "mode": "specific" | "broad",
  "groups": [
    ["termino1", "sinonimo2", "sinonimo3"]
  ]
}

Reglas:
En base al lenguaje en argentina en donde al material electrico se lo nombra de forma muy variada, tenes que poder llevar el lenguaje
del usuario a terminos que esten en la base de datos. Si el usuario nombra un amperaje, medida o cantidad de polos, eso es una búsqueda específica.
Si el usuario nombra una marca o tipo de producto, eso es una búsqueda amplia.
Si el usuario nombra varios términos, es una búsqueda específica
tenes que tener en cuenta los disminutivos y multiples formas de nombrar algo, como las abreviaturas que si son w es watt, etc.
tu funcion es entender el lenguaje del dia a dia que maneja el usuario y llevarlo a un lenguaje tecnico escaneando toda la base de datos 
y haciendo relacion entre lo que te pusieron, a que se lo llama asi en argentina, y buscarlo recien tengas el dato de como 
se lo nombra formalmente
La marca esta agregada como campo de consulta por ende si alguien te pide por una marca trae solamente la marca que piden, no todos los
que haya de todas las marcas`

function uniqueTerms(terms) {
  return [...new Set(terms.map((t) => normalize(t)).filter(Boolean))]
}

function expandAmperage(token) {
  const match = token.match(/^(\d+)\s*a$/i)
  if (!match) return [token]

  const amps = match[1]
  return uniqueTerms([
    token,
    `${amps}a`,
    `${amps} a`,
    `${amps}A`,
    `1x${amps}`,
    `2x${amps}`,
    `3x${amps}`,
    `4x${amps}`,
    `x${amps}a`,
    `${amps} amp`,
  ])
}

function expandMeasure(token) {
  if (!/^\d+[.,]\d+$/.test(token)) return [token]

  const withDot = token.replace(',', '.')
  const withComma = token.replace('.', ',')
  const [whole, decimal] = withDot.split('.')

  return uniqueTerms([
    token,
    withDot,
    withComma,
    `${whole},${decimal}mm`,
    `${whole}.${decimal}mm`,
    `${whole},${decimal} mm`,
    `${whole}.${decimal} mm`,
    `${whole},${decimal}mm2`,
    `${whole}.${decimal}mm2`,
    `${whole} x ${decimal}`,
    `${whole}x${decimal}`,
  ])
}

function expandToken(token) {
  const normalized = normalize(token)
  if (!normalized) return []

  const base = DOMAIN_SYNONYMS[normalized] ?? [normalized]
  const expanded = uniqueTerms([
    ...base,
    ...expandAmperage(normalized),
    ...expandMeasure(normalized),
  ])

  return expanded.length ? expanded : [normalized]
}

function buildGroupsFromTokens(tokens) {
  return tokens.map((token) => expandToken(token))
}

function expandGroupTerms(group) {
  return uniqueTerms(group.flatMap((term) => expandToken(term)))
}

function detectMode(tokens, groups) {
  if (tokens.length >= 2) return 'specific'
  if (groups[0]?.length > 3) return 'broad'
  return 'broad'
}

function isSKU(token) {
  // Detecta SKU: debe ser alfanumérico, corto, sin espacios
  const trimmed = token.trim()
  if (trimmed.length < 2 || trimmed.length > 20) return false
  // SKU típicamente es números, letras y guión (sin espacios)
  if (/\s/.test(trimmed)) return false
  // Debe tener solo alfanuméricos y guión
  if (!/^[A-Z0-9-]+$/i.test(trimmed)) return false
  return true
}

function parseWithRules(userQuery) {
  const normalized = normalize(userQuery)
  const tokens = normalized.split(' ').filter(Boolean)

  if (!tokens.length) {
    return { mode: 'broad', groups: [], original: normalized }
  }

  // Verificar si es búsqueda por SKU (usar texto original sin normalizar)
  if (tokens.length === 1 && isSKU(userQuery)) {
    const skuOriginal = userQuery.trim().toUpperCase()
    return {
      mode: 'specific',
      groups: [[skuOriginal]],
      original: normalized,
      source: 'sku',
    }
  }

  const groups = buildGroupsFromTokens(tokens)

  return {
    mode: detectMode(tokens, groups),
    groups,
    original: normalized,
    source: 'rules',
  }
}

async function parseWithAI(userQuery) {
  const parsed = await askAIJson(SEARCH_SYSTEM_PROMPT, userQuery)

  if (!parsed) return parseWithRules(userQuery)

  const groups = (parsed.groups ?? [])
    .map((group) => expandGroupTerms(group))
    .filter((group) => group.length)

  if (!groups.length) return parseWithRules(userQuery)

  return {
    mode: parsed.mode === 'specific' ? 'specific' : 'broad',
    groups,
    original: normalize(userQuery),
    source: 'ai',
  }
}

async function parseSearchQuery(userQuery) {
  const cacheKey = normalize(userQuery)
  const cached = planCache.get(cacheKey)

  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.plan
  }

  let plan

  try {
    plan = await parseWithAI(userQuery)
  } catch (err) {
    console.warn('IA no disponible, usando reglas:', err.message)
    plan = parseWithRules(userQuery)
  }

  planCache.set(cacheKey, { plan, at: Date.now() })
  return plan
}

export { parseSearchQuery, parseWithRules }
