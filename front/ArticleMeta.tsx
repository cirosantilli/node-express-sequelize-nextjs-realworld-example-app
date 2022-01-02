import React from 'react'

import ArticleActions from 'front/ArticleActions'
import CustomImage from 'front/CustomImage'
import CustomLink from 'front/CustomLink'
import { formatDate } from 'front/date'
import routes from 'front/routes'

const ArticleMeta = ({ article }) => {
  if (!article) return
  return (
    <div className="article-meta">
      <CustomLink
        href={routes.userView(encodeURIComponent(article.author?.username))}
      >
        <CustomImage src={article.author?.image} alt="author profile image" />
      </CustomLink>
      <div className="info">
        <CustomLink
          href={routes.userView(encodeURIComponent(article.author?.username))}
          className="author"
        >
          {article.author?.username}
        </CustomLink>
        <span className="date">{formatDate(article.createdAt)}</span>
      </div>
      <ArticleActions article={article} />
    </div>
  )
}

export default ArticleMeta
