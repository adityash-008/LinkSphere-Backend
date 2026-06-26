const express = require('express')
const { getChatMessages, getChatSummaries } = require('../controllers/chat_controller')
const { userAuth } = require('../middlewares/auth')

const chatRouter = express.Router()

chatRouter.get('/summary', userAuth, getChatSummaries)
chatRouter.get('/:targetUserId', userAuth, getChatMessages)

module.exports = chatRouter
