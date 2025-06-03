const mongoose = require('mongoose')

const updateSchema = new mongoose.Schema({
    author: {
        type: String,
        required: false
    },
    date: {
        type: String,
    },
    title: {
        type: String,
        required: false
    },
    subTitle: {
    type: String,
    required: false
    },
    message: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Updates', updateSchema)