import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import useSWR  from "swr";

import ArticleList from "components/ArticleList";
import CustomLink from "components/CustomLink";
import CustomImage from "components/CustomImage";
import LoadingSpinner from "components/LoadingSpinner";
import Maybe from "components/Maybe";
import EditProfileButton from "components/EditProfileButton";
import FollowUserButton, { FollowUserButtonContext } from "components/FollowUserButton";
import { SERVER_BASE_URL } from "lib/utils/constant";
import fetcher from "lib/utils/fetcher";
import getLoggedInUser from "lib/utils/getLoggedInUser";
import { AppContext } from 'libts'
import routes from "routes";

const ProfileHoc = tab => {
  return ({ profile, articles, articlesCount }) => {
    const [page, setPage] = React.useState(0)
    const router = useRouter();
    const { data: profileApi, error } = useSWR(`${SERVER_BASE_URL}/profiles/${profile?.username}`, fetcher(router.isFallback));
    if (profileApi !== undefined) {
      profile = profileApi.profile
    }
    const username = profile?.username
    const bio = profile?.bio
    const image = profile?.image
    const loggedInUser = getLoggedInUser()
    const isCurrentUser = loggedInUser && username === loggedInUser?.username
    const [following, setFollowing] = React.useState(false)
    React.useEffect(() => { setFollowing(profile?.following) }, [profile?.following])
    const {setTitle} = React.useContext(AppContext)
    React.useEffect(() => { setTitle(username) }, [username])
    if (router.isFallback) { return <LoadingSpinner />; }
    return (
      <>
        <div className="profile-page">
          <div className="user-info">
            <div className="container">
              <div className="row">
                <div className="col-xs-12 col-md-10 offset-md-1">
                  <CustomImage
                    src={image}
                    alt="User's profile image"
                    className="user-img"
                  />
                  <h4>{username}</h4>
                  <p>{bio}</p>
                  <EditProfileButton isCurrentUser={isCurrentUser} />
                  <FollowUserButtonContext.Provider value={{following, setFollowing}}>
                    <FollowUserButton profile={profile} />
                  </FollowUserButtonContext.Provider>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row">
              <div className="col-xs-12 col-md-10 offset-md-1">
                <div className="articles-toggle">
                  <ul className="nav nav-pills outline-active">
                    <li className="nav-item">
                      <CustomLink
                        href={routes.userView(encodeURIComponent(username))}
                        className={`nav-link${tab === 'my-posts' ? ' active' : ''}`}
                      >
                        My Posts
                      </CustomLink>
                    </li>
                    <li className="nav-item">
                      <CustomLink
                        href={routes.userViewLikes(encodeURIComponent(username))}
                        className={`nav-link${tab === 'favorites' ? ' active' : ''}`}
                      >
                        Favorited Posts
                      </CustomLink>
                    </li>
                  </ul>
                </div>
                <ArticleList {...{articles, articlesCount, page, setPage, what: tab}} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };
}

export default ProfileHoc;
