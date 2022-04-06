import { GetStaticProps } from 'next'
import { MyGetServerSideProps } from 'front/types'
import { verify } from 'jsonwebtoken'

import { getCookieFromReq, AUTH_COOKIE_NAME } from 'front'
import { articleLimit, revalidate, secret } from 'front/config'
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

export async function getLoggedInUser(req, res) {
  const authCookie = getCookieFromReq(req, AUTH_COOKIE_NAME)
  let verifiedUser
  if (authCookie) {
    try {
      verifiedUser = verify(authCookie, secret)
    } catch (e) {
      return null
    }
  } else {
    return null
  }
  const user = await sequelize.models.User.findByPk(verifiedUser.id)
  if (user === null) {
    res.clearCookie(AUTH_COOKIE_NAME)
  }
  return user
}

export const getServerSidePropsHoc: MyGetServerSideProps = async ({
  req,
  res,
}) => {
  const loggedInUser = await getLoggedInUser(req, res)
  let props
  if (loggedInUser) {
    const [articles, tags] = await Promise.all([
      loggedInUser.findAndCountArticlesByFollowedToJson(0, articleLimit),
      getIndexTags(req.sequelize),
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
