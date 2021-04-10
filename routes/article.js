const express = require('express')
const article = require('../models/article.js')
const {category, subCategory} = require('../models/category.js')
const Image = require('../models/image.js')
const router = express.Router()

router.get('/*/article/:article', async (req, res, next) => {

    const wantedArticle =  await article.findOne({
        categoryLink: req.params[0], 
        link: encodeURIComponent(req.params.article)
    })

    if(wantedArticle === null) {
        res.locals.messages.push({
            type: "error",
            text: "Hittade inte artikeln"
        })
        return next()
    } 

    const coverImage = await Image.findOne({original: wantedArticle.image})

    if(coverImage === null) {
        res.status(500)
        res.locals.messages.push({
            type: "error",
            text: "Ett problem med artikeln uppstod (error-id 5001)"
        })
        return next()
    }

    wantedArticle.photographer = coverImage.photographer;

    for await(const element of wantedArticle.content) {
        if(element.tag === 'img') {
            const image = await Image.findOne({original: element.content})
            if(image === null) {
                res.status(500)
                res.locals.messages.push({
                    type: "error",
                    text: "Ett problem med artikeln uppstod (error-id 5002)"
                })
                return next()
            }
            element.photographer = image.photographer;
        }
    }

    try {
        res.render('pages/article', {
            title: wantedArticle.name,
            styles: ['article'],
            article: wantedArticle,
            SEO: {
                image: wantedArticle.image,
                keywords: wantedArticle.tags.join(','),
                description: wantedArticle.description
            }
        })
    } catch(e) {
        res.status(500)
        res.locals.messages.push({
            type: "error",
            text: "Ett problem med artikeln uppstod (error-id 5003)" + e
        })
        return next()
    }
})


router.get('/*', async (req, res, next) => {
    // Check if user is looking for a non-existing article
    if(req.params['0'].split('/').some(param => param === "article")) return next()

    // Use correct schema
    const schema = req.params[0].split('/').length > 1 ? subCategory : category
    
    // Find the category
    const wantedCategory = await schema
        .findOne({link: req.params[0]})
        .populate({path: 'subCategories'})
        .select('name description subCategories')
        .lean()

    // Make sure the category was found
    if(wantedCategory == null) {
        res.locals.messages.push({
            type: "error",
            text: "Hittade ingen kategori med det namnet"
        })
        return next()
    }
    

    // Find the category's articles
    let articles
    try {
        articles =  await article
            .find({
                categoryLink: req.params[0],
                private: false
            })
            .sort({date: -1})
            .select('name link categoryLink description date image')
            .lean()
    } catch(e) {
        res.status(500)
        res.locals.messages.push({
            type: "error",
            text: "Ett problem med kategorin uppstod (error-id 5001)" + e
        })
        return next()
    }

    // Render
    try {
        res.render('pages/category', {
            title: wantedCategory.name,
            category: wantedCategory,
            styles: ['category', 'partials/articlebox'],
            articles: articles,
            baseLink: req.params[0]
        }) 
    } catch (e) {
        res.status(500)
        res.locals.messages.push({
            type: "error",
            text: "Ett problem med kategorin uppstod (error-id 5002)" + e
        })
        return next()
    }
}) 

module.exports = router