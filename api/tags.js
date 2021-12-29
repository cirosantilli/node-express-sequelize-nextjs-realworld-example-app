const router = require('express').Router()

const lib = require('../lib')

// return a list of tags
router.get('/', async function (req, res, next) {
  try {
    return res.json({ tags: await lib.getIndexTags(req.app.get('sequelize')) })
  } catch (error) {
    next(error)
  }
})

module.exports = router
