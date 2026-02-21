const {validateEditProfileData} = require('../utils/validation')
const {User} = require('../models/user')
const bcrypt = require('bcrypt')

// viewUser API
async function viewUserProfile(req,res) {
    try {
        const user = await req.user;
        res.status(200).send(user);
    } catch (err) {
        res.status(400).send("ERROR: " + err.message)
    }
}

// editUser API
async function editUserProfile(req,res){
    try {
        if(!validateEditProfileData(req)){
            throw new Error("Invalid Edit requests")
        }         
        const loggedInUser = req.user
        
        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

        await  loggedInUser.save();
        res.status(200).json({message: `${loggedInUser.firstName}, your profile updated Successfully!`,
        data: loggedInUser,
        })
    } catch (err) {
        res.status(400).send("ERROR: " + err.message)
    }
}

// editPassword API
async function changeUserPassword(req,res){
    try {
        
        const {oldPassword, newPassword} = req.body;
        const user = req.user;
        const isPasswordValid = await user.validatePassword(oldPassword)
        if(!isPasswordValid) throw new Error("Enter Correct Password")

        const passwordHash = await bcrypt.hash(newPassword,10);
        
        await user.updateOne({password: passwordHash});

        res.status(200).send("Password Updated Successfully!")

    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
}


module.exports = {viewUserProfile, editUserProfile, changeUserPassword}
