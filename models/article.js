const mongoose = require('mongoose')

module.exports = mongoose.model('article', new mongoose.Schema({
    date: String,
    lastmod: String,
    name: String,
    link: String,
    description: String,
    image: String,
    category: String,
    categoryLink: String,
    private: Boolean,
    tags: [String],
    content: [Object],
    frontPage: Boolean
}), 'artiklar');