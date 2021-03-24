const express = require('express')
const article = require('../models/article.js')
const {category, subCategory} = require('../models/category.js')
const Image = require('../models/image.js')
const router = express.Router()



router.get('/:category', async (req, res, next) => {
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

module.exports = router