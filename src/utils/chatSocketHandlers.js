const ChatMessage = require('../models/chatMessage')
const {
  ensureConnection,
  getParticipantPair,
  getRoomId,
  markMessagesDeliveredForPair,
  markMessagesSeenForPair,
} = require('../controllers/chat_controller')
const { isUserOnline } = require('./onlinePresence')

const emitChatError = (connectedSocket, message) => {
  connectedSocket.emit('chatError', { message })
}

const registerChatSocketHandlers = (io, connectedSocket) => {
  connectedSocket.on('joinChat', async ({ targetUserId }) => {
    try {
      if (!targetUserId) {
        return
      }

      const isConnected = await ensureConnection(connectedSocket.user._id, targetUserId)
      if (!isConnected) {
        emitChatError(connectedSocket, 'Connection required to join chat')
        return
      }

      const roomId = getRoomId(connectedSocket.user._id, targetUserId)
      connectedSocket.join(roomId)

      const deliveryUpdate = await markMessagesDeliveredForPair(connectedSocket.user._id, targetUserId)
      if (deliveryUpdate.messageIds.length > 0) {
        io.to(roomId).emit('messagesDelivered', {
          roomId,
          messageIds: deliveryUpdate.messageIds,
          deliveredAt: deliveryUpdate.deliveredAt,
        })
      }
    } catch (error) {
      emitChatError(connectedSocket, error.message)
    }
  })

  connectedSocket.on('markMessagesSeen', async ({ targetUserId }) => {
    try {
      if (!targetUserId) {
        return
      }

      const isConnected = await ensureConnection(connectedSocket.user._id, targetUserId)
      if (!isConnected) {
        emitChatError(connectedSocket, 'Connection required to view chat')
        return
      }

      const roomId = getRoomId(connectedSocket.user._id, targetUserId)
      const seenUpdate = await markMessagesSeenForPair(connectedSocket.user._id, targetUserId)

      if (seenUpdate.messageIds.length > 0) {
        io.to(roomId).emit('messagesSeen', {
          roomId,
          messageIds: seenUpdate.messageIds,
          deliveredAt: seenUpdate.deliveredAt,
          seenAt: seenUpdate.seenAt,
          seenBy: connectedSocket.user._id.toString(),
        })
      }
    } catch (error) {
      emitChatError(connectedSocket, error.message)
    }
  })

  connectedSocket.on('sendMessage', async ({ targetUserId, text, clientTempId }) => {
    try {
      const trimmedText = text?.trim()
      if (!targetUserId || !trimmedText) {
        return
      }

      const isConnected = await ensureConnection(connectedSocket.user._id, targetUserId)
      if (!isConnected) {
        emitChatError(connectedSocket, 'Connection required to send message')
        return
      }

      const roomId = getRoomId(connectedSocket.user._id, targetUserId)
      const deliveredAt = isUserOnline(targetUserId) ? new Date() : null
      const message = await ChatMessage.create({
        participants: getParticipantPair(connectedSocket.user._id, targetUserId),
        senderId: connectedSocket.user._id,
        receiverId: targetUserId,
        text: trimmedText,
        deliveredAt,
      })

      io.to(roomId).emit('messageReceived', {
        _id: message._id,
        roomId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
        clientTempId,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        deliveredAt: message.deliveredAt,
        seenAt: message.seenAt,
      })
    } catch (error) {
      emitChatError(connectedSocket, error.message)
    }
  })

  connectedSocket.on('typingStart', async ({ targetUserId }) => {
    try {
      if (!targetUserId) {
        return
      }

      const isConnected = await ensureConnection(connectedSocket.user._id, targetUserId)
      if (!isConnected) {
        return
      }

      const roomId = getRoomId(connectedSocket.user._id, targetUserId)
      connectedSocket.to(roomId).emit('typingStarted', {
        roomId,
        senderId: connectedSocket.user._id.toString(),
        targetUserId,
      })
    } catch (error) {
      emitChatError(connectedSocket, error.message)
    }
  })

  connectedSocket.on('typingStop', async ({ targetUserId }) => {
    try {
      if (!targetUserId) {
        return
      }

      const isConnected = await ensureConnection(connectedSocket.user._id, targetUserId)
      if (!isConnected) {
        return
      }

      const roomId = getRoomId(connectedSocket.user._id, targetUserId)
      connectedSocket.to(roomId).emit('typingStopped', {
        roomId,
        senderId: connectedSocket.user._id.toString(),
        targetUserId,
      })
    } catch (error) {
      emitChatError(connectedSocket, error.message)
    }
  })
}

module.exports = {
  registerChatSocketHandlers,
}
