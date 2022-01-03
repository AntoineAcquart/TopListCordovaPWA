let items = []
const divItem = `
<div class="col-12 col-md-4">
    <div onclick="toggleItemForm(__id__)">
      <div class="card item">
        <div class="card-body">
            <h5 class="card-title">__top__. __title__</h5>
            <p class="card-text">
                __description__
            </p>
        </div>
        <img src="__src__" class="card-img-right"/>
      </div>
    </div>
</div>
`
let cameraFile = undefined

const htmlToElement = (html) => {
    const template = document.createElement("template")
    html = html.trim() // Never return a text node of whitespace as the result
    template.innerHTML = html
    return template.content.firstChild
}

function displayItems() {
    const divList = document.getElementById("orderable-list")
    divList.replaceChildren("")
    items.forEach((item, i) => {
        const newDivItem = divItem
            .replace("__id__", item.id)
            .replace("__src__", item.imageSrc ? "cdvfile://localhost/persistent/" + item.imageSrc : "img/logo.png") // cordova.files.dataDirectory
            .replace("__title__", item.name)
            .replace("__top__", i + 1)
            .replace("__description__", item.description)
        divList.appendChild(htmlToElement(newDivItem))
    })
}

function saveItem(item, order) {
    const oldIndex = items.findIndex(i => i.id === item.id)
    if (oldIndex > -1) {
        items.splice(oldIndex, 1)
    }
    items.splice(order - 1, 0, item);
    localStorage.setItem("items", JSON.stringify(items))
    displayItems()
}

function deleteItem(itemId) {
    const index = items.findIndex(i => i.id === itemId)
    if (index > -1) {
        items.splice(index, 1)
    }
    localStorage.setItem("items", JSON.stringify(items))
    displayItems()
    toggleItemForm()
}

function openInfo() {
    if (cordova) {
        cordova.InAppBrowser.open('https://cordova.apache.org/docs/en/latest/', '_blank', 'location=yes')
    }
}

function toggleItemForm(itemId = undefined, event = null) {
    if (event === null || event.target.id === "edit-item-screen") {
        const e = document.getElementById("edit-item-screen")
        if (e.classList.contains("hidden")) {
            const item = items.find(i => i.id === itemId)
            cleanForm(item)
            e.classList.remove("hidden")
        } else {
            e.classList.add("hidden")
        }
    }
}

function setupAllItems() {
    let localStorageItems = localStorage.getItem("items")
    if (localStorageItems) items = JSON.parse(localStorageItems)
    displayItems()
    navigator.splashscreen.hide()
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
        showFormPicture(input.files[0])
    }
}

function showFormPicture(blob) {
    var reader = new FileReader()
    reader.onload = function (e) {
        document.getElementById('form-image').src = e.target.result
    }
    reader.readAsDataURL(blob)
}

function takePicture() {
    // let options = {
    //     //quality: 10, // 10/100
    //     destinationType: 0, // base64
    //     //sourceType: 1, // CAMERA
    //     encodingType: 0, // JPEG
    //     //mediaType: 0, // PICTURE
    //     allowEdit: false,
    //     correctOrientation: true,
    //     saveToPhotoAlbum: true
    // }

    let options = {
        //quality: 10, // 10/100
        destinationType: 1, // uri destinationType: 0, // base64
        //sourceType: 1, // CAMERA
        encodingType: 0, // JPEG
        //mediaType: 0, // PICTURE
        allowEdit: false,
        correctOrientation: true,
        saveToPhotoAlbum: true
    }
    navigator.camera.getPicture((uri) => {
        document.getElementById('form-image').src = uri
        //window.resolveLocalFileSystemURL(uri, fileEntry => document.getElementById('form-image').src = fileEntry.toURL(), e => { console.log('error: ', e) })
        //document.getElementById('form-image').src = "cdvfile://localhost/persistent/" + uri.split("/").pop()
        cameraFile = uri
    }
        // navigator.camera.getPicture((base64Data) => {
        //     fetch(`data:image/jpeg;base64,${base64Data}`).then(base64Response => {
        //         base64Response.blob().then(blob => {
        //             cameraFile = new File(blob, Date.now() + ".jpg")
        //             showFormPicture(blob)
        //         })
        //     });
        // }
        , e => {
            console.log("getPicture error: ", e)
        }, options)
}

function validateForm(itemId = new Date().getTime()) {
    const form = document.getElementById('edit-item-form')

    const oldItem = items.find(i => i.id === itemId)
    const item = { id: itemId, name: oldItem ? oldItem.name : "", description: oldItem ? oldItem.description : "", imageSrc: oldItem ? oldItem.imageSrc : "" }

    item.name = form.elements["name"].value
    item.description = form.elements["description"].value
    let order = form.elements["order"].value
    let imageInput = form.elements["image"]

    if ((imageInput.files && imageInput.files[0]) || cameraFile) {
        document.getElementById('form-image').attributes.src = ""
        if (cameraFile) {
            window.resolveLocalFileSystemURL(cameraFile, fileEntry => { getFileSuccessCallback(item, order, fileEntry) }, e => { errorCallback("window.resolveLocalFileSystemURL", e) })
            // window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, fs => {
            //     fs.root.getFile(cameraFile.name, { create: true, exclusive: false }, fileEntry => { getFileSuccessCallback(item, order, fileEntry) }, e => { console.log('error: ', e) })
            // }, e => { console.log('error: ', e) })
        } else {
            window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, fs => {
                fs.root.getFile(imageInput.files[0].name, { create: true, exclusive: false }, fileEntry => { getFileSuccessCallback(item, order, fileEntry) }, e => { errorCallback("fs.root.getFile", e) })
            }, e => { console.log('error: ', e) })
        }
    } else {
        saveItem(item, order)
        toggleItemForm()
    }
}

function getFileSuccessCallback(item, order, fileEntry) {
    console.log("🚀 ~ file: list.js ~ line 164 ~ getFileSuccessCallback ~ fileEntry", fileEntry)

    writeFile(fileEntry, fileSrc => {
        console.log("🚀 ~ file: list.js ~ line 182 ~  writeFile successCallback ~ fileSrc", fileSrc)
        item.imageSrc = fileSrc
        saveItem(item, order)
        toggleItemForm()
    }, e => { errorCallback("writeFile", e) })
}

function errorCallback(functionName, error) {
    console.log(` An error appened in ${functionName}(): `, error)
}

function cleanForm(item = undefined) {
    cameraFile = undefined
    const form = document.getElementById('edit-item-form')
    let order = items.length
    if (item) {
        form.elements["name"].value = item.name
        form.elements["description"].value = item.description
        order = items.findIndex(i => i.id === item.id)
    } else {
        form.elements["name"].value = ""
        form.elements["description"].value = ""
    }
    form.elements["image"].value = ""

    let title = document.getElementById('form-title')
    let submit = document.getElementById('form-submit')
    const deleteButton = document.getElementById('delete-button')
    const formImage = document.getElementById('form-image')
    if (item) {
        title.textContent = "Modifier l'item"
        const src = item.imageSrc ? "cdvfile://localhost/persistent/" + item.imageSrc : "img/logo.png"
        formImage.src = src

        submit.replaceWith(htmlToElement(`<span class="button" id="form-submit" onclick="validateForm(${item.id})">Modifier</span>`))

        if (deleteButton) deleteButton.replaceWith("")
        submit = document.getElementById('form-submit')
        submit.parentNode.insertBefore(htmlToElement(`<span class="button" id="delete-button" onclick="deleteItem(${item.id})">Supprimer</span>`), submit.nextSibling);
    } else {
        title.textContent = "Créer un nouvel item"
        formImage.src = "img/logo.png"
        submit.replaceWith(htmlToElement(`<span class="button" id="form-submit" onclick="validateForm()">Ajouter</span>`))
        if (deleteButton) {
            deleteButton.replaceWith("")
        }
    }
    const orderSlider = document.getElementById('order-slider')
    orderSlider.min = 1
    orderSlider.max = item ? items.length : items.length + 1
    orderSlider.value = order + 1
    setOrder(orderSlider.value)
}

function writeFile(fileEntry, successCallback, errorCallback) {

    fileEntry.createWriter(fileWriter => {

        fileWriter.onwriteend = () => {
            console.log("file successfully writed: ", fileEntry.name)
            successCallback(fileEntry.name)
        }
        fileWriter.onerror = (e) => {
            console.log("error while writing the file: ", e)
            errorCallback()
        }

        fileEntry.file(file => {
            fileWriter.write(file)
        }, e => { console.log('error: ', e) })
    })
}
