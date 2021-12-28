import Head from "next/head";
import React from "react";

import ArticleList from "components/ArticleList";
import Maybe from "components/Maybe";
import Tags from "components/Tags";
import TabList from "components/TabList";
import { APP_NAME } from "lib/utils/constant";
import getLoggedInUser from "lib/utils/getLoggedInUser";
import { AppContext, resetIndexState } from 'libts'

const IndexPage = ({ articles, articlesCount, ssr, tags }) => {
  const { page, setPage, tab, setTab, tag, setTag } = React.useContext(AppContext)
  const loggedInUser = getLoggedInUser()
  React.useEffect(() => {
    resetIndexState(setPage, setTab, loggedInUser)
  }, [loggedInUser])
  return (
    <>
      <Head>
        <meta
          name="description"
          content="Next.js + SWR codebase containing realworld examples (CRUD, auth, advanced patterns, etc) that adheres to the realworld spec and API"
        />
      </Head>
      <div className="home-page">
        <Maybe test={!loggedInUser}>
          <div className="banner">
            <div className="container">
              <h1 className="logo-font">{APP_NAME.toLowerCase()}</h1>
              <p>A place to share your knowledge.</p>
            </div>
          </div>
        </Maybe>
        <div className="container page">
          <div className="row">
            <div className="col-md-9">
              <div className="feed-toggle">
                <TabList {...{tab, setTab, setPage, tag}} />
              </div>
              <ArticleList {...{
                articles,
                articlesCount,
                page,
                setPage,
                what: tab,
                ssr,
                tag,
              }}/>
            </div>
            <div className="col-md-3">
              <div className="sidebar">
                <p>Popular Tags</p>
                <Tags {...{tags, ssr, setTab, setTag, setPage}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default IndexPage;
