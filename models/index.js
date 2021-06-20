const path = require('path')

const { Sequelize, DataTypes } = require('sequelize')

const config = require('../config')

module.exports = (toplevelDir, toplevelBasename) => {
  const sequelizeParams = {
    logging: config.verbose ? console.log : false
  };
  let sequelize;
  if (config.isProduction) {
    sequelizeParams.dialect = 'postgres';
    sequelizeParams.dialectOptions = {
      // https://stackoverflow.com/questions/27687546/cant-connect-to-heroku-postgresql-database-from-local-node-app-with-sequelize
      // https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
      // https://stackoverflow.com/questions/58965011/sequelizeconnectionerror-self-signed-certificate
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    };
    sequelize = new Sequelize(config.databaseUrl, sequelizeParams);
  } else {
    sequelizeParams.dialect = 'sqlite';
    let storage;
    if (toplevelDir === undefined) {
      storage = ':memory:';
    } else {
      if (toplevelBasename === undefined) {
        toplevelBasename = 'db.sqlite3';
      }
      storage = path.join(toplevelDir, toplevelBasename);
    }
    sequelizeParams.storage = storage;
    sequelize = new Sequelize(sequelizeParams);
  }
  const Article = require('./article')(sequelize)
  const Comment = require('./comment')(sequelize)
  const User = require('./user')(sequelize)
  const Tag = require('./tag')(sequelize)

  // Associations.

  // User follow user (super many to many)
  const UserFollowUser = sequelize.define('UserFollowUser', {
      UserId: {
        type: DataTypes.INTEGER,
        references: {
          model: User,
          key: 'id'
        }
      },
      followId: {
        type: DataTypes.INTEGER,
        references: {
          model: User,
          key: 'id'
        }
      },
    }
  );
  User.belongsToMany(User, {through: UserFollowUser, as: 'follows'});
  UserFollowUser.belongsTo(User)
  User.hasMany(UserFollowUser)

  // User favorite Article
  Article.belongsToMany(User, { through: 'UserFavoriteArticle', as: 'favoritedBy' });
  User.belongsToMany(Article, { through: 'UserFavoriteArticle', as: 'favorites' });

  // Article author User
  Article.belongsTo(User, {
    as: 'author',
    foreignKey: {
      name: 'authorId',
      allowNull: false
    }
  })
  User.hasMany(Article, {as: 'authoredArticles', foreignKey: 'authorId'})

  // Article has Comment
  Article.hasMany(Comment)
  Comment.belongsTo(Article, {
    foreignKey: {
      allowNull: false
    },
  })
  Comment.belongsTo(Article)

  // Comment author User
  Comment.belongsTo(User, {
    as: 'author',
    foreignKey: {
      allowNull: false
    },
  });
  User.hasMany(Comment);

  // Tag Article
  Article.belongsToMany(Tag, { through: 'ArticleTag', as: 'tags' });
  Tag.belongsToMany(Article, { through: 'ArticleTag', as: 'taggedArticles' });

  return sequelize;
}
