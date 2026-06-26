const mongoose = require('mongoose')

const chatMessageSchema = new mongoose.Schema({
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    validate(value) {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error('Chat must have exactly two participants')
      }
    },
    ref: 'User',
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
  seenAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true })

chatMessageSchema.index({ participants: 1, createdAt: 1 })
chatMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 })
chatMessageSchema.index({ receiverId: 1, seenAt: 1, createdAt: 1 })

module.exports = mongoose.model('ChatMessage', chatMessageSchema)
