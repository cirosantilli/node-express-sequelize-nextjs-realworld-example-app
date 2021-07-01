import React from "react";
import useSWR, { mutate } from "swr";

import UserAPI from "lib/api/user";
import { SERVER_BASE_URL } from "lib/utils/constant";
import storage from "lib/utils/storage";
import checkLogin from "lib/utils/checkLogin";

const FollowUserButton = ({
  profile,
}) => {
  const { data: currentUser } = useSWR("user", storage);
  const isLoggedIn = checkLogin(currentUser);
  const { username, following } = profile;
  const isCurrentUser = currentUser && username === currentUser?.username;
  if (!isLoggedIn || isCurrentUser) { return null; }
  const handleClick = (e) => {
    e.preventDefault();
    if (following) {
      mutate(
        `${SERVER_BASE_URL}/profiles/${username}`,
        { profile: { ...profile, following: false } },
        false
      );
      UserAPI.unfollow(username);
    } else {
      mutate(
        `${SERVER_BASE_URL}/profiles/${username}`,
        { profile: { ...profile, following: true } },
        false
      );
      UserAPI.follow(username);
    }
  };
  return (
    <button
      className={`btn btn-sm action-btn ${
        following ? "btn-secondary" : "btn-outline-secondary"
      }`}
      onClick={handleClick}
    >
      <i className="ion-plus-round" />
      {" "}&nbsp;{" "}
      {following ? "Unfollow" : "Follow"} {username}
    </button>
  );
};

export default FollowUserButton;
