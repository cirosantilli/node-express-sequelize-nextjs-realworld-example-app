const Sequelize = require('sequelize')
const config = require('../config')
const sequelize = new Sequelize(config.sql, {
  operatorsAliases: false,
  logging: config.verbose ? console.log : false
})
const db = {}

db.Article = sequelize.import('./article')
db.Comment = sequelize.import('./comment')
db.User = sequelize.import('./user')

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate()
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

sequelize.sync({ force: !config.isProduction })

module.exports = db
