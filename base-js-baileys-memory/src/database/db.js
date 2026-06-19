import sql from 'mssql'

function requiredEnv(name) {
  const value = process.env[name]
  if (!value || !String(value).trim()) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`)
  }
  return String(value).trim()
}

function envOrDefault(name, fallback) {
  const value = process.env[name]
  if (!value || !String(value).trim()) return fallback
  return String(value).trim()
}

const config = {
  user: envOrDefault('DB_USER', 'sa'),
  password: requiredEnv('DB_PASSWORD'),
  server: envOrDefault('DB_SERVER', 'localhost'),
  database: envOrDefault('DB_NAME', 'master'),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
}

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('✅ Conectado a SQL Server')
    return pool
  })
  .catch((err) => {
    console.error('❌ Error al conectar a SQL Server:', err.message)
    throw err
  })

export { sql, poolPromise }
