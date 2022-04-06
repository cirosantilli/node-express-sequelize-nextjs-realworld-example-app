import useSWR from 'swr'

import { AUTH_COOKIE_NAME, AUTH_LOCAL_STORAGE_NAME, getCookie } from 'front'
import checkLogin from 'front/checkLogin'
import storage from 'front/localStorageHelper'

export default function useLoggedInUser() {
  const { data: authCookie } = useSWR('auth/cookie', () => {
    const ret = getCookie(AUTH_COOKIE_NAME)
    if (!ret) {
      // E.g. if the test database was nuked, the GET request sees wrong auth,
      // and removes the cookie with a HEADER. And now here we noticed that on
      // the JavaSript, so we get rid of it. Notably, this removes the logged in
      // user from the navbar.
      //
      // This also happens if a user account is rotated on the demo database,
      // and the user comes back some time later.
      window.localStorage.removeItem(AUTH_LOCAL_STORAGE_NAME)
    }
    return ret
  })
  const { data: loggedInUser } = useSWR(
    () => (authCookie ? 'user' : null),
    storage
  )
  if (loggedInUser === undefined) return loggedInUser
  const isLoggedIn = checkLogin(loggedInUser)
  if (isLoggedIn) {
    return loggedInUser
  } else {
    return null
  }
}
