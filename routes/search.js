const { query } = require('express')
const express = require('express')
const article = require('../models/article.js')
const category = require('../models/category.js')
const Image = require('../models/image.js')
const router = express.Router()



router.get('/', async (req, res, next) => {
    const filterRegexes = req.query.query.split(" ").map(query => new RegExp(query, 'i'))
    const categoryAndArray = filterRegexes.map(keyword => ({name: keyword}))
    const articleAndArrayTitle = filterRegexes.map(keyword => ({name: keyword}))
    const articleAndArrayTag = filterRegexes.map(keyword => ({tags: keyword}))


    const articleAndArrayDescription = filterRegexes.map(keyword => ({description: keyword}))
    const articleAndArrayContent = filterRegexes.map(keyword => ({'content.content': keyword}))
    const imageAndArray = filterRegexes.map(keyword => ({photographer: keyword}))

    const categories = await category.find({$and: categoryAndArray}).sort({order: -1})

    let matchingArticles = [], matchingTitleArticles, matchingTagsArticles, matchingDescriptionArticles;
    let deep = false
    if(req.query.deep === "true") {
        matchingArticles = await article.find({
            $or: [
                {$and: articleAndArrayTitle}, 
                {tags: {$in: filterRegexes}},
                {$and: articleAndArrayDescription},
                {$and: articleAndArrayContent}
            ],
            private: false
        }).sort({date: -1})
        deep = true
    } else {
        matchingArticles = await article.find({
            $or: [
                {$and: articleAndArrayTitle}, 
                {tags: {$in: filterRegexes}},
                {$and: articleAndArrayDescription},
            ],
            private: false
        }).sort({date: -1})
    }
      
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

    let deepArticles = []
    if(req.query.deep === "true") {
        deepArticles = [...matchingArticles]
    }
    
    const images = await Image.find({$and: imageAndArray}).sort({date: -1})

    res.render('pages/search', {
        queries: req.query.query.split(" "),
        searchValue: req.query.query,
        searchedCategories: categories,
        searchedArticles: [...matchingTitleArticles, ...matchingTagsArticles, ...matchingDescriptionArticles, ...deepArticles],
        searchedImages: images,
        title: `Sökresultat: ${req.query.query}`,
        styles: ['search'],
        deep: deep,
    })
})

function partition(array, isValid) {
    return array.reduce(([pass, fail], elem) => {
        return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    }, [[], []]);
}

module.exports = router