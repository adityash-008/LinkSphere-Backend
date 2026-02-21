const express = require('express')
const { getFeed,viewConnections,viewReceivedRequests,viewSentRequests } = require('../controllers/user_controller.js')
const { userAuth } = require('../middlewares/auth')

const userRouter = express.Router();

userRouter
.get('/feed', userAuth, getFeed)
.get('/connections',userAuth, viewConnections)
.get('/requests/received',userAuth, viewReceivedRequests)
.get('/requests/sent',userAuth, viewSentRequests)


module.exports = userRouter;
