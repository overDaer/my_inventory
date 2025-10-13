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
var itemSelection = null;
var groupSelection = null;
var slideshowIndex = -1;
var slideshowImages = [];

var responseTypes = new Map();
responseTypes.set('warning',"rgb(255, 251, 39)");
responseTypes.set('error',"rgb(255, 0, 0)");
responseTypes.set('ok',"rgb(21, 255, 0)");

//UI Building

async function buildGroupContainers() {
    let groups = await loadGroups();
    let groupsContainer = document.getElementById('groups-container')
    groups.forEach(async (group) => {
        let groupDisplay = await buildGroupDisplayWithItems(group);
        groupsContainer.appendChild(groupDisplay);
    });
}

function buildGroupDisplay(group){
    let groupContainer = document.createElement('div');groupContainer.setAttribute('class','group-container'); groupContainer.setAttribute('data-id',group.pk);
    let groupData = document.createElement('div');groupData.setAttribute('data-id',group.pk);groupData.setAttribute('data-name',group.fields.name); groupData.setAttribute('class','group-data-content');
    let groupName = document.createElement('h4'); groupName.setAttribute('class', 'group-data-field'); groupName.setAttribute('id', 'group-data-name');
    groupName.innerHTML = group.fields.name;
    let groupCategory = document.createElement('h4'); groupCategory.setAttribute('class', 'group-data-field'); groupCategory.setAttribute('id', 'group-data-category');
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
        groupContent.classList.toggle('collapsed');
        if (groupContent.classList.contains('collapsed')) {
            groupExpandButton.toggleAttribute('data-collapsed');
            expandImg.setAttribute('src', expandGroup);
        }   
        else{
            groupExpandButton.toggleAttribute('data-collapsed');
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

    let uploadImageButton = document.createElement('button'); uploadImageButton.setAttribute('class','item-action');uploadImageButton.setAttribute('data-id',group.pk);
    let uploadItemImg = document.createElement('img');uploadItemImg.setAttribute('src', uploadIcon);uploadItemImg.setAttribute('class','button-icon');
    uploadImageButton.prepend(uploadItemImg);

    let viewItemButton = document.createElement('button'); viewItemButton.setAttribute('class','item-action');viewItemButton.setAttribute('data-id',group.pk);
    let viewItemImg = document.createElement('img');viewItemImg.setAttribute('src', eye);viewItemImg.setAttribute('class','button-icon');
    viewItemButton.prepend(viewItemImg);

    addItemButton?.addEventListener('click', () => {
        let itemModalContainer = document.getElementById('item-modal-container');
        clearItemModal();
        itemModalContainer?.setAttribute('data-group-id', group.pk)
        itemModalContainer?.classList.add('show');
    });
    removeItemButton?.addEventListener('click',async () => {
        if(!itemSelection) {
            alert("Select an item to remove");
            return;
        }
        if(!(itemSelection.getAttribute('data-group-id')===removeItemButton.getAttribute('data-id'))){
            alert("Selected item must be in same group as button");
            return;
        }
        let itemName = itemSelection.getAttribute('data-name')
        let deleteMessage = `Are you sure you want to delete the selected item ${itemName}?`
        if (confirm(deleteMessage)) {
            let response = await deleteItem(itemSelection.getAttribute('data-id'));
            notifyResponse(response);
            itemSelection.remove();
            itemSelection = null;
        }
    });
    editItemButton?.addEventListener('click',async () => {
        clearItemModal();
        if(!itemSelection) {
            alert("Select an item to edit");
            return;
        }
        if(!(itemSelection.getAttribute('data-group-id')===editItemButton.getAttribute('data-id'))){
            alert("Selected item must be in same group as button");
            return;
        }
        let itemModalContainer = document.getElementById('item-modal-container');
        let item_id = itemSelection.getAttribute('data-id')
        let item = await loadItem(item_id);
        populateItemModal(item);
        itemModalContainer?.setAttribute('data-group-id', group.pk)
        itemModalContainer?.classList.add('show');
    });

    uploadImageButton.addEventListener('click',()=>{
        if(itemSelection === null) {return;}
        if(!(itemSelection.getAttribute('data-group-id')===uploadImageButton.getAttribute('data-id'))){
            alert("Selected item must be in same group as button");
            return;
        }
        let item_id = itemSelection.getAttribute('data-id');
        let group_id = itemSelection.getAttribute('data-group-id');
        let uploadModal = document.getElementById('image-upload-container');
        uploadModal.setAttribute('data-item-id', item_id);
        uploadModal.setAttribute('data-group-id', group_id);
        uploadModal.classList.toggle('show');
    });

    viewItemButton?.addEventListener('click',async () => {
        if(!itemSelection) {
        alert("Select an item to view");
        return;
        }
        if(!(itemSelection.getAttribute('data-group-id')===viewItemButton.getAttribute('data-id'))){
            alert("Selected item must be in same group as button");
            return;
        }
        await viewItem();
    });

    itemActionContainer.appendChild(addItemButton);
    itemActionContainer.appendChild(removeItemButton);
    itemActionContainer.appendChild(editItemButton);
    itemActionContainer.appendChild(uploadImageButton);
    itemActionContainer.appendChild(viewItemButton);
    
    return groupContainer;
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
    let itemButtonContainer = document.createElement("div"); itemButtonContainer.setAttribute("class", "item-button-container");
    display.appendChild(itemButtonContainer);

    let image = await loadFirstImage(item.pk);
    let imageElement = null;
    if (!image) {
        imageElement = buildImageElement();
    } else {
        imageElement = buildImageElement(image);
    };
    display.appendChild(imageElement);
    let description = document.createElement("p");description.setAttribute("class", "item-description");
    description.innerHTML = item.fields.description;
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
    display.addEventListener('click',()=>{
        //unselect previously selected groups
        clearItemSelect();
        //select this group
        itemSelection = display;
        display.classList.add('selected');
        
    });
    display.addEventListener('dblclick',async ()=> {
        await viewItem();
    });
    return display;
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

async function buildGroupDisplayWithItems(group){
    let groupDisplay = buildGroupDisplay(group);
    let groupItems = await loadItems({group_id: group.pk});
    if (groupItems) {
        let itemsGrid = await buildItemsGrid(groupItems, group.pk);
        groupDisplay.querySelector('.group-content').appendChild(itemsGrid);
    }
    return groupDisplay;
}

function buildImageElement(image=null,large=false){
    let imageElement = document.createElement("img"); 
    if (large) {
        imageElement.setAttribute("class", "item-img-large");
    } else {
        imageElement.setAttribute("class", "item-img");
    }
    if (image){
        imageElement.setAttribute("src", image.uri);
        imageElement.setAttribute('data-name', image.name);
        imageElement.setAttribute('data-id', image.pk);
    } else {
        imageElement.setAttribute("src", defaultImage);
        imageElement.setAttribute('data-is-default', true);
    }
    return imageElement;
}




//UI Interaction and data reloading

async function reloadGroupData(group_id){
    let groupDatas = document.getElementsByClassName('group-data-content');
    let groupData = null;
    for (let data of groupDatas) {
        if(data.getAttribute('data-id')===group_id){
            groupData = data;
        }
    }
    if(!groupData){return;}
    let groups = await loadGroups(group_id);
    if(groups.length===0){return;}
    let group = groups[0];
    groupData.setAttribute('data-name',group.fields.name);
    let groupDataName = groupData.querySelector('#group-data-name');
    let groupDataCategory = groupData.querySelector('#group-data-category');
    groupDataName.innerHTML = group.fields.name;
    groupDataCategory.innerHTML = `[${group.fields.category}]`;
    let groupContainer = getGroupContainerById(group_id);
    if(groupContainer){
        let groupDescription = groupContainer.querySelector('.group-data-description')
        groupDescription.innerHTML = '';
        groupDescription.innerHTML = group.fields.description;
    }
}

async function reloadGroupItems(group_id) {
    console.log(`reloading items for group_id: ${group_id}`);
    let groupContainer = getGroupContainerById(group_id);
    console.log(groupContainer);
    if(groupContainer === null){return;}
    let groupContent = groupContainer.getElementsByClassName('group-content')[0];
    let groupItems = await loadItems({group_id: group_id});
    if (groupItems === null){return;}
    let grids = groupContent.getElementsByClassName('items-grid');
    for (let grid of grids) {
        grid.remove();
    }
    let itemsGrid = await buildItemsGrid(groupItems, group_id);
    groupContent.appendChild(itemsGrid);
};

function clearItemSelect(){
    let items = document.getElementsByClassName('item-display');
    for (let i=0;i < items.length; i++){
        items[i].classList.remove('selected');
    };
    itemSelection = null;
};

function clearGroupSelect(){
    let groupDatas = document.getElementsByClassName('group-data-content');
    for (let i=0;i < groupDatas.length; i++){
        groupDatas[i].classList.remove('selected');
    };
    groupSelection = null;
};

async function viewItem(){
    clearItemViewModal();
    let itemViewModalContainer = document.getElementById('item-view-modal-container');
    let item_id = itemSelection.getAttribute('data-id')
    let item = await loadItem(item_id);
    await populateItemViewModal(item);
    itemViewModalContainer?.setAttribute('data-id', item_id);
    itemViewModalContainer?.classList.add('show');
}

function updateIndexText(){
    let indexText = document.getElementById('slideshow-index-text');
    if(slideshowImages.length === 0 || slideshowIndex < 0){
        indexText.innerHTML = '0/0'
    } else {
        indexText.innerHTML = `${slideshowIndex+1}/${slideshowImages.length}`
    }
}

function populateSlideshow(){
    let imageSlideshow = document.getElementById('item-image-slideshow');
    imageSlideshow.innerHTML='';
    for (let i = 0; i < slideshowImages.length; i++){
        imageSlideshow.appendChild(slideshowImages[i]);
    }
    if (imageSlideshow.length === 0) {
        slideshowIndex = -1;
    } else {
        slideshowIndex = 0;
    }
    showImageElement(slideshowIndex);
}

//API Calls

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

async function loadItem(id){
    let items = await loadItems({id:id});
    if (items.length > 0){
        return items[0];
    } else {
        return null;
    }
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

async function loadFirstImage(item_id){
    let images = await loadImages({item_id:item_id});
    if (images.length > 0){
        return images[0];
    } else {
        return null;
    }
}

async function loadImages({id = null, item_id = null}){
    let response = null;
    if (id) {
        let idParams = new URLSearchParams();
        idParams.append('id', id);
        response = await fetch(`/inventory/image/?${idParams}`);
    }
    else if (item_id) {
        let itemIdParams = new URLSearchParams();
        itemIdParams.append('item_id', item_id);
        response = await fetch(`/inventory/image/?${itemIdParams}`);
    }
    else {
        response = await fetch('/inventory/image');
    }
    if (response.ok) {
        let images = await response.json();
        return images;
    } 
    else {
        console.log('failed to load items');
    }
}

async function notifyResponse(response){
    let jsonResponse = await response.json();
    if('message' in jsonResponse) {
        displayNotification('ok', jsonResponse.message);
    }else if('error' in jsonResponse){
        displayNotification('error', jsonResponse.error);
    } else {
        displayNotification('error', 'failed to parse response');
    }
}

async function saveGroupModal() {
    // gather data
    const groupModal = document.getElementById('group-modal-container');
    let groupName = document.getElementById('group-input-name').value;
    let groupCategory = document.getElementById('group-input-category')?.value;
    let groupDescription = document.getElementById('group-textarea-description')?.value;
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
        return response;
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
        return response;
    }
    
}

async function saveItemModal() {
    // gather data
    let itemModal = document.getElementById('item-modal-container');
    let id = itemModal.getAttribute('data-id')
    let group_id = itemModal.getAttribute('data-group-id');
    let name = document.getElementById('item-input-name').value;
    let price = document.getElementById('item-input-price')?.value;
    if (price ==='') {price = null;}
    let modelNumber = document.getElementById('item-input-model-number')?.value;
    let total = document.getElementById('item-input-total-quantity')?.value;
    if (total ==='') {total = null;}
    let available = document.getElementById('item-input-available-quantity')?.value;
    if (available ==='') {available = null;}
    let used = document.getElementById('item-input-used-quantity')?.value;
    if (used ==='') {used = null;}
    let acquired = document.getElementById('item-input-acquired-date')?.value;
    let expire = document.getElementById('item-input-expire-date')?.value;
    let lifespan = document.getElementById('item-input-lifespan')?.value;
    let description = document.getElementById('item-textarea-description')?.value;

    if (itemModal.hasAttribute('data-id')){
        let item = {
            id: id,
            group_id: group_id,
            name: name,
            price: price,
            modelNumber: modelNumber,
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
        return response;
    }
    else {
        // POST
        let item = {
            group_id: group_id,
            name: name,
            price: price,
            modelNumber: modelNumber,
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
        return response;
    }
}

async function uploadImage(){
    let item_id = document.getElementById('image-upload-container').getAttribute('data-item-id');
    let name = document.getElementById('image-name-input').value;
    let file = document.getElementById('image-file-input').files[0];
    let formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    formData.append('item_id',item_id);
    let response = await fetch(`/inventory/image/upload/`,{
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
        },
        body: formData,
    });
    return response;
}

async function deleteGroup(id) {
    let response = await fetch(`/inventory/group/delete/${id}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        }
    }
    );
    return response;
}

async function deleteItem(id) {
    let response = await fetch(`/inventory/item/delete/${id}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        }
    }
    );
    return response;
}

async function deleteImage(id) {
    let response = await fetch(`/inventory/image/delete/${id}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        }
    }
    );
    return response;
}

//event handlers

function addButtonEvents() {
    const groupAddButton = document.getElementById('group-add');
    const groupRemoveButton = document.getElementById('group-remove');
    const groupEditButton = document.getElementById('group-edit');
    const groupCollapseButton = document.getElementById('group-collapse');
    const groupModalContainer = document.getElementById('group-modal-container');
    const groupModalSaveButton = document.getElementById('group-modal-save');
    const groupModalCancelButton = document.getElementById('group-modal-cancel');
    groupAddButton?.addEventListener('click', () => {
        if (groupModalContainer.hasAttribute('data-id')){
            groupModalContainer.removeAttribute('data-id');
        }
        groupModalContainer?.classList.add('show');
    });
    groupRemoveButton?.addEventListener('click',async () => {
        if(!groupSelection) {
            alert("Select a group to remove");
            return;
        }
        let groupName = groupSelection.getAttribute('data-name')
        let deleteMessage = `Are you sure you want to delete the selected group ${groupName} and all contained items?`
        if (confirm(deleteMessage)) {
            let response = await deleteGroup(groupSelection.getAttribute('data-id'));
            await notifyResponse(response);
            groupSelection.remove();
            groupSelection = null;
        }
    });
    groupEditButton?.addEventListener('click',async () => {
        if(!groupSelection) {
            alert("Select a group to edit");
            return;
        }
        let group_id = groupSelection.getAttribute('data-id');
        groupModalContainer.setAttribute('data-id',group_id);
        let groups = await loadGroups(group_id);
        populateGroupModal(groups[0]);
        groupModalContainer?.classList.add('show');
    });

    groupCollapseButton?.addEventListener('click',() => {
        let collapseButtons = document.getElementsByClassName('group-expand-button');
        let collapseButtonImage = document.getElementById('group-collapse-image');
        if (groupCollapseButton.hasAttribute('data-collapsed')){
            for (let button of collapseButtons) {
            let collapsed = Boolean(button.hasAttribute('data-collapsed'));
            if(collapsed){button.click();}
            }
            collapseButtonImage.setAttribute('src',collapseGroup);
            groupCollapseButton.removeAttribute('data-collapsed');
        } 
        else {
            for (let button of collapseButtons) {
            let collapsed = Boolean(button.hasAttribute('data-collapsed'));
            if(!collapsed){button.click();}
            }
            collapseButtonImage.setAttribute('src',expandGroup);
            groupCollapseButton.toggleAttribute('data-collapsed');
        }
    });

    groupModalCancelButton?.addEventListener('click', () => {
        clearGroupModal();
        groupModalContainer?.classList.remove('show');
    });
    groupModalSaveButton?.addEventListener('click',async () => {
        let response = await saveGroupModal();
        await notifyResponse(response);
        //reload group display if editing existing
        if(groupModalContainer.hasAttribute('data-id')){
            let group_id = groupModalContainer.getAttribute('data-id');
            reloadGroupData(group_id);
        }
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
    itemModalSaveButton?.addEventListener('click',async () => {
        let response = await saveItemModal();
        await notifyResponse(response);
        let group_id = itemModalContainer.getAttribute('data-group-id');
        reloadGroupItems(group_id);
        clearItemModal();
        itemModalContainer?.classList.remove('show');
    });

    const imageUploadContainer = document.getElementById('image-upload-container');
    const imageUploadButton = document.getElementById('image-upload-submit');
    const imageCancelButton = document.getElementById('image-upload-cancel');
     imageCancelButton?.addEventListener('click', () => {
        clearImageUploadModal();
        imageUploadContainer?.classList.remove('show');
    });
    imageUploadButton?.addEventListener('click',async () => {
        let response = await uploadImage();
        await notifyResponse(response);
        let group_id = imageUploadContainer.getAttribute('data-group-id');
        await reloadGroupItems(group_id);
        clearImageUploadModal();
        imageUploadContainer?.classList.remove('show');
    });

    const slideshowLeftButton = document.getElementById('slideshow-left-button');
    const slideshowRightButton = document.getElementById('slideshow-right-button');
    slideshowLeftButton?.addEventListener('click',()=>{
        let newIndex = slideshowIndex - 1
        if (checkIndexInLength(newIndex,slideshowImages.length)){
            slideshowIndex=newIndex;
            showImageElement(slideshowIndex);
        }
    });
    slideshowRightButton?.addEventListener('click',()=>{
        let newIndex = slideshowIndex + 1
        if (checkIndexInLength(newIndex,slideshowImages.length)){
            slideshowIndex=newIndex;
            showImageElement(slideshowIndex);
        }
    });

    let itemViewModalContainer = document.getElementById('item-view-modal-container');
    let itemViewButtonExit = document.getElementById('item-view-button-exit');
    itemViewButtonExit.addEventListener('click',()=>{
        itemViewModalContainer.classList.remove('show');
    });

    let imageDeleteButton = document.getElementById('image-delete-button');
    imageDeleteButton.addEventListener('click',async ()=>{
        let isIndexInLength = checkIndexInLength(slideshowIndex, slideshowImages.length);
        if(!isIndexInLength) {
            alert('failed to access slideshow Index in loaded slideshow Images');
            return;
        }
        let imageElement = slideshowImages[slideshowIndex];
        let isDefault = Boolean(imageElement.hasAttribute('data-is-default'));
        if(isDefault) {
            alert('cannot delete default image');
            return;
        }
        let id = imageElement.getAttribute('data-id');
        let name = imageElement.getAttribute('data-name');
        let deleteImageMessage = `Are you sure you want to delete image ${name}?`;
        if (confirm(deleteImageMessage)) {
            let response = await deleteImage(id);
            await notifyResponse(response);
        }
    })
    
}

function checkIndexInLength(index, length){
    if (length === 0 || index < 0 || index > length - 1) {
        return false;
    } else {
        return true;
    }
}

//modal

function clearGroupModal(){
    let modalContainer = document.getElementById('group-modal-container');
    modalContainer.removeAttribute('data-id');
    // modalContainer.reset();
    document.getElementById('group-input-name').value = "";
    document.getElementById('group-input-category').value = "";
    document.getElementById('group-textarea-description').value = "";
}

function clearItemModal(){
    let modalContainer = document.getElementById('item-modal-container');
    modalContainer.removeAttribute('data-id');
    modalContainer.removeAttribute('data-group-id');
    // modalContainer.reset();
    document.getElementById('item-input-name').value = "";
    document.getElementById('item-input-price').value = null;
    document.getElementById('item-input-model-number').value = null;
    document.getElementById('item-input-total-quantity').value = null;
    document.getElementById('item-input-available-quantity').value = null;
    document.getElementById('item-input-acquired-date').value = null;
    document.getElementById('item-input-expire-date').value = null;
    document.getElementById('item-input-lifespan').value = null;
    document.getElementById('item-textarea-description').value = "";
}

function clearImageUploadModal(){
    let modalContainer = document.getElementById('item-modal-container');
    modalContainer.removeAttribute('data-item-id');
    document.getElementById('image-name-input').value = "";
    document.getElementById('image-file-input').value = null;
}

function clearItemViewModal(){
    let modalContainer = document.getElementById('item-view-modal-container');
    modalContainer.removeAttribute('data-id');
    document.getElementById('item-view-header-name').innerHTML = "";
    document.getElementById('item-name-datacell').innerHTML = "";
    document.getElementById('item-price-datacell').innerHTML = "";
    document.getElementById('item-total-datacell').innerHTML = "";
    document.getElementById('item-available-datacell').innerHTML = "";
    document.getElementById('item-used-datacell').innerHTML = "";
    document.getElementById('item-acquired-datacell').innerHTML = "";
    document.getElementById('item-expire-datacell').innerHTML = "";
    document.getElementById('item-updated-datacell').innerHTML = "";
    document.getElementById('item-view-description').value = "";
    let imageSlideshow = document.getElementById('item-image-slideshow');
    imageSlideshow.innerHTML='';
}

function showImageElement(index){
    if (!checkIndexInLength(index,slideshowImages.length)){
        return;
    }
    for (let i = 0; i < slideshowImages.length; i++){
        if(i===index){
            slideshowImages[i].style.display = "block";
        } else {
            slideshowImages[i].style.display = "none";
        }
    }
    updateIndexText();
}

function populateGroupModal(group){
    document.getElementById('group-modal-container').setAttribute('data-id', group.pk);
    document.getElementById('group-input-name').value = group.fields.name;
    document.getElementById('group-input-category').value = group.fields.category;
    document.getElementById('group-textarea-description').value = group.fields.description;
}

function populateItemModal(item){
    document.getElementById('item-modal-container').setAttribute('data-id', item.pk);
    document.getElementById('item-input-name').value = item.fields.name;
    document.getElementById('item-input-price').value = item.fields.price;
    document.getElementById('item-input-model-number').value = item.fields.model_number;
    document.getElementById('item-input-total-quantity').value = item.fields.total_quantity;
    document.getElementById('item-input-available-quantity').value = item.fields.available_quantity;
    document.getElementById('item-input-acquired-date').value = item.fields.acquired_dt;
    document.getElementById('item-input-expire-date').value = item.fields.expire_dt;
    document.getElementById('item-input-lifespan').value = item.fields.lifespan;
    document.getElementById('item-textarea-description').value = item.fields.description;
}

async function populateItemViewModal(item){
    let modalContainer = document.getElementById('item-view-modal-container');
    modalContainer.setAttribute('data-id', item.pk);
    document.getElementById('item-view-header-name').innerHTML = item.fields.name;
    document.getElementById('item-name-datacell').innerHTML = item.fields.name;
    document.getElementById('item-price-datacell').innerHTML = item.fields.price;
    document.getElementById('item-model-number-datacell').innerHTML = item.fields.model_number;
    document.getElementById('item-total-datacell').innerHTML = item.fields.total_quantity;
    document.getElementById('item-available-datacell').innerHTML = item.fields.available_quantity;
    document.getElementById('item-used-datacell').innerHTML = item.fields.used_quantity;
    document.getElementById('item-acquired-datacell').innerHTML = item.fields.acquired_dt;
    document.getElementById('item-expire-datacell').innerHTML = item.fields.expire_dt;
    document.getElementById('item-updated-datacell').innerHTML = item.fields.updated_dt;
    document.getElementById('item-view-description').value = item.fields.description;
    await loadImageElements(item.pk);
    populateSlideshow();
}

async function loadImageElements(item_id){
    slideshowImages = [];
    let images = await loadImages({item_id:`${item_id}`});
    if (images.length > 0){
        for (let i = 0; i < images.length; i++){
        let imageElement = buildImageElement(images[i],true);
        slideshowImages.push(imageElement);
    }
    } else {
        let defaultElement = buildImageElement(null,true);
        slideshowImages.push(defaultElement);
    }
}


//helper functions

function getGroupContainerById(group_id){
    let groupContainers = document.getElementsByClassName('group-container');
    for (let groupContainer of groupContainers){
        if (groupContainer.getAttribute('data-id') === group_id){return groupContainer};
    }
    return null;
}

function insertFieldAsRow(key, value, table) {
    const row = table.insertRow();
    row.insertCell().innerHTML = key;
    row.insertCell().innerHTML = value;
}

async function displayNotification(pretext, message, duration=3){
    let notificationContainer = document.getElementById('notification-modal-container');
    let notificationPretext = document.getElementById('notification-pretext');
    let notificationText = document.getElementById('notification-text');

    notificationPretext.innerHTML=`${pretext}:`;
    if(responseTypes.has(pretext)){
        notificationPretext.style.color = responseTypes.get(pretext);
    } else {
        notificationPretext.style.color = "#FFFFFF";
    };
    notificationText.innerHTML = (` ${message}`);
    if(!notificationContainer.classList.contains('show')){
        notificationContainer.classList.toggle('show');
    }

    await sleep(duration*1000);
    notificationContainer.classList.toggle('show');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export {};
