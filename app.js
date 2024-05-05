const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const feedRoutes = require('./routes/feed');
const authRouter = require('./routes/auth')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid');
const { log } = require('console');
const app = express();
const socketIo = require('./util/socket')
// multer configrations

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
        // cb(null, uuidv4() + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' ) {
        cb(null, true)
      } else {
        cb(null, false)
      }
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

// multer middleware
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
// static images
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRouter)

// error middleware
app.use((error, req, res, next) => {
    let statusCode = error.statusCode || 500
    res.status(statusCode).json({
        error: error
    })
})
// connect mongoose
mongoose.connect('mongodb+srv://bahaabakri1995:a5b0c1d1MONGODB@store.4mfhky3.mongodb.net/?retryWrites=true&w=majority').then(_ => {
    console.log('Connect')
    const server = app.listen(8080);
    // initialize socket.io
    const io = socketIo.init(server)
    // open socket connection
    io.on('connection', socket => {
        console.log('Socket Has Been Connected')
    })
})
.catch(err => {
    console.error(err)
})