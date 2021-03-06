const allAreasSort = ["Norrbotten", "Västerbotten", "Jämtland", "Västernorrland", "Gävleborg", "Dalarna", "Västmanland", "Uppsala", "Värmland", "Örebro", "Stockholm", "Södermanland", "Västra Götaland", "Östergötland", "Jönköping", "Kalmar", "Gotland", "Halland", "Kronoberg", "Blekinge", "Skåne", "Norge"]
const createBlocksByName = data => {
    const charOrder = "abcdefghijklmnopqrstuvwxyzåäö";
    document.querySelector(".info").innerHTML = ""
    data.sort((a, b) => {
        let i = 0;
        while(a.stamnamn[i].toLowerCase() === b.stamnamn[i].toLowerCase()) {
            if(i === Math.min(a.stamnamn.length, b.stamnamn.length)-1) break;
            i++
        }
        if(a.stamnamn[i] === b.stamnamn[i]) return Math.random()-.5
        return charOrder.indexOf(a.stamnamn[i].toLowerCase()) - charOrder.indexOf(b.stamnamn[i].toLowerCase())
    })
    data.forEach(ele => createBlock(ele))
}

const createBlocksByArea = data => {
    const allAreas = []
    const parent = document.querySelector(".info")
    const charOrder = "abcdefghijklmnopqrstuvwxyzåäö"
    parent.innerHTML = ""
    data.forEach(ele => {
        if(!allAreas.includes(ele.area)) allAreas.push(ele.area)
    })
    allAreas.sort((a, b) => allAreasSort.indexOf(a) - allAreasSort.indexOf(b))
    const areaObjects = allAreas.map(area => {
        let elements = [];
        data.forEach(ele => ele.area === area ? elements.push(ele) : "")
        elements.sort((a, b) => {
            let i = 0;
            while(a.stamnamn[i].toLowerCase() === b.stamnamn[i].toLowerCase()) {
                if(i === Math.min(a.stamnamn.length, b.stamnamn.length)-1) break;
                i++
            }
            if(a.stamnamn[i] === b.stamnamn[i]) return Math.random()-.5
            return charOrder.indexOf(a.stamnamn[i].toLowerCase()) - charOrder.indexOf(b.stamnamn[i].toLowerCase())
        })
        return {
            area: area,
            elements: elements
        }
    })
    
    areaObjects.forEach(obj => {
        parent.innerHTML += `<h1>${obj.area}</h1>`
        obj.elements.forEach(ele => createBlock(ele))
    })
}

const createBlock = row => {
    const template = document.querySelector(".rowTemplate")
    const parent = document.querySelector(".info")
    const newRow = template.content.cloneNode(true)
    newRow.querySelector("[data-stamnamn]").innerText = row.prefix + row.stamnamn
    newRow.querySelector("[data-name]").innerText = row.name
    newRow.querySelector("[data-city]").innerText = row.city
    if(row.webpage === "" || row.webpage === undefined) {
        newRow.querySelector("[data-web]").style.display = "none"
    } else {
        newRow.querySelector("[data-web]").href = row.webpage
    }
    if(row.facebookpage === "") {
        newRow.querySelector("[data-facebook]").style.display = "none"
    } else {
        newRow.querySelector("[data-facebook]").href = row.facebookpage
        if(row.webpage !== "") newRow.querySelector(".row").classList.add("multiple")
    }
    if(row.education) {
        row.education.split(', ').forEach(edu => newRow.querySelector("[data-edu]").innerHTML += `<li>${edu}</li>`)
    } else {
        newRow.querySelector("[data-edu-span]").style.display = "none"
    }
    parent.appendChild(newRow)
}

const newSort = e => {
    sortButtons.forEach(button => button.classList.remove("selected"))
    e.target.classList.add("selected")
    if(e.target.innerHTML == "Län") {
        createBlocksByArea(currentData);
    } else {
        createBlocksByName(currentData);
    }
}

const sortButtons = [...document.querySelectorAll(".controls button")]
sortButtons.forEach(button => button.addEventListener('click', newSort))

const search = e => {
    currentData = allData.reduce((accumulator, ele) => {
        if(ele.stamnamn.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1 || ele.name.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1 || ele.area.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1) accumulator.push(ele)
        return accumulator
    }, [])
    if(document.querySelector("button.selected").innerHTML == "Län") {
        createBlocksByArea(currentData);
    } else {
        createBlocksByName(currentData);
    }
}

const searchBar = document.querySelector(".searchInput")
searchBar.addEventListener("input", search)

let currentData;
currentData = allData;
createBlocksByArea(allData)