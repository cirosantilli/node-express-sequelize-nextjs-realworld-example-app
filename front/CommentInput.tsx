import axios from 'axios'
import { useRouter } from 'next/router'
import React from 'react'
import { trigger } from 'swr'

import CustomImage from 'front/CustomImage'
import CustomLink from 'front/CustomLink'
import { apiPath } from 'front/config'
import useLoggedInUser from 'front/useLoggedInUser'
import { useCtrlEnterSubmit } from 'front/ts'
import routes from 'front/routes'

const CommentInput = () => {
  const loggedInUser = useLoggedInUser()
  const router = useRouter()
  const {
    query: { pid },
  } = router
  const [content, setContent] = React.useState('')
  const [isLoading, setLoading] = React.useState(false)
  const handleChange = React.useCallback((e) => {
    setContent(e.target.value)
  }, [])
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await axios.post(
      `${apiPath}/articles/${encodeURIComponent(String(pid))}/comments`,
      JSON.stringify({
        comment: {
          body: content,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${encodeURIComponent(loggedInUser?.token)}`,
        },
      }
    )
    setLoading(false)
    setContent('')
    trigger(`${apiPath}/articles/${pid}/comments`)
  }
  useCtrlEnterSubmit(handleSubmit)
  if (!loggedInUser) {
    return (
      <>
        <CustomLink href={routes.userLogin()}>Sign in</CustomLink> or{' '}
        <CustomLink href={routes.userNew()}>sign up</CustomLink> to add comments
        on this article.
      </>
    )
  }
  return (
    <>
      <ul className="error-messages">
        {/* TODO. Reference does not handle those errors either right now.
        but the unconditional (and likely buggy) presence of this is visible. */}
      </ul>
      <form className="card comment-form" onSubmit={handleSubmit}>
        <fieldset>
          <div className="card-block">
            <textarea
              rows={3}
              className="form-control"
              placeholder="Write a comment..."
              value={content}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="card-footer">
            <CustomImage
              className="comment-author-img"
              src={loggedInUser.effectiveImage}
              alt="author profile image"
            />
            <button className="btn btn-sm btn-primary" type="submit">
              Post Comment
            </button>
          </div>
        </fieldset>
      </form>
    </>
  )
}

export default CommentInput
