import { getStaticPropsArticle } from 'back/ArticlePage'
export const getServerSideProps = getStaticPropsArticle()
import makeArticleEditor from 'front/ArticleEditor'
export default makeArticleEditor()
