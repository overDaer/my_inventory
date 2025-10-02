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
        let groupItems = await loadItems(group.pk);
        if (groupItems) {
            let itemsGrid = buildItemsGrid(groupItems);
            groupDisplay.querySelector('.group-content').appendChild(itemsGrid);
        }
        groupsContainer.appendChild(groupDisplay);
    });
}

function buildGroupDisplay(group){
    
    let groupContainer = document.createElement('div');groupContainer.setAttribute('class','group-container');
    let groupData = document.createElement('div');groupData.setAttribute('data-id',group.pk); groupData.setAttribute('class','group-data-content');
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
    groupData.addEventListener('focus',()=>{
        groupSelection = groupData;
    })
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
    
    itemActionContainer.appendChild(addItemButton);
    itemActionContainer.appendChild(removeItemButton);
    itemActionContainer.appendChild(editItemButton);
    
    return groupContainer;
}

async function loadItems(group_id = null) {
    let response = null;
    if (group_id) {
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

function buildItemsGrid(items, groupContainer) {
    let itemsGrid = document.createElement("div");
    itemsGrid.setAttribute("class", "items-grid");
    items.forEach((element) => {
        itemsGrid.appendChild(buildItemDisplay(element));
    });
    return itemsGrid;
}

function addButtonEvents() {
    const groupAddBtn = document.getElementById('group-add');
    const groupRemoveBtn = document.getElementById('group-remove');
    const groupEditBtn = document.getElementById('group-edit');
    const groupModalContainer = document.getElementById('group-modal-container');
    const groupModalSaveBtn = document.getElementById('group-modal-save');
    const groupModalCancelBtn = document.getElementById('group-modal-cancel');
    groupAddBtn?.addEventListener('click', () => {
        clearModal();
        groupModalContainer?.classList.add('show');
    });
    groupRemoveBtn?.addEventListener('click', () => {
        if(!groupSelection) {
            alert("Select a group to remove");
            return;
        }
        let deleteMessage = `Are you sure you want to delete the selected group and all contained items?`
        if (confirm(deleteMessage)) {
            deleteGroup(groupSelection.getAttribute('data-id'));
        }
    });
    groupEditBtn?.addEventListener('click',async () => {
        clearModal();
        if(!groupSelection) {
            alert("Select a group to edit");
            return;
        }
        let groups = await loadGroups(`${groupSelection.getAttribute('data-id')}`);
        populateModal(groups[0]);
        groupModalContainer?.classList.add('show');
    });

    groupModalCancelBtn?.addEventListener('click', () => {
        groupModalContainer?.classList.remove('show');
    });
    groupModalSaveBtn?.addEventListener('click', () => {
        saveGroupModal();
        groupModalContainer?.classList.remove('show');
    });
    
    
}

function clearModal(){
    document.getElementById('group-modal-container').removeAttribute('data-id');
    document.getElementById('group-input-name').value = "";
    document.getElementById('group-input-category').value = "";
    document.getElementById('group-input-description').value = "";
}

function populateModal(group){
    console.log(group);
    document.getElementById('group-modal-container').setAttribute('data-id', group.pk);
    document.getElementById('group-input-name').value = group.fields.name;
    document.getElementById('group-input-category').value = group.fields.category;
    document.getElementById('group-input-description').value = group.fields.description;
}

async function saveGroupModal() {
    // gather data
    const groupModal = document.getElementById('group-modal-container');
    let groupName = document.getElementById('group-input-name').value;
    let groupCategory = document.getElementById('group-input-category').value;
    let groupDescription = document.getElementById('group-input-description').value;
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

async function deleteGroup(id) {
    let response = await fetch(`/inventory/group/delete/${id}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        }
    }
    );
    console.log(response);
}

function buildItemDisplay(item) {
    //top level box container
    let display = document.createElement("div");
    display.setAttribute("class", "item-display");
    display.setAttribute("data-id", item.pk);
    display.setAttribute('tabindex', 0);
    //html elements containing data
    //add name as separate div
    let name = document.createElement("h3");name.setAttribute("class", "item-name");name.innerHTML = item.fields.name;
    display.appendChild(name);
    let image = document.createElement("img");image.setAttribute("class", "item-img");image.setAttribute("src", defaultImage);
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
