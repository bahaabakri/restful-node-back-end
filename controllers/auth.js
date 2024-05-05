
const User = require('../models/user')
const bcrypt = require('bcrypt')
const {validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')


exports.Login = async (req, res, next) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const user = await User.findOne({email: email})
        if (!user) {
            const err = new Error('User doesn\'t exsist')
            err.statusCode = 401
            throw err
        }
        const compareResult = await bcrypt.compare(password, user.password)
        if (!compareResult) {
            const err = new Error('Incorrect Password')
            err.statusCode = 401
            throw err
        }
        // generate jwt
        const token = jwt.sign({
            email:user.email,
            userId: user._id.toString()
        },'supersupersecretsign', {
            expiresIn: '1h'
        })
        return res.status(200).json({
            message: 'Logged In Successfully',
            token: token,
            userId: user._id.toString()
        })
    }
    catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}
exports.Signup = async (req, res, next) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const name = req.body.name
        // check validation issue
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const error = new Error()
            error.errors = errors.array()
            error.statusCode = 422
            error.message = 'Validation Issue'
            throw(error)
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({
            name: name,
            email:email,
            password:hashedPassword
        })
        await user.save()
        return res.status(201).json({
            message:'User has been created successfully',
            user: user
        })
    }
    catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}


exports.getUserStatus = async(req, res, next) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            const err = new Error('User doesn\'t exsist')
            err.statusCode = 401
            throw err
        }
        res.status(200).json({
            status: user.status,
            message: 'Success'
        })
    }
    catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }

}

exports.updateUserStatus = async (req, res, next) => {
    try {
        const status = req.body.status
        const user = await User.findById(req.userId)
        if (!user) {
            const err = new Error('User doesn\'t exsist')
            err.statusCode = 401
            throw err
        }
        user.status = status
        await user.save()
        res.status(200).json({
            status: user.status,
            message: 'Success'
        })
    }
    catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }

}