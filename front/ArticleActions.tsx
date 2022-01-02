import Router, { useRouter } from 'next/router'
import React from 'react'
import { trigger } from 'swr'

import FavoriteArticleButton from 'front/FavoriteArticleButton'
import FollowUserButton from 'front/FollowUserButton'
import CustomLink from 'front/CustomLink'
import Maybe from 'front/Maybe'
import ArticleAPI from 'front/api/article'
import apiPath from 'front/config'
import useLoggedInUser from 'front/useLoggedInUser'
import routes from 'front/routes'

const ArticleActions = ({ article }) => {
  const loggedInUser = useLoggedInUser()
  const router = useRouter()
  const {
    query: { pid },
  } = router
  const handleDelete = async () => {
    if (!loggedInUser) return
    const result = window.confirm('Do you really want to delete it?')
    if (!result) return
    await ArticleAPI.delete(pid, loggedInUser?.token)
    trigger(`${apiPath}/articles/${pid}`)
    Router.push(`/`)
  }
  const canModify =
    loggedInUser && loggedInUser?.username === article?.author?.username
  return (
    <>
      <Maybe test={!canModify}>
        <span>
          <FollowUserButton profile={article.author} />
          <FavoriteArticleButton
            favorited={article.favorited}
            favoritesCount={article.favoritesCount}
            slug={article.slug}
            showText={true}
          />
        </span>
      </Maybe>
      <Maybe test={canModify}>
        <span>
          <CustomLink
            href={routes.articleEdit(article.slug)}
            className="btn btn-outline-secondary btn-sm"
          >
            <i className="ion-edit" /> Edit Article
          </CustomLink>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleDelete}
          >
            <i className="ion-trash-a" /> Delete Article
          </button>
        </span>
      </Maybe>
    </>
  )
}

export default ArticleActions
