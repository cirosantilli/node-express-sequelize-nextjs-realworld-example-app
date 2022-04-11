import UserAPI from 'front/api/user'
import { mutate } from 'swr'

export const AUTH_COOKIE_NAME = 'auth'
export const AUTH_LOCAL_STORAGE_NAME = 'user'

// https://stackoverflow.com/questions/4825683/how-do-i-create-and-read-a-value-from-cookie/38699214#38699214
export function setCookie(name, value, days?: number, path = '/') {
  let delta
  if (days === undefined) {
    delta = Number.MAX_SAFE_INTEGER
  } else {
    delta = days * 864e5
  }
  const expires = new Date(Date.now() + delta).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(
    value
  )};expires=${expires};path=${path}`
}

export function setCookies(cookieDict, days?: number, path = '/') {
  for (const key in cookieDict) {
    setCookie(key, cookieDict[key], days, path)
  }
}

export function getCookie(name) {
  return getCookieFromString(document.cookie, name)
}

export function getCookieFromReq(req, name) {
  const cookie = req.headers.cookie
  if (cookie) {
    return getCookieFromString(cookie, name)
  } else {
    return null
  }
}

export function getCookieFromString(s, name) {
  return getCookiesFromString(s)[name]
}

// https://stackoverflow.com/questions/5047346/converting-strings-like-document-cookie-to-objects
export function getCookiesFromString(s) {
  return s.split('; ').reduce((prev, current) => {
    const [name, ...value] = current.split('=')
    prev[name] = value.join('=')
    return prev
  }, {})
}

export function deleteCookie(name, path = '/') {
  setCookie(name, '', -1, path)
}

export async function setupUserLocalStorage(data, setErrors) {
  // We fetch from /profiles/:username again because the return from /users/login above
  // does not contain the image placeholder.
  const { data: profileData, status: profileStatus } = await UserAPI.get(
    data.user.username
  )
  if (profileStatus !== 200) {
    setErrors(profileData.errors)
  }
  data.user.effectiveImage = profileData.profile.image
  window.localStorage.setItem(
    AUTH_LOCAL_STORAGE_NAME,
    JSON.stringify(data.user)
  )
  setCookie(AUTH_COOKIE_NAME, data.user.token)
  mutate(AUTH_LOCAL_STORAGE_NAME, data.user)
}
