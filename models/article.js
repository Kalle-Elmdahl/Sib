const mongoose = require('mongoose')

module.exports = mongoose.model('article', new mongoose.Schema({
    date: {
        type: String,
        default: new Date().toISOString(),
    },
    lastmod: String,
    name: {
        type: String,
        default: ""
    },
    link: String,
    description: String,
    image: String,
    category: String,
    categoryLink: String,
    private: {
        type: Boolean,
        default: true,
    },
    tags: [String],
    content: [Object],
    frontPage: Boolean
}), 'artiklar');