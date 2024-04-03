const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const feedRoutes = require('./routes/feed');

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

// static images
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);


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
    app.listen(8080);
})
.catch(err => {
    console.error(err)
})