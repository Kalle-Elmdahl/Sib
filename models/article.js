const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    link: String,
    description: String,
    image: String,
    category: {
        type: String,
        default: "",
    },
    categoryLink: String,
    private: {
        type: Boolean,
        default: true,
    },
    tags: [String],
    content: [Object],
    frontPage: Boolean
}, {
    timestamps: {
        createdAt: 'date', 
        updatedAt: 'lastmod'
    }
})

module.exports = mongoose.model('article', articleSchema, 'artiklar');