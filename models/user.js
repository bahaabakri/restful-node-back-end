const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email:{
        require: true,
        type: String
    },
    password: {
        require: true,
        type: String
    },
    name: {
        require: true,
        type: String
    },
    status: {
        default: 'i am new',
        type: String
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref:'Post'
    }]
})

module.exports = mongoose.model('User', userSchema)