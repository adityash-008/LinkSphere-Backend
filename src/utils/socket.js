const socket = require('socket.io')
const { attachSocketUser } = require('./socketAuth')
const { registerChatSocketHandlers } = require('./chatSocketHandlers')
const { getOnlineUserIds, markUserOffline, markUserOnline } = require('./onlinePresence')

const intializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  })

  io.use(attachSocketUser)

  io.on('connection', (connectedSocket) => {
    const userId = connectedSocket.user._id.toString()
    const isNewlyOnline = markUserOnline(userId)

    connectedSocket.emit('presenceSnapshot', {
      onlineUserIds: getOnlineUserIds(),
    })

    if (isNewlyOnline) {
      io.emit('userPresence', {
        userId,
        isOnline: true,
      })
    }

    registerChatSocketHandlers(io, connectedSocket)

    connectedSocket.on('disconnect', () => {
      const isNowOffline = markUserOffline(userId)
      if (isNowOffline) {
        io.emit('userPresence', {
          userId,
          isOnline: false,
        })
      }
    })
  })
}

module.exports = intializeSocket
