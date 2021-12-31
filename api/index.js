const router = require('express').Router()

// heroku bootstrap
router.get('/', function (req, res) {
  res.json({ message: 'backend is up' })
})
router.use('/', require('./users'))
router.use('/profiles', require('./profiles'))
router.use('/articles', require('./articles'))
router.use('/tags', require('./tags'))

module.exports = router
