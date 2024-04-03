
const {validationResult} = require('express-validator')
const Post = require('../models/post')

/**
 * Get all Posts
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getPosts = (req, res, next) => {
  Post.find()
  .then(posts => {
    res.status(200).json({
      posts: posts
    }); 
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
};

/**
 * Get single post
 */

exports.getPost = (req, res, next) => {
  const postId = req.params.postId
  Post.findById(postId)
  .then(post => {
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
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
}
/**
 * Create Post
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.createPost = (req, res, next) => {
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
    imageUrl:'images/frankenstein.jpg',
    creator:{
      name:'Bahaa'
    }
  })
  post.save()
  .then(post => {
    res.status(201).json({
      message: 'Post created successfully!',
      post: post
    });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
};
