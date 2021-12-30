import useSWR from 'swr'

import checkLogin from 'front/checkLogin'
import storage from 'front/localStorage'

// @return:
//   - undefined if we don't know
//   - null if not logged in
//
//     The distinction can be important to avoid unecessary API requests.
//   - user Object otherwise
export default function useLoggedInUser() {
  const { data: loggedInUser } = useSWR('user', storage)
  if (loggedInUser === undefined) return loggedInUser
  const isLoggedIn = checkLogin(loggedInUser)
  if (isLoggedIn) {
    return loggedInUser
  } else {
    return null
  }
}
