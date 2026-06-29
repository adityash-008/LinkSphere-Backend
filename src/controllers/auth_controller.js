const { validateSignUpData } = require("../utils/validation");
const bcrypt = require('bcrypt')
const User = require('../models/user')
const validator = require('validator')

// signup - API
async function userSignUp(req, res) {
    try {
        validateSignUpData(req);
        const { firstName,
            lastName,
            email,
            password,
            age,
            gender,
            photoURL,
            about,
            skills
        } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashPassword,
            age,
            gender,
            photoURL,
            about,
            skills
        })
        await user.save();

        res.status(201).send("User created Successfully!");
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
}

// login - API
async function userLogIn(req, res) {
    try {
        const { email, password } = req.body
        if (!validator.isEmail(email)) throw new Error("Invalid E-mail Address!")

        const user = await User.findOne({ email: email });
        if (!user) throw new Error("Invalid Credentials!")

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            throw new Error("Invalid Credentials!");
        } else {
            const token = await user.getJWT();
            const expiryDate = new Date(Date.now() + 1000 * 60 * 60 * 7 * 24); //7 days
            res.cookie("token", token, {
                expires: expiryDate,
                httpOnly: true,
                secure: true,
                sameSite: "None"
            });

            res.status(200).send(user);
        }
    } catch (err) {
        res.status(400).send("ERROR: " + err.message)
    }
}

// logout - API
async function userLogOut(req, res) {
    try {
        res.cookie("token", null, { expires: new Date(Date.now()) })
        res.status(200).send("LoggedOut Successfully!");
    } catch (err) {
        res.status(400).send("ERROR: " + err.message)
    }
}

module.exports = { userSignUp, userLogIn, userLogOut }