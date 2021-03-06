const mongoose = require('mongoose')

module.exports = mongoose.model('admin', new mongoose.Schema({
    password: String,
    token: String
}), 'admin');