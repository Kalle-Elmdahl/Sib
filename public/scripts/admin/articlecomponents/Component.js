import {components} from '../articlemain.js'
import { startMoveElement } from '../articlemodules/editing.js'
import { openLevel, pauseEvent } from '../articlemodules/utilities.js'

const universalEditor = document.querySelector('.universalEditor')

class Component {
    constructor(elements, name, editor) {
        this.name = name
        this.elements = elements
        this.editor = editor
        this.selected = false
        this.parentElement = document.createElement('section')
        this.elements.forEach(element => this.parentElement.appendChild(element))
        this.parentElement.addEventListener('click', this.select.bind(this))
        this.parentElement.addEventListener('mousedown', this.mousedownMove.bind(this))
    }

    append(refComontent, moving) {
        const articleContent = document.querySelector('.article-content')
        if(refComontent) {
            articleContent.insertBefore(this.parentElement, refComontent.parentElement)
        } else {
            articleContent.appendChild(this.parentElement)
        }
        if(moving) return
        components.splice(components.indexOf(refComontent), 0, this);
        this.select()
        this.afterAppend()
    }

    select() {
        if(this.selected) return openLevel({}, "." + this.editor.classList[0])
        this.parentElement.classList.add('selected')
        this.selected = true
        for(const [index, component] of components.entries()) {
            if(component.selected && component !== this) {
                if(component.name === this.name) {
                    component.deSelect(false)
                    component.afterHideEditor()
                    this.afterShowEditor()
                } else {
                    component.deSelect()
                    this.showEditor()
                }
                break;
            } else if(index === components.length - 1) {
                this.showEditor()
            }
        }
        this.updateUniversalEditor()
    }

    deSelect(hide = true) {
        if(!this.selected) return
        this.parentElement.classList.remove('selected')
        this.selected = false
        if(hide === true) {
            this.hideEditor()
        }
        removeSelection()
        universalEditor.classList.remove('visible')
    }

    hide() {
        this.parentElement.style.display = "none"
    }

    show() {
        this.parentElement.removeAttribute('style')
    }
    
    showEditor() {
        openLevel({}, "." + this.editor.classList[0])
        if(this.afterShowEditor) this.afterShowEditor()
    }

    hideEditor() {
        openLevel({}, '.editorLevel')
        if(this.afterShowEditor) this.afterHideEditor()
    }

    updateUniversalEditor() {
        universalEditor.classList.add('visible')
        universalEditor.style.setProperty('--yOffset', this.elements[0].offsetTop)
    }

    waitForMouseUp(ms) {
        return new Promise((resolve, reject) => {
            window.addEventListener('mouseup', reject)
            setTimeout(resolve, ms) 
        }) 
    }

    async mousedownMove(e) {
        if(this.selected || e.button !== 0) return
        try {
            await this.waitForMouseUp(250)
        } catch(e) {
            return
        }
        this.parentElement.classList.add('shrink')
        try {
            await this.waitForMouseUp(500)
        } catch (e) {
            return this.parentElement.classList.remove('shrink')
        }
        removeSelection()
        this.hide()
        this.parentElement.classList.remove('shrink')
        startMoveElement(e, this)
    }
    
    afterAppend() {}
}

function removeSelection() {
    if (window.getSelection) {
        if (window.getSelection().empty) {
          window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
          window.getSelection().removeAllRanges();
        }
      } else if (document.selection) {
        document.selection.empty();
    }
}

export {Component}