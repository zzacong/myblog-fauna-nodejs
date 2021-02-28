const faunadb = require('faunadb')
const { serverKey } = require('./constants')

const q = faunadb.query

const serverClient = new faunadb.Client({
  secret: serverKey,
})

const main = async () => {
  // ! Create an index
  var ret = await serverClient.query(
    q.CreateIndex({
      name: 'posts_by_title',
      source: q.Collection('posts'),
      terms: [{ field: ['data', 'title'] }],
    })
  )
  console.log(ret)

  // ! Create a post
  var ret = await serverClient.query(
    q.CreateIndex({
      name: 'posts_by_tags_with_title',
      source: q.Collection('posts'),
      terms: [{ field: ['data', 'tags'] }],
      values: [{ field: ['data', 'title'] }],
    })
  )
  console.log(ret)

  // Specify ID when Create
  var ret = await serverClient.query(
    q.Create(q.Collection('posts'), {
      data: { title: 'What I had for breakfast ..' },
    })
  )
  console.log(ret)

  var ret = await serverClient.query(
    q.Create(q.Ref(q.Collection('posts'), '1'), {
      data: { title: 'The first post' },
    })
  )
  console.log(ret)

  // ! Create several posts
  var ret = await serverClient.query(
    q.Map(
      [
        'My cat and other marvels',
        'Pondering during a commute',
        'Deep meanings in a latte',
      ],
      q.Lambda(
        'post_title',
        q.Create(q.Collection('posts'), {
          data: { title: q.Var('post_title') },
        })
      )
    )
  )
  console.log(ret)

  // ! Retrieve posts
  var ret = await serverClient.query(
    q.Get(q.Ref(q.Collection('posts'), '192903209792046592'))
  )
  console.log(ret)

  // Using Index and Match
  var ret = await serverClient.query(
    q.Get(q.Match(q.Index('posts_by_title'), 'My cat and other marvels'))
  )
  console.log(ret)

  // ! Update posts
  var ret = await serverClient.query(
    q.Update(q.Ref(q.Collection('posts'), '192903209792046592'), {
      data: { tags: ['pet', 'cute'] },
    })
  )
  console.log(ret)

  // ! Replace posts
  var ret = await serverClient.query(
    q.Replace(q.Ref(q.Collection('posts'), '192903209792046592'), {
      data: { title: 'My dog and other marvels' },
    })
  )
  console.log(ret)

  // ! Delete a post
  var ret = await serverClient.query(
    q.Delete(q.Ref(q.Collection('posts'), '192903209792045568'))
  )
  console.log(ret)
}

main().catch(console.error)
