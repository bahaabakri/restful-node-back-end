
const express = require('express');
const {body} = require('express-validator')
const User = require('../models/user')
const isAuth = require('../middleware/is-auth')

const router = express.Router()

const authController = require('../controllers/auth')
// sign in
router.post('/login', authController.Login)

// sign up
router.post('/signup',[
    body('name', 'Name is require').trim().not().isEmpty(),
    body('email', 'Enter a valid email').trim().isEmail().normalizeEmail()
    .custom((val, {req}) => {
        return User.findOne({email: val}).then(res => {
            if (res) {
                return Promise.reject('Email has already been exsisted')
            }
        })
    }),
    body('password').trim()
    .isLength({min:5}).withMessage('Password should be at least 5 characters')
    .custom((val, {req}) => {
        if (!val.match(/^[a-zA-Z0-9]+$/g)) {
            throw new Error('Password should be only numbers or letters')
        }
        return true
    })
]

,authController.Signup)


// get user status
router.get('/status', isAuth, authController.getUserStatus)

// update user status
router.put('/status',isAuth, authController.updateUserStatus)
module.exports = router