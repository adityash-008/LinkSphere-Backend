const ConnectionRequest = require('../models/connectionRequest')
const User = require('../models/user')

//Send Connection Request API status:- interested,ignored
async function sendRequest(req, res) {
    try {
        const toUserId = req.params.toUserId
        const fromUserId = req.user._id
        const status = req.params.status

        //Validating status
        const allowedStatus = ["interested", "ignored"]
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid Status Type: " + status
            })
        }

        //Validate- Is request already Exist ??
        const isRequestExist = await ConnectionRequest.findOne({
            $or: [{ fromUserId, toUserId }, { fromUserId: toUserId, toUserId: fromUserId }]
        })
        if (isRequestExist) {
            return res.status(400).json({ message: "Request Already Exist" })
        }

        //Validate- toUser really exist or not?
        const isToUserExist = await User.findById(toUserId)
        if (!isToUserExist) {
            return res.status(404).send("User Not Found!")
        }

        const connnectionData = await new ConnectionRequest({
            toUserId,
            fromUserId,
            status
        })
        await connnectionData.save()

        return res.status(200).json({
            message: "Request Sent ",
            connnectionData
        })
    } catch (err) {
        return res.status(400).send("ERROR: " + err.message)
    }
}

//Review Connection Request-API status-> accepted,rejected
async function reviewRequest(req, res) {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        //Validate Status
        const allowedStatuses = ["accepted", "rejected"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid Status or Status not allowed",
                success: false,
            });
        }

        //validating the request
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });

        if (!connectionRequest) {
            return res.status(404).json({
                message: "Request not found "
            });
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();

        res.status(200).json({
            message: "Connection request " + status,
            data
        });
    } catch (error) {
        res.status(400).send("ERROR:" + error.message);
    }
}


module.exports = {
    sendRequest,
    reviewRequest
}
