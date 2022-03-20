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
  for (let key in cookieDict) {
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
