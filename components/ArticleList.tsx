import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

import ArticlePreview from "components/ArticlePreview";
import ErrorMessage from "components/ErrorMessage";
import { FavoriteArticleButtonContext } from "components/FavoriteArticleButton";
import LoadingSpinner from "components/LoadingSpinner";
import Maybe from "components/Maybe";
import Pagination from "components/Pagination";
import { SERVER_BASE_URL, DEFAULT_LIMIT } from "lib/utils/constant";
import fetcher from "lib/utils/fetcher";
import { AppContext } from "libts";


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
  const router = useRouter();
  const { query } = router;
  const { pid } = query;
  // The page can be seen up to date from SSR without refetching,
  // so we skip the fetch.
  let ssrSkipFetch = (
    page === 0 &&
    (
      (loggedInUser && what === 'feed') ||
      (!loggedInUser && what === 'global')
    )
  )
  let fetchURL = (() => {
    if (
      loggedInUser === undefined ||
      (ssr && ssrSkipFetch)
    ) {
      // This makes SWR not fetch.
      return null
    }
    switch (what) {
      case 'favorites':
        return `${SERVER_BASE_URL}/articles?limit=${DEFAULT_LIMIT}&favorited=${encodeURIComponent(
          String(pid)
        )}&offset=${page * DEFAULT_LIMIT}`
      case 'my-posts':
        return `${SERVER_BASE_URL}/articles?limit=${DEFAULT_LIMIT}&author=${encodeURIComponent(
          String(pid)
        )}&offset=${page * DEFAULT_LIMIT}`;
      case 'tag':
        return `${SERVER_BASE_URL}/articles?limit=${DEFAULT_LIMIT}&tag=${encodeURIComponent(tag)}&offset=${
          page * DEFAULT_LIMIT
        }`;
      case 'feed':
        return `${SERVER_BASE_URL}/articles/feed?limit=${DEFAULT_LIMIT}&offset=${
          page * DEFAULT_LIMIT
        }`;
      case 'global':
        return `${SERVER_BASE_URL}/articles?limit=${DEFAULT_LIMIT}&offset=${page * DEFAULT_LIMIT}`;
      case undefined:
        // We haven't decided yet because we haven't decided if we are logged in or out yet.
        return null
      default:
        throw new Error(`Unknown search: ${what}`)
    }
  })()
  const { data, error } = useSWR(fetchURL, fetcher());
  let showSpinner = true
  if (data) {
    ({ articles, articlesCount } = data)
  } else if (
    // If we used server side data on either of those cases, it would lead to wrong
    // data flickering, either for page 0, for for global feed instead of user following feed
    // since both of those share the `/` URL.
    // Instead, we want the loader to flicker.
    // https://github.com/cirosantilli/node-express-sequelize-nextjs-realworld-example-app/issues/12
    (
      !ssr &&
      page === 0 &&
      (
        // These don't have their own URLs.
        what !== 'feed' &&
        what !== 'tag'
      )
    ) ||
    // SSR has all the data it needs, so for sure we won't show the spinner.
    ssr && (ssrSkipFetch || loggedInUser === undefined)
  ) {
    showSpinner = false
  } else {
    [ articles, articlesCount ] = [[], 0]
  }

  // Favorite article button state.
  const favorited = []
  const setFavorited = []
  const favoritesCount = []
  const setFavoritesCount = []
  // MUST be DEFAULT_LIMIT and not articles.length, because articles.length
  // can happen a variable number of times on index page due to:
  // * load ISR page logged off on global
  // * login, which leads to feed instead of global
  // and calling hooks like useState different number of times is a capital sin
  // in React and makes everything blow up.
  for (let i = 0; i < DEFAULT_LIMIT; i++) {
    [favorited[i], setFavorited[i]] = React.useState(false);
    [favoritesCount[i], setFavoritesCount[i]] = React.useState(0);
  }
  React.useEffect(() => {
    const nArticles = articles?.length || 0
    for (let i = 0; i < nArticles; i++) {
      setFavorited[i](articles[i].favorited);
      setFavoritesCount[i](articles[i].favoritesCount);
    }
  }, Object.assign(articles.map(a => a.favorited).concat(articles.map(a => a.favoritesCount)), {length: DEFAULT_LIMIT}))

  if (error) return <ErrorMessage message="Cannot load recent articles..." />;
  if (!data && showSpinner) return <LoadingSpinner />;
  if (articles?.length === 0) {
    return (<div className="article-preview">No articles are here... yet.</div>);
  }
  return (
    <>
      {articles?.map((article, i) => (
        <FavoriteArticleButtonContext.Provider key={article.slug} value={{
          favorited: favorited[i],
          setFavorited: setFavorited[i],
          favoritesCount: favoritesCount[i],
          setFavoritesCount: setFavoritesCount[i],
        }}>
          <ArticlePreview key={article.slug} article={article} />
        </FavoriteArticleButtonContext.Provider>
      ))}
      <Maybe test={articlesCount && articlesCount > DEFAULT_LIMIT}>
        <Pagination
          articlesCount={articlesCount}
          articlesPerPage={DEFAULT_LIMIT}
          showPagesMax={10}
          currentPage={page}
          setCurrentPage={setPage}
        />
      </Maybe>
    </>
  );
};

export default ArticleList;
