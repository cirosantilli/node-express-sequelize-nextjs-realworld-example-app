import React from 'react'

import CustomLink from 'front/CustomLink'
import CustomImage from 'front/CustomImage'
import Maybe from 'front/Maybe'
import DeleteButton from 'front/DeleteButton'
import { formatDate } from 'front/date'
import useLoggedInUser from 'front/useLoggedInUser'
import routes from 'front/routes'

const Comment = ({ comment }) => {
  const loggedInUser = useLoggedInUser()
  const canModify =
    loggedInUser && loggedInUser?.username === comment?.author?.username
  return (
    <div className="card">
      <div className="card-block">{comment.body}</div>
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
  )
}

export default Comment
