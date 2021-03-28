const express = require('express')
const {category, subCategory} = require('../../models/category.js')
const router = express.Router()

router.get('/', async (req, res) => {
    const parentCategories = await category.find().sort({order: 1}).populate({path: 'subCategories'});
    res.render('admin/category', {
        parentCategories: parentCategories,
        title: "Edit categories",
        scripts: ["admin/categories"],
        styles: ["admin/categories"],
    })
})

router.post('/update', async (req, res) => {
    const categories = req.body.categories
    for(let i = 0; i < categories.length; i++) {
        const sentCategory = categories[i] // Get info about new / updated category
        let newCategory
        if(sentCategory.new) { // The category is new; generate one
            newCategory = new category({
                name: sentCategory.name,
                link: sentCategory.link,
                description: (sentCategory.description || ""),
                order: i,
            })
        } else { // Find the category 
            newCategory = await category.findById(sentCategory.id)
            if(newCategory == null) 
                return res.status(400).send({
                    message: 'Could not find existing category named: ' + sentCategory.name
                });
            newCategory.order = i
            newCategory.description = sentCategory.description
        }
        for(let j = 0; j < sentCategory.subCategories.length; j++) {// Update all of the subcategories recursively
            newCategory.subCategories[j] = await addSubCategories(sentCategory.subCategories[j], j)
        }
        newCategory.markModified('subCategories');
        await newCategory.save() // Save
    }
    const deletions = req.body.deletions

    if(deletions.length) {
        await category.deleteMany({
            _id: {
                $in: deletions
            }
        })

        await category.updateMany({subCategories: {$in: deletions}}, { $pullAll: { subCategories: deletions } })
        
        await subCategory.deleteMany({
            _id: {
                $in: deletions
            }
        })

        await subCategory.updateMany({subCategories: {$in: deletions}}, { $pullAll: { subCategories: deletions } })
    }

    res.send("success")
})

async function addSubCategories(sub, index) {
    let newSub
    if(sub.new) {
        newSub = new subCategory({
            name: sub.name,
            link: sub.link,
            description: (sub.description || ""),
            order: index,
        })
    } else {
        newSub = await subCategory.findById(sub.id)
        newSub.description = sub.description || ""
        newSub.order = index
    }
    
    if(sub.subCategories.length) {
        for(let i = 0; i < sub.subCategories.length; i++) {
            newSub.subCategories[i] = await addSubCategories(sub.subCategories[i])
        }
    }
    await newSub.save()
    return newSub._id
}


module.exports = router