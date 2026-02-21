const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userschema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        
        trim: true,
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique:true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)) throw new Error("Invalid E-mail Address!"+err)
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        validate(value){
            if(!["Male","Female","Others"].includes(value)){
                throw new Error("Invalid field!")              
            }
        }
    },
    photoURL: {
        type: String,
        validate(value){
            if(!validator.isURL(value)) throw new Error("Invalid URL!"+error)
        }
    },
    about: {
        type: String,
        default: "This is about user",
    },
    skills: {
        type: [String],
        maxlength: 6,
    }
},{timestamps: true})

//Compound Indexes
userschema.index({ firstName: 1, lastName: 1 });

 userschema.methods.getJWT = async function(){ //Do not use => function because of "this"
    const user = this

    const token = await jwt.sign({_id:user._id},"privateKey",{expiresIn: "7d"})
    return token
}

userschema.methods.validatePassword = async function(passwordInputByUser){
    const user = this
    const passwordHash = user.password

    const isPasswordValid = await bcrypt.compare(passwordInputByUser,passwordHash)
    return isPasswordValid
}

module.exports = mongoose.model("User",userschema)
