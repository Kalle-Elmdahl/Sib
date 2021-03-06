Dropzone.options.imageUpload = {
    paramName: "file",
    success: file => {
        const response = JSON.parse(file.xhr.response);

        const newImage = document.createElement('img')
        newImage.src = response.compressed
        newImage.dataset.original = response.original
        newImage.dataset.lastmod = response.date
        newImage.dataset.size = response.size
        newImage.dataset.photographer = response.photographer
        newImage.dataset.id = response._id

        const newDiv = document.createElement('div')
        newDiv.className = "image"
        newDiv.appendChild(newImage)
        newDiv.addEventListener('click', toggleImage)

        document.querySelector('.imagesList').insertBefore(newDiv, document.querySelector('.imagesList').childNodes[0])
    }
}

const images = document.querySelector('.imagesList').childNodes

images.forEach(image => image.addEventListener('click', toggleImage))
document.querySelector('.hideViewImage').addEventListener('click', e => toggleImage(e, false))
document.querySelector('.closeViewImage').addEventListener('click', e => toggleImage(e, false))

function toggleImage(e, open = true) {
    document.body.classList.toggle('showImgPreview')
    if(open) {
        const image = e.target;
        const imageDate = new Date(image.dataset.lastmod).toISOString().substring(0, 10);
        document.querySelector('.imageBig').src = image.dataset.original;
        document.querySelector('.thumbnail').src = image.src;
        document.querySelector('.modifiedDate').innerText = imageDate;
        document.querySelector('.size').innerText = Math.round(Number(image.dataset.size) / 1000) + " kB";
        document.querySelector('.photographerForm').action = "/administrera/update?id=" + image.dataset.id + "&model=image&redirect=" + window.location.pathname
        document.querySelector('.photographer').value = image.dataset.photographer;
        document.querySelector('.removeImage').href = "/administrera/images/removeimage" + image.dataset.original;
    }
}