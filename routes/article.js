const express = require('express')
const article = require('../models/article.js')
const {category, subCategory} = require('../models/category.js')
const Image = require('../models/image.js')
const router = express.Router()

router.get('/*/article/:article', async (req, res) => {

    const wantedArticle =  await article.findOne({
        categoryLink: req.params[0], 
        link: encodeURIComponent(req.params.article)
    })

    if(wantedArticle == null) return res.send("hittade inte artikeln")

    const coverImage = await Image.findOne({original: wantedArticle.image})

    if(coverImage === null) return res.send("Hittade inte omslagsbild")

    wantedArticle.photographer = coverImage.photographer;

    for await(const element of wantedArticle.content) {
        if(element.tag === 'img') {
            const image = await Image.findOne({original: element.content})
            if(image === null) return res.send("Bilder i artikeln hittades inte")
            element.photographer = image.photographer;
        }
    }

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
})


router.get('/*', async (req, res, next) => {

    // Find the category
    let wantedCategory
    if(req.params[0].split('/').length > 1) {

        wantedCategory = await subCategory
            .findOne({link: req.params[0]})
            .populate({path: 'subCategories'})
            .select('name description subCategories')
            .lean()
    } else {
        wantedCategory = await category
            .findOne({link: req.params[0]})
            .populate({path: 'subCategories'})
            .select('name description subCategories')
            .lean()
    }

    // Make sure the category was found
    if(wantedCategory == null) return next()
    

    // Find the category's articles
    const articles =  await article
        .find({
            categoryLink: req.params[0],
            private: false
        })
        .sort({date: -1})
        .select('name link categoryLink description date image')
        .lean()

    // Render
    res.render('pages/category', {
        title: wantedCategory.name,
        category: wantedCategory,
        styles: ['category', 'partials/articlebox'],
        articles: articles,
        baseLink: req.params[0]
    })
})


/* router.get('/:category', async (req, res, next) => {
    const correctCategory = await category.findOne({link: req.params.category})
    if(correctCategory == null) return next()
    const articles = await article.find({categoryLink: correctCategory.link, private: false}).sort({date: -1})
    res.render('pages/category', {
        title: correctCategory.name,
        category: correctCategory.name,
        styles: ['category', 'partials/articlebox'],
        articles: articles,
        desc: correctCategory.description
    })
});

router.get('/:category/:articlename', async (req, res, next) => {
    const selectedArticle =  await article.findOne({categoryLink: req.params.category, link: encodeURIComponent(req.params.articlename)})
    if(selectedArticle && selectedArticle !== {}) {
        try {
            const coverImage = await Image.findOne({original: selectedArticle.image})
            if(coverImage === null) return res.send("Bilder i artikeln är korrupta")
            selectedArticle.photographer = coverImage.photographer;
            for(const element of selectedArticle.content) {
                if(element.tag === 'img') {
                    const image = await Image.findOne({original: element.content})
                    if(image === null) return res.send("Bilder i artikeln är korrupta")
                    element.photographer = image.photographer;
                }
            }
            
            res.render('pages/article', {
                title: selectedArticle.name,
                styles: ['article'],
                article: selectedArticle,
                SEO: {
                    image: selectedArticle.image,
                    keywords: selectedArticle.tags.join(','),
                    description: selectedArticle.description
                }
            })
        } catch(e) {
            res.send('Någonting är fel med artikeln')
        }
    } else {
        next();
    }
})
 */
module.exports = router