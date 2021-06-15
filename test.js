const test_lib = require('./test_lib')

it('feed shows articles by followers', async ()=>{
  const sequelize = await test_lib.generateDemoData({
    nUsers: 3,
    nArticlesPerUser: 5,
    nArticlesPerUser: 5,
    nFollowsPerUser: 2,
  })
  const user1 = await sequelize.models.User.findByPk(1)
  console.error(await user1.getArticlesByFollowed());
  console.error(await user1.getArticleCountByFollowed());
  await sequelize.close()
})
