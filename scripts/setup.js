const fs = require('fs')
const envfile = require('envfile')
const faunadb = require('faunadb')
const {
  adminKey,
  childDbName,
  childDbServerKey,
  envPath,
  consoleColor,
} = require('../constants')

const { Database, CreateDatabase, CreateKey, If, Exists } = faunadb.query

const adminClient = new faunadb.Client({
  secret: adminKey,
})

const main = async () => {
  const db = await adminClient.query(
    If(
      Exists(Database(childDbName)),
      false,
      CreateDatabase({ name: childDbName })
    )
  )
  console.log(db)

  if (!db) return

  const clientKey = await adminClient.query(
    CreateKey({
      database: Database(childDbName),
      role: 'server',
      data: {
        name: childDbServerKey,
      },
    })
  )
  console.log(clientKey)

  const json = envfile.parse(fs.readFileSync(envPath, 'utf-8'))
  json.FAUNA_SERVER_SECRET = clientKey.secret
  fs.writeFileSync(envPath, envfile.stringify(json))

  console.log(
    `${consoleColor.green}%s${consoleColor.reset}`,
    `CLIENT SECRET: ${clientKey.secret}`
  )
}

main()
  .then(() => console.log('[SETUP COMPLETED]'))
  .catch(console.error)
