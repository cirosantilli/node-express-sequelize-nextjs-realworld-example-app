const test_lib = require('test_lib')

it('feed shows articles by followers', async ()=>{
  await test_lib.generateDemoData({
    nUsers: 3,
    nArticlesPerUser: 3,
    basename: 'db.test.sqlite3',
  })
  //assert.strictEqual(1, 1)
})
