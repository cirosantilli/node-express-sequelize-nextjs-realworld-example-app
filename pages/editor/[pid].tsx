import makeArticleEditor from 'front/ArticleEditor'

import { getStaticPropsArticle } from 'back/ArticlePage'

// Backend only.

import sequelize from 'back/db'

export const getServerSideProps = getStaticPropsArticle();

export default makeArticleEditor();
