/// Need a separate file from test.js because Mocha automatically defines stuff like it,
// which would break non-Mocha requirers.

const path = require('path')
const perf_hooks = require('perf_hooks')

const models = require('./models')

const now = perf_hooks.performance.now

// https://stackoverflow.com/questions/563406/add-days-to-javascript-date
function addDays(oldDate, days) {
  const newDate = new Date(oldDate.valueOf());
  newDate.setDate(oldDate.getDate() + days);
  return newDate;
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

function makeArticle(i=0, userId, date) {
  if (date === undefined) {
    date = DATE0
  }
  return {
    title: `My title ${i}`,
    description: `My description ${i}`,
    authorId: userId,
    createdAt: date,
    updatedAt: date,
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
}
exports.makeArticle = makeArticle

function makeTag(i) {
  return { name: `tag${i}` }
}
exports.makeTag = makeTag

function makeUser(sequelize, i=0) {
  const userArg = {
    username: `user${i}`,
    email: `user${i}@mail.com`,
  }
  if (i % 2 === 0) {
    userArg.bio = `My bio ${i}`
  }
  sequelize.models.User.setPassword(userArg, 'asdf')
  return userArg;
}
exports.makeUser = makeUser

let printTimeNow;
function printTime() {
  const newNow = now()
  console.error((newNow - printTimeNow)/1000.0)
  printTimeNow = newNow
}

async function generateDemoData(params) {
  const nUsers = params.nUsers === undefined ? 10 : params.nUsers
  const nArticlesPerUser = params.nArticlesPerUser === undefined ? 10 : params.nArticlesPerUser
  const nMaxCommentsPerArticle = params.nMaxCommentsPerArticle === undefined ? 3 : params.nMaxCommentsPerArticle
  const nMaxTagsPerArticle = params.nMaxTagsPerArticle === undefined ? 3 : params.nMaxTagsPerArticle
  const nFollowsPerUser = params.nFollowsPerUser === undefined ? 2 : params.nFollowsPerUser
  const nFavoritesPerUser = params.nFavoritesPerUser === undefined ? 5 : params.nFavoritesPerUser
  const nTags = params.nTags === undefined ? 10 : params.nTags
  const directory = params.directory
  const basename = params.basename

  const nArticles = nUsers * nArticlesPerUser

  const sequelize = models.getSequelize(directory, basename);
  await models.sync(sequelize, { force: true })

  printTimeNow = now()
  console.error('User');
  const userArgs = [];
  for (var i = 0; i < nUsers; i++) {
    userArgs.push(makeUser(sequelize, i))
  }
  const users = await sequelize.models.User.bulkCreate(userArgs)
  printTime()

  console.error('UserFollowUser');
  const followArgs = []
  for (var i = 0; i < nUsers; i++) {
    const userId = users[i].id
    for (var j = 0; j < nFollowsPerUser; j++) {
      followArgs.push({
        userId: userId,
        followId: users[(i + 1 + j) % nUsers].id,
      })
    }
  }
  await sequelize.models.UserFollowUser.bulkCreate(followArgs)
  printTime()

  console.error('Article');
  const articleArgs = [];
  for (var i = 0; i < nArticles; i++) {
    const userIdx = i % nUsers
    const date = addDays(DATE0, i)
    articleArgs.push(makeArticle(i, users[userIdx].id, date))
  }
  const articles = await sequelize.models.Article.bulkCreate(
    articleArgs,
    {
      validate: true,
      individualHooks: true,
    }
  )
  printTime()

  console.error('UserFavoriteArticle');
  let articleIdx = 0
  const favoriteArgs = []
  for (var i = 0; i < nUsers; i++) {
    const userId = users[i].id
    for (var j = 0; j < nFavoritesPerUser; j++) {
      favoriteArgs.push({
        userId: userId,
        articleId: articles[articleIdx % nArticles].id,
      })
      articleIdx += 1
    }
  }
  await sequelize.models.UserFavoriteArticle.bulkCreate(favoriteArgs)
  printTime()

  console.error('Tag');
  const tagArgs = []
  for (var i = 0; i < nTags; i++) {
    tagArgs.push(makeTag(i))
  }
  const tags = await sequelize.models.Tag.bulkCreate(tagArgs)
  printTime()

  console.error('ArticleTag');
  let tagIdx = 0
  const articleTagArgs = []
  for (var i = 0; i < nArticles; i++) {
    for (var j = 0; j < (i % (nMaxTagsPerArticle + 1)); j++) {
      articleTagArgs.push({
        articleId: articles[i].id,
        tagId: tags[tagIdx % nTags].id,
      })
      tagIdx += 1
    }
  }
  await sequelize.models.ArticleTag.bulkCreate(articleTagArgs)
  printTime()

  console.error('Comment');
  const commentArgs = [];
  let commentIdx = 0;
  for (var i = 0; i < nArticles; i++) {
    for (var j = 0; j < (i % (nMaxCommentsPerArticle + 1)); j++) {
      commentArgs.push(makeComment(
        articles[i].id,
        users[commentIdx % nUsers].id,
        commentIdx
      ))
    }
  }
  const comments = await sequelize.models.Comment.bulkCreate(commentArgs)
  printTime()

  return sequelize
}
exports.generateDemoData = generateDemoData
