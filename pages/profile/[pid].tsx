import { useRouter } from "next/router";
import React from "react";
import useSWR, { mutate, trigger } from "swr";

import ArticleList from "components/article/ArticleList";
import CustomImage from "components/common/CustomImage";
import ErrorMessage from "components/common/ErrorMessage";
import LoadingSpinner from "components/common/LoadingSpinner";
import Maybe from "components/common/Maybe";
import NavLink from "components/common/NavLink";
import EditProfileButton from "components/profile/EditProfileButton";
import FollowUserButton from "components/profile/FollowUserButton";
import UserAPI from "lib/api/user";
import { usePageDispatch } from "lib/context/PageContext";
import checkLogin from "lib/utils/checkLogin";
import { SERVER_BASE_URL } from "lib/utils/constant";
import fetcher from "lib/utils/fetcher";
import storage from "lib/utils/storage";

const Profile = ({ profile }) => {
  const router = useRouter();
  if (router.isFallback) {
    return <LoadingSpinner />;
  }
  const setPage = usePageDispatch();
  const {
    query: { pid },
  } = router;
  const { username, bio, image, following } = profile;
  const { data: currentUser } = useSWR("user", storage);
  const isLoggedIn = checkLogin(currentUser);
  const isUser = currentUser && username === currentUser?.username;
  const handleFollow = async () => {
    mutate(
      `${SERVER_BASE_URL}/profiles/${pid}`,
      { profile: { ...profile, following: true } },
      false
    );
    UserAPI.follow(pid);
    trigger(`${SERVER_BASE_URL}/profiles/${pid}`);
  };
  const handleUnfollow = async () => {
    mutate(
      `${SERVER_BASE_URL}/profiles/${pid}`,
      { profile: { ...profile, following: true } },
      true
    );
    UserAPI.unfollow(pid);
    trigger(`${SERVER_BASE_URL}/profiles/${pid}`);
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
                  <NavLink
                    href="/profile/[pid]"
                    as={`/profile/${encodeURIComponent(username)}`}
                  >
                    <span onClick={() => setPage(0)}>My Articles</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    href="/profile/[pid]?favorite=true"
                    as={`/profile/${encodeURIComponent(username)}?favorite=true`}
                  >
                    <span onClick={() => setPage(0)}>Favorited Articles</span>
                  </NavLink>
                </li>
              </ul>
            </div>
            <ArticleList />
          </div>
        </div>
      </div>
    </div>
  );
};

// Server

import { GetStaticProps, GetStaticPaths } from 'next'
import sequelize from "lib/db";
const configModule = require("../../config");

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    fallback: true,
    paths: (await sequelize.models.User.findAll({order: [['username', 'ASC']]})).map(
      user => {
        return {
          params: {
            pid: user.username,
          }
        }
      }
    ),
  }
}

export const getStaticProps: GetStaticProps = async ({ params: { pid } }) => {
  const user = await sequelize.models.User.findOne({
    where: { username: pid },
  })
  if (!user) {
    return {
      notFound: true
    }
  }
  return {
    revalidate: configModule.revalidate,
    props: { profile: await user.toProfileJSONFor() },
  }
}

export default Profile;
