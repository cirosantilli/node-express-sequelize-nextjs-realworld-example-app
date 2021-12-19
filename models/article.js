const slug = require('slug')
const { DataTypes, Op, Transaction } = require('sequelize')

module.exports = (sequelize) => {
  const Article = sequelize.define(
    'Article',
    {
      slug: {
        type: DataTypes.STRING,
        unique: {
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
          // This should alwas be run inside a transaction, as it is an unsafe read modify write loop,
          // otherwise could fail if a new article is created in the middle: we could end up destroying
          // the tag of that article incorrectly. Converting to a single join delete statement
          // would do the trick, but that syntax is not possible in all DBs, and subqueries are impossible
          // without literals in Sequelize:
          // https://stackoverflow.com/questions/45354001/nodejs-sequelize-delete-with-nested-select-query

          // Get all tags that the article has that have exactly 1 article before we deleted
          // this article. We know we can delete those later on.
          const emptyTags = await article.sequelize.models.Article.findAll({
            attributes: [
              sequelize.col('Tags.id'),
              [sequelize.fn('COUNT', sequelize.col('Article.id')), 'count'],
            ],
            raw: true,
            includeIgnoreAttributes: false,
            include: [
              {
                model: article.sequelize.models.Tag,
                as: 'tags',
                where: { '$Article.id$': article.id },
                include: [
                  {
                    model: article.sequelize.models.Article,
                    as: 'taggedArticles',
                    required: false
                  }
                ]
              },
            ],
            group: ['Tags.id'],
            order: [[sequelize.col('count'), 'DESC']],
            having: sequelize.where(sequelize.fn('COUNT', sequelize.col('Article.id')), Op.eq, 1),
            transaction: options.transaction,
          })

          // Equivalent to the above but in multiple queries. Keeping around in a comments just in case.
          // Should also be converted to promise.
          //const tags = await article.getTags({ transaction: options.transaction })
          //const emptyTags = []
          //for (const tag of tags) {
          //  if ((await tag.countTaggedArticles({ transaction: options.transaction })) === 1) {
          //    emptyTags.push(tag)
          //  }
          //}
          if (emptyTags.length) {
            article.sequelize.models.Tag.destroy({
              where: { id: emptyTags.map(tag => tag.id) },
              transaction: options.transaction,
            })
          }
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

  Article.prototype.toJson = async function(user) {
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
