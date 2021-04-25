const http = require('http')
const path = require('path')
const methods = require('methods')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')
const passport = require('passport')
const errorhandler = require('errorhandler')

const model = require('./models')
const config = require('./config')
// Create global app object
const app = express()

require('./config/passport')

app.use(cors())

// Normal express config defaults
if (config.verbose) {
  app.use(require('morgan')('dev'))
}
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(require('method-override')())
app.use(express.static(path.join(__dirname, 'react-redux-realworld-example-app', 'build')))

app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }))

if (!config.isProduction) {
  app.use(errorhandler())
}

app.use(require('./routes'))

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

/// error handlers

// development error handler
// will print stacktrace
if (!config.isProduction) {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)

    res.json({
      errors: {
        message: err.stack,
        error: err
      }
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.json({
    errors: {
      message: err.message,
      error: {}
    }
  })
});

if (!module.parent) {
  (async () => {
    try {
      await model.sequelize.authenticate();
      await model.sequelize.sync();
      start();
    } catch (e) {
      console.error(e);
      process.exit(1)
    }
  })()
}

function start(cb) {
  const server = app.listen(config.port, function() {
    console.log('Backend listening on: http://localhost:' + config.port)
    cb && cb(server)
  })
}

module.exports = { app, start }
