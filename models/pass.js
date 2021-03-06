const mongoose = require('mongoose')

module.exports = mongoose.model('pass', new mongoose.Schema({
    password: String,
}), 'pass');