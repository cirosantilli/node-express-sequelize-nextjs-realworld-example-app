import { GetStaticProps, GetStaticPaths } from 'next'

import { revalidate, prerenderAll } from "config";
import sequelize from "lib/db";

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
    fallback: true,
    paths,
  }
}

export const getStaticPropsProfile: GetStaticProps = async ({ params: { pid } }) => {
  const user = await sequelize.models.User.findOne({
    where: { username: pid },
  })
  if (!user) {
    return {
      notFound: true
    }
  }
  return {
    revalidate,
    props: { profile: await user.toProfileJSONFor() },
  }
}
