import { Component } from './Component.js'

class Video extends Component {
    constructor() {
        '<iframe width="560" height="315" src="https://www.youtube.com/embed/llj-Y1dm7Rs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
        const videoIframe = document.createElement('iframe')
        
        videoIframe.width = 560;
        videoIframe.height = 315;
        videoIframe.src = 'https://www.youtube.com/embed/';
        videoIframe.setAttribute('frameborder', 0)
        videoIframe.setAttribute('allow', "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture")
        videoIframe.allowFullscreen = true;

        super([videoIframe], 'Video', document.querySelector('.videoEditor'))
        this.videoIframe = videoIframe
        this.updateLinkInput = this.editor.querySelector('.editVideoLinkInput')
        this.startTimeInput = this.editor.querySelector('.editVideoStartTime')
        this.updateLinkButton = this.editor.querySelector('.editVideoLinkButton')
        this.updateLinkEvent = this.updateLink.bind(this)
    }

    afterShowEditor() {
        if(this.videoIframe.src !== 'https://www.youtube.com/embed/') {
            //remove start
            this.updateLinkInput.value = this.videoIframe.src.split('?')[0].replace('https://www.youtube.com/embed/', 'https://www.youtube.com/watch?v=')
            const urlSplit = this.videoIframe.src.split('?');
            if(urlSplit.length > 1) {
                const startTime = urlSplit[1].split('=')[1]
                console.log(startTime)
                this.startTimeInput.value = startTime
            } else this.startTimeInput.value = ""
        } else {
            this.updateLinkInput.value = ""
        }
        this.updateLinkButton.addEventListener('click', this.updateLinkEvent)
    }

    afterHideEditor() {
        this.updateLinkButton.removeEventListener('click', this.updateLinkEvent)
    }

    updateLink() {
        const url = new URLSearchParams(this.updateLinkInput.value.replace('https://www.youtube.com/watch', ''))
        const videoId = url.get('v')
        const start = this.startTimeInput.value === "" ? "" : "?start=" + this.startTimeInput.value;
        console.log(start)
        this.videoIframe.src = 'https://www.youtube.com/embed/' + videoId + start;
    }
}

export {Video}