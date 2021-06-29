import { useRouter } from "next/router";
import React from "react";
import useSWR, { mutate, trigger } from "swr";

import ArticleList from "components/article/ArticleList";
import CustomLink from "components/common/CustomLink";
import CustomImage from "components/common/CustomImage";
import ErrorMessage from "components/common/ErrorMessage";
import LoadingSpinner from "components/common/LoadingSpinner";
import Maybe from "components/common/Maybe";
import EditProfileButton from "components/profile/EditProfileButton";
import FollowUserButton from "components/profile/FollowUserButton";
import UserAPI from "lib/api/user";
import { usePageDispatch } from "lib/context/PageContext";
import checkLogin from "lib/utils/checkLogin";
import { SERVER_BASE_URL } from "lib/utils/constant";
import fetcher from "lib/utils/fetcher";
import storage from "lib/utils/storage";

const ProfileHoc = (tab) => {
  return ({ profile }) => {
    const router = useRouter();
    if (router.isFallback) { return <LoadingSpinner />; }
    const { data: profileApi, error } = useSWR(`${SERVER_BASE_URL}/profiles/${profile.username}`, fetcher);
    if (profileApi !== undefined) {
      profile = profileApi.profile
    }
    const setPage = usePageDispatch();
    const { query: { pid } } = router;
    const { username, bio, image, following } = profile;
    const { data: currentUser } = useSWR("user", storage);
    const isLoggedIn = checkLogin(currentUser);
    const isUser = currentUser && username === currentUser?.username;
    const handleFollow = async () => {
      // This is what makes the render re-trigger and changes button state.
      mutate(
        `${SERVER_BASE_URL}/profiles/${pid}`,
        { profile: { ...profile, following: true } },
        // No need to actually fetch the updated value from the server,
        // we can just calculate it locally from the user's action.
        false
      );
      await UserAPI.follow(pid);
    };
    const handleUnfollow = async () => {
      mutate(
        `${SERVER_BASE_URL}/profiles/${pid}`,
        { profile: { ...profile, following: false } },
        false
      );
      await UserAPI.unfollow(pid);
    };
    return (
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
                <EditProfileButton isUser={isUser} />
                <Maybe test={isLoggedIn}>
                  <FollowUserButton
                    isUser={isUser}
                    username={username}
                    following={following}
                    follow={handleFollow}
                    unfollow={handleUnfollow}
                  />
                </Maybe>
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
                      href="/profile/[pid]"
                      as={`/profile/${encodeURIComponent(username)}`}
                      className={`nav-link${tab === 'my-posts' ? ' active' : ''}`}
                    >
                      My Posts
                    </CustomLink>
                  </li>
                  <li className="nav-item">
                    <CustomLink
                      href="/profile/[pid]/favorites"
                      as={`/profile/${encodeURIComponent(username)}/favorites`}
                      className={`nav-link${tab === 'favorites' ? ' active' : ''}`}
                    >
                      <span onClick={() => setPage(0)}>Favorited Posts</span>
                    </CustomLink>
                  </li>
                </ul>
              </div>
              <ArticleList what={tab} />
            </div>
          </div>
        </div>
      </div>
    );
  };
}

export default ProfileHoc;
