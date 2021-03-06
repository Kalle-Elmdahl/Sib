function editSection() {
    let activeElementName = activeElement.firstChild.localName;
    switch (activeElementName) {
        case 'p':
            showWindow(editP.window);
            startEditParagraph();
            break;
        case 'img':
            showWindow(editImg.window);
            startEditImg();
            break;
        case 'iframe':
            showWindow(editVid.window);
            startEditVideo();
            break;
        case 'h1':
            showWindow(editH.window);
            startEditHeading();
            break;
        case 'h2':
            showWindow(editH.window);
            startEditHeading();
            break;
        case 'h3':
            showWindow(editH.window);
            startEditHeading();
            break;
        case 'h4':
            showWindow(editH.window);
            startEditHeading();
            break;
        case 'h5':
            showWindow(editH.window);
            startEditHeading();
            break;
        case 'h6':
            showWindow(editH.window);
            startEditHeading();
            break;
        case 'table':
            showWindow(editT.window);
            startEditTable();
            break;
    }
}

let editP = {
    className: document.getElementById("paragraphClassName"),
    editor: document.getElementById("paragraphEditor"),
    save: document.getElementById("saveParagraph"),
    activeP: undefined,
    window: windows[1],
    bold: document.getElementById("paragraphBold"),
    underline: document.getElementById("paragraphUnderline"),
    italic: document.getElementById("paragraphItalic"),
    list: document.getElementById("paragraphList"),
    link: document.getElementById("paragraphLink")
}

editP.save.addEventListener("click", saveEditParagraph);
editP.editor.addEventListener("input", formatP);
editP.bold.addEventListener("click", function() {
    styleEditParagraph('bold');
});
editP.underline.addEventListener("click", function() {
    styleEditParagraph('underline');
});
editP.italic.addEventListener("click", function() {
    styleEditParagraph('italic');
});
editP.list.addEventListener("click", function() {
    styleEditParagraph('insertUnorderedList')
});
editP.link.addEventListener("click", function() {
    const link = prompt("Link: ", "")
    var sText = document.getSelection();
    document.execCommand('insertHTML', false, '<a href="' + link + '" target="_blank">' + sText + '</a>');
});

editP.editor.addEventListener('paste', pastingInP);

function startEditParagraph() {
    editP.activeP = activeElement.firstChild;
    editP.editor.innerHTML = editP.activeP.innerHTML;
    editP.className.value = activeElement.className;
    formatP();
}

function saveEditParagraph() {
    editP.activeP.innerHTML = editP.editor.innerHTML;
    activeElement.className = editP.className.value;

    closeWindows();
    sectionActions.style.display = "none";
}

function formatP() {
    editP.window.style = "";
    if(editP.window.clientHeight > window.innerHeight) {
        editP.window.style.height = "100vh";
        editP.window.style.overflowY = "auto";
        editP.window.style.borderRadius = "0";
    }
}

function styleEditParagraph(action) {
    document.execCommand(action);
}

function pastingInP(event) {
    let paste = (event.clipboardData || window.clipboardData);
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

    event.preventDefault();
    formatP();
}

//IMAGE WINDOW

let editImg = {
    window: windows[2],
    previewImage: document.getElementById("previewImage"),
    save: document.getElementById("saveImages"),
    selectButton: document.querySelector('.selectArticleImage'),
    className: document.getElementById("imageClassName")
}
editImg.save.addEventListener("click", saveEditImg);

const selectImage = new SelectImage(({original, photographer}) => {
    editImg.previewImage.src = original;
    activeElement.children[1].innerText = photographer === "" ? "" : photographer
})

editImg.selectButton.addEventListener('click', () => selectImage.open())

function startEditImg() {
    editImg.className.value = activeElement.className;
}

function saveEditImg() {
    activeElement.className = editImg.className.value;
    activeElement.children[0].src = previewImage.src.replace(window.location.origin, '')
    closeWindows();
}


// EDIT HEADER

let editH = {
    window: windows[3],
    types: document.getElementById("headingTypes"),
    childArray: Array.from(document.getElementById("headingTypes").children),
    editParent: document.getElementById("hEditParent"),
    editor: document.getElementById("headingEditor"),
    className: document.getElementById("headingClassName"),
    save: document.getElementById("saveHeading"),
    activeType: 'h1'
}

editH.save.addEventListener("click", saveEditHeading);

editH.childArray.forEach(button => {
    button.addEventListener("click", () => {
        changeHeaderType(button);
    })
});

function changeHeaderType(cButton) {
    let buttons = editH.childArray;
    for (const button of buttons) {
        if(button === cButton) {
            button.className = "active";
        } else {
            button.className = "";
        }
    }
    let value = editH.editor.innerText;
    editH.editParent.innerHTML = "";
    let newHeading = document.createElement(cButton.getAttribute("data-tag"));
    newHeading.innerText = value;
    newHeading.contentEditable = true;
    newHeading.className = "headingEditor";
    newHeading.id = "headingEditor";
    editH.editParent.appendChild(newHeading);
    editH.editor = document.getElementById("headingEditor");

    editH.activeType = cButton.getAttribute("data-tag");
}

function startEditHeading() {
    let setHName = activeElement.firstChild.localName;
    for(let i = 0; i < editH.childArray.length; i++) {
        if(editH.childArray[i].getAttribute("data-tag") == setHName) {
            changeHeaderType(editH.childArray[i]);
        }
    }
    editH.editor = document.getElementById("headingEditor");
    editH.editor.innerText = activeElement.firstChild.innerText;
    editH.className.value = activeElement.className;
}

function saveEditHeading() {
    activeElement.innerHTML = "";
    let newHeading = document.createElement(editH.activeType);
    newHeading.innerText = editH.editor.innerText;
    activeElement.appendChild(newHeading);
    activeElement.className = editH.className.value;

    closeWindows();
}

// EDIT VIDEO

let editVid = {
    window: windows[4],
    save: document.getElementById("saveVideo"),
    urlId: document.getElementById("videoURL"),
    className: document.getElementById("videoClassName"),
    baseLink: "https://www.youtube.com/embed/",
    plate: "https://www.youtube.com/watch?v="
}

editVid.save.addEventListener("click", saveEditVideo);

function startEditVideo() {
    editVid.className.value = activeElement.className;
    let url = activeElement.firstChild.src;
    
    
    editVid.urlId.value = "";
    if(url == editVid.baseLink) return;
    editVid.urlId.value = editVid.plate + url.replace(editVid.baseLink,'');
}

function saveEditVideo() {
    let iframe = activeElement.firstChild;
    iframe.src = editVid.baseLink + editVid.urlId.value.replace(editVid.plate,'');
    activeElement.className = editVid.className.value;

    closeWindows();
}

// EDIT TABLE

let editT = {
    window: windows[5],
    cols: 0,
    rows: 1,
    colsInput: document.getElementById('tableColumns'),
    table: document.querySelector('.tableMirror'),
    addButton: document.querySelector('.addRow'),
    className: document.getElementById("tableClassName"),
    save: document.getElementById("saveTable"),
    controlsParent: document.querySelector('.tableControl'),
    activeType: 'h1'
}

editT.save.addEventListener("click", saveTable);

editT.colsInput.addEventListener('input', editColAmount)
editT.addButton.addEventListener('click', addRow)

function editColAmount() {
    if(editT.colsInput.value === "") return;
    const currentCols = editT.table.firstChild.childNodes.length;
    if(Number(editT.colsInput.value) > currentCols) {
        addCols(Number(editT.colsInput.value) - currentCols)
    } else if(Number(editT.colsInput.value) < currentCols) {
        removeCols(currentCols - Number(editT.colsInput.value))
    }
    editT.cols = Number(editT.colsInput.value)
}

function addCols(amount) {
    Array.from(editT.table.childNodes).forEach(row => {
        for(let i = 0; i < amount; i++) {
            const tableCol = document.createElement('td')
            tableCol.contentEditable = true;
            tableCol.addEventListener('input', tableColInput)
            row.appendChild(tableCol)
        }
    })
}

function removeCols(amount) {
    Array.from(editT.table.childNodes).forEach(row => {
        for(let i = 0; i < amount; i++) {
            const tableCol = row.childNodes[row.childNodes.length-1]
            tableCol.remove();
        }
    })
}

function addRow() {
    const newRow = document.createElement('tr')
    for(let i = 0; i < editT.cols; i++) {
        const newCol = document.createElement('td');
        newCol.addEventListener('input', tableColInput)
        newCol.contentEditable = true;
        newRow.appendChild(newCol);
    }
    editT.table.appendChild(newRow)
    createControl(editT.rows);
    editT.rows++;
    formatTableWindow()
}

function startEditTable() {
    const table = activeElement.querySelector('tbody') || activeElement.firstChild;
    editT.table.innerHTML = ""
    editT.controlsParent.innerHTML = ""
    editT.colsInput.value = table.firstChild.childNodes.length;
    Array.from(table.childNodes).forEach((tableRow, index) => {
        const mirrorTableRow = document.createElement('tr');
        [...tableRow.childNodes].forEach(td => {
            const mirrorTd = document.createElement('td')
            mirrorTd.innerText = td.innerText;
            mirrorTd.contentEditable = true;
            mirrorTableRow.appendChild(mirrorTd)
        });
        editT.table.appendChild(mirrorTableRow)
        createControl(index);
    })
}

let currentTd;

function tableColInput() {
    [...editT.table.childNodes].forEach((tr, index) => {
        let height = tr.childNodes[0].clientHeight;
        editT.controlsParent.childNodes[index].style.height = height - 4 + "px"
    });
}

function createControl(i) {
    const newButton = document.createElement('button')
    newButton.innerText = "-"
    newButton.addEventListener('click', removeRow)
    editT.controlsParent.appendChild(newButton)
}

function removeRow(e) {
    let index;
    [...editT.controlsParent.childNodes].forEach((button, i) => {
        if(button === e.target) index = i
    });
    editT.table.childNodes[index].remove();
    e.target.remove();
}

function formatTableWindow() {
    editT.window.style = "";
    if(editT.window.clientHeight > window.innerHeight) {
        editT.window.style.height = "100vh";
        editT.window.style.overflowY = "auto";
        editT.window.style.borderRadius = "0";
    }
}

function saveTable() {
    const table = activeElement.firstChild
    table.innerHTML = "";
    [...editT.table.childNodes].forEach(mirrorTableRow => {
        const tableRow = document.createElement('tr');
        [...mirrorTableRow.childNodes].forEach(mirrorTd => {
            const td = document.createElement('td')
            td.innerText = mirrorTd.innerText;
            tableRow.appendChild(td)
        });
        table.appendChild(tableRow);
    })
    closeWindows();
}