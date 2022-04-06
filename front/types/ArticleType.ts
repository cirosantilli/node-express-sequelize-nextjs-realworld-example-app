import { UserType } from 'front/types/UserType'

export interface ArticleList {
  articles: ArticleType[]
}

export interface Article {
  article: ArticleType
}

export type ArticleType = {
  author: UserType
  body: string
  createdAt: number
  description: string
  favorited: boolean
  favoritesCount: number
  slug: string
  tagList: string[]
  title: string
  updatedAt: number
}
