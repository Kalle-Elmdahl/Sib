const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const session = require('express-session')

const pass = require('./models/pass.js')
const article = require('./models/article.js')
const {category, subCategory} = require('./models/category.js')
const admin = require('./models/admin.js')

const uppfodarRouter = require('./routes/uppfodarlista')
const articleRouter = require('./routes/article.js')
const seoRouter = require('./routes/seo.js')
const searchRouter = require('./routes/search.js')
const adminRouter = require('./routes/admin/admin.js')

const FACEBOOK_ONLY_URLS = ['/uppfodarlista']
const PRODUCTION_DOMAIN = 'https://sibiriskakatten.se'

app.set('view engine', 'ejs')
app.set('layout', 'layouts/user', 'layouts/admin')
app.set('views', __dirname + '/views')

app.use(expressLayouts)
app.use(cookieParser());
app.use(session({
    secret: ['bfstvrwozahkdylhzndornotccagxvuo', 'wyenzsvirelwwyxmncdmuyrofgorthcv', 'nvhurgcavsecmnyfnbrfctvrzylzjeqi', 'qzzmwzufapbvepsaliqmyaypsmgljnku', 'arcvpmdafsvxzizgcjrpqkdlhaqubwjh'],
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60000}
}))
app.use(express.static('public', {
    etag: true,
    lastModified: true,
    setHeaders: res => {
        res.setHeader('Cache-Control', 'max-age=86400');
    },
}))
app.use(express.static('pdfer'))
app.use(express.static('bilder', {
    etag: true,
    lastModified: true,
    setHeaders: res => {
        res.setHeader('Cache-Control', 'max-age=31536000');
    },
}));

app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
app.use(bodyParser.json())

app.use(generateBasicVariables)
app.use(auth)
app.use(wwwRedirect)

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/sibserver', {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection

db.on('error', error => console.error(error));
db.once('open', () => console.log('Conntected to Mongoose'));

function wwwRedirect(req, res, next) {
    if (req.headers.host.slice(0, 4) === 'www.') {
        var newHost = req.headers.host.slice(4)
        return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl)
    }
    next();
};

async function auth(req, res, next) {
    try {
        if(FACEBOOK_ONLY_URLS.some(url => url == req.url)) {
            const facebookToken = req.cookies['facebookOnly']
            const correctFacebookPass = await pass.findOne().lean()
            if(!facebookToken || facebookToken != correctFacebookPass.password) {

                return res.render('pages/wrongpass', {
                    title: "Ej tillgänglig"
                })
            }
        }
    } catch(e) {
        res.locals.messages.push({
            type: 'error',
            text: "Någonting gick fel mer inloggningen"
        })
    }
    try {
        const token = req.cookies['sibAdministrator']
        if(token) {
            const adminInfo = await admin.findOne({}).lean()
            if(token === adminInfo.token) {
                res.locals.admin = true
                res.locals.layout = 'layouts/admin'
            } else {
                res.locals.admin = false
                res.locals.layout = 'layouts/user'
            }
        } else {
            res.locals.admin = false
        }
    } catch(e) {
        res.locals.messages.push({
            type: 'error',
            text: "Någonting gick fel mer inloggningen"
        })
    }
    next()
}

function populateCategories(category, articles) {
    if(category.subCategories.length) 
        category.subCategories = category.subCategories.map(s => populateCategories(s, articles))
    return {
        ...category,
        articles: articles.filter(article => article.categoryLink == category.link)
    }
}

async function generateBasicVariables(req, res, next)  {
    const categories = await category.find().sort({order: 1}).populate({path: 'subCategories'}).select('name link').lean()
    const articles = await article.find({private: false}).sort({date: -1}).select("name link categoryLink").lean()
    res.locals.categories = categories.map(c => populateCategories(c, articles))

    res.locals.url = req.protocol + '://' + req.get('host') + req.originalUrl;
    res.locals.productionUrl = PRODUCTION_DOMAIN;

    if(req.session.messages) res.locals.messages = req.session.messages
    req.session.messages = []
    
    next()
}

app.get('/', async (req, res) => {
    const articles = await article.find({private: false, frontPage: true}).sort({date: -1}).lean().limit(12)
    res.render('pages/index', {
        title: 'För dig som vill ha ny kunskap om sibirisk katt.',
        articles: articles,
        styles: ['index', 'category', 'partials/articlebox']
    })
});

app.use('/uppfodarlista', uppfodarRouter)
app.use('/administrera', adminRouter)
app.use('/search', searchRouter)
app.use('/', seoRouter)
app.use('/', articleRouter)

app.post('/adminauthentication', async (req, res) => {
    try {
        if(req.body.password && req.body.password !== "") {
            const adminInfo = await admin.findOne({})
            if(req.body.password == adminInfo.password) {
                res.cookie('sibAdministrator', adminInfo.token, { maxAge: 6048000000, httpOnly: true });
                return res.redirect('/administrera')
            } else {
                req.session.messages.push({
                    type: "information",
                    text: "Lösenordet är fel"
                });
            }
        } else {
            req.session.messages.push({
                type: "information",
                text: "Ange ett lösenord"
            });
        }
    } catch(e) {
        req.session.messages.push({
            type: "error",
            text: "Någonting gick fel med inlogngingen"
        });
    }
    res.redirect('/administrera')
})

app.get('*', (req, res) => {
    res.sendStatus(404)
})

app.listen(3000)