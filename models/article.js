const slug = require('slug')
const { DataTypes, Op } = require('sequelize')

module.exports = (sequelize) => {
  const Article = sequelize.define(
    'Article',
    {
      slug: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          message: 'Slug must be unique.'
        },
        set(v) {
          this.setDataValue('slug', v.toLowerCase())
        }
      },
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      body: DataTypes.STRING,
      favoritesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'favorites_count'
      },
      tagList: {
        type: DataTypes.STRING,
        field: 'tag_list',
        set(v) {
          this.setDataValue('tagList', Array.isArray(v) ? v.join(',') + ',-' : '')
        },
        get() {
          const tagList = this.getDataValue('tagList')
          if (!tagList) return []
          return tagList.split(',').slice(0, -1)
        }
      }
    },
    {
      underscored: true,
      tableName: 'articles',
      hooks: {
        beforeValidate: (article, options) => {
          if (!article.slug) {
            article.slug = slug(article.title) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
          }
        }
      }
    }
  )

  Article.associate = function() {
    Article.belongsTo(sequelize.models.User, {
      as: 'author',
      foreignKey: {
        allowNull: false
      }
    })
    Article.hasMany(sequelize.models.Comment)
  }

  Article.prototype.updateFavoriteCount = async function() {
    const count = await sequelize.models.User.count({
      where: { favorites: { [Op.in]: [this.id] } }
    })
    this.favoritesCount = count
    return this.save()
  }

  Article.prototype.toJSONFor = async function(user) {
    return {
      slug: this.slug,
      title: this.title,
      description: this.description,
      body: this.body,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tagList: this.tagList,
      favorited: user ? user.isFavorite(this.id) : false,
      favoritesCount: this.favoritesCount,
      author: (await this.author.toProfileJSONFor(user))
    }
  }
  return Article
}
