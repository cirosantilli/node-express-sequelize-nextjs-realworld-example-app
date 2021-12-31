import React from 'react'
import Router from 'next/router'

import UserAPI from 'front/api/user'
import useLoggedInUser from 'front/useLoggedInUser'

export const FollowUserButtonContext = React.createContext(undefined)

const FollowUserButton = ({ profile }) => {
  const loggedInUser = useLoggedInUser()
  const { following, setFollowing } = React.useContext(FollowUserButtonContext)
  const { username } = profile
  const isCurrentUser = loggedInUser && username === loggedInUser?.username
  if (loggedInUser && isCurrentUser) {
    return null
  }
  const handleClick = (e) => {
    e.preventDefault()
    if (!loggedInUser) {
      Router.push(`/user/login`)
      return
    }
    if (following) {
      UserAPI.unfollow(username)
    } else {
      UserAPI.follow(username)
    }
    setFollowing(!following)
  }
  return (
    <button
      className={`btn btn-sm action-btn ${
        following ? 'btn-secondary' : 'btn-outline-secondary'
      }`}
      onClick={handleClick}
    >
      <i className="ion-plus-round" /> &nbsp;{' '}
      {following ? 'Unfollow' : 'Follow'} {username}
    </button>
  )
}

export default FollowUserButton
