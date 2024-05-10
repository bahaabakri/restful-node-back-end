
const User = require('../models/user')
const bcrypt = require('bcrypt')
const validator = require('validator')
module.exports = {
    createUser: async function({userInput}, req) {
        // validation
        const errors = []
        if(validator.isEmpty(userInput.name)) {
            errors.push({
                selector:'name',
                message:'Name is required'
            })
        }
        if (!validator.isEmail(userInput.email)) {
            errors.push({
                selector:'email',
                message:'Enter a valid email'
            })
        }
        if(!validator.isLength(userInput.password, {min:5})) {
            errors.push({
                selector:'password',
                message:'Password should be at least 5 characters'
            })
        }
        if (!userInput.password.match(/^[a-zA-Z0-9]+$/g) && validator.isLength(userInput.password, {min:5})) {
            errors.push({
                selector:'password',
                message:'Password should be only numbers or letters'
            })
        }
        if (errors.length > 0) {
            const error = new Error()
            error.message = 'Invalid Validation Input'
            error.errors = errors
            error.code = 422
            throw error
        }
        // check if email has already been taken
        const currentUser =  await User.findOne({email: userInput.email})
        if (currentUser) {
            const error = new Error('User has already been taken')
            throw error
        }
        const hashedPassword = await bcrypt.hash(userInput.password, 12)
        const user = await new User({
            name: userInput.name,
            password:hashedPassword,
            email:userInput.email
        })
        const createdUser = await user.save()
        return {
            ...createdUser._doc,
            _id:createdUser._id.toString()
        }

    }
}