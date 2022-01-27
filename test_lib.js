/// Need a separate file from test.js because Mocha automatically defines stuff like it,
// which would break non-Mocha requirers.

const perf_hooks = require('perf_hooks')

const models = require('./models')

const now = perf_hooks.performance.now

// https://stackoverflow.com/questions/563406/add-days-to-javascript-date
function addDays(oldDate, days) {
  const newDate = new Date(oldDate.valueOf())
  newDate.setDate(oldDate.getDate() + days)
  return newDate
}
const DATE0 = new Date(2000, 0, 0, 0, 0, 0, 0)

function makeComment(articleId, authorId, i) {
  return {
    body: `my comment ${i}`,
    articleId,
    authorId,
  }
}
exports.makeComment = makeComment

function makeArticle(i = 0, opts) {
  let ret = {
    title: `My title ${i}`,
    description: `My description ${i}`,
    body: `# h1

## h2

### h3

#### h4

##### h5

###### h6

*Italic*

**Bold**

[Link](http://example.com)

Code block:

    function myFunc() {
      return 1;
    }

Block quote:

> To be or not to be.
>
> That is the question.

List:

- item 1
- item 2
- item 3
`,
  }
  if (!opts.api) {
    const date = opts.date === undefined ? DATE0 : opts.date
    Object.assign(ret, {
      authorId: opts.authorId,
      createdAt: date,
      updatedAt: date,
    })
  }
  return ret
}
exports.makeArticle = makeArticle

function makeTag(i) {
  return { name: `tag${i}` }
}
exports.makeTag = makeTag

function makeUser(sequelize, i = 0) {
  const userArg = {
    username: `user${i}`,
    email: `user${i}@mail.com`,
  }
  if (i % 2 === 0) {
    userArg.bio = `My bio ${i}`
  }
  const password = 'asdf'
  if (sequelize) {
    sequelize.models.User.setPassword(userArg, password)
  } else {
    userArg.password = password
  }
  return userArg
}
exports.makeUser = makeUser

let printTimeNow
function printTime() {
  const newNow = now()
  console.error((newNow - printTimeNow) / 1000.0)
  printTimeNow = newNow
}

async function generateDemoData(params) {
  const nUsers = params.nUsers === undefined ? 10 : params.nUsers
  const nArticlesPerUser =
    params.nArticlesPerUser === undefined ? 10 : params.nArticlesPerUser
  const nMaxCommentsPerArticle =
    params.nMaxCommentsPerArticle === undefined
      ? 3
      : params.nMaxCommentsPerArticle
  const nMaxTagsPerArticle =
    params.nMaxTagsPerArticle === undefined ? 3 : params.nMaxTagsPerArticle
  const nFollowsPerUser =
    params.nFollowsPerUser === undefined ? 2 : params.nFollowsPerUser
  const nFavoritesPerUser =
    params.nFavoritesPerUser === undefined ? 5 : params.nFavoritesPerUser
  const nTags = params.nTags === undefined ? 10 : params.nTags
  const directory = params.directory
  const basename = params.basename
  const verbose = params.verbose === undefined ? false : params.verbose

  const nArticles = nUsers * nArticlesPerUser

  let sequelize
  if (params.sequelize) {
    sequelize = params.sequelize
  } else {
    sequelize = models.getSequelize(directory, basename)
  }
  await models.sync(sequelize, { force: true })
  if (!params.empty) {
    printTimeNow = now()
    if (verbose) console.error('User')
    const userArgs = []
    for (let i = 0; i < nUsers; i++) {
      userArgs.push(makeUser(sequelize, i))
    }
    const users = await sequelize.models.User.bulkCreate(userArgs)
    if (verbose) printTime()

    if (verbose) console.error('UserFollowUser')
    const followArgs = []
    for (let i = 0; i < nUsers; i++) {
      const userId = users[i].id
      for (let j = 0; j < nFollowsPerUser; j++) {
        followArgs.push({
          userId: userId,
          followId: users[(i + 1 + j) % nUsers].id,
        })
      }
    }
    await sequelize.models.UserFollowUser.bulkCreate(followArgs)
    if (verbose) printTime()

    if (verbose) console.error('Article')
    const articleArgs = []
    for (let i = 0; i < nArticles; i++) {
      const userIdx = i % nUsers
      const date = addDays(DATE0, i)
      articleArgs.push(makeArticle(i, { authorId: users[userIdx].id, date }))
    }
    const articles = await sequelize.models.Article.bulkCreate(articleArgs, {
      validate: true,
      individualHooks: true,
    })
    if (verbose) printTime()

    if (verbose) console.error('UserFavoriteArticle')
    let articleIdx = 0
    const favoriteArgs = []
    for (let i = 0; i < nUsers; i++) {
      const userId = users[i].id
      for (let j = 0; j < nFavoritesPerUser; j++) {
        favoriteArgs.push({
          userId: userId,
          articleId: articles[articleIdx % nArticles].id,
        })
        articleIdx += 1
      }
    }
    await sequelize.models.UserFavoriteArticle.bulkCreate(favoriteArgs)
    if (verbose) printTime()

    if (verbose) console.error('Tag')
    const tagArgs = []
    for (let i = 0; i < nTags; i++) {
      tagArgs.push(makeTag(i))
    }
    const tags = await sequelize.models.Tag.bulkCreate(tagArgs)
    if (verbose) printTime()

    if (verbose) console.error('ArticleTag')
    let tagIdx = 0
    const articleTagArgs = []
    for (let i = 0; i < nArticles; i++) {
      for (let j = 0; j < i % (nMaxTagsPerArticle + 1); j++) {
        articleTagArgs.push({
          articleId: articles[i].id,
          tagId: tags[tagIdx % nTags].id,
        })
        tagIdx += 1
      }
    }
    await sequelize.models.ArticleTag.bulkCreate(articleTagArgs)
    if (verbose) printTime()

    if (verbose) console.error('Comment')
    const commentArgs = []
    let commentIdx = 0
    for (let i = 0; i < nArticles; i++) {
      for (let j = 0; j < i % (nMaxCommentsPerArticle + 1); j++) {
        commentArgs.push(
          makeComment(articles[i].id, users[commentIdx % nUsers].id, commentIdx)
        )
      }
    }
    await sequelize.models.Comment.bulkCreate(commentArgs)
    if (verbose) printTime()
  }

  return sequelize
}
exports.generateDemoData = generateDemoData
