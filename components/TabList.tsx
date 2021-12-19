import { useRouter } from "next/router";
import React from "react";

import CustomLink from "components/CustomLink";
import Maybe from "components/Maybe";
import getLoggedInUser from "lib/utils/getLoggedInUser";
import routes from "routes";

const TabList = ({tab, setTab, setPage, tag}) => {
  const loggedInUser = getLoggedInUser()
  return (
    <ul className="nav nav-pills outline-active">
      <Maybe test={loggedInUser}>
        <li className="nav-item">
          <CustomLink
            className={`nav-link${tab === 'feed' ? ' active' : ''}`}
            href={routes.home()}
            onClick={() => {
              setPage(0)
              setTab('feed')
            }}
            shallow
          >
            Your Feed
          </CustomLink>
        </li>
      </Maybe>
      <li className="nav-item">
        <CustomLink
          className={`nav-link${tab === 'global' ? ' active' : ''}`}
          href={routes.home()}
          shallow
          onClick={() => {
            setPage(0)
            setTab('global')
          }}
        >
          Global Feed
        </CustomLink>
      </li>
      <Maybe test={tab === 'tag'}>
        <li className="nav-item">
          <CustomLink
            href={routes.home()}
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
