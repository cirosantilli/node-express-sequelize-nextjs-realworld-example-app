import Router, { useRouter } from "next/router";
import React from "react";
import useSWR, { trigger } from "swr";

import FavoriteArticleButton from "components/common/FavoriteArticleButton";
import CustomLink from "components/common/CustomLink";
import Maybe from "components/common/Maybe";
import checkLogin from "lib/utils/checkLogin";
import ArticleAPI from "lib/api/article";
import { SERVER_BASE_URL } from "lib/utils/constant";
import storage from "lib/utils/storage";

const ArticleActions = ({ article }) => {
  const { data: currentUser } = useSWR("user", storage);
  const isLoggedIn = checkLogin(currentUser);
  const router = useRouter();
  const {
    query: { pid },
  } = router;
  const handleDelete = async () => {
    if (!isLoggedIn) return;
    const result = window.confirm("Do you really want to delete it?");
    if (!result) return;
    await ArticleAPI.delete(pid, currentUser?.token);
    trigger(`${SERVER_BASE_URL}/articles/${pid}`);
    Router.push(`/`);
  };
  const canModify =
    isLoggedIn && currentUser?.username === article?.author?.username;
  return (
    <>
      <Maybe test={isLoggedIn}>
        <FavoriteArticleButton
          favorited={article.favorited}
          favoritesCount={article.favoritesCount}
          slug={article.slug}
        >
          Favorite Article
        </FavoriteArticleButton>
      </Maybe>
      <Maybe test={canModify}>
        <span>
          <CustomLink
            href="/editor/[pid]"
            as={`/editor/${article.slug}`}
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
  );
};

export default ArticleActions;
