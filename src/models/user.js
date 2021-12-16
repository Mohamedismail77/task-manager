const bcrypt = require('bcryptjs/dist/bcrypt')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        unique: true, // need to drop database again !!!!
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw Error('Email is invalid')
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw Error('Password must not contain password word')
            }
        }
    }
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(user) {
        throw Error('Unable to login in')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw Error('Unable to login')
    }

    return user
}


//Hash the plan  text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if(user.isModeified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User',userSchema)




module.exports = User