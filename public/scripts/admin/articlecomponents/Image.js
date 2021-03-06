import { Component } from './Component.js'

class Image extends Component {
    constructor() {
        const image = document.createElement('img')
        const photographer = document.createElement('span')
        image.src = "/resources/assets/placeholder.png"
        photographer.innerText = "Bildens fotograf"
        photographer.className = "photographer"
        super([image, photographer], 'Image', document.querySelector('.imageEditor'))
        this.image = image
        this.photographer = photographer
        this.selectButton = this.editor.querySelector('.selectImageButton')
        this.selectImage = new SelectImage(({original, photographer}) => {
            this.image.src = original
            this.photographer.innerText = photographer
        })
        this.selectImageEvent = this.selectImage.open.bind(this.selectImage)
    }

    afterAppend() {
        this.selectImage.open()
    }

    afterShowEditor() {
        this.selectButton.addEventListener('click', this.selectImageEvent)
    }

    afterHideEditor() {
        this.selectButton.removeEventListener('click', this.selectImageEvent)
    }
}

export {Image}