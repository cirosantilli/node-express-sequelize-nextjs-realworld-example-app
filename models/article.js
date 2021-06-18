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
        },
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      body: {
        type: DataTypes.STRING,
        allowNull: false,
      },
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
      },
      // TODO for sorting by latest.
      //indexes: [
      //  {
      //    fields: ['createdAt'],
      //  },
      //],
    }
  )

  Article.prototype.getTagsAsList = async function() {
    let tags;
    if (this.tags === undefined) {
      tags = await this.getTags()
    } else {
      tags = this.tags
    }
    return tags.map(tag => tag.name)
  }

  Article.prototype.toJSONFor = async function(user) {
    let author;
    if (this.author === undefined) {
      author = await this.getAuthor()
    } else {
      author = this.author
    }
    return {
      slug: this.slug,
      title: this.title,
      description: this.description,
      body: this.body,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tagList: await this.getTagsAsList(),
      favorited: user ? (await user.hasFavorite(this.id)) : false,
      favoritesCount: await this.countFavoritedBy(),
      author: (await author.toProfileJSONFor(user)),
    }
  }
  return Article
}
