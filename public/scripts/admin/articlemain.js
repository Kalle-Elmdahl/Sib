import { load, save, openLevel, getElementFromString, deselectAll, replaceCharacters} from './articlemodules/utilities.js'
import { startMoveElement } from './articlemodules/editing.js'

// Article
let components = []
document.querySelectorAll('.component').forEach(component => {
    component.addEventListener('mousedown', e => {
        startMoveElement(e, getElementFromString(e.target.dataset.element))
    })
})

document.querySelector('.moveComponent').addEventListener('mousedown', e => {
    components.forEach(component => {
        if(component.selected) {
            component.hide()
            startMoveElement(e, component)
        }
    })
})

document.querySelector('.removeCompontent').addEventListener('click', e => {
    components = components.filter(component => {
        if(component.selected) {
            component.hideEditor()
            component.parentElement.remove()
            document.querySelector('.universalEditor').classList.remove('visible')
        }
        return !component.selected
    })
})

document.querySelector('.duplicateComponent').addEventListener('click', e => {
    document.querySelector('.duplicateComponent').blur()
    for(const component of components) {
        if(component.selected) {
            const {constructor} = component
            const newComponent = new constructor()
            newComponent.elements.forEach((element, index) => {
                if(element.getAttribute('src')) {
                    element.src = component.elements[index].src;
                } else {
                    element.innerHTML = component.elements[index].innerHTML;
                }

                if(element.id)
                    element.id = component.elements[index].id

                if(element.localName !== component.elements[index].localName) {
                    //Heading with differentSize
                    newComponent.editHeadingSize()
                }
            })
            newComponent.append(component, true)
            components.splice(components.indexOf(component), 0, newComponent);
            component.deSelect()
            break;
        }
    }
})

// SIDEBAR

document.querySelector('.sidebar .backButton').addEventListener('click', openLevel)
document.querySelector('.sidebar .backButton').addEventListener('click', deselectAll)
document.querySelector('.startEditing').addEventListener('click', openLevel)

document.querySelector('.articleCategoryInput').addEventListener('click', openLevel)

document.querySelector('.articleNameInput').addEventListener('input', e => {
    document.querySelector('.articleNameLinkInput').value = replaceCharacters(e.target.value)
})

document.querySelector('.articleCategoryInput').addEventListener('change', e => {
    document.querySelector('.articleCategoryLinkInput').value = replaceCharacters(e.target.value)
})

const selectCoverImage = new SelectImage(({original, compressed}) => {
    document.querySelector('.coverImagePreview').src = compressed
    document.querySelector('.coverImageInput').value = original
})

document.querySelector('.articleCoverImageButton').addEventListener('click', selectCoverImage.open.bind(selectCoverImage))

// TAGS

function addTag(e) {
    e.preventDefault()
    const cloneTagElement = document.querySelector('.tagTemplate').content.querySelector('button').cloneNode(true)
    console.log(cloneTagElement)
    console.log(cloneTagElement.children[0])
    cloneTagElement.children[0].innerText = document.querySelector('.addTagInput').value
    cloneTagElement.children[1].value = document.querySelector('.addTagInput').value
    document.querySelector('.acticleTags .tags').appendChild(cloneTagElement)
    document.querySelector('.addTagInput').value = ""
}

document.querySelector('.addTag').addEventListener('click', addTag)
document.querySelector('.addTagInput').addEventListener('keydown', e => {
    if(e.keyCode === 13) addTag(e)
})

// FILE RELATED

// SAVE
document.querySelector('.saveButton').addEventListener('click', e => save(e, false))
document.querySelector('.saveButtonAndLeave').addEventListener('click', e => save(e, true))

document.querySelector('.savePopupButton').addEventListener('click', e => save(e, false))
document.querySelector('.savePopupButtonAndLeave').addEventListener('click', e => save(e, true))

window.addEventListener('keydown', e => {
    if(e.key === "s" && (e.metaKey || e.ctrlKey)) save(e, false)
})


// SAVE POPUP
document.querySelector('.closeSavePopup').addEventListener('click', () => {
    document.querySelector('.savePopup').classList.remove('visible')
})

document.querySelector('.savePopup .backdrop').addEventListener('click', () => {
    document.querySelector('.savePopup').classList.remove('visible')
})

// DONT SAVE

document.querySelector('.leaveNoSave').addEventListener('click', () => {
    window.removeEventListener('beforeunload', checkSave)
    window.location.href = "/administrera"
})

// LOAD
window.addEventListener('load', load)

// UNLOAD
window.addEventListener('beforeunload', checkSave)

function checkSave(e) {
    if(!window.location.href.match(/sibiriskakatten.se/ig)) return
    e.returnValue = `Är du säker på att du vill lämna utan att spara`;
    document.querySelector('.savePopup').classList.add('visible')
}

// DELETE
const removeArticleButton = document.querySelector('.removeButton')
if(removeArticleButton) {
    removeArticleButton.addEventListener('click', () => {
        const response = prompt("Sriv 'ja' om du vill ta bort artikeln", "")
        if(response !== null && response.toLowerCase() === "ja") {
            window.location.href = removeArticleButton.dataset.removelink
        }
    })
}

export {components, checkSave}