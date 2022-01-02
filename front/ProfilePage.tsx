import { useRouter } from 'next/router'
import React from 'react'
import useSWR from 'swr'

import ArticleList from 'front/ArticleList'
import CustomLink from 'front/CustomLink'
import CustomImage from 'front/CustomImage'
import LoadingSpinner from 'front/LoadingSpinner'
import EditProfileButton from 'front/EditProfileButton'
import FollowUserButton, {
  FollowUserButtonContext,
} from 'front/FollowUserButton'
import fetcher from 'front/api'
import { apiPath } from 'front/config'
import useLoggedInUser from 'front/useLoggedInUser'
import { AppContext } from 'front/ts'
import routes from 'front/routes'

const ProfileHoc = (tab) => {
  return function ProfilePage({ profile, articles, articlesCount }) {
    const [page, setPage] = React.useState(0)
    const router = useRouter()
    const { data: profileApi } = useSWR(
      `${apiPath}/profiles/${profile?.username}`,
      fetcher(router.isFallback)
    )
    if (profileApi !== undefined) {
      profile = profileApi.profile
    }
    const username = profile?.username
    const bio = profile?.bio
    const image = profile?.image
    const loggedInUser = useLoggedInUser()
    const isCurrentUser = loggedInUser && username === loggedInUser?.username
    const [following, setFollowing] = React.useState(false)
    React.useEffect(() => {
      setFollowing(profile?.following)
    }, [profile?.following])
    const { setTitle } = React.useContext(AppContext)
    React.useEffect(() => {
      setTitle(username)
    }, [setTitle, username])
    if (router.isFallback) {
      return <LoadingSpinner />
    }
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
                  <FollowUserButtonContext.Provider
                    value={{ following, setFollowing }}
                  >
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
                        className={`nav-link${
                          tab === 'my-posts' ? ' active' : ''
                        }`}
                      >
                        My Posts
                      </CustomLink>
                    </li>
                    <li className="nav-item">
                      <CustomLink
                        href={routes.userViewLikes(
                          encodeURIComponent(username)
                        )}
                        className={`nav-link${
                          tab === 'favorites' ? ' active' : ''
                        }`}
                      >
                        Favorited Posts
                      </CustomLink>
                    </li>
                  </ul>
                </div>
                <ArticleList
                  {...{
                    articles,
                    articlesCount,
                    loggedInUser,
                    page,
                    setPage,
                    ssr: false,
                    what: tab,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default ProfileHoc
