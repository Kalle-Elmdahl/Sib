window.addEventListener('beforeunload', event => {
    if(window.location.href.match(/sibiriskakatten.se/ig)) {
        event.returnValue = `Är du säker på att du vill ladda om?`;
    }
});

//cover image
const selectCoverImage = new SelectImage(({original, photographer}) => {
    document.querySelector('.articleCoverImage').src = original
    document.querySelector('.coverImagePhotographer').innerText = photographer
})

document.querySelector('.addCoverImage').addEventListener('click', () => selectCoverImage.open())

const editor = document.getElementById("editor");
const parent = document.getElementById("parent");
const addNew = document.getElementById("addNew");
const sectionActions = document.getElementById("sectionActions");
const closeWindow = document.getElementsByClassName("closeWindow");

//window related
const windowsElement = document.getElementById("windows");
const windows = Array.from(windowsElement.children);
windows.shift(); //remove fade from windows


addNew.addEventListener("click", addNewBlock);
window.addEventListener('load', load);
Array.from(closeWindow).forEach(win => {
    win.addEventListener("click", closeWindows);
});

async function load() {
    closeWindows();
    parent.childNodes.forEach(element => element.addEventListener("mouseover", hoverSection))

    parent.querySelectorAll('p').forEach(paragraph => {
        paragraph.innerHTML = paragraph.dataset.content
        paragraph.removeAttribute('data-content')
    })
}

function showWindow(win) {
    windowsElement.style.display = "block";
    win.style.display = "";
}

function closeWindows() {
    windowsElement.style.display = "none";
    windows.forEach(win => {
        win.style.display = "none";
    });
}

function addNewBlock() {
    showWindow(windows[0]);
}

function createSection(type) {
    closeWindows();
    let newSection = document.createElement("section");
    let element;
    let select = false;

    switch (type) {
        case 'heading':
            element = document.createElement("h1");
            element.contentEditable = "true";
            select = true;
            break;
        case 'image':
            element = document.createElement("img");
            element.src = "/resources/assets/placeholder.png";
            break;
        case 'video':
            createVideoSection(newSection);
            return;
        case 'table':
            element = document.createElement("table");
            const tableRow = document.createElement('tr')
            element.appendChild(tableRow)
            newSection.appendChild(element);
            newSection.addEventListener("mouseover", (e) => {
                hoverSection(e);
            });
            parent.appendChild(newSection);
            activeElement = newSection
            editSection();
            return;

        default:
            element = document.createElement("p");
            element.contentEditable = "true";
            select = true;
            break;
    }
    newSection.appendChild(element);
    if(type === 'image') {
        newP = document.createElement('p')
        newP.className = "photographer"
        newSection.appendChild(newP)
    }
    newSection.addEventListener("mouseover", (e) => {
        hoverSection(e);
    });
    parent.appendChild(newSection);
    if(select) {
        parent.lastChild.children[0].focus();
    }
}

function createVideoSection(section) {
    let aspratio = 315 / 560;
    section.innerHTML = '<iframe width="528" height="' + 528 * aspratio + '" src="https://www.youtube.com/embed/" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    parent.appendChild(section);
    section.addEventListener("mouseover", (e) => {
        hoverSection(e);
    });
}

let activeElement;
let sectionIsMoving = false;
let closestI;

function hoverSection(el) {
    if(sectionIsMoving)
        return;
    let i;
    for (i = 0; i < el.path.length; i++) {
        if(el.path[i].localName == "section")
            break;
    }
    let offset = el.path[i].offsetTop - parent.offsetTop + el.path[i].clientHeight / 2 + 10;
    sectionActions.style.display = "block";
    sectionActions.style.top = offset + "px";
    activeElement = el.path[i];
    if(activeElement.firstChild.localName == "p")
        activeElement.firstChild.addEventListener('paste', pastingInP);
}

function removeActiveSection() {
    activeElement.remove();
    sectionActions.style.display = "none";
}

function moveActiveSection(e) {
    let offset = activeElement.offsetTop - parent.offsetTop;
    sectionIsMoving = true;
    activeElement.style.position = "absolute";
    activeElement.style.top = offset;
    activeElement.style.left = "5%";
    activeElement.style.width = "90%";
    activeElement.style.height = "50px";
    activeElement.style.background = "#fff";
    activeElement.style.boxShadow = "0px 0px 19px 0px rgba(0,0,0,0.46)";
    activeElement.style.opacity = .4;
    activeElement.style.overflow = "hidden"
    let startMouse = e.clientY;
    let moveEvent = (event) => {
        movingActiveSection(startMouse, event, offset, window.scrollY);
    }
    let stopMoveEvent = () => {
        stopmovingActiveSection(moveEvent);
    }
    window.addEventListener("mousemove", moveEvent);
    window.addEventListener("mouseup", stopMoveEvent);
}

function movingActiveSection(startY, e, offset, startScroll) {
    if(!sectionIsMoving) return;
    distance = -(startY - e.clientY);
    sectionActions.style.top = (e.clientY + window.scrollY - editor.offsetTop - (sectionActions.clientHeight / sectionActions.children.length / 2)) + "px";
    sectionActions.style.transform = "none";

    let sections = document.getElementsByTagName("section");
    let bottom = {
        offsetTop: parent.clientHeight
    }
    sections = Array.from(sections);
    sections.push(bottom);
    let closest;
    let index = 0;
    for (const section of sections) {
        if(section == activeElement) {
            index++;
            continue;
        }
        let mouseY = e.clientY + window.scrollY;
        let sectionY = section.offsetTop + editor.offsetTop;
        distance = mouseY - sectionY;
        if(closest == undefined || closest > Math.abs(distance)) {
            closest = distance;
            closestI = index;
        }
        index++;
    }
    for (let i = 0; i < sections.length; i++) {
        if(sections[i].classList) sections[i].classList.remove('moveTarget')
        if(i == closestI) {
            activeElement.style.top = (sections[i].offsetTop - activeElement.clientHeight / 2) + "px";
            sections[i].classList.add('moveTarget')
        }        
    }
}

function stopmovingActiveSection(moveEvent) {
    if(!sectionIsMoving) return;
    window.removeEventListener("mousemove", moveEvent);
    sectionIsMoving = false;

    sectionActions.style = "";
    activeElement.style = "";

    const sections = document.getElementsByTagName("section");

    let copyActiveElement = activeElement.cloneNode(true);

    parent.insertBefore(copyActiveElement, sections[closestI]);

    activeElement.remove();

    copyActiveElement.addEventListener("mouseover", (e) => {
        hoverSection(e);
    });

    parent.querySelectorAll('.parent section').forEach(section => {
        section.classList.remove('moveTarget')
    })
}

function replaceCharacters(name) {
    return name.toLowerCase().replace(/ä/g, 'a').replace(/å/g, 'a').replace(/ö/g, 'o').replace(/\s/g, '-')
}

function save() {
    let categoryLink;
    let articleObj
    document.getElementById('categorySelect').childNodes.forEach(option => {
        if(option.innerText == document.getElementById('categorySelect').value) categoryLink = option.dataset.link
    })
    if(document.querySelector('.editTitle').innerText === "Uppdatera artikel") {
        articleObj = {
            lastmod: new Date(),
            name: document.getElementById('articleName').value,
            link: encodeURIComponent(replaceCharacters(document.getElementById('articleName').value)),
            description: document.getElementById('articleDescription').value,
            image: document.querySelector('.articleCoverImage').src.replace(window.location.origin, ''),
            photographer: document.querySelector('.coverImagePhotographer').innerText,
            category: document.getElementById('categorySelect').value,
            categoryLink: categoryLink,
            private: document.getElementById("visibility").checked,
            frontPage: document.getElementById("frontPage").checked,
            content: []
        }
    } else {
        articleObj = {
            date: new Date(),
            lastmod: new Date(),
            name: document.getElementById('articleName').value,
            link: encodeURIComponent(replaceCharacters(document.getElementById('articleName').value)),
            description: document.getElementById('articleDescription').value,
            image: document.querySelector('.articleCoverImage').src.replace(window.location.origin, ''),
            photographer: document.querySelector('.coverImagePhotographer').innerText,
            category: document.getElementById('categorySelect').value,
            categoryLink: categoryLink,
            private: document.getElementById("visibility").checked,
            frontPage: document.getElementById("frontPage").checked,
            content: []
        }
    }
    Array.from(parent.children).forEach(ele => {
        if(ele.firstChild.localName === "iframe") {
            articleObj.content.push({
                tag: ele.firstChild.localName,
                content: ele.firstChild.src
            })
        } else if(ele.firstChild.localName === "img") {
            articleObj.content.push({
                tag: ele.firstChild.localName,
                content: ele.firstChild.src.replace(window.location.origin, ''),
                photographer: ele.querySelector('.photographer').innerText
            })
        } else {
            articleObj.content.push({
                tag: ele.firstChild.localName,
                content: ele.firstChild.innerHTML
            })
        }
    })
    document.getElementById('json').value = JSON.stringify(articleObj)
    document.getElementById('submitForm').click();
}

document.getElementById('removeArticle').addEventListener('click', removeArticle)
let removeInterval;
let removeSeconds;

function removeArticle(e) {
    removeSeconds = 5
    e.target.blur();
    e.target.innerText = "Klicka på Enter för att konfirmera (5)";
    window.addEventListener('keydown', actuallyRemoveArticle)
    removeInterval = window.setInterval(updateRemoveButton, 1000)
}

function updateRemoveButton() {
    removeSeconds--;
    document.getElementById('removeArticle').innerText = "Klicka på Enter för att konfirmera (" + removeSeconds + ")";
    if(removeSeconds === 0) {
        window.removeEventListener('keydown', actuallyRemoveArticle)
        window.clearInterval(removeInterval)
        document.getElementById('removeArticle').innerText = "Ta bort artikel"
    }
}

function actuallyRemoveArticle(e) {
    if(e.keyCode == 13) {
        window.location.href = document.getElementById('removeArticle').dataset.removelink
    }
}