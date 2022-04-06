const assert = require('assert')
const http = require('http')

const app = require('./app')
const test_lib = require('./test_lib')

function testApp(cb, opts = {}) {
  const canTestNext = opts.canTestNext === undefined ? false : opts.canTestNext
  return app.start(0, canTestNext && testNext, async (server) => {
    await cb(server)
    server.close()
  })
}

beforeEach(async function () {
  this.currentTest.sequelize = await test_lib.generateDemoData({ empty: true })
})

afterEach(async function () {
  return this.currentTest.sequelize.close()
})

const testNext = process.env.REALWORLD_TEST_NEXT === 'true'

// https://stackoverflow.com/questions/6048504/synchronous-request-in-node-js/53338670#53338670
function sendJsonHttp(opts) {
  return new Promise((resolve, reject) => {
    try {
      let body
      if (opts.body) {
        body = JSON.stringify(opts.body)
      } else {
        body = ''
      }
      const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Accept: 'application/json',
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
      const req = http.request(options, (res) => {
        res.on('data', (data) => {
          let dataString
          let ret
          try {
            dataString = data.toString()
            if (res.headers['content-type'].startsWith('application/json;')) {
              ret = JSON.parse(dataString)
            } else {
              ret = dataString
            }
            resolve([res, ret])
          } catch (e) {
            console.error({ dataString })
            reject(e)
          }
        })
        // We need this as there is no 'data' event empty reply, e.g. a DELETE 204.
        res.on('end', () => resolve([res, undefined]))
      })
      req.write(body)
      req.end()
    } catch (e) {
      reject(e)
    }
  })
}

it('feed shows articles by followers', async function () {
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
    sequelize: this.test.sequelize,
    nUsers: 4,
    nArticlesPerUser: 3,
    nFollowsPerUser: 2,
  })

  const user0 = await sequelize.models.User.findOne({
    where: { username: 'user0' },
  })

  // getArticlesByFollowedAndCount
  const { count, rows } = await user0.findAndCountArticlesByFollowed(1, 4)
  //assert.strictEqual(user0ArticlesByFollowed[].title, 'My title 10')
  assert.strictEqual(rows[0].title, 'My title 9')
  assert.strictEqual(rows[1].title, 'My title 6')
  assert.strictEqual(rows[2].title, 'My title 5')
  assert.strictEqual(rows[3].title, 'My title 2')
  //assert.strictEqual(user0ArticlesByFollowed[4].title, 'My title 1')
  assert.strictEqual(rows.length, 4)
  assert.strictEqual(count, 6)
})

it('tags without articles are deleted automatically after their last article is deleted', async function () {
  const sequelize = this.test.sequelize
  const user = await sequelize.models.User.create(test_lib.makeUser(sequelize))
  const article0 = await sequelize.models.Article.create(
    test_lib.makeArticle(0, { authorId: user.id })
  )
  const article1 = await sequelize.models.Article.create(
    test_lib.makeArticle(1, { authorId: user.id })
  )
  const tag0 = await sequelize.models.Tag.create(test_lib.makeTag(0))
  const tag1 = await sequelize.models.Tag.create(test_lib.makeTag(1))
  await sequelize.models.ArticleTag.create({
    articleId: article0.id,
    tagId: tag0.id,
  })
  await sequelize.models.ArticleTag.create({
    articleId: article1.id,
    tagId: tag0.id,
  })
  await sequelize.models.ArticleTag.create({
    articleId: article1.id,
    tagId: tag1.id,
  })
  await article1.destroy2()
  let tags = await sequelize.models.Tag.findAll({ order: [['id', 'ASC']] })
  assert.strictEqual(tags[0].id, tag0.id)
  assert.strictEqual(tags.length, 1)
  await article0.destroy2()
  tags = await sequelize.models.Tag.findAll({ order: [['id', 'ASC']] })
  assert.strictEqual(tags.length, 0)
})

it('users can be deleted and deletion cascades to all relations', async function () {
  // This was failing previously because of cascading madness.
  // It is also interesting to see if article deletion will cascade into the
  // empty tag deletion hooks or not.
  const sequelize = this.test.sequelize
  const user = await sequelize.models.User.create(test_lib.makeUser(sequelize))
  const article0 = await sequelize.models.Article.create(
    test_lib.makeArticle(0, { authorId: user.id })
  )
  const article1 = await sequelize.models.Article.create(
    test_lib.makeArticle(1, { authorId: user.id })
  )
  await sequelize.models.Comment.create(
    test_lib.makeComment(article0.id, user.id, 0)
  )
  await sequelize.models.Comment.create(
    test_lib.makeComment(article0.id, user.id, 1)
  )
  const tag0 = await sequelize.models.Tag.create(test_lib.makeTag(0))
  const tag1 = await sequelize.models.Tag.create(test_lib.makeTag(1))
  await sequelize.models.ArticleTag.create({
    articleId: article0.id,
    tagId: tag0.id,
  })
  await sequelize.models.ArticleTag.create({
    articleId: article1.id,
    tagId: tag0.id,
  })
  await sequelize.models.ArticleTag.create({
    articleId: article1.id,
    tagId: tag1.id,
  })
  await user.destroy()
  assert.strictEqual(await sequelize.models.User.count(), 0)
  assert.strictEqual(await sequelize.models.Article.count(), 0)
  assert.strictEqual(await sequelize.models.Tag.count(), 0)
  assert.strictEqual(await sequelize.models.Comment.count(), 0)
})

it('api: create an article and see it on global feed', async () => {
  await testApp(
    async (server) => {
      let res,
        data,
        article

        // Create user.
      ;[res, data] = await sendJsonHttp({
        server,
        method: 'POST',
        path: '/api/users',
        body: { user: test_lib.makeUser() },
      })
      assert.strictEqual(res.statusCode, 200)
      const token = data.user.token
      assert.strictEqual(data.user.username, 'user0')

      // Create article.
      article = test_lib.makeArticle(0, { api: true })
      article.tagList = ['tag0', 'tag1']
      ;[res, data] = await sendJsonHttp({
        server,
        method: 'POST',
        path: '/api/articles',
        body: { article },
        token,
      })
      assert.strictEqual(res.statusCode, 200)
      article = data.article
      assert.strictEqual(article.title, 'My title 0')

      // See it on global feed.
      ;[res, data] = await sendJsonHttp({
        server,
        method: 'GET',
        path: '/api/articles',
        token,
      })
      assert.strictEqual(res.statusCode, 200)
      assert.strictEqual(data.articles[0].title, 'My title 0')
      assert.strictEqual(data.articles[0].author.username, 'user0')
      assert.strictEqual(data.articlesCount, 1)

      // Next.js test
      if (testNext) {
        // See it on global feed.
        ;[res, data] = await sendJsonHttp({
          server,
          method: 'GET',
          path: '/ssr',
          token,
        })
        assert.strictEqual(res.statusCode, 200)
      }

      // See the tags on the global feed.
      ;[res, data] = await sendJsonHttp({
        server,
        method: 'GET',
        path: '/api/tags',
        token,
      })
      assert.strictEqual(res.statusCode, 200)
      data.tags.sort()
      assert.strictEqual(data.tags[0], 'tag0')
      assert.strictEqual(data.tags[1], 'tag1')
      assert.strictEqual(data.tags.length, 2)

      // Update article removing one tag and adding another.
      article.tagList = ['tag0', 'tag1']
      console.error('0')
      ;[res, data] = await sendJsonHttp({
        server,
        method: 'PUT',
        path: `/api/articles/${article.slug}`,
        body: {
          article: {
            title: 'My title 0 hacked',
            tagList: ['tag0', 'tag2'],
          },
        },
        token,
      })
      assert.strictEqual(res.statusCode, 200)
      assert.strictEqual(data.article.title, 'My title 0 hacked')

      // See it on global feed.
      ;[res, data] = await sendJsonHttp({
        server,
        method: 'GET',
        path: '/api/articles',
        token,
      })
      assert.strictEqual(data.articles[0].title, 'My title 0 hacked')
      assert.strictEqual(data.articles[0].author.username, 'user0')
      assert.strictEqual(data.articlesCount, 1)

      // See the tags on the global feed. tag1 should not exist anymore,
      // since the article was the only one that contained it, and it was
      // removed from the article.
      ;[res, data] = await sendJsonHttp({
        server,
        method: 'GET',
        path: '/api/tags',
        token,
      })
      assert.strictEqual(res.statusCode, 200)
      data.tags.sort()
      assert.strictEqual(data.tags[0], 'tag0')
      assert.strictEqual(data.tags[1], 'tag2')
      assert.strictEqual(data.tags.length, 2)

      // Delete article
      ;[res, data] = await sendJsonHttp({
        server,
        method: 'DELETE',
        path: `/api/articles/${article.slug}`,
        token,
      })
      assert.strictEqual(res.statusCode, 204)

      // Global feed now empty.
      ;[res, data] = await sendJsonHttp({
        server,
        method: 'GET',
        path: '/api/articles',
        token,
      })
      assert.strictEqual(data.articles.length, 0)
      assert.strictEqual(data.articlesCount, 0)
    },
    { canTestNext: true }
  )
})
