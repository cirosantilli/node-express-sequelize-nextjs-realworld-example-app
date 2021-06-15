const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const secret = require('../config').secret

const { DataTypes } = require('sequelize')

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

  User.prototype.validPassword = function(password) {
    let hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
    return this.hash === hash
  }

  User.prototype.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex')
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
  }

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

  User.associate = function() {
    sequelize.models.Article.belongsToMany(User, { through: 'UserFavoriteArticle', as: 'Favorite' });
    User.belongsToMany(sequelize.models.Article, { through: 'UserFavoriteArticle', as: 'Favorite' });
    User.belongsToMany(User, { through: 'UserFollowUser', as: 'Follow' });
  }

  return User
}
