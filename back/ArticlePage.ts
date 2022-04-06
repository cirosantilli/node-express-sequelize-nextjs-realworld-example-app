import { GetStaticProps, GetStaticPaths } from 'next'

import { ArticlePageProps } from 'front/ArticlePage'
import { fallback, revalidate, prerenderAll } from 'front/config'
import sequelize from 'db'

export const getStaticPathsArticle: GetStaticPaths = async () => {
  let paths
  if (prerenderAll) {
    paths = (await sequelize.models.Article.findAll()).map((article) => {
      return {
        params: {
          pid: article.slug,
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

export function getStaticPropsArticle(
  addRevalidate?,
  addComments?
): GetStaticProps {
  return async ({ params: { pid } }) => {
    const article = await sequelize.models.Article.findOne({
      where: { slug: pid },
      include: [{ model: sequelize.models.User, as: 'author' }],
    })
    if (!article) {
      return {
        notFound: true,
      }
    }
    let comments
    if (addComments) {
      comments = await article.getComments({
        order: [['createdAt', 'DESC']],
        include: [{ model: sequelize.models.User, as: 'author' }],
      })
    }
    const props: ArticlePageProps = { article: await article.toJson() }
    if (addComments) {
      props.comments = await Promise.all(
        comments.map((comment) => comment.toJson())
      )
    }
    const ret: Awaited<ReturnType<GetStaticProps>> = {
      props,
    }
    // We can only add this for getStaticProps, not getServerSideProps.
    if (addRevalidate) {
      ret.revalidate = revalidate
    }
    return ret
  }
}
