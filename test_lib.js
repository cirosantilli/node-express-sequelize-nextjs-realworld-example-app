/// Need a separate file from test.js because Mocha automatically defines stuff like it,
// which would break non-Mocha requirers.

const path = require('path')

const models = require('./models')

function addDays(oldDate, days) {
  const newDate = new Date(oldDate.valueOf());
  newDate.setDate(oldDate.getDate() + days);
  return newDate;
}
const date0 = new Date(2000, 0, 0, 0, 0, 0, 0)

async function generateDemoData(params) {
  const nUsers = params.nUsers === undefined ? 10 : params.nUsers
  const nArticlesPerUser = params.nArticlesPerUser === undefined ? 10 : params.nArticlesPerUser
  const nFollowsPerUser = params.nFollowsPerUser === undefined ? 2 : params.nFollowsPerUser
  const nFavoritesPerUser = params.nFavoritesPerUser === undefined ? 5 : params.nFavoritesPerUser
  const nTags = params.nTags === undefined ? 10 : params.nTags
  const directory = params.directory
  const basename = params.basename

  const nArticles = nUsers * nArticlesPerUser

  const sequelize = models(directory, basename);
  await sequelize.sync({force: true})

  // Users
  const userArgs = [];
  for (var i = 0; i < nUsers; i++) {
    const userArg = {
      'username': `user${i}`,
      'email': `user${i}@mail.com`,
    }
    sequelize.models.User.setPassword(userArg, 'asdf')
    userArgs.push(userArg)
  }
  const users = await sequelize.models.User.bulkCreate(userArgs)

  // Follows
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

  // Articles
  const articleArgs = [];
  for (var i = 0; i < nArticles; i++) {
    const userIdx = i % nUsers
    const date = addDays(date0, i)
    const articleArg = {
      title: `My title ${i}`,
      description: `My description ${i}`,
      body: `My **body** ${i}`,
      authorId: users[userIdx].id,
      createdAt: date,
      updatedAt: date,
    }
    articleArgs.push(articleArg)
  }
  const articles = await sequelize.models.Article.bulkCreate(
    articleArgs,
    {
      validate: true,
      individualHooks: true,
    }
  )

  // Favorites
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

  // Tags
  const tagArgs = []
  for (var i = 0; i < nTags; i++) {
    tagArgs.push({name: `tag${i}`})
  }
  const tags = await sequelize.models.Tag.bulkCreate(tagArgs)

  // ArticleTags
  let tagIdx = 0
  const articleTagArgs = []
  for (var i = 0; i < nArticles; i++) {
    const articleId = articles[i].id
    for (var j = 0; j < 2; j++) {
      articleTagArgs.push({
        articleId: articles[i].id,
        tagId: tags[tagIdx % nTags].id,
      })
      tagIdx += 1
    }
  }
  await sequelize.models.ArticleTag.bulkCreate(articleTagArgs)

  return sequelize
}
exports.generateDemoData = generateDemoData
