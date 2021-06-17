const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const secret = require('../config').secret

const Sequelize = require('sequelize')
const { DataTypes } = Sequelize

module.exports = (sequelize) => {
  let User = sequelize.define(
    'User',
    {
      username: {
        type: DataTypes.STRING,
        set(v) {
          this.setDataValue('username', v.toLowerCase())
        },
        unique: {
          args: true,
          message: 'Username must be unique.'
        },
        validate: {
          min: {
            args: 3,
            msg: 'Username must start with a letter, have no spaces, and be at least 3 characters.'
          },
          max: {
            args: 40,
            msg: 'Username must start with a letter, have no spaces, and be at less than 40 characters.'
          },
          is: {
            args: /^[A-Za-z][A-Za-z0-9-_]+$/i, // must start with letter and only have letters, numbers, dashes
            msg: 'Username must start with a letter, have no spaces, and be 3 - 40 characters.'
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        set(v) {
          this.setDataValue('email', v.toLowerCase())
        },
        unique: {
          args: true,
          msg: 'Oops. Looks like you already have an account with this email address. Please try to login.'
        },
        validate: {
          isEmail: {
            args: true,
            msg: 'The email you entered is invalid or is already in our system.'
          },
          max: {
            args: 254,
            msg: 'The email you entered is invalid or longer than 254 characters.'
          }
        }
      },
      bio: DataTypes.STRING,
      image: DataTypes.STRING,
      hash: DataTypes.STRING(1024),
      salt: DataTypes.STRING
    },
    {
      underscored: true,
      tableName: 'users',
      indexes: [{ fields: ['username'] }, { fields: ['email'] }]
    }
  )

  User.prototype.generateJWT = function() {
    let today = new Date()
    let exp = new Date(today)
    exp.setDate(today.getDate() + 60)

    return jwt.sign(
      {
        id: this.id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000)
      },
      secret
    )
  }

  User.prototype.toAuthJSON = function() {
    return {
      username: this.username,
      email: this.email,
      token: this.generateJWT(),
      bio: this.bio === undefined ? '' : this.bio,
      image: this.image === undefined ? '' : this.image,
    };
  }

  User.prototype.toProfileJSONFor = async function(user) {
    let data = {
      username: this.username,
      bio: this.bio === undefined ? '' : this.bio,
      image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
      following: user ? (await user.isFollowing(this.id)) : false
    }
    return data
  }

  User.prototype.favorite = function(id) {
    return this.addFavorite(id)
  }

  User.prototype.unfavorite = async function(id) {
    return this.removeFavorite(id)
  }

  User.prototype.isFavorite = async function(id) {
    return this.hasFavorite(id)
  }

  User.prototype.follow = async function(id) {
    return this.addFollow(id)
  }

  User.prototype.unfollow = async function(id) {
    return this.removeFollow(id)
  }

  User.prototype.isFollowing = async function(id) {
    return this.hasFollow(id)
  }

  User.prototype.getArticlesByFollowed = async function(offset, limit) {
    const followedUsers = (await sequelize.models.User.findByPk(this.id, {
      attributes: [],
      offset: offset,
      limit: limit,
      subQuery: false,
      order: [[
        {model: User, as: 'Follows'},
        {model: sequelize.models.Article, as: 'authoredArticles'},
        'createdAt',
        'DESC'
      ]],
      include: [
        {
          model: User,
          as: 'Follows',
          include: [
            {
              model: sequelize.models.Article,
              as: 'authoredArticles',
            }
          ],
        },
      ],
    })).Follows
    const posts = []
    for (const followedUser of followedUsers) {
      for (const authoredArticle of followedUser.authoredArticles) {
        posts.push(authoredArticle)
        authoredArticle.author = followedUser
      }
    }
    posts.sort((x, y) => {
        return x.createdAt < y.createdAt ?  1 :
               x.createdAt > y.createdAt ? -1 : 0
    })
    return posts
  }

  User.prototype.getArticleCountByFollowed = async function() {
    return (await User.findByPk(this.id, {
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('Follows.authoredArticles.id')), 'count']
      ],
      include: [
        {
          model: User,
          as: 'Follows',
          attributes: [],
          through: {attributes: []},
          include: [{
              model: sequelize.models.Article,
              as: 'authoredArticles',
              attributes: [],
          }],
        },
      ],
    })).dataValues.count
  }

  User.validPassword = function(user, password) {
    let hash = crypto.pbkdf2Sync(password, user.salt, 10000, 512, 'sha512').toString('hex')
    return user.hash === hash
  }

  User.setPassword = function(user, password) {
    user.salt = crypto.randomBytes(16).toString('hex')
    user.hash = crypto.pbkdf2Sync(password, user.salt, 10000, 512, 'sha512').toString('hex')
  }

  return User
}
