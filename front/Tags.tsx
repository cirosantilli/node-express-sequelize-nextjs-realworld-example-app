import React from 'react'

import CustomLink from 'front/CustomLink'
import LoadingSpinner from 'front/LoadingSpinner'
import useSWR from 'swr'
import { SERVER_BASE_URL } from 'lib/utils/constant'
import fetcher from 'front/api'
import ErrorMessage from 'front/ErrorMessage'
import { AppContext } from 'libts'

const Tags = ({ tags, ssr, setTab, setPage, setTag }) => {
  const { data, error } = useSWR(
    ssr ? null : `${SERVER_BASE_URL}/tags`,
    fetcher()
  )
  if (error) return <ErrorMessage message="Cannot load popular tags..." />
  if (data) {
    ;({ tags } = data)
  }
  return (
    <div className="tag-list">
      {tags?.map((tag) => (
        <a
          className="link tag-default tag-pill"
          key={tag}
          onClick={() => {
            setTab('tag')
            setTag(tag)
            setPage(0)
          }}
        >
          {tag}
        </a>
      ))}
    </div>
  )
}

export default Tags
