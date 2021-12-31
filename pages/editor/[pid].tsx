import { getStaticPropsArticle } from 'back/ArticlePage'
export const getServerSideProps = getStaticPropsArticle()
import ArticleEditorHoc from 'front/ArticleEditor'
export default ArticleEditorHoc()
