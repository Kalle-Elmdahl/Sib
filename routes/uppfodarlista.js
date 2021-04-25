const express = require('express')
const display = require('../models/display.js')
const pending = require('../models/pending.js')
const pass = require('../models/pass.js')
const router = express.Router()

router.get('/', async (req, res) => {
    if(req.query.pass) return addFacebookToken(req, res)
    const result = await display.find({}).lean() || []
    res.render('pages/uppfodarlista', {
        scripts: ['uppfodarlista'],
        styles: ['uppfodarlista'],
        people: result,
        title: 'Uppfödarlista',
        seo: {
            image: "katt.jpg",
            description: "Vi presenterar här vår uppfödarlista som skapats i Facebookgruppen ”Sibirisk katt”. Tanken med listan är att du som söker sibbe kan hitta seriösa uppfödare som säljer registrerade kattungar.",
            keywords: "uppfödare, sibirisk katt, köpa katt, köpa sibir, katt till salu, till salu, seriös uppfödare, varning, oseriös uppfödare, tryggt köp av katt, bra uppfödare, frisk katt, köpa kattunge, kattunge, kattungar, köpa kattungar"
        }
    })
});

router.get('/anmalan', async (req, res) => {
    res.render('pages/signup', {
        styles: ['anmalan'],
        title: 'Anmälan',
        user: new display()
    })
});

router.post('/add', async (req, res) => {
    const education = []
    if(req.body.eduone) education.push("Sveraks uppfödardiplomering")
    if(req.body.edutwo) education.push("Pawpeds G1")
    if(req.body.eduthree) education.push("Pawpeds G2")
    if(req.body.edufour) education.push("Pawpeds G3")
    let update = false;
    if((await display.find({name: req.body.name})).length > 0) update = true;
    const newUser = new pending({
        date: new Date(),
        prefix: req.body.prefix,
        stamnamn: req.body.stamnamn,
        name: req.body.name,
        area: req.body.area,
        city: req.body.city,
        webpage: req.body.webpage,
        education: education.join(', '),
        facebookpage: req.body.facebook,
        update: update
    })
    newUser.save((err, createdUser) => {
        if(err) return res.send("någonting gick fel")
        res.render("pages/success", {
            user: createdUser,
            title: 'Välkommen!'
        })
    })
})

async function addFacebookToken(req, res) {
    try {
        const correctPass = await pass.findOne({})
        if(req.query.pass == correctPass.password) {
            res.cookie('facebookOnly', correctPass.password, { maxAge: 6048000000, httpOnly: true });
            req.session.messages.push({
                type: "information",
                text: "Du har nu tillgång till uppfödarlistan"
            });
        } else {
            req.session.messages.push({
                type: "error",
                text: "Länken matchade inte lösenordet"
            });
        }
    } catch(e) {
        req.session.messages.push({
            type:"error",
            text: "Någonting gick med inloggningen"
        });
    }
    res.redirect("/uppfodarlista")
}

module.exports = router