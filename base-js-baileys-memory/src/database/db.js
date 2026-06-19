import sql from 'mssql'

const config = {
  user: String(process.env.DB_USER ?? 'sa').trim(),
  password: String(process.env.DB_PASSWORD ?? 'Axoft1988').trim(),
  server: String(process.env.DB_SERVER ?? 'SERVERHP\\AXSQLEXPRESS').trim(),
  database: String(process.env.DB_NAME ?? 'ELECTRICIDAD_SERET_SRL').trim(),
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
