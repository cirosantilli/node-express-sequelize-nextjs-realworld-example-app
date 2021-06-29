import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

import CustomLink from "components/common/CustomLink";
import Maybe from "components/common/Maybe";
import checkLogin from "lib/utils/checkLogin";
import storage from "lib/utils/storage";

const TabList = ({tab, setTab}) => {
  const { data: currentUser } = useSWR("user", storage);
  const isLoggedIn = checkLogin(currentUser);
  const router = useRouter();
  const {
    query: { tag },
  } = router;
  if (!isLoggedIn) {
    return (
      <ul className="nav nav-pills outline-active">
        <li className="nav-item">
          <CustomLink className="nav-link" href="/" as="/">
            Global Feed
          </CustomLink>
        </li>
        <Maybe test={!!tag}>
          <li className="nav-item">
            <CustomLink
              href={`/?tag=${tag}`}
              as={`/?tag=${tag}`}
              className="nav-link active"
            >
              <i className="ion-pound" /> {tag}
            </CustomLink>
          </li>
        </Maybe>
      </ul>
    );
  }
  return (
    <ul className="nav nav-pills outline-active">
      <li className="nav-item">
        <CustomLink
          className={`nav-link${tab === 'feed' ? ' active' : ''}`}
          href="/"
          as="/"
          onClick={() => {setTab('feed')}}
        >
          Your Feed
        </CustomLink>
      </li>
      <li className="nav-item">
        <CustomLink
          className={`nav-link${tab === 'global' ? ' active' : ''}`}
          href="/"
          as="/"
          onClick={() => {
            setTab('global')
          }}
        >
          Global Feed
        </CustomLink>
      </li>
      <Maybe test={!!tag}>
        <li className="nav-item">
          <CustomLink
            href={`/?tag=${tag}`}
            as={`/?tag=${tag}`}
            className="nav-link active"
          >
            <i className="ion-pound" /> {tag}
          </CustomLink>
        </li>
      </Maybe>
    </ul>
  );
};

export default TabList;
