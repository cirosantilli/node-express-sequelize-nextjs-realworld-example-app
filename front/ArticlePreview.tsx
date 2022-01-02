import React from 'react'

import CustomLink from 'front/CustomLink'
import CustomImage from 'front/CustomImage'
import FavoriteArticleButton from 'front/FavoriteArticleButton'
import { formatDate } from 'front/date'
import routes from 'front/routes'

const ArticlePreview = ({ article }) => {
  const preview = article
  if (!article) return
  return (
    <div className="article-preview">
      <div className="article-meta">
        <CustomLink href={routes.userView(preview.author.username)}>
          <CustomImage src={preview.author.image} alt="author profile image" />
        </CustomLink>
        <div className="info">
          <CustomLink
            href={routes.userView(preview.author.username)}
            className="author"
          >
            {preview.author.username}
          </CustomLink>
          <span className="date">{formatDate(preview.createdAt)}</span>
        </div>
        <div className="pull-xs-right">
          <FavoriteArticleButton
            favorited={preview.favorited}
            favoritesCount={preview.favoritesCount}
            slug={preview.slug}
          />
        </div>
      </div>
      <CustomLink
        href={routes.articleView(preview.slug)}
        className="preview-link"
      >
        <h1>{preview.title}</h1>
        <p>{preview.description}</p>
        <span>Read more...</span>
        <ul className="tag-list">
          {preview.tagList.map((tag, index) => {
            return (
              <li className="tag-default tag-pill tag-outline" key={index}>
                {tag}
              </li>
            )
          })}
        </ul>
      </CustomLink>
    </div>
  )
}

export default ArticlePreview
