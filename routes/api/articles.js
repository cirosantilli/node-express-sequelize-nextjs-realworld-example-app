const router = require('express').Router()
const auth = require('../auth')
const Op = require('sequelize').Op

// Preload article objects on routes with ':article'
router.param('article', function(req, res, next, slug) {
  req.app.get('sequelize').models.Article.findOne({
    where: { slug: slug },
    include: [{ model: req.app.get('sequelize').models.User, as: 'author' }]
  })
    .then(function(article) {
      if (!article) {
        return res.sendStatus(404)
      }
      req.article = article
      return next()
    })
    .catch(next)
})

router.param('comment', function(req, res, next, id) {
  req.app.get('sequelize').models.Comment.findOne({
    where: { id: id },
    include: [{ model: req.app.get('sequelize').models.User, as: 'author' }],
  })
    .then(function(comment) {
      if (!comment) {
        return res.sendStatus(404)
      }
      req.comment = comment
      return next()
    })
    .catch(next)
})

router.get('/', auth.optional, async function(req, res, next) {
  try {
    let query = {}
    let limit = 20
    let offset = 0
    if (typeof req.query.limit !== 'undefined') {
      limit = req.query.limit
    }
    if (typeof req.query.offset !== 'undefined') {
      offset = req.query.offset
    }
    if (typeof req.query.tag !== 'undefined') {
      query.tagList = { [Op.like]: req.query.tag + ',%' }
    }
    const results = await Promise.all([
      req.query.author ? req.app.get('sequelize').models.User.findOne({ where: { username: req.query.author } }) : null,
      req.query.favorited ? req.app.get('sequelize').models.User.findOne({ where: { username: req.query.favorited } }) : null
    ])
    let author = results[0]
    let favoriter = results[1]
    if (author) {
      query.author_id = author.id
    }
    if (favoriter) {
      query.id = { [Op.in]: favoriter.favorites }
    } else if (req.query.favorited) {
      query.id = { [Op.in]: [] }
    }
    const results2 = await Promise.all([
      req.app.get('sequelize').models.Article.findAll({
        where: query,
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset: Number(offset),
        include: [{ model: req.app.get('sequelize').models.User, as: 'author' }]
      }),
      req.app.get('sequelize').models.Article.count({ where: query }),
      req.payload ? req.app.get('sequelize').models.User.findByPk(req.payload.id) : null
    ])
    let articles = results2[0]
    let articlesCount = results2[1]
    let user = results2[2]
    return res.json({
      articles: await Promise.all(articles.map(function(article) {
        return article.toJSONFor(user)
      })),
      articlesCount: articlesCount
    })
  } catch(error) {
    next(error);
  }
})

router.get('/feed', auth.required, async function(req, res, next) {
  try {
    let limit = 20
    let offset = 0
    if (typeof req.query.limit !== 'undefined') {
      limit = req.query.limit
    }
    if (typeof req.query.offset !== 'undefined') {
      offset = req.query.offset
    }
    const user = await req.app.get('sequelize').models.User.findByPk(req.payload.id);
    if (!user) {
      return res.sendStatus(401)
    }
    const results = await Promise.all([
      user.getArticlesByFollowed(Number(offset), Number(limit))
    ])
    let articles = results[0]
    let articlesCount = results[1]
    const articlesJson = await Promise.all(articles.map(function(article) {
      return article.toJSONFor(article.author)
    }))
    return res.json({
      articles: articlesJson,
      articlesCount: articlesCount,
    })
  } catch(error) {
    next(error);
  }
})

router.post('/', auth.required, async function(req, res, next) {
  try {
    const user = req.app.get('sequelize').models.User.findByPk(req.payload.id);
    if (!user) {
      return res.sendStatus(401)
    }
    let article = new (req.app.get('sequelize').models.Article)(req.body.article)
    article.authorId = user.id
    await article.save()
    article.author = user
    return res.json({ article: await article.toJSONFor(user) })
  } catch(error) {
    next(error);
  }
})

// return a article
router.get('/:article', auth.optional, async function(req, res, next) {
  try {
    const results = Promise.all([req.payload ? req.app.get('sequelize').models.User.findByPk(req.payload.id) : null, req.article.getAuthor()]);
    let [user, author] = results
    return res.json({ article: await req.article.toJSONFor(user) })
  } catch(error) {
    next(error);
  }
})

// update article
router.put('/:article', auth.required, async function(req, res, next) {
  try {
    const user = req.app.get('sequelize').models.User.findByPk(req.payload.id);
    if (req.article.authorId.toString() === req.payload.id.toString()) {
      if (typeof req.body.article.title !== 'undefined') {
        req.article.title = req.body.article.title
      }
      if (typeof req.body.article.description !== 'undefined') {
        req.article.description = req.body.article.description
      }
      if (typeof req.body.article.body !== 'undefined') {
        req.article.body = req.body.article.body
      }
      if (typeof req.body.article.tagList !== 'undefined') {
        req.article.tagList = req.body.article.tagList
      }
      const article = await req.article.save()
      return res.json({ article: await article.toJSONFor(user) })
    } else {
      return res.sendStatus(403)
    }
  } catch(error) {
    next(error);
  }
})

// delete article
router.delete('/:article', auth.required, function(req, res, next) {
  req.app.get('sequelize').models.User.findByPk(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401)
      }

      if (req.article.author.id.toString() === req.payload.id.toString()) {
        return req.article.destroy().then(function() {
          return res.sendStatus(204)
        })
      } else {
        return res.sendStatus(403)
      }
    })
    .catch(next)
})

// Favorite an article
router.post('/:article/favorite', auth.required, async function(req, res, next) {
  try {
    const articleId = req.article.id
    const user = req.app.get('sequelize').models.User.findByPk(req.payload.id)
    if (!user) {
      return res.sendStatus(401)
    }
    await user.favorite(articleId)
    const article = await req.article.updateFavoriteCount()
    return res.json({ article: await article.toJSONFor(user) })
  } catch(error) {
    next(error);
  }
})

// Unfavorite an article
router.delete('/:article/favorite', auth.required, async function(req, res, next) {
  try {
    const articleId = req.article.id
    const user = req.app.get('sequelize').models.User.findByPk(req.payload.id)
    if (!user) {
      return res.sendStatus(401)
    }
    await user.unfavorite(articleId)
    const article = await req.article.updateFavoriteCount()
    return res.json({ article: await article.toJSONFor(user) })
  } catch(error) {
    next(error);
  }
})

// return an article's comments
router.get('/:article/comments', auth.optional, async function(req, res, next) {
  try {
    let user;
    if (req.payload) {
      user = await req.app.get('sequelize').models.User.findByPk(req.payload.id)
    } else {
      user = null
    }
    const comments = await req.article.getComments({
      order: [['created_at', 'DESC']],
      include: [{ model: req.app.get('sequelize').models.User, as: 'author' }],
    })
    return res.json({
      comments: await Promise.all(comments.map(function(comment) {
        return comment.toJSONFor(user)
      }))
    })
  } catch(error) {
    next(error);
  }
})

// create a new comment
router.post('/:article/comments', auth.required, async function(req, res, next) {
  try {
    const user = await req.app.get('sequelize').models.User.findByPk(req.payload.id)
    if (!user) {
      return res.sendStatus(401)
    }
    const comment = await req.app.get('sequelize').models.Comment.create(
      Object.assign({}, req.body.comment, { ArticleId: req.article.id, authorId: user.id })
    )
    comment.author = user
    res.json({ comment: await comment.toJSONFor(user) })
  } catch(error) {
    next(error);
  }
})

router.delete('/:article/comments/:comment', auth.required, function(req, res, next) {
  return req.comment
    .getAuthor()
    .then(function(author) {
      if (author.id.toString() === req.payload.id.toString()) {
        return req.comment.destroy().then(function() {
          res.sendStatus(204)
        })
      } else {
        res.sendStatus(403)
      }
    })
    .catch(next)
})

module.exports = router
