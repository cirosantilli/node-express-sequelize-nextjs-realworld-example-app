import { ArticleType } from 'front/types/ArticleType'
import { CommentType } from 'front/types/CommentType'

export interface ArticlePageProps {
  article: ArticleType
  comments?: CommentType[]
}
