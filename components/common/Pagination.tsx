import React from "react";
import { trigger } from "swr";

import Maybe from "./Maybe";
import { usePageDispatch, usePageState } from "lib/context/PageContext";
import { AppContext } from "libts";

interface PaginationProps {
  total: number;
  limit: number;
  showPagesMax: number;
  currentPage: number;
  lastIndex: number;
  fetchURL: string;
}

function PaginationItem(props) {
  const newProps = Object.assign({}, props)
  delete newProps.children
  delete newProps.className
  let className;
  if (props.className) {
    className = ' ' + props.className
  } else {
    className = ''
  }
  return (
    <li className={`page-item${className}`} {...newProps}>
      <a className="page-link">{props.children}</a>
    </li>
  )
}

export const getRange = (start, end) => {
  return [...Array(end - start + 1)].map((_, i) => start + i);
};

export const getPageInfo = ({ limit, showPagesMax, total, page }) => {
  const totalPages = Math.floor(total / limit);
  let currentPage = page;
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  let firstPage = Math.max(0, currentPage - Math.floor(showPagesMax / 2));
  let lastPage = Math.min(totalPages, currentPage + Math.floor(showPagesMax / 2));
  if (lastPage - firstPage + 1 < showPagesMax) {
    if (currentPage < totalPages / 2) {
      lastPage = Math.min(
        totalPages,
        lastPage + (showPagesMax - (lastPage - firstPage))
      );
    } else {
      firstPage = Math.max(1, firstPage - (showPagesMax - (lastPage - firstPage)));
    }
  }
  if (lastPage - firstPage + 1 > showPagesMax) {
    if (currentPage > totalPages / 2) {
      firstPage = firstPage + 1;
    } else {
      lastPage = lastPage - 1;
    }
  }
  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const hasPreviousPage = currentPage > 0;
  const hasNextPage = currentPage < totalPages;
  return {
    firstPage,
    lastPage,
    previousPage,
    nextPage,
    hasPreviousPage,
    hasNextPage,
    totalPages,
  };
};

const Pagination = ({
  total,
  limit,
  showPagesMax,
  currentPage,
  lastIndex,
  fetchURL,
}: PaginationProps) => {
  const { page, setPage } = React.useContext(AppContext)
  const { firstPage, lastPage, hasPreviousPage, hasNextPage } = getPageInfo({
    limit,
    showPagesMax,
    total,
    page: currentPage,
  });
  const pages = total > 0 ? getRange(firstPage, lastPage) : [];

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
      e.preventDefault();
      setPage(index);
      trigger(fetchURL);
    },
    []
  );

  const handleFirstClick = React.useCallback(
    (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      e.preventDefault();
      setPage(0);
      trigger(fetchURL);
    },
    []
  );

  const handlePrevClick = React.useCallback(
    (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      e.preventDefault();
      setPage(page - 1);
      trigger(fetchURL);
    },
    []
  );

  const handleNextClick = React.useCallback(
    (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      e.preventDefault();
      setPage(page + 1);
      trigger(fetchURL);
    },
    []
  );

  const handleLastClick = React.useCallback(
    (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      e.preventDefault();
      setPage(lastIndex);
      trigger(fetchURL);
    },
    []
  );

  return (
    <nav>
      <ul className="pagination">
        <PaginationItem onClick={handleFirstClick}>{`<<`}</PaginationItem>
        <Maybe test={hasPreviousPage}>
          <PaginationItem onClick={handlePrevClick}>{`<`}</PaginationItem>
        </Maybe>
        {pages.map((page) => {
          const isCurrent = !currentPage ? page === 0 : page === currentPage;
          return (
            <PaginationItem
              key={page.toString()}
              className={isCurrent && "active"}
              onClick={(e) => handleClick(e, page)}
            >
              {page + 1}
            </PaginationItem>
          );
        })}
        <Maybe test={hasNextPage}>
          <PaginationItem onClick={handleNextClick}>{`>`}</PaginationItem>
        </Maybe>
        <PaginationItem onClick={handleLastClick}>{`>>`}</PaginationItem>
      </ul>
    </nav>
  );
};

export default Pagination;
