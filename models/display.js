const mongoose = require('mongoose')

module.exports = mongoose.model('display', new mongoose.Schema({
    date: String,
    prefix: String,
    stamnamn: String,
    name: String,
    area: String,
    city: String,
    webpage: String,
    education: String,
    facebookpage: String
}), 'accepted');