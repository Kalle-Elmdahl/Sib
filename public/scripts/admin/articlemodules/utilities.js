import { Heading } from '../articlecomponents/Heading.js';
import { Paragraph } from '../articlecomponents/Paragraph.js';
import { Video } from '../articlecomponents/Video.js';
import { Image } from '../articlecomponents/Image.js';
import { components, checkSave } from '../articlemain.js';

const sidebarLevels = document.querySelectorAll('.sidebarLevel')
const sidebarBackButton = document.querySelector('.sidebar .backButton')
const levelsContainer = document.querySelector('.levels')
let currentOpen = document.querySelector('.topLevel')
let endLevelTransitionPassedEvent;

levelsContainer.addEventListener('scroll', () => {
    currentOpen.dataset.scrolled = levelsContainer.scrollTop
})

async function openLevel(e, targetClass) {
    let target;
    if(targetClass) {
        target = document.querySelector(targetClass)
    } else {
        target = document.querySelector(e.target.dataset.targetclass)
    }
    if(target == null || currentOpen === target) return
    const targetLevel = Number(target.dataset.level);
    levelsContainer.classList.add('transitioning')

    sidebarLevels.forEach(level => {
        if(Number(level.dataset.level) > targetLevel) {
            level.classList.add('closed')
        } 
    })
    if(target.classList.contains('closed')) {
        target.style.setProperty('--translatey', levelsContainer.scrollTop)
        target.addEventListener('transitionend', endLevelTransitionClosed)
    } else if(target.classList.contains('passed')) {
        if(target.dataset.scrolled) target.style.setProperty('--translatey', "-" + target.dataset.scrolled)
        endLevelTransitionPassedEvent = e => endLevelTransitionPassed(e, target)
        currentOpen.addEventListener('transitionend', endLevelTransitionPassedEvent)
    }

    await sleep(10);
    target.classList.remove('closed')
    target.classList.remove('passed')
    sidebarBackButton.blur();
    if(target.dataset.parent) {
        sidebarBackButton.dataset.targetclass = target.dataset.parent;
        document.querySelector('.backButtonLabel').innerText = document.querySelector(target.dataset.parent).dataset.title
        document.querySelector('.backButtonLabel').classList.add('visible')
    } else {
        document.querySelector('.backButtonLabel').classList.remove('visible')
    }
}

function endLevelTransitionClosed(e) {
    e.target.removeEventListener('transitionend', endLevelTransitionClosed)
    e.target.style.setProperty('--translatey', 0)

    const targetLevel = Number(e.target.dataset.level);
    sidebarLevels.forEach(level => {
        if(Number(level.dataset.level) < targetLevel) {
            level.classList.remove('closed')
            level.classList.add('passed')
        } 
    })
    currentOpen = e.target;
    levelsContainer.classList.remove('transitioning')
}

function endLevelTransitionPassed(e, target) {
    e.target.removeEventListener('transitionend', endLevelTransitionPassedEvent)
    target.style.setProperty('--translatey', 0)
    if(target.dataset.scrolled) levelsContainer.scrollTop = Number(target.dataset.scrolled)
    currentOpen = target;
    levelsContainer.classList.remove('transitioning')
}

function deselectAll() {
    components.forEach(component => component.deSelect())
}

function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}

function selectElement(element) {
    const range = document.createRange();
    range.selectNodeContents(element);  
    const selection = window.getSelection(); 
    selection.removeAllRanges(); 
    selection.addRange(range); 
}

function getElementFromString(string) {
    switch(string) {
        case 'heading':
            return new Heading()
        case 'paragraph':
            return new Paragraph()
        case 'image':
            return new Image()
        case 'video':
            return new Video()
    }
}

function saveSelection(containerEl) {
    var range = window.getSelection().getRangeAt(0);
    var preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerEl);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    var start = preSelectionRange.toString().length;

    return {
        start: start,
        end: start + range.toString().length
    };
};

function restoreSelection(containerEl, savedSel) {
    var charIndex = 0, range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);
    var nodeStack = [containerEl], node, foundStart = false, stop = false;

    while (!stop && (node = nodeStack.pop())) {
        if (node.nodeType == 3) {
            var nextCharIndex = charIndex + node.length;
            if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                range.setStart(node, savedSel.start - charIndex);
                foundStart = true;
            }
            if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                range.setEnd(node, savedSel.end - charIndex);
                stop = true;
            }
            charIndex = nextCharIndex;
        } else {
            var i = node.childNodes.length;
            while (i--) {
                nodeStack.push(node.childNodes[i]);
            }
        }
    }

    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function pauseEvent(e){
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
}

function save(e, redirect) {
    e.preventDefault()
    const content = []
    components.forEach(component => {
        const section = {}
        switch(component.name.toLowerCase()) {
            case 'heading':
                section.tag = component.heading.localName
                section.content = component.heading.innerText
                break;
            case 'paragraph':
                section.tag = component.paragraph.localName
                section.content = component.paragraph.innerHTML
                break;
            case 'image':
                if(component.image.src.match(/placeholder/i)) return
                section.tag = component.image.localName
                section.content = component.image.src.replace(window.location.origin, '')
                break;
            case 'video':
                section.tag = component.videoIframe.localName
                section.content = component.videoIframe.src
                break;
        }
        content.push(section)
    })
    document.querySelector('.articleContentInput').value = JSON.stringify(content)
    window.removeEventListener('beforeunload', checkSave)
    if(!redirect) document.querySelector('.mainform').action += "&redirect=" + window.location.pathname
    document.querySelector('.SaveArticleSubmitButton').click();
}

function load() {
    const contentInput = document.querySelector('.articleContentInput')
    if(contentInput.value !== '[]') {
        const content = JSON.parse(contentInput.value)
        content.forEach((component, index) => {
            let newComponent;
            switch(component.tag.replace(/[0-9]/, '')) {
                case 'h':
                    newComponent = new Heading()
                    newComponent.heading.innerText = component.content
                    newComponent.editHeadingSize(Number(content[index].tag.substring(1)))
                    break;
                case 'p':
                    newComponent = new Paragraph()
                    newComponent.paragraph.innerHTML = component.content
                    break;
                case 'img':
                    newComponent = new Image()
                    newComponent.image.src = component.content
                    newComponent.photographer.innerText = component.photographer
                    break;
                case 'iframe':
                    newComponent = new Video()
                    newComponent.videoIframe.src = component.content
                    break;
            }
            newComponent.append(null, true)
            components.push(newComponent)
        })
    }
}

function replaceCharacters(name) {
    return encodeURIComponent(name.toLowerCase().replace(/ä/g, 'a').replace(/å/g, 'a').replace(/ö/g, 'o').replace(/\s/g, '-'))
}

export {replaceCharacters, load, save, restoreSelection, saveSelection, getElementFromString, selectElement, sleep, deselectAll, pauseEvent, openLevel};