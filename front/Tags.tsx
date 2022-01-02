import React from 'react'

import useSWR from 'swr'
import fetcher from 'front/api'
import { apiPath } from 'front/config'
import ErrorMessage from 'front/ErrorMessage'

const Tags = ({ tags, ssr, setTab, setPage, setTag }) => {
  const { data, error } = useSWR(ssr ? null : `${apiPath}/tags`, fetcher())
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
