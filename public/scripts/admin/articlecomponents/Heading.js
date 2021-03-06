import { Component } from './Component.js'
import { selectElement } from '../articlemodules/utilities.js'

class Heading extends Component {
    constructor() {
        const heading = document.createElement('h2')
        heading.className = "h"
        heading.innerText = "En rubrik"
        heading.contentEditable = true
        super([heading], 'Heading', document.querySelector('.headingEditor'))
        this.heading = heading
        this.sizeInput = this.editor.querySelector('.headingSize')
        this.resizeFunction = this.editHeadingSize.bind(this)
        this.heading.addEventListener('paste', this.removePaste)
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
        const newHeading = document.createElement(`h${newSize}`)
        newHeading.contentEditable = true
        newHeading.className = "h"
        newHeading.innerText = this.heading.innerText
        this.heading.parentElement.replaceChild(newHeading, this.heading)
        this.heading = newHeading
        this.elements[0] = newHeading
        this.heading.addEventListener('paste', this.removePaste)
    }
}

function getSizeFromHeading(heading) {
    return Number(heading.localName.substring(1))
}

export {Heading}