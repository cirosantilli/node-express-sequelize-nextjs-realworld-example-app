const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Sequelize = require('sequelize')
const { DataTypes, Op } = Sequelize

const config = require('../front/config')

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
          msg: 'This username is taken.',
        },
        validate: {
          min: {
            args: 3,
            msg: 'Username must start with a letter, have no spaces, and be at least 3 characters.',
          },
          max: {
            args: 40,
            msg: 'Username must start with a letter, have no spaces, and be at less than 40 characters.',
          },
          is: {
            args: /^[A-Za-z][A-Za-z0-9-_]+$/i, // must start with letter and only have letters, numbers, dashes
            msg: 'Username must start with a letter, have no spaces, and be 3 - 40 characters.',
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        set(v) {
          this.setDataValue('email', v.toLowerCase())
        },
        unique: {
          msg: 'This email is taken.',
        },
        validate: {
          isEmail: {
            msg: 'This email does not seem valid.',
          },
          max: {
            args: 254,
            msg: 'This email is too long, the maximum size is 254 characters.',
          },
        },
      },
      bio: DataTypes.STRING,
      image: DataTypes.STRING,
      hash: DataTypes.STRING(1024),
      salt: DataTypes.STRING,
      ip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      indexes: [{ fields: ['username'] }, { fields: ['email'] }],
    }
  )

  User.prototype.generateJWT = function () {
    let today = new Date()
    let exp = new Date(today)
    exp.setDate(today.getDate() + 60)
    return jwt.sign(
      {
        id: this.id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
      },
      config.secret
    )
  }

  User.prototype.toAuthJSON = function () {
    return {
      username: this.username,
      email: this.email,
      token: this.generateJWT(),
      bio: this.bio === undefined ? '' : this.bio,
      image: this.image === undefined ? '' : this.image,
    }
  }

  User.prototype.toProfileJSONFor = async function (user) {
    let data = {
      username: this.username,
      bio: this.bio === undefined ? '' : this.bio,
      // This one returns the default image if empty, unlike toAuthJSON which returns nothing.
      // Therefore, this one is what you want when viewing profiles, and toAuthJSON is what
      // you want when loading profile settings forms for which we want an empty field.
      image:
        this.image ||
        'https://static.productionready.io/images/smiley-cyrus.jpg',
      following: user ? await user.hasFollow(this.id) : false,
    }
    return data
  }

  User.prototype.findAndCountArticlesByFollowed = async function (
    offset,
    limit
  ) {
    return sequelize.models.Article.findAndCountAll({
      offset: offset,
      limit: limit,
      subQuery: false,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: sequelize.models.User,
          as: 'author',
          required: true,
          include: [
            {
              model: sequelize.models.UserFollowUser,
              on: {
                followId: { [Op.col]: 'author.id' },
              },
              attributes: [],
              where: { userId: this.id },
            },
          ],
        },
      ],
    })
  }

  User.prototype.findAndCountArticlesByFollowedToJson = async function (
    offset,
    limit
  ) {
    const { count: articlesCount, rows: articles } =
      await this.findAndCountArticlesByFollowed(offset, limit)
    const articlesJson = await Promise.all(
      articles.map((article) => {
        return article.toJson(this)
      })
    )
    return {
      articles: articlesJson,
      articlesCount,
    }
  }

  User.prototype.getArticleCountByFollowed = async function () {
    return (
      await User.findByPk(this.id, {
        subQuery: false,
        attributes: [
          [
            Sequelize.fn('COUNT', Sequelize.col('follows.authoredArticles.id')),
            'count',
          ],
        ],
        include: [
          {
            model: User,
            as: 'follows',
            attributes: [],
            through: { attributes: [] },
            include: [
              {
                model: sequelize.models.Article,
                as: 'authoredArticles',
                attributes: [],
              },
            ],
          },
        ],
      })
    ).dataValues.count
  }

  User.validPassword = function (user, password) {
    let hash = crypto
      .pbkdf2Sync(password, user.salt, 10000, 512, 'sha512')
      .toString('hex')
    return user.hash === hash
  }

  User.setPassword = function (user, password) {
    user.salt = crypto.randomBytes(16).toString('hex')
    user.hash = crypto
      .pbkdf2Sync(password, user.salt, 10000, 512, 'sha512')
      .toString('hex')
  }

  return User
}
