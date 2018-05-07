const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const marked = require('marked')

const apiMdPath = path.resolve(__dirname, '../spec/api.md')

let indexCache

router.get('/', function(req, res, next) {
  if (!indexCache) {
    fs.readFile(apiMdPath, 'utf8', function(err, data) {
      if (err) {
        return res.end(err.message)
      }
      indexCache = marked(data)
      res.send(indexCache)
    })
  } else {
    res.send(indexCache)
  }
})

router.use('/api', require('./api'))

module.exports = router
