const path = require('path')
const fs = require('fs')

module.exports = {
  isProduction: process.env.NODE_ENV === 'production',
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
  sql: process.env.SQL_URI || prepareSQLite(),
  port: process.env.PORT || 3000,
  verbose: process.env.VERBOSE
}

function prepareSQLite() {
  let file = path.join(__dirname, '../db.sqlite3')
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '')
  }
  return `sqlite:${file}`
}
