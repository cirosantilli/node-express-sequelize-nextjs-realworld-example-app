import { GetStaticProps, GetStaticPaths } from 'next'

import { articleLimit, fallback, revalidate, prerenderAll } from 'front/config'
import sequelize from 'db'

export const getStaticPathsProfile: GetStaticPaths = async () => {
  let paths
  if (prerenderAll) {
    paths = (
      await sequelize.models.User.findAll({
        order: [['username', 'ASC']],
      })
    ).map((user) => {
      return {
        params: {
          pid: user.username,
        },
      }
    })
  } else {
    paths = []
  }
  return {
    fallback,
    paths,
  }
}

export function getStaticPropsProfile(tab): GetStaticProps {
  return async ({ params: { pid } }) => {
    const include = []
    if (tab === 'my-posts') {
      include.push({
        model: sequelize.models.User,
        as: 'author',
        where: { username: pid },
      })
    } else if (tab === 'favorites') {
      include.push({
        model: sequelize.models.User,
        as: 'favoritedBy',
        where: { username: pid },
      })
    }
    const [articles, user] = await Promise.all([
      sequelize.models.Article.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit: articleLimit,
        include,
      }),
      sequelize.models.User.findOne({
        where: { username: pid },
      }),
    ])
    if (!user) {
      return {
        notFound: true,
      }
    }
    return {
      revalidate,
      props: {
        profile: await user.toProfileJSONFor(),
        articles: await Promise.all(
          articles.rows.map((article) => article.toJson())
        ),
        articlesCount: articles.count,
      },
    }
  }
}
