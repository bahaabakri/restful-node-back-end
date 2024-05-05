
const {validationResult} = require('express-validator')
const Post = require('../models/post')
const User = require('../models/user')
const socketIo = require('../util/socket')
const fileHelper = require('../util/file')
/**
 * Get all Posts
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getPosts = async (req, res, next) => {
  try {
    const page = req.query.page
    const perPage = req.query.perPage
    const totalItems = await Post.find().countDocuments()
    const posts =  await Post.find()
                        .populate('creator')
                        .sort({createdAt: -1})
                        .skip((page - 1) * perPage)
                        .limit(perPage)
    res.status(200).json({
      totalItems: totalItems,
      posts: posts
    });
  }
  catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
};

/**
 * Get single post
 */

exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId
    const post = await Post.findById(postId)
    .populate('creator')
    if (!post) {
      const err = new Error()
      err.statusCode = 404
      err.message = "Couldn't find post"
      throw err
    }
    res.status(200).json({
      message:'Post Fetched',
      post: post
    })
  }
  catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }

}
/**
 * Create Post
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.createPost = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error()
      error.errors = errors.array()
      error.statusCode = 422
      error.message = 'Enter valid image'
      throw(error)
    }
    const imageUrl = req.file.path
    const title = req.body.title;
    const content = req.body.content;
    // check validation issue
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const error = new Error()
      error.errors = errors.array()
      error.statusCode = 422
      error.message = 'Validation Issue'
      throw(error)
    }
    // Create post in db
    const post = new Post({
      title:title,
      content:content,
      imageUrl:imageUrl,
      creator:req.userId, 
    })
    const createdPost = await post.save()
    // add post to user model
    const user = await User.findById(req.userId)
    user.posts.push(createdPost._id)
    await user.save()
    // emit socket event 
    socketIo.getIo().emit('posts', {action: 'create', post: {...post._doc, creator: {id: user._id, name: user.name}}})
    res.status(201).json({
      message: 'Created Successfully',
      post: createdPost,
      creator: {_id: user._id, name: user.name}
    })
  }
  catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }

};


exports.updatePost = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const error = new Error()
      error.errors = errors.array()
      error.statusCode = 422
      error.message = 'Validation Issue'
      throw(error)
    }
    const postId = req.params.postId
    const upodatedTitle = req.body.title;
    const updatedContent = req.body.content;
    let imageUrl = req.body.image
    if (req.file) {
      imageUrl = req.file.path
    }
    if (!imageUrl) {
      const error = new Error()
      error.errors = errors.array()
      error.statusCode = 422
      error.message = 'Please upload an image'
      throw(error)
    }
    const post = await Post.findOne({_id: postId})
    .populate('creator')
    if (!post) {
      const error = new Error()
      error.statusCode = 404
      error.message = 'Post doesn\'t exsist'
      throw error
    }
    // check if the user is authorized
    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error()
      error.statusCode = 403
      error.message = 'Unauthorized Action'
      throw error
    }
    if (imageUrl != post.imageUrl) {
      fileHelper.deleteFile(post.imageUrl)
    }
    post.title = upodatedTitle
    post.content = updatedContent
    post.imageUrl = imageUrl
    const result = await post.save()
    // emit socket event
    socketIo.getIo().emit('posts', {action: 'update', post: {...post._doc, creator: {id: result.creator._id, name: result.creator.name}}})
    res.status(200).json({
      message:'Updated Successfuly',
      post: post
    })
  }
  catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}


exports.deletePost = async(req, res, next) => {
  try {
    const postId = req.params.postId
    const post = await Post.findOne({_id: postId})
    if (!post) {
      const error = new Error()
      error.statusCode = 404
      error.message = 'Post doesn\'t exsist'
      throw error
    }
    // check if the user is authorized
    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error()
      error.statusCode = 403
      error.message = 'Unauthorized Action'
      throw error
    }
    fileHelper.deleteFile(post.imageUrl)
    const deletedPost = await post.deleteOne()
    // delete post from user model
    const user = await User.findById(req.userId)
    user.posts.pull(postId)
    await user.save()
    // emit socket event
    socketIo.getIo().emit('posts', {action: 'delete', postId:postId})
    res.status(200).json({
      message:'Deleted Successfuly',
      post:deletedPost
    })
  }
  catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
} 
