const mongoose = require('mongoose')

module.exports = mongoose.model('image', new mongoose.Schema({
    date: String,
    original: String,
    compressed: String,
    photographer: String,
    size: Number
}), 'images');