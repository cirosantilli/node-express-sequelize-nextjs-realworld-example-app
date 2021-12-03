const slug = require('slug')
const { DataTypes, Op, Transaction } = require('sequelize')

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
        type: DataTypes.STRING(65536),
        allowNull: false,
      },
    },
    {
      hooks: {
        beforeValidate: (article, options) => {
          if (!article.slug) {
            article.slug = slug(article.title) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
          }
        },
        beforeDestroy: async (article, options) => {
          // TODO unsafe read modify write loop, we need to add some kind of locking here.
          // Could fail if a new article is created in the middle: we could end up destroying
          // the tag of that article incorrectly. Converting to a single join delete statement
          // would do the trick.
          const tags = await article.getTags({ transaction: options.transaction })
          const emptyTags = []
          for (const tag of tags) {
            if ((await tag.countTaggedArticles({ transaction: options.transaction })) === 1) {
              emptyTags.push(tag)
            }
          }
          const actions = []
          for (const tag of emptyTags) {
            actions.push(tag.destroy({ transaction: options.transaction }))
          }
          await Promise.all(actions)
        },
      },
      indexes: [
        {
          fields: ['createdAt'],
        },
      ],
    }
  )

  // This method should always be used instead of the default destroy because it also destroys
  // tags that might now have no articles, and this need to be in a SERIALIZABLE transaction
  // with post + tag creation to prevent a race condition where the tag of a new post gets
  // wrongly deleted before it is assigned to the post.
  Article.prototype.destroy2 = async function() {
    await this.sequelize.transaction(
      Transaction.ISOLATION_LEVELS.SERIALIZABLE,
      async t => {
        await this.destroy({ transaction: t })
      }
    )
  }

  Article.prototype.toJSONFor = async function(user) {
    let authorPromise;
    if (this.authorPromise === undefined) {
      authorPromise = this.getAuthor()
    } else {
      authorPromise = new Promise(resolve => {resolve(this.author)})
    }
    const [tags, favorited, favoritesCount, author] = await Promise.all([
      this.getTags(),
      user ? user.hasFavorite(this.id) : false,
      this.countFavoritedBy(),
      authorPromise.then(author => author.toProfileJSONFor(user)),
    ])
    return {
      slug: this.slug,
      title: this.title,
      description: this.description,
      body: this.body,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      tagList: tags.map(tag => tag.name),
      favorited,
      favoritesCount,
      author,
    }
  }

  return Article
}
