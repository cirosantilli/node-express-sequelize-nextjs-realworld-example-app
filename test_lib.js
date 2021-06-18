/// Need a separate file from test.js because Mocha automatically defines stuff like it,
// which would break non-Mocha requirers.

const path = require('path')

const models = require('./models')

async function generateDemoData(params) {
  const nUsers = params.nUsers === undefined ? 10 : params.nUsers
  const nArticlesPerUser = params.nArticlesPerUser === undefined ? 10 : params.nArticlesPerUser
  const nFollowsPerUser = params.nFollowsPerUser === undefined ? 2 : params.nFollowsPerUser
  const nFavoritesPerUser = params.nFavoritesPerUser === undefined ? 5 : params.nFavoritesPerUser
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
        UserId: userId,
        followId: users[(i + 1 + j) % nUsers].id,
      })
    }
  }
  await sequelize.models.UserFollowUser.bulkCreate(followArgs)

  // Articles
  const articleArgs = [];
  for (var i = 0; i < nArticles; i++) {
    const userIdx = i % nUsers
    const articleArg = {
      title: `My title ${i}`,
      description: `My description ${i}`,
      body: `My **body** ${i}`,
      authorId: users[userIdx].id,
      createdAt: new Date(2000 + i, 0, 1, 2, 3, 4, 5),
      updatedAt: new Date(2000 + i, 0, 1, 2, 3, 4, 5),
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
        UserId: userId,
        ArticleId: articles[(articleIdx + j) % nArticles].id,
      })
      articleIdx += 1
    }
  }
  await sequelize.models.UserFavoriteArticle.bulkCreate(favoriteArgs)

  return sequelize
}
exports.generateDemoData = generateDemoData
