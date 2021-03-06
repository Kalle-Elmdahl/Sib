const express = require('express')

const Image = require('../../models/image.js')

const fs = require('fs');
const path = require('path')
const multer = require('multer');
const sharp = require("sharp");
const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './bilder');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get('/sync', async (req, res) => {
    let imageFileNames = fs.readdirSync('./bilder');
    //remove folders
    imageFileNames = imageFileNames.filter(file => path.extname(file) != '')
    imageFileNames = imageFileNames.map(file => "/" + file)
    let overRepresentedImages = await Image.find({original: {$nin: imageFileNames}})
    overRepresentedImages = overRepresentedImages.map(image => image.original)

    const allImages = await Image.find()
    let underRepresentedImages = imageFileNames.filter(imageFileName => {
        return !allImages.some(image => image.original == imageFileName)
    })
    
    await Image.deleteMany({original: {$in: overRepresentedImages}}, err => {
        if(err) return res.status(500).send("någonting gick fel")
    })

    underRepresentedImages = underRepresentedImages.map(image => {
        const stats = fs.statSync('./bilder' + image);
        return {
            original: image,
            compressed: "/compressed" + image.replace('.png', '.jpg'),
            size: stats.size,
            date: stats.mtime
        }
    })
    await Image.insertMany(underRepresentedImages)
    res.send("Synkad")
});

router.get('/', async (req, res) => {
    const images = await Image.find({}).sort({date: -1})
    res.render('admin/images', {
        title: 'Administrera bilder',
        styles: ['admin/images'],
        scripts: ['admin/images'],
        images: images,
    })
})

router.post('/uploadimage', upload.single('file'), async (req, res) => {
    try {
        await sharp('./bilder/' + req.file.filename)
            .resize({width: 300})
            .toFormat("jpeg")
            .jpeg({
                quality: 90,
                chromaSubsampling: '4:4:4',
                force: true,
            })
            .toFile('./bilder/compressed/' + req.file.filename.split('.')[0] + ".jpg");

        const newImage = new Image({
            date: new Date().toISOString(),
            original: "/" + req.file.filename,
            compressed: '/compressed/' + req.file.filename.split('.')[0] + ".jpg",
            photographer: "",
            size: req.file.size
        })
        newImage.save(err => {
            if(err) return res.status(500).send("någonting gick fel")
        })

        return res.status(201).json(newImage);
    } catch (error) {
        console.error(error);
        return res.status(500).send("någonting gick fel")
    }
})

router.get('/removeimage/:imagename', async (req, res) => {
    const imgName = decodeURIComponent(req.params.imagename)
    const originalFile = './bilder/' + imgName;
    const compressedFile = './bilder/compressed/' + imgName.replace(path.extname(imgName), '') + '.jpg';
    if (fs.existsSync(originalFile)) {
        fs.unlinkSync(originalFile);
    }
    if (fs.existsSync(compressedFile)) {
        fs.unlinkSync(compressedFile);
    }
    await Image.deleteOne({original: "/" + imgName})
    res.redirect('/administrera/images')
})

module.exports = router