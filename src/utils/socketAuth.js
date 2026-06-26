const jwt = require('jsonwebtoken')
const User = require('../models/user')

const parseCookies = (cookieHeader = '') => {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, cookie) => {
      const separatorIndex = cookie.indexOf('=')
      if (separatorIndex === -1) {
        return accumulator
      }

      const key = cookie.slice(0, separatorIndex)
      const value = decodeURIComponent(cookie.slice(separatorIndex + 1))
      accumulator[key] = value
      return accumulator
    }, {})
}

const attachSocketUser = async (incomingSocket, next) => {
  try {
    const cookies = parseCookies(incomingSocket.handshake.headers.cookie)
    const token = cookies.token
    if (!token) {
      return next(new Error('Authentication required'))
    }

    const decodedData = jwt.verify(token, process.env.JWT_KEY)
    const user = await User.findById(decodedData._id)
    if (!user) {
      return next(new Error('User not found'))
    }

    incomingSocket.user = user
    return next()
  } catch (error) {
    return next(new Error('Invalid socket authentication'))
  }
}

module.exports = {
  attachSocketUser,
  parseCookies,
}
