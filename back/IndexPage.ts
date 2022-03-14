import { GetServerSideProps, GetStaticProps } from 'next'
import { verify } from 'jsonwebtoken'

import { getCookieFromReq } from 'front'
import { articleLimit, revalidate, secret  } from 'front/config'
import sequelize from 'db'
import { getIndexTags } from 'lib'

async function getLoggedOutProps() {
  const articles = await sequelize.models.Article.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit: articleLimit,
  })
  return {
    articles: await Promise.all(
      articles.rows.map((article) => article.toJson())
    ),
    articlesCount: articles.count,
    tags: await getIndexTags(sequelize),
  }
}

function getLoggedInUser(req) {
  const authCookie = getCookieFromReq(req, 'auth')
  if (authCookie) {
    return verify(authCookie, secret)
  } else {
    return null
  }
}

export const getServerSidePropsHoc: GetServerSideProps = async ({ req }) => {
  const loggedInUser = getLoggedInUser(req)
  let props
  if (loggedInUser) {
    const [articles, tags] = await Promise.all([
      sequelize.models.User.findByPk(loggedInUser.id).then((user) =>
        user.findAndCountArticlesByFollowedToJson(0, articleLimit)
      ),
      getIndexTags(sequelize),
    ])
    props = Object.assign(articles, { tags })
  } else {
    props = await getLoggedOutProps()
  }
  // Not required by Next, just to factor things out in our demo which has both ISR and SSR.
  props.ssr = true
  return { props }
}

export const getStaticPropsHoc: GetStaticProps = async () => {
  return {
    props: await getLoggedOutProps(),
    revalidate,
  }
}
