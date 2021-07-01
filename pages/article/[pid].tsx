import marked from "marked";
import React from "react";
import { useRouter } from 'next/router'
import useSWR  from "swr";

import ArticleMeta from "components/article/ArticleMeta";
import Comment from "components/comment/Comment";
import CommentInput from "components/comment/CommentInput";
import LoadingSpinner from "components/common/LoadingSpinner";
import ArticleAPI from "lib/api/article";
import { ArticleType } from "lib/types/articleType";
import { CommentType } from "lib/types/commentType";
import { SERVER_BASE_URL } from "lib/utils/constant";
import fetcher from "lib/utils/fetcher";

interface ArticlePageProps {
  article: ArticleType;
  comments: CommentType[];
  pid: string;
}

const ArticlePage = ({ article, comments }: ArticlePageProps) => {
  const router = useRouter();
  if (router.isFallback) { return <LoadingSpinner />; }
  const { data: articleApi, error } = useSWR(`${SERVER_BASE_URL}/articles/${article.slug}`, fetcher);
  if (articleApi !== undefined) {
    article = articleApi.article
  }
  const markup = { __html: marked(article.body) };
  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>
          <ArticleMeta article={article}/>
        </div>
      </div>
      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <div dangerouslySetInnerHTML={markup} />
            <ul className="tag-list">
              {article.tagList?.map((tag) => (
                <li className="tag-default tag-pill tag-outline" key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        </div>
        <hr />
        <div className="article-actions">{/* TODO */ ''}</div>
        <div className="row">
          <div className="col-xs-12 col-md-8 offset-md-2">
            <CommentInput />
            {comments?.map((comment: CommentType) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;

// Server only.

import { getStaticPathsArticle, getStaticPropsArticle } from "lib/article";
const configModule = require("../../config");

export const getStaticPaths = getStaticPathsArticle;
export const getStaticProps = getStaticPropsArticle(configModule.revalidate, true);
