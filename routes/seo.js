const express = require('express')
const router = express.Router()

const article = require('../models/article.js')
const category = require('../models/category.js')

function createUrl(page, changefreq, priority = 0.5, lastMod = "2020-11-24") {
    const startURL = "https://sibiriskakatten.se";
    let string = "<url>"
    string += "<loc>" + startURL + page + "</loc>"
    string += `<lastmod>${lastMod}</lastmod>`
    string += "<changefreq>" + changefreq + "</changefreq>"
    string += "<priority>" + priority + "</priority>"
    string += "</url>"
    return string
}

router.get('/sitemap.xml', async (req, res) => {
    const content = []

    //Add startpage
    content.push(createUrl("", "monthly", 1))

    
    const categories = await category.find().sort({order: 1})
    const categoryLinks = categories.map(category => category.link)
    categoryLinks.forEach(category => content.push(createUrl(`/${category}`, "monthly", 0.8)))

    const articles = await article.find({private: false}).sort({date: -1})
    articles.forEach(article => content.push(createUrl(`/${article.categoryLink}/${article.link}`, "monthly", 0.6, article.lastmod.split('T')[0])))
    let xml_content = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        content.join('\n'),
        '</urlset>'
    ]
    res.set('Content-Type', 'text/xml')
    res.send(xml_content.join('\n'))
})

router.get('/robots.txt', function(req, res) {
    res.type('text/plain')
    res.send("Sitemap: https://sibiriskakatten.se/sitemap.xml\nUser-agent: *\nDisallow: /uppfodarlista/");
});

module.exports = router