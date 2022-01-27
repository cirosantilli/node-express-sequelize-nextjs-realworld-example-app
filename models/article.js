const slug = require('slug')
const { DataTypes, Op, Transaction } = require('sequelize')

module.exports = (sequelize) => {
  const Article = sequelize.define(
    'Article',
    {
      slug: {
        type: DataTypes.STRING,
        unique: {
          message: 'Slug must be unique.',
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
        beforeValidate: (article) => {
          if (!article.slug) {
            article.slug =
              slug(article.title) +
              '-' +
              ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
          }
        },
        beforeDestroy: async (article, options) => {
          await article.deleteEmptyTags(options.transaction)
        },
      },
      indexes: [
        {
          fields: ['createdAt'],
        },
      ],
    }
  )

  // Delete tags that are only associated to this article, and which will therefore be
  // deleted after this article is deleted.
  Article.prototype.deleteEmptyTags = async function (transaction) {
    // This should alwas be run inside a transaction, as it is an unsafe read modify write loop,
    // otherwise could fail if a new article is created in the middle: we could end up destroying
    // the tag of that article incorrectly. Converting to a single join delete statement
    // would do the trick, but that syntax is not possible in all DBs, and subqueries are impossible
    // without literals in Sequelize:
    // https://stackoverflow.com/questions/45354001/nodejs-sequelize-delete-with-nested-select-query

    // Get all tags that the article has that have exactly 1 article before we deleted
    // this article. We know we can delete those later on.
    const emptyTags = await sequelize.models.Article.findAll({
      attributes: [
        sequelize.col('tags.id'),
        [sequelize.fn('COUNT', sequelize.col('Article.id')), 'count'],
      ],
      raw: true,
      includeIgnoreAttributes: false,
      include: [
        {
          model: sequelize.models.Tag,
          as: 'tags',
          where: { '$Article.id$': this.id },
          include: [
            {
              model: sequelize.models.Article,
              as: 'taggedArticles',
              required: false,
            },
          ],
        },
      ],
      group: ['tags.id'],
      order: [[sequelize.col('count'), 'DESC']],
      having: sequelize.where(
        sequelize.fn('COUNT', sequelize.col('Article.id')),
        Op.eq,
        1
      ),
      transaction,
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
      await sequelize.models.Tag.destroy({
        where: { id: emptyTags.map((tag) => tag.id) },
        transaction,
      })
    }
  }

  // This method should always be used instead of the default destroy because it also destroys
  // tags that might now have no articles, and this need to be in a SERIALIZABLE transaction
  // with post + tag creation to prevent a race condition where the tag of a new post gets
  // wrongly deleted before it is assigned to the post.
  Article.prototype.destroy2 = async function () {
    await sequelize.transaction(
      Transaction.ISOLATION_LEVELS.SERIALIZABLE,
      async (t) => {
        await this.destroy({ transaction: t })
      }
    )
  }

  Article.prototype.toJson = async function (user, opts = {}) {
    // We first check if those have already been fetched. This is ideally done
    // for example from JOINs on a query that fetches multiple articles like the
    // queries that show article lists on the home page.
    // https://github.com/cirosantilli/node-express-sequelize-nextjs-realworld-example-app/issues/5
    const authorPromise = this.author ? this.author : this.getAuthor()
    const tagPromise = opts.tags ? opts.tags : this.getTags()
    let favoritePromise
    if (user) {
      favoritePromise =
        opts.favorited === undefined
          ? user.hasFavorite(this.id)
          : opts.favorited
    } else {
      favoritePromise = false
    }
    const [tags, favorited, favoritesCount, author] = await Promise.all([
      await tagPromise,
      await favoritePromise,
      this.countFavoritedBy(),
      (await authorPromise).toProfileJSONFor(user),
    ])
    return {
      slug: this.slug,
      title: this.title,
      description: this.description,
      body: this.body,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      tagList: tags.map((tag) => tag.name),
      favorited,
      favoritesCount,
      author,
    }
  }

  return Article
}
