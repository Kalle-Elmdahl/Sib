const express = require('express')
const mongoose = require('mongoose')
const pending = require('../../models/pending.js')
const article = require('../../models/article.js')
const display = require('../../models/display.js')
const router = express.Router()

const imagesRouter = require('./images')
const articleRouter = require('./articleeditor')
const categoryRouter = require('./category')

router.use((req, res, next) => {
    if(res.locals.admin) {
        return next()
    } 
    res.render('admin/login', {
        title:'Logga in',
        styles: ['admin/adminlogin']
    })
})

router.use('/images', imagesRouter)
router.use('/artikelredigerare', articleRouter)
router.use('/categories', categoryRouter)

router.get('/', async (req, res) => {
    const pendingResult = await pending.find({}).lean() || []
    const articles = await article.find().sort({date: -1}).lean() || []
    res.render('admin/admin', {
        title: 'Administrera',
        pending: pendingResult.length,
        articles: articles,
        styles: ['admin/adminpage']
    })
});

router.get('/logout', (req, res) => {
    res.clearCookie('sibAdministrator');
    req.session.messages.push({
        type: "information",
        text: "Du har blivit utloggad"
    });
    res.redirect('/')
})

const capFirst = (string) => string.charAt(0).toUpperCase() + string.slice(1)

const isType = (field, formData) => {
    if(field.instance == capFirst(typeof formData)) return true
    if(Array.isArray(formData) && field.instance == 'Array') return true
}

router.post('/update', async (req, res) => {
    const model = mongoose.models[req.query.model]

    const formData = req.body
    let updatedKeys = 0
    let target
    try {
        target = await model.findById(req.query.id)
    } catch (e) {
        req.session.messages.push({
            type: "error",
            text: "Kunde inte hämta objektet"
        });
    }

    if(target == null) {
        req.session.messages.push({
            type: "error",
            text: "Hittade inte objektet du försökte uppdatera"
        });
    } else {
        for (let key in target) {
            if (formData.hasOwnProperty(key)) {
                if(model.schema.paths[key].instance === 'Boolean' && formData[key] === undefined) {
                    target[key] = false
                    continue
                }
                if(!isType(model.schema.paths[key], formData[key])) {
                    // Save type mismatches for Stringified arrays and boolean checkboxes
                    if(model.schema.paths[key].instance === 'Array' && typeof formData[key] === 'string') {
                        try {
                            formData[key] = JSON.parse(formData[key])
                        } catch (e) {
                            req.session.messages.push({
                                type:"error",
                                text: "Vissa fält matchade inte formatet: " + e
                            });
                        }
                    } else if(model.schema.paths[key].instance === 'Boolean' && typeof formData[key] === 'string') {
                        formData[key] = formData[key] === 'on'
                    } else {
                        req.session.messages.push({
                            type:"error",
                            text: "Vissa fält matchade inte formatet: " + e
                        });
                    }
                }
                if(target[key] !== formData[key]) updatedKeys++
                target[key] = formData[key]
            } else if(model.schema.paths[key]?.instance === 'Boolean') {
                // The boolean variable has been un-checked
                target[key] = false;
                updatedKeys++
            }
        }
    
        try {
            await target.save()
            req.session.messages.push({
                type:"information",
                text: updatedKeys > 0 ? `Uppdaterade ${updatedKeys} fält` : "Inga ändringar var gjorda"
            });
        } catch(e) {
            req.session.messages.push({
                type:"error",
                text: "Objektet kunde inte sparas!"
            });
        }
    }

    if(req.query.redirect) {
        res.redirect(req.query.redirect)
    } else {
        res.redirect('/administrera')
    }
})

router.get('/pending', async (req, res) => {
    const result = await pending.find({}) || []
    res.render('admin/viewpending', {
        pending: result,
        title: 'Adminsida'
    })
});

router.get('/accept', async (req, res) => {
    const id = req.query.id;
    const toBeAdded = await pending.findOneAndDelete({_id: new mongoose.mongo.ObjectId(id)})

    await display.deleteMany({name: toBeAdded.name})

    let newUppfodare = new display({
        date: toBeAdded.date,
        prefix: toBeAdded.prefix,
        stamnamn: toBeAdded.stamnamn,
        name: toBeAdded.name,
        area: toBeAdded.area,
        city: toBeAdded.city,
        webpage: toBeAdded.webpage,
        education: toBeAdded.education,
        facebookpage: toBeAdded.facebookpage
    })

    await newUppfodare.save(err => {
        if(err) return res.status(500).send("någonting gick fel")
    })

    res.send("success")
});

router.get('/reject', async (req, res) => {
    const id = req.query.id;
    await pending.deleteOne({_id: new mongoose.mongo.ObjectId(id)})
    res.send("success")
});

module.exports = router