const mongoose = require('mongoose')

module.exports = mongoose.model('category', new mongoose.Schema({
    name: String,
    link: String,
    description: String,
    order: Number
}), 'kategorier');