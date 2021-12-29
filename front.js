// https://stackoverflow.com/questions/4825683/how-do-i-create-and-read-a-value-from-cookie/38699214#38699214
function setCookie(name, value, days, path = '/') {
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
exports.setCookie = setCookie

function setCookies(cookieDict, days, path = '/') {
  for (let key in cookieDict) {
    setCookie(key, cookieDict[key], days, path)
  }
}
exports.setCookie = setCookie

function getCookie(name) {
  return getCookieFromString(document.cookie, name)
}
exports.getCookie = getCookie

function getCookieFromReq(req, name) {
  const cookie = req.headers.cookie
  if (cookie) {
    return getCookieFromString(cookie, name)
  } else {
    return null
  }
}
exports.getCookieFromReq = getCookieFromReq

function getCookieFromString(s, name) {
  return getCookiesFromString(s)[name]
}
exports.getCookieFromString = getCookieFromString

// https://stackoverflow.com/questions/5047346/converting-strings-like-document-cookie-to-objects
function getCookiesFromString(s) {
  return s.split('; ').reduce((prev, current) => {
    const [name, ...value] = current.split('=')
    prev[name] = value.join('=')
    return prev
  }, {})
}
exports.getCookieFromString = getCookieFromString

function deleteCookie(name, path = '/') {
  setCookie(name, '', -1, path)
}
exports.deleteCookie = deleteCookie
