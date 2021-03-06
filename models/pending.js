const mongoose = require('mongoose')

module.exports = mongoose.model('pending', new mongoose.Schema({
    date: String,
    prefix: String,
    stamnamn: String,
    name: String,
    area: String,
    city: String,
    webpage: String,
    education: String,
    facebookpage: String,
    update: Boolean
}), 'pending');