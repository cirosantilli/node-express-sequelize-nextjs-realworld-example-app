const jwt = require('express-jwt')

const secret = require('./front/config').secret

function getTokenFromHeader(authorization) {
  if (
    (authorization && authorization.split(' ')[0] === 'Token') ||
    (authorization && authorization.split(' ')[0] === 'Bearer')
  ) {
    return authorization.split(' ')[1]
  }
  return null
}

function getTokenFromRequest(req) {
  let ret = getTokenFromHeader(req.headers.authorization)
  if (ret) return ret
  // If one day we want to allow API GET requests with the cookie.
  // Does not work for Next.js routes.
  //if (
  //  req.method === 'GET' ||
  //  req.method === 'HEAD' ||
  //  req.method === 'OPTIONS'
  //) {
  //  ret = front.getCookieFromReq(req, 'auth')
  //  if (ret)
  //    return ret
  //}
  return null
}

module.exports = {
  required: jwt({
    secret: secret,
    userProperty: 'payload',
    getToken: getTokenFromRequest,
  }),
  optional: jwt({
    secret: secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromRequest,
  }),
}
