import React from "react";

import CustomLink from "components/common/CustomLink";
import LoadingSpinner from "components/common/LoadingSpinner";
import useSWR from "swr";
import { SERVER_BASE_URL } from "lib/utils/constant";
import fetcher from "lib/utils/fetcher";
import ErrorMessage from "components/common/ErrorMessage";
import { AppContext } from "libts";

const Tags = ({tags, setTab, setPage, setTag}) => {
  const { data, error } = useSWR(`${SERVER_BASE_URL}/tags`, fetcher());
  if (error) return <ErrorMessage message="Cannot load popular tags..." />;
  if (data) {
    ({ tags } = data);
  }
  return (
    <div className="tag-list">
      {tags?.map(tag => (
        <a
          className="tag-default tag-pill"
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
  );
};

export default Tags;
