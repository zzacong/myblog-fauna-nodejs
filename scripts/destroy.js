const faunadb = require('faunadb')
const { childDbName, adminKey } = require('./constants')

const {
  Get,
  Paginate,
  Delete,
  Database,
  Map,
  If,
  Exists,
  Keys,
  Let,
  Select,
  Equals,
  Var,
} = faunadb.query

const adminClient = new faunadb.Client({
  secret: adminKey,
})

const main = async () => {
  const ret = await adminClient.query(
    Map(Paginate(Keys()), x =>
      Let(
        {
          key: Get(x),
          ref: Select(['ref'], Var('key')),
          db: Select(['database'], Var('key'), 'none'),
        },
        If(Equals(Var('db'), Database(childDbName)), Delete(Var('ref')), false)
      )
    )
  )
  console.log(ret)

  const db = await adminClient.query(
    If(Exists(Database(childDbName)), Delete(Database(childDbName)), false)
  )
  console.log(db)
}

main()
  .then(() => console.log('[DESTROY COMPLETED]'))
  .catch(console.error)
