console.log("external javascript loaded.");

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'short'
});
document.addEventListener('DOMContentLoaded', async function () {
    await buildGroupContainers();
    addButtonEvents();
});

//global variables
let itemSelection = null;
let groupSelection = null;


async function loadGroups(group_id = null) {
    let response = null;
    if (group_id) {
        let groupIdParams = new URLSearchParams();
        groupIdParams.append('id', group_id);
        response = await fetch(`/inventory/group/?${groupIdParams}`);
    }
    else {
        response = await fetch('/inventory/group');
    }
    if (!response.ok) {
        console.log('Group(s) failed to load');
        return;
    }
    let groups = await response.json();
    groups = JSON.parse(groups);
    return groups;
}

async function buildGroupContainers() {
    let groups = await loadGroups();
    let groupsContainer = document.getElementById('groups-container')
    groups.forEach(async (group) => {
        let groupDisplay = buildGroupDisplay(group);
        let groupItems = await loadItems({group_id: group.pk});
        if (groupItems) {
            let itemsGrid = await buildItemsGrid(groupItems, group.pk);
            groupDisplay.querySelector('.group-content').appendChild(itemsGrid);
        }
        groupsContainer.appendChild(groupDisplay);
    });
}

function clearGroupSelect(){
    let groupDataArray = document.getElementsByClassName('group-data-content');
    for (let i=0;i < groupDataArray.length; i++){
        groupDataArray[i].classList.remove('selected');
    };
    groupSelection = null;
};

function buildGroupDisplay(group){
    
    let groupContainer = document.createElement('div');groupContainer.setAttribute('class','group-container');
    let groupData = document.createElement('div');groupData.setAttribute('data-id',group.pk);groupData.setAttribute('data-name',group.fields.name); groupData.setAttribute('class','group-data-content');
    let groupName = document.createElement('h4'); groupName.setAttribute('class', 'group-data-field');
    groupName.innerHTML = group.fields.name;
    let groupCategory = document.createElement('h4'); groupCategory.setAttribute('class', 'group-data-field');
    if (group.fields.category) groupCategory.innerHTML = `[${group.fields.category}]`;
    let groupDescription = document.createElement('p'); groupDescription.setAttribute('class', 'group-data-description');
    groupDescription.innerHTML = group.fields.description;
    let groupExpandContainer = document.createElement('div'); groupExpandContainer.setAttribute('class','group-expand-container'); 
    let groupExpandButton = document.createElement('button'); groupExpandButton.setAttribute('class','group-expand-button'); 
    
    
    let expandImg = document.createElement('img');
    expandImg.setAttribute('src', collapseGroup);
    groupExpandButton.prepend(expandImg);
    groupContainer.appendChild(groupData);

    groupData.appendChild(groupName);
    groupData.appendChild(groupCategory);
    groupData.appendChild(groupExpandContainer);
    groupData.setAttribute('tabIndex',0);
    groupData.addEventListener('click',()=>{
        //unselect previously selected groups
        clearGroupSelect();
        //select this group
        groupSelection = groupData;
        groupData.classList.add('selected');
    });
    groupExpandContainer.appendChild(groupExpandButton);
    
    let groupContent = document.createElement('div'); groupContent.setAttribute('class','group-content');
    groupContent.appendChild(groupDescription);
    groupExpandButton.addEventListener('click', ()=> {
        groupContent.classList.toggle('minimized');
        if (groupContent.classList.contains('minimized')) {
            expandImg.setAttribute('src', expandGroup);
        }   
        else{
            expandImg.setAttribute('src', collapseGroup);
        }
    });
    groupContainer.appendChild(groupContent);


    let groupHeader = document.createElement('div'); groupHeader.setAttribute('class','group-display-header');
    groupContent.appendChild(groupHeader); 

    let itemActionContainer = document.createElement('div');itemActionContainer.setAttribute('class','item-action-container');
    groupHeader.appendChild(itemActionContainer);
    
    let addItemButton = document.createElement('button'); addItemButton.setAttribute('class','item-action');addItemButton.setAttribute('data-id',group.pk);

    let addItemImg = document.createElement('img');addItemImg.setAttribute('src', addItem);addItemImg.setAttribute('class','button-icon');
    addItemButton.prepend(addItemImg);
    
    let removeItemButton = document.createElement('button'); removeItemButton.setAttribute('class','item-action');removeItemButton.setAttribute('data-id',group.pk);
    let removeItemImg = document.createElement('img');removeItemImg.setAttribute('src', removeItem);removeItemImg.setAttribute('class','button-icon');
    removeItemButton.prepend(removeItemImg);

    let editItemButton = document.createElement('button'); editItemButton.setAttribute('class','item-action');editItemButton.setAttribute('data-id',group.pk);
    let editItemImg = document.createElement('img');editItemImg.setAttribute('src', pencil);editItemImg.setAttribute('class','button-icon');
    editItemButton.prepend(editItemImg);
    
    addItemButton?.addEventListener('click', () => {
        let itemModalContainer = document.getElementById('item-modal-container');
        clearItemModal();
        itemModalContainer?.setAttribute('data-group-id', group.pk)
        itemModalContainer?.classList.add('show');
    });
    removeItemButton?.addEventListener('click', () => {
        if(!itemSelection) {
            alert("Select an item to remove");
            return;
        }
        let itemName = itemSelection.getAttribute('data-name')
        let deleteMessage = `Are you sure you want to delete the selected item ${itemName}?`
        if (confirm(deleteMessage)) {
            deleteItem(itemSelection.getAttribute('data-id'));
        }
    });
    editItemButton?.addEventListener('click',async () => {
        clearItemModal();
        if(!itemSelection) {
            alert("Select an item to edit");
            return;
        }
        let itemModalContainer = document.getElementById('item-modal-container');
        let items = await loadItems({id:`${itemSelection.getAttribute('data-id')}`});
        console.log(items);
        console.log(itemSelection);
        populateItemModal(items[0]);
        itemModalContainer?.setAttribute('data-group-id', group.pk)
        itemModalContainer?.classList.add('show');
    });

    itemActionContainer.appendChild(addItemButton);
    itemActionContainer.appendChild(removeItemButton);
    itemActionContainer.appendChild(editItemButton);
    
    return groupContainer;
}

async function loadItems({id = null, group_id = null}) {
    let response = null;
    if (id) {
        let idParams = new URLSearchParams();
        idParams.append('id', id);
        response = await fetch(`/inventory/item/?${idParams}`);
    }
    else if (group_id) {
        let groupIdParams = new URLSearchParams();
        groupIdParams.append('group_id', group_id);
        response = await fetch(`/inventory/item/?${groupIdParams}`);
    }
    else {
        response = await fetch('/inventory/item');
    }
    if (response.ok) {
        let items = await response.json();
        items = JSON.parse(items);
        return items;
    } 
    else {
        console.log('failed to load items');
    }
}

async function buildItemsGrid(items, group_id) {
    let itemsGrid = document.createElement("div");
    itemsGrid.setAttribute("class", "items-grid");
    items.forEach(async (element) => {
        let itemDisplay = await buildItemDisplay(element, group_id);
        itemsGrid.appendChild(itemDisplay);
    });
    return itemsGrid;
}

function addButtonEvents() {
    const groupAddButton = document.getElementById('group-add');
    const groupRemoveButton = document.getElementById('group-remove');
    const groupEditButton = document.getElementById('group-edit');
    const groupModalContainer = document.getElementById('group-modal-container');
    const groupModalSaveButton = document.getElementById('group-modal-save');
    const groupModalCancelButton = document.getElementById('group-modal-cancel');
    groupAddButton?.addEventListener('click', () => {
        groupModalContainer?.classList.add('show');
    });
    groupRemoveButton?.addEventListener('click', () => {
        if(!groupSelection) {
            alert("Select a group to remove");
            return;
        }
        let groupName = groupSelection.getAttribute('data-name')
        let deleteMessage = `Are you sure you want to delete the selected group ${groupName} and all contained items?`
        if (confirm(deleteMessage)) {
            deleteGroup(groupSelection.getAttribute('data-id'));
        }
    });
    groupEditButton?.addEventListener('click',async () => {
        if(!groupSelection) {
            alert("Select a group to edit");
            return;
        }
        let groups = await loadGroups(`${groupSelection.getAttribute('data-id')}`);
        populateGroupModal(groups[0]);
        groupModalContainer?.classList.add('show');
    });

    groupModalCancelButton?.addEventListener('click', () => {
        clearGroupModal();
        groupModalContainer?.classList.remove('show');
    });
    groupModalSaveButton?.addEventListener('click', () => {
        saveGroupModal();
        clearGroupModal();
        groupModalContainer?.classList.remove('show');
    });
    const itemModalContainer = document.getElementById('item-modal-container');
    const itemModalSaveButton = document.getElementById('item-modal-save');
    const itemModalCancelButton = document.getElementById('item-modal-cancel');
     itemModalCancelButton?.addEventListener('click', () => {
        clearItemModal();
        itemModalContainer?.classList.remove('show');
    });
    itemModalSaveButton?.addEventListener('click', () => {
        saveItemModal();
        clearItemModal();
        itemModalContainer?.classList.remove('show');
    });

    const imageUploadContainer = document.getElementById('image-modal-upload-container');
    const imageUploadButton = document.getElementById('image-upload-submit');
    const imageCancelButton = document.getElementById('image-upload-cancel');
     imageCancelButton?.addEventListener('click', () => {
        clearImageUpload();
        imageUploadContainer?.classList.remove('show');
    });
    imageUploadButton?.addEventListener('click', () => {
        uploadImage();
        clearImageUpload();
        imageUploadContainer?.classList.remove('show');
    });


    let iframeButtonClose = document.getElementById('iframe-button-close');
    iframeButtonClose?.addEventListener('click', ()=>{
        let iframeContainer = document.getElementById('iframe-container');
        iframeContainer.classList.remove('show');
    });
    
}

function clearGroupModal(){
    let modalContainer = document.getElementById('group-modal-container');
    modalContainer.removeAttribute('data-id');
    // modalContainer.reset();
    document.getElementById('group-input-name').value = "";
    document.getElementById('group-input-category').value = "";
    document.getElementById('group-input-description').value = "";
}

function clearItemModal(){
    let modalContainer = document.getElementById('item-modal-container');
    modalContainer.removeAttribute('data-id');
    modalContainer.removeAttribute('data-group-id');
    // modalContainer.reset();
    document.getElementById('item-input-name').value = "";
    document.getElementById('item-input-price').value = null;
    document.getElementById('item-input-total-quantity').value = null;
    document.getElementById('item-input-available-quantity').value = null;
    document.getElementById('item-input-acquired-date').value = null;
    document.getElementById('item-input-expire-date').value = null;
    document.getElementById('item-input-lifespan').value = null;
    document.getElementById('item-input-description').value = "";
}

function clearImageUpload(){
    let modalContainer = document.getElementById('item-modal-container');
    modalContainer.removeAttribute('data-item-id');
    document.getElementById('image-name-input').value = "";
    document.getElementById('image-file-input').value = null;
}

function populateGroupModal(group){
    document.getElementById('group-modal-container').setAttribute('data-id', group.pk);
    document.getElementById('group-input-name').value = group.fields.name;
    document.getElementById('group-input-category').value = group.fields.category;
    document.getElementById('group-input-description').value = group.fields.description;
}

function populateItemModal(item){
    console.log(item);
    document.getElementById('item-modal-container').setAttribute('data-id', item.pk);
    document.getElementById('item-input-name').value = item.fields.name;
    document.getElementById('item-input-price').value = item.fields.price;
    document.getElementById('item-input-total-quantity').value = item.fields.total_quantity;
    document.getElementById('item-input-available-quantity').value = item.fields.available_quantity;
    document.getElementById('item-input-acquired-date').value = item.fields.acquired_dt;
    document.getElementById('item-input-expire-date').value = item.fields.expire_dt;
    document.getElementById('item-input-lifespan').value = item.fields.lifespan;
    document.getElementById('item-input-description').value = item.fields.description;
}

async function saveGroupModal() {
    // gather data
    const groupModal = document.getElementById('group-modal-container');
    let groupName = document.getElementById('group-input-name').value;
    let groupCategory = document.getElementById('group-input-category')?.value;
    let groupDescription = document.getElementById('group-input-description')?.value;
    if (groupModal.hasAttribute('data-id')){
        let group = {
            id: groupModal.getAttribute('data-id'),
            name: groupName,
            description: groupDescription,
            category:  groupCategory
        }
        let response = await fetch('/inventory/group/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(group)
        });
    }
    else {
        // POST
        let group = {
            name: groupName,
            description: groupDescription,
            category:  groupCategory
        }
        let response = await fetch('/inventory/group/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(group)
        });
    }
    
}

async function saveItemModal() {
    // gather data
    let itemModal = document.getElementById('item-modal-container');
    let id = itemModal.getAttribute('data-id')
    let group_id = itemModal.getAttribute('data-group-id');
    let name = document.getElementById('item-input-name').value;
    let price = document.getElementById('item-input-price')?.value;
    let total = document.getElementById('item-input-total-quantity')?.value;
    let available = document.getElementById('item-input-available-quantity')?.value;
    let used = document.getElementById('item-input-used-quantity')?.value;
    let acquired = document.getElementById('item-input-acquired-date')?.value;
    let expire = document.getElementById('item-input-expire-date')?.value;
    let lifespan = document.getElementById('item-input-lifespan')?.value;
    let description = document.getElementById('item-input-description')?.value;

    if (itemModal.hasAttribute('data-id')){
        let item = {
            id: id,
            group_id: group_id,
            name: name,
            price: price,
            total: total,
            available: available,
            used: used,
            acquired: acquired,
            expire:  expire,
            lifespan:  lifespan,
            description:  description
        }
        let response = await fetch('/inventory/item/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(item)
        });
    }
    else {
        // POST
        let item = {
            group_id: group_id,
            name: name,
            price: price,
            total: total,
            available: available,
            used: used,
            acquired: acquired,
            expire:  expire,
            lifespan:  lifespan,
            description:  description
        }
        let response = await fetch('/inventory/item/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(item)
        });
    }
}

async function uploadImage(){
    let name = document.getElementById('image-name-input').value;
    let file = document.getElementById('image-file-input').files[0];
    let formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    let response = await fetch(`/inventory/upload-image/`,{
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: formData,
    });
}

async function deleteGroup(id) {
    let response = await fetch(`/inventory/group/delete/${id}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        }
    }
    );
}

async function deleteItem(id) {
    let response = await fetch(`/inventory/item/delete/${id}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        }
    }
    );
}
async function buildItemDisplay(item, group_id) {
    //top level box container
    let display = document.createElement("div");
    display.setAttribute("class", "item-display");
    display.setAttribute("data-id", item.pk);
    display.setAttribute("data-group-id", group_id);
    display.setAttribute("data-name", item.fields.name);
    display.setAttribute('tabindex', 0);
    //html elements containing data
    //add name as separate div
    let name = document.createElement("h3");name.setAttribute("class", "item-name");name.innerHTML = item.fields.name;
    display.appendChild(name);
    let uploadImageButton = document.createElement("button"); 
    uploadImageButton.setAttribute("class", ".item-display-action"); 
    uploadImageButton.setAttribute("id", "item-image-upload");
    uploadImageButton.setAttribute("data-item-id", item.pk);
    uploadImageButton.setAttribute("src",upload);
    display.appendChild(uploadImageButton);
    uploadImageButton.addEventListener('click',()=>{
        // let iframe = document.getElementById('iframe-forms');
        // iframe.src = `/inventory/item/${item.pk}/image-upload/`;
        // let iframeContainer = document.getElementById('iframe-container');
        // iframeContainer.classList.toggle('show');
        let uploadModal = document.getElementById('image-modal-upload-container');
        uploadModal.setAttribute('data-item-id', item.pk);
        uploadModal.classList.toggle('show');
    });
    let image = document.createElement("img");image.setAttribute("class", "item-img");
    //load images, if no image, show defaultImage
    let imageParams = new URLSearchParams();
    imageParams.append('item_id', item.pk);
    let response = await fetch(`/inventory/image/?${imageParams}`);

    let images = await response.json();
    if(images.length > 0) {
        image.setAttribute("src", images[0].uri);
        image.setAttribute('data-name', images[0].name);
    } else {
        image.setAttribute("src", defaultImage);
    }

    display.appendChild(image);
    let description = document.createElement("p");description.setAttribute("class", "item-description");description.innerHTML = item.fields.description;
    let topTable = document.createElement("table");topTable.setAttribute("class", "item-top-table");
    let numberTable = document.createElement("table");numberTable.setAttribute("class", "key-value-table");
    insertFieldAsRow("price:", item.fields.price, numberTable);
    insertFieldAsRow("total:", item.fields.total_quantity, numberTable);
    insertFieldAsRow("available:", item.fields.available_quantity, numberTable);
    insertFieldAsRow("used:", item.fields.used_quantity, numberTable);
    let row = topTable.insertRow();
    row.insertCell().appendChild(numberTable);
    row.insertCell().appendChild(description);
    display.appendChild(topTable);
    display.addEventListener('focus',()=>{
        itemSelection = display;
    });

    return display;
}
;
function insertFieldAsRow(key, value, table) {
    const row = table.insertRow();
    row.insertCell().innerHTML = key;
    row.insertCell().innerHTML = value;
}
;
function getItemDateTable(item) {
    let dateTable = document.createElement("table");
    dateTable.setAttribute("class", "key-value-table");
    const updated = new Date(item.fields.updated_dt);insertFieldAsRow("updated", shortDateFormatter.format(updated), dateTable);
    const acquired = new Date(item.fields.acquired_dt);insertFieldAsRow("acquired", shortDateFormatter.format(acquired), dateTable);
    const expire = new Date(item.fields.expire_dt);insertFieldAsRow("expires", shortDateFormatter.format(expire), dateTable);
    insertFieldAsRow("lifespan", item.fields.lifespan, dateTable);
    return dateTable;
}
;
export {};
//export
//load data and display
//button actions
//events
