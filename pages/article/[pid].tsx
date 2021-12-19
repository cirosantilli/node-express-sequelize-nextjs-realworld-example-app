import marked from "marked";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from 'next/router'
import React from "react";
import useSWR  from "swr";

import ArticleMeta from "components/ArticleMeta";
import Comment from "components/Comment";
import CommentInput from "components/CommentInput";
import { FavoriteArticleButtonContext } from "components/FavoriteArticleButton";
import LoadingSpinner from "components/LoadingSpinner";
import { FollowUserButtonContext } from "components/FollowUserButton";
import ArticleAPI from "lib/api/article";
import { ArticleType } from "lib/types/articleType";
import { CommentType } from "lib/types/commentType";
import { SERVER_BASE_URL } from "lib/utils/constant";
import fetcher from "lib/utils/fetcher";
import { AppContext } from 'libts'
import routes from "routes";

interface ArticlePageProps {
  article: ArticleType;
  comments: CommentType[];
  pid: string;
}

const ArticlePage = ({ article, comments }: ArticlePageProps) => {
  const router = useRouter();

  // Fetch user-specific data.
  // Article determines if the curent user favorited the article or not
  const { data: articleApi, error } = useSWR(
  `${SERVER_BASE_URL}/articles/${article?.slug}`, fetcher(router.isFallback));
  if (articleApi !== undefined) {
    article = articleApi.article
  }
  // We fetch comments so that the new posted comment will appear immediately after posted.
  // Note that we cannot calculate the exact new coment element because we need the server datetime.
  const { data: commentApi, error: commentError } = useSWR(
    `${SERVER_BASE_URL}/articles/${article?.slug}/comments`, fetcher(router.isFallback));
  if (commentApi !== undefined) {
    comments = commentApi.comments
  }

  // TODO it is not ideal to have to setup state on every parent of FavoriteUserButton/FollowUserButton,
  // but I just don't know how to avoid it nicely, especially considering that the
  // button shows up on both profile and article pages, and thus comes from different
  // API data, so useSWR is not a clean.
  const [following, setFollowing] = React.useState(false)
  React.useEffect(() => {
    setFollowing(article?.author.following)
  }, [article?.author.following])
  const [favorited, setFavorited] = React.useState(false);
  const [favoritesCount, setFavoritesCount] = React.useState(article?.favoritesCount);
  React.useEffect(() => {
    setFavorited(article?.favorited);
    setFavoritesCount(article?.favoritesCount)
  }, [article?.favorited, article?.favoritesCount])
  const {setPage, setTab, setTag, setTitle} = React.useContext(AppContext)
  React.useEffect(() => {
    setTitle(article?.title)
  }, [article?.title])

  if (router.isFallback) { return <LoadingSpinner />; }
  const markup = { __html: marked(article.body) };
  return (
    <>
      <div className="article-page">
        <div className="banner">
          <div className="container">
            <h1>{article.title}</h1>
            <FavoriteArticleButtonContext.Provider value={{
              favorited, setFavorited, favoritesCount, setFavoritesCount
            }}>
              <FollowUserButtonContext.Provider value={{
                following, setFollowing
              }}>
                <ArticleMeta article={article}/>
              </FollowUserButtonContext.Provider>
            </FavoriteArticleButtonContext.Provider>
          </div>
        </div>
        <div className="container page">
          <div className="row article-content">
            <div className="col-md-12">
              <div dangerouslySetInnerHTML={markup} />
              <ul className="tag-list">
                {article.tagList?.map((tag) => (
                  <li
                    className="tag-default tag-pill tag-outline"
                    key={tag}
                  >
                    {tag}
                    {false && <>
                      TODO link to index tag list from here. This code almost works, but fails because 
                      of the resetIndexState call on pages/index.jsx. The problem is I don't know how to
                      differentiate between clicking a link like this (we want non-default state) and 
                      first visit/page refresh (we want default state).
                      This was not in the original Realworld app, but would be an obvious addition:
                      https://github.com/gothinkster/realworld/issues/649

                      I also tried to add a global flag to make index reset only once, but since each
                      page re-renders several times due to hooks, that didn't work.
                      <Link href={routes.home()}>
                        <a
                          onClick={() => {
                            setTab('tag')
                            setTag(tag)
                            setPage(0)
                          }}
                        >
                          {tag}
                        </a>
                      </Link>
                    </>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <hr />
          <div className="article-actions">
            <FavoriteArticleButtonContext.Provider value={{
              favorited, setFavorited, favoritesCount, setFavoritesCount
            }}>
              <FollowUserButtonContext.Provider value={{
                following, setFollowing
              }}>
                <ArticleMeta article={article}/>
              </FollowUserButtonContext.Provider>
            </FavoriteArticleButtonContext.Provider>
          </div>
          <div className="row">
            <div className="col-xs-12 col-md-8 offset-md-2">
              <div>
                <CommentInput />
                {comments?.map((comment: CommentType) => (
                  <Comment key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticlePage;

// Server only.

import { getStaticPathsArticle, getStaticPropsArticle } from "lib/article";
export const getStaticPaths = getStaticPathsArticle;
export const getStaticProps = getStaticPropsArticle(true, true);
