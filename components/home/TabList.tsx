import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

import CustomLink from "components/common/CustomLink";
import Maybe from "components/common/Maybe";
import checkLogin from "lib/utils/checkLogin";
import storage from "lib/utils/storage";

const TabList = ({tab, setTab, tag}) => {
  const { data: currentUser } = useSWR("user", storage);
  const isLoggedIn = checkLogin(currentUser);
  if (!isLoggedIn) {
    return (
      <ul className="nav nav-pills outline-active">
        <li className="nav-item">
          <CustomLink className="nav-link" href="/" shallow>
            Global Feed
          </CustomLink>
        </li>
        <Maybe test={tab == 'tag'}>
          <li className="nav-item">
            <CustomLink
              href="/"
              className="nav-link active"
              shallow
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
          onClick={() => {setTab('feed')}}
          shallow
        >
          Your Feed
        </CustomLink>
      </li>
      <li className="nav-item">
        <CustomLink
          className={`nav-link${tab === 'global' ? ' active' : ''}`}
          href="/"
          shallow
          onClick={() => {
            setTab('global')
          }}
        >
          Global Feed
        </CustomLink>
      </li>
      <Maybe test={tab == 'tag'}>
        <li className="nav-item">
          <CustomLink
            href={`/`}
            className="nav-link active"
            shallow
          >
            <i className="ion-pound" /> {tag}
          </CustomLink>
        </li>
      </Maybe>
    </ul>
  );
};

export default TabList;
