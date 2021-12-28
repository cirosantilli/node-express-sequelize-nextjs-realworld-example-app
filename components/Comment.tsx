import React from "react";

import CustomLink from "components/CustomLink";
import CustomImage from "components/CustomImage";
import Maybe from "components/Maybe";
import DeleteButton from "components/DeleteButton";
import { formatDate } from "lib/utils/date";
import useLoggedInUser from "lib/utils/useLoggedInUser";
import routes from "routes";

const Comment = ({ comment }) => {
  const loggedInUser = useLoggedInUser()
  const canModify =
    loggedInUser && loggedInUser?.username === comment?.author?.username;
  return (
    <div className="card">
      <div className="card-block">
        {comment.body}
      </div>
      <div className="card-footer">
        <CustomLink
          href={routes.userView(comment.author.username)}
          className="comment-author"
        >
          <CustomImage
            src={comment.author.image}
            alt="author profile image"
            className="comment-author-img"
          />
        </CustomLink>
        &nbsp;
        <CustomLink
          href={routes.userView(comment.author.username)}
          className="comment-author"
        >
          {comment.author.username}
        </CustomLink>
        <span className="date-posted">{formatDate(comment.createdAt)}</span>
        <Maybe test={canModify}>
          <DeleteButton commentId={comment.id} />
        </Maybe>
      </div>
    </div>
  );
};

export default Comment;
