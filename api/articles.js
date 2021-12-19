const router = require('express').Router()
const auth = require('../auth')
const { Op, Transaction } = require('sequelize')

const config = require('../config.js')
const lib = require('../lib.js')

// https://stackoverflow.com/questions/14382725/how-to-get-the-correct-ip-address-of-a-client-into-a-node-socket-io-app-hosted-o/14382990#14382990
function getClientIp(req) {
  var ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  var forwardedIpsStr = req.header('x-forwarded-for');
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

async function setArticleTags(req, article, tagList, transaction) {
  const tags = await req.app.get('sequelize').models.Tag.bulkCreate(
    tagList.map(tag => {return {name: tag}}),
    {ignoreDuplicates: true}
  )
  // IDs may be missing from the above, so we have to do a find.
  // https://github.com/sequelize/sequelize/issues/11223#issuecomment-864185973
  const tags2 = await req.app.get('sequelize').models.Tag.findAll({
    where: {name: tagList}
  })
  return article.setTags(tags2, {transaction: transaction})
}

function validateArticle(req, res, article, tagList) {
  let ret;
  if (typeof tagList !== 'undefined') {
    if (config.isDemo) {
      if (tagList.length > 10) {
        ret = `too many tags: ${tagList.length}`;
      }
      for (tag of tagList) {
        if (config.blacklistTags.has(tag.toLowerCase())) {
          ret = `blacklisted tag: ${tag}`;
        }
      }
    }
  }
  if (ret) {
    console.log(`${ret} ${getClientIp(req)}`);
    return res.sendStatus(422)
  }
  return ret;
}

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
    const limit = lib.validateParam(req.query, 'limit', lib.validatePositiveInteger, 20)
    const offset = lib.validateParam(req.query, 'offset', lib.validatePositiveInteger, 0)
    const authorInclude = {
      model: req.app.get('sequelize').models.User,
      as: 'author',
    }
    if (req.query.author) {
      authorInclude.where = {username: req.query.author}
    }
    const include = [authorInclude]
    if (req.query.favorited) {
      include.push({
        model: req.app.get('sequelize').models.User,
        as: 'favoritedBy',
        where: {username: req.query.favorited},
      })
    }
    if (req.query.tag) {
      include.push({
        model: req.app.get('sequelize').models.Tag,
        as: 'tags',
        where: {name: req.query.tag},
      })
    }
    const [{count: articlesCount, rows: articles}, user] = await Promise.all([
      req.app.get('sequelize').models.Article.findAndCountAll({
        where: query,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include,
      }),
      req.payload ? req.app.get('sequelize').models.User.findByPk(req.payload.id) : null
    ])
    return res.json({
      articles: await Promise.all(articles.map(function(article) {
        return article.toJson(user)
      })),
      articlesCount: articlesCount
    })
  } catch(error) {
    next(error);
  }
})

router.get('/feed', auth.required, async function(req, res, next) {
  try {
    const limit = lib.validateParam(req.query, 'limit', lib.validatePositiveInteger, 20)
    const offset = lib.validateParam(req.query, 'offset', lib.validatePositiveInteger, 0)
    const user = await req.app.get('sequelize').models.User.findByPk(req.payload.id);
    if (!user) {
      return res.sendStatus(401)
    }
    const {count: articlesCount, rows: articles} = await user.findAndCountArticlesByFollowed(offset, limit)
    const articlesJson = await Promise.all(articles.map(article => {
      return article.toJson(user)
    }))
    return res.json({
      articles: articlesJson,
      articlesCount: articlesCount,
    })
  } catch(error) {
    next(error);
  }
})

// Create article
router.post('/', auth.required, async function(req, res, next) {
  try {
    const user = await req.app.get('sequelize').models.User.findByPk(req.payload.id);
    if (!user) {
      return res.sendStatus(401)
    }
    let article = new (req.app.get('sequelize').models.Article)(req.body.article)
    article.authorId = user.id
    const tagList = req.body.article.tagList
    if (validateArticle(req, res, article, tagList)) return
    //await article.save()
    //await setArticleTags(req, article, tagList)
    await req.app.get('sequelize').transaction(
      Transaction.ISOLATION_LEVELS.SERIALIZABLE,
      async t => {
        await Promise.all([
          article.save({ transaction: t }),
          setArticleTags(req, article, tagList, t),
        ])
      }
    )
    await Promise.all([
      lib.deleteOldestForDemo(req.app.get('sequelize').models.Article),
      lib.deleteOldestForDemo(req.app.get('sequelize').models.Tag),
      // TODO does not have a ID, and I can't find how to do IN check with
      // (tagId, articleId) tuples in sequelize, and lazy to add ID.
      //lib.deleteOldestForDemo(req.app.get('sequelize').models.ArticleTag),
    ])
    article.author = user
    return res.json({ article: await article.toJson(user) })
  } catch(error) {
    next(error);
  }
})

// Get article
router.get('/:article', auth.optional, async function(req, res, next) {
  try {
    const results = await Promise.all([
      req.payload ? req.app.get('sequelize').models.User.findByPk(req.payload.id) : null,
      req.article.getAuthor()
    ]);
    const [user, author] = results
    return res.json({ article: await req.article.toJson(user) })
  } catch(error) {
    next(error);
  }
})

// Update article
router.put('/:article', auth.required, async function(req, res, next) {
  try {
    const user = await req.app.get('sequelize').models.User.findByPk(req.payload.id);
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
      const article = req.article
      const tagList = req.body.article.tagList
      if (validateArticle(req, res, article, tagList)) return
      await req.app.get('sequelize').transaction(
        Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        async t => {
          await Promise.all([
            (typeof tagList === 'undefined')
              ? null
              : setArticleTags(req, article, tagList, t),
            article.save({ transaction: t })
          ])
        }
      )
      return res.json({ article: await article.toJson(user) })
    } else {
      return res.sendStatus(403)
    }
  } catch(error) {
    next(error);
  }
})

// Delete article
router.delete('/:article', auth.required, async function(req, res, next) {
  try {
    const user = req.app.get('sequelize').models.User.findByPk(req.payload.id)
    if (!user) {
      return res.sendStatus(401)
    }
    if (req.article.author.id.toString() === req.payload.id.toString()) {
      await req.article.destroy2()
      return res.sendStatus(204)
    } else {
      return res.sendStatus(403)
    }
  } catch(error) {
    next(error);
  }
})

// Favorite an article
router.post('/:article/favorite', auth.required, async function(req, res, next) {
  try {
    const articleId = req.article.id
    const [user, article] = await Promise.all([
      req.app.get('sequelize').models.User.findByPk(req.payload.id),
      req.app.get('sequelize').models.Article.findByPk(articleId),
    ])
    if (!user) {
      return res.sendStatus(401)
    }
    if (!article) {
      return res.sendStatus(404)
    }
    await user.addFavorite(articleId)
    // TODO same as ArticleTag
    //await lib.deleteOldestForDemo(req.app.get('sequelize').models.UserFavoriteArticle)
    return res.json({ article: await article.toJson(user) })
  } catch(error) {
    next(error);
  }
})

// Unfavorite an article
router.delete('/:article/favorite', auth.required, async function(req, res, next) {
  try {
    const articleId = req.article.id
    const [user, article] = await Promise.all([
      req.app.get('sequelize').models.User.findByPk(req.payload.id),
      req.app.get('sequelize').models.Article.findByPk(articleId),
    ])
    if (!user) {
      return res.sendStatus(401)
    }
    if (!article) {
      return res.sendStatus(404)
    }
    await user.removeFavorite(articleId)
    return res.json({ article: await article.toJson(user) })
  } catch(error) {
    next(error);
  }
})

// Return an article's comments
router.get('/:article/comments', auth.optional, async function(req, res, next) {
  try {
    let user;
    if (req.payload) {
      user = await req.app.get('sequelize').models.User.findByPk(req.payload.id)
    } else {
      user = null
    }
    const comments = await req.article.getComments({
      order: [['createdAt', 'DESC']],
      include: [{ model: req.app.get('sequelize').models.User, as: 'author' }],
    })
    return res.json({
      comments: await Promise.all(comments.map(function(comment) {
        return comment.toJson(user)
      }))
    })
  } catch(error) {
    next(error);
  }
})

// Create a new comment
router.post('/:article/comments', auth.required, async function(req, res, next) {
  try {
    const user = await req.app.get('sequelize').models.User.findByPk(req.payload.id)
    if (!user) {
      return res.sendStatus(401)
    }
    const comment = await req.app.get('sequelize').models.Comment.create(
      Object.assign({}, req.body.comment, { articleId: req.article.id, authorId: user.id })
    )
    await lib.deleteOldestForDemo(req.app.get('sequelize').models.Comment)
    comment.author = user
    return res.json({ comment: await comment.toJson(user) })
  } catch(error) {
    next(error);
  }
})

// Delete a comment
router.delete('/:article/comments/:comment', auth.required, async function(req, res, next) {
  try {
    const author = await req.comment.getAuthor()
    if (author.id.toString() === req.payload.id.toString()) {
      await req.comment.destroy()
      return res.sendStatus(204)
    } else {
      res.sendStatus(403)
    }
  } catch(error) {
    next(error);
  }
})

module.exports = router
