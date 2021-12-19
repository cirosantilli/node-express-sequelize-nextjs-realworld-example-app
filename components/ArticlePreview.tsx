import Link from "next/link";
import React from "react";

import CustomLink from "components/CustomLink";
import CustomImage from "components/CustomImage";
import FavoriteArticleButton from "components/FavoriteArticleButton";
import { formatDate } from "lib/utils/date";
import { AppContext } from "libts";
import routes from "routes";

const ArticlePreview = ({ article }) => {
  const preview = article;
  const [hover, setHover] = React.useState(false);
  if (!article) return;
  return (
    <div className="article-preview">
      <div className="article-meta">
        <CustomLink
          href={routes.userView(preview.author.username)}
        >
          <CustomImage
            src={preview.author.image}
            alt="author profile image"
          />
        </CustomLink>
        <div className="info">
          <CustomLink
            href={routes.userView(preview.author.username)}
            className="author"
          >
            {preview.author.username}
          </CustomLink>
          <span className="date">
            {formatDate(preview.createdAt)}
          </span>
        </div>
        <div className="pull-xs-right">
          <FavoriteArticleButton
            favorited={preview.favorited}
            favoritesCount={preview.favoritesCount}
            slug={preview.slug} />
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
              <Link href={routes.home()} key={index}>
                <li
                  className="tag-default tag-pill tag-outline"
                >
                  {tag}
                </li>
              </Link>
            );
          })}
        </ul>
      </CustomLink>
    </div>
  );
};

export default ArticlePreview;
