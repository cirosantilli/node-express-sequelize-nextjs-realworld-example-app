import { GetStaticProps, GetStaticPaths } from 'next'

import { fallback, revalidate, prerenderAll } from "config";
import sequelize from "lib/db";
import { DEFAULT_LIMIT  } from "lib/utils/constant";

export const getStaticPathsProfile: GetStaticPaths = async () => {
  let paths;
  if (prerenderAll) {
    paths = (await sequelize.models.User.findAll({
      order: [['username', 'ASC']],
    })).map(
      user => {
        return {
          params: {
            pid: user.username,
          }
        }
      }
    )
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
    let include = []
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
        limit: DEFAULT_LIMIT,
        include
      }),
      sequelize.models.User.findOne({
        where: { username: pid },
      }),
    ])
    if (!user) {
      return {
        notFound: true
      }
    }
    return {
      revalidate,
      props: {
        profile: await user.toProfileJSONFor(),
        articles: await Promise.all(articles.rows.map(article => article.toJson())),
        articlesCount: articles.count,
      },
    }
  }
}
