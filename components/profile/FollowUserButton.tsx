import React from "react";
import { mutate } from "swr";

import UserAPI from "lib/api/user";
import { SERVER_BASE_URL } from "lib/utils/constant";
import getLoggedInUser from "lib/utils/getLoggedInUser";

const FollowUserButton = ({
  profile,
}) => {
  const loggedInUser = getLoggedInUser()
  const { username, following } = profile;
  const isCurrentUser = loggedInUser && username === loggedInUser?.username;
  if (!loggedInUser || isCurrentUser) { return null; }
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
