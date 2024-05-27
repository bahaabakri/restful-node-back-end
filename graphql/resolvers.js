
const User = require('../models/user')
const Post = require('../models/post')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const fileHelper = require ('../util/file')
const { use } = require('../routes/feed')
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

    },
    login: async function({loginInput}, req) {
        const email = loginInput.email
        const password = loginInput.password
        const user = await User.findOne({email: email})
        if (!user) {
            const error = new Error()
            error.message = 'User doesn\'t exists, try register first'
            error.code = 401
            throw error
        }
        const isCorrectPass = await bcrypt.compare(password, user.password)
        if (!isCorrectPass) {
            const error = new Error()
            error.message = 'Incorrect Password, please try again'
            error.code = 401
            throw error
        }
        // generate jwt token
        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString()
            }, 'supersupersecretsign', {
                expiresIn: '1h'
            }
        )
        return {
            ...user._doc,
            token:token,
            userId: user._id.toString()
        }

    },
    createPost: async function({postInput}, req) {
        // check authentication
        if(!req.isAuth) {
            const err = new Error()
            err.status = 401
            err.message = 'Unauthenticated User'
            throw err
        }
        const title = postInput.title
        const content = postInput.content
        const imageUrl = postInput.imageUrl

        const errors = []
        if (validator.isEmpty(title) || !validator.isLength(title, {min:5})) {
            errors.push({
                selector:'title',
                message:'Title is required and should be more than 5 characters'
            })
        }
        if (validator.isEmpty(content) || !validator.isLength(content, {min:5})) {
            errors.push({
                selector:'content',
                message:'Content is required and it should be more than 5 characters'
            })
        }
        if (errors.length > 0) {
            const error = new Error()
            error.message = 'Invalid Validation Input'
            error.status = 422
            error.errors = errors
            throw error
        }
        // get user
        const user = await User.findById(req.userId)
        if (!user) {
            const error = new Error()
            error.message = 'Unauthenticated User'
            error.status = 401
            throw error
        }
        const post = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator:user, 
        })
        const createdPost = await post.save()
        // add post to user model
        user.posts.push(createdPost)
        await user.save()
        return {
            ...createdPost._doc,
            _id:createdPost._id.toString(),
            createdAt:createdPost.createdAt.toISOString(),
            updatedAt:createdPost.updatedAt.toISOString()
        }

    },
    posts: async function({page}, req) {
        // check authentication
        if(!req.isAuth) {
            const err = new Error()
            err.status = 401
            err.message = 'Unauthenticated User'
            throw err
        }
        const perPage = 2
        if(!page) {
            page = 1
        }
        const totalPosts = await Post.find().countDocuments()
        const posts = await Post.find()
                    .sort({createdAt: -1})
                    .populate('creator')
                    .skip(((page - 1) * perPage))
                    .limit(perPage)
        return {
            posts: posts.map(post => {
                return {
                    ...post._doc,
                    _id:post._id.toString(),
                    createdAt:post.createdAt.toISOString(),
                    updatedAt:post.updatedAt.toISOString()
                }
            }),
            totalPosts: totalPosts
        }
    },
    post: async function({postId}, req) {
        // check authentication
        if(!req.isAuth) {
            const err = new Error()
            err.status = 401
            err.message = 'Unauthenticated User'
            throw err
        }
        if(!postId) {
            const err = new Error()
            err.status = 404
            err.message = 'Couldn\'t find post'
            throw err
        }
        const post = await Post.findById(postId)
                            .populate('creator')
        if (!post) {
            const err = new Error()
            err.status = 404
            err.message = 'Couldn\'t find post'
            throw err
        }
        return {
            ...post._doc,
            _id:post._id.toString(),
            createdAt:post.createdAt.toISOString(),
            updatedAt:post.updatedAt.toISOString()
        }
        
    },
    deletePost: async function({postId}, req) {
        // check authentication
        if(!req.isAuth) {
            const err = new Error()
            err.status = 401
            err.message = 'Unauthenticated User'
            throw err
        }
        if(!postId) {
            const err = new Error()
            err.status = 404
            err.message = 'Couldn\'t find post'
            throw err
        }
        postToDelete = await Post.findById(postId)
                        .populate('creator')
        if (!postToDelete) {
            const err = new Error()
            err.status = 404
            err.message = 'Couldn\'t find post'
            throw err
        }
        if (postToDelete.creator._id.toString() !== req.userId.toString()) {
            const error = new Error()
            error.status = 403
            error.message = 'Unauthorized Action'
            throw error
        }
        // delete post image
        // if (postToDelete.imageUrl && postToDelete.imageUrl !== "undefined") {
            fileHelper.deleteFile(postToDelete.imageUrl)
        // }
        // delete post
        await postToDelete.deleteOne()
        // delete post from user model
        const user = await User.findById(req.userId)
        user.posts.pull(postId)
        await user.save()
        return {
            post: {
                ...postToDelete._doc,
                _id:postToDelete._id.toString(),
                createdAt:postToDelete.createdAt.toISOString(),
                updatedAt:postToDelete.updatedAt.toISOString()
            },
            message: 'Delete Post Successfuly'
        }
    },
    updatePost: async function({postId, postInput}, req) {
        // check authentication
        if(!req.isAuth) {
            const err = new Error()
            err.status = 401
            err.message = 'Unauthenticated User'
            throw err
        }
        if(!postId) {
            const err = new Error()
            err.status = 404
            err.message = 'Couldn\'t find post'
            throw err
        }
        postToUpdate = await Post.findById(postId)
                        .populate('creator')
        if (!postToUpdate) {
            const err = new Error()
            err.status = 404
            err.message = 'Couldn\'t find post'
            throw err
        }
        if (postToUpdate.creator._id.toString() !== req.userId.toString()) {
            const error = new Error()
            error.status = 403
            error.message = 'Unauthorized Action'
            throw error
        }
        
        const title = postInput.title
        const content = postInput.content
        const imageUrl = postInput.imageUrl
        // validation
        const errors = []
        if (validator.isEmpty(title) || !validator.isLength(title, {min:5})) {
            errors.push({
                selector:'title',
                message:'Title is required and should be more than 5 characters'
            })
        }
        if (validator.isEmpty(content) || !validator.isLength(content, {min:5})) {
            errors.push({
                selector:'content',
                message:'Content is required and it should be more than 5 characters'
            })
        }
        if (errors.length > 0) {
            const error = new Error()
            error.message = 'Invalid Validation Input'
            error.status = 422
            error.errors = errors
            throw error
        }
        postToUpdate.title = title
        postToUpdate.content = content
        // imageUrl is undifient if there is no file send
        if (imageUrl !== "undefined") {
            postToUpdate.imageUrl = imageUrl
        }
        await postToUpdate.save()
        return {
            post: {
                ...postToUpdate._doc,
                _id:postToUpdate._id.toString(),
                createdAt:postToUpdate.createdAt.toISOString(),
                updatedAt:postToUpdate.updatedAt.toISOString()
            },
            message: 'Updated Post Successfuly'
        }
    },
    status: async function(args, req) {
        // check authentication
        if(!req.isAuth) {
            const err = new Error()
            err.status = 401
            err.message = 'Unauthenticated User'
            throw err
        }
        const user = await User.findById(req.userId)
        if (!user) {
            const err = new Error()
            err.status = 404
            err.message = 'Couldn\'t find user'
            throw err
        }
        return {
            status: user.status,
            message: 'get status successfully'
        }
    },
    updateStatus: async function({newStatus}, req) {
        // check authentication
        if(!req.isAuth) {
            const err = new Error()
            err.status = 401
            err.message = 'Unauthenticated User'
            throw err
        }
        const user = await User.findById(req.userId)
        if (!user) {
            const err = new Error()
            err.status = 404
            err.message = 'Couldn\'t find user'
            throw err
        }
        user.status = newStatus
        await user.save()
        return {
            status: newStatus,
            message: 'status updated successfully'
        }
    }
}