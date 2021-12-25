const router = require('express').Router()

// return a list of tags
router.get('/', async function(req, res, next) {
  try {
    const tagList = (await req.app.get('sequelize').models.Tag.findAll({
      order: [['createdAt', 'DESC'], ['name', 'ASC']],
    })).map(tag => tag.name)
    return res.json({ tags: tagList })
  } catch(error) {
    next(error);
  }
})

module.exports = router
