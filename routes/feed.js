const express = require('express');

const {body} = require('express-validator')
const feedController = require('../controllers/feed');

const router = express.Router();

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// GET /feed/post/postId

router.get('/post/:postId', feedController.getPost)

// POST /feed/post
router.post('/post',
body('title').trim().isLength({min:5}),
body('content').trim().isLength({min:5}),
feedController.createPost);

module.exports = router;