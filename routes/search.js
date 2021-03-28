const express = require('express')
const article = require('../models/article.js')
const {category, subCategory} = require('../models/category.js')
const Image = require('../models/image.js')
const router = express.Router()



router.get('/', async (req, res) => {
    if(!req.query.query || req.query.query.length < 3) {
        return res.render('pages/search', {
            queries: [],
            searchValue: req.query.query || "",
            searchedCategories: [],
            searchedArticles: [],
            searchedImages: [],
            title: `Sök`,
            styles: ['search'],
            deep: false,
        })
    }
    const filterRegexes = req.query.query.split(" ").map(query => new RegExp(query, 'i'))
    const categoryAndArray = filterRegexes.map(keyword => ({name: keyword}))
    const articleAndArrayTitle = filterRegexes.map(keyword => ({name: keyword}))
    const articleAndArrayTag = filterRegexes.map(keyword => ({tags: keyword}))


    const articleAndArrayDescription = filterRegexes.map(keyword => ({description: keyword}))
    const articleAndArrayContent = filterRegexes.map(keyword => ({'content.content': keyword}))
    const imageAndArray = filterRegexes.map(keyword => ({photographer: keyword}))

    const categories = await category.find({$and: categoryAndArray}).sort({order: -1})
    const subCategories = await subCategory.find({$and: categoryAndArray}).sort({order: -1})

    let matchingArticles = await article
        .find({
            $or: [
                {$and: articleAndArrayTitle}, 
                {tags: {$in: filterRegexes}},
                {$and: articleAndArrayDescription},
            ],
            private: false
        })
        .sort({date: -1})
        .select("name link categoryLink description date image tags")
        .lean()

    let matchingTitleArticles, matchingTagsArticles, matchingDescriptionArticles;
      
    [matchingTitleArticles, matchingArticles] = partition(matchingArticles, article => {
        return filterRegexes.every(filterRegex => article.name.match(filterRegex))
    });
    
    [matchingTagsArticles, matchingArticles] = partition(matchingArticles, article => {
        return filterRegexes.every(filterRegex => article.tags.some(tag => tag.match(filterRegex)))
    });

    [matchingDescriptionArticles, matchingArticles] = partition(matchingArticles, article => {
        return filterRegexes.every(filterRegex => {
            return article.description.match(filterRegex) !== null
        })
    });
    
    const images = await Image.find({$and: imageAndArray}).sort({date: -1})

    res.render('pages/search', {
        queries: req.query.query.split(" "),
        searchValue: req.query.query,
        searchedCategories: [...categories, ...subCategories],
        searchedArticles: [...matchingTitleArticles, ...matchingTagsArticles, ...matchingDescriptionArticles],
        searchedImages: images,
        title: `Sökresultat: ${req.query.query}`,
        styles: ['search', 'partials/articlebox'],
    })
})

function partition(array, isValid) {
    return array.reduce(([pass, fail], elem) => {
        return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    }, [[], []]);
}

module.exports = router