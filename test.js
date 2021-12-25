const assert = require('assert');
const http = require('http')

const app = require('./app')
const models = require('./models')
const test_lib = require('./test_lib')

function testApp(cb) {
  return app.start(0, false, async (server) => {
    await cb(server)
    server.close()
  })
}

// https://stackoverflow.com/questions/6048504/synchronous-request-in-node-js/53338670#53338670
function sendJsonHttp(opts) {
  return new Promise((resolve, reject) => {
    let body
    if (opts.body) {
      body = JSON.stringify(opts.body)
    } else {
      body = ''
    }
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    }
    if (opts.token) {
      headers['Authorization'] = `Token ${opts.token}`
    }
    const options = {
      hostname: 'localhost',
      port: opts.server.address().port,
      path: opts.path,
      method: opts.method,
      headers,
    }
    const req = http.request(options, res => {
      res.on('data', data => {
        resolve([res, JSON.parse(data.toString())])
      })
    })
    req.write(body)
    req.end()
  })
}

it('feed shows articles by followers', async () => {
  //  art0 by user0
  //  art1 by user1
  //  art2 by user2
  //  art3 by user3
  //
  //  art4 by user0
  //  art5 by user1
  //  art6 by user2
  //  art7 by user3
  //
  //  art8 by user0
  //  art9 by user1
  // art10 by user2
  // art11 by user3
  //
  // user0 follows user1 and user2
  // user1 follows user2 and user3
  // user2 follows user0 and user3
  // user3 follows user0 and user1
  const sequelize = await test_lib.generateDemoData({
    nUsers: 4,
    nArticlesPerUser: 3,
    nFollowsPerUser: 2,
  })

  const user0 = await sequelize.models.User.findOne({where: {username: 'user0'}})

  // getArticlesByFollowedAndCount
  const {count, rows} = await user0.findAndCountArticlesByFollowed(1, 4)
  //assert.strictEqual(user0ArticlesByFollowed[].title, 'My title 10')
  assert.strictEqual(rows[0].title, 'My title 9')
  assert.strictEqual(rows[1].title, 'My title 6')
  assert.strictEqual(rows[2].title, 'My title 5')
  assert.strictEqual(rows[3].title, 'My title 2')
  //assert.strictEqual(user0ArticlesByFollowed[4].title, 'My title 1')
  assert.strictEqual(rows.length, 4)
  assert.strictEqual(count, 6)

  await sequelize.close()
})

it('tags without articles are deleted automatically after their last article is deleted', async () => {
  const sequelize = models.getSequelize()
  await sequelize.sync({force: true})
  const user = await sequelize.models.User.create(test_lib.makeUser(sequelize))
  const article0 = await sequelize.models.Article.create(test_lib.makeArticle(0, { authorId: user.id }))
  const article1 = await sequelize.models.Article.create(test_lib.makeArticle(1, { authorId: user.id }))
  const tag0 = await sequelize.models.Tag.create(test_lib.makeTag(0))
  const tag1 = await sequelize.models.Tag.create(test_lib.makeTag(1))
  await sequelize.models.ArticleTag.create({ articleId: article0.id, tagId: tag0.id })
  await sequelize.models.ArticleTag.create({ articleId: article1.id, tagId: tag0.id })
  await sequelize.models.ArticleTag.create({ articleId: article1.id, tagId: tag1.id })
  await article1.destroy2()
  let tags = await sequelize.models.Tag.findAll({order: [['id', 'ASC']]})
  assert.strictEqual(tags[0].id, tag0.id)
  assert.strictEqual(tags.length, 1)
  await article0.destroy2()
  tags = await sequelize.models.Tag.findAll({order: [['id', 'ASC']]})
  assert.strictEqual(tags.length, 0)
})

it('users can be deleted and deletion cascades to all relations', async () => {
  // This was failing previously because of cascading madness.
  // It is also interesting to see if article deletion will cascade into the
  // empty tag deletion hooks or not.
  const sequelize = models.getSequelize()
  await sequelize.sync({force: true})
  const user = await sequelize.models.User.create(test_lib.makeUser(sequelize))
  const article0 = await sequelize.models.Article.create(test_lib.makeArticle(0, { authorId: user.id }))
  const article1 = await sequelize.models.Article.create(test_lib.makeArticle(1, { authorId: user.id }))
  const comment0 = await sequelize.models.Comment.create(test_lib.makeComment(article0.id, user.id, 0))
  const comment1 = await sequelize.models.Comment.create(test_lib.makeComment(article0.id, user.id, 1))
  const tag0 = await sequelize.models.Tag.create(test_lib.makeTag(0))
  const tag1 = await sequelize.models.Tag.create(test_lib.makeTag(1))
  await sequelize.models.ArticleTag.create({ articleId: article0.id, tagId: tag0.id })
  await sequelize.models.ArticleTag.create({ articleId: article1.id, tagId: tag0.id })
  await sequelize.models.ArticleTag.create({ articleId: article1.id, tagId: tag1.id })
  await user.destroy()
  assert.strictEqual(await sequelize.models.User.count(), 0)
  assert.strictEqual(await sequelize.models.Article.count(), 0)
  assert.strictEqual(await sequelize.models.Tag.count(), 0)
  assert.strictEqual(await sequelize.models.Comment.count(), 0)
})


it('api: create an article and see it on global feed', () => {
  return testApp(async (server) => {
    let res, data

    // Create user.
    ;[res, data] = await sendJsonHttp({
      server,
      method: 'POST',
      path: '/api/users',
      body: { user: test_lib.makeUser(sequelize) },
    })
    const token = data.user.token
    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(data.user.username, 'user0')

    // Create article.
    let article = test_lib.makeArticle(0, { api: true })
    article.tagList: ['tag0', 'tag1']
    ;[res, data] = await sendJsonHttp({
      server,
      method: 'POST',
      path: '/api/articles',
      body: { article },
      token,
    })
    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(data.article.title, 'title0')

    // See it on global feed.
    ;[res, data] = await sendJsonHttp({
      server,
      method: 'GET',
      path: '/api/articles',
      token,
    })
    assert.strictEqual(data.articles[0].title, 'My Title 0')
    assert.strictEqual(data.articles[0].author.username, 'user0')
    assert.strictEqual(data.articlesCount, 1)

    // See the tags on the global feed.
    ;[res, data] = await sendJsonHttp({
      server,
      method: 'GET',
      path: '/api/articles',
      token,
    })
    assert.strictEqual(data.articles[0].title, 'My Title 0')
    assert.strictEqual(data.articles[0].author.username, 'user0')
    assert.strictEqual(data.articlesCount, 1)
  })
})
