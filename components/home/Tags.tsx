import React from "react";

import CustomLink from "components/common/CustomLink";
import LoadingSpinner from "components/common/LoadingSpinner";
import useSWR from "swr";
import { SERVER_BASE_URL } from "lib/utils/constant";
import fetcher from "lib/utils/fetcher";
import ErrorMessage from "components/common/ErrorMessage";
import { AppContext } from "libts";

const Tags = ({setTab, setPage, setTag}) => {
  const { data, error } = useSWR(`${SERVER_BASE_URL}/tags`, fetcher());
  if (error) return <ErrorMessage message="Cannot load popular tags..." />;
  if (!data) return <LoadingSpinner />;
  const { tags } = data;
  return (
    <div className="tag-list">
      {tags?.map((tag) => (
        <CustomLink
          key={tag}
          href={``}
          className="tag-default tag-pill"
          onClick={() => {
            setTab('tag')
            setTag(tag)
            setPage(0)
          }}
        >
          {tag}
        </CustomLink>
      ))}
    </div>
  );
};

export default Tags;
