import styled from "@emotion/styled";
import marked from "marked";
import React from "react";
import { useRouter } from 'next/router'
import useSWR, { trigger } from "swr";

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

const ArticleContentPresenter = styled("div")`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  flex: 0 0 100%;
  max-width: 100%;
  min-height: 1px;
  margin: 0 -15px;
  padding: 0 15px;
`;

const ArticleTagList = styled("ul")`
  display: inline-block;
  list-style: none !important;
  padding-left: 0 !important;
  margin: 0 0 1rem;
`;

const ArticleTagItem = styled("li")`
  display: inline-block !important;
  border: 1px solid #ddd;
  color: #aaa !important;
  background: 0 0 !important;
  font-size: 0.8rem;
  padding-top: 0.1rem;
  padding-bottom: 0.1rem;
  white-space: nowrap;
  margin-right: 3px;
  margin-bottom: 0.2rem;
  padding-right: 0.6em;
  padding-left: 0.6em;
  border-radius: 10rem;
`;

const Divider = styled("hr")`
  box-sizing: content-box;
  height: 0;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const ArticleActions = styled("div")`
  text-align: center;
  margin: 1.5rem 0 3rem;
`;

const CommentListContainer = styled("div")`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
`;

const CommentListPresenter = styled("div")`
  position: relative;
  flex: 0 0 100%;
  max-width: 100%;
  min-height: 1px;
  padding: 0 15px;

  @media (min-width: 768px) {
    position: relative;
    flex: 0 0 66.66667%;
    max-width: 66.66667%;
    margin-left: 16.66667%;
  }
`;

const ArticlePage = ({ article, comments }: ArticlePageProps) => {
  const router = useRouter();
  if (router.isFallback) {
    return <LoadingSpinner />;
  }
  const { data: articleLoggedInData, error } = useSWR(`${SERVER_BASE_URL}/articles/${article.slug}`, fetcher);
  let articleLoggedIn;
  if (articleLoggedInData !== undefined) {
    articleLoggedIn = articleLoggedInData.article
  }
  const markup = { __html: marked(article.body) };
  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>
          <ArticleMeta article={article} articleLoggedIn={articleLoggedIn} />
        </div>
      </div>
      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <div dangerouslySetInnerHTML={markup} />
            <ArticleTagList>
              {article.tagList?.map((tag) => (
                <ArticleTagItem key={tag}>{tag}</ArticleTagItem>
              ))}
            </ArticleTagList>
          </div>
        </div>
        <Divider />
        <ArticleActions />
        <CommentListContainer>
          <CommentListPresenter>
            <CommentInput />
            {comments?.map((comment: CommentType) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </CommentListPresenter>
        </CommentListContainer>
      </div>
    </div>
  );
};

// Server only.

import { getStaticPathsArticle, getStaticPropsArticle } from "lib/article";
const configModule = require("../../config");

export const getStaticPaths = getStaticPathsArticle;
export const getStaticProps = getStaticPropsArticle(configModule.revalidate, true);
export default ArticlePage;
