import { useRouter } from 'next/router'
import React from 'react'
import useSWR from 'swr'

import ArticlePreview from 'front/ArticlePreview'
import { apiPath, articleLimit } from 'front/config'
import ErrorMessage from 'front/ErrorMessage'
import { FavoriteArticleButtonContext } from 'front/FavoriteArticleButton'
import LoadingSpinner from 'front/LoadingSpinner'
import Maybe from 'front/Maybe'
import Pagination from 'front/Pagination'
import fetcher from 'front/api'

const ArticleList = ({
  articles,
  articlesCount,
  loggedInUser,
  page,
  setPage,
  what,
  ssr,
  tag = undefined,
}) => {
  const router = useRouter()
  const { query } = router
  const { pid } = query
  // The page can be seen up to date from SSR without refetching,
  // so we skip the fetch.
  const ssrSkipFetch =
    page === 0 &&
    ((loggedInUser && what === 'feed') || (!loggedInUser && what === 'global'))
  const fetchURL = (() => {
    if (loggedInUser === undefined || (ssr && ssrSkipFetch)) {
      // This makes SWR not fetch.
      return null
    }
    switch (what) {
      case 'favorites':
        return `${apiPath}/articles?limit=${articleLimit}&favorited=${encodeURIComponent(
          String(pid)
        )}&offset=${page * articleLimit}`
      case 'my-posts':
        return `${apiPath}/articles?limit=${articleLimit}&author=${encodeURIComponent(
          String(pid)
        )}&offset=${page * articleLimit}`
      case 'tag':
        return `${apiPath}/articles?limit=${articleLimit}&tag=${encodeURIComponent(
          tag
        )}&offset=${page * articleLimit}`
      case 'feed':
        return `${apiPath}/articles/feed?limit=${articleLimit}&offset=${
          page * articleLimit
        }`
      case 'global':
        return `${apiPath}/articles?limit=${articleLimit}&offset=${
          page * articleLimit
        }`
      case undefined:
        // We haven't decided yet because we haven't decided if we are logged in or out yet.
        return null
      default:
        throw new Error(`Unknown search: ${what}`)
    }
  })()
  const { data, error } = useSWR(fetchURL, fetcher())
  let showSpinner = true
  if (data) {
    ;({ articles, articlesCount } = data)
  } else if (
    // If we used server side data on either of those cases, it would lead to wrong
    // data flickering, either for page 0, for for global feed instead of user following feed
    // since both of those share the `/` URL.
    // Instead, we want the loader to flicker.
    // https://github.com/cirosantilli/node-express-sequelize-nextjs-realworld-example-app/issues/12
    (!ssr &&
      page === 0 &&
      // These don't have their own URLs.
      what !== 'feed' &&
      what !== 'tag') ||
    // SSR has all the data it needs, so for sure we won't show the spinner.
    (ssr && (ssrSkipFetch || loggedInUser === undefined))
  ) {
    showSpinner = false
  } else {
    ;[articles, articlesCount] = [[], 0]
  }

  // Favorite article button state.
  const favorited = []
  const setFavorited = []
  const favoritesCount = []
  const setFavoritesCount = []
  // MUST be articleLimit and not articles.length, because articles.length
  // can happen a variable number of times on index page due to:
  // * load ISR page logged off on global
  // * login, which leads to feed instead of global
  // and calling hooks like useState different number of times is a capital sin
  // in React and makes everything blow up.
  for (let i = 0; i < articleLimit; i++) {
    // https://stackoverflow.com/questions/53906843/why-cant-react-hooks-be-called-inside-loops-or-nested-function
    // https://stackoverflow.com/questions/61345625/ignore-react-hook-react-useeffect-may-be-executed-more-than-once
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ;[favorited[i], setFavorited[i]] = React.useState(false)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ;[favoritesCount[i], setFavoritesCount[i]] = React.useState(0)
  }
  React.useEffect(() => {
    const nArticles = articles?.length || 0
    for (let i = 0; i < nArticles; i++) {
      setFavorited[i](articles[i].favorited)
      setFavoritesCount[i](articles[i].favoritesCount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Object.assign(articles.map((a) => a.favorited).concat(articles.map((a) => a.favoritesCount)), { length: articleLimit }))

  if (error) return <ErrorMessage message="Cannot load recent articles..." />
  if (!data && showSpinner) return <LoadingSpinner />
  if (articles?.length === 0) {
    return <div className="article-preview">No articles are here... yet.</div>
  }
  return (
    <>
      {articles?.map((article, i) => (
        <FavoriteArticleButtonContext.Provider
          key={article.slug}
          value={{
            favorited: favorited[i],
            setFavorited: setFavorited[i],
            favoritesCount: favoritesCount[i],
            setFavoritesCount: setFavoritesCount[i],
          }}
        >
          <ArticlePreview key={article.slug} article={article} />
        </FavoriteArticleButtonContext.Provider>
      ))}
      <Maybe test={articlesCount && articlesCount > articleLimit}>
        <Pagination
          articlesCount={articlesCount}
          articlesPerPage={articleLimit}
          showPagesMax={10}
          currentPage={page}
          setCurrentPage={setPage}
        />
      </Maybe>
    </>
  )
}

export default ArticleList
