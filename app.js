#!/usr/bin/env node

// https://stackoverflow.com/questions/7697038/more-than-10-lines-in-a-node-js-stack-error
Error.stackTraceLimit = Infinity

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const next = require('next')
const passport = require('passport')
const passport_local = require('passport-local')
const session = require('express-session')

const api = require('./api')
const lib = require('./lib')
const models = require('./models')
const config = require('./front/config')

/**
 * - port: 0 means find random empty port
 * - startNext: if false, don't start Next.js, run just the API
 **/
async function start(port, startNext, cb) {
  const app = express()
  let nextApp
  let nextHandle
  if (startNext) {
    nextApp = next({ dev: !config.isProductionNext })
    nextHandle = nextApp.getRequestHandler()
  }

  const sequelize = models.getSequelize(__dirname)
  app.set('sequelize', sequelize)
  passport.use(
    new passport_local.Strategy(
      {
        usernameField: 'user[email]',
        passwordField: 'user[password]',
      },
      function (email, password, done) {
        sequelize.models.User.findOne({ where: { email: email } })
          .then(function (user) {
            if (!user || !sequelize.models.User.validPassword(user, password)) {
              return done(null, false, {
                errors: { 'email or password': 'is invalid' },
              })
            }
            return done(null, user)
          })
          .catch(done)
      }
    )
  )
  app.use(cors())

  // Normal express config defaults
  if (config.verbose) {
    // https://stackoverflow.com/questions/42099925/logging-all-requests-in-node-js-express/64668730#64668730
    app.use(morgan('combined'))
  }
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(require('method-override')())

  // Next handles anything outside of /api.
  app.get(
    new RegExp(`^((?!${config.apiPath})|${config.apiPath}/preview)(/|$)`),
    function (req, res) {
      return nextHandle(req, res)
    }
  )
  app.use(
    session({
      secret: config.secret,
      cookie: { maxAge: 60000 },
      resave: false,
      saveUninitialized: false,
    })
  )

  // Handle API routes.
  {
    const router = express.Router()
    router.use(config.apiPath, api)
    app.use(router)
  }

  // 404 handler.
  app.use(function (req, res) {
    res.status(404).json('error: 404 Not Found')
  })

  // Error handlers
  app.use(function (err, req, res, next) {
    // Automatiaclly handle Sequelize validation errors.
    if (err instanceof sequelize.Sequelize.ValidationError) {
      if (!config.isProduction) {
        // The fuller errors can be helpful during development.
        console.error(err)
      }
      const errors = {}
      for (let errItem of err.errors) {
        let errorsForColumn = errors[errItem.path]
        if (errorsForColumn === undefined) {
          errorsForColumn = []
          errors[errItem.path] = errorsForColumn
        }
        errorsForColumn.push(errItem.message)
      }
      return res.status(422).json({ errors })
    } else if (err instanceof lib.ValidationError) {
      return res.status(err.status).json({
        errors: err.errors,
      })
    }
    return next(err)
  })

  if (startNext) {
    await nextApp.prepare()
  }
  await sequelize.authenticate()
  // Just a convenience DB create so we don't have to force new users to do it manually.
  await models.sync(sequelize)
  return new Promise((resolve, reject) => {
    const server = app.listen(port, async function () {
      try {
        cb && (await cb(server))
      } catch (e) {
        reject(e)
        this.close()
        throw e
      }
    })
    server.on('close', resolve)
  })
}

if (require.main === module) {
  start(config.port, true, (server) => {
    console.log('Listening on: http://localhost:' + server.address().port)
  })
}

module.exports = { start }
