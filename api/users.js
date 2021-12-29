const router = require('express').Router()
const passport = require('passport')

const auth = require('../auth')
const lib = require('../lib')

router.get('/user', auth.required, async function (req, res, next) {
  try {
    const user = await req.app
      .get('sequelize')
      .models.User.findByPk(req.payload.id)
    if (!user) {
      return res.sendStatus(401)
    }
    return res.json({ user: user.toAuthJSON() })
  } catch (error) {
    next(error)
  }
})

router.put('/user', auth.required, async function (req, res, next) {
  try {
    const user = await req.app
      .get('sequelize')
      .models.User.findByPk(req.payload.id)
    if (!user) {
      return res.sendStatus(401)
    }
    if (req.body.user) {
      // Only update fields that were actually passed.
      if (typeof req.body.user.username !== 'undefined') {
        user.username = req.body.user.username
      }
      if (typeof req.body.user.email !== 'undefined') {
        user.email = req.body.user.email
      }
      if (typeof req.body.user.bio !== 'undefined') {
        user.bio = req.body.user.bio
      }
      if (typeof req.body.user.image !== 'undefined') {
        user.image = req.body.user.image
      }
      if (typeof req.body.user.password !== 'undefined') {
        req.app
          .get('sequelize')
          .models.User.setPassword(user, req.body.user.password)
      }
      await user.save()
    }
    return res.json({ user: user.toAuthJSON() })
  } catch (error) {
    next(error)
  }
})

router.post('/users/login', function (req, res, next) {
  if (!req.body.user) {
    return res.status(422).json({ errors: { user: "can't be blank" } })
  }
  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: "can't be blank" } })
  }
  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "can't be blank" } })
  }
  passport.authenticate(
    'local',
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err)
      }
      if (user) {
        user.token = user.generateJWT()
        return res.json({ user: user.toAuthJSON() })
      } else {
        return res.status(422).json(info)
      }
    }
  )(req, res, next)
})

router.post('/users', async function (req, res, next) {
  try {
    let user = new (req.app.get('sequelize').models.User)()
    if (!req.body.user) {
      return res.status(422).json({ errors: { user: "can't be blank" } })
    }
    if (!req.body.user.password) {
      return res.status(422).json({ errors: { password: "can't be blank" } })
    }
    user.username = req.body.user.username
    user.email = req.body.user.email
    user.ip = lib.getClientIp(req)
    req.app
      .get('sequelize')
      .models.User.setPassword(user, req.body.user.password)
    await user.save()
    await lib.deleteOldestForDemo(req.app.get('sequelize').models.User)
    return res.json({ user: user.toAuthJSON() })
  } catch (error) {
    next(error)
  }
})

module.exports = router
