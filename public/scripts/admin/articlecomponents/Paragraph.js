import { Component } from './Component.js'
import { saveSelection, restoreSelection, selectElement, sleep } from '../articlemodules/utilities.js'
import { components } from '../articlemain.js'

class Paragraph extends Component {
    constructor() {
        const paragraph = document.createElement('p')
        paragraph.innerText = "Amet voluptatibus ea parturient, excepteur varius nibh minima, eiusmod provident occaecati autem ornare, omnis habitant minima?"
        paragraph.className = "paragraph"
        paragraph.contentEditable = true
        super([paragraph], 'Paragraph', document.querySelector('.paragraphEditor'))
        this.paragraph = paragraph

        this.startLinkFunction = this.startLinking.bind(this)
        this.linkSelectedFunction = this.linkSelected.bind(this)
        this.savedSelection;

        this.textSelected = false
        this.paragraph.addEventListener('mouseup', this.selectedText.bind(this));
        this.paragraph.addEventListener('keyup', this.selectedText.bind(this));

        window.addEventListener('mouseup', this.deselectedText.bind(this));
        window.addEventListener('keydown', this.deselectedText.bind(this));
        this.paragraph.addEventListener('blur', this.deselectedText.bind(this));
        this.paragraph.addEventListener('paste', removePasteFormatting)
        this.editButtons = document.querySelectorAll('.paragraphEditor > button')
    }

    afterAppend() {
        this.paragraph.focus()
        selectElement(this.paragraph)
        this.editButtons.forEach(button => button.classList.add('active'))
    }

    afterShowEditor() {
        document.querySelector('.paragraphStartLink').addEventListener('click', this.startLinkFunction)
        document.querySelector('.paragraphLink').addEventListener('click', this.linkSelectedFunction)
    }

    afterHideEditor() {
        document.querySelector('.linkInput').classList.remove('visible')
        document.querySelector('.paragraphStartLink').removeEventListener('click', this.startLinkFunction)
        document.querySelector('.paragraphLink').removeEventListener('click', this.linkSelectedFunction)
    }

    selectedText(e) {
        if(!this.textSelected && window.getSelection().toString() !== "") {
            this.textSelected = true
            this.editButtons.forEach(button => button.classList.add('active'))
        }
    }

    async deselectedText(loop = false) {
        if(!this.selected) return
        const startNode = window.getSelection().anchorNode
        const endNode = window.getSelection().extentNode
        if(this.paragraph.contains(startNode) && this.paragraph.contains(endNode)) {
            if(this.textSelected && window.getSelection().toString() === "") {
                this.textSelected = false
                this.editButtons.forEach(button => button.classList.remove('active'))
            }
        } else {
            this.textSelected = false
            this.editButtons.forEach(button => button.classList.remove('active'))
        }
        if(loop === true) return
        await sleep(200)
        this.deselectedText(true)
    }

    startLinking() {
        document.querySelector('.linkInput').classList.add('visible')
        this.savedSelection = saveSelection(this.paragraph)
    }

    linkSelected() {
        document.querySelector('.linkInput').classList.remove('visible')
        restoreSelection(this.paragraph, this.savedSelection)
        const link = document.querySelector('.linkText').value
        var selectedText = document.getSelection().toString()
        document.execCommand('insertHTML', false, '<a href="' + link + '" target="_blank">' + selectedText + '</a>')
        document.querySelector('.linkText').value = ""
    }
}

// GLOBAL PARAGRAPH EDITING
document.querySelector('.paragraphBold').addEventListener('click', () => document.execCommand('bold'))
document.querySelector('.paragraphUnderline').addEventListener('click', () => document.execCommand('underline'))
document.querySelector('.paragraphItalic').addEventListener('click', () => document.execCommand('italic'))
document.querySelector('.paragraphList').addEventListener('click', () => document.execCommand('insertUnorderedList'))

window.addEventListener('keydown', removeLinkContentEditable)
window.addEventListener('keyup', restoreLinkhContentEditable)

function removeLinkContentEditable(e) {
    if(e.repeat || (e.keyCode != 17 && e.keyCode != 91)) return
    components.forEach(compontent => {
        if(compontent.name == 'Paragraph') {
            compontent.paragraph.querySelectorAll('a').forEach(anchor => anchor.contentEditable = false)
        }
    })
}

function restoreLinkhContentEditable(e) {
    if(e.keyCode != 17 && e.keyCode != 91) return
    components.forEach(compontent => {
        if(compontent.name == 'Paragraph') {
            compontent.paragraph.querySelectorAll('a').forEach(anchor => anchor.removeAttribute('contentEditable'))
        }
    })
}

function removePasteFormatting(e) {
    let paste = (e.clipboardData || window.clipboardData);
    paste = paste.getData('text').split(/\n/g)
 
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    selection.deleteFromDocument();
    if(paste.length > 1) {
        const [first, ...rows] = [...paste]
        rows.reverse().forEach(row => {
            const newRow = document.createElement('div')
            newRow.innerHTML = '<br>'
            newRow.innerText += row
            selection.getRangeAt(0).insertNode(newRow);
        })
    }
    if(paste.length > 0) {
        selection.getRangeAt(0).insertNode(document.createTextNode(paste[0]));
    }

    e.preventDefault();
}

export {Paragraph}