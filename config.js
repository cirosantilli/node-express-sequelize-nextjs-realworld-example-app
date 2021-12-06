let isProduction;
if (process.env.NODE_ENV_OVERRIDE === undefined) {
  isProduction = process.env.NODE_ENV === 'production'
} else {
  isProduction = process.env.NODE_ENV_OVERRIDE === 'production'
}

let demoMaxObjs;
if (isProduction) {
  demoMaxObjs = 1000
} else {
  demoMaxObjs = 10
}

module.exports = {
  apiPath: '/api',
  databaseUrl: process.env.DATABASE_URL || '',
  demoMaxObjs: demoMaxObjs,
  // If Sequelize were better, we would be able to do much more in individual complex queries.
  // But as things stand, we just have to bring data into memory and do secondary requests.
  maxObjsInMemory: 10000,
  googleAnalyticsId: 'UA-47867706-3',
  isDemo: process.env.NEXT_PUBLIC_DEMO === 'true',
  isProduction: isProduction,
  isProductionNext: process.env.NODE_ENV_NEXT === undefined ?
    (isProduction) :
    (process.env.NODE_ENV_NEXT === 'production'),
  port: process.env.PORT || 3000,
  // Makes deployment impossibly slow if there are lots of pages
  // like in a real-world production public website.
  prerenderAll: false,
  revalidate: 10,
  secret: isProduction ? process.env.SECRET : 'secret',
  verbose: process.env.VERBOSE,
  blacklistTags: new Set([
    'cypress',
  ]),

  // Used by sequelize-cli as well as our source code.
  development: {
    dialect: 'sqlite',
    logging: true,
    storage: 'db.sqlite3',
  },
  production: {
    url: process.env.DATABASE_URL || 'postgres://cirodown_user:a@localhost:5432/cirodown',
    dialect: 'postgres',
    dialectOptions: {
      // https://stackoverflow.com/questions/27687546/cant-connect-to-heroku-postgresql-database-from-local-node-app-with-sequelize
      // https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
      // https://stackoverflow.com/questions/58965011/sequelizeconnectionerror-self-signed-certificate
      ssl: {
        require: true,
        rejectUnauthorized: false,
      }
    },
    logging: true,
  }
}
