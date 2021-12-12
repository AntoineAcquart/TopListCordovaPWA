let items = []
const divItem = `
<div class="col-12 col-md-4">
    <div onclick="openInAppBrowser('__link__')">
      <div class="card item">
        <div class="card-body">
            <h5 class="card-title">__top__. __title__</h5>
            <p class="card-text">
                __description__
            </p>
        </div>
        <img src="cdvfile://localhost/persistent/__src__" class="card-img-right"/>
      </div>
    </div>
</div>
`

const htmlToElement = (html) => {
    const template = document.createElement("template")
    html = html.trim() // Never return a text node of whitespace as the result
    template.innerHTML = html
    return template.content.firstChild
}

function displayItems() {
    console.log("items: ", items)
    items.forEach((item, i) => {
        displayItem(item, i + 1)
    })
}

function displayItem(item, top) {
    const divList = document.getElementById("list")
    const newDivItem = divItem
        .replace("__src__", item.imageSrc)
        .replace("__title__", item.name)
        .replace("__top__", top)
        .replace("__description__", item.description)
    divList.appendChild(htmlToElement(newDivItem))
}

function createItem(item) {
    items.push(item)
    localStorage.setItem("items", JSON.stringify(items))
    displayItem(item, items.length + 1)
    setupDragAndDropList()
}

function toggleCreateForm(event = null) {
    if (event === null || event.target.id === "create-item-screen") {
        const e = document.getElementById("create-item-screen")
        if (e.classList.contains("hidden")) {
            const orderSlider = document.getElementById('order-slider')
            orderSlider.min = 1
            orderSlider.max = items.length + 1
            setOrder(items.length + 1)

            e.classList.remove("hidden")
        } else {
            e.classList.add("hidden")
        }
    }
}

function setupAllItems() {
    console.log("setupAllItems")
    let localStorageItems = localStorage.getItem("items")
    if (localStorageItems) items = JSON.parse(localStorageItems)
    displayItems()
    setupDragAndDropList()
}

function onOrderSelected(input) {
    setOrder(input.value)
}

function setOrder(order) {
    const orderValue = document.getElementById('order-value')
    let hint = "ème"
    if (order <= 1) {
        hint = "er"
    }
    orderValue.textContent = order
    orderValue.appendChild(htmlToElement(`<sup>${hint}</sup>`))
}

function onImageSelected(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            const formImage = document.getElementById('form-image')
            if (formImage) {
                formImage.src = e.target.result
            } else {
                const img = `<img id="form-image" src="${e.target.result}" />`
                document.getElementById('selected-image').appendChild(htmlToElement(img))
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function validateForm() {
    const form = document.getElementById('create-item-form')

    const item = { name: "", description: "", imageSrc: "" }

    item.name = form.elements["name"].value
    item.description = form.elements["description"].value
    let imageInput = form.elements["image"]

    if (imageInput.files && imageInput.files[0]) {
        document.getElementById('form-image').attributes.src = ""
        window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, fs => {
            fs.root.getFile(imageInput.files[0].name, { create: true, exclusive: false }, fileEntry => {
                writeFile(fileEntry, imageInput.files[0], fileSrc => {
                    item.imageSrc = fileSrc
                    createItem(item)
                }, e => { console.log('error: ', e) })
            }, e => { console.log('error: ', e) })
        }, e => { console.log('error: ', e) })
    }
}

function writeFile(fileEntry, dataObj, successCallback, errorCallback) {

    fileEntry.createWriter(fileWriter => {

        FileWriter
        fileWriter.onwriteend = () => {
            console.log("file successfully writed: ", fileEntry.name)
            successCallback(fileEntry.name)
        }
        fileWriter.onerror = (e) => {
            console.log("error while writing the file: ", e)
            errorCallback()
        }

        fileWriter.write(dataObj)
    })
}

function setupDragAndDropList() {
    // (A) GET LIST + ATTACH CSS CLASS
    target = document.getElementById("orderable-list");
    console.log("target: ", target)

    // (B) MAKE ITEMS DRAGGABLE + SORTABLE
    var items = target.getElementsByClassName("orderable-item"), current = null;
    console.log("items: ", items)
    for (let i of items) {
        // (B1) ATTACH DRAGGABLE
        i.draggable = true;

        // (B2) DRAG START - YELLOW HIGHLIGHT DROPZONES
        i.addEventListener("dragstart", function (ev) {
            console.log("item dragged: ", i)
            current = this;
            for (let it of items) {
                if (it != current) { it.classList.add("hint"); }
            }
        });

        // (B3) DRAG ENTER - RED HIGHLIGHT DROPZONE
        i.addEventListener("dragenter", function (ev) {
            if (this != current) { this.classList.add("active"); }
        });

        // (B4) DRAG LEAVE - REMOVE RED HIGHLIGHT
        i.addEventListener("dragleave", function () {
            this.classList.remove("active");
        });

        // (B5) DRAG END - REMOVE ALL HIGHLIGHTS
        i.addEventListener("dragend", function () {
            for (let it of items) {
                it.classList.remove("hint");
                it.classList.remove("active");
            }
        });

        // (B6) DRAG OVER - PREVENT THE DEFAULT "DROP", SO WE CAN DO OUR OWN
        i.addEventListener("dragover", function (evt) {
            evt.preventDefault();
        });

        // (B7) ON DROP - DO SOMETHING
        i.addEventListener("drop", function (evt) {
            evt.preventDefault();
            if (this != current) {
                let currentpos = 0, droppedpos = 0;
                for (let it = 0; it < items.length; it++) {
                    if (current == items[it]) { currentpos = it; }
                    if (this == items[it]) { droppedpos = it; }
                }
                if (currentpos < droppedpos) {
                    this.parentNode.insertBefore(current, this.nextSibling);
                } else {
                    this.parentNode.insertBefore(current, this);
                }
            }
        });
    }
}