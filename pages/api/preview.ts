import sequelize from 'db'
import routes from 'front/routes'

export default async function handler(req, res) {
  let redirTo
  if (req.query.article) {
    const article = await sequelize.models.Article.findOne({
      where: { slug: req.query.article },
    })
    if (!article) {
      return res.status(401).json(`invalid article: ${req.query.article}`)
    }
    redirTo = routes.articleView(article.slug)
  } else if (req.query.user) {
    const user = await sequelize.models.User.findOne({
      where: { username: req.query.user },
    })
    if (!user) {
      return res.status(401).json(`invalid user: ${req.query.user}`)
    }
    redirTo = routes.userView(user.username)
  } else {
    return res.status(401).json('missing redirect argument')
  }
  res.setPreviewData({})
  res.redirect(redirTo)
}
