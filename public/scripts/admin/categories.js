function* getId() {
    let index = 0;
    while (true) {
      yield index;
      index++;
    }
  }
  
const iterator = getId();
let deletions = []

const categoriesElement = document.querySelector('.categories')
let currentlyEdited;

function loadCategories(categories, parent) {
    categories.forEach(category => {
        const element = generateCategoryElement(category)
        parent.appendChild(element)
        if(category.subCategories.length)
            loadCategories(category.subCategories, element.querySelector('.subcategories'))
    })
}

loadCategories(categories, categoriesElement)

function generateCategoryElement({name, _id: id, description}) {
    const template = document.querySelector('template')
    const category = template.content.firstElementChild.cloneNode(true)
    category.querySelector('.name').innerText = name;
    category.id = id
    category.dataset.description = description
    category.querySelector('.edit').dataset.id = id
    category.querySelector('.remove').dataset.id = id

    category.querySelector('.edit').addEventListener('click', editCategory)
    category.querySelector('.remove').addEventListener('click', removeCategory)

    return category

}

function addNew() {
    const name = document.querySelector('.categoryName').value
    document.querySelector('.categoryName').value = ""
    const element = generateCategoryElement({name: name, _id: `newCategory${iterator.next().value}`});
    element.dataset.new = "true"
    if(currentlyEdited)
        currentlyEdited.querySelector('.subcategories').appendChild(element)
    else
        categoriesElement.insertBefore(element, categoriesElement.firstChild)
    return false
}

function selectCategory(parent) {
    const name = parent.querySelector('.name').innerText
    document.querySelector('.toCategory').innerText = ` underkategori i ${name}`
    currentlyEdited = parent
    parent.classList.add('active')
    document.querySelector('.editingHeading').innerText = name
    document.querySelector('.description').innerHTML = parent.dataset.description
}

function deselectCategory() {
    document.querySelector('.toCategory').innerText = ""
    currentlyEdited.classList.remove('active')
    currentlyEdited = null
    document.querySelector('.editingHeading').innerText = "Lägg till"
    document.querySelector('.description').innerHTML = ""
}

function editCategory(e) {
    const parent = document.getElementById(e.currentTarget.dataset.id)
    if(parent === currentlyEdited) return deselectCategory()
    if(currentlyEdited) deselectCategory()
    selectCategory(parent)
}

function updateDescription() {
    currentlyEdited.dataset.description = document.querySelector('.description').innerHTML
}

document.querySelector('.saveDescription').addEventListener('click', updateDescription)

function removeCategory(e) {
    const parent = document.getElementById(e.currentTarget.dataset.id)
    currentlyEdited = parent
    deselectCategory()
    if(!parent.dataset.new) {
        deletions.push(parent.id)
        const subCategories = [...parent.querySelectorAll('.parent')]
            .filter(category => category.dataset.new != "true")
            .map(category => category.id)
        deletions = [...deletions, ...subCategories]
    }
    parent.remove()
}

document.querySelector('.up').addEventListener('click', () => move('u'))
document.querySelector('.down').addEventListener('click', () => move('d'))

function move(dir) {
    if(!currentlyEdited) return
    const newNode = currentlyEdited.cloneNode(true)
    newNode.querySelectorAll('.edit').forEach(editButton => editButton.addEventListener('click', editCategory))
    newNode.querySelectorAll('.remove').forEach(editButton => editButton.addEventListener('click', removeCategory))
    if(dir == 'u')
        currentlyEdited.parentElement.insertBefore(newNode, currentlyEdited.previousSibling)
    else if(currentlyEdited.nextSibling?.nextSibling)
        currentlyEdited.parentElement.insertBefore(newNode, currentlyEdited.nextSibling.nextSibling)
    else 
        currentlyEdited.parentElement.appendChild(newNode)
        
    currentlyEdited.remove()
    currentlyEdited = newNode
    selectCategory(newNode)

}

async function save() {
    const categories = [...document.querySelectorAll('.categories > .parent')].map(mapCategory)
    console.log(categories)
    let promise = await fetch('/administrera/categories/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            categories: categories,
            deletions: deletions
        })
    });
    
    if(promise.ok) return window.location.href = "/administrera";
    const response = await promise.json()
    alert(response.message)
}

function mapCategory(category) {
    return {
        name: category.querySelector('.name').innerText,
        id: category.id,
        description: category.dataset.description,
        subCategories: [...category.children[1].children].map(mapCategory),
        new: category.dataset.new == "true"
    }
}

document.querySelector('.save').addEventListener('click', save)