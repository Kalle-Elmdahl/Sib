import { components } from '../articlemain.js'
import { deselectAll, pauseEvent } from './utilities.js'

const HEADER_HEIGHT = 84;
const movingComponent = document.querySelector('.movingComponent')
const articleContent = document.querySelector('.article-content')
let moveTarget;
let movingElement;
let lastScroll;

function startMoveElement(e, element) {
    deselectAll()
    pauseEvent(e);
    movingElement = element;
    setMovingComponentContent(element)
    moveTarget = null;
    lastScroll = window.scrollY
    document.querySelector('.universalEditor').classList.remove('visible')
    articleContent.classList.add('moving')
    movingComponent.classList.add('visible')
    movingComponent.style.setProperty('--xOffset', e.clientX)
    movingComponent.style.setProperty('--yOffset', e.clientY + window.scrollY - HEADER_HEIGHT)
    window.addEventListener('mousemove', moveElement)
    window.addEventListener('scroll', moveElementOnScroll)
    window.addEventListener('mouseup', stopMoveElement)
}

function moveElement(e) {
    if(e.clientY < HEADER_HEIGHT) {
        window.scrollBy(0, -10)
    } else if(e.clientY > window.innerHeight - HEADER_HEIGHT) {
        window.scrollBy(0, 10)
    }
    movingComponent.style.setProperty('--xOffset', e.clientX)
    movingComponent.style.setProperty('--yOffset', e.clientY + window.scrollY - HEADER_HEIGHT)
    articleContent.classList.remove('showBar')
    if(e.target !== articleContent) return moveTarget = null
    moveTarget = findClosestSection(e.offsetY)

    articleContent.classList.add('showBar')
    if(moveTarget === 0) {
        const barOffset = articleContent.getBoundingClientRect().height
        articleContent.style.setProperty('--yOffset', barOffset)
    } else {
        const barOffset = moveTarget.parentElement.offsetTop
        articleContent.style.setProperty('--yOffset', barOffset)
    }
}

function findClosestSection(yOffset) {
    let closest = Number.POSITIVE_INFINITY, closestComponent = 0;
    components.forEach(component => {
        const sectionYOffset = component.parentElement.offsetTop + component.parentElement.getBoundingClientRect().height / 2
        const dy = sectionYOffset - yOffset
        if(dy > 0 && dy < closest) {
            closestComponent = component
            closest = dy
        }
    })
    return closestComponent
}

function moveElementOnScroll() {
    const currentOffset = Number(movingComponent.style.getPropertyValue('--yOffset'))
    const dy = window.scrollY - lastScroll
    lastScroll += dy
    movingComponent.style.setProperty('--yOffset', currentOffset + dy)
}

function stopMoveElement(e) {
    window.removeEventListener('mousemove', moveElement)
    window.removeEventListener('mouseup', stopMoveElement)
    window.removeEventListener('scroll', moveElementOnScroll)
    movingComponent.classList.remove('visible')
    articleContent.classList.remove('showBar')
    articleContent.classList.remove('moving')
    movingElement.show()
    if(moveTarget === null) return
    const moving = components.some(component => component === movingElement)
    if(moveTarget === 0) {
        movingElement.append(null, moving)
    } else {
        movingElement.append(moveTarget, moving);
    }
    if(moving) sortCompontents()
}

function setMovingComponentContent(element) {
    const imageCopy = document.querySelector('.componentImage' + element.name).cloneNode(true)
    imageCopy.classList.remove('componentImage' + element.name)
    imageCopy.classList.add('componentImage')
    const oldImage = movingComponent.querySelector('.componentImage');
    oldImage.parentNode.replaceChild(imageCopy, oldImage)
    const heading = movingComponent.querySelector('h3')
    heading.innerText = element.name
}

function sortCompontents() {
    const nodes = [...document.querySelector('.article-content').childNodes]
    components.sort((a, b) => nodes.indexOf(a.parentElement) - nodes.indexOf(b.parentElement))
}

export {startMoveElement}
