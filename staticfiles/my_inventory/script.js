console.log("external javascript loaded.");
//document loading
const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'short'
});
document.addEventListener('DOMContentLoaded', async function () {
    await loadGroups();
    addButtonEvents();
    loadStaticIcons();
});

function loadStaticIcons() {
    let addGroupButton = document.getElementById('group-add');
    addGroupImg = document.createElement('img');
    addGroupImg.setAttribute('src', addGroup);
    addGroupImg.setAttribute('class','button-icon');
    addGroupButton.prepend(addGroupImg);

}

async function loadGroups(group_id = null) {
    let response = null;
    if (group_id) {
        let groupIdParams = new URLSearchParams();
        groupIdParams.append('group_id', group_id);
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

    let groupsContainer = document.getElementById('groups-container')
    groups.forEach(async (group) => {
        let groupDisplay = buildGroupDisplay(group);
        let groupItems = await loadItems(group.pk);
        if (groupItems) {
            let itemsGrid = buildItemsGrid(groupItems);
            groupDisplay.appendChild(itemsGrid);
        }
        groupsContainer.appendChild(groupDisplay);
    });
}

function buildGroupDisplay(group){
    
    let groupContainer = document.createElement('div');groupContainer.setAttribute('class','group-container');
    let groupData = document.createElement('div');groupData.setAttribute('data-id',group.pk);groupData.setAttribute('class','group-data-content');
    let groupName = document.createElement('h4');groupName.innerHTML = group.fields.name;groupName.setAttribute('class', 'group-data-field');
    let groupCategory = document.createElement('h4');groupCategory.innerHTML = group.fields.category;groupName.setAttribute('class', 'group-data-field');
    let groupDescription = document.createElement('h4');groupDescription.innerHTML = group.fields.description;groupName.setAttribute('class', 'group-data-field');
    let groupExpandContainer = document.createElement('div'); groupExpandContainer.setAttribute('class','group-expand-container'); 
    let groupExpandButton = document.createElement('button'); groupExpandButton.setAttribute('class','group-expand-button'); 
    let expandImg = document.createElement('img');
    expandImg.setAttribute('src', expandGroup);
    groupExpandButton.prepend(expandImg);
    groupContainer.appendChild(groupData);

    groupData.appendChild(groupName);
    groupData.appendChild(groupCategory);
    groupData.appendChild(groupDescription);
    groupData.appendChild(groupExpandContainer);
    groupExpandContainer.appendChild(groupExpandButton);

    let groupHeader = document.createElement('div'); groupHeader.setAttribute('class','group-display-header');groupContainer.appendChild(groupHeader); 

    let itemActionContainer = document.createElement('div');itemActionContainer.setAttribute('class','item-action-container');
    groupHeader.appendChild(itemActionContainer);
    
    let addItemButton = document.createElement('button'); addItemButton.setAttribute('class','item-action');addItemButton.setAttribute('data-id',group.pk);
    let addItemImg = document.createElement('img');
    addItemImg.setAttribute('src', addItem);
    addItemImg.setAttribute('class','button-icon');
    addItemButton.prepend(addItemImg);
    
    let removeItemButton = document.createElement('button'); removeItemButton.setAttribute('class','item-action');removeItemButton.setAttribute('data-id',group.pk);
    let removeItemImg = document.createElement('img');
    removeItemImg.setAttribute('src', removeItem);
    removeItemImg.setAttribute('class','button-icon');
    removeItemButton.prepend(removeItemImg);

    let editItemButton = document.createElement('button'); editItemButton.setAttribute('class','item-action');editItemButton.setAttribute('data-id',group.pk);
    itemActionContainer.appendChild(addItemButton);itemActionContainer.appendChild(removeItemButton);itemActionContainer.appendChild(editItemButton);
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
    const groupModalContainer = document.getElementById('group-modal-container');
    const groupSaveBtn = document.getElementById('group-modal-save');
    const groupCancelBtn = document.getElementById('group-modal-cancel');
    groupAddBtn?.addEventListener('click', () => {
        groupModalContainer?.classList.add('show');
    });
    groupCancelBtn?.addEventListener('click', () => {
        // clear modal here
        groupModalContainer?.classList.remove('show');
    });
    groupSaveBtn?.addEventListener('click', () => {
        // save data here
        saveGroupModal();
        groupModalContainer?.classList.remove('show');
    });
}

async function saveGroupModal() {
    // gather data
    let groupName = document.getElementById('group-input-name').value;
    let groupCategory = document.getElementById('group-input-category').value;
    let groupDescription = document.getElementById('group-input-description').value;
    let group = {
        name: groupName,
        description: groupDescription,
        category:  groupCategory
    }
    // POST
    let response = await fetch('/inventory/group/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(group)
    });

    
    

}

function buildItemDisplay(item) {
    //top level box container
    let display = document.createElement("div");
    display.setAttribute("class", "item-display");
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
