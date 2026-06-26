const mongoose = require('mongoose')
const ConnectionRequest = require('../models/connectionRequest')
const ChatMessage = require('../models/chatMessage')

const getParticipantPair = (firstUserId, secondUserId) => {
  return [firstUserId, secondUserId]
    .map((id) => new mongoose.Types.ObjectId(id.toString()))
    .sort((left, right) => left.toString().localeCompare(right.toString()))
}

const getRoomId = (firstUserId, secondUserId) => {
  return [firstUserId, secondUserId].map((id) => id.toString()).sort().join('-')
}

const ensureConnection = async (firstUserId, secondUserId) => {
  const connection = await ConnectionRequest.findOne({
    status: 'accepted',
    $or: [
      { fromUserId: firstUserId, toUserId: secondUserId },
      { fromUserId: secondUserId, toUserId: firstUserId },
    ],
  })

  return connection
}

const markMessagesDeliveredForPair = async (receiverId, senderId) => {
  const deliveredAt = new Date()

  await ChatMessage.updateMany(
    {
      receiverId,
      senderId,
      deliveredAt: null,
    },
    {
      $set: { deliveredAt },
    }
  )

  const updatedMessages = await ChatMessage.find({
    receiverId,
    senderId,
    deliveredAt,
  }).select('_id deliveredAt')

  return {
    deliveredAt,
    messageIds: updatedMessages.map((message) => message._id.toString()),
  }
}

const markMessagesSeenForPair = async (receiverId, senderId) => {
  const seenAt = new Date()

  await ChatMessage.updateMany(
    {
      receiverId,
      senderId,
      seenAt: null,
    },
    {
      $set: { seenAt, deliveredAt: seenAt },
    }
  )

  const updatedMessages = await ChatMessage.find({
    receiverId,
    senderId,
    seenAt,
  }).select('_id seenAt deliveredAt')

  return {
    seenAt,
    deliveredAt: seenAt,
    messageIds: updatedMessages.map((message) => message._id.toString()),
  }
}

async function getChatMessages(req, res) {
  try {
    const loggedInUser = req.user
    const { targetUserId } = req.params

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user id' })
    }

    const isConnected = await ensureConnection(loggedInUser._id, targetUserId)
    if (!isConnected) {
      return res.status(403).json({ message: 'Chat allowed only for accepted connections' })
    }

    const participants = getParticipantPair(loggedInUser._id, targetUserId)
    const messages = await ChatMessage.find({ participants }).sort({ createdAt: 1 })

    return res.status(200).json({
      roomId: getRoomId(loggedInUser._id, targetUserId),
      messages,
    })
  } catch (error) {
    return res.status(400).send('ERROR: ' + error.message)
  }
}

async function getChatSummaries(req, res) {
  try {
    const loggedInUser = req.user
    const loggedInObjectId = new mongoose.Types.ObjectId(loggedInUser._id.toString())

    const summaries = await ChatMessage.aggregate([
      {
        $match: {
          participants: loggedInObjectId,
        },
      },
      {
        $addFields: {
          counterpartId: {
            $cond: [
              { $eq: ['$senderId', loggedInObjectId] },
              '$receiverId',
              '$senderId',
            ],
          },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$counterpartId',
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', loggedInObjectId] },
                    { $eq: ['$seenAt', null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          lastMessage: {
            $first: {
              _id: '$_id',
              senderId: '$senderId',
              receiverId: '$receiverId',
              text: '$text',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
              deliveredAt: '$deliveredAt',
              seenAt: '$seenAt',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          targetUserId: '$_id',
          unreadCount: 1,
          lastMessage: 1,
        },
      },
    ])

    return res.status(200).json({ summaries })
  } catch (error) {
    return res.status(400).send('ERROR: ' + error.message)
  }
}

module.exports = {
  ensureConnection,
  getChatMessages,
  getChatSummaries,
  getParticipantPair,
  getRoomId,
  markMessagesDeliveredForPair,
  markMessagesSeenForPair,
}
