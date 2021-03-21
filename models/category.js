const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: String,
    link: String,
    description: String,
    order: Number,
    subCategories: [{
        type: mongoose.Types.ObjectId, 
        ref: 'subCategory',
        required: false
    }],
})

const SubCategorySchema = new mongoose.Schema({
    name: String,
    link: String,
    description: String,
    order: Number,
    subCategories: [{
        type: mongoose.Types.ObjectId, 
        ref: 'subCategory',
        required: false
    }],
})

SubCategorySchema.pre('find', function() {
    this.populate('subCategories').sort({order: 1});
});

module.exports = {
    category: mongoose.model('category', categorySchema, 'kategorier'),
    subCategory: mongoose.model('subCategory', SubCategorySchema, 'underkategorier')
}