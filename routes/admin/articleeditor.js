const express = require('express')
const article = require('../../models/article.js')
const Image = require('../../models/image.js')
const router = express.Router()

router.get('/', async (req, res, next) => {
    // Create new article
    const newArticle = new article()

    try {
        // Save the article
        const savedArticle = await newArticle.save()

        // Start editing the newly saved article
        res.redirect(`/administrera/artikelredigerare/${savedArticle._id}`)
    } catch(e) {
        req.session.messages.push({
            type: "error",
            text: "Kunde inte skapa ny artikel"
        });
        res.redirect('/administrera');
    }
});

function replaceCharacters(name) {
    return encodeURIComponent(name.toLowerCase().replace(/ä/g, 'a').replace(/å/g, 'a').replace(/ö/g, 'o').replace(/\s/g, '-'))
}

router.post('/savearticle', async (req, res) => {
    const articleObj = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        image: req.body.coverimage,
        content: JSON.parse(req.body.content),
        lastmod: new Date().toISOString(),
        date: req.body.date,
        tags: req.body.tags.split(',')
    }

    articleObj.categoryLink = replaceCharacters(articleObj.category)
    articleObj.link = replaceCharacters(articleObj.name)

    if(req.body.private === 'on') {
        articleObj.private = true
    } else {
        articleObj.private = false
    }
    if(req.body.frontPage === 'on') {
        articleObj.frontPage = true
    } else {
        articleObj.frontPage = false
    }


    const correctArticle = await article.findById(req.body.id)
    let redirectID;

    if(correctArticle) {
        for (let key in correctArticle) {
            if (articleObj.hasOwnProperty(key)) {
                correctArticle[key] = articleObj[key]
            }
        }
        correctArticle.save(err => {
            if(err) return res.send("någonting gick fel")
        })
        redirectID = correctArticle._id
    } else {
        const newArticle = new article(articleObj)
        newArticle.save(err => {
            if(err) return res.send("någonting gick fel")
        })
        redirectID = newArticle._id
    }
    if(req.body.redirect === 'on') {
        res.redirect('/administrera')
    } else {
        res.redirect('/administrera/artikelredigerare/' + redirectID)
    }
})

router.get('/removearticle/:id', async (req, res) => {
    try {
        const correctArticle = await article.findById(req.params.id)
        if(correctArticle == null) return res.send('Hittade inte artikeln')

        correctArticle.remove(err => {
            if(err) return res.send("någonting gick fel")
            res.redirect('/administrera')
        })
    } catch(e) {
        res.send('någonting gick fel')
    }
})

router.get('/:id', async (req, res, next) => {
    try {

        const correctArticle = await article.findById(req.params.id)
        if(correctArticle == null) return res.sendStatus(404);

        renderArticleEditor(req, res, correctArticle, next, true)
    } catch(e) {
        next()
    }
})

async function renderArticleEditor(req, res, correctArticle, next, update) {
    try {
        if(!correctArticle.image || correctArticle.image == "") {
            correctArticle.photographer = ""
        } else {
            const coverImage = await Image.findOne({original: correctArticle.image})
            if(coverImage === null) return res.send("Bilder i artikeln är korrupta")
            correctArticle.photographer = coverImage.photographer;
        }

        for(const element of correctArticle.content) {
            if(element.tag === 'img') {
                const image = await Image.findOne({original: element.content})
                if(image === null) return res.send("Bilder i artikeln är korrupta")
                element.photographer = image.photographer;
            }
        }

        const images = await Image.find({}).sort({date: -1})
        res.render('admin/articleeditor', {
            title:'Artikelredigerare',
            article: correctArticle,
            styles: ['article', 'admin/article', 'partials/selectimage'],
            scripts: [{name: 'admin/articlemain', type: 'module'}],
            update: update,
            images: images
        })
    } catch(e) {
        next()
    }
}



module.exports = router