import sql from 'mssql'

function requiredEnv(name) {
  const value = process.env[name]
  if (!value || !String(value).trim()) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`)
  }
  return String(value).trim()
}

const config = {
  user: requiredEnv('DB_USER'),
  password: requiredEnv('DB_PASSWORD'),
  server: requiredEnv('DB_SERVER'),
  database: requiredEnv('DB_NAME'),
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
