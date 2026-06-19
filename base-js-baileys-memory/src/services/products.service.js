import fs from 'fs'
import { poolPromise, sql } from '../database/db.js'
import { normalize } from '../utils/index.js'
import { parseSearchQuery } from './search-ai.service.js'
import {
  MIN_SPECIFIC_SCORE,
  SEARCH_LIMIT,
  SEARCH_POOL_LIMIT,
} from '../config/search.config.js'

const aliases = JSON.parse(
  fs.readFileSync(new URL('../config/product-aliases.json', import.meta.url), 'utf8')
)

function termCondition(param) {
  return `(
    s.DESCRIPCIO COLLATE Latin1_General_CI_AI LIKE @${param} COLLATE Latin1_General_CI_AI
    OR ISNULL(s.SINONIMO, '') COLLATE Latin1_General_CI_AI LIKE @${param} COLLATE Latin1_General_CI_AI
    OR s.COD_ARTICU COLLATE Latin1_General_CI_AI LIKE @${param} COLLATE Latin1_General_CI_AI
    OR ISNULL(s.COD_BARRA, '') COLLATE Latin1_General_CI_AI LIKE @${param} COLLATE Latin1_General_CI_AI
  )`
}

function matchesTerm(product, term) {
  const haystack = normalize(
    [product.nombre, product.codigo, product.sinonimo, product.codigoBarra]
      .filter(Boolean)
      .join(' ')
  )
  return haystack.includes(normalize(term))
}

function productAlias(product) {
  const haystack = normalize(
    [product.nombre, product.codigo, product.sinonimo, product.codigoBarra]
      .filter(Boolean)
      .join(' ')
  )

  for (const aliasKey of Object.keys(aliases)) {
    const alias = aliases[aliasKey]
    if (
      alias.patterns.some((pattern) =>
        normalize(pattern).split(' ').every((token) => haystack.includes(token))
      )
    ) {
      return alias.label
    }
  }

  return product.nombre
}

function scoreProduct(product, plan) {
  let score = 0
  let groupsMatched = 0

  for (const group of plan.groups) {
    const groupHit = group.some((term) => matchesTerm(product, term))
    if (groupHit) {
      groupsMatched += 1
      score += 12
    }
  }

  if (groupsMatched === plan.groups.length && plan.groups.length > 0) {
    score += 25
  }

  if (plan.original && matchesTerm(product, plan.original)) {
    score += 30
  }

  const nombre = normalize(product.nombre)
  for (const group of plan.groups) {
    for (const term of group) {
      if (nombre.includes(normalize(term))) {
        score += 4
      }
    }
  }

  if (product.stock > 0) {
    score += 2
  }

  if (plan.mode === 'specific' && plan.original.includes('cable')) {
    const isCable = /cable|conductor|unipolar|subterraneo/i.test(product.nombre)
    score += isCable ? 20 : -30
  }

  return score
}

function filterRelevantResults(products, plan) {
  return products
}

function buildGroupConditions(groups, request) {
  const groupSql = []

  groups.forEach((group, groupIndex) => {
    const termSql = group.map((term, termIndex) => {
      const param = `g${groupIndex}t${termIndex}`
      request.input(param, sql.NVarChar, `%${term}%`)
      return termCondition(param)
    })

    groupSql.push(`(${termSql.join(' OR ')})`)
  })

  return groupSql
}

function buildWhereClause(plan, request) {
  const groupConditions = buildGroupConditions(plan.groups, request)

  if (plan.mode === 'specific') {
    return `AND ${groupConditions.join(' AND ')}`
  }

  return `AND (${groupConditions.join(' OR ')})`
}

async function queryProducts(request, whereExtra, top = SEARCH_POOL_LIMIT) {
  const result = await request.query(`
    SELECT TOP ${top}
      s.COD_ARTICU AS codigo,
      s.DESCRIPCIO AS nombre,
      ISNULL(s.SINONIMO, '') AS sinonimo,
      ISNULL(s.COD_BARRA, '') AS codigoBarra,
      ISNULL(s.DESC_ADIC, '') AS marca,
      ISNULL(g.PRECIO, 0) AS precio,
      ISNULL(stock.CANT_STOCK, ISNULL(s.STOCK, 0)) AS stock
    FROM STA11 s
    LEFT JOIN GVA17 g ON g.ID_STA11 = s.ID_STA11 AND g.NRO_DE_LIS = 6
    LEFT JOIN (
      SELECT ID_STA11, SUM(ISNULL(CANT_STOCK, 0)) AS CANT_STOCK
      FROM STA19
      GROUP BY ID_STA11
    ) stock ON s.ID_STA11 = stock.ID_STA11
    WHERE s.PERFIL = 'A'
      ${whereExtra}
    ORDER BY s.DESCRIPCIO
  `)

  return result.recordset
}

async function countProducts(plan) {
  const pool = await poolPromise
  const request = pool.request()
  const whereExtra = buildWhereClause(plan, request)

  const result = await request.query(`
    SELECT COUNT(1) AS total
    FROM STA11 s
    WHERE s.PERFIL = 'A'
      ${whereExtra}
  `)

  return result.recordset[0]?.total ?? 0
}

function rankProducts(rows, plan) {
  const ranked = filterRelevantResults(
    rows
      .map((product) => ({
        ...product,
        friendlyName: productAlias(product),
        score: scoreProduct(product, plan),
      }))
      .filter((product) => product.score > 0)
      .sort((a, b) => b.score - a.score || a.nombre.localeCompare(b.nombre)),
    plan
  )

  if (plan.mode === 'specific') {
    return ranked.filter((product) => product.score >= MIN_SPECIFIC_SCORE)
  }

  return ranked
}

async function searchProductsWithMeta(text, offset = 0) {
  const plan = await parseSearchQuery(text)

  if (!plan.groups.length) {
    return {
      plan,
      query: text,
      products: [],
      totalCount: 0,
      needsRefinement: false,
      sampleNames: [],
      offset,
    }
  }

  const pool = await poolPromise
  const request = pool.request()
  const whereExtra = buildWhereClause(plan, request)

  const [totalCount, rows] = await Promise.all([
    countProducts(plan),
    queryProducts(request, whereExtra),
  ])

  const ranked = rankProducts(rows, plan)
  const products = ranked.slice(offset, offset + SEARCH_LIMIT)
  const sampleNames = ranked.slice(0, 40).map((p) => p.nombre)
  const needsRefinement = false

  return {
    plan,
    query: text,
    products,
    totalCount,
    needsRefinement,
    sampleNames,
    offset,
    allResults: ranked,
  }
}

export { searchProductsWithMeta }
