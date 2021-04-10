import { Component } from './Component.js'
import { selectElement, replaceCharacters } from '../articlemodules/utilities.js'

const startText = "En rubrik"

class Heading extends Component {
    constructor() {
        const heading = document.createElement('h2')
        heading.className = "h"
        heading.id = replaceCharacters(startText)
        heading.innerText = startText
        heading.contentEditable = true
        super([heading], 'Heading', document.querySelector('.headingEditor'))
        this.heading = heading
        this.sizeInput = this.editor.querySelector('.headingSize')
        this.resizeFunction = this.editHeadingSize.bind(this)
        this.heading.addEventListener('paste', this.removePaste)

        this.observer = new MutationObserver(updateId);
        this.observer.observe(this.heading, {characterData: true, subtree: true})
    }

    afterAppend() {
        this.heading.focus()
        selectElement(this.heading)
    }

    afterShowEditor() {
        this.sizeInput.addEventListener('input', this.resizeFunction)
        this.sizeInput.value = getSizeFromHeading(this.heading)
    }

    afterHideEditor() {
        this.sizeInput.removeEventListener('input', this.resizeFunction)
    }

    removePaste(e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand("insertHTML", false, text);
    }

    editHeadingSize(size) {
        let newSize;
        if(typeof size === "number") {
            newSize = size
        } else {
            newSize = this.sizeInput.value
        }
        this.observer.disconnect()
        const newHeading = document.createElement(`h${newSize}`)
        newHeading.contentEditable = true
        newHeading.className = "h"
        newHeading.id = this.heading.id
        newHeading.innerText = this.heading.innerText
        this.heading.parentElement.replaceChild(newHeading, this.heading)
        this.heading = newHeading
        this.elements[0] = newHeading
        this.heading.addEventListener('paste', this.removePaste)
        this.observer.observe(this.heading, {characterData: true, subtree: true})
    }
}

function updateId([mutationRecord]) {
    const heading = mutationRecord.target.parentElement
    if(!heading) return
    heading.id = replaceCharacters(heading.innerText)
}

function getSizeFromHeading(heading) {
    return Number(heading.localName.substring(1))
}

export {Heading}